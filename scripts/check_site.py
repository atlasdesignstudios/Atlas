#!/usr/bin/env python3
"""Dependency-free smoke checks for the static Lusius website."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import posixpath
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = "www.lusiusbrand.com"
errors = []

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.refs = []
        self.title = False
        self.lang = None
        self.h1_count = 0
        self.viewport = False
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "html":
            self.lang = a.get("lang")
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self.in_title = True
        if tag == "meta" and a.get("name", "").lower() == "viewport":
            self.viewport = True
        for key in ("href", "src", "poster"):
            value = a.get(key)
            if value:
                self.refs.append((key, value))

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title and data.strip():
            self.title = True

def fail(message):
    errors.append(message)

pages = sorted(ROOT.rglob("*.html"))
if not pages:
    fail("No HTML pages found.")

id_map = {}
for page in pages:
    rel = page.relative_to(ROOT).as_posix()
    parser = PageParser()
    try:
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
    except Exception as exc:
        fail(f"{rel}: HTML parser error: {exc}")
        continue

    if parser.lang != "es":
        fail(f"{rel}: expected <html lang=\"es\">.")
    if not parser.title:
        fail(f"{rel}: missing non-empty <title>.")
    if parser.h1_count != 1:
        fail(f"{rel}: expected exactly one <h1>, found {parser.h1_count}.")
    if not parser.viewport:
        fail(f"{rel}: missing viewport meta tag.")

    seen = set()
    for ident in parser.ids:
        if ident in seen:
            fail(f"{rel}: duplicate id=\"{ident}\".")
        seen.add(ident)
    id_map[rel] = seen

for page in pages:
    rel = page.relative_to(ROOT).as_posix()
    parser = PageParser()
    parser.feed(page.read_text(encoding="utf-8"))
    for kind, raw in parser.refs:
        raw = raw.strip()
        if not raw or raw.startswith(("data:", "mailto:", "tel:", "javascript:")):
            continue
        parts = urlsplit(raw)
        if parts.scheme and parts.scheme not in ("http", "https"):
            continue
        if parts.netloc and parts.hostname not in (DOMAIN, "lusiusbrand.com"):
            continue
        path = unquote(parts.path)
        if path.startswith("/"):
            target = posixpath.normpath(path.lstrip("/"))
        elif path:
            target = posixpath.normpath(posixpath.join(posixpath.dirname(rel), path))
        else:
            target = rel
        if target in ("", "."):
            target = "index.html"
        candidate = ROOT / target
        if candidate.is_dir():
            candidate = candidate / "index.html"
            target = (Path(target) / "index.html").as_posix()
        if not candidate.is_file():
            fail(f"{rel}: broken local {kind} reference: {raw}")
            continue
        if parts.fragment:
            fragment = unquote(parts.fragment)
            target_ids = id_map.get(target)
            if target_ids is None:
                target_parser = PageParser()
                target_parser.feed(candidate.read_text(encoding="utf-8"))
                target_ids = set(target_parser.ids)
                id_map[target] = target_ids
            if fragment not in target_ids:
                fail(f"{rel}: missing fragment #{fragment} in {target}.")

sitemap = ROOT / "sitemap.xml"
if sitemap.exists():
    try:
        ET.parse(sitemap)
    except ET.ParseError as exc:
        fail(f"sitemap.xml: invalid XML: {exc}")
else:
    fail("Missing sitemap.xml.")

if errors:
    print("Lusius site checks FAILED:")
    for error in errors:
        print(f" - {error}")
    sys.exit(1)

print(f"Lusius site checks passed: {len(pages)} HTML pages, local references, IDs, metadata and sitemap XML.")
