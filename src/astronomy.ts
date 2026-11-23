import { SunPosition } from 'astronomy-engine'

export const YEAR = 2026
export const YEAR_DAYS = 365
export const EARTH_TILT = 23.44
export const THESSALONIKI = { latitude: 40.6401, longitude: 22.9444 } as const

export function dateForDay(day: number): Date {
  return new Date(Date.UTC(YEAR, 0, 1 + Math.floor(day), 23, 59))
}

export function dayForDate(month: number, day: number): number {
  return (Date.UTC(YEAR, month - 1, day) - Date.UTC(YEAR, 0, 1)) / 86400000
}

export function solarState(day: number, tilt = EARTH_TILT) {
  const longitude = SunPosition(dateForDay(day)).elon * Math.PI / 180
  const declination = Math.asin(Math.sin(tilt * Math.PI / 180) * Math.sin(longitude))
  return { longitude, declination }
}

export function daylightHours(latitude: number, declination: number): number {
  const cosine = -Math.tan(latitude * Math.PI / 180) * Math.tan(declination)
  if (cosine <= -1) return 24
  if (cosine >= 1) return 0
  return 24 * Math.acos(cosine) / Math.PI
}

export function seasonForDay(day: number, southern = false): string {
  const { longitude } = solarState(day)
  const index = Math.floor(longitude / (Math.PI / 2)) % 4
  return ['Spring', 'Summer', 'Autumn', 'Winter'][(index + (southern ? 2 : 0)) % 4]!
}