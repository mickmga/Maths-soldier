export {};

const goBackToMountain = (event: Event) => {
  window.location.href = `/discovery${hardMode ? "?started=true" : ""}`;
};

const getUrlParameter = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

const MAPS: HTMLElement[] = [];
const heroContainer = document.getElementById("hero_container")!;
const heroImage = document.getElementById("heroImg")! as HTMLImageElement;

const swordSlashImg = document.getElementById(
  "sword_slash"
)! as HTMLImageElement;

const scoreContainer = document.getElementById("score_value")!;

const answerDataContainer = document.getElementById("answer_data_container")!;
const answerDataValue = document.getElementById("answer_data_value")!;

const scoreMalusContainer = document.getElementById("score_malus_container")!;
const scoreMalusDetail = document.getElementById("score_malus_detail")!;

const scoreRewardContainer = document.getElementById("score_reward_container")!;

const scoreRewardDetail = document.getElementById("score_reward_detail")!;

const ANIMTION_HERO_RUN_DURATION_BETWEEN_FRAMES_IN_MS = 100;

let heroInTheRedZone = false;

const enemyViewPoint = document.getElementsByClassName(
  "enemyViewPoint"
)[0]! as HTMLElement;

const enemyViewPointLogo = document.getElementById(
  "enemyViewPointLogo"
)! as HTMLImageElement;
const enemyViewPointTile1 = document.getElementById(
  "enemyViewPointTile1"
)! as HTMLElement;

const enemyViewPointTile2 = document.getElementById(
  "enemyViewPointTile2"
)! as HTMLElement;
const enemyViewPointTile3 = document.getElementById(
  "enemyViewPointTile3"
)! as HTMLElement;
const enemyViewPointTile4 = document.getElementById(
  "enemyViewPointTile4"
)! as HTMLElement;

const viewPointTiles = [
  enemyViewPointTile1,
  enemyViewPointTile2,
  enemyViewPointTile3,
  enemyViewPointTile4,
];

const updateEnemyViewPointDisplay = () => {
  viewPointTiles.forEach(
    (tile) =>
      (tile.style.background = heroInTheRedZone
        ? "rgba(204, 40, 40, 0.514)"
        : "rgba(40, 108, 204, 0.514)")
  );

  enemyViewPointLogo.src = `assets/challenge/millescaneous/${
    heroInTheRedZone ? "careful" : "vision"
  }.png`;
};

const runAudio = document.getElementById("run_audio")! as HTMLAudioElement;
const swordAudio = document.getElementById("sword_audio")! as HTMLAudioElement;
const laserdAudio = document.getElementById("laser_audio")! as HTMLAudioElement;
let epicAudio = document.getElementById(
  getUrlParameter("mode") === "hard" ? "hard_epic_audio" : "epic_audio"
)! as HTMLAudioElement;
const bassAudio = document.getElementById("bass_audio")! as HTMLAudioElement;
const fireBackgroundAudio = document.getElementById(
  "fire_background_audio"
)! as HTMLAudioElement;
const electricityAudio = document.getElementById(
  "electricity_audio"
)! as HTMLAudioElement;
const transformationScreamAudio = document.getElementById(
  "transformation_scream_audio"
)! as HTMLAudioElement;

const hurtAudio = document.getElementById(
  "hero_hurt_audio"
)! as HTMLAudioElement;

const transformedEpicAudio = document.getElementById(
  "transformed_epic_audio"
)! as HTMLAudioElement;

const transformationOffAudio = document.getElementById(
  "transformation_off_audio"
) as HTMLAudioElement;

const progressBar = document.getElementsByClassName(
  "progress"
)[0]! as HTMLElement;

const bombAudio = document.getElementById("bomb_audio")! as HTMLAudioElement;

swordAudio.volume = 0.65;
bombAudio.volume = 0.12;
electricityAudio.volume = 0.7;
transformationScreamAudio.volume = 0.25;
hurtAudio.volume = 0.025;

runAudio.volume = 0.7;

let currentSubject: Subject | null = null;

let currentSubjectTotal = 0;

let swordReach = window.innerWidth * 0.3;

let gameLaunched = false;

const TRANSFORMED_BONUS_RATIO = 1;
const REWARD_UNIT = 1;

let transformedAlready = false;

const REWARD_TIMEOUT_DURATION = 1000;
const KILLED_ENEMY_REWARD = 30;

let rewardStreak = 15;

let hardMode: boolean | null = false;

let TRANSFORMATION_THRESHOLD = hardMode ? 100000000 : 20;

let preTransformed = false;

let gameFinished = false;

let runStopped = false;

let score = 0;

let heroHurt = false;

let heroIsAlive = true;

const lifePoints = { max: 4, value: 4 };
let INVISIBILITY_DURATION_IN_MILLISECONDS = 600;

let invisible = false;

const ennemiesOnScreen: Enemy[] = [];

let enemiesComingTimeout: ReturnType<typeof setTimeout> | null = null;

let transformed = false;

let currentMalusContainerTimeout: ReturnType<typeof setTimeout> | null = null;
let currentRewardContainerTimeout: ReturnType<typeof setTimeout> | null = null;
let currentTransformationRewardContainerTimeout: ReturnType<
  typeof setTimeout
> | null = null;

class Answer {
  data: string;
  good: boolean;

  constructor(data: string, good: boolean) {
    this.data = data;
    this.good = good;
  }
}

class Enemy {
  element: HTMLElement;
  answer: Answer;
  collideable = true;

  constructor(element: HTMLElement, answer: Answer) {
    this.element = element;
    this.answer = answer;
  }
}

enum TimeoutId {
  HERO,
  ENEMY,
}

declare global {
  interface Window {
    launchAttack: (event: Event) => void;
    launchInvisibilityToggle: (event: Event) => void;
  }
}

type GameTimeouts = {
  [TimeoutId.HERO]: ReturnType<typeof setTimeout>[];
  [TimeoutId.ENEMY]: ReturnType<typeof setTimeout>[];
};

const GAME_TIMEOUTS: GameTimeouts = {
  [TimeoutId.HERO]: [],
  [TimeoutId.ENEMY]: [],
};

type Subject = {
  title: string;
  good: Array<Answer>;
  bad: Array<Answer>;
};

const STATS = {
  title: "statistics",
  good: [
    new Answer(
      "Etendue = Valeur maximale - Valeur minimale d'un jeu de donnée",
      true
    ),

    new Answer(
      "Le mode est la valeur la plus fréquente dans un ensemble de données.",
      true
    ),
    new Answer(
      "La variance mesure à quel point les données d'un ensemble sont dispersées par rapport à la moyenne.",
      true
    ),
    new Answer("L'écart type est la racine carrée de la variance", true),
    new Answer(
      "Les statistiques descriptives sont une des deux catégories des statistiques",
      true
    ),

    new Answer(
      "Les statistiques Inférentielles sont une des deux catégories des statistiques",
      true
    ),
    new Answer(
      "Les statistiques descriptives résument ou décrivent les caractéristiques d'un ensemble de données",
      true
    ),

    new Answer(
      "Les statistiques inférentielles font des inférences et des prédictions sur une population à partir d'un échantillon de données",
      true
    ),
    new Answer("Un ensemble de données peut avoir plusieurs modes", true),
    new Answer("Un ensemble de données peut avoir 0 modes", true),
  ],
  bad: [
    new Answer("Etendue = la Valeur minimale d'un jeu de donnée", false),
    new Answer(
      "Le mode est la valeur la moins répendue dans un ensemble de données.",
      false
    ),
    new Answer(
      "La variance mesure le nombre de différence entre deux jeux de données",
      false
    ),
    new Answer(
      "L'écart type est l'écart entre le premier et le dernier élément d'un jeu de donnée ",
      false
    ),
    new Answer(
      "Les statistiques cumulatives sont une des deux catégories des statistiques",
      false
    ),

    new Answer(
      "Les statistiques proclamatives sont une des deux catégories des statistiques",
      false
    ),
    new Answer("Les statistiques descriptives n'existent pas", false),

    new Answer(
      "les statistique inférentielles décrivent les caractéristiques d'un ensemble de données",
      false
    ),
    new Answer("Un ensemble de données ne peut avoir qu'un mode", false),
    new Answer("Un ensemble de données ne peut pas avoir 0 mode", false),
  ],
};

const VECTORS = {
  title: "Additions",
  good: [
    new Answer("un vecteur est noté AB -> ou u ->", true),
    new Answer(
      "La norme d'un vecteur, notée ||AB->|| est la longueur du vecteur AB -> autrement dit, la distance entre les points A et B.",
      true
    ),
    new Answer(
      "Le point d'origine du vecteur AB -> (ici le point A) est le point de départ qui en caractérise le sens",
      true
    ),
    new Answer(
      "Le point d'extrémité de AB -> est le point d'arrivée  (ici le point B) qui en caractérise le sens",
      true
    ),
    new Answer("Le vecteur opposé du vecteur AB > est BA -> ou -AB -> ", true),

    new Answer(
      "lorsque deux points AB sont confondus, on dit que AB -> est un vecteur nul",
      true
    ),
  ],
  bad: [
    new Answer(
      "Sens, et direction sont synonymes lorsqu'on parle de vecteurs",
      false
    ),
    new Answer(
      "Le point d'extremité est toujours égal au point d'arrivée d'un vecteur",
      false
    ),
    new Answer(
      "Le point d'extremité represente le point de départ du vecteur",
      false
    ),
    new Answer(
      "Un vecteur ne peut pas être nul, sinon ce n'est pas un vecteur",
      false
    ),
  ],
};

const MATHS_ARITHMETIC = {
  title: "Arithmetic",
  good: [
    new Answer("2+3=5", true),
    new Answer("1+1=2", true),
    new Answer("3+2=5", true),
    new Answer("4+3=7", true),
    new Answer("2+2=4", true),
    new Answer("5+3=8", true),
    new Answer("6+1=7", true),
    new Answer("3+4=7", true),
    new Answer("1+4=5", true),
    new Answer("2+5=7", true),
    new Answer("4+4=8", true),
    new Answer("3+3=6", true),
    new Answer("1+5=6", true),
    new Answer("5+2=7", true),
    new Answer("2+4=6", true),
    new Answer("3+5=8", true),
    new Answer("1+6=7", true),
    new Answer("4+2=6", true),
    new Answer("5+1=6", true),
    new Answer("2+3=5", true),
  ],
  bad: [
    new Answer("2+3=6", false),
    new Answer("1+1=3", false),
    new Answer("3+2=6", false),
    new Answer("4+3=6", false),
    new Answer("2+2=5", false),
    new Answer("5+3=9", false),
    new Answer("6+1=8", false),
    new Answer("3+4=8", false),
    new Answer("1+4=6", false),
    new Answer("2+5=8", false),
    new Answer("4+4=9", false),
    new Answer("3+3=7", false),
    new Answer("1+5=7", false),
    new Answer("5+2=8", false),
    new Answer("2+4=7", false),
    new Answer("3+5=9", false),
    new Answer("1+6=8", false),
    new Answer("4+2=7", false),
    new Answer("5+1=7", false),
    new Answer("2+3=4", false),
  ],
};

const MATHS_MEDIUM = {
  title: "Additions",
  good: [
    new Answer("10+5=15", true),
    new Answer("6X6=36", true),
    new Answer("10X5+7=57", true),
    new Answer("10+12=22", true),
    new Answer("10-4=6", true),
    new Answer("6x3=18", true),
    new Answer("10-2=2x2x2", true),
    new Answer("10X3=15x2", true),
    new Answer("8+8=4X4", true),
    new Answer("10X5=25X2", true),
    new Answer("6x13=78", true),
    new Answer("10+10.5=20.5", true),
    new Answer("10X19+20=210", true),
    new Answer("8+16=24", true),
    new Answer("10+5=15", true),
    new Answer("6X6=36", true),
    new Answer("10X5+7=57", true),
    new Answer("10+12=22", true),
    new Answer("10-4=6", true),
    new Answer("6x3=18", true),
    new Answer("10-2=2x2x2", true),
    new Answer("10X3=15x2", true),
    new Answer("8+8=4X4", true),
    new Answer("10X5=25X2", true),
    new Answer("6x13=78", true),
    new Answer("10+10.5=20.5", true),
    new Answer("10X19+20=210", true),
    new Answer("8+16=24", true),
    new Answer("10+5=15", true),
    new Answer("6X6=36", true),
    new Answer("10X5+7=57", true),
    new Answer("10+12=22", true),
    new Answer("10-4=6", true),
    new Answer("6x3=18", true),
    new Answer("10-2=2x2x2", true),
    new Answer("10X3=15x2", true),
    new Answer("8+8=4X4", true),
    new Answer("10X5=25X2", true),
    new Answer("6x13=78", true),
    new Answer("10+10.5=20.5", true),
    new Answer("10X19+20=210", true),
    new Answer("8+16=24", true),
    new Answer("10+5=15", true),
    new Answer("6X6=36", true),
    new Answer("10X5+7=57", true),
    new Answer("10+12=22", true),
    new Answer("10-4=6", true),
    new Answer("6x3=18", true),
    new Answer("10-2=2x2x2", true),
    new Answer("10X3=15x2", true),
    new Answer("8+8=4X4", true),
    new Answer("10X5=25X2", true),
    new Answer("6x13=78", true),
    new Answer("10+10.5=20.5", true),
    new Answer("10X19+20=210", true),
    new Answer("8+16=24", true),
  ],
  bad: [
    new Answer("10+15=20", false),
    new Answer("6X3=21", false),
    new Answer("10x60=6000", false),
    new Answer("12x12.5=250", false),
    new Answer("15x2=20", false),
    new Answer("6x4=20", false),
    new Answer("10-5=20", false),
    new Answer("100X2=400", false),
    new Answer("8+22=40", false),
    new Answer("10X3=1000/100", false),
    new Answer("10X15=145", false),
    new Answer("6x100=6000", false),
    new Answer("10X10=1000", false),
    new Answer("19-2.5 = 17.5", false),
    new Answer("8+17=24", false),
  ],
};

//local storage

const getNextAnswer = () => {
  const randVal = Math.random() > 0.5;

  if (!currentSubject) {
    console.log("there is no subject");
    defineCurrentSubject(hardMode ? STATS : MATHS_ARITHMETIC);
  }

  const getAndRemoveSubject: any = (index: number, list: Array<any>) => {
    let foundElement = null;
    for (let elementIndex = 0; elementIndex < list.length; elementIndex++) {
      let element = list[elementIndex];
      if (elementIndex === index) {
        list.splice(elementIndex, 1);
        foundElement = element;
        break; // Break out of the loop since we found and removed the element
      }
    }
    if (foundElement === null) {
      console.log("error => we couldnt find an element in the answers list");
    }

    return foundElement;
  };

  if (randVal) {
    return currentSubject?.good.length
      ? getAndRemoveSubject(
          Math.round(Math.random() * (currentSubject.good.length - 1)),
          currentSubject.good
        )
      : currentSubject?.bad.length
      ? getAndRemoveSubject(
          Math.round(Math.random() * (currentSubject.bad.length - 1)),
          currentSubject.bad
        )
      : "done";
  } else {
    return currentSubject?.bad.length
      ? getAndRemoveSubject(
          Math.round(Math.random() * (currentSubject.bad.length - 1)),
          currentSubject.bad
        )
      : currentSubject?.good.length
      ? getAndRemoveSubject(
          Math.round(Math.random() * (currentSubject.good.length - 1)),
          currentSubject.good
        )
      : "done";
  }
};

const Grades = {
  D: [0, 1, 2, 3, 4, 5],
  C: [6, 7, 8, 9, 10],
  B: [11, 12, 13, 14],
  A: [15, 16, 17],
  S: [18, 19, 20],
};

/*

const getChallengeGrade = () => {
  return Grades.D.includes(score)
    ? "D"
    : Grades.C.includes(score)
    ? "C"
    : Grades.B.includes(score)
    ? "B"
    : Grades.A.includes(score)
    ? "A"
    : "S";
};

*/

const getChallengeGrade = () => {
  if (!currentSubject) {
    return;
  }

  const grade = Math.round((score / currentSubjectTotal) * 20);

  return Grades.D.includes(grade)
    ? "D"
    : Grades.C.includes(grade)
    ? "C"
    : Grades.B.includes(grade)
    ? "B"
    : Grades.A.includes(grade)
    ? "A"
    : "S";
};

const updateLifePointsDisplay = () => {
  for (let i = 1; i <= lifePoints.max; i++) {
    const lifePointOpacity = i <= lifePoints.value ? "1" : "0.3";

    document.getElementById(`lifePointContainer_${i}`)!.style.opacity =
      lifePointOpacity;
  }
};

const setHeroClass = () => {
  heroContainer.classList.add(
    hardMode ? "hero_container_hard" : "hero_container_easy"
  );
};

const buildEnemyElement = () => {
  const newOpponentContainer = document.createElement("div");
  newOpponentContainer.classList.add(
    hardMode ? "hard_enemy_container" : "enemy_container"
  );
  const newEnnemyImg = document.createElement("img") as HTMLImageElement;
  newEnnemyImg.src = hardMode
    ? "assets/challenge/characters/enemies/hard/attack/1.png"
    : "assets/challenge/characters/enemies/black_spirit/run/1.png";

  newOpponentContainer.append(newEnnemyImg);

  document.getElementsByTagName("body")[0].append(newOpponentContainer);

  return newOpponentContainer;
};

const buildEnemy = (answer: Answer) => {
  //construct opponent at a specific point, run it

  const enemyElement = buildEnemyElement();

  if (!enemyElement) {
    return;
  }

  document.getElementsByTagName("body")[0].append();

  if (hardMode) {
    enemyViewPoint.style.left = "120vw";
    enemyViewPoint.style.display = "flex";
  }

  const enemy = new Enemy(enemyElement, answer);

  ennemiesOnScreen.push(enemy);

  return enemy;
};

const buildAndLaunchEnemy = (answer: Answer) => {
  const enemy = buildEnemy(answer);

  if (!enemy) {
    return;
  }
  lightUpAnswerDataContainer();

  answerDataValue.innerHTML = enemy.answer.data;

  launchOpponent(enemy);
};

const triggerOpponentsApparition = () => {
  const newAnswer = getNextAnswer();
  enemiesComingTimeout = setTimeout(
    () => {
      if (newAnswer && newAnswer !== "done") {
        buildAndLaunchEnemy(newAnswer);
      } else {
        launchEndOfChallenge();
      }
    },
    Math.random() > 0.5 ? 500 : 1000
  );
};

let backgroundSrc: string | null = null;

const launchEndOfChallenge = () => {
  gameFinished = true;
  document.getElementById("endOfGameInterface")!.style.display = "flex";
  clearGameTimeouts();
  initAllAnimations();
  heroImage.src = "assets/challenge/characters/hero/run/1.png";
  document.getElementById("transformation_background")!.style.display = "none";

  const grade = getChallengeGrade();

  const levelUpAudio = document.getElementById(
    "levelup_audio"
  )! as HTMLAudioElement;
  const endOfChallengeButton = document.getElementById(
    "challengesuccessButton"
  )!;

  const displayEndOfGameButton = () => {
    if (grade === "A" || grade === "S") {
      endOfChallengeButton.style.display = "flex";
      levelUpAudio.play();
    }
  };

  setTimeout(() => {
    if (!grade) {
      return;
    }
    killAllAudios();

    document.getElementById("endOfGameInterfaceScore")!.innerHTML = grade;
    document.getElementById("endOfGameInterfaceScore")!.style.display = "flex";
    const stampAudio = document.getElementById(
      "stamp_audio"
    )! as HTMLAudioElement;
    stampAudio.play();

    setTimeout(() => {
      displayEndOfGameButton();
    }, 2000);
  }, 1000);
};

export enum ANIMATION_ID {
  attack,
  run,
  walk,
  hurt,
  death,
  idle,
  stop,
  stop_time,
  cancel_stop_time,
  opponent_idle,
  opponent_run,
  opponent_attack,
  opponent_move,
  opponent_death,
  camera_left_to_right,
  camera_right_to_left,
  character_left_to_right_move,
  hero_sword_slash,
  transformation_pre_run,
  transformation_run,
  transformation_hurt,
  boss_idle,
  boss_attack,
}

export const ANIMATION_RUNNING_VALUES = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 0,
  [ANIMATION_ID.walk]: 0,
  [ANIMATION_ID.death]: 0,
  [ANIMATION_ID.hurt]: 0,
  [ANIMATION_ID.idle]: 0,
  [ANIMATION_ID.stop_time]: 0,
  [ANIMATION_ID.stop]: 0,
  [ANIMATION_ID.cancel_stop_time]: 0,
  [ANIMATION_ID.opponent_idle]: 0,
  [ANIMATION_ID.opponent_run]: 0,
  [ANIMATION_ID.opponent_attack]: 0,
  [ANIMATION_ID.opponent_death]: 0,
  [ANIMATION_ID.opponent_move]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 0,
  [ANIMATION_ID.hero_sword_slash]: 0,
  [ANIMATION_ID.transformation_pre_run]: 0,
  [ANIMATION_ID.transformation_run]: 0,
  [ANIMATION_ID.transformation_hurt]: 0,
  [ANIMATION_ID.boss_idle]: 0,
  [ANIMATION_ID.boss_attack]: 0,
};

export const THROTTLE_NUMS = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 5,
  [ANIMATION_ID.walk]: 5,
  [ANIMATION_ID.death]: 5,
  [ANIMATION_ID.hurt]: 0,
  [ANIMATION_ID.idle]: 20,
  [ANIMATION_ID.stop_time]: 5,
  [ANIMATION_ID.stop]: 0,
  [ANIMATION_ID.cancel_stop_time]: 5,
  [ANIMATION_ID.opponent_idle]: 5,
  [ANIMATION_ID.opponent_run]: 5,
  [ANIMATION_ID.opponent_attack]: 0,
  [ANIMATION_ID.opponent_death]: 0,
  [ANIMATION_ID.opponent_move]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 5,
  [ANIMATION_ID.hero_sword_slash]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 5,
  [ANIMATION_ID.transformation_pre_run]: 5,
  [ANIMATION_ID.transformation_run]: 5,
  [ANIMATION_ID.transformation_hurt]: 0,
  [ANIMATION_ID.boss_idle]: 15,
  [ANIMATION_ID.boss_attack]: 10,
};

const APP_IDS = {
  hero: "hero_container",
  enemy: "enemy_container",
};

const SPRITE_SHEET_SPACE_FROM_LEFT = {
  [ANIMATION_ID.attack]: 0,
  [ANIMATION_ID.run]: 0,
  [ANIMATION_ID.walk]: 0,
  [ANIMATION_ID.death]: 0,
  [ANIMATION_ID.hurt]: 0,
  [ANIMATION_ID.idle]: hardMode ? 0.3 : 0,
  [ANIMATION_ID.stop_time]: 0,
  [ANIMATION_ID.stop]: 0,
  [ANIMATION_ID.cancel_stop_time]: 0,
  [ANIMATION_ID.opponent_idle]: 0,
  [ANIMATION_ID.opponent_run]: 0,
  [ANIMATION_ID.opponent_attack]: 0,
  [ANIMATION_ID.opponent_death]: 0,
  [ANIMATION_ID.opponent_move]: 0,
  [ANIMATION_ID.camera_left_to_right]: 0,
  [ANIMATION_ID.camera_right_to_left]: 0,
  [ANIMATION_ID.character_left_to_right_move]: 0,
  [ANIMATION_ID.hero_sword_slash]: 0,
  [ANIMATION_ID.transformation_pre_run]: 0,
  [ANIMATION_ID.transformation_run]: 0,
  [ANIMATION_ID.transformation_hurt]: 0,
  [ANIMATION_ID.boss_idle]: 0,
  [ANIMATION_ID.boss_attack]: 0,
};
class AnimationRequest {
  animation: ANIMATION_ID;
  callBack: () => void;

  constructor(animation: ANIMATION_ID, callBack: () => void) {
    this.animation = animation;
    this.callBack = callBack;
  }
}

// Define the type for the structure of each element in APP_ELEMENTS_ANIMATION_QUEUE
type AppElementAnimationQueue = {
  request_queue: AnimationRequest[];
  current_animation: ANIMATION_ID | null;
  associated_animations: ANIMATION_ID[];
};

// Define the type for the entire APP_ELEMENTS_ANIMATION_QUEUE object
type AppElementsAnimationQueue = {
  [key in keyof typeof APP_IDS]: AppElementAnimationQueue;
};

// The APP_ELEMENTS_ANIMATION_QUEUE object
const APP_ELEMENTS_ANIMATION_QUEUE: AppElementsAnimationQueue = {
  hero: {
    request_queue: [],
    current_animation: null,
    associated_animations: [
      ANIMATION_ID.run,
      ANIMATION_ID.attack,
      ANIMATION_ID.hurt,
      ANIMATION_ID.death,
      ANIMATION_ID.stop,
      ANIMATION_ID.stop_time,
      ANIMATION_ID.transformation_hurt,
      ANIMATION_ID.transformation_pre_run,
      ANIMATION_ID.transformation_run,
    ],
  },
  enemy: {
    request_queue: [],
    current_animation: null,
    associated_animations: [
      ANIMATION_ID.opponent_attack,
      ANIMATION_ID.opponent_run,
      ANIMATION_ID.opponent_death,
      ANIMATION_ID.opponent_move,
    ],
  },
};

const getAppIdByAnimationId = (
  animationId: ANIMATION_ID
): keyof AppElementsAnimationQueue | false => {
  for (const appId in APP_ELEMENTS_ANIMATION_QUEUE) {
    if (APP_ELEMENTS_ANIMATION_QUEUE.hasOwnProperty(appId)) {
      const element =
        APP_ELEMENTS_ANIMATION_QUEUE[appId as keyof AppElementsAnimationQueue];
      if (element.associated_animations.includes(animationId)) {
        return appId as keyof AppElementsAnimationQueue;
      }
    }
  }
  return false;
};

const timeManipulationToggle = () => {
  if (!gameLaunched || window.innerWidth > 1000) return;
  if (runStopped) {
    resumeRun();
  } else {
    stopRun();
  }
};

const createMapBlock = (left: number) => {
  const block = document.createElement("div");
  block.classList.add("mapBlock");
  const backgroundImage = document.createElement("img");
  backgroundImage.src = backgroundSrc ? backgroundSrc : "";
  block.append(backgroundImage);
  block.style.position = "fixed";
  block.style.left = `${left}px`;
  block.onclick = (event: Event) => timeManipulationToggle();

  document.getElementsByTagName("body")[0].append(block);

  return block;
};

const slowTime = (multiplicator: number) => {
  const runMultiplicatorBase = THROTTLE_NUMS[ANIMATION_ID.run]
    ? THROTTLE_NUMS[ANIMATION_ID.run]
    : 1;
  THROTTLE_NUMS[ANIMATION_ID.run] =
    runMultiplicatorBase * multiplicator * 1.5 * 1.5;

  const cameraMoveMultiplicatorBase = THROTTLE_NUMS[
    ANIMATION_ID.camera_left_to_right
  ]
    ? THROTTLE_NUMS[ANIMATION_ID.camera_left_to_right]
    : 1;
  THROTTLE_NUMS[ANIMATION_ID.camera_left_to_right] =
    cameraMoveMultiplicatorBase * multiplicator * 1.5;

  const opponentRunMultiplicatorBase = THROTTLE_NUMS[ANIMATION_ID.opponent_run]
    ? THROTTLE_NUMS[ANIMATION_ID.opponent_run]
    : 1;
  THROTTLE_NUMS[ANIMATION_ID.opponent_run] =
    opponentRunMultiplicatorBase * multiplicator;

  const opponentMoveMultiplicatorBase = THROTTLE_NUMS[
    ANIMATION_ID.opponent_move
  ]
    ? THROTTLE_NUMS[ANIMATION_ID.opponent_move]
    : 1;
  THROTTLE_NUMS[ANIMATION_ID.opponent_move] =
    opponentMoveMultiplicatorBase * multiplicator * 2;
};

const moveCamera = (
  direction: ANIMATION_ID,
  throttleNum = 0,
  previousFrameTimestamp: number
): any => {
  if (
    ANIMATION_RUNNING_VALUES[direction] === 0 ||
    ANIMATION_RUNNING_VALUES[direction] > 1
  ) {
    return;
  }

  const currentFrameTimeStamp = Date.now();

  const diff = currentFrameTimeStamp - previousFrameTimestamp;

  if (throttleNum < THROTTLE_NUMS[ANIMATION_ID.camera_left_to_right]) {
    throttleNum++;
    return requestAnimationFrame(() =>
      moveCamera(direction, throttleNum, currentFrameTimeStamp)
    );
  }

  throttleNum = 0;

  MAPS.forEach(
    (map) =>
      (map.style.left = `${
        map.offsetLeft +
        ((direction === ANIMATION_ID.camera_left_to_right ? -1 : 1) * diff) / 3
      }px`)
  );

  requestAnimationFrame(() => moveCamera(direction, 0, currentFrameTimeStamp));
};

export const launchAnimationAndDeclareItLaunched = (
  characterElement: HTMLImageElement,
  throttleNum: number,
  extension: string,
  spriteBase: string,
  spriteIndex: number,
  max: number,
  min: number,
  loop: boolean,
  animationId: ANIMATION_ID,
  endOfAnimationCallback?: () => void
) => {
  if (ANIMATION_RUNNING_VALUES[animationId] >= 1) {
    return;
  }

  ANIMATION_RUNNING_VALUES[animationId]++;

  const animationCallback = () => {
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

  const elementAssociatedWithThisAnimation = getAppIdByAnimationId(animationId);

  if (elementAssociatedWithThisAnimation) {
    const animationRequestCallback = () => {
      if (
        APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation]
          .current_animation
      ) {
        requestAnimationFrame(animationRequestCallback);
        return;
      }

      APP_ELEMENTS_ANIMATION_QUEUE[
        elementAssociatedWithThisAnimation
      ].current_animation = animationId;

      animationCallback();
    };
    if (
      APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation]
        .current_animation
    ) {
      APP_ELEMENTS_ANIMATION_QUEUE[
        elementAssociatedWithThisAnimation
      ].request_queue.unshift(
        new AnimationRequest(animationId, animationRequestCallback)
      );

      return;
    }

    APP_ELEMENTS_ANIMATION_QUEUE[
      elementAssociatedWithThisAnimation
    ].current_animation = animationId;
  }

  animationCallback();
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
  endOfAnimationCallback?: () => void,
  lastExecutionTimeStamp?: number
): any => {
  if (gameFinished) {
    return;
  }

  if (
    !ANIMATION_RUNNING_VALUES[animationId] ||
    ANIMATION_RUNNING_VALUES[animationId] > 1
  ) {
    return;
  }

  const elementAssociatedWithThisAnimation = getAppIdByAnimationId(animationId);

  if (elementAssociatedWithThisAnimation) {
    if (
      APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation]
        .current_animation !== animationId
    ) {
      console.log("there was an error, an animation should not run");
      console.log("current an >" + animationId);
      console.log("registered =>");
      console.log(
        APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation]
          .current_animation
      );
      return;
    }

    const requestQueue =
      APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation]
        .request_queue;

    if (requestQueue.length) {
      APP_ELEMENTS_ANIMATION_QUEUE[
        elementAssociatedWithThisAnimation
      ].current_animation = null;

      initAnimation(animationId);

      const firstQueueElement = requestQueue.pop();

      firstQueueElement?.callBack();
    }
  }

  if (throttleNum < THROTTLE_NUMS[animationId]) {
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
        animationId,
        () => {},
        lastExecutionTimeStamp
      )
    );
  }

  const newExecutionTimeStamp = Date.now();

  if (
    (animationId === ANIMATION_ID.run ||
      animationId === ANIMATION_ID.opponent_attack) &&
    lastExecutionTimeStamp
  ) {
    const diff = newExecutionTimeStamp - lastExecutionTimeStamp;

    if (diff < ANIMTION_HERO_RUN_DURATION_BETWEEN_FRAMES_IN_MS) {
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
          () => {},
          lastExecutionTimeStamp
        )
      );
    }
  }

  throttleNum = 0;

  if (spriteIndex === max) {
    if (loop === false) {
      ANIMATION_RUNNING_VALUES[animationId] = 0;
      const elementAssociatedWithThisAnimation =
        getAppIdByAnimationId(animationId);

      if (elementAssociatedWithThisAnimation) {
        if (
          APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation]
            .current_animation !== animationId
        ) {
          return;
        }

        APP_ELEMENTS_ANIMATION_QUEUE[
          elementAssociatedWithThisAnimation
        ].current_animation = null;
      }
      if (endOfAnimationCallback) {
        endOfAnimationCallback();
      }
      return;
    }

    spriteIndex = min;
  } else {
    spriteIndex++;
  }

  if (!characterElement) {
    return;
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
      () => {},
      newExecutionTimeStamp
    )
  );
};

const initAnimation = (animationId: ANIMATION_ID) => {
  ANIMATION_RUNNING_VALUES[animationId] = 0;
};

const initAllAnimations = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.attack] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.death] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.hurt] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.idle] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_death] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_right_to_left] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.character_left_to_right_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_pre_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_hurt] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.boss_idle] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.boss_attack] = 0;
};

const turnHeroTransformationOff = () => {
  transformed = false;
  runAudio.playbackRate = 1;
  transformationOffAudio.play();

  progressBar.style.display = "flex";

  transformedEpicAudio.pause();
  transformedEpicAudio.currentTime = 0;

  electricityAudio.currentTime = 0;

  epicAudio.currentTime = 0;

  setTimeout(() => {
    electricityAudio.volume = 0;
  }, 1000);

  setTimeout(() => {
    epicAudio.play();
  }, 4000);

  launchHeroRunAnimation();
};

const launchAttack = () => {
  if (invisible || !heroIsAlive || runStopped) {
    return;
  }
  if (transformed) {
    laserdAudio.play();
    laserdAudio.currentTime = 0;
  } else {
    swordAudio.play();
    swordAudio.currentTime = 0;
  }
  launchSwordSlash();

  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    `assets/challenge/characters/${
      transformed ? "transformed_hero" : "hero"
    }/attack`,
    1,
    transformed ? 12 : 4,
    1,
    false,
    ANIMATION_ID.attack
  );

  const enemyCanBeHit = (enemy: Enemy) => {
    const enemyLeft = hardMode
      ? getHardModeEnemyRealLeft(enemy) * 1.2
      : enemy.element.getBoundingClientRect().left;
    return (
      enemyLeft >
        heroContainer.getBoundingClientRect().left +
          heroContainer.getBoundingClientRect().width &&
      enemyLeft <
        heroContainer.getBoundingClientRect().left +
          heroContainer.getBoundingClientRect().width +
          swordReach
    );
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

  if (preTransformed || !heroIsAlive) {
    return;
  }

  clearTimeoutAndLaunchNewOne(
    TimeoutId.HERO,
    setTimeout(() => {
      launchHeroRunAnimation();
    }, 200)
  );
};

window.launchAttack = (event: Event) => {
  if (!gameLaunched) {
    launchGame();
    return;
  }
  launchAttack();
};

const clearTimeoutAndLaunchNewOne = (
  timeoutId: TimeoutId,
  timeout: ReturnType<typeof setTimeout>
) => {
  GAME_TIMEOUTS[timeoutId].forEach((gameTimout) => clearTimeout(gameTimout));

  GAME_TIMEOUTS[timeoutId] = [timeout];
};

const launchOpponent = (enemy: Enemy) => {
  APP_ELEMENTS_ANIMATION_QUEUE.enemy.current_animation = null;
  interruptAnimation(ANIMATION_ID.opponent_run);

  launchAnimationAndDeclareItLaunched(
    enemy.element.firstChild as HTMLImageElement,
    0,
    "png",
    hardMode
      ? "assets/challenge/characters/enemies/hard/idle"
      : "assets/challenge/characters/enemies/black_spirit/run",
    1,
    hardMode ? 16 : 4,
    1,
    true,
    ANIMATION_ID.opponent_run
  );

  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_move]++;

  moveEnemy(enemy, 0, Date.now());
};

const moveEnemy = (
  enemy: Enemy,
  throttleNum = 0,
  previousTimeStamp: number
): any => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_move] !== 1) {
    return;
  }

  const currentTimeStamp = Date.now();

  const diff = currentTimeStamp - previousTimeStamp;

  if (throttleNum < THROTTLE_NUMS[ANIMATION_ID.opponent_move]) {
    throttleNum++;
    return requestAnimationFrame(() => {
      moveEnemy(enemy, throttleNum, currentTimeStamp);
    });
  }

  let hardEnemyMoveRatio = 1;

  throttleNum = 0;

  enemy.element.style.left = `${Math.round(
    enemy.element.getBoundingClientRect().left -
      diff * (hardMode ? 0.33 * hardEnemyMoveRatio : 1)
  )}px`;

  if (hardMode) {
    enemyViewPoint.style.left = `${Math.round(
      enemyViewPoint.getBoundingClientRect().left - diff * (hardMode ? 0.33 : 1)
    )}px`;
  }

  requestAnimationFrame(() => moveEnemy(enemy, throttleNum, currentTimeStamp));
};

const transformIfRequired = () => {
  if (rewardStreak >= TRANSFORMATION_THRESHOLD && !transformed) {
    rewardStreak = 0;
    updateTransformationProgressBarDisplay();
    launchTransformation();
  }
};

const killRightEnemyAndUpdateScore = (enemy: Enemy) => {
  killEnemy(enemy);

  rewardHero();
  transformIfRequired();
};

const rewardHero = () => {
  const bonus_ratio = transformed ? TRANSFORMED_BONUS_RATIO : 1;
  if (!transformed) {
    rewardStreak++;
    updateTransformationProgressBarDisplay();
  }

  score += bonus_ratio * REWARD_UNIT;
  updateScoreDisplay();

  displayReward("Congrats! You destroyed a good answer!");

  if (transformed) {
    displayTransformationKillReward(
      `Transformation bonus reward! X${TRANSFORMED_BONUS_RATIO}`
    );
  }
};

const updateScoreDisplay = () => {
  scoreContainer.innerHTML = (score * KILLED_ENEMY_REWARD).toString();
};

const killWrongEnemy = (enemy: Enemy) => {
  scoreMalusContainer.style.display = "flex";

  lifePoints.value--;
  checkForHerosDeath();

  updateLifePointsDisplay();

  rewardStreak = 0;
  updateTransformationProgressBarDisplay();

  killEnemy(enemy);

  displayMalus("MALUS! Wrong enemy killed!");
};

const displayMalus = (content: string) => {
  if (currentMalusContainerTimeout) {
    clearTimeout(currentMalusContainerTimeout);
    currentMalusContainerTimeout = null;
  }

  // scoreMalusDetail.innerHTML = content;
  scoreMalusContainer.style.display = "flex";

  currentMalusContainerTimeout = setTimeout(() => {
    scoreMalusDetail.innerHTML = "";
    scoreMalusContainer.style.display = "none";
  }, 2000);
};

const hideMalus = () => {
  hideReward();
  if (currentMalusContainerTimeout) {
    clearTimeout(currentMalusContainerTimeout);
    currentMalusContainerTimeout = null;
  }

  scoreMalusDetail.innerHTML = "";
  scoreMalusContainer.style.display = "none";
};

const displayReward = (content: string) => {
  hideMalus();
  if (currentRewardContainerTimeout) {
    clearTimeout(currentRewardContainerTimeout);
    currentRewardContainerTimeout = null;
  }

  //  scoreRewardDetail.innerHTML = content;
  scoreRewardContainer.style.display = "flex";

  currentRewardContainerTimeout = setTimeout(() => {
    scoreRewardDetail.innerHTML = "";
    scoreRewardContainer.style.display = "none";
  }, 2000);
};

const displayTransformationKillReward = (content: string) => {
  const transformationRewardContainer = document.getElementById(
    "transformed_hero_bonus_reward_container"
  )!;
  transformationRewardContainer.style.display = "flex";

  if (currentTransformationRewardContainerTimeout) {
    clearTimeout(currentTransformationRewardContainerTimeout);
    currentTransformationRewardContainerTimeout = null;
  }

  currentRewardContainerTimeout = setTimeout(() => {
    transformationRewardContainer.style.display = "none";
  }, REWARD_TIMEOUT_DURATION);
};

const hideReward = () => {};

const killEnemy = (enemy: Enemy) => {
  const launchExplosion = () => {
    bombAudio.play();
    bombAudio.currentTime = 0;

    launchAnimationAndDeclareItLaunched(
      enemy.element.firstChild as HTMLImageElement,
      0,
      "png",
      "assets/challenge/explosion",
      1,
      10,
      1,
      false,
      ANIMATION_ID.opponent_death
    );
  };

  launchExplosion();

  destroyEnemyAndLaunchNewOne(enemy);
};

const getHardModeEnemyRealLeft = (enemy: Enemy) => {
  const enemyImg = enemy.element as HTMLImageElement;

  return (
    enemyImg.getBoundingClientRect().left +
    enemyImg.getBoundingClientRect().width * 0.3
  );
};

const clearEnemy = (enemy: Enemy) => {
  interruptAnimation(ANIMATION_ID.opponent_run);
  interruptAnimation(ANIMATION_ID.opponent_attack);

  destroyEnemy(enemy);
};

const destroyEnemy = (enemy: Enemy) => {
  clearAndHideAnswerDataContainer();
  heroInTheRedZone = false;
  updateEnemyViewPointDisplay();

  setTimeout(() => {
    enemy.element.remove();
    if (!preTransformed) {
      triggerOpponentsApparition();
    }
  }, 300);

  ennemiesOnScreen.forEach((enemyOnScreen, index) => {
    if (enemy === enemyOnScreen) {
      ennemiesOnScreen.splice(index, 1);
      interruptAnimation(ANIMATION_ID.opponent_move);
    }
  });
};

const destroyEnemyAndLaunchNewOne = (enemy: Enemy) => {
  destroyEnemy(enemy);
};

const hurtHero = () => {
  if (!heroIsAlive) {
    return;
  }
  runAudio.volume = 0;

  rewardStreak = 0;
  updateTransformationProgressBarDisplay();

  heroHurt = true;
  lifePoints.value--;
  checkForHerosDeath();

  //  hurtAudio.play();
  // hurtAudio.currentTime = 0;

  updateLifePointsDisplay();
  launchHeroHurtAnimation();

  displayMalus("Malus! You were hurt!");
};

const checkForHerosDeath = () => {
  if (lifePoints.value === 0) {
    killHero();
  }
};

const killHero = () => {
  runAudio.volume = 0;
  heroIsAlive = false;
  launchDeathAnimation();
};

let viewPointOnScreen = false;
let enemyViewPointThresholdCrossed = false;

let hardModeAttackOn = false;

const detectCollision = () => {
  ennemiesOnScreen.forEach((enemyOnScreen) => {
    const enemyLeft = hardMode
      ? getHardModeEnemyRealLeft(enemyOnScreen)
      : enemyOnScreen.element.getBoundingClientRect().left;

    if (hardMode && !viewPointOnScreen && enemyLeft < window.innerWidth) {
      viewPointOnScreen = true;
      enemyViewPoint.style.display = "flex";
    }

    if (
      hardMode &&
      !heroInTheRedZone &&
      enemyViewPoint.getBoundingClientRect().left +
        enemyViewPoint.getBoundingClientRect().width <
        heroContainer.getBoundingClientRect().left +
          heroContainer.getBoundingClientRect().width
    ) {
      heroInTheRedZone = true;
      updateEnemyViewPointDisplay();
      launchAnimationAndDeclareItLaunched(
        enemyOnScreen.element.firstChild as HTMLImageElement,
        0,
        "png",
        "assets/challenge/characters/enemies/hard/attack",
        1,
        30,
        1,
        true,
        ANIMATION_ID.opponent_attack
      );
    }

    if (
      hardMode &&
      !enemyViewPointThresholdCrossed &&
      enemyLeft < window.innerWidth
    ) {
      enemyViewPointThresholdCrossed = true;
    }

    if (
      heroContainer.getBoundingClientRect().left +
        heroContainer.getBoundingClientRect().width >
        enemyLeft &&
      enemyOnScreen.collideable
    ) {
      enemyOnScreen.collideable = false;

      if (!invisible || enemyOnScreen.answer.good) {
        hurtHero();
      } else if (invisible && !enemyOnScreen.answer.good) {
        rewardHero();
        transformIfRequired();
      }
    }
  });

  requestAnimationFrame(detectCollision);
};

const checkForScreenUpdateFromLeftToRight = (throttleNum: number): any => {
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
    lastMapDomElement.offsetLeft <= window.innerWidth / 10
  ) {
    MAPS.push(
      createMapBlock(
        lastMapDomElement.offsetLeft + lastMapDomElement.offsetWidth
      )
    );
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

  //creation

  //pick first map block

  const firstMapDomElement = MAPS[0];

  if (
    firstMapDomElement &&
    firstMapDomElement.offsetLeft > -window.innerWidth
  ) {
    MAPS.unshift(
      createMapBlock(
        firstMapDomElement.offsetLeft - firstMapDomElement.offsetWidth
      )
    );
  }

  const lastMapDomElement = MAPS[MAPS.length - 1];

  if (lastMapDomElement && lastMapDomElement.offsetLeft > window.innerWidth) {
    lastMapDomElement.remove();
    MAPS.pop();
  }

  requestAnimationFrame(() => checkForScreenUpdateFromRightToLeft(throttleNum));
};

const launchHeroRunAnimation = () => {
  if (!heroIsAlive) {
    return;
  }

  runAudio.volume = 0.7;

  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    `assets/challenge/characters/${
      transformed ? "transformed_hero" : "hero"
    }/run`,
    1,
    transformed ? 6 : 8,
    1,
    true,
    transformed ? ANIMATION_ID.transformation_run : ANIMATION_ID.run
  );
};

const launchRun = () => {
  if (runStopped) {
    return;
  }

  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] === 0) {
    startCamera();
    moveCamera(ANIMATION_ID.camera_left_to_right, 0, Date.now());
  }

  launchHeroRunAnimation();
};

const checkForOpponentAttack = () => {
  ennemiesOnScreen.forEach((enemy) => {
    if (
      enemy.element.getBoundingClientRect().left <
      heroContainer.getBoundingClientRect().left +
        heroContainer.getBoundingClientRect().width
    ) {
      ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;

      launchAnimationAndDeclareItLaunched(
        heroImage,
        0,
        "png",
        "assets/challenge/characters/hero/stop_time",
        1,
        4,
        1,
        false,
        ANIMATION_ID.opponent_run
      );
    }
  });
};

const heroInitialTop = heroContainer.getBoundingClientRect().top;

const launchFly = (jumpingForward = true) => {
  // Get the hero's current position from the bottom style property
  const currentTop = heroContainer.getBoundingClientRect().top;

  if (jumpingForward) {
    // Move the hero upwards
    const newTop = currentTop - window.innerHeight * 0.005;
    heroContainer.style.top = `${newTop}px`;

    // Check if the hero has reached the peak
    if (newTop <= heroInitialTop - window.innerHeight * 0.2) {
      jumpingForward = false;
    }
  } else {
    // Move the hero downwards
    const newTop = currentTop + window.innerHeight * 0.005;
    heroContainer.style.top = `${newTop}px`;

    // Check if the hero has returned to the initial position
    if (newTop >= heroInitialTop) {
      heroContainer.style.top = `${heroInitialTop}px`;
      return;
    }
  }

  // Continue the animation
  requestAnimationFrame(() => launchFly(jumpingForward));
};
document.addEventListener("keydown", (event) => {
  if (event.key === "d") {
    if (!gameLaunched) {
      launchGame();
    } else if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] === 0) {
      resumeRun();
    }
  }

  if (!gameLaunched || preTransformed || heroHurt) {
    return;
  }

  if (event.key === " " && !invisible) {
    launchInvisibilityToggle();
  }
  if (event.key === "w") {
    launchAttack();
  }

  if (event.key === "v") {
    slowTime(10);
  }

  if (event.key === "y") {
    launchDeathAnimation();
  }

  if (event.key === "s" && hardMode) {
    if (runStopped) return;
    stopRun();
  }
});

const clearGameTimeouts = () => {
  GAME_TIMEOUTS[TimeoutId.HERO].forEach((timeout) => {
    clearTimeout(timeout);
  });
  GAME_TIMEOUTS[TimeoutId.HERO] = [];

  GAME_TIMEOUTS[TimeoutId.ENEMY].forEach((timeout) => clearTimeout(timeout));
  GAME_TIMEOUTS[TimeoutId.ENEMY] = [];
};

const stopRun = () => {
  if (heroInTheRedZone) {
    return;
  }
  runAudio.volume = 0;

  runStopped = true;

  if (enemiesComingTimeout) {
    clearTimeout(enemiesComingTimeout);
    enemiesComingTimeout = null;
  }

  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_move] = 0;

  interruptAnimation(ANIMATION_ID.camera_left_to_right);

  const stopCallback = () => {
    heroImage.src = "assets/challenge/characters/hero/walk/1.png";
  };
  addAnimationCallbackToQueue(ANIMATION_ID.stop, stopCallback);
};

const addAnimationCallbackToQueue = (
  animation: ANIMATION_ID,
  callBack: () => void
) => {
  const appElementId = getAppIdByAnimationId(animation);
  if (!appElementId) {
    return;
  }
  APP_ELEMENTS_ANIMATION_QUEUE[appElementId].request_queue.unshift(
    new AnimationRequest(animation, callBack)
  );
};

const interruptAnimation = (animation: ANIMATION_ID) => {
  ANIMATION_RUNNING_VALUES[animation] = 0;

  const appElementId = getAppIdByAnimationId(animation);
  if (!appElementId) {
    return;
  }

  if (!APP_ELEMENTS_ANIMATION_QUEUE[appElementId].current_animation === null) {
    APP_ELEMENTS_ANIMATION_QUEUE[appElementId].current_animation = null;
  }
};

/*
const stopTime = () => {
  runAudio.volume = 0;

  runStopped = true;

  clearGameTimeouts();

  if (enemiesComingTimeout) {
    clearTimeout(enemiesComingTimeout);
  }

  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_run] = 0;
  APP_ELEMENTS_ANIMATION_QUEUE.enemy.current_animation = null;

  ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_move] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;

  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    "assets/challenge/characters/hero/stop_time",
    1,
    4,
    1,
    false,
    ANIMATION_ID.stop_time
  );
};

*/

const resumeRun = () => {
  runStopped = false;

  launchRun();
  ennemiesOnScreen.forEach((enemy) => {
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.opponent_move]++;

    moveEnemy(enemy, 0, Date.now());
  });

  if (!ennemiesOnScreen.length) {
    triggerOpponentsApparition();
  }
};

const checkForOpponentsClearance = () => {
  ennemiesOnScreen.forEach((enemyOnScreen) => {
    const enemyLeft = hardMode
      ? getHardModeEnemyRealLeft(enemyOnScreen)
      : enemyOnScreen.element.getBoundingClientRect().left;

    if (enemyLeft < 0 - window.innerWidth * 0.25) {
      clearEnemy(enemyOnScreen);
    }
  });

  requestAnimationFrame(checkForOpponentsClearance);
};

const launchInvisibilityToggle = () => {
  invisible = !invisible;

  heroContainer.style.opacity = invisible ? "0.3" : "1";

  if (invisible) {
    const teleportAudio = document.getElementById(
      "teleport_audio"
    )! as HTMLAudioElement;
    teleportAudio.volume = 0.15;
    teleportAudio.play().then((val) => (teleportAudio.currentTime = 0));
  }

  if (!invisible) {
    return;
  }

  setTimeout(launchInvisibilityToggle, INVISIBILITY_DURATION_IN_MILLISECONDS);
};

window.launchInvisibilityToggle = launchInvisibilityToggle;

const launchTransformation = () => {
  if (runStopped || hardMode) {
    return;
  }
  runAudio.volume = 0;
  swordAudio.volume = 0;
  bombAudio.volume = 0;
  epicAudio.pause();

  if (transformedAlready) {
    electricityAudio.volume = 0.7;

    transformationScreamAudio.volume = 0.1;

    transformationScreamAudio.play();

    setTimeout(() => transformedEpicAudio.play(), 1000);

    setTimeout(() => electricityAudio.play(), 200);

    document.getElementById("transformation_background")!.style.display =
      "none";

    clearGameTimeouts();

    transformed = true;

    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      "assets/challenge/characters/transformed_hero/run",
      1,
      6,
      1,
      true,
      ANIMATION_ID.transformation_run
    );

    setTimeout(turnHeroTransformationOff, 20000);
    return;
  }

  document.getElementById("transformation_background")!.style.display = "flex";

  preTransformed = true;

  clearEnemiesInstantly();

  bassAudio.play();

  setTimeout(() => electricityAudio.play(), 200);

  clearTimeoutAndLaunchNewOne(
    TimeoutId.HERO,
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
        ANIMATION_ID.transformation_pre_run
      );

      if (enemiesComingTimeout) {
        clearTimeout(enemiesComingTimeout);
      }

      clearTimeoutAndLaunchNewOne(
        TimeoutId.HERO,
        setTimeout(() => {
          triggerOpponentsApparition();

          document.getElementById("transformation_background")!.style.display =
            "none";

          transformationScreamAudio.play();

          setTimeout(() => transformedEpicAudio.play(), 1000);

          electricityAudio.volume = 0.2;

          transformed = true;

          preTransformed = false;

          runAudio.volume = 0.7;
          swordAudio.volume = 0.65;
          bombAudio.volume = 0.12;

          progressBar.style.display = "none";

          launchAnimationAndDeclareItLaunched(
            heroImage,
            0,
            "png",
            "assets/challenge/characters/transformed_hero/run",
            1,
            6,
            1,
            true,
            ANIMATION_ID.transformation_run
          );

          setTimeout(turnHeroTransformationOff, 15000);
        }, 5000)
      );
    }, 500)
  );
};

const clearEnemiesInstantly = () => {
  ennemiesOnScreen.forEach((enemy, index) => {
    enemy.element.remove();
    ennemiesOnScreen.splice(index, 1);
    interruptAnimation(ANIMATION_ID.opponent_move);
  });
};

const lightUpAnswerDataContainer = () => {
  answerDataContainer.style.opacity = "1";
};

const clearAndHideAnswerDataContainer = () => {
  answerDataContainer.style.opacity = "1";
  answerDataValue.innerHTML = "";
};

const launchSwordSlash = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.hero_sword_slash]++;
  if (
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.hero_sword_slash] !== 1 ||
    transformed
  ) {
    return;
  }
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.hero_sword_slash]++;
  console.log("slash!");

  swordSlashImg.style.display = "flex";

  setTimeout(() => {
    swordSlashImg.style.display = "none";
    ANIMATION_RUNNING_VALUES[ANIMATION_ID.hero_sword_slash] = 0;
  }, 75);
};

const launchDeathAnimation = () => {
  initHeroAnimations();
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;

  //DIRTY

  APP_ELEMENTS_ANIMATION_QUEUE.hero.current_animation = null;
  APP_ELEMENTS_ANIMATION_QUEUE.hero.request_queue = [];

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
      ANIMATION_ID.death
    );

    clearGameTimeouts();

    setTimeout(
      () =>
        (window.location.href = hardMode
          ? "http://localhost:3001/dead_hard"
          : "http://localhost:3001/dead"),
      1000
    );
  };

  if (transformed) {
    transformed = false;
  }

  heroImage.src = "assets/challenge/characters/hero/death/1.png";

  setTimeout(killHero, 1000);
};

const launchHeroHurtAnimation = () => {
  launchAnimationAndDeclareItLaunched(
    heroImage,
    0,
    "png",
    transformed
      ? "assets/challenge/characters/transformed_hero/hurt"
      : "assets/challenge/characters/hero/hurt",
    1,
    transformed ? 5 : 3,
    1,
    false,
    transformed ? ANIMATION_ID.transformation_hurt : ANIMATION_ID.hurt
  );

  if (!hardMode) {
    stopCamera();
  }

  clearTimeoutAndLaunchNewOne(
    TimeoutId.HERO,
    setTimeout(() => {
      heroHurt = false;
      if (heroIsAlive && ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] === 0) {
        launchRun();
      }
    }, 500)
  );
};

const stopCamera = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] = 0;
};

const startCamera = () => {
  if (ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right] > 0) {
    return;
  }
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.camera_left_to_right]++;
};

const initHeroAnimations = () => {
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_pre_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.transformation_run] = 0;
  ANIMATION_RUNNING_VALUES[ANIMATION_ID.hurt] = 0;
};

window.onload = () => {
  setupListeners();
  launchHardModeToggle();
  setHeroClass();
  backgroundSrc = `assets/palace/maps/castle/${
    hardMode ? "castleback.webp" : "castle.gif"
  }`;
  MAPS.push(createMapBlock(0));
  MAPS.push(createMapBlock(100));
  createGameAccordingToMode();
  updateLifePointsDisplay();
  updateScoreDisplay();
  detectCollision();
  checkForScreenUpdateFromLeftToRight(10);
  checkForOpponentsClearance();
  defineCurrentSubject(hardMode ? STATS : MATHS_ARITHMETIC);
  defineSwordReach();
  updateTransformationProgressBarDisplay();
  if (hardMode) {
    epicAudio.play();
  } else {
    fireBackgroundAudio.play();
  }
};

const setupListeners = () => {
  document
    .getElementById("playAgainLink")
    ?.addEventListener("click", (event: Event) => window.location.reload());

  document
    .getElementById("backToStormGradButton")
    ?.addEventListener("click", goBackToMountain);
};

const createGameAccordingToMode = () => {
  if (hardMode) {
    return;
  }
  progressBar.style.display = "flex";
  epicAudio = document.getElementById(
    hardMode ? "hard_epic_audio" : "epic_audio"
  )! as HTMLAudioElement;

  epicAudio.volume = hardMode ? 1 : 0.22;
};

const launchHardModeToggle = () => {
  const modeParameter = getUrlParameter("mode");

  if (!modeParameter) {
    console.log("there is no mode parameter");

    return;
  }

  hardMode = modeParameter === "hard";
};

const getTransformationProgressValue = () => {
  return Math.floor((rewardStreak / TRANSFORMATION_THRESHOLD) * 100);
};

const updateTransformationProgressBarDisplay = () => {
  const progress = document.querySelector(".progress")! as HTMLElement;
  progress.style.setProperty(
    "--progress",
    `${getTransformationProgressValue()}%`
  );
};

const defineSwordReach = () => {
  swordReach = window.innerWidth * (window.innerWidth > 1000 ? 0.15 : 0.35);
};

const launchGame = () => {
  runAudio.play();
  if (!hardMode) {
    epicAudio.play();
  }
  gameLaunched = true;
  launchRun();
  triggerOpponentsApparition();
};

const defineCurrentSubject = (subject: Subject) => {
  currentSubject = subject;
  currentSubjectTotal = currentSubject.good.length + currentSubject.bad.length;
};

const killAllAudios = () => {
  runAudio.pause();
  epicAudio.pause();
  transformedEpicAudio.pause();
};
