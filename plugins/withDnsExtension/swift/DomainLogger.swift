import Foundation

/// Append-only buffer backed by App Group UserDefaults.
/// Shared between the extension (writer) and the main app (reader).
public enum DomainLogger {
    private static let suiteName = "${APP_GROUP}"
    private static let bufferKey = "pendingDnsLogs"
    private static let maxEntries = 1000

    public static func log(domain: String, appBundleId: String?) {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return }

        var buffer = defaults.array(forKey: bufferKey) as? [[String: Any]] ?? []
        buffer.append([
            "domain": domain,
            "timestamp": Int(Date().timeIntervalSince1970 * 1000),
            "appBundleId": appBundleId ?? ""
        ])

        // Bounded: keep newest N so a long offline stretch can't bloat storage.
        if buffer.count > maxEntries {
            buffer = Array(buffer.suffix(maxEntries))
        }

        defaults.set(buffer, forKey: bufferKey)
    }

    /// Atomic drain — returns the buffer and clears it in one write.
    public static func drain() -> [[String: Any]] {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return [] }
        let buffer = defaults.array(forKey: bufferKey) as? [[String: Any]] ?? []
        defaults.set([], forKey: bufferKey)
        return buffer
    }
}
