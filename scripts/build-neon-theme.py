#!/usr/bin/env python3
"""Generate app/neon-pages-auto.css from app/premium.css.

Finds every declaration in premium.css that uses a warm colour (the old gold / olive / brown / cream
palette), recolours it to the neon palette (violet / blue accents, cool navy darks, cool whites) at the
same lightness and alpha, and re-emits it scoped to `html.neon` with !important.
`html.neon` is set only on the inner pages (see the head script in app/layout.tsx), so the home page,
admin and every other page keep their own styles. Light-theme rules are skipped (those pages run the dark theme).

Run again after editing premium.css:  python3 scripts/build-neon-theme.py
"""
import colorsys, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'app' / 'premium.css'
OUT = ROOT / 'app' / 'neon-pages-auto.css'

def to_neon(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    deg = h * 360
    if s < 0.06 or not (15 <= deg <= 115):
        return None                        # not warm: leave it
    if l < 0.22:                            # dark warm surfaces -> deep navy/violet
        nh, ns = 250 / 360, min(0.55, s + 0.25)
    elif l > 0.82:                          # creams / bone text -> cool white
        nh, ns = 250 / 360, min(0.6, s + 0.2)
    elif s > 0.45:                          # vivid gold / yellow accents -> violet or neon blue
        nh, ns = (195 / 360, 1.0) if l > 0.6 else (258 / 360, 0.95)
    else:                                   # muted olive / khaki -> muted violet
        nh, ns = 252 / 360, min(0.7, s + 0.25)
    nr, ng, nb = colorsys.hls_to_rgb(nh, l, ns)
    return round(nr * 255), round(ng * 255), round(nb * 255)

HEX = re.compile(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b')
RGB = re.compile(r'rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+%?)\s*)?\)')

def recolour(value):
    changed = False
    def hex_sub(m):
        nonlocal changed
        h = m.group(1)
        if len(h) in (3, 4): h = ''.join(c * 2 for c in h)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        n = to_neon(r, g, b)
        if not n: return m.group(0)
        changed = True
        return '#%02x%02x%02x' % n + (h[6:8] if len(h) == 8 else '')
    def rgb_sub(m):
        nonlocal changed
        n = to_neon(float(m.group(1)), float(m.group(2)), float(m.group(3)))
        if not n: return m.group(0)
        changed = True
        a = m.group(4)
        return f'rgba({n[0]},{n[1]},{n[2]},{a})' if a else f'rgb({n[0]},{n[1]},{n[2]})'
    value = HEX.sub(hex_sub, value)
    value = RGB.sub(rgb_sub, value)
    return value, changed

MODULE = False

def scope(sel):
    sel = sel.strip()
    if MODULE:
        if 'data-theme="light"' in sel: return None
        if sel.startswith(':global(:root'): return ':global(:root.neon' + sel[len(':global(:root'):]
        if sel.startswith(':global(html'): return ':global(html.neon' + sel[len(':global(html'):]
        return ':global(html.neon) ' + sel
    if 'data-theme="light"' in sel or "data-theme='light'" in sel: return None
    if sel.startswith(':root'): return ':root.neon' + sel[5:]
    if sel.startswith('html'): return 'html.neon' + sel[4:]
    if sel.startswith('body'): return 'html.neon ' + sel
    return 'html.neon ' + sel

def split_selectors(s):
    parts, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([': depth += 1
        elif ch in ')]': depth -= 1
        if ch == ',' and depth == 0: parts.append(cur); cur = ''
        else: cur += ch
    parts.append(cur)
    return parts

def parse(css, i=0):
    """Yield (kind, prelude, body/children) items until matching '}'."""
    items, buf = [], ''
    while i < len(css):
        ch = css[i]
        if css.startswith('/*', i):
            j = css.find('*/', i + 2); i = len(css) if j < 0 else j + 2; continue
        if ch == '{':
            prelude = buf.strip(); buf = ''
            if prelude.startswith('@media') or prelude.startswith('@supports') or prelude.startswith('@layer') or prelude.startswith('@container'):
                children, i = parse(css, i + 1)
                items.append(('block', prelude, children))
            else:
                depth, j = 1, i + 1
                while j < len(css) and depth:
                    if css[j] == '{': depth += 1
                    elif css[j] == '}': depth -= 1
                    j += 1
                items.append(('rule', prelude, css[i + 1:j - 1])); i = j
            continue
        if ch == '}':
            return items, i + 1
        if ch == ';' and buf.strip().startswith('@'):
            buf = ''; i += 1; continue
        buf += ch; i += 1
    return items, i

def split_decls(body):
    out, depth, cur = [], 0, ''
    for ch in body:
        if ch == '(': depth += 1
        elif ch == ')': depth -= 1
        if ch == ';' and depth == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur)
    return [d for d in out if ':' in d]

def emit(items):
    lines = []
    for kind, prelude, body in items:
        if kind == 'block':
            inner = emit(body)
            if inner: lines.append(prelude + '{' + ''.join(inner) + '}')
            continue
        if prelude.startswith('@'): continue                     # keyframes, font-face, property
        decls = []
        for d in split_decls(body):
            prop, val = d.split(':', 1)
            prop = prop.strip()
            if prop.startswith('--'): continue
            val = val.replace('!important', '').strip()
            new, changed = recolour(val)
            if changed:
                # a pure-gradient `background` shorthand would reset background-clip:text; keep it to the image
                if prop == 'background' and 'gradient(' in new and 'url(' not in new and not re.sub(r'(repeating-)?(linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)', '', new).strip(' ,'):
                    prop = 'background-image'
                decls.append(f'{prop}:{new}!important')
        if not decls: continue
        sels = [scope(s) for s in split_selectors(prelude)]
        sels = [s for s in sels if s]
        if sels: lines.append(','.join(sels) + '{' + ';'.join(decls) + '}')
    return lines

# component CSS modules used on the neon pages: neon rules are kept inside the file between markers
MODULES = [ROOT / 'components' / 'p' / 'PodcastConsole.module.css']
START, END = '/* neon:start (generated by scripts/build-neon-theme.py) */', '/* neon:end */'
for mod in MODULES:
    text = mod.read_text()
    base = text.split(START)[0].rstrip() + '\n'
    MODULE = True
    mitems, _ = parse(base)
    mrules = emit(mitems)
    MODULE = False
    mod.write_text(base + '\n' + START + '\n' + '\n'.join(mrules) + '\n' + END + '\n')
    print(f'{len(mrules)} rules -> {mod.relative_to(ROOT)}')

items, _ = parse(SRC.read_text())
rules = emit(items)
OUT.write_text('/* GENERATED by scripts/build-neon-theme.py from app/premium.css — do not edit by hand.\n'
               '   Neon recolour of premium.css, active only under html.neon (inner pages). */\n' + '\n'.join(rules) + '\n')
print(f'{len(rules)} rules -> {OUT.relative_to(ROOT)}')
