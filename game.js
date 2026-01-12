/* game.js */

/* ===== GAME STATE ===== */
let flashlightOn = false;
let micOn = false;
let micLevel = 0;
let playerNoise = 0;
let monsterDistance = 100;
let hasKey = false;
let gameOver = false;

/* PLAYER POSITION */
let player = {
  x:0,
  y:0,
  z:0,
  rotationY:0,
  rotationX:0,
  speed:0.1,
  runMultiplier:2,
  crouchMultiplier:0.5,
  jumping:false
};

/* INPUT STATE */
let input = {
  forward:false,
  backward:false,
  left:false,
  right:false,
  run:false,
  crouch:false
};

/* POINTER LOCK */
document.body.addEventListener("click",()=>{
  document.body.requestPointerLock();
});

/* MOUSE LOOK */
document.addEventListener("mousemove", e=>{
  if(document.pointerLockElement){
    player.rotationY += e.movementX * 0.002;
    player.rotationX -= e.movementY * 0.002;
    if(player.rotationX > Math.PI/2) player.rotationX=Math.PI/2;
    if(player.rotationX < -Math.PI/2) player.rotationX=-Math.PI/2;
  }
});

/* KEYBOARD INPUT */
document.addEventListener("keydown", e=>{
  if(e.key==="w") input.forward=true;
  if(e.key==="s") input.backward=true;
  if(e.key==="a") input.left=true;
  if(e.key==="d") input.right=true;
  if(e.key==="Shift") input.run=true;
  if(e.key==="Control") input.crouch=true;
});

document.addEventListener("keyup", e=>{
  if(e.key==="w") input.forward=false;
  if(e.key==="s") input.backward=false;
  if(e.key==="a") input.left=false;
  if(e.key==="d") input.right=false;
  if(e.key==="Shift") input.run=false;
  if(e.key==="Control") input.crouch=false;
});

/* FLASHLIGHT */
const flash = document.getElementById("flashlight");
document.getElementById("flashBtn").onclick=()=>{
  flashlightOn=!flashlightOn;
  flash.style.opacity = flashlightOn ? 1 : 0;
};

/* FLASHLIGHT FLICKER */
setInterval(()=>{
  if(flashlightOn){
    flash.style.opacity = 0.8 + Math.random()*0.2;
  }
},120);

/* MICROPHONE */
const micBtn = document.getElementById("micBtn");
const micFill = document.getElementById("micFill");
let analyser;

micBtn.onclick=async()=>{
  micOn = !micOn;
  micBtn.style.borderColor = micOn ? "red":"#444";
  if(micOn) startMic();
};

/* MICROPHONE INPUT */
function startMic(){
  navigator.mediaDevices.getUserMedia({audio:true})
  .then(stream=>{
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    src.connect(analyser);
  })
  .catch(()=>alert("Microphone access denied!"));
}

/* MONSTER AI LOOP */
setInterval(()=>{
  if(gameOver) return;

  // MIC INPUT
  if(micOn && analyser){
    let data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    micLevel = data.reduce((a,b)=>a+b)/data.length;
    micFill.style.width = Math.min(100,micLevel)+"%";
    playerNoise = micLevel;
  }else{
    micFill.style.width="0%";
    playerNoise=0;
  }

  // MONSTER MOVES TOWARD SOUND
  monsterDistance -= playerNoise*0.02;

  if(monsterDistance < 30 && monsterDistance > 0){
    showMsg("You hear breathing...");
    Sounds.play('monster');
  }

  if(monsterDistance <= 0){
    endGame("JUMPSCARE!\nGAME OVER");
    Sounds.play('jumpscare');
  }
},100);

/* PLAYER MOVEMENT LOOP */
function updatePlayer(){
  if(gameOver) return;
  let speed = player.speed;
  if(input.run) speed *= player.runMultiplier;
  if(input.crouch) speed *= player.crouchMultiplier;

  if(input.forward) player.z += speed;
  if(input.backward) player.z -= speed;
  if(input.left) player.x -= speed;
  if(input.right) player.x += speed;

  // Joystick control
  player.x += Joystick.x*0.01;
  player.z += Joystick.y*0.01;

  // Jump
  if(Joystick.jump && !player.jumping){
    player.jumping = true;
    setTimeout(()=>player.jumping=false, 500);
  }

  requestAnimationFrame(updatePlayer);
}
updatePlayer();

/* KEY & DOOR SIMULATION */
setTimeout(()=>{
  hasKey=true;
  showMsg("You found a key!");
  Sounds.play('key');
},15000);

setTimeout(()=>{
  if(hasKey && !gameOver){
    endGame("YOU ESCAPED!");
    Sounds.play('door');
  }
},30000);

/* UI HELPERS */
function showMsg(t){
  const m=document.getElementById("msg");
  m.innerText = t;
  m.style.display="block";
  setTimeout(()=>{ if(!gameOver) m.style.display="none"; },3000);
}

function endGame(t){
  gameOver=true;
  const m=document.getElementById("msg");
  m.innerText=t;
  m.style.display="block";
}
