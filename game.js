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
const goToCounter = document.getElementById("goToCounter");
const barUI = document.getElementById("barUI");
const orderInput = document.getElementById("orderInput");
const submitOrder = document.getElementById("submitOrder");
const barResponse = document.getElementById("barResponse");

const WORLD_LEFT = 0;
const WORLD_RIGHT = 7200 - 700;
const VIEWPORT_WIDTH = 568;

let playerX = WORLD_LEFT;
let movingLeft = false;
let movingRight = false;
let walkFrame = 0;
let facing = "right";

// Auto
let carObj = { x: WORLD_RIGHT, speed: 2 };
const CAR_LEFT_LIMIT = -200;

let gameStarted = false;
let enteringPub = false;

const PUB_DOOR_X = 6440;

// Baarimikon vastaukset
const wrongResponses = [
  "Eihän sellaista kukaan juo!",
  "Hmm, ei kai nyt sentään?",
  "Tätä ei kannata ottaa.",
  "En usko, että kukaan haluaisi tätä.",
  "Ei ihan oikein – kokeile uudelleen."
];

const almostCorrectResponses = [
  "Joo, melkeen, mutta joku tässä vielä mättää.",
  "Olet lähellä, mutta ei ihan vielä.",
  "Hienoa, mutta joku pieni asia puuttuu.",
  "Melkein oikein, mutta jotain vielä puuttuu."
];

function scaleGame() {
  const scale = Math.min(window.innerWidth / VIEWPORT_WIDTH, window.innerHeight / 320);
  viewport.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", scaleGame);
scaleGame();

// --- START ---
startBtn.onclick = () => {
  startScreen.classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  clock.play().catch(()=>{});
  clock.onended = () => {
    music.play().catch(()=>{});
    controls.classList.remove("hidden");
    window.focus();
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

// --- PUBI ---
function enterPub() {
  document.getElementById("game").classList.add("hidden");
  barScreen.classList.remove("hidden");

  barImg.src = "images/bar/bar1.png";
  barImg.style.width = "100%";
  barImg.style.height = "100%";
  barImg.style.objectFit = "contain"; // säilyttää kuvasuhteen

  goToCounter.classList.remove("hidden");
  gameStarted = false;
}

// Baarin nappi 1 -> 2
goToCounter.onclick = () => {
  barImg.src = "images/bar/bar2.png";
  barImg.style.width = "100%";
  barImg.style.height = "100%";
  barImg.style.objectFit = "contain";
  goToCounter.classList.add("hidden");
  barUI.classList.remove("hidden");
};

// Tilauslogiikka
submitOrder.onclick = () => {
  const text = orderInput.value.toLowerCase();
  let has6 = text.includes("6") || text.includes("kuusi");
  let hasBeer = text.includes("4chiefs-lager") || text.includes("4chiefs lager") || text.includes("4chiefslager");

  if(!has6 && !hasBeer){
    barResponse.textContent = wrongResponses[Math.floor(Math.random()*wrongResponses.length)];
  } else if(!has6 || !hasBeer){
    barResponse.textContent = almostCorrectResponses[Math.floor(Math.random()*almostCorrectResponses.length)];
  } else {
    barResponse.textContent = "Tuon juomat pöytään!";
    setTimeout(()=>{
      barUI.classList.add("hidden");
      barImg.src = "images/bar/bar3.png";
      barImg.style.width = "100%";
      barImg.style.height = "100%";
      barImg.style.objectFit = "contain";
      music.loop = false;
    },5000);
  }
};

// --- UPDATE LOOP ---
function update() {
  const speed = 2;
  let walking = false;

  if(gameStarted){
    if(movingRight){ playerX += speed; facing = "right"; walking = true; }
    if(movingLeft && playerX > WORLD_LEFT){ playerX -= speed; facing = "left"; walking = true; }

    if(playerX < WORLD_LEFT) playerX = WORLD_LEFT;
    if(playerX > WORLD_RIGHT) playerX = WORLD_RIGHT;

    // --- PUBI SIIRTO 2s VIIVEELLÄ ---
    if(playerX >= PUB_DOOR_X && !enteringPub){
      enteringPub = true;
      setTimeout(() => {
        enterPub();
      }, 2000); // 2 sekuntia
    }
  }

  // Hahmo keskellä
  player.style.left = VIEWPORT_WIDTH / 2 - player.width / 2 + "px";

  // Parallax
  bgFar.style.backgroundPositionX = -playerX * 0.3 + "px";
  bgMid.style.backgroundPositionX = -playerX * 0.6 + "px";
  bgFront.style.backgroundPositionX = -playerX + "px";
  doorsLayer.style.left = -playerX + "px";

  // Auto
  if(carObj.x > -200) carObj.x -= carObj.speed;
  car.style.left = carObj.x - playerX + VIEWPORT_WIDTH/2 + "px";

  // Hahmon animaatio
  if(walking){
    walkFrame++;
    const f = Math.floor(walkFrame / 10) % 4;
    if(f === 0) player.src = `images/character/walk_${facing}_1.png`;
    else if(f === 1) player.src = `images/character/idle_${facing}.png`;
    else if(f === 2) player.src = `images/character/walk_${facing}_2.png`;
    else player.src = `images/character/idle_${facing}.png`;
  } else {
    player.src = `images/character/idle_${facing}.png`;
    walkFrame = 0;
  }

  requestAnimationFrame(update);
}

update();
