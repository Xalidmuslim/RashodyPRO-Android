#!/usr/bin/env python3
"""Build-time matte 3D PNG icon atlas; generated assets ship inside the APK.
Pillow is a build dependency only, never required on an Android phone.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math

OUT=Path("www/assets/icons")
N=288
S=96
def C(s,a=255): return tuple(bytes.fromhex(s.lstrip("#")))+(a,)
ink="#244b4e"
teal="#2d6b69"
sage="#7aab98"
coral="#c5806a"
sand="#d7aa72"
cream="#f3dfb9"
gold="#e6ad61"

def render(name,kind):
    im=Image.new("RGBA",(N,N))
    shadow=Image.new("RGBA",(N,N))
    d=ImageDraw.Draw(im)
    sh=ImageDraw.Draw(shadow)
    def shadow_ellipse(xy,blur=12,alpha=80):
        layer=Image.new("RGBA",(N,N))
        ImageDraw.Draw(layer).ellipse(xy,fill=(24,39,39,alpha))
        return layer.filter(ImageFilter.GaussianBlur(blur))
    im.alpha_composite(shadow_ellipse((42,216,244,253),14,66))
    def rr(box,r,fill,outline=None,width=3):
        d.rounded_rectangle(box,radius=r,fill=C(fill),outline=C(outline) if outline else None,width=width)
    def el(box,fill,outline=None,width=3):
        d.ellipse(box,fill=C(fill),outline=C(outline) if outline else None,width=width)
    def line(coords,fill,width=7,joint="curve"):
        d.line(coords,fill=C(fill),width=width,joint=joint)
    def poly(coords,fill,outline=None,width=3):
        d.polygon(coords,fill=C(fill))
        if outline:d.line(coords+[coords[0]],fill=C(outline),width=width,joint="curve")
    def highlights(box):
        x,y,x2,y2=box
        d.arc((x+8,y+5,x2-8,y2-8),195,303,fill=(255,250,239,204),width=6)
    if kind=="food":
        for x,y,col in [(100,91,sage),(138,86,coral),(174,92,gold),(118,120,gold),(163,122,sage)]:
            el((x-27,y-25,x+27,y+30),col,ink,3)
            line([(x,y-23),(x+6,y-38)],ink,3)
        poly([(67,121),(226,121),(202,211),(90,211)],sand,ink,6)
        poly([(80,135),(210,135),(198,196),(96,196)],gold)
        for x in [111,145,179]:line([(x,147),(x+1,189)],"#a66e45",7)
        line([(93,117),(108,88),(188,88),(206,117)],"#9c7050",10)
        line([(80,130),(207,130)],cream,7)
    elif kind=="cafe":
        el((49,204,241,235),cream,"#90765e",4)
        rr((68,96,207,206),27,cream,"#947d6a",5)
        el((184,117,247,181),cream,"#947d6a",8)
        rr((75,99,201,189),22,"#fff3dc")
        el((88,110,184,142),"#8c5c3f")
        el((95,110,176,132),"#b27c54")
        line([(107,74),(100,57)],"#fff4e1",6)
        line([(151,74),(144,56)],"#fff4e1",6)
    elif kind=="transport":
        rr((55,111,238,200),32,teal,ink,5)
        poly([(76,110),(99,80),(187,80),(218,110)],sage,ink,5)
        poly([(108,90),(180,90),(198,114),(88,114)],"#bcd6cc")
        rr((64,170,231,207),15,teal)
        el((75,181,113,218),ink);el((186,181,224,218),ink)
        el((83,189,105,210),"#e9d2a7");el((194,189,216,210),"#e9d2a7")
        rr((91,146,123,169),9,cream)
        rr((171,146,203,169),9,cream)
        line([(136,164),(159,164)],cream,6)
    elif kind=="home":
        poly([(48,132),(145,55),(244,132),(222,151),(145,93),(70,151)],coral,"#916551",5)
        rr((75,127,215,231),11,cream,"#988572",5)
        rr((132,171,171,230),8,teal,ink,3)
        rr((93,154,122,181),7,"#b0d0c6")
        rr((179,154,206,181),7,"#b0d0c6")
        line([(80,132),(143,82),(206,132)],"#f8dca8",6)
    elif kind=="health":
        # Smooth mathematical heart outline.
        points=[]
        for i in range(201):
            t=2*math.pi*i/200
            x=145+5.4*16*math.sin(t)**3
            y=147-5.1*(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))
            points.append((int(x),int(y)))
        poly(points,coral,"#a65b58",5)
        line([(97,154),(119,154),(134,135),(148,176),(163,144),(188,144)],"#fff2e5",9)
    elif kind=="fun":
        poly([(86,67),(207,67),(226,225),(68,225)],coral,ink,5)
        for x in [94,123,152,181]:
            poly([(x,80),(x+17,80),(x+8,213),(x-9,213)],cream)
        for x,y in [(87,70),(130,55),(176,75),(102,99),(177,104),(144,103)]:
            el((x-21,y-22,x+21,y+20),gold,"#b78848",3)
        line([(82,218),(213,218)],"#ab6659",6)
    elif kind=="shop":
        rr((77,101,212,222),17,sand,"#94744f",5)
        poly([(79,117),(213,117),(211,139),(80,139)],cream)
        d.arc((112,68,182,150),180,357,fill=C(ink),width=11)
        d.arc((120,76,172,144),185,354,fill=C("#f8e5c3"),width=6)
        rr((101,148,190,198),11,gold)
        line([(125,157),(163,157)],cream,6)
    elif kind=="other":
        poly([(64,122),(143,73),(225,122),(145,165)],sand,ink,5)
        poly([(64,125),(145,170),(145,233),(64,186)],coral,ink,5)
        poly([(225,125),(145,170),(145,233),(225,186)],"#c5a783",ink,5)
        poly([(94,105),(171,152),(161,163),(84,115)],cream)
    elif kind=="dashboard":
        for x in [60,152]:
            for y in [60,152]:
                rr((x,y,x+77,y+77),19,teal if (x+y)%3 else sage,ink,5)
                highlights((x,y,x+77,y+77))
    elif kind=="transactions":
        rr((70,47,219,248),18,cream,ink,6)
        poly([(178,47),(219,88),(178,88)],sand)
        for y,w in [(115,79),(146,108),(177,94),(208,108)]:
            rr((94,y,94+w,y+12),5,sage)
    elif kind=="analytics":
        for box,col in [((63,161,105,230),sage),((124,119,166,230),gold),((185,70,227,230),teal)]:
            rr(box,12,col,ink,4)
            highlights(box)
    elif kind=="settings":
        for y,x in [(95,156),(147,110),(198,186)]:
            line([(65,y),(229,y)],ink,13)
            el((x-22,y-22,x+22,y+22),cream,ink,6)
            el((x-10,y-10,x+10,y+10),teal)
    else:
        # Action glyphs: same sculpted matte style, no permanent background tile.
        if kind in ("plus","close","check","back","forward","up","down"):
            pts={
              "plus":[[(142,66),(142,223)],[(64,144),(220,144)]],
              "close":[[(81,81),(207,207)],[(207,81),(81,207)]],
              "check":[[(69,148),(121,197),(222,90)]],
              "back":[[(164,69),(89,144),(164,219)]],
              "forward":[[(122,69),(197,144),(122,219)]],
              "up":[[(78,171),(145,101),(213,171)]],
              "down":[[(78,112),(145,180),(213,112)]]
            }[kind]
            for p in pts:
                line([(x+3,y+8) for x,y in p],"#62807a",22)
                line(p,teal,18)
                line([(x-2,y-3) for x,y in p],sage,6)
        elif kind=="search":
            el((67,65,185,182),cream,teal,17)
            line([(183,182),(232,231)],teal,23)
            line([(187,184),(225,223)],sage,6)
        elif kind=="filter":
            poly([(60,79),(231,79),(170,145),(170,221),(123,239),(123,145)],cream,teal,11)
        elif kind=="calendar":
            rr((63,75,227,225),19,cream,teal,12)
            rr((70,92,219,124),9,sage)
            for x in [96,192]:line([(x,60),(x,105)],teal,12)
            for x in [100,142,184]:
                for y in [150,187]:el((x-8,y-8,x+8,y+8),gold)
        elif kind=="backspace":
            poly([(102,83),(230,83),(230,207),(102,207),(58,146)],cream,teal,12)
            line([(142,116),(192,174)],teal,11)
            line([(192,116),(142,174)],teal,11)
        elif kind=="delete":
            rr((100,94,198,225),14,coral,ink,5)
            rr((92,77,205,102),8,gold)
            line([(137,65),(172,65)],ink,10)
            for x in [131,167]:line([(x,125),(x,189)],cream,7)
        elif kind=="edit":
            poly([(77,210),(106,156),(202,65),(231,94),(136,187)],gold,ink,5)
            poly([(77,210),(105,157),(135,188)],cream)
        elif kind=="export":
            rr((79,135,218,221),12,cream,teal,8)
            line([(147,60),(147,181)],teal,14)
            line([(103,132),(147,179),(191,132)],sage,12)
        else:
            rr((65,73,225,226),30,sage,ink,5)
    # Soft top-left rim, subtle satin material, no specular gloss
    im=im.resize((S,S),Image.Resampling.LANCZOS)
    file=OUT/("categories" if kind in ("food","cafe","transport","home","health","fun","shop","other") else "nav" if kind in ("dashboard","transactions","analytics","settings") else "actions")/(name+".png")
    file.parent.mkdir(parents=True,exist_ok=True)
    im.save(file,optimize=True)
    return file

if __name__=="__main__":
    ids=["food","cafe","transport","home","health","fun","shop","other","dashboard","transactions","analytics","settings",
    "plus","close","check","back","forward","up","down","search","filter","calendar","backspace","delete","edit","export"]
    files=[render(i,i) for i in ids]
    print("Generated",len(files),"matte PNG icons in",OUT)
