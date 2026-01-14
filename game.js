const viewport = document.getElementById("viewport");
const player = document.getElementById("player");
const bgFar = document.getElementById("bg-far");
const bgMid = document.getElementById("bg-mid");
const bgFront = document.getElementById("bg-front");
const doorsLayer = document.getElementById("doorsLayer");
const car = document.getElementById("car");

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const controls = document.getElementById("controls");

const clock = document.getElementById("clock");
const music = document.getElementById("music");

const barScreen = document.getElementById("barScreen");
const barImg = document.getElementById("barImg");
const barText = document.getElementById("barText");
const goToCounter = document.getElementById("goToCounter");
const lookTable = document.getElementById("lookTable");
const barUI = document.getElementById("barUI");
const orderInput = document.getElementById("orderInput");
const submitOrder = document.getElementById("submitOrder");
const barResponse = document.getElementById("barResponse");

const WORLD_LEFT = 0;
const WORLD_RIGHT = 7200 - 800;
const VIEWPORT_WIDTH = 568;
let playerX = WORLD_LEFT;
let movingLeft = false;
let movingRight = false;
let walkFrame = 0;
let facing = "right";

const carObj = { x: WORLD_RIGHT, speed: 2 };
const PUB_DOOR_X = 6440;
let gameStarted = false;
let enteringPub = false;

// Baarin vastaukset
const wrongResponses = [
  "Eihän sellaista kukaan juo!",
  "Hmm, ei kai nyt sentään?",
  "Tätä ei kannata ottaa."
];
const almostCorrectResponses = [
  "Joo, melkeen, mutta joku tässä vielä mättää.",
  "Olet lähellä, mutta ei ihan vielä."
];

function scaleGame(){
  const scale = Math.min(window.innerWidth/VIEWPORT_WIDTH, window.innerHeight/320);
  viewport.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", scaleGame);
scaleGame();

// --- START ---
startBtn.onclick = () => {
  startScreen.classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  clock.play().catch(()=>{});
  clock.onended = ()=>{
    music.play().catch(()=>{});
    controls.classList.remove("hidden");
    gameStarted = true;
  };
};

// --- CONTROLS ---
document.addEventListener("keydown", e => {
  if(!gameStarted) return;
  if(e.key==="ArrowLeft") movingLeft=true;
  if(e.key==="ArrowRight") movingRight=true;
});
document.addEventListener("keyup", e => {
  if(e.key==="ArrowLeft") movingLeft=false;
  if(e.key==="ArrowRight") movingRight=false;
});
document.getElementById("leftBtn").ontouchstart = ()=>{ if(gameStarted) movingLeft=true; };
document.getElementById("leftBtn").ontouchend = ()=>movingLeft=false;
document.getElementById("rightBtn").ontouchstart = ()=>{ if(gameStarted) movingRight=true; };
document.getElementById("rightBtn").ontouchend = ()=>movingRight=false;

// --- PUB ---
function enterPub(){
  document.getElementById("game").classList.add("hidden");
  barScreen.classList.remove("hidden");
  car.style.display="none";
  controls.classList.add("hidden");
  player.style.display="none";

  barImg.src="images/bar/bar1.png";
  barImg.style.width="100%";
  barImg.style.height="100%";
  barImg.style.objectFit="contain";
  barText.textContent="Hei, me ollaan täällä!! Käy vaan tiskillä eka!";
  goToCounter.classList.remove("hidden");
  lookTable.classList.add("hidden");
  barUI.classList.add("hidden");
}

// Baarin nappi 1 -> 2
goToCounter.onclick = () => {
  barImg.src="images/bar/bar2.png";
  barText.textContent="Mitä saisi olla?";
  goToCounter.classList.add("hidden");
  lookTable.classList.remove("hidden");
  barUI.classList.remove("hidden");
};

// Baarin nappi katso pöytään -> bar1 kuva ilman tekstiä
lookTable.onclick = ()=>{
  barImg.src="images/bar/bar1.png";
  barText.textContent="";
  goToCounter.classList.remove("hidden");
  lookTable.classList.add("hidden");
  barUI.classList.add("hidden");
};

// Tilauslogiikka
submitOrder.onclick = ()=>{
  const text = orderInput.value.toLowerCase();
  let has6 = text.includes("6") || text.includes("kuusi");
  let hasBeer = text.includes("4chiefs-lager") || text.includes("4chiefs lager") || text.includes("4chiefslager");

  if(!has6 && !hasBeer){
    barResponse.textContent = wrongResponses[Math.floor(Math.random()*wrongResponses.length)];
  }else if(!has6 || !hasBeer){
    barResponse.textContent = almostCorrectResponses[Math.floor(Math.random()*almostCorrectResponses.length)];
  }else{
    barResponse.textContent = "Tuon juomat pöytään!";
    setTimeout(()=>{
      barUI.classList.add("hidden");
      barImg.src="images/bar/bar3.png";
      barText.textContent="";
      music.loop=false;
    },5000);
  }
};

// --- UPDATE LOOP ---
function update(){
  const speed = 2;
  let walking=false;
  if(gameStarted){
    if(movingRight){ playerX+=speed; facing="right"; walking=true;}
    if(movingLeft && playerX>WORLD_LEFT){ playerX-=speed; facing="left"; walking=true;}
    if(playerX<WORLD_LEFT) playerX=WORLD_LEFT;
    if(playerX>WORLD_RIGHT) playerX=WORLD_RIGHT;

    if(playerX>=PUB_DOOR_X && !enteringPub){
      enteringPub=true;
      setTimeout(()=>{ enterPub(); }, 2000);
    }
  }

  player.style.left = VIEWPORT_WIDTH/2 - player.width/2 + "px";

  bgFar.style.backgroundPositionX=-playerX*0.3+"px";
  bgMid.style.backgroundPositionX=-playerX*0.6+"px";
  bgFront.style.backgroundPositionX=-playerX+"px";
  doorsLayer.style.left=-playerX+"px";

  if(carObj.x>-200) carObj.x-=carObj.speed;
  car.style.left = carObj.x - playerX + VIEWPORT_WIDTH/2 + "px";

  if(walking){
    walkFrame++;
    const f = Math.floor(walkFrame/10)%4;
    if(f===0) player.src=`images/character/walk_${facing}_1.png`;
    else if(f===1) player.src=`images/character/idle_${facing}.png`;
    else if(f===2) player.src=`images/character/walk_${facing}_2.png`;
    else player.src=`images/character/idle_${facing}.png`;
  }else{
    player.src=`images/character/idle_${facing}.png`;
    walkFrame=0;
  }

  requestAnimationFrame(update);
}

update();
