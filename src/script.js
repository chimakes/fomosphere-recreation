import * as THREE from 'three'
import Debug from './Debug.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import gsap from 'gsap'
import fomosphereVertexShader from './shaders/fomosphere/vertex.glsl'
import fomosphereFragmentShader from './shaders/fomosphere/fragment.glsl'

const canvas = document.querySelector('canvas.webgl')

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene()


// Loaders
const rgbeLoader = new RGBELoader()


// Camera
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 3.5, - 15)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.9
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Fomosphere
 */
// Color Palettes
const debugPalette = {
    color1: '#81d8fe',
    color2: '#bb00ff',
    color3: '#9514ff',
    color4: '#e9ffc2',
}
let palette = [
    new THREE.Color(debugPalette.color1),
    new THREE.Color(debugPalette.color2),
    new THREE.Color(debugPalette.color3),
    new THREE.Color(debugPalette.color4),
]

// convert color to threejs color
palette = palette.map((color) => new THREE.Color(color))

const uniforms = {
    uTime: new THREE.Uniform(0),
    uPositionFrequency: new THREE.Uniform(0.24),
    uTimeFrequency: new THREE.Uniform(0.24),
    uStrength: new THREE.Uniform(0.31),
    uTwistAmplitude: new THREE.Uniform(-0.32),
    uTwistFrequency: new THREE.Uniform(0.5),
    uAmplitudeSpeed: new THREE.Uniform(0.5),

    uWaveMin: new THREE.Uniform(0.41),
    uWaveMax: new THREE.Uniform(0.63),

    uColorFrequency: new THREE.Uniform(0.32),
    uDisplacementInfluence: new THREE.Uniform(0.13),
    uColor: { value: palette },

    uColor1Start: { value: 0.37 },
    uColor1End: { value: 1.0 },
    uColor2Start: { value: 0.0 },
    uColor2End: { value: 0.21 },
    uColor3Start: { value: 0.15 },
    uColor3End: { value: 0.16 },
    uColor4Start: { value: 0.0 },
    uColor4End: { value: 0.0 },
}

new Debug(uniforms, palette)


// twist animation
gsap.to(uniforms.uTwistAmplitude, {
    value: -0.837,
    duration: 2.5,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
})

gsap.to(uniforms.uTwistFrequency, {
    value: 1.575,
    duration: 2.0,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
})

// sphere
let geometry = new THREE.IcosahedronGeometry(2.5, 200)
geometry = mergeVertices(geometry)
geometry.computeTangents()

const material = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: fomosphereVertexShader,
    fragmentShader: fomosphereFragmentShader,
    uniforms: uniforms,

    // MeshStandardMaterial
    metalness: 0.9,
    roughness: 0.55,
    color: '#ffffff'
})
const depthMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshDepthMaterial,
    vertexShader: fomosphereVertexShader,
    uniforms: uniforms,

    // MeshDepthMaterial for shadow
    depthPacking: THREE.RGBADepthPacking
})




const sphere = new THREE.Mesh(geometry, material)
sphere.customDepthMaterial = depthMaterial
sphere.receiveShadow = true
sphere.castShadow = true
sphere.rotation.x = 2.71
sphere.rotation.y = 0.098
sphere.rotation.z = - 0.83
scene.add(sphere)




// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, - 2.25)
scene.add(directionalLight)


rgbeLoader.load('./urban_alley_01_1k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = new THREE.Color('#75B7C0')
    scene.environment = environmentMap
})



// Resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


// Animate
const timer = new THREE.Timer()
timer.connect(document)

const tick = () => {
    timer.update()

    const elapsedTime = timer.getElapsed()

    // update materials
    uniforms.uTime.value = elapsedTime

    controls.update()

    renderer.render(scene, camera)
}

renderer.setAnimationLoop(tick)
