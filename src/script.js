import * as THREE from 'three'
import * as dat from 'lil-gui'
import { difficulties } from './globals.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'


// // Debug
var gui = new dat.GUI()
const debugItems = {}

var stop = true
var pause = true

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
    stopGame()
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


// Time
export var totalGameTime = 60
var previousTime = 0
var gameTime = totalGameTime
var elapsedTimeBetweenGameTimes = 0
var gamePrevousTime = totalGameTime
const clock = new THREE.Clock()

const objToUpdate = []

var selectedDifficulty = 0


// Scorekeeping

var score = 0

hidePopup()

// Textures Loader
const textureLoader = new THREE.TextureLoader()

export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

// Event Listeners

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

window.addEventListener('keypress', (e) => {
    switch(e.key) {
        case "f":
            // Fullscreen the canvas
            if(!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
                document.querySelector(".fullscreen-popup").setAttribute("style", "display: none")
            } else {
                document.exitFullscreen()
                if(!stop) {
                    document.querySelector(".fullscreen-popup").setAttribute("style", "display: flex")
                    pauseFunction()
                }
            }
            break
        case "p":
            // Pause the game
            pauseFunction()
            break
        default:
            console.log("No associated keypress")
    }
    
})

window.addEventListener('keydown', (e) => {
    if(e.key == "Escape" && !stop && !document.requestFullscreen) {
        document.querySelector(".fullscreen-popup").setAttribute("style", "display: flex")
        pauseFunction()
    }
})

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
                // console.log(score)
            }
        }
        
    }
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 3
camera.children = []
scene.add(camera)


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Background
const backgroundGeo = new THREE.SphereGeometry(100, 32, 32)
const backgroundTexture = textureLoader.load("neon_pana.jpeg")
const backgroundMat = new THREE.MeshBasicMaterial({ map: backgroundTexture })
backgroundMat.side = THREE.DoubleSide
const background = new THREE.Mesh(
    backgroundGeo, backgroundMat
    )

background.scale.x = -1
background.position.z = 3

scene.add(background)
camera.children.push(background)
const controls = new PointerLockControls(camera, canvas)

renderer.render(scene, camera)

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

// Start Button

const startFunction = () => {
    // Get the difficulty
    selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value
    console.log(selectedDifficulty)
    document.getElementById("popup2").setAttribute("style", "display: none")

    if(!document.fullscreenElement) {
        document.querySelector(".fullscreen-popup").setAttribute("style", "display: flex")
    }
    stop = false
    tick()
}

document.querySelector('.start-button').addEventListener('click', startFunction)


const stopGame = () => {
    stop = true
    document.getElementById("timer").innerHTML = "Game Over!"
    document.getElementById("popup").removeAttribute("style", "display: none")
    document.querySelector(".popup-score").innerHTML =  score * difficulties[selectedDifficulty].score
    document.querySelector(".popup-missed").innerHTML =  difficulties[selectedDifficulty].quantity - score
    document.querySelector('.popup-button').addEventListener('click', restartGame)
}

// Pause function
const pauseFunction = () => {
    if(!stop) {
        pause = !pause
        if(clock.running) {
            clock.stop()
        } else {
            clock.start()
        }
    }
}

// Hide popup
function hidePopup() {
    document.getElementById("popup").setAttribute("style", "display: none")
}

// Restart game

const restartGame = () => {
    hidePopup()
    clock.elapsedTime = 0
    document.getElementById("popup2").removeAttribute("style", "display: none")
    score = 0
    gameTime = totalGameTime
    gamePrevousTime = totalGameTime
    elapsedTimeBetweenGameTimes = 0
    previousTime = 0
}

// Raycaster function

var intersects = raycaster.intersectObjects(scene.children)

const raycastUpdates = () => {
    intersects = raycaster.intersectObjects(scene.children)

    raycaster.setFromCamera(mouse, camera)

    const raycasterItems = []
    for(const items of objToUpdate) {
        raycasterItems.push(items)
    }
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
}

// Update Objects

const updateObjects = (deltaTime) => {
    for(const obj of objToUpdate) {
        if(obj.position.z > camera.position.z) {
            scene.remove(obj)
            objToUpdate.splice(objToUpdate.indexOf(obj), 1)
            // console.log(objToUpdate)
        }

    // Add difficulty multiplier
    obj.position.z += deltaTime * 3 * difficulties[selectedDifficulty].speed
    }
}

const updateTimer = () => {
    if(elapsedTimeBetweenGameTimes >= difficulties[selectedDifficulty].spawnrate && gameTime > 0) {
        gamePrevousTime = gameTime
        startGame(gameTime, gamePrevousTime)
    }
    if(gameTime > 0) { 
        document.getElementById("timer").innerHTML = Math.round(gameTime)
    }
}

// Cam controls
// const orbitControls = new OrbitControls(camera, canvas)
// orbitControls.enableDamping = true

const tick = () => {

    if(!stop || !pause) {
        const elapsedTime = clock.getElapsedTime()

        if(!stop && gameTime <= 0 && objToUpdate.length == 0) {
            stopGame()
        }
        gameTime = totalGameTime - elapsedTime
        elapsedTimeBetweenGameTimes = gamePrevousTime - gameTime

        // Update Timer
        updateTimer()
            
        // console.log(gamePrevousTime - gameTime)

        const deltaTime = elapsedTime - previousTime
        previousTime = elapsedTime

        // Update objects
        updateObjects(deltaTime)

        // Update raycaster
        raycastUpdates()
    }

    renderer.render(scene, camera)
    // orbitControls.update(camera)
    window.requestAnimationFrame(tick)
}

tick()