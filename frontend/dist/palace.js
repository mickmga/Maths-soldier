"use strict";
const MAPS = [];
const heroContainer = document.getElementById('hero_container');
const heroImage = document.getElementById('heroImg');
const enemy = document.getElementById('enemyImg');
const enemyContainer = document.getElementById('enemy_container');
const errorScoreContainer = document.getElementById('error_score');
const successfulKillsScoreContainer = document.getElementById('killed_score');
let errorScore = 0;
let successfulKillsScore = 0;
//local storage
let backgroundSrc = 'assets/palace/maps/castle/castle.gif';
const makeId = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
};
var ANIMATION_ID;
(function (ANIMATION_ID) {
    ANIMATION_ID[ANIMATION_ID["attack"] = 0] = "attack";
    ANIMATION_ID[ANIMATION_ID["run"] = 1] = "run";
    ANIMATION_ID[ANIMATION_ID["walk"] = 2] = "walk";
    ANIMATION_ID[ANIMATION_ID["opponent_run"] = 3] = "opponent_run";
    ANIMATION_ID[ANIMATION_ID["camera_left_to_right"] = 4] = "camera_left_to_right";
    ANIMATION_ID[ANIMATION_ID["camera_right_to_left"] = 5] = "camera_right_to_left";
    ANIMATION_ID[ANIMATION_ID["character_left_to_right_move"] = 6] = "character_left_to_right_move";
})(ANIMATION_ID || (ANIMATION_ID = {}));
const ANIMATION_RUNNING_VALUES = {
    [ANIMATION_ID.attack]: 0,
    [ANIMATION_ID.run]: 0,
    [ANIMATION_ID.walk]: 0,
    [ANIMATION_ID.opponent_run]: 0,
    [ANIMATION_ID.camera_left_to_right]: 0,
    [ANIMATION_ID.camera_right_to_left]: 0,
    [ANIMATION_ID.character_left_to_right_move]: 0
};
const createMapBlock = (left) => {
    const block = document.createElement('div');
    block.classList.add('mapBlock');
    const backgroundImage = document.createElement('img');
    backgroundImage.src = backgroundSrc;
    block.append(backgroundImage);
    block.style.position = 'fixed';
    block.style.left = `${left}px`;
    document.getElementsByTagName('body')[0].append(block);
    return block;
};
const moveCamera = (direction) => {
    if (ANIMATION_RUNNING_VALUES[direction] === 0 || ANIMATION_RUNNING_VALUES[direction] > 1) {
        return;
    }
    MAPS.forEach(map => map.style.left = `${map.offsetLeft + ((direction === ANIMATION_ID.camera_left_to_right ? -1 : 1) * 4)}px`);
    requestAnimationFrame(() => moveCamera(direction));
};
const updateScores = () => {
    errorScoreContainer.innerHTML = "Erreurs: " + errorScore.toString();
    successfulKillsScoreContainer.innerHTML = "Bonnes réponses: " + successfulKillsScore.toString();
};
const launchAnimationAndDeclareItLaunched = (characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId) => {
    ANIMATION_RUNNING_VALUES[animationId]++;
    launchCharacterAnimation(characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId);
};
const launchCharacterAnimation = (characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId) => {
    if (!characterElement)
        alert("no element no more!");
    if (!ANIMATION_RUNNING_VALUES[animationId] || ANIMATION_RUNNING_VALUES[animationId] > 1) {
        return;
    }
    if (throttleNum < 5) {
        throttleNum++;
        return requestAnimationFrame(() => launchCharacterAnimation(characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId));
    }
    throttleNum = 0;
    if (spriteIndex === max) {
        if (loop === false) {
            return;
        }
        spriteIndex = min;
    }
    else {
        spriteIndex++;
    }
    characterElement.src = `${spriteBase}/${spriteIndex}.${extension}`;
    requestAnimationFrame(() => launchCharacterAnimation(characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId));
};
const initAnimation = (animationId) => {
    ANIMATION_RUNNING_VALUES[animationId] = 0;
};
const launchAttack = () => {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;
    launchAnimationAndDeclareItLaunched(heroImage, 0, 'png', 'assets/challenge/characters/hero/attack', 1, 4, 1, false, ANIMATION_ID.attack);
    setTimeout(() => {
        if (heroContainer.offsetLeft + heroContainer.offsetWidth + (window.innerWidth * 0.05) > enemyContainer.offsetLeft && enemy) {
            enemy.remove();
            enemyOnScreen = false;
            successfulKillsScore++;
            updateScores();
        }
    }, 500);
    setTimeout(() => {
        launchAnimationAndDeclareItLaunched(heroImage, 0, 'png', 'assets/challenge/characters/hero/run', 1, 8, 1, true, ANIMATION_ID.run);
        initAnimation(ANIMATION_ID.attack);
    }, 1000);
};
const launchOpponent = () => {
    launchAnimationAndDeclareItLaunched(enemy, 0, 'png', 'assets/challenge/characters/enemies/wolf', 1, 9, 1, true, ANIMATION_ID.opponent_run);
};
let enemyOnScreen = true;
const moveEnemy = () => {
    if (!enemyOnScreen)
        return;
    enemyContainer.style.left = `${enemyContainer.offsetLeft - 10}px`;
    requestAnimationFrame(moveEnemy);
};
const detectCollision = () => {
    if (heroContainer.offsetLeft > enemyContainer.offsetLeft) {
        errorScore++;
        updateScores();
        return;
    }
    requestAnimationFrame(detectCollision);
};
const checkForScreenUpdateFromLeftToRight = (throttleNum) => {
    if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] === 0) {
        return;
    }
    if (throttleNum < 10) {
        throttleNum++;
        return requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));
    }
    throttleNum = 0;
    //deletion
    //pick first map block
    const firstMapDomElement = MAPS[0];
    if (firstMapDomElement.offsetLeft < (-window.innerWidth)) {
        firstMapDomElement.remove();
        MAPS.shift();
    }
    //creation
    const lastMapDomElement = MAPS[MAPS.length - 1];
    if (lastMapDomElement && lastMapDomElement.offsetLeft <= window.innerWidth / 10) {
        MAPS.push(createMapBlock((lastMapDomElement.offsetLeft + lastMapDomElement.offsetWidth)));
    }
    requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));
};
const checkForScreenUpdateFromRightToLeft = (throttleNum) => {
    if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] === 0) {
        return;
    }
    if (throttleNum < 10) {
        throttleNum++;
        return requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));
    }
    throttleNum = 0;
    //creation
    //pick first map block
    const firstMapDomElement = MAPS[0];
    console.log(firstMapDomElement.offsetLeft);
    if (firstMapDomElement && (firstMapDomElement.offsetLeft > (-window.innerWidth))) {
        MAPS.unshift(createMapBlock(firstMapDomElement.offsetLeft - firstMapDomElement.offsetWidth));
    }
    //deletion
    const lastMapDomElement = MAPS[MAPS.length - 1];
    if (lastMapDomElement && lastMapDomElement.offsetLeft > window.innerWidth) {
        lastMapDomElement.remove();
        MAPS.pop();
    }
    requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));
};
//CHALLENGE.TS ENDING
const initHero = () => {
};
const launchCharacterMovement = () => {
    moveCamera(ANIMATION_ID.camera_left_to_right);
    launchAnimationAndDeclareItLaunched(heroImage, 0, 'png', 'assets/palace/hero/old_walk', 1, 6, 1, true, ANIMATION_ID.walk);
};
const launchCharacterMovementLeft = () => {
    moveCamera(ANIMATION_ID.camera_right_to_left);
    launchAnimationAndDeclareItLaunched(heroImage, 0, 'png', 'assets/palace/hero/walk_left', 1, 6, 1, true, ANIMATION_ID.walk);
};
document.addEventListener('keydown', (event) => {
    if (event.key === "d" && ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] === 0) {
        ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right]++;
        launchCharacterMovement();
        checkForScreenUpdateFromLeftToRight(10);
    }
    if (event.key === "q" && ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] === 0) {
        ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left]++;
        launchCharacterMovementLeft();
        checkForScreenUpdateFromRightToLeft(10);
    }
});
document.addEventListener('keyup', () => {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] = 0;
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.walk] = 0;
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
});
window.onload = () => {
    MAPS.push(createMapBlock(-window.innerWidth));
    MAPS.push(createMapBlock(0));
    MAPS.push(createMapBlock(window.innerWidth));
};
