"use strict";
(() => {
  // src/challenge.ts
  var MAPS = [];
  var heroContainer = document.getElementById("hero_container");
  var heroImage = document.getElementById("heroImg");
  var errorScoreContainer = document.getElementById("error_score");
  var successfulKillsScoreContainer = document.getElementById("killed_score");
  var answerDataContainer = document.getElementById("answer_data_container");
  var answerDataValue = document.getElementById("answer_data_value");
  var errorScore = 0;
  var successfulKillsScore = 0;
  var ennemiesOnScreen = [];
  var transformed = false;
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
    good: [new Answer("10+4=14", true), new Answer("10=10=20", true)],
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
    answerDataValue.innerHTML = enemy.answer.data;
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
    [5 /* opponent_run */]: 0,
    [7 /* opponent_death */]: 0,
    [6 /* opponent_move */]: 0,
    [8 /* camera_left_to_right */]: 0,
    [9 /* camera_right_to_left */]: 0,
    [10 /* character_left_to_right_move */]: 0,
    [11 /* transformation_pre_run */]: 0,
    [12 /* transformation_run */]: 0,
    [13 /* transformation_hurt */]: 0
  };
  var THROTTLE_NUMS = {
    [0 /* attack */]: 0,
    [1 /* run */]: 5,
    [2 /* walk */]: 5,
    [4 /* death */]: 5,
    [3 /* hurt */]: 0,
    [5 /* opponent_run */]: 5,
    [7 /* opponent_death */]: 0,
    [6 /* opponent_move */]: 0,
    [8 /* camera_left_to_right */]: 0,
    [9 /* camera_right_to_left */]: 5,
    [10 /* character_left_to_right_move */]: 5,
    [11 /* transformation_pre_run */]: 5,
    [12 /* transformation_run */]: 5,
    [13 /* transformation_hurt */]: 0
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
    const cameraMoveMultiplicatorBase = THROTTLE_NUMS[8 /* camera_left_to_right */] ? THROTTLE_NUMS[8 /* camera_left_to_right */] : 1;
    THROTTLE_NUMS[8 /* camera_left_to_right */] = cameraMoveMultiplicatorBase * multiplicator * 1.5;
    const opponentRunMultiplicatorBase = THROTTLE_NUMS[5 /* opponent_run */] ? THROTTLE_NUMS[5 /* opponent_run */] : 1;
    THROTTLE_NUMS[5 /* opponent_run */] = opponentRunMultiplicatorBase * multiplicator;
  };
  var moveCamera = (direction, throttleNum = 0) => {
    if (ANIMATION_RUNNING_VALUES[direction] === 0 || ANIMATION_RUNNING_VALUES[direction] > 1) {
      return;
    }
    if (throttleNum < THROTTLE_NUMS[8 /* camera_left_to_right */]) {
      throttleNum++;
      return requestAnimationFrame(() => moveCamera(direction, throttleNum));
    }
    throttleNum = 0;
    MAPS.forEach(
      (map) => map.style.left = `${map.offsetLeft + (direction === 8 /* camera_left_to_right */ ? -1 : 1) * 4}px`
    );
    requestAnimationFrame(() => moveCamera(direction));
  };
  var updateScores = () => {
    errorScoreContainer.innerHTML = "Erreurs: " + errorScore.toString();
    successfulKillsScoreContainer.innerHTML = "Bonnes r\xE9ponses: " + successfulKillsScore.toString();
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
  var launchAttack = () => {
    if (transformed) {
      ANIMATION_RUNNING_VALUES[12 /* transformation_run */] = 0;
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
        console.log("Enemy can't be hit. Opponent left >");
        console.log(
          enemy.element.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width
        );
        console.log(", hero left > ");
        console.log(heroContainer.getBoundingClientRect().left);
        return;
      }
      setTimeout(() => {
        destroyEnemyAndLaunchNewOne(enemy);
        successfulKillsScore++;
        updateScores();
      }, 200);
    });
    setTimeout(() => {
      launchAnimationAndDeclareItLaunched(
        heroImage,
        0,
        "png",
        `assets/challenge/characters/${transformed ? "transformed_hero" : "hero"}/run`,
        1,
        transformed ? 6 : 8,
        1,
        true,
        transformed ? 12 /* transformation_run */ : 1 /* run */
      );
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
      5 /* opponent_run */
    );
    moveEnemy(enemy);
  };
  var moveEnemy = (enemy, throttleNum = 0) => {
    if (throttleNum < THROTTLE_NUMS[6 /* opponent_move */]) {
      throttleNum++;
      alert("block");
      return requestAnimationFrame(() => moveEnemy(enemy, throttleNum));
    }
    throttleNum = 0;
    enemy.element.style.left = `${enemy.element.getBoundingClientRect().left - 10}px`;
    requestAnimationFrame(() => moveEnemy(enemy));
  };
  var destroyEnemy = (enemy) => {
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
        7 /* opponent_death */
      );
    };
    clearAndHideAnswerDataContainer();
    setTimeout(() => {
      ANIMATION_RUNNING_VALUES[5 /* opponent_run */] = 0;
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
  var destroyEnemyAndLaunchNewOne = (enemy) => {
    destroyEnemy(enemy);
    ANIMATION_RUNNING_VALUES[5 /* opponent_run */] = 0;
  };
  var detectCollision = () => {
    ennemiesOnScreen.forEach((enemyOnScreen) => {
      if (heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width > enemyOnScreen.element.getBoundingClientRect().left && enemyOnScreen.collideable) {
        enemyOnScreen.collideable = false;
        launchHeroHurtAnimation();
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
  var launchRun = () => {
    startCamera();
    moveCamera(8 /* camera_left_to_right */);
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      `assets/challenge/characters/${transformed ? "transformed_hero" : "hero"}/run`,
      1,
      transformed ? 6 : 8,
      1,
      true,
      transformed ? 12 /* transformation_run */ : 1 /* run */
    );
  };
  var heroInitialTop = heroContainer.getBoundingClientRect().top;
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
    if (event.key === "v") {
      slowTime(10);
    }
    if (event.key === "y") {
      launchDeathAnimation();
    }
  });
  var checkForOpponentsClearance = () => {
    ennemiesOnScreen.forEach((enemyOnScreen) => {
      if (heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width + window.innerWidth * 0.05 > enemyOnScreen.element.getBoundingClientRect().left) {
      }
      if (enemyOnScreen.element.getBoundingClientRect().left < 0) {
        destroyEnemyAndLaunchNewOne(enemyOnScreen);
      }
    });
    requestAnimationFrame(checkForOpponentsClearance);
  };
  var turnInvisible = () => {
    heroContainer.style.opacity = "0.3";
    setTimeout(() => heroContainer.style.opacity = "1", 2e3);
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
        11 /* transformation_pre_run */
      );
      clearAllOponentsAndTimeouts();
      ANIMATION_RUNNING_VALUES[5 /* opponent_run */] = 0;
      setTimeout(() => {
        triggerOpponentsApparition();
        document.getElementById("transformation_background").style.display = "none";
        ANIMATION_RUNNING_VALUES[11 /* transformation_pre_run */] = 0;
        launchAnimationAndDeclareItLaunched(
          heroImage,
          0,
          "png",
          "assets/challenge/characters/transformed_hero/run",
          1,
          6,
          1,
          true,
          12 /* transformation_run */
        );
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
    answerDataValue.innerHTML = "";
  };
  var launchDeathAnimation = () => {
    initHeroAnimations();
    ANIMATION_RUNNING_VALUES[8 /* camera_left_to_right */] = 0;
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
        4 /* death */
      );
      setTimeout(() => alert("you're dead! The equilibrium is lost!"), 1e3);
    };
    if (transformed) {
      transformed = false;
    }
    heroImage.src = "assets/challenge/characters/hero/death/1.png";
    setTimeout(killHero, 1e3);
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
      transformed ? 13 /* transformation_hurt */ : 3 /* hurt */
    );
    initHeroAnimations();
    stopCamera();
    setTimeout(launchRun, 500);
  };
  var stopCamera = () => {
    ANIMATION_RUNNING_VALUES[8 /* camera_left_to_right */] = 0;
  };
  var startCamera = () => {
    if (ANIMATION_RUNNING_VALUES[8 /* camera_left_to_right */] > 0) {
      console.log("move was already started");
      return;
    }
    ANIMATION_RUNNING_VALUES[8 /* camera_left_to_right */]++;
  };
  var initHeroAnimations = () => {
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    ANIMATION_RUNNING_VALUES[11 /* transformation_pre_run */] = 0;
    ANIMATION_RUNNING_VALUES[12 /* transformation_run */] = 0;
    ANIMATION_RUNNING_VALUES[3 /* hurt */] = 0;
  };
  window.onload = () => {
    MAPS.push(createMapBlock(0));
    MAPS.push(createMapBlock(100));
    launchRun();
    detectCollision();
    checkForScreenUpdateFromLeftToRight(10);
    checkForOpponentsClearance();
    triggerOpponentsApparition();
  };
})();
//# sourceMappingURL=challenge.js.map
