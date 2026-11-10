#!/usr/bin/env python3
# Quelle: classic.html + heist.html. Baut index.html (= next.html) + heist2.html mit neuer Optik aus tools/.
import os,re
d=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd=lambda p:open(os.path.join(d,p),encoding='utf-8').read()
h=rd('heist.html');frag=rd('tools/gfx2.frag.js')
mark="\nresize();\nlet last=performance.now();"
assert mark in h
h=h.replace(mark,"\n"+frag+mark,1)
hx=os.path.join(d,'tools/heist2.css')
if os.path.exists(hx):h=h.replace('</style>',open(hx,encoding='utf-8').read()+'\n</style>',1)
open(os.path.join(d,'heist2.html'),'w',encoding='utf-8').write(h)
i=rd('classic.html')
assert "f.src='heist.html'" in i
i=i.replace("f.src='heist.html'","f.src='heist2.html'")
fx=os.path.join(d,'tools/fx2.html')
if os.path.exists(fx):
    assert '</body>' in i
    i=i.replace('</body>',open(fx,encoding='utf-8').read()+'\n</body>',1)
th=os.path.join(d,'tools/theme2.css')
if os.path.exists(th):i=i.replace('</body>','<style>\n'+open(th,encoding='utf-8').read()+'\n</style>\n</body>',1)
[open(os.path.join(d,n),'w',encoding='utf-8').write(i) for n in ('index.html','next.html')]
print('ok',len(h),len(i))
