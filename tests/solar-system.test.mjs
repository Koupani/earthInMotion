import test from 'node:test'
import assert from 'node:assert/strict'
import { isPlanetOrderCorrect, planetOrderHint, shufflePlanetOrder, solarSystemPlanets } from '../src/solar-system.ts'

test('solar system planets are listed in order from the Sun', () => {
  assert.deepEqual(solarSystemPlanets.map(planet => planet.name), [
    'Ερμής', 'Αφροδίτη', 'Γη', 'Άρης', 'Δίας', 'Κρόνος', 'Ουρανός', 'Ποσειδώνας',
  ])
  assert.deepEqual(solarSystemPlanets.map(planet => planet.order), [1, 2, 3, 4, 5, 6, 7, 8])
})

test('Earth is the third planet between Venus and Mars', () => {
  const earth = solarSystemPlanets.find(planet => planet.id === 'earth')

  assert.equal(earth?.order, 3)
  assert.match(earth?.fact ?? '', /τρίτος πλανήτης.*Αφροδίτη και τον Άρη/)
})

test('shuffled planet orders contain every planet exactly once and are not solved', () => {
  const shuffled = shufflePlanetOrder(() => 0)

  assert.equal(shuffled.length, solarSystemPlanets.length)
  assert.deepEqual(new Set(shuffled), new Set(solarSystemPlanets.map(planet => planet.id)))
  assert.equal(isPlanetOrderCorrect(shuffled), false)
})

test('planet details include the supplied textbook information in Greek', () => {
  const expectedFacts = {
    mercury: [/πρώτος/, /εσωτερικούς/, /μικρότεροι και βραχώδεις/],
    venus: [/δεύτερος/, /εσωτερικούς/, /μικρότεροι και βραχώδεις/, /Αποσπερίτης και Αυγερινός/],
    earth: [/τρίτος/, /βραχώδης/, /ζωή/, /οξυγόνο/, /νερό.*2\/3/, /κατάλληλη απόσταση/, /Γαλάζιος Πλανήτης/, /έναν φυσικό δορυφόρο, τη Σελήνη/],
    mars: [/τέταρτος/, /βραχώδης/, /κόκκινος.*πετρώματά/, /δύο φυσικούς δορυφόρους/, /κρατήρες/, /βαθιές κοιλάδες/, /μεγάλα ηφαίστεια/, /σχολικό βιβλίο.*Όλυμπος.*26 χλμ/],
    jupiter: [/πέμπτος/, /μεγάλους εξωτερικούς/, /σχολικό βιβλίο.*95 φυσικούς δορυφόρους/, /δακτυλίους.*τέσσερις εξωτερικοί/],
    saturn: [/έκτος/, /μεγάλους εξωτερικούς/, /δακτύλιοί.*πάγου και βράχου.*αντανακλούν.*Ήλιου/],
    uranus: [/έβδομος/, /μεγάλους εξωτερικούς/, /δακτυλίους/],
    neptune: [/όγδοος/, /μεγάλους εξωτερικούς/, /δακτυλίους/],
  }

  for (const [id, patterns] of Object.entries(expectedFacts)) {
    const planet = solarSystemPlanets.find(planet => planet.id === id)
    assert.ok(planet, `Planet data exists for ${id}`)
    for (const pattern of patterns) assert.match(planet.fact, pattern, `${id}: ${pattern}`)
  }
})

test('planet-order hints reinforce Mercury first and Earth third', () => {
  assert.match(planetOrderHint(['venus', 'mercury', 'earth']), /Ερμής.*κοντινότερος/)
  assert.match(planetOrderHint(['mercury', 'earth', 'venus']), /Γη.*Αφροδίτη.*Άρη/)
  assert.equal(isPlanetOrderCorrect(solarSystemPlanets.map(planet => planet.id)), true)
})

const sizeOrder = ['jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'mercury']

test('size ordering checks diameter from largest to smallest, not distance from the Sun', () => {
  assert.equal(isPlanetOrderCorrect(sizeOrder, 'size'), true)
  assert.equal(isPlanetOrderCorrect(sizeOrder), false)
  assert.equal(isPlanetOrderCorrect(solarSystemPlanets.map(planet => planet.id), 'size'), false)
  assert.equal(isPlanetOrderCorrect([...sizeOrder].reverse(), 'size'), false)
  assert.equal(isPlanetOrderCorrect(sizeOrder.slice(0, -1), 'size'), false)
  assert.equal(isPlanetOrderCorrect([...sizeOrder, 'jupiter'], 'size'), false)
  assert.equal(isPlanetOrderCorrect(sizeOrder.map(() => 'mercury'), 'size'), false)
  const swappedIceGiants = [...sizeOrder]
  ;[swappedIceGiants[4], swappedIceGiants[5]] = [swappedIceGiants[5], swappedIceGiants[4]]
  assert.equal(isPlanetOrderCorrect(swappedIceGiants, 'size'), false)
})

test('both challenges shuffle all eight planets and never start solved', () => {
  // These swaps would produce the solved size order without the shuffle guard.
  const sizeSolutionSwaps = [0, 3, 1, 2, 0, 0, 1]
  for (const kind of ['distance', 'size']) {
    let index = 7
    for (const random of [() => 0, () => 0.999999, () => (sizeSolutionSwaps[7 - index] + 0.5) / (index-- + 1)]) {
      const shuffled = shufflePlanetOrder(random, kind)
      assert.equal(shuffled.length, 8)
      assert.deepEqual(new Set(shuffled), new Set(sizeOrder))
      assert.equal(isPlanetOrderCorrect(shuffled, kind), false)
    }
  }
})

test('size-order hints explain the largest, smallest, and ice-giant diameters', () => {
  assert.match(planetOrderHint([...sizeOrder].reverse(), 'size'), /Δίας.*μεγαλύτερος/)
  assert.match(planetOrderHint([...sizeOrder.slice(0, -1), 'jupiter'], 'size'), /Ερμής.*μικρότερος/)
  assert.match(planetOrderHint(['jupiter', 'saturn', 'neptune', 'uranus', 'earth', 'venus', 'mars', 'mercury'], 'size'), /Ουρανός.*μεγαλύτερη διάμετρο.*Ποσειδώνα/)
  assert.match(planetOrderHint(['jupiter', 'saturn', 'uranus', 'neptune', 'venus', 'earth', 'mars', 'mercury'], 'size'), /θέση 5.*Γη/)
})