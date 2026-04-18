import NetworkExtension
import Foundation
import os.log

/// DNS proxy — every DNS query on the device enters via `handleNewFlow`.
/// We parse the QNAME, hand it to DomainLogger for the shared buffer, then
/// forward the query unchanged to the system's upstream resolver.
class DNSProxyProvider: NEDNSProxyProvider {
    private let log = OSLog(subsystem: "com.childtracker.app.dns", category: "provider")

    override func startProxy(options: [String: Any]? = nil, completionHandler: @escaping (Error?) -> Void) {
        os_log("DNS proxy starting", log: log, type: .info)
        completionHandler(nil)
    }

    override func stopProxy(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
        os_log("DNS proxy stopping: %{public}d", log: log, type: .info, reason.rawValue)
        completionHandler()
    }

    override func handleNewFlow(_ flow: NEAppProxyFlow) -> Bool {
        guard let udp = flow as? NEAppProxyUDPFlow else {
            // TCP DNS (rare on iOS, usually DoT/DoH) — let the system handle it.
            return false
        }
        handleUDPFlow(udp)
        return true
    }

    private func handleUDPFlow(_ flow: NEAppProxyUDPFlow) {
        flow.open(withLocalEndpoint: nil) { [weak self] openError in
            guard let self = self, openError == nil else {
                flow.closeReadWithError(openError)
                flow.closeWriteWithError(openError)
                return
            }
            self.readLoop(flow: flow)
        }
    }

    private func readLoop(flow: NEAppProxyUDPFlow) {
        flow.readDatagrams { [weak self] datagrams, endpoints, error in
            guard let self = self, let datagrams = datagrams, error == nil else {
                flow.closeReadWithError(error)
                flow.closeWriteWithError(error)
                return
            }

            // Extract and log the queried domain from each DNS packet.
            for data in datagrams {
                if let domain = DNSParser.extractQName(from: data) {
                    let bundleId = flow.metaData.sourceAppSigningIdentifier
                    DomainLogger.log(domain: domain, appBundleId: bundleId.isEmpty ? nil : bundleId)
                }
            }

            // Forward upstream — endpoints[i] is the resolver the app meant to hit.
            flow.writeDatagrams(datagrams, sentBy: endpoints ?? []) { [weak self] writeError in
                guard let self = self, writeError == nil else {
                    flow.closeWriteWithError(writeError)
                    return
                }
                self.readLoop(flow: flow)
            }
        }
    }
}

/// Minimal DNS wire-format parser — only enough to extract QNAME from the first
/// question of a standard query. Returns nil if the packet doesn't look like a
/// well-formed query.
enum DNSParser {
    static func extractQName(from data: Data) -> String? {
        // DNS header is 12 bytes: ID (2), flags (2), QDCOUNT (2), ANCOUNT (2),
        // NSCOUNT (2), ARCOUNT (2). QNAME starts at byte 12.
        guard data.count > 12 else { return nil }

        var offset = 12
        var labels: [String] = []

        while offset < data.count {
            let len = Int(data[offset])
            offset += 1
            if len == 0 { break }
            // Compression pointer (top 2 bits set). Queries rarely have them; bail.
            if (len & 0xC0) != 0 { return nil }
            guard offset + len <= data.count else { return nil }
            guard let label = String(data: data.subdata(in: offset..<offset + len), encoding: .ascii) else {
                return nil
            }
            labels.append(label)
            offset += len
        }

        return labels.isEmpty ? nil : labels.joined(separator: ".")
    }
}
