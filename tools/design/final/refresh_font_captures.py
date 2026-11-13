"""Refresh current screenshots via taste-skill, sequentially; no app code changes.

shoot.mjs closes Chrome before printing 'saved' and cleans up its own PID in its
finally block. Allow cleanup to finish, then stop only an idle Node process whose
remaining timers would otherwise delay each finished screenshot.
"""
from pathlib import Path
import argparse
import json
import os
import subprocess

ROOT = Path(__file__).resolve().parents[3] / "docs/design/final"
REPO = ROOT.parents[2]

def run():
    parser = argparse.ArgumentParser()
    parser.add_argument('--skip-login', action='store_true')
    parser.add_argument('--report', default='font-render-results.json')
    parser.add_argument('--only', default='')
    args = parser.parse_args()
    os.environ.setdefault('CHROME_PATH', (ROOT/'dashboard/.taste-skill/browser-path.txt').read_text().strip())
    jobs = json.loads((ROOT/'screen-gallery.json').read_text(encoding='utf-8'))
    extra = json.loads((ROOT/'supplemental-jobs.json').read_text(encoding='utf-8'))
    jobs += [x for x in extra if x['id'].startswith('mobile-') or x['id'] == 'catalog']
    jobs += [
        {'id': 'font-specimen-desktop', 'url': 'font-specimen.html', 'image': 'images/font-specimen-desktop.png', 'width': 1440},
        {'id': 'font-specimen-mobile', 'url': 'font-specimen.html', 'image': 'images/font-specimen-mobile.png', 'width': 390},
    ]
    if args.skip_login:
        jobs = [x for x in jobs if x['id'] != '01-account-login']
    if args.only:
        jobs = [x for x in jobs if any(part in x['id'] for part in args.only.split(','))]
    results = []
    for i, job in enumerate(jobs):
        target = ROOT/job['image']
        target.parent.mkdir(parents=True, exist_ok=True)
        command = ['node', str(REPO/'.agents/skills/design-taste-frontend/scripts/shoot.mjs'),
                   '--url', 'http://127.0.0.1:8790/final/'+job['url'],
                   '--w', str(job.get('width', 1440)), '--h', '1000', '--wait', '650',
                   '--out', str(target), '--no-tiles', '--profile', str(ROOT/'.taste-skill'/f'font-refresh-{i}')]
        proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='replace', cwd=ROOT)
        lines = []
        saved = False
        for line in proc.stdout:
            lines.append(line)
            if line.startswith('saved '):
                saved = True
                break
        timer_cleanup = False
        if saved:
            try:
                proc.wait(timeout=2)
            except subprocess.TimeoutExpired:
                proc.terminate()
                timer_cleanup = True
        tail, errors = proc.communicate(timeout=15)
        output = ''.join(lines)+tail
        valid = saved and target.is_file() and target.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
        results.append({'id': job['id'], 'saved_png': valid, 'idle_node_timer_cleanup': timer_cleanup, 'output': output, 'stderr': errors})
        (ROOT/args.report).write_text(json.dumps(results, indent=2)+'\n', encoding='utf-8')
        print(f'{i+1}/{len(jobs)} {job["id"]}: {"saved" if valid else "FAILED"}', flush=True)
        if not valid or 'exception:' in output:
            raise RuntimeError(output+errors)

if __name__ == '__main__':
    run()
