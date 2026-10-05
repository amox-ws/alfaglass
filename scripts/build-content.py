"""
Builds src/content/*.json and public/media/* from the legacy alfaglass.gr site.

Usage: python3 scripts/build-content.py <scrape_dir>
  <scrape_dir> must contain pages/*.html (raw HTML cached by the scraper) and home.html.
"""
import hashlib
import html as htmllib
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from bs4 import BeautifulSoup, NavigableString

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
BASE = "https://alfaglass.gr"
MEDIA_DIR = os.path.join(ROOT, "public", "media")
CONTENT_DIR = os.path.join(ROOT, "src", "content")
os.makedirs(MEDIA_DIR, exist_ok=True)
os.makedirs(CONTENT_DIR, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0"}

# ---------------------------------------------------------------- helpers

GREEK = {
    "α": "a", "ά": "a", "β": "v", "γ": "g", "δ": "d", "ε": "e", "έ": "e", "ζ": "z",
    "η": "i", "ή": "i", "θ": "th", "ι": "i", "ί": "i", "ϊ": "i", "ΐ": "i", "κ": "k",
    "λ": "l", "μ": "m", "ν": "n", "ξ": "x", "ο": "o", "ό": "o", "π": "p", "ρ": "r",
    "σ": "s", "ς": "s", "τ": "t", "υ": "y", "ύ": "y", "ϋ": "y", "ΰ": "y", "φ": "f",
    "χ": "ch", "ψ": "ps", "ω": "o", "ώ": "o",
}


def slugify(text):
    t = text.lower()
    t = t.replace("ου", "ou").replace("ού", "ou").replace("αι", "ai").replace("ει", "ei")
    t = "".join(GREEK.get(c, c) for c in t)
    t = re.sub(r"[«»\"'()&]", " ", t)
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t


def page(path):
    fn = os.path.join(SRC, "pages", re.sub(r"[^A-Za-z0-9]+", "_", path) + ".html")
    with open(fn, encoding="utf-8") as f:
        return BeautifulSoup(f.read(), "html.parser")


media_jobs = {}


def media(url, prefer_original=True):
    """Register a remote image and return its local public path."""
    if not url:
        return None
    url = htmllib.unescape(url)
    candidates = []
    if prefer_original and url.startswith("/Cache/Photos/"):
        stem = re.sub(r"-w\d*-h\d*-\d+\.(jpe?g|png)$", "", url[len("/Cache/Photos/"):], flags=re.I)
        for folder in ("Products", "Pages", "Categories", "Articles", "Slides", "Banners"):
            for ext in (".jpg", ".JPG", ".jpeg", ".png", ".PNG"):
                candidates.append(f"/Images/{folder}/{stem}{ext}")
    candidates.append(url)
    key = hashlib.sha1(url.encode()).hexdigest()[:10]
    ext = os.path.splitext(urllib.parse.unquote(url))[1].lower() or ".jpg"
    if ext == ".jpeg":
        ext = ".jpg"
    name = f"{key}{ext}"
    media_jobs[name] = candidates
    return f"/media/{name}"


def fetch_media(item):
    name, candidates = item
    out = os.path.join(MEDIA_DIR, name)
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return name, "cached"
    for c in candidates:
        try:
            req = urllib.request.Request(BASE + urllib.parse.quote(c, safe="/:%()"), headers=UA)
            data = urllib.request.urlopen(req, timeout=40).read()
            if len(data) > 1500:
                with open(out, "wb") as f:
                    f.write(data)
                return name, c
        except Exception:
            continue
    return name, None


ALLOWED = {"p", "ul", "ol", "li", "strong", "b", "em", "i", "h2", "h3", "h4", "table", "thead",
           "tbody", "tr", "td", "th", "a", "br", "sup", "sub"}


def clean_html(el):
    """Return sanitized inner HTML of el: semantic tags only, no inline styles."""
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
    s = str(el)
    s = s.replace("\xa0", " ").replace("&nbsp;", " ")
    s = re.sub(r"(<br\s*/?>\s*){2,}", "</p><p>", s)
    s = re.sub(r"<p>\s*(<br\s*/?>\s*)+", "<p>", s)
    s = re.sub(r"(<br\s*/?>\s*)+</p>", "</p>", s)
    s = re.sub(r"<(p|li|strong|b)>\s*</\1>", "", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    s = s.replace("<b>", "<strong>").replace("</b>", "</strong>")
    # wrap stray top-level text in paragraphs
    soup = BeautifulSoup(s, "html.parser")
    out = []
    buf = ""
    for node in soup.contents:
        if isinstance(node, NavigableString) or node.name in ("strong", "em", "i", "a", "br", "sup", "sub"):
            buf += str(node)
        else:
            if buf.strip() and re.sub(r"<br\s*/?>", "", buf).strip():
                out.append(f"<p>{buf.strip()}</p>")
            buf = ""
            out.append(str(node))
    if buf.strip() and re.sub(r"<br\s*/?>", "", buf).strip():
        out.append(f"<p>{buf.strip()}</p>")
    s = "\n".join(out)
    s = re.sub(r"<p>\s*</p>", "", s)
    return s.strip()


def text(el):
    if el is None:
        return ""
    t = el.get_text(" ", strip=True).replace("\xa0", " ")
    return re.sub(r"\s+", " ", t).strip()


def content_root(soup):
    return soup.select_one(".Layout-FullRow.content")


def hero_of(soup):
    h = soup.select_one(".header-main-photo")
    m = re.search(r"url\('([^']+)'\)", h.get("style", "")) if h else None
    return m.group(1) if m else None


def gallery_of(root):
    items, seen = [], set()
    for a in root.select(".image-list-container a.fancybox[href], .image-gallery a.fancybox[href]"):
        if "icon" in (a.get("class") or []):
            continue
        h = a["href"]
        if h in seen:
            continue
        seen.add(h)
        items.append({"src": media(h), "caption": (a.get("title") or "").strip() or None})
    return items


# ---------------------------------------------------------------- categories & products

GROUPS = [
    {"slug": "yalopinakes", "path": "/44/el/YALOPINAKES/", "title": "Υαλοπίνακες",
     "children": [63, 64, 65, 66, 67, 68, 69, 70, 71]},
    {"slug": "plastika-fylla", "path": "/61/el/PLASTIKA-FYLLA/", "title": "Πλαστικά Φύλλα", "children": []},
    {"slug": "synafi-proionta", "path": "/62/el/SYNAFI-PROΪONTA/", "title": "Συναφή Προϊόντα",
     "children": [72, 73, 78, 74]},
]

CAT_PATHS = {
    61: "/61/el/PLASTIKA-FYLLA/",
    63: "/63/el/Koinoi-Float-Yalopinakes/",
    64: "/64/el/Diakosmitikoi-Yalopinakes/",
    65: "/65/el/Kathreptes/",
    66: "/66/el/Energeiakoi-Yalopinakes/",
    67: "/67/el/Anaklastikoi-Yalopinakes/",
    68: "/68/el/Epistromenoi-Yalopinakes-Eidikon-Efarmogon/",
    69: "/69/el/Ixomonotikoi-Yalopinakes/",
    70: "/70/el/Yalopinakes-Asfaleias/",
    71: "/71/el/Purantoxoi-Yalopinakes/",
    72: "/72/el/Suskeues-elegxou-ualopinakon/",
    73: "/73/el/Mixanismoi-gualinon-thuron-and-exartimata-ualopinakon/",
    74: "/74/el/Analosima-mixanon-and-ergaleia/",
    78: "/78/el/Exartimata-gia-Gualines-Thures-and-Yalopinakes/",
}

categories = {}
products = {}
product_slug_by_id = {}


def parse_listing(root):
    out = []
    for c in root.select(".product-list-container"):
        a = c.select_one(".product-list-title a")
        img = c.select_one(".product-list-photo img")
        m = re.search(r"/Product/(\d+)/", a["href"])
        out.append({
            "id": int(m.group(1)),
            "title": text(a),
            "summary": text(c.select_one(".product-list-short-description")),
            "thumb": img["src"] if img else None,
        })
    return out


def parse_subcats(root):
    out = []
    for c in root.select(".subcategory-container"):
        a = c.select_one(".title a")
        img = c.select_one("img")
        m = re.match(r"/(\d+)/", a["href"])
        out.append({"id": int(m.group(1)), "title": text(a), "summary": text(c.select_one(".description")),
                    "thumb": img["src"] if img else None})
    return out


def build_category(cid, group_slug, listing_summary=None, listing_thumb=None):
    path = CAT_PATHS[cid]
    soup = page(path)
    root = content_root(soup)
    title = text(soup.select_one(".main-title h1"))
    intro_el = root.select_one(".page-text")
    listing = parse_listing(root)
    slug = slugify(title) if cid != 61 else "plastika-fylla"
    gallery = gallery_of(root)
    cat = {
        "id": cid,
        "slug": slug,
        "group": group_slug,
        "title": title,
        "summary": listing_summary or "",
        "intro": clean_html(intro_el),
        "image": media(listing_thumb) if listing_thumb else (gallery[0]["src"] if gallery else None),
        "gallery": gallery,
        "products": [],
    }
    for item in listing:
        pslug = slugify(item["title"])
        product_slug_by_id[item["id"]] = pslug
        cat["products"].append(pslug)
        products[pslug] = {"id": item["id"], "slug": pslug, "title": item["title"], "category": slug,
                           "group": group_slug, "summary": item["summary"],
                           "thumb": media(item["thumb"])}
    categories[slug] = cat
    return slug


groups_out = []
for g in GROUPS:
    soup = page(g["path"])
    root = content_root(soup)
    intro = clean_html(root.select_one(".page-text"))
    gallery = gallery_of(root)
    subcats = {s["id"]: s for s in parse_subcats(root)}
    cat_slugs = []
    if g["children"]:
        for cid in g["children"]:
            sc = subcats.get(cid, {})
            cat_slugs.append(build_category(cid, g["slug"], sc.get("summary"), sc.get("thumb")))
    else:
        cat_slugs.append(build_category(61, g["slug"]))
    groups_out.append({"slug": g["slug"], "title": g["title"], "intro": intro,
                       "image": gallery[0]["src"] if gallery else None, "categories": cat_slugs})

# fill product detail
for pslug, p in products.items():
    cid = categories[p["category"]]["id"]
    soup = page(f"/Product/{p['id']}/Page/{cid}/el/")
    root = content_root(soup)
    main_img = root.select_one("#Photo a.fancybox")
    gallery = []
    seen = set()
    for a in root.select(".image-gallery a.fancybox[href]"):
        h = a["href"]
        if h in seen:
            continue
        seen.add(h)
        cap = (a.get("title") or "").strip()
        gallery.append({"src": media(h), "caption": cap if cap and cap != p["title"] else None})
    tabs = {}
    for li in root.select("#productTabs a.nav-link"):
        target = li.get("href", "").lstrip("#")
        pane = root.select_one(f"#{target}")
        body = clean_html(pane)
        if body and re.sub(r"<[^>]+>|\s", "", body):
            tabs[text(li)] = body
    related = []
    for a in root.select("a[href*='/Product/']"):
        m = re.search(r"/Product/(\d+)/", a["href"])
        if m and int(m.group(1)) != p["id"]:
            related.append(int(m.group(1)))
    p.update({
        "body": clean_html(root.select_one(".product-description")),
        "image": media(main_img["href"]) if main_img else p["thumb"],
        "gallery": gallery,
        "tabs": [{"title": k, "html": v} for k, v in tabs.items()],
        "_related": list(dict.fromkeys(related)),
    })
for p in products.values():
    p["related"] = [product_slug_by_id[r] for r in p.pop("_related") if r in product_slug_by_id][:6]

# ---------------------------------------------------------------- company pages


def simple(path):
    soup = page(path)
    root = content_root(soup)
    return {
        "title": text(soup.select_one(".main-title h1")),
        "html": clean_html(root.select_one(".page-text")),
        "hero": media(hero_of(soup)),
        "gallery": gallery_of(root),
    }


company = simple("/42/el/I-ETAIREIA/")
facilities = simple("/43/el/EGKATASTASEIS/")
vision = simple("/48/el/ORAMA-and-AXIES/")
activity = simple("/50/el/DRASTIRIOTITA/")
history = simple("/49/el/ISTORIA/")

# timeline: "1999 Ιδρύεται ..." paragraphs
hsoup = BeautifulSoup(history["html"], "html.parser")
timeline = []
for t in re.split(r"\n", hsoup.get_text("\n")):
    t = t.strip()
    m = re.match(r"^((?:19|20)\d\d)\s*[:\-–]?\s*(.*)$", t)
    if m and m.group(2):
        timeline.append({"year": m.group(1), "text": m.group(2).strip()})
    elif timeline and t:
        timeline[-1]["text"] += " " + t
history["timeline"] = timeline

financials = []
for path in ("/80/el/ISOLOGISMOS-2023/", "/85/el/OIKONOMIKES-KATASTASEIS-2024/", "/86/el/OIKONOMIKES-KATASTASEIS-2025/"):
    soup = page(path)
    root = content_root(soup)
    pdf = next((a["href"] for a in root.select("a[href]") if a["href"].lower().endswith(".pdf")), None)
    financials.append({"title": text(soup.select_one(".main-title h1")).title(),
                       "year": re.search(r"20\d\d", path).group(0), "pdf": BASE + pdf if pdf else None})

# news
asoup = page("/Article/1/")
aroot = content_root(asoup)
article_title = text(aroot.select_one("h1, h2, h3, .article-title")) or "Υαλοπίνακες Low-e υψηλών επιδόσεων της Saint-Gobain σε απόθεμα"
article_body = aroot.select_one(".article-text, .page-text, .article-description, .description")
news = [{
    "slug": "saint-gobain-low-e-se-apothema",
    "date": "2024-11-06",
    "title": "Υαλοπίνακες Low-e υψηλών επιδόσεων της Saint-Gobain σε απόθεμα",
    "html": clean_html(article_body) if article_body else "",
    "raw": aroot.get_text("\n", strip=True),
    "images": [media(i["src"]) for i in aroot.select("img[src]")],
}]

# useful links
lsoup = page("/75/")
lroot = content_root(lsoup)
links = []
current = None
for el in lroot.select(".page-text *"):
    if el.name == "img":
        current = {"logo": media(el["src"], prefer_original=False), "links": []}
        links.append(current)
    elif el.name == "a" and el.get("href", "").startswith("http") and current is not None:
        label = text(el)
        if label and not any(l["href"] == el["href"] for l in current["links"]):
            current["links"].append({"label": label, "href": el["href"]})

# legal
legal = {}
for slug, path in (("oroi-chrisis", "/60/"), ("politiki-aporritou", "/82/"),
                   ("politiki-cctv", "/83/"), ("politiki-cookies", "/84/")):
    soup = page(path)
    root = content_root(soup)
    legal[slug] = {"title": text(soup.select_one(".main-title h1")), "html": clean_html(root.select_one(".page-text"))}

# home slides
home = BeautifulSoup(open(os.path.join(SRC, "home.html"), encoding="utf-8").read(), "html.parser")
slides = []
for img in home.select("img[src*='w1910-h894']"):
    slides.append(media(img["src"], prefer_original=False))

site = {
    "groups": groups_out,
    "company": company,
    "facilities": facilities,
    "vision": vision,
    "activity": activity,
    "history": history,
    "financials": financials,
    "news": news,
    "links": links,
    "legal": legal,
    "slides": list(dict.fromkeys(slides)),
    "espaBanner": media("/Templates/Default/Images/e-bannerespa-el.jpg", prefer_original=False),
}

with open(os.path.join(CONTENT_DIR, "site.json"), "w", encoding="utf-8") as f:
    json.dump(site, f, ensure_ascii=False, indent=1)
with open(os.path.join(CONTENT_DIR, "categories.json"), "w", encoding="utf-8") as f:
    json.dump(categories, f, ensure_ascii=False, indent=1)
with open(os.path.join(CONTENT_DIR, "products.json"), "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=1)

print(f"{len(categories)} categories, {len(products)} products, {len(media_jobs)} media files")
with ThreadPoolExecutor(12) as ex:
    missing = [n for n, src in ex.map(fetch_media, media_jobs.items()) if src is None]
print("missing media:", missing)
