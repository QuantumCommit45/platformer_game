const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Player
const player = {
    x: 400,
    y: 300,
    width: 32,
    height: 60,
    speed: 15,
    ySpeed: -10,
};

// Keyboard input
const keys = {};

document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

// Update player
function update() {
    player.y += player.ySpeed;
    if (player.ySpeed < 20) player.ySpeed += 1;
    if (keys["w"]) player.ySpeed = -10;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
}

// Draw everything
function draw() {
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillStyle = "yellow";
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
}

// Game loop
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
