export interface SolarSystemPlanet {
  id: string
  name: string
  kind: string
  fact: string
  order: number
  orbitRadius: number
  orbitAngle: number
  color: string
}

export const solarSystemPlanets = [
  { id: 'mercury', name: 'Ερμής', kind: 'Βραχώδης πλανήτης', fact: 'Ο πρώτος και κοντινότερος πλανήτης στον Ήλιο. Ανήκει στους εσωτερικούς πλανήτες, που είναι μικρότεροι και βραχώδεις. Έχει κρατήρες και πολύ μεγάλες διαφορές θερμοκρασίας ανάμεσα στη μέρα και τη νύχτα.', order: 1, orbitRadius: 0.09, orbitAngle: -90, color: '#b8a18e' },
  { id: 'venus', name: 'Αφροδίτη', kind: 'Βραχώδης πλανήτης', fact: 'Η Αφροδίτη είναι ο δεύτερος πλανήτης από τον Ήλιο. Ανήκει στους εσωτερικούς πλανήτες, που είναι μικρότεροι και βραχώδεις. Λέγεται επίσης Αποσπερίτης και Αυγερινός. Είναι ο πιο θερμός πλανήτης, επειδή η πυκνή ατμόσφαιρά της παγιδεύει θερμότητα.', order: 2, orbitRadius: 0.14, orbitAngle: -18, color: '#e5bc7b' },
  { id: 'earth', name: 'Γη', kind: 'Βραχώδης πλανήτης', fact: 'Η Γη είναι ο τρίτος πλανήτης από τον Ήλιο. Βρίσκεται ανάμεσα στην Αφροδίτη και τον Άρη και είναι το σπίτι μας. Είναι βραχώδης πλανήτης και φιλοξενεί ζωή: έχει οξυγόνο στην ατμόσφαιρά της, νερό που καλύπτει περίπου τα 2/3 της επιφάνειάς της και κατάλληλη απόσταση από τον Ήλιο. Λέγεται Γαλάζιος Πλανήτης και έχει έναν φυσικό δορυφόρο, τη Σελήνη.', order: 3, orbitRadius: 0.19, orbitAngle: 70, color: '#5fa9db' },
  { id: 'mars', name: 'Άρης', kind: 'Βραχώδης πλανήτης', fact: 'Ο Άρης είναι ο τέταρτος πλανήτης από τον Ήλιο και είναι βραχώδης. Ο κόκκινος πλανήτης πήρε το χρώμα του από σκουριά στα πετρώματά του. Έχει δύο φυσικούς δορυφόρους, κρατήρες, βαθιές κοιλάδες και μεγάλα ηφαίστεια. Το σχολικό βιβλίο αναφέρει ότι το όρος Όλυμπος έχει ύψος 26 χλμ. Ρομποτικά οχήματα εξερευνούν την επιφάνειά του.', order: 4, orbitRadius: 0.24, orbitAngle: 155, color: '#d77b5c' },
  { id: 'jupiter', name: 'Δίας', kind: 'Γίγαντας αερίων', fact: 'Ο Δίας είναι ο πέμπτος πλανήτης από τον Ήλιο και ο μεγαλύτερος του Ηλιακού Συστήματος. Ανήκει στους μεγάλους εξωτερικούς πλανήτες. Το σχολικό βιβλίο αναφέρει 95 φυσικούς δορυφόρους. Έχει δακτυλίους, όπως και οι τέσσερις εξωτερικοί πλανήτες. Η Μεγάλη Ερυθρά Κηλίδα του είναι μια τεράστια καταιγίδα.', order: 5, orbitRadius: 0.29, orbitAngle: 228, color: '#d9a77e' },
  { id: 'saturn', name: 'Κρόνος', kind: 'Γίγαντας αερίων', fact: 'Ο Κρόνος είναι ο έκτος πλανήτης από τον Ήλιο και ανήκει στους μεγάλους εξωτερικούς πλανήτες. Οι ιδιαίτερα εντυπωσιακοί δακτύλιοί του αποτελούνται κυρίως από κομμάτια πάγου και βράχου που αντανακλούν το φως του Ήλιου.', order: 6, orbitRadius: 0.34, orbitAngle: 302, color: '#d7c18e' },
  { id: 'uranus', name: 'Ουρανός', kind: 'Γίγαντας πάγων', fact: 'Ο Ουρανός είναι ο έβδομος πλανήτης από τον Ήλιο. Ανήκει στους μεγάλους εξωτερικούς πλανήτες και έχει δακτυλίους. Ο γαλαζοπράσινος Ουρανός περιστρέφεται σχεδόν πλαγιαστά, σαν να κυλά γύρω από τον Ήλιο.', order: 7, orbitRadius: 0.39, orbitAngle: 38, color: '#8ac9d0' },
  { id: 'neptune', name: 'Ποσειδώνας', kind: 'Γίγαντας πάγων', fact: 'Ο Ποσειδώνας είναι ο όγδοος και πιο μακρινός πλανήτης από τον Ήλιο. Ανήκει στους μεγάλους εξωτερικούς πλανήτες και έχει δακτυλίους. Είναι σκοτεινός, κρύος και φυσούν εκεί πολύ δυνατοί άνεμοι.', order: 8, orbitRadius: 0.44, orbitAngle: 188, color: '#6f8ee0' },
] satisfies readonly SolarSystemPlanet[]

export type PlanetOrderKind = 'distance' | 'size'

const planetSizeOrder = ['jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'mercury'] as const

function expectedPlanetOrder(kind: PlanetOrderKind): readonly string[] {
  return kind === 'size' ? planetSizeOrder : solarSystemPlanets.map(planet => planet.id)
}

export function isPlanetOrderCorrect(order: readonly string[], kind: PlanetOrderKind = 'distance'): boolean {
  const expected = expectedPlanetOrder(kind)
  return order.length === expected.length
    && order.every((id, index) => id === expected[index])
}

export function shufflePlanetOrder(random = Math.random, kind: PlanetOrderKind = 'distance'): string[] {
  const order = solarSystemPlanets.map(planet => planet.id)
  for (let index = order.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[order[index], order[swapIndex]] = [order[swapIndex]!, order[index]!]
  }
  if (isPlanetOrderCorrect(order, kind)) [order[0], order[1]] = [order[1]!, order[0]!]
  return order
}

export function planetOrderHint(order: readonly string[], kind: PlanetOrderKind = 'distance'): string {
  if (kind === 'size') {
    if (order[0] !== 'jupiter') return 'Ο Δίας είναι ο μεγαλύτερος πλανήτης.'
    if (order[7] !== 'mercury') return 'Ο Ερμής είναι ο μικρότερος πλανήτης.'
    if (order[2] !== 'uranus' || order[3] !== 'neptune') return 'Ο Ουρανός έχει μεγαλύτερη διάμετρο από τον Ποσειδώνα.'

    const firstWrongIndex = planetSizeOrder.findIndex((id, index) => id !== order[index])
    if (firstWrongIndex < 0) return 'Οι πλανήτες είναι στη σωστή σειρά μεγέθους!'
    const planet = solarSystemPlanets.find(planet => planet.id === planetSizeOrder[firstWrongIndex])!
    return `Έλεγξε τη θέση ${firstWrongIndex + 1}: εκεί μπαίνει ο πλανήτης ${planet.name}.`
  }
  if (order[0] !== 'mercury') return 'Ο Ερμής είναι ο κοντινότερος πλανήτης στον Ήλιο.'
  if (order[2] !== 'earth') return 'Η Γη βρίσκεται ανάμεσα στην Αφροδίτη και τον Άρη.'

  const firstWrongIndex = order.findIndex((id, index) => id !== solarSystemPlanets[index]!.id)
  const planet = solarSystemPlanets[firstWrongIndex]!
  return `Έλεγξε τη θέση ${firstWrongIndex + 1}: ο ${planet.name} πρέπει να είναι εκεί.`
}