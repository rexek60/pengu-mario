
// ======================
// FINAL ULTRA ENGINE CORE
// ======================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// LOAD IMAGES
const imgPlayer = new Image(); imgPlayer.src = "assets/player.png";
const imgEnemy = new Image(); imgEnemy.src = "assets/enemy.png";
const imgBoss = new Image(); imgBoss.src = "assets/boss.png";
const imgPrincess = new Image(); imgPrincess.src = "assets/princess.png";
const imgBG = new Image(); imgBG.src = "assets/background.png";

let player = { x:200, y:450, w:140, h:140, vy:0, onGround:false };
let enemy = { x:700, y:450, w:140, h:140, dir:1 };
let boss = { x:1500, y:420, w:180, h:180, hp:5 };
let princess = { x:2000, y:440, w:140, h:160, rescued:false };

const gravity = 0.6;

// COLLISION
function rect(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.h;
}

// UPDATE LOOP
function update(){

    if(keys["ArrowRight"]) player.x += 6;
    if(keys["ArrowLeft"]) player.x -= 6;

    if(keys["Space"] && player.onGround){
        player.vy = -15;
        player.onGround = false;
    }

    player.vy += gravity;
    player.y += player.vy;

    if(player.y + player.h >= 580){
        player.y = 580 - player.h;
        player.vy = 0;
        player.onGround = true;
    }

    enemy.x += enemy.dir * 4;
    if(enemy.x < 500 || enemy.x > 900) enemy.dir *= -1;

    // Enemy collision
    if(rect(player, enemy)){
        player.x = 200;
        player.y = 450;
    }

    // Boss collision
    if(rect(player, boss)){
        boss.hp -= 1;
        player.vy = -20;
    }

    // Princess rescue
    if(rect(player, princess)){
        princess.rescued = true;
    }
}

// DRAW LOOP
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(imgBG, 0, 0, canvas.width, canvas.height);

    ctx.drawImage(imgPlayer, player.x, player.y, player.w, player.h);
    ctx.drawImage(imgEnemy, enemy.x, enemy.y, enemy.w, enemy.h);

    ctx.drawImage(imgBoss, boss.x, boss.y, boss.w, boss.h);

    if(!princess.rescued)
        ctx.drawImage(imgPrincess, princess.x, princess.y, princess.w, princess.h);

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.fillText("Boss HP: " + boss.hp, 20, 40);
}

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
