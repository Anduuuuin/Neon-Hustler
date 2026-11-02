// Neon Hustler – Musik & Soundeffekte (alles live erzeugt, keine Dateien)
(function(){
  const LS='nh_audio';
  const S=Object.assign({mu:.6,fx:.7},(()=>{try{return JSON.parse(localStorage.getItem(LS))||{};}catch(e){return {};}})());
  let cur=null,ctx=null,comp,mBus,fBus,rev,revIn,dly,started=false;
  const IN_FRAME=window.parent!==window;
  let mood='chill',nextMood='chill',station=S.st||0,radioOff=S.off===undefined?true:!!S.off;
  const STATIONS=['NEON 87.6','VICE FM','SUNSET WAVE'];
  const mtof=m=>440*Math.pow(2,(m-69)/12);

  function save(){try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}}
  function init(){
    if(ctx)return true;
    try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return false;}
    comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.connect(ctx.destination);
    mBus=ctx.createGain();fBus=ctx.createGain();mBus.connect(comp);fBus.connect(comp);
    // Hall
    rev=ctx.createConvolver();const len=ctx.sampleRate*2.2,b=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
    rev.buffer=b;revIn=ctx.createGain();revIn.gain.value=.5;revIn.connect(rev);rev.connect(mBus);
    // Echo
    dly=ctx.createDelay(1);const fb=ctx.createGain();fb.gain.value=.32;const df=ctx.createBiquadFilter();df.type='lowpass';df.frequency.value=2200;
    dly.connect(df);df.connect(fb);fb.connect(dly);df.connect(mBus);
    cur=ctx.createGain();cur.connect(mBus);
    applyVol();
    return true;
  }
  function applyVol(){if(!ctx)return;mBus.gain.setTargetAtTime(S.mu*S.mu*.55,ctx.currentTime,.1);fBus.gain.setTargetAtTime(S.fx*S.fx*.9,ctx.currentTime,.05);}
  let noiseBuf=null;function noise(){if(noiseBuf)return noiseBuf;const n=ctx.sampleRate;noiseBuf=ctx.createBuffer(1,n,n);const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf;}
  function env(g,t,a,peak,d,sus=0.0001){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(Math.max(sus,0.0001),t+a+d);}

  // ---------- Instrumente ----------
  function kick(t,v=1){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);env(g,t,.002,.9*v,.32);o.connect(g);g.connect(cur);o.start(t);o.stop(t+.4);}
  function snare(t,v=1){const n=ctx.createBufferSource();n.buffer=noise();const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=1900;f.Q.value=.7;const g=ctx.createGain();env(g,t,.002,.45*v,.22);
    n.connect(f);f.connect(g);g.connect(cur);const s=ctx.createGain();s.gain.value=.6;g.connect(s);s.connect(revIn);n.start(t);n.stop(t+.3);
    const o=ctx.createOscillator(),og=ctx.createGain();o.frequency.value=190;env(og,t,.002,.25*v,.09);o.connect(og);og.connect(cur);o.start(t);o.stop(t+.15);}
  function hat(t,v=1,open){const n=ctx.createBufferSource();n.buffer=noise();const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=7500;const g=ctx.createGain();env(g,t,.001,.13*v,open?.22:.045);n.connect(f);f.connect(g);g.connect(cur);n.start(t);n.stop(t+.3);}
  function tom(t,m,v=1){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(mtof(m),t);o.frequency.exponentialRampToValueAtTime(mtof(m)*.6,t+.25);env(g,t,.003,.4*v,.3);o.connect(g);g.connect(cur);o.start(t);o.stop(t+.35);}
  function bass(t,m,d,v=1,cut=700){const o=ctx.createOscillator(),s=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();o.type='sawtooth';o.frequency.value=mtof(m);s.type='sine';s.frequency.value=mtof(m-12);
    f.type='lowpass';f.Q.value=6;f.frequency.setValueAtTime(cut*2.2,t);f.frequency.exponentialRampToValueAtTime(cut*.5,t+d);env(g,t,.004,.32*v,d);o.connect(f);s.connect(f);f.connect(g);g.connect(cur);o.start(t);s.start(t);o.stop(t+d+.05);s.stop(t+d+.05);}
  function pad(t,notes,d,v=1){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=1300;const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(.07*v,t+d*.3);g.gain.linearRampToValueAtTime(.0001,t+d);
    f.connect(g);g.connect(cur);const s=ctx.createGain();s.gain.value=.9;g.connect(s);s.connect(revIn);
    notes.forEach(m=>[-7,7].forEach(dt=>{const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=mtof(m);o.detune.value=dt;o.connect(f);o.start(t);o.stop(t+d+.1);}));}
  function pluck(t,m,v=1,type='square'){const o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();o.type=type;o.frequency.value=mtof(m);f.type='lowpass';f.frequency.setValueAtTime(3200,t);f.frequency.exponentialRampToValueAtTime(700,t+.15);
    env(g,t,.002,.07*v,.17);o.connect(f);f.connect(g);g.connect(cur);const e=ctx.createGain();e.gain.value=.5;g.connect(e);e.connect(dly);o.start(t);o.stop(t+.25);}
  function lead(t,m,d,v=1){const o=ctx.createOscillator(),o2=ctx.createOscillator(),l=ctx.createOscillator(),lg=ctx.createGain(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    o.type='sawtooth';o2.type='square';o.frequency.value=mtof(m);o2.frequency.value=mtof(m);o2.detune.value=8;l.frequency.value=5.5;lg.gain.value=6;l.connect(lg);lg.connect(o.detune);lg.connect(o2.detune);
    f.type='lowpass';f.frequency.value=2600;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.06*v,t+.03);g.gain.setValueAtTime(.06*v,t+d*.8);g.gain.linearRampToValueAtTime(.0001,t+d);
    o.connect(f);o2.connect(f);f.connect(g);g.connect(cur);const e=ctx.createGain();e.gain.value=.6;g.connect(e);e.connect(dly);const r=ctx.createGain();r.gain.value=.4;g.connect(r);r.connect(revIn);
    [o,o2,l].forEach(x=>{x.start(t);x.stop(t+d+.05);});}

  // ---------- Komposition ----------
  // Akkorde als MIDI-Grundton + Moll/Dur
  const PROG={
    chill:[[[57,'m'],[53,'M'],[48,'M'],[55,'M']],[[50,'m'],[58,'M'],[53,'M'],[48,'M']],[[52,'m'],[48,'M'],[55,'M'],[50,'M']],[[53,'M'],[57,'m'],[50,'m'],[52,'m']]],
    action:[[[57,'m'],[57,'m'],[53,'M'],[55,'M']],[[50,'m'],[53,'M'],[57,'m'],[55,'M']],[[52,'m'],[52,'m'],[48,'M'],[50,'M']]],
  };
  PROG.alarm=PROG.action;
  const triad=(r,q)=>[r,r+(q==='m'?3:4),r+7];
  const BPM={chill:[92,112,76],action:[118,120,116],alarm:[130,132,128]};
  let tempo=92,step=0,bar=0,prog=PROG.chill[0],nextT=0,timer=null,leadMotif=[];
  function newSection(){
    const P=PROG[mood];prog=P[Math.floor(Math.random()*P.length)];
    tempo=(mood==='chill'&&radioOff)?70:BPM[mood][station%3];
    const base=[0,3,7,10,12,7,3,5];leadMotif=Array.from({length:8},()=>base[Math.floor(Math.random()*base.length)]);
  }
  function clap(t,v=1){[0,.012,.024].forEach(d=>{const n=ctx.createBufferSource();n.buffer=noise();const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=1200;f.Q.value=1.2;const g=ctx.createGain();env(g,t+d,.001,.3*v,.08);n.connect(f);f.connect(g);g.connect(cur);const s=ctx.createGain();s.gain.value=.5;g.connect(s);s.connect(revIn);n.start(t+d);n.stop(t+d+.15);});}
  function scheduleVice(t){ // Italo-Disco: Oktav-Bass, Offbeat-Hats, Claps
    const s16=step%16,ch=prog[bar%4],root=ch[0],tri=triad(root,ch[1]),fill=bar%8===7&&s16>=12;
    if(s16===0)pad(t,tri.map(n=>n+12),60/tempo*4,.7);
    if(!fill){if(s16%4===0)kick(t,.9);if(s16===4||s16===12)clap(t,1);if(s16%4===2)hat(t,.9,true);else if(s16%2)hat(t,.35);}
    else{tom(t,[55,52,50,47][s16-12],.8);}
    bass(t,root-12+(s16%2?12:0),.1,.85,900);
    if(s16%4===0||s16%4===3)pluck(t,tri[(s16/2|0)%3]+24,.7,'sawtooth');
    if(bar%8>=4&&s16%4===0)lead(t,root+24+leadMotif[(s16/4+bar*4)%8],60/tempo*.9,.7);
  }
  function scheduleSunset(t){ // Chill: langsam, weich
    const s16=step%16,ch=prog[bar%4],root=ch[0],tri=triad(root,ch[1]);
    if(s16===0)pad(t,tri.map(n=>n+12).concat([tri[0]+22]),60/tempo*4,1.2);
    if(s16===0||s16===7||s16===10)kick(t,.55);if(s16===4||s16===12)snare(t,.35);
    if(s16===0||s16===6||s16===10)bass(t,root-12,.4,.7,380);
    if(s16%4===2)pluck(t,tri[(s16+bar)%3]+24,.55,'triangle');
    if(bar%8>=4&&s16===8)lead(t,tri[bar%3]+24,60/tempo*3,.45);
  }
  function scheduleAmbient(t){ // leise Hintergrund-Atmo ohne Schlagzeug
    const s16=step%16,ch=prog[bar%4],root=ch[0],tri=triad(root,ch[1]);
    if(s16===0&&bar%2===0)pad(t,tri.map(n=>n+12),60/tempo*8,.55);
    if(s16===0)bass(t,root-12,60/tempo*3,.35,260);
    if(s16===6||s16===14)pluck(t,tri[(bar+s16)%3]+24,.3,'triangle');
  }
  function schedule(t){
    const s16=step%16,ci=Math.floor(bar%4),ch=prog[ci],root=ch[0],tri=triad(root,ch[1]);
    const act=mood!=='chill',alarm=mood==='alarm',fill=bar%8===7&&s16>=12;
    if(radioOff)return;
    if(!act){if(station===1)return scheduleVice(t);if(station===2)return scheduleSunset(t);}
    // Pads am Taktanfang
    if(s16===0){pad(t,tri.map(n=>n+12),60/tempo*4,act?.8:1);}
    // Schlagzeug
    if(!fill){
      if(act){if(s16%4===0)kick(t,1);}else{if(s16===0||s16===10)kick(t,.8);}
      if(s16===4||s16===12)snare(t,act?1:.7);
      if(act){hat(t,s16%2?.6:1,s16%4===2&&alarm);}else if(s16%2===0)hat(t,s16%4?.5:.9);
    } else {tom(t,[50,47,45,43][s16-12],1);if(s16===12)kick(t);}
    // Bass
    if(act){bass(t,root-12+(s16%8===6?12:0),.11,1,alarm?900:700);}
    else if(s16%2===0){bass(t,root-12+(s16%4===2?12:0),.22,.8,500);}
    // Arpeggio
    const arp=[0,1,2,1,0,2,1,2];const an=tri[arp[(s16+bar)%8]]+24;
    if(act){if(s16%2===0||alarm)pluck(t,an,.8);}else if(s16%2===0)pluck(t,an,.6,'triangle');
    // Lead
    if(act&&bar%8>=4&&s16%4===0){const m=root+24+leadMotif[(s16/4+bar*4)%8];lead(t,m,60/tempo*.9,alarm?1.1:.9);}
    if(!act&&bar%16>=12&&s16%8===0){lead(t,tri[(bar+s16/8)%3]+24,60/tempo*1.8,.6);}
    if(alarm&&s16%8===0){lead(t,(s16===0?81:76),60/tempo*1.8,.5);}
  }
  function tick(){
    if(!ctx)return;
    while(nextT<ctx.currentTime+.15){
      if(S.mu>0.001)schedule(nextT);
      nextT+=60/tempo/4;step++;
      if(step%16===0){bar++;if(nextMood!==mood){mood=nextMood;bar=0;cut();newSection();}else if(bar%8===0)newSection();}
    }
  }
  function cut(){if(!ctx||!cur)return;const old=cur;old.gain.setTargetAtTime(0,ctx.currentTime,.06);setTimeout(()=>{try{old.disconnect();}catch(e){}},800);cur=ctx.createGain();cur.connect(mBus);}
  function start(){
    if(!init())return;
    if(IN_FRAME)return;
    if(ctx.state==='suspended')ctx.resume();
    if(started)return;started=true;
    newSection();nextT=ctx.currentTime+.1;timer=setInterval(tick,25);
  }

  // ---------- Effekte ----------
  function tone(f,d,type='sine',g=.15,at=0,f2){const t=ctx.currentTime+at,o=ctx.createOscillator(),v=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
    env(v,t,.004,g,d);o.connect(v);v.connect(fBus);o.start(t);o.stop(t+d+.05);}
  function nz(d,fq,type='bandpass',g=.3,at=0,q=1){const t=ctx.currentTime+at,n=ctx.createBufferSource();n.buffer=noise();const f=ctx.createBiquadFilter();f.type=type;f.frequency.value=fq;f.Q.value=q;const v=ctx.createGain();env(v,t,.003,g,d);n.connect(f);f.connect(v);v.connect(fBus);n.start(t);n.stop(t+d+.05);}
  const FX={
    tap:()=>nz(.03,2500,'bandpass',.05),
    cash:()=>{tone(1318,.1,'triangle',.14);tone(1760,.28,'triangle',.14,.07);nz(.05,6000,'highpass',.05,.0);},
    stamp:()=>{nz(.12,300,'lowpass',.5);tone(80,.2,'sine',.4);},
    door:()=>{nz(.35,600,'bandpass',.18,0,.6);tone(110,.12,'triangle',.12,.05);},
    ok:()=>{tone(660,.08,'triangle',.1);tone(990,.14,'triangle',.1,.06);},
    pick:()=>{tone(2400,.03,'square',.06);nz(.04,4000,'bandpass',.1);},
    fail:()=>{tone(180,.18,'sawtooth',.12,0,120);},
    unlock:()=>{nz(.05,3000,'bandpass',.2);tone(520,.06,'square',.06,.05);tone(780,.12,'triangle',.1,.1);},
    hit:()=>{nz(.12,900,'lowpass',.6);tone(120,.12,'sine',.5,0,50);},
    whoosh:()=>nz(.16,1500,'bandpass',.18,0,.5),
    alert:()=>{tone(880,.08,'square',.1);tone(1320,.16,'square',.1,.09);},
    loot:()=>{nz(.18,1200,'bandpass',.15,0,.8);},
    smash:()=>{nz(.4,5000,'highpass',.4);nz(.2,800,'bandpass',.3);},
    flash:()=>{nz(.5,3000,'highpass',.6);tone(4000,.6,'sine',.08,0,2000);},
    smoke:()=>nz(.9,700,'lowpass',.35),
    beep:()=>tone(1500,.06,'square',.08),
    laser:()=>{tone(1200,.3,'sawtooth',.1,0,300);},
    drill:()=>{tone(220,.5,'sawtooth',.06,0,240);nz(.5,3000,'bandpass',.08);},
    spark:()=>{nz(.15,6000,'highpass',.3);},
    zip:()=>tone(300,.2,'triangle',.08,0,900),
    heal:()=>{tone(523,.1,'sine',.1);tone(659,.1,'sine',.1,.08);tone(784,.2,'sine',.1,.16);},
    jam:()=>{tone(90,.6,'square',.05,0,140);nz(.6,2000,'bandpass',.08);},
    shot:()=>{nz(.18,1800,'lowpass',.7);tone(140,.12,'square',.25,0,50);nz(.05,6000,'highpass',.3);},
    shot2:()=>{nz(.15,1400,'lowpass',.45);tone(120,.1,'square',.15,0,50);},
    reload:()=>{nz(.04,3000,'bandpass',.25);nz(.05,2000,'bandpass',.25,.25);tone(700,.04,'square',.06,.3);},
        tune:()=>{nz(.35,2500,'bandpass',.12,0,.4);tone(900,.3,'sine',.03,0,1400);},
    siren:()=>{tone(700,.35,'triangle',.08,0,1000);tone(1000,.35,'triangle',.08,.35,700);},
  };
  function sfx(n){if(!init())return;if(ctx.state==='suspended')ctx.resume();if(S.fx<0.01)return;const f=FX[n];if(f)try{f();}catch(e){}}

  window.NHA={
    start,sfx,
    mood(m){nextMood=PROG[m]?m:'chill';if(!started)mood=nextMood;},
    get settings(){return S;},
    setMusic(v){S.mu=v;save();applyVol();},
    setFx(v){S.fx=v;save();applyVol();},
    // Radio: Sender 1 → 2 → 3 → Aus → Sender 1
    station(){if(radioOff){radioOff=false;station=0;}else if(station===STATIONS.length-1){radioOff=true;}else station++;
      S.st=station;S.off=radioOff;save();
      if(started){cut();sfx('tune');newSection();step=0;bar=0;nextT=ctx.currentTime+.08;}
      return radioOff?'AUS':STATIONS[station];},
    stationName(){return radioOff?'AUS':STATIONS[station];}
  };
  if(!IN_FRAME){const first=()=>{start();removeEventListener('pointerdown',first,true);};addEventListener('pointerdown',first,true);}
})();
