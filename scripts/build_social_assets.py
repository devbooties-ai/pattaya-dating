from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math
BASE=Path('public/assets/social-2026')
BASE.mkdir(parents=True,exist_ok=True)
def background(filename,colors,kind):
 w,h=1000,640
 im=Image.new('RGBA',(w,h),colors[0]);draw=ImageDraw.Draw(im,'RGBA')
 if kind=='premium':
  for i in range(10):
   r=80+i*40
   draw.ellipse((w*.69-r,h*.42-r,w*.69+r,h*.42+r),outline=(*colors[1],max(12,90-i*7)),width=7)
  draw.polygon([(500,410),(585,330),(675,395),(770,290),(850,400),(850,445),(500,445)],fill=(*colors[1],190))
  for x,y in [(585,330),(770,290),(675,395)]:
   draw.ellipse((x-14,y-14,x+14,y+14),fill=(*colors[2],240))
 elif kind=='live':
  for i in range(8):
   t=15+i*25
   draw.rounded_rectangle((190+t,90+t/2,800-t,540-t/2),radius=70,outline=(*colors[1],max(20,130-i*11)),width=7)
  draw.ellipse((400,190,600,390),fill=(*colors[2],140))
 elif kind=='gift':
  draw.ellipse((280,110,720,550),fill=(*colors[1],70))
  for i in range(12):
   x=500+int(math.cos(i*math.pi/6)*240);y=330+int(math.sin(i*math.pi/6)*185)
   draw.ellipse((x-9,y-9,x+9,y+9),fill=(*colors[2],210))
  draw.polygon([(500,160),(610,300),(500,485),(390,300)],fill=(*colors[2],220))
 im.convert('RGB').save(BASE/filename,'WEBP',quality=88,method=6)
background('premium-crown.webp',[(22,16,48),(255,191,84),(255,229,172)],'premium')
background('live-glow.webp',[(25,15,57),(228,65,150),(190,125,255)],'live')
background('gift-diamond.webp',[(65,25,71),(255,105,169),(255,231,185)],'gift')
print('Created three original high-quality WebP design backgrounds.')
