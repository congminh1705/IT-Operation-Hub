"""Read-only check of approved design sources and task scope links.

Refresh baseline-lock.json only after an owner-approved design revision.
This checks documents, not application implementation or task completion.
"""
from pathlib import Path
import hashlib,json,re

ROOT = Path(__file__).resolve().parents[3] / "docs/design/final"
REPO=ROOT.parents[2]

def run():
    lock=json.loads((ROOT.parents[2]/'docs/reports/design/final/baseline-lock.json').read_text(encoding='utf-8'))
    assert lock['version']=='1.3' and lock['decision']=='D-51'
    for name,expected in lock['source_sha256'].items():
        path=REPO/name
        assert path.exists(),f'Missing approved source: {name}'
        assert hashlib.sha256(path.read_bytes()).hexdigest()==expected,f'Approved source changed: {name}'
    cards=list((REPO/'docs/implementation/tasks').glob('*.md'))
    fe=[p for p in cards if p.name.startswith('FE-')]
    later=[p for p in cards if p.name.startswith(('INT-','QA-'))]
    assert len(cards)==230 and len(fe)==63 and len(later)==30
    scope=(ROOT.parent/'implementation-scope.md').read_text(encoding='utf-8')
    for card in fe:
        anchor=card.stem.lower().replace('.','-')
        text=card.read_text(encoding='utf-8')
        assert 'implementation-scope.md#'+anchor in text,card.name
        assert f'<a id="{anchor}">' in scope,card.name
    for card in later:
        assert 'implementation-scope.md#acceptance-boundary' in card.read_text(encoding='utf-8'),card.name
    missing=[]
    for path in [REPO/'README.md',*(REPO/'docs').rglob('*.md')]:
        for target in re.findall(r'\]\(([^)]+)\)',path.read_text(encoding='utf-8')):
            if re.match(r'[a-z]+:',target):continue
            bare=re.split('[?#]',target)[0]
            if not bare or any(s in bare for s in ['<','{']):continue
            if not (path.parent/bare).exists():missing.append((str(path.relative_to(REPO)),target))
    assert not missing,missing
    manifest=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
    assert manifest['version']==lock['version'] and manifest['decision']==lock['decision']
    assert len(manifest['groups'])==8 and sum(len(g['screens']) for g in manifest['groups'])==47
    alignment=json.loads((ROOT/'implementation-alignment.json').read_text(encoding='utf-8'))
    assert alignment['html_first'] and len(alignment['html_reference_bindings'])==63
    screens={g['id']+'.html':{s['id'] for s in g['screens']} for g in manifest['groups']}
    for binding in alignment['html_reference_bindings']:
        text=(REPO/'docs/implementation/tasks'/(binding['task']+'.md')).read_text(encoding='utf-8')
        assert '### Approved HTML reference' in text,binding['task']
        for url in binding['html']:
            assert '../../design/final/'+url in text,(binding['task'],url)
            path=re.split('[?#]',url)[0]
            assert (ROOT/path).is_file(),url
            if '#' in url:assert url.split('#',1)[1] in screens[path],url
        if binding['visual_evidence_required']:
            assert 'docs/implementation/evidence/'+binding['task']+'/' in text,binding['task']
        else:assert 'N/A with the reason' in text,binding['task']
    for ai in manifest['ai_checks']:
        assert hashlib.sha256((ROOT/ai['file']).read_bytes()).hexdigest()==ai['approved_source_sha256']
    print(f"Current v1.3 / D-51: {len(lock['source_sha256'])} source hashes valid; 63 direct FE HTML bindings/fragments and evidence requirements valid; 30 INT/QA scope bindings valid; 230 task IDs retained; no broken local Markdown paths. Application checks NOT RUN.")

if __name__=='__main__':run()
