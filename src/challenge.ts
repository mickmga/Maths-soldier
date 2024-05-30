window.onload = () => {
    MAPS.push(createMapBlock(0));
    MAPS.push(createMapBlock(100));
    moveCamera();
    launchCharacterAnimation(heroImage, 0, 'png', 'assets/characters/hero/run', 1, 8, 1, true, ANIMATION_ID.run, ANIMATION_IDS[ANIMATION_ID.run]);   
    launchOpponent();
    moveEnemy();
    detectCollision();
}

const makeId = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

enum ANIMATION_ID {
    attack,
    run,
    opponent_run
}

const ANIMATION_IDS = {
  [ANIMATION_ID.attack]: makeId(20),
  [ANIMATION_ID.run]: makeId(20),
  [ANIMATION_ID.opponent_run]: makeId(20)
}

const createMapBlock = (left:number) => {
    const block = document.createElement('div');
    block.classList.add('mapBlock');
    block.style.left = `${left}vw`;

    const backgroundImage = document.createElement('img');
    backgroundImage.src='assets/maps/challenge_castle.webp';

    block.append(backgroundImage);

    document.getElementById('game_container')?.append(block);
    
    return block;
}

const MAPS: HTMLElement[] = [];

const moveCamera = () => {
    const gameContainer = document.getElementById('game_container')!
    gameContainer.style.left = `${gameContainer.offsetLeft - 4}px`;

    requestAnimationFrame(moveCamera)

}

const heroContainer = document.getElementById('hero_container')!;
const heroImage = document.getElementById('heroImg')! as HTMLImageElement;
const enemy = document.getElementById('enemyImg')! as HTMLImageElement;
const enemyContainer =  document.getElementById('enemy_container')!;
const errorScoreContainer = document.getElementById('error_score')!;
const successfulKillsScoreContainer  = document.getElementById('killed_score')!;
let errorScore = 0;
let successfulKillsScore = 0;




const updateScores = () => {
    errorScoreContainer.innerHTML = "Erreurs: " + errorScore.toString();
    successfulKillsScoreContainer.innerHTML = "Bonnes réponses: " + successfulKillsScore.toString();

}


const launchCharacterAnimation = (characterElement: HTMLImageElement,  throttleNum: number, extension:string, spriteBase: string, spriteIndex: number, max: number, min: number, loop: boolean, animationId: ANIMATION_ID, animationHash: string): any => {

    if(throttleNum < 5){
        throttleNum++;
      return requestAnimationFrame(() => launchCharacterAnimation(characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId, animationHash));

    }

    if(ANIMATION_IDS[animationId] !== animationHash){
        return;
    }

    throttleNum = 0;

    if(spriteIndex === max){


        if(loop === false){
    
            return;
        }

        spriteIndex = min;
    } else {
        spriteIndex++;
    }

    characterElement.src = `${spriteBase}/${spriteIndex}.${extension}`;

    requestAnimationFrame(() => launchCharacterAnimation(characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId, animationHash));

}


const launchAttack = () => {

    ANIMATION_IDS[ANIMATION_ID.run] = makeId(20);

    launchCharacterAnimation(heroImage, 0, 'png', 'assets/characters/hero/attack', 1, 4, 1, false, ANIMATION_ID.attack,  ANIMATION_IDS[ANIMATION_ID.attack]);

    setTimeout(
        () => {
            
       if(heroContainer.offsetLeft+ heroContainer.offsetWidth + (window.innerWidth * 0.05) > enemyContainer.offsetLeft){
          enemy.remove();
          enemyOnScreen=false;
          successfulKillsScore++;
          updateScores();
        }
        }, 500)


    setTimeout(
        () =>    launchCharacterAnimation(heroImage, 0, 'png', 'assets/characters/hero/run', 1, 8, 1, true, ANIMATION_ID.run, ANIMATION_IDS[ANIMATION_ID.run]), 1000
    )

}



const launchOpponent =  () => {

    launchCharacterAnimation(enemy, 0, 'png', 'assets/characters/enemies/wolf', 1, 9, 1, true, ANIMATION_ID.opponent_run, ANIMATION_IDS[ANIMATION_ID.opponent_run]);

}



document.addEventListener('keydown', (event) => {
    launchAttack();
});

let enemyOnScreen = true;


const moveEnemy = () => {

    if(!enemyOnScreen) return;

    enemyContainer.style.left = `${enemyContainer.offsetLeft - 5}px`;

    requestAnimationFrame(moveEnemy);
}

 const detectCollision = () => {

    if(heroContainer.offsetLeft > enemyContainer.offsetLeft){
        errorScore++;
        updateScores();

        return;
    }

    requestAnimationFrame(detectCollision);

 }

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