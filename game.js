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
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const clock = document.getElementById("clock");
const music = document.getElementById("music");
const correctSound = document.getElementById("correctSound");
const doorSound = document.getElementById("doorSound");
const typingSound = document.getElementById("typingSound");

const barScreen = document.getElementById("barScreen");
const barImg = document.getElementById("barImg");
const goToCounter = document.getElementById("goToCounter");
const barUI = document.getElementById("barUI");
const orderInput = document.getElementById("orderInput");
const submitOrder = document.getElementById("submitOrder");
const barResponse = document.getElementById("barResponse");

const fadeOverlay = document.getElementById("fadeOverlay");

/* ==================================
   FADE FUNKTIOT
================================== */
function fadeOut(callback) {
  fadeOverlay.classList.add("active");
  setTimeout(() => {
    if (callback) callback();
  }, 1000); // 1s fade
}

function fadeIn(callback) {
  fadeOverlay.classList.remove("active");
  if (callback) callback();
}

/* Katso pöytään */
const lookAtTableBtn = document.createElement("button");
lookAtTableBtn.textContent = "Katso pöytään";
barUI.appendChild(lookAtTableBtn);

/* WORLD */
const WORLD_LEFT = 0;
const WORLD_RIGHT = 7200 - 700;
const VIEWPORT_WIDTH = 568;
const PUB_DOOR_X = 6440;

/* PLAYER */
let playerX = WORLD_LEFT;
let movingLeft = false;
let movingRight = false;
let walkFrame = 0;
let facing = "right";
let gameStarted = false;
let enteringPub = false;
let friendsHaveShouted = false;

/* AUTO */
let carObj = { x: WORLD_RIGHT, speed: 2 };
const CAR_LEFT_LIMIT = -200;

/* SCALE */
function scaleGame() {
  const scale = Math.min(window.innerWidth / VIEWPORT_WIDTH, window.innerHeight / 320);
  viewport.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", scaleGame);
scaleGame();

/* ===============================
   KIRJOITUSEFEKTI + VÄRIT
================================ */
let typingTimer = null;
function typeText(text, color) {
  clearInterval(typingTimer);
  barResponse.textContent = "";
  barResponse.style.color = color;

  typingSound.currentTime = 0;
  typingSound.play().catch(() => {});

  let i = 0;
  typingTimer = setInterval(() => {
    barResponse.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(typingTimer);
      typingSound.pause();
      typingSound.currentTime = 0;
    }
  }, 35);
}

/* START */
startBtn.onclick = () => {
  startScreen.classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  clock.play().catch(() => {});
  clock.onended = () => {
    music.play().catch(() => {});
    controls.classList.remove("hidden");
    gameStarted = true;
  };
};

/* CONTROLS */
document.addEventListener("keydown", e => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") movingLeft = true;
  if (e.key === "ArrowRight") movingRight = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") movingLeft = false;
  if (e.key === "ArrowRight") movingRight = false;
});

leftBtn.ontouchstart = () => movingLeft = true;
leftBtn.ontouchend = () => movingLeft = false;
rightBtn.ontouchstart = () => movingRight = true;
rightBtn.ontouchend = () => movingRight = false;

/* PUB */
function enterPub() {
  doorSound.currentTime = 0;
  doorSound.play().catch(() => {});

  fadeOut(() => {
    document.getElementById("game").classList.add("hidden");
    controls.classList.add("hidden");
    barScreen.classList.remove("hidden");

    barImg.src = "images/bar/bar1.png";
    goToCounter.classList.remove("hidden");
    barUI.classList.add("hidden");

    if (!friendsHaveShouted) {
      typeText("Hei, me ollaan täällä! Käy vain ensin tiskillä!", "#3cff3c");
      friendsHaveShouted = true;
    } else {
      barResponse.textContent = "";
    }

    fadeIn();
  });

  gameStarted = false;
}

/* BAR1 → BAR2 */
goToCounter.onclick = () => {
  fadeOut(() => {
    barImg.src = "images/bar/bar2.png";

    goToCounter.classList.add("hidden");
    barUI.classList.remove("hidden");
    submitOrder.style.display = "inline-block";
    lookAtTableBtn.style.display = "inline-block";

    fadeIn(() => {
      typeText("Mitä saisi olla?", "#ffd700");
    });
  });
};

/* KATSO PÖYTÄÄ */
lookAtTableBtn.onclick = () => {
  fadeOut(() => {
    barImg.src = "images/bar/bar1.png";
    barUI.classList.add("hidden");
    goToCounter.classList.remove("hidden");

    fadeIn(() => {
      barResponse.textContent = "";
    });
  });
};

/* TILAUSLOGIIKKA */
submitOrder.onclick = () => {
  const t = orderInput.value.toLowerCase();
  const has6 = t.includes("6") || t.includes("kuusi");
  const hasBeer =
    t.includes("4chiefs-lager") || t.includes("4chiefslager") || t.includes("4chiefs");

  if (!has6 && !hasBeer) {
    typeText("Eihän sellaista kukaan juo!", "#ffd700");
    return;
  }

  if (!has6 || !hasBeer) {
    typeText("Joo, melkein, mutta joku tässä vielä mättää.", "#ffd700");
    return;
  }

  /* =========================
     OIKEA VASTAUS
  ========================= */
  correctSound.currentTime = 0;
  correctSound.play().catch(() => {});
  typeText("Selvä! Tuon juomat pöytään.", "#ffd700");

  submitOrder.classList.add("hidden");
  lookAtTableBtn.classList.add("hidden");

  setTimeout(() => {
    fadeOut(() => {
      barUI.classList.add("hidden");
      barResponse.textContent = "";
      barImg.src = "images/bar/bar3.png";
      music.loop = false;
      fadeIn();
    });
  }, 4000);
};

/* UPDATE LOOP */
function update() {
  const speed = 2;
  let walking = false;

  if (gameStarted) {
    if (movingRight) { playerX += speed; facing = "right"; walking = true; }
    if (movingLeft) { playerX -= speed; facing = "left"; walking = true; }

    playerX = Math.max(WORLD_LEFT, Math.min(WORLD_RIGHT, playerX));

    if (playerX >= PUB_DOOR_X && !enteringPub) {
  enteringPub = true;
  enterPub(); // kutsutaan heti, ei odotusta
}

  }

  player.style.left = VIEWPORT_WIDTH / 2 - player.width / 2 + "px";
  bgFar.style.backgroundPositionX = -playerX * 0.3 + "px";
  bgMid.style.backgroundPositionX = -playerX * 0.6 + "px";
  bgFront.style.backgroundPositionX = -playerX + "px";
  doorsLayer.style.left = -playerX + "px";

  if (carObj.x > CAR_LEFT_LIMIT) carObj.x -= carObj.speed;
  car.style.left = carObj.x - playerX + VIEWPORT_WIDTH / 2 + "px";

  if (walking) {
    walkFrame++;
    const f = Math.floor(walkFrame / 10) % 4;
    player.src =
      f === 0 ? `images/character/walk_${facing}_1.png` :
      f === 2 ? `images/character/walk_${facing}_2.png` :
      `images/character/idle_${facing}.png`;
  } else {
    player.src = `images/character/idle_${facing}.png`;
    walkFrame = 0;
  }

  requestAnimationFrame(update);
}

update();
