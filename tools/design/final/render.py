"""Regenerate the current all-screen design gallery using the taste-skill browser tool.
Design captures only; this is not application acceptance.
"""
from pathlib import Path
from functools import partial
import argparse, http.server, threading, subprocess, os, json
ROOT = Path(__file__).resolve().parents[3] / "docs/design/final"
REPO=ROOT.parents[2]

def run():
    parser=argparse.ArgumentParser();parser.add_argument('--mobile',action='store_true');args=parser.parse_args()
    kit=REPO/'.agents/skills/design-taste-frontend/scripts/shoot.mjs'
    assert kit.is_file(), 'Install the project taste-skill before rendering.'
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*args): pass
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT.parent)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    jobs=json.loads((ROOT/'screen-gallery.json').read_text(encoding='utf-8'))
    if args.mobile:jobs+=json.loads((ROOT/'supplemental-jobs.json').read_text(encoding='utf-8'))
    results=[]
    try:
        for i,item in enumerate(jobs):
            output=ROOT/item['image'];output.parent.mkdir(parents=True,exist_ok=True)
            command=['node',str(kit),'--url',f'http://127.0.0.1:{server.server_port}/final/'+item['url'],'--w',str(item.get('width',1440)),'--h','1000','--wait','26000' if item['id'].startswith('suite-') else '650','--out',str(output),'--no-tiles','--profile',str(ROOT/'.taste-skill'/('render-'+str(i)))]
            proc=subprocess.run(command,cwd=ROOT,capture_output=True,text=True,timeout=300)
            results.append({'id':item['id'],'exit_code':proc.returncode,'output':proc.stdout[-500:],'error':proc.stderr[-500:]})
            (ROOT/'suite-render-results.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
            print(f'{i+1}/{len(jobs)} '+item['id']+' '+str(proc.returncode),flush=True)
            if proc.returncode:raise RuntimeError(proc.stderr)
    finally:server.shutdown();server.server_close()

if __name__=='__main__':run()
