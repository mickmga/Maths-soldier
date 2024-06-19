"use strict";
const MAPS = [];
const heroContainer = document.getElementById("hero_container");
const heroImage = document.getElementById("heroImg");
const enemy = document.getElementById("enemyImg");
const enemyContainer = document.getElementById("enemy_container");
const errorScoreContainer = document.getElementById("error_score");
const successfulKillsScoreContainer = document.getElementById("killed_score");
const menu = document.getElementById("menu");
const searchInput = document.getElementById("searchInput");
const menuB = document.getElementById("menuB");
let errorScore = 0;
let successfulKillsScore = 0;
//local storage
let backgroundSrc = "assets/palace/maps/castle/castle.gif";
let currentCacheLeftIndex = 0;
let currentCacheRightIndex = 1;
const localStorageElements = [
  [
    {
      id: "yyz",
      src: "assets/palace/items/courage.png",
    },
    {
      id: "xxz",
      src: "assets/palace/items/gamepad.png",
    },
    {
      id: "xwz",
      src: "assets/palace/items/greece.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/papyrus.png",
    },
    null,
  ],
  [
    {
      id: "yyz",
      src: "assets/palace/items/courage.png",
    },
    {
      id: "xxz",
      src: "assets/palace/items/gamepad.png",
    },
    {
      id: "xwz",
      src: "assets/palace/items/greece.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/papyrus.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/parthenon.png",
    },
  ],
  [
    {
      id: "yyz",
      src: "assets/palace/items/courage.png",
    },
    {
      id: "xxz",
      src: "assets/palace/items/gamepad.png",
    },
    {
      id: "xwz",
      src: "assets/palace/items/greece.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/papyrus.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/parthenon.png",
    },
  ],
  [
    {
      id: "yyz",
      src: "assets/palace/items/courage.png",
    },
    {
      id: "xxz",
      src: "assets/palace/items/gamepad.png",
    },
    {
      id: "xwz",
      src: "assets/palace/items/greece.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/papyrus.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/parthenon.png",
    },
  ],
  [
    {
      id: "yyz",
      src: "assets/palace/items/courage.png",
    },
    {
      id: "xxz",
      src: "assets/palace/items/gamepad.png",
    },
    {
      id: "xwz",
      src: "assets/palace/items/greece.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/papyrus.png",
    },
    {
      id: "xmz",
      src: "assets/palace/items/parthenon.png",
    },
  ],
];
const makeId = (length) => {
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
var ANIMATION_ID;
(function (ANIMATION_ID) {
  ANIMATION_ID[(ANIMATION_ID["attack"] = 0)] = "attack";
  ANIMATION_ID[(ANIMATION_ID["run"] = 1)] = "run";
  ANIMATION_ID[(ANIMATION_ID["walk"] = 2)] = "walk";
  ANIMATION_ID[(ANIMATION_ID["opponent_run"] = 3)] = "opponent_run";
  ANIMATION_ID[(ANIMATION_ID["camera_left_to_right"] = 4)] =
    "camera_left_to_right";
  ANIMATION_ID[(ANIMATION_ID["camera_right_to_left"] = 5)] =
    "camera_right_to_left";
  ANIMATION_ID[(ANIMATION_ID["character_left_to_right_move"] = 6)] =
    "character_left_to_right_move";
})(ANIMATION_ID || (ANIMATION_ID = {}));
const ANIMATION_RUNNING_VALUES = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 0,
  [ANIMATION_ID.walk]: 0,
  [ANIMATION_ID.opponent_run]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 0,
};
let pickedSlotId = null;
const selectItem = (event) => {
  const target = event.currentTarget;
  const slotId = target.id;
  alert(`picked slot : ${slotId}`);
  pickedSlotId = slotId;
};
const createItemSlots = (slots) => {
  var _a, _b, _c, _d, _e;
  return `
      <div class='slotGroup slotsLeft'>
        <div class='slot' onclick='selectItem(event)' id='slot_1'>
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
           <img class='item' src='${
             ((_a = slots[0]) === null || _a === void 0 ? void 0 : _a.src)
               ? slots[0].src
               : ""
           }'/>
        </div>
        <div class='slot' onclick='selectItem(event)' id='slot_2'>
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
           <img class='item' src='${
             ((_b = slots[1]) === null || _b === void 0 ? void 0 : _b.src)
               ? slots[1].src
               : ""
           }'/>
        </div>
      </div>
      <div class='slotGroup slotsCenter'>
      <div class='slot' onclick='selectItem(event)' id='slot_3'>
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
           <img class='item' src='${
             ((_c = slots[2]) === null || _c === void 0 ? void 0 : _c.src)
               ? slots[2].src
               : ""
           }'/>
        </div>
      </div>
      <div class='slotGroup slotRight'>
        <div class='slot'>
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
           <img class='item' src='${
             ((_d = slots[3]) === null || _d === void 0 ? void 0 : _d.src)
               ? slots[3].src
               : ""
           }'/>
        </div>
        <div class='slot' onclick='selectItem(event)' id='slot_4'>
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
              ((_e = slots[4]) === null || _e === void 0 ? void 0 : _e.src)
                ? '<img src="' + slots[4].src + '" />'
                : ""
            }
        </div>
      </div>
    `;
};
const createMapPalaceBlock = (left, map) => {
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
const moveCamera = (direction) => {
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
  characterElement,
  throttleNum,
  extension,
  spriteBase,
  spriteIndex,
  max,
  min,
  loop,
  animationId
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
  characterElement,
  throttleNum,
  extension,
  spriteBase,
  spriteIndex,
  max,
  min,
  loop,
  animationId
) => {
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
const initAnimation = (animationId) => {
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
const checkForScreenUpdateFromLeftToRight = (throttleNum) => {
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
  //deletion
  //pick first map block
  const firstMapDomElement = MAPS[0];
  if (firstMapDomElement.offsetLeft < -window.innerWidth) {
    firstMapDomElement.remove();
    MAPS.shift();
  }
  //creation
  const lastMapDomElement = MAPS[MAPS.length - 1];
  if (
    lastMapDomElement &&
    lastMapDomElement.offsetLeft <= window.innerWidth / 10 &&
    currentCacheRightIndex < localStorageElements.length - 1
  ) {
    MAPS.push(
      createMapPalaceBlock(
        lastMapDomElement.offsetLeft + lastMapDomElement.offsetWidth,
        localStorageElements[currentCacheRightIndex]
      )
    );
    currentCacheRightIndex++;
  }
  requestAnimationFrame(() => checkForScreenUpdateFromLeftToRight(throttleNum));
};
const checkForScreenUpdateFromRightToLeft = (throttleNum) => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] === 0) {
    return;
  }
  //collect data from the cache
  if (throttleNum < 10) {
    throttleNum++;
    return requestAnimationFrame(() =>
      checkForScreenUpdateFromRightToLeft(throttleNum)
    );
  }
  throttleNum = 0;
  //creation
  //pick first map block
  const firstMapDomElement = MAPS[0];
  if (
    firstMapDomElement &&
    firstMapDomElement.offsetLeft > -window.innerWidth &&
    currentCacheLeftIndex > 0
  ) {
    const newMapBlockData = localStorageElements[currentCacheLeftIndex - 1];
    MAPS.unshift(
      createMapPalaceBlock(
        firstMapDomElement.offsetLeft - firstMapDomElement.offsetWidth,
        newMapBlockData
      )
    );
    currentCacheLeftIndex--;
  }
  //deletion
  const lastMapDomElement = MAPS[MAPS.length - 1];
  if (lastMapDomElement && lastMapDomElement.offsetLeft > window.innerWidth) {
    lastMapDomElement.remove();
    MAPS.pop();
  }
  requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));
};
//CHALLENGE.TS ENDING
const initHero = () => {};
const openMenu = () => {
  menu.style.display = "flex";
};
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
document.addEventListener("keydown", (event) => {
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
  if (event.key === " ") {
    openMenu();
  }
});
document.addEventListener("keyup", () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.walk] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
});
window.onload = () => {
  MAPS.push(createMapPalaceBlock(0, localStorageElements[0]));
  MAPS.push(createMapPalaceBlock(window.innerWidth, localStorageElements[1]));
};
let searchTimeout;
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
const fetchIcons = (query) => {
  fetch(`http://localhost:3000/iconfinder?query=${query}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      displaySearchResults(data.icons);
    })
    .catch((error) => {
      console.error("Error fetching icons:", error);
    });
};
const changeSlotItem = (src) => {
  if (!pickedSlotId) return;
  const itemImg = getFirstImageById(pickedSlotId);
  if (!itemImg) return;
  itemImg.src = src;
  //update storage
  //update html
};
const displaySearchResults = (icons) => {
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
const getFirstImageById = (elementId) => {
  // Get the element by its ID
  const element = document.getElementById(elementId);
  // Check if the element exists and has at least one child node
  if (element && element.children.length > 0) {
    // Loop through the children to find the first <img> element
    for (let i = 0; i < element.children.length; i++) {
      if (element.children[i].tagName.toLowerCase() === "img") {
        return element.children[i];
      }
    }
  }
  // Return null if no <img> element is found
  return null;
};
