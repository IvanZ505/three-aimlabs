import { totalGameTime } from "./script.js";

export const difficulties = [
    {
        name: "Easy",
        speed: 1,
        spawnrate: 1,
        score: 100,
        quantity: 1 * totalGameTime
    },
    {
        name: "Medium",
        speed: 2,
        spawnrate: 0.5,
        score: 200,
        quantity: 2 * totalGameTime
    },
    {
        name: "Hard",
        speed: 3,
        spawnrate: 0.25,
        score: 300,
        quantity: 4 * totalGameTime
    }
]
