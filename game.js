
// CANVAS
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// OYUN BAŞLATMA (0.35 USDT)
document.getElementById("startBtn").onclick = () => {
    document.getElementById("paywall").style.display = "none";
    canvas.style.display = "block";
};

// KARAKTER
const player = { x:50, y:300, w:40, h:40, vy:0, onGround:false, coins:0 };

// HARİTA (BASİT PLATFORM BLOKLAR)
let tiles = [
    {x:0, y:460, w:2000, h:40},
    {x:300, y:380, w:150, h:20},
    {x:600, y:330, w:150, h:20},
    {x:900, y:280, w:150, h:20},
];

// YEŞİL DÜŞMAN
let enemies = [
    {x:400, y:420, w:40, h:40, dir:1},
    {x:850, y:240, w:40, h:40, dir:1}
];

// KIRMIZI BOSS
let boss = {x:1500, y:420, w:60, h:60, hp:3};

// PRENSES
let princess = {x:1800, y:400, w:40, h:50, rescued:false};

const gravity = 0.5;

// ÇARPIŞMA FONKSİYONU
function rectCollide(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function update(){
    // Hareket
    if(keys["ArrowRight"]) player.x+=4;
    if(keys["ArrowLeft"]) player.x-=4;

    // Zıplama
    if(keys["Space"] && player.onGround){
        player.vy = -11;
        player.onGround=false;
    }

    player.vy += gravity;
    player.y += player.vy;

    // Platform çarpışmaları
    player.onGround=false;
    tiles.forEach(t => {
        if(rectCollide(player,t)){
            player.y = t.y - player.h;
            player.vy = 0;
            player.onGround = true;
        }
    });

    // Düşman hareketleri
    enemies.forEach(e=>{
        e.x += e.dir*2;
        if(e.x < 350 || e.x > 500) e.dir *= -1;

        if(rectCollide(player,e)){
            player.y = 300; player.x = 50; // reset
        }
    });

    // Boss hareket
    if(!princess.rescued){
        boss.x += Math.sin(Date.now()/400)*2;

        if(rectCollide(player,boss)){
            // Üstüne zıplarsa vurur
            if(player.vy > 0){
                boss.hp--;
                player.vy = -8;
            } else {
                player.x=50; player.y=300; // ölme
            }
        }
    }

    // Boss öldüyse prenses alınabilir
    if(boss.hp <= 0){
        if(rectCollide(player, princess)){
            princess.rescued = true;
            alert("Tebrikler! 1 PenguCoin Kazandın!");
        }
    }
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Platformlar
    ctx.fillStyle="#6ab04c";
    tiles.forEach(t=> ctx.fillRect(t.x, t.y, t.w, t.h));

    // Player
    ctx.fillStyle="#0077ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Düşmanlar
    ctx.fillStyle="#00aa00";
    enemies.forEach(e=> ctx.fillRect(e.x, e.y, e.w, e.h));

    // Boss
    ctx.fillStyle="red";
    ctx.fillRect(boss.x, boss.y, boss.w, boss.h);

    // Prenses
    if(!princess.rescued){
        ctx.fillStyle="pink";
        ctx.fillRect(princess.x, princess.y, princess.w, princess.h);
    }

    // HP Yazı
    ctx.fillStyle="black";
    ctx.font="20px Arial";
    ctx.fillText("Boss HP: "+boss.hp, 20, 30);
}

function gameLoop(){
    if(canvas.style.display === "block"){
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}
gameLoop();
