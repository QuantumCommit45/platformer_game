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

const mapSize = 512;
const blockSize = 50;
const bottom_floor = 0;

const sky = new Image();
sky.src = "https://minecraft.wiki/images/Day_sky.png"

const dirt = new Image();
dirt.src = "https://minecraft.wiki/images/BlockSprite_dirt.png"
const grass = new Image();
grass.src = "https://minecraft.wiki/images/BlockSprite_grass-block.png"

const blocks = Array.from({length: mapSize},() => Array(mapSize).fill(false));

for (let i = 0; i < Math.floor(mapSize ** 2 / 100); i++) {
    let a = Math.floor(Math.random() * (mapSize - 2));
    let b = Math.floor(Math.random() ** 2 * mapSize/2 + mapSize/2);

    blocks[a][b] = true;
    blocks[a+1][b] = true;
    blocks[a+2][b] = true;
}

const offset = 400 - player.width / 2;

var mouseX = 0;
var mouseY = 0;

document.addEventListener("keydown", (event) => {keys[event.key.toLowerCase()] = true;});

document.addEventListener("keyup", (event) => {keys[event.key.toLowerCase()] = false;});

document.addEventListener("mousedown", (event) => {keys[event.button] = true;});

document.addEventListener("mouseup", (event) => {keys[event.button] = false;});

document.addEventListener("mousemove", (event) => {mouseX = event.clientX; mouseY = event.clientY;});

document.addEventListener(
    "contextmenu", (event) => {
        if (event.clientX < 810 && event.clientY < 610) {
            event.preventDefault();
        }
    }
);

let yOffset = 0;


// Convert world X to block X
function worldToBlockX(x) {return Math.floor(x / blockSize) + mapSize / 2;}

// Convert world Y to block Y
function worldToBlockY(y) {return Math.floor(y / blockSize) + mapSize / 2;}


function clickPos(change) {
    let x = Math.floor((mouseX - 10 + player.x - offset) / blockSize) + mapSize / 2;

    // Screen Y increases downward, world Y increases upward
    let worldY = player.y - (mouseY - yOffset - 10);

    let y = Math.floor(worldY / blockSize) + mapSize / 2;

    if (x >= 0 &&x < mapSize &&y >= 0 &&y < mapSize) {
        blocks[x][y] = change;
    }
}


function isGrounded() {
    let bottom = player.y;
    let x = worldToBlockX(player.x + player.width / 2);
    let y = worldToBlockY(bottom - 1);
    if (x<0||x>=mapSize||y>=mapSize) return false;
    if (bottom <= bottom_floor) return true;
    return !!blocks[x][y];
}

function snapToPlatform() {
    let bottom = player.y;
    let x = worldToBlockX(player.x + player.width / 2);
    let y = worldToBlockY(bottom - 1);
    if (bottom <= bottom_floor) { player.y = bottom_floor; return; }
    if (x>=0 && x<mapSize && y<mapSize && blocks[x][y]) {
        player.y = (y - mapSize / 2) * blockSize + blockSize;
    }
}


function outOfBounds() {
    const mapHalfWidth = mapSize * blockSize / 2;

    if (player.x + player.width > mapHalfWidth) return true;
    if (player.x < -mapHalfWidth) return true;
    return false;
}

function verticalCollision(){
    let oldY = player.y;
    player.y += player.ySpeed;
    let y = worldToBlockY(player.y - 1);
    let blockTop= (y - mapSize / 2) * blockSize+ blockSize
    let x = worldToBlockX(player.x + player.width / 2);
    if (player.ySpeed < 0&&oldY>blockTop&&player.y<=blockTop&&blocks[x][y]) {player.ySpeed = 0; player.y=blockTop}
}

function horizontalCollision(moveDir) {
    if (moveDir === 0) return;

    let yBottom = worldToBlockY(player.y + 2);
    let yTop = worldToBlockY(player.y + player.height - 2);

    if (moveDir > 0) {
        let x = worldToBlockX(player.x + player.width);
        for (let y of [yTop, yBottom]) {
            if (x>=0 && x<mapSize && y>=0 && y<mapSize && blocks[x][y]) {
                let blockLeft = (x - mapSize/2) * blockSize;
                player.x = blockLeft - player.width;
            }
        }
    } else {
        let x = worldToBlockX(player.x);
        for (let y of [yTop, yBottom]) {
            if (x>=0 && x<mapSize && y>=0 && y<mapSize && blocks[x][y]) {
                let blockRight = (x - mapSize/2) * blockSize + blockSize;
                player.x = blockRight;
            }
        }
    }
}


function mapBounds(){
    if (outOfBounds()) {
        if (player.x + player.width > mapSize * blockSize / 2) {
            player.x = mapSize * blockSize / 2 - player.width;
        }

        if (player.x < -(mapSize * blockSize / 2)) {
            player.x = -(mapSize * blockSize / 2);
        }
    }
}

function gravity(){
    player.ySpeed -= 1;
    if (player.ySpeed < -25) {
        player.ySpeed = -25;
    }
}

// Update player
function update() {

    gravity(); 
    verticalCollision(); //vertical collision

    // Jump
    let grounded = isGrounded();
    if (grounded) snapToPlatform();
    if (grounded && keys["w"]) player.ySpeed = 25;
    // Horizontal movement
    let moveDir = 0;
    if (keys["a"]) { player.x -= player.speed; moveDir = -1; }
    if (keys["d"]) { player.x += player.speed; moveDir = 1; }

    if (keys[0]) {clickPos(true);}
    if (keys[2]) {clickPos(false);}

    horizontalCollision(moveDir);

    mapBounds(); // Keep player inside horizontal map boundaries
    }

    /* Respawn
    if (player.y < -1000) {
        player.x = 0;
        player.y = 0;
        player.ySpeed = 0;
    }
    */


// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sky,0,-600,800,1200);
    // Camera
    yOffset = ((300 +600-player.y) +Math.sqrt((300 + player.y-600) ** 2+500)) / 2;

    // Player
    ctx.fillStyle = "cyan";

    ctx.fillRect(
        offset,
        yOffset-player.height,
        player.width,
        player.height
    );

    // Blocks
    ctx.fillStyle = "green";

    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {

            if (blocks[i][j] !== true) continue;
            texture = dirt
            if (blocks[i][j+1] !== true) texture = grass;

            // Convert block coordinates into world coordinates
            let worldX = (i - mapSize / 2) * blockSize;

            let worldY = (j - mapSize / 2) * blockSize;

            // Convert world coordinates to screen coordinates
            let screenX = worldX + offset - player.x;

            let screenY = yOffset - worldY + player.y - blockSize;

            ctx.drawImage(
                texture,
                screenX,
                screenY,
                blockSize,
                blockSize
            )
        }
    }

    drawCoordinates();
}

function drawCoordinates(){
    ctx.fillStyle = "blue"
    ctx.font = "30px Garamond"; 
    ctx.fillText((player.x/blockSize).toFixed(1)+" , "+(player.y/blockSize).toFixed(1), 10, 30);
}

// Game loop
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();

