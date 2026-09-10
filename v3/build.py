#!/usr/bin/env python3
"""Сборка версии 3: src/pages/*.html + src/{head,header,footer}.html -> v3/*.html.
Метаданные страницы в первых строках: <!-- title: ... --> <!-- description: ... -->
Запуск: python3 build.py (из папки site/v3/)"""
import pathlib, re, time
ROOT = pathlib.Path(__file__).parent
S = ROOT / "src"
head, header, footer = [(S / n).read_text() for n in ("head.html", "header.html", "footer.html")]
stamp = str(int(time.time()))
for page in sorted((S / "pages").glob("*.html")):
    src = page.read_text()
    meta = dict(re.findall(r"<!--\s*(\w+):\s*(.*?)\s*-->", src[:800]))
    body = re.sub(r"^(<!--.*?-->\s*)+", "", src, flags=re.S)
    h = head.replace("{{title}}", meta.get("title", "Старый завод")).replace("{{description}}", meta.get("description", ""))
    hd = header.replace('class="hdr"', 'class="hdr' + (' over' if meta.get("hero") == "dark" else ' solid fixed-solid') + '"')
    html = (h + hd + body + footer).replace('href="v3.css"', 'href="v3.css?v=' + stamp + '"').replace('src="v3.js"', 'src="v3.js?v=' + stamp + '"')
    (ROOT / page.name).write_text(html)
    print("built", page.name)
