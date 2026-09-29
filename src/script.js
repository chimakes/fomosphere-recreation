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
camera.position.set(0, 3.5, - 15)
scene.add(camera)

// // camera position debug
// gui.add(camera.position, 'x').min(-10).max(10).step(1).name('cameraX')
// gui.add(camera.position, 'y').min(-10).max(10).step(0.1).name('cameraY')
// gui.add(camera.position, 'z').min(-10).max(10).step(1).name('cameraZ')

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
    uPositionFrequency: new THREE.Uniform(0.28),
    uTimeFrequency: new THREE.Uniform(0.0),
    uStrength: new THREE.Uniform(0.3),
    uTwistAmplitude: new THREE.Uniform(0.32),
    uTwistFrequency: new THREE.Uniform(1.5)
}

// sphere
let geometry = new THREE.IcosahedronGeometry(2.5, 200)
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
gui.add(uniforms.uTwistAmplitude, 'value', -3, 3, 0.001).name('uTwistAmplitude')
gui.add(uniforms.uTwistFrequency, 'value', -3, 3, 0.001).name('uTwistFrequency')

const sphere = new THREE.Mesh(geometry, material)
sphere.customDepthMaterial = depthMaterial
sphere.receiveShadow = true
sphere.castShadow = true
sphere.rotation.x = Math.PI / 2
// sphere.rotation.y = - Math.PI / 9
sphere.rotation.z = - Math.PI / 2
scene.add(sphere)


// // axis helper
// // world
// const worldAxes = new THREE.AxesHelper(3);
// worldAxes.position.x = -7
// scene.add(worldAxes);

// // local
// const localAxes = new THREE.AxesHelper(5);
// sphere.add(localAxes);

// test plane
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 15),
    new THREE.MeshStandardMaterial()
)
plane.receiveShadow = true
plane.rotation.y = Math.PI
plane.position.y = - 5
plane.position.z = 5
// scene.add(plane)






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

    // console.log(camera.position)

    // update materials
    uniforms.uTime.value = elapsedTime

    controls.update()

    renderer.render(scene, camera)
}

renderer.setAnimationLoop(tick)
