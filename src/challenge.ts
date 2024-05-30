window.onload = () => {

}

class Background {
    left:string = '0vw';
}

const moveCamera = () => {
    const gameContainer = document.getElementById('gameContainer')!
    gameContainer.style.left = `${gameContainer.offsetLeft - 5}px`;
    alert("update container left")

}

document.addEventListener("keydown",
    (event) => moveCamera()
)