"use strict";
(() => {
  // src/challenge_guardians.ts
  var goBackToMountain = (event) => {
    window.location.href = `/discovery${hardMode ? "?started=true" : ""}`;
  };
  var getUrlParameter = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };
  var MAPS = [];
  var heroContainer = document.getElementById("hero_container");
  var heroImage = document.getElementById("heroImg");
  var swordSlashImg = document.getElementById(
    "sword_slash"
  );
  var scoreContainer = document.getElementById("score_value");
  var answerDataContainer = document.getElementById("answer_data_container");
  var answerDataValue = document.getElementById("answer_data_value");
  var scoreMalusContainer = document.getElementById("score_malus_container");
  var scoreMalusDetail = document.getElementById("score_malus_detail");
  var scoreRewardContainer = document.getElementById("score_reward_container");
  var scoreRewardDetail = document.getElementById("score_reward_detail");
  var ANIMTION_HERO_RUN_DURATION_BETWEEN_FRAMES_IN_MS = 100;
  var heroInTheRedZone = false;
  var enemyViewPoint = document.getElementsByClassName(
    "enemyViewPoint"
  )[0];
  var enemyViewPointLogo = document.getElementById(
    "enemyViewPointLogo"
  );
  var enemyViewPointTile1 = document.getElementById(
    "enemyViewPointTile1"
  );
  var enemyViewPointTile2 = document.getElementById(
    "enemyViewPointTile2"
  );
  var enemyViewPointTile3 = document.getElementById(
    "enemyViewPointTile3"
  );
  var enemyViewPointTile4 = document.getElementById(
    "enemyViewPointTile4"
  );
  var viewPointTiles = [
    enemyViewPointTile1,
    enemyViewPointTile2,
    enemyViewPointTile3,
    enemyViewPointTile4
  ];
  var updateEnemyViewPointDisplay = () => {
    viewPointTiles.forEach(
      (tile) => tile.style.background = heroInTheRedZone ? "rgba(204, 40, 40, 0.514)" : "rgba(40, 108, 204, 0.514)"
    );
    enemyViewPointLogo.src = `assets/challenge/millescaneous/${heroInTheRedZone ? "careful" : "vision"}.png`;
  };
  var runAudio = document.getElementById("run_audio");
  var swordAudio = document.getElementById("sword_audio");
  var laserdAudio = document.getElementById("laser_audio");
  var epicAudio = document.getElementById(
    getUrlParameter("mode") === "hard" ? "hard_epic_audio" : "epic_audio"
  );
  var bassAudio = document.getElementById("bass_audio");
  var fireBackgroundAudio = document.getElementById(
    "fire_background_audio"
  );
  var electricityAudio = document.getElementById(
    "electricity_audio"
  );
  var transformationScreamAudio = document.getElementById(
    "transformation_scream_audio"
  );
  var hurtAudio = document.getElementById(
    "hero_hurt_audio"
  );
  var transformedEpicAudio = document.getElementById(
    "transformed_epic_audio"
  );
  var transformationOffAudio = document.getElementById(
    "transformation_off_audio"
  );
  var progressBar = document.getElementsByClassName(
    "progress"
  )[0];
  var bombAudio = document.getElementById("bomb_audio");
  swordAudio.volume = 0.65;
  bombAudio.volume = 0.12;
  electricityAudio.volume = 0.7;
  transformationScreamAudio.volume = 0.25;
  hurtAudio.volume = 0.025;
  runAudio.volume = 0.7;
  var currentSubject = null;
  var currentSubjectTotal = 0;
  var swordReach = window.innerWidth * 0.3;
  var gameLaunched = false;
  var TRANSFORMED_BONUS_RATIO = 1;
  var REWARD_UNIT = 1;
  var transformedAlready = false;
  var REWARD_TIMEOUT_DURATION = 1e3;
  var KILLED_ENEMY_REWARD = 30;
  var rewardStreak = 1;
  var hardMode = false;
  var TRANSFORMATION_THRESHOLD = hardMode ? 1e8 : 20;
  var preTransformed = false;
  var gameFinished = false;
  var runStopped = false;
  var score = 0;
  var heroHurt = false;
  var heroIsAlive = true;
  var lifePoints = { max: 4, value: 4 };
  var INVISIBILITY_DURATION_IN_MILLISECONDS = 600;
  var invisible = false;
  var ennemiesOnScreen = [];
  var enemiesComingTimeout = null;
  var transformed = false;
  var currentMalusContainerTimeout = null;
  var currentRewardContainerTimeout = null;
  var currentTransformationRewardContainerTimeout = null;
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
  var GAME_TIMEOUTS = {
    [0 /* HERO */]: [],
    [1 /* ENEMY */]: []
  };
  var STATS = {
    title: "statistics",
    good: [
      new Answer(
        "Etendue = Valeur maximale - Valeur minimale d'un jeu de donn\xE9e",
        true
      ),
      new Answer(
        "Le mode est la valeur la plus fr\xE9quente dans un ensemble de donn\xE9es.",
        true
      ),
      new Answer(
        "La variance mesure \xE0 quel point les donn\xE9es d'un ensemble sont dispers\xE9es par rapport \xE0 la moyenne.",
        true
      ),
      new Answer("L'\xE9cart type est la racine carr\xE9e de la variance", true),
      new Answer(
        "Les statistiques descriptives sont une des deux cat\xE9gories des statistiques",
        true
      ),
      new Answer(
        "Les statistiques Inf\xE9rentielles sont une des deux cat\xE9gories des statistiques",
        true
      ),
      new Answer(
        "Les statistiques descriptives r\xE9sument ou d\xE9crivent les caract\xE9ristiques d'un ensemble de donn\xE9es",
        true
      ),
      new Answer(
        "Les statistiques inf\xE9rentielles font des inf\xE9rences et des pr\xE9dictions sur une population \xE0 partir d'un \xE9chantillon de donn\xE9es",
        true
      ),
      new Answer("Un ensemble de donn\xE9es peut avoir plusieurs modes", true),
      new Answer("Un ensemble de donn\xE9es peut avoir 0 modes", true)
    ],
    bad: [
      new Answer("Etendue = la Valeur minimale d'un jeu de donn\xE9e", false),
      new Answer(
        "Le mode est la valeur la moins r\xE9pendue dans un ensemble de donn\xE9es.",
        false
      ),
      new Answer(
        "La variance mesure le nombre de diff\xE9rence entre deux jeux de donn\xE9es",
        false
      ),
      new Answer(
        "L'\xE9cart type est l'\xE9cart entre le premier et le dernier \xE9l\xE9ment d'un jeu de donn\xE9e ",
        false
      ),
      new Answer(
        "Les statistiques cumulatives sont une des deux cat\xE9gories des statistiques",
        false
      ),
      new Answer(
        "Les statistiques proclamatives sont une des deux cat\xE9gories des statistiques",
        false
      ),
      new Answer("Les statistiques descriptives n'existent pas", false),
      new Answer(
        "les statistique inf\xE9rentielles d\xE9crivent les caract\xE9ristiques d'un ensemble de donn\xE9es",
        false
      ),
      new Answer("Un ensemble de donn\xE9es ne peut avoir qu'un mode", false),
      new Answer("Un ensemble de donn\xE9es ne peut pas avoir 0 mode", false)
    ]
  };
  var VECTORS = {
    title: "Additions",
    good: [
      new Answer("un vecteur est not\xE9 AB -> ou u ->", true),
      new Answer(
        "La norme d'un vecteur, not\xE9e ||AB->|| est la longueur du vecteur AB -> autrement dit, la distance entre les points A et B.",
        true
      ),
      new Answer(
        "Le point d'origine du vecteur AB -> (ici le point A) est le point de d\xE9part qui en caract\xE9rise le sens",
        true
      ),
      new Answer(
        "Le point d'extr\xE9mit\xE9 de AB -> est le point d'arriv\xE9e  (ici le point B) qui en caract\xE9rise le sens",
        true
      ),
      new Answer("Le vecteur oppos\xE9 du vecteur AB > est BA -> ou -AB -> ", true),
      new Answer(
        "lorsque deux points AB sont confondus, on dit que AB -> est un vecteur nul",
        true
      )
    ],
    bad: [
      new Answer(
        "Sens, et direction sont synonymes lorsqu'on parle de vecteurs",
        false
      ),
      new Answer(
        "Le point d'extremit\xE9 est toujours \xE9gal au point d'arriv\xE9e d'un vecteur",
        false
      ),
      new Answer(
        "Le point d'extremit\xE9 represente le point de d\xE9part du vecteur",
        false
      ),
      new Answer(
        "Un vecteur ne peut pas \xEAtre nul, sinon ce n'est pas un vecteur",
        false
      )
    ]
  };
  var MATHS_ARITHMETIC = {
    title: "Arithmetic",
    good: [
      new Answer("(27/07) j'ai \xE9t\xE9 au march\xE9", true),
      new Answer("(27/07) ,  mon oncle m'a d\xE9pos\xE9 en voiture", true),
      new Answer("(samedi 27/07) j'ai souhait\xE9 bon anniversaire \xE0 Michael", true),
      new Answer("(samedi 27/07) Je suis sorti me faire coiffer", true),
      new Answer("(samedi 27/07) Je suis sorti \xE0 une r\xE9union", true),
      new Answer("(samedi 27/07) Je suis rentr\xE9e \xE0 3h du matin", true),
      new Answer("(samedi 27/07) J'ai bu un peu de champagne", true),
      new Answer("(samedi 27/07) j'ai mang\xE9 un peu d'ekoki/poisson", true),
      new Answer(
        "(samedi 27/07) J'\xE9tais habill\xE9e en pantalon bleu/blanc, sac bleu",
        true
      ),
      new Answer("(27/07) Mon oncle m'a d\xE9pos\xE9e en voiture", true)
    ],
    bad: [
      new Answer("(27/07) Je suis all\xE9 au restaurant chez Julie", false),
      new Answer("(samedi 27/07) Maxime est venu \xE0 la maison", false),
      new Answer("(samedi 27/07) Je suis all\xE9 voir ma soeur ", false),
      new Answer("(samedi 27/07) J'ai regard\xE9 un reportage sur Poutine", false),
      new Answer("(samedi 27/07) j'ai mang\xE9 des myrtilles", false),
      new Answer("(samedi 27/07) J'ai bu du whisky avec du coca", false),
      new Answer(
        "(samedi 27/07) Des ouvriers sont venus changer les vitres",
        false
      )
    ]
  };
  var Mike_memory_0107 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_0207 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_0307 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_0407 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakaxmura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_0507 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_0607 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_0707 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_0807 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_0907 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1007 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1107 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1207 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1307 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1407 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1507 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1607 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1707 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1807 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_1907 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_2007 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_2107 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_2207 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_2307 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_2407 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_2507 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_2607 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie d'ouverture des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu tony parker dans la c\xE9r\xE9monie des JO",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as vu le show de aya nakamura durant la c\xE9r\xE9monie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as pris un caf\xE9 dans une tasse blanche",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as flipp\xE9 sur ta peau pendant des heures",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 la c\xE9r\xE9monie avec charlotte et son amie",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu as parl\xE9 de l'affaire JM trogneux \xE0 papa",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as dit \xE0 Papa '\xE7a me d\xE9go\xFBte' ", true),
      new Answer("(Vendredi 26/07) Tu as trouv\xE9 une bouteille de spray", true),
      new Answer("(Vendredi 26/07) Tu as chang\xE9 tes draps", true),
      new Answer("(Vendredi 26/07) Tu as nettoy\xE9 le sol de la cuisine", true),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        true
      ),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils la veille",
        true
      ),
      new Answer("(Vendredi 26/07) Tu as lu un mail d'AMELI", true)
    ],
    bad: [
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 une interview de l'adjoint de Pierre Sage",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as pris un th\xE9", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 mcdo", false),
      new Answer("(Vendredi 26/07) Tu as bu du whisky", false),
      new Answer(
        "(Vendredi 26/07) Tu as regard\xE9 l'interview de Moussa Niakhat\xE9",
        false
      ),
      new Answer("(Vendredi 26/07) Tu as vu Snoop Dogg amener la flamme", false),
      new Answer("(Vendredi 26/07) Tu as mang\xE9 des macaronies", false),
      new Answer("(Vendredi 26/07) Tu as appel\xE9 max", false),
      new Answer("(Vendredi 26/07) Tu n'es pas all\xE9 sur twitter", false),
      new Answer(
        "(Vendredi 26/07) Tu t'es fait retirer les fils il y'a 2 jours",
        false
      )
    ]
  };
  var Mike_memory_2707 = {
    title: "Arithmetic",
    good: [
      new Answer("(Samedi 27/07) C'\xE9tait mon anniversaire", true),
      new Answer(
        "(Samedi 27/07) La pote de charlotte m'a dit que je devais lui offrir \xE0 boire",
        true
      ),
      new Answer("(Samedi 27/07) Lor\xE8ne m'a envoy\xE9 un message", true),
      new Answer("(Samedi 27/07) J'ai regard\xE9 France Guin\xE9e", true),
      new Answer(
        "(Samedi 27/07) J'ai regard\xE9 France Guin\xE9e, la Guin\xE9e s'est vu refuser un but hors jeu",
        true
      ),
      new Answer(
        "(Samedi 27/07) J'ai regard\xE9 France Guin\xE9e, la Guin\xE9e s'est vu refuser un but hors jeu apr\xE8s avoir c\xE9l\xE9brer",
        true
      ),
      new Answer(
        "(Samedi 27/07) J'ai branch\xE9 mon c\xE2ble hdmi \xE0 la t\xE9l\xE9 avec",
        true
      ),
      new Answer(
        "(Samedi 27/07) J'ai branch\xE9 mon c\xE2ble hdmi \xE0 la t\xE9l\xE9 et ai mis le chargeur en dessous de la tv",
        true
      ),
      new Answer("(Samedi 27/07) Math\xE9o m'a appel\xE9", true),
      new Answer(
        "(Samedi 27/07) Math\xE9o m'a appel\xE9, m'a dit qu'il vivait chez maman maintenant",
        true
      ),
      new Answer(
        "(Samedi 27/07) Math\xE9o m'a appel\xE9, m'a dit qu'il avait quitt\xE9 Lisa",
        true
      ),
      new Answer(
        "(Samedi 27/07) Math\xE9o m'a appel\xE9, m'a dit qu'il avait quitt\xE9 Lisa, et qu'il ne vivait plus avec elle depuis quelques jours ",
        true
      ),
      new Answer(
        "(Samedi 27/07) Maman m'a envoy\xE9 un message sur messenger et a dit, on fetera les annivs l\xE0 bas",
        true
      ),
      new Answer(
        "(Samedi 27/07) Maman m'a envoy\xE9 un message sur messenger et a dit, on fetera les annivs l\xE0 bas, c'est pr\xE9vu",
        true
      ),
      new Answer(
        "(Samedi 27/07) Maman m'a envoy\xE9 un message sur messenger et a dit, on fetera les annivs l\xE0 bas, c'est pr\xE9vu",
        true
      )
    ],
    bad: [
      new Answer("(Samedi 27/07) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Samedi 27/07) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Samedi 27/07) Tu as fait des tractions", false),
      new Answer("(Samedi 27/07) Tu as bu du th\xE9", false),
      new Answer("(Samedi 27/07) Tu as appel\xE9 max", false),
      new Answer("(Samedi 27/07) Tu as jou\xE9 \xE0 skyrim", false),
      new Answer(
        "(Samedi 27/07) Tu t'es fait retirer les fils il y'a 3 jours",
        false
      )
    ]
  };
  var Mike_memory_2807 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Dimanche 28/07) C'\xE9tait le lendemain de mon anniversaire",
        true
      ),
      new Answer(
        "(Dimanche 28/07) Reveil horrible, infection. Des boutons horribles apparaissent.",
        true
      ),
      new Answer("(Dimanche 28/07) Au bout de ma life", true)
    ],
    bad: [
      new Answer("(Dimanche 28/07) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Dimanche 28/07) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Dimanche 28/07) Tu as fait des tractions", false)
    ]
  };
  var Mike_memory_2907 = {
    title: "Arithmetic",
    good: [
      new Answer("(Lundi 29/07) C'\xE9tait le lendemain de mon anniversaire", true),
      new Answer(
        "(Lundi 29/07) Reveil horrible, infection. Des boutons horribles apparaissent.",
        true
      ),
      new Answer("(Lundi 28/07) Au bout de ma life", true)
    ],
    bad: [
      new Answer("(Lundi 29/07) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Lundi 29/07) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Lundi 29/07) Tu as fait des tractions", false)
    ]
  };
  var Mike_memory_3007 = {
    title: "Arithmetic",
    good: [
      new Answer("(Mardi 30/07) C'\xE9tait le lendemain de mon anniversaire", true),
      new Answer(
        "(Mardi 30/07) Reveil horrible, infection. Des boutons horribles apparaissent.",
        true
      ),
      new Answer("(Mardi 30/07) Au bout de ma life", true)
    ],
    bad: [
      new Answer("(Mardi 30/07) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Mardi 30/07) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Mardi 30/07) Tu as fait des tractions", false)
    ]
  };
  var Mike_memory_3107 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Mercredi 31/07) C'\xE9tait le lendemain de mon anniversaire",
        true
      ),
      new Answer(
        "(Mercredi 31/07) Reveil horrible, infection. Des boutons horribles apparaissent.",
        true
      ),
      new Answer("(Mercredi 31/07) Au bout de ma life", true)
    ],
    bad: [
      new Answer("(Mercredi 31/07) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Mercredi 31/07) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Mercredi 31/07) Tu as fait des tractions", false)
    ]
  };
  var Mike_memory_0108 = {
    title: "Arithmetic",
    good: [
      new Answer("(Jeudi 01/08) C'\xE9tait le lendemain de mon anniversaire", true),
      new Answer(
        "(Jeudi 01/08) R\xE9veil horrible, infection. Des boutons horribles apparaissent.",
        true
      ),
      new Answer("(Jeudi 01/08) Au bout de ma life", true)
    ],
    bad: [
      new Answer("(Jeudi 01/08) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Jeudi 01/08) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Jeudi 01/08) Tu as fait des tractions", false)
    ]
  };
  var Mike_memory_0208 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Semaine 29/07 - 04/08 => Vendredi 02/08) Je suis all\xE9 voir hilligot",
        true
      ),
      new Answer(
        "(Semaine 29/07 - 04/08 => Vendredi 02/08) Reveil horrible, infection. Des boutons horribles apparaissent.",
        true
      ),
      new Answer(
        "(Semaine 29/07 - 04/08 => Vendredi 02/08) Au bout de ma life",
        true
      )
    ],
    bad: [
      new Answer(
        "(Semaine 29/07 - 04/08 => Vendredi 02/08) Tu as regard\xE9 un combat de Cyril Gane",
        false
      ),
      new Answer(
        "(Semaine 29/07 - 04/08 => Vendredi 02/08) Tu as mang\xE9 des choux fleurs",
        false
      ),
      new Answer(
        "(Semaine 29/07 - 04/08 => Vendredi 02/08) Tu as fait des tractions",
        false
      )
    ]
  };
  var Mike_memory_0308 = {
    title: "Arithmetic",
    good: [
      new Answer("(Samedi 03/08) C'\xE9tait le lendemain de mon anniversaire", true),
      new Answer(
        "(Samedi 03/08) Reveil horrible, infection. Des boutons horribles apparaissent.",
        true
      ),
      new Answer("(Samedi 03/08) Au bout de ma life", true)
    ],
    bad: [
      new Answer("(Samedi 03/08) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Samedi 03/08) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Samedi 03/08) Tu as fait des tractions", false)
    ]
  };
  var Mike_memory_0408 = {
    title: "Arithmetic",
    good: [
      new Answer("(Dimanche 04/08) ", true),
      new Answer("(Dimanche 04/08) J'oublie d'appeler Papi et Mamie", true),
      new Answer("(Dimanche 04/08) Au bout de ma life", true)
    ],
    bad: [
      new Answer("(Dimanche 04/08) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Samedi 04/08) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Samedi 04/08) Tu as fait des tractions", false)
    ]
  };
  var Mike_memory_05_08 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Lundi 05/08) Je regarde une vid\xE9o de Aur\xE9lien Duarte en Thailande.",
        true
      ),
      new Answer(
        "(Lundi 05/08) Je regarde le ping pong feminin. 8emes de finale contre la thailande",
        true
      ),
      new Answer(
        "(Lundi 05/08) Je regarde le ping pong feminin. 8emes de finale contre la thailande. La france perdait 2 sets \xE0 1",
        true
      ),
      new Answer(
        "(Lundi 05/08) Je regarde le ping pong feminin. 8emes de finale contre la thailande. La france perdait 2 sets \xE0 1, sur le match en double et a perdu 3-1",
        true
      ),
      new Answer(
        "(Lundi 05/08) Alice Damato remporte l'\xE9preuve de gym et pas Simone Biles, qui est tomb\xE9e.",
        true
      ),
      new Answer(
        "(Lundi 05/08) On a regard\xE9s le match france/egypte, la france gagne 2/1 avec 1 but de mateta dans le temps r\xE9glementaire, et un but en prolong ",
        true
      ),
      new Answer(
        "(Lundi 05/08) Cl\xE9ment Ducos a gagn\xE9 l'\xE9preuve de qualif de 400m haies et dit 'personne me fait peur monsieur' ",
        true
      )
    ],
    bad: [
      new Answer("(Lundi 05/08) Tu as regard\xE9 un combat de Cyril Gane", false),
      new Answer("(Lundi 05/08) Tu as mang\xE9 des choux fleurs", false),
      new Answer("(Lundi 05/08) Tu as fait des tractions", false)
    ]
  };
  var Mike_memory_06_08 = {
    title: "Arithmetic",
    good: [
      new Answer("(Mardi 06/08) On a mang\xE9 steak/pates", true),
      new Answer("(Mardi 06/08) Math\xE9o \xE9tait sur tik tok'", true),
      new Answer("(Mardi 06/08) On a regard\xE9 le film pokemon avec Micka", true),
      new Answer("(Mardi 06/08) Math\xE9o a fait du v\xE9lo", true),
      new Answer("(Mardi 06/08) Math\xE9o a fait du m\xE9nage au travail", true),
      new Answer("(Mardi 06/08) On a regard\xE9s france/Canada en basket", true),
      new Answer(
        "(Mardi 06/08) J'ai montr\xE9 \xE0 Micka une vid\xE9o de L\xE9on Marchand qui met un vent \xE0 une petite",
        true
      ),
      new Answer("(Mardi 06/08) J'ai bu une demi cannette de coca", true),
      new Answer("(Mardi 06/08) On a boug\xE9 la table du salon", true)
    ],
    bad: [
      new Answer("(Mardi 06/08) Leon marchand a nag\xE9", true),
      new Answer(
        "(Mardi 06/08) On a regard\xE9 le match de handball france/allemagne",
        false
      ),
      new Answer("(Mardi 06/08) J'ai mang\xE9 burger king", false),
      new Answer("(Mardi 06/08) Maman m'a appel\xE9", false),
      new Answer(
        "(Mardi 06/08) J'ai vu le match de l'\xE9quipe de france de foot",
        false
      ),
      new Answer(
        "(Mardi 06/08) Philippe est venu amener un colis \xE0 la maison",
        false
      )
    ]
  };
  var Mike_memory_07_08 = {
    title: "Arithmetic",
    good: [
      new Answer("(Mercredi 07/08) La France a battu l'italie au Volley", true),
      new Answer(
        "(Mercredi 07/08) Cyrian Ravet a gagn\xE9 la medaille de Bronze au taekwondo",
        true
      ),
      new Answer(
        "(Mercredi 07/08) Sofiane et Aboudou ont perdu en perdus en boxe mais pris une argent et un bronze",
        true
      ),
      new Answer(
        "(Mercredi 07/08) Handball, la france perd contre l'allemagne en prenant 2 buts en quelques secondes",
        true
      ),
      new Answer("(Mercredi 07/08) Lisa a appel\xE9 Math\xE9o", true),
      new Answer(
        "(Mercredi 07/08) Les etats unis \xE9taient men\xE9s pendant 3 quartants contre la serbie",
        true
      ),
      new Answer("(Mercredi 07/08) Noah lyles a termin\xE9 3eme au 200m", true),
      new Answer(
        "(Mercredi 07/08) J'ai mang\xE9 une burata avec de la tomate le soir",
        true
      ),
      new Answer(
        "(Mercredi 07/08) On regardait allemagne/france en basket et suede/france en hand en meme temps",
        true
      ),
      new Answer(
        "(Mercredi 07/08) Mat parlait avec une go sur tinder, sa famille etait au hand",
        true
      ),
      new Answer(
        "(Mercredi 07/08) Au hand, la france etait men\xE9e de deux buts a quelques secondes de la fin",
        true
      )
    ],
    bad: [
      new Answer("(Mercredi 07/08) Mat a \xE9teint le serveur", false),
      new Answer("(Mercredi 07/08) Philippe est pass\xE9 checker la piscine", false),
      new Answer("(Mercredi 07/08) J'ai mang\xE9 burger king", false),
      new Answer("(Mercredi 07/08) Maman m'a appel\xE9", false),
      new Answer(
        "(Mercredi 07/08) J'ai vu le match de l'\xE9quipe de france de foot",
        false
      ),
      new Answer(
        "(Mardi 07/08) Philippe est venu amener un colis \xE0 la maison",
        false
      )
    ]
  };
  var Mike_memory_08_08 = {
    title: "Arithmetic",
    good: [
      new Answer("(Jeudi 08/08) On a mang\xE9 mcdo a midi", true),
      new Answer("(Jeudi 08/08) On a regard\xE9 france/allemagne en basket", true),
      new Answer(
        "(Jeudi 08/08) On a regard\xE9 france/su\xE8de en volley feminin",
        true
      ),
      new Answer("(Jeudi 08/08) Math\xE9o a fait le malin avec le coussin", true),
      new Answer("(Jeudi 08/08) Lisa a appel\xE9 Math\xE9o", true),
      new Answer(
        "(Jeudi 08/08) Les etats unis \xE9taient men\xE9s pendant 3 quartants contre la serbie",
        true
      ),
      new Answer("(Jeudi 08/08) Noah lyles a termin\xE9 3eme au 200m", true),
      new Answer(
        "(Jeudi 08/08) J'ai mang\xE9 une burata avec de la tomate le soir",
        true
      ),
      new Answer(
        "(Jeudi 08/08) On regardait allemagne/france en basket et suede/france en hand en meme temps",
        true
      ),
      new Answer(
        "(Jeudi 08/08) Mat parlait avec une go sur tinder, sa famille etait au hand",
        true
      ),
      new Answer(
        "(Jeudi 08/08) Au hand, la france etait men\xE9e de deux buts a quelques secondes de la fin",
        true
      )
    ],
    bad: [
      new Answer("(Jeudi 08/08) Mat a \xE9teint le serveur", false),
      new Answer("(Jeudi 08/08) Philippe est pass\xE9 checker la piscine", false),
      new Answer("(Jeudi 08/08) J'ai mang\xE9 burger king", false),
      new Answer("(Jeudi 08/08) Maman m'a appel\xE9", false),
      new Answer(
        "(Jeudi 08/08) J'ai vu le match de l'\xE9quipe de france de beach volley",
        false
      ),
      new Answer("(Jeudi 08/08) J'ai bu un milkshake avec une paille", false),
      new Answer("(Jeudi 08/08) Mat a \xE9teint le serveur", false),
      new Answer("(Jeudi 08/08) Philippe est pass\xE9 checker la piscine", false),
      new Answer("(Jeudi 08/08) Noah lyles a gagn\xE9 le 100m", false),
      new Answer("(Jeudi 08/08) steph curry n'a mis qu'un 3 points", false),
      new Answer("(Jeudi 08/08) Ducos a \xE9t\xE9 \xE9limin\xE9 en 400m haies ", false),
      new Answer("(Jeudi 08/08) Ducos ne court pas le lendemain", false),
      new Answer("(Jeudi 08/08) Wambanyama est suspendu", false),
      new Answer("(Jeudi 08/08) J'ai bu du coca", false),
      new Answer("(Jeudi 08/08) Je n'ai pas mang\xE9 de bonbons", false),
      new Answer(
        "(Jeudi 08/08) J'ai vu le match de l'ol contre berlin en replay",
        false
      ),
      new Answer("(Jeudi 08/08) Je n'ai pas commenc\xE9 the last dance", false),
      new Answer("(Jeudi 08/08) Papi et mamie m'ont appel\xE9s", false)
    ]
  };
  var Mike_memory_09_08 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 09/08) J'ai mang\xE9 du fromage, avec de la tomate jaune et du jambon \xE0 midi",
        true
      ),
      new Answer("(Vendredi 09/08) J'ai fini les glaces", true),
      new Answer(
        "(Vendredi 09/08) La france a perdue contre l espagne 5-3",
        true
      ),
      new Answer(
        "(Vendredi 09/08) Lacazette a \xE9t\xE9 remplac\xE9 peu de temps apr\xE8s la mi-temps",
        true
      ),
      new Answer("(Vendredi 09/08) Lisa a appel\xE9 Math\xE9o", true),
      new Answer(
        "(Vendredi 09/08) Le lendemain, il y'a la petite finale serbie/allemagne en basket",
        true
      ),
      new Answer(
        "(Vendredi 09/08) J'ai mang\xE9 une mousse au chocolat avant de dormir",
        true
      ),
      new Answer("(Vendredi 09/08) J'ai achet\xE9 Renekton", true),
      new Answer(
        "(Vendredi 09/08) J'ai r\xE9alis\xE9 que les nouveaux bots lol \xE9taient explos\xE9s",
        true
      ),
      new Answer("(Vendredi 09/08) Ducos a perdu la finale du 400m haies", true),
      new Answer(
        "(Vendredi 09/08) J'ai appel\xE9 Ludovic vite fait, il regardait le match de l'edf dans un bar",
        true
      ),
      new Answer(
        "(Vendredi 09/08) J'ai mang\xE9 du steak, des pates et du fromage",
        true
      ),
      new Answer(
        "(Vendredi 09/08) L'\xE9quipe de Ryan Zeze en relai a perdue",
        true
      )
    ],
    bad: [
      new Answer("(Vendredi 09/08) Mat a \xE9teint le serveur", false),
      new Answer("(Vendredi 09/08) Philippe est pass\xE9 checker la piscine", false),
      new Answer("(Vendredi 09/08) J'ai mang\xE9 burger king", false),
      new Answer("(Vendredi 09/08) Maman m'a appel\xE9", false),
      new Answer(
        "(Vendredi 09/08) J'ai vu le match de l'\xE9quipe de france de beach volley",
        false
      ),
      new Answer("(Vendredi 09/08) Mat a \xE9teint le serveur", false),
      new Answer("(Vendredi 09/08) Philippe est pass\xE9 checker la piscine", false),
      new Answer("(Vendredi 09/08) Noah lyles a gagn\xE9 le 100m", false),
      new Answer("(Vendredi 09/08) steph curry n'a mis qu'un 3 points", false),
      new Answer("(Vendredi 09/08) Ducos a \xE9t\xE9 \xE9limin\xE9 en 400m haies ", false),
      new Answer("(Vendredi 09/08) Ducos ne court pas le lendemain", false),
      new Answer("(Vendredi 09/08) Wambanyama est suspendu", false),
      new Answer("(Vendredi 09/08) J'ai bu du coca", false),
      new Answer("(Vendredi 09/08) Je n'ai pas mang\xE9 de bonbons", false),
      new Answer(
        "(Vendredi 09/08) J'ai vu le match de l'ol contre berlin en replay",
        false
      ),
      new Answer("(Vendredi 09/08) Je n'ai pas commenc\xE9 the last dance", false),
      new Answer("(Vendredi 09/08) Papi et mamie m'ont appel\xE9s", false)
    ]
  };
  var Mike_memory_10_08 = {
    title: "Arithmetic",
    good: [
      new Answer(
        "(Vendredi 09/08) J'ai mang\xE9 du fromage, avec de la tomate jaune et du jambon \xE0 midi",
        true
      ),
      new Answer("(Vendredi 09/08) J'ai fini les glaces", true),
      new Answer(
        "(Vendredi 09/08) La france a perdue contre l espagne 5-3",
        true
      ),
      new Answer(
        "(Vendredi 09/08) Lacazette a \xE9t\xE9 remplac\xE9 peu de temps apr\xE8s la mi-temps",
        true
      ),
      new Answer("(Vendredi 09/08) Lisa a appel\xE9 Math\xE9o", true),
      new Answer(
        "(Vendredi 09/08) Le lendemain, il y'a la petite finale serbie/allemagne en basket",
        true
      ),
      new Answer(
        "(Vendredi 09/08) J'ai mang\xE9 une mousse au chocolat avant de dormir",
        true
      ),
      new Answer("(Vendredi 09/08) J'ai achet\xE9 Renekton", true),
      new Answer(
        "(Vendredi 09/08) J'ai r\xE9alis\xE9 que les nouveaux bots lol \xE9taient explos\xE9s",
        true
      ),
      new Answer("(Vendredi 09/08) Ducos a perdu la finale du 400m haies", true),
      new Answer(
        "(Vendredi 09/08) J'ai appel\xE9 Ludovic vite fait, il regardait le match de l'edf dans un bar",
        true
      ),
      new Answer(
        "(Vendredi 09/08) J'ai mang\xE9 du steak, des pates et du fromage",
        true
      ),
      new Answer(
        "(Vendredi 09/08) L'\xE9quipe de Ryan Zeze en relai a perdue",
        true
      )
    ],
    bad: [
      new Answer("(Vendredi 09/08) Mat a \xE9teint le serveur", false),
      new Answer("(Vendredi 09/08) Philippe est pass\xE9 checker la piscine", false),
      new Answer("(Vendredi 09/08) J'ai mang\xE9 burger king", false),
      new Answer("(Vendredi 09/08) Maman m'a appel\xE9", false),
      new Answer(
        "(Vendredi 09/08) J'ai vu le match de l'\xE9quipe de france de beach volley",
        false
      ),
      new Answer("(Vendredi 09/08) Mat a \xE9teint le serveur", false),
      new Answer("(Vendredi 09/08) Philippe est pass\xE9 checker la piscine", false),
      new Answer("(Vendredi 09/08) Noah lyles a gagn\xE9 le 100m", false),
      new Answer("(Vendredi 09/08) steph curry n'a mis qu'un 3 points", false),
      new Answer("(Vendredi 09/08) Ducos a \xE9t\xE9 \xE9limin\xE9 en 400m haies ", false),
      new Answer("(Vendredi 09/08) Ducos ne court pas le lendemain", false),
      new Answer("(Vendredi 09/08) Wambanyama est suspendu", false),
      new Answer("(Vendredi 09/08) J'ai bu du coca", false),
      new Answer("(Vendredi 09/08) Je n'ai pas mang\xE9 de bonbons", false),
      new Answer(
        "(Vendredi 09/08) J'ai vu le match de l'ol contre berlin en replay",
        false
      ),
      new Answer("(Vendredi 09/08) Je n'ai pas commenc\xE9 the last dance", false),
      new Answer("(Vendredi 09/08) Papi et mamie m'ont appel\xE9s", false)
    ]
  };
  var MATHS_MEDIUM = {
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
      new Answer("8+16=24", true)
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
      new Answer("8+17=24", false)
    ]
  };
  var getNextAnswer = () => {
    const randVal = Math.random() > 0.5;
    if (!currentSubject) {
      console.log("there is no subject");
      defineCurrentSubject(hardMode ? STATS : Mike_memory_09_08);
    }
    const getAndRemoveSubject = (index, list) => {
      let foundElement = null;
      for (let elementIndex = 0; elementIndex < list.length; elementIndex++) {
        let element = list[elementIndex];
        if (elementIndex === index) {
          list.splice(elementIndex, 1);
          foundElement = element;
          break;
        }
      }
      if (foundElement === null) {
        console.log("error => we couldnt find an element in the answers list");
      }
      return foundElement;
    };
    if (randVal) {
      return (currentSubject == null ? void 0 : currentSubject.good.length) ? getAndRemoveSubject(
        Math.round(Math.random() * (currentSubject.good.length - 1)),
        currentSubject.good
      ) : (currentSubject == null ? void 0 : currentSubject.bad.length) ? getAndRemoveSubject(
        Math.round(Math.random() * (currentSubject.bad.length - 1)),
        currentSubject.bad
      ) : "done";
    } else {
      return (currentSubject == null ? void 0 : currentSubject.bad.length) ? getAndRemoveSubject(
        Math.round(Math.random() * (currentSubject.bad.length - 1)),
        currentSubject.bad
      ) : (currentSubject == null ? void 0 : currentSubject.good.length) ? getAndRemoveSubject(
        Math.round(Math.random() * (currentSubject.good.length - 1)),
        currentSubject.good
      ) : "done";
    }
  };
  var Grades = {
    D: [0, 1, 2, 3, 4, 5],
    C: [6, 7, 8, 9, 10],
    B: [11, 12, 13, 14],
    A: [15, 16, 17],
    S: [18, 19, 20]
  };
  var getChallengeGrade = () => {
    if (!currentSubject) {
      return;
    }
    const grade = Math.round(score / currentSubjectTotal * 20);
    return Grades.D.includes(grade) ? "D" : Grades.C.includes(grade) ? "C" : Grades.B.includes(grade) ? "B" : Grades.A.includes(grade) ? "A" : "S";
  };
  var updateLifePointsDisplay = () => {
    for (let i = 1; i <= lifePoints.max; i++) {
      const lifePointOpacity = i <= lifePoints.value ? "1" : "0.3";
      document.getElementById(`lifePointContainer_${i}`).style.opacity = lifePointOpacity;
    }
  };
  var setHeroClass = () => {
    heroContainer.classList.add(
      hardMode ? "hero_container_hard" : "hero_container_easy"
    );
  };
  var buildEnemyElement = () => {
    const newOpponentContainer = document.createElement("div");
    newOpponentContainer.classList.add(
      hardMode ? "hard_enemy_container" : "enemy_container"
    );
    const newEnnemyImg = document.createElement("img");
    newEnnemyImg.src = hardMode ? "assets/challenge/characters/enemies/hard/attack/1.png" : "assets/challenge/characters/enemies/black_spirit/run/1.png";
    newOpponentContainer.append(newEnnemyImg);
    document.getElementsByTagName("body")[0].append(newOpponentContainer);
    return newOpponentContainer;
  };
  var buildEnemy = (answer) => {
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
    enemiesComingTimeout = setTimeout(
      () => {
        if (newAnswer && newAnswer !== "done") {
          buildAndLaunchEnemy(newAnswer);
        } else {
          launchEndOfChallenge();
        }
      },
      Math.random() > 0.5 ? 500 : 1e3
    );
  };
  var backgroundSrc = null;
  var launchEndOfChallenge = () => {
    gameFinished = true;
    document.getElementById("endOfGameInterface").style.display = "flex";
    clearGameTimeouts();
    initAllAnimations();
    heroImage.src = "assets/palace/characters/default_dragor/run/1.png";
    document.getElementById("transformation_background").style.display = "none";
    const grade = getChallengeGrade();
    const levelUpAudio = document.getElementById(
      "levelup_audio"
    );
    const endOfChallengeButton = document.getElementById(
      "challengesuccessButton"
    );
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
      document.getElementById("endOfGameInterfaceScore").innerHTML = grade;
      document.getElementById("endOfGameInterfaceScore").style.display = "flex";
      const stampAudio = document.getElementById(
        "stamp_audio"
      );
      stampAudio.play();
      setTimeout(() => {
        displayEndOfGameButton();
      }, 2e3);
    }, 1e3);
  };
  var ANIMATION_ID = /* @__PURE__ */ ((ANIMATION_ID2) => {
    ANIMATION_ID2[ANIMATION_ID2["attack"] = 0] = "attack";
    ANIMATION_ID2[ANIMATION_ID2["run"] = 1] = "run";
    ANIMATION_ID2[ANIMATION_ID2["walk"] = 2] = "walk";
    ANIMATION_ID2[ANIMATION_ID2["hurt"] = 3] = "hurt";
    ANIMATION_ID2[ANIMATION_ID2["death"] = 4] = "death";
    ANIMATION_ID2[ANIMATION_ID2["idle"] = 5] = "idle";
    ANIMATION_ID2[ANIMATION_ID2["stop"] = 6] = "stop";
    ANIMATION_ID2[ANIMATION_ID2["stop_time"] = 7] = "stop_time";
    ANIMATION_ID2[ANIMATION_ID2["cancel_stop_time"] = 8] = "cancel_stop_time";
    ANIMATION_ID2[ANIMATION_ID2["opponent_idle"] = 9] = "opponent_idle";
    ANIMATION_ID2[ANIMATION_ID2["opponent_run"] = 10] = "opponent_run";
    ANIMATION_ID2[ANIMATION_ID2["opponent_attack"] = 11] = "opponent_attack";
    ANIMATION_ID2[ANIMATION_ID2["opponent_move"] = 12] = "opponent_move";
    ANIMATION_ID2[ANIMATION_ID2["opponent_death"] = 13] = "opponent_death";
    ANIMATION_ID2[ANIMATION_ID2["camera_left_to_right"] = 14] = "camera_left_to_right";
    ANIMATION_ID2[ANIMATION_ID2["camera_right_to_left"] = 15] = "camera_right_to_left";
    ANIMATION_ID2[ANIMATION_ID2["character_left_to_right_move"] = 16] = "character_left_to_right_move";
    ANIMATION_ID2[ANIMATION_ID2["hero_sword_slash"] = 17] = "hero_sword_slash";
    ANIMATION_ID2[ANIMATION_ID2["transformation_pre_run"] = 18] = "transformation_pre_run";
    ANIMATION_ID2[ANIMATION_ID2["transformation_run"] = 19] = "transformation_run";
    ANIMATION_ID2[ANIMATION_ID2["transformation_hurt"] = 20] = "transformation_hurt";
    ANIMATION_ID2[ANIMATION_ID2["boss_idle"] = 21] = "boss_idle";
    ANIMATION_ID2[ANIMATION_ID2["boss_attack"] = 22] = "boss_attack";
    return ANIMATION_ID2;
  })(ANIMATION_ID || {});
  var ANIMATION_RUNNING_VALUES = {
    [0 /* attack */]: 0,
    [1 /* run */]: 0,
    [2 /* walk */]: 0,
    [4 /* death */]: 0,
    [3 /* hurt */]: 0,
    [5 /* idle */]: 0,
    [7 /* stop_time */]: 0,
    [6 /* stop */]: 0,
    [8 /* cancel_stop_time */]: 0,
    [9 /* opponent_idle */]: 0,
    [10 /* opponent_run */]: 0,
    [11 /* opponent_attack */]: 0,
    [13 /* opponent_death */]: 0,
    [12 /* opponent_move */]: 0,
    [14 /* camera_left_to_right */]: 0,
    [15 /* camera_right_to_left */]: 0,
    [16 /* character_left_to_right_move */]: 0,
    [17 /* hero_sword_slash */]: 0,
    [18 /* transformation_pre_run */]: 0,
    [19 /* transformation_run */]: 0,
    [20 /* transformation_hurt */]: 0,
    [21 /* boss_idle */]: 0,
    [22 /* boss_attack */]: 0
  };
  var THROTTLE_NUMS = {
    [0 /* attack */]: 0,
    [1 /* run */]: 5,
    [2 /* walk */]: 5,
    [4 /* death */]: 5,
    [3 /* hurt */]: 0,
    [5 /* idle */]: 20,
    [7 /* stop_time */]: 5,
    [6 /* stop */]: 0,
    [8 /* cancel_stop_time */]: 5,
    [9 /* opponent_idle */]: 5,
    [10 /* opponent_run */]: 5,
    [11 /* opponent_attack */]: 0,
    [13 /* opponent_death */]: 0,
    [12 /* opponent_move */]: 1,
    [14 /* camera_left_to_right */]: 0,
    [15 /* camera_right_to_left */]: 5,
    [17 /* hero_sword_slash */]: 0,
    [16 /* character_left_to_right_move */]: 5,
    [18 /* transformation_pre_run */]: 5,
    [19 /* transformation_run */]: 5,
    [20 /* transformation_hurt */]: 0,
    [21 /* boss_idle */]: 15,
    [22 /* boss_attack */]: 10
  };
  var AnimationRequest = class {
    constructor(animation, callBack) {
      this.animation = animation;
      this.callBack = callBack;
    }
  };
  var APP_ELEMENTS_ANIMATION_QUEUE = {
    hero: {
      request_queue: [],
      current_animation: null,
      associated_animations: [
        1 /* run */,
        0 /* attack */,
        3 /* hurt */,
        4 /* death */,
        6 /* stop */,
        7 /* stop_time */,
        20 /* transformation_hurt */,
        18 /* transformation_pre_run */,
        19 /* transformation_run */
      ]
    },
    enemy: {
      request_queue: [],
      current_animation: null,
      associated_animations: [
        11 /* opponent_attack */,
        10 /* opponent_run */,
        13 /* opponent_death */,
        12 /* opponent_move */
      ]
    }
  };
  var getAppIdByAnimationId = (animationId) => {
    for (const appId in APP_ELEMENTS_ANIMATION_QUEUE) {
      if (APP_ELEMENTS_ANIMATION_QUEUE.hasOwnProperty(appId)) {
        const element = APP_ELEMENTS_ANIMATION_QUEUE[appId];
        if (element.associated_animations.includes(animationId)) {
          return appId;
        }
      }
    }
    return false;
  };
  var fullScreen = false;
  var timeManipulationToggle = () => {
    if (!fullScreen) {
      document.getElementsByTagName("body")[0].requestFullscreen();
      fullScreen = true;
    }
    if (!gameLaunched || window.innerWidth > 1e3 || !hardMode) return;
    if (runStopped) {
      resumeRun();
    } else {
      stopRun();
    }
  };
  var createMapBlock = (left) => {
    const block = document.createElement("div");
    block.classList.add("mapBlock");
    const backgroundImage = document.createElement("img");
    backgroundImage.src = backgroundSrc ? backgroundSrc : "";
    block.append(backgroundImage);
    block.style.position = "fixed";
    block.style.left = `${left}px`;
    block.onclick = (event) => timeManipulationToggle();
    document.getElementsByTagName("body")[0].append(block);
    return block;
  };
  var slowTime = (multiplicator) => {
    const runMultiplicatorBase = THROTTLE_NUMS[1 /* run */] ? THROTTLE_NUMS[1 /* run */] : 1;
    THROTTLE_NUMS[1 /* run */] = runMultiplicatorBase * multiplicator * 1.5 * 1.5;
    const cameraMoveMultiplicatorBase = THROTTLE_NUMS[14 /* camera_left_to_right */] ? THROTTLE_NUMS[14 /* camera_left_to_right */] : 1;
    THROTTLE_NUMS[14 /* camera_left_to_right */] = cameraMoveMultiplicatorBase * multiplicator * 1.5;
    const opponentRunMultiplicatorBase = THROTTLE_NUMS[10 /* opponent_run */] ? THROTTLE_NUMS[10 /* opponent_run */] : 1;
    THROTTLE_NUMS[10 /* opponent_run */] = opponentRunMultiplicatorBase * multiplicator;
    const opponentMoveMultiplicatorBase = THROTTLE_NUMS[12 /* opponent_move */] ? THROTTLE_NUMS[12 /* opponent_move */] : 1;
    THROTTLE_NUMS[12 /* opponent_move */] = opponentMoveMultiplicatorBase * multiplicator * 2;
  };
  var moveCamera = (direction, throttleNum = 0, previousFrameTimestamp) => {
    if (ANIMATION_RUNNING_VALUES[direction] === 0 || ANIMATION_RUNNING_VALUES[direction] > 1) {
      return;
    }
    const currentFrameTimeStamp = Date.now();
    const diff = currentFrameTimeStamp - previousFrameTimestamp;
    if (throttleNum < THROTTLE_NUMS[14 /* camera_left_to_right */]) {
      throttleNum++;
      return requestAnimationFrame(
        () => moveCamera(direction, throttleNum, currentFrameTimeStamp)
      );
    }
    throttleNum = 0;
    MAPS.forEach(
      (map) => map.style.left = `${map.offsetLeft + (direction === 14 /* camera_left_to_right */ ? -1 : 1) * diff / 3}px`
    );
    requestAnimationFrame(() => moveCamera(direction, 0, currentFrameTimeStamp));
  };
  var launchAnimationAndDeclareItLaunched = (characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId, endOfAnimationCallback) => {
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
        if (APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].current_animation) {
          requestAnimationFrame(animationRequestCallback);
          return;
        }
        APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].current_animation = animationId;
        animationCallback();
      };
      if (APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].current_animation) {
        APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].request_queue.unshift(
          new AnimationRequest(animationId, animationRequestCallback)
        );
        return;
      }
      APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].current_animation = animationId;
    }
    animationCallback();
  };
  var launchCharacterAnimation = (characterElement, throttleNum, extension, spriteBase, spriteIndex, max, min, loop, animationId, endOfAnimationCallback, lastExecutionTimeStamp) => {
    if (gameFinished) {
      return;
    }
    if (!ANIMATION_RUNNING_VALUES[animationId] || ANIMATION_RUNNING_VALUES[animationId] > 1) {
      return;
    }
    const elementAssociatedWithThisAnimation = getAppIdByAnimationId(animationId);
    if (elementAssociatedWithThisAnimation) {
      if (APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].current_animation !== animationId) {
        console.log("there was an error, an animation should not run");
        console.log("current an >" + animationId);
        console.log("registered =>");
        console.log(
          APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].current_animation
        );
        return;
      }
      const requestQueue = APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].request_queue;
      if (requestQueue.length) {
        APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation].current_animation = null;
        initAnimation(animationId);
        const firstQueueElement = requestQueue.pop();
        firstQueueElement == null ? void 0 : firstQueueElement.callBack();
      }
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
          animationId,
          () => {
          },
          lastExecutionTimeStamp
        )
      );
    }
    const newExecutionTimeStamp = Date.now();
    if ((animationId === 1 /* run */ || animationId === 11 /* opponent_attack */) && lastExecutionTimeStamp) {
      const diff = newExecutionTimeStamp - lastExecutionTimeStamp;
      if (diff < ANIMTION_HERO_RUN_DURATION_BETWEEN_FRAMES_IN_MS) {
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
            () => {
            },
            lastExecutionTimeStamp
          )
        );
      }
    }
    throttleNum = 0;
    if (spriteIndex === max) {
      if (loop === false) {
        ANIMATION_RUNNING_VALUES[animationId] = 0;
        const elementAssociatedWithThisAnimation2 = getAppIdByAnimationId(animationId);
        if (elementAssociatedWithThisAnimation2) {
          if (APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation2].current_animation !== animationId) {
            return;
          }
          APP_ELEMENTS_ANIMATION_QUEUE[elementAssociatedWithThisAnimation2].current_animation = null;
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
        () => {
        },
        newExecutionTimeStamp
      )
    );
  };
  var initAnimation = (animationId) => {
    ANIMATION_RUNNING_VALUES[animationId] = 0;
  };
  var initAllAnimations = () => {
    ANIMATION_RUNNING_VALUES[0 /* attack */] = 0;
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    ANIMATION_RUNNING_VALUES[4 /* death */] = 0;
    ANIMATION_RUNNING_VALUES[3 /* hurt */] = 0;
    ANIMATION_RUNNING_VALUES[5 /* idle */] = 0;
    ANIMATION_RUNNING_VALUES[10 /* opponent_run */] = 0;
    ANIMATION_RUNNING_VALUES[13 /* opponent_death */] = 0;
    ANIMATION_RUNNING_VALUES[12 /* opponent_move */] = 0;
    ANIMATION_RUNNING_VALUES[14 /* camera_left_to_right */] = 0;
    ANIMATION_RUNNING_VALUES[15 /* camera_right_to_left */] = 0;
    ANIMATION_RUNNING_VALUES[16 /* character_left_to_right_move */] = 0;
    ANIMATION_RUNNING_VALUES[18 /* transformation_pre_run */] = 0;
    ANIMATION_RUNNING_VALUES[19 /* transformation_run */] = 0;
    ANIMATION_RUNNING_VALUES[20 /* transformation_hurt */] = 0;
    ANIMATION_RUNNING_VALUES[21 /* boss_idle */] = 0;
    ANIMATION_RUNNING_VALUES[22 /* boss_attack */] = 0;
  };
  var turnHeroTransformationOff = () => {
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
    }, 1e3);
    setTimeout(() => {
      epicAudio.play();
    }, 4e3);
    launchHeroRunAnimation();
  };
  var launchAttack = () => {
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
      `assets/${transformed ? "challenge/characters/transformed_hero" : "palace/characters/default_dragor"}/attack`,
      1,
      transformed ? 12 : 6,
      1,
      false,
      0 /* attack */
    );
    const enemyCanBeHit = (enemy) => {
      const enemyLeft = hardMode ? getHardModeEnemyRealLeft(enemy) * 1.2 : enemy.element.getBoundingClientRect().left;
      return enemyLeft > heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width && enemyLeft < heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width + swordReach;
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
      0 /* HERO */,
      setTimeout(() => {
        launchHeroRunAnimation();
      }, 200)
    );
  };
  window.launchAttack = (event) => {
    if (!gameLaunched) {
      launchGame();
      return;
    }
    launchAttack();
  };
  var clearTimeoutAndLaunchNewOne = (timeoutId, timeout) => {
    GAME_TIMEOUTS[timeoutId].forEach((gameTimout) => clearTimeout(gameTimout));
    GAME_TIMEOUTS[timeoutId] = [timeout];
  };
  var launchOpponent = (enemy) => {
    APP_ELEMENTS_ANIMATION_QUEUE.enemy.current_animation = null;
    interruptAnimation(10 /* opponent_run */);
    launchAnimationAndDeclareItLaunched(
      enemy.element.firstChild,
      0,
      "png",
      hardMode ? "assets/challenge/characters/enemies/hard/idle" : "assets/challenge/characters/enemies/black_spirit/run",
      1,
      hardMode ? 16 : 4,
      1,
      true,
      10 /* opponent_run */
    );
    ANIMATION_RUNNING_VALUES[12 /* opponent_move */]++;
    moveEnemy(enemy, 0, Date.now());
  };
  var moveEnemy = (enemy, throttleNum = 0, previousTimeStamp) => {
    if (ANIMATION_RUNNING_VALUES[12 /* opponent_move */] !== 1) {
      return;
    }
    const currentTimeStamp = Date.now();
    const diff = currentTimeStamp - previousTimeStamp;
    if (throttleNum < THROTTLE_NUMS[12 /* opponent_move */]) {
      throttleNum++;
      return requestAnimationFrame(() => {
        moveEnemy(enemy, throttleNum, currentTimeStamp);
      });
    }
    let hardEnemyMoveRatio = 1;
    throttleNum = 0;
    enemy.element.style.left = `${Math.round(
      enemy.element.getBoundingClientRect().left - diff * (hardMode ? 0.33 * hardEnemyMoveRatio : 1)
    )}px`;
    if (hardMode) {
      enemyViewPoint.style.left = `${Math.round(
        enemyViewPoint.getBoundingClientRect().left - diff * (hardMode ? 0.33 : 1)
      )}px`;
    }
    requestAnimationFrame(() => moveEnemy(enemy, throttleNum, currentTimeStamp));
  };
  var transformIfRequired = () => {
    if (rewardStreak >= TRANSFORMATION_THRESHOLD && !transformed) {
      rewardStreak = 0;
      updateTransformationProgressBarDisplay();
      launchTransformation();
    }
  };
  var killRightEnemyAndUpdateScore = (enemy) => {
    killEnemy(enemy);
    rewardHero();
    transformIfRequired();
  };
  var rewardHero = () => {
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
  var updateScoreDisplay = () => {
    scoreContainer.innerHTML = (score * KILLED_ENEMY_REWARD).toString();
  };
  var killWrongEnemy = (enemy) => {
    scoreMalusContainer.style.display = "flex";
    lifePoints.value--;
    checkForHerosDeath();
    updateLifePointsDisplay();
    rewardStreak = 0;
    updateTransformationProgressBarDisplay();
    killEnemy(enemy);
    displayMalus("MALUS! Wrong enemy killed!");
  };
  var displayMalus = (content) => {
    if (currentMalusContainerTimeout) {
      clearTimeout(currentMalusContainerTimeout);
      currentMalusContainerTimeout = null;
    }
    scoreMalusContainer.style.display = "flex";
    currentMalusContainerTimeout = setTimeout(() => {
      scoreMalusDetail.innerHTML = "";
      scoreMalusContainer.style.display = "none";
    }, 2e3);
  };
  var hideMalus = () => {
    hideReward();
    if (currentMalusContainerTimeout) {
      clearTimeout(currentMalusContainerTimeout);
      currentMalusContainerTimeout = null;
    }
    scoreMalusDetail.innerHTML = "";
    scoreMalusContainer.style.display = "none";
  };
  var displayReward = (content) => {
    hideMalus();
    if (currentRewardContainerTimeout) {
      clearTimeout(currentRewardContainerTimeout);
      currentRewardContainerTimeout = null;
    }
    scoreRewardContainer.style.display = "flex";
    currentRewardContainerTimeout = setTimeout(() => {
      scoreRewardDetail.innerHTML = "";
      scoreRewardContainer.style.display = "none";
    }, 2e3);
  };
  var displayTransformationKillReward = (content) => {
    const transformationRewardContainer = document.getElementById(
      "transformed_hero_bonus_reward_container"
    );
    transformationRewardContainer.style.display = "flex";
    if (currentTransformationRewardContainerTimeout) {
      clearTimeout(currentTransformationRewardContainerTimeout);
      currentTransformationRewardContainerTimeout = null;
    }
    currentRewardContainerTimeout = setTimeout(() => {
      transformationRewardContainer.style.display = "none";
    }, REWARD_TIMEOUT_DURATION);
  };
  var hideReward = () => {
  };
  var killEnemy = (enemy) => {
    const launchExplosion = () => {
      bombAudio.play();
      bombAudio.currentTime = 0;
      launchAnimationAndDeclareItLaunched(
        enemy.element.firstChild,
        0,
        "png",
        "assets/challenge/explosion",
        1,
        10,
        1,
        false,
        13 /* opponent_death */
      );
    };
    launchExplosion();
    destroyEnemyAndLaunchNewOne(enemy);
  };
  var getHardModeEnemyRealLeft = (enemy) => {
    const enemyImg = enemy.element;
    return enemyImg.getBoundingClientRect().left + enemyImg.getBoundingClientRect().width * 0.3;
  };
  var clearEnemy = (enemy) => {
    interruptAnimation(10 /* opponent_run */);
    interruptAnimation(11 /* opponent_attack */);
    destroyEnemy(enemy);
  };
  var destroyEnemy = (enemy) => {
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
        interruptAnimation(12 /* opponent_move */);
      }
    });
  };
  var destroyEnemyAndLaunchNewOne = (enemy) => {
    destroyEnemy(enemy);
  };
  var hurtHero = () => {
    if (!heroIsAlive) {
      return;
    }
    runAudio.volume = 0;
    rewardStreak = 0;
    updateTransformationProgressBarDisplay();
    heroHurt = true;
    lifePoints.value--;
    checkForHerosDeath();
    updateLifePointsDisplay();
    launchHeroHurtAnimation();
    displayMalus("Malus! You were hurt!");
  };
  var checkForHerosDeath = () => {
    if (lifePoints.value === 0) {
      killHero();
    }
  };
  var killHero = () => {
    runAudio.volume = 0;
    heroIsAlive = false;
    launchDeathAnimation();
  };
  var viewPointOnScreen = false;
  var enemyViewPointThresholdCrossed = false;
  var detectCollision = () => {
    ennemiesOnScreen.forEach((enemyOnScreen) => {
      const enemyLeft = hardMode ? getHardModeEnemyRealLeft(enemyOnScreen) : enemyOnScreen.element.getBoundingClientRect().left;
      if (hardMode && !viewPointOnScreen && enemyLeft < window.innerWidth) {
        viewPointOnScreen = true;
        enemyViewPoint.style.display = "flex";
      }
      if (hardMode && !heroInTheRedZone && enemyViewPoint.getBoundingClientRect().left + enemyViewPoint.getBoundingClientRect().width < heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width) {
        heroInTheRedZone = true;
        updateEnemyViewPointDisplay();
        launchAnimationAndDeclareItLaunched(
          enemyOnScreen.element.firstChild,
          0,
          "png",
          "assets/challenge/characters/enemies/hard/attack",
          1,
          30,
          1,
          true,
          11 /* opponent_attack */
        );
      }
      if (hardMode && !enemyViewPointThresholdCrossed && enemyLeft < window.innerWidth) {
        enemyViewPointThresholdCrossed = true;
      }
      if (heroContainer.getBoundingClientRect().left + heroContainer.getBoundingClientRect().width > enemyLeft && enemyOnScreen.collideable) {
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
  var launchHeroRunAnimation = () => {
    if (!heroIsAlive) {
      return;
    }
    runAudio.volume = 0.7;
    launchAnimationAndDeclareItLaunched(
      heroImage,
      0,
      "png",
      `assets/${transformed ? "challenge/characters/transformed_hero" : "palace/characters/default_dragor"}/run`,
      1,
      transformed ? 6 : 8,
      1,
      true,
      transformed ? 19 /* transformation_run */ : 1 /* run */
    );
  };
  var launchRun = () => {
    if (runStopped) {
      return;
    }
    if (ANIMATION_RUNNING_VALUES[14 /* camera_left_to_right */] === 0) {
      startCamera();
      moveCamera(14 /* camera_left_to_right */, 0, Date.now());
    }
    launchHeroRunAnimation();
  };
  var heroInitialTop = heroContainer.getBoundingClientRect().top;
  document.addEventListener("keydown", (event) => {
    if (event.key === "d") {
      if (!gameLaunched) {
        launchGame();
      } else if (ANIMATION_RUNNING_VALUES[1 /* run */] === 0) {
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
  var clearGameTimeouts = () => {
    GAME_TIMEOUTS[0 /* HERO */].forEach((timeout) => {
      clearTimeout(timeout);
    });
    GAME_TIMEOUTS[0 /* HERO */] = [];
    GAME_TIMEOUTS[1 /* ENEMY */].forEach((timeout) => clearTimeout(timeout));
    GAME_TIMEOUTS[1 /* ENEMY */] = [];
  };
  var stopRun = () => {
    if (heroInTheRedZone) {
      return;
    }
    runAudio.volume = 0;
    runStopped = true;
    if (enemiesComingTimeout) {
      clearTimeout(enemiesComingTimeout);
      enemiesComingTimeout = null;
    }
    ANIMATION_RUNNING_VALUES[12 /* opponent_move */] = 0;
    interruptAnimation(14 /* camera_left_to_right */);
    const stopCallback = () => {
      heroImage.src = "assets/challenge/characters/hero/walk/1.png";
    };
    addAnimationCallbackToQueue(6 /* stop */, stopCallback);
  };
  var addAnimationCallbackToQueue = (animation, callBack) => {
    const appElementId = getAppIdByAnimationId(animation);
    if (!appElementId) {
      return;
    }
    APP_ELEMENTS_ANIMATION_QUEUE[appElementId].request_queue.unshift(
      new AnimationRequest(animation, callBack)
    );
  };
  var interruptAnimation = (animation) => {
    ANIMATION_RUNNING_VALUES[animation] = 0;
    const appElementId = getAppIdByAnimationId(animation);
    if (!appElementId) {
      return;
    }
    if (!APP_ELEMENTS_ANIMATION_QUEUE[appElementId].current_animation === null) {
      APP_ELEMENTS_ANIMATION_QUEUE[appElementId].current_animation = null;
    }
  };
  var resumeRun = () => {
    runStopped = false;
    launchRun();
    ennemiesOnScreen.forEach((enemy) => {
      ANIMATION_RUNNING_VALUES[12 /* opponent_move */]++;
      moveEnemy(enemy, 0, Date.now());
    });
    if (!ennemiesOnScreen.length) {
      triggerOpponentsApparition();
    }
  };
  var checkForOpponentsClearance = () => {
    ennemiesOnScreen.forEach((enemyOnScreen) => {
      const enemyLeft = hardMode ? getHardModeEnemyRealLeft(enemyOnScreen) : enemyOnScreen.element.getBoundingClientRect().left;
      if (enemyLeft < 0 - window.innerWidth * 0.25) {
        clearEnemy(enemyOnScreen);
      }
    });
    requestAnimationFrame(checkForOpponentsClearance);
  };
  var launchInvisibilityToggle = () => {
    invisible = !invisible;
    heroContainer.style.opacity = invisible ? "0.3" : "1";
    if (invisible) {
      const teleportAudio = document.getElementById(
        "teleport_audio"
      );
      teleportAudio.volume = 0.15;
      teleportAudio.play().then((val) => teleportAudio.currentTime = 0);
    }
    if (!invisible) {
      return;
    }
    setTimeout(launchInvisibilityToggle, INVISIBILITY_DURATION_IN_MILLISECONDS);
  };
  window.launchInvisibilityToggle = launchInvisibilityToggle;
  var launchTransformation = () => {
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
      setTimeout(() => transformedEpicAudio.play(), 1e3);
      setTimeout(() => electricityAudio.play(), 200);
      document.getElementById("transformation_background").style.display = "none";
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
        19 /* transformation_run */
      );
      setTimeout(turnHeroTransformationOff, 2e4);
      return;
    }
    document.getElementById("transformation_background").style.display = "flex";
    preTransformed = true;
    clearEnemiesInstantly();
    bassAudio.play();
    setTimeout(() => electricityAudio.play(), 200);
    clearTimeoutAndLaunchNewOne(
      0 /* HERO */,
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
          18 /* transformation_pre_run */
        );
        if (enemiesComingTimeout) {
          clearTimeout(enemiesComingTimeout);
        }
        clearTimeoutAndLaunchNewOne(
          0 /* HERO */,
          setTimeout(() => {
            triggerOpponentsApparition();
            document.getElementById("transformation_background").style.display = "none";
            transformationScreamAudio.play();
            setTimeout(() => transformedEpicAudio.play(), 1e3);
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
              19 /* transformation_run */
            );
            setTimeout(turnHeroTransformationOff, 15e3);
          }, 5e3)
        );
      }, 500)
    );
  };
  var clearEnemiesInstantly = () => {
    ennemiesOnScreen.forEach((enemy, index) => {
      enemy.element.remove();
      ennemiesOnScreen.splice(index, 1);
      interruptAnimation(12 /* opponent_move */);
    });
  };
  var lightUpAnswerDataContainer = () => {
    answerDataContainer.style.opacity = "1";
  };
  var clearAndHideAnswerDataContainer = () => {
    answerDataContainer.style.opacity = "1";
    answerDataValue.innerHTML = "";
  };
  var launchSwordSlash = () => {
    ANIMATION_RUNNING_VALUES[17 /* hero_sword_slash */]++;
    if (ANIMATION_RUNNING_VALUES[17 /* hero_sword_slash */] !== 1 || transformed) {
      return;
    }
    ANIMATION_RUNNING_VALUES[17 /* hero_sword_slash */]++;
    console.log("slash!");
    swordSlashImg.style.display = "flex";
    setTimeout(() => {
      swordSlashImg.style.display = "none";
      ANIMATION_RUNNING_VALUES[17 /* hero_sword_slash */] = 0;
    }, 75);
  };
  var launchDeathAnimation = () => {
    initHeroAnimations();
    ANIMATION_RUNNING_VALUES[14 /* camera_left_to_right */] = 0;
    APP_ELEMENTS_ANIMATION_QUEUE.hero.current_animation = null;
    APP_ELEMENTS_ANIMATION_QUEUE.hero.request_queue = [];
    const killHero2 = () => {
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
      clearGameTimeouts();
      setTimeout(
        () => window.location.href = hardMode ? "http://localhost:3001/dead_hard" : "http://localhost:3001/dead",
        1e3
      );
    };
    if (transformed) {
      transformed = false;
    }
    heroImage.src = "assets/challenge/characters/hero/death/1.png";
    setTimeout(killHero2, 1e3);
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
      transformed ? 20 /* transformation_hurt */ : 3 /* hurt */
    );
    if (!hardMode) {
      stopCamera();
    }
    clearTimeoutAndLaunchNewOne(
      0 /* HERO */,
      setTimeout(() => {
        heroHurt = false;
        if (heroIsAlive && ANIMATION_RUNNING_VALUES[1 /* run */] === 0) {
          launchRun();
        }
      }, 500)
    );
  };
  var stopCamera = () => {
    ANIMATION_RUNNING_VALUES[14 /* camera_left_to_right */] = 0;
  };
  var startCamera = () => {
    if (ANIMATION_RUNNING_VALUES[14 /* camera_left_to_right */] > 0) {
      return;
    }
    ANIMATION_RUNNING_VALUES[14 /* camera_left_to_right */]++;
  };
  var initHeroAnimations = () => {
    ANIMATION_RUNNING_VALUES[1 /* run */] = 0;
    ANIMATION_RUNNING_VALUES[18 /* transformation_pre_run */] = 0;
    ANIMATION_RUNNING_VALUES[19 /* transformation_run */] = 0;
    ANIMATION_RUNNING_VALUES[3 /* hurt */] = 0;
  };
  window.onload = () => {
    setupListeners();
    launchHardModeToggle();
    setHeroClass();
    backgroundSrc = `assets/palace/maps/castle/${hardMode ? "castleback.webp" : "castle.gif"}`;
    MAPS.push(createMapBlock(0));
    MAPS.push(createMapBlock(100));
    createGameAccordingToMode();
    updateLifePointsDisplay();
    updateScoreDisplay();
    detectCollision();
    checkForScreenUpdateFromLeftToRight(10);
    checkForOpponentsClearance();
    defineCurrentSubject(hardMode ? STATS : Mike_memory_09_08);
    defineSwordReach();
    updateTransformationProgressBarDisplay();
    if (hardMode) {
      epicAudio.play();
    } else {
      fireBackgroundAudio.play();
    }
  };
  var setupListeners = () => {
    var _a, _b;
    (_a = document.getElementById("playAgainLink")) == null ? void 0 : _a.addEventListener("click", (event) => window.location.reload());
    (_b = document.getElementById("backToStormGradButton")) == null ? void 0 : _b.addEventListener("click", goBackToMountain);
  };
  var createGameAccordingToMode = () => {
    if (hardMode) {
      return;
    }
    progressBar.style.display = "flex";
    epicAudio = document.getElementById(
      hardMode ? "hard_epic_audio" : "epic_audio"
    );
    epicAudio.volume = hardMode ? 1 : 0.22;
  };
  var launchHardModeToggle = () => {
    const modeParameter = getUrlParameter("mode");
    if (!modeParameter) {
      console.log("there is no mode parameter");
      return;
    }
    hardMode = modeParameter === "hard";
  };
  var getTransformationProgressValue = () => {
    return Math.floor(rewardStreak / TRANSFORMATION_THRESHOLD * 100);
  };
  var updateTransformationProgressBarDisplay = () => {
    const progress = document.querySelector(".progress");
    progress.style.setProperty(
      "--progress",
      `${getTransformationProgressValue()}%`
    );
  };
  var defineSwordReach = () => {
    swordReach = window.innerWidth * (window.innerWidth > 1e3 ? 0.15 : 0.35);
  };
  var launchGame = () => {
    runAudio.play();
    if (!hardMode) {
      epicAudio.play();
    }
    gameLaunched = true;
    launchRun();
    triggerOpponentsApparition();
  };
  var defineCurrentSubject = (subject) => {
    currentSubject = subject;
    currentSubjectTotal = currentSubject.good.length + currentSubject.bad.length;
  };
  var killAllAudios = () => {
    runAudio.pause();
    epicAudio.pause();
    transformedEpicAudio.pause();
  };
})();
//# sourceMappingURL=challenge_guardians.js.map
