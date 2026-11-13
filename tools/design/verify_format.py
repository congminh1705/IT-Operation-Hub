"""Verify D-51 format sources and propagation; not application acceptance."""
from pathlib import Path
import hashlib
import json
import zipfile
import runpy

ROOT = Path(__file__).resolve().parents[2] / "docs/design"
REPO = ROOT.parents[1]

def run():
    runpy.run_path(str(ROOT.parents[1]/'tools/design/final/verify_fonts.py'))['run']()
    lock = json.loads((ROOT.parents[1] / 'docs/reports/design/format-lock.json').read_text(encoding='utf-8'))
    assert lock['version'] == '1.3' and lock['decision'] == 'D-51'
    for name, expected in lock['source_sha256'].items():
        source = REPO / name
        assert source.is_file(), f'Missing format source: {name}'
        assert hashlib.sha256(source.read_bytes()).hexdigest() == expected, f'Approved format drift: {name}'
    cards = list((REPO / 'docs/implementation/tasks').glob('*.md'))
    affected = [p for p in cards if p.name.startswith(('FE-', 'INT-', 'QA-'))]
    assert len(cards) == 230 and len(affected) == 93
    for card in affected:
        assert '../../design/approved-format.md' in card.read_text(encoding='utf-8'), card.name
    for name in ['task-template.md', 'task-workflow.md', 'task-execution-prompt.md', 'current-context.md']:
        assert 'approved-format.md' in (REPO / 'docs/implementation/workflow' / name).read_text(encoding='utf-8'), name
    register = json.loads((ROOT / 'format-coverage.json').read_text(encoding='utf-8'))
    manifest = json.loads((ROOT / 'final/manifest.json').read_text(encoding='utf-8'))
    expected = {(g['id'], s['id']) for g in manifest['groups'] for s in g['screens']}
    actual = {(s['group'], s['screen']) for s in register['screens']}
    assert actual == expected and len(register['screens']) == 47
    assert set(register['role_dashboards']) == {'manager', 'admin', 'requester', 'technician'}
    assert sum(s['status'] == 'retained-approved-login' for s in register['screens']) == 1
    assert sum(s['status'] == 'design-rendered-review-ready' for s in register['screens']) == 46
    for screen in register['screens']:
        assert (ROOT / screen['layout_reference'].split('#')[0]).is_file()
    figures = json.loads((ROOT / 'gallery-manifest.json').read_text(encoding='utf-8'))
    assert len(figures) == 37
    for figure in figures:
        assert figure['current_format_decision'] == 'D-51'
        assert figure['presentation_status'] in {'current-v1.3-render'}
    for name in ['07-uiux.xmind', '08-ai-assistant.xmind', 'it-operations-hub.xmind']:
        with zipfile.ZipFile(REPO / 'docs/xmind' / name) as archive:
            assert archive.testzip() is None
            meta = json.loads(archive.read('metadata.json'))['uiDesignBaseline']
            assert meta['decision'] == 'D-51' and meta['figure_version'] == '1.3'
            assert meta['all_screens_rendered'] is True
    gallery=json.loads((ROOT/'final/screen-gallery.json').read_text(encoding='utf-8'))
    assert len(gallery)==51
    for entry in gallery:
        image=ROOT/'final'/entry['image']
        assert image.is_file() and image.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n', entry['id']
    gallery=json.loads((ROOT/'final/screen-gallery.json').read_text(encoding='utf-8'))
    assert len(gallery)==51
    for entry in gallery:
        image=ROOT/'final'/entry['image']
        assert image.is_file() and image.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n', entry['id']
    gallery=json.loads((ROOT/'final/screen-gallery.json').read_text(encoding='utf-8'))
    assert len(gallery)==51
    for entry in gallery:
        image=ROOT/'final'/entry['image']
        assert image.is_file() and image.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n', entry['id']
    gallery=json.loads((ROOT/'final/screen-gallery.json').read_text(encoding='utf-8'))
    assert len(gallery)==51
    for entry in gallery:
        image=ROOT/'final'/entry['image']
        assert image.is_file() and image.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n', entry['id']
    for name in ['README.md', 'visual-refresh.md', 'design-system.md', 'content-and-states.md', 'motion-and-responsive.md']:
        text = (ROOT / name).read_text(encoding='utf-8')
        for stale in ['The only current baseline is **v1.1', 'The approved direction is Nexus', '**Current baseline: owner-approved v1.1']:
            assert stale not in text, (name, stale)
    print(f'Approved v1.3 / D-51: {len(lock["source_sha256"])} format hashes; 93 task cards; 47 specimens + 4 dashboards; 37 figure classifications; 3 XMind metadata records valid. All-screen design renders present; application acceptance NOT claimed.')

if __name__ == '__main__':
    run()
