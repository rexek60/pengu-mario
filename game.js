
let gameStarted=false;
let selectedSkin="blue";
let penguCoins=0;

function startGame(){
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    document.getElementById("mobile-controls").classList.remove("hidden");
    gameStarted=true;
    music.play();
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
    if(penguCoins>=cost){
        penguCoins -= cost;
        selectedSkin=color;
        document.getElementById("coins").innerText=penguCoins;
        alert("Skin satın alındı!");
    } else alert("Yetersiz coin!");
}

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let keys={};
document.addEventListener("keydown",e=>keys[e.code]=true);
document.addEventListener("keyup",e=>keys[e.code]=false);

// touch controls
document.getElementById("leftBtn").onmousedown=()=>keys["ArrowLeft"]=true;
document.getElementById("leftBtn").onmouseup=()=>keys["ArrowLeft"]=false;
document.getElementById("rightBtn").onmousedown=()=>keys["ArrowRight"]=true;
document.getElementById("rightBtn").onmouseup=()=>keys["ArrowRight"]=false;
document.getElementById("jumpBtn").onmousedown=()=>keys["Space"]=true;
document.getElementById("jumpBtn").onmouseup=()=>keys["Space"]=false;

const player={x:50,y:300,w:40,h:40,vy:0,onGround:false};

// assets
let imgPlayer=new Image(); imgPlayer.src="assets/player.png";
let imgEnemy=new Image(); imgEnemy.src="assets/enemy.png";
let imgBoss=new Image(); imgBoss.src="assets/boss.png";
let imgPrincess=new Image(); imgPrincess.src="assets/princess.png";
let imgTile=new Image(); imgTile.src="assets/tile.png";

// sounds
let jump=new Audio("assets/jump.wav");
let hit=new Audio("assets/hit.wav");
let music=new Audio("assets/music.mp3");
music.loop=true;

// map
let tiles=[];
for(let i=0;i<200;i++){
    tiles.push({x:i*100, y:500, w:100, h:50});
}

let enemies=[];
for(let i=0;i<20;i++){
    enemies.push({x:600+i*400, y:460, w:40, h:40, dir:1});
}

let boss={x:18000,y:450,w:100,h:100,hp:10};
let princess={x:18500,y:440,w:60,h:70,rescued:false};

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
        jump.play();
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
            penguCoins += 1;
            document.getElementById("coins").innerText=penguCoins;
            alert("Kraliçe Polly kurtarıldı! 1 PenguCoin!");
        }
    }
}

function draw(){
    if(!gameStarted) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    let camX = player.x - 400;
    ctx.save();
    ctx.translate(-camX,0);

    tiles.forEach(t=> ctx.drawImage(imgTile,t.x,t.y,t.w,t.h));
    enemies.forEach(e=> ctx.drawImage(imgEnemy,e.x,e.y,e.w,e.h));
    ctx.drawImage(imgBoss,boss.x,boss.y,boss.w,boss.h);
    if(!princess.rescued)
        ctx.drawImage(imgPrincess,princess.x,princess.y,princess.w,princess.h);

    ctx.drawImage(imgPlayer,player.x,player.y,player.w,player.h);

    ctx.restore();

    ctx.fillStyle="black";
    ctx.font="22px Arial";
    ctx.fillText("Boss HP: "+boss.hp, 20, 30);
}

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
