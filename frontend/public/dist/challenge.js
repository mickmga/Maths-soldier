"use strict";
(() => {
  // src/challenge.ts
  var MAPS = [];
  var heroContainer = document.getElementById("hero_container");
  var heroImage = document.getElementById("heroImg");
  var scoreContainer = document.getElementById("score_value");
  var answerDataContainer = document.getElementById("answer_data_container");
  var answerDataValue = document.getElementById("answer_data_value");
  var scoreMalusContainer = document.getElementById("score_malus_container");
  var scoreMalusDetail = document.getElementById("score_malus_detail");
  var scoreRewardContainer = document.getElementById("score_reward_container");
  var scoreRewardDetail = document.getElementById("score_reward_detail");
  var TRANSFORMED_BONUS_RATIO = 2;
  var REWARD_UNIT = 1;
  var transformedAlready = false;
  var REWARD_TIMEOUT_DURATION = 1e3;
  var KILLED_ENEMY_REWARD = 30;
  var rewardStreak = 0;
  var TRANSFORMATION_THRESHOLD = 4;
  var preTransformed = false;
  var gameFinished = false;
  var timeStoped = false;
  var score = 0;
  var heroHurt = false;
  var heroIsAlive = true;
  var lifePoints = { max: 4, value: 4 };
  var INVISIBILITY_DURATION_IN_MILLISECONDS = 600;
  var invisible = false;
  var ennemiesOnScreen = [];
  var transformed = false;
  var currentMalusContainerTimeout = null;
  var currentRewardContainerTimeout = null;
  var currentTransformationRewardContainerTimeout = null;
  var Answer = class {
    constructor(data, good) {
      this.data = data;
      this.good = good;
    }
  };
  var Enemy = class {
    constructor(element, answer) {
      this.collideable = true;
      this.element = element;
      this.answer = answer;
    }
  };
  var GAME_TIMEOUTS = {
    [0 /* HERO */]: [],
    [1 /* ENEMY */]: []
  };
  var CAPITALS = {
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
      new Answer("10X5=25X2", true)
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
      new Answer("10X3=1000/100", false)
    ]
  };
  var getNextAnswer = () => {
    const randVal = Math.random() > 0.5;
    if (randVal) {
      return CAPITALS.good.length ? CAPITALS.good.pop() : CAPITALS.bad.length ? CAPITALS.bad.pop() : "done";
    } else {
      return CAPITALS.bad.length ? CAPITALS.bad.pop() : CAPITALS.good.length ? CAPITALS.good.pop() : "done";
    }
  };
  var Grades = {
    D: [0, 1, 2, 3, 4, 5],
    C: [6, 7, 8, 9, 10],
    B: [11, 12, 13, 14],
    A: [15, 16, 17],
    S: [18, 19, 20]
  };
  var getChallengeGrade = () => {
    return Grades.D.includes(score) ? "D" : Grades.C.includes(score) ? "C" : Grades.B.includes(score) ? "B" : Grades.A.includes(score) ? "A" : "S";
  };
  var updateLifePointsDisplay = () => {
    for (let i = 1; i <= lifePoints.max; i++) {
      const lifePointOpacity = i <= lifePoints.value ? "1" : "0.3";
      document.getElementById(`lifePointContainer_${i}`).style.opacity = lifePointOpacity;
    }
  };
  var buildEnemyElement = () => {
    const newOpponentContainer = document.createElement("div");
    newOpponentContainer.classList.add("enemy_container");
    const newEnnemyImg = document.createElement("img");
    newEnnemyImg.src = "assets/challenge/characters/enemies/wolf/1.png";
    newOpponentContainer.append(newEnnemyImg);
    document.getElementsByTagName("body")[0].append(newOpponentContainer);
    return newOpponentContainer;
  };
  var buildEnemy = (answer) => {
    const enemyElement = buildEnemyElement();
    if (!enemyElement) {
      return;
    }
    document.getElementsByTagName("body")[0].append();
    const enemy = new Enemy(enemyElement, answer);
    ennemiesOnScreen.push(enemy);
    return enemy;
  };
  var buildAndLaunchEnemy = (answer) => {
    const enemy = buildEnemy(answer);
    if (!enemy) {
      return;
    }
    lightUpAnswerDataContainer();
    answerDataValue.innerHTML = enemy.answer.data;
    launchOpponent(enemy);
  };
  var triggerOpponentsApparition = () => {
    const newAnswer = getNextAnswer();
    if (newAnswer && newAnswer !== "done") {
      buildAndLaunchEnemy(newAnswer);
    } else {
      launchEndOfChallenge();
    }
  };
  var backgroundSrc = "assets/challenge/maps/challenge_castle.webp";
  var launchEndOfChallenge = () => {
    gameFinished = true;
    document.getElementById("endOfGameInterface").style.display = "flex";
    clearGameTimeouts();
    initAllAnimations();
    heroImage.src = "assets/challenge/characters/hero/run/1.png";
    document.getElementById("transformation_background").style.display = "none";
    setTimeout(() => {
      const grade = getChallengeGrade();
      if (!grade) {
        return;
      }
      document.getElementById("endOfGameInterfaceScore").innerHTML = grade;
      document.getElementById("endOfGameInterfaceScore").style.display = "flex";
    }, 1e3);
  };
  var ANIMATION_ID = /* @__PURE__ */ ((ANIMATION_ID2) => {
    ANIMATION_ID2[ANIMATION_ID2["attack"] = 0] = "attack";
    ANIMATION_ID2[ANIMATION_ID2["run"] = 1] = "run";
    ANIMATION_ID2[ANIMATION_ID2["walk"] = 2] = "walk";
    ANIMATION_ID2[ANIMATION_ID2["hurt"] = 3] = "hurt";
    ANIMATION_ID2[ANIMATION_ID2["death"] = 4] = "death";
    ANIMATION_ID2[ANIMATION_ID2["idle"] = 5] = "idle";
    ANIMATION_ID2[ANIMATION_ID2["stop_time"] = 6] = "stop_time";
    ANIMATION_ID2[ANIMATION_ID2["cancel_stop_time"] = 7] = "cancel_stop_time";
    ANIMATION_ID2[ANIMATION_ID2["opponent_run"] = 8] = "opponent_run";
    ANIMATION_ID2[ANIMATION_ID2["opponent_move"] = 9] = "opponent_move";
    ANIMATION_ID2[ANIMATION_ID2["opponent_death"] = 10] = "opponent_death";
    ANIMATION_ID2[ANIMATION_ID2["camera_left_to_right"] = 11] = "camera_left_to_right";
    ANIMATION_ID2[ANIMATION_ID2["camera_right_to_left"] = 12] = "camera_right_to_left";
    ANIMATION_ID2[ANIMATION_ID2["character_left_to_right_move"] = 13] = "character_left_to_right_move";
    ANIMATION_ID2[ANIMATION_ID2["transformation_pre_run"] = 14] = "transformation_pre_run";
    ANIMATION_ID2[ANIMATION_ID2["transformation_run"] = 15] = "transformation_run";
    ANIMATION_ID2[ANIMATION_ID2["transformation_hurt"] = 16] = "transformation_hurt";
    ANIMATION_ID2[ANIMATION_ID2["boss_idle"] = 17] = "boss_idle";
    ANIMATION_ID2[ANIMATION_ID2["boss_attack"] = 18] = "boss_attack";
    return ANIMATION_ID2;
  })(ANIMATION_ID || {});
  var ANIMATION_RUNNING_VALUES = {
    [0 /* attack */]: 0,
    [1 /* run */]: 0,
    [2 /* walk */]: 0,
    [4 /* death */]: 0,
    [3 /* hurt */]: 0,
    [5 /* idle */]: 0,
    [6 /* stop_time */]: 0,
    [7 /* cancel_stop_time */]: 0,
    [8 /* opponent_run */]: 0,
    [10 /* opponent_death */]: 0,
    [9 /* opponent_move */]: 0,
    [11 /* camera_left_to_right */]: 0,
    [12 /* camera_right_to_left */]: 0,
    [13 /* character_left_to_right_move */]: 0,
    [14 /* transformation_pre_run */]: 0,
    [15 /* transformation_run */]: 0,
    [16 /* transformation_hurt */]: 0,
    [17 /* boss_idle */]: 0,
    [18 /* boss_attack */]: 0
  };
  var THROTTLE_NUMS = {
    [0 /* attack */]: 0,
    [1 /* run */]: 5,
    [2 /* walk */]: 5,
    [4 /* death */]: 5,
    [3 /* hurt */]: 0,
    [5 /* idle */]: 20,
    [6 /* stop_time */]: 5,
    [7 /* cancel_stop_time */]: 5,
    [8 /* opponent_run */]: 5,
    [10 /* opponent_death */]: 0,
    [9 /* opponent_move */]: 0,
    [11 /* camera_left_to_right */]: 0,
    [12 /* camera_right_to_left */]: 5,
    [13 /* character_left_to_right_move */]: 5,
    [14 /* transformation_pre_run */]: 5,
    [15 /* transformation_run */]: 5,
    [16 /* transformation_hurt */]: 0,
    [17 /* boss_idle */]: 15,
    [18 /* boss_attack */]: 10
  };
  var createMapBlock = (left) => {
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
  var slowTime = (multiplicator) => {
    const runMultiplicatorBase = THROTTLE_NUMS[1 /* run */] ? THROTTLE_NUMS[1 /* run */] : 1;
    THROTTLE_NUMS[1 /* run */] = runMultiplicatorBase * multiplicator * 1.5 * 1.5;
    const cameraMoveMultiplicatorBase = THROTTLE_NUMS[11 /* camera_left_to_right */] ? THROTTLE_NUMS[11 /* camera_left_to_right */] : 1;
    THROTTLE_NUMS[11 /* camera_left_to_right */] = cameraMoveMultiplicatorBase * multiplicator * 1.5;
    const opponentRunMultiplicatorBase = THROTTLE_NUMS[8 /* opponent_run */] ? THROTTLE_NUMS[8 /* opponent_run */] : 1;
    THROTTLE_NUMS[8 /* opponent_run */] = opponentRunMultiplicatorBase * multiplicator;
    const opponentMoveMultiplicatorBase = THROTTLE_NUMS[9 /* opponent_move */] ? THROTTLE_NUMS[9 /* opponent_move */] : 1;
    THROTTLE_NUMS[9 /* opponent_move */] = opponentMoveMultiplicatorBase * multiplicator * 2;
  };
  var moveCamera = (direction, throttleNum = 0) => {
    if (ANIMATION_RUNNING_VALUES[direction] === 0 || ANIMATION_RUNNING_VALUES[direction] > 1) {
      return;
    }
    if (throttleNum < THROTTLE_NUMS[11 /* camera_left_to_right */]) {
      throttleNum++;
      return requestAnimationFrame(() => moveCamera(direction, throttleNum));
    }
    throttleNum = 0;
    MAPS.forEach(
      (map) => map.style.left = `${map.offsetLeft + (direction === 11 /* camera_left_to_right */ ? -1 : 1) * 12}px`
    );
    requestAnimationFrame(() => moveCamera(direction));
  };
  var launchAnimationAndDeclareItLaunched = (characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId) => {
    if (ANIMATION_RUNNING_VALUES[animationId] >= 1) {
      return;
    }
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
  var launchCharacterAnimation = (characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId) => {
    if (gameFinished) {
      return;
    }
    if (!ANIMATION_RUNNING_VALUES[animationId] || ANIMATION_RUNNING_VALUES[animationId] > 1) {
      return;
    }
    if (throttleNum < THROTTLE_NUMS[animationId]) {
      throttleNum++;
      return requestAnimationFrame(
        () => launchCharacterAnimation(
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
    requestAnimationFrame(
      () => launchCharacterAnimation(
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
  var initAllAnimations = () => {
    ANIMATION_RUNNING_VALUES[0 /* attack */] = 0;
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    ANIMATION_RUNNING_VALUES[4 /* death */] = 0;
    ANIMATION_RUNNING_VALUES[3 /* hurt */] = 0;
    ANIMATION_RUNNING_VALUES[5 /* idle */] = 0;
    ANIMATION_RUNNING_VALUES[8 /* opponent_run */] = 0;
    ANIMATION_RUNNING_VALUES[10 /* opponent_death */] = 0;
    ANIMATION_RUNNING_VALUES[9 /* opponent_move */] = 0;
    ANIMATION_RUNNING_VALUES[11 /* camera_left_to_right */] = 0;
    ANIMATION_RUNNING_VALUES[12 /* camera_right_to_left */] = 0;
    ANIMATION_RUNNING_VALUES[13 /* character_left_to_right_move */] = 0;
    ANIMATION_RUNNING_VALUES[14 /* transformation_pre_run */] = 0;
    ANIMATION_RUNNING_VALUES[15 /* transformation_run */] = 0;
    ANIMATION_RUNNING_VALUES[16 /* transformation_hurt */] = 0;
    ANIMATION_RUNNING_VALUES[17 /* boss_idle */] = 0;
    ANIMATION_RUNNING_VALUES[18 /* boss_attack */] = 0;
  };
  var turnHeroTransformationOff = () => {
    transformed = false;
    ANIMATION_RUNNING_VALUES[15 /* transformation_run */] = 0;
    launchHeroRunAnimation();
  };
  var launchAttack = () => {
    if (invisible || !heroIsAlive) {
      return;
    }
    if (transformed) {
      ANIMATION_RUNNING_VALUES[15 /* transformation_run */] = 0;
    } else {
      ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    }
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      `assets/challenge/characters/${transformed ? "transformed_hero" : "hero"}/attack`,
      1,
      transformed ? 12 : 4,
      1,
      false,
      0 /* attack */
    );
    const enemyCanBeHit = (enemy) => {
      return enemy.element.getBoundingClientRect().left > heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width && enemy.element.getBoundingClientRect().left < heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width + window.innerWidth * 0.15;
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
      0 /* HERO */,
      setTimeout(() => {
        launchHeroRunAnimation();
      }, 200)
    );
  };
  var clearTimeoutAndLaunchNewOne = (timeoutId, timeout) => {
    GAME_TIMEOUTS[timeoutId].forEach((gameTimout) => clearTimeout(gameTimout));
    GAME_TIMEOUTS[timeoutId] = [timeout];
  };
  var launchOpponent = (enemy) => {
    launchAnimationAndDeclareItLaunched(
      enemy.element.firstChild,
      0,
      "png",
      "assets/challenge/characters/enemies/black_spirit",
      1,
      8,
      1,
      true,
      8 /* opponent_run */
    );
    moveEnemy(enemy);
  };
  var moveEnemy = (enemy, throttleNum = 0) => {
    if (ANIMATION_RUNNING_VALUES[8 /* opponent_run */] !== 1) {
      return;
    }
    if (throttleNum < THROTTLE_NUMS[9 /* opponent_move */]) {
      throttleNum++;
      return requestAnimationFrame(() => moveEnemy(enemy, throttleNum));
    }
    throttleNum = 0;
    enemy.element.style.left = `${enemy.element.getBoundingClientRect().left - 10}px`;
    requestAnimationFrame(() => moveEnemy(enemy));
  };
  var initRewardStreakAndCheckForTransform = () => {
    if (rewardStreak >= TRANSFORMATION_THRESHOLD && !transformed) {
      rewardStreak = 0;
      launchTransformation();
    }
  };
  var killRightEnemyAndUpdateScore = (enemy) => {
    killEnemy(enemy);
    rewardHero();
    initRewardStreakAndCheckForTransform();
  };
  var rewardHero = () => {
    const bonus_ratio = transformed ? TRANSFORMED_BONUS_RATIO : 1;
    if (!transformed) {
      rewardStreak++;
    }
    score += bonus_ratio * REWARD_UNIT;
    updateScoreDisplay();
    displayReward("Congrats! You destroyed a good answer!");
    if (transformed) {
      displayTransformationKillReward(
        `Transformation bonus reward! X${TRANSFORMED_BONUS_RATIO}`
      );
    }
  };
  var updateScoreDisplay = () => {
    scoreContainer.innerHTML = (score * KILLED_ENEMY_REWARD).toString();
  };
  var killWrongEnemy = (enemy) => {
    scoreMalusContainer.style.display = "flex";
    lifePoints.value--;
    checkForHerosDeath();
    updateLifePointsDisplay();
    killEnemy(enemy);
    displayMalus("MALUS! Wrong enemy killed!");
  };
  var displayMalus = (content) => {
    if (currentMalusContainerTimeout) {
      clearTimeout(currentMalusContainerTimeout);
      currentMalusContainerTimeout = null;
    }
    scoreMalusContainer.style.display = "flex";
    currentMalusContainerTimeout = setTimeout(() => {
      scoreMalusDetail.innerHTML = "";
      scoreMalusContainer.style.display = "none";
    }, 2e3);
  };
  var hideMalus = () => {
    hideReward();
    if (currentMalusContainerTimeout) {
      clearTimeout(currentMalusContainerTimeout);
      currentMalusContainerTimeout = null;
    }
    scoreMalusDetail.innerHTML = "";
    scoreMalusContainer.style.display = "none";
  };
  var displayReward = (content) => {
    hideMalus();
    if (currentRewardContainerTimeout) {
      clearTimeout(currentRewardContainerTimeout);
      currentRewardContainerTimeout = null;
    }
    scoreRewardContainer.style.display = "flex";
    currentRewardContainerTimeout = setTimeout(() => {
      scoreRewardDetail.innerHTML = "";
      scoreRewardContainer.style.display = "none";
    }, 2e3);
  };
  var displayTransformationKillReward = (content) => {
    const transformationRewardContainer = document.getElementById(
      "transformed_hero_bonus_reward_container"
    );
    transformationRewardContainer.style.display = "flex";
    if (currentTransformationRewardContainerTimeout) {
      clearTimeout(currentTransformationRewardContainerTimeout);
      currentTransformationRewardContainerTimeout = null;
    }
    currentRewardContainerTimeout = setTimeout(() => {
      transformationRewardContainer.style.display = "none";
    }, REWARD_TIMEOUT_DURATION);
  };
  var hideReward = () => {
  };
  var killEnemy = (enemy) => {
    const launchExplosion = () => {
      launchAnimationAndDeclareItLaunched(
        enemy.element.firstChild,
        0,
        "png",
        "assets/challenge/explosion",
        1,
        10,
        1,
        false,
        10 /* opponent_death */
      );
    };
    launchExplosion();
    destroyEnemyAndLaunchNewOne(enemy);
  };
  var destroyEnemy = (enemy) => {
    clearAndHideAnswerDataContainer();
    setTimeout(() => {
      ANIMATION_RUNNING_VALUES[8 /* opponent_run */] = 0;
      enemy.element.remove();
      if (!preTransformed) {
        triggerOpponentsApparition();
      }
    }, 300);
    ennemiesOnScreen.forEach((enemyOnScreen, index) => {
      if (enemy === enemyOnScreen) {
        ennemiesOnScreen.splice(index, 1);
      }
    });
  };
  var destroyEnemyAndLaunchNewOne = (enemy) => {
    destroyEnemy(enemy);
    ANIMATION_RUNNING_VALUES[8 /* opponent_run */] = 0;
  };
  var hurtHero = () => {
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
  var checkForHerosDeath = () => {
    if (lifePoints.value === 0) {
      killHero();
    }
  };
  var killHero = () => {
    heroIsAlive = false;
    launchDeathAnimation();
  };
  var detectCollision = () => {
    ennemiesOnScreen.forEach((enemyOnScreen) => {
      if (heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width > enemyOnScreen.element.getBoundingClientRect().left && enemyOnScreen.collideable) {
        enemyOnScreen.collideable = false;
        if (!invisible || enemyOnScreen.answer.good) {
          hurtHero();
        } else if (invisible && !enemyOnScreen.answer.good) {
          rewardHero();
          initRewardStreakAndCheckForTransform();
        }
      }
    });
    requestAnimationFrame(detectCollision);
  };
  var checkForScreenUpdateFromLeftToRight = (throttleNum) => {
    if (throttleNum < 10) {
      throttleNum++;
      return requestAnimationFrame(
        () => checkForScreenUpdateFromLeftToRight(throttleNum)
      );
    }
    throttleNum = 0;
    const firstMapDomElement = MAPS[0];
    if (firstMapDomElement.offsetLeft < -window.innerWidth) {
      firstMapDomElement.remove();
      MAPS.shift();
    }
    const lastMapDomElement = MAPS[MAPS.length - 1];
    if (lastMapDomElement && lastMapDomElement.offsetLeft <= window.innerWidth / 10) {
      MAPS.push(
        createMapBlock(
          lastMapDomElement.offsetLeft + lastMapDomElement.offsetWidth
        )
      );
    }
    requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));
  };
  var launchHeroRunAnimation = () => {
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      `assets/challenge/characters/${transformed ? "transformed_hero" : "hero"}/run`,
      1,
      transformed ? 6 : 8,
      1,
      true,
      transformed ? 15 /* transformation_run */ : 1 /* run */
    );
  };
  var launchRun = () => {
    if (timeStoped) {
      return;
    }
    startCamera();
    moveCamera(11 /* camera_left_to_right */);
    launchHeroRunAnimation();
  };
  var heroInitialTop = heroContainer.getBoundingClientRect().top;
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
  var clearGameTimeouts = () => {
    console.log(GAME_TIMEOUTS[0 /* HERO */]);
    GAME_TIMEOUTS[0 /* HERO */].forEach((timeout) => {
      clearTimeout(timeout);
    });
    GAME_TIMEOUTS[0 /* HERO */] = [];
    console.log();
    GAME_TIMEOUTS[1 /* ENEMY */].forEach((timeout) => clearTimeout(timeout));
    GAME_TIMEOUTS[1 /* ENEMY */] = [];
  };
  var stopTime = () => {
    timeStoped = true;
    clearGameTimeouts();
    ANIMATION_RUNNING_VALUES[0 /* attack */] = 0;
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    ANIMATION_RUNNING_VALUES[4 /* death */] = 0;
    ANIMATION_RUNNING_VALUES[3 /* hurt */] = 0;
    ANIMATION_RUNNING_VALUES[5 /* idle */] = 0;
    ANIMATION_RUNNING_VALUES[8 /* opponent_run */] = 0;
    ANIMATION_RUNNING_VALUES[10 /* opponent_death */] = 0;
    ANIMATION_RUNNING_VALUES[9 /* opponent_move */] = 0;
    ANIMATION_RUNNING_VALUES[11 /* camera_left_to_right */] = 0;
    ANIMATION_RUNNING_VALUES[12 /* camera_right_to_left */] = 0;
    ANIMATION_RUNNING_VALUES[13 /* character_left_to_right_move */] = 0;
    ANIMATION_RUNNING_VALUES[14 /* transformation_pre_run */] = 0;
    ANIMATION_RUNNING_VALUES[15 /* transformation_run */] = 0;
    ANIMATION_RUNNING_VALUES[16 /* transformation_hurt */] = 0;
    ANIMATION_RUNNING_VALUES[17 /* boss_idle */] = 0;
    ANIMATION_RUNNING_VALUES[18 /* boss_attack */] = 0;
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      "assets/challenge/characters/hero/stop_time",
      1,
      4,
      1,
      false,
      6 /* stop_time */
    );
  };
  var cancelStopTimeSpell = () => {
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
      7 /* cancel_stop_time */
    );
    clearTimeoutAndLaunchNewOne(
      0 /* HERO */,
      setTimeout(() => {
        initAllAnimations();
        launchRun();
        ennemiesOnScreen.forEach((enemy) => launchOpponent(enemy));
      }, 1e3)
    );
  };
  var checkForOpponentsClearance = () => {
    ennemiesOnScreen.forEach((enemyOnScreen) => {
      if (heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width + window.innerWidth * 0.05 > enemyOnScreen.element.getBoundingClientRect().left) {
      }
      if (enemyOnScreen.element.getBoundingClientRect().left < 0 - window.innerWidth * 0.2) {
        destroyEnemyAndLaunchNewOne(enemyOnScreen);
      }
    });
    requestAnimationFrame(checkForOpponentsClearance);
  };
  var launchInvisibilityToggle = () => {
    invisible = !invisible;
    heroContainer.style.opacity = invisible ? "0.3" : "1";
    if (!invisible) {
      return;
    }
    setTimeout(launchInvisibilityToggle, INVISIBILITY_DURATION_IN_MILLISECONDS);
  };
  var launchTransformation = () => {
    if (timeStoped) {
      return;
    }
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    ANIMATION_RUNNING_VALUES[15 /* transformation_run */] = 0;
    if (transformedAlready) {
      document.getElementById("transformation_background").style.display = "none";
      clearGameTimeouts();
      transformed = true;
      launchAnimationAndDeclareItLaunched(
        heroImage,
        0,
        "png",
        "assets/challenge/characters/transformed_hero/run",
        1,
        6,
        1,
        true,
        15 /* transformation_run */
      );
      setTimeout(turnHeroTransformationOff, 5e3);
      return;
    }
    transformedAlready = true;
    document.getElementById("transformation_background").style.display = "flex";
    heroImage.src = "assets/challenge/characters/hero/walk/1.png";
    preTransformed = true;
    clearAllOponentsAndTimeouts();
    clearTimeoutAndLaunchNewOne(
      0 /* HERO */,
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
          14 /* transformation_pre_run */
        );
        clearTimeoutAndLaunchNewOne(
          0 /* HERO */,
          setTimeout(() => {
            triggerOpponentsApparition();
            document.getElementById("transformation_background").style.display = "none";
            ANIMATION_RUNNING_VALUES[14 /* transformation_pre_run */] = 0;
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
              15 /* transformation_run */
            );
            setTimeout(turnHeroTransformationOff, 5e3);
          }, 2e3)
        );
      }, 500)
    );
  };
  var clearAllOponentsAndTimeouts = () => {
    ennemiesOnScreen.forEach((enemy, index) => {
      ANIMATION_RUNNING_VALUES[8 /* opponent_run */] = 0;
      enemy.element.remove();
      ennemiesOnScreen.splice(index, 1);
    });
  };
  var lightUpAnswerDataContainer = () => {
    answerDataContainer.style.opacity = "1";
  };
  var clearAndHideAnswerDataContainer = () => {
    answerDataContainer.style.opacity = "0.3";
    answerDataValue.innerHTML = "";
  };
  var launchDeathAnimation = () => {
    initHeroAnimations();
    ANIMATION_RUNNING_VALUES[11 /* camera_left_to_right */] = 0;
    const killHero2 = () => {
      launchAnimationAndDeclareItLaunched(
        heroImage,
        0,
        "png",
        "assets/challenge/characters/hero/death",
        1,
        6,
        1,
        false,
        4 /* death */
      );
      clearGameTimeouts();
      setTimeout(
        () => window.location.href = "http://localhost:3001/dead",
        1e3
      );
    };
    if (transformed) {
      transformed = false;
    }
    heroImage.src = "assets/challenge/characters/hero/death/1.png";
    setTimeout(killHero2, 1e3);
  };
  var launchHeroHurtAnimation = () => {
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      transformed ? "assets/challenge/characters/transformed_hero/hurt" : "assets/challenge/characters/hero/hurt",
      1,
      transformed ? 5 : 3,
      1,
      false,
      transformed ? 16 /* transformation_hurt */ : 3 /* hurt */
    );
    initHeroAnimations();
    stopCamera();
    clearTimeoutAndLaunchNewOne(
      0 /* HERO */,
      setTimeout(() => {
        heroHurt = false;
        if (heroIsAlive && ANIMATION_RUNNING_VALUES[1 /* run */] === 0) {
          launchRun();
        }
      }, 500)
    );
  };
  var stopCamera = () => {
    ANIMATION_RUNNING_VALUES[11 /* camera_left_to_right */] = 0;
  };
  var startCamera = () => {
    if (ANIMATION_RUNNING_VALUES[11 /* camera_left_to_right */] > 0) {
      return;
    }
    ANIMATION_RUNNING_VALUES[11 /* camera_left_to_right */]++;
  };
  var initHeroAnimations = () => {
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    ANIMATION_RUNNING_VALUES[14 /* transformation_pre_run */] = 0;
    ANIMATION_RUNNING_VALUES[15 /* transformation_run */] = 0;
    ANIMATION_RUNNING_VALUES[3 /* hurt */] = 0;
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
})();
//# sourceMappingURL=challenge.js.map
