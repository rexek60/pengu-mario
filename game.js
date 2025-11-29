
// =====================
// GLOBALS
// =====================
let gameStarted=false;
let selectedSkin="blue";
let penguCoins=0;
let walletConnected=false;

function hideAll(){
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("shop").classList.add("hidden");
    document.getElementById("leaderboard").classList.add("hidden");
    document.getElementById("game").classList.add("hidden");
}

function startGame(){
    hideAll();
    document.getElementById("game").classList.remove("hidden");
    gameStarted=true;
    music.play();
}

function openShop(){ hideAll(); document.getElementById("shop").classList.remove("hidden"); }
function openLeaderboard(){ hideAll(); renderLeaderboard(); document.getElementById("leaderboard").classList.remove("hidden"); }
function backMenu(){ hideAll(); document.getElementById("menu").classList.remove("hidden"); }

// =====================
// BLOCKCHAIN SIM
// =====================
function connectWallet(){
    walletConnected=true;
    alert("Cüzdan bağlandı (Simülasyon)");
}

// =====================
// SAVE SYSTEM
// =====================
function saveData(){
    localStorage.setItem("penguCoins",penguCoins);
    localStorage.setItem("selectedSkin",selectedSkin);
}
function loadData(){
    penguCoins=parseInt(localStorage.getItem("penguCoins")||"0");
    selectedSkin=localStorage.getItem("selectedSkin")||"blue";
    document.getElementById("coins").innerText=penguCoins;
}
loadData();

// =====================
// BUY SKINS
// =====================
function buySkin(color){
    let cost=color==="red"?2:3;
    if(penguCoins>=cost){
        penguCoins-=cost;
        selectedSkin=color;
        saveData();
        document.getElementById("coins").innerText=penguCoins;
        alert("Skin satın alındı!");
    } else alert("Yetersiz coin!");
}

// =====================
// Canvas
// =====================
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let keys={};
document.addEventListener("keydown",e=>keys[e.code]=true);
document.addEventListener("keyup",e=>keys[e.code]=false);

// =====================
// Sprites
// =====================
let playerSprites={
    idle:new Image(), run1:new Image(), run2:new Image(), jump:new Image()
};
playerSprites.idle.src="assets/player_idle.png";
playerSprites.run1.src="assets/player_run1.png";
playerSprites.run2.src="assets/player_run2.png";
playerSprites.jump.src="assets/player_jump.png";

let spr_enemy=new Image(); spr_enemy.src="assets/enemy.png";
let spr_boss=new Image(); spr_boss.src="assets/boss.png";
let spr_princess=new Image(); spr_princess.src="assets/princess.png";
let spr_tile=new Image(); spr_tile.src="assets/tile.png";
let bg1=new Image(); bg1.src="assets/bg1.png";
let bg2=new Image(); bg2.src="assets/bg2.png";
let bg3=new Image(); bg3.src="assets/bg3.png";

let jumpS=new Audio("assets/jump.wav");
let hitS=new Audio("assets/hit.wav");
let music=new Audio("assets/music.mp3");
music.loop=true;

// =====================
// Player
// =====================
let player={x:100,y:400,w:50,h:50,vy:0,onGround:false,frame:0};

// =====================
// Levels
// =====================
let currentLevel=1;
let maxLevel=6;

let tiles=[];
let enemies=[];
let boss={};
let princess={};

function loadLevel(level){
    tiles=[]; enemies=[];
    let size=200+level*60;

    for(let i=0;i<size;i++)
        tiles.push({x:i*100,y:580,w:100,h:50});

    for(let j=0;j<level*2;j++)
        enemies.push({x:500+j*800,y:540,w:50,h:50,dir:1});

    boss={x:size*100-1000,y:520,w:80+level*10,h:80+level*10,hp:5+level*3};
    princess={x:size*100-500,y:510,w:60,h:70,rescued:false};
}
loadLevel(1);

// =====================
// Leaderboard
// =====================
let leaderboard=[{name:"Emre",score:2500},{name:"Guest",score:1500}];

function renderLeaderboard(){
    let el=document.getElementById("scores");
    el.innerHTML="";
    leaderboard.sort((a,b)=>b.score-a.score);
    leaderboard.forEach(row=>{
        let li=document.createElement("li");
        li.textContent=row.name+" — "+row.score;
        el.appendChild(li);
    });
}

// =====================
// Physics
// =====================
const gravity=0.5;
function rect(a,b){
    return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
}

// =====================
// UPDATE
// =====================
function update(){
    if(!gameStarted) return;

    // movement
    let moving=false;

    if(keys["ArrowRight"]){ player.x+=6; moving=true; }
    if(keys["ArrowLeft"]){ player.x-=6; moving=true; }

    if(keys["Space"] && player.onGround){
        player.vy=-13; player.onGround=false; jumpS.play();
    }

    player.vy+=gravity;
    player.y+=player.vy;

    player.onGround=false;
    tiles.forEach(t=>{
        if(rect(player,t)){
            player.y=t.y-player.h;
            player.vy=0;
            player.onGround=true;
        }
    });

    enemies.forEach(e=>{
        e.x+=e.dir*2;
        if(e.x%600===0) e.dir*=-1;
        if(rect(player,e)){ hitS.play(); player.x=100; player.y=400; }
    });

    if(rect(player,boss)){
        if(player.vy>0){ boss.hp--; player.vy=-10; }
        else { hitS.play(); player.x=100; player.y=400; }
    }

    if(boss.hp<=0 && rect(player,princess)){
        if(!princess.rescued){
            princess.rescued=true;
            penguCoins++; saveData();

            if(currentLevel<maxLevel){
                currentLevel++;
                alert("Level "+currentLevel+" açıldı!");
                loadLevel(currentLevel);
                player.x=100; player.y=400;
            } else {
                alert("Tüm oyun tamamlandı!");
            }
        }
    }

    // Animation frame update
    if(moving){
        player.frame=(player.frame+0.2)%2;
    }
}

// =====================
// DRAW
// =====================
function draw(){
    if(!gameStarted) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    let camX=player.x-400;
    ctx.save(); ctx.translate(-camX,0);

    ctx.drawImage(bg1,0,0);
    ctx.drawImage(bg2,0,0);
    ctx.drawImage(bg3,0,0);

    tiles.forEach(t=> ctx.drawImage(spr_tile,t.x,t.y,t.w,t.h));
    enemies.forEach(e=> ctx.drawImage(spr_enemy,e.x,e.y,e.w,e.h));
    ctx.drawImage(spr_boss,boss.x,boss.y,boss.w,boss.h);

    if(!princess.rescued)
        ctx.drawImage(spr_princess,princess.x,princess.y,princess.w,princess.h);

    // Sprite selection
    let sprite=playerSprites.idle;
    if(!player.onGround) sprite=playerSprites.jump;
    else if(player.frame<1) sprite=playerSprites.run1;
    else sprite=playerSprites.run2;

    ctx.drawImage(sprite,player.x,player.y,player.w,player.h);

    ctx.restore();

    ctx.fillStyle="#000";
    ctx.font="24px Arial";
    ctx.fillText("Boss HP: "+boss.hp,20,30);
}

// =====================
// MAIN LOOP
// =====================
function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
