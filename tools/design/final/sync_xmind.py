"""Synchronize final UI figures without keeping superseded archive copies."""
from pathlib import Path
import json,re,struct,zipfile
ROOT = Path(__file__).resolve().parents[3] / "docs/design/final"
REPO=ROOT.parents[2]

def run():
    items={i['id']:i for i in json.loads((ROOT.parent/'gallery-manifest.json').read_text(encoding='utf-8'))};results=[]
    for path in (REPO/'docs/xmind').glob('*.xmind'):
        with zipfile.ZipFile(path) as z:contents={n:z.read(n) for n in z.namelist()}
        data=json.loads(contents['content.json']);replacements={}
        def walk(x):
            if isinstance(x,dict):
                image=x.get('image')
                if isinstance(image,dict):
                    key=image.get('src','').removeprefix('xap:');name=Path(key).stem
                    if name in items:
                        item=items[name];png=(REPO/item['image']).read_bytes();w,h=struct.unpack('!II',png[16:24]);scale=min(720/w,900/h)
                        image.update(width=round(w*scale),height=round(h*scale));replacements[key]=png
                        x['notes']={'plain':{'content':item['note']+' Current format: v1.3 / D-51, approved by PO on 13 November 2026. Read docs/design/approved-format.md. Retained figure version: '+item['version']+'. Source: '+item['source']+'. Image: '+item['image']}}
                for k,v in list(x.items()):
                    if isinstance(v,str):
                        x[k]=v.replace('docs/design/reviews/product-v0.9/','docs/design/final/').replace('docs/design/reviews/dashboard-v0.9/index.html','docs/design/final/dashboard.html').replace('docs/design/approval-v0.9.md','docs/design/approval.md')
                        x[k]=x[k].replace('docs/design/previews/v0.9/','docs/design/final/images/')
                    else:walk(v)
            elif isinstance(x,list):
                for v in x:walk(v)
        walk(data)
        for resource in contents:
            name=Path(resource).stem
            if resource.startswith('resources/') and name in items:replacements[resource]=(REPO/items[name]['image']).read_bytes()
        if not replacements:continue
        contents.update(replacements);contents['content.json']=json.dumps(data,ensure_ascii=False).encode()
        meta=json.loads(contents['metadata.json']);meta['uiDesignBaseline']={'version':'1.3','approval':'format-approved','owner':'PO','decision':'D-51','date':'2026-11-13','figure_version':'1.3','figure_status':'current-design-render; login retained unchanged','all_screens_rendered':True};contents['metadata.json']=json.dumps(meta,ensure_ascii=False).encode()
        if path.name in ['07-uiux.xmind','08-ai-assistant.xmind'] and 'Thumbnails/thumbnail.png' in contents:
            name='02-dashboard-manager' if path.name=='07-uiux.xmind' else '37-ai-workspace';contents['Thumbnails/thumbnail.png']=(REPO/items[name]['image']).read_bytes()
        temp=path.with_suffix('.xmind.tmp')
        with zipfile.ZipFile(temp,'w',zipfile.ZIP_DEFLATED) as z:
            for n,b in contents.items():z.writestr(n,b)
        temp.replace(path)
        with zipfile.ZipFile(path) as z:
            assert z.testzip() is None
            for key,b in replacements.items():assert z.read(key)==b
        results.append({'file':str(path.relative_to(REPO)),'ui_resources_updated':len(replacements)})
    with zipfile.ZipFile(REPO/'docs/xmind/it-operations-hub.xmind') as z:master={s['id']:s for s in json.loads(z.read('content.json'))}
    for name in ['07-uiux.xmind','08-ai-assistant.xmind']:
        with zipfile.ZipFile(REPO/'docs/xmind'/name) as z:assert all(s==master[s['id']] for s in json.loads(z.read('content.json')))
    (ROOT/'xmind-verification.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print('Final XMind resources:',sum(i['ui_resources_updated'] for i in results),'; master/subset equality passed.')

if __name__=='__main__':run()
