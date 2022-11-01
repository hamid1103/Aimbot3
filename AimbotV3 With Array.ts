//signal light sensor input
const sensor2 = crickit.signal1
const sensor1 = crickit.signal2

//constants
let lightTreshold = sensor1.analogRead() + sensor2.analogRead() / 2 + 150 //avg + 80
const lightImmunity = 2000 //time immune from laser

const minSpeed = 40
const maxSpeed = 80

const minTime = 300
const maxTime = 800

const duration = 10000
const waitTime = 2000

const biasTreshold = 1000 //decides on how much "bias" the bot should always drive that direction

const maxScore = 3

//variables
let running = false
let multiplayer = false

let currentSpeed = 0
let currentTime = 0 //means time it spends driving
let currentDirection: Direction

//bias is built up based on the amount of time the bot drives in the opposite direction
//hopefully prevents bot driving too much in same direction
let biasLeft = 0

let biasRight = 0

let score = 0
let score2 = 0

let scoray: string[] = [];

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
    //Check button signal
    if (pins.A3.digitalRead()) {
        console.log("AHAHAH") //had to use this for debugging... sometimes pin a3 doesn't detect anything due to faulty cables
        if (running) { //turns off
            endGame()
            return
        }
        lightTreshold = sensor1.analogRead() + sensor2.analogRead() / 2 + 150
        //wait for a bit
        pause(waitTime)
        light.setAll(Colors.Black)

        //do the thing
        running = true
        run()
    } else if (pins.A2.digitalRead()) {
        if (running) { //turns off
            endGame()
            return
        }
        lightTreshold = sensor1.analogRead() + sensor2.analogRead() / 2 + 150
        pause(waitTime) //wait a sec

        //do the thing
        multiplayer = true
        running = true
        run()

        setTimeout(() => {
            if (score > score2) {
                winnerSound(1)
                console.log("Winner Team 1")
            }
            else {
                winnerSound(2)
                console.log("Winner Team 2")
            }

            endGame()
        }, 10000)
    }

    //lightlevel event doesnt work because it checks lightlevel on builtin lightsensor... keep in for reference
    //checks for laser on light sensor
    if (running && !multiplayer && input.lightLevel() > lightTreshold) {
        score++
        music.baDing.playUntilDone()
        console.log(score)

        if (score >= maxScore) { //ends the "game"
            light.setAll(Colors.Green)
            endGame()
            return
        }

        loops.pause(lightImmunity) //stop getting hit for lightImmunity milliseconds
    }
    //sensor 1 located on the side with the inbuilt button
    //sensor 2 located on the side with the loose hanging button
    if (running && !multiplayer) {
        if (sensor1.analogRead() > lightTreshold) {
            score++
            music.baDing.playUntilDone()
            console.log(score)

            if (score >= maxScore) { //ends the "game"
                light.setAll(Colors.Green)
                endGame()
                return
            }

            loops.pause(lightImmunity)
        }
    }

    else if (running && multiplayer) {
        if (sensor1.analogRead() > lightTreshold) {
            score++
            scoray.push("Team 1")
            music.baDing.playUntilDone()
            console.log(score)
            loops.pause(lightImmunity)
        }
        if (sensor2.analogRead() > lightTreshold) {
            score2++
            scoray.push("Team 2")
            music.baDing.playUntilDone()
            console.log(score2)
            loops.pause(lightImmunity)
        }
    }

})

//reset everything and stop motors
function endGame() {
    console.log(scoray)
    scoray = []
    multiplayer = false
    running = false
    crickit.motor1.stop()
    crickit.motor2.stop()
    score = 0
    score2 = 0
    setTimeout(() => light.clear(), duration)
}

//events
input.buttonA.onEvent(ButtonEvent.Click, function () {
    if (running) { //turns off
        endGame()
        return
    }

    //wait for a bit
    pause(waitTime)
    light.setAll(Colors.Black)

    //do the thing
    running = true
    run()
})

input.buttonB.onEvent(ButtonEvent.Click, function () {
    if (running) { //turns off
        endGame()
        return
    }

    pause(waitTime) //wait a sec

    //do the thing
    multiplayer = true
    running = true
    run()

    //left on todo cuz the onboard buttons are not used
    setTimeout(() => {
        if (score > score2) {
            console.log('TODO')
        }
        else {
            console.log('TODO')
        }

        endGame()
    }, 10000)
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

function winnerSound(winner: number) {
    if (winner == 1) {
        for (let i = 0; i < 4; i++) {
            music.playTone(349 + (i * 12), music.beat(BeatFraction.Half))
        }
    } else if (winner == 2) {
        for (let i = 0; i < 4; i++) {
            music.playTone(349 - (i * 12), music.beat(BeatFraction.Half))
        }
    }
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
