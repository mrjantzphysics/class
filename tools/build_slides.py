import glob, os, subprocess, json, sys
W = '/home/user/site/work/pdf'
OUT = '/home/user/site/src/slides'
M = {'h01':'h/01_','h02':'h/02_','h03':'h/03_','h04':'h/04_','h05':'h/05_','h06':'h/06_',
     'h07':'h/07_Section_2.7-2.8','h09':'h/09_','h10':'h/10_Section_2.10-2.12','h13':'h/13_','h14':'h/14_'}
for i in range(1,14): M['g%02d'%i] = 'g/%02d_'%i
decks = {}
for k, pre in M.items():
    f = sorted(glob.glob(f'{W}/{pre}*.pdf'))[0]
    d = f'{OUT}/{k}'; os.makedirs(d, exist_ok=True)
    subprocess.run(['pdftoppm','-jpeg','-jpegopt','quality=72','-scale-to-x','1000','-scale-to-y','-1',f,f'{d}/s'],check=True)
    files = sorted(os.listdir(d))
    for j,fn in enumerate(files): os.rename(f'{d}/{fn}', f'{d}/{j+1:02d}.jpg')
    decks[k] = {'n': len(files), 'src': os.path.basename(f).replace('.pdf','')}
    print(k, len(files), os.path.basename(f))
open('/home/user/site/src/js/decks.js','w').write('window.DECKS = ' + json.dumps(decks, indent=1) + ';\n')
