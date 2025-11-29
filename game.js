
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let keys={};
document.addEventListener("keydown",e=>keys[e.code]=true);
document.addEventListener("keyup",e=>keys[e.code]=false);

// IMAGES
let imgPlayer=new Image(); imgPlayer.src="assets/player.png";
let imgEnemy=new Image(); imgEnemy.src="assets/enemy.png";
let imgBoss=new Image(); imgBoss.src="assets/boss.png";
let imgPrincess=new Image(); imgPrincess.src="assets/princess.png";
let imgBG=new Image(); imgBG.src="assets/background.png";

let player={x:150,y:500,w:150,h:150,vy:0,onGround:false};
let enemies=[
    {x:900,y:520,w:120,h:120,dir:1},
    {x:1500,y:520,w:120,h:120,dir:-1}
];
let boss={x:2500,y:480,w:200,h:200,hp:6};
let princess={x:3000,y:500,w:150,h:150,rescued:false};

let gravity=0.6;
let levelLength=3500;

function rect(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x &&
           a.y < b.y+b.h && a.y+a.h > b.y;
}

function update(){
    if(keys["ArrowRight"]) player.x+=8;
    if(keys["ArrowLeft"]) player.x-=8;

    if(keys["Space"] && player.onGround){
        player.vy=-18;
        player.onGround=false;
    }

    player.vy+=gravity;
    player.y+=player.vy;

    if(player.y+player.h>=670){
        player.y=670-player.h;
        player.vy=0;
        player.onGround=true;
    }

    enemies.forEach(e=>{
        e.x+=e.dir*3;
        if(e.x<300 || e.x>levelLength-300) e.dir*=-1;
        if(rect(player,e)){ player.x=150; player.y=500; }
    });

    if(rect(player,boss)){
        boss.hp--;
        player.vy=-20;
    }

    if(boss.hp<=0 && rect(player,princess)){
        princess.rescued=true;
    }
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    let camX=player.x-300;
    if(camX<0) camX=0;
    if(camX>levelLength-canvas.width) camX=levelLength-canvas.width;

    ctx.drawImage(imgBG, -camX, 0, levelLength, canvas.height);

    ctx.drawImage(imgPlayer, player.x-camX, player.y, player.w, player.h);

    enemies.forEach(e=>{
        ctx.drawImage(imgEnemy, e.x-camX, e.y, e.w, e.h);
    });

    if(boss.hp>0){
        ctx.drawImage(imgBoss, boss.x-camX, boss.y, boss.w, boss.h);
    }

    if(!princess.rescued){
        ctx.drawImage(imgPrincess, princess.x-camX, princess.y, princess.w, princess.h);
    }

    ctx.fillStyle="white";
    ctx.font="28px Arial";
    ctx.fillText("Boss HP: "+boss.hp,30,50);

    if(princess.rescued){
        ctx.fillStyle="yellow";
        ctx.font="48px Arial";
        ctx.fillText("TEBRIKLER! PRENSES KURTARILDI!",200,200);
    }
}

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
