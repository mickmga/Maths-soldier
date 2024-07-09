export {};

const MAPS: HTMLElement[] = [];
const heroContainer = document.getElementById("hero_container")!;
const heroImage = document.getElementById("heroImg")! as HTMLImageElement;

const errorScoreContainer = document.getElementById("error_score")!;
const successfulKillsScoreContainer = document.getElementById("killed_score")!;
let errorScore = 0;
let successfulKillsScore = 0;

const ennemiesOnScreen: Enemy[] = [];

let transformed = false;
let transformationOn = false;

class Answer {
  data: string;
  good: boolean;

  constructor(data: string, good: boolean) {
    this.data = data;
    this.good = good;
  }
}

type Topic = {
  title: string;
  good: Answer[];
  bad: Answer[];
};

class Enemy {
  element: HTMLElement;
  answer: Answer;

  constructor(element: HTMLElement, answer: Answer) {
    this.element = element;
    this.answer = answer;
  }
}

const CAPITALS = {
  title: "Capitals of the world",
  good: [new Answer("Paris", true), new Answer("London", true)],
  bad: [new Answer("Chicago", false), new Answer("Monaco", false)],
};

let topics: Topic[] = [CAPITALS];

//local storage

const getNextAnswer = () => {
  const randVal = Math.random() > 0.5;

  if (randVal) {
    return CAPITALS.good.length
      ? CAPITALS.good.pop()
      : CAPITALS.bad.length
      ? CAPITALS.bad.pop()
      : "done";
  } else {
    return CAPITALS.bad.length
      ? CAPITALS.bad.pop()
      : CAPITALS.good.length
      ? CAPITALS.good.pop()
      : "done";
  }
};

const buildEnemyElement = () => {
  const newOpponentContainer = document.createElement("div");
  newOpponentContainer.classList.add("enemy_container");
  const newEnnemyImg = document.createElement("img") as HTMLImageElement;
  newEnnemyImg.src = "assets/challenge/characters/enemies/wolf/1.png";

  newOpponentContainer.append(newEnnemyImg);

  document.getElementsByTagName("body")[0].append(newOpponentContainer);

  return newOpponentContainer;
};

const buildEnemy = (answer: Answer) => {
  //construct opponent at a specific point, run it

  const enemyElement = buildEnemyElement();

  if (!enemyElement) {
    console.log("error");
    return;
  }

  document.getElementsByTagName("body")[0].append();

  const enemy = new Enemy(enemyElement, answer);

  ennemiesOnScreen.push(enemy);

  return enemy;
};

const buildAndLaunchEnemy = (answer: Answer) => {
  const enemy = buildEnemy(answer);

  if (!enemy) {
    return;
  }

  launchOpponent(enemy);
};

const triggerOpponentsApparition = () => {
  const newAnswer = getNextAnswer();

  if (newAnswer && newAnswer !== "done") {
    buildAndLaunchEnemy(newAnswer);
  } else {
    console.log("we re done");
  }
};

let backgroundSrc = "assets/challenge/maps/challenge_castle.webp";

const makeId = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

enum ANIMATION_ID {
  attack,
  run,
  walk,
  opponent_run,
  opponent_death,
  camera_left_to_right,
  camera_right_to_left,
  character_left_to_right_move,
  transformation_pre_run,
  transformation_run,
}

const ANIMATION_RUNNING_VALUES = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 0,
  [ANIMATION_ID.walk]: 0,
  [ANIMATION_ID.opponent_run]: 0,
  [ANIMATION_ID.opponent_death]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 0,
  [ANIMATION_ID.transformation_pre_run]: 0,
  [ANIMATION_ID.transformation_run]: 0,
};

const THROTTLE_NUMS = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 5,
  [ANIMATION_ID.walk]: 5,
  [ANIMATION_ID.opponent_run]: 5,
  [ANIMATION_ID.opponent_death]: 0,
  [ANIMATION_ID.camera_left_to_right]: 5,
  [ANIMATION_ID.camera_right_to_left]: 5,
  [ANIMATION_ID.character_left_to_right_move]: 5,
  [ANIMATION_ID.transformation_pre_run]: 5,
  [ANIMATION_ID.transformation_run]: 5,
};

const createMapBlock = (left: number) => {
  const block = document.createElement("div");
  block.classList.add("mapBlock");
  const backgroundImage = document.createElement("img");
  backgroundImage.src = backgroundSrc;
  block.append(backgroundImage);
  block.style.position = "fixed";
  block.style.left = `${left}px`;

  document.getElementsByTagName("body")[0].append(block);

  return block;
};

const moveCamera = (direction: ANIMATION_ID) => {
  if (
    ANIMATION_RUNNING_VALUES[direction] === 0 ||
    ANIMATION_RUNNING_VALUES[direction] > 1
  ) {
    return;
  }

  MAPS.forEach(
    (map) =>
      (map.style.left = `${
        map.offsetLeft +
        (direction === ANIMATION_ID.camera_left_to_right ? -1 : 1) * 4
      }px`)
  );

  requestAnimationFrame(() => moveCamera(direction));
};

const updateScores = () => {
  errorScoreContainer.innerHTML = "Erreurs: " + errorScore.toString();
  successfulKillsScoreContainer.innerHTML =
    "Bonnes réponses: " + successfulKillsScore.toString();
};

const launchAnimationAndDeclareItLaunched = (
  characterElement: HTMLImageElement,
  throttleNum: number,
  extension: string,
  spriteBase: string,
  spriteIndex: number,
  max: number,
  min: number,
  loop: boolean,
  animationId: ANIMATION_ID
) => {
  ANIMATION_RUNNING_VALUES[animationId]++;

  launchCharacterAnimation(
    characterElement,
    throttleNum,
    extension,
    spriteBase,
    spriteIndex,
    max,
    min,
    loop,
    animationId
  );
};

const launchCharacterAnimation = (
  characterElement: HTMLImageElement,
  throttleNum: number,
  extension: string,
  spriteBase: string,
  spriteIndex: number,
  max: number,
  min: number,
  loop: boolean,
  animationId: ANIMATION_ID
): any => {
  if (!characterElement) alert("no element no more!");

  if (
    !ANIMATION_RUNNING_VALUES[animationId] ||
    ANIMATION_RUNNING_VALUES[animationId] > 1
  ) {
    return;
  }

  if (throttleNum < THROTTLE_NUMS[animationId]) {
    throttleNum++;
    return requestAnimationFrame(() =>
      launchCharacterAnimation(
        characterElement,
        throttleNum,
        extension,
        spriteBase,
        spriteIndex,
        max,
        min,
        loop,
        animationId
      )
    );
  }

  throttleNum = 0;

  if (spriteIndex === max) {
    if (loop === false) {
      ANIMATION_RUNNING_VALUES[animationId] = 0;
      return;
    }

    spriteIndex = min;
  } else {
    spriteIndex++;
  }

  characterElement.src = `${spriteBase}/${spriteIndex}.${extension}`;

  requestAnimationFrame(() =>
    launchCharacterAnimation(
      characterElement,
      throttleNum,
      extension,
      spriteBase,
      spriteIndex,
      max,
      min,
      loop,
      animationId
    )
  );
};

const initAnimation = (animationId: ANIMATION_ID) => {
  ANIMATION_RUNNING_VALUES[animationId] = 0;
};

const launchAttack = () => {
  if (transformed) {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_run] = 0;
  } else {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;
  }

  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    `assets/challenge/characters/${
      transformed ? "transformed_hero" : "hero"
    }/attack`,
    1,
    transformed ? 12 : 4,
    1,
    false,
    ANIMATION_ID.attack
  );

  const enemyCanBeHit = (enemy: Enemy) => {
    return (
      enemy.element.getBoundingClientRect().left >
        heroContainer.getBoundingClientRect().left +
          heroContainer.getBoundingClientRect().width &&
      enemy.element.getBoundingClientRect().left <
        heroContainer.getBoundingClientRect().left +
          heroContainer.getBoundingClientRect().width +
          window.innerWidth * 0.15
    );
  };

  ennemiesOnScreen.forEach((enemy) => {
    if (!enemyCanBeHit(enemy)) {
      console.log("Enemy can't be hit. Opponent left >");
      console.log(
        enemy.element.getBoundingClientRect().left +
          heroContainer.getBoundingClientRect().width
      );
      console.log(", hero left > ");
      console.log(heroContainer.getBoundingClientRect().left);
      return;
    }
    setTimeout(() => {
      destroyEnemyAndLaunchNewOne(enemy);
      successfulKillsScore++;
      updateScores();
    }, 400);
  });

  setTimeout(() => {
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      `assets/challenge/characters/${
        transformed ? "transformed_hero" : "hero"
      }/run`,
      1,
      transformed ? 6 : 8,
      1,
      true,
      transformed ? ANIMATION_ID.transformation_run : ANIMATION_ID.run
    );
  }, 200);
};

const launchOpponent = (enemy: Enemy) => {
  launchAnimationAndDeclareItLaunched(
    enemy.element.firstChild as HTMLImageElement,
    0,
    "png",
    "assets/challenge/characters/enemies/wolf",
    1,
    9,
    1,
    true,
    ANIMATION_ID.opponent_run
  );
  moveEnemy(enemy);
};

const moveEnemy = (enemy: Enemy) => {
  enemy.element.style.left = `${
    enemy.element.getBoundingClientRect().left - 10
  }px`;

  requestAnimationFrame(() => moveEnemy(enemy));
};

const destroyEnemy = (enemy: Enemy) => {
  const launchExplosion = () => {
    launchAnimationAndDeclareItLaunched(
      enemy.element.firstChild as HTMLImageElement,
      0,
      "png",
      "assets/challenge/explosion",
      1,
      10,
      1,
      false,
      ANIMATION_ID.opponent_death
    );
  };

  setTimeout(() => {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;
    enemy.element.remove();
    triggerOpponentsApparition();
  }, 300);

  launchExplosion();

  ennemiesOnScreen.forEach((enemyOnScreen, index) => {
    if (enemy === enemyOnScreen) {
      ennemiesOnScreen.splice(index, 1);
    }
  });
};

const destroyEnemyAndLaunchNewOne = (enemy: Enemy) => {
  destroyEnemy(enemy);
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;
};

const detectCollision = () => {
  ennemiesOnScreen.forEach((enemyOnScreen) => {
    if (
      heroContainer.offsetLeft >
      enemyOnScreen.element.getBoundingClientRect().left
    ) {
      errorScore++;
      updateScores();

      return;
    }
  });

  requestAnimationFrame(detectCollision);
};

const checkForScreenUpdateFromLeftToRight = (throttleNum: number): any => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] === 0) {
    return;
  }

  if (throttleNum < 10) {
    throttleNum++;
    return requestAnimationFrame(() =>
      checkForScreenUpdateFromLeftToRight(throttleNum)
    );
  }

  throttleNum = 0;

  //deletion

  //pick first map block

  const firstMapDomElement = MAPS[0];

  if (firstMapDomElement.offsetLeft < -window.innerWidth) {
    firstMapDomElement.remove();
    MAPS.shift();
  }

  //creation

  const lastMapDomElement = MAPS[MAPS.length - 1];

  if (
    lastMapDomElement &&
    lastMapDomElement.offsetLeft <= window.innerWidth / 10
  ) {
    MAPS.push(
      createMapBlock(
        lastMapDomElement.offsetLeft + lastMapDomElement.offsetWidth
      )
    );
  }

  requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));
};

const checkForScreenUpdateFromRightToLeft = (throttleNum: number): any => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] === 0) {
    return;
  }

  if (throttleNum < 10) {
    throttleNum++;
    return requestAnimationFrame(() =>
      checkForScreenUpdateFromRightToLeft(throttleNum)
    );
  }

  throttleNum = 0;

  //creation

  //pick first map block

  const firstMapDomElement = MAPS[0];

  if (
    firstMapDomElement &&
    firstMapDomElement.offsetLeft > -window.innerWidth
  ) {
    MAPS.unshift(
      createMapBlock(
        firstMapDomElement.offsetLeft - firstMapDomElement.offsetWidth
      )
    );
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

const initHero = () => {};

const launchCharacterMovement = () => {
  moveCamera(ANIMATION_ID.camera_left_to_right);
  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    "assets/palace/hero/old_walk",
    1,
    6,
    1,
    true,
    ANIMATION_ID.walk
  );
};

const launchCharacterMovementLeft = () => {
  moveCamera(ANIMATION_ID.camera_right_to_left);
  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    "assets/palace/hero/walk_left",
    1,
    6,
    1,
    true,
    ANIMATION_ID.walk
  );
};

const launchRun = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right]++;
  moveCamera(ANIMATION_ID.camera_left_to_right);
  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    "assets/challenge/characters/hero/run",
    1,
    8,
    1,
    true,
    ANIMATION_ID.run
  );
};

const heroInitialTop = heroContainer.getBoundingClientRect().top;

const launchFly = (jumpingForward = true) => {
  // Get the hero's current position from the bottom style property
  const currentTop = heroContainer.getBoundingClientRect().top;

  if (jumpingForward) {
    // Move the hero upwards
    const newTop = currentTop - window.innerHeight * 0.005;
    heroContainer.style.top = `${newTop}px`;

    // Check if the hero has reached the peak
    if (newTop <= heroInitialTop - window.innerHeight * 0.2) {
      jumpingForward = false;
    }
  } else {
    // Move the hero downwards
    const newTop = currentTop + window.innerHeight * 0.005;
    heroContainer.style.top = `${newTop}px`;

    // Check if the hero has returned to the initial position
    if (newTop >= heroInitialTop) {
      heroContainer.style.top = `${heroInitialTop}px`;
      //launchRun(); // Restart the run animation
      return;
    }
  }

  // Continue the animation
  requestAnimationFrame(() => launchFly(jumpingForward));
};
document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    turnInvisible();
  }
  if (event.key === "w") {
    launchAttack();
  }
  if (event.key === "b") {
    launchTransformation();
  }
});

const checkForOpponentsClearance = () => {
  ennemiesOnScreen.forEach((enemyOnScreen) => {
    if (
      heroContainer.getBoundingClientRect().left +
        heroContainer.getBoundingClientRect().width +
        window.innerWidth * 0.05 >
      enemyOnScreen.element.getBoundingClientRect().left
    ) {
    }
    if (enemyOnScreen.element.getBoundingClientRect().left < 0) {
      destroyEnemyAndLaunchNewOne(enemyOnScreen);
    }
  });

  requestAnimationFrame(checkForOpponentsClearance);
};

const turnInvisible = () => {
  heroContainer.style.opacity = "0.3";

  setTimeout(() => (heroContainer.style.opacity = "1"), 2000);
};

const launchTransformation = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;

  transformed = true;
  transformationOn = true;

  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    "assets/challenge/characters/transformed_hero/pre_run",
    1,
    9,
    1,
    true,
    ANIMATION_ID.transformation_pre_run
  );
  document.getElementById("transformation_background")!.style.display = "flex";

  clearAllOponentsAndTimeouts();
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;

  setTimeout(() => {
    transformationOn = false;
    triggerOpponentsApparition();

    document.getElementById("transformation_background")!.style.display =
      "none";

    ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_pre_run] = 0;

    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      "assets/challenge/characters/transformed_hero/run",
      1,
      6,
      1,
      true,
      ANIMATION_ID.transformation_run
    );
  }, 2000);
};

const clearAllOponentsAndTimeouts = () => {
  ennemiesOnScreen.forEach((enemy, index) => {
    enemy.element.remove();
    ennemiesOnScreen.splice(index, 1);
  });
};

window.onload = () => {
  MAPS.push(createMapBlock(0));
  MAPS.push(createMapBlock(100));
  launchRun();
  // detectCollision();
  checkForScreenUpdateFromLeftToRight(10);
  checkForOpponentsClearance();
  triggerOpponentsApparition();
};
