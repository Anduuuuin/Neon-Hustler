// ================= HD-RENDERER (Neon Hustler NEXT) =================
// Wird von tools/build_next.py in heist2.html eingesetzt. Ersetzt nur die Darstellung, nicht die Spiellogik.
const HD=2,K_='#0d0614';
let NOW=0,camX=0,camY=0,camSnap=true,shake=0,lastT=0,glowC=null,vigC=null,PT=[],FT=[],DEC=[];
const R_=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const hsh=(x,y,n)=>{let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul((n|0)+7,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
const hexRGB=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];};
const mixC=(h,f)=>{if(h[0]!=='#')return h;const[r,g,b]=hexRGB(h),t=f<0?0:255,a=Math.abs(f);return`rgb(${Math.round(r+(t-r)*a)},${Math.round(g+(t-g)*a)},${Math.round(b+(t-b)*a)})`;};
const rgba=(h,a)=>{const[r,g,b]=hexRGB(h);return`rgba(${r},${g},${b},${a})`;};
const isWall=(x,y)=>x<0||y<0||x>=W||y>=H||G[y][x]==='#';
const rr=(c,x,y,w,h,r)=>{c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);};

// ---------- Böden ----------
floorTile=function(x,y){const X=x*T,Y=y*T,f=FL[y][x],odd=(x+y)%2,r=hsh(x,y,1);
  if(f==='chk'){const a=odd?'#241a33':'#e3d8c4';R_(tx,X,Y,T,T,a);R_(tx,X,Y,T,.5,odd?'#3a2c50':'#fff8ea');R_(tx,X,Y+T-.5,T,.5,odd?'#150d20':'#b8ab94');
    tx.fillStyle=odd?'rgba(255,255,255,.05)':'rgba(255,255,255,.35)';tx.beginPath();tx.moveTo(X+2,Y+7);tx.lineTo(X+7,Y+2);tx.lineTo(X+9,Y+2);tx.lineTo(X+2,Y+9);tx.fill();
    if(r<.3)R_(tx,X+10,Y+11,3,.5,odd?'#3a2c50':'#cfc2aa');}
  else if(f==='street'){R_(tx,X,Y,T,T,'#17141f');for(let i=0;i<9;i++){const a=hsh(x,y,i+3),b=hsh(x,y,i+30);R_(tx,X+a*15,Y+b*15,.5+(i%3)*.5,.5,i%2?'#262334':'#0f0d16');}
    if(r<.14){tx.strokeStyle='#0c0a12';tx.lineWidth=.5;tx.beginPath();tx.moveTo(X+2,Y+3+r*40);tx.lineTo(X+7,Y+8);tx.lineTo(X+9,Y+7);tx.lineTo(X+14,Y+12);tx.stroke();}
    if(r>.82){const col=hsh(x,y,9)<.5?'255,61,139':'47,224,234';const g=tx.createRadialGradient(X+8,Y+9,0,X+8,Y+9,7);g.addColorStop(0,`rgba(${col},.30)`);g.addColorStop(.6,`rgba(${col},.12)`);g.addColorStop(1,`rgba(${col},0)`);tx.fillStyle=g;tx.beginPath();tx.ellipse(X+8,Y+9,7,3.5,0,0,7);tx.fill();}
    if(r>.5&&r<.54)R_(tx,X+6,Y+6,3,2,'#22202c');}
  else if(f==='grass'){R_(tx,X,Y,T,T,odd?'#173f26':'#1a4529');for(let i=0;i<10;i++){const a=hsh(x,y,i),b=hsh(x,y,i+20);R_(tx,X+a*15,Y+b*14,.5,1.5,i%3?'#2a6e3e':'#3c8f52');}
    if(r>.88){R_(tx,X+5,Y+6,1,1,r>.94?'#ff8ac0':'#ffe14d');R_(tx,X+5,Y+7,.5,1,'#2a6e3e');}}
  else if(f==='conc'){R_(tx,X,Y,T,T,'#3b3b49');R_(tx,X,Y,T,.5,'#50505f');R_(tx,X,Y,.5,T,'#2b2b37');for(let i=0;i<5;i++)R_(tx,X+hsh(x,y,i)*15,Y+hsh(x,y,i+9)*15,1,.5,i%2?'#474756':'#30303c');
    if(r<.1){const g=tx.createRadialGradient(X+8,Y+8,0,X+8,Y+8,6);g.addColorStop(0,'rgba(8,8,12,.5)');g.addColorStop(1,'rgba(8,8,12,0)');tx.fillStyle=g;tx.fillRect(X,Y,T,T);}
    if(r>.93){for(let i=0;i<4;i++)R_(tx,X+1+i*4,Y+12,2.5,1,'#c9a52a');}}
  else if(f==='metal'){R_(tx,X,Y,T,T,'#484852');R_(tx,X,Y,T,.5,'#62626e');R_(tx,X,Y+T-.5,T,.5,'#2e2e36');R_(tx,X+8,Y,.5,T,'#383840');
    for(let j=0;j<4;j++)for(let i=0;i<4;i++){const ox=X+1.5+i*4+((j%2)?2:0),oy=Y+1.5+j*4;R_(tx,ox,oy,1.5,.5,'#5c5c68');R_(tx,ox+.5,oy+.5,.5,1,'#3a3a44');}}
  else if(f==='lab'){R_(tx,X,Y,T,T,'#cdd8e0');for(const[a,b]of[[0,0],[8,0],[0,8],[8,8]]){R_(tx,X+a,Y+b,8,.5,'#eef5fa');R_(tx,X+a,Y+b+7.5,8,.5,'#97a6b3');R_(tx,X+a+7.5,Y+b,.5,8,'#97a6b3');}
    tx.fillStyle='rgba(120,200,255,.10)';tx.fillRect(X+1,Y+1,3,1);}
  else if(f==='disco'){R_(tx,X,Y,T,T,'#120820');R_(tx,X+.5,Y+.5,T-1,T-1,'#1c0f30');R_(tx,X+1,Y+1,T-2,.5,'#2e1a4a');}
  else if(f==='carpet'){R_(tx,X,Y,T,T,'#531b36');for(let i=0;i<14;i++)R_(tx,X+hsh(x,y,i)*15,Y+hsh(x,y,i+40)*15,.5,.5,i%2?'#6a2647':'#43142b');
    tx.fillStyle='#6f2a4c';tx.beginPath();tx.moveTo(X+8,Y+4);tx.lineTo(X+12,Y+8);tx.lineTo(X+8,Y+12);tx.lineTo(X+4,Y+8);tx.fill();tx.fillStyle='#531b36';tx.beginPath();tx.moveTo(X+8,Y+6);tx.lineTo(X+10,Y+8);tx.lineTo(X+8,Y+10);tx.lineTo(X+6,Y+8);tx.fill();
    R_(tx,X,Y,.5,.5,'#c9a24a');R_(tx,X+7.5,Y+7.5,1,1,'#c9a24a');}
  else{for(let i=0;i<4;i++){const v=hsh(x>>1,y*4+i,5),col=mixC('#3d2718',(v-.5)*.22);R_(tx,X,Y+i*4,T,4,col);R_(tx,X,Y+i*4,T,.5,'rgba(255,220,170,.07)');R_(tx,X,Y+i*4+3.5,T,.5,'rgba(20,10,4,.55)');
      if(hsh(x,y,i+70)>.72)R_(tx,X+2+hsh(x,y,i+80)*12,Y+i*4,.5,3.5,'rgba(20,10,4,.35)');if(hsh(x,y,i+60)>.85)R_(tx,X+hsh(x,y,i)*12+1,Y+i*4+1.5,1.5,1,'#2c1a0e');}}
  // Schatten unter/neben Wänden
  if(isWall(x,y-1)){const g=tx.createLinearGradient(0,Y,0,Y+7);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');tx.fillStyle=g;tx.fillRect(X,Y,T,7);}
  if(isWall(x-1,y)){const g=tx.createLinearGradient(X,0,X+5,0);g.addColorStop(0,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,0)');tx.fillStyle=g;tx.fillRect(X,Y,5,T);}
  if(isWall(x+1,y)){const g=tx.createLinearGradient(X+T,0,X+T-3,0);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,0)');tx.fillStyle=g;tx.fillRect(X+T-3,Y,3,T);}
};

// ---------- Objekte ----------
function blk(X,Y,w,h,z,top,front){R_(tx,X+1,Y+h-.5,w,2.5,'rgba(0,0,0,.4)');R_(tx,X,Y,w,h,K_);R_(tx,X+.5,Y+.5,w-1,h-z-.5,top);R_(tx,X+.5,Y+h-z,w-1,z-.5,front||mixC(top,-.35));R_(tx,X+.5,Y+.5,w-1,.5,mixC(top,.3));R_(tx,X+.5,Y+h-z,w-1,.5,mixC(top,-.15));}
function carHD(X,Y,w,h,c,neon){const x0=X+1,y0=Y+3,ww=w-2,hh=h-6;
  if(neon){const g=tx.createRadialGradient(X+w/2,Y+h/2,4,X+w/2,Y+h/2,w*.7);g.addColorStop(0,'rgba(255,61,139,.45)');g.addColorStop(1,'rgba(255,61,139,0)');tx.fillStyle=g;tx.fillRect(X-8,Y-6,w+16,h+12);}
  tx.fillStyle='rgba(0,0,0,.45)';rr(tx,x0+1,y0+2,ww,hh,4);tx.fill();
  for(const[wx,wy]of[[x0+4,y0-1],[x0+ww-11,y0-1],[x0+4,y0+hh-2],[x0+ww-11,y0+hh-2]]){R_(tx,wx,wy,7,3,'#0a0a0e');R_(tx,wx+1,wy+.5,5,.5,'#33333c');}
  tx.fillStyle=K_;rr(tx,x0,y0,ww,hh,4);tx.fill();const g=tx.createLinearGradient(0,y0,0,y0+hh);g.addColorStop(0,mixC(c,.3));g.addColorStop(.5,c);g.addColorStop(1,mixC(c,-.35));tx.fillStyle=g;rr(tx,x0+.5,y0+.5,ww-1,hh-1,3.5);tx.fill();
  tx.fillStyle='rgba(12,18,32,.92)';rr(tx,x0+ww*.26,y0+2,ww*.44,hh-4,2);tx.fill();tx.fillStyle=mixC(c,.12);rr(tx,x0+ww*.36,y0+3.5,ww*.2,hh-7,1.5);tx.fill();
  const wg=tx.createLinearGradient(x0+ww*.58,0,x0+ww*.7,0);wg.addColorStop(0,'#3d6a8a');wg.addColorStop(1,'#a8e0f2');tx.fillStyle=wg;tx.fillRect(x0+ww*.58,y0+3,ww*.1,hh-6);
  R_(tx,x0+ww*.28,y0+3,ww*.06,hh-6,'#27425a');R_(tx,x0+ww*.72,y0+hh/2-.25,ww*.2,.5,mixC(c,-.3));
  R_(tx,x0+ww-2,y0+2,1.5,3.5,'#fff3b0');R_(tx,x0+ww-2,y0+hh-5.5,1.5,3.5,'#fff3b0');R_(tx,x0+.5,y0+2,1.5,3,'#ff3030');R_(tx,x0+.5,y0+hh-5,1.5,3,'#ff3030');
  if(neon){R_(tx,x0+3,y0+hh-1,ww-6,.5,'#ff3d8b');R_(tx,x0+3,y0+.5,ww-6,.5,'#ff3d8b');}}
drawObj=function(o){const X=o.x*T,Y=o.y*T,w=o.w*T,h=o.h*T;
  switch(o.kind){
  case'V':blk(X+1,Y+2,w-2,12.5,4,'#7a5626','#4a3212');R_(tx,X+2,Y+3,w-4,7,'#0e2030');{const g=tx.createLinearGradient(X,Y+3,X+w,Y+10);g.addColorStop(0,'rgba(140,240,255,.75)');g.addColorStop(.5,'rgba(90,190,230,.45)');g.addColorStop(1,'rgba(170,250,255,.8)');tx.fillStyle=g;tx.fillRect(X+2,Y+3,w-4,7);}
    for(let i=0;i<6;i++){const gx=X+4.5+i*4;R_(tx,gx,Y+6,2,1.5,['#ffd34d','#fff','#ff8ac0','#7dffb2','#ffd34d','#fff'][i]);R_(tx,gx+.5,Y+5.5,1,.5,'#fff');}
    tx.fillStyle='rgba(255,255,255,.55)';tx.beginPath();tx.moveTo(X+4,Y+10);tx.lineTo(X+9,Y+3);tx.lineTo(X+11,Y+3);tx.lineTo(X+6,Y+10);tx.fill();R_(tx,X+w/2-2,Y+11.5,4,1,'#c9a24a');break;
  case'S':blk(X,Y+.5,w,14,3,'#5e3d22','#3a2412');for(let i=0;i<3;i++){R_(tx,X+1,Y+2+i*3.5,w-2,3,'#2a180c');for(let j=0;j<7;j++){const v=hsh(o.x+j,o.y+i,2);if(v<.2)continue;const bh=1.5+v*1.5;R_(tx,X+1.5+j*4.2,Y+5-bh+i*3.5,3,bh,['#a8323a','#3464c0','#c9a24a','#3c9a5a','#8a5ac8','#d87a2a','#d8d0c0'][(j+i*3+o.x)%7]);}R_(tx,X+1,Y+5+i*3.5,w-2,.5,'#7a5230');}break;
  case'C':blk(X+2,Y+3,12,11.5,4,'#a8743a','#6e4418');R_(tx,X+2.5,Y+6.5,11,.5,'#6e4418');R_(tx,X+7.5,Y+3.5,.5,7,'#6e4418');R_(tx,X+3,Y+4,1,1,'#3a2410');R_(tx,X+12,Y+4,1,1,'#3a2410');R_(tx,X+5,Y+11.5,6,1.5,'#e8dcc0');R_(tx,X+6,Y+12,3,.5,'#8a2020');break;
  case'D':blk(X,Y+3,w,11.5,4,'#6e3d22','#3e2010');R_(tx,X+1,Y+4,w-2,.5,'#8e5a36');R_(tx,X+5,Y+5,8,4,'#f1ede0');R_(tx,X+6,Y+6,5,.5,'#8a8a98');R_(tx,X+6,Y+7.5,6,.5,'#8a8a98');R_(tx,X+21,Y+4.5,3.5,4.5,'#1a2a20');R_(tx,X+21.5,Y+5,2.5,3,'#3cc878');R_(tx,X+15,Y+6.5,4,2,'#1a1a22');R_(tx,X+27,Y+5,2,2,'#ff5fa8');
    R_(tx,X+3,Y+11.5,8,2,'#2a1408');R_(tx,X+6.5,Y+12,1.5,.5,'#ffd34d');R_(tx,X+w-11,Y+11.5,8,2,'#2a1408');R_(tx,X+w-7.5,Y+12,1.5,.5,'#ffd34d');break;
  case'X':blk(X+1,Y+.5,14,14,3.5,'#6c7482','#3c424e');R_(tx,X+2.5,Y+2,11,8.5,'#858e9e');R_(tx,X+2.5,Y+2,11,.5,'#b4bccb');tx.fillStyle='#2c313a';tx.beginPath();tx.arc(X+8,Y+6.2,3,0,7);tx.fill();tx.fillStyle='#ffd34d';tx.beginPath();tx.arc(X+8,Y+6.2,2,0,7);tx.fill();R_(tx,X+7.75,Y+4.5,.5,3.5,'#7a5a10');R_(tx,X+6.3,Y+6,3.5,.5,'#7a5a10');R_(tx,X+12,Y+3,1,6,'#2c313a');R_(tx,X+3,Y+12,2,1,'#ff3030');break;
  case'Y':blk(X+1,Y+.5,14,14,2,'#727886','#444a56');for(let i=0;i<3;i++)for(let j=0;j<2;j++){R_(tx,X+2+j*6.5,Y+1.5+i*3.8,5.5,3.2,'#9299a8');R_(tx,X+2+j*6.5,Y+1.5+i*3.8,5.5,.5,'#c0c6d2');R_(tx,X+4+j*6.5,Y+2.8+i*3.8,1.5,1,'#ffd34d');}break;
  case'G':blk(X+1,Y+5,14,9.5,3,'#8e94a2','#565c68');R_(tx,X+2,Y+11.8,2,2,'#111');R_(tx,X+12,Y+11.8,2,2,'#111');for(const[a,b]of[[2,6],[8,6],[5,3.5]]){R_(tx,X+a,Y+b,6,3,'#7a5a10');R_(tx,X+a+.5,Y+b+.5,5,2,'#ffd34d');R_(tx,X+a+.5,Y+b+.5,5,.5,'#fff3b0');}break;
  case'Z':blk(X+1,Y,14,15,3,'#3270c4','#1c4288');R_(tx,X+8,Y+1,.5,11,'#163466');for(const a of[3,10]){R_(tx,X+a,Y+2.5,3,.5,'#163466');R_(tx,X+a,Y+3.5,3,.5,'#163466');R_(tx,X+a+1,Y+7,1,1.5,'#d8dee8');}break;
  case'Q':blk(X+1,Y+1.5,w-2,13,4,'#9a6a3a','#5a3618');for(let i=0;i<2;i++){R_(tx,X+2.5,Y+3+i*3.6,w-5,3,'#7e5228');R_(tx,X+2.5,Y+3+i*3.6,w-5,.5,'#b8834c');R_(tx,X+w/2-2,Y+4.2+i*3.6,4,.8,'#ffd34d');}
    R_(tx,X+4,Y+1,3,2,'#ff5fa8');R_(tx,X+8,Y+.5,4,2.5,'#2fe0ea');R_(tx,X+w-9,Y+1,4,2,'#f4f1e8');break;
  case'R':blk(X+1,Y,14,15,3,'#d23434','#8a1616');for(let i=0;i<3;i++){R_(tx,X+2.5,Y+2+i*3.3,11,2.6,'#b02222');R_(tx,X+2.5,Y+2+i*3.3,11,.5,'#f06a6a');R_(tx,X+6.5,Y+3+i*3.3,3,.6,'#e8e8f0');}break;
  case'K':blk(X+1,Y,14,15,3,'#e6ecf2','#a8b4c0');R_(tx,X+2,Y+5,12,.5,'#98a6b4');R_(tx,X+11.5,Y+1.5,1,2.5,'#606874');R_(tx,X+11.5,Y+6.5,1,4,'#606874');R_(tx,X+3,Y+2,2,1,'#ff5fa8');R_(tx,X+5.5,Y+7,2.5,2,'#ffe14d');break;
  case'A':carHD(X,Y,w,h,o.x%2?'#d23a6a':'#2a7ad0',0);R_(tx,X+w*.8,Y+h/2-3,4,6,'#111');break;
  case'getaway':case'parked':carHD(X,Y,w,h,o.col||'#888',o.kind==='getaway');break;
  case'bed':blk(X+1,Y+1,w-2,h-2,3,'#ebe3f2','#9c8fae');R_(tx,X+3,Y+3,w-6,6,'#fff');R_(tx,X+4,Y+4,10,3.5,'#e2dcec');R_(tx,X+w-14,Y+4,10,3.5,'#e2dcec');R_(tx,X+2,Y+11,w-4,h-17,'#b03c72');R_(tx,X+2,Y+11,w-4,1.5,'#d85c94');for(let i=0;i<4;i++)R_(tx,X+5+i*6,Y+15,3,.5,'#8a2a58');break;
  case'sofa':blk(X,Y+1.5,w,13,4,'#3f6fd8','#213c8a');R_(tx,X+.5,Y+2,w-1,3.5,'#5a8af0');R_(tx,X+.5,Y+2,2.5,9,'#5a8af0');R_(tx,X+w-3,Y+2,2.5,9,'#5a8af0');R_(tx,X+w/2-.25,Y+5.5,.5,5,'#213c8a');R_(tx,X+5,Y+6.5,5,3,'#ff5fa8');break;
  case'table':blk(X+1,Y+3.5,w-2,10.5,3.5,'#8a5a30','#4e2c12');R_(tx,X+5,Y+5.5,4.5,3.5,'#f4f1e8');R_(tx,X+6,Y+6.5,2.5,1.5,'#d8a04a');R_(tx,X+17,Y+5.5,3,3,'#3cc878');R_(tx,X+24,Y+6,2,3,'#7ff6ff');break;
  case'counter':blk(X,Y+1.5,w,13,4.5,'#c8d4dc','#6e7c8a');R_(tx,X+5,Y+3,7,5,'#3a3a44');R_(tx,X+6,Y+4,5,2,'#7dffb2');R_(tx,X+27,Y+3.5,9,4.5,'#e8e0d0');R_(tx,X+17,Y+4,5,3,'#ff5fa8');R_(tx,X+1,Y+11,w-2,.5,'#ff3d8b');break;
  case'plant':R_(tx,X+3,Y+12.5,11,2.5,'rgba(0,0,0,.4)');R_(tx,X+4.5,Y+9,7,5.5,K_);R_(tx,X+5,Y+9.5,6,4.5,'#b0643a');R_(tx,X+5,Y+9.5,6,1,'#d0845a');for(let i=0;i<7;i++){const a=i/7*6.28+o.x,lx=X+8+Math.cos(a)*4,ly=Y+5+Math.sin(a)*3.4;tx.fillStyle=K_;tx.beginPath();tx.ellipse(lx,ly,3.3,2,a,0,7);tx.fill();tx.fillStyle=i%2?'#2e9a44':'#3fba58';tx.beginPath();tx.ellipse(lx,ly,2.8,1.5,a,0,7);tx.fill();}tx.fillStyle='#5fd878';tx.beginPath();tx.arc(X+8,Y+5,1.6,0,7);tx.fill();break;
  case'bush':R_(tx,X+1,Y+12,15,3,'rgba(0,0,0,.35)');for(const[a,b,r,c]of[[5,9,5,'#17401f'],[11,9,5,'#17401f'],[8,6,5.5,'#1e5a2c'],[5,8,3.5,'#2a7a3c'],[11,7,3.5,'#2a7a3c'],[8,5,3,'#3c9a50']]){tx.fillStyle=c;tx.beginPath();tx.arc(X+a,Y+b,r,0,7);tx.fill();}R_(tx,X+6,Y+4,1,1,'#ff8ac0');R_(tx,X+11,Y+6,1,1,'#ffe14d');break;
  case'trash':blk(X+2,Y+2,12,12.5,6,'#3f8a76','#235a4a');R_(tx,X+1.5,Y+2,13,2,K_);R_(tx,X+2,Y+2.5,12,1,'#5ab09a');for(let i=0;i<4;i++)R_(tx,X+4+i*2.5,Y+9,.6,4.5,'#1a4438');break;
  case'lift':R_(tx,X+1,Y+1,w-2,h-2,'rgba(0,0,0,.3)');for(const a of[2,w-6.5]){R_(tx,X+a,Y+2,4.5,h-4,K_);R_(tx,X+a+.5,Y+2.5,3.5,h-5,'#ffd23c');for(let i=0;i<h-6;i+=4)R_(tx,X+a+.5,Y+3+i,3.5,1.5,'#1a1a1a');}R_(tx,X+2,Y+h/2-1.5,w-4,3,K_);R_(tx,X+2.5,Y+h/2-1,w-5,2,'#6a6e7a');break;
  case'fuse':blk(X+3,Y+.5,10,14,2,'#747a86','#444a54');R_(tx,X+4.5,Y+2,7,9,'#585e6a');tx.fillStyle='#ffe14d';tx.beginPath();tx.moveTo(X+9,Y+3);tx.lineTo(X+6,Y+7);tx.lineTo(X+8,Y+7);tx.lineTo(X+7,Y+10);tx.lineTo(X+10.5,Y+6);tx.lineTo(X+8.5,Y+6);tx.fill();break;
  case'mon':blk(X,Y+7,16,7.5,3,'#4a3626','#2a1c12');R_(tx,X+1.5,Y,13,8.5,K_);R_(tx,X+2,Y+.5,12,7.5,'#1c1c24');R_(tx,X+3,Y+1.5,10,5.5,'#0a2c36');break;
  case'panel':blk(X+3,Y+1.5,10,12.5,1.5,'#e2e2ea','#9a9aa6');R_(tx,X+4.5,Y+3,7,3.5,'#0a1420');for(let i=0;i<3;i++)for(let j=0;j<3;j++)R_(tx,X+5+j*2.2,Y+7.5+i*1.6,1.4,1,'#40404c');break;}
};

// ---------- Kachel-Ebene + Glüh-Ebene ----------
const LCOL=['255,95,168','47,224,234','255,214,120'];
function glowDot(g,x,y,r,rgb,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${rgb},${a})`);gr.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
drawTiles=function(){
  tiles=document.createElement('canvas');tiles.width=W*T*HD;tiles.height=H*T*HD;tx=tiles.getContext('2d');tx.scale(HD,HD);
  glowC=document.createElement('canvas');glowC.width=W*T;glowC.height=H*T;const gx=glowC.getContext('2d');
  const accRGB=hexRGB(ACC).join(',');
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=G[y][x],X=x*T,Y=y*T;
    if(c==='#'){const inner=isWall(x-1,y)&&isWall(x+1,y)&&isWall(x,y-1)&&isWall(x,y+1);R_(tx,X,Y,T,T,inner?'#0b0511':'#190d22');
      if(inner){if(hsh(x,y,4)>.7)R_(tx,X+hsh(x,y,5)*12,Y+hsh(x,y,6)*12,2,.5,'#150a1e');}
      else{R_(tx,X+1,Y+1,T-2,T-2,'#22122e');if(!isWall(x,y-1))R_(tx,X,Y,T,1,'#4d2c60');if(!isWall(x-1,y))R_(tx,X,Y,1,T,'#3a2049');if(!isWall(x+1,y))R_(tx,X+T-1,Y,1,T,'#120918');}
      continue;}
    floorTile(x,y);
    if(c==='E'){for(let i=0;i<4;i++){R_(tx,X+i*4,Y+2,2.5,T-4,'rgba(125,255,178,.8)');}glowDot(gx,X+8,Y+8,14,'125,255,178',.5);}
    if(c==='T'){R_(tx,X+4,Y+5,8,6,'rgba(60,60,72,.5)');R_(tx,X+5,Y+7.5,6,.5,'rgba(170,170,185,.55)');R_(tx,X+4,Y+5,8,.5,'rgba(120,120,135,.4)');}
    if(c==='t'){R_(tx,X+3,Y+4,10,8,K_);R_(tx,X+3.5,Y+4.5,9,7,'#5c5c6a');for(let i=0;i<5;i++){R_(tx,X+3.5+i*2,Y+4.5,1,2,'#e2e2ea');R_(tx,X+3.5+i*2,Y+9.5,1,2,'#e2e2ea');}R_(tx,X+6,Y+7,4,2,'#a01010');}
    if(c==='O'){R_(tx,X,Y,T,T,'#0c1a26');for(let i=0;i<4;i++)R_(tx,X,Y+i*4,T,2,'#7dffb2');}
    if(c==='d'){R_(tx,X,Y,1.5,T,K_);R_(tx,X+T-1.5,Y,1.5,T,K_);R_(tx,X+.5,Y,.5,T,'#6a4a2a');R_(tx,X+T-1,Y,.5,T,'#6a4a2a');R_(tx,X+1.5,Y+7.5,T-3,1,'rgba(0,0,0,.25)');}}
  // Wand-Fronten
  for(let y=0;y<H-1;y++)for(let x=0;x<W;x++){if(G[y][x]==='#'&&G[y+1][x]!=='#'){const X=x*T,Y=y*T,out=y>=yardTop-1,base=out?'#5a3a34':'#4b2650';
    const g=tx.createLinearGradient(0,Y+3,0,Y+T);g.addColorStop(0,mixC(base,.16));g.addColorStop(1,mixC(base,-.3));tx.fillStyle=g;tx.fillRect(X,Y+3,T,T-3);
    R_(tx,X,Y+2.5,T,1,mixC(base,.4));R_(tx,X,Y+2,T,.5,K_);
    if(out){for(let r=0;r<3;r++){R_(tx,X,Y+5.5+r*3,T,.5,'rgba(0,0,0,.28)');const off=(r%2?4:0)+(x%2?0:0);for(let i=off;i<T;i+=8)R_(tx,X+i,Y+5.5+r*3,.5,3,'rgba(0,0,0,.28)');}}
    else{R_(tx,X,Y+10.5,T,.5,'rgba(0,0,0,.3)');R_(tx,X+((x%2)?3:11),Y+5,.5,5.5,'rgba(255,255,255,.05)');if(hsh(x,y,8)>.86){R_(tx,X+4,Y+4.5,8,5.5,K_);R_(tx,X+4.5,Y+5,7,4.5,['#ff5fa8','#2fe0ea','#ffe14d'][x%3]);R_(tx,X+5.5,Y+6,5,2.5,'#1a1020');R_(tx,X+6,Y+6.5,2,1,'#fff');}}
    const nc=out?'#ff9f43':ACC,nr=out?'255,159,67':accRGB;R_(tx,X,Y+T-2.5,T,2.5,'#14091c');R_(tx,X,Y+T-2,T,1.2,nc);R_(tx,X,Y+T-2,T,.4,'#fff');
    const sg=tx.createLinearGradient(0,Y+T,0,Y+T+8);sg.addColorStop(0,`rgba(${nr},.28)`);sg.addColorStop(1,`rgba(${nr},0)`);tx.fillStyle=sg;tx.fillRect(X,Y+T,T,8);
    const gg=gx.createLinearGradient(0,Y+T-6,0,Y+T+12);gg.addColorStop(0,`rgba(${nr},0)`);gg.addColorStop(.3,`rgba(${nr},.42)`);gg.addColorStop(1,`rgba(${nr},0)`);gx.fillStyle=gg;gx.fillRect(X,Y+T-6,T,18);}}
  OBJ.forEach(drawObj);
  OBJ.forEach(o=>{const X=o.x*T,Y=o.y*T;if(o.kind==='mon')glowDot(gx,X+8,Y+5,18,'47,224,234',.6);if(o.kind==='V')glowDot(gx,X+o.w*8,Y+7,20,'150,240,255',.4);if(o.kind==='G')glowDot(gx,X+8,Y+7,14,'255,211,77',.5);
    if(o.kind==='getaway'){glowDot(gx,X+o.w*T+6,Y+o.h*8,22,'255,243,176',.5);glowDot(gx,X+o.w*8,Y+o.h*8,30,'255,61,139',.35);}});
  // Lampen
  LIGHTS.forEach(([x,y],i)=>{const X=x*T,Y=y*T,rgb=LCOL[i%3];tx.fillStyle='rgba(0,0,0,.35)';tx.beginPath();tx.ellipse(X+.5,Y+1.5,4,2.5,0,0,7);tx.fill();tx.fillStyle=K_;tx.beginPath();tx.arc(X,Y,3.5,0,7);tx.fill();tx.fillStyle='#3a3344';tx.beginPath();tx.arc(X,Y,3,0,7);tx.fill();tx.fillStyle=`rgb(${rgb})`;tx.beginPath();tx.arc(X,Y,2.2,0,7);tx.fill();tx.fillStyle='#fff';tx.beginPath();tx.arc(X-.5,Y-.5,1,0,7);tx.fill();glowDot(gx,X,Y,46,rgb,.42);const g=tx.createRadialGradient(X,Y,0,X,Y,30);g.addColorStop(0,`rgba(${rgb},.16)`);g.addColorStop(1,`rgba(${rgb},0)`);tx.fillStyle=g;tx.fillRect(X-30,Y-30,60,60);});
  // Schilder
  LABELS.forEach(([t,x,y,c])=>{tx.font='bold 6px monospace';const wd=tx.measureText(t).width+5,X=x*T+1,Y=y*T-10;R_(tx,X,Y,wd,8,K_);R_(tx,X+.5,Y+.5,wd-1,7,'#1a0e28');R_(tx,X+.5,Y+7,wd-1,.5,c);tx.fillStyle=c;tx.fillText(t,X+2.5,Y+6);glowDot(gx,X+wd/2,Y+4,wd*.7,hexRGB(c[0]==='#'?c:'#ffffff').join(','),.3);});
  camSnap=true;PT=[];FT=[];seenS=new WeakSet();seenF=new WeakSet();contDone=new WeakMap();gState=new WeakMap();lastHp=P.hp;lastBag=BAG.length;lastVal=bagVal();
};

// ---------- Figuren ----------
function charHD(c,x,y,dir,step,moving,pal,o){o=o||{};const d=dirName(dir),sc=o.scale||1,f=d==='left'?-1:1,side=d==='left'||d==='right';
  const ph=moving?Math.sin(step*Math.PI):0,bob=moving?-Math.abs(Math.cos(step*Math.PI))*1.1+.4:Math.sin(NOW/520+(o.seed||0))*.35;
  c.fillStyle='rgba(0,0,0,.42)';c.beginPath();c.ellipse(x,y+2.5,6.5*sc,2.3*sc,0,0,7);c.fill();
  c.save();c.translate(x,y+3);c.scale(sc,sc);const parts=[];
  const A=(px_,py,w,h,col,b)=>parts.push([f>0?px_:-px_-w,py+(b?bob:0),w,h,col]);
  const n=pal.n,nD=mixC(pal.n,-.3),sk=pal.s,skD=pal.S,hair=pal.h,j=pal.p,jD=pal.P;
  if(o.bag&&side)A(-6.5,-13,3.5,6.5,'#4d6e3c',1);
  if(!side){const lL=Math.max(0,ph)*1.6,lR=Math.max(0,-ph)*1.6;
    A(-3.5,-6,3,4.5-lL,n);A(-3.5,-1.5-lL,3,1.5,pal.b);A(.5,-6,3,4.5-lR,n);A(.5,-1.5-lR,3,1.5,pal.b);
    A(-6.5,-12.5-ph*.8,2,5.5,jD,1);A(-6.5,-7-ph*.8,2,1.5,sk,1);A(4.5,-12.5+ph*.8,2,5.5,jD,1);A(4.5,-7+ph*.8,2,1.5,sk,1);
    A(-4.5,-13,9,7.5,j,1);A(-4.5,-7,9,1.5,jD,1);
    if(d==='down'){A(-1.25,-13,2.5,4,pal.w,1);if(o.guard){A(1.8,-11.5,1.5,1.5,pal.y,1);A(-4.5,-7,9,1,'#0a0a14',1);A(-.75,-7,1.5,1,pal.y,1);}else A(-.5,-12.5,1,2.5,pal.y,1);
      A(-4,-20.5,8,7.5,sk,1);A(-4,-14.5,8,1.5,skD,1);A(-4.5,-21.5,9,3,hair,1);A(-4.5,-19,1,2.5,hair,1);A(3.5,-19,1,2.5,hair,1);
      if(pal.g!==pal.s){A(-3.75,-18,7.5,2,pal.g,1);A(-3.25,-17.6,2.75,1.1,pal.c,1);A(.5,-17.6,2.75,1.1,pal.c,1);A(-3,-17.6,1,.5,'#ffffff',1);}
      else{A(-2.75,-17.6,1.5,1.5,'#1a1020',1);A(1.25,-17.6,1.5,1.5,'#1a1020',1);}
      A(-1,-15.2,2,.5,skD,1);}
    else{A(-.25,-13,.5,6,jD,1);A(-2,-14.5,4,1.5,skD,1);A(-4,-20.5,8,6.5,sk,1);A(-4.5,-21.5,9,6.5,hair,1);A(-4.5,-21.5,9,1,mixC(hair.startsWith('#')?hair:'#3b2416',.2),1);
      if(o.bag){A(-3.75,-13,7.5,7,'#4d6e3c',1);A(-3.75,-9.5,7.5,.75,'#35502a',1);A(-1,-12,2,1,pal.y||'#ffd34d',1);}}}
  else{A(-1.5-ph*2.2,-6,3,4.5,nD);A(-1.5-ph*2.2,-1.5,3.5,1.5,mixC(pal.b.startsWith('#')?pal.b:'#333333',-.3));A(-1.5+ph*2.2,-6,3,4.5,n);A(-1.5+ph*2.2,-1.5,3.5,1.5,pal.b);
    A(-3,-13,6,7.5,j,1);A(-3,-7,6,1.5,jD,1);A(1.5,-13,1.5,4,pal.w,1);if(o.guard)A(-3,-7,6,1,'#0a0a14',1);
    A(-1.2-ph*1.6,-12.3,2.5,5.5,jD,1);A(-1.2-ph*1.6,-6.8,2.5,1.5,sk,1);
    A(-3.5,-20.5,7.5,7.5,sk,1);A(-3.5,-14.5,7,1.5,skD,1);A(-4,-21.5,7.5,3,hair,1);A(-4,-19,2.75,4.5,hair,1);A(4,-17.2,1,1.5,sk,1);
    if(pal.g!==pal.s){A(.25,-18,3.75,2,pal.g,1);A(1.25,-17.6,2.5,1.1,pal.c,1);A(-2,-17.5,2.5,.6,pal.g,1);}else A(1.75,-17.6,1.5,1.5,'#1a1020',1);
    A(1.5,-15.2,2,.5,skD,1);}
  // Kopfbedeckung
  const hat=o.hat,HC=hat&&HATS[hat]?HATS[hat].c:null;
  if(o.guard){A(-4.5,-22.5,9,3,'#16224a',1);if(d==='down')A(-5,-20,10,1.2,'#0a0a14',1);else if(side)A(0,-20,6.5,1.2,'#0a0a14',1);if(d==='down')A(-1,-22,2,1.5,pal.y,1);}
  else if(HC&&(hat==='cap'||hat==='neon_cap')){A(-4.5,-22.5,9,3.2,HC.r,1);A(-4.5,-20,9,.8,HC.R,1);if(d==='down')A(-4.5,-19.6,9,1.2,HC.R,1);else if(side)A(0,-19.8,7,1.2,HC.R,1);}
  else if(HC&&(hat==='fedora'||hat==='panama')){A(-3.5,-24,7,3.5,HC.f,1);A(-3.5,-21.7,7,1.2,HC.F,1);A(-6.5,-20.6,13,1.3,HC.f,1);}
  else if(HC&&hat==='bandana'){A(-4.5,-21.5,9,2.2,HC.r,1);if(side||d==='up')A(-6,-20.5,2,1.2,HC.r,1);}
  if(o.bag&&d==='down'){A(-4.5,-12.5,1,4.5,'#35502a',1);A(3.5,-12.5,1,4.5,'#35502a',1);}
  if(o.weapon&&d==='up')drawWeapon(c,0,-3,d,bob,o.weapon,o.swing||0);
  c.fillStyle=K_;for(const p of parts)c.fillRect(p[0]-.5,p[1]-.5,p[2]+1,p[3]+1);
  for(const p of parts){c.fillStyle=p[4];c.fillRect(p[0],p[1],p[2],p[3]);}
  if(o.flash){const fx_=d==='left'?-6.5:d==='right'?5:4.5,fy=-7.5+bob;R_(c,fx_-.5,fy-.5,2.5,2.5,K_);R_(c,fx_,fy,1.5,1.5,'#fff3b0');}
  if(o.weapon&&d!=='up')drawWeapon(c,0,-3,d,bob,o.weapon,o.swing||0);
  c.restore();}
function dogHD(c,x,y,dir,step,moving){const f=Math.cos(dir)<0?-1:1,ph=moving?Math.sin(step*Math.PI*1.5):0;
  c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(x,y+2,7,2.2,0,0,7);c.fill();c.save();c.translate(x,y+2);c.scale(f,1);
  const parts=[[-6,-8.5,10,4.5,'#4a2e18'],[-6,-8.5,10,1,'#7a4e28'],[3,-12,5,4.5,'#4a2e18'],[6.5,-10,2.5,2.5,'#2a1808'],[3.5,-13.5,1.5,2,'#2a1808'],[5.5,-13.5,1.5,2,'#2a1808'],[-7.5,-10-ph,1.5,3,'#4a2e18'],
    [-5,-4,1.5,4+ph,'#3a2210'],[-2.5,-4,1.5,4-ph,'#3a2210'],[1,-4,1.5,4-ph,'#3a2210'],[3,-4,1.5,4+ph,'#3a2210'],[2,-9,3,1,'#c62828']];
  c.fillStyle=K_;for(const p of parts)c.fillRect(p[0]-.5,p[1]-.5,p[2]+1,p[3]+1);for(const p of parts){c.fillStyle=p[4];c.fillRect(p[0],p[1],p[2],p[3]);}R_(c,6,-11,1,1,'#ff5a5a');c.restore();}

// ---------- Partikel ----------
let seenS=new WeakSet(),seenF=new WeakSet(),contDone=new WeakMap(),gState=new WeakMap(),lastHp=100,lastBag=0,lastVal=0,lastStep=0,hitFlash=0;
function emit(x,y,n,o){for(let i=0;i<n;i++){const a=(o.a!=null?o.a:0)+(Math.random()-.5)*(o.spread!=null?o.spread:6.28),v=(o.v||30)*(.4+Math.random()*.8);PT.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||0),g:o.g||0,l:0,m:(o.life||.4)*(.6+Math.random()*.7),c:o.cols?o.cols[i%o.cols.length]:o.c,s:o.s||1,fade:o.fade!==false,grow:o.grow||0,z:o.z||0});}if(PT.length>500)PT.splice(0,PT.length-500);}
function ftext(x,y,t,c){FT.push({x,y,t:0,txt:t,c});}
function fxWatch(dt){
  // Schritte
  const st=Math.floor(P.step);if(P.moving&&st!==lastStep){lastStep=st;const[px_,py_]=[Math.floor(P.x/T),Math.floor(P.y/T)];const fl=FL[py_]&&FL[py_][px_];
    if(RAIN()&&py_>=yardTop)PT.push({x:P.x,y:P.y+2,vx:0,vy:0,g:0,l:0,m:.35,c:'rgba(170,210,255,.7)',s:1,ring:1,fade:true,grow:0,z:0});
    else emit(P.x-Math.cos(P.face)*3,P.y+2,2,{v:10,up:4,life:.35,c:fl==='grass'?'rgba(90,160,90,.6)':'rgba(190,180,200,.35)',s:1.2,grow:2});}
  // Funken / Blut
  sparks.forEach(s=>{if(seenS.has(s))return;seenS.add(s);if(s.blood){emit(s.x,s.y,8,{v:45,life:.35,cols:['#d0102a','#8a0a1c','#ff3048'],s:1,g:140});if(tx){for(let i=0;i<4;i++){tx.fillStyle='rgba(120,8,24,.55)';tx.beginPath();tx.ellipse(s.x+(Math.random()-.5)*10,s.y+6+(Math.random()-.5)*6,1+Math.random()*2,.6+Math.random(),0,0,7);tx.fill();}}}
    else{emit(s.x,s.y,7,{v:60,life:.25,cols:['#fff3b0','#ffe14d','#ff9f43'],s:.8,g:120});emit(s.x,s.y,2,{v:8,up:6,life:.5,c:'rgba(200,200,210,.35)',s:1.5,grow:3});}});
  flashes.forEach(f_=>{if(seenF.has(f_))return;seenF.add(f_);if(f_.muzzle){shake=Math.max(shake,1.6);const a=P.face+Math.PI/2;emit(P.x,P.y-7,1,{a,spread:.6,v:45,up:30,life:.6,c:'#e8c050',s:1,g:260,fade:false});emit(P.x+Math.cos(P.face)*9,P.y-7+Math.sin(P.face)*9,5,{a:P.face,spread:.7,v:90,life:.12,cols:['#fff','#ffe14d'],s:.8});}else shake=Math.max(shake,3);});
  // Behälter durchsucht
  OBJ.forEach(o=>{if(!o.cont)return;const was=contDone.get(o);if(was===false&&o.cont.done){emit((o.x+o.w/2)*T,(o.y+o.h/2)*T,10,{v:28,up:18,life:.6,cols:['#ffe14d','#fff','#7dffb2'],s:1,g:30});}contDone.set(o,!!o.cont.done);});
  // Rucksack
  if(BAG.length!==lastBag){const v=bagVal();if(BAG.length>lastBag){ftext(P.x,P.y-24,v>lastVal?'+$'+(v-lastVal):'+1','#7dffb2');emit(P.x,P.y-10,6,{v:22,up:20,life:.5,cols:['#ffe14d','#fff3b0'],s:1,g:60});}lastBag=BAG.length;lastVal=v;}
  // Treffer
  if(P.hp<lastHp-.5){const dmg=Math.round(lastHp-P.hp);if(dmg>=1){ftext(P.x,P.y-24,'-'+dmg,'#ff5a6e');shake=Math.max(shake,2.5+Math.min(4,dmg/8));hitFlash=.25;}}lastHp=P.hp;
  // Wachen
  guards.forEach(g=>{const s=gState.get(g)||{mode:g.mode,down:g.down,ex:0};if(g.mode!==s.mode){if(g.mode==='chase'||g.mode==='check')s.ex=.35;s.mode=g.mode;}
    if(g.down&&!s.down){s.down=true;emit(g.x,g.y-8,10,{v:35,up:10,life:.5,cols:g.dead?['#d0102a','#8a0a1c']:['#ffe14d','#fff'],s:1,g:90});shake=Math.max(shake,2);emit(g.x,g.y,4,{v:14,up:4,life:.5,c:'rgba(200,190,210,.4)',s:1.5,grow:4});}
    s.ex=Math.max(0,s.ex-dt);gState.set(g,s);});
  // Bewegung der Partikel
  PT.forEach(p=>{p.l+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*2;});PT=PT.filter(p=>p.l<p.m);
  FT.forEach(f_=>f_.t+=dt);FT=FT.filter(f_=>f_.t<1.1);
  shake=Math.max(0,shake-dt*9);hitFlash=Math.max(0,hitFlash-dt);}

// ---------- Sicht ----------
const lightBlock=(x,y)=>{const tx_=Math.floor(x/T),ty_=Math.floor(y/T);if(tx_<0||ty_<0||tx_>=W||ty_>=H)return true;const c=G[ty_][tx_];if(c==='#')return true;if('LKW'.includes(c)){const D=DOORS[tx_+','+ty_];return D&&!D.open&&D.type!=='W';}return false;};
function losPoly(x,y,rad){const N=96,pts=[];for(let i=0;i<N;i++){const a=i/N*6.2832,ca=Math.cos(a),sa=Math.sin(a);let r=0;while(r<rad&&!lightBlock(x+ca*r,y+sa*r))r+=3;r=Math.min(rad,r+9);pts.push(x+ca*r,y+sa*r);}return pts;}

// ---------- Zeichnen ----------
resize=function(){S=Math.max(2,Math.round(Math.min(innerWidth/220,innerHeight/190)));VW=Math.ceil(innerWidth/S);VH=Math.ceil(innerHeight/S);cv.width=VW*HD;cv.height=VH*HD;dark.width=VW;dark.height=VH;cx.imageSmoothingEnabled=false;
  vigC=document.createElement('canvas');vigC.width=VW;vigC.height=VH;const v=vigC.getContext('2d'),g=v.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.72);g.addColorStop(0,'rgba(5,0,14,0)');g.addColorStop(1,'rgba(5,0,14,.6)');v.fillStyle=g;v.fillRect(0,0,VW,VH);checkRot();};
addEventListener('resize',()=>resize());
const DISCO=['255,61,139','47,224,234','255,225,77','125,255,178','185,140,255'];
draw=function(t){NOW=t;const dt=Math.min(.05,(t-lastT)/1000)||.016;lastT=t;
  cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#05020b';cx.fillRect(0,0,cv.width,cv.height);if(!tiles)return;
  if(state==='play'||state==='end')fxWatch(dt);
  const tcx=Math.max(-30,Math.min(W*T-VW+30,P.x+Math.cos(P.face)*(P.moving?10:0)-VW/2)),tcy=Math.max(-60,Math.min(H*T-VH+40,P.y+Math.sin(P.face)*(P.moving?8:0)-VH*.55));
  if(camSnap){camX=tcx;camY=tcy;camSnap=false;}else{const k=Math.min(1,dt*6);camX+=(tcx-camX)*k;camY+=(tcy-camY)*k;}
  const camx=Math.round((camX+(Math.random()-.5)*shake)*HD)/HD,camy=Math.round((camY+(Math.random()-.5)*shake)*HD)/HD;
  cx.setTransform(HD,0,0,HD,-camx*HD,-camy*HD);
  cx.drawImage(tiles,0,0,W*T,H*T);
  const x0=Math.max(0,Math.floor(camx/T)-1),x1=Math.min(W-1,Math.ceil((camx+VW)/T)+1),y0=Math.max(0,Math.floor(camy/T)-1),y1=Math.min(H-1,Math.ceil((camy+VH)/T)+1);
  // Animierte Böden + Kanaldeckel + Laser
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=G[y][x],X=x*T,Y=y*T;
    if(c!=='#'&&FL[y][x]==='disco'){const k=(x*3+y*7+Math.floor(t/420))%5,a=.35+.3*Math.sin(t/210+x*1.7+y*2.3);cx.fillStyle=`rgba(${DISCO[k]},${a})`;cx.fillRect(X+1.5,Y+1.5,T-3,T-3);cx.fillStyle=`rgba(255,255,255,${a*.35})`;cx.fillRect(X+2,Y+2,T-4,1);}
    if(c==='U'){cx.fillStyle=K_;cx.beginPath();cx.arc(X+8,Y+8,7,0,7);cx.fill();cx.fillStyle=uOpen?'#030106':'#5e6474';cx.beginPath();cx.arc(X+8,Y+8,6,0,7);cx.fill();if(!uOpen){for(let i=0;i<3;i++)R_(cx,X+4,Y+5.5+i*2.2,8,.6,'#3a3f4e');cx.strokeStyle='#8088a0';cx.lineWidth=.5;cx.beginPath();cx.arc(X+8,Y+8,5.5,3.4,5.2);cx.stroke();}else{R_(cx,X+6,Y+3,4,1,'#7dffb2');cx.fillStyle=`rgba(125,255,178,${.25+.15*Math.sin(t/200)})`;cx.beginPath();cx.arc(X+8,Y+8,9,0,7);cx.fill();}}
    if(c==='E'){cx.fillStyle=`rgba(125,255,178,${.12+.1*Math.sin(t/260)})`;cx.fillRect(X,Y,T,T);}
    if(c==='B'&&lasersActive()){const f=.65+.35*Math.sin(t/110+x);for(const ly of[5,10]){cx.fillStyle=`rgba(255,40,60,${f*.25})`;cx.fillRect(X,Y+ly-1.5,T,3.5);cx.fillStyle=`rgba(255,70,80,${f})`;cx.fillRect(X,Y+ly,T,.5);cx.fillStyle=`rgba(255,220,220,${f*.8})`;cx.fillRect(X+((t/30+x*5)%T),Y+ly,1.5,.5);}}}
  // Türen
  for(const k in DOORS){const D=DOORS[k],X=D.x*T,Y=D.y*T;if(D.open){if(D.type==='W'){R_(cx,X+1,Y+2,14,1,'#9ff');}else if(D.type==='L'){R_(cx,X,Y,2.5,T,K_);R_(cx,X+.5,Y+.5,1.5,T-1,'#8a5a2a');}else if(D.type==='K'){cx.fillStyle=K_;cx.beginPath();cx.arc(X-3,Y+8,7.5,0,7);cx.fill();cx.fillStyle='#6e7482';cx.beginPath();cx.arc(X-3,Y+8,6.5,0,7);cx.fill();}continue;}
    if(D.type==='L'){R_(cx,X,Y,T,T,K_);const g=cx.createLinearGradient(X,0,X+T,0);g.addColorStop(0,'#a06a32');g.addColorStop(1,'#70441c');cx.fillStyle=g;cx.fillRect(X+.5,Y+.5,T-1,T-1);R_(cx,X+2.5,Y+2.5,4.5,4.5,'#5e3814');R_(cx,X+9,Y+2.5,4.5,4.5,'#5e3814');R_(cx,X+2.5,Y+9,4.5,4.5,'#5e3814');R_(cx,X+9,Y+9,4.5,4.5,'#5e3814');R_(cx,X+11.5,Y+7,2,2,'#ffd34d');R_(cx,X+12,Y+7.5,1,1,'#7a5a10');}
    if(D.type==='K'){R_(cx,X-2,Y-2,20,19,K_);R_(cx,X-1.5,Y-1.5,19,18,'#565c68');R_(cx,X-1.5,Y-1.5,19,.5,'#9aa2b2');cx.fillStyle='#2c313a';cx.beginPath();cx.arc(X+8,Y+7.5,7.5,0,7);cx.fill();cx.fillStyle='#8f97a8';cx.beginPath();cx.arc(X+8,Y+7.5,6.5,0,7);cx.fill();cx.save();cx.translate(X+8,Y+7.5);cx.rotate(t/2500);for(let i=0;i<3;i++){cx.rotate(2.094);R_(cx,-.75,-5.5,1.5,5.5,'#3c424e');}cx.restore();cx.fillStyle='#ffd34d';cx.beginPath();cx.arc(X+8,Y+7.5,1.8,0,7);cx.fill();R_(cx,X+14,Y,2,1.5,Math.sin(t/200)>0?'#ff3030':'#700');}
    if(D.type==='W'){R_(cx,X,Y,T,T,K_);const g=cx.createLinearGradient(X,Y,X+T,Y+T);g.addColorStop(0,'#3e7a9c');g.addColorStop(.5,'#8ad0ea');g.addColorStop(1,'#356a8a');cx.fillStyle=g;cx.fillRect(X+.5,Y+.5,T-1,T-1);for(let i=0;i<4;i++)R_(cx,X+2+i*4,Y,.8,T,'#9aa2ae');}}
  // Behälter-Marker
  OBJ.forEach(o=>{if(!o.cont)return;const C=o.cont,X=o.x*T,Y=o.y*T;
    if(!C.done&&(o.kind==='V'||o.kind==='G')){const s=(t/900+o.x*.37)%1;if(s<.3){const sx=X+3+((o.x*7+Math.floor(t/900)*5)%(o.w*T-6)),sy=Y+4+((o.y*3+Math.floor(t/900)*3)%5),a=Math.sin(s/.3*Math.PI);cx.fillStyle=`rgba(255,255,255,${a})`;cx.fillRect(sx-1.5*a,sy,3*a,.5);cx.fillRect(sx-.25,sy-1.5*a+.25,.5,3*a);}}
    if(o.kind==='mon'){cx.fillStyle='#0a2c36';cx.fillRect(X+3,Y+1.5,10,5.5);const sc=(t/60)%5.5;cx.fillStyle='rgba(47,224,234,.85)';for(let i=0;i<3;i++)cx.fillRect(X+4,Y+2.2+i*1.6,3+((o.x*3+i*5+Math.floor(t/700))%5),.6);cx.fillStyle='rgba(160,255,255,.25)';cx.fillRect(X+3,Y+1.5+sc,10,.5);}
    if(C.done){R_(cx,X+1,Y,4,4,K_);R_(cx,X+1.5,Y+.5,3,3,C.items.length?'#ffe14d':'#4a4458');}
    else if(o.kind==='X'||o.kind==='Y'||C.note){const a=.5+.5*Math.sin(t/300+o.x);cx.fillStyle=`rgba(255,225,77,${a*.9})`;cx.fillRect(X+o.w*T-3,Y+1,1.5,1.5);}});
  if(alarmPanel){const o=OBJ.find(o=>o.kind==='panel');if(o){const on=disarmed?'#40ff60':(Math.sin(t/150)>0?'#ff3030':'#500');R_(cx,o.x*T+5.5,o.y*T+4,5,1.5,on);if(!disarmed&&Math.sin(t/150)>0){cx.fillStyle='rgba(255,48,48,.25)';cx.beginPath();cx.arc(o.x*T+8,o.y*T+5,7,0,7);cx.fill();}}}
  // Sichtkegel
  const cone=(x,y,dir,range,spread,rgb,a)=>{const g=cx.createRadialGradient(x,y,2,x,y,range);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(.75,`rgba(${rgb},${a*.55})`);g.addColorStop(1,`rgba(${rgb},0)`);cx.fillStyle=g;cx.beginPath();cx.moveTo(x,y);const N=18;for(let i=0;i<=N;i++){const an=dir-spread+2*spread*i/N,ca=Math.cos(an),sa=Math.sin(an);let r=0;while(r<range&&!blockedPx(x+ca*r,y+sa*r)&&!smokeAt(x+ca*r,y+sa*r))r+=3;cx.lineTo(x+ca*r,y+sa*r);}cx.closePath();cx.fill();};
  cams.forEach(c=>{if(camsActive())cone(c.x,c.y,c.dir,96,.42,c.sus>50?'255,70,70':'110,200,255',c.sus>50?.34:.2);cx.save();cx.translate(c.x,c.y);R_(cx,-1,-4,2,3,K_);cx.rotate(c.dir||0);R_(cx,-3.5,-2.5,7.5,5,K_);R_(cx,-3,-2,6.5,4,'#3c404c');R_(cx,-3,-2,6.5,.5,'#70768a');R_(cx,3,-1.5,1.5,3,'#101018');cx.restore();R_(cx,c.x-.75,c.y-.75,1.5,1.5,camsActive()?(c.sus>50?'#ff3030':(Math.sin(t/300)>0?'#40ff60':'#1a7a2a')):'#222');});
  guards.forEach(g=>{if(g.down||g.stun>0)return;const ch=g.mode==='chase';cone(g.x,g.y-6,g.dir,(ch?150:88)*VISF(),.55,ch?'255,60,60':g.sus>35?'255,160,60':'255,238,170',ch?.36:g.sus>35?.3:.22);});
  rings.forEach(n=>{const a=(1-n.r/n.max);cx.strokeStyle=`rgba(255,225,77,${a*.8})`;cx.lineWidth=1;cx.beginPath();cx.arc(n.x,n.y,n.r,0,7);cx.stroke();cx.strokeStyle=`rgba(255,225,77,${a*.3})`;cx.lineWidth=2.5;cx.beginPath();cx.arc(n.x,n.y,Math.max(0,n.r-3),0,7);cx.stroke();});
  // Boden-Partikel
  PT.forEach(p=>{if(!p.ring)return;const k=p.l/p.m;cx.strokeStyle=p.c;cx.globalAlpha=1-k;cx.lineWidth=.5;cx.beginPath();cx.ellipse(p.x,p.y,2+k*5,1+k*2,0,0,7);cx.stroke();cx.globalAlpha=1;});
  // Figuren
  const ents=[{o:P,g:0}].concat(guards.map(g=>({o:g,g:1})),CREWF.map(c=>({o:c,g:0,c:1})));
  ents.sort((a,b)=>a.o.y-b.o.y).forEach(e=>{const o=e.o;
    if(e.c){const pal=Object.assign({},PAL_P,CREWPAL[o.id]);cx.globalAlpha=.95;charHD(cx,o.x,o.y,o.dir,o.step,o.moving,pal,{seed:o.x});cx.globalAlpha=1;cx.font='bold 5px monospace';const nm=CREWN[o.id],wd=cx.measureText(nm).width;cx.fillStyle='rgba(5,0,12,.7)';cx.fillRect(o.x-wd/2-1.5,o.y-29,wd+3,6);cx.fillStyle='#7ff6ff';cx.fillText(nm,o.x-wd/2,o.y-24.5);if(o.id==='rosie'&&jammed()){cx.fillStyle='#b98cff';cx.fillText('📡',o.x+5,o.y-14);}return;}
    if(e.g&&o.down){if(o.dog)return;if(o.dead){cx.fillStyle='rgba(120,8,26,.8)';cx.beginPath();cx.ellipse(o.x,o.y+.5,11,4.5,0,0,7);cx.fill();}
      cx.fillStyle='rgba(0,0,0,.35)';cx.beginPath();cx.ellipse(o.x,o.y+2,10,3,0,0,7);cx.fill();R_(cx,o.x-9.5,o.y-4,19.5,7,K_);R_(cx,o.x-9,o.y-3.5,5,6,'#1c2440');R_(cx,o.x-4,o.y-3.5,8,6,o.boss?'#5a1a2a':'#3a5cb0');R_(cx,o.x-4,o.y-3.5,8,1,o.boss?'#8a2a3e':'#5a7cd0');R_(cx,o.x+4,o.y-3.5,5.5,6,'#d9a07a');R_(cx,o.x+7,o.y-3.5,2.5,6,'#16224a');
      if(!o.dead){cx.fillStyle='#ffe14d';cx.font='bold 6px monospace';const k=(t/500)%1;cx.globalAlpha=1-k;cx.fillText('z',o.x+7+k*3,o.y-7-k*6);cx.globalAlpha=1;cx.fillText('Z',o.x+10,o.y-11);}return;}
    if(e.g&&o.dog)dogHD(cx,o.x,o.y,o.dir,o.step,o.moving);
    else if(e.g){const pal=o.boss?Object.assign({},PAL_G,{p:'#7a1f33',P:'#4e1020',w:'#f4f1e8',h:'#1a1010',g:'#111',c:'#ff3d3d',n:'#1a1018'}):PAL_G;charHD(cx,o.x,o.y,o.dir,o.step,o.moving,pal,{guard:!o.boss,flash:!o.boss,scale:o.boss?1.22:1,seed:o.x,hat:o.boss?'fedora':null,weapon:o.armed?'pistole':null});}
    else charHD(cx,P.x,P.y,P.face,P.step,P.moving,outfitPal(CFG.outfit),{weapon:LO.weapon,bag:1,swing:P.swing||0,hat:(CFG.outfit||{}).kopf});
    if(e.g&&o.boss){const bn=String(CFG.bossName||'BOSS').toUpperCase();cx.font='bold 5px monospace';const wd=cx.measureText(bn).width;R_(cx,o.x-wd/2-2,o.y-37,wd+4,7,'rgba(5,0,12,.8)');cx.fillStyle='#ffd34d';cx.fillText('👑',o.x-3,o.y-38.5);cx.fillText(bn,o.x-wd/2,o.y-31.5);R_(cx,o.x-10.5,o.y-29.5,21,3,K_);R_(cx,o.x-10,o.y-29,20,2,'#3a0810');R_(cx,o.x-10,o.y-29,20*Math.max(0,o.hp)/320,2,'#ff3d3d');R_(cx,o.x-10,o.y-29,20*Math.max(0,o.hp)/320,.5,'#ff9a9a');}
    if(e.g&&o.stun>0){for(let i=0;i<3;i++){const a=t/180+i*2.1,sx=o.x+Math.cos(a)*6.5,sy=o.y-24+Math.sin(a)*2;R_(cx,sx-1,sy-.25,2,.5,'#ffe14d');R_(cx,sx-.25,sy-1,.5,2,'#ffe14d');}}});
  // Anzeigen über Wachen
  guards.forEach(g=>{if(g.down||g.stun>0)return;const top=g.boss?-42:-27;if(g.sus>5&&g.mode!=='chase'){R_(cx,g.x-6.5,g.y+top+1,13,3,K_);R_(cx,g.x-6,g.y+top+1.5,12,2,'#2a1a36');R_(cx,g.x-6,g.y+top+1.5,12*g.sus/100,2,g.sus>70?'#ff3d3d':'#ffe14d');}
    const s=gState.get(g),pop=s?1+s.ex*3:1;if(g.mode==='check'||g.mode==='chase'){const ch=g.mode==='chase';cx.save();cx.translate(g.x,g.y+top-3);cx.scale(pop,pop);cx.fillStyle=K_;cx.beginPath();cx.arc(0,-2,4.5,0,7);cx.fill();cx.fillStyle=ch?'#ff3d3d':'#ffe14d';cx.beginPath();cx.arc(0,-2,3.8,0,7);cx.fill();cx.fillStyle=ch?'#fff':'#1a1020';cx.font='bold 6px monospace';cx.fillText(ch?'!':'?',-1.6,.2);cx.restore();}});
  // Geschosse
  bullets.forEach(b=>{const rgb=b.own?'255,240,150':'255,90,90';const g=cx.createLinearGradient(b.x,b.y,b.x-b.vx*.045,b.y-b.vy*.045);g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(1,`rgba(${rgb},0)`);cx.strokeStyle=g;cx.lineWidth=1;cx.beginPath();cx.moveTo(b.x,b.y);cx.lineTo(b.x-b.vx*.045,b.y-b.vy*.045);cx.stroke();cx.fillStyle='#fff';cx.fillRect(b.x-.5,b.y-.5,1,1);});
  flashes.forEach(f_=>{if(!f_.muzzle)return;const mx=P.x+Math.cos(P.face)*9,my=P.y-7+Math.sin(P.face)*9;cx.save();cx.translate(mx,my);cx.rotate(P.face);cx.fillStyle='rgba(255,240,170,.95)';cx.beginPath();cx.moveTo(0,-2);cx.lineTo(9,0);cx.lineTo(0,2);cx.lineTo(2,5);cx.lineTo(-1,1);cx.lineTo(-1,-1);cx.lineTo(2,-5);cx.fill();cx.restore();});
  // Partikel
  PT.forEach(p=>{if(p.ring)return;const k=p.l/p.m,s=p.s+p.grow*k;cx.globalAlpha=p.fade?1-k:1;cx.fillStyle=p.c;if(p.grow){cx.beginPath();cx.arc(p.x,p.y,s,0,7);cx.fill();}else cx.fillRect(p.x-s/2,p.y-s/2,s,s);});cx.globalAlpha=1;
  smokes.forEach(s=>{for(let i=0;i<16;i++){const a=i*2.4+t/1100,r=s.r*(.25+.75*((i*37)%10)/10),al=Math.min(.5,s.t/3);const X=s.x+Math.cos(a)*r,Y=s.y+Math.sin(a)*r*.7,g=cx.createRadialGradient(X,Y,0,X,Y,12);g.addColorStop(0,`rgba(215,222,238,${al})`);g.addColorStop(1,'rgba(215,222,238,0)');cx.fillStyle=g;cx.fillRect(X-12,Y-12,24,24);}});
  // Regen-Spritzer am Boden
  if(RAIN()){for(let i=0;i<26;i++){const ph=(t/420+i*.618)%1,sx=camx+hsh(i,Math.floor(t/420+i*.618),1)*VW,sy=camy+hsh(i,Math.floor(t/420+i*.618),2)*VH,tx_=Math.floor(sx/T),ty_=Math.floor(sy/T);if(ty_<yardTop||isWall(tx_,ty_))continue;cx.strokeStyle=`rgba(170,205,255,${.5*(1-ph)})`;cx.lineWidth=.5;cx.beginPath();cx.ellipse(sx,sy,1+ph*3.5,.5+ph*1.5,0,0,7);cx.stroke();}}
  // ---- Dunkelheit + Sicht ----
  const night=NIGHT();dx.setTransform(1,0,0,1,0,0);dx.globalCompositeOperation='source-over';dx.clearRect(0,0,VW,VH);
  dx.fillStyle=cop?`rgba(${46+34*Math.sin(t/150)|0},4,${40+34*Math.cos(t/150)|0},${night?.7:.5})`:(night?'rgba(6,2,26,.72)':'rgba(10,4,24,.3)');dx.fillRect(0,0,VW,VH);
  dx.globalCompositeOperation='destination-out';dx.translate(-camx,-camy);
  const lg=(x,y,r,a)=>{const g=dx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(.6,`rgba(0,0,0,${a*.6})`);g.addColorStop(1,'rgba(0,0,0,0)');dx.fillStyle=g;dx.beginPath();dx.arc(x,y,r,0,7);dx.fill();};
  {const rad=PK.nv?150:(night?104:128),pts=losPoly(P.x,P.y-5,rad),g=dx.createRadialGradient(P.x,P.y-5,0,P.x,P.y-5,rad);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.55,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');dx.fillStyle=g;dx.beginPath();dx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)dx.lineTo(pts[i],pts[i+1]);dx.closePath();dx.fill();lg(P.x,P.y-5,26,.9);}
  LIGHTS.forEach(([x,y],i)=>lg(x*T,y*T,40+Math.sin(t/400+i)*2,(i*7+Math.floor(t/90))%53===0?.45:.8));
  guards.forEach(g=>{if(g.down||g.stun>0)return;lg(g.x+Math.cos(g.dir)*30,g.y-4+Math.sin(g.dir)*30,40,.75);lg(g.x,g.y-6,14,.6);});
  CREWF.forEach(c=>lg(c.x,c.y-6,16,.5));
  flashes.forEach(f_=>{if(f_.muzzle)lg(f_.x,f_.y-7,70,1);});bullets.forEach(b=>lg(b.x,b.y,10,.5));
  OBJ.forEach(o=>{if(o.kind==='mon'||o.kind==='V'||o.kind==='getaway')lg((o.x+o.w/2)*T,(o.y+o.h/2)*T,o.kind==='getaway'?44:22,.55);});
  if(lasersActive())for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(G[y][x]==='B')lg(x*T+8,y*T+8,12,.5);
  dx.setTransform(1,0,0,1,0,0);dx.globalCompositeOperation='source-over';
  cx.setTransform(HD,0,0,HD,0,0);cx.imageSmoothingEnabled=true;cx.drawImage(dark,0,0);
  // Neon-Glühen (additiv)
  if(glowC){cx.globalCompositeOperation='lighter';cx.globalAlpha=night?.85:.5;cx.drawImage(glowC,-camx,-camy);cx.globalAlpha=1;
    guards.forEach(g=>{if(g.down||g.stun>0||g.dog)return;const X=g.x-camx+Math.cos(g.dir)*26,Y=g.y-5-camy+Math.sin(g.dir)*26,gr=cx.createRadialGradient(X,Y,0,X,Y,30);gr.addColorStop(0,'rgba(255,240,180,.16)');gr.addColorStop(1,'rgba(255,240,180,0)');cx.fillStyle=gr;cx.fillRect(X-30,Y-30,60,60);});
    flashes.forEach(f_=>{if(!f_.muzzle)return;const X=f_.x-camx,Y=f_.y-7-camy,gr=cx.createRadialGradient(X,Y,0,X,Y,46);gr.addColorStop(0,'rgba(255,220,140,.5)');gr.addColorStop(1,'rgba(255,220,140,0)');cx.fillStyle=gr;cx.fillRect(X-46,Y-46,92,92);});
    cx.globalCompositeOperation='source-over';}
  cx.imageSmoothingEnabled=false;
  // Schwebetexte
  FT.forEach(f_=>{const k=f_.t/1.1,X=f_.x-camx,Y=f_.y-camy-k*16,sc=k<.15?.6+k/.15*.6:1.2-Math.min(.2,(k-.15)*.5);cx.save();cx.translate(X,Y);cx.scale(sc,sc);cx.globalAlpha=k>.7?(1-k)/.3:1;cx.font='bold 8px monospace';const wd=cx.measureText(f_.txt).width;cx.lineWidth=2;cx.strokeStyle=K_;cx.strokeText(f_.txt,-wd/2,0);cx.fillStyle=f_.c;cx.fillText(f_.txt,-wd/2,0);cx.restore();});cx.globalAlpha=1;
  // Regen
  if(RAIN()){cx.strokeStyle='rgba(170,200,255,.34)';cx.lineWidth=.5;cx.beginPath();for(let i=0;i<110;i++){const x=((i*97+t*.3)%(VW+40))-20,y=((i*53+t*.75*(1+(i%3)*.25))%(VH+20))-10,l=5+(i%3)*2;cx.moveTo(x,y);cx.lineTo(x-l*.35,y+l);}cx.stroke();cx.fillStyle='rgba(60,90,160,.06)';cx.fillRect(0,0,VW,VH);}
  // Blitz, Alarm-Lichter, Schaden, Vignette
  flashes.forEach(f_=>{if(f_.muzzle)return;cx.fillStyle=`rgba(255,255,240,${Math.min(1,f_.t*2)})`;cx.fillRect(0,0,VW,VH);});
  if(cop){const a=.5+.5*Math.sin(t/160);let g=cx.createLinearGradient(0,0,VW*.45,0);g.addColorStop(0,`rgba(255,40,60,${.34*a})`);g.addColorStop(1,'rgba(255,40,60,0)');cx.fillStyle=g;cx.fillRect(0,0,VW*.45,VH);g=cx.createLinearGradient(VW,0,VW*.55,0);g.addColorStop(0,`rgba(50,90,255,${.34*(1-a)})`);g.addColorStop(1,'rgba(50,90,255,0)');cx.fillStyle=g;cx.fillRect(VW*.55,0,VW*.45,VH);}
  if(vigC){cx.imageSmoothingEnabled=true;cx.drawImage(vigC,0,0);cx.imageSmoothingEnabled=false;}
  if(bleed||P.hp<35||hitFlash>0){const a=(bleed?.18+.08*Math.sin(t/200):P.hp<35?.12:0)+hitFlash*1.6;const gr=cx.createRadialGradient(VW/2,VH/2,VH*.25,VW/2,VH/2,VH*.85);gr.addColorStop(0,'rgba(200,0,24,0)');gr.addColorStop(1,`rgba(200,0,24,${Math.min(.75,a+.15)})`);cx.fillStyle=gr;cx.fillRect(0,0,VW,VH);}
};
if(tiles)drawTiles();
// ================= ENDE HD-RENDERER =================
