// Neon Hustler – Online (Supabase, ohne Anmeldung: Spieler-Code + geheimer Schlüssel)
(function(){
  const URL='https://nsrgsrbmmxvftkevwgdq.supabase.co',KEY='sb_publishable_u-0FDsQzTWDNMUnDRaThgw_LRdZXpCC';
  const LS='nh_online';
  let ON=(()=>{try{return JSON.parse(localStorage.getItem(LS))||null;}catch(e){return null;}})();
  const saveOn=()=>{try{localStorage.setItem(LS,JSON.stringify(ON));}catch(e){}};
  async function rpc(fn,args){const r=await fetch(URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(args||{})});
    const txt=await r.text();let d=null;try{d=txt?JSON.parse(txt):null;}catch(e){d=txt;}
    if(!r.ok)throw new Error((d&&d.message)||('HTTP '+r.status));return d;}
  function newSecret(){const a=new Uint8Array(24);crypto.getRandomValues(a);return Array.from(a,b=>b.toString(16).padStart(2,'0')).join('');}
  const $=id=>document.getElementById(id);
  let busy=false,lastSync=0,msg='';
  async function register(name){name=(name||'').trim();if(name.length<3||name.length>16){msg='Name: 3–16 Zeichen';render();return;}
    busy=true;msg='Erstelle Profil …';render();
    try{const secret=newSecret();const code=await rpc('nh_register',{p_name:name,p_secret:secret});ON={code,secret,name};saveOn();msg='Profil erstellt!';await sync(true);}
    catch(e){msg='Fehler: '+e.message;}busy=false;render();}
  async function sync(manual){if(!ON||!window.NH_GAME||!NH_GAME.inGame())return;const s=NH_GAME.stats();
    try{await rpc('nh_sync',{p_code:ON.code,p_secret:ON.secret,p_name:ON.name,p_faction:s.faction||null,p_lvl:s.lvl,p_prestige:s.prestige,p_loot:Math.round(s.loot),p_heists:s.heists,p_vault:0,p_save:NH_GAME.snap()});
      lastSync=Date.now();if(manual){msg='Gesichert ✔';NH_GAME.toast('ONLINE GESICHERT');}}
    catch(e){if(manual)msg='Sichern fehlgeschlagen: '+e.message;}render();}
  async function transfer(key){const m=(key||'').trim().match(/^(NH-[A-Z0-9]{6})[:\s]+([a-f0-9]{48})$/i);if(!m){msg='Ungültiger Übertragungs-Schlüssel';render();return;}
    busy=true;msg='Lade Spielstand …';render();
    try{const code=m[1].toUpperCase(),secret=m[2].toLowerCase();const d=await rpc('nh_load',{p_code:code,p_secret:secret});
      ON={code,secret,name:ON&&ON.code===code?ON.name:'Spieler'};saveOn();
      if(d){NH_GAME.writeSave(d);msg='Geladen – Spiel startet neu …';render();setTimeout(()=>location.reload(),900);return;}
      msg='Kein Spielstand online gefunden.';}
    catch(e){msg=e.message==='auth'||/auth/.test(e.message)?'Code oder Schlüssel falsch':'Fehler: '+e.message;}busy=false;render();}
  function render(){const el=$('onl');if(!el)return;
    const head='<div style="font-size:12px;color:#7ff6ff;margin-bottom:6px">🌐 ONLINE</div>';
    if(!ON){el.innerHTML=head+`<div class="onrow"><input id="onName" maxlength="16" placeholder="Dein Spielername" autocomplete="off"><button type="button" id="onReg" ${busy?'disabled':''}>Profil erstellen</button></div>
      <details class="ondet"><summary>Spielstand von anderem Gerät holen</summary><div class="onrow"><input id="onKey" placeholder="NH-XXXXXX:schlüssel"><button type="button" id="onTr">Laden</button></div></details>
      <div class="onmsg">${msg||'Ohne E-Mail: Du bekommst einen Spieler-Code für Freunde und Ranglisten.'}</div>`;}
    else{const ago=lastSync?Math.round((Date.now()-lastSync)/60000):null;
      el.innerHTML=head+`<div class="oncode"><small>DEIN SPIELER-CODE (für Freunde)</small><b>${ON.code}</b><span>${ON.name}</span></div>
      <div class="onrow"><button type="button" id="onSync" ${busy?'disabled':''}>☁ Jetzt sichern</button><button type="button" id="onCopy">🔑 Übertragungs-Schlüssel kopieren</button></div>
      <details class="ondet"><summary>Spielstand von anderem Gerät holen</summary><div class="onrow"><input id="onKey" placeholder="NH-XXXXXX:schlüssel"><button type="button" id="onTr">Laden</button></div></details>
      <div class="onmsg">${msg||(ago===null?'Wird automatisch alle 2 Minuten gesichert.':'Zuletzt gesichert vor '+ago+' min · automatisch alle 2 min')}</div>`;}
    const r=$('onReg');if(r)r.onclick=()=>register($('onName').value);
    const s=$('onSync');if(s)s.onclick=()=>{msg='Sichere …';render();sync(true);};
    const c=$('onCopy');if(c)c.onclick=async()=>{const k=ON.code+':'+ON.secret;try{await navigator.clipboard.writeText(k);msg='Kopiert! Den Schlüssel geheim halten – damit lädt man deinen Spielstand.';}catch(e){msg='Schlüssel: '+k;}render();};
    const tr=$('onTr');if(tr)tr.onclick=()=>transfer($('onKey').value);
  }
  const st=document.createElement('style');st.textContent=`
    .onrow{display:flex;gap:6px;margin:4px 0}.onrow input{flex:1;min-width:0;background:#0b0616;border:1px solid #4b3a6e;color:#fff;border-radius:6px;padding:8px;font-family:'Oswald',sans-serif;font-size:14px}
    .onrow button{background:#2fe0ea;border:2px solid #000;color:#000;font-family:'Oswald',sans-serif;font-weight:700;font-size:12px;padding:6px 8px;border-radius:6px;cursor:pointer}.onrow button:disabled{opacity:.4}
    .oncode{background:#0b0616;border:2px solid #ffe14d;border-radius:8px;padding:6px 10px;text-align:center}.oncode small{display:block;font-size:10px;color:#7ff6ff}.oncode b{display:block;font-family:'Bangers',cursive;font-size:30px;letter-spacing:3px;color:#ffe14d}.oncode span{font-size:12px;color:#cbbbe6}
    .ondet{font-size:12px;color:#cbbbe6;margin-top:4px}.ondet summary{cursor:pointer}.onmsg{font-size:11px;color:#cbbbe6;margin-top:4px}`;
  document.head.appendChild(st);
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='gear')setTimeout(render,50);},true);
  setInterval(()=>sync(false),120000);
  window.addEventListener('pagehide',()=>{if(ON&&window.NH_GAME&&NH_GAME.inGame()){const s=NH_GAME.stats();try{fetch(URL+'/rest/v1/rpc/nh_sync',{method:'POST',keepalive:true,headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_code:ON.code,p_secret:ON.secret,p_name:ON.name,p_faction:s.faction||null,p_lvl:s.lvl,p_prestige:s.prestige,p_loot:Math.round(s.loot),p_heists:s.heists,p_vault:0,p_save:NH_GAME.snap()})});}catch(e){}}});
  render();
  window.NH_ONLINE={rpc,get me(){return ON;},sync};
})();
