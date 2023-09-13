import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Debug
const gui = new dat.GUI()
const debugItems = {}

var stop = false

debugItems.addFlyingSphere = () => {
    addFlyingSphere(
        {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) *10,
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

// Stop the game
debugItems.stop = () => {
    stop = true
    console.log(stop)
}

gui.add(debugItems, 'stop')

THREE.ColorManagement.enabled = false


/**
 * 
 * Global Variables
 * 
 * Get user preferred speeds and difficulty
 * 
 * Also, keep track of clocks and different necessary arrays
 */


const difficulties = []

// Time
var previousTime = 0
var gameTime = 60
var elapsedTimeBetweenGameTimes = 0
var gamePrevousTime = 60

const objToUpdate = []

console.log(document.querySelector("div.popup"))


// Scorekeeping

var score = 0
var missed = 0

// Textures Loader
const textureLoader = new THREE.TextureLoader()

const backgroundTexture = textureLoader.load("background.jpg")
// const backgroundTextureDisplacement = textureLoader.load("textures/Abstract_006_SD/Abstract_006_DISP.png")
// const backgroundTextureOCC = textureLoader.load("textures/Abstract_006_SD/Abstract_006_OCC.jpg")
// const backgroundTextureNorm = textureLoader.load("textures/Abstract_006_SD/Abstract_006_NORM.jpg")

// backgroundTexture.mapping = THREE.MirroredRepeatWrapping


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

// Test Objects
const test = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

test.updateMatrixWorld()

// scene.add(test)

var mouse = new THREE.Vector2()

// Get Client x and y
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / sizes.width *2 - 1
    mouse.y = -(e.clientY / sizes.height *2 -1)
    // console.log(mouse)
})

var objectHovered = null
window.addEventListener('click', () => {
    if(objectHovered != null) {
        for(const item of scene.children) {
            // console.log(item)
            if(item.id == objectHovered.object.id) {
                scene.remove(item)
                score++
            }
        }
        
    }
})

// Raycaster
const raycaster = new THREE.Raycaster()
raycaster.set(new THREE.Vector3(-3,0,0), (new THREE.Vector3(1, 0, 0)).normalize())

// Raycaster helper
const arrow = new THREE.ArrowHelper()
arrow.setLength(100)
arrow.setColor(0xff0013)
// scene.add(arrow)


// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight( 0xffffff, 15, 100 );
pointLight.position.set(0, 0 , 2);
scene.add( pointLight );

// Defaults
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)

// Functions

const addFlyingSphere = (position) => {
    const mesh = new THREE.Mesh(
        sphereGeometry,
        new THREE.MeshStandardMaterial({color: 0xff0000})

    )
    mesh.position.copy(position)
    objToUpdate.push(mesh)
    mesh.updateMatrixWorld()

    scene.add(mesh)
    // console.log(objToUpdate)
}

const startGame = () => {
        addFlyingSphere({
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) *10,
            z: -10
        })
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

    if(!stop && gameTime <= 0) {
        stop = true
        document.getElementById("timer").innerHTML = "Game Over!"
        document.querySelector("div.popup").style.display = "content"
    }
    if(!stop) { 
        gameTime = 60 - elapsedTime
        elapsedTimeBetweenGameTimes = gamePrevousTime - gameTime

        // Add difficulty multiplier
        if(elapsedTimeBetweenGameTimes >= 0.5 && gameTime > 0) {
            gamePrevousTime = gameTime
            startGame(gameTime, gamePrevousTime)
        }
        if(gameTime > 0) { 
            document.getElementById("timer").innerHTML = Math.round(gameTime)
        }
        
        console.log(gamePrevousTime - gameTime)

    }
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // console.log(deltaTime)

    for(const obj of objToUpdate) {
        if(obj.position.z > camera.position.z) {
            scene.remove(obj)
            objToUpdate.splice(objToUpdate.indexOf(obj), 1)
            missed++
            // console.log(objToUpdate)
        }

        // Add difficulty multiplier
        obj.position.z += deltaTime *8
    }

    // Update raycaster

    // console.log(scene.children)
    raycaster.setFromCamera(mouse, camera)
    arrow.setDirection(raycaster.ray.direction)
    // console.log(raycaster)

    const raycasterItems = []
    for(const items of objToUpdate) {
        raycasterItems.push(items)
    }
    const intersects = raycaster.intersectObjects(scene.children)

    // Color the ones that get intersected
    for(const items of raycasterItems) {
        items.material.color.set('#ff0000')
    }
    for(const intersected of intersects) {
        // console.log(intersected)
        intersected.object.material.color.set('#CDC0ff')
    }

    if(intersects.length != 0) {
        objectHovered = intersects[0]
        // console.log(objectHovered)

    } else {
        objectHovered = null
    }

    

    renderer.render(scene, camera)
    // orbitControls.update(camera)
    window.requestAnimationFrame(tick)
}

tick()