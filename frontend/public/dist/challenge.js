"use strict";
(() => {
  // src/challenge.ts
  var MAPS = [];
  var heroContainer = document.getElementById("hero_container");
  var heroImage = document.getElementById("heroImg");
  var errorScoreContainer = document.getElementById("error_score");
  var successfulKillsScoreContainer = document.getElementById("killed_score");
  var errorScore = 0;
  var successfulKillsScore = 0;
  var ennemiesOnScreen = [];
  var transformed = false;
  var transformationOn = false;
  var Answer = class {
    constructor(data, good) {
      this.data = data;
      this.good = good;
    }
  };
  var Enemy = class {
    constructor(element, answer) {
      this.element = element;
      this.answer = answer;
    }
  };
  var CAPITALS = {
    title: "Capitals of the world",
    good: [new Answer("Paris", true), new Answer("London", true)],
    bad: [new Answer("Chicago", false), new Answer("Monaco", false)]
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
    [3 /* opponent_run */]: 0,
    [4 /* opponent_death */]: 0,
    [5 /* camera_left_to_right */]: 0,
    [6 /* camera_right_to_left */]: 0,
    [7 /* character_left_to_right_move */]: 0,
    [8 /* transformation_pre_run */]: 0,
    [9 /* transformation_run */]: 0
  };
  var THROTTLE_NUMS = {
    [0 /* attack */]: 0,
    [1 /* run */]: 5,
    [2 /* walk */]: 5,
    [3 /* opponent_run */]: 5,
    [4 /* opponent_death */]: 0,
    [5 /* camera_left_to_right */]: 5,
    [6 /* camera_right_to_left */]: 5,
    [7 /* character_left_to_right_move */]: 5,
    [8 /* transformation_pre_run */]: 5,
    [9 /* transformation_run */]: 5
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
  var moveCamera = (direction) => {
    if (ANIMATION_RUNNING_VALUES[direction] === 0 || ANIMATION_RUNNING_VALUES[direction] > 1) {
      return;
    }
    MAPS.forEach(
      (map) => map.style.left = `${map.offsetLeft + (direction === 5 /* camera_left_to_right */ ? -1 : 1) * 4}px`
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
      ANIMATION_RUNNING_VALUES[9 /* transformation_run */] = 0;
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
      }, 400);
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
        transformed ? 9 /* transformation_run */ : 1 /* run */
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
      3 /* opponent_run */
    );
    moveEnemy(enemy);
  };
  var moveEnemy = (enemy) => {
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
        4 /* opponent_death */
      );
    };
    setTimeout(() => {
      ANIMATION_RUNNING_VALUES[3 /* opponent_run */] = 0;
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
    ANIMATION_RUNNING_VALUES[3 /* opponent_run */] = 0;
  };
  var checkForScreenUpdateFromLeftToRight = (throttleNum) => {
    if (ANIMATION_RUNNING_VALUES[5 /* camera_left_to_right */] === 0) {
      return;
    }
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
    ANIMATION_RUNNING_VALUES[5 /* camera_left_to_right */]++;
    moveCamera(5 /* camera_left_to_right */);
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      "assets/challenge/characters/hero/run",
      1,
      8,
      1,
      true,
      1 /* run */
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
      8 /* transformation_pre_run */
    );
    document.getElementById("transformation_background").style.display = "flex";
    setTimeout(() => {
      transformationOn = false;
      document.getElementById("transformation_background").style.display = "none";
      ANIMATION_RUNNING_VALUES[8 /* transformation_pre_run */] = 0;
      launchAnimationAndDeclareItLaunched(
        heroImage,
        0,
        "png",
        "assets/challenge/characters/transformed_hero/run",
        1,
        6,
        1,
        true,
        9 /* transformation_run */
      );
    }, 2e3);
  };
  window.onload = () => {
    MAPS.push(createMapBlock(0));
    MAPS.push(createMapBlock(100));
    launchRun();
    checkForScreenUpdateFromLeftToRight(10);
    checkForOpponentsClearance();
    triggerOpponentsApparition();
  };
})();
//# sourceMappingURL=challenge.js.map
