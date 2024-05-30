"use strict";
window.onload = () => {
    MAPS.push(createMapBlock(0));
    MAPS.push(createMapBlock(100));
    moveCamera();
    launchHeroAnimation(0, 'png', 'assets/characters/hero/run', 1, 8, 1);
};
const createMapBlock = (left) => {
    var _a;
    const block = document.createElement('div');
    block.classList.add('mapBlock');
    block.style.left = `${left}vw`;
    const backgroundImage = document.createElement('img');
    backgroundImage.src = 'assets/maps/challenge_castle.webp';
    block.append(backgroundImage);
    (_a = document.getElementById('game_container')) === null || _a === void 0 ? void 0 : _a.append(block);
    return block;
};
const MAPS = [];
const moveCamera = () => {
    const gameContainer = document.getElementById('game_container');
    gameContainer.style.left = `${gameContainer.offsetLeft - 4}px`;
    requestAnimationFrame(moveCamera);
};
const heroImage = document.getElementById('heroImg');
const launchHeroAnimation = (throttleNum, extension, spriteBase, spriteIndex, max, min) => {
    if (throttleNum < 12) {
        throttleNum++;
        return requestAnimationFrame(() => launchHeroAnimation(throttleNum, extension, spriteBase, spriteIndex, max, min));
    }
    console.log("running");
    throttleNum = 0;
    if (spriteIndex === max) {
        spriteIndex = min;
    }
    else {
        spriteIndex++;
    }
    heroImage.src = `${spriteBase}/${spriteIndex}.${extension}`;
    requestAnimationFrame(() => launchHeroAnimation(throttleNum, extension, spriteBase, spriteIndex, max, min));
};
/*


const checkForScreenUpdateFromLeftToRight = (throttleNum: number): any => {

    if (throttleNum < 10) {
        throttleNum++;
        return requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));
    }

    throttleNum = 0;


    console.log("running");


        //deletion

             //pick first map block

                 const firstMapDomElement = document.getElementById('map_'+reduxContainer.mapBlocksOnScreen[0].id);
                 

                 if(firstMapDomElement && firstMapDomElement.offsetLeft > (-window.innerWidth)){
                    alert("removing element");
                 } else if(firstMapDomElement) {
                    console.log("first element left>");
                    console.log(firstMapDomElement.offsetLeft);

                    console.log('window width >');
                    console.log(window.innerWidth);
                 }

        //creation

        const lastMapDomElement = document.getElementById('map_'+reduxContainer.mapBlocksOnScreen[reduxContainer.mapBlocksOnScreen.length - 1].id);

        if(lastMapDomElement && lastMapDomElement.offsetLeft < 0){
            console.log("creating element");

       }

       requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));

 }


 
 

const checkForScreenUpdateFromRightToLeft = (throttleNum: number): any => {

    if (throttleNum < 10) {
        throttleNum++;
        return requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));
    }

    throttleNum = 0;

        //creation

             //pick first map block

                 const firstMapDomElement = document.getElementById('map_'+reduxContainer.mapBlocksOnScreen[0].id);
                 
                 if(firstMapDomElement && firstMapDomElement.offsetLeft < (-window.innerWidth)){
                    alert("creating element");
                 }
        //deletion

        const lastMapDomElement = document.getElementById('map_'+reduxContainer.mapBlocksOnScreen[reduxContainer.mapBlocksOnScreen.length - 1].id);

        if(lastMapDomElement && lastMapDomElement.offsetLeft > window.innerWidth){
            console.log("removing last element from left to right");

       }

       requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));



 }
*/ 
