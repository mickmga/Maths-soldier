import store, {
  RootState,
  Slot,
  Section,
  addSection,
  updateSection,
  removeSection,
  updateItem,
} from "./store";

import { Store } from "redux";

let isSettingSectionStart = false;

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
const enemy = document.getElementById("enemyImg")! as HTMLImageElement;
const enemyContainer = document.getElementsByClassName("enemy_container")[0]!;
const errorScoreContainer = document.getElementById("error_score")!;
const successfulKillsScoreContainer = document.getElementById("killed_score")!;
const menu = document.getElementById("menu")!;
const searchInput = document.getElementById("searchInput")! as HTMLInputElement;
const menuB = document.getElementById("menuB") as HTMLDivElement;

let errorScore = 0;
let successfulKillsScore = 0;

let backgroundSrc = "assets/palace/maps/castle/castle.gif";

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
}

const ANIMATION_RUNNING_VALUES = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 0,
  [ANIMATION_ID.walk]: 0,
  [ANIMATION_ID.opponent_run]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 0,
};

let pickedSlotId: null | string = null;

let isSettingSection = false;
let newSectionName = "";

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

const openTextContainer = (event: Event) => {
  const target = event.currentTarget as HTMLDivElement;
  const slotId = target.id;

  if (isSettingSectionStart) {
    const existingSection = window.store
      .getState()
      .localStorage.sections.find((section) => section.beginSlotId === slotId);

    if (existingSection) {
      const confirmDelete = confirm(
        `The section "${existingSection.name}" already starts here. Do you want to remove it?`
      );
      if (confirmDelete) {
        window.store.dispatch(removeSection({ beginSlotId: slotId }));
      } else {
        isSettingSectionStart = false;
        return;
      }
    }

    setSectionStart(slotId);
    return;
  }

  // Check if a section already starts at this slot
  const state = window.store.getState();

  // Get the current slot item from the store
  const mapBlock = state.localStorage.mapBlocks.find((map) =>
    map.some((slot) => slot.slotId === slotId)
  );
  const slot = mapBlock
    ? mapBlock.find((slot) => slot.slotId === slotId)
    : null;

  // Create the new container
  const textContainer = document.createElement("div");
  textContainer.id = "textContainer";

  // Create the close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(textContainer);
  });

  // Create the input element
  const inputElement = document.createElement("input");
  inputElement.id = "textInput";
  inputElement.type = "text";
  inputElement.placeholder = "Enter title here...";
  inputElement.value = slot?.item?.title || "";

  // Create the text area element
  const textAreaElement = document.createElement("textarea");
  textAreaElement.id = "textArea";
  textAreaElement.placeholder = "Enter body here...";
  textAreaElement.value = slot?.item?.body || "";

  // Create the update image button
  const updateImageButton = document.createElement("button");
  updateImageButton.innerText = "Update Image";
  updateImageButton.style.position = "absolute";
  updateImageButton.style.bottom = "10px";
  updateImageButton.style.right = "10px";
  updateImageButton.addEventListener("click", () => {
    document.body.removeChild(textContainer); // Close text container
    openMenu(slotId); // Open the icon menu
  });

  // Append the close button, input, text area, and update image button to the container
  textContainer.appendChild(closeButton);
  textContainer.appendChild(inputElement);
  textContainer.appendChild(textAreaElement);
  textContainer.appendChild(updateImageButton);

  // Append the container to the body
  document.body.appendChild(textContainer);

  // Apply styles to position and display the container
  textContainer.style.display = "flex";
  textContainer.style.flexDirection = "column";
  textContainer.style.justifyContent = "space-around";
  textContainer.style.alignItems = "center";
  textContainer.style.position = "absolute";
  textContainer.style.top = "25vh";
  textContainer.style.left = "30vw";
  textContainer.style.width = "40vw";
  textContainer.style.height = "60vh";
  textContainer.style.backgroundColor = "brown";
  textContainer.style.opacity = "0.95";
  textContainer.style.zIndex = "5";

  // Add event listener for the input element
  inputElement.addEventListener("input", (event) => {
    const title = (event.target as HTMLInputElement).value;
    window.store.dispatch(
      updateItem({ slotId, item: { ...slot?.item, title } })
    );
  });

  // Add event listener for the textarea element
  textAreaElement.addEventListener("input", (event) => {
    const body = (event.target as HTMLTextAreaElement).value;
    window.store.dispatch(
      updateItem({ slotId, item: { ...slot?.item, body } })
    );
  });
};

// Add section setup function
const setupAddSection = () => {
  isSettingSection = true;
  const sectionName = prompt("Enter the section name:");
  if (sectionName) {
    newSectionName = sectionName;
    alert("Click on a slot to set the beginning of the section.");
  } else {
    isSettingSection = false;
  }
};

// Create the button to add a new section
const addSectionButton = document.createElement("button");
addSectionButton.innerText = "Add Section";
addSectionButton.style.position = "absolute";
addSectionButton.style.bottom = "10px";
addSectionButton.style.left = "10px";
addSectionButton.style.zIndex = "10000";
addSectionButton.addEventListener("click", () => {
  isSettingSectionStart = true;
  setupAddSection();
});

// Append the button to the body or a specific container
document.body.appendChild(addSectionButton);

// Add the current section display element
const currentSectionElement = document.createElement("div");
currentSectionElement.id = "currentSection";
currentSectionElement.style.position = "absolute";
currentSectionElement.style.bottom = "10px";
currentSectionElement.style.left = "50%";
currentSectionElement.style.transform = "translateX(-50%)";
document.body.appendChild(currentSectionElement);

window.openTextContainer = openTextContainer;

const createItemSlots = (slots: Slot[]) => {
  return `
      <div class='slotGroup slotsLeft'>
        <div class='slot' onclick='openTextContainer(event)' id='${
          slots[0]?.slotId
        }'>
              <div class="fire">
                <div class="fire-left">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-center">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-right">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-bottom">
                  <div class="main-fire"></div>
                </div>
              </div>
           ${
             slots[0]?.item
               ? `<img class='item' src='${slots[0].item.src}'/>`
               : ""
           }
        </div>
        <div class='slot' onclick='openTextContainer(event)' id='${
          slots[1]?.slotId
        }'>
              <div class="fire">
                <div class="fire-left">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-center">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-right">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-bottom">
                  <div class="main-fire"></div>
                </div>
              </div>
           ${
             slots[1]?.item
               ? `<img class='item' src='${slots[1].item.src}'/>`
               : ""
           }
        </div>
      </div>
      <div class='slotGroup slotsCenter'>
      <div class='slot' onclick='openTextContainer(event)' id='${
        slots[2]?.slotId
      }'>
      <div class="fire">
                <div class="fire-left">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-center">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-right">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-bottom">
                  <div class="main-fire"></div>
                </div>
             </div>
           ${
             slots[2]?.item
               ? `<img class='item' src='${slots[2].item.src}'/>`
               : ""
           }
        </div>
      </div>
      <div class='slotGroup slotRight'>
        <div class='slot' onclick='openTextContainer(event)' id='${
          slots[3]?.slotId
        }'>
            <div class="fire">
                <div class="fire-left">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-center">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-right">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-bottom">
                  <div class="main-fire"></div>
                </div>
              </div>
           ${
             slots[3]?.item
               ? `<img class='item' src='${slots[3].item.src}'/>`
               : ""
           }
        </div>
        <div class='slot' onclick='openTextContainer(event)' id='${
          slots[4]?.slotId
        }'>
             <div class="fire">
                <div class="fire-left">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-center">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-right">
                  <div class="main-fire"></div>
                  <div class="particle-fire"></div>
                </div>
                <div class="fire-bottom">
                  <div class="main-fire"></div>
                </div>
             </div>
            ${
              slots[4]?.item
                ? `<img class='item' src='${slots[4].item.src}'/>`
                : ""
            }
        </div>
      </div>
    `;
};

const createMapPalaceBlock = (left: number, map: Slot[]) => {
  const block = document.createElement("div");
  block.classList.add("mapBlock");
  const backgroundImage = document.createElement("img");
  backgroundImage.src = backgroundSrc;
  block.append(backgroundImage);
  block.style.position = "fixed";
  block.style.left = `${left}px`;

  // Convert the string to DOM elements and append
  const slots = document.createElement("div");
  slots.innerHTML = createItemSlots(map);
  block.append(slots);
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
  if (!characterElement) {
    return;
  }

  if (
    !ANIMATION_RUNNING_VALUES[animationId] ||
    ANIMATION_RUNNING_VALUES[animationId] > 1
  ) {
    return;
  }

  if (throttleNum < 5) {
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

  if (throttleNum < 10) {
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
          lastMapDomElement.offsetWidth,
        window.store.getState().localStorage.mapBlocks[currentCacheRightIndex]
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

  if (throttleNum < 10) {
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
          firstMapDomElement.offsetWidth,
        newMapBlockData
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

const updateCurrentSection = () => {
  const state = window.store.getState();
  const middleOfScreen = window.innerWidth / 2;

  let currentSectionName = "No current section";

  for (const section of state.localStorage.sections) {
    const beginSlotElement = document.getElementById(section.beginSlotId);
    const endSlotElement = section.endSlotId
      ? document.getElementById(section.endSlotId)
      : null;

    if (beginSlotElement && endSlotElement) {
      const beginLeftPos =
        beginSlotElement.getBoundingClientRect().left +
        beginSlotElement.offsetWidth / 2;
      const endLeftPos =
        endSlotElement.getBoundingClientRect().left +
        endSlotElement.offsetWidth / 2;

      if (beginLeftPos < middleOfScreen && endLeftPos > middleOfScreen) {
        currentSectionName = section.name;
        break;
      }
    }
  }

  const currentSectionElement = document.getElementById("currentSection");
  if (currentSectionElement) {
    currentSectionElement.textContent = currentSectionName;
  }
};

//CHALLENGE.TS ENDING

const initHero = () => {};

const openMenu = (slotId: string) => {
  selectItem(slotId);
  // Close the text container if it is open
  const textContainer = document.getElementById("textContainer");
  if (textContainer) {
    document.body.removeChild(textContainer);
  }

  // Open the icon menu
  menu.style.display = "flex";
};

const closeMenu = () => {
  menu.style.display = "none";
};
window.closeMenu = closeMenu;

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

document.addEventListener(
  "keydown",

  (event) => {
    if (
      event.key === "d" &&
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] === 0
    ) {
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right]++;
      //launchCharacterMovement();
      checkForScreenUpdateFromLeftToRight(10);
      if (!isAnimating) {
        isAnimating = true;

        moveCamera(ANIMATION_ID.camera_left_to_right);
        animate(11); // Start animation when "d" is pressed
      }
    }

    if (
      event.key === "q" &&
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] === 0
    ) {
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left]++;
      isAnimating = true;
      // launchCharacterMovementLeft();
      checkForScreenUpdateFromRightToLeft(10);
      animate(9); // Start animation when "d" is pressed
      moveCamera(ANIMATION_ID.camera_right_to_left);
    }
  }
);

document.addEventListener("keyup", () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.walk] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
  isAnimating = false; // Stop animation when "d" is released
});

window.onload = () => {
  MAPS.push(
    createMapPalaceBlock(0, window.store.getState().localStorage.mapBlocks[0])
  );
  MAPS.push(
    createMapPalaceBlock(
      window.innerWidth,
      window.store.getState().localStorage.mapBlocks[1]
    )
  );

  updateCurrentSection();
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

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  if (target.classList.contains("slot")) {
    if (isSettingSectionStart) {
      console.log("is setting section start after click >");
      console.log(isSettingSectionStart);
      const slotId = target.id;
      // Check if the section already exists at this slot
      const state = window.store.getState();
      const existingSection = state.localStorage.sections.find(
        (section) => section.beginSlotId === slotId
      );

      if (existingSection) {
        const confirmation = confirm(
          `The section "${existingSection.name}" already starts here. Do you want to destroy it?`
        );
        if (confirmation) {
          window.store.dispatch(removeSection(existingSection));
        } else {
          return; // Exit the function if the user does not want to destroy the existing section
        }
      }

      // Set the section start
      setSectionStart(slotId);
    } else {
      openTextContainer(event);
    }
  }
});
const setSectionStart = (slotId: string) => {
  const state = window.store.getState();
  const sections = state.localStorage.sections;

  if (sections.length > 0) {
    const lastSection = sections[sections.length - 1];

    // Get the index of the slot just before the new section's start slot
    const mapBlocks = state.localStorage.mapBlocks.flat();
    const newSectionStartIndex = mapBlocks.findIndex(
      (slot) => slot.slotId === slotId
    );
    const previousSlot =
      newSectionStartIndex > 0 ? mapBlocks[newSectionStartIndex - 1] : null;

    if (previousSlot) {
      // Update the end of the last section to be the slot just before the new section's start slot
      window.store.dispatch(
        updateSection({
          ...lastSection,
          endSlotId: previousSlot.slotId,
        })
      );
    }
  }

  const newSection = {
    name: newSectionName,
    beginSlotId: slotId,
  };

  window.store.dispatch(addSection(newSection));
  isSettingSectionStart = false;
};

const openMap = () => {
  document.getElementById("palaceMap")!.style.display = "flex";
};

//choice.ts

const canvas = document.getElementById("spriteCanvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const spriteSheet = new Image();
spriteSheet.src = "assets/palace/characters/premium.png"; // Update this to the correct path

const spriteWidth = 64; // Width of a single frame
const spriteHeight = 64; // Height of a single frame
const numCols = 13; // Number of columns in your sprite sheet
const spriteRow = 11; // The 11th row (0-indexed) is the walk animation
const numFrames = 8; // Number of frames in the walk animation

let frameIndex = 0;
const fps = 10;
const frameDuration = 1000 / fps;
const startCol = 1; // Start from the second column (0-indexed)
let isAnimating = false; // Animation state

function drawFrame(
  frameIndex: number,
  x: number,
  y: number,
  spriteRow: number
) {
  const col = (frameIndex + startCol) % numCols;
  const sx = col * spriteWidth;
  const sy = spriteRow * spriteHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    spriteSheet,
    sx,
    sy,
    spriteWidth,
    spriteHeight, // Source rectangle
    x,
    y,
    100,
    100 // Destination rectangle
  );
}

function animate(spriteRow: number) {
  if (!isAnimating) return; // Stop animation if not animating
  setTimeout(() => {
    frameIndex = (frameIndex + 1) % numFrames;
    drawFrame(frameIndex, 96, 96, spriteRow); // Character stays at (96, 96)
    requestAnimationFrame(() => animate(spriteRow));
  }, frameDuration);
}

spriteSheet.onload = function () {
  drawFrame(frameIndex, 96, 96, 11); // Draw the initial frame
};
