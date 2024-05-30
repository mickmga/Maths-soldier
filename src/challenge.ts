window.onload = () => {
    MAPS.push(createMapBlock(0));
    MAPS.push(createMapBlock(100));
    moveCamera();
    launchHeroAnimation(0, 'png', 'assets/characters/hero/run', 1, 8, 1, true, ANIMATION_ID.run, ANIMATION_IDS[ANIMATION_ID.run]);   
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
    run
}

const ANIMATION_IDS = {
  [ANIMATION_ID.attack]: makeId(20),
  [ANIMATION_ID.run]: makeId(20),
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

const heroImage = document.getElementById('heroImg')! as HTMLImageElement;



const launchHeroAnimation = (throttleNum: number, extension:string, spriteBase: string, spriteIndex: number, max: number, min: number, loop: boolean, animationId: ANIMATION_ID, animationHash: string): any => {

    if(throttleNum < 12){
        throttleNum++;
      return requestAnimationFrame(() => launchHeroAnimation(throttleNum, extension, spriteBase, spriteIndex, max, min, false, animationId, animationHash));

    }

    if(ANIMATION_IDS[animationId] !== animationHash){
        return;
    }

    throttleNum = 0;

    if(spriteIndex === max){


        if(loop === false){
        
            return;
        }

        console.log(loop)
        spriteIndex = min;
    } else {
        spriteIndex++;
    }

    heroImage.src = `${spriteBase}/${spriteIndex}.${extension}`;

    requestAnimationFrame(() => launchHeroAnimation(throttleNum, extension, spriteBase, spriteIndex, max, min, true, animationId, animationHash));

}


const launchAttack = () => {

    ANIMATION_IDS[ANIMATION_ID.run] = makeId(20);

    launchHeroAnimation(0, 'png', 'assets/characters/hero/attack', 1, 4, 1, false, ANIMATION_ID.attack,  ANIMATION_IDS[ANIMATION_ID.attack]);

    setTimeout(
        () =>    launchHeroAnimation(0, 'png', 'assets/characters/hero/run', 1, 8, 1, true, ANIMATION_ID.run, ANIMATION_IDS[ANIMATION_ID.run]), 1000
    )

    
}


document.addEventListener('keydown', (event) => {
    launchAttack();
})

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