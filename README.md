# Brinquedos vs. Pesadelos — ALFA v0.1.0

Primeira versão **jogável** do jogo de defesa por faixas descrito em `GDD.md`.

## O que já está no jogo

- Menu principal, seleção das 3 primeiras fases do capítulo 1, instruções, enciclopédia, opções, pausa, vitória e derrota.
- Grade fixa 5×9, posicionamento por clique/toque, energia Brilhos, coletáveis naturais e produzidos por brinquedos.
- Três peças: Soldadinho Estalo, Abajur Pirilampo e Urso Travesseiro; efeitos visuais desenhados em Canvas (arte provisória, sem sprites prontos).
- Dois inimigos: Poeira Andante e Meia Zanzante; dano, animação, morte e ataque aos brinquedos.
- Ondas predefinidas, alerta de grande onda, trenzinho de emergência de uso único em cada faixa.
- Progresso e preferências salvos no `localStorage`.
- PWA básico: após a primeira visita em HTTPS e instalação do service worker, arquivos do jogo ficam em cache para jogar offline.
- Áudio simples sintetizado com a Web Audio API, sem arquivos sonoros de terceiros.

## Executar

**Na Web:** publique os arquivos mantendo a estrutura e abra o `index.html`. Ex.: repositório GitHub Pages. Não há build, `npm install` nem API externa.

**No PC:** abra um terminal dentro da pasta e execute `python3 -m http.server 8000`, depois acesse `http://localhost:8000`. O carregamento de módulos JavaScript pelo protocolo `file://` não é suportado por alguns navegadores.

**Testes:** `node --test tests/*.test.mjs` (Node.js 20+).

## Controles

- Selecionar carta no topo e clicar/tocar em uma casa do tapete.
- Tocar nas estrelas douradas para coletar 25 Brilhos.
- Ícone de vassoura remove peça; tecla Escape pausa; números 1 a 3 selecionam cartas.
- Na tela vertical, girar o celular para paisagem.

## Limites da versão

Este é um **protótipo vertical** das fases 1-1, 1-2 e 1-3, não o jogo final de 40 fases. Sprites são vetores desenhados por Canvas; não há ainda chefes, outros 17 brinquedos, capítulos restantes, minigames, balanceamento com jogadores reais nem app Android nativo. O GDD recomenda Phaser; nesta prova jogável usamos Canvas 2D modular, **sem dependências externas**, para facilitar execução e GitHub Pages. É possível migrar a renderização para Phaser mantendo as regras centrais.

## Arquitetura

- `src/config.js`: tamanho lógico, grade e funções de coordenadas.
- `src/data.js`: definições de unidades, inimigos e ondas das fases.
- `src/engine.js`: simulação da batalha, combate, economia, trenzinhos e vitória.
- `src/render.js`: ilustrações e efeitos visuais 2D.
- `src/main.js`: menus, toque/mouse, HUD, loop fixo de 30 passos/s.
- `src/save.js`: persistência de desbloqueios e opções.
- `src/audio.js`: trilha e efeitos sintetizados.
- `tests/engine.test.mjs`: verificações de regras do jogo.

**Jogar sem instalar nada:** se preferir abrir um arquivo HTML diretamente no navegador (sem servidor), use `JOGAR-OFFLINE.html`. Para gerar novamente após alterações, execute `python3 tools/build_standalone.py`.

## Próximos passos

1. Substituir arte procedural por atlas de sprites WebP originais com animações.
2. Balancear todas as fases no celular e adicionar tutorial guiado.
3. Concluir 1-4 a 1-8 com Mola, Carrinho, novos inimigos e Rei das Meias.
4. Perfis de qualidade / acessibilidade e interface mobile dedicada.
