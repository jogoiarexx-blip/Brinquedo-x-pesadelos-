#!/usr/bin/env python3
"""Gera um HTML independente para abrir diretamente no PC, sem rede.

As fontes continuam modulares dentro de src/.
"""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
modules=['config.js','data.js','upgrades.js','save.js','audio.js','engine.js','render.js','main.js']
js='\n'.join((root/'src'/name).read_text(encoding='utf-8') for name in modules)
js=re.sub(r'(?m)^import\s+.*?;\s*$', '', js)
js=re.sub(r'(?m)^export\s+(?=(?:const|class|function)\s)', '', js)
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'src/style.css').read_text(encoding='utf-8')
html=re.sub(r'<link rel="stylesheet" href="\./src/style\.css(?:\?v=[0-9.]+)?" />',lambda _:f'<style>\n{css}\n</style>',html)
html=re.sub(r'<script type="module" src="\./src/main\.js(?:\?v=[0-9.]+)?"></script>',lambda _:f'<script>\n{js}\n</script>',html)
atlas=(root/'assets/codex-atlas.svg').read_text(encoding='utf-8')
atlas=re.sub(r'<svg\b[^>]*>', '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">', atlas, count=1)
html=html.replace('<body>',f'<body>\n{atlas}')
html=html.replace('./assets/codex-atlas.svg#','#')
html=html.replace('<link rel="manifest" href="./manifest.webmanifest" />','')
html=html.replace('<link rel="icon" type="image/svg+xml" href="./assets/icon.svg" />','')
html=re.sub(r'<title>Brinquedos vs\. Pesadelos — v([0-9.]+)</title>', lambda m: f'<title>Brinquedos vs. Pesadelos — Jogar Offline v{m.group(1)}</title>', html)
path=root/'JOGAR-OFFLINE.html'
path.write_text(html,encoding='utf-8')
print(f'Criado: {path} ({path.stat().st_size} bytes)')
