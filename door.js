/* door.js */

/* DOOR SYSTEM */
const Door = {
  doors: [], // Tüm kapılar burada tutulacak

  /* Kapı kaydı */
  register(door){
    // door = {id:"door1", locked:true, opened:false, element:HTMLDivElement}
    this.doors.push(door);
  },

  /* Kapıyı aç */
  open(doorId){
    const d = this.doors.find(x => x.id === doorId);
    if(d && !d.locked && !d.opened){
      d.opened = true;
      if(d.element) d.element.style.backgroundColor = "green"; // örnek görsel efekt
      Sounds.play("door");
      console.log("Door opened:", doorId);
    }else if(d && d.locked){
      console.log("Door is locked:", doorId);
      if(d.element) d.element.style.backgroundColor = "red"; // kilitli kapı
    }
  },

  /* Kapıyı kilitle */
  lock(doorId){
    const d = this.doors.find(x => x.id === doorId);
    if(d){
      d.locked = true;
      console.log("Door locked:", doorId);
      if(d.element) d.element.style.backgroundColor = "red";
    }
  },

  /* Kapıyı unlock et */
  unlock(doorId){
    const d = this.doors.find(x => x.id === doorId);
    if(d){
      d.locked = false;
      console.log("Door unlocked:", doorId);
      if(d.element) d.element.style.backgroundColor = "yellow";
    }
  }
};

/* ÖRNEK KULLANIM (game.js'de kullanılabilir)
Door.register({id:"door1", locked:true, opened:false, element:document.getElementById("door1")});
Door.unlock("door1");
Door.open("door1");
*/
