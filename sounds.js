/* sounds.js */

/* OYUN SESLERİ */
const Sounds = {
  ambient: new Audio("ambient.mp3"),  // arka plan korku sesi
  door: new Audio("door.mp3"),        // kapı açma sesi
  key: new Audio("key.mp3"),          // anahtar toplama sesi
  jumpscare: new Audio("jumpscare.mp3"), // jumpscare sesi
  monster: new Audio("monster.mp3"),  // monster nefes/fısıltı
  click: new Audio("click.mp3"),      // UI click sesi

  /* SES ÇALMA */
  play(name){
    if(this[name]){
      this[name].currentTime=0;
      this[name].play();
    }
  },

  /* SESİ DURDURMA */
  stop(name){
    if(this[name]){
      this[name].pause();
      this[name].currentTime=0;
    }
  },

  /* SES VOLUME AYARI */
  setVolume(name,vol){
    if(this[name]){
      this[name].volume = Math.min(1,Math.max(0,vol));
    }
  }
};

/* AUTOPLAY AMBIENT */
Sounds.ambient.loop = true;
Sounds.ambient.volume = 0.3;
Sounds.ambient.play().catch(e=>{
  console.log("Ambient sound play blocked:", e);
});
