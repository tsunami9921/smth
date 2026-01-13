/* game.js - FULL 3D HORROR FPS */

// ======================= GAME STATE =======================
let flashlightOn = false;
let micOn = true;
let micLevel = 0;
let playerNoise = 0;
let gameOver = false;
let velocity = new THREE.Vector3();
let yaw = 0, pitch = 0;

// ======================= THREE.JS SETUP =======================
let scene, camera, renderer;
let flashlight;
let monster;
let keys = [];
let doors = [];
let objects = []; // mobilyalar

function startGame() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0,1.6,0);

    // Renderer
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById("gameCanvas")});
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lights
    const ambient = new THREE.AmbientLight(0x222222);
    scene.add(ambient);

    flashlight = new THREE.SpotLight(0xffffff,1,15,Math.PI/6,0.5);
    flashlight.position.set(0,1.6,0);
    flashlight.target.position.set(0,1.6,-1);
    flashlight.visible = flashlightOn;
    scene.add(flashlight);
    scene.add(flashlight.target);

    // Small lamps (optional mood lights)
    const lamp1 = new THREE.PointLight(0xffaa00,0.5,5);
    lamp1.position.set(2,2,2); scene.add(lamp1);
    const lamp2 = new THREE.PointLight(0xffaa00,0.5,5);
    lamp2.position.set(-3,2,-3); scene.add(lamp2);

    // ======================= FLOOR & WALLS =======================
    const floorMat = new THREE.MeshStandardMaterial({color:0x111111});
    const floor = new THREE.Mesh(new THREE.BoxGeometry(30,0.1,30), floorMat);
    floor.position.y = 0;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({color:0x222222});
    // Walls
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(30,3,0.2), wallMat); wall1.position.set(0,1.5,-15); scene.add(wall1);
    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(30,3,0.2), wallMat); wall2.position.set(0,1.5,15); scene.add(wall2);
    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.2,3,30), wallMat); wall3.position.set(-15,1.5,0); scene.add(wall3);
    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(0.2,3,30), wallMat); wall4.position.set(15,1.5,0); scene.add(wall4);

    // ======================= ROOMS =======================
    // Room1
    const room1 = new THREE.Mesh(new THREE.BoxGeometry(10,2.5,10), new THREE.MeshStandardMaterial({color:0x333333}));
    room1.position.set(-5,1.25,-5); scene.add(room1); objects.push(room1);
    // Room2
    const room2 = new THREE.Mesh(new THREE.BoxGeometry(10,2.5,10), new THREE.MeshStandardMaterial({color:0x444444}));
    room2.position.set(5,1.25,-5); scene.add(room2); objects.push(room2);
    // Room3
    const room3 = new THREE.Mesh(new THREE.BoxGeometry(10,2.5,10), new THREE.MeshStandardMaterial({color:0x555555}));
    room3.position.set(-5,1.25,5); scene.add(room3); objects.push(room3);
    // Room4
    const room4 = new THREE.Mesh(new THREE.BoxGeometry(10,2.5,10), new THREE.MeshStandardMaterial({color:0x666666}));
    room4.position.set(5,1.25,5); scene.add(room4); objects.push(room4);

    // ======================= DOORS =======================
    const doorMat = new THREE.MeshStandardMaterial({color:0x0000ff});
    const door1 = new THREE.Mesh(new THREE.BoxGeometry(1,2,0.2), doorMat); door1.position.set(0,1,-10); scene.add(door1);
    const door2 = new THREE.Mesh(new THREE.BoxGeometry(1,2,0.2), doorMat); door2.position.set(0,1,10); scene.add(door2);

    Door.register({id:"door1",locked:true,opened:false,element:door1});
    Door.register({id:"door2",locked:true,opened:false,element:door2});
    doors.push(door1,door2);

    // ======================= KEYS =======================
    const keyMat = new THREE.MeshStandardMaterial({color:0xffff00});
    const key1 = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), keyMat); key1.position.set(-5,0.1,-5); scene.add(key1);
    const key2 = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), keyMat); key2.position.set(5,0.1,-5); scene.add(key2);
    const key3 = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), keyMat); key3.position.set(-5,0.1,5); scene.add(key3);
    const key4 = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), keyMat); key4.position.set(5,0.1,5); scene.add(key4);

    Key.register({id:"key1",collected:false,element:key1});
    Key.register({id:"key2",collected:false,element:key2});
    Key.register({id:"key3",collected:false,element:key3});
    Key.register({id:"key4",collected:false,element:key4});
    keys.push(key1,key2,key3,key4);

    // ======================= MONSTER =======================
    const monsterMat = new THREE.MeshStandardMaterial({color:0xff0000});
    monster = new THREE.Mesh(new THREE.BoxGeometry(0.8,1.8,0.8), monsterMat);
    monster.position.set(10,0.9,10); scene.add(monster);

    // ======================= BAHÇE =======================
    const grassMat = new THREE.MeshStandardMaterial({color:0x00aa00});
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(50,50),grassMat);
    grass.rotation.x = -Math.PI/2; grass.position.set(0,0,-20); scene.add(grass);

    // Ağaç
    const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,2), new THREE.MeshStandardMaterial({color:0x664422}));
    treeTrunk.position.set(-12,1,-22); scene.add(treeTrunk);
    const treeLeaves = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshStandardMaterial({color:0x00aa00}));
    treeLeaves.position.set(-12,2.5,-22); scene.add(treeLeaves);

    // ======================= ANIMATE LOOP =======================
    animate();
}

// ======================= FLASHLIGHT =======================
document.getElementById("flashBtn").onclick = ()=>{
    flashlightOn = !flashlightOn;
    if(flashlight) flashlight.visible = flashlightOn;
};

// ======================= PLAYER MOVEMENT =======================
let moveForward=false, moveBackward=false, moveLeft=false, moveRight=false;

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

// ======================= MOUSE LOOK =======================
document.body.addEventListener("click",()=>{document.body.requestPointerLock();});
document.addEventListener("mousemove", e=>{
    if(document.pointerLockElement){
        yaw -= e.movementX*0.002;
        pitch -= e.movementY*0.002;
        pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    }
});

// ======================= ANIMATE =======================
function animate(){
    requestAnimationFrame(animate);

    if(gameOver) return;

    // PLAYER MOVEMENT
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
    velocity.multiplyScalar(0.8);

    camera.position.add(velocity);
    camera.position.y = 1.6;

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    // Flashlight follows camera
    if(flashlight){
        flashlight.position.copy(camera.position);
        flashlight.target.position.set(
            camera.position.x + Math.sin(yaw),
            camera.position.y + Math.sin(pitch),
            camera.position.z + Math.cos(yaw)
        );
    }

    // ======================= KEY COLLISION =======================
    keys.forEach(k=>{
        if(!k.collected && camera.position.distanceTo(k.position)<0.5){
            Key.collect(k.id);
            k.collected=true;
            scene.remove(k);
        }
    });

    // ======================= DOOR COLLISION =======================
    doors.forEach(d=>{
        if(camera.position.distanceTo(d.position)<1){
            if(Key.allCollected() && d.locked){
                Door.unlock(d.id);
                d.material.color.set(0x00ff00);
                showMsg("Final door unlocked!");
            }
        }
    });

    // ======================= MONSTER AI =======================
    let monsterDir = new THREE.Vector3(camera.position.x - monster.position.x,0,camera.position.z - monster.position.z);
    if(playerNoise>0){
        monsterDir.normalize();
        monster.position.add(monsterDir.multiplyScalar(playerNoise*0.01));
        if(monster.position.distanceTo(camera.position)<1){
            endGame("JUMPSCARE! GAME OVER");
            Sounds.play("jumpscare");
        }
    }

    renderer.render(scene,camera);
}

// ======================= END GAME =======================
function endGame(msg){
    gameOver=true;
    document.getElementById("msg").innerText=msg;
    document.getElementById("msg").style.display="block";
    console.log(msg);
}

// ======================= MESSAGE =======================
function showMsg(text){
    const msg = document.getElementById("msg");
    msg.innerText = text;
    msg.style.display="block";
    setTimeout(()=>{msg.style.display="none";},2000);
}

// ======================= MIC LEVEL SIMULATION =======================
setInterval(()=>{
    if(micOn){
        micLevel = Math.random(); // mock mic input
        document.getElementById("micFill").style.width = (micLevel*100)+"%";
        playerNoise = micLevel; // monster hears noise
    } else {
        document.getElementById("micFill").style.width = "0%";
        playerNoise = 0;
    }
},100);

// ======================= END OF GAME.JS =======================
