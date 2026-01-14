const viewport = document.getElementById("viewport");
const player = document.getElementById("player");
const bgFar = document.getElementById("bg-far");
const bgMid = document.getElementById("bg-mid");
const bgFront = document.getElementById("bg-front");
const doorsLayer = document.getElementById("doorsLayer");

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const controls = document.getElementById("controls");

const clock = document.getElementById("clock");
const music = document.getElementById("music");

const WORLD_LEFT = 0;
const WORLD_RIGHT = -700; // ulkomaailman oikea raja
const PUB_DOOR_X = 6440; // absoluuttinen ovi X-koordinaatti

let playerX = WORLD_LEFT;
let movingLeft = false;
let movingRight = false;
let walkFrame = 0;
let facing = "right";
let enteringPub = false;
let canMove = false;
let inBar = false;

// Skaalataan peli ruudulle
function scaleGame() {
  const scale = Math.min(
    window.innerWidth / 568,
    window.innerHeight / 320
  );
  viewport.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", scaleGame);
scaleGame();

// Aloitusnappi
startBtn.onclick = () => {
  startScreen.classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  controls.classList.remove("hidden");

  canMove = false;
  clock.play().catch(()=>{});
  clock.onended = () => {
    music.play().catch(()=>{});
    canMove = true;
  };
};

// Näppäimet
document.addEventListener("keydown", e => {
  if(!canMove) return;
  if (e.key === "ArrowLeft") movingLeft = true;
  if (e.key === "ArrowRight") movingRight = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") movingLeft = false;
  if (e.key === "ArrowRight") movingRight = false;
});

document.getElementById("leftBtn").ontouchstart = () => { if(canMove) movingLeft = true; };
document.getElementById("leftBtn").ontouchend = () => movingLeft = false;
document.getElementById("rightBtn").ontouchstart = () => { if(canMove) movingRight = true; };
document.getElementById("rightBtn").ontouchend = () => movingRight = false;

// Hahmon päivitys
function update() {
  if(!inBar){
    const speed = 2;
    let walking = false;

    if (movingRight) {
      playerX += speed;
      facing = "right";
      walking = true;
    }

    if (movingLeft && playerX > WORLD_LEFT) {
      playerX -= speed;
      facing = "left";
      walking = true;
    }

    if (playerX < WORLD_LEFT) playerX = WORLD_LEFT;
    if (playerX > PUB_DOOR_X) playerX = PUB_DOOR_X; // estetään liikkuminen pubin oven yli

    // Hahmo pysyy keskellä viewporttia
    player.style.left = 568 / 2 - player.width / 2 + "px";

    // Parallax
    bgFar.style.backgroundPositionX = -playerX * 0.3 + "px";
    bgMid.style.backgroundPositionX = -playerX * 0.6 + "px";
    bgFront.style.backgroundPositionX = -playerX + "px";

    doorsLayer.style.left = -playerX + "px";

    // Hahmon animaatio
    if (walking) {
      walkFrame++;
      const f = Math.floor(walkFrame / 10) % 4;
      if (f === 0) player.src = `images/character/walk_${facing}_1.png`;
      else if (f === 1) player.src = `images/character/idle_${facing}.png`;
      else if (f === 2) player.src = `images/character/walk_${facing}_2.png`;
      else player.src = `images/character/idle_${facing}.png`;
    } else {
      player.src = `images/character/idle_${facing}.png`;
      walkFrame = 0;
    }

    // Tarkista pubin ovelle siirtyminen
    if(playerX >= PUB_DOOR_X && !enteringPub){
      enteringPub = true;
      canMove = false;
      setTimeout(() => {
        enterPub();
      }, 2000); // 2s viive ovella
    }
  }

  requestAnimationFrame(update);
}

update();

// PUBIIN SIIRTYMINEN JA BAARIN LOGIIKKA
function enterPub(){
  inBar = true;
  document.getElementById("controls").classList.add("hidden");

  // Piilotetaan ulko-UI ja näytetään baarin kuvat
  bgFar.style.display = "none";
  bgMid.style.display = "none";
  bgFront.style.display = "none";
  doorsLayer.style.display = "none";
  player.style.display = "none";

  // Näytetään baarin kuvat
  let barStage = 1;
  const barDiv = document.createElement("div");
  barDiv.id = "barDiv";
  barDiv.style.position = "absolute";
  barDiv.style.width = "568px";
  barDiv.style.height = "320px";
  barDiv.style.top = "0";
  barDiv.style.left = "0";
  barDiv.style.backgroundSize = "contain";
  barDiv.style.backgroundRepeat = "no-repeat";
  viewport.appendChild(barDiv);

  const textDiv = document.createElement("div");
  textDiv.id = "barText";
  textDiv.style.position = "absolute";
  textDiv.style.width = "100%";
  textDiv.style.bottom = "10px";
  textDiv.style.color = "white";
  textDiv.style.fontFamily = "sans-serif";
  textDiv.style.fontSize = "16px";
  viewport.appendChild(textDiv);

  const inputDiv = document.createElement("div");
  inputDiv.style.position = "absolute";
  inputDiv.style.width = "100%";
  inputDiv.style.bottom = "50px";
  inputDiv.style.display = "none";
  viewport.appendChild(inputDiv);

  const input = document.createElement("input");
  input.type = "text";
  input.style.width = "60%";
  inputDiv.appendChild(input);

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Tiskille";
  inputDiv.appendChild(submitBtn);

  // Näytä bar1 ensin
  barDiv.style.backgroundImage = "url('images/bar/enter.png')";
  textDiv.textContent = "Hei, me ollaan täällä!! Käy vaan tiskille eka!";

  const nextStage = () => {
    if(barStage === 1){
      // Siirrytään bar2
      barStage = 2;
      barDiv.style.backgroundImage = "url('images/bar/bartender.png')";
      textDiv.textContent = "Mitä saisi olla?";
      inputDiv.style.display = "block";
      input.value = "";
    } else if(barStage === 2){
      // Tarkistetaan tilaus
      const order = input.value.toLowerCase();
      const keywordsNumber = ["6","kuusi"];
      const keywordsBeer = ["4chiefs-lager","4chiefs lager","4chiefslager"];
      let hasNumber = keywordsNumber.some(k=>order.includes(k));
      let hasBeer = keywordsBeer.some(k=>order.includes(k));
      if(!hasNumber && !hasBeer){
        const msgs = ["Eihän sellaista kukaan juo!","Hmm, ei oikein kelpaa.","Ei kai sentään sellaista halua!"];
        textDiv.textContent = msgs[Math.floor(Math.random()*msgs.length)];
      } else if(hasNumber && !hasBeer || !hasNumber && hasBeer){
        const msgs = ["Joo, melkein, mutta joku tässä vielä mättää.","Haa, melkein oikein, mutta jotain puuttuu.","Kokeile uudestaan, vielä ei täysin oikein"];
        textDiv.textContent = msgs[Math.floor(Math.random()*msgs.length)];
      } else if(hasNumber && hasBeer){
        // oikein
        barStage = 3;
        inputDiv.style.display = "none";
        textDiv.textContent = "Tuon juomat pöytään!";
        barDiv.style.backgroundImage = "url('images/bar/win.png')";
        music.loop = false; // musiikki ei enää loopaa
      }
    }
  };

  submitBtn.onclick = nextStage;
}
