const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Player
const player = {
    x: 0,
    y: 3000,
    width: 30,
    height: 50,
    speed: 15,
    ySpeed: 0,
};

var frame = 0;

// Keyboard input
const keys = {};
const mouse = {};


const mapSize = 512;
const blockSize = 50;
const bottom_floor = 0;
const seaFloor = 50;

const sky = new Image();
sky.src = "https://minecraft.wiki/images/Day_sky.png"

const blockTypes = [
    ["dirt","grass-block","cobblestone","oak-planks","birch-planks",
        "oak-log","obsidian","stone","lava","oak-leaves",
        "gravel"],
    ["short-grass","allium","azure-bluet","blue-orchid","cornflower",
        "dandelion","lily-of-the-valley","oxeye-daisy","poppy","orange-tulip",
        "pink-tulip","red-tulip","white-tulip"],
    ["seagrass","flowing-water","stationary-water"],
    ["bedrock"],
    ["coal-ore", "iron-ore", "copper-ore", "gold-ore", "redstone-ore", "lapis-lazuli-ore", "diamond-ore", "emerald-ore"]];

const textures = Array(300).fill()

for (let i = 0; i < blockTypes[0].length; i++) {
    textures[i+1] = new Image;
    textures[i+1].src = "https://minecraft.wiki/images/BlockSprite_"+blockTypes[0][i]+".png";
}
for (let i = 0; i < blockTypes[1].length; i++) {
    textures[i+100] = new Image;
    textures[i+100].src = "https://minecraft.wiki/images/BlockSprite_"+blockTypes[1][i]+".png";
}
for (let i = 0; i < blockTypes[2].length; i++) {
    textures[i+200] = new Image;
    textures[i+200].src = "https://minecraft.wiki/images/BlockSprite_"+blockTypes[2][i]+".png";
}
for (let i = 0; i < blockTypes[3].length; i++) {
    textures[i+900] = new Image;
    textures[i+900].src = "https://minecraft.wiki/images/BlockSprite_"+blockTypes[3][i]+".png";
}
for (let i = 0; i < blockTypes[4].length; i++) {
    textures[i+400] = new Image;
    textures[i+400].src = "https://minecraft.wiki/images/BlockSprite_"+blockTypes[4][i]+".png";
}
console.log(textures);
textures.forEach((texture, block) => {
    if (texture) {
        texture.onload = () => {
            let slot = document.querySelector(`.slot[data-block="${block}"]`);

            if (slot) {
                slot.style.backgroundImage = `url(${texture.src})`;
            }
        };

        if (texture.complete) {
            let slot = document.querySelector(`.slot[data-block="${block}"]`);

            if (slot) {
                slot.style.backgroundImage = `url(${texture.src})`;
            }
        }
    }
});

const blocks = Array.from({length: mapSize},() => Array(mapSize).fill(0));

const gradients = Array(Math.floor(mapSize/20+2))
for (let i = 0; i < Math.floor(mapSize/20+2); i++) {
    gradients[i] = Math.random()*2-1;
}
gradients[0] = 1;
gradients[Math.floor(mapSize/40+1)] *= .001;
gradients[Math.floor(mapSize/40+1)] *= .001;
gradients[Math.floor(mapSize/20+2)] = -1;

let caveX = 0;
let caveY = mapSize / 2 + 30;
for (let i = 0; i < mapSize; i++) {
    let pos = i%20/20;
    let left = Math.floor(i/20);
    let a0 = pos*gradients[left];
    let a1 = (1-pos)*gradients[left+1];
    let elev = a0+(3*pos**2-2*pos**3)*(a1-a0)
    
    elev = Math.floor(elev*40+50+mapSize/2);
    for (let j = mapSize/2; j<=elev; j++) {
        blocks[i][j] = 8;
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/10000) blocks[i][j] = 9;
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/500) blocks[i][j] = 400;
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/2000) blocks[i][j] = 401;
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/5000) blocks[i][j] = 402;
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/5000) blocks[i][j] = 403; //LOTS OF ORES
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/5000) blocks[i][j] = 404;
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/5000) blocks[i][j] = 405;
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/5000) blocks[i][j] = 406;
        if (j<elev-10 && Math.random()<(-j+mapSize/2+100)/5000) blocks[i][j] = 407;
        
    }
    //Make caves
    if (caveX >= 1 && caveX < mapSize-1 && caveY >= mapSize/2+1 && caveY < mapSize-1){
        if (caveY!=256){blocks[caveX + 1][caveY] = 0; blocks[caveX - 1][caveY] = 0;}
        if (caveY+1!=256){blocks[caveX][caveY + 1] = 0;}
        if (caveY-1!=256){blocks[caveX][caveY -1] = 0;}

        caveX += coinFlip();
        if (Math.random() < 0.4) {
        caveY += coinFlip();
        }
    }

    //Maybe make another cave
    if (Math.random() < 0.05) {
    caveX = i;
    caveY = elev-((Math.floor(Math.random() * 50))+10);
    }
    placeSeabed(i,elev+1,1,11);
    placeSeabed(i,elev+2,1,11);
    placeSeabed(i,elev+3,1,11);
    placeSeabed(i,elev+4,2,11);
    foliage(i,elev+5)
    for (let j = elev+6; j<seaFloor+mapSize/2; j++) {
        blocks[i][j] = 201;
    }
    blocks[i][256] = 900;

}

function coinFlip(){
    let coin = Math.round(Math.random());
    if (coin == 0){return -1;}
    else{return 1;}
}



function placeSeabed(x,y,upper,lower) {
    if (y<seaFloor+mapSize/2) {blocks[x][y] = lower;}
    else {blocks[x][y] = upper;}
}

const offset = 400 - player.width / 2;

var mouseX = 0;
var mouseY = 0;

var breakingX = 0;
var breakingY = 0;
var breakingTime = 1.0;


document.addEventListener("keydown", (event) => {keys[event.key.toLowerCase()] = true;});

document.addEventListener("keyup", (event) => {keys[event.key.toLowerCase()] = false;});

document.addEventListener("mousedown", (event) => {mouse[event.button] = true;});

document.addEventListener("mouseup", (event) => {mouse[event.button] = false;});

document.addEventListener("mousemove", (event) => {mouseX = event.clientX; mouseY = event.clientY;});

document.addEventListener(
    "contextmenu", (event) => {
        if (event.clientX < 810 && event.clientY < 610) {
            event.preventDefault();
        }
    }
);

let yOffset = 0;

function foliage(x,y) {
    if (!checkBox(x,y,1,1)) return;
    if (y<seaFloor+mapSize/2) {
        if (Math.random()<.5) blocks[x][y] = 200;
        else blocks[x][y] = 201;
        return;
    }
    let num = Math.random()
    if (num < .2) makeTree(x,y);
    else if (num < .4) blocks[x][y] = 100;
    else if (num < .5) blocks[x][y] = 100+Math.floor(Math.random()*12);
}

function makeTree(x,y) {
    if (checkBox(x,y,1,3) && checkBox(x-2,y+2,5,5)) {
        blocks[x][y] = 6;
        blocks[x][y+1] = 6;
        blocks[x-2][y+2] = 10;
        blocks[x-1][y+2] = 10;
        blocks[x][y+2] = 6;
        blocks[x+1][y+2] = 10;
        blocks[x+2][y+2] = 10;
        blocks[x-2][y+3] = 10;
        blocks[x-1][y+3] = 10;
        blocks[x][y+3] = 6;
        blocks[x+1][y+3] = 10;
        blocks[x+2][y+3] = 10;
        blocks[x-1][y+4] = 10;
        blocks[x][y+4] = 6;
        blocks[x+1][y+4] = 10;
        blocks[x-1][y+5] = 10;
        blocks[x][y+5] = 10;
        blocks[x+1][y+5] = 10;
    }
}

function checkBox(x1,y1,dx,dy) {
    for (let i = 0; i < dx; i++) {
        for (let j = 0; j < dy; j++) {
            try {
                if (blocks[i+x1][j+y1] !== 0) {
                    return false;
                }
            }
            catch (e) {
                return false;
            }
        }
    }
    return true;
}

function flow(){
    if (frame%15 !== 1) return;
    for (let i = 0; i < mapSize; i++) {
        for (let j = mapSize/2; j < mapSize; j++) {
            try {
                if (blocks[i][j] === 201) {
                    flood(i,j-1,false);
                }
            }
            catch (e) {}
        }
    }
    for (let i = 0; i < mapSize; i++) {
        for (let j = mapSize/2; j < mapSize; j++) {
            try {
                if (blocks[i][j] === -1) {
                    blocks[i][j] = 201;
                }
            }
            catch (e) {}
        }
    }
}

function flood(x,y,end){
    if (blocks[x][y] === 0 || (blocks[x][y] >=100 && blocks[x][y] <200)) {
        blocks[x][y] = -1;
    }
    else if (!end && blocks[x][y] !== 201) {
        flood(x+1,y+1,true);
        flood(x-1,y+1,true);
    }
}

function drop(){
    if (frame%15 !== 1) return;
    for (let i = 0; i < mapSize; i++) {
        for (let j = mapSize; j > mapSize/2; j--) {
            try {
                if (blocks[i][j] === 11 && blocks[i][j-1] === 0) {
                    blocks[i][j] = 0;
                    blocks[i][j-1] = 11;
                }
            }
            catch (e) {}
        }
    }
}
// Convert world X to block X
function worldToBlockX(x) {return Math.floor(x / blockSize) + mapSize / 2;}

// Convert world Y to block Y
function worldToBlockY(y) {return Math.floor(y / blockSize) + mapSize / 2;}


function clickPos(placed) {
    let x = Math.floor((mouseX - 10 + player.x - offset) / blockSize) + mapSize / 2;

    // Screen Y increases downward, world Y increases upward
    let worldY = player.y - (mouseY - yOffset - 10);

    let y = Math.floor(worldY / blockSize) + mapSize / 2;

    if (x < 0 || x >= mapSize || y < 0 || y >= mapSize) {
    return;}

    if (placed === 0) {
        if (x===breakingX && y===breakingY) {breakingTime-=breakSpeed(blocks[x][y]);}
        else {breakingTime = 1.0; breakingX=x; breakingY=y;}
        if (breakingTime > 0) return;
    }
    if (x >= 0 &&x < mapSize &&y >= 0 &&y < mapSize) {
        if (blocks[x][y] === 200) {blocks[x][y] = 201; breakingTime = 1; return;}
        blocks[x][y] = placed;
        if (placed === 0) breakingTime = 1;
    }
    y+=1;
    if (x >= 0 &&x < mapSize &&y >= 0 &&y < mapSize && blocks[x][y]>=100 && blocks[x][y]!==201) {
        blocks[x][y] = 0;
    }
}

function breakSpeed(block) {
    return 1; //comment this out after testing.
    if (block === 900) return 0;
    if (block === 201) return 0;
    if (block >= 400) return .03; //break speed for ores.
    if (block >= 100 || block === 10) return 0.9;
    if (block === 8 || block === 3 || block === 4 || block === 5 || block === 6) return .03;
    
    if (block === 7) return .0005;
    if (block === 9) return .01;
    return .1;
}

function isGrounded() {
    let bottom = player.y;
    let x = worldToBlockX(player.x + player.width / 2);
    let y = worldToBlockY(bottom - 1);
    if (x<0||x>=mapSize||y>=mapSize) return false;
    if (bottom <= bottom_floor) return true;
    if (blocks[x][y+1] === 200 || blocks[x][y+1] === 201) return true;
    return !!(isSolid(blocks[x][y]));
}

function snapToPlatform() {
    let bottom = player.y;
    let x = worldToBlockX(player.x + player.width / 2);
    let y = worldToBlockY(bottom - 1);
    if (bottom <= bottom_floor) { player.y = bottom_floor; return; }
    if (x>=0 && x<mapSize && y<mapSize && (isSolid(blocks[x][y]))) {
        player.y = (y - mapSize / 2) * blockSize + blockSize;
    }
}


function outOfBounds() {
    const mapHalfWidth = mapSize * blockSize / 2;

    if (player.x + player.width > mapHalfWidth) return true;
    if (player.x < -mapHalfWidth) return true;
    return false;
}

function isSolid(block_id){
    if (block_id !== 0 && block_id <100 || block_id === 900 || block_id >= 400){
        return true
    }
    return false
}

function verticalCollision(){
    let oldY = player.y;
    player.y += player.ySpeed;
    let y = worldToBlockY(player.y - 1);
    let blockTop= (y - mapSize / 2) * blockSize+ blockSize
    let x = worldToBlockX(player.x + player.width / 2);
    if (player.ySpeed < 0&&oldY>blockTop&&player.y<=blockTop&&isSolid(blocks[x][y])) {player.ySpeed = 0; player.y=blockTop}
}

function horizontalCollision(moveDir) {
    if (moveDir === 0) return;

    let yBottom = worldToBlockY(player.y + 2);
    let yTop = worldToBlockY(player.y + player.height - 2);

    if (moveDir > 0) {
        let x = worldToBlockX(player.x + player.width);
        for (let y of [yTop, yBottom]) {
            if (x>=0 && x<mapSize && y>=0 && y<mapSize && (isSolid(blocks[x][y]))) {
                let blockLeft = (x - mapSize/2) * blockSize;
                player.x = blockLeft - player.width;
            }
        }
    } else {
        let x = worldToBlockX(player.x);
        for (let y of [yTop, yBottom]) {
            if (x>=0 && x<mapSize && y>=0 && y<mapSize && (isSolid(blocks[x][y]))) {
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
    if (player.ySpeed < -5) {
        let bottom = player.y;
        let x = worldToBlockX(player.x + player.width / 2);
        let y = worldToBlockY(bottom - 1);
        if (blocks[x][y]===201 || blocks[x][y]===200) player.ySpeed = -5;
    }
    if (player.ySpeed < -25) {
        player.ySpeed = -25;
    }
}

function movementKeys(){
    let grounded = isGrounded();
    if (grounded) snapToPlatform();
    if (grounded && keys["w"]) player.ySpeed = 15;
    let moveDir = 0;
    if (keys["a"]) { player.x -= player.speed; moveDir = -1; }
    if (keys["d"]) { player.x += player.speed; moveDir = 1; }
    horizontalCollision(moveDir);
}

let selectedBlock = 1;

function hotKeys(){
    for (let i=1;i<=9;i++){
        if (keys[i]) selectedBlock = i;
    }
    return selectedBlock;
}

function mouseClicks(selectedBlock){
    if (mouse[0]){
        clickPos(0);
    }
    else if (mouse[2]){
        clickPos(selectedBlock);
    }
}

function updateHotbar() {
    document.querySelectorAll(".slot").forEach(slot => {
        slot.classList.toggle(
            "selected",
            Number(slot.dataset.block) === selectedBlock
        );
    });
}

// Update player
function update() {

    gravity(); 
    verticalCollision(); //vertical collision
    movementKeys();
    selectedBlock = hotKeys();
    updateHotbar();
    mouseClicks(selectedBlock);
    flow();
    drop();
    

   

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

    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            if (blocks[i][j] === 0) continue;
            texture = textures[blocks[i][j]];
            if (blocks[i][j] === 2 && (blocks[i][j+1] !== 0 && blocks[i][j+1] < 100)) texture = textures[1];

            // Convert block coordinates into world coordinates
            let worldX = (i - mapSize / 2) * blockSize;

            let worldY = (j - mapSize / 2) * blockSize;

            // Convert world coordinates to screen coordinates
            let screenX = worldX + offset - player.x;

            let screenY = yOffset - worldY + player.y - blockSize;
            if (blocks[i][j] === 200) {
                water = 201;
                if (blocks[i][j+1] !== 201) water = 202;
                ctx.drawImage(
                    textures[water],
                    screenX,
                    screenY,
                    blockSize,
                    blockSize
                )
            }
            if (blocks[i][j] === 201 && blocks[i][j+1] !== 201) texture = textures[202];
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
    frame+=1;

    requestAnimationFrame(gameLoop);
}

gameLoop();

