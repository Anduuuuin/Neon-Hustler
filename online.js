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
    try{await rpc('nh_sync',{p_code:ON.code,p_secret:ON.secret,p_name:ON.name,p_faction:s.faction||null,p_lvl:s.lvl,p_prestige:s.prestige,p_loot:Math.round(s.loot),p_heists:s.heists,p_vault:Math.max(0,Math.round(s.cash||0)),p_save:NH_GAME.snap()});
      lastSync=Date.now();checkRaids();if(manual){msg='Gesichert ✔';NH_GAME.toast('ONLINE GESICHERT');}}
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
      <div class="onrow"><button type="button" id="onNet" style="flex:1;background:#ffe14d">🌐 Netzwerk: Rangliste · Freunde · Fraktionskrieg</button></div>
      <details class="ondet"><summary>Spielstand von anderem Gerät holen</summary><div class="onrow"><input id="onKey" placeholder="NH-XXXXXX:schlüssel"><button type="button" id="onTr">Laden</button></div></details>
      <div class="onmsg">${msg||(ago===null?'Wird automatisch alle 2 Minuten gesichert.':'Zuletzt gesichert vor '+ago+' min · automatisch alle 2 min')}</div>`;}
    const r=$('onReg');if(r)r.onclick=()=>register($('onName').value);
    const s=$('onSync');if(s)s.onclick=()=>{msg='Sichere …';render();sync(true);};
    const c=$('onCopy');if(c)c.onclick=async()=>{const k=ON.code+':'+ON.secret;try{await navigator.clipboard.writeText(k);msg='Kopiert! Den Schlüssel geheim halten – damit lädt man deinen Spielstand.';}catch(e){msg='Schlüssel: '+k;}render();};
    const tr=$('onTr');if(tr)tr.onclick=()=>transfer($('onKey').value);
    const nn=$('onNet');if(nn)nn.onclick=()=>{const so=document.getElementById('setov');if(so)so.classList.remove('on');open();};
  }
  const st=document.createElement('style');st.textContent=`
    .onrow{display:flex;gap:6px;margin:4px 0}.onrow input{flex:1;min-width:0;background:#0b0616;border:1px solid #4b3a6e;color:#fff;border-radius:6px;padding:8px;font-family:'Oswald',sans-serif;font-size:14px}
    .onrow button{background:#2fe0ea;border:2px solid #000;color:#000;font-family:'Oswald',sans-serif;font-weight:700;font-size:12px;padding:6px 8px;border-radius:6px;cursor:pointer}.onrow button:disabled{opacity:.4}
    .oncode{background:#0b0616;border:2px solid #ffe14d;border-radius:8px;padding:6px 10px;text-align:center}.oncode small{display:block;font-size:10px;color:#7ff6ff}.oncode b{display:block;font-family:'Bangers',cursive;font-size:30px;letter-spacing:3px;color:#ffe14d}.oncode span{font-size:12px;color:#cbbbe6}
    .ondet{font-size:12px;color:#cbbbe6;margin-top:4px}.ondet summary{cursor:pointer}.onmsg{font-size:11px;color:#cbbbe6;margin-top:4px}`;
  document.head.appendChild(st);
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='gear')setTimeout(render,50);},true);
  setInterval(()=>sync(false),120000);
  window.addEventListener('pagehide',()=>{if(ON&&window.NH_GAME&&NH_GAME.inGame()){const s=NH_GAME.stats();try{fetch(URL+'/rest/v1/rpc/nh_sync',{method:'POST',keepalive:true,headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_code:ON.code,p_secret:ON.secret,p_name:ON.name,p_faction:s.faction||null,p_lvl:s.lvl,p_prestige:s.prestige,p_loot:Math.round(s.loot),p_heists:s.heists,p_vault:Math.max(0,Math.round(s.cash||0)),p_save:NH_GAME.snap()})});}catch(e){}}});
  // ---------- Netzwerk: Rangliste, Freunde, Fraktionskrieg, Überfälle ----------
  const FN={kartell:['Los Cuchillos','#4f8bff'],neon:['Neon Kings','#ff3d8b'],syndikat:['Crane-Syndikat','#b18bff']};
  const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1000?Math.round(n/100)/10+'k':String(n);
  let tab='rank',rankBy='lvl',cache={},nmsg='';
  const ov=document.createElement('div');ov.id='netov';ov.innerHTML='<div class="netp" id="netp"></div>';document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)close();});
  function open(t){if(t)tab=t;ov.classList.add('on');if(!ON){draw();return;}load();}
  function close(){ov.classList.remove('on');}
  async function load(){nmsg='Lade …';draw();
    try{if(tab==='rank')cache.rank=await rpc('nh_leaderboard',{p_by:rankBy});
      if(tab==='friends')cache.friends=await rpc('nh_friend_list',{p_code:ON.code,p_secret:ON.secret});
      if(tab==='war')cache.war=await rpc('nh_faction_standings',{});
      if(tab==='gang'){cache.gang=await rpc('nh_gang_info',{p_code:ON.code,p_secret:ON.secret});cache.granks=await rpc('nh_gang_ranking',{});}
      if(tab==='rev')cache.rev=await rpc('nh_revenge_list',{p_code:ON.code,p_secret:ON.secret});nmsg='';}
    catch(e){nmsg=/nh_gang|nh_revenge|function|404/i.test(e.message)?'Supabase-Update (v5) fehlt noch.':'Keine Verbindung: '+e.message;}draw();}
  function draw(){const P=document.getElementById('netp');let body='';
    if(!ON){body='<div class="nnote">Erstelle zuerst ein Online-Profil: Zahnrad → 🌐 ONLINE → Spielername eingeben.</div>';}
    else if(tab==='rank'){const L=cache.rank||[];body=`<div class="nsw"><button type="button" class="${rankBy==='lvl'?'on':''}" data-rb="lvl">Stufe</button><button type="button" class="${rankBy==='loot'?'on':''}" data-rb="loot">Beute</button></div>`+
      L.map((p,i)=>`<div class="nrow ${p.code===ON.code?'me':''}"><i>${i+1}</i><div><b>${esc(p.name)}</b><small>${p.faction?`<span style="color:${FN[p.faction][1]}">${FN[p.faction][0]}</span> · `:''}${p.code}</small></div><span>${rankBy==='loot'?'$'+fmt(p.loot_total):'Stufe '+p.lvl+(p.prestige?' ★'+p.prestige:'')}</span></div>`).join('')||'<div class="nnote">Noch niemand da.</div>';}
    else if(tab==='friends'){const L=cache.friends||[];body=`<div class="nnote">Dein Code: <b style="color:#ffe14d">${ON.code}</b> – gib ihn an Freunde weiter.</div><div class="nadd"><input id="nfc" placeholder="Freundes-Code NH-XXXXXX" maxlength="9"><button type="button" id="nfa">Hinzufügen</button></div>`+
      L.map(f=>`<div class="nrow"><div><b>${esc(f.name)}</b><small>${f.faction?`<span style="color:${FN[f.faction][1]}">${FN[f.faction][0]}</span> · `:''}Stufe ${f.lvl} · Tresor ~$${fmt(f.vault)}</small></div>${f.shielded?'<span class="shd">🛡 Schutz</span>':f.vault>0?`<button type="button" data-raid="${f.code}">ÜBERFALLEN</button>`:'<span class="shd">leer</span>'}</div>`).join('')+(L.length?'':'<div class="nnote">Noch keine Freunde. Code eingeben und los!</div>')+
      '<div class="nnote small">Überfall = Einsatz im Versteck deines Freundes. Schaffst du die Flucht, klaust du 15 % aus seinem Tresor (sein Bargeld). Danach hat er Schutz: tagsüber (6–19 Uhr) 3 Stunden, nachts bis 6 Uhr morgens.</div>';}
    else if(tab==='war'){const L=cache.war||[];const tot=L.reduce((s,x)=>s+Number(x.points),0)||1;const me=NH_GAME.stats().faction;
      body=`<div class="nnote">Jede Woche kämpfen die Fraktionen um die Stadt. Jeder erfolgreiche Einsatz bringt deiner Fraktion Punkte.${me?'':' <b>Tritt einer Fraktion bei, um mitzumachen.</b>'}</div>`+
      ['kartell','neon','syndikat'].map(f=>{const x=L.find(y=>y.faction===f);const p=x?Number(x.points):0;return `<div class="nwar ${me===f?'me':''}"><b style="color:${FN[f][1]}">${FN[f][0]}${me===f?' (du)':''}</b><div class="pb"><i style="width:${p/tot*100}%;background:${FN[f][1]}"></i></div><small>${fmt(p)} Punkte</small></div>`;}).join('');}
    else if(tab==='gang'){const G=cache.gang,cash=NH_GAME.stats().cash;
      if(!G)body=`<div class="nnote">Gründe eine Gang mit bis zu 5 Leuten: gemeinsamer Gang-Tresor und eigene Gang-Rangliste.</div>
        <div class="nadd"><input id="ggn" placeholder="Gang-Name" maxlength="20"><input id="ggt" placeholder="TAG" maxlength="5" style="max-width:70px;text-transform:uppercase"></div><button type="button" class="nbig" id="ggc">GANG GRÜNDEN · $5.000</button>
        <div class="nadd" style="margin-top:8px"><input id="ggj" placeholder="TAG einer Gang" maxlength="5" style="text-transform:uppercase"><button type="button" id="ggjb">Beitreten</button></div>`;
      else{const me=G.owner===ON.code;body=`<div class="ngang"><b>[${esc(G.tag)}] ${esc(G.name)}</b><small>Gang-Tag zum Einladen: <b style="color:#ffe14d">${esc(G.tag)}</b> · ${G.members.length}/5 Mitglieder</small>
        <div class="nvault"><small>GANG-TRESOR</small><b>$${fmt(Number(G.vault))}</b></div>
        <div class="nsw"><button type="button" data-gd="1000">+$1k</button><button type="button" data-gd="10000">+$10k</button><button type="button" data-gd="50000">+$50k</button>${me?'<button type="button" data-gw="1">Auszahlen</button>':''}</div></div>`+
        G.members.map(m=>`<div class="nrow ${m.code===ON.code?'me':''}"><div><b>${esc(m.name)}${m.code===G.owner?' 👑':''}</b><small>Stufe ${m.lvl} · Beute $${fmt(Number(m.loot))}</small></div></div>`).join('')+
        `<button type="button" class="nleave" id="ggl">Gang verlassen</button>`;}
      body+=`<div class="nnote" style="margin-top:8px"><b>GANG-RANGLISTE</b></div>`+(cache.granks||[]).map((g,i)=>`<div class="nrow"><i>${i+1}</i><div><b>[${esc(g.tag)}] ${esc(g.name)}</b><small>${g.members} Mitglieder</small></div><span>$${fmt(Number(g.score))}</span></div>`).join('');}
    else if(tab==='rev'){const L=cache.rev||[];body=`<div class="nnote">Wer dich in den letzten 24 h ausgeraubt hat, kannst du hier zurück überfallen – auch ohne Freundes-Code. <b>Rache bringt 25 % statt 15 %</b> und sein Schutz zählt nicht.</div>`+
      (L.map(r=>`<div class="nrow"><div><b>${esc(r.name)}</b><small>Stufe ${r.lvl} · hat dir $${fmt(Number(r.amount))} geklaut</small></div><button type="button" data-rev="${r.code}">RACHE!</button></div>`).join('')||'<div class="nnote">Keiner hat dich beklaut. Noch nicht.</div>');}
    const tabs=[['rank','Rangliste'],['friends','Freunde'],['gang','Gang'],['rev','Rache'],['war','Fraktionen']];
    P.innerHTML=`<div class="nh"><b>NETZWERK</b><button type="button" id="netx">✕</button></div><div class="ntabs">${tabs.map(([k,n])=>`<button type="button" class="${tab===k?'on':''}" data-nt="${k}">${n}</button>`).join('')}</div><div class="nbody">${nmsg?`<div class="nnote">${nmsg}</div>`:''}${body}</div>`;
    document.getElementById('netx').onclick=close;
    P.querySelectorAll('[data-nt]').forEach(b=>b.onclick=()=>{tab=b.dataset.nt;load();});
    P.querySelectorAll('[data-rb]').forEach(b=>b.onclick=()=>{rankBy=b.dataset.rb;load();});
    const fa=document.getElementById('nfa');if(fa)fa.onclick=async()=>{const c=document.getElementById('nfc').value.trim().toUpperCase();if(!/^NH-[A-Z0-9]{6}$/.test(c)){nmsg='Code-Format: NH-XXXXXX';draw();return;}
      try{const n=await rpc('nh_add_friend',{p_code:ON.code,p_secret:ON.secret,p_friend:c});nmsg=n+' ist jetzt dein Freund!';load();}catch(e){nmsg=/unknown/.test(e.message)?'Code nicht gefunden.':'Fehler: '+e.message;draw();}};
    P.querySelectorAll('[data-rev]').forEach(b=>b.onclick=()=>{const r=(cache.rev||[]).find(x=>x.code===b.dataset.rev);if(!r)return;close();NH_GAME.toast('RACHE AN '+r.name.toUpperCase());NH_GAME.startRaid({code:r.code,name:r.name,lvl:r.lvl});});
    const gc=document.getElementById('ggc');if(gc)gc.onclick=async()=>{const n=document.getElementById('ggn').value.trim(),t=document.getElementById('ggt').value.trim().toUpperCase();
      if(n.length<3){nmsg='Name: mindestens 3 Zeichen.';return draw();}if(!/^[A-Z0-9]{3,5}$/.test(t)){nmsg='TAG: 3–5 Buchstaben/Zahlen.';return draw();}if(NH_GAME.stats().cash<5000){nmsg='Du brauchst $5.000.';return draw();}
      try{await rpc('nh_gang_create',{p_code:ON.code,p_secret:ON.secret,p_name:n,p_tag:t});NH_GAME.adjustCash(-5000);nmsg='Gang gegründet!';load();}catch(e){nmsg=/duplicate|unique/.test(e.message)?'TAG ist schon vergeben.':'Fehler: '+e.message;draw();}};
    const gj=document.getElementById('ggjb');if(gj)gj.onclick=async()=>{const t=document.getElementById('ggj').value.trim().toUpperCase();try{const n=await rpc('nh_gang_join',{p_code:ON.code,p_secret:ON.secret,p_tag:t});nmsg='Willkommen bei '+n+'!';load();}catch(e){nmsg=/unknown/.test(e.message)?'Keine Gang mit diesem TAG.':/full/.test(e.message)?'Die Gang ist voll (5/5).':'Fehler: '+e.message;draw();}};
    P.querySelectorAll('[data-gd]').forEach(b=>b.onclick=async()=>{const a=+b.dataset.gd;if(NH_GAME.stats().cash<a){nmsg='Zu wenig Geld.';return draw();}try{await rpc('nh_gang_donate',{p_code:ON.code,p_secret:ON.secret,p_amount:a});NH_GAME.adjustCash(-a);nmsg='+$'+fmt(a)+' in den Gang-Tresor.';load();}catch(e){nmsg='Fehler: '+e.message;draw();}});
    P.querySelectorAll('[data-gw]').forEach(b=>b.onclick=async()=>{const v=Number((cache.gang||{}).vault||0);if(!v)return;const a=Math.min(v,50000);try{await rpc('nh_gang_withdraw',{p_code:ON.code,p_secret:ON.secret,p_amount:a});NH_GAME.adjustCash(a);nmsg='$'+fmt(a)+' ausgezahlt.';load();}catch(e){nmsg='Fehler: '+e.message;draw();}});
    const gl=document.getElementById('ggl');if(gl)gl.onclick=async()=>{if(!gl.dataset.ok){gl.dataset.ok=1;gl.textContent='Wirklich verlassen? Nochmal tippen';return;}try{await rpc('nh_gang_leave',{p_code:ON.code,p_secret:ON.secret});nmsg='Du hast die Gang verlassen.';load();}catch(e){nmsg='Fehler: '+e.message;draw();}};
    P.querySelectorAll('[data-raid]').forEach(b=>b.onclick=()=>{const f=(cache.friends||[]).find(x=>x.code===b.dataset.raid);if(!f)return;close();if(window.NH_GAME)NH_GAME.startRaid(f);});
  }
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  async function saveBase(b){if(!ON)return 'kein Profil';try{await rpc('nh_save_base',{p_code:ON.code,p_secret:ON.secret,p_base:b});return true;}catch(e){return /nh_save_base|function|404/i.test(e.message)?'Supabase-Update (v3) fehlt noch':e.message;}}
  async function getBase(code){try{return await rpc('nh_get_base',{p_victim:code});}catch(e){return null;}}
  async function raidFinish(victim,success,bounty){if(!ON)return -1;try{try{return Number(await rpc('nh_raid_finish2',{p_code:ON.code,p_secret:ON.secret,p_victim:victim,p_success:success,p_bounty:Math.round(bounty||0)}));}catch(e2){if(/shield/.test(e2.message))throw e2;}return Number(await rpc('nh_raid_finish',{p_code:ON.code,p_secret:ON.secret,p_victim:victim,p_success:success}));}
    catch(e){if(/shield/.test(e.message)&&window.NH_GAME)NH_GAME.toast('ZU SPÄT – ER HAT SCHUTZ');return -1;}}
  async function factionPoints(p){if(!ON)return;try{await sync(false);await rpc('nh_add_faction_points',{p_code:ON.code,p_secret:ON.secret,p_points:Math.round(p)});}catch(e){}}
  let checking=false;
  async function checkRaids(){if(!ON||checking||!window.NH_GAME||!NH_GAME.inGame())return;checking=true;
    try{const L=await rpc('nh_my_raids',{p_code:ON.code,p_secret:ON.secret});if(L&&L.length){let lost=0,gain=0;L.forEach(r=>{if(r.success)lost+=Number(r.amount);else gain+=Number(r.amount);});
      if(lost||gain)NH_GAME.adjustCash(gain-lost);
      NH_GAME.say('<div class="rbig bad">ÜBERFALL!</div>'+L.map(r=>`<b>${esc(r.attacker_name)}</b> ${r.success?`hat deinen Tresor geknackt: <b style="color:#ff6f6f">−$${fmt(Number(r.amount))}</b>`:`wollte dich ausrauben – und ist in deinem Unterschlupf gescheitert.${Number(r.amount)?` Kopfgeld: <b style="color:#7dffb2">+$${fmt(Number(r.amount))}</b>`:''}`}`).join('<br>')+'<div class="dsub">Du hast jetzt etwas Schutz. <b>Rache?</b> Handy → Netzwerk → Rache: 24 h lang +25 % Beute, sein Schutz zählt nicht.</div>');}}
    catch(e){}checking=false;}
  setTimeout(checkRaids,6000);
  const st2=document.createElement('style');st2.textContent=`
    #netov{position:fixed;inset:0;z-index:970;background:rgba(5,0,12,.85);display:none;align-items:center;justify-content:center;padding:12px}#netov.on{display:flex}
    .netp{width:min(96vw,460px);max-height:calc(100vh - 24px);display:flex;flex-direction:column;background:rgba(16,8,30,.98);border:2px solid #2fe0ea;border-radius:14px;box-shadow:0 0 0 2px #000,0 0 24px rgba(47,224,234,.45);padding:12px;color:#fff;font-family:'Oswald',sans-serif}
    .nh{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.nh b{font-family:'Bangers',cursive;font-size:28px;letter-spacing:1px;font-weight:400;color:#2fe0ea;text-shadow:0 0 10px rgba(47,224,234,.8)}
    .nh button{background:#000;color:#fff;border:2px solid #ff3d8b;font-size:18px;width:38px;height:38px;cursor:pointer}
    .ntabs,.nsw{display:flex;gap:4px;margin-bottom:8px}.ntabs button,.nsw button{flex:1;background:#0b0616;border:2px solid #4b3a6e;color:#cbbbe6;font-family:'Bangers',cursive;font-size:15px;padding:6px 2px;cursor:pointer;border-radius:6px}
    .ntabs button.on,.nsw button.on{background:#2fe0ea;color:#000;border-color:#000}.nbody{overflow:auto;flex:1}
    .nrow{display:flex;align-items:center;gap:8px;background:#1d1030;border:1px solid #4b3a6e;border-radius:8px;padding:6px 8px;margin-bottom:5px}.nrow.me{border-color:#ffe14d}
    .nrow i{font-style:normal;font-family:'Bangers',cursive;font-size:20px;width:26px;text-align:center;color:#ffe14d}.nrow>div{flex:1;min-width:0}.nrow b{display:block;font-size:14px}.nrow small{font-size:11px;color:#cbbbe6}.nrow>span{font-size:13px;color:#7dffb2}
    .nrow button{background:#ff3d3d;border:2px solid #000;color:#fff;font-family:'Bangers',cursive;font-size:15px;padding:6px 10px;border-radius:6px;cursor:pointer}.shd{font-size:12px;color:#7ff6ff}
    .nnote{font-size:13px;color:#cbbbe6;background:#0b0616;border-radius:8px;padding:8px;margin-bottom:6px}.nnote.small{font-size:11px}
    .nbig{width:100%;background:#ff3d8b;color:#fff;border:3px solid #000;font-family:'Bangers',cursive;font-size:18px;padding:8px;border-radius:8px;cursor:pointer}.nleave{width:100%;margin-top:8px;background:#1d1030;border:1px solid #ff3d6e;color:#ff9fb0;padding:6px;border-radius:6px;cursor:pointer;font-family:'Oswald',sans-serif}
    .ngang{background:#1d1030;border:2px solid #ffe14d;border-radius:10px;padding:8px;margin-bottom:6px}.ngang>b{display:block;font-family:'Bangers',cursive;font-size:22px;color:#ffe14d;letter-spacing:1px}.ngang small{display:block;font-size:11px;color:#cbbbe6}.nvault{margin:6px 0}.nvault b{font-family:'Bangers',cursive;font-size:26px;color:#7dffb2}
    .nadd{display:flex;gap:6px;margin-bottom:8px}.nadd input{flex:1;min-width:0;background:#0b0616;border:1px solid #4b3a6e;color:#fff;border-radius:6px;padding:8px;font-family:'Oswald',sans-serif;font-size:14px;text-transform:uppercase}
    .nadd button{background:#7dffb2;border:2px solid #000;font-family:'Oswald',sans-serif;font-weight:700;padding:6px 10px;border-radius:6px;cursor:pointer}
    .nwar{background:#1d1030;border:2px solid #4b3a6e;border-radius:8px;padding:8px;margin-bottom:6px}.nwar.me{border-color:#ffe14d}.nwar b{font-size:16px}.nwar .pb{height:10px;background:#0b0616;border-radius:5px;overflow:hidden;margin:4px 0}.nwar .pb i{display:block;height:100%}.nwar small{font-size:12px;color:#cbbbe6}`;
  document.head.appendChild(st2);
  render();
  window.NH_ONLINE={rpc,get me(){return ON;},sync,open,raidFinish,saveBase,getBase,factionPoints,badge:()=>0};
})();
