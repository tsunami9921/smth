/* key.js */

/* KEY SYSTEM */
const Key = {
  keys: [], // Tüm anahtarlar burada tutulacak

  /* Anahtar kaydı */
  register(key){
    // key = {id:"key1", collected:false, element:HTMLDivElement}
    this.keys.push(key);
  },

  /* Anahtarı toplama */
  collect(keyId){
    const k = this.keys.find(x => x.id === keyId);
    if(k && !k.collected){
      k.collected = true;
      Sounds.play("key"); // anahtar sesi
      if(k.element) k.element.style.display="none"; // element görünmez yap
      console.log("Key collected:", keyId);
      showMsg("You collected a key!"); // game.js mesaj fonksiyonu
    } else if(k && k.collected){
      console.log("Key already collected:", keyId);
    }
  },

  /* Anahtar durumunu kontrol et */
  hasKey(keyId){
    const k = this.keys.find(x=>x.id===keyId);
    return k ? k.collected : false;
  },

  /* Tüm anahtarları toplandı mı? */
  allCollected(){
    return this.keys.every(k => k.collected);
  }
};

/* Örnek kullanım (game.js içinde)
Key.register({id:"key1", collected:false, element:document.getElementById("key1")});
Key.collect("key1");
if(Key.allCollected()){ Door.unlock("finalDoor"); }
*/
