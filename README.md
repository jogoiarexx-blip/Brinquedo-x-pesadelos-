# Brinquedos vs. Pesadelos — ALFA v0.4.0

Jogo 2D original de defesa por faixas, com jogabilidade acessível no estilo dos clássicos de estratégia de tabuleiro. Funciona em navegador de PC e celular, sem dependências externas ou instalação.

## Novidades da v0.4.0

- **Capítulo 1 completo com 12 fases** (antes eram 3). O confronto da 1-8 é contra o **Rei das Meias**.
- **5 brinquedos defensores:** Soldadinho Estalo, Abajur Pirilampo, Urso Travesseiro, **Pião de Geada** (lentidão) e **Canhão de Confetes** (dano em área).
- **5 inimigos:** Poeira Andante, Meia Zanzante, **Colcha Ambulante** (resistência), **Rabisco Corredor** (velocidade) e **Rei das Meias** (chefe).
- Ilustrações Canvas procedurais originais, novas partículas e efeitos sonoros, ajuste de dificuldade na 1-4.
- Saves da v0.1.0 **preservados**, com novas fases liberadas ao completar as anteriores. Nenhum progresso é apagado.
- 16 testes de regras, mecânicas e simulação de vitória, executáveis localmente.

## Como jogar

Escolha um brinquedo na barra superior e toque em uma casa vazia do tapete de 5 faixas × 9 colunas. Recolha estrelas de Brilhos para comprar defesas; o Abajur gera recursos adicionais. Cada faixa tem um trenzinho de emergência que funciona **uma única vez**. Defenda todas as linhas até vencer a última onda.

- Toque/clique: escolher carta, posicionar brinquedo e coletar Brilhos.
- Botão **Guardar**: remove uma defesa para liberar a casa (não devolve Brilhos).
- Teclas **1 a 5**: escolher uma carta; **Esc**: abrir/fechar pausa.
- No celular, prefira a orientação **horizontal**.

## Executar e publicar

**GitHub Pages:** publique `index.html`, `src/`, `assets/`, `manifest.webmanifest` e `sw.js` preservando a estrutura. Configure em *Settings → Pages → Deploy from a branch → main / (root)*. O app instala-se como PWA em navegadores compatíveis. O service worker versão v0.4.0 substitui o cache antigo para o jogo voltar a funcionar offline após a visita inicial.

**PC sem servidor:** abra `JOGAR-OFFLINE.html`, que inclui o JavaScript e o CSS necessários em um só arquivo (sem recursos externos). Se baixar apenas o `index.html`, será necessário também ter a pasta `src/`.

**Desenvolver:** execute `python3 -m http.server 8000` na pasta e abra `http://localhost:8000`. Não precisa de `npm install`.

**Testes:** execute `node --test tests/*.test.mjs` com Node.js 20+.

**Regenerar HTML offline:** `python3 tools/build_standalone.py`.

## Organização

| Arquivo | Responsabilidade |
| --- | --- |
| `src/data.js` | Brinquedos, inimigos, fases e ondas |
| `src/engine.js` | Simulação determinística a 30 Hz, tiros, Brilhos, condições de vitória |
| `src/render.js` | Desenhos 2D Canvas, efeitos de personagens e chefes |
| `src/main.js` | Menus, UI, input mobile/PC, loop fixo |
| `src/audio.js` | Sons e música procedurais originais |
| `src/save.js` | Saves, estrelas e desbloqueios |
| `src/config.js` | Dimensões e grade |
| `tests/engine.test.mjs` | Regressões e estratégias automatizadas |
| `sw.js` | Cache offline do PWA |

## Escopo e próximos passos

Esta é uma **ALFA jogável** com o capítulo 1. O projeto completo do `GDD.md` prevê 40 fases, mais personagens, capítulos, minigames e melhorias. Os desenhos ainda são procedurais; não existe APK Android nativo. Ainda faltam playtests manuais extensivos e testes específicos em celulares reais.

## Novidades da versão 0.3.0

- Animações 2D de recuo quando as defesas disparam, mordidas dos monstros e desaparecimento suave após derrota.
- Ondas de impacto para projéteis, gelo, confetes e ataques; mensagens flutuantes ao coletar Brilhos e colocar defesas.
- Barra de vida do Rei das Meias durante a batalha final.
- Botão de tela cheia no menu e no jogo (incluindo tecla `F`); melhor dimensionamento no celular em modo paisagem.
- Animações de vitória/derrota respeitando o modo de movimento reduzido.
- Mantido o mesmo salvamento (`bvp-save-v1`), grade, custo dos brinquedos e balanceamento de ondas.

A orientação forçada de tela cheia depende do suporte do navegador; se não houver suporte, o jogo permanece utilizável.


## Capítulo 2 — Debaixo da Cama (v0.4.0)

Quatro novas fases (2-1 a 2-4), cenário noturno redesenhado, Carrinho Cometa (atravessa dois inimigos), Boneca Soninho (imobiliza temporariamente), Pula-Pula da Cama (salta uma defesa) e Cabide Blindado (escudo absorve dano). Progresso antigo preservado: a fase 2-1 é desbloqueada depois de concluir 1-8.
