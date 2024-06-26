import store, {
  RootState,
  Slot,
  addSection,
  endSection,
  updateItem,
} from "./store.js";
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
const enemy = document.getElementById("enemyImg")! as HTMLImageElement;
const enemyContainer = document.getElementById("enemy_container")!;
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

const openTextContainer = (event: Event) => {
  // Create the new container
  const target = event.currentTarget as HTMLDivElement;
  const slotId = target.id;

  if (isSettingSection) {
    // Set the beginning of the section
    const state = window.store.getState();
    const sections = state.localStorage.sections;
    const currentSection = sections.find(
      (section) => section.endSlotId === undefined
    );

    if (currentSection) {
      const confirmation = confirm(
        "Careful, you will close the current section and open up a new one, do you want this?"
      );
      if (!confirmation) return;

      window.store.dispatch(
        endSection({ endSlotId: currentSection.beginSlotId })
      );
    }

    const newSection = {
      name: newSectionName,
      beginSlotId: slotId,
    };

    window.store.dispatch(addSection(newSection));

    isSettingSection = false;
    newSectionName = "";
    return;
  }

  // Get the current slot item from the store
  const state = window.store.getState();
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

// Add button to trigger section setup
const addSectionButton = document.createElement("button");
addSectionButton.innerText = "Add Section";
addSectionButton.style.position = "absolute";
addSectionButton.style.bottom = "10px";
addSectionButton.style.left = "10px";
addSectionButton.style.zIndex = "10000";
addSectionButton.addEventListener("click", setupAddSection);

document.body.appendChild(addSectionButton);

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
    MAPS[0].offsetLeft >= 0
  ) {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
    return;
  }

  if (
    direction === ANIMATION_ID.camera_left_to_right &&
    MAPS[MAPS.length - 1].offsetLeft <= 0
  ) {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
    return;
  }

  MAPS.forEach(
    (map) =>
      (map.style.left = `${
        map.offsetLeft +
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

const launchAttack = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;

  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    "assets/challenge/characters/hero/attack",
    1,
    4,
    1,
    false,
    ANIMATION_ID.attack
  );

  setTimeout(() => {
    if (
      heroContainer.offsetLeft +
        heroContainer.offsetWidth +
        window.innerWidth * 0.05 >
        enemyContainer.offsetLeft &&
      enemy
    ) {
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
      ANIMATION_ID.run
    );
    initAnimation(ANIMATION_ID.attack);
  }, 1000);
};

const launchOpponent = () => {
  launchAnimationAndDeclareItLaunched(
    enemy,
    0,
    "png",
    "assets/challenge/characters/enemies/wolf",
    1,
    9,
    1,
    true,
    ANIMATION_ID.opponent_run
  );
};

let enemyOnScreen = true;

const moveEnemy = () => {
  if (!enemyOnScreen) return;

  enemyContainer.style.left = `${enemyContainer.offsetLeft - 10}px`;

  requestAnimationFrame(moveEnemy);
};

const detectCollision = () => {
  if (heroContainer.offsetLeft > enemyContainer.offsetLeft) {
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

  const firstMapDomElement = MAPS[0];

  if (firstMapDomElement.offsetLeft < -window.innerWidth) {
    firstMapDomElement.remove();
    MAPS.shift();
    currentCacheLeftIndex++;
  }

  const lastMapDomElement = MAPS[MAPS.length - 1];

  if (
    lastMapDomElement &&
    lastMapDomElement.offsetLeft <= window.innerWidth / 10 &&
    currentCacheRightIndex <
      window.store.getState().localStorage.mapBlocks.length - 1
  ) {
    MAPS.push(
      createMapPalaceBlock(
        lastMapDomElement.offsetLeft + lastMapDomElement.offsetWidth,
        window.store.getState().localStorage.mapBlocks[currentCacheRightIndex]
      )
    );
    currentCacheRightIndex++;
  }

  updateCurrentSection();

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

  const firstMapDomElement = MAPS[0];

  if (
    firstMapDomElement &&
    firstMapDomElement.offsetLeft > -window.innerWidth &&
    currentCacheLeftIndex > 0
  ) {
    const newMapBlockData =
      window.store.getState().localStorage.mapBlocks[currentCacheLeftIndex - 1];
    MAPS.unshift(
      createMapPalaceBlock(
        firstMapDomElement.offsetLeft - firstMapDomElement.offsetWidth,
        newMapBlockData
      )
    );
    currentCacheLeftIndex--;
  }

  const lastMapDomElement = MAPS[MAPS.length - 1];

  if (lastMapDomElement && lastMapDomElement.offsetLeft > window.innerWidth) {
    lastMapDomElement.remove();
    MAPS.pop();
  }

  updateCurrentSection();

  requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));
};

const updateCurrentSection = () => {
  const state = window.store.getState();
  const middleOfScreen = window.innerWidth / 2;

  let currentSectionName = "No current section";

  for (const section of state.localStorage.sections) {
    const beginSlotElement = document.getElementById(section.beginSlotId);
    if (beginSlotElement) {
      const offsetLeft =
        beginSlotElement.offsetLeft + beginSlotElement.offsetWidth / 2;
      if (offsetLeft < middleOfScreen) {
        currentSectionName = section.name;
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
      launchCharacterMovement();
      checkForScreenUpdateFromLeftToRight(10);
    }

    if (
      event.key === "q" &&
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] === 0
    ) {
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left]++;
      launchCharacterMovementLeft();
      checkForScreenUpdateFromRightToLeft(10);
    }
  }
);

document.addEventListener("keyup", () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.walk] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
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
