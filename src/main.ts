import './app.css'
import './solar-system.css'
import { createIcons, Orbit, ArrowUpRight, Maximize2, Minimize2, Play, Pause, RotateCcw, Plus, Minus, Sun, Moon, Globe2, ChevronRight, ChevronUp, ChevronDown, X, Lightbulb, Compass, ArrowRight, SlidersHorizontal, ClipboardCheck, CircleCheck, CircleX, Trophy } from 'lucide'
import { dayForDate, dateForDay, daylightHours, EARTH_TILT, seasonForDay, solarState } from './astronomy'
import { createScene } from './scene.ts'
import { createSolarScene } from './solar-scene.ts'
import { quizQuestions, scoreQuiz, solarSystemQuizQuestions } from './quiz'
import { regions } from './regions'
import { isPlanetOrderCorrect, planetOrderHint, shufflePlanetOrder, solarSystemPlanets, type PlanetOrderKind } from './solar-system.ts'

const icons = { Orbit, ArrowUpRight, Maximize2, Minimize2, Play, Pause, RotateCcw, Plus, Minus, Sun, Moon, Globe2, ChevronRight, ChevronUp, ChevronDown, X, Lightbulb, Compass, ArrowRight, SlidersHorizontal, ClipboardCheck, CircleCheck, CircleX, Trophy }
const icon = (name: string) => `<i data-lucide="${name}"></i>`
const refreshIcons = () => createIcons({ icons, attrs: { 'stroke-width': 1.7 } })

function regionOptions(south: boolean): string {
  return regions
    .filter(region => region.latitude === 0 || (south ? region.latitude < 0 : region.latitude > 0))
    .map(region => `<option value="${region.id}">${region.name}</option>`)
    .join('')
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="site-header">
    <a class="brand" href="./" aria-label="Τροχιά: αρχική σελίδα"><span class="brand-mark">${icon('orbit')}</span>τροχιά<span class="brand-dot">.</span></a>
    <div class="header-divider"></div><span class="product-name">Μια άλλη ματιά στον πλανήτη μας.</span>
    <nav class="header-nav" aria-label="Κύρια πλοήγηση"><button id="earth-system-button" class="nav-tab active-nav" aria-current="page">Γη & Ήλιος</button><button id="solar-system-button" class="nav-tab">Ηλιακό Σύστημα</button><button id="notes-button">Σημειώσεις ${icon('arrow-up-right')}</button><button id="quiz-button">${icon('clipboard-check')}Κουίζ</button></nav>
    <button class="present-button" id="present-button" aria-label="Έναρξη παρουσίασης" title="Παρουσίαση">${icon('maximize-2')}<span>Παρουσίαση</span></button>
  </header>
  <main>
    <section class="page-heading" id="earth-heading"><div><div class="eyebrow"><span></span>Η ΓΗ ΣΕ ΚΙΝΗΣΗ</div><h1>Ένας πλανήτης. Τόσες αλλαγές.</h1><p>Ένα ταξίδι γύρω από τον Ήλιο, μέσα στις εποχές και σε κάθε καινούρια μέρα.</p></div><span class="lesson-tag">${icon('compass')} ΓΕΩΓΡΑΦΙΑ <span>01</span></span></section>
    <div class="workspace" id="earth-workspace">
      <section class="simulation" aria-label="Διαδραστική προσομοίωση Γης και Ήλιου">
        <div class="scene-topbar"><div class="view-tabs" role="tablist" aria-label="Προβολή προσομοίωσης"><button id="orbit-view" role="tab" aria-selected="true" class="selected">${icon('orbit')}Έτος & εποχές</button><button id="day-view" role="tab" aria-selected="false">${icon('globe-2')}Μέρα & νύχτα</button></div><span class="live-tag"><span></span>ΠΡΟΣΟΜΟΙΩΣΗ</span></div>
        <div id="space" role="img" aria-label="Τρισδιάστατη Γη γύρω από τον Ήλιο. Σύρετε για περιστροφή της κάμερας και κυλήστε για μεγέθυνση."></div>
        <div id="scene-labels" aria-hidden="true"><div class="space-label sun-label" id="sun-label"><span class="label-dot"></span>Ήλιος</div><div class="space-label earth-label" id="earth-label"><span class="label-dot"></span>Γη <span class="label-detail" id="earth-label-date">21 Ιουν.</span></div><div class="season-label" id="march-label">ΙΣΗΜΕΡΙΑ ΜΑΡΤΙΟΥ</div><div class="season-label" id="june-label">ΗΛΙΟΣΤΑΣΙΟ ΙΟΥΝΙΟΥ</div><div class="season-label" id="september-label">ΙΣΗΜΕΡΙΑ ΣΕΠΤΕΜΒΡΙΟΥ</div><div class="season-label" id="december-label">ΗΛΙΟΣΤΑΣΙΟ ΔΕΚΕΜΒΡΙΟΥ</div><div class="axis-label" id="axis-label">23,4°<span>κλίση άξονα</span></div><div class="space-label city-label" id="city-label"><span class="label-dot"></span>Θεσσαλονίκη</div></div>
        <div class="scene-tools"><button id="reset-camera" class="scene-icon" title="Επαναφορά κάμερας" aria-label="Επαναφορά κάμερας">${icon('rotate-ccw')}</button><span></span><button id="zoom-in" class="scene-icon" title="Μεγέθυνση" aria-label="Μεγέθυνση">${icon('plus')}</button><button id="zoom-out" class="scene-icon" title="Σμίκρυνση" aria-label="Σμίκρυνση">${icon('minus')}</button></div>
        <div class="scene-footer"><span class="scale-note">Μεγέθη, αποστάσεις και χρόνος δεν είναι υπό κλίμακα</span><div class="scene-key"><span><i class="key-orbit"></i>Τροχιά της Γης</span><span><i class="key-axis"></i>Άξονας της Γης</span></div></div>
        <div id="scene-error" hidden><h2>Το σύμπαν χρειάζεται λίγη βοήθεια.</h2><p>Τα τρισδιάστατα γραφικά δεν είναι διαθέσιμα. Δοκιμάστε να ενεργοποιήσετε την επιτάχυνση υλικού στον φυλλομετρητή. Η ημερομηνία και οι υπολογισμοί ημέρας λειτουργούν κανονικά.</p></div>
      </section>
      <aside class="inspector">
        <div class="inspector-heading"><span class="eyebrow">ΜΙΑ ΠΙΟ ΚΟΝΤΙΝΗ ΜΑΤΙΑ</span>${icon('sliders-horizontal')}</div>
        <div class="hemisphere-tabs" role="group" aria-label="Ημισφαίριο"><button class="selected" data-hemisphere="north" aria-pressed="true">Βόρειο</button><button data-hemisphere="south" aria-pressed="false">Νότιο</button></div>
        <div class="season-heading"><span id="season-icon" class="season-symbol">${icon('sun')}</span><div><span class="overline" id="hemisphere-name">ΒΟΡΕΙΟ ΗΜΙΣΦΑΙΡΙΟ</span><h2 id="season-name">Καλοκαίρι!</h2></div></div>
        <p class="season-copy" id="season-copy">Το ημισφαίριό μας γέρνει προς τον Ήλιο. Οι ακτίνες φτάνουν πιο κάθετα και η μέρα διαρκεί περισσότερο.</p>
        <div class="daylight-heading"><span>ΦΩΣ ΗΜΕΡΑΣ</span><select id="location" aria-label="Τοποθεσία υπολογισμού ημέρας">${regionOptions(false)}</select></div>
        <div class="daylight-bar"><div id="daylight-fill"></div></div><div class="daylight-values"><span>${icon('sun')}<strong id="daylight-hours"></strong> μέρα</span><span>${icon('moon')}<strong id="night-hours"></strong> νύχτα</span></div>
        <div class="inspector-rule"></div>
        <div class="settings-title">Στο μοντέλο</div>
        <label class="toggle-row"><span><i class="setting-dot axis-dot"></i>Κλίση της Γης<span class="setting-value" id="tilt-value">23,4°</span></span><input id="tilt-toggle" type="checkbox" checked role="switch" aria-label="Κλίση του άξονα της Γης"><span class="switch"></span></label>
        <label class="toggle-row"><span><i class="setting-dot orbit-dot"></i>Τροχιά</span><input id="orbit-toggle" type="checkbox" checked role="switch"><span class="switch"></span></label>
        <label class="toggle-row"><span><i class="setting-dot label-dot-small"></i>Ετικέτες</span><input id="labels-toggle" type="checkbox" checked role="switch"><span class="switch"></span></label>
        <div class="think-about"><div>${icon('lightbulb')}Μια ερώτηση για σκέψη</div><p id="thinking-question">Όταν έχουμε καλοκαίρι στη Θεσσαλονίκη, τι εποχή έχει το Σίδνεϊ;</p><button id="answer-button">Ας το ανακαλύψουμε ${icon('arrow-right')}</button></div>
      </aside>
      <section class="timeline" aria-label="Χειρισμός χρόνου">
        <div class="timeline-top"><div class="time-title"><span class="eyebrow">Η ΘΕΣΗ ΜΑΣ ΜΕΣΑ ΣΤΟ ΕΤΟΣ</span><div><h2 id="date-display">21 Ιουνίου</h2><span id="event-display">Ηλιοστάσιο Ιουνίου</span></div></div><div class="playback"><button class="icon-button" id="reset-time" title="Επιστροφή στο ηλιοστάσιο του Ιουνίου" aria-label="Επαναφορά ημερομηνίας">${icon('rotate-ccw')}</button><button class="play-button" id="play-button" aria-label="Έναρξη κίνησης">${icon('play')}<span>Έναρξη</span></button><select id="speed" aria-label="Ταχύτητα κίνησης"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="3">3×</option></select></div></div>
        <div class="year-slider"><div class="season-track"><span></span><span></span><span></span><span></span></div><input id="date-slider" type="range" min="0" max="364" value="171" step="1" aria-label="Ημέρα του έτους"><div class="month-labels">${['Ιαν','Φεβ','Μαρ','Απρ','Μάι','Ιουν','Ιουλ','Αυγ','Σεπ','Οκτ','Νοε','Δεκ'].map(month => `<span>${month}</span>`).join('')}</div></div>
        <div class="season-shortcuts"><button data-date="3,20"><span class="shortcut-dot spring"></span><span>Ισημερία Μαρτίου</span><small>20 Μαρ</small>${icon('chevron-right')}</button><button data-date="6,21" class="current"><span class="shortcut-dot summer"></span><span>Ηλιοστάσιο Ιουνίου</span><small>21 Ιουν</small>${icon('chevron-right')}</button><button data-date="9,23"><span class="shortcut-dot autumn"></span><span>Ισημερία Σεπτεμβρίου</span><small>23 Σεπ</small>${icon('chevron-right')}</button><button data-date="12,21"><span class="shortcut-dot winter"></span><span>Ηλιοστάσιο Δεκεμβρίου</span><small>21 Δεκ</small>${icon('chevron-right')}</button></div>
      </section>
    </div>
    <section id="solar-system-view" hidden>
      <section class="page-heading"><div><div class="eyebrow"><span></span>ΤΟ ΗΛΙΑΚΟ ΜΑΣ ΣΥΣΤΗΜΑ</div><h1>Οκτώ πλανήτες, ένα σπίτι.</h1><p>Ακολούθησε τις τροχιές και ανακάλυψε τη θέση της Γης.</p><p>Το Ηλιακό Σύστημα σχηματίστηκε πριν από περίπου 4,6 δισεκατομμύρια χρόνια.</p></div><span class="lesson-tag">${icon('orbit')} ΔΙΑΣΤΗΜΑ <span>02</span></span></section>
      <div class="solar-workspace">
        <section class="solar-explorer" aria-label="Διαδραστικός χάρτης πλανητών">
          <div class="solar-model-heading"><div><span class="eyebrow">ΑΠΟ ΤΟΝ ΗΛΙΟ ΠΡΟΣ ΤΑ ΕΞΩ</span><h2>Πάτησε έναν πλανήτη</h2></div><span class="solar-scale-note">Οι αποστάσεις και τα μεγέθη δεν είναι υπό κλίμακα</span></div>
          <div class="solar-controls" aria-label="Ρυθμίσεις μοντέλου">
            <button id="solar-motion-button" class="solar-motion-button" aria-pressed="false">${icon('play')}<span>Κίνηση</span></button>
            <label class="solar-speed-control"><span>Ταχύτητα</span><select id="solar-speed"><option value="0.5">Ήρεμα</option><option value="1" selected>Κανονικά</option><option value="2">Γρήγορα</option></select></label>
            <label class="solar-range-control"><span>Μέγεθος πλανητών</span><input id="solar-size" type="range" min="75" max="150" step="25" value="100" aria-label="Μέγεθος πλανητών"><output id="solar-size-value" for="solar-size">100%</output></label>
            <label class="solar-range-control"><span>Απόσταση τροχιών</span><input id="solar-distance" type="range" min="70" max="100" step="10" value="100" aria-label="Απόσταση τροχιών"><output id="solar-distance-value" for="solar-distance">100%</output></label>
            <button id="solar-perspective" class="solar-perspective-button" aria-pressed="false">Προοπτική</button>
          </div>
          <div id="solar-map" class="solar-map" role="img" aria-label="Τρισδιάστατο μοντέλο του Ηλιακού Συστήματος. Επίλεξε πλανήτη από τον χάρτη ή τη σειρά παρακάτω."></div>
          <div class="planet-order" aria-label="Πλανήτες με τη σειρά από τον Ήλιο">${solarSystemPlanets.map(planet => `<button class="planet-order-item${planet.id === 'earth' ? ' selected' : ''}" data-solar-planet="${planet.id}" aria-pressed="${planet.id === 'earth'}"><span class="order-number">${planet.order}</span><span>${planet.name}</span></button>`).join('')}</div>
        </section>
        <aside class="solar-inspector" aria-live="polite">
          <span class="eyebrow">ΓΝΩΡΙΣΕ ΤΟΝ ΠΛΑΝΗΤΗ</span>
          <div class="planet-detail-heading"><span id="planet-detail-icon" class="planet-detail-icon planet-earth"><span></span></span><div><span class="planet-position" id="planet-position">3ος από τον Ήλιο</span><h2 id="planet-name">Γη</h2></div></div>
          <span class="planet-kind" id="planet-kind">Βραχώδης πλανήτης</span>
          <p class="planet-fact" id="planet-fact">${solarSystemPlanets[2]!.fact}</p>
          <div class="planet-neighbors"><span>ΠΡΙΝ</span><strong id="planet-before">Αφροδίτη</strong><span>ΜΕΤΑ</span><strong id="planet-after">Άρης</strong></div>
          <div class="earth-mission" id="earth-mission">
            <span class="eyebrow">ΜΙΚΡΗ ΑΠΟΣΤΟΛΗ</span><h3>Πού είναι το σπίτι μας;</h3>
            <p id="mission-prompt">Βρες τον πλανήτη που βρίσκεται ανάμεσα στην Αφροδίτη και τον Άρη.</p>
            <button id="mission-start">Ξεκίνα την αποστολή ${icon('arrow-right')}</button>
            <p class="mission-feedback" id="mission-feedback" role="status" aria-live="polite"></p>
          </div>
        </aside>
      </div>
      <section class="planet-order-challenge" aria-labelledby="planet-order-title">
        <div class="challenge-heading">
          <div><span class="eyebrow">Η ΣΕΙΡΑ ΕΙΝΑΙ ΣΤΟ ΧΕΡΙ ΣΟΥ</span><h2 id="planet-order-title">Βάλε τους πλανήτες στη σειρά</h2><p>Από τον πλανήτη που είναι πιο κοντά στον Ήλιο προς τον πιο μακρινό.</p></div>
          <button id="new-planet-order" class="challenge-secondary">${icon('rotate-ccw')}Νέα σειρά</button>
        </div>
        <ol id="planet-order-list" class="challenge-list" aria-label="Η σειρά των πλανητών"></ol>
        <div class="challenge-footer"><p id="planet-order-feedback" role="status" aria-live="polite">Βάλε και τους οκτώ πλανήτες στη σωστή σειρά.</p><button id="check-planet-order" class="challenge-primary">${icon('circle-check')}Έλεγχος σειράς</button></div>
      </section>
      <section class="planet-order-challenge" aria-labelledby="planet-size-title">
        <div class="challenge-heading">
          <div><span class="eyebrow">ΣΥΓΚΡΙΝΕ ΤΑ ΜΕΓΕΘΗ</span><h2 id="planet-size-title">Βάλε τους πλανήτες στη σειρά μεγέθους</h2><p>Από τον μεγαλύτερο πλανήτη προς τον μικρότερο, με βάση τη διάμετρό τους (χωρίς τους δακτυλίους).</p></div>
          <button id="new-planet-size" class="challenge-secondary">${icon('rotate-ccw')}Νέα σειρά</button>
        </div>
        <ol id="planet-size-list" class="challenge-list" aria-label="Η σειρά των πλανητών από τον μεγαλύτερο στον μικρότερο"></ol>
        <div class="challenge-footer"><p id="planet-size-feedback" role="status" aria-live="polite">Βάλε και τους οκτώ πλανήτες στη σωστή σειρά μεγέθους.</p><button id="check-planet-size" class="challenge-primary">${icon('circle-check')}Έλεγχος σειράς</button></div>
      </section>
    </section>
    <footer class="page-footer"><span><span class="footer-orbit">${icon('orbit')}</span>Ένας μικρός πλανήτης. Αμέτρητες ανακαλύψεις.</span><span>Για μυαλά γεμάτα περιέργεια <span class="footer-spark">✦</span></span></footer>
  </main>
  <dialog id="notes-dialog"><div class="dialog-heading"><span class="eyebrow">ΣΗΜΕΙΩΣΕΙΣ ΕΚΠΑΙΔΕΥΤΙΚΟΥ</span><button id="close-notes" class="icon-button" aria-label="Κλείσιμο σημειώσεων">${icon('x')}</button></div><h2>Η Γη κινείται. Ας την ανακαλύψουμε.</h2><div class="note-item">${icon('globe-2')}<div><h3>Μία περιστροφή. Μία μέρα.</h3><p>Η Γη περιστρέφεται γύρω από τον άξονά της περίπου κάθε 24 ώρες. Στην πλευρά που βλέπει τον Ήλιο είναι μέρα, ενώ στην απέναντι πλευρά είναι νύχτα.</p></div></div><div class="note-item">${icon('orbit')}<div><h3>Μία περιφορά. Ένας χρόνος.</h3><p>Η Γη ολοκληρώνει μια περιφορά γύρω από τον Ήλιο σε περίπου 365¼ μέρες. Ο άξονάς της διατηρεί σχεδόν την ίδια κατεύθυνση όλο τον χρόνο.</p></div></div><div class="note-item">${icon('sun')}<div><h3>Μια μικρή κλίση. Τέσσερις εποχές.</h3><p>Ο άξονας της Γης έχει κλίση περίπου 23,4°. Το ημισφαίριο που γέρνει προς τον Ήλιο δέχεται πιο κάθετα τις ακτίνες του και έχει μεγαλύτερες μέρες. Οι εποχές δεν οφείλονται στην απόσταση της Γης από τον Ήλιο.</p></div></div><div class="note-experiment"><strong>Ένα πείραμα στην τάξη</strong><p>Συγκρίνετε τον Ιούνιο με τον Δεκέμβριο στη Θεσσαλονίκη. Μετά απενεργοποιήστε την κλίση της Γης. Τι συμβαίνει στη διάρκεια της ημέρας;</p></div><p class="note-fine">Τα μεγέθη, οι αποστάσεις και η ταχύτητα έχουν προσαρμοστεί για ευκολότερη παρατήρηση. Η διάρκεια της ημέρας είναι γεωμετρική εκτίμηση, χωρίς ατμοσφαιρική διάθλαση. Οι εποχές ακολουθούν τον αστρονομικό ορισμό για τις εύκρατες περιοχές.</p></dialog>
  <dialog id="quiz-dialog" aria-labelledby="quiz-title"><div class="dialog-heading"><span class="eyebrow">ΜΙΚΡΟΙ ΕΞΕΡΕΥΝΗΤΕΣ</span><button id="close-quiz" class="icon-button" aria-label="Κλείσιμο κουίζ">${icon('x')}</button></div><h2 id="quiz-title">Πόσο καλά γνωρίζεις τη Γη;</h2><div id="quiz-content"></div></dialog>
`

refreshIcons()
const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const earthSystemButton = get<HTMLButtonElement>('earth-system-button')
const solarSystemButton = get<HTMLButtonElement>('solar-system-button')
const solarSystemView = get('solar-system-view')
let missionActive = false
let solarMotionPlaying = false
let solarSpeed = 1
let solarDistance = 1
let solarPerspective = false
let solarScene: ReturnType<typeof createSolarScene> | undefined

function updateSolarMap() {
  solarScene?.setPlanetScale(Number(get<HTMLInputElement>('solar-size').value) / 100)
  solarScene?.setOrbitSpacing(solarDistance)
}

function setSolarMotion(value: boolean) {
  solarMotionPlaying = value
  const button = get<HTMLButtonElement>('solar-motion-button')
  button.setAttribute('aria-pressed', String(value))
  button.setAttribute('aria-label', value ? 'Παύση κίνησης πλανητών' : 'Έναρξη κίνησης πλανητών')
  button.innerHTML = `${icon(value ? 'pause' : 'play')}<span>${value ? 'Παύση' : 'Κίνηση'}</span>`
  refreshIcons()
}

function initializePlanetOrderChallenge(prefix: string, kind: PlanetOrderKind) {
  let planetOrder = shufflePlanetOrder(Math.random, kind)
  let planetOrderSolved = false
  let draggedPlanetId: string | null = null
  const list = get<HTMLOListElement>(`${prefix}-list`)
  const feedback = get(`${prefix}-feedback`)
  const checkButton = get<HTMLButtonElement>(`check-${prefix}`)

  function renderPlanetOrder(focusPlanetId?: string) {
    list.innerHTML = planetOrder.map((id, index) => {
      const planet = solarSystemPlanets.find(item => item.id === id)!
      return `<li class="challenge-item" data-order-planet="${id}" draggable="${!planetOrderSolved}" aria-label="Θέση ${index + 1}: ${planet.name}"><span class="challenge-position">${index + 1}</span><span class="challenge-planet-name">${planet.name}</span><span class="challenge-moves"><button id="${prefix}-move-${id}-up" class="move-planet" data-order-move="up" data-planet-id="${id}" aria-label="Μετακίνησε τον ${planet.name} προς τα πάνω" title="Προς τα πάνω" ${index === 0 || planetOrderSolved ? 'disabled' : ''}>${icon('chevron-up')}</button><button id="${prefix}-move-${id}-down" class="move-planet" data-order-move="down" data-planet-id="${id}" aria-label="Μετακίνησε τον ${planet.name} προς τα κάτω" title="Προς τα κάτω" ${index === planetOrder.length - 1 || planetOrderSolved ? 'disabled' : ''}>${icon('chevron-down')}</button></span></li>`
    }).join('')
    refreshIcons()
    if (focusPlanetId) {
      const controls = ['up', 'down'].map(direction => get<HTMLButtonElement>(`${prefix}-move-${focusPlanetId}-${direction}`))
      controls.find(button => !button.disabled)?.focus({ preventScroll: true })
    }
  }

  function movePlanet(id: string, targetIndex: number) {
    const sourceIndex = planetOrder.indexOf(id)
    if (sourceIndex < 0 || planetOrderSolved) return
    const [planet] = planetOrder.splice(sourceIndex, 1)
    planetOrder.splice(Math.max(0, Math.min(targetIndex, planetOrder.length)), 0, planet!)
    feedback.textContent = `Η σειρά άλλαξε. Έλεγξε ξανά τη θέση του ${solarSystemPlanets.find(item => item.id === id)!.name}.`
    feedback.className = 'challenge-feedback'
    renderPlanetOrder(id)
  }

  function checkPlanetOrder() {
    if (isPlanetOrderCorrect(planetOrder, kind)) {
      planetOrderSolved = true
      feedback.textContent = kind === 'size'
        ? 'Μπράβο! Από τον μεγαλύτερο στον μικρότερο: Δίας, Κρόνος, Ουρανός, Ποσειδώνας, Γη, Αφροδίτη, Άρης, Ερμής!'
        : 'Μπράβο! Η Γη είναι τρίτη, ανάμεσα στην Αφροδίτη και τον Άρη. Βρήκες τη σωστή σειρά και των οκτώ πλανητών!'
      feedback.className = 'challenge-feedback success'
      checkButton.disabled = true
      renderPlanetOrder()
      return
    }
    feedback.textContent = `Σχεδόν! ${planetOrderHint(planetOrder, kind)}`
    feedback.className = 'challenge-feedback retry'
  }

  function startNewPlanetOrder() {
    planetOrder = shufflePlanetOrder(Math.random, kind)
    planetOrderSolved = false
    checkButton.disabled = false
    feedback.textContent = kind === 'size'
      ? 'Βάλε και τους οκτώ πλανήτες στη σωστή σειρά μεγέθους.'
      : 'Βάλε και τους οκτώ πλανήτες στη σωστή σειρά.'
    feedback.className = 'challenge-feedback'
    renderPlanetOrder()
  }

  renderPlanetOrder()
  checkButton.onclick = checkPlanetOrder
  get<HTMLButtonElement>(`new-${prefix}`).onclick = startNewPlanetOrder
  list.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-order-move]')
    if (!button || button.disabled) return
    const currentIndex = planetOrder.indexOf(button.dataset.planetId!)
    movePlanet(button.dataset.planetId!, currentIndex + (button.dataset.orderMove === 'up' ? -1 : 1))
  })
  list.addEventListener('dragstart', event => {
    const item = (event.target as HTMLElement).closest<HTMLElement>('[data-order-planet]')
    if (!item || planetOrderSolved) return
    draggedPlanetId = item.dataset.orderPlanet ?? null
    event.dataTransfer?.setData('text/plain', draggedPlanetId ?? '')
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  })
  list.addEventListener('dragover', event => {
    const item = (event.target as HTMLElement).closest<HTMLElement>('[data-order-planet]')
    if (!item || planetOrderSolved || !draggedPlanetId) return
    event.preventDefault()
    item.classList.add('drop-target')
  })
  list.addEventListener('dragleave', event => {
    (event.target as HTMLElement).closest<HTMLElement>('[data-order-planet]')?.classList.remove('drop-target')
  })
  list.addEventListener('drop', event => {
    const item = (event.target as HTMLElement).closest<HTMLElement>('[data-order-planet]')
    item?.classList.remove('drop-target')
    if (!item || planetOrderSolved || !draggedPlanetId) return
    event.preventDefault()
    movePlanet(draggedPlanetId, planetOrder.indexOf(item.dataset.orderPlanet!))
    draggedPlanetId = null
  })
  list.addEventListener('dragend', () => {
    draggedPlanetId = null
    list.querySelectorAll('.drop-target').forEach(item => item.classList.remove('drop-target'))
  })
}

function setLessonView(view: 'earth' | 'solar') {
  const solar = view === 'solar'
  get('earth-heading').hidden = solar
  get('earth-workspace').hidden = solar
  solarSystemView.hidden = !solar
  earthSystemButton.classList.toggle('active-nav', !solar)
  solarSystemButton.classList.toggle('active-nav', solar)
  if (solar) {
    earthSystemButton.removeAttribute('aria-current')
    solarSystemButton.setAttribute('aria-current', 'page')
  } else {
    earthSystemButton.setAttribute('aria-current', 'page')
    solarSystemButton.removeAttribute('aria-current')
  }
  if (solar && !solarScene) {
    solarScene = createSolarScene(get('solar-map'), selectSolarPlanet)
    updateSolarMap()
    solarScene.setPerspective(solarPerspective)
    solarScene.selectPlanet('earth')
  }
}

function selectSolarPlanet(id: string) {
  const planet = solarSystemPlanets.find(item => item.id === id)!
  const previous = solarSystemPlanets[planet.order - 2]
  const next = solarSystemPlanets[planet.order]
  document.querySelectorAll<HTMLButtonElement>('[data-solar-planet]').forEach(button => {
    const selected = button.dataset.solarPlanet === id
    button.classList.toggle('selected', selected)
    button.setAttribute('aria-pressed', String(selected))
  })
  get('planet-position').textContent = `${planet.order}${planet.order === 1 ? 'ος' : 'ος'} από τον Ήλιο`
  get('planet-name').textContent = planet.name
  get('planet-kind').textContent = planet.kind
  get('planet-fact').textContent = planet.fact
  get('planet-before').textContent = previous?.name ?? 'Ήλιος'
  get('planet-after').textContent = next?.name ?? '—'
  get('planet-detail-icon').className = `planet-detail-icon planet-${planet.id}`
  solarScene?.selectPlanet(id)
  if (missionActive) {
    if (id === 'earth') {
      missionActive = false
      get('mission-feedback').textContent = 'Σωστά! Η Γη είναι ο τρίτος πλανήτης, ανάμεσα στην Αφροδίτη και τον Άρη.'
      get('mission-feedback').classList.add('success')
      get('mission-start').innerHTML = `Ξανά την αποστολή ${icon('rotate-ccw')}`
      get('mission-prompt').textContent = 'Τώρα ξέρεις: η Γη είναι τρίτη από τον Ήλιο.'
    } else {
      get('mission-feedback').textContent = 'Καλή προσπάθεια. Ψάξε ανάμεσα στην Αφροδίτη και τον Άρη.'
      get('mission-feedback').classList.remove('success')
    }
  }
  refreshIcons()
}

earthSystemButton.onclick = () => setLessonView('earth')
solarSystemButton.onclick = () => setLessonView('solar')
document.querySelectorAll<HTMLButtonElement>('[data-solar-planet]').forEach(button => {
  button.onclick = () => selectSolarPlanet(button.dataset.solarPlanet!)
})
get('mission-start').onclick = () => {
  missionActive = true
  get('mission-prompt').textContent = 'Βρες τον πλανήτη που βρίσκεται ανάμεσα στην Αφροδίτη και τον Άρη.'
  get('mission-feedback').textContent = ''
  get('mission-feedback').classList.remove('success')
  get('mission-start').innerHTML = `Διάλεξε έναν πλανήτη ${icon('arrow-right')}`
  refreshIcons()
}
initializePlanetOrderChallenge('planet-order', 'distance')
initializePlanetOrderChallenge('planet-size', 'size')
get<HTMLButtonElement>('solar-motion-button').onclick = () => setSolarMotion(!solarMotionPlaying)
get<HTMLSelectElement>('solar-speed').onchange = event => { solarSpeed = Number((event.target as HTMLSelectElement).value) }
get<HTMLInputElement>('solar-size').oninput = event => {
  const value = Number((event.target as HTMLInputElement).value)
  get('solar-size-value').textContent = `${value}%`
  updateSolarMap()
}
get<HTMLInputElement>('solar-distance').oninput = event => {
  solarDistance = Number((event.target as HTMLInputElement).value) / 100
  get('solar-distance-value').textContent = `${Math.round(solarDistance * 100)}%`
  updateSolarMap()
}
get<HTMLButtonElement>('solar-perspective').onclick = event => {
  solarPerspective = !solarPerspective
  const button = event.currentTarget as HTMLButtonElement
  button.setAttribute('aria-pressed', String(solarPerspective))
  solarScene?.setPerspective(solarPerspective)
}
updateSolarMap()
let day = dayForDate(6, 21)
let southern = false
let tilted = true
let playing = false
let speed = 1
const orbitTimeBalance = Math.sqrt((8 * Math.PI * 2) / 1.2)
let mode: 'orbit' | 'day' = 'orbit'
let selectedRegion = regions[0]!
let scene: ReturnType<typeof createScene> | undefined
try {
  scene = createScene(get('space'), (id, x, y, visible) => {
    const label = get(id)
    label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
    label.style.visibility = visible ? 'visible' : 'hidden'
  })
} catch (error) {
  get('scene-error').hidden = false
  console.error('Αδυναμία εκκίνησης τρισδιάστατων γραφικών:', error)
}

const formatHours = (hours: number) => {
  const minutes = Math.round(hours * 60)
  return `${Math.floor(minutes / 60)}ω ${String(minutes % 60).padStart(2, '0')}λ`
}

function update() {
  const date = dateForDay(day)
  const season = seasonForDay(day, southern)
  const { declination, longitude } = solarState(day, tilted ? EARTH_TILT : 0)
  const daylight = daylightHours(selectedRegion.latitude, declination)
  get('space').setAttribute('aria-label', mode === 'orbit'
    ? `Τρισδιάστατη περιφορά της Γης γύρω από τον Ήλιο, με επιλεγμένη τοποθεσία: ${selectedRegion.name}`
    : `Κοντινή προβολή της Γης με εστίαση στην τοποθεσία ${selectedRegion.name}: η φωτεινή και η σκοτεινή πλευρά`)
  get('date-display').textContent = date.toLocaleDateString('el-GR', { day: 'numeric', month: 'long', timeZone: 'UTC' })
  get<HTMLInputElement>('date-slider').value = String(Math.floor(day))
  get('earth-label-date').textContent = date.toLocaleDateString('el-GR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  get('hemisphere-name').textContent = `${southern ? 'ΝΟΤΙΟ' : 'ΒΟΡΕΙΟ'} ΗΜΙΣΦΑΙΡΙΟ`
  const seasonNames: Record<string, string> = { Spring: 'Άνοιξη', Summer: 'Καλοκαίρι', Autumn: 'Φθινόπωρο', Winter: 'Χειμώνας' }
  get('season-name').textContent = tilted ? `${seasonNames[season]}!` : 'Χωρίς κλίση.'
  const copies: Record<string, string> = {
    Summer: 'Το ημισφαίριό μας γέρνει προς τον Ήλιο. Οι ακτίνες φτάνουν πιο κάθετα και η μέρα διαρκεί περισσότερο.',
    Winter: 'Το ημισφαίριό μας γέρνει μακριά από τον Ήλιο. Οι ακτίνες φτάνουν πιο πλάγια και η μέρα διαρκεί λιγότερο.',
    Spring: 'Καθώς η Γη προχωρά στην τροχιά της, το ημισφαίριό μας δέχεται όλο και περισσότερο φως. Οι μέρες μεγαλώνουν μέχρι το καλοκαίρι.',
    Autumn: 'Καθώς η Γη προχωρά στην τροχιά της, το ημισφαίριό μας δέχεται όλο και λιγότερο φως. Οι μέρες μικραίνουν μέχρι τον χειμώνα.',
  }
  get('season-copy').textContent = tilted ? copies[season]! : 'Χωρίς κλίση στον άξονα, το φως μοιράζεται εξίσου όλο τον χρόνο. Κάθε τόπος έχει περίπου 12 ώρες μέρας και 12 ώρες νύχτας.'
  get('thinking-question').textContent = tilted
    ? `Όταν έχουμε ${seasonNames[season]!.toLocaleLowerCase('el-GR')} ${southern ? 'στο Σίδνεϊ' : 'στη Θεσσαλονίκη'}, τι εποχή έχει ${southern ? 'η Θεσσαλονίκη' : 'το Σίδνεϊ'};`
    : 'Αν η Γη δεν είχε κλίση στον άξονά της, θα είχαμε τις ίδιες τέσσερις εποχές;'
  get<HTMLButtonElement>('answer-button').disabled = !tilted
  get('season-icon').innerHTML = icon(season === 'Winter' ? 'moon' : 'sun')
  get('daylight-hours').textContent = formatHours(daylight)
  get('night-hours').textContent = formatHours(24 - daylight)
  get('daylight-fill').style.width = `${daylight / 24 * 100}%`
  get('tilt-value').textContent = tilted ? '23,4°' : '0°'
  get('axis-label').innerHTML = `${tilted ? '23,4°' : '0°'}<span>κλίση άξονα</span>`
  let event = tilted ? seasonNames[season]! : 'Χωρίς κλίση'
  document.querySelectorAll<HTMLButtonElement>('[data-date]').forEach(button => {
    const [month, dateNumber] = button.dataset.date!.split(',').map(Number)
    const active = Math.abs(day - dayForDate(month!, dateNumber!)) < 1
    button.classList.toggle('current', active)
    if (active) event = button.querySelectorAll('span')[1]!.textContent!
  })
  get('event-display').textContent = event
  scene?.setState(longitude, tilted ? EARTH_TILT : 0)
  refreshIcons()
}

function setPlaying(value: boolean) {
  playing = value
  get('play-button').innerHTML = `${icon(playing ? 'pause' : 'play')}<span>${playing ? 'Παύση' : 'Έναρξη'}</span>`
  get('play-button').setAttribute('aria-label', playing ? 'Παύση κίνησης' : 'Έναρξη κίνησης')
  refreshIcons()
}

get('play-button').onclick = () => setPlaying(!playing)
get<HTMLInputElement>('date-slider').oninput = event => { day = Number((event.target as HTMLInputElement).value); update() }
get<HTMLSelectElement>('speed').onchange = event => { speed = Number((event.target as HTMLSelectElement).value) }
get('reset-time').onclick = () => { day = dayForDate(6, 21); setPlaying(false); scene?.resetRotation(); update() }
document.querySelectorAll<HTMLButtonElement>('[data-date]').forEach(button => button.onclick = () => {
  const [month, dateNumber] = button.dataset.date!.split(',').map(Number)
  day = dayForDate(month!, dateNumber!); update()
})

function changeHemisphere(south: boolean) {
  southern = south
  document.querySelectorAll<HTMLButtonElement>('[data-hemisphere]').forEach(button => {
    const selected = (button.dataset.hemisphere === 'south') === south
    button.classList.toggle('selected', selected)
    button.setAttribute('aria-pressed', String(selected))
  })
  get<HTMLSelectElement>('location').innerHTML = regionOptions(south)
  selectRegion()
}

function selectRegion() {
  selectedRegion = regions.find(region => region.id === get<HTMLSelectElement>('location').value)!
  get('city-label').innerHTML = `<span class="label-dot"></span>${selectedRegion.name}`
  update()
  scene?.focusRegion(selectedRegion)
}
document.querySelectorAll<HTMLButtonElement>('[data-hemisphere]').forEach(button => button.onclick = () => changeHemisphere(button.dataset.hemisphere === 'south'))
get('answer-button').onclick = () => changeHemisphere(!southern)
get<HTMLSelectElement>('location').onchange = selectRegion
get<HTMLInputElement>('tilt-toggle').onchange = event => { tilted = (event.target as HTMLInputElement).checked; update() }
get<HTMLInputElement>('orbit-toggle').onchange = event => scene?.setOrbitVisible((event.target as HTMLInputElement).checked)
get<HTMLInputElement>('labels-toggle').onchange = event => { get('scene-labels').hidden = !(event.target as HTMLInputElement).checked }

function setMode(next: 'orbit' | 'day') {
  mode = next
  for (const view of ['orbit', 'day']) {
    get(`${view}-view`).classList.toggle('selected', view === next)
    get(`${view}-view`).setAttribute('aria-selected', String(view === next))
  }
  update()
  scene?.setMode(next)
}
get('orbit-view').onclick = () => setMode('orbit')
get('day-view').onclick = () => setMode('day')
get('zoom-in').onclick = () => scene?.zoom(0.8)
get('zoom-out').onclick = () => scene?.zoom(1.25)
get('reset-camera').onclick = () => scene?.setMode(mode)
const notes = get<HTMLDialogElement>('notes-dialog')
get('notes-button').onclick = () => notes.showModal()
get('close-notes').onclick = () => notes.close()
notes.onclick = event => { if (event.target === notes) notes.close() }
const quiz = get<HTMLDialogElement>('quiz-dialog')
const quizLessons = {
  earth: { questions: quizQuestions, title: 'Πόσο καλά γνωρίζεις τη Γη;', returnLabel: 'Πίσω στη Γη', index: 0, answers: quizQuestions.map((): number | null => null) },
  solar: { questions: solarSystemQuizQuestions, title: 'Πόσο καλά γνωρίζεις το Ηλιακό Σύστημα;', returnLabel: 'Πίσω στο Ηλιακό Σύστημα', index: 0, answers: solarSystemQuizQuestions.map((): number | null => null) },
}
let activeQuiz: (typeof quizLessons)[keyof typeof quizLessons] = quizLessons.earth
let resumeAfterQuiz = false

function renderQuiz(focusQuestion = false) {
  const { questions, index: quizIndex, answers: quizAnswers, returnLabel } = activeQuiz
  const content = get('quiz-content')
  if (quizIndex >= questions.length) {
    const score = scoreQuiz(quizAnswers, questions)
    content.innerHTML = `
      <div class="quiz-result"><span class="quiz-trophy">${icon('trophy')}</span><h3 id="quiz-focus" tabindex="-1">${score === questions.length ? 'Τα ανακάλυψες όλα!' : 'Κάθε απάντηση, μια ανακάλυψη.'}</h3><p class="quiz-score">${score}<span> / ${questions.length}</span></p><p>σωστές απαντήσεις</p></div>
      <ol class="quiz-review">${questions.map((question, index) => `<li><span class="review-icon ${quizAnswers[index] === question.correct ? 'correct' : 'incorrect'}">${icon(quizAnswers[index] === question.correct ? 'circle-check' : 'circle-x')}</span><div><h4>${question.question}</h4><p>${question.choices[question.correct]}</p></div></li>`).join('')}</ol>
      <div class="quiz-actions"><button class="quiz-secondary" id="quiz-return">${icon('globe-2')}${returnLabel}</button><button class="quiz-primary" id="quiz-again">${icon('rotate-ccw')}Ξανά από την αρχή</button></div>`
    get('quiz-again').onclick = () => {
      activeQuiz.index = 0
      activeQuiz.answers = questions.map(() => null)
      renderQuiz(true)
    }
    get('quiz-return').onclick = () => quiz.close()
  } else {
    const question = questions[quizIndex]!
    const answer = quizAnswers[quizIndex]
    const answered = answer !== null
    content.innerHTML = `
      <div class="quiz-progress-label"><span>Ερώτηση ${quizIndex + 1} από ${questions.length}</span><span>Σωστές: ${scoreQuiz(quizAnswers, questions)}</span></div>
      <progress class="quiz-progress" max="${questions.length}" value="${quizIndex + Number(answered)}" aria-label="Πρόοδος κουίζ"></progress>
      <h3 class="quiz-question" id="quiz-focus" tabindex="-1">${question.question}</h3>
      <div class="quiz-choices" role="group" aria-labelledby="quiz-focus">${question.choices.map((choice, index) => {
        const correct = answered && index === question.correct
        const incorrect = answered && index === answer && index !== question.correct
        return `<button class="quiz-choice${correct ? ' correct' : ''}${incorrect ? ' incorrect' : ''}" data-choice="${index}" ${answered ? 'disabled' : ''}><span class="quiz-letter" aria-hidden="true">${['Α', 'Β', 'Γ'][index]}</span><span>${choice}</span>${correct ? icon('circle-check') : incorrect ? icon('circle-x') : ''}</button>`
      }).join('')}</div>
      <div id="quiz-feedback" class="quiz-feedback" role="status" aria-live="polite"></div>
      <div class="quiz-actions"><button class="quiz-secondary" id="quiz-explore">${icon('globe-2')}${returnLabel}</button><button class="quiz-primary" id="quiz-next" ${answered ? '' : 'disabled'}>${quizIndex === questions.length - 1 ? 'Αποτελέσματα' : 'Επόμενη ερώτηση'}${icon('arrow-right')}</button></div>`
    if (answered) {
      get('quiz-feedback').classList.add(answer === question.correct ? 'correct' : 'incorrect')
      get('quiz-feedback').innerHTML = `<strong>${answer === question.correct ? 'Σωστά!' : 'Ας το δούμε μαζί.'}</strong><p>${question.explanation}</p>`
    }
    content.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(button => button.onclick = () => {
      if (quizAnswers[quizIndex] !== null) return
      quizAnswers[quizIndex] = Number(button.dataset.choice)
      renderQuiz()
      get('quiz-next').focus({ preventScroll: true })
    })
    get('quiz-next').onclick = () => {
      if (quizAnswers[quizIndex] === null) return
      activeQuiz.index++
      renderQuiz(true)
    }
    get('quiz-explore').onclick = () => quiz.close()
  }
  refreshIcons()
  if (focusQuestion) {
    quiz.scrollTop = 0
    get('quiz-focus').focus({ preventScroll: true })
  }
}

get('quiz-button').onclick = () => {
  activeQuiz = solarSystemView.hidden ? quizLessons.earth : quizLessons.solar
  get('quiz-title').textContent = activeQuiz.title
  resumeAfterQuiz = playing
  setPlaying(false)
  quiz.showModal()
  renderQuiz(true)
}
get('close-quiz').onclick = () => quiz.close()
quiz.onclick = event => { if (event.target === quiz) quiz.close() }
quiz.addEventListener('close', () => {
  if (resumeAfterQuiz) setPlaying(true)
  resumeAfterQuiz = false
})
get('present-button').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch { document.body.classList.toggle('presentation') }
}
document.addEventListener('fullscreenchange', () => {
  get('present-button').innerHTML = `${icon(document.fullscreenElement ? 'minimize-2' : 'maximize-2')}<span>${document.fullscreenElement ? 'Έξοδος' : 'Παρουσίαση'}</span>`
  get('present-button').setAttribute('aria-label', document.fullscreenElement ? 'Έξοδος από την παρουσίαση' : 'Έναρξη παρουσίασης')
  refreshIcons()
})
window.addEventListener('keydown', event => {
  if (event.code === 'Space' && !['INPUT', 'SELECT', 'BUTTON'].includes((event.target as HTMLElement).tagName) && !notes.open && !quiz.open) { event.preventDefault(); setPlaying(!playing) }
})

let previous = 0
let lastUpdate = 0
function animate(time: number) {
  const delta = previous ? Math.min((time - previous) / 1000, 0.1) : 0
  previous = time
  if (playing) {
    if (mode === 'orbit') day = (day + delta * 8 / orbitTimeBalance * speed) % 365
    scene?.rotateEarth(delta * speed * (mode === 'day' ? 0.4 : 1.2 * orbitTimeBalance))
    if (time - lastUpdate > 100) { update(); lastUpdate = time }
  }
  if (solarMotionPlaying && !solarSystemView.hidden) {
    solarScene?.render(delta, solarSpeed)
  } else if (solarScene && !solarSystemView.hidden) {
    solarScene.render(delta, 0)
  }
  scene?.render(delta)
  requestAnimationFrame(animate)
}
update()
requestAnimationFrame(animate)
