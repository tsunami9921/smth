/* ===== GAME STATE ===== */
let flashlightOn = false;
let micOn = false;
let micLevel = 0;
let playerNoise = 0;
let monsterDistance = 100;
let hasKey = false;
let gameOver = false;

/* POINTER LOCK */
document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

/* FLASHLIGHT */
const flash = document.getElementById("flashlight");
document.getElementById("flashBtn").onclick = () => {
  flashlightOn = !flashlightOn;
  flash.style.opacity = flashlightOn ? 1 : 0;
};

/* FLASHLIGHT FLICKER */
setInterval(() => {
  if (flashlightOn) {
    flash.style.opacity = 0.8 + Math.random() * 0.2;
  }
}, 120);

/* MICROPHONE */
const micBtn = document.getElementById("micBtn");
const micFill = document.getElementById("micFill");
let analyser;

micBtn.onclick = async () => {
  micOn = !micOn;
  micBtn.style.borderColor = micOn ? "red" : "#444";
  if (micOn) startMic();
};

/* MIC INPUT */
function startMic() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    src.connect(analyser);
  }).catch(() => {
    alert("Microphone access denied!");
  });
}

/* MONSTER AI LOOP */
setInterval(() => {
  if (gameOver) return;

  if (micOn && analyser) {
    let data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    micLevel = data.reduce((a, b) => a + b) / data.length;
    micFill.style.width = Math.min(100, micLevel) + "%";
    playerNoise = micLevel;
  } else {
    micFill.style.width = "0%";
    playerNoise = 0;
  }

  /* MONSTER MOVES TOWARD SOUND */
  monsterDistance -= playerNoise * 0.02;

  if (monsterDistance < 30 && monsterDistance > 0) {
    showMsg("You hear breathing...");
  }

  if (monsterDistance <= 0) {
    endGame("JUMPSCARE!\nGAME OVER");
  }
}, 100);

/* KEY PICKUP (SIMULATION) */
setTimeout(() => {
  hasKey = true;
  showMsg("You found a key");
}, 15000);

/* EXIT DOOR (SIMULATION) */
setTimeout(() => {
  if (hasKey && !gameOver) {
    endGame("YOU ESCAPED!");
  }
}, 30000);

/* UI HELPERS */
function showMsg(text) {
  const m = document.getElementById("msg");
  m.innerText = text;
  m.style.display = "block";
  setTimeout(() => {
    if (!gameOver) m.style.display = "none";
  }, 3000);
}

function endGame(text) {
  gameOver = true;
  const m = document.getElementById("msg");
  m.innerText = text;
  m.style.display = "block";
}
