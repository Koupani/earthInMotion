import { MathUtils, Vector3 } from 'three'
import { THESSALONIKI } from './astronomy.ts'

export interface Region {
  id: string
  name: string
  latitude: number
  longitude: number
}

export const regions: readonly Region[] = [
  { id: 'thessaloniki', name: 'Θεσσαλονίκη', ...THESSALONIKI },
  { id: 'athens', name: 'Αθήνα', latitude: 37.9838, longitude: 23.7275 },
  { id: 'london', name: 'Λονδίνο', latitude: 51.5074, longitude: -0.1278 },
  { id: 'new-york', name: 'Νέα Υόρκη', latitude: 40.7128, longitude: -74.006 },
  { id: 'new-delhi', name: 'Νέο Δελχί', latitude: 28.6139, longitude: 77.209 },
  { id: 'tromso', name: 'Τρόμσο', latitude: 69.6492, longitude: 18.9553 },
  { id: 'sydney', name: 'Σίδνεϊ', latitude: -33.8688, longitude: 151.2093 },
  { id: 'cape-town', name: 'Κέιπ Τάουν', latitude: -33.9249, longitude: 18.4241 },
  { id: 'sao-paulo', name: 'Σάο Πάολο', latitude: -23.5505, longitude: -46.6333 },
  { id: 'ushuaia', name: 'Ουσουάια', latitude: -54.8019, longitude: -68.303 },
  { id: 'equator', name: 'Ισημερινός', latitude: 0, longitude: 0 },
]

export function regionPosition(region: Region, radius = 1): Vector3 {
  return new Vector3().setFromSphericalCoords(
    radius,
    MathUtils.degToRad(90 - region.latitude),
    MathUtils.degToRad(90 + region.longitude),
  )
}