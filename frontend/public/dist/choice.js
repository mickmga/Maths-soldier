"use strict";
const canvas = document.getElementById("spriteCanvas");
const ctx = canvas.getContext("2d");
const spriteSheet = new Image();
spriteSheet.src = "assets/palace/characters/premium.png"; // Update this to the correct path
const spriteWidth = 64; // Width of a single frame
const spriteHeight = 64; // Height of a single frame
const numCols = 13; // Number of columns in your sprite sheet
const walkRow = 11; // The 11th row (0-indexed) is the walk animation
const numFrames = 8; // Number of frames in the walk animation
let frameIndex = 0;
const fps = 10;
const frameDuration = 1000 / fps;
const startCol = 1; // Start from the second column (0-indexed)
let isAnimating = false; // Animation state
function drawFrame(frameIndex, x, y) {
    const col = (frameIndex + startCol) % numCols;
    const sx = col * spriteWidth;
    const sy = walkRow * spriteHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(spriteSheet, sx, sy, spriteWidth, spriteHeight, // Source rectangle
    x, y, spriteWidth, spriteHeight // Destination rectangle
    );
}
function animate() {
    if (!isAnimating)
        return; // Stop animation if not animating
    setTimeout(() => {
        frameIndex = (frameIndex + 1) % numFrames;
        drawFrame(frameIndex, 96, 96); // Character stays at (96, 96)
        requestAnimationFrame(animate);
    }, frameDuration);
}
// Event listeners for keydown and keyup
window.addEventListener("keydown", (e) => {
    if (e.key === "d") {
        if (!isAnimating) {
            isAnimating = true;
            animate(); // Start animation when "d" is pressed
        }
    }
});
window.addEventListener("keyup", (e) => {
    if (e.key === "d") {
        isAnimating = false; // Stop animation when "d" is released
    }
});
spriteSheet.onload = function () {
    drawFrame(frameIndex, 96, 96); // Draw the initial frame
};
