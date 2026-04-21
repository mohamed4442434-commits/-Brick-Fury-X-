window.onload=function(){

let canvas=document.getElementById("gameCanvas");
let ctx=canvas.getContext("2d");

let ball,paddle,bricks;
let score=0,lives=3,level=1,coins=0;
let running=false,paused=false;

let paddleColor="cyan";
let ballColor="white";

let audioCtx=new (window.AudioContext||window.webkitAudioContext)();
let isMuted=false;

// 🔊 صوت
function sound(f){
if(isMuted) return;
let o=audioCtx.createOscillator();
let g=audioCtx.createGain();
o.connect(g); g.connect(audioCtx.destination);
o.frequency.value=f;
g.gain.value=0.08;
o.start();
setTimeout(()=>o.stop(),100);
}

// 👤 اسم اللاعب
let playerName=localStorage.getItem("playerName")||"Player";
document.getElementById("nameDisplay").innerText=playerName;

window.saveName=function(){
let v=document.getElementById("playerName").value;
if(v.trim()!=""){
playerName=v;
localStorage.setItem("playerName",v);
document.getElementById("nameDisplay").innerText=v;
}
}

// ▶️ Start
window.startGame=function(){
document.getElementById("gameOverBox").style.display="none";
score=0;lives=3;level=1;
initLevel();
running=true;
paused=false;
loop();
}

// ⏸️ Pause
window.pauseGame=function(){paused=!paused;}
window.toggleMute=function(){isMuted=!isMuted;}

// 🧠 Level
function initLevel(){
ball={x:160,y:250,dx:3,dy:-3,r:8};
paddle={x:110,w:100,h:10};

bricks=[];
for(let i=0;i<3+level;i++){
bricks[i]=[];
for(let j=0;j<6;j++){
bricks[i][j]={x:j*50+20,y:i*25+40,alive:true};
}
}
}

// 🖱️
canvas.addEventListener("mousemove",e=>{
let r=canvas.getBoundingClientRect();
paddle.x=e.clientX-r.left-paddle.w/2;
});

// 🎨 رسم
function draw(){

ctx.clearRect(0,0,320,400);

// ball
ctx.beginPath();
ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
ctx.fillStyle=ballColor;
ctx.fill();

// paddle
ctx.fillStyle=paddleColor;
ctx.fillRect(paddle.x,380,paddle.w,paddle.h);

// bricks
for(let i=0;i<bricks.length;i++){
for(let j=0;j<bricks[i].length;j++){
let b=bricks[i][j];
if(b.alive){
ctx.fillStyle="red";
ctx.fillRect(b.x,b.y,45,20);
}
}
}
}

// 💥 collision
function collision(){
for(let i=0;i<bricks.length;i++){
for(let j=0;j<bricks[i].length;j++){
let b=bricks[i][j];

if(b.alive &&
ball.x>b.x &&
ball.x<b.x+45 &&
ball.y>b.y &&
ball.y<b.y+20){

b.alive=false;
ball.dy*=-1;

score++;
coins+=10;

sound(500);
}
}
}
}

// 🔄 loop
function loop(){

if(!running) return;
if(paused){requestAnimationFrame(loop);return;}

ball.x+=ball.dx;
ball.y+=ball.dy;

if(ball.x<0||ball.x>320) ball.dx*=-1;
if(ball.y<0) ball.dy*=-1;

// AI
if(ball.y>370){
let hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);
let angle=hit*Math.PI/3;
let speed=Math.sqrt(ball.dx**2+ball.dy**2);
ball.dx=speed*Math.sin(angle);
ball.dy=-speed*Math.cos(angle);
sound(800);
}

// lose
if(ball.y>400){
lives--;
sound(200);

if(lives<=0){
running=false;
document.getElementById("gameOverBox").style.display="block";
return;
}else{
ball.x=160;ball.y=250;
}
}

// win
let win=true;
for(let i=0;i<bricks.length;i++){
for(let j=0;j<bricks[i].length;j++){
if(bricks[i][j].alive) win=false;
}
}
if(win){level++;initLevel();}

collision();
draw();

document.getElementById("score").innerText=score;
document.getElementById("coins").innerText=coins;
document.getElementById("lives").innerText=lives;
document.getElementById("level").innerText=level;

requestAnimationFrame(loop);
}

// 🛒 متجر (رجع كامل زي ما كان)

function createShop(items,containerId,setColor){

let container=document.getElementById(containerId);

items.forEach(item=>{

let div=document.createElement("div");
div.className="skin";

let colorBox=document.createElement("div");
colorBox.style.background=item.color;
colorBox.style.height="20px";

let btn=document.createElement("button");

function update(){
btn.innerText=item.owned?"Use":"Buy "+item.price;
}

btn.onclick=function(){
if(!item.owned){
if(coins>=item.price){
coins-=item.price;
item.owned=true;
update();
}else{
alert("❌ مش كفاية فلوس");
}
}else{
setColor(item.color);
}
};

update();

div.appendChild(colorBox);
div.appendChild(btn);
container.appendChild(div);

});
}

// 🎮 بيانات المتجر
let paddleItems=[
{color:"cyan",price:0,owned:true},
{color:"red",price:50},
{color:"green",price:80},
{color:"yellow",price:120},
{color:"purple",price:150},
{color:"orange",price:180},
{color:"pink",price:220},
{color:"white",price:250}
];

let ballItems=[
{color:"white",price:0,owned:true},
{color:"red",price:50},
{color:"cyan",price:80},
{color:"orange",price:120},
{color:"yellow",price:150},
{color:"purple",price:180},
{color:"pink",price:220}
];

// تشغيل المتجر
createShop(paddleItems,"paddleShop",(c)=>paddleColor=c);
createShop(ballItems,"ballShop",(c)=>ballColor=c);

}