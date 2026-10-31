#!/usr/bin/env python3
"""Build 30 premium matte 3D object-only icons; no drawn card or painted backplate.
function-free icon primitives: PNG RGBA, 3x supersampling. Pillow only at build time.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math, random
N, S = 288, 96
ROOT=Path("www/assets/icons")
def rgba(s,a=255):return tuple(bytes.fromhex(s.strip("#")))+(a,)
def make(kind):
 im=Image.new("RGBA",(N,N));d=ImageDraw.Draw(im)
 def shadow(rect,blur=11,alpha=55):
  layer=Image.new("RGBA",(N,N))
  ImageDraw.Draw(layer).ellipse(rect,fill=(55,40,29,alpha))
  im.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))
 def line(points,col,w=7,joint="curve"):d.line(points,fill=rgba(col),width=w,joint=joint)
 def arc(rect,start,end,col,w=7):d.arc(rect,start,end,fill=rgba(col),width=w)
 def ellipse(rect,color,edge=None,w=3):
  d.ellipse(rect,fill=rgba(color),outline=rgba(edge) if edge else None,width=w)
 def poly(points,fill,outline=None,w=4):
  d.polygon(points,fill=rgba(fill))
  if outline:d.line(points+[points[0]],fill=rgba(outline),width=w,joint="curve")
 def rr(rect,r,fill,edge=None,w=3):
  d.rounded_rectangle(rect,radius=r,fill=rgba(fill),outline=rgba(edge) if edge else None,width=w)
 def material(rect,r,top,bottom,edge=None,drop=0):
  x1,y1,x2,y2=rect
  if drop:shadow((x1+14,y2-4,x2+10,y2+11),10,drop)
  mask=Image.new("L",(N,N));ImageDraw.Draw(mask).rounded_rectangle(rect,radius=r,fill=255)
  grad=Image.new("RGBA",(N,N))
  px=grad.load();a=bytes.fromhex(top[1:]);b=bytes.fromhex(bottom[1:])
  for y in range(max(0,y1),min(N,y2+1)):
   t=(y-y1)/max(1,y2-y1)
   color=tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))+(255,)
   for x in range(max(0,x1),min(N,x2+1)):px[x,y]=color
  im.alpha_composite(Image.composite(grad,Image.new("RGBA",(N,N)),mask))
  if edge:d.rounded_rectangle(rect,radius=r,outline=rgba(edge),width=3)
  arc((x1+7,y1+5,x2-7,y2-8),195,306,"#fff0d7",3)
 # Three dimensional product miniatures: matte, physical proportions, no backplates.
 if kind in ("kpi-wallet","wallet"):
  shadow((52,210,238,248),14,78)
  material((60,111,231,227),20,"#744D38","#34241E","#38251C",60)
  material((66,92,203,151),16,"#966B49","#513728","#583929")
  for x in (80,100,120):
   poly([(x,105),(x+45,88),(x+51,117),(x+8,129)],"#D4B18B","#AE845C",3)
  material((63,121,233,224),18,"#79503A","#3F2B24","#34231E")
  material((170,145,245,189),13,"#8A5B40","#4D3328","#392821")
  ellipse((199,157,215,173),"#C9A265","#87683B")
  line([(76,205),(158,205)],"#B48F65",3)
  for x in range(82,163,13):ellipse((x,207,x+2,209),"#C7A780")
 elif kind in ("kpi-receipt","receipt"):
  shadow((65,228,234,253),11,72)
  material((75,67,226,231),18,"#FBF5E9","#DFD6C7","#B6A999",62)
  for y in [123,162,201]:
   line([(109,y),(126,y+13),(148,y-13)],"#47775C",8)
   line([(159,y+2),(206,y+2)],"#927F6E",6)
  material((115,51,184,85),10,"#674A3C","#322720","#30241E")
  rr((127,43,173,72),12,"#6C5041","#33271F")
 elif kind in ("kpi-bag","shop"):
  shadow((54,226,236,257),13,66)
  arc((95,47,201,160),177,360,"#5F422E",17)
  arc((102,55,193,154),178,357,"#C69A6E",8)
  poly([(69,115),(221,115),(240,229),(56,229)],"#B98658","#896040",5)
  material((68,112,231,228),14,"#E0B487","#B88457","#AD7850")
  poly([(70,129),(229,129),(218,219),(84,219)],"#D4A378")
  line([(83,144),(213,144)],"#ECD0AD",4)
  ellipse((105,117,118,131),"#7D5033")
  ellipse((182,117,195,131),"#7D5033")
  line([(89,210),(208,210)],"#AA7B59",3)
 elif kind=="cafe":
  shadow((46,230,253,262),12,60)
  ellipse((45,215,250,248),"#B9A38D")
  ellipse((50,205,246,237),"#F1E7D6","#BBAA99")
  arc((182,124,253,207),280,115,"#D4C7B4",18)
  arc((184,128,247,203),280,115,"#F8F0E4",11)
  material((63,111,208,215),24,"#FBF7EE","#D8D0C4","#BFB5A8")
  ellipse((66,99,207,141),"#FDFBF6","#D1C8BD")
  ellipse((83,108,193,133),"#694632")
  ellipse((94,110,183,126),"#98714C")
  arc((76,183,193,220),10,158,"#C7BEB2",5)
 elif kind=="kpi-coins":
  shadow((43,229,250,257),12,76)
  for x,y,count in [(67,188,3),(131,158,4),(198,181,3)]:
   for j in range(count):
    top=y-j*16
    material((x-31,top,x+31,top+21),10,"#E0BC8B","#A98053","#997043")
    ellipse((x-31,top-9,x+31,top+13),"#E9C898","#B18A5D",3)
    arc((x-24,top-4,x+23,top+9),190,328,"#FFF0D3",3)
 elif kind=="food":
  shadow((49,225,245,252),12,65)
  poly([(59,137),(232,137),(204,218),(90,218)],"#BA8C5E","#71563E",5)
  poly([(71,147),(219,147),(198,209),(99,209)],"#D6B081")
  for x in [108,135,164,190]:line([(x,160),(x-5,201)],"#9D774F",6)
  line([(83,145),(111,114),(178,114),(211,145)],"#866447",11)
  ellipse((95,91,141,133),"#7D9870","#49674E")
  ellipse((140,80,188,134),"#C98260","#8A523C")
  ellipse((174,97,213,139),"#84A57B","#527254")
 elif kind=="transport":
  shadow((44,218,248,251),12,67)
  poly([(65,129),(89,90),(190,90),(222,129)],"#435F56","#293E38",4)
  poly([(93,101),(190,101),(206,131),(72,131)],"#AEC1B4","#57766E",4)
  material((54,124,242,203),27,"#677F71","#2D4A43","#28423B",40)
  material((65,150,227,185),14,"#637E70","#3A5B4D")
  ellipse((78,178,121,226),"#282A26");ellipse((182,178,225,226),"#282A26")
  ellipse((90,190,109,211),"#9F9E92");ellipse((193,190,214,211),"#9F9E92")
  rr((73,148,101,165),8,"#E3CDA4");rr((195,148,225,165),8,"#E3CDA4")
 elif kind=="home":
  shadow((43,230,248,258),12,65)
  poly([(44,137),(144,54),(247,137),(226,155),(144,91),(63,158)],"#85644D","#624531")
  material((76,129,217,230),7,"#EDE1CF","#C5B5A0","#A99A87")
  poly([(61,135),(144,72),(226,136)],"#A98063","#74513E")
  material((128,167,172,229),7,"#7F6E5A","#544638","#4F4034")
  rr((91,153,120,178),4,"#91ACA2");rr((180,153,207,178),4,"#91ACA2")
 elif kind=="health":
  shadow((56,223,238,257),12,64)
  material((63,109,231,220),24,"#F4EEE6","#D1C8B9","#A9A59A")
  material((111,77,187,125),15,"#718B7E","#405D52","#314C42")
  material((129,129,166,200),7,"#DDA18C","#BA6F59")
  material((102,155,193,180),7,"#E5A18A","#BE765E")
 elif kind=="fun":
  shadow((57,225,236,255),12,65)
  material((71,90,214,221),16,"#59685F","#2C3833","#253A30")
  ellipse((103,121,185,202),"#29392F","#182722",5)
  ellipse((113,133,176,192),"#799086","#344D42")
  ellipse((127,147,162,177),"#CAD3C8","#5E7D6E")
  rr((91,74,129,108),7,"#977958")
  ellipse((181,97,197,113),"#C59A6E")
 elif kind=="other":
  shadow((54,228,239,256),12,64)
  poly([(58,120),(145,69),(235,119),(145,171)],"#D4B48F","#8D7457",5)
  poly([(58,121),(145,174),(145,234),(58,186)],"#B78B67","#806044",5)
  poly([(235,121),(145,174),(145,234),(235,187)],"#9B795E","#6A523E",5)
  line([(91,141),(128,164)],"#E9D0AC",5)
 else:
  # Small monochrome navigation and action glyphs. No tile, no gradients.
  ink="#2C2A26";accent="#405846"
  def outline(rect,r=7,w=10):d.rounded_rectangle(rect,radius=r,outline=rgba(ink),width=w)
  def L(pts,w=11,c=ink):line(pts,c,w)
  if kind=="dashboard":
   for x in [68,159]:
    for y in [71,159]:
     rr((x,y,x+61,y+61),13,ink)
  elif kind=="transactions":
   outline((77,60,210,232),15,10)
   for x in [104,155]:L([(x,52),(x,75)],10)
   for y in [118,157,197]:L([(105,y),(180,y)],8)
  elif kind=="analytics":
   for x,t in [(61,177),(123,129),(185,77)]:
    outline((x,t,x+40,226),5,9)
  elif kind=="settings":
   for y,x in [(102,116),(171,183)]:
    L([(61,y),(226,y)],11);ellipse((x-18,y-18,x+18,y+18),"#F1E7D8",ink,9)
  elif kind=="plus":L([(143,67),(143,218)],18);L([(67,143),(219,143)],18)
  elif kind=="close":L([(82,82),(205,205)],14);L([(205,82),(82,205)],14)
  elif kind=="check":L([(65,146),(118,195),(222,90)],14)
  elif kind in ("back","forward","up","down"):
   if kind=="back":L([(184,76),(102,144),(184,211)],14)
   if kind=="forward":L([(104,76),(186,144),(104,211)],14)
   if kind=="up":L([(75,189),(144,108),(213,189)],14)
   if kind=="down":L([(75,100),(144,181),(213,100)],14)
  elif kind=="calendar":
   outline((66,74,219,217),15,10);L([(66,116),(219,116)],9)
   L([(104,56),(104,94)],11);L([(184,56),(184,94)],11)
   rr((103,150,134,178),5,ink)
  elif kind=="filter":
   L([(64,94),(228,94)],11);L([(64,159),(228,159)],11);L([(64,215),(228,215)],11)
   for x,y in [(112,94),(182,159),(134,215)]:
    ellipse((x-17,y-17,x+17,y+17),"#F3E7D9",ink,8)
  elif kind=="search":
   ellipse((65,64,188,187),"#F3E7D9",ink,11);L([(178,178),(226,226)],13)
  elif kind=="delete":
   outline((90,101,198,221),9,11);L([(73,95),(213,95)],11);L([(117,72),(175,72)],11)
  elif kind=="edit":
   L([(81,211),(214,79)],16);L([(73,220),(122,207)],13)
  elif kind=="export":
   outline((73,136,218,219),10,11);L([(144,69),(144,175)],12);L([(111,146),(144,179),(176,146)],10)
  elif kind=="backspace":
   poly([(52,143),(105,88),(230,88),(230,204),(105,204)],"#E9DFD2",ink,10)
   L([(145,124),(188,169)],10);L([(188,124),(145,169)],10)
  else:
   outline((78,77,217,218),18,9)
 if kind in ("cafe","food","kpi-wallet","kpi-receipt","kpi-bag","shop","transport","home","health","fun","other","kpi-coins"):
  # Fine matte texture, restricted strictly to already opaque object pixels.
  rng=random.Random(481+sum(ord(c) for c in kind))
  px=im.load()
  for i in range(750):
   x=rng.randrange(35,251);y=rng.randrange(45,241)
   if px[x,y][3]>240:
    r,g,b,a=px[x,y]
    delta=rng.choice((-7,-5,-3,2,4,6))
    px[x,y]=(max(0,min(255,r+delta)),max(0,min(255,g+delta)),max(0,min(255,b+delta)),a)
 return im.resize((S,S),Image.Resampling.LANCZOS)
def build():
 categories=set("food cafe transport home health fun shop other".split())
 nav=set("dashboard transactions analytics settings".split())
 kinds="food cafe transport home health fun shop other dashboard transactions analytics settings plus close check back forward up down search filter calendar backspace delete edit export kpi-wallet kpi-receipt kpi-bag kpi-coins".split()
 for kind in kinds:
  if kind in nav:
   # Approved v8.0 sculpted nav icons are already produced by the base icon generator.
   continue
  group="kpi" if kind.startswith("kpi-") else "categories" if kind in categories else "nav" if kind in nav else "actions"
  p=ROOT/group/(kind+".png");p.parent.mkdir(parents=True,exist_ok=True)
  make(kind).save(p,optimize=True)
 print("Premium matte object-only:",len(kinds),"RGBA PNG icons")
if __name__=="__main__":build()
