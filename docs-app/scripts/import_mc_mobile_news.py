# One-off: unpack MC Mobile zips, HTML -> Markdown for docs News section.
# Run from repo root: py -3 docs-app/scripts/import_mc_mobile_news.py

from __future__ import annotations

import json
import re
import shutil
import zipfile
from html import unescape
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from bs4 import BeautifulSoup, NavigableString, Tag

NEWS = Path(__file__).resolve().parents[1] / "public" / "content" / "News"
TYPO_DIR = NEWS / "MC Moblie"
GOOD_DIR = NEWS / "MC Mobile"


def clean_href(href: str | None) -> str:
    if not href:
        return ""
    if "google.com/url" in href:
        q = parse_qs(urlparse(href).query)
        if "q" in q:
            return unquote(q["q"][0])
    return href


def clean_text(s: str) -> str:
    s = unescape(s)
    s = s.replace("\xa0", " ").replace("&ndash;", "–").replace("&laquo;", "«").replace("&raquo;", "»")
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def raw_inline_chunk(s: str) -> str:
    """Фрагмент внутри строки: сохраняем пробелы (иначе &nbsp; между span пропадает)."""
    s = unescape(s)
    s = s.replace("\xa0", " ").replace("&ndash;", "–").replace("&laquo;", "«").replace("&raquo;", "»")
    return re.sub(r"[ \t\r\n]+", " ", s)


def slug_from_version(ver: str) -> str:
    """1.10.0 -> mc-mobile-1-10-0"""
    return "mc-mobile-" + ver.replace(".", "-")


def asset_folder_name(ver: str) -> str:
    """1.10.0 -> mc-mobile-1.10.0 (match MC Cloud dot style)"""
    return f"mc-mobile-{ver}"


def _needs_space_between(a: str, b: str) -> bool:
    if not a or not b:
        return False
    if a.endswith(("\n", " ", "\t")) or b.startswith(("\n", " ", "\t", "!", "[", "(", "«")):
        return False
    ca, cb = a[-1], b[0]
    if ca.isalnum() and cb.isalnum():
        return True
    if ca in ".,;:!?" and cb.isalnum():
        return True
    return False


def _join_inline_parts(parts: list[str]) -> str:
    out: list[str] = []
    for p in parts:
        if not p:
            continue
        if out and _needs_space_between(out[-1], p):
            out.append(" ")
        out.append(p)
    return "".join(out)


def inner_inline(el: Tag | NavigableString, asset_line: str) -> str:
    if isinstance(el, NavigableString):
        return raw_inline_chunk(str(el))
    if not isinstance(el, Tag):
        return ""
    if el.name == "br":
        return "\n"
    if el.name == "a":
        href = clean_href(el.get("href"))
        parts = [inner_inline(c, asset_line) for c in el.children]
        t = clean_text(_join_inline_parts(parts))
        if href and t:
            return f"[{t}]({href})"
        return t or ""
    if el.name == "img":
        src = el.get("src") or ""
        if not src.startswith("images/"):
            return ""
        alt = el.get("alt") or Path(src).name
        return f"\n\n![{alt}]({asset_line}/{src})\n\n"
    if el.name in ("span", "strong", "b", "em", "i"):
        parts = [inner_inline(c, asset_line) for c in el.children]
        return _join_inline_parts(parts)
    parts = [inner_inline(c, asset_line) for c in el.children]
    return _join_inline_parts(parts)


def list_to_md(list_el: Tag, asset_line: str, indent: str = "") -> str:
    lines = []
    ordered = list_el.name == "ol"
    for i, li in enumerate(list_el.find_all("li", recursive=False), start=1):
        prefix = f"{indent}{i}. " if ordered else f"{indent}*   "
        chunks: list[str] = []
        for child in li.children:
            if isinstance(child, NavigableString):
                t = raw_inline_chunk(str(child))
                if t:
                    chunks.append(t)
            elif isinstance(child, Tag):
                if child.name in ("ul", "ol"):
                    inner = list_to_md(child, asset_line, indent + "    ")
                    if chunks and chunks[-1] and not chunks[-1].endswith("\n"):
                        chunks.append("\n")
                    chunks.append(inner)
                elif child.name == "img" or (child.name == "span" and child.find("img")):
                    chunks.append(inner_inline(child, asset_line))
                else:
                    chunks.append(inner_inline(child, asset_line))
        body = "".join(chunks)
        body = re.sub(r"\n{3,}", "\n\n", body).strip()
        first_line, _, rest = body.partition("\n")
        lines.append(prefix + first_line)
        if rest:
            for rline in rest.split("\n"):
                lines.append((indent + "    ") + rline)
        lines.append("")
    return "\n".join(lines).rstrip() + "\n\n"


def paragraph_to_md(p: Tag, asset_line: str) -> str | None:
    classes = p.get("class") or []
    # Skip empty spacers
    if "c17" in classes or "c3" == " ".join(classes):
        txt = p.get_text()
        if not clean_text(txt):
            return None

    if "title" in classes:
        t = inner_inline(p, asset_line)
        t = clean_text(re.sub(r"\s+", " ", t.replace("\n", " ")))
        if t:
            return f"# {t}\n\n"
        return None

    if "subtitle" in classes:
        t = inner_inline(p, asset_line)
        t = clean_text(re.sub(r"\s+", " ", t.replace("\n", " ")))
        if t:
            return f"## {t}\n\n"
        return None

    # subsection: bold c10 in Mobile exports
    spans = p.find_all("span", recursive=False)
    if (
        len(spans) == 1
        and spans[0].get("class")
        and "c10" in spans[0].get("class", [])
        and not p.find("img")
    ):
        t = inner_inline(spans[0], asset_line)
        t = clean_text(re.sub(r"\s+", " ", t.replace("\n", " ")))
        if t and len(t) < 200:
            return f"### {t}\n\n"

    inner = inner_inline(p, asset_line)
    inner = re.sub(r"\n{3,}", "\n\n", inner).strip()
    if not inner:
        return None
    if inner.startswith("![") or "\n\n![" in inner:
        return inner + "\n\n"
    return inner + "\n\n"


def heading_to_md(el: Tag, asset_line: str) -> str | None:
    # Заголовок статьи уже «# MC Mobile …»; h1 в HTML (напр. «Новые возможности») → ##
    lev = int(el.name[1]) + 1
    t = inner_inline(el, asset_line)
    t = clean_text(re.sub(r"\s+", " ", t.replace("\n", " ")))
    if not t:
        return None
    return ("#" * min(lev, 6)) + " " + t + "\n\n"


def html_to_markdown(html: str, asset_line: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    body = soup.find("body")
    if not body:
        return ""

    first = body.find("div", recursive=False)
    if first:
        first.decompose()

    out: list[str] = []
    for el in body.children:
        if isinstance(el, NavigableString):
            continue
        if not isinstance(el, Tag):
            continue
        if el.name in ("h1", "h2", "h3", "h4"):
            piece = heading_to_md(el, asset_line)
            if piece:
                out.append(piece)
        elif el.name == "p":
            piece = paragraph_to_md(el, asset_line)
            if piece:
                out.append(piece)
        elif el.name in ("ul", "ol"):
            out.append(list_to_md(el, asset_line))
        elif el.name == "div":
            for sub in el.children:
                if isinstance(sub, Tag) and sub.name == "p":
                    piece = paragraph_to_md(sub, asset_line)
                    if piece:
                        out.append(piece)
        elif el.name == "hr":
            continue

    text = "".join(out)
    text = re.sub(r"\n{4,}", "\n\n\n", text).strip() + "\n"
    return text


def version_from_zip_name(name: str) -> str | None:
    m = re.match(r"MC Mobile ([0-9]+\.[0-9]+\.[0-9]+)\.zip$", name, re.I)
    return m.group(1) if m else None


def main() -> None:
    if TYPO_DIR.is_dir() and not GOOD_DIR.is_dir():
        shutil.move(str(TYPO_DIR), str(GOOD_DIR))
    elif not GOOD_DIR.is_dir():
        raise SystemExit(f"Expected {TYPO_DIR} or {GOOD_DIR}")

    zips = sorted(GOOD_DIR.glob("MC Mobile *.zip"))
    if not zips:
        raise SystemExit("No zip archives found")

    children: list[dict] = []

    for zpath in zips:
        ver = version_from_zip_name(zpath.name)
        if not ver:
            continue
        folder = asset_folder_name(ver)
        target = GOOD_DIR / folder
        if target.is_dir():
            shutil.rmtree(target)
        target.mkdir(parents=True)

        with zipfile.ZipFile(zpath, "r") as zf:
            for member in zf.namelist():
                if member.endswith("/") or member.lower().endswith(".pdf"):
                    continue
                zf.extract(member, target)

        html_files = list(target.glob("MCMobile*.html"))
        if not html_files:
            raise SystemExit(f"No MCMobile*.html in {target}")
        html_path = html_files[0]
        html = html_path.read_text(encoding="utf-8", errors="replace")

        slug = slug_from_version(ver)
        asset_line = f"/content/News/MC%20Mobile/{folder}"
        md = html_to_markdown(html, asset_line)
        title_line = f"# MC Mobile {ver}"
        stripped = md.lstrip()
        if not stripped.startswith(title_line):
            md = title_line + "\n\n" + md
        (NEWS / f"{slug}.md").write_text(md, encoding="utf-8")

        title = f"MC Mobile {ver}"
        children.append({"title": title, "path": f"news/{slug}"})

    children.sort(key=lambda x: x["path"])

    tree_path = NEWS / "news-tree.json"
    data = json.loads(tree_path.read_text(encoding="utf-8"))
    tre = data.get("tree", [])
    mobile_root = {"title": "MC Mobile", "path": "news/mc-mobile", "children": children}
    # Replace existing MC Mobile branch or append
    tre = [n for n in tre if n.get("path") != "news/mc-mobile"]
    tre.append(mobile_root)
    data["tree"] = tre
    tree_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    landing = NEWS / "mc-mobile.md"
    landing.write_text(
        "# MC Mobile\n\nРелиз-ноутс мобильного приложения MedControl.\n",
        encoding="utf-8",
    )

    print(f"Imported {len(children)} MC Mobile articles.")


if __name__ == "__main__":
    main()
