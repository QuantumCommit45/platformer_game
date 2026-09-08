const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Player
const player = {
    x: 0,
    y: 0,
    width: 30,
    height: 50,
    speed: 15,
    ySpeed: 0,
};

// Keyboard input
const keys = {};

const mapSize = 256;
const blockSize = 50;
const bottom_floor = 0;

const blocks = Array.from({length: mapSize},() => Array(mapSize).fill(false));

for (let i = 0; i < Math.floor(mapSize ** 2 / 50); i++) {
    let a = Math.floor(Math.random() * (mapSize - 2));
    let b = Math.floor(Math.random() ** 2 * mapSize);

    blocks[a][b] = true;
    blocks[a+1][b] = true;
    blocks[a+2][b] = true;
}

const offset = 400 - player.width / 2;

document.addEventListener("keydown", (event) => {keys[event.key.toLowerCase()] = true;});

document.addEventListener("keyup", (event) => {keys[event.key.toLowerCase()] = false;});

document.addEventListener("click", (event) => {clickPos(event.clientX, event.clientY);});

let yOffset = 0;


// Convert world X to block X
function worldToBlockX(x) {return Math.floor(x / blockSize) + mapSize / 2;}

// Convert world Y to block Y
function worldToBlockY(y) {return Math.floor(y / blockSize) + mapSize / 2;}


function clickPos(mouseX, mouseY) {
    let x = Math.floor((mouseX - 10 + player.x - offset) / blockSize) + mapSize / 2;

    // Screen Y increases downward, world Y increases upward
    let worldY = player.y - (mouseY - yOffset - 10);

    let y = Math.floor(worldY / blockSize) + mapSize / 2;

    if (x >= 0 &&x < mapSize &&y >= 0 &&y < mapSize) {
        blocks[x][y] = !blocks[x][y];
    }
}


function inPlatform() {
    // Bottom of player in world coordinates
    let bottom = player.y;

    let x = worldToBlockX(player.x + player.width / 2);
    let y = worldToBlockY(bottom - 1);
    if (x<0||x>=mapSize||y>=mapSize) return false;
    if (bottom <= bottom_floor) {player.y = bottom_floor; return true;}
    if (blocks[x][y]) {player.y = (y - mapSize / 2) * blockSize+blockSize; return true;}
    return false;
}


function horizontalCollision() {
    const mapHalfWidth = mapSize * blockSize / 2;

    if (player.x + player.width > mapHalfWidth) return true;
    if (player.x < -mapHalfWidth) return true;
    return false;
}


// Update player
function update() {

    // Gravity
    player.ySpeed -= 1;

    if (player.ySpeed < -25) {
        player.ySpeed = -25;
    }

    // Vertical movement

    let oldY = player.y;
    player.y += player.ySpeed;
    let y = worldToBlockY(player.y - 1);
    let blockTop= (y - mapSize / 2) * blockSize+ blockSize
    let x = worldToBlockX(player.x + player.width / 2);
    if (player.ySpeed < 0&&oldY>blockTop&&player.y<=blockTop&&blocks[x][y]) {player.ySpeed = 0; player.y=blockTop}

    // Stop falling when standing on a platform
    //if (inPlatform() && player.ySpeed < 0) player.ySpeed = 0;

    // Jump
    if (inPlatform() && keys["w"]) player.ySpeed = 25;

    

    // Horizontal movement
    if (keys["a"]) player.x -= player.speed;

    if (keys["d"]) player.x += player.speed;

    // Keep player inside horizontal map boundaries
    if (horizontalCollision()) {
        if (player.x + player.width > mapSize * blockSize / 2) {
            player.x = mapSize * blockSize / 2 - player.width;
        }

        if (player.x < -(mapSize * blockSize / 2)) {
            player.x = -(mapSize * blockSize / 2);
        }
    }

    /* Respawn
    if (player.y < -1000) {
        player.x = 0;
        player.y = 0;
        player.ySpeed = 0;
    }
    */
}


// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Camera
    yOffset =((200 - player.y) +Math.sqrt((200 + player.y) ** 2)) / 2;

    // Player
    ctx.fillStyle = "yellow";

    ctx.fillRect(
        offset,
        yOffset-player.height,
        player.width,
        player.height
    );

    // Blocks
    ctx.fillStyle = "black";

    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {

            if (blocks[i][j] !== true) continue;

            // Convert block coordinates into world coordinates
            let worldX = (i - mapSize / 2) * blockSize;

            let worldY = (j - mapSize / 2) * blockSize;

            // Convert world coordinates to screen coordinates
            let screenX = worldX + offset - player.x;

            let screenY = yOffset - worldY + player.y - blockSize;

            ctx.fillRect(
                screenX,
                screenY,
                blockSize + 1,
                blockSize + 1
            );
        }
    }

    drawCoordinates();
}

function drawCoordinates(){
    ctx.fillStyle = "blue"
    ctx.fillText(player.x+","+player.y, 10, 20);
}

// Game loop
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();

