# Brinquedos vs. Pesadelos — CAMPANHA v2.3.0

## Novidades v2.3.0 — QA no navegador, 3D mais confiável e pressão por fase

- **Cutscenes WebGL mais robustas:** tempo limite de 9 segundos para biblioteca/GLB, detecção de perda de contexto, estado diagnosticável e fallback SVG automático.
- **Movimento dos personagens em 3D mais natural:** leve balanço e flutuação do boneco, sem mudar o combate ou exigir modelos maiores.
- **Auditoria de navegador com Playwright:** Chromium desktop e viewport mobile emulado, GLBs carregados com Three.js 0.170 real, cenário sem CDN, acessibilidade de cutscenes e medidor de FPS. Arquivos de captura são anexados à execução de GitHub Actions. **Não é teste em Android físico.**
- **Mais informações antes de cada fase:** pico de inimigos programados em janela de 30 segundos, HP + escudo da programação e faixa com mais chegadas. A métrica é calculada exclusivamente das ondas e não pretende indicar dificuldade garantida nem invocações de chefes.
- **Fallback 2D permanece obrigatório e o modo GLB experimental segue desligado por padrão.** O HTML offline não depende de internet para jogar em 2D.
- Os **40 níveis**, 5 chefes, histórias, modo sobrevivência, Oficina, progresso e checkpoints anteriores estão preservados.

**Como validar:** `npm test`, `npm run audit`, `python3 tools/build_standalone.py`; para UI real, ver workflow `.github/workflows/browser-cinematic.yml` (instala Playwright + Three.js somente no ambiente de testes).



## Novidades da v2.2.0 — personagens GLB opcionais, FPS e auditoria

- **Quatro personagens 3D autorais, leves e animados em GLB 2.0:** Pião da Lia, Capitão Botão (soldadinho), Boneca Guarda-Chuva e Grande Bicho-Papão. Os arquivos estão em `assets/models/`, cada um com ~10 KB e animação Idle gravada.
- **3D é experimental, exclusivo das cutscenes e começa desligado.** Ative em **Opções → Personagens 3D nas cutscenes** para experimentar. Só slides com GLB próprio usam 3D; os demais mantêm arte 2D.
- A primeira sessão 3D requer acesso à biblioteca Three.js/GLTFLoader por CDN. Os modelos são locais. Se WebGL, CDN ou GLB falharem, **o SVG original permanece visível**. Os quatro GLBs não são baixados na abertura do jogo.
- Render 3D limitado a 30 FPS e pixel ratio 1,25, respeitando movimento reduzido; recursos gráficos e eventos de resize são liberados ao sair da cutscene. O modo **JOGAR-OFFLINE.html mantém 2D**, sem depender do CDN.
- **Medidor de desempenho (FPS) opcional:** ative em Opções para visualizar FPS médio e tempo médio de desenho na própria tela da batalha. Não altera velocidade nem regras do jogo.
- **Auditoria reproduzível:** `npm run audit` verifica as 40 fases, número/ordem das ondas, cinco chefes, total de HP+escudo, maior quantidade escalada em 30 segundos, desbloqueios, tempos e smoke test do motor. Tabelas saem no terminal.
- Testes validam os GLBs reais (cabeçalhos, buffers, geometria, animações), cenas, fallback, saves e HTML standalone. `npm test` permanece sem dependências externas.
- **40 fases, oito cenas C00–C07, cinco chefes, Oficina, baralhos, Sobrevivência e chave de save `bvp-save-v1` intactos.**
- Os testes automatizados **não substituem** teste real de renderização WebGL, GPU/memória no celular nem playtests de equilíbrio; consulte `docs/AUDITORIA_3D_DESEMPENHO_E_CAMPANHA_V2_2.md`.



## Novidades da v2.1.0 — Polimento cinematográfico, cinco chefes e acessibilidade

- **Cinco chefes com apresentação visual própria:** halos coloridos específicos por chefe, animações de ataque e descanso, HUD com estado de combate e cartão de apresentação ao chegar.
- **Vida do Grande Bicho-Papão dividida em três etapas visuais:** barras de saúde com limiares de transformação (67% e 34%), forma exibida na tela e indicação da janela de contra-ataque.
- **Telegráficos melhorados:** indicadores com tempo restante; a Tempestade da terceira forma destaca **ambas as faixas ameaçadas**, corrigindo a leitura do ataque secundário.
- **Cutscenes com direção de câmera:** enquadramentos à esquerda/direita, letterbox cinematográfico, cenário por capítulo, transições suaves e créditos com identidade visual própria.
- **Navegação acessível:** setas direita/esquerda, botão Anterior quando disponível, barra de progresso com informação para leitores de tela, botão Pular e modo de movimento reduzido.
- **Áudio original adicional:** chimes discretos de páginas e sinais exclusivos de entrada do chefe, aviso de ataque e transformação.
- Preservadas **40 fases, oito cenas C00–C07, cinco capítulos, modo Sobrevivência, Oficina, baralhos, saves legados e HTML offline**.
- Não há física 3D, novos modelos GLB ou WebGL nesta atualização; a direção visual continua 2.5D leve. **Playtest humano em Android e auditoria de desempenho real permanecem pendentes**.



## Novidades da v2.0.0 — A Noite dos Mil Bocejos: a campanha tem FINAL!

- **40 fases jogáveis em cinco capítulos completos:** 5-1 a 5-8 concluem a história da Lia e o Coração da Imaginação.
- Cenário onírico 2.5D com lua, estrelas, portais, profundidade pintada e efeitos de pulso de sonho, tudo em Canvas 2D e sem WebGL obrigatório.
- **Pulsos de sonho:** aviso de três segundos; depois seis segundos de sonho rápido (inimigos aceleram, brinquedos desaceleram) ou lento (inimigos desaceleram, brinquedos aceleram), alternadamente.
- **Bichinho Sonolento (T18):** adormece inimigos; **Bola-Ímã (T19):** puxa inimigos para trás; **Boneco de Neve de Algodão (T20):** desacelera; **Guitarrinha Desafinada (T21):** atinge três faixas e agiliza aliados; **Cavalinho de Madeira (T22):** ataca com projéteis que atravessam até três inimigos.
- Três novas criaturas comuns: **Pijama Sussurrante (E19)**, **Bocejo Corredor (E20)** e **Sombrinha do Escuro (E21)**.
- **Grande Bicho-Papão (E22):** chefe final com três formas conforme a vida diminui — Sussurro (atraso nas ações), Espelhos (invocação de inimigos) e Tempestade (dois projéteis de sombra). Todos os ataques são anunciados, seguidos de descanso vulnerável (+40% de dano).
- **Três cutscenes:** C05 apresenta o vilão antes de 5-8; C06 restaura a imaginação e mostra Lia acordando; C07 apresenta créditos e uma cena pós-créditos com Seu Pião. As cenas podem ser puladas ou revistas na galeria.
- Ao vencer 5-8, aparece **FIM DA CAMPANHA** com a opção de rever o final; a campanha continua repetível, a Oficina e a Noite Sem Fim permanecem disponíveis.
- Saves antigos de 24, 28 ou 32 fases continuam na mesma chave, sem redefinir estrelas, baralhos, melhorias ou histórias já vistas. Quem venceu 4-8 libera automaticamente 5-1.
- HTML independente offline, cache PWA, novas artes no Canvas e SVG, documentação e testes atualizados.
- **Pendente fora do escopo:** experimentos de cutscene 3D opcional e medições presenciais de FPS/memória em aparelhos móveis reais; nenhum desses recursos bloqueia a história 2D completa.



## Novidades da v1.9.0 — Capítulo 4 completo: Baronesa das Cortinas

- Campanha **32 de 40 fases**: conclusão de **4-5, 4-6, 4-7 e 4-8**, preservando os capítulos anteriores e o sistema de baralho.
- **Lencinho Invisível (T16)**, desbloqueado após 4-5, protege a si e brinquedos próximos, reduzindo 40% do dano recebido.
- **Tambor Fanfarrão (T17)**, desbloqueado após 4-6, causa dano e atordoamento breve nas três faixas adjacentes.
- **Retalho Escorregadio (E17)** troca de faixa uma vez, exigindo adaptação da defesa.
- **Baronesa das Cortinas (E18)** na fase 4-8, com barra de vida, anúncios claros da faixa atacada, projéteis de tecido, poeira adicional e descanso vulnerável (+45% de dano).
- Cutscene **C04** é exibida após vencer 4-8 e pode ser pulada ou revista em **📜 Histórias**, incluindo em saves anteriores com a fase concluída.
- Cinco cenas de história disponíveis no total (C00–C04); **C05–C07 e o Capítulo 5** continuam planejados.
- Artes Canvas e atlas SVG novos; salvamentos v1.8.0 com vitória 4-4 liberam 4-5 sem perder estrelas, upgrades, baralhos, cenas ou recordes.
- GitHub Pages, service worker e HTML independente offline atualizados juntos; cenário 2.5D preservado. Não há WebGL obrigatório.



## Novidades da v1.8.0 — Sótão Esquecido (parte 1) e cenários com profundidade

- Campanha passou de **24 para 28 fases**, com **4-1, 4-2, 4-3 e 4-4**. Os capítulos 1–3 seguem sem alteração de ondas, custos e personagens.
- Cenário exclusivo do Sótão com vigas, feixe de lua, lanternas, caixas, cortinas e tapete 5×9 em camadas 2.5D no Canvas, sem bibliotecas externas.
- Camadas de iluminação e perspectiva leves nos capítulos existentes, com efeito estático quando redução de movimento está ativa.
- Novo obstáculo: **casas empoeiradas reduzem em 15% a cadência de ação** do brinquedo colocado nelas; nunca impedem a colocação.
- **Boneca Guarda-Chuva (T13):** limpa poeira numa área 3×3 ao ser posicionada e repara aliados próximos a cada 9,5 segundos.
- **Sombrinha Assobiadora (T14):** dano e lentidão na própria faixa e nas vizinhas, a alcance limitado.
- **Robô de Lata Desajeitado (T15):** resistente e dispara munição que perfura até dois inimigos.
- **Traça do Sótão (E15)** e **Baú Saltitante (E16)** entram no bestiário com desenhos próprios e padrões existentes de teia e salto.
- Saves da v1.7.0 que terminaram 3-8 abrem automaticamente 4-1, preservando estrelas, upgrades, baralhos, cenas vistas e recordes.
- Prévia da fase indica as casas empoeiradas; cache PWA e arquivo offline preservados e testados.
- **Nota histórica da v1.8.0:** 4-5 a 4-8 e Baronesa ainda eram pendentes naquela versão; foram implementadas na v1.9.0. Capítulo 5 continua futuro.



## Novidades da v1.7.0 — Primeiras cutscenes de história

- Abertura C00 de quatro quadros antes da primeira partida 1-1.
- Três interlúdios C01–C03 após vencer os chefes dos capítulos 1, 2 e 3.
- Histórias com ilustração em camadas 2D, legendas, avanço, pular, seta direita e movimento reduzido.
- Nova opção `📜 HISTÓRIAS` para rever cenas desbloqueadas; saves antigos já concluídos liberam a visualização.
- Cenas vistas ficam guardadas no save atual sem gerar estrelas ou mudar progressão.
- Sem 3D em tempo real nesta etapa; gráficos 2.5D e capítulos 4/5 continuam planejados.
- Jogo online, PWA e HTML offline com os mesmos conteúdos; novos testes de continuidade e regressões.



> **Checkpoint oficial do começo da expansão:** [snapshot v1.6.0](docs/CHECKPOINT_2026-11-17_V1_6_0.md), branch `checkpoint/v1.6.0-2026-11-17-antes-campanha-2p5d`. **Plano de produção aprovado:** [GDD canônico v2](docs/GDD_CANONICO_V2_CAMPANHA_2P5D.md). O jogo permanece com 24 fases; cutscenes, capítulos 4/5 e 2.5D estão planejados, não lançados.


## Novidades da v1.6.0 — Modo Sobrevivência / Noite Sem Fim

- **♾ Modo Sobrevivência** é liberado ao vencer a fase 1-8, sem modificar as 24 fases da campanha.
- Ondas determinísticas a cada 17 segundos, mais inimigos, resistência progressiva e chefes a cada dez ondas.
- **Rei das Meias**, **Dama da Insônia** e **Vovô Poeirão** aparecem em rotação nas ondas de chefes.
- Preparação com até seis brinquedos já desbloqueados e bônus permanentes da Oficina.
- Recordes locais de maior onda alcançada, inimigos derrotados, pontuação e tempo, além do número de tentativas.
- O jogador pode encerrar e registrar a tentativa pelo menu de pausa; o fim por derrota registra automaticamente.
- Campanha, stars, upgrades, baralhos da campanha e chave `bvp-save-v1` foram mantidos.
- Não há estrelas extras por sobrevivência, impedindo farm de melhorias permanentes.
- Jogo online, HTML independente offline e PWA atualizados conjuntamente.

## Novidades da v1.5.0 — Seis brinquedos escolhidos por você

- **Monte seu baralho** na tela Preparar defesa, escolhendo de 1 a 6 brinquedos já desbloqueados e pelo menos um atacante.
- Cada carta mostra arte, custo em Brilhos e nível da Oficina; ★ marca a sugestão original da fase.
- Seis espaços mostram as unidades escolhidas. Use Salvar, Restaurar padrão ou Começar com este baralho.
- O motor aplica realmente a seleção às cartas, custos, recargas e atalhos 1 a 6 do PC.
- Escolhas são salvas por fase no mesmo `localStorage`, preservadas após recarregar, reiniciar e continuar.
- O botão Jogar do mapa usa o baralho salvo ou a equipe original se não houver personalização.
- Arquivos de saves antigos permanecem compatíveis; escolhas inválidas, repetidas ou não desbloqueadas são descartadas.
- Todas as ondas, 24 fases, chefes, custos, estrelas e upgrades permanentes permanecem iguais.

## Novidades da v1.4.0 — Preparação de fase

- Tela opcional **🔎 Preparar defesa** no mapa para cada fase desbloqueada.
- Mostra os pesadelos previstos nas ondas, suas quantidades, habilidades e chefes, sem revelar fases bloqueadas.
- Apresenta o conjunto de brinquedos, custo, nível permanente, recompensa e dica estratégica.
- Avisos antecipados de portas nas fases do Corredor Rangente.
- **Jogar agora** continua disponível no mapa; nova tela só abre quando solicitada.
- Nenhuma regra de combate, estrela, economia ou chave de salvamento foi alterada.
- Validação automática para as 24 fases e inclusão no PWA e HTML offline.

# Brinquedos vs. Pesadelos — ALFA v1.3.0

## Novidades da v1.3.0 — Corredor Rangente completo

- **24 fases e três capítulos completos**: novas fases 3-5, 3-6, 3-7 e 3-8.
- **Relógio Cuco** desacelera três faixas próximas; pode ser evoluído com estrelas na Oficina.
- **Fantasma Enrolado**, **Poeirinhas Espirradas** e **Vovô Poeirão** com desenhos e retratos próprios.
- Chefe alterna rajada contra tiros leves e invocação de mini-poeiras, com aviso e descanso para contra-atacar.
- Quem terminou a antiga fase final 3-4 recebe acesso à 3-5, preservando estrelas e melhorias.
- **77 testes aprovados**, incluindo as quatro novas fases vencidas sem upgrades e regressões das 20 anteriores.
- Imports, atlas, cache PWA e HTML independente atualizados juntos.

[Regras, validação e limites desta entrega](docs/CAPITULO_3_V1_3.md).

## Correção v1.2.1 — atualização confiável

- CSS e módulos usam URLs com versão, evitando mistura de código antigo com tela nova.
- Instalação do PWA pede os arquivos com cache HTTP renovado.
- 63 testes de lógica/renderização/cache aprovados.

## Novidades da v1.2.0 — Oficina de estrelas

- **Oficina dos Brinquedos** no menu, mapa e resultado da vitória: evolua os 11 brinquedos até o nível 4.
- Use as estrelas das fases em melhorias permanentes: custos de 2, 4 e 6 estrelas. Pontuação do mapa preservada.
- Vida e dano melhorados; Abajur produz mais rápido, gelo e sono duram mais. Custos de colocação e ondas preservados.
- Estrelas dos saves antigos são aproveitadas. Rejogar só rende a diferença para o melhor resultado.
- Redistribuição gratuita devolve as estrelas sem apagar progresso.
- Compras protegidas contra falha de armazenamento e saves inválidos.
- Corrigida a aleatoriedade: desligar partículas não altera a sequência de Brilhos ou combate.
- HTML offline inclui o atlas de retratos; cache PWA e standalone atualizados.

**Análise completa, regras e pendências do GDD:** [docs/ANALISE_E_MELHORIAS.md](docs/ANALISE_E_MELHORIAS.md).

**Validação:** `node --test tests/*.test.mjs`; `python3 tools/build_standalone.py`. Playtest opcional com Playwright: `node tools/browser_smoke.mjs`, com servidor local em 8000. Playwright não é dependência do jogo.

## Novidades da v1.1.0 — qualidade e desempenho

- Alternância 1×/2× para o ritmo das partidas, mantendo as regras e a simulação a 30 Hz.
- Contador regressivo da próxima onda na interface.
- Fantasma do brinquedo e indicação visual de faixa ou área antes do posicionamento.
- Fundos estáticos dos três capítulos reutilizados por cache Canvas para economizar renderização.
- Configuração de movimento reduzido evita gerar partículas e impactos extras.
- Service worker renovado: navegação busca atualizações online antes de usar cache offline.
- HTML offline atualizado e chave `bvp-save-v1` preservada.
- As 20 fases e seu balanceamento permanecem iguais.

**Validação:** testes novos para prévia e efeitos; conferir CI e testar em dispositivos reais após a publicação.

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
