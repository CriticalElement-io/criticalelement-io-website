#!/usr/bin/env python3
"""Stamp the shared site chrome (nav, footer, health check modal) into every page.

The site has no build step: pages are plain HTML and are committed as-is. This script keeps the parts
that must be identical on every page in sync. Run it after editing anything in tools/partials/, or
with --bump after changing CSS or JS so browsers fetch the new files.

    python3 tools/chrome.py          # stamp partials into every page
    python3 tools/chrome.py --bump   # increment the assets version (?v=N) everywhere, then stamp
    python3 tools/chrome.py --check  # exit 1 if any page is out of sync (no writes)

Each page marks where a partial goes with a pair of comments, e.g.

    <!-- nav:start -->
    ...replaced...
    <!-- nav:end -->

Partials: nav (header + mark symbol + nav.js), footer, health-check (the modal + its script).
A page without a marker pair for a partial is left alone for that partial.
"""
import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIALS = ROOT / 'tools' / 'partials'
VERSION_FILE = ROOT / 'tools' / 'assets-version.txt'
SKIP = {'assets', 'node_modules', '.git', 'tools'}

def pages():
    for p in sorted(ROOT.rglob('*.html')):
        if any(part in SKIP for part in p.relative_to(ROOT).parts):
            continue
        yield p

def render(name, version):
    text = (PARTIALS / f'{name}.html').read_text()
    return text.replace('{{v}}', version).rstrip('\n')

def stamp(html, name, body):
    pattern = re.compile(rf'<!-- {name}:start -->\n.*?<!-- {name}:end -->', re.S)
    if not pattern.search(html):
        return html, False
    return pattern.sub(lambda _: f'<!-- {name}:start -->\n{body}\n<!-- {name}:end -->', html, count=1), True

def bump_assets(html, version):
    return re.sub(r'(/assets/[^"\s?]+)\?v=\d+', lambda m: f'{m.group(1)}?v={version}', html)

def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--bump', action='store_true', help='increment tools/assets-version.txt before stamping')
    ap.add_argument('--check', action='store_true', help='report pages that would change; write nothing')
    args = ap.parse_args()

    version = VERSION_FILE.read_text().strip()
    if args.bump:
        version = str(int(version) + 1)
        VERSION_FILE.write_text(version + '\n')
        print(f'assets version -> {version}')

    bodies = {name: render(name, version) for name in ('nav', 'footer', 'health-check')}
    changed, stale = [], []
    for page in pages():
        before = page.read_text()
        after = before
        used = []
        for name, body in bodies.items():
            after, hit = stamp(after, name, body)
            if hit:
                used.append(name)
        after = bump_assets(after, version)
        rel = page.relative_to(ROOT)
        if after != before:
            if args.check:
                stale.append(rel)
            else:
                page.write_text(after)
                changed.append(rel)
        print(f'{rel}: {", ".join(used) or "no partials"}')

    if args.check:
        if stale:
            print('\nOUT OF SYNC:', *stale, sep='\n  ')
            sys.exit(1)
        print('\nall pages in sync')
    else:
        print(f'\nupdated {len(changed)} page(s)' + (': ' + ', '.join(map(str, changed)) if changed else ''))

if __name__ == '__main__':
    main()
