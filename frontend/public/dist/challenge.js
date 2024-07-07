"use strict";
(() => {
  // src/challenge.ts
  var MAPS = [];
  var heroContainer = document.getElementById("hero_container");
  var heroImage = document.getElementById("heroImg");
  var enemy = document.getElementById("enemyImg");
  var enemyContainer = document.getElementById("enemy_container");
  var errorScoreContainer = document.getElementById("error_score");
  var successfulKillsScoreContainer = document.getElementById("killed_score");
  var errorScore = 0;
  var successfulKillsScore = 0;
  var opponnentsOnScreen = [enemy];
  var backgroundSrc = "assets/challenge/maps/challenge_castle.webp";
  var ANIMATION_RUNNING_VALUES = {
    [0 /* attack */]: 0,
    [1 /* run */]: 0,
    [2 /* walk */]: 0,
    [3 /* opponent_run */]: 0,
    [4 /* camera_left_to_right */]: 0,
    [5 /* camera_right_to_left */]: 0,
    [6 /* character_left_to_right_move */]: 0
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
      (map) => map.style.left = `${map.offsetLeft + (direction === 4 /* camera_left_to_right */ ? -1 : 1) * 4}px`
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
    if (throttleNum < 5) {
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
  var initAnimation = (animationId) => {
    ANIMATION_RUNNING_VALUES[animationId] = 0;
  };
  var launchAttack = () => {
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      "assets/challenge/characters/hero/attack",
      1,
      4,
      1,
      false,
      0 /* attack */
    );
    setTimeout(() => {
      if (heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width + window.innerWidth * 0.05 > enemyContainer.getBoundingClientRect().left && enemy) {
        enemy.remove();
        enemyOnScreen = false;
        successfulKillsScore++;
        updateScores();
      }
    }, 500);
    setTimeout(() => {
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
      initAnimation(0 /* attack */);
    }, 1e3);
  };
  var enemyOnScreen = true;
  var moveEnemy = () => {
    if (!enemyOnScreen) return;
    enemyContainer.style.left = `${enemyContainer.offsetLeft - 10}px`;
    requestAnimationFrame(moveEnemy);
  };
  var detectCollision = () => {
    if (heroContainer.offsetLeft > enemyContainer.offsetLeft) {
      errorScore++;
      updateScores();
      return;
    }
    requestAnimationFrame(detectCollision);
  };
  var checkForScreenUpdateFromLeftToRight = (throttleNum) => {
    if (ANIMATION_RUNNING_VALUES[4 /* camera_left_to_right */] === 0) {
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
    ANIMATION_RUNNING_VALUES[4 /* camera_left_to_right */]++;
    moveCamera(4 /* camera_left_to_right */);
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
  var launchFly = (jumpingForward = true) => {
    const currentTop = heroContainer.getBoundingClientRect().top;
    if (jumpingForward) {
      const newTop = currentTop - window.innerHeight * 5e-3;
      heroContainer.style.top = `${newTop}px`;
      if (newTop <= heroInitialTop - window.innerHeight * 0.2) {
        jumpingForward = false;
      }
    } else {
      const newTop = currentTop + window.innerHeight * 5e-3;
      heroContainer.style.top = `${newTop}px`;
      if (newTop >= heroInitialTop) {
        heroContainer.style.top = `${heroInitialTop}px`;
        return;
      }
    }
    requestAnimationFrame(() => launchFly(jumpingForward));
  };
  document.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      launchFly();
    }
    if (event.key === "w") {
      launchAttack();
    }
  });
  var checkForOpponentsClearance = () => {
    opponnentsOnScreen.forEach((opponnentOnScreen) => {
      if (heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width + window.innerWidth * 0.05 > enemyContainer.getBoundingClientRect().left && enemy) {
      }
      if (opponnentOnScreen.getBoundingClientRect().left < 0) {
        opponnentOnScreen.remove();
        opponnentsOnScreen.pop();
      }
    });
    requestAnimationFrame(checkForOpponentsClearance);
  };
  window.onload = () => {
    MAPS.push(createMapBlock(0));
    MAPS.push(createMapBlock(100));
    launchRun();
    moveEnemy();
    detectCollision();
    checkForScreenUpdateFromLeftToRight(10);
    checkForOpponentsClearance();
  };
})();
//# sourceMappingURL=challenge.js.map
