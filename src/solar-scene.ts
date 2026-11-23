import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { solarSystemPlanets } from './solar-system.ts'
import { addStarfield, addSun } from './scene-atmosphere.ts'

const planetRadii: Record<string, number> = {
  mercury: 0.25,
  venus: 0.37,
  earth: 0.39,
  mars: 0.31,
  jupiter: 0.73,
  saturn: 0.64,
  uranus: 0.53,
  neptune: 0.52,
}

const planetBands: Record<string, string[]> = {
  mercury: ['#716a65', '#a69b90', '#827970', '#b0a59a'],
  venus: ['#c3955f', '#e3c18e', '#d2ab75', '#ead3a6'],
  mars: ['#91442f', '#c46b48', '#a95138', '#d17b54'],
  jupiter: ['#ab7454', '#e2c29b', '#c48b68', '#ead3ad'],
  saturn: ['#ac966f', '#e4d2a6', '#c0a979', '#e9dcb8'],
  uranus: ['#64aeb8', '#9cdae0', '#76c0c9', '#b2e3e3'],
  neptune: ['#3656ac', '#6688df', '#496bc5', '#7798e6'],
}

function surfaceTexture(id: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext('2d')!
  const bands = planetBands[id]!
  let seed = id.length * 9271
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }

  for (let band = 0; band < 24; band++) {
    context.fillStyle = bands[Math.floor(random() * bands.length)]!
    const y = band * canvas.height / 24
    const height = canvas.height / 24 + 1
    context.fillRect(0, y, canvas.width, height)
    if (id === 'mercury' || id === 'mars') {
      for (let mark = 0; mark < 14; mark++) {
        const x = random() * canvas.width
        const markY = y + random() * height
        context.globalAlpha = 0.08 + random() * 0.15
        context.fillStyle = random() > 0.5 ? '#fff1d2' : '#34251f'
        context.beginPath()
        context.ellipse(x, markY, 2 + random() * 8, 1 + random() * 4, 0, 0, Math.PI * 2)
        context.fill()
      }
    }
  }
  context.globalAlpha = 1
  if (id === 'jupiter') {
    context.fillStyle = '#ad5742'
    context.beginPath()
    context.ellipse(350, 150, 25, 12, -0.12, 0, Math.PI * 2)
    context.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function createSolarScene(container: HTMLElement, onSelect: (id: string) => void) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#101a20')
  scene.fog = new THREE.FogExp2('#101a20', 0.004)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 180)
  camera.position.set(0, 29, 11)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3
  renderer.domElement.setAttribute('aria-label', 'Διαδραστικό τρισδιάστατο μοντέλο του Ηλιακού Συστήματος')
  renderer.domElement.tabIndex = 0
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 13
  controls.maxDistance = 48
  scene.add(new THREE.AmbientLight('#b4d6ed', 0.3))
  const sun = addSun(scene, 1.15, 6)
  addStarfield(scene)

  const orbitGroup = new THREE.Group()
  scene.add(orbitGroup)
  const planetGroup = new THREE.Group()
  scene.add(planetGroup)
  const planetMeshes = new Map<string, THREE.Mesh>()
  const planetPivots = new Map<string, { group: THREE.Group; baseAngle: number; currentAngle: number; orbitRadius: number; rate: number }>()
  const selectionRings = new Map<string, THREE.Mesh>()
  const orbitLines = new Map<string, THREE.LineLoop>()
  let selectedId = 'earth'
  let orbitSpacing = 1

  for (const planet of solarSystemPlanets) {
    const radius = planet.orbitRadius * 25
    const points = Array.from({ length: 193 }, (_, index) => {
      const angle = index / 192 * Math.PI * 2
      return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
    })
    const orbit = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: planet.id === 'earth' ? '#88b6a2' : '#627a77', transparent: true, opacity: planet.id === 'earth' ? 0.56 : 0.32 }),
    )
    orbitGroup.add(orbit)
    orbitLines.set(planet.id, orbit)

    const pivot = new THREE.Group()
    pivot.rotation.y = -planet.orbitAngle * Math.PI / 180
    planetGroup.add(pivot)
    const system = new THREE.Group()
    system.position.x = radius
    pivot.add(system)
    const material = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.88,
      metalness: 0,
    })
    if (planet.id !== 'earth') material.map = surfaceTexture(planet.id)
    const geometry = new THREE.SphereGeometry(planetRadii[planet.id]!, 48, 32)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData.planetId = planet.id
    system.add(mesh)
    planetMeshes.set(planet.id, mesh)

    if (planet.id === 'earth') {
      new THREE.TextureLoader().load('/textures/earth.jpg', texture => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
        material.map = texture
        material.needsUpdate = true
        container.dataset.earthTexture = 'loaded'
      }, undefined, () => { container.dataset.earthTexture = 'fallback' })
    }

    if (planet.id === 'saturn') {
      const rings = new THREE.Mesh(
        new THREE.RingGeometry(planetRadii.saturn! * 1.2, planetRadii.saturn! * 1.85, 64),
        new THREE.MeshStandardMaterial({ color: '#cfb986', side: THREE.DoubleSide, transparent: true, opacity: 0.82, roughness: 1 }),
      )
      rings.rotation.x = -Math.PI / 2
      rings.rotation.z = -0.16
      system.add(rings)
    }

    const highlight = new THREE.Mesh(
      new THREE.RingGeometry(planetRadii[planet.id]! * 1.42, planetRadii[planet.id]! * 1.5, 48),
      new THREE.MeshBasicMaterial({ color: '#ffe6a4', side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    )
    highlight.rotation.x = -Math.PI / 2
    highlight.visible = planet.id === selectedId
    system.add(highlight)
    selectionRings.set(planet.id, highlight)

    planetPivots.set(planet.id, {
      group: pivot,
      baseAngle: -planet.orbitAngle * Math.PI / 180,
      currentAngle: 0,
      orbitRadius: radius,
      rate: Math.pow(0.19 / planet.orbitRadius, 1.5),
    })
  }

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  function planetAtPointer(event: MouseEvent) {
    pointer.x = event.offsetX / renderer.domElement.clientWidth * 2 - 1
    pointer.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    return raycaster.intersectObjects([...planetMeshes.values()])[0]
  }
  renderer.domElement.addEventListener('pointermove', event => {
    renderer.domElement.style.cursor = planetAtPointer(event) ? 'pointer' : ''
  })
  renderer.domElement.addEventListener('pointerleave', () => {
    renderer.domElement.style.cursor = ''
  })
  renderer.domElement.addEventListener('click', event => {
    const hit = planetAtPointer(event)
    if (hit?.object.userData.planetId) onSelect(hit.object.userData.planetId as string)
  })

  const resize = () => {
    const width = container.clientWidth
    const height = container.clientHeight
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()
  controls.target.set(0, 0, 0)
  controls.update()

  return {
    render(delta: number, speed: number) {
      sun.update(delta)
      if (speed) {
        for (const planet of solarSystemPlanets) {
          const pivot = planetPivots.get(planet.id)!
          pivot.currentAngle += delta * speed * 0.18 * pivot.rate
          pivot.group.rotation.y = pivot.baseAngle + pivot.currentAngle
          const system = pivot.group.children[0]!
          system.position.x = pivot.orbitRadius * orbitSpacing
        }
      }
      controls.update()
      renderer.render(scene, camera)
    },
    selectPlanet(id: string) {
      selectedId = id
      for (const [planetId, ring] of selectionRings) ring.visible = planetId === id
    },
    setPlanetScale(value: number) {
      sun.setScale(value)
      for (const mesh of planetMeshes.values()) mesh.parent?.scale.setScalar(value)
    },
    setOrbitSpacing(value: number) {
      orbitSpacing = value
      for (const [id, pivot] of planetPivots) {
        pivot.group.children[0]!.position.x = pivot.orbitRadius * orbitSpacing
        orbitLines.get(id)!.scale.setScalar(orbitSpacing)
      }
    },
    setPerspective(value: boolean) {
      camera.position.set(0, value ? 17 : 29, value ? 25 : 11)
      camera.up.set(0, 1, 0)
      camera.lookAt(controls.target)
      controls.update()
    },
    dispose() {
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      container.replaceChildren()
    },
  }
}