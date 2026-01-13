/* joystick.js */

/* JOYSTICK CONTROL */
const Joystick = {
  x:0,    // sol-sağ
  y:0,    // ileri-geri
  jump:false, // zıplama butonu

  init:function(){
    const joystick = document.getElementById("joystick");
    const jumpBtn = document.getElementById("jumpBtn");

    if(!joystick || !jumpBtn) return;

    // Fare ile joystick (desktop test)
    joystick.addEventListener("mousemove", e=>{
      if(e.buttons){
        Joystick.x = (e.offsetX - joystick.offsetWidth/2)/50;
        Joystick.y = (e.offsetY - joystick.offsetHeight/2)/50;
      }
    });

    joystick.addEventListener("mouseleave", ()=>{
      Joystick.x = 0;
      Joystick.y = 0;
    });

    // Jump button (desktop)
    jumpBtn.addEventListener("mousedown", ()=>{
      Joystick.jump = true;
      setTimeout(()=>Joystick.jump=false,200);
    });
    jumpBtn.addEventListener("mouseup", ()=>Joystick.jump=false);
  }
};
