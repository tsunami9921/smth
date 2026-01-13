/* ios.js */

/* iOS TOUCH CONTROLS */
const iOS = {
  initTouchControls: function(){
    const joystick = document.getElementById("joystick");
    const jumpBtn = document.getElementById("jumpBtn");

    if(!joystick || !jumpBtn) return;

    // Joystick hareketi
    joystick.addEventListener("touchmove", e=>{
      const t = e.touches[0];
      Joystick.x = (t.clientX - joystick.offsetLeft - joystick.offsetWidth/2)/50;
      Joystick.y = (t.clientY - joystick.offsetTop - joystick.offsetHeight/2)/50;
    });

    joystick.addEventListener("touchend", e=>{
      Joystick.x = 0;
      Joystick.y = 0;
    });

    // Jump button
    jumpBtn.addEventListener("touchstart", ()=>{
      Joystick.jump = true;
      setTimeout(()=>Joystick.jump=false,200);
    });
  }
};
