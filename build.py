#!/usr/bin/env python3
"""Собирает статические страницы: src/pages/*.html + src/partials/{head,header,footer}.html -> site/*.html.

Страница начинается с блока метаданных:
    <!-- title: ... -->
    <!-- description: ... -->
Запуск: python3 build.py   (из папки site/)
"""
import pathlib, re, time

STAMP = str(int(time.time()))  # cache-busting for css/js

ROOT = pathlib.Path(__file__).parent
P = ROOT / "src" / "partials"
head, header, footer = [(P / n).read_text() for n in ("head.html", "header.html", "footer.html")]

for page in sorted((ROOT / "src" / "pages").glob("*.html")):
    src = page.read_text()
    meta = dict(re.findall(r"<!--\s*(\w+):\s*(.*?)\s*-->", src[:600]))
    body = re.sub(r"^(<!--.*?-->\s*)+", "", src, flags=re.S)
    h = head.replace("{{title}}", meta.get("title", "Старый завод")).replace("{{description}}", meta.get("description", ""))
    html = (h + header + body + footer).replace("assets/css/style.css", "assets/css/style.css?v=" + STAMP).replace("assets/js/main.js", "assets/js/main.js?v=" + STAMP)
    (ROOT / page.name).write_text(html)
    print("built", page.name)
