# Brinquedos vs. Pesadelos — ALFA v1.0.0

## Novidades da v1.0.0 — presença dos chefes

- Rei das Meias e Dama da Insônia anunciam a chegada com banners próprios.
- Chefes recebem aura radial e aro animado de destaque durante a batalha.
- A aura fica atrás do personagem e é puramente visual: não muda hitbox, velocidade, vida, dano ou comportamento.
- Efeitos respeitam a opção de movimento reduzido.
- Preservados os 20 níveis existentes, três capítulos, IDs, economia, ondas, balanceamento e salvamento local.

**Validação:** testes de regressão para anúncio dos dois chefes adicionados. A execução integral dos testes e o playtest no navegador ainda precisam ser confirmados pelo CI após o push.

## Novidades da v0.9.0 — brinquedos com personalidade

- Braços articulados e mãos com balanço próprio em todas as unidades durante a espera.
- Recuo do corpo e braços acompanham a ação de disparo, sem alterar cadência, dano ou alcance.
- Abajur recebe pulsação de luz e brilho de produção; atiradores, gelo, confetes e projéteis especiais recebem flashes de ação.
- Móbile musical ganha notas flutuantes e a Caixa Surpresa pulsa quando armada.
- Efeitos respeitam a opção de movimento reduzido; animações usam o relógio já existente da partida.
- Mantidos IDs, economia, grade, ondas, fases, balanceamento e chave de salvamento.

**Validação:** testes automatizados de lógica existentes mantidos; execução de Node.js e playtest real ainda pendentes nesta sessão.



## Novidades da v0.8.0 — salto de apresentação cartoon

- Animação de caminhada com braços articulados e passada alternada nos pesadelos; ataques projetam os braços e o corpo reage ao dano.
- Expressões faciais dinâmicas: olhar acompanha a ação, piscadas, sobrancelhas de alerta/raiva, boca de ataque e reação de derrota.
- Derrota com rotação e deformação caricata, sem alterar hitboxes nem regras de combate.
- Partículas com halo luminoso, núcleo e brilho animado; cenário recebe novos objetos decorativos e textura artesanal no tabuleiro.
- Brinquedopédia substitui emojis por um atlas vetorial original com 22 ilustrações (11 brinquedos e 11 pesadelos), escaláveis e sem dependências externas.
- Preservados grade 5×9, regras, fases, balanceamento, IDs e salvamento existente.

**Validação:** os testes de lógica existentes foram preservados; a execução local automatizada e o playtest em dispositivos ainda precisam ser realizados antes de declarar a versão sem regressões.



**20 fases, três capítulos em desenvolvimento.** O Capítulo 2 agora termina na fase 2-8, contra a Dama da Insônia.

## Novidades da v0.7.0

- Miniaturas desenhadas dos brinquedos nas cartas de seleção.
- Iluminação ambiente, vinheta suave, poeira flutuante e moldura de tabuleiro refinada.
- Sombras radiais, brilhos especulares, rastros de projéteis e impactos mais luminosos.
- Interface com acabamento em camadas e destaque visual na carta selecionada.

## Histórico — v0.6.0

- Quatro fases novas: 2-5, 2-6, 2-7 e 2-8.
- Novos brinquedos: **Móbile Musical** (paralisa até 3 faixas) e **Estilingue de Estrelas** (dano em faixas vizinhas).
- Novos pesadelos: **Aranha do Estrado** (teias), **Despertador Zangado** (acelera ferido), **Dama da Insônia** (chefe com reforços).
- Progresso existente preservado e modo offline atualizado para v0.6.0.
- Testes automatizados de campanha, novos poderes e saves.


Jogo 2D original de defesa por faixas, com jogabilidade acessível no estilo dos clássicos de estratégia de tabuleiro. Funciona em navegador de PC e celular, sem dependências externas ou instalação.

## Novidades da v0.4.0

- **Capítulo 1 completo com 8 fases** (antes eram 3). O confronto da 1-8 é contra o **Rei das Meias**.
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

Esta é uma **ALFA jogável** com os capítulos 1, 2 e início do 3. O projeto completo do `GDD.md` prevê 40 fases, mais personagens, capítulos, minigames e melhorias. Os desenhos ainda são procedurais; não existe APK Android nativo. Ainda faltam playtests manuais extensivos e testes específicos em celulares reais.

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


## Capítulo 3 — O Corredor Rangente (v0.6.0)

Quatro fases novas (3-1 a 3-4), com portas que avisam a faixa reforçada cinco segundos antes da onda. Novos brinquedos: Arco de Elástico, que rebate em um segundo inimigo, e Caixa Surpresa, armadilha que explode perto de inimigos em até três faixas. Novo monstro Ladrão de Brilhos, que recolhe estrelas não coletadas, sem diminuir o saldo bancado. 20 fases, 11 brinquedos, 11 inimigos. Código modular, PWA offline e save bvp-save-v1 preservados. Validação em Android físico pendente.
