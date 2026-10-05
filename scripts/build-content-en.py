"""
Builds src/content/en/*.json from the English pages of the legacy site, mirroring the
structure of src/content/el/*.json (same ids, same media, English text and slugs).

Usage: python3 scripts/build-content-en.py <legacy_en_dir>
  <legacy_en_dir> holds c<pageId>.html, p<productId>.html, a<articleId>.html (see scrape step).
"""
import json
import os
import re
import sys

from bs4 import BeautifulSoup, NavigableString

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
EL = os.path.join(ROOT, "src", "content", "el")
EN = os.path.join(ROOT, "src", "content", "en")
os.makedirs(EN, exist_ok=True)

el_site = json.load(open(os.path.join(EL, "site.json"), encoding="utf-8"))
el_cats = json.load(open(os.path.join(EL, "categories.json"), encoding="utf-8"))
el_prods = json.load(open(os.path.join(EL, "products.json"), encoding="utf-8"))

# Obvious typos in the legacy English copy
FIXES = {
    "Usefull": "Useful",
    "Polystirenes": "Polystyrenes",
    "Resintance": "Resistance",
    "Accesories": "Accessories",
    "Corrotion": "Corrosion",
    "Machinnes": "Machines",
    "Aclylic": "Acrylic",
    "Pyrolitic": "Pyrolytic",
    "Fireplace's Fire-Resistant": "Fireplace Fire-Resistant",
    "Glass Doors's Springs & Glasses' Accessories": "Glass Door Springs & Glass Accessories",
}


def fix(s):
    for a, b in FIXES.items():
        s = s.replace(a, b)
    return s


def slugify(text):
    t = fix(text).lower().replace("&", " and ")
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return re.sub(r"-{2,}", "-", t)


def page(key):
    fn = os.path.join(SRC, f"{key}.html")
    if not os.path.exists(fn):
        return None
    return BeautifulSoup(open(fn, encoding="utf-8").read(), "html.parser")


def text(el):
    if el is None:
        return ""
    return fix(re.sub(r"\s+", " ", el.get_text(" ", strip=True).replace("\xa0", " ")).strip())


ALLOWED = {"p", "ul", "ol", "li", "strong", "b", "em", "i", "h2", "h3", "h4", "table", "thead",
           "tbody", "tr", "td", "th", "a", "br", "sup", "sub"}


def clean_html(el):
    if el is None:
        return ""
    el = BeautifulSoup(str(el), "html.parser")
    for t in el.find_all(["script", "style", "img", "iframe"]):
        t.decompose()
    for t in el.find_all(True):
        if t.name not in ALLOWED:
            t.unwrap()
            continue
        attrs = {}
        if t.name == "a" and t.get("href"):
            attrs["href"] = t["href"]
        if t.name in ("td", "th"):
            for a in ("colspan", "rowspan"):
                if t.get(a):
                    attrs[a] = t[a]
        t.attrs = attrs
    s = str(el).replace("\xa0", " ").replace("&nbsp;", " ")
    s = re.sub(r"(<br\s*/?>\s*){2,}", "</p><p>", s)
    s = re.sub(r"<p>\s*(<br\s*/?>\s*)+", "<p>", s)
    s = re.sub(r"(<br\s*/?>\s*)+</p>", "</p>", s)
    s = re.sub(r"<(p|li|strong|b)>\s*</\1>", "", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    s = s.replace("<b>", "<strong>").replace("</b>", "</strong>")
    soup = BeautifulSoup(s, "html.parser")
    out, buf = [], ""
    for node in soup.contents:
        if isinstance(node, NavigableString) or node.name in ("strong", "em", "i", "a", "br", "sup", "sub"):
            buf += str(node)
        else:
            if re.sub(r"<br\s*/?>", "", buf).strip():
                out.append(f"<p>{buf.strip()}</p>")
            buf = ""
            out.append(str(node))
    if re.sub(r"<br\s*/?>", "", buf).strip():
        out.append(f"<p>{buf.strip()}</p>")
    s = re.sub(r"<p>\s*</p>", "", "\n".join(out))
    return fix(s.strip())


def strip(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def first_sentences(t, n=220):
    t = t.strip()
    if len(t) <= n:
        return t
    cut = t[:n]
    dot = cut.rfind(". ")
    return cut[: dot + 1] if dot > 80 else cut.rsplit(" ", 1)[0] + "…"


def root_of(soup):
    return soup.select_one(".Layout-FullRow.content") if soup else None


def h1(soup):
    return text(soup.select_one(".main-title h1")) if soup else ""


def captions(root):
    """Gallery captions in page order (images are shared with the Greek build)."""
    caps, seen = [], set()
    for a in root.select(".image-gallery a.fancybox[href], .image-list-container a.fancybox[href]"):
        if "icon" in (a.get("class") or []) or a["href"] in seen:
            continue
        seen.add(a["href"])
        caps.append(fix((a.get("title") or "").strip()) or None)
    return caps


def merge_gallery(el_gallery, caps, title):
    out = []
    for i, g in enumerate(el_gallery):
        cap = caps[i] if i < len(caps) else None
        out.append({"src": g["src"], "caption": cap if cap and cap != title else None})
    return out


# ---------------------------------------------------------------- groups & categories

GROUP_PAGE = {"yalopinakes": "c44", "plastika-fylla": "c61", "synafi-proionta": "c62"}
GROUP_SLUG = {"yalopinakes": "glass", "plastika-fylla": "plastic-sheets", "synafi-proionta": "related-products"}
GROUP_TITLE = {"yalopinakes": "Glass", "plastika-fylla": "Plastic Sheets", "synafi-proionta": "Related Products"}

en_cats, en_prods = {}, {}
cat_slug_by_el, prod_slug_by_el = {}, {}
used_slugs = {"category": set(), "product": set()}


def unique(slug, kind):
    """Slugs only need to be unique per kind: categories and products live at different URL depths."""
    base, i = slug, 2
    while slug in used_slugs[kind]:
        slug = f"{base}-{i}"
        i += 1
    used_slugs[kind].add(slug)
    return slug


# category summaries live on the group page (subcategory cards)
group_card_summary = {}
for gkey, pkey in GROUP_PAGE.items():
    soup = page(pkey)
    root = root_of(soup)
    for c in root.select(".subcategory-container"):
        a = c.select_one(".title a")
        m = re.match(r"/(\d+)/", a["href"]) if a else None
        if m:
            group_card_summary[int(m.group(1))] = text(c.select_one(".description"))

for el_slug, c in el_cats.items():
    soup = page(f"c{c['id']}")
    root = root_of(soup)
    title = fix(h1(soup)) or c["title"]
    if c["group"] == "plastika-fylla":
        slug = "plastic-sheets"
        title = "Plastic Sheets"
    else:
        slug = unique(slugify(title), "category")
    intro = clean_html(root.select_one(".page-text"))
    listing = {}
    for item in root.select(".product-list-container"):
        a = item.select_one(".product-list-title a")
        m = re.search(r"/Product/(\d+)/", a["href"])
        listing[int(m.group(1))] = text(item.select_one(".product-list-short-description"))
    cat_slug_by_el[el_slug] = slug
    en_cats[slug] = {
        **c,
        "slug": slug,
        "title": title,
        "summary": group_card_summary.get(c["id"]) or "",
        "intro": intro,
        "gallery": merge_gallery(c["gallery"], captions(root), title),
        "_listing": listing,
    }

# ---------------------------------------------------------------- products

for el_slug, p in el_prods.items():
    soup = page(f"p{p['id']}")
    root = root_of(soup)
    title = fix(h1(soup)) or p["title"]
    slug = unique(slugify(title), "product")
    prod_slug_by_el[el_slug] = slug
    body = clean_html(root.select_one(".product-description"))
    tabs = []
    for a in root.select("#productTabs a.nav-link"):
        pane = root.select_one(a.get("href", "#x"))
        html = clean_html(pane)
        if html and strip(html):
            tabs.append({"title": text(a), "html": html})
    cat_slug = cat_slug_by_el[p["category"]]
    listing_summary = en_cats[cat_slug]["_listing"].get(p["id"], "")
    summary = listing_summary or first_sentences(strip(body))
    en_prods[slug] = {
        **p,
        "slug": slug,
        "title": title,
        "category": cat_slug,
        "summary": summary,
        "body": body,
        "tabs": tabs,
        "gallery": merge_gallery(p["gallery"], captions(root), title),
    }

for p in en_prods.values():
    p["related"] = [prod_slug_by_el[r] for r in el_prods[next(k for k, v in prod_slug_by_el.items() if v == p["slug"])]["related"]]
for c in en_cats.values():
    c["products"] = [prod_slug_by_el[s] for s in el_cats[next(k for k, v in cat_slug_by_el.items() if v == c["slug"])]["products"]]
    c.pop("_listing")
    if not c["summary"]:
        c["summary"] = first_sentences(strip(c["intro"])) if c["intro"] else ""

groups = []
for g in el_site["groups"]:
    soup = page(GROUP_PAGE[g["slug"]])
    root = root_of(soup)
    groups.append({
        **g,
        "key": g["slug"],
        "slug": GROUP_SLUG[g["slug"]],
        "title": GROUP_TITLE[g["slug"]],
        "intro": clean_html(root.select_one(".page-text")),
        "categories": [cat_slug_by_el[c] for c in g["categories"]],
    })

# ---------------------------------------------------------------- company pages


def simple(key, el_page, title=None):
    soup = page(key)
    root = root_of(soup)
    return {**el_page, "title": title or fix(h1(soup)).title(), "html": clean_html(root.select_one(".page-text"))}


company = simple("c42", el_site["company"], "The Company")
facilities = simple("c43", el_site["facilities"], "Facilities")
vision = simple("c48", el_site["vision"], "Vision & Values")
activity = simple("c50", el_site["activity"], "Operation")
history = simple("c49", el_site["history"], "History")
timeline = []
for line in BeautifulSoup(history["html"], "html.parser").get_text("\n").split("\n"):
    line = line.strip()
    m = re.match(r"^((?:19|20)\d\d)\.?\s*(.*)$", line)
    if m and m.group(2):
        timeline.append({"year": m.group(1), "text": fix(m.group(2).strip())})
    elif timeline and line:
        timeline[-1]["text"] += " " + line
history["timeline"] = timeline

financials = [
    {**f, "title": {"2023": "Balance Sheet 2023", "2024": "Financial Statements 2024", "2025": "Financial Statements 2025"}[f["year"]]}
    for f in el_site["financials"]
]

asoup = page("a1")
araw = root_of(asoup).get_text("\n", strip=True)
lines = [l for l in araw.split("\n") if l.strip()][1:]
items = [l for l in lines if l.startswith("Cool Lite")]
intro = [l for l in lines if not l.startswith("Cool Lite") and l not in ("More", "Read more")]
news = [{
    **el_site["news"][0],
    "slug": "saint-gobain-low-e-glass-in-stock",
    "title": "High-performance Low-e glass from Saint-Gobain in stock",
    "html": "".join(f"<p>{fix(l)}</p>" for l in intro) + "<ul>" + "".join(f"<li>{l}</li>" for l in items) + "</ul>",
}]

legal = {}
for el_key, page_key, title in (
    ("oroi-chrisis", "c60", "Terms of Use"),
    ("politiki-aporritou", "c82", "Privacy Policy"),
    ("politiki-cctv", "c83", "CCTV Policy"),
    ("politiki-cookies", "c84", "Cookie Policy"),
):
    soup = page(page_key)
    legal[el_key] = {"title": title, "html": clean_html(root_of(soup).select_one(".page-text"))}

site = {
    **el_site,
    "groups": groups,
    "company": company,
    "facilities": facilities,
    "vision": vision,
    "activity": activity,
    "history": history,
    "financials": financials,
    "news": news,
    "legal": legal,
}

for name, data in (("site", site), ("categories", en_cats), ("products", en_prods)):
    with open(os.path.join(EN, f"{name}.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

print(f"{len(en_cats)} categories, {len(en_prods)} products")
print("timeline", [t["year"] for t in timeline])
print("empty bodies", [s for s, p in en_prods.items() if not strip(p["body"])])
