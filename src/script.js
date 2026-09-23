import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import GUI from 'lil-gui'
import fomosphereVertexShader from './shaders/fomosphere/vertex.glsl'
import fomosphereFragmentShader from './shaders/fomosphere/fragment.glsl'

const gui = new GUI({ width: 340 })
const debugObject = {}

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
camera.position.set(13, - 3, - 5)
// camera.position.set(-0.48, 7.09, - 12.345)
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
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)



/**
 * Fomosphere
 */
const uniforms = {
    uTime: new THREE.Uniform(0),
    uPositionFrequency: new THREE.Uniform(0.38),
    uTimeFrequency: new THREE.Uniform(0.4),
    uStrength: new THREE.Uniform(0.5),
}

// sphere
let geometry = new THREE.IcosahedronGeometry(2.5, 50)
geometry = mergeVertices(geometry)
geometry.computeTangents()
// console.log(geometry.attributes)

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

// material tweak debug
gui.add(material, 'metalness', 0, 1, 0.001)
gui.add(material, 'roughness', 0, 1, 0.001)

gui.add(uniforms.uPositionFrequency, 'value', 0, 2, 0.001).name('uPositionFrequency')
gui.add(uniforms.uTimeFrequency, 'value', 0, 2, 0.001).name('uTimeFrequency')
gui.add(uniforms.uStrength, 'value', 0, 2, 0.001).name('uStrength')

const sphere = new THREE.Mesh(geometry, material)
sphere.customDepthMaterial = depthMaterial
sphere.receiveShadow = true
sphere.castShadow = true
scene.add(sphere)

// test plane
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 15),
    new THREE.MeshStandardMaterial()
)
plane.receiveShadow = true
plane.rotation.y = Math.PI
plane.position.y = - 5
plane.position.z = 5
scene.add(plane)






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
