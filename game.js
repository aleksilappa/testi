const viewport = document.getElementById("viewport");
const player = document.getElementById("player");
const bgFar = document.getElementById("bg-far");
const bgMid = document.getElementById("bg-mid");
const bgFront = document.getElementById("bg-front");

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const controls = document.getElementById("controls");

const clock = document.getElementById("clock");
const music = document.getElementById("music");

const WORLD_LEFT = 0;
const WORLD_RIGHT = 2200;

let playerX = WORLD_LEFT;
let movingLeft = false;
let movingRight = false;
let walkFrame = 0;
let facing = "right";

// -------- SCALE --------
function scaleGame() {
  const scale = Math.min(
    window.innerWidth / 568,
    window.innerHeight / 320
  );
  viewport.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", scaleGame);
scaleGame();

// -------- START --------
startBtn.onclick = () => {
  startScreen.classList.add("hidden");
  clock.play().catch(()=>{});
  setTimeout(() => {
    music.play().catch(()=>{});
    document.getElementById("game").classList.remove("hidden");
    controls.classList.remove("hidden");
    window.focus();
  }, 1200);
};

// -------- INPUT --------
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") movingLeft = true;
  if (e.key === "ArrowRight") movingRight = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") movingLeft = false;
  if (e.key === "ArrowRight") movingRight = false;
});

document.getElementById("leftBtn").ontouchstart = () => movingLeft = true;
document.getElementById("leftBtn").ontouchend = () => movingLeft = false;
document.getElementById("rightBtn").ontouchstart = () => movingRight = true;
document.getElementById("rightBtn").ontouchend = () => movingRight = false;

// -------- UPDATE LOOP --------
function update() {
  const speed = 2;
  let walking = false;

  // Hahmon liike
  if (movingRight) { playerX += speed; facing = "right"; walking = true; }
  if (movingLeft)  { playerX -= speed; facing = "left";  walking = true; }

  // Maailman rajat
  if (playerX < WORLD_LEFT) playerX = WORLD_LEFT;
  if (playerX > WORLD_RIGHT) playerX = WORLD_RIGHT;

  // Kamera seuraa hahmoa
  let viewportX = playerX - 568 / 2;
  if (viewportX < 0) viewportX = 0;
  if (viewportX > WORLD_RIGHT - 568) viewportX = WORLD_RIGHT - 568;
  viewport.style.left = -viewportX + "px";

  // Hahmo pysyy keskellä
  const screenCenter = 568 / 2 - player.width / 2;
  player.style.left = screenCenter + "px";

  // Parallax
  bgFar.style.backgroundPositionX = -playerX * 0.3 + "px";
  bgMid.style.backgroundPositionX = -playerX * 0.6 + "px";
  bgFront.style.backgroundPositionX = -playerX * 1.0 + "px";

  // Kävelyanimaatio idle-välissä
  if (walking) {
    walkFrame++;
    const frame = Math.floor(walkFrame / 10) % 4;
    if (frame === 0) player.src = `images/character/walk_${facing}_1.png`;
    else if (frame === 1) player.src = `images/character/idle_${facing}.png`;
    else if (frame === 2) player.src = `images/character/walk_${facing}_2.png`;
    else player.src = `images/character/idle_${facing}.png`;
  } else {
    player.src = `images/character/idle_${facing}.png`;
    walkFrame = 0;
  }

  requestAnimationFrame(update);
}

update();
