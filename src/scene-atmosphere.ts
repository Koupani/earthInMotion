import * as THREE from 'three'

export function addSun(scene: THREE.Scene, radius = 2.45, glowScale = 12) {
  scene.add(new THREE.PointLight('#fff3d4', 65, 0, 1.1))
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 positionOnSun; varying vec3 viewNormal; varying vec3 viewDirection;
      void main() { positionOnSun = position; vec4 viewPosition = modelViewMatrix * vec4(position, 1.0); viewNormal = normalize(normalMatrix * normal); viewDirection = normalize(-viewPosition.xyz); gl_Position = projectionMatrix * viewPosition; }`,
    fragmentShader: `varying vec3 positionOnSun; varying vec3 viewNormal; varying vec3 viewDirection; uniform float time;
      float noise(vec3 point) { return sin(point.x * 19.0 + sin(point.y * 23.0)) * sin(point.y * 21.0 + sin(point.z * 17.0)) * sin(point.z * 26.0 + point.x * 7.0); }
      void main() { vec3 point = positionOnSun + vec3(time * 0.015); float grain = noise(point) * 0.5 + noise(point * 2.6) * 0.25; float edge = pow(max(dot(viewNormal, viewDirection), 0.0), 0.45); vec3 color = mix(vec3(1.0, 0.26, 0.025), vec3(1.0, 0.77, 0.27), edge); color += grain * 0.13; gl_FragColor = vec4(color, 1.0); }`,
  })
  const sunSphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), material)
  scene.add(sunSphere)

  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = glowCanvas.height = 256
  const context = glowCanvas.getContext('2d')!
  const gradient = context.createRadialGradient(128, 128, 35, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255,190,65,0.38)')
  gradient.addColorStop(0.4, 'rgba(255,144,25,0.13)')
  gradient.addColorStop(1, 'rgba(255,120,20,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), blending: THREE.AdditiveBlending, depthWrite: false }))
  glow.scale.set(glowScale, glowScale, 1)
  scene.add(glow)

  return {
    update: (delta: number) => { material.uniforms.time!.value += delta },
    setScale(value: number) {
      sunSphere.scale.setScalar(value)
      glow.scale.set(glowScale * value, glowScale * value, 1)
    },
  }
}

export function addStarfield(scene: THREE.Scene) {
  const stars = new Float32Array(1050 * 3)
  let seed = 827
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let index = 0; index < stars.length; index += 3) {
    const angle = random() * Math.PI * 2
    const height = random() * 2 - 1
    const radius = 65 + random() * 25
    stars[index] = radius * Math.sqrt(1 - height * height) * Math.cos(angle)
    stars[index + 1] = radius * height
    stars[index + 2] = radius * Math.sqrt(1 - height * height) * Math.sin(angle)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(stars, 3))
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#b2c9cb', size: 0.065, transparent: true, opacity: 0.65, sizeAttenuation: true })))
}