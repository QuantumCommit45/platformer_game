const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Player
const player = {
    x: 400,
    y: 300,
    width: 32,
    height: 60,
    speed: 15,
    ySpeed: 0,
};

// Keyboard input
const keys = {};

const platforms = [[0,350,400,400],[300,550,800,600]];

document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

const inRange = (num, min, max) => num >= min && num <= max;

function inPlatform() {
    let x = player.x+player.width/2
    let y = player.y+player.height
    for (let i = 0; i < platforms.length; i++) {
        platform = platforms[i];
        if (inRange(x, platform[0], platform[2])) {
            return(inRange(y, platform[1], platform[3]))
        }
    }
}

// Update player
function update() {
    if (inPlatform() && player.ySpeed >= 0) player.ySpeed = 0
    player.y += player.ySpeed;
    if (player.ySpeed < 20) player.ySpeed += 1;
    if (inPlatform() && keys["w"]) player.ySpeed = -25;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
    if (player.y+player.height > canvas.height) player.y = canvas.height-player.height, player.ySpeed = 0;
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
    ctx.fillStyle = "black";
    for (let i = 0; i < platforms.length; i++) {
        ctx.fillRect(
            platforms[i][0],
            platforms[i][1],
            platforms[i][2]-platforms[i][0],
            platforms[i][3]-platforms[i][1]
        );
    }
}

// Game loop
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
