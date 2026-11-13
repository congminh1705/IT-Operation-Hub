from pathlib import Path
import os,subprocess,json,shutil
R=Path(__file__).resolve().parents[2];F=R/'docs/design/final'
os.environ['CHROME_PATH']=r'C:\Users\congm\AppData\Local\Temp\itoh-chrome-review-y6i8aj5x\chrome-headless-shell-win64\chrome-headless-shell.exe'
jobs=[('02-dashboard-manager','dashboard/index.html?dispatch=night&capture=1'),('03-tickets','02-tickets.html?capture=1#tickets'),('20-task-board','03-work.html?capture=1#work'),('22-workforce','04-workforce.html?capture=1#workforce'),('37-ai-workspace','05-ai.html?capture=1#ai-normal'),('23-coordination','05-ai.html?capture=1#ai-coordination'),('29-assets-list-form','06-knowledge-assets.html?capture=1#assets'),('30-reports','07-monitoring.html?capture=1#reports')]
# Resolve exact approved AI fragments from the manifest instead of assuming them.
figures=json.loads((F.parent/'gallery-manifest.json').read_text(encoding='utf-8'))
if os.environ.get('README_ONLY'):jobs=[j for j in jobs if j[0] in os.environ['README_ONLY'].split(',')]
for i,(name,url) in enumerate(jobs):
 if name=='23-coordination':url=next(x['source'].removeprefix('docs/design/final/') for x in figures if x['id']==name)
 target=F/'images'/f'{name}.png'
 cmd=['node',str(R/'.agents/skills/design-taste-frontend/scripts/shoot.mjs'),'--url','http://127.0.0.1:8790/final/'+url,'--w','1440','--h','1100','--wait','650','--no-tiles','--out',str(target)]
 proc=subprocess.Popen(cmd,cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf-8',errors='replace')
 saved=False
 for line in proc.stdout:
  if line.startswith('saved '):saved=True;break
 if saved:
  try:proc.wait(timeout=2)
  except subprocess.TimeoutExpired:proc.terminate()
 out,err=proc.communicate(timeout=20)
 if not saved:raise RuntimeError(out+err)
 print(name+' refreshed',flush=True)
