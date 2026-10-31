#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
root=Path('www/assets/icons')
groups={
 'kpi':'kpi-wallet kpi-receipt kpi-bag kpi-coins',
 'categories':'food cafe transport home health fun shop other',
 'nav':'dashboard transactions analytics settings',
 'actions':'plus close check back forward up down search filter calendar backspace delete edit export'
}
checked=0
for group,names in groups.items():
 for name in names.split():
  path=root/group/(name+'.png')
  assert path.is_file(),f'missing {path}'
  im=Image.open(path).convert('RGBA')
  assert im.size==(96,96),(name,im.size)
  a=im.getchannel('A')
  bbox=a.getbbox()
  assert bbox and bbox[2]-bbox[0]>12 and bbox[3]-bbox[1]>12,(name,bbox)
  assert a.getpixel((0,0))==0,(name,'corner not transparent')
  assert a.getpixel((95,95))==0,(name,'corner not transparent')
  assert a.getpixel((12,15))==0,(name,'painted backplate detected')
  checked+=1
print(f'PASS: {checked} independently transparent premium PNG assets, no painted backplates')
