from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
P=Path(__file__).resolve().parents[1]
O=P/'assets/images/screens';O.mkdir(exist_ok=True)
F=Path('C:/Windows/Fonts')
def font(size,serif=False,bold=False):return ImageFont.truetype(str(F/('georgia.ttf' if serif else 'arialbd.ttf' if bold else 'arial.ttf')),size)
D=[('interior','AURAA STUDIO','Interior design','Rooms with','quiet power.','#f3f0e7','#353c2d','Explore our spaces','Considered interiors. Beautifully everyday.'),('restaurant','SAVOUR','Restaurant / Cafe','Good food.','Better company.','#16271f','#f4eddb','Explore the menu','A neighbourhood table. A reason to return.'),('electrical','VOLT + HOME','Electrical appliances','Everyday living.','Extraordinary ease.','#f1f5f6','#203f50','Explore appliances','Thoughtfully chosen for the way you live.'),('security','SENTINEL','Security services','Your people.','Our priority.','#15232c','#e1e9e1','Explore our services','Protection for the places that matter.'),('industrial','FORGE WORKS','Manufacturing','Built to spec.','Made to perform.','#e9eae2','#25392f','Explore capabilities','The details make the difference.')]
def text(draw,xy,s,size,color,serif=False,bold=False,anchor=None):draw.text(xy,s,font=font(size,serif,bold),fill=color,anchor=anchor)
def photo(im,src,box):im.paste(ImageOps.fit(src,(box[2]-box[0],box[3]-box[1])),box[:2])
def overlay(im,box,alpha):lay=Image.new('RGBA',im.size);ImageDraw.Draw(lay).rectangle(box,fill=(7,14,10,alpha));im.alpha_composite(lay)
for key,brand,cat,h1,h2,bg,ink,cta,desc in D:
 src=Image.open(P/f'assets/images/{key}.jpg').convert('RGB')
 for device,w,h in [('desktop',1600,1000),('tablet',1000,1300),('mobile',650,1300)]:
  im=Image.new('RGBA',(w,h),bg);dr=ImageDraw.Draw(im);mobile=device!='desktop';pad=40 if mobile else 70
  if not mobile:
   if key=='interior':
    text(dr,(w/2,45),brand,32,ink,True,anchor='mm');text(dr,(pad,45),'INTERIORS / ARCHITECTURE',12,ink,anchor='lm');text(dr,(w-pad,45),'LET’S TALK  ↗',13,ink,anchor='rm')
    photo(im,src,(0,100,w,790));overlay(im,(0,100,w,790),55);dr=ImageDraw.Draw(im)
    text(dr,(w/2,350),'Rooms with quiet power.',90,'#fff9ed',True,anchor='mm');text(dr,(w/2,440),'A thoughtful approach to spaces you call your own.',22,'#fff9ed',anchor='mm')
    dr.rectangle((650,505,950,566),fill='#eee9d9');text(dr,(800,535),cta,18,'#313c2a',anchor='mm')
   else:
    text(dr,(pad,48),brand,30,ink,bold=True,anchor='lm');text(dr,(w-550,48),'ABOUT     COLLECTION     OUR APPROACH',14,ink,anchor='lm');dr.rectangle((w-240,26,w-pad,72),fill=ink);text(dr,(w-155,49),'GET IN TOUCH ↗',12,bg,anchor='mm')
    photo(im,src,(w//2+70,110,w-pad,790));text(dr,(pad,178),cat.upper()+' / CONCEPT',14,ink,bold=True);text(dr,(pad,270),h1,66,ink,True);text(dr,(pad,355),h2,66,ink,True);text(dr,(pad,490),desc,19,ink)
    dr.rectangle((pad,565,pad+285,630),fill=ink);text(dr,(pad+143,598),cta+'  ↗',18,bg,anchor='mm');text(dr,(pad,748),'PURPOSEFULLY DESIGNED. THOUGHTFULLY MADE.',12,ink)
   text(dr,(pad,845),desc,29,ink,True)
   for i,label in enumerate(['Discover our approach','Explore the collection','Start a conversation']):
    x=pad+i*(w-2*pad)/3;text(dr,(x,912),'0'+str(i+1)+' / '+label,16,ink);dr.line((x,950,x+350,950),fill=ink,width=1)
  else:
   text(dr,(w/2,50),brand,27 if w==650 else 35,ink,True,anchor='mm');text(dr,(w-45,48),'☰',23,ink,anchor='mm')
   photo(im,src,(0,100,w,815 if device=='mobile' else 840));overlay(im,(0,100,w,840),60);dr=ImageDraw.Draw(im)
   text(dr,(pad,315),h1,68 if w==650 else 85,'#fff9ef',True);text(dr,(pad,405),h2,68 if w==650 else 85,'#fff9ef',True)
   dr.rectangle((pad,540,pad+285,605),fill=bg);text(dr,(pad+143,574),cta+'  ↗',19,ink,anchor='mm')
   text(dr,(pad,886),'A DIFFERENT POINT OF VIEW',12,ink,bold=True);text(dr,(pad,930),'Thoughtfully designed.',36,ink,True);text(dr,(pad,978),'Made for your business.',36,ink,True)
   thumb=ImageOps.fit(src,(w-2*pad,190));im.paste(thumb,(pad,1050));text(dr,(pad,1260),'EXPLORE MORE  ↗',13,ink)
  im.convert('RGB').save(O/f'{key}-{device}.webp','WEBP',quality=86)
print('Rendered 15 original responsive website screen designs.')
