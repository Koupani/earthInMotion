import test from 'node:test'
import assert from 'node:assert/strict'
import { daylightHours, solarState, dayForDate, seasonForDay, THESSALONIKI } from '../src/astronomy.ts'
import { regionPosition, regions } from '../src/regions.ts'

test('June solstice gives the north longer days and the south shorter days', () => {
  const day = dayForDate(6, 21)
  const { declination } = solarState(day)
  assert.ok(declination * 180 / Math.PI > 23.4)
  assert.ok(daylightHours(51.5, declination) > 16)
  assert.ok(daylightHours(-33.9, declination) < 10)
  assert.equal(seasonForDay(day), 'Summer')
  assert.equal(seasonForDay(day, true), 'Winter')
})

test('December solstice reverses seasons and polar daylight', () => {
  const day = dayForDate(12, 21)
  const { declination } = solarState(day)
  assert.ok(declination * 180 / Math.PI < -23.4)
  assert.equal(daylightHours(80, declination), 0)
  assert.equal(daylightHours(-80, declination), 24)
  assert.equal(seasonForDay(day), 'Winter')
})

test('season shortcuts use the season beginning on that calendar date', () => {
  assert.equal(seasonForDay(dayForDate(3, 20)), 'Spring')
  assert.equal(seasonForDay(dayForDate(9, 23)), 'Autumn')
})

test('equinox days are close to twelve hours in both hemispheres', () => {
  const { declination } = solarState(dayForDate(3, 20))
  assert.ok(Math.abs(daylightHours(51.5, declination) - 12) < 0.15)
  assert.ok(Math.abs(daylightHours(-33.9, declination) - 12) < 0.15)
})

test('zero axial tilt produces equal days all year', () => {
  for (const day of [0, 80, 171, 265, 355]) {
    assert.equal(daylightHours(51.5, solarState(day, 0).declination), 12)
    assert.equal(daylightHours(-33.9, solarState(day, 0).declination), 12)
  }
})

test('Thessaloniki defaults use local latitude for solstice daylight', () => {
  assert.equal(THESSALONIKI.latitude, 40.6401)
  assert.equal(THESSALONIKI.longitude, 22.9444)
  const summer = daylightHours(THESSALONIKI.latitude, solarState(dayForDate(6, 21)).declination)
  const winter = daylightHours(THESSALONIKI.latitude, solarState(dayForDate(12, 21)).declination)
  assert.ok(summer > 14.8 && summer < 15)
  assert.ok(winter > 9 && winter < 9.2)
  assert.equal(daylightHours(THESSALONIKI.latitude, solarState(171, 0).declination), 12)
})

test('regions have unique identifiers and valid geographic coordinates', () => {
  assert.equal(regions[0].id, 'thessaloniki')
  assert.equal(new Set(regions.map(region => region.id)).size, regions.length)
  for (const region of regions) {
    assert.ok(Math.abs(region.latitude) <= 90)
    assert.ok(Math.abs(region.longitude) <= 180)
    const position = regionPosition(region, 1.31)
    assert.ok(Math.abs(position.length() - 1.31) < 1e-10)
    assert.ok(Math.abs(Math.asin(position.y / 1.31) * 180 / Math.PI - region.latitude) < 1e-10)
    assert.ok(Math.abs(Math.atan2(-position.z, position.x) * 180 / Math.PI - region.longitude) < 1e-10)
  }
})

test('cities at similar latitudes have different globe positions', () => {
  const sydney = regions.find(region => region.id === 'sydney')
  const capeTown = regions.find(region => region.id === 'cape-town')
  assert.ok(Math.abs(sydney.latitude - capeTown.latitude) < 0.1)
  assert.ok(regionPosition(sydney).distanceTo(regionPosition(capeTown)) > 1.4)
  const equator = regionPosition(regions.find(region => region.id === 'equator'))
  assert.ok(Math.abs(equator.y) < 1e-10)
})