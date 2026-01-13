/* connect.js */

/* BAĞLANTI & MAIN SCREEN */
window.addEventListener("load", ()=>{
  const playBtn = document.getElementById("playBtn");
  const mainscreen = document.getElementById("mainscreen");
  const gameDiv = document.getElementById("game");

  playBtn.addEventListener("click", ()=>{
    Sounds.play("click");

    // Ana ekran gizle, oyun göster
    mainscreen.style.display="none";
    gameDiv.style.display="block";

    // Joystick başlat
    Joystick.init();

    // Mobil platform kontrol
    if(/Android/i.test(navigator.userAgent)){
      Android.initTouchControls();
    }
    if(/iPhone|iPad/i.test(navigator.userAgent)){
      iOS.initTouchControls();
    }

    // Oyun başlat
    if(typeof startGame==="function") startGame();
  });
});
