"use strict";
window.onload = () => {
};
class Background {
    constructor() {
        this.left = '0vw';
    }
}
const moveCamera = () => {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.style.left = `${gameContainer.offsetLeft - 5}px`;
    alert("update container left");
};
document.addEventListener("keydown", (event) => moveCamera());
