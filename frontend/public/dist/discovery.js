"use strict";
(() => {
  // src/discovery.ts
  var MAPS = [];
  var heroImage = document.getElementById("heroImg");
  var stepsInSwow = document.getElementById(
    "snow_steps_audio"
  );
  var windowAudio = document.getElementById("wind_audio");
  windowAudio.volume = 0.7;
  stepsInSwow.volume = 0.7;
  stepsInSwow.playbackRate = 1.2;
  var backgroundSrc = "assets/challenge/maps/outside.png";
  var ANIMATION_RUNNING_VALUES = {
    [0 /* attack */]: 0,
    [1 /* run */]: 0,
    [2 /* walk */]: 0,
    [3 /* opponent_run */]: 0,
    [4 /* camera_left_to_right */]: 0,
    [5 /* camera_right_to_left */]: 0,
    [6 /* character_left_to_right_move */]: 0,
    [7 /* golem_idle */]: 0,
    [8 /* golem_door_creation */]: 0,
    [9 /* obelisk_idle */]: 0,
    [10 /* obelisk_lightning */]: 0
  };
  var launchGolemIdleAnimation = () => {
    const golemImage = document.getElementById("golemImage");
    if (!golemImage) {
      return;
    }
    launchAnimationAndDeclareItLaunched(
      golemImage,
      0,
      "png",
      "assets/challenge/characters/neutral/golem",
      1,
      8,
      1,
      true,
      7 /* golem_idle */
    );
  };
  var tutoStep = 0;
  var launchTutorialTalk = () => {
    tutoStep++;
    if (tutoStep > 9) {
      alert("tuto is over");
    }
    const audio = document.getElementById(
      `bard_tutorial_${tutoStep}`
    );
    audio.play();
  };
  var createMapPalaceBlock = (left) => {
    const block = document.createElement("div");
    block.classList.add("mapBlock");
    const backgroundImage = document.createElement("img");
    backgroundImage.src = backgroundSrc;
    block.append(backgroundImage);
    block.style.position = "fixed";
    block.style.left = `${left}px`;
    block.style.top = `0px`;
    document.getElementsByTagName("body")[0].append(block);
    if (left === window.innerWidth) {
      const golemImg = document.createElement("img");
      golemImg.id = "golemImage";
      golemImg.src = "assets/challenge/characters/neutral/golem/1.png";
      const golemLink = document.createElement("a");
      golemLink.onclick = launchTutorialTalk;
      golemLink.append(golemImg);
      block.append(golemLink);
      launchGolemIdleAnimation();
    } else if (left === window.innerWidth * 2) {
      const obeliskContainer = document.createElement("div");
      obeliskContainer.id = "obeliskContainer";
      const obeliskLightning = document.createElement("img");
      obeliskLightning.src = "assets/challenge/items/lightning/1.png";
      obeliskLightning.id = "obeliskLightning";
      obeliskContainer.append(obeliskLightning);
      const obeliskImg = document.createElement("img");
      obeliskImg.id = "obeliskImage";
      obeliskImg.src = "assets/challenge/items/obelisk/1.png";
      obeliskContainer.append(obeliskImg);
      block.append(obeliskContainer);
      launchObeliskAnimation();
      setTimeout(launchObeliskLightningAnimation, 1e4);
    }
    return block;
  };
  var moveCamera = (direction, previousFrameTimestamp) => {
    if (ANIMATION_RUNNING_VALUES[direction] === 0 || ANIMATION_RUNNING_VALUES[direction] > 1) {
      return;
    }
    const currentTs = Date.now();
    const diff = currentTs - previousFrameTimestamp;
    if (direction === 5 /* camera_right_to_left */ && MAPS[0].getBoundingClientRect().left >= 0) {
      ANIMATION_RUNNING_VALUES[5 /* camera_right_to_left */] = 0;
      return;
    }
    if (direction === 4 /* camera_left_to_right */ && MAPS[MAPS.length - 1].getBoundingClientRect().left <= 0) {
      ANIMATION_RUNNING_VALUES[4 /* camera_left_to_right */] = 0;
      return;
    }
    MAPS.forEach(
      (map) => map.style.left = `${map.getBoundingClientRect().left + (direction === 4 /* camera_left_to_right */ ? -1 : 1) * Math.floor(diff / 4)}px`
    );
    requestAnimationFrame(() => moveCamera(direction, currentTs));
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
      animationId,
      Date.now()
    );
  };
  var launchCharacterAnimation = (characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId, previousExecutionTimeStamp = Date.now()) => {
    if (!characterElement) {
      return;
    }
    if (!ANIMATION_RUNNING_VALUES[animationId] || ANIMATION_RUNNING_VALUES[animationId] > 1) {
      return;
    }
    const currentTimeStamp = Date.now();
    const executionDiff = currentTimeStamp - previousExecutionTimeStamp;
    if (executionDiff < 150) {
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
          animationId,
          previousExecutionTimeStamp
        )
      );
    }
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
        animationId,
        currentTimeStamp
      )
    );
  };
  var initAndLaunchFootStepsAudio = () => {
    stepsInSwow.currentTime = 0;
    stepsInSwow.play();
  };
  var launchCharacterMovement = () => {
    initAndLaunchFootStepsAudio();
    moveCamera(4 /* camera_left_to_right */, Date.now());
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      "assets/palace/hero/old_walk",
      1,
      6,
      1,
      true,
      2 /* walk */
    );
  };
  var launchCharacterMovementLeft = () => {
    initAndLaunchFootStepsAudio();
    moveCamera(5 /* camera_right_to_left */, Date.now());
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      "assets/palace/hero/walk_left",
      1,
      6,
      1,
      true,
      2 /* walk */
    );
  };
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "d" && ANIMATION_RUNNING_VALUES[4 /* camera_left_to_right */] === 0) {
        ANIMATION_RUNNING_VALUES[4 /* camera_left_to_right */]++;
        if (!isAnimating) {
          isAnimating = true;
          launchCharacterMovement();
        }
      }
      if (event.key === "q" && ANIMATION_RUNNING_VALUES[5 /* camera_right_to_left */] === 0) {
        ANIMATION_RUNNING_VALUES[5 /* camera_right_to_left */]++;
        isAnimating = true;
        launchCharacterMovementLeft();
      }
    }
  );
  document.addEventListener("keyup", (event) => {
    ANIMATION_RUNNING_VALUES[6 /* character_left_to_right_move */] = 0;
    ANIMATION_RUNNING_VALUES[2 /* walk */] = 0;
    ANIMATION_RUNNING_VALUES[4 /* camera_left_to_right */] = 0;
    ANIMATION_RUNNING_VALUES[5 /* camera_right_to_left */] = 0;
    isAnimating = false;
    if (event.key === "d" || event.key === "q") {
      stepsInSwow.pause();
    }
  });
  window.onload = () => {
    MAPS.push(createMapPalaceBlock(0));
    MAPS.push(createMapPalaceBlock(window.innerWidth));
    MAPS.push(createMapPalaceBlock(window.innerWidth * 2));
  };
  var spriteSheet = new Image();
  spriteSheet.src = "assets/palace/characters/premium.png";
  var isAnimating = false;
  var launchObeliskLightningAnimation = () => {
    const obeliskLightning = document.getElementById(
      "obeliskLightning"
    );
    launchAnimationAndDeclareItLaunched(
      obeliskLightning,
      0,
      "png",
      "assets/challenge/items/lightning",
      1,
      16,
      1,
      true,
      10 /* obelisk_lightning */
    );
  };
  var launchObeliskAnimation = () => {
    const obeliskImage = document.getElementById(
      "obeliskImage"
    );
    launchAnimationAndDeclareItLaunched(
      obeliskImage,
      0,
      "png",
      "assets/challenge/items/obelisk",
      1,
      13,
      1,
      true,
      9 /* obelisk_idle */
    );
  };
})();
//# sourceMappingURL=discovery.js.map
