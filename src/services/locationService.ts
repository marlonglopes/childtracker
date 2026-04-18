import * as Location from 'expo-location';

export interface LocationResult {
  lat: number;
  lng: number;
  address?: string;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<LocationResult | null> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude: lat, longitude: lng } = pos.coords;

    const [geocoded] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const address = geocoded
      ? [geocoded.street, geocoded.city, geocoded.region].filter(Boolean).join(', ')
      : undefined;

    return { lat, lng, address };
  } catch {
    return null;
  }
}
