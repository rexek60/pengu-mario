const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const player = {
    x: 50,
    y: 300,
    w: 40,
    h: 40,
    vy: 0,
    onGround: false
};

const gravity = 0.5;
const groundLevel = 400;

function update() {
    if (keys["ArrowRight"]) player.x += 4;
    if (keys["ArrowLeft"]) player.x -= 4;

    if (keys["Space"] && player.onGround) {
        player.vy = -10;
        player.onGround = false;
    }

    player.vy += gravity;
    player.y += player.vy;

    if (player.y + player.h >= groundLevel) {
        player.y = groundLevel - player.h;
        player.vy = 0;
        player.onGround = true;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#55aa55";
    ctx.fillRect(0, groundLevel, canvas.width, 50);

    ctx.fillStyle = "#0077ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
