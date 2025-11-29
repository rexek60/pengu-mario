
let gameStarted = false;
let selectedSkin = "blue";
let penguCoins = 0;

function startGame(){
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    gameStarted = true;
}

function openShop(){
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("shop").classList.remove("hidden");
}

function closeShop(){
    document.getElementById("shop").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
}

function buySkin(color){
    let cost = color==="red"?2:3;
    if(penguCoins >= cost){
        penguCoins -= cost;
        selectedSkin = color;
        document.getElementById("coins").innerText = penguCoins;
        alert(color+" skin satın alındı!");
    } else alert("Yetersiz bakiye!");
}

// Canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Player
const player = { x:50, y:300, w:40, h:40, vy:0, onGround:false };

// Long map
let tiles = [];
for(let i=0;i<50;i++){
    tiles.push({x:i*200, y:500, w:200, h:50});
}

tiles.push({x:400, y:420, w:150, h:20});
tiles.push({x:800, y:350, w:150, h:20});
tiles.push({x:1400, y:300, w:150, h:20});
tiles.push({x:2000, y:260, w:150, h:20});

// Enemies
let enemies = [];
for(let i=0;i<5;i++){
    enemies.push({x:600 + i*400, y:460, w:40, h:40, dir:1});
}

// Boss
let boss = {x:8000, y:450, w:80, h:80, hp:5};

// Princess
let princess = {x:8500, y:440, w:50, h:60, rescued:false};

const gravity = 0.5;

function rectCollide(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function update(){
    if(!gameStarted) return;

    if(keys["ArrowRight"]) player.x += 5;
    if(keys["ArrowLeft"]) player.x -= 5;

    if(keys["Space"] && player.onGround){
        player.vy = -12;
        player.onGround=false;
    }

    player.vy += gravity;
    player.y += player.vy;

    player.onGround=false;

    tiles.forEach(t=>{
        if(rectCollide(player,t)){
            player.y = t.y - player.h;
            player.vy = 0;
            player.onGround = true;
        }
    });

    enemies.forEach(e=>{
        e.x += e.dir*2;
        if(e.x < e.xStart-100 || e.x > e.xStart+100) e.dir *= -1;

        if(rectCollide(player, e)){
            player.x=50; player.y=300;
        }
    });

    if(rectCollide(player, boss)){
        if(player.vy > 0){
            boss.hp--;
            player.vy = -10;
        } else {
            player.x = 50; player.y=300;
        }
    }

    if(boss.hp <= 0 && rectCollide(player, princess)){
        if(!princess.rescued){
            princess.rescued = true;
            penguCoins += 1;
            alert("Kraliçe Polly kurtarıldı! 1 PenguCoin kazandın!");
            document.getElementById("coins").innerText = penguCoins;
        }
    }
}

function draw(){
    if(!gameStarted) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Camera
    let camX = player.x - 300;
    ctx.save();
    ctx.translate(-camX,0);

    // Tiles
    ctx.fillStyle="#6ab04c";
    tiles.forEach(t=> ctx.fillRect(t.x, t.y, t.w, t.h));

    // Player
    ctx.fillStyle = selectedSkin==="red" ? "red" :
                    selectedSkin==="black" ? "black" : "#0077ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Enemies
    ctx.fillStyle="green";
    enemies.forEach(e=> ctx.fillRect(e.x, e.y, e.w, e.h));

    // Boss
    ctx.fillStyle="darkred";
    ctx.fillRect(boss.x, boss.y, boss.w, boss.h);

    // Princess
    if(!princess.rescued){
        ctx.fillStyle="pink";
        ctx.fillRect(princess.x, princess.y, princess.w, princess.h);
    }

    ctx.restore();

    ctx.fillStyle="black";
    ctx.font="22px Arial";
    ctx.fillText("Boss HP: "+boss.hp, 20, 30);
}

function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
