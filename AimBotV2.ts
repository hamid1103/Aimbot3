//constants
const lightTreshold = input.lightLevel() + 20
const lightImmunity = 3000 //time immune from laser

const minSpeed = 10
const maxSpeed = 50

const minTime = 300
const maxTime = 800

const biasTreshold = 1000 //decides on how much "bias" the bot should always drive that direction

const maxScore = 3

//variables
let running = false

let currentSpeed = 0
let currentTime = 0 //means time it spends driving
let currentDirection: Direction

//bias is built up based on the amount of time the bot drives in the opposite direction
//hopefully prevents bot driving too much in same direction
let biasLeft = 0
let biasRight = 0

let score = 0

//main functions
const run = () => {
    if (!running) { //stop if running is false
        return
    }

    //set parameters
    currentDirection = getDirection()
    currentSpeed = randomSpeed()
    currentTime = randomTime()

    //drive
    currentDirection === Direction.Left ? driveLeft(currentSpeed) : driveRight(currentSpeed)
    setTimeout(run, currentTime) //wait currentTime before executing again
}

forever(function () {
    //lightlevel event doesnt work
    //checks for laser on light sensor
    if (running && input.lightLevel() > lightTreshold) {
        score++
        music.baDing.playUntilDone()
        console.log(score)

        if (score >= maxScore) { //ends the "game"
            running = false
            light.setAll(Colors.Green)
            crickit.motor1.stop()
            crickit.motor2.stop()
            return
        }

        loops.pause(lightImmunity) //stop getting hit for lightImmunity milliseconds
    }
})

//events
input.buttonA.onEvent(ButtonEvent.Click, function () {
    if (running) { //turns off
        running = false
        crickit.motor1.stop()
        crickit.motor2.stop()
        return
    }

    //wait for a bit while showing animation
    light.showAnimation(light.rainbowAnimation, 5000)
    light.setAll(Colors.Black)

    //do the thing
    running = true
    run()
})

//minor functions
function driveLeft(speed: number) {
    console.log("<-- " + currentTime)
    biasRight += currentTime //add time to opposite bias
    crickit.motor1.run(speed)
    crickit.motor2.run(speed)
}

function driveRight(speed: number) {
    console.log("--> " + currentTime)
    biasLeft += currentTime
    crickit.motor1.run(-speed)
    crickit.motor2.run(-speed)
}

function randomSpeed() {
    return Math.randomRange(minSpeed, maxSpeed)
}

function randomTime() {
    return Math.randomRange(minTime, maxTime)
}

function getDirection() {
    let direction: Direction

    if (biasLeft > biasTreshold) { //go left if over treshold
        direction = Direction.Left
        biasLeft = 0
    }

    else if (biasRight > biasTreshold) {
        direction = Direction.Right
        biasRight = 0
    }

    else {
        let num = Math.randomRange(0, 1) //pick at random
        num === 0 ? direction = Direction.Left : direction = Direction.Right
    }

    return direction;
}

enum Direction {
    Left,
    Right
}