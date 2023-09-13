import * as dat from 'lil-gui'


export function addDebugItems ()  {

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

}

export default {
    
}