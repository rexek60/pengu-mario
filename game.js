
// =========================
// GLOBAL VARIABLES
// =========================
let gameStarted = false;
let selectedSkin = "blue";
let penguCoins = 0;
let walletConnected = false;

// =========================
// MENU / SHOP / UI
// =========================
function startGame(){
    hideAll();
    document.getElementById("game").classList.remove("hidden");
    gameStarted = true;
    music.play();
}
function openShop(){ hideAll(); document.getElementById("shop").classList.remove("hidden"); }
function openLeaderboard(){ hideAll(); renderLeaderboard(); document.getElementById("leaderboard").classList.remove("hidden"); }
function backMenu(){ hideAll(); document.getElementById("menu").classList.remove("hidden"); }

function hideAll(){
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("shop").classList.add("hidden");
    document.getElementById("leaderboard").classList.add("hidden");
    document.getElementById("game").classList.add("hidden");
}

function buySkin(color){
    let cost = color==="red"?2:3;
    if(penguCoins>=cost){
        penguCoins -= cost;
        selectedSkin = color;
        saveData();
        document.getElementById("coins").innerText = penguCoins;
        alert("Skin satın alındı!");
    } else alert("Yetersiz coin!");
}

// =========================
// BLOCKCHAIN SIMULATION
// =========================
function connectWallet(){
    walletConnected = true;
    alert("Cüzdan bağlandı (Simülasyon)");
}

// =========================
// SAVE SYSTEM
// =========================
function saveData(){
    localStorage.setItem("penguCoins", penguCoins);
    localStorage.setItem("selectedSkin", selectedSkin);
}
function loadData(){
    penguCoins = parseInt(localStorage.getItem("penguCoins")||"0");
    selectedSkin = localStorage.getItem("selectedSkin") || "blue";
    document.getElementById("coins").innerText = penguCoins;
}
loadData();

// =========================
// CANVAS SETUP
// =========================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown",e=>keys[e.code]=true);
document.addEventListener("keyup",e=>keys[e.code]=false);

// =========================
// SPRITES
// =========================
let spr_player = new Image(); spr_player.src="assets/player.png";
let spr_enemy = new Image(); spr_enemy.src="assets/enemy.png";
let spr_boss = new Image(); spr_boss.src="assets/boss.png";
let spr_princess = new Image(); spr_princess.src="assets/princess.png";
let spr_tile = new Image(); spr_tile.src="assets/tile.png";
let bg1 = new Image(); bg1.src="assets/bg1.png";
let bg2 = new Image(); bg2.src="assets/bg2.png";
let bg3 = new Image(); bg3.src="assets/bg3.png";

let jump = new Audio("assets/jump.wav");
let hit = new Audio("assets/hit.wav");
let music = new Audio("assets/music.mp3");
music.loop = true;

// =========================
// PLAYER
// =========================
let player = { x:50, y:300, w:40, h:40, vy:0, onGround:false };

// =========================
// LEVEL SYSTEM
// =========================
let currentLevel = 1;
let maxLevel = 3;

let tiles = [];
let enemies = [];
let boss = {};
let princess = {};

function loadLevel(level){
    tiles=[];
    enemies=[];

    if(level===1){
        for(let i=0;i<150;i++) tiles.push({x:i*100,y:550,w:100,h:50});
        enemies.push({x:800,y:500,w:40,h:40,dir:1});
        boss = {x:12000,y:480,w:100,h:100,hp:5};
        princess={x:12500,y:470,w:60,h:70,rescued:false};
    }
    if(level===2){
        for(let i=0;i<200;i++) tiles.push({x:i*100,y:550,w:100,h:50});
        enemies.push({x:1000,y:500,w:40,h:40,dir:1});
        enemies.push({x:1800,y:500,w:40,h:40,dir:1});
        boss = {x:18000,y:480,w:120,h:120,hp:8};
        princess={x:18500,y:470,w:60,h:70,rescued:false};
    }
    if(level===3){
        for(let i=0;i<250;i++) tiles.push({x:i*100,y:550,w:100,h:50});
        for(let j=0;j<5;j++) enemies.push({x:1200+j*800,y:500,w:40,h:40,dir:1});
        boss = {x:24000,y:480,w:150,h:150,hp:12};
        princess={x:24500,y:470,w:60,h:70,rescued:false};
    }
}
loadLevel(1);

// =========================
// LEADERBOARD SYSTEM
// =========================
let leaderboard = [ {name:"Emre",score:1500}, {name:"Guest",score:800} ];
function renderLeaderboard(){
    let el = document.getElementById("scores");
    el.innerHTML="";
    leaderboard.sort((a,b)=>b.score-a.score);
    leaderboard.forEach(s=>{
        let li=document.createElement("li");
        li.textContent = s.name + " — " + s.score;
        el.appendChild(li);
    });
}

// =========================
// PHYSICS
// =========================
const gravity = 0.5;
function rect(a,b){
    return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
}

// =========================
// UPDATE FUNCTION
// =========================
function update(){
    if(!gameStarted) return;

    if(keys["ArrowRight"]) player.x+=5;
    if(keys["ArrowLeft"]) player.x-=5;
    if(keys["Space"] && player.onGround){
        player.vy=-12;
        player.onGround=false;
        jump.play();
    }

    player.vy += gravity;
    player.y += player.vy;

    player.onGround=false;
    tiles.forEach(t=>{
        if(rect(player,t)){
            player.y = t.y-player.h;
            player.vy = 0;
            player.onGround = true;
        }
    });

    enemies.forEach(e=>{
        e.x+=e.dir*2;
        if(e.x%400===0) e.dir*=-1;
        if(rect(player,e)){
            hit.play();
            player.x=50; player.y=300;
        }
    });

    if(rect(player,boss)){
        if(player.vy>0){
            boss.hp--;
            player.vy=-10;
        } else {
            hit.play();
            player.x=50; player.y=300;
        }
    }

    if(boss.hp<=0 && rect(player,princess)){
        if(!princess.rescued){
            princess.rescued=true;
            penguCoins++;
            saveData();
            alert("Kraliçe Polly kurtarıldı! Bölüm tamamlandı!");

            if(currentLevel<maxLevel){
                currentLevel++;
                loadLevel(currentLevel);
                player.x=50; player.y=300;
            } else {
                alert("Tüm oyun tamamlandı!");
            }
        }
    }
}

// =========================
// DRAW FUNCTION
// =========================
function draw(){
    if(!gameStarted) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    let camX = player.x - 400;
    ctx.save(); ctx.translate(-camX,0);

    ctx.drawImage(bg1,0,0,2000,600);
    ctx.drawImage(bg2,0,0,2000,600);
    ctx.drawImage(bg3,0,0,2000,600);

    tiles.forEach(t=> ctx.drawImage(spr_tile,t.x,t.y,t.w,t.h));
    enemies.forEach(e=> ctx.drawImage(spr_enemy,e.x,e.y,e.w,e.h));
    ctx.drawImage(spr_boss,boss.x,boss.y,boss.w,boss.h);
    if(!princess.rescued) ctx.drawImage(spr_princess,princess.x,princess.y,princess.w,princess.h);

    ctx.drawImage(spr_player,player.x,player.y,player.w,player.h);
    ctx.restore();

    ctx.fillStyle="black";
    ctx.font="22px Arial";
    ctx.fillText("Boss HP: "+boss.hp,20,30);
}

// =========================
// GAME LOOP
// =========================
function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
