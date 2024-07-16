export {};

const MAPS: HTMLElement[] = [];
const heroContainer = document.getElementById("hero_container")!;
const heroImage = document.getElementById("heroImg")! as HTMLImageElement;

const scoreContainer = document.getElementById("score_value")!;

const answerDataContainer = document.getElementById("answer_data_container")!;
const answerDataValue = document.getElementById("answer_data_value")!;

const scoreMalusContainer = document.getElementById("score_malus_container")!;
const scoreMalusDetail = document.getElementById("score_malus_detail")!;

const scoreRewardContainer = document.getElementById("score_reward_container")!;

const scoreRewardDetail = document.getElementById("score_reward_detail")!;

const TRANSFORMED_BONUS_RATIO = 2;
const REWARD_UNIT = 1;

const REWARD_TIMEOUT_DURATION = 1000;
const KILLED_ENEMY_REWARD = 30;

let rewardStreak = 0;

let TRANSFORMATION_TRESHOLD = 1;

let preTransformed = false;

let gameFinished = false;

let timeStoped = false;

let score = 0;

let heroHurt = false;

let heroIsAlive = true;

const lifePoints = { max: 4, value: 4 };
let INVISIBILITY_DURATION_IN_MILLISECONDS = 600;

let invisible = false;

const ennemiesOnScreen: Enemy[] = [];

let transformed = false;

let currentMalusContainerTimeout: ReturnType<typeof setTimeout> | null = null;
let currentRewardContainerTimeout: ReturnType<typeof setTimeout> | null = null;
let currentTransformationRewardContainerTimeout: ReturnType<
  typeof setTimeout
> | null = null;

class Answer {
  data: string;
  good: boolean;

  constructor(data: string, good: boolean) {
    this.data = data;
    this.good = good;
  }
}

class Enemy {
  element: HTMLElement;
  answer: Answer;
  collideable = true;

  constructor(element: HTMLElement, answer: Answer) {
    this.element = element;
    this.answer = answer;
  }
}

enum TimeoutId {
  HERO,
  ENEMY,
}

type GameTimeouts = {
  [TimeoutId.HERO]: ReturnType<typeof setTimeout>[];
  [TimeoutId.ENEMY]: ReturnType<typeof setTimeout>[];
};

const GAME_TIMEOUTS: GameTimeouts = {
  [TimeoutId.HERO]: [],
  [TimeoutId.ENEMY]: [],
};

const CAPITALS = {
  title: "Additions",
  good: [
    new Answer("10+5=15", true),
    new Answer("6X6=36", true),
    new Answer("10X2=20", true),
    new Answer("10+12=22", true),
    new Answer("10-4=6", true),
    new Answer("6x3=18", true),
    new Answer("10-2=2x2x2", true),
    new Answer("10X3=15x2", true),
    new Answer("8+8=4X4", true),
    new Answer("10X5=25X2", true),
  ],
  bad: [
    new Answer("10+15=20", false),
    new Answer("6X3=21", false),
    new Answer("10x60=6000", false),
    new Answer("12x12.5=250", false),
    new Answer("15x2=20", false),
    new Answer("6x4=20", false),
    new Answer("10-5=20", false),
    new Answer("100X2=400", false),
    new Answer("8+22=40", false),
    new Answer("10X3=1000/100", false),
  ],
};

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

const Grades = {
  D: [0, 1, 2, 3, 4, 5],
  C: [6, 7, 8, 9, 10],
  B: [11, 12, 13, 14],
  A: [15, 16, 17],
  S: [18, 19, 20],
};

const getChallengeGrade = () => {
  return Grades.D.includes(score)
    ? "D"
    : Grades.C.includes(score)
    ? "C"
    : Grades.B.includes(score)
    ? "B"
    : Grades.A.includes(score)
    ? "A"
    : Grades.S.includes(score)
    ? "S"
    : null;
};
const updateLifePointsDisplay = () => {
  for (let i = 1; i <= lifePoints.max; i++) {
    const lifePointOpacity = i <= lifePoints.value ? "1" : "0.3";

    document.getElementById(`lifePointContainer_${i}`)!.style.opacity =
      lifePointOpacity;
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
  lightUpAnswerDataContainer();

  answerDataValue.innerHTML = enemy.answer.data;

  launchOpponent(enemy);
};

const triggerOpponentsApparition = () => {
  const newAnswer = getNextAnswer();

  if (newAnswer && newAnswer !== "done") {
    buildAndLaunchEnemy(newAnswer);
  } else {
    launchEndOfChallenge();
  }
};

let backgroundSrc = "assets/challenge/maps/challenge_castle.webp";

const calculateChallengeScore = () => {};

const launchEndOfChallenge = () => {
  gameFinished = true;
  clearGameTimeouts();
  initAllAnimations();
  heroImage.src = "assets/challenge/characters/hero/run/1.png";
  document.getElementById("transformation_background")!.style.display = "none";
};

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

export enum ANIMATION_ID {
  attack,
  run,
  walk,
  hurt,
  death,
  idle,
  stop_time,
  cancel_stop_time,
  opponent_run,
  opponent_move,
  opponent_death,
  camera_left_to_right,
  camera_right_to_left,
  character_left_to_right_move,
  transformation_pre_run,
  transformation_run,
  transformation_hurt,
  boss_idle,
  boss_attack,
}

export const ANIMATION_RUNNING_VALUES = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 0,
  [ANIMATION_ID.walk]: 0,
  [ANIMATION_ID.death]: 0,
  [ANIMATION_ID.hurt]: 0,
  [ANIMATION_ID.idle]: 0,
  [ANIMATION_ID.stop_time]: 0,
  [ANIMATION_ID.cancel_stop_time]: 0,
  [ANIMATION_ID.opponent_run]: 0,
  [ANIMATION_ID.opponent_death]: 0,
  [ANIMATION_ID.opponent_move]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 0,
  [ANIMATION_ID.transformation_pre_run]: 0,
  [ANIMATION_ID.transformation_run]: 0,
  [ANIMATION_ID.transformation_hurt]: 0,
  [ANIMATION_ID.boss_idle]: 0,
  [ANIMATION_ID.boss_attack]: 0,
};

export const THROTTLE_NUMS = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 5,
  [ANIMATION_ID.walk]: 5,
  [ANIMATION_ID.death]: 5,
  [ANIMATION_ID.hurt]: 0,
  [ANIMATION_ID.idle]: 20,
  [ANIMATION_ID.stop_time]: 5,
  [ANIMATION_ID.cancel_stop_time]: 5,
  [ANIMATION_ID.opponent_run]: 5,
  [ANIMATION_ID.opponent_death]: 0,
  [ANIMATION_ID.opponent_move]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 5,
  [ANIMATION_ID.character_left_to_right_move]: 5,
  [ANIMATION_ID.transformation_pre_run]: 5,
  [ANIMATION_ID.transformation_run]: 5,
  [ANIMATION_ID.transformation_hurt]: 0,
  [ANIMATION_ID.boss_idle]: 15,
  [ANIMATION_ID.boss_attack]: 10,
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

const slowTime = (multiplicator: number) => {
  const runMultiplicatorBase = THROTTLE_NUMS[ANIMATION_ID.run]
    ? THROTTLE_NUMS[ANIMATION_ID.run]
    : 1;
  THROTTLE_NUMS[ANIMATION_ID.run] =
    runMultiplicatorBase * multiplicator * 1.5 * 1.5;

  const cameraMoveMultiplicatorBase = THROTTLE_NUMS[
    ANIMATION_ID.camera_left_to_right
  ]
    ? THROTTLE_NUMS[ANIMATION_ID.camera_left_to_right]
    : 1;
  THROTTLE_NUMS[ANIMATION_ID.camera_left_to_right] =
    cameraMoveMultiplicatorBase * multiplicator * 1.5;

  const opponentRunMultiplicatorBase = THROTTLE_NUMS[ANIMATION_ID.opponent_run]
    ? THROTTLE_NUMS[ANIMATION_ID.opponent_run]
    : 1;
  THROTTLE_NUMS[ANIMATION_ID.opponent_run] =
    opponentRunMultiplicatorBase * multiplicator;

  const opponentMoveMultiplicatorBase = THROTTLE_NUMS[
    ANIMATION_ID.opponent_move
  ]
    ? THROTTLE_NUMS[ANIMATION_ID.opponent_move]
    : 1;
  THROTTLE_NUMS[ANIMATION_ID.opponent_move] =
    opponentMoveMultiplicatorBase * multiplicator * 2;
};

const moveCamera = (direction: ANIMATION_ID, throttleNum = 0): any => {
  if (
    ANIMATION_RUNNING_VALUES[direction] === 0 ||
    ANIMATION_RUNNING_VALUES[direction] > 1
  ) {
    return;
  }

  if (throttleNum < THROTTLE_NUMS[ANIMATION_ID.camera_left_to_right]) {
    throttleNum++;
    return requestAnimationFrame(() => moveCamera(direction, throttleNum));
  }

  throttleNum = 0;

  MAPS.forEach(
    (map) =>
      (map.style.left = `${
        map.offsetLeft +
        (direction === ANIMATION_ID.camera_left_to_right ? -1 : 1) * 4
      }px`)
  );

  requestAnimationFrame(() => moveCamera(direction));
};

export const launchAnimationAndDeclareItLaunched = (
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
  if (gameFinished) {
    return;
  }

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

const initAllAnimations = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.attack] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.death] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.hurt] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.idle] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_death] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_pre_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_hurt] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.boss_idle] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.boss_attack] = 0;
};

const turnHeroTransformationOff = () => {
  transformed = false;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_run] = 0;

  launchHeroRunAnimation();
};

const launchAttack = () => {
  if (invisible || !heroIsAlive) {
    return;
  }
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
      return;
    }
    if (!enemy.answer.good) {
      killWrongEnemy(enemy);
    } else {
      killRightEnemyAndUpdateScore(enemy);
    }
  });

  if (preTransformed || !heroIsAlive) {
    return;
  }

  clearTimeoutAndLaunchNewOne(
    TimeoutId.HERO,
    setTimeout(() => {
      if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] === 0)
        launchHeroRunAnimation();
    }, 200)
  );
};

const clearTimeoutAndLaunchNewOne = (
  timeoutId: TimeoutId,
  timeout: ReturnType<typeof setTimeout>
) => {
  GAME_TIMEOUTS[timeoutId].forEach((gameTimout) => clearTimeout(gameTimout));

  GAME_TIMEOUTS[timeoutId] = [timeout];
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

const moveEnemy = (enemy: Enemy, throttleNum = 0): any => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] !== 1) {
    return;
  }
  if (throttleNum < THROTTLE_NUMS[ANIMATION_ID.opponent_move]) {
    throttleNum++;
    return requestAnimationFrame(() => moveEnemy(enemy, throttleNum));
  }

  throttleNum = 0;

  enemy.element.style.left = `${
    enemy.element.getBoundingClientRect().left - 10
  }px`;

  requestAnimationFrame(() => moveEnemy(enemy));
};

const killRightEnemyAndUpdateScore = (enemy: Enemy) => {
  killEnemy(enemy);

  rewardHero();
};

const rewardHero = () => {
  const bonus_ratio = transformed ? TRANSFORMED_BONUS_RATIO : 1;
  rewardStreak++;

  score += bonus_ratio * REWARD_UNIT;
  updateScoreDisplay();

  displayReward("Congrats! You destroyed a good answer!");

  if (transformed) {
    displayTransformationKillReward(
      `Transformation bonus reward! X${TRANSFORMED_BONUS_RATIO}`
    );
  }
  if (
    rewardStreak >= TRANSFORMATION_TRESHOLD &&
    !transformed &&
    !preTransformed
  ) {
    rewardStreak = 0;
    launchTransformation();
  }
};

const updateScoreDisplay = () => {
  scoreContainer.innerHTML = (score * KILLED_ENEMY_REWARD).toString();
};

const killWrongEnemy = (enemy: Enemy) => {
  scoreMalusContainer.style.display = "flex";

  lifePoints.value--;
  checkForHerosDeath();

  updateLifePointsDisplay();

  killEnemy(enemy);

  displayMalus("MALUS! Wrong enemy killed!");
};

const displayMalus = (content: string) => {
  if (currentMalusContainerTimeout) {
    clearTimeout(currentMalusContainerTimeout);
    currentMalusContainerTimeout = null;
  }

  // scoreMalusDetail.innerHTML = content;
  scoreMalusContainer.style.display = "flex";

  currentMalusContainerTimeout = setTimeout(() => {
    scoreMalusDetail.innerHTML = "";
    scoreMalusContainer.style.display = "none";
  }, 2000);
};

const hideMalus = () => {
  hideReward();
  if (currentMalusContainerTimeout) {
    clearTimeout(currentMalusContainerTimeout);
    currentMalusContainerTimeout = null;
  }

  scoreMalusDetail.innerHTML = "";
  scoreMalusContainer.style.display = "none";
};

const displayReward = (content: string) => {
  hideMalus();
  if (currentRewardContainerTimeout) {
    clearTimeout(currentRewardContainerTimeout);
    currentRewardContainerTimeout = null;
  }

  //  scoreRewardDetail.innerHTML = content;
  scoreRewardContainer.style.display = "flex";

  currentRewardContainerTimeout = setTimeout(() => {
    scoreRewardDetail.innerHTML = "";
    scoreRewardContainer.style.display = "none";
  }, 2000);
};

const displayTransformationKillReward = (content: string) => {
  const transformationRewardContainer = document.getElementById(
    "transformed_hero_bonus_reward_container"
  )!;
  transformationRewardContainer.style.display = "flex";

  if (currentTransformationRewardContainerTimeout) {
    clearTimeout(currentTransformationRewardContainerTimeout);
    currentTransformationRewardContainerTimeout = null;
  }

  currentRewardContainerTimeout = setTimeout(() => {
    transformationRewardContainer.style.display = "none";
  }, REWARD_TIMEOUT_DURATION);
};

const hideReward = () => {};

const killEnemy = (enemy: Enemy) => {
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

  launchExplosion();

  destroyEnemyAndLaunchNewOne(enemy);
};

const destroyEnemy = (enemy: Enemy) => {
  clearAndHideAnswerDataContainer();

  setTimeout(() => {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;
    enemy.element.remove();
    triggerOpponentsApparition();
  }, 300);

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

const hurtHero = () => {
  if (!heroIsAlive) {
    return;
  }
  rewardStreak = 0;

  heroHurt = true;
  lifePoints.value--;
  checkForHerosDeath();

  updateLifePointsDisplay();
  launchHeroHurtAnimation();
  displayMalus("Malus! You were hurt!");
};

const checkForHerosDeath = () => {
  if (lifePoints.value === 0) {
    killHero();
  }
};

const killHero = () => {
  heroIsAlive = false;
  launchDeathAnimation();
};

const detectCollision = () => {
  ennemiesOnScreen.forEach((enemyOnScreen) => {
    if (
      heroContainer.getBoundingClientRect().left +
        heroContainer.getBoundingClientRect().width >
        enemyOnScreen.element.getBoundingClientRect().left &&
      enemyOnScreen.collideable
    ) {
      enemyOnScreen.collideable = false;

      if (!invisible || enemyOnScreen.answer.good) {
        hurtHero();
      } else if (invisible && !enemyOnScreen.answer.good) {
        rewardHero();
      }
    }
  });

  requestAnimationFrame(detectCollision);
};

const checkForScreenUpdateFromLeftToRight = (throttleNum: number): any => {
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

  const lastMapDomElement = MAPS[MAPS.length - 1];

  if (lastMapDomElement && lastMapDomElement.offsetLeft > window.innerWidth) {
    lastMapDomElement.remove();
    MAPS.pop();
  }

  requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));
};

const launchHeroRunAnimation = () => {
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
};

const launchRun = () => {
  if (timeStoped) {
    return;
  }
  startCamera();
  moveCamera(ANIMATION_ID.camera_left_to_right);
  launchHeroRunAnimation();
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
      return;
    }
  }

  // Continue the animation
  requestAnimationFrame(() => launchFly(jumpingForward));
};
document.addEventListener("keydown", (event) => {
  if (heroHurt || preTransformed) {
    return;
  }
  if (event.key === " " && !invisible) {
    launchInvisibilityToggle();
  }
  if (event.key === "w") {
    launchAttack();
  }

  if (event.key === "v") {
    slowTime(10);
  }

  if (event.key === "y") {
    launchDeathAnimation();
  }

  if (event.key === "s") {
    if (timeStoped) {
      cancelStopTimeSpell();
    } else {
      stopTime();
    }
  }
});

const clearGameTimeouts = () => {
  GAME_TIMEOUTS[TimeoutId.HERO].forEach((timeout) => clearTimeout(timeout));
  GAME_TIMEOUTS[TimeoutId.HERO] = [];

  GAME_TIMEOUTS[TimeoutId.ENEMY].forEach((timeout) => clearTimeout(timeout));
  GAME_TIMEOUTS[TimeoutId.ENEMY] = [];
};

const stopTime = () => {
  timeStoped = true;

  clearGameTimeouts();

  ANIMATION_RUNNING_VALUES[ANIMATION_ID.attack] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.death] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.hurt] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.idle] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_death] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_pre_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_hurt] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.boss_idle] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.boss_attack] = 0;

  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    "assets/challenge/characters/hero/stop_time",
    1,
    4,
    1,
    false,
    ANIMATION_ID.stop_time
  );
};

const cancelStopTimeSpell = () => {
  timeStoped = false;

  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    "assets/challenge/characters/hero/cancel_stop_time",
    1,
    4,
    1,
    false,
    ANIMATION_ID.cancel_stop_time
  );

  clearTimeoutAndLaunchNewOne(
    TimeoutId.HERO,
    setTimeout(() => {
      initAllAnimations();
      launchRun();
      ennemiesOnScreen.forEach((enemy) => launchOpponent(enemy));
    }, 1000)
  );
};

const checkForOpponentsClearance = () => {
  ennemiesOnScreen.forEach((enemyOnScreen) => {
    if (
      heroContainer.getBoundingClientRect().left +
        heroContainer.getBoundingClientRect().width +
        window.innerWidth * 0.05 >
      enemyOnScreen.element.getBoundingClientRect().left
    ) {
    }
    if (
      enemyOnScreen.element.getBoundingClientRect().left <
      0 - window.innerWidth * 0.2
    ) {
      destroyEnemyAndLaunchNewOne(enemyOnScreen);
    }
  });

  requestAnimationFrame(checkForOpponentsClearance);
};

const launchInvisibilityToggle = () => {
  invisible = !invisible;

  heroContainer.style.opacity = invisible ? "0.3" : "1";

  if (!invisible) {
    return;
  }

  setTimeout(launchInvisibilityToggle, INVISIBILITY_DURATION_IN_MILLISECONDS);
};

const launchTransformation = () => {
  if (timeStoped) {
    return;
  }

  ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;

  document.getElementById("transformation_background")!.style.display = "flex";

  heroImage.src = "assets/challenge/characters/hero/walk/1.png";

  preTransformed = true;

  clearAllOponentsAndTimeouts();

  clearTimeoutAndLaunchNewOne(
    TimeoutId.HERO,
    setTimeout(() => {
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

      ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;

      clearTimeoutAndLaunchNewOne(
        TimeoutId.HERO,
        setTimeout(() => {
          triggerOpponentsApparition();

          document.getElementById("transformation_background")!.style.display =
            "none";

          ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_pre_run] = 0;

          transformed = true;

          preTransformed = false;

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

          setTimeout(turnHeroTransformationOff, 5000);
        }, 2000)
      );
    }, 500)
  );
};

const clearAllOponentsAndTimeouts = () => {
  ennemiesOnScreen.forEach((enemy, index) => {
    enemy.element.remove();
    ennemiesOnScreen.splice(index, 1);
  });
};

const lightUpAnswerDataContainer = () => {
  answerDataContainer.style.opacity = "1";
};

const clearAndHideAnswerDataContainer = () => {
  answerDataContainer.style.opacity = "0.3";
  answerDataValue.innerHTML = "";
};

const launchDeathAnimation = () => {
  initHeroAnimations();
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;

  const killHero = () => {
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      "assets/challenge/characters/hero/death",
      1,
      6,
      1,
      false,
      ANIMATION_ID.death
    );

    clearGameTimeouts();

    setTimeout(
      () => (window.location.href = "http://localhost:3001/dead"),
      1000
    );
  };

  if (transformed) {
    transformed = false;
  }

  heroImage.src = "assets/challenge/characters/hero/death/1.png";

  setTimeout(killHero, 1000);
};

const launchHeroHurtAnimation = () => {
  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    transformed
      ? "assets/challenge/characters/transformed_hero/hurt"
      : "assets/challenge/characters/hero/hurt",
    1,
    transformed ? 5 : 3,
    1,
    false,
    transformed ? ANIMATION_ID.transformation_hurt : ANIMATION_ID.hurt
  );

  initHeroAnimations();

  stopCamera();

  clearTimeoutAndLaunchNewOne(
    TimeoutId.HERO,
    setTimeout(() => {
      heroHurt = false;
      if (heroIsAlive && ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] === 0) {
        launchRun();
      }
    }, 500)
  );
};

const stopCamera = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
};

const startCamera = () => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] > 0) {
    return;
  }
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right]++;
};

const initHeroAnimations = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_pre_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.hurt] = 0;
};

window.onload = () => {
  MAPS.push(createMapBlock(0));
  MAPS.push(createMapBlock(100));
  updateLifePointsDisplay();
  updateScoreDisplay();
  launchRun();
  detectCollision();
  checkForScreenUpdateFromLeftToRight(10);
  checkForOpponentsClearance();
  triggerOpponentsApparition();
};
