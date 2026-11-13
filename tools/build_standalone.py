#!/usr/bin/env python3
"""Gera um HTML independente para abrir diretamente no PC, sem rede.

As fontes continuam modulares dentro de src/.
"""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
modules=['config.js','data.js','save.js','audio.js','engine.js','render.js','main.js']
js='\n'.join((root/'src'/name).read_text(encoding='utf-8') for name in modules)
js=re.sub(r'(?m)^import\s+.*?;\s*$', '', js)
js=re.sub(r'(?m)^export\s+(?=(?:const|class|function)\s)', '', js)
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'src/style.css').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="./src/style.css" />',f'<style>\n{css}\n</style>')
html=html.replace('<script type="module" src="./src/main.js"></script>',f'<script>\n{js}\n</script>')
html=html.replace('<link rel="manifest" href="./manifest.webmanifest" />','')
html=html.replace('<link rel="icon" type="image/svg+xml" href="./assets/icon.svg" />','')
html=re.sub(r'<title>Brinquedos vs\. Pesadelos — v[0-9.]+</title>', '<title>Brinquedos vs. Pesadelos — Jogar Offline v0.9.0</title>', html)
path=root/'JOGAR-OFFLINE.html'
path.write_text(html,encoding='utf-8')
print(f'Criado: {path} ({path.stat().st_size} bytes)')
