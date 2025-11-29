
let gameStarted=false;
let selectedSkin="blue";
let penguCoins=0;

function startGame(){
    hideAll();
    document.getElementById("game").classList.remove("hidden");
    gameStarted=true;
}

function openShop(){ hideAll(); document.getElementById("shop").classList.remove("hidden"); }
function openLeaderboard(){ hideAll(); renderLeaderboard(); document.getElementById("leaderboard").classList.remove("hidden"); }

function backMenu(){
    hideAll();
    document.getElementById("menu").classList.remove("hidden");
}

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
        document.getElementById("coins").innerText = penguCoins;
        alert("Skin satın alındı!");
    } else alert("Yetersiz coin!");
}

// Blockchain simülasyonu
let walletConnected=false;
function connectWallet(){
    walletConnected=true;
    console.log("Cüzdan bağlandı (simülasyon)");
}

// Canvas setup
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let keys={};
document.addEventListener("keydown",e=>keys[e.code]=true);
document.addEventListener("keyup",e=>keys[e.code]=false);

// Sprites
let spr_player=new Image(); spr_player.src="assets/player.png";
let spr_enemy=new Image(); spr_enemy.src="assets/enemy.png";
let spr_boss=new Image(); spr_boss.src="assets/boss.png";
let spr_princess=new Image(); spr_princess.src="assets/princess.png";

let bg1=new Image(); bg1.src="assets/bg_layer1.png";
let bg2=new Image(); bg2.src="assets/bg_layer2.png";
let bg3=new Image(); bg3.src="assets/bg_layer3.png";

let spr_tile=new Image(); spr_tile.src="assets/tile.png";

// Levels
let currentLevel = 1;
let maxLevel = 3;

// Placeholder levels
function loadLevel(level){
    tiles=[];
    enemies=[];
    if(level===1){
        for(let i=0;i<150;i++) tiles.push({x:i*100, y:550, w:100, h:50});
        enemies.push({x:800, y:500, w:40, h:40, dir:1});
        boss = {x:12000, y:480, w:100, h:100, hp:5};
        princess={x:12500,y:470,w:60,h:70,rescued:false};
    }
    if(level===2){
        for(let i=0;i<200;i++) tiles.push({x:i*100, y:550, w:100, h:50});
        enemies.push({x:1000, y:500, w:40, h:40, dir:1});
        enemies.push({x:1800, y:500, w:40, h:40, dir:1});
        boss = {x:18000, y:480, w:120, h:120, hp:8};
        princess={x:18500,y:470,w:60,h:70,rescued:false};
    }
    if(level===3){
        for(let i=0;i<250;i++) tiles.push({x:i*100, y:550, w:100, h:50});
        for(let j=0;j<5;j++)
            enemies.push({x:1200+j*800, y:500, w:40, h:40, dir:1});
        boss = {x:24000, y:480, w:150, h:150, hp:12};
        princess={x:24500,y:470,w:60,h:70,rescued:false};
    }
}

let player = {x:50,y:300,w:40,h:40,vy:0,onGround:false};
let tiles=[];
let enemies=[];
let boss={};
let princess={};

loadLevel(1);

// Leaderboard
let leaderboard=[ {name:"Emre", score:1500}, {name:"Guest", score:900} ];

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

// Physics
const gravity=0.5;
function rect(a,b){
    return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
}

function update(){
    if(!gameStarted) return;

    if(keys["ArrowRight"]) player.x+=5;
    if(keys["ArrowLeft"]) player.x-=5;
    if(keys["Space"] && player.onGround){
        player.vy=-12;
        player.onGround=false;
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
        if(e.x%400===0) e.dir*=-1;
        if(rect(player,e)){
            player.x=50; player.y=300;
        }
    });

    if(rect(player,boss)){
        if(player.vy>0){ boss.hp--; player.vy=-10; }
        else { player.x=50; player.y=300; }
    }

    if(boss.hp<=0 && rect(player, princess)){
        if(!princess.rescued){
            princess.rescued=true;
            penguCoins += 1;
            document.getElementById("coins").innerText=penguCoins;

            if(currentLevel < maxLevel){
                currentLevel++;
                loadLevel(currentLevel);
                player.x=50; player.y=300;
                alert("Bölüm " + currentLevel + " açıldı!");
            } else {
                alert("Tüm bölümler tamamlandı!");
            }
        }
    }
}

function draw(){
    if(!gameStarted) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    let camX = player.x - 400;
    ctx.save();
    ctx.translate(-camX,0);

    ctx.drawImage(bg1, camX*0.2, 0, 2000,600);
    ctx.drawImage(bg2, camX*0.4, 0, 2000,600);
    ctx.drawImage(bg3, camX*0.6, 0, 2000,600);

    tiles.forEach(t=> ctx.drawImage(spr_tile,t.x,t.y,t.w,t.h));
    enemies.forEach(e=> ctx.drawImage(spr_enemy,e.x,e.y,e.w,e.h));
    ctx.drawImage(spr_boss,boss.x,boss.y,boss.w,boss.h);

    if(!princess.rescued)
        ctx.drawImage(spr_princess,princess.x,princess.y,princess.w,princess.h);

    let color = selectedSkin==="red"?"red":selectedSkin==="black"?"black":"blue";
    ctx.filter = "hue-rotate(" + (color==="red"?50: color==="black"?200:0) +"deg)";
    ctx.drawImage(spr_player,player.x,player.y,player.w,player.h);
    ctx.filter="none";

    ctx.restore();

    ctx.fillStyle="black";
    ctx.font="22px Arial";
    ctx.fillText("Boss HP: "+boss.hp, 20, 30);
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
