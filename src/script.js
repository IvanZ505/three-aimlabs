import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const gui = new dat.GUI()
const debugItems = {}

debugItems.addFlyingSphere = () => {
    addFlyingSphere(
        {
            x: (Math.random() - 0.5) * 1,
            y: (Math.random() - 0.5) *1,
            z: -10
        }
    )
}
gui.add(debugItems, 'addFlyingSphere')

// Reset objects
debugItems.reset = () => {
    for(const objects of objToUpdate) {
        scene.remove(objects)
    }
}

gui.add(debugItems, 'reset')


THREE.ColorManagement.enabled = false

// Textures Loader
const textureLoader = new THREE.TextureLoader()

const backgroundTexture = textureLoader.load("background.jpg")
const backgroundTextureDisplacement = textureLoader.load("textures/Abstract_006_SD/Abstract_006_DISP.png")
const backgroundTextureOCC = textureLoader.load("textures/Abstract_006_SD/Abstract_006_OCC.jpg")
const backgroundTextureNorm = textureLoader.load("textures/Abstract_006_SD/Abstract_006_NORM.jpg")

backgroundTexture.mapping = THREE.MirroredRepeatWrapping


const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
scene.background = backgroundTexture
// console.log(scene.background)

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

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Objects
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Raycaster
const raycaster = new THREE.Raycaster()
var pointer = new THREE.Vector2()

// Get Client x and y
window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / sizes.width) * 2 -1
    pointer.y = -(e.clientY / sizes.width) * 2 -1

    // console.log(pointer.x, pointer.y)
})

// raycaster.set(new THREE.Vector3(-3,0,0), (new THREE.Vector3(1, 0, 0)).normalize())


// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight( 0xffffff, 15, 100 );
pointLight.position.set(0, 0 , 2);
scene.add( pointLight );

// Defaults
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({color: 0xff0000})
const objToUpdate = []

// Functions

const addFlyingSphere = (position) => {
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
    )
    mesh.position.copy(position)
    objToUpdate.push(mesh)
    scene.add(mesh)
    mesh.updateMatrixWorld()
    console.log(objToUpdate)
}

// Cam controls
// const orbitControls = new OrbitControls(camera, canvas)
// orbitControls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const clock = new THREE.Clock()

const tick = () => {


    const elapsedTime = clock.getElapsedTime()

    for(const obj of objToUpdate) {
        obj.position.z += elapsedTime/1000
    }

    // Update raycaster

    // console.log(scene.children)
    raycaster.setFromCamera(pointer, camera)

    console.log(raycaster.ray.direction)
    const intersects = raycaster.intersectObjects( objToUpdate );

	for ( let i = 0; i < intersects.length; i ++ ) {

		intersects[ i ].object.material.color.set( 0xfff000 );

	}
    

    renderer.render(scene, camera)
    // orbitControls.update(camera)
    window.requestAnimationFrame(tick)
}

tick()