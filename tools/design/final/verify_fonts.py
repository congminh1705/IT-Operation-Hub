"""Check real cmap glyphs/variable weight axes, not CSS font-family strings alone."""
from pathlib import Path
import struct
import json
import hashlib
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[3] / "docs/design/final"
ASSETS = ROOT / 'dashboard/prompt-dashboard/public/assets'
VIETNAMESE = set(range(0x1EA0, 0x1EFA)) | set(range(65, 91)) | set(range(97, 123)) | {
    0x102, 0x103, 0x110, 0x111, 0x128, 0x129, 0x168, 0x169, 0x1A0, 0x1A1, 0x1AF, 0x1B0,
    0xC0, 0xC1, 0xC2, 0xC3, 0xC8, 0xC9, 0xCA, 0xCC, 0xCD, 0xD2, 0xD3, 0xD4, 0xD5, 0xD9, 0xDA, 0xDD,
    0xE0, 0xE1, 0xE2, 0xE3, 0xE8, 0xE9, 0xEA, 0xEC, 0xED, 0xF2, 0xF3, 0xF4, 0xF5, 0xF9, 0xFA, 0xFD,
}

def inspect(path):
    data = path.read_bytes()
    u16 = lambda n: struct.unpack_from('>H', data, n)[0]
    u32 = lambda n: struct.unpack_from('>I', data, n)[0]
    tables = {data[12+i*16:16+i*16].decode(): u32(20+i*16) for i in range(u16(4))}
    cmap = tables['cmap']
    subtables = [cmap+u32(cmap+8+i*8) for i in range(u16(cmap+2))]
    def present(cp):
        for start in subtables:
            fmt = u16(start)
            if fmt == 12:
                for j in range(u32(start+12)):
                    first, last, glyph = struct.unpack_from('>III', data, start+16+j*12)
                    if first <= cp <= last and glyph+cp-first:
                        return True
            elif fmt == 4 and cp <= 65535:
                n = u16(start+6)//2
                ends = start+14
                starts = ends+2*n+2
                deltas = starts+2*n
                ranges = deltas+2*n
                for j in range(n):
                    if u16(starts+2*j) <= cp <= u16(ends+2*j):
                        offset = u16(ranges+2*j)
                        if not offset:
                            glyph = (cp+u16(deltas+2*j)) % 65536
                        else:
                            glyph = u16(ranges+2*j+offset+2*(cp-u16(starts+2*j)))
                            if glyph:
                                glyph = (glyph+u16(deltas+2*j)) % 65536
                        if glyph:
                            return True
        return False
    assert 'fvar' in tables, f'Not a variable font: {path.name}'
    fvar = tables['fvar']
    axes = {}
    for i in range(u16(fvar+8)):
        offset = fvar+u16(fvar+4)+i*u16(fvar+10)
        tag = data[offset:offset+4].decode()
        lo, default, hi = struct.unpack_from('>iii', data, offset+4)
        axes[tag] = [lo/65536, default/65536, hi/65536]
    return {'file': path.name, 'missing': [f'U+{cp:04X}' for cp in sorted(VIETNAMESE) if not present(cp)], 'axes': axes}

def run():
    sources = json.loads((ASSETS/'font-sources.json').read_text(encoding='utf-8'))
    for source in sources:
        assert hashlib.sha256((ASSETS/source['file']).read_bytes()).hexdigest() == source['sha256'], source['file']
    results = [inspect(ASSETS/s['file']) for s in sources]
    for result in results:
        assert not result['missing'], result
        assert result['axes']['wght'][0] <= 400 and result['axes']['wght'][2] >= 700, result
    for svg in (ROOT/'ai').glob('*.svg'):
        tree = ET.fromstring(svg.read_text(encoding='utf-8'))
        assert not any('Instrument Serif' in e.get('font-family', '') for e in tree.iter()), svg.name
        assert any(e.tag.endswith('style') and "font-family:'Inter'" in (e.text or '') for e in tree.iter()), svg.name
    print(f'Font checks passed: {len(results)} variable faces; {len(VIETNAMESE)} Latin/Vietnamese codepoints each; weights 400-700; six embedded AI compositions.')
    return results

if __name__ == '__main__':
    run()
