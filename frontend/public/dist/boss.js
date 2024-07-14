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
  var TRANSFORMED_BONUS_RATIO = 5;
  var KILLED_ENEMY_REWARD = 30;
  var HERO_HURT_MALUS = 30;
  var REWARD_TIMEOUT_DURATION = 2e3;
  var timeStoped = false;
  var score = 0;
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
  var CAPITALS = {
    title: "Additions",
    good: [
      new Answer("10+3=6*8", true),
      new Answer(" the derivative of 'f(x) = 1963' is 1963 ", true)
    ],
    bad: [new Answer("3+6=10", false), new Answer("2+3=7", false)]
  };
  var getNextAnswer = () => {
    const randVal = Math.random() > 0.5;
    if (randVal) {
      return CAPITALS.good.length ? CAPITALS.good.pop() : CAPITALS.bad.length ? CAPITALS.bad.pop() : "done";
    } else {
      return CAPITALS.bad.length ? CAPITALS.bad.pop() : CAPITALS.good.length ? CAPITALS.good.pop() : "done";
    }
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
      console.log("error");
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
    launchOpponent(enemy);
  };
  var triggerOpponentsApparition = () => {
    const newAnswer = getNextAnswer();
    if (newAnswer && newAnswer !== "done") {
      buildAndLaunchEnemy(newAnswer);
    } else {
      console.log("we re done");
    }
  };
  var backgroundSrc = "assets/challenge/maps/challenge_castle.webp";
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
      (map) => map.style.left = `${map.offsetLeft + (direction === 11 /* camera_left_to_right */ ? -1 : 1) * 4}px`
    );
    requestAnimationFrame(() => moveCamera(direction));
  };
  var launchAnimationAndDeclareItLaunched = (characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId) => {
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
    if (!characterElement) alert("no element no more!");
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
    if (invisible) {
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
    setTimeout(() => {
      launchHeroRunAnimation();
    }, 200);
  };
  var launchOpponent = (enemy) => {
    launchAnimationAndDeclareItLaunched(
      enemy.element.firstChild,
      0,
      "png",
      "assets/challenge/characters/enemies/wolf",
      1,
      9,
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
  var killRightEnemyAndUpdateScore = (enemy) => {
    killEnemy(enemy);
    const bonus_ratio = transformed ? TRANSFORMED_BONUS_RATIO : 1;
    score += bonus_ratio * KILLED_ENEMY_REWARD;
    updateScoreDisplay();
    displayReward("Congrats! You destroyed a good answer!");
    if (transformed) {
      displayTransformationKillReward(
        `Transformation bonus reward! X${TRANSFORMED_BONUS_RATIO}`
      );
    }
  };
  var updateScoreDisplay = () => {
    scoreContainer.innerHTML = score.toString();
  };
  var killWrongEnemy = (enemy) => {
    scoreMalusContainer.style.display = "flex";
    killEnemy(enemy);
    displayMalus("MALUS! Wrong enemy killed!");
    score -= HERO_HURT_MALUS;
    updateScoreDisplay();
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
    transformationRewardContainer.innerHTML = content;
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
      triggerOpponentsApparition();
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
    lifePoints.value--;
    checkForHerosDeath();
    if (score >= HERO_HURT_MALUS) {
      score -= HERO_HURT_MALUS;
      updateScoreDisplay();
    }
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
        if (!invisible) {
          hurtHero();
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
    if (event.key === " ") {
      launchInvisibilityToggle();
    }
    if (event.key === "w") {
      launchAttack();
    }
    if (event.key === "b") {
      launchTransformation();
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
  var stopTime = () => {
    timeStoped = true;
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
    setTimeout(() => {
      initAllAnimations();
      launchRun();
      ennemiesOnScreen.forEach((enemy) => launchOpponent(enemy));
    }, 1e3);
  };
  var checkForOpponentsClearance = () => {
    ennemiesOnScreen.forEach((enemyOnScreen) => {
      if (heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width + window.innerWidth * 0.05 > enemyOnScreen.element.getBoundingClientRect().left) {
      }
      if (enemyOnScreen.element.getBoundingClientRect().left < 0 - window.innerWidth * 0.05) {
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
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    document.getElementById("transformation_background").style.display = "flex";
    heroImage.src = "assets/challenge/characters/hero/walk/1.png";
    transformed = true;
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
      clearAllOponentsAndTimeouts();
      ANIMATION_RUNNING_VALUES[8 /* opponent_run */] = 0;
      setTimeout(() => {
        triggerOpponentsApparition();
        document.getElementById("transformation_background").style.display = "none";
        ANIMATION_RUNNING_VALUES[14 /* transformation_pre_run */] = 0;
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
      }, 2e3);
    }, 500);
  };
  var clearAllOponentsAndTimeouts = () => {
    ennemiesOnScreen.forEach((enemy, index) => {
      enemy.element.remove();
      ennemiesOnScreen.splice(index, 1);
    });
  };
  var lightUpAnswerDataContainer = () => {
    answerDataContainer.style.opacity = "1";
  };
  var clearAndHideAnswerDataContainer = () => {
    answerDataContainer.style.opacity = "0.3";
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
      setTimeout(() => alert("you're dead! The equilibrium is lost!"), 1e3);
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
    setTimeout(() => {
      if (heroIsAlive) {
        launchRun();
      }
    }, 500);
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

  // src/boss.ts
  var heroImage2 = document.getElementById("heroImage");
  var bossImage = document.getElementById("bossImage");
  var launcHeroIdle = () => {
    launchAnimationAndDeclareItLaunched(
      heroImage2,
      0,
      "png",
      "assets/challenge/characters/hero/idle",
      1,
      7,
      1,
      true,
      5 /* idle */
    );
  };
  var launchBossIdle = () => {
    launchAnimationAndDeclareItLaunched(
      bossImage,
      0,
      "png",
      "assets/challenge/characters/bosses/ctuluhu/idle",
      1,
      15,
      1,
      true,
      17 /* boss_idle */
    );
  };
  var launchBossAttack = () => {
    launchAnimationAndDeclareItLaunched(
      bossImage,
      0,
      "png",
      "assets/challenge/characters/bosses/ctuluhu/attack",
      1,
      17,
      1,
      false,
      18 /* boss_attack */
    );
  };
  window.onload = () => {
    launcHeroIdle();
    launchBossIdle();
    setTimeout(() => {
      ANIMATION_RUNNING_VALUES[17 /* boss_idle */] = 0;
      launchBossAttack();
    }, 1e3);
  };
})();
//# sourceMappingURL=boss.js.map
