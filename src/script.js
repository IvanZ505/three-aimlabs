import * as THREE from 'three'
import * as dat from 'lil-gui'

const gui = new dat.GUI()

THREE.ColorManagement.enabled = false

// Textures Loader
const textureLoader = new THREE.TextureLoader()

const backgroundTexture = textureLoader.load("textures/Abstract_006_SD/Abstract_006_COLOR.jpg")
const backgroundTextureDisplacement = textureLoader.load("textures/Abstract_006_SD/Abstract_006_DISP.png")
const backgroundTextureOCC = textureLoader.load("textures/Abstract_006_SD/Abstract_006_OCC.jpg")
const backgroundTextureNorm = textureLoader.load("textures/Abstract_006_SD/Abstract_006_NORM.jpg")

// backgroundTexture.mapping = THREE.MirroredRepeatWrapping


const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
scene.background = backgroundTexture
console.log(scene.background)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


// Objects
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Raycaster
const raycaster = new THREE.Raycaster()



// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const light = new THREE.PointLight( 0xffffff, 15, 100 );
light.position.set( 1, 1, 1);
scene.add( light );

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()