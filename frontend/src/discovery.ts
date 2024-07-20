const MAPS: HTMLElement[] = [];
const heroImage = document.getElementById("heroImg")! as HTMLImageElement;

const stepsInSwow = document.getElementById(
  "snow_steps_audio"
)! as HTMLAudioElement;
const windowAudio = document.getElementById("wind_audio")! as HTMLAudioElement;

windowAudio.volume = 0.7;
stepsInSwow.volume = 0.7;
stepsInSwow.playbackRate = 1.2;

let backgroundSrc = "assets/challenge/maps/outside.png";

let currentCacheLeftIndex = 0;
let currentCacheRightIndex = 1;

let converstationWithBardStarted = false;

enum ANIMATION_ID {
  attack,
  run,
  walk,
  opponent_run,
  camera_left_to_right,
  camera_right_to_left,
  character_left_to_right_move,
  golem_idle,
  golem_door_creation,
  obelisk_idle,
  obelisk_lightning,
}

const ANIMATION_RUNNING_VALUES = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 0,
  [ANIMATION_ID.walk]: 0,
  [ANIMATION_ID.opponent_run]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 0,
  [ANIMATION_ID.golem_idle]: 0,
  [ANIMATION_ID.golem_door_creation]: 0,
  [ANIMATION_ID.obelisk_idle]: 0,
  [ANIMATION_ID.obelisk_lightning]: 0,
};

const launchGolemIdleAnimation = () => {
  const golemImage = document.getElementById("golemImage") as HTMLImageElement;

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
    ANIMATION_ID.golem_idle
  );
};

const launchTutorialTalk = () => {
  if (converstationWithBardStarted) {
    window.location.href = "http://localhost:3001/challenge";
    return;
  }
  converstationWithBardStarted = true;
  const audio = document.getElementById(`bard_tutorial_1`)! as HTMLAudioElement;
  audio.play();
};

const createMapPalaceBlock = (left: number) => {
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
    const golemImg = document.createElement("img") as HTMLImageElement;
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
    obeliskContainer.onclick = () =>
      (window.location.href = "http://localhost:3001/page");

    const obeliskLightning = document.createElement("img");
    obeliskLightning.src = "assets/challenge/items/lightning/1.png";
    obeliskLightning.id = "obeliskLightning";

    obeliskContainer.append(obeliskLightning);

    const obeliskImg = document.createElement("img") as HTMLImageElement;
    obeliskImg.id = "obeliskImage";
    obeliskImg.src = "assets/challenge/items/obelisk/1.png";
    obeliskContainer.append(obeliskImg);

    block.append(obeliskContainer);

    launchObeliskAnimation();
    setTimeout(launchObeliskLightningAnimation, 10000);
  }

  return block;
};

const moveCamera = (
  direction: ANIMATION_ID,
  previousFrameTimestamp: number
) => {
  if (
    ANIMATION_RUNNING_VALUES[direction] === 0 ||
    ANIMATION_RUNNING_VALUES[direction] > 1
  ) {
    return;
  }
  const currentTs = Date.now();

  const diff = currentTs - previousFrameTimestamp;

  if (
    direction === ANIMATION_ID.camera_right_to_left &&
    MAPS[0].getBoundingClientRect().left >= 0
  ) {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
    return;
  }

  if (
    direction === ANIMATION_ID.camera_left_to_right &&
    MAPS[MAPS.length - 1].getBoundingClientRect().left <= 0
  ) {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
    return;
  }

  MAPS.forEach(
    (map) =>
      (map.style.left = `${
        map.getBoundingClientRect().left +
        (direction === ANIMATION_ID.camera_left_to_right ? -1 : 1) *
          Math.floor(diff / 4)
      }px`)
  );

  requestAnimationFrame(() => moveCamera(direction, currentTs));
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
    animationId,
    Date.now()
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
  animationId: ANIMATION_ID,
  previousExecutionTimeStamp = Date.now()
): any => {
  if (!characterElement) {
    return;
  }

  if (
    !ANIMATION_RUNNING_VALUES[animationId] ||
    ANIMATION_RUNNING_VALUES[animationId] > 1
  ) {
    return;
  }

  const currentTimeStamp = Date.now();

  const executionDiff = currentTimeStamp - previousExecutionTimeStamp;

  if (executionDiff < 150) {
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
      animationId,
      currentTimeStamp
    )
  );
};

const checkForScreenUpdateFromLeftToRight = (throttleNum: number): any => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] === 0) {
    return;
  }

  if (throttleNum < 5) {
    throttleNum++;
    return requestAnimationFrame(() =>
      checkForScreenUpdateFromLeftToRight(throttleNum)
    );
  }

  throttleNum = 0;

  // Deletion and creation logic...
  const firstMapDomElement = MAPS[0];

  if (firstMapDomElement.getBoundingClientRect().left < -window.innerWidth) {
    firstMapDomElement.remove();
    MAPS.shift();
    currentCacheLeftIndex++;
  }

  const lastMapDomElement = MAPS[MAPS.length - 1];

  if (
    lastMapDomElement &&
    lastMapDomElement.getBoundingClientRect().left <= window.innerWidth / 10 &&
    currentCacheRightIndex <
      window.store.getState().localStorage.mapBlocks.length - 1
  ) {
    MAPS.push(
      createMapPalaceBlock(
        lastMapDomElement.getBoundingClientRect().left +
          lastMapDomElement.offsetWidth
      )
    );
    currentCacheRightIndex++;
  }

  requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));
};

const checkForScreenUpdateFromRightToLeft = (throttleNum: number): any => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] === 0) {
    return;
  }

  if (throttleNum < 5) {
    throttleNum++;
    return requestAnimationFrame(() =>
      checkForScreenUpdateFromRightToLeft(throttleNum)
    );
  }

  throttleNum = 0;

  const firstMapDomElement = MAPS[0];

  if (
    firstMapDomElement &&
    firstMapDomElement.getBoundingClientRect().left > -window.innerWidth &&
    currentCacheLeftIndex > 0
  ) {
    MAPS.unshift(
      createMapPalaceBlock(
        firstMapDomElement.getBoundingClientRect().left -
          firstMapDomElement.offsetWidth
      )
    );
    currentCacheLeftIndex--;
  }

  const lastMapDomElement = MAPS[MAPS.length - 1];

  if (
    lastMapDomElement &&
    lastMapDomElement.getBoundingClientRect().left > window.innerWidth
  ) {
    lastMapDomElement.remove();
    MAPS.pop();
  }

  requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));
};

const initAndLaunchFootStepsAudio = () => {
  stepsInSwow.currentTime = 0;
  stepsInSwow.play();
};

const launchCharacterMovement = () => {
  initAndLaunchFootStepsAudio();
  moveCamera(ANIMATION_ID.camera_left_to_right, Date.now());
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
  initAndLaunchFootStepsAudio();
  moveCamera(ANIMATION_ID.camera_right_to_left, Date.now());
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

document.addEventListener(
  "keydown",

  (event) => {
    if (
      event.key === "d" &&
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] === 0
    ) {
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right]++;
      if (!isAnimating) {
        isAnimating = true;

        launchCharacterMovement();
      }
    }

    if (
      event.key === "q" &&
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] === 0
    ) {
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left]++;
      isAnimating = true;
      launchCharacterMovementLeft();
    }
  }
);

document.addEventListener("keyup", (event) => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.walk] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
  isAnimating = false; // Stop animation when "d" is released
  if (event.key === "d" || event.key === "q") {
    stepsInSwow.pause();
  }
});

window.onload = () => {
  MAPS.push(createMapPalaceBlock(0));
  MAPS.push(createMapPalaceBlock(window.innerWidth));
  MAPS.push(createMapPalaceBlock(window.innerWidth * 2));
};

let searchTimeout: number;

const spriteSheet = new Image();
spriteSheet.src = "assets/palace/characters/premium.png"; // Update this to the correct path

let isAnimating = false; // Animation state

const launchObeliskLightningAnimation = () => {
  const obeliskLightning = document.getElementById(
    "obeliskLightning"
  )! as HTMLImageElement;

  launchAnimationAndDeclareItLaunched(
    obeliskLightning,
    0,
    "png",
    "assets/challenge/items/lightning",
    1,
    16,
    1,
    true,
    ANIMATION_ID.obelisk_lightning
  );
};

const launchObeliskAnimation = () => {
  const obeliskImage = document.getElementById(
    "obeliskImage"
  )! as HTMLImageElement;
  launchAnimationAndDeclareItLaunched(
    obeliskImage,
    0,
    "png",
    "assets/challenge/items/obelisk",
    1,
    13,
    1,
    true,
    ANIMATION_ID.obelisk_idle
  );
};
