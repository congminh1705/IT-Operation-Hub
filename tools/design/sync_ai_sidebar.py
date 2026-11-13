"""Use the shared sidebar vocabulary/icons in the static AI references."""
from pathlib import Path
import xml.etree.ElementTree as ET
import re,copy
R=Path(__file__).resolve().parents[2];F=R/'docs/design/final'
NS='http://www.w3.org/2000/svg';ET.register_namespace('',NS)
icons=ET.fromstring((F/'dashboard/icons.svg').read_text(encoding='utf-8'))
symbols={s.get('id'):s for s in icons.iter() if s.tag.endswith('symbol')}
def el(tag,**attrs):return ET.Element('{'+NS+'}'+tag,{k.replace('_','-'):str(v) for k,v in attrs.items()})
for p in (F/'ai').glob('*.svg'):
 root=ET.fromstring(p.read_text(encoding='utf-8'));height=float(root.get('height'));old=root.find('{'+NS+'}g[@id="shared-sidebar"]')
 if old is not None:root.remove(old)
 g=el('g',id='shared-sidebar',font_family='Inter,Arial,sans-serif')
 g.append(el('rect',x=0,y=0,width=244,height=height,fill='#f5f7f6'))
 g.append(el('rect',x=0,y=0,width=224,height=height,fill='#eff3f1'))
 def text(x,y,value,size=14,color='#52675d',weight=400):
  t=el('text',x=x,y=y,font_size=size,fill=color,font_weight=weight);t.text=value;g.append(t)
 def icon(x,y,name,color='#52675d'):
  s=symbols.get('i-'+name)
  if s is None:return
  q=el('g',transform=f'translate({x} {y}) scale(.75)',color=color)
  for c in s:q.append(copy.deepcopy(c))
  g.append(q)
 g.append(el('rect',x=16,y=28,width=32,height=32,rx=8,fill='#087f78'));icon(23,35,'toolbox','#ffffff')
 text(56,40,'IT Operations',16,'#25332f',650);text(56,59,'Hub · Không gian nội bộ',12)
 text(24,118,'Không gian làm việc',12,weight=600)
 items=[('Tổng quan','dashboard'),('Yêu cầu của tôi','ticket'),('Công việc IT','toolbox'),('Nhân sự & lịch','users'),('AI Workspace','ai'),('Kho kiến thức','folder'),('Tài sản & thiết bị','laptop')]
 for i,(label,name) in enumerate(items):
  y=150+i*46;active=label=='AI Workspace'
  if active:g.append(el('rect',x=16,y=y-26,width=192,height=40,rx=8,fill='#087f78'))
  icon(26,y-17,name,'#ffffff' if active else '#52675d');text(56,y,label,14,'#ffffff' if active else '#52675d',600 if active else 400)
 text(24,490,'Theo dõi',12,weight=600)
 for i,(label,name) in enumerate([('Báo cáo','chart'),('Thông báo','bell'),('Nhật ký','history')]):
  y=526+i*46;icon(26,y-17,name);text(56,y,label)
 g.append(el('line',x1=16,y1=height-108,x2=208,y2=height-108,stroke='#d9e3de'))
 g.append(el('circle',cx=34,cy=height-74,r=18,fill='#e0efea'))
 g.append(el('circle',cx=34,cy=height-79,r=5.4,fill='#4e8073'))
 g.append(el('path',d=f'M23 {height-64}c0-6 4-10 11-10s11 4 11 10',fill='#4e8073'))
 text(60,height-78,'Nguyễn Thu Hà',13,'#25332f',650);text(60,height-59,'Trưởng phòng IT',12)
 g.append(el('rect',x=16,y=height-40,width=192,height=32,rx=8,fill='#fff',stroke='#ccd9d3'))
 text(92,height-19,'Hồ sơ',12,'#25332f',600)
 root.append(g);p.write_text(ET.tostring(root,encoding='unicode'),encoding='utf-8')
print('Six AI sidebars synchronized; workspace content coordinates preserved.')
