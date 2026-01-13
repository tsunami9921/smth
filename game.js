/* game.js */

/* ===== GAME STATE ===== */
let flashlightOn = false;
let micOn = false;
let micLevel = 0;
let playerNoise = 0;
let monsterDistance = 100;
let hasKey = false;
let gameOver = false;

/* THREE.JS SCENE */
let scene, camera, renderer;
let flashlight;
let monster, keys = [], doors = [];

/* INIT 3D SCENE */
function startGame(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0,1.6,0); // FPS height

  renderer = new THREE.WebGLRenderer({canvas:document.getElementById("gameCanvas")});
  renderer.setSize(window.innerWidth, window.innerHeight);

  /* LIGHTS */
  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);

  flashlight = new THREE.SpotLight(0xffffff,1,10,Math.PI/6,0.5);
  flashlight.position.set(0,1.6,0);
  flashlight.target.position.set(0,1.6,-1);
  flashlight.visible = false;
  scene.add(flashlight);
  scene.add(flashlight.target);

  /* FLOOR */
  const floorGeo = new THREE.BoxGeometry(20,0.1,20);
  const floorMat = new THREE.MeshStandardMaterial({color:0x111111});
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = 0;
  scene.add(floor);

  /* WALLS (SIMPLE CUBE) */
  const wallMat = new THREE.MeshStandardMaterial({color:0x222222});
  const wall1 = new THREE.Mesh(new THREE.BoxGeometry(20,3,0.2), wallMat);
  wall1.position.set(0,1.5,-10);
  scene.add(wall1);
  const wall2 = new THREE.Mesh(new THREE.BoxGeometry(20,3,0.2), wallMat);
  wall2.position.set(0,1.5,10);
  scene.add(wall2);
  const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.2,3,20), wallMat);
  wall3.position.set(-10,1.5,0);
  scene.add(wall3);
  const wall4 = new THREE.Mesh(new THREE.BoxGeometry(0.2,3,20), wallMat);
  wall4.position.set(10,1.5,0);
  scene.add(wall4);

  /* MONSTER */
  const monsterGeo = new THREE.BoxGeometry(0.8,1.8,0.8);
  const monsterMat = new THREE.MeshStandardMaterial({color:0xff0000});
  monster = new THREE.Mesh(monsterGeo, monsterMat);
  monster.position.set(5,0.9,5);
  scene.add(monster);

  /* KEYS */
  const keyGeo = new THREE.BoxGeometry(0.2,0.2,0.2);
  const keyMat = new THREE.MeshStandardMaterial({color:0xffff00});
  const key1 = new THREE.Mesh(keyGeo,keyMat);
  key1.position.set(-5,0.1,-5);
  scene.add(key1);
  keys.push({id:"key1", mesh:key1, collected:false});
  Key.register({id:"key1", collected:false, element:key1});

  /* DOOR */
  const doorGeo = new THREE.BoxGeometry(1,2,0.2);
  const doorMat = new THREE.MeshStandardMaterial({color:0x4444ff});
  const door1 = new THREE.Mesh(doorGeo,doorMat);
  door1.position.set(0,1,9.9);
  scene.add(door1);
  doors.push({id:"door1", mesh:door1, locked:true, opened:false});
  Door.register({id:"door1", locked:true, opened:false, element:door1});

  animate();
}

/* FLASHLIGHT TOGGLE */
document.getElementById("flashBtn").onclick = ()=>{
  flashlightOn = !flashlightOn;
  flashlight.visible = flashlightOn;
};

/* PLAYER MOVEMENT */
let moveForward=false, moveBackward=false, moveLeft=false, moveRight=false;
let velocity = new THREE.Vector3();

document.addEventListener("keydown", e=>{
  if(e.key=="w") moveForward=true;
  if(e.key=="s") moveBackward=true;
  if(e.key=="a") moveLeft=true;
  if(e.key=="d") moveRight=true;
});
document.addEventListener("keyup", e=>{
  if(e.key=="w") moveForward=false;
  if(e.key=="s") moveBackward=false;
  if(e.key=="a") moveLeft=false;
  if(e.key=="d") moveRight=false;
});

/* MOUSE LOOK */
let pitch = 0, yaw = 0;
document.body.addEventListener("click",()=>{document.body.requestPointerLock();});
document.addEventListener("mousemove", e=>{
  if(document.pointerLockElement){
    yaw -= e.movementX*0.002;
    pitch -= e.movementY*0.002;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  }
});

/* GAME LOOP */
function animate(){
  requestAnimationFrame(animate);

  // PLAYER POSITION UPDATE
  let direction = new THREE.Vector3();
  if(moveForward) direction.z -= 0.1;
  if(moveBackward) direction.z += 0.1;
  if(moveLeft) direction.x -= 0.1;
  if(moveRight) direction.x += 0.1;

  // Joystick
  direction.x += Joystick.x*0.1;
  direction.z += Joystick.y*0.1;
  if(Joystick.jump) velocity.y = 0.2;

  velocity.x += direction.x;
  velocity.z += direction.z;

  // Update camera
  camera.position.x += velocity.x;
  camera.position.z += velocity.z;
  camera.position.y = 1.6;
  velocity.multiplyScalar(0.8); // friction

  // Camera rotation
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  // Flashlight follows camera
  flashlight.position.copy(camera.position);
  flashlight.target.position.set(
    camera.position.x + Math.sin(yaw),
    camera.position.y + Math.sin(pitch),
    camera.position.z + Math.cos(yaw)
  );

  // KEY COLLISION
  keys.forEach(k=>{
    if(!k.collected && camera.position.distanceTo(k.mesh.position)<0.5){
      Key.collect(k.id);
      k.collected=true;
      scene.remove(k.mesh);
    }
  });

  // DOOR COLLISION
  doors.forEach(d=>{
    if(camera.position.distanceTo(d.mesh.position)<1){
      if(Key.allCollected() && d.locked){
        Door.unlock(d.id);
        d.mesh.material.color.set(0x00ff00);
      }
    }
  });

  // MONSTER AI
  let monsterDir = new THREE.Vector3(camera.position.x - monster.position.x,0,camera.position.z - monster.position.z);
  if(playerNoise>0 && !gameOver){
    monsterDir.normalize();
    monster.position.add(monsterDir.multiplyScalar(playerNoise*0.01));
    if(monster.position.distanceTo(camera.position)<1){
      endGame("JUMPSCARE! GAME OVER");
      Sounds.play("jumpscare");
    }
  }

  renderer.render(scene,camera);
}

/* END GAME */
function endGame(msg){
  gameOver=true;
  document.getElementById("msg").innerText=msg;
  document.getElementById("msg").style.display="block";
  console.log(msg);
}
