export {}

const MAPS: HTMLElement[] = [];
const heroContainer = document.getElementById('hero_container')!;
const heroImage = document.getElementById('heroImg')! as HTMLImageElement;
const enemy = document.getElementById('enemyImg')! as HTMLImageElement;
const enemyContainer =  document.getElementById('enemy_container')!;
const errorScoreContainer = document.getElementById('error_score')!;
const successfulKillsScoreContainer  = document.getElementById('killed_score')!;
let errorScore = 0;
let successfulKillsScore = 0;

//local storage

let backgroundSrc = 'assets/palace/maps/castle/castle.gif';

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
    walk,
    opponent_run,
    camera_left_to_right,
    character_left_to_right_move
}

const ANIMATION_RUNNING_VALUES = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 0,
  [ANIMATION_ID.walk]: 0,
  [ANIMATION_ID.opponent_run]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 0
}

const createMapBlock = (left: number) => {
    const block = document.createElement('div');
    block.classList.add('mapBlock');
    const backgroundImage = document.createElement('img');
    backgroundImage.src = backgroundSrc;
    block.append(backgroundImage);
    block.style.position = 'fixed';
    block.style.left = `${left}vw`;

    document.getElementsByTagName('body')[0].append(block);
    
    return block;
}



const moveCamera = () => {

    if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] === 0 || ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] > 1) {
        return;
    }

    MAPS.forEach(
        map => map.style.left = `${map.offsetLeft - 4}px`
    )

    requestAnimationFrame(moveCamera);
}


const updateScores = () => {
    errorScoreContainer.innerHTML = "Erreurs: " + errorScore.toString();
    successfulKillsScoreContainer.innerHTML = "Bonnes réponses: " + successfulKillsScore.toString();
}

const launchAnimationAndDeclareItLaunched = (characterElement: HTMLImageElement,  throttleNum: number, extension:string, spriteBase: string, spriteIndex: number, max: number, min: number, loop: boolean, animationId: ANIMATION_ID) => {

    ANIMATION_RUNNING_VALUES[animationId]++;

    launchCharacterAnimation(characterElement,  throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId)
}


const launchCharacterAnimation = (characterElement: HTMLImageElement,  throttleNum: number, extension:string, spriteBase: string, spriteIndex: number, max: number, min: number, loop: boolean, animationId: ANIMATION_ID): any => {

    if(!ANIMATION_RUNNING_VALUES[animationId] || ANIMATION_RUNNING_VALUES[animationId] > 1) {
        return;
    }

    if(throttleNum < 5){
        throttleNum++;
      return requestAnimationFrame(() => launchCharacterAnimation(characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId));

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

    console.log


    characterElement.src = `${spriteBase}/${spriteIndex}.${extension}`;

    requestAnimationFrame(() => launchCharacterAnimation(characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId));

}

const launchAttack = () => {

    ANIMATION_RUNNING_VALUES[ANIMATION_ID.run]=0;

    launchAnimationAndDeclareItLaunched(heroImage, 0, 'png', 'assets/challenge/characters/hero/attack', 1, 4, 1, false, ANIMATION_ID.attack);

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
        () =>    launchAnimationAndDeclareItLaunched(heroImage, 0, 'png', 'assets/challenge/characters/hero/run', 1, 8, 1, true, ANIMATION_ID.run), 1000
    )

}


const launchOpponent =  () => {

    launchAnimationAndDeclareItLaunched(enemy, 0, 'png', 'assets/challenge/characters/enemies/wolf', 1, 9, 1, true, ANIMATION_ID.opponent_run);

}

let enemyOnScreen = true;


const moveEnemy = () => {

    if(!enemyOnScreen) return;

    enemyContainer.style.left = `${enemyContainer.offsetLeft - 10}px`;

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


const checkForScreenUpdateFromLeftToRight = (throttleNum: number): any => {

    if (throttleNum < 10) {
        throttleNum++;
        return requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));
    }

    throttleNum = 0;



        //deletion

             //pick first map block

                 const firstMapDomElement = MAPS[0];                 

                 if(MAPS[0].offsetLeft < (-window.innerWidth)){
                    MAPS.shift();
                 }

        //creation

        const lastMapDomElement = MAPS[MAPS.length-1];

        if(lastMapDomElement && lastMapDomElement.offsetLeft <= window.innerWidth/10 ){

            MAPS.push(createMapBlock( (MAPS[MAPS.length-1].offsetLeft + MAPS[MAPS.length-1].offsetWidth)/window.innerWidth * 100 ));            

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

                 const firstMapDomElement = MAPS[0];
                 
                 if(firstMapDomElement && firstMapDomElement.offsetLeft < (-window.innerWidth)){
                    alert("creating element");
                 } 
        //deletion

        const lastMapDomElement = MAPS[MAPS.length - 1];

        if(lastMapDomElement && lastMapDomElement.offsetLeft > window.innerWidth){
            console.log("removing last element from left to right");

       }

       requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));



 }

 //CHALLENGE.TS ENDING


 const initHero = () => {


 }


 const launchCharacterMovement = () => {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right]++;
    moveCamera();
    launchAnimationAndDeclareItLaunched(heroImage, 0, 'png', 'assets/palace/hero/old_walk', 1, 6, 1, true, ANIMATION_ID.walk);   
 }




 document.addEventListener('keydown', 
  
 (event) => {

    if(event.key === "d" && ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] === 0){
        ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move]++;
        launchCharacterMovement();
    }
 }

 );
 document.addEventListener('keyup', () => {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move]=0;
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.walk] = 0;
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right]=0;
  }
)

 window.onload = () => {
   MAPS.push(createMapBlock(-100));
   MAPS.push(createMapBlock(0));
   MAPS.push(createMapBlock(100));
   //moveCamera();
   //launchOpponent();
   //moveEnemy();
   //detectCollision();
   //checkForScreenUpdateFromLeftToRight(10);
}



//OK