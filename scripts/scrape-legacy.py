"""Caches the legacy alfaglass.gr HTML for scripts/build-content.py.

Usage: python3 scripts/scrape-legacy.py [.legacy]
"""
import re, json, os, html, urllib.request, urllib.parse, time
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
BASE='https://alfaglass.gr'
import sys
OUT=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else '.legacy')
os.makedirs(OUT,exist_ok=True)
if not os.path.exists(OUT+'/home.html'):
    open(OUT+'/home.html','w',encoding='utf-8').write(urllib.request.urlopen(urllib.request.Request(BASE+'/el/',headers=UA)).read().decode('utf-8'))
UA={'User-Agent':'Mozilla/5.0'}
def get(path):
    url=BASE+urllib.parse.quote(path,safe='/:?=&')
    fn=OUT+'/pages/'+re.sub(r'[^A-Za-z0-9]+','_',path)+'.html'
    os.makedirs(OUT+'/pages',exist_ok=True)
    if os.path.exists(fn): return open(fn,encoding='utf-8').read()
    for i in range(3):
        try:
            s=urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=30).read().decode('utf-8')
            open(fn,'w',encoding='utf-8').write(s); return s
        except Exception as e: print('ERR',path,e); time.sleep(1)
    return ''
home=open(OUT+'/home.html',encoding='utf-8').read()
paths=set(re.findall(r'href="(/(?:\d+/el/[^"]+|\d+/|Product/\d+/Page/\d+/el/|Article/\d+/))"',home))
paths|={'/47/','/46/','/75/','/60/','/82/','/83/','/84/'}
def clean(el):
    for t in el.select('script,style,.fancybox.icon,#NotificationsContainer'): t.decompose()
    return el
def parse(path):
    s=get(path); 
    if not s: return None
    soup=BeautifulSoup(s,'html.parser')
    h1=soup.select_one('.main-title h1')
    hero=soup.select_one('.header-main-photo')
    heroimg=re.search(r"url\('([^']+)'\)",hero.get('style','')) if hero else None
    crumbs=[a.get_text(strip=True) for a in soup.select('.breadcrumb a')]
    content=soup.select_one('.Layout-FullRow.content')
    d={'path':path,'title':h1.get_text(' ',strip=True) if h1 else None,'hero':heroimg.group(1) if heroimg else None,'crumbs':crumbs}
    if content:
        clean(content)
        txt=content.select_one('.page-text') or content.select_one('.product-description')
        d['html']=str(txt) if txt else None
        d['text']=txt.get_text('\n',strip=True) if txt else None
        imgs=[]
        for a in content.select('a.fancybox[href]'):
            h=a['href']
            if h not in imgs: imgs.append(h)
        for im in content.select('img[src]'):
            if not im.find_parent('a',class_='fancybox') and im['src'] not in imgs: imgs.append(im['src'])
        d['images']=imgs
        cards=[]
        for c in content.select('.subcategory-container, .product-item, .product-container, [class*=product-list] .item'):
            a=c.select_one('a[href]'); im=c.select_one('img'); t=c.select_one('.title')
            desc=c.select_one('.description')
            cards.append({'href':a['href'] if a else None,'img':im['src'] if im else None,'title':(t or a).get_text(' ',strip=True) if (t or a) else None,'desc':desc.get_text(' ',strip=True) if desc else None})
        d['cards']=cards
        files=[a['href'] for a in content.select('a[href]') if re.search(r'\.(pdf|docx?|xlsx?)$',a['href'],re.I)]
        d['files']=files
        d['raw']=content.get_text('\n',strip=True)[:20000]
    return d
with ThreadPoolExecutor(8) as ex: res=[r for r in ex.map(parse,sorted(paths)) if r]
# second pass: any linked paths found in cards not yet scraped
more=set()
for r in res:
    for c in r.get('cards',[]):
        h=c.get('href')
        if h and h.startswith('/') and h not in paths: more.add(h)
with ThreadPoolExecutor(8) as ex: res+= [r for r in ex.map(parse,sorted(more)) if r]
json.dump(res,open(OUT+'/content.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(len(res),'pages; extra',len(more))
