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


const mapSize = 64;
const blocks = Array.from({length: mapSize}, () => Array(mapSize).fill(false));
for (let i = 0; i < Math.floor(mapSize**2/50); i++) {
    let a = Math.floor((Math.random())*(mapSize-2));
    let b = Math.floor(Math.random()**2*mapSize);
    console.log(a,b)
    blocks[a][b] = true;
    blocks[a+1][b] = true;
    blocks[a+2][b] = true;
}
const offset = 400-player.width/2

document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

const inRange = (num, min, max) => num >= min && num <= max;

function inPlatform() {
    if (player.y+player.height > canvas.height) return true;
    let x = Math.floor((player.x+player.width/2)/50);
    let y = Math.floor((player.y+player.height-50)/-50)+11;
    try {
        if (blocks[x+mapSize/2][y] == true) return true;
    }
    catch (error) {}
}

// Update player
function update() {
    if (inPlatform() && player.ySpeed >= 0) player.ySpeed = 0
    player.y += player.ySpeed;
    if (player.ySpeed < 25) player.ySpeed += 1;
    if (inPlatform() && keys["w"]) player.ySpeed = -25;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
    if (player.y >= 1000) {
        player.x = 400;
        player.y = 300;
        player.ySpeed = 0;
    }
}

// Draw everything
function draw() {
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillStyle = "yellow";
    yOffset = ((200+player.y)+((200-player.y)**2+500)**0.5)/2
    ctx.fillRect(
        offset,
        yOffset,
        player.width,
        player.height
    );
    ctx.fillStyle = "black";
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            if (blocks[i][j] != true) continue;
            ctx.fillRect(
                i*50+offset-player.x-mapSize*25,
                550+j*-50+yOffset-player.y,
                51,
                51
            );
        }
    }
}

// Game loop
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
