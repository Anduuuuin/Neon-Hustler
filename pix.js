const FR={
 down:["....kkkkkk....","...khhhhhhk...","..khhhhhhhhk..","..khssssssSk..","..kgcgssgcgk..","..kssssssssk..","...ksSSSSsk...","..kkPwywwPkk..",".kPppwyywppPk.",".kpppwwwwpppk.","kspppwwwwpppsk","kspPpwwwwpPpsk",".kkPpppppppkk.","..knnnnnnnnk.."],
 up:["....kkkkkk....","...khhhhhhk...","..khhhhhhhhk..","..khhhhhhhhk..","..khhhhhhhhk..","..kHhhhhhhHk..","...kkssssk....","..kkPppppPkk..",".kPppppppppPk.",".kppppPPppppk.","ksppppppppppsk","ksppppppppppsk",".kkPpppppppkk.","..knnnnnnnnk.."],
 side:[".....kkkkk....","....khhhhhk...","...khhhhhhhk..","...khhhsssk...","...khhgcgck...","...khsssssk...","....ksSSsk....","....kPpwk.....","...kPppwyk....","...kpppwwk....","...kppppsk....","...kPppppk....","...kkPppkk....","....knnnk....."]};
const LEGS={
 front:[["..knnnkknnnk..","..knnk..knnk..","..kbbk..kbbk..","...kk....kk..."],
        ["..knnnkknnnk..","..knnk..knnk..","..kbbk..knnk..","...kk...kbbk.."],
        ["..knnnkknnnk..","..knnk..knnk..","..knnk..kbbk..","..kbbk...kk..."]],
 side:[["....knnnk.....","....knknk.....","....kbkbk.....","....kkkkk....."],
       ["...knnnnk.....","...knk.knk....","..kbbk..kbk...","..kkk....kk..."],
       ["....knnnk.....","....knnk......","....kbbk......","....kkkk......"]]};
const PAL_P={k:'#140a1c',h:'#3b2416',H:'#2a180e',s:'#e8b088',S:'#c98a62',g:'#111',c:'#2fe0ea',p:'#ff5fa8',P:'#c83c80',w:'#f4f1e8',y:'#ffd34d',n:'#3a3a6a',b:'#3a1f12'};
const PAL_G={k:'#0a0a14',h:'#1c2a5a',H:'#121c40',s:'#d9a07a',S:'#b07a58',g:'#d9a07a',c:'#0a0a14',p:'#3a5cb0',P:'#24407e',w:'#b8c8ea',y:'#ffd34d',n:'#1c2440',b:'#111'};
const sprCache={};
function sprite(dir,frame,pal,key){
  const id=key+dir+frame; if(sprCache[id])return sprCache[id];
  const side=dir==='left'||dir==='right', body=side?FR.side:(dir==='up'?FR.up:FR.down), legs=(side?LEGS.side:LEGS.front)[frame];
  const rows=body.concat(legs), c=document.createElement('canvas'); c.width=14; c.height=rows.length; const g=c.getContext('2d');
  rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.')continue;g.fillStyle=pal[ch]||'#f0f';g.fillRect(dir==='left'?13-x:x,y,1,1);}});
  return sprCache[id]=c;
}
function drawMan(c,x,y,dir,step,isGuard,moving){
  x=Math.round(x);y=Math.round(y);
  c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(x,y+3,6,2.2,0,0,7);c.fill();
  const a=((dir%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
  const d=(a>Math.PI*.25&&a<Math.PI*.75)?'down':(a>=Math.PI*.75&&a<=Math.PI*1.25)?'left':(a>Math.PI*1.25&&a<Math.PI*1.75)?'up':'right';
  const fr=moving?1+(Math.floor(step)%2):0;
  const bob=moving&&(Math.floor(step)%2)?-1:0;
  c.drawImage(sprite(d,fr,isGuard?PAL_G:PAL_P,isGuard?'g':'p'),x-7,y-17+bob);
  if(isGuard){ // Mütze-Schild + Taschenlampe
    c.fillStyle='#0a0a14'; if(d==='down')c.fillRect(x-4,y-14+bob,8,1); if(d==='right')c.fillRect(x+2,y-14+bob,4,1); if(d==='left')c.fillRect(x-6,y-14+bob,4,1);
    c.fillStyle='#ffe9a0'; const fx=d==='right'?x+5:d==='left'?x-6:x+4, fy=d==='up'?y-9:y-6; c.fillRect(fx,fy+bob,2,2);
  }
}

// ===== Ausrüstung an der Figur =====
const WPN={
  schlaeger:{px:[".k.","kbk","kBk","kBk","kBk","kBk","kBk",".k.",".h.",".h.",".h.",".k."],c:{b:'#d79a5a',B:'#b0743a',h:'#3a1f12',k:'#140a1c'}},
  messer:{px:[".k.","kwk","kwk","kwk","kWk","kkk","khk","khk",".k."],c:{w:'#eef3f8',W:'#b8c2cc',h:'#5a2a12',k:'#140a1c'}},
  schlagring:{px:["kkkkk","kykyk","kyyyk",".kyk."],c:{y:'#ffd34d',k:'#140a1c'}},
  revolver:{px:[".k..",".gk.",".gk.",".gk.","kggk","kgGk","khhk",".hk.",".kk."],c:{g:'#5a5f6e',G:'#8a90a0',h:'#6a3a20',k:'#140a1c'}},
  pistole:{px:["kk.",".gk",".gk","kggk","kgGk","khk.","khk.",".k.."],c:{g:'#4a4f5e',G:'#8a90a0',h:'#2a2a30',k:'#140a1c'}},
  schrotflinte:{px:[".k.","kgk","kgk","kgk","kgk","kgk","kwk","kwk","kwk","kwwk","kwwk",".kk."],c:{g:'#3a3f4e',w:'#8a4a20',k:'#140a1c'}},
  uzi:{px:["k..","gk.","gkk","ggk","gGgk","kgkk","kh..","kh..",".k.."],c:{g:'#2a2e38',G:'#6a7080',h:'#1a1a1a',k:'#140a1c'}},
  brecheisen:{px:["kk.","rkk",".rk",".rk",".rk",".rk",".rk",".rk",".rk","rrk","kk."],c:{r:'#d23a3a',k:'#140a1c'}}
};
const wCache={};
function wImg(id){if(wCache[id])return wCache[id];const W=WPN[id];if(!W)return null;const c=document.createElement('canvas');c.width=W.px[0].length;c.height=W.px.length;const g=c.getContext('2d');
  W.px.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.')continue;g.fillStyle=W.c[ch]||'#f0f';g.fillRect(x,y,1,1);}});return wCache[id]=c;}
function dirName(dir){const a=((dir%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
  return (a>Math.PI*.25&&a<Math.PI*.75)?'down':(a>=Math.PI*.75&&a<=Math.PI*1.25)?'left':(a>Math.PI*1.25&&a<Math.PI*1.75)?'up':'right';}
function drawBag(c,x,y,d,bob,front){
  if(d==='up'&&front){c.fillStyle='#140a1c';c.fillRect(x-5,y-12+bob,10,9);c.fillStyle='#4a6a3a';c.fillRect(x-4,y-11+bob,8,7);c.fillStyle='#3a5a2a';c.fillRect(x-4,y-8+bob,8,1);c.fillStyle='#ffd34d';c.fillRect(x-1,y-10+bob,2,1);}
  if((d==='left'||d==='right')&&!front){const bx=d==='right'?x-7:x+3;c.fillStyle='#140a1c';c.fillRect(bx,y-12+bob,5,9);c.fillStyle='#4a6a3a';c.fillRect(bx+1,y-11+bob,3,7);}
  if(d==='down'&&front){c.fillStyle='#2a3a1a';c.fillRect(x-4,y-10+bob,1,4);c.fillRect(x+3,y-10+bob,1,4);}
}
function drawWeapon(c,x,y,d,bob,id,swing){
  const im=wImg(id);if(!im)return;
  let hx,hy,ang;
  if(d==='down'){hx=x-5;hy=y-5;ang=-.35;}else if(d==='up'){hx=x+5;hy=y-6;ang=.35;}else if(d==='right'){hx=x+3;hy=y-5;ang=.6;}else{hx=x-3;hy=y-5;ang=-.6;}
  if(id==='schlagring'){ang=0;}
  if(swing>0){const s=Math.sin((1-swing/.25)*Math.PI);ang+=(d==='left'||d==='down'?-1:1)*s*1.6;}
  c.save();c.translate(hx,hy+bob);c.rotate(ang);const h=im.height,w=im.width;c.drawImage(im,-Math.floor(w/2),id==='schlagring'?-2:-h+3);c.restore();
}
// ===== Kleidung =====
const OUTFIT={
  jacke:{sakko_pink:{p:'#ff5fa8',P:'#c83c80',w:'#f4f1e8'},lederjacke:{p:'#4a3428',P:'#2a1c12',w:'#d8d0c0'},hawaiihemd:{p:'#2fc8a8',P:'#1f8a76',w:'#ffd34d'},
    trainingsjacke:{p:'#3a5cd0',P:'#26398a',w:'#f4f1e8'},tarnweste:{p:'#55663f',P:'#36422a',w:'#2a2a2a'},anzug_weiss:{p:'#eeeae0',P:'#bfb8a8',w:'#7ff6ff'},anzug_gold:{p:'#e8c04a',P:'#a8801c',w:'#1a1020'},neon_jacke:{p:'#ff3d8b',P:'#2fe0ea',w:'#1a1020'}},
  schuhe:{sneaker:{b:'#f4f1e8'},schleicher:{b:'#1a1a22'},loafer:{b:'#8a4a1a'},boots:{b:'#4a321e'},krokoschuhe:{b:'#3f7a34'},neon_kicks:{b:'#7dff8a'}},
  brille:{sonnenbrille:{g:'#111',c:'#2fe0ea'},nachtsicht:{g:'#2a3a1a',c:'#7dff5a'},nerdbrille:{g:'#3a2a1a',c:'#d8e8f0'},goldbrille:{g:'#d4a020',c:'#ff9f43'},neon_shades:{g:'#ff3d8b',c:'#ffe14d'},_:{g:'#e8b088',c:'#3a2a1a'}},
  hose:{_:{n:'#3a3a6a'}}
};
const HATS={
  cap:{c:{k:'#140a1c',r:'#ff3d8b',R:'#c8286a'},px:["....kkkkkk....","...krrrrrrk...","..krrrrrrrrk..","..kRRRRRRRRRRk"]},
  fedora:{c:{k:'#140a1c',f:'#3a2a20',F:'#ff5fa8'},px:["....kkkkkk....","...kffffffk...","..kFFFFFFFFk..","kkffffffffffkk"]},
  neon_cap:{c:{k:'#140a1c',r:'#2fe0ea',R:'#ff3d8b'},px:["....kkkkkk....","...krrrrrrk...","..krrrrrrrrk..","..kRRRRRRRRRRk"]},
  panama:{c:{k:'#140a1c',f:'#efe2b8',F:'#2a1a12'},px:["....kkkkkk....","...kffffffk...","..kFFFFFFFFk..","kkffffffffffkk"]},
  bandana:{c:{k:'#140a1c',r:'#d82a2a'},px:["..............","....kkkkkk....","..krrrrrrrrkk.","...........rk."]},
};
function outfitPal(o){o=o||{};const P=Object.assign({},PAL_P,(OUTFIT.jacke[o.jacke]||OUTFIT.jacke.sakko_pink),(OUTFIT.schuhe[o.schuhe]||OUTFIT.schuhe.sneaker),(OUTFIT.brille[o.brille]||OUTFIT.brille._));
  if(o.kopf==='sturmhaube'){Object.assign(P,{h:'#1c1c22',H:'#101014',s:'#1c1c22',S:'#101014',g:'#1c1c22',c:'#f4f1e8'});}
  return P;}
const hatCache={};
function hatImg(id){if(hatCache[id])return hatCache[id];const H=HATS[id];if(!H)return null;const c=document.createElement('canvas');c.width=14;c.height=H.px.length;const g=c.getContext('2d');
  H.px.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.')continue;g.fillStyle=H.c[ch];g.fillRect(x,y,1,1);}});return hatCache[id]=c;}
// gear = {weapon, bag, swing, outfit}
function drawHero(c,x,y,dir,step,moving,gear){
  gear=gear||{};x=Math.round(x);y=Math.round(y);
  c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(x,y+3,6,2.2,0,0,7);c.fill();
  const d=dirName(dir),fr=moving?1+(Math.floor(step)%2):0,bob=moving&&(Math.floor(step)%2)?-1:0;
  if(gear.bag)drawBag(c,x,y,d,bob,false);
  if(gear.weapon&&d==='up')drawWeapon(c,x,y,d,bob,gear.weapon,gear.swing||0);
  const o=gear.outfit||{},key='p'+[o.jacke,o.schuhe,o.brille,o.kopf==='sturmhaube'?'m':''].join('|');
  c.drawImage(sprite(d,fr,outfitPal(o),key),x-7,y-17+bob);
  const hi=hatImg(o.kopf);if(hi){if(d==='left'){c.save();c.translate(x+7,0);c.scale(-1,1);c.drawImage(hi,(d==='left'||d==='right')?1:0,y-18+bob);c.restore();}else c.drawImage(hi,x-7+((d==='right')?1:0),y-18+bob);}
  if(gear.bag)drawBag(c,x,y,d,bob,true);
  if(gear.weapon&&d!=='up')drawWeapon(c,x,y,d,bob,gear.weapon,gear.swing||0);
}
