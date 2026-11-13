from pathlib import Path
import xml.etree.ElementTree as E
R=Path(__file__).resolve().parents[2];F=R/'docs/design/final';NS='http://www.w3.org/2000/svg';E.register_namespace('',NS)
for p in (F/'ai').glob('*.svg'):
 root=E.parse(p).getroot();texts=list(root.iter('{'+NS+'}text'))
 for e in root.iter():
  if e.get('fill')=='#5e7e7b':e.set('fill','#52645d')
  if e.get('fill')=='#23403d':e.set('fill','#25332f')
  if e.tag.endswith('text'):e.attrib.pop('filter',None)
 for rect in root.iter('{'+NS+'}rect'):
  color=rect.get('fill');h=float(rect.get('height','9999'))
  if h>48 or color not in ['#42a69c','#29332c']:continue
  primary=color=='#42a69c';rect.set('fill','#087f78' if primary else '#eef0f4');rect.set('stroke','#087f78' if primary else '#cdd3de');rect.set('rx','8')
  x=float(rect.get('x','0'));y=float(rect.get('y','0'));w=float(rect.get('width','0'))
  for t in texts:
   tx=float(t.get('x','-999'));ty=float(t.get('y','-999'))
   if x<=tx<=x+w and y<=ty<=y+h:
    t.set('fill','#fff' if primary else '#535e70');t.set('font-size','14');t.set('font-weight','600')
 for g in root.iter('{'+NS+'}g'):
  if g.get('class')=='coordination-step':
   state=g.get('data-step-status','future')
   fill,ink,edge=('#24643d','#fff','#24643d') if state=='done' else ('#fff5df','#82540b','#d4a43b') if state=='current' else ('#eef0f4','#535e70','#cdd3de')
   for e in g:
    if e.tag.endswith('circle'):e.set('fill',fill);e.set('stroke',edge)
    if e.tag.endswith('text') and e.get('text-anchor')=='middle':e.set('fill',ink);e.set('font-weight','700')
 # Button content uses local transformed coordinates; do not infer containment from x/y.
 for button in root.iter('{'+NS+'}g'):
  if button.get('data-control')!='button':continue
  primary=any(r.get('fill')=='#087f78' for r in button.iter('{'+NS+'}rect'))
  if not primary:continue
  for e in button.iter():
   if e.tag.endswith('text'):e.set('fill','#ffffff');e.set('font-weight','600');e.attrib.pop('filter',None)
   if e.tag.endswith('g') and e.get('color'):e.set('color','#ffffff')
 p.write_text(E.tostring(root,encoding='unicode'),encoding='utf-8')
print('AI step contrast, primary actions and locked badges updated.')
