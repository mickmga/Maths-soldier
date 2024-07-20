import store, { RootState, Section, updateItem } from "./store";

import { Store } from "redux";

// Declare global variables
declare global {
  interface Window {
    store: Store<RootState>;
    selectItem: (event: Event) => void;
    closeMenu: (event: Event) => void;
    openTextContainer: (event: Event) => void;
  }
}

// Attach the store to the window object for global access
window.store = store;

const MAPS: HTMLElement[] = [];
const heroContainer = document.getElementById("hero_container")!;
const heroImage = document.getElementById("heroImg")! as HTMLImageElement;
const enemyContainer = document.getElementsByClassName("enemy_container")[0]!;
const successfulKillsScoreContainer = document.getElementById("killed_score")!;
const menu = document.getElementById("menu")!;
const searchInput = document.getElementById("searchInput")! as HTMLInputElement;
const menuB = document.getElementById("menuB") as HTMLDivElement;
const stepsInSwow = document.getElementById(
  "snow_steps_audio"
)! as HTMLAudioElement;
const windowAudio = document.getElementById("wind_audio")! as HTMLAudioElement;

windowAudio.volume = 0.4;
stepsInSwow.volume = 0.7;
stepsInSwow.playbackRate = 1.2;

let errorScore = 0;
let successfulKillsScore = 0;

let backgroundSrc = "assets/challenge/maps/outside.png";

let currentCacheLeftIndex = 0;
let currentCacheRightIndex = 1;

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

let pickedSlotId: null | string = null;

const selectItem = (slotId: string): void => {
  pickedSlotId = slotId;
};

const updateCurrentSectionDisplay = () => {
  const state = window.store.getState();
  const middleOfScreen = window.innerWidth / 2;

  const currentSectionElement = document.getElementById("currentSection");
  if (!currentSectionElement) return;

  const currentSection = state.localStorage.sections.find((section) => {
    const beginSlotElement = document.getElementById(section.beginSlotId);
    const endSlotElement = document.getElementById(section.endSlotId || "");
    if (!beginSlotElement || !endSlotElement) return false;

    const beginOffset = beginSlotElement.getBoundingClientRect().left;
    const endOffset = endSlotElement.getBoundingClientRect().left;
    return beginOffset <= middleOfScreen && endOffset >= middleOfScreen;
  });

  if (currentSection) {
    currentSectionElement.innerText = `Current Section: ${currentSection.name}`;
  } else {
    currentSectionElement.innerText = "No Current Section";
  }
};

window.addEventListener("scroll", updateCurrentSectionDisplay);
window.addEventListener("resize", updateCurrentSectionDisplay);

// Add the current section display element
const currentSectionElement = document.createElement("div");
currentSectionElement.id = "currentSection";
currentSectionElement.style.position = "absolute";
currentSectionElement.style.bottom = "10px";
currentSectionElement.style.left = "50%";
currentSectionElement.style.transform = "translateX(-50%)";
document.body.appendChild(currentSectionElement);

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

let tutoStep = 0;

const launchTutorialTalk = () => {
  tutoStep++;
  if (tutoStep > 9) {
    alert("tuto is over");
  }
  const audio = document.getElementById(
    `bard_tutorial_${tutoStep}`
  )! as HTMLAudioElement;
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

const launchGolemDoorCreationAnimation = () => {
  const golemImage = document.getElementById("golemImage") as HTMLImageElement;

  if (!golemImage) {
    console.log("l image n existe pas");
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

const updateScores = () => {
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

const detectCollision = () => {
  if (
    heroContainer.getBoundingClientRect().left >
    enemyContainer.getBoundingClientRect().left
  ) {
    errorScore++;
    updateScores();

    return;
  }

  requestAnimationFrame(detectCollision);
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

  const middleOfScreen = window.innerWidth / 2;

  const sectionsAtTheLeftOfTheMiddle: Section[] = [];

  window.store.getState().localStorage.sections.find((section) => {
    console.log(section);
    const beginSlotElement = document.getElementById(section.beginSlotId);
    if (beginSlotElement) {
      const beginOffset = beginSlotElement.getBoundingClientRect().left;

      if (beginOffset < middleOfScreen) {
        sectionsAtTheLeftOfTheMiddle.push(section);
      }
    }
  });
  if (sectionsAtTheLeftOfTheMiddle.length) {
    console.log("section at the left >");
    console.log(sectionsAtTheLeftOfTheMiddle);
    const currentSection =
      sectionsAtTheLeftOfTheMiddle[sectionsAtTheLeftOfTheMiddle.length - 1];

    document.getElementById("currentSection")!.innerText =
      "Current section: " + currentSection.name;
  } else {
    document.getElementById("currentSection")!.innerText = "No current section";
  }

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

  const middleOfScreen = window.innerWidth / 2;

  const sectionsAtTheLeftOfTheMiddle: Section[] = [];

  window.store.getState().localStorage.sections.find((section: Section) => {
    const beginSlotElement = document.getElementById(section.beginSlotId);
    if (beginSlotElement) {
      const beginOffset = beginSlotElement.getBoundingClientRect().left;

      if (beginOffset < middleOfScreen) {
        sectionsAtTheLeftOfTheMiddle.push(section);
        console.log("we found one");
      }
    }
  });
  if (sectionsAtTheLeftOfTheMiddle.length) {
    const currentSection =
      sectionsAtTheLeftOfTheMiddle[sectionsAtTheLeftOfTheMiddle.length - 1];

    document.getElementById("currentSection")!.innerText =
      "Current section: " + currentSection.name;
  } else {
    document.getElementById("currentSection")!.innerText = "No current section";
  }

  const firstMapDomElement = MAPS[0];

  if (
    firstMapDomElement &&
    firstMapDomElement.getBoundingClientRect().left > -window.innerWidth &&
    currentCacheLeftIndex > 0
  ) {
    const newMapBlockData =
      window.store.getState().localStorage.mapBlocks[currentCacheLeftIndex - 1];
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

const closeMenu = () => {
  menu.style.display = "none";
};
window.closeMenu = closeMenu;

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

interface IconFormat {
  preview_url: string;
}

interface RasterSize {
  formats: IconFormat[];
}

interface Icon {
  raster_sizes: RasterSize[];
}

let searchTimeout: number;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(() => {
    const query = searchInput.value.trim();
    if (query) {
      fetchIcons(query);
    } else {
      menuB.innerHTML = ""; // Clear results if input is empty
    }
  }, 300); // Debounce to reduce the number of API calls
});

const fetchIcons = (query: string): void => {
  fetch(`http://localhost:3000/iconfinder?query=${query}`)
    .then((response) => response.json())
    .then((data: { icons: Icon[] }) => {
      displaySearchResults(data.icons);
    })
    .catch((error) => {
      console.error("Error fetching icons:", error);
    });
};

const changeSlotItem = (src: string) => {
  if (!pickedSlotId) return;

  // Parse pickedSlotId to get slotId
  const slotId = pickedSlotId;

  // Update the item in the store
  window.store.dispatch(updateItem({ slotId, item: { id: makeId(3), src } }));

  // Retrieve the updated state
  const updatedSlot = window.store
    .getState()
    .localStorage.mapBlocks.flat()
    .find((slot) => slot.slotId === slotId);

  // Update the image src in the DOM if the slot is found and has an item
  if (updatedSlot && updatedSlot.item) {
    const itemImg = getFirstImageById(slotId);
    if (itemImg) {
      itemImg.src = updatedSlot.item.src;
    } else {
      // Create a new img element if it doesn't exist
      const slotElement = document.getElementById(slotId);
      if (slotElement) {
        const newImg = document.createElement("img");
        newImg.classList.add("item");
        newImg.src = updatedSlot.item.src;
        slotElement.appendChild(newImg);
      }
    }
  }
};

const displaySearchResults = (icons: Icon[]): void => {
  menuB.innerHTML = ""; // Clear previous results
  icons.forEach((icon) => {
    const imgElement = document.createElement("img");
    imgElement.onclick = () =>
      changeSlotItem(icon.raster_sizes[6].formats[0].preview_url);
    imgElement.src = icon.raster_sizes[6].formats[0].preview_url;
    imgElement.classList.add("search-result-item");
    menuB.appendChild(imgElement);
  });
};

const getFirstImageById = (elementId: string): HTMLImageElement | null => {
  // Get the element by its ID
  const element = document.getElementById(elementId);

  // Check if the element exists and has at least one child node
  if (element && element.children.length > 0) {
    // Loop through the children to find the first <img> element
    for (let i = 0; i < element.children.length; i++) {
      if (element.children[i].tagName.toLowerCase() === "img") {
        return element.children[i] as HTMLImageElement;
      }
    }
  }
  // Return null if no <img> element is found
  return null;
};

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
