import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { regionPosition, regions } from './regions'
import { addStarfield, addSun } from './scene-atmosphere.ts'
import type { Region } from './regions'

type LabelCallback = (id: string, x: number, y: number, visible: boolean) => void

export function createScene(container: HTMLElement, label: LabelCallback) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#101a20')
  scene.fog = new THREE.FogExp2('#101a20', 0.008)
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 250)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3
  container.appendChild(renderer.domElement)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 4
  controls.maxDistance = 75
  controls.maxPolarAngle = Math.PI * 0.85
  scene.add(new THREE.AmbientLight('#b4d6ed', 0.3))
  const sun = addSun(scene)
  addStarfield(scene)
  const orbitGroup = new THREE.Group()
  const orbitPoints: THREE.Vector3[] = []
  for (let index = 0; index <= 256; index++) {
    const angle = index / 256 * Math.PI * 2
    orbitPoints.push(new THREE.Vector3(Math.cos(angle) * 11, 0, Math.sin(angle) * 11))
  }
  orbitGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints), new THREE.LineBasicMaterial({ color: '#6b8f8d', transparent: true, opacity: 0.5 })))
  const outerOrbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints.map(point => point.clone().multiplyScalar(1.035))), new THREE.LineDashedMaterial({ color: '#64817e', dashSize: 0.06, gapSize: 0.27, transparent: true, opacity: 0.28 }))
  outerOrbit.computeLineDistances()
  orbitGroup.add(outerOrbit)
  scene.add(orbitGroup)
  const earthPosition = new THREE.Group()
  const tiltedEarth = new THREE.Group()
  earthPosition.add(tiltedEarth)
  scene.add(earthPosition)
  const earthMaterial = new THREE.MeshPhongMaterial({ color: '#ffffff', shininess: 18, specular: new THREE.Color('#25485c') })
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1.28, 64, 48), earthMaterial)
  let homeRotation = THREE.MathUtils.degToRad(-90 - regions[0]!.longitude)
  earth.rotation.y = homeRotation
  tiltedEarth.add(earth)
  const cityPosition = regionPosition(regions[0]!, 1.31)
  const rotationAxis = new THREE.Vector3(0, 1, 0)
  let targetEarthRotation = homeRotation
  let rotatingToRegion = false
  const cityMarker = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffe6a4' }))
  cityMarker.position.copy(cityPosition)
  earth.add(cityMarker)
  new THREE.TextureLoader().load('/textures/earth.jpg', texture => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    earthMaterial.map = texture
    earthMaterial.needsUpdate = true
    container.dataset.texture = 'loaded'
  }, undefined, () => { earthMaterial.color.set('#287fa3'); container.dataset.texture = 'failed' })
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.315, 48, 32), new THREE.ShaderMaterial({
    vertexShader: `varying vec3 viewNormal; varying vec3 viewDirection; void main() { vec4 pos = modelViewMatrix * vec4(position, 1.0); viewNormal = normalize(normalMatrix * normal); viewDirection = normalize(-pos.xyz); gl_Position = projectionMatrix * pos; }`,
    fragmentShader: `varying vec3 viewNormal; varying vec3 viewDirection; void main() { float strength = pow(1.0 - abs(dot(viewNormal, viewDirection)), 4.0); gl_FragColor = vec4(0.25, 0.66, 1.0, strength * 0.55); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }))
  tiltedEarth.add(atmosphere)
  const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -2.1, 0), new THREE.Vector3(0, 2.3, 0)]), new THREE.LineDashedMaterial({ color: '#b8ecdb', dashSize: 0.14, gapSize: 0.09 }))
  axis.computeLineDistances()
  tiltedEarth.add(axis)
  const equatorPoints = Array.from({ length: 129 }, (_, index) => new THREE.Vector3(Math.cos(index / 128 * Math.PI * 2) * 1.293, 0, Math.sin(index / 128 * Math.PI * 2) * 1.293))
  tiltedEarth.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(equatorPoints), new THREE.LineBasicMaterial({ color: '#f5d79f', transparent: true, opacity: 0.32 })))
  const ghosts = new THREE.Group()
  for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), new THREE.MeshBasicMaterial({ color: '#9ab6b0', wireframe: true, transparent: true, opacity: 0.28 }))
    ghost.position.set(Math.cos(angle) * 11, 0, Math.sin(angle) * 11)
    ghosts.add(ghost)
  }
  orbitGroup.add(ghosts)
  const rays = new THREE.Group()
  const rayMaterial = new THREE.LineDashedMaterial({ color: '#eed798', transparent: true, opacity: 0.32, dashSize: 0.2, gapSize: 0.18 })
  for (const offset of [-0.65, 0, 0.65]) {
    const ray = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(2.8, offset, 0), new THREE.Vector3(9.5, offset, 0)]), rayMaterial)
    ray.computeLineDistances()
    rays.add(ray)
  }
  scene.add(rays)
  let mode: 'orbit' | 'day' = 'orbit'
  let currentAngle = 0
  let orbitVisible = true
  let transitioning = false
  const targetCamera = new THREE.Vector3()
  const targetFocus = new THREE.Vector3()
  const lastEarthPosition = new THREE.Vector3()
  const screenPoint = new THREE.Vector3()
  let width = 1
  let height = 1
  const resize = () => {
    width = container.clientWidth
    height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    if (mode === 'orbit' && !transitioning) setMode('orbit', true)
  }
  new ResizeObserver(resize).observe(container)
  resize()
  function setMode(next: 'orbit' | 'day', immediate = false) {
    mode = next
    if (mode === 'orbit') {
      targetCamera.set(0, 24, 30)
      const fitDistance = 14.5 / (Math.tan(camera.fov * Math.PI / 360) * camera.aspect)
      targetCamera.setLength(Math.max(targetCamera.length(), fitDistance))
      targetFocus.set(0, 0, 0)
      controls.minDistance = 20
      controls.maxDistance = 75
    } else {
      targetFocus.copy(earthPosition.position)
      earth.updateWorldMatrix(true, false)
      const cityAtTargetRotation = cityPosition.clone().applyAxisAngle(rotationAxis, rotatingToRegion ? targetEarthRotation : earth.rotation.y)
      const cityDirection = tiltedEarth.localToWorld(cityAtTargetRotation).sub(targetFocus).normalize()
      targetCamera.copy(targetFocus).addScaledVector(cityDirection, 7.8)
      controls.minDistance = 3.8
      controls.maxDistance = 18
    }
    if (immediate) { camera.position.copy(targetCamera); controls.target.copy(targetFocus) }
    transitioning = !immediate
    orbitGroup.visible = orbitVisible && mode === 'orbit'
    rays.visible = mode === 'orbit'
    lastEarthPosition.copy(earthPosition.position)
  }
  function positionLabel(id: string, point: THREE.Vector3, visible = true) {
    screenPoint.copy(point).project(camera)
    const x = (screenPoint.x * 0.5 + 0.5) * width
    const y = (-screenPoint.y * 0.5 + 0.5) * height
    label(id, x, y, visible && screenPoint.z < 1 && x > 24 && x < width - 24 && y > 65 && y < height - 45)
  }
  setMode('orbit', true)
  controls.addEventListener('start', () => { transitioning = false })
  return {
    setState(longitude: number, tilt: number) {
      currentAngle = Math.PI / 2 - longitude
      earthPosition.position.set(Math.cos(currentAngle) * 11, 0, Math.sin(currentAngle) * 11)
      tiltedEarth.rotation.z = tilt * Math.PI / 180
      rays.rotation.y = -currentAngle
      if (mode === 'day') {
        const movement = earthPosition.position.clone().sub(lastEarthPosition)
        camera.position.add(movement)
        controls.target.add(movement)
        targetCamera.add(movement)
        targetFocus.add(movement)
      }
      lastEarthPosition.copy(earthPosition.position)
    },
    setMode,
    focusRegion(region: Region) {
      cityPosition.copy(regionPosition(region, 1.31))
      cityMarker.position.copy(cityPosition)
      tiltedEarth.updateWorldMatrix(true, false)
      const localCamera = tiltedEarth.worldToLocal(camera.position.clone())
      homeRotation = Math.atan2(localCamera.x, localCamera.z) - THREE.MathUtils.degToRad(90 + region.longitude)
      const difference = homeRotation - earth.rotation.y
      targetEarthRotation = earth.rotation.y + Math.atan2(Math.sin(difference), Math.cos(difference))
      rotatingToRegion = true
      if (mode === 'day') setMode('day')
    },
    setOrbitVisible(visible: boolean) { orbitVisible = visible; orbitGroup.visible = visible && mode === 'orbit' },
    rotateEarth(amount: number) { if (!rotatingToRegion) earth.rotation.y += amount },
    resetRotation() {
      earth.rotation.y = homeRotation
      targetEarthRotation = homeRotation
      rotatingToRegion = false
      if (mode === 'day') setMode('day')
    },
    zoom(factor: number) {
      transitioning = false
      const offset = camera.position.clone().sub(controls.target)
      offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance))
      camera.position.copy(controls.target).add(offset)
    },
    render(delta: number) {
      sun.update(delta)
      if (rotatingToRegion) {
        earth.rotation.y = THREE.MathUtils.damp(earth.rotation.y, targetEarthRotation, 5, delta)
        if (Math.abs(earth.rotation.y - targetEarthRotation) < 0.001) {
          earth.rotation.y = targetEarthRotation
          rotatingToRegion = false
        }
      }
      if (transitioning) {
        const blend = 1 - Math.exp(-delta * 5)
        camera.position.lerp(targetCamera, blend)
        controls.target.lerp(targetFocus, blend)
        if (camera.position.distanceTo(targetCamera) < 0.02) {
          camera.position.copy(targetCamera)
          controls.target.copy(targetFocus)
          transitioning = false
        }
      }
      controls.update()
      scene.updateMatrixWorld()
      positionLabel('sun-label', new THREE.Vector3(0, -3.3, 0), mode === 'orbit')
      positionLabel('earth-label', earthPosition.position.clone().add(new THREE.Vector3(0, -1.95, 0)))
      positionLabel('axis-label', tiltedEarth.localToWorld(new THREE.Vector3(0, 2.8, 0)))
      const cityWorldPosition = earth.localToWorld(cityPosition.clone())
      const cityNormal = cityWorldPosition.clone().sub(earthPosition.position).normalize()
      const towardCamera = camera.position.clone().sub(cityWorldPosition).normalize()
      positionLabel('city-label', cityWorldPosition.add(new THREE.Vector3(0, 0.32, 0)), mode === 'day' && cityNormal.dot(towardCamera) > 0.1)
      positionLabel('march-label', new THREE.Vector3(0, 0, 13), mode === 'orbit' && orbitVisible)
      positionLabel('june-label', new THREE.Vector3(13.5, 0, 0), mode === 'orbit' && orbitVisible && Math.abs(currentAngle) > 0.3)
      positionLabel('september-label', new THREE.Vector3(0, 0, -13), mode === 'orbit' && orbitVisible)
      positionLabel('december-label', new THREE.Vector3(-13.5, 0, 0), mode === 'orbit' && orbitVisible)
      renderer.render(scene, camera)
    },
  }
}