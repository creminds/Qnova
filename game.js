import * as THREE from "three";

import {
    PointerLockControls
} from "three/addons/controls/PointerLockControls.js";


// =====================================================
// BASIC SETUP
// =====================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x080808);


const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    0,
    1.7,
    7
);


// =====================================================
// RENDERER
// =====================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

document.body.appendChild(
    renderer.domElement
);


// =====================================================
// LIGHT
// =====================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.5
    );

scene.add(
    ambientLight
);


const mainLight =
    new THREE.PointLight(
        0xffffff,
        40,
        30
    );

mainLight.position.set(
    0,
    4,
    0
);

scene.add(
    mainLight
);


// =====================================================
// PLAYER CONTROLS
// =====================================================

const controls =
    new PointerLockControls(
        camera,
        document.body
    );


document.body.addEventListener(
    "click",
    () => {

        if (
            !gameOver &&
            !victory &&
            !puzzleOpen &&
            !learningOpen
        ) {

            controls.lock();

        }

    }
);


// =====================================================
// VARIABLES
// =====================================================

let currentLevel = 1;

let lives = 3;

let puzzleOpen = false;

let learningOpen = false;

let gameOver = false;

let victory = false;

let grannyActive = false;

let playerCaught = false;

let clueObject = null;

let doorObject = null;

let granny = null;

let grannyTarget = null;

let levelObjects = [];

let keys = {};


// =====================================================
// UI ELEMENTS
// =====================================================

const message =
    document.getElementById(
        "message"
    );

const levelText =
    document.getElementById(
        "level"
    );

const livesText =
    document.getElementById(
        "lives"
    );

const interaction =
    document.getElementById(
        "interaction"
    );

const learningPanel =
    document.getElementById(
        "learningPanel"
    );

const learningTitle =
    document.getElementById(
        "learningTitle"
    );

const learningText =
    document.getElementById(
        "learningText"
    );

const puzzlePanel =
    document.getElementById(
        "puzzlePanel"
    );

const puzzleTitle =
    document.getElementById(
        "puzzleTitle"
    );

const puzzleQuestion =
    document.getElementById(
        "puzzleQuestion"
    );

const answer1 =
    document.getElementById(
        "answer1"
    );

const answer2 =
    document.getElementById(
        "answer2"
    );

const answer3 =
    document.getElementById(
        "answer3"
    );

const gameOverScreen =
    document.getElementById(
        "gameOver"
    );

const victoryScreen =
    document.getElementById(
        "victory"
    );


// =====================================================
// KEYBOARD
// =====================================================

document.addEventListener(
    "keydown",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = true;


        if (
            event.key.toLowerCase()
            === "e"
        ) {

            interact();

        }

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


// =====================================================
// CREATE WALL
// =====================================================

function createWall(
    x,
    y,
    z,
    width,
    height,
    depth
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x292929
        });


    const wall =
        new THREE.Mesh(
            geometry,
            material
        );


    wall.position.set(
        x,
        y,
        z
    );


    scene.add(
        wall
    );


    levelObjects.push(
        wall
    );


    return wall;
}


// =====================================================
// CREATE ROOM
// =====================================================

function createRoom() {

    clearRoom();


    // FLOOR

    const floorGeometry =
        new THREE.BoxGeometry(
            20,
            0.2,
            20
        );


    const floorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x202020
        });


    const floor =
        new THREE.Mesh(
            floorGeometry,
            floorMaterial
        );


    floor.position.y =
        -0.1;


    scene.add(
        floor
    );


    levelObjects.push(
        floor
    );


    // WALLS

    createWall(
        0,
        2.5,
        -10,
        20,
        5,
        0.3
    );


    createWall(
        -10,
        2.5,
        0,
        0.3,
        5,
        20
    );


    createWall(
        10,
        2.5,
        0,
        0.3,
        5,
        20
    );


    createWall(
        0,
        2.5,
        10,
        20,
        5,
        0.3
    );


    // TABLE

    const tableGeometry =
        new THREE.BoxGeometry(
            3,
            0.4,
            2
        );


    const tableMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4a2b16
        });


    const table =
        new THREE.Mesh(
            tableGeometry,
            tableMaterial
        );


    table.position.set(
        0,
        2,
        -3
    );


    scene.add(
        table
    );


    levelObjects.push(
        table
    );


    // TABLE LEGS

    for (
        let x of [-1.2, 1.2]
    ) {

        for (
            let z of [-0.7, 0.7]
        ) {

            const legGeometry =
                new THREE.BoxGeometry(
                    0.2,
                    2,
                    0.2
                );


            const leg =
                new THREE.Mesh(
                    legGeometry,
                    tableMaterial
                );


            leg.position.set(
                x,
                1,
                -3 + z
            );


            scene.add(
                leg
            );


            levelObjects.push(
                leg
            );

        }

    }


    // DOOR

    createDoor();


    // CLUE

    createClue();


    // RESET PLAYER

    camera.position.set(
        0,
        1.7,
        7
    );


    // CREATE GRANNY

    createGranny();

}


// =====================================================
// CLEAR ROOM
// =====================================================

function clearRoom() {

    for (
        const object
        of levelObjects
    ) {

        scene.remove(
            object
        );

    }


    levelObjects = [];


    if (granny) {

        scene.remove(
            granny
        );

        granny = null;

    }

}


// =====================================================
// CREATE DOOR
// =====================================================

function createDoor() {

    const geometry =
        new THREE.BoxGeometry(
            2.5,
            4,
            0.4
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x222222
        });


    doorObject =
        new THREE.Mesh(
            geometry,
            material
        );


    doorObject.position.set(
        0,
        2,
        -9.7
    );


    scene.add(
        doorObject
    );


    levelObjects.push(
        doorObject
    );

}


// =====================================================
// CREATE CLUE
// =====================================================

function createClue() {

    const geometry =
        new THREE.BoxGeometry(
            1,
            0.2,
            1
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x00aaff,
            emissive: 0x004466
        });


    clueObject =
        new THREE.Mesh(
            geometry,
            material
        );


    clueObject.position.set(
        0,
        2.35,
        -3
    );


    scene.add(
        clueObject
    );


    levelObjects.push(
        clueObject
    );

}


// =====================================================
// CREATE GRANNY
// =====================================================

function createGranny() {

    const group =
        new THREE.Group();


    // BODY

    const bodyGeometry =
        new THREE.BoxGeometry(
            1,
            2,
            0.7
        );


    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x550000
        });


    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );


    body.position.y =
        1;


    group.add(
        body
    );


    // HEAD

    const headGeometry =
        new THREE.SphereGeometry(
            0.5,
            16,
            16
        );


    const headMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xd0a080
        });


    const head =
        new THREE.Mesh(
            headGeometry,
            headMaterial
        );


    head.position.y =
        2.4;


    group.add(
        head
    );


    group.position.set(
        0,
        0,
        -5
    );


    granny =
        group;


    granny.visible =
        false;


    scene.add(
        granny
    );

}


// =====================================================
// SHOW LEARNING
// =====================================================

function showLearning() {

    learningOpen =
        true;


    controls.unlock();


    learningPanel.style.display =
        "flex";


    if (
        currentLevel === 1
    ) {

        learningTitle.textContent =
            "Qubit + X Gate";


        learningText.innerHTML =
            `
            A qubit is the basic unit of
            quantum information.
            <br><br>

            The X gate changes:
            <br><br>

            |0⟩ → |1⟩
            <br><br>

            Remember this before solving
            the puzzle.
            `;

    }


    if (
        currentLevel === 2
    ) {

        learningTitle.textContent =
            "Quantum Gates";


        learningText.innerHTML =
            `
            Quantum gates change the
            state of a qubit.
            <br><br>

            We will use:
            <br><br>

            X &nbsp; Y &nbsp; Z &nbsp; H
            <br><br>

            The X gate changes |0⟩
            into |1⟩.
            `;

    }


    if (
        currentLevel === 3
    ) {

        learningTitle.textContent =
            "Reversibility";


        learningText.innerHTML =
            `
            Quantum operations are
            reversible.
            <br><br>

            For example:
            <br><br>

            |0⟩ → X → X → |0⟩
            <br><br>

            Applying X twice returns
            the original state.
            `;

    }

}


// =====================================================
// CONTINUE LEARNING
// =====================================================

document.getElementById(
    "continueButton"
).addEventListener(
    "click",
    () => {

        learningPanel.style.display =
            "none";

        learningOpen =
            false;

        showPuzzle();

    }
);


// =====================================================
// SHOW PUZZLE
// =====================================================

function showPuzzle() {

    puzzleOpen =
        true;


    controls.unlock();


    puzzlePanel.style.display =
        "flex";


    if (
        currentLevel === 1
    ) {

        puzzleTitle.textContent =
            "Level 1";


        puzzleQuestion.textContent =
            "What is X|0⟩?";


        answer1.textContent =
            "|0⟩";


        answer2.textContent =
            "|1⟩";


        answer3.textContent =
            "|+⟩";


        answer1.onclick =
            () => wrongAnswer();


        answer2.onclick =
            () => correctAnswer();


        answer3.onclick =
            () => wrongAnswer();

    }


    if (
        currentLevel === 2
    ) {

        puzzleTitle.textContent =
            "Level 2";


        puzzleQuestion.textContent =
            "|0⟩ → X → ?";


        answer1.textContent =
            "|0⟩";


        answer2.textContent =
            "|1⟩";


        answer3.textContent =
            "|+⟩";


        answer1.onclick =
            () => wrongAnswer();


        answer2.onclick =
            () => correctAnswer();


        answer3.onclick =
            () => wrongAnswer();

    }


    if (
        currentLevel === 3
    ) {

        puzzleTitle.textContent =
            "Final Puzzle";


        puzzleQuestion.textContent =
            "|0⟩ → X → X → ?";


        answer1.textContent =
            "|0⟩";


        answer2.textContent =
            "|1⟩";


        answer3.textContent =
            "|+⟩";


        answer1.onclick =
            () => correctAnswer();


        answer2.onclick =
            () => wrongAnswer();


        answer3.onclick =
            () => wrongAnswer();

    }

}


// =====================================================
// CORRECT ANSWER
// =====================================================

function correctAnswer() {

    puzzlePanel.style.display =
        "none";


    puzzleOpen =
        false;


    message.textContent =
        "✓ CORRECT! DOOR UNLOCKED";


    doorObject.visible =
        false;


    setTimeout(
        () => {

            if (
                currentLevel < 3
            ) {

                currentLevel++;

                levelText.textContent =
                    "LEVEL " +
                    currentLevel;

                message.textContent =
                    "Entering Level " +
                    currentLevel;

                createRoom();

            }
            else {

                winGame();

            }

        },
        1500
    );

}


// =====================================================
// WRONG ANSWER
// =====================================================

function wrongAnswer() {

    puzzlePanel.style.display =
        "none";


    puzzleOpen =
        false;


    message.textContent =
        "❌ WRONG! QUANTUM SECURITY ALERT!";


    document.body.classList.add(
        "redAlert"
    );


    activateGranny();


    setTimeout(
        () => {

            document.body.classList.remove(
                "redAlert"
            );

        },
        2000
    );

}


// =====================================================
// ACTIVATE GRANNY
// =====================================================

function activateGranny() {

    grannyActive =
        true;


    granny.visible =
        true;


    granny.position.set(
        0,
        0,
        -5
    );


    message.textContent =
        "👵 GRANNY IS COMING!";


    controls.lock();

}


// =====================================================
// GRANNY MOVEMENT
// =====================================================

function updateGranny() {

    if (
        !grannyActive ||
        !granny
    ) {

        return;

    }


    const direction =
        new THREE.Vector3();


    direction.subVectors(
        camera.position,
        granny.position
    );


    direction.y = 0;


    const distance =
        direction.length();


    if (
        distance > 0.1
    ) {

        direction.normalize();


        granny.position.add(
            direction.multiplyScalar(
                0.035
            )
        );

    }


    granny.lookAt(
        camera.position.x,
        granny.position.y,
        camera.position.z
    );


    // CAUGHT

    if (
        distance < 1.5 &&
        !playerCaught
    ) {

        playerCaught =
            true;

        caughtByGranny();

    }

}


// =====================================================
// CAUGHT
// =====================================================

function caughtByGranny() {

    grannyActive =
        false;


    granny.visible =
        false;


    lives--;


    updateLives();


    if (
        lives <= 0
    ) {

        endGame();

        return;

    }


    message.textContent =
        "CAUGHT! LIFE LOST!";


    setTimeout(
        () => {

            camera.position.set(
                0,
                1.7,
                7
            );


            playerCaught =
                false;


            message.textContent =
                "Try again";


            controls.lock();

        },
        1500
    );

}


// =====================================================
// UPDATE LIVES
// =====================================================

function updateLives() {

    livesText.textContent =
        "❤️ ".repeat(lives) +
        "🖤 ".repeat(
            3 - lives
        );

}


// =====================================================
// INTERACTION
// =====================================================

function interact() {

    if (
        puzzleOpen ||
        learningOpen ||
        gameOver ||
        victory
    ) {

        return;

    }


    if (!clueObject) {

        return;

    }


    const distance =
        camera.position.distanceTo(
            clueObject.position
        );


    if (
        distance < 3
    ) {

        showLearning();

    }

}


// =====================================================
// GAME OVER
// =====================================================

function endGame() {

    gameOver =
        true;


    controls.unlock();


    gameOverScreen.style.display =
        "flex";


    message.textContent =
        "GAME OVER";

}


// =====================================================
// VICTORY
// =====================================================

function winGame() {

    victory =
        true;


    controls.unlock();


    victoryScreen.style.display =
        "flex";


    message.textContent =
        "YOU ESCAPED!";

}


// =====================================================
// ANIMATION
// =====================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    if (
        !gameOver &&
        !victory &&
        !puzzleOpen &&
        !learningOpen &&
        controls.isLocked
    ) {

        movePlayer();

    }


    updateGranny();


    renderer.render(
        scene,
        camera
    );

}


// =====================================================
// PLAYER MOVEMENT
// =====================================================

function movePlayer() {

    const speed =
        0.08;


    if (
        keys["w"]
    ) {

        controls.moveForward(
            speed
        );

    }


    if (
        keys["s"]
    ) {

        controls.moveForward(
            -speed
        );

    }


    if (
        keys["a"]
    ) {

        controls.moveRight(
            -speed
        );

    }


    if (
        keys["d"]
    ) {

        controls.moveRight(
            speed
        );

    }


    // Keep player inside room

    camera.position.x =
        Math.max(
            -8.5,
            Math.min(
                8.5,
                camera.position.x
            )
        );


    camera.position.z =
        Math.max(
            -8.5,
            Math.min(
                8.5,
                camera.position.z
            )
        );

}


// =====================================================
// RESIZE
// =====================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// =====================================================
// START GAME
// =====================================================

createRoom();

updateLives();

message.textContent =
    "Click the screen to start";


animate();