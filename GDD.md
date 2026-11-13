# BRINQUEDOS VS. PESADELOS
## Game Design Document (GDD) — Versão 1.0

> **Proposta:** tower defense 2D por linhas, com humor, progressão clara e partidas rápidas, inspirado no ritmo acessível do *Plants vs. Zombies* clássico (2009), mas com universo, personagens, apresentação e interações próprios.
>
> **Status:** documento de pré-produção. Os valores de balanceamento são pontos de partida, não resultados de playtest.

---

## 1. RESUMO EXECUTIVO

| Item | Definição |
|---|---|
| Nome de trabalho | **Brinquedos vs. Pesadelos** |
| Gênero | Tower defense casual 2D, baseado em linhas e grade |
| Perspectiva | Lateral 2D, campo inteiro visível |
| Plataformas | Navegadores desktop, GitHub Pages, Android via PWA |
| Público | A partir de 8 anos; jogadores casuais e fãs de estratégia |
| Controle | Mouse ou toque; sem necessidade de teclado |
| Partida | 3–6 minutos (fase comum); 7–10 minutos (chefes) |
| Campanha | 5 capítulos, 40 fases, 5 chefes (primeira versão completa) |
| Direção de arte | Cartoon 2D desenhado, silhuetas claras, humor pastelão |
| Monetização | Sem anúncios obrigatórios ou pay-to-win no escopo inicial |
| Idiomas | Português do Brasil; textos preparados para localização |

**Fantasia principal:** quando a luz do quarto se apaga, brinquedos despertam e organizam uma resistência contra pesadelos bagunceiros que querem roubar a imaginação das crianças. O jogador é o estrategista que comanda essas defesas.

**O que deve lembrar o PvZ original:** grade fácil de ler, posicionamento simples, gerenciamento de recurso, inimigos surgindo em ondas, variedade de peças, progressão fase a fase, humor visual, momentos de tensão e minigames.

**O que não copiar:** nomes, desenhos, personagens, sons, mapas, texto, interface ou animações específicas da franquia. A proposta é capturar o *gênero e a sensação*, não reproduzir conteúdo autoral.

### 1.1 Pilares obrigatórios

1. **Entender em 30 segundos:** arrastar/selecionar brinquedo, escolher casa, coletar Brilhos, impedir a invasão.
2. **Decisões constantes e legíveis:** economizar, construir, proteger, contra-atacar.
3. **Humor e simpatia:** monstros expressivos; derrota engraçada, sem gore ou terror pesado.
4. **Novidade gradual:** cada fase introduz uma regra, inimigo ou ferramenta sem sobrecarregar.
5. **Desempenho estável:** celular intermediário e navegador, assets compactos, sem travamentos de entrada.

### 1.2 Fora de escopo inicial

Sem mundo aberto, exploração livre, crafting, crafting de armas, RPG, câmera 3D, batalha automática sem posicionamento, multiplayer online, gacha, energia para limitar tentativas ou upgrades que exijam grind.

---

## 2. UNIVERSO, TOM E PERSONAGENS

### 2.1 Premissa

Toda meia-noite, a Porta do Armário se abre e os Pesadelos escapam para roubar o **Coração da Imaginação**, escondido atrás da cama. Os brinquedos da pequena Lia criam uma linha de defesa. O mentor é **Seu Pião**, um pião antigo que fala demais, usa óculos tortos e inventa planos desastrosamente engraçados.

O conflito tem escala de desenho animado: almofadas explodem em plumas, monstros tropeçam em cadarços, brinquedos protestam quando são atacados. Nunca apresentar monstros realmente traumáticos.

### 2.2 Elenco

- **Lia:** a criança, vista apenas em cenas curtas e ilustrações; não precisa de IA.
- **Seu Pião:** tutor cômico, aparece em quadrinhos, diálogos de 1–2 linhas e tela de desbloqueio.
- **Capitão Botão:** soldadinho de pano que ensina combate e introduz a história.
- **O Grande Bicho-Papão:** vilão teatral, vaidoso e incompetente, comandante do capítulo final.

### 2.3 Narrativa de campanha

Abertura curta, historinhas em 2–3 quadros nos fins de capítulo, reações dos monstros e encerramento animado de até 45 s. **Diálogo nunca bloqueia partidas repetidas:** pode pular integralmente.

---

## 3. LOOP CENTRAL DE JOGO

1. Visualizar a pista, a direção da invasão e os inimigos previstos.
2. Selecionar até **6 cartas de brinquedo** no início; ampliar até **8** com a progressão.
3. A partida começa com **150 Brilhos** (padrão; ajustável por fase).
4. Brilhos aparecem no campo e alguns brinquedos também os produzem.
5. Comprar um brinquedo consome Brilhos e ativa a recarga da carta.
6. O brinquedo permanece na casa até ser destruído ou retirado; age automaticamente.
7. Inimigos avançam da direita para a esquerda e atacam a primeira defesa encontrada.
8. Sobreviver às ondas e à última invasão para vencer e desbloquear a fase seguinte.

**Sensação buscada:** começar com poucas escolhas, sentir uma pequena pressão, construir um plano visível, responder a uma surpresa e vencer com satisfação.

### 3.1 Campo principal

- **5 faixas horizontais x 9 colunas = 45 casas**.
- Inimigos entram pela direita; o Coração da Imaginação fica à esquerda.
- Cada casa aceita **um brinquedo principal**. Algumas unidades de suporte podem gerar efeito em área sem ocupar casas extras.
- Proibido posicionar na coluna de chegada dos inimigos em fases que bloqueiem explicitamente a coluna; a regra deve ser sinalizada visualmente.
- Primeiro protótipo: campo fixo, sem câmera, sem zoom necessário para jogar.
- Botão de pá/guardar remove a peça sem reembolso (salvo habilidade explícita).

**Proteção contra erro inicial:** cada faixa começa com um **Trenzinho de Emergência**. Uma única vez por partida, quando um inimigo que avançou até a extremidade esquerda encosta nele, o trenzinho percorre a faixa, elimina os inimigos presentes e é consumido. Se outro inimigo atravessar depois disso, a partida termina.

### 3.2 Brilho: recurso

- Ícone: pequenas estrelas douradas em forma de pecinhas de encaixe, não sóis.
- Brilho caindo do cenário: valor padrão **25**, intervalo pseudoaleatório **9–13 s**, coletável por **8 s**.
- Primeira coleta: após ~6 s.
- Exibir brilho numérico inteiro no HUD; cada coleta tem feedback sonoro e visual.
- Brilho vindo de brinquedos: produção determinada pela carta, em média a cada 20–26 s.
- Sem perda de recurso ao fim da fase; recursos não persistem entre fases.
- No toque: hitbox de coleta maior que a imagem, mínimo 44 px CSS.

### 3.3 Regras de combate

- Cada inimigo possui `hp`, velocidade em casas/s, intervalo de ataque, dano por acerto, tags e eventuais habilidades.
- Cada brinquedo possui `custo`, `recarga`, `hp`, `alvo`, `intervalo_acao` e efeito.
- Alcance por linha, célula ou área é representado com ícone claro.
- Projéteis colidem com o **primeiro alvo válido** da faixa, salvo descrição de perfuração.
- Ao cair a 0 HP, brinquedo sai de cena com animação curta; inimigo sai com derrota cômica.
- Velocidade base de inimigo comum: **0,30 casa/s**; atravessar uma faixa sem oposição leva dezenas de segundos, permitindo reação.
- Pausa congela simulação, cronômetros de cartas, efeitos e geração de ondas.

### 3.4 Balanceamento preliminar

| Parâmetro | Base sugerida |
|---|---:|
| Brilho inicial | 150 |
| Brilho coletável | 25 |
| Tempo de uma onda inicial | 35–60 s |
| Duração fase tutorial | 2–3 min |
| Duração fase comum | 3–6 min |
| HP do monstro comum | 100 |
| Dano básico do atacante | 20 |
| Intervalo do atacante básico | 1,5 s |
| HP do bloqueador padrão | 650 |
| Velocidade do monstro comum | 0,30 casa/s |
| Tempo de recarga de peça básica | 6 s |
| Velocidade da simulação | 30 atualizações fixas/s |
| Renderização alvo | 60 fps (30 fps como modo econômico) |

> Não fazer tuning apenas por números. Medir perdas de faixa, quantidade de recursos ociosos, tempo morto, excesso de projéteis e taxa de vitória por fase.

---

## 4. CATÁLOGO DE BRINQUEDOS

**Diretriz de design:** cada cartão deve explicar sua função visualmente: ataca, protege, produz, controla, explode ou faz uma surpresa. Os brinquedos têm personalidade e sua própria maneira de disparar — tampinhas, bolhas, confete, ruídos, elásticos, engrenagens.

`CD` = recarga de colocação. Custos e HP sujeitos a testes.

| ID | Brinquedo | Custo | CD | Função e comportamento |
|---|---|---:|---:|---|
| T01 | **Abajur Pirilampo** | 50 | 7 s | Produz 25 Brilhos a cada 22 s; 100 HP |
| T02 | **Soldadinho Estalo** | 100 | 6 s | Atira bolinhas de papel: 20 dano/1,5 s em linha; 120 HP |
| T03 | **Urso Travesseiro** | 50 | 18 s | Bloqueio de 650 HP; reage com caretas ao levar dano |
| T04 | **Mola Saltitante** | 75 | 12 s | Empurra o primeiro inimigo 1,5 casa para trás; CD interno 9 s |
| T05 | **Patinho Borrifador** | 125 | 7 s | Jato d'água: 14 dano/1,1 s; desacelera 20% por 2 s |
| T06 | **Carrinho Turbinado** | 125 | 22 s | Dispara pela faixa atingindo múltiplos alvos (50 dano) e sai do campo |
| T07 | **Tambor Fanfarrão** | 150 | 15 s | Fortalece ataque de brinquedos aliados adjacentes em 20%; não acumula |
| T08 | **Pião Furacão** | 150 | 12 s | Giratório curto alcance: atinge inimigos na célula e frente com 18 dano/0,7 s |
| T09 | **Arco de Elástico** | 175 | 10 s | Tiro lento perfurante: 65 dano/3,4 s em até 3 inimigos |
| T10 | **Caixa de Confete** | 75 | 24 s | Armadilha de uso único: 120 dano em pequena área após 1,8 s de preparo |
| T11 | **Bichinho Sonolento** | 100 | 15 s | Faz um alvo dormir 4 s; não afeta chefes |
| T12 | **Bola-Ímã** | 125 | 14 s | Retira armaduras metálicas de certos inimigos na mesma faixa; não causa dano |
| T13 | **Boneca Guarda-Chuva** | 100 | 18 s | Protege brinquedos adjacentes contra projéteis aéreos; 280 HP |
| T14 | **Robô de Lata Desajeitado** | 200 | 12 s | Dois disparos alternados: 18 dano cada/1,8 s; 160 HP |
| T15 | **Foguete de Festa** | 225 | 28 s | Explosão única em área 3x3: 180 dano; preparo 2 s |
| T16 | **Relógio Cuco** | 175 | 20 s | Atrasa temporariamente inimigos numa área 3x1 por 35%, por 5 s, CD interno 18 s |
| T17 | **Cavalinho de Madeira** | 125 | 15 s | Investida curta quando o inimigo se aproxima: 90 dano e retorno à casa; CD 10 s |
| T18 | **Boneco de Neve de Algodão** | 150 | 12 s | Dispara flocos: 12 dano/1,3 s; aplica lentidão de 35% por 3 s |
| T19 | **Guitarrinha Desafinada** | 175 | 20 s | Pulso sonoro em todas as 5 faixas, dano 12 a cada 8 s, 180 HP |
| T20 | **Baú Surpresa** | 75 | 15 s | Armadilha cômica: ao contato, sorteia empurrão, stun ou dano pequeno; resultados previsíveis em chances divulgadas |

### 4.1 Classes e leitura visual

- **Produtor:** amarelo; forma amigável; efeito de estrela.
- **Atacante:** vermelho/laranja; postura voltada à direita.
- **Bloqueador:** azul; silhueta grande e fofa.
- **Controle:** lilás; partículas em ondas.
- **Armadilha:** laranja; ícone de explosão ou exclamação.
- **Suporte:** verde; auras discretas no piso.

Cores não podem ser o único marcador: adicionar ícones, silhuetas, padrões e textos.

### 4.2 Sinergias simples, não obrigatórias

1. Urso Travesseiro + Soldadinho: segurar invasão enquanto projéteis trabalham.
2. Patinho + Arco: desacelerar para que projéteis pesados atinjam alvos.
3. Tambor + Robô: mais dano, mas custa espaço e Brilho.
4. Bola-Ímã + Soldadinho: remover capacetes para baratear a defesa.
5. Mola + Armadilha: reposicionar monstro numa região perigosa.

Não criar fusão, árvore de tecnologia ou talentos no lançamento: a graça vem da escolha das peças.

---

## 5. BESTIÁRIO DOS PESADELOS

**Ameaças divertidas:** monstros parecem bolinhas de poeira, meias vivas, sombras de cortina e bichos do armário. Nada de gore. Cada novo inimigo deve ter uma forma e uma reação reconhecíveis.

| ID | Inimigo | HP | Velocidade | Peculiaridade / Contrajogo |
|---|---|---:|---:|---|
| E01 | **Poeira Andante** | 100 | 0,30 | Básico; ideal para aprender |
| E02 | **Meia Zanzante** | 85 | 0,44 | Rápido e frágil; antecipar ataque |
| E03 | **Tampão de Lã** | 230 | 0,25 | Mais resistente; dano concentrado |
| E04 | **Capacete de Panela** | 400 | 0,22 | 220 HP são armadura metálica, removível por ímã |
| E05 | **Sombra Saltadora** | 130 | 0,34 | Salta a primeira peça ao se aproximar; bloqueio atrás dela |
| E06 | **Fantasma Enrolado** | 160 | 0,28 | Imune a empurrões, vulnerável a ataques sonoros |
| E07 | **Poeira em Dobro** | 170 | 0,26 | Ao morrer, libera 2 mini-poeiras de 35 HP |
| E08 | **Ladrão de Estrelas** | 150 | 0,36 | Quando chega perto de um Brilho solto, o rouba; coleta rápida |
| E09 | **Sombrinha Assobiadora** | 200 | 0,28 | Lança pequenos projéteis a cada 6 s; guarda-chuva protege |
| E10 | **Bicho do Sapato** | 300 | 0,20 | Mordida causa dano elevado a bloqueadores |
| E11 | **Lencinho Invisível** | 110 | 0,30 | Some por 2 s a cada 7 s; reaparece com pista visual |
| E12 | **Meia Patinadora** | 140 | 0,52 | Corre até atacar a primeira peça; então desacelera |
| E13 | **Bicho-Carrapicho** | 180 | 0,30 | Solta cola no brinquedo atingido, reduzindo velocidade de ataque |
| E14 | **Monstro de Saco** | 350 | 0,24 | Carrega dois mini-monstros; solta um ao perder 50% de HP |
| E15 | **Poeira Sonâmbula** | 190 | 0,33 | Imune ao sono e suscetível a empurrão |
| E16 | **Sombras Gêmeas** | 150 cada | 0,29 | Entram em duas faixas vizinhas sincronizadas |
| E17 | **Bicho-Relâmpago** | 180 | 0,40 | Avança duas casas em pequeno salto sinalizado; recarga longa |
| E18 | **Luva Agarradora** | 250 | 0,25 | Puxa bloqueador um quadrado para frente se estiver livre |
| E19 | **Senhor Pano Preto** | 500 | 0,20 | Inimigo de elite; protege outros num raio de uma casa contra debuffs |
| E20 | **Mini-Bicho-Papão** | 600 | 0,24 | Última elite da campanha: alterna armadura e pressa |

### 5.1 Regras de justiça

- Todo inimigo especial é introduzido sozinho ou em onda de baixíssimo risco.
- Avisos de habilidades devem ter antecedência perceptível de **0,5–1,2 s**.
- Habilidades não podem tornar defesa impossível sem ter oferecido pelo menos uma opção adequada.
- Blindagem, invisibilidade e salto nunca se combinam na primeira apresentação.
- Evitar grandes blocos de HP sem mecânica; ameaça deve ser legível, não apenas lenta de matar.

---

## 6. CINCO CAPÍTULOS, QUARENTA FASES

Cada capítulo tem **8 fases**, sendo a oitava um confronto especial com chefe. Introduzir mecânica nova nas fases 1, 3 e 5; verificar aprendizado nas fases 2, 4 e 6; clímax na 7; chefe na 8. A dificuldade vem das combinações, não de aumentar HP indiscriminadamente.

### Capítulo 1 — O Quarto Acordou (1-1 a 1-8)

**Ambiente:** cama, tapete, almofadas, prateleira, lua pela janela. Sem terreno especial. Música de caixinha alegre.

| Fase | Foco principal | Novidade/recompensa |
|---|---|---|
| 1-1 | Tutorial: Soldadinho e Brilho | Ensina colocar/atirar/coletar |
| 1-2 | Economia | Desbloqueia Abajur Pirilampo |
| 1-3 | Segurar uma faixa | Urso Travesseiro |
| 1-4 | Duas faixas com pressão alternada | Meia Zanzante |
| 1-5 | Primeiro combo de defesa | Mola Saltitante |
| 1-6 | Inimigo resistente | Tampão de Lã |
| 1-7 | Grande onda em cinco faixas | Carrinho Turbinado |
| 1-8 | **Chefe: Rei das Meias** | Desbloqueia Capítulo 2 e álbum |

### Capítulo 2 — A Sala de Brincadeiras (2-1 a 2-8)

**Ambiente:** carrinhos, blocos de montar, mural de desenhos. **Regra de terreno:** em algumas fases, 2 casas exibem peças espalhadas e não podem receber brinquedos até serem limpas por uma ação gratuita de 2 s de animação (apenas uma vez por casa). Nada de maze ou construção livre.

- 2-1: explicar casas ocupadas e botão de arrumar.
- 2-2: Patinho Borrifador.
- 2-3: Sombra Saltadora.
- 2-4: Pião Furacão.
- 2-5: Capacete de Panela e Bola-Ímã.
- 2-6: onda com armadura em duas faixas.
- 2-7: Foguete de Festa e variação de posicionamento.
- 2-8: **Chefe: Capitão Guarda-Roupa**, que ocupa parte de uma linha e libera mini-monstros.

### Capítulo 3 — O Corredor Rangente (3-1 a 3-8)

**Ambiente:** corredor comprido, quadros inclinados, relógio e pequenas luzes de rodapé. **Regra de terreno:** a cada ~40 s, uma porta no fundo faz barulho e avisa qual faixa receberá uma onda reforçada (telegráfica; nunca instantânea).

- 3-1: apresenta a porta como previsão de ameaça.
- 3-2: Arco de Elástico.
- 3-3: Ladrão de Estrelas.
- 3-4: Caixa de Confete.
- 3-5: Fantasma Enrolado.
- 3-6: Relógio Cuco.
- 3-7: três ondas de alta tensão com avisos claros.
- 3-8: **Chefe: Vovô Poeirão**, que espalha mini-poeiras depois de um espirro.

### Capítulo 4 — O Sótão Esquecido (4-1 a 4-8)

**Ambiente:** baús, lençóis pendurados, bicicletas antigas, teias de tecido, lanternas. **Regra de terreno:** há zonas de poeira: uma casa marcada reduz em 15% a velocidade do brinquedo colocado nela, até uma peça de suporte limpar a área ou até o jogador aceitar a penalidade. Sempre permitir vencer sem precisar de um item específico.

- 4-1: zona de poeira.
- 4-2: Boneca Guarda-Chuva.
- 4-3: Sombrinha Assobiadora.
- 4-4: Robô de Lata Desajeitado.
- 4-5: Lencinho Invisível.
- 4-6: Tambor Fanfarrão.
- 4-7: defesa mista contra projéteis e monstros rápidos.
- 4-8: **Chefe: Baronesa das Cortinas**, que alterna ataques lançados e invoca sombras.

### Capítulo 5 — A Noite dos Mil Bocejos (5-1 a 5-8)

**Ambiente:** o mesmo quarto transformado pelo sonho: nuvens, estrelas, móveis distorcidos, luz roxa suave. **Regra de terreno:** pulsos de sonho sinalizados a cada ~50 s mudam temporariamente a velocidade de todos os inimigos em 10–15%; duração máxima 7 s.

- 5-1: primeiro pulso de sonho.
- 5-2: Bichinho Sonolento.
- 5-3: Bola-Ímã em encontros híbridos.
- 5-4: Boneco de Neve de Algodão.
- 5-5: Guitarrinha Desafinada.
- 5-6: Cavalinho de Madeira e elite.
- 5-7: última batalha normal com todas as classes.
- 5-8: **Chefe Final: Grande Bicho-Papão**; apresentação cômica, três padrões distintos e cena final.

**Cartas extras:** Baú Surpresa e outra carta de utilidade podem ser prêmios opcionais de minigame/estrela, mas nunca essenciais para completar a história.

---

## 7. CHEFES: PADRÕES E CONTROLE

Regra global: chefe não deve ocupar a grade de forma que torne impossível posicionar defesas. Cada chefe tem **telegraph** (animação antes do ataque), ao menos duas respostas viáveis e resistência a stun de 70% ou imunidade com ícone visível. HP ilustrativo, ajustar ao DPS esperado da fase.

| Chefe | HP sugerido | Padrão A | Padrão B | Fraqueza / janela |
|---|---:|---|---|---|
| Rei das Meias | 1800 | Solta 3 Meias Zanzantes | Avança 1 casa com aviso | Para 4 s após tropeçar no próprio cadarço |
| Capitão Guarda-Roupa | 2400 | Derruba caixa em 1 casa telegrafada | Libera 2 monstros de saco | Fica aberto por 5 s após lançar caixas |
| Vovô Poeirão | 3000 | Espirro empurra projéteis leves | Solta nuvem de mini-poeiras | Parado 6 s ao pegar lenço |
| Baronesa das Cortinas | 3600 | Projétil lento numa faixa | Escudo de pano temporário | Escudo se abre depois do segundo disparo |
| Grande Bicho-Papão | 4800 | Troca a faixa de entrada entre 3 previstas | Invoca elites em duas faixas | Exausto depois de ataque longo; três estágios de animação |

**UI de chefe:** barra de vida abaixo do contador de ondas, nome legível, introdução curta e pulável. Ataques nunca surgem sem indicação visual e sonora.

---

## 8. SISTEMA DE ONDAS E DIFICULDADE

### 8.1 Estrutura de uma fase

- **Preparação:** primeiros 8–12 s sem invasão (fase 1-1 pode ser mais lenta).
- **Onda 1:** entrada suave, 1–3 inimigos.
- **Onda 2:** mescla básica de velocidade e resistência.
- **Onda 3:** necessidade de usar controle ou proteção.
- **Aviso de grande onda:** banner, som e 3 s de antecedência.
- **Onda final:** conjunto mais denso; com ícone de bandeira e progresso claro.
- **Vitória:** só quando **todos os inimigos remanescentes** foram derrotados e não há spawns pendentes.

### 8.2 Diretor de ondas baseado em dados

Definir as ondas num arquivo de configuração, em vez de gerar aleatoriamente toda a campanha. Gerador procedural apenas para sobrevivência infinita.

```json
{
  "id": "1-4",
  "arena": "quarto",
  "startingGlow": 150,
  "allowedToys": ["T01", "T02", "T03", "T04"],
  "laneCount": 5,
  "columnCount": 9,
  "waves": [
    { "at": 14, "enemies": [{ "type": "E01", "lane": 2 }] },
    { "at": 30, "enemies": [{ "type": "E01", "lane": 0 }, { "type": "E02", "lane": 4 }] },
    { "at": 52, "flag": true, "enemies": [{ "type": "E02", "lane": 1 }, { "type": "E01", "lane": 3 }] }
  ],
  "unlock": "T04"
}
```

A especificação acima é um **exemplo de formato**, não o nível 1-4 balanceado por playtest.

### 8.3 Curva de dificuldade

- 1-1 a 1-3: vitória esperada de jogador novo sem falha após orientação.
- 1-4 a 1-8: desafia economia e duas ameaças simultâneas.
- Capítulo 2: demonstra counters (defesa versus armadura/velocidade).
- Capítulo 3: ensina antecipação pela previsão de entrada.
- Capítulo 4: exige composições equilibradas.
- Capítulo 5: pede entendimento das unidades, não rapidez absurda.

**Evitar dificuldade artificial:** não forçar repetição de fase para comprar melhorias permanentes; não exibir inimigos fora de campo sem pistas; evitar RNG que determine vitória ou derrota.

---

## 9. MENU PRINCIPAL, INTERFACE E PAUSA

### 9.1 Fluxo completo

**Splash curto** → **Menu Principal** → **Seleção de capítulo / Continuar** → **Seleção de cartas** → **Partida** → **Vitória ou Derrota** → **Próxima fase / Reiniciar / Menu**.

### 9.2 Menu principal

- Título animado com letras macias, quarto de fundo, monstro espreitando o armário e Seu Pião falando em balões raros.
- Botões: **Jogar**, **Capítulos**, **Brinquedopédia**, **Minigames**, **Opções**, **Créditos**.
- **Continuar** substitui o botão principal após primeiro salvamento.
- Transições simples, cerca de 0,2–0,5 s; sem longos carregamentos artificiais.

### 9.3 Seleção de cartas

- Mostrar inimigos que aparecerão (ícones), não revelar toda a ordem.
- Oito espaços no máximo; no início só seis disponíveis e desbloqueio gradual.
- Cartão mostra nome, custo, tipo, recarga e frase curta.
- Caso de cartas de pré-seleção obrigatórias em tutoriais: sinalizar claramente.
- Layout responsivo: no celular, usar carrossel horizontal e painel dobrável para informações.

### 9.4 HUD da partida

- Topo esquerdo: estoque de Brilho.
- Topo: cartas com custo, estado da recarga e indisponibilidade.
- Topo direito: **Pausa**, **velocidade 1x/2x** (opcional após fase 1-8), áudio rápido.
- Parte inferior: barra das ondas e indicadores de bandeira, discretos.
- Seleção: contorno do cartão + prévia transparente da peça na casa.
- Efeitos importantes sempre legíveis; no celular, nenhum botão deve esconder a área central.

### 9.5 Pausa

**Continuar**, **Reiniciar fase** (com confirmação), **Opções**, **Como jogar**, **Menu principal** (confirmar se perde progresso da fase). Pausar também em `visibilitychange` quando aplicativo perde foco, sem continuar a simulação em segundo plano.

### 9.6 Opções

| Grupo | Opções |
|---|---|
| Áudio | Música 0–100%, efeitos 0–100%, silenciar |
| Vídeo | Qualidade Automático/Alto/Econômico, 60/30 fps |
| Acessibilidade | Reduzir movimento, flashes suaves, tamanho de UI, vibração desligada, modo alto contraste |
| Jogabilidade | Confirmação de remoção, velocidade 1x/2x (quando habilitada), dicas ligadas/desligadas |
| Dados | Exportar save JSON, importar save, reiniciar progresso com confirmação |
| Idioma | Português-BR inicialmente; estrutura pronta para idiomas adicionais |

Não exigir login nem conexão constante.

---

## 10. PROGRESSÃO, RECOMPENSAS E BRINQUEDOPÉDIA

- Vencer fase libera próxima e registra a melhor marca (1–3 estrelas opcionais).
- **Estrelas não travam a história:** recompensam jogada limpa, preservação de trenzinhos e desempenho.
- Novas cartas são recebidas em momentos específicos; ao receber, mostrar uma ilustração, nome, função, custo e animação breve.
- Ao derrotar novo inimigo, liberar entrada na enciclopédia.
- Brinquedopédia possui 3 abas: Brinquedos, Pesadelos, Histórias.
- Cada entrada inclui sprite animado, nome, descrição divertida, função e dica objetiva.
- Salvamento automático **ao fim de cada fase** e após mudanças de configurações; nunca depender de o jogador apertar Salvar.
- Não usar upgrades numéricos permanentes na campanha inicial: preservar o desafio baseado em composição e habilidade.

### Exemplo de descrição de enciclopédia

**Meia Zanzante:** “Sumiu durante a lavagem. Agora quer vingança contra todos os pares organizados.”

**Urso Travesseiro:** “Campeão regional de abraços. Recebe pancadas sem perder a fofura.”

---

## 11. MODOS EXTRAS E MINIGAMES

Liberados conforme progresso, sem competir com o modo principal.

1. **Bagunça Infinita:** ondas sem fim, recorde por número de bandeiras; desbloqueio após 1-8.
2. **Sorte da Caixa:** peças vêm em esteira aleatória com escolha entre 2 opções; compensar RNG garantindo resposta mínima.
3. **Um Brilho Só:** cenário dá pouco recurso, exige defesa barata e escolhas precisas.
4. **Trânsito de Carrinhos:** desafio de usar unidades de investida em faixas corretas.
5. **O Armário Revida:** campo com condições pré-definidas de puzzle, sem precisar farmar.

**Primeiro lançamento jogável:** apenas campanha capítulo 1 + Bagunça Infinita simples. Demais minigames chegam após qualidade da campanha.

---

## 12. DIREÇÃO ARTÍSTICA E ANIMAÇÃO

### 12.1 Identidade visual

- **2D desenhado à mão / vetorial rasterizado**, contorno espesso, cores vivas, texturas leves.
- Silhuetas bem distintas; monstro pequeno parece pequeno; bloqueador ocupa grande parte da casa.
- Cenários em camadas leves para sugerir profundidade, sem comprometer leitura.
- Humor de desenho animado: squash/stretch, olhos vibrantes, pequenas reações ao impacto.
- Defesa sempre visualmente ancorada na célula; inimigos têm sombra simples no chão.
- A estética deve ser aconchegante e engraçada, não terror realista.

### 12.2 Especificação de sprites

- Design base em proporção **16:9**, resolução lógica de referência **1280×720**.
- Usar escala da área de jogo e letterboxing quando necessário; evitar esticar sprites.
- Personagens desenhados inicialmente em **256×256 px**, exportados e reduzidos conforme a distância/tamanho em tela.
- Atlas WebP/PNG conforme necessidade de transparência e suporte do pipeline.
- States mín.: `idle`, `attack`, `hit`, `defeat`; para peças: `deploy`, `idle`, `action`, `hurt`, `break`.
- Direção padrão para a direita (brinquedos) e para a esquerda (pesadelos).
- Animar com 6–12 fps desenhados quando isso for suficiente; interpolação no motor a 60 fps.
- VFX: partículas de confete, poeira, estrelas, elásticos, bolhas; limitação global para celulares.

### 12.3 Checklists de arte

- [ ] 20 brinquedos com retratos, cartas, sombra, quatro estados mínimos e variações de impacto.
- [ ] 20 inimigos com animação de andar, atacar, sofrer dano e derrota.
- [ ] 5 chefes com animação de aviso e dois padrões de ataque.
- [ ] 5 fundos de capítulo com variações discretas por fase.
- [ ] Interface com botões, cartas, Brilho, barra de onda e feedback de dano.
- [ ] Splash, capa, logo, ícone de PWA e peças de marketing.

---

## 13. ÁUDIO, FEEDBACK E ATMOSFERA

- Música de quarto: xilofone, pizzicato, piano de brinquedo, percussão leve, sem copiar melodias existentes.
- Trilha evolui por capítulo, com camada de urgência nas grandes ondas.
- Efeitos caricatos: mola `boing`, buzina fraca, chocalho, papel amassado, risadinhas.
- Poucos sons concorrentes: priorizar cliques, quebra de defesa, bandeira e alerta de invasão.
- Mistura separada: `music`, `sfx`, `ui` e `ambience`.
- Controle anti-repetição para 20 projéteis iguais: limiter/cooldown global por tipo de som.
- Primeira interação desbloqueia áudio no navegador; ao voltar do background, reativar com segurança.
- Legendar aviso de ondas e alertas para não depender de som.

---

## 14. ESPECIFICAÇÃO TÉCNICA (WEB / GITHUB PAGES / ANDROID)

### 14.1 Stack recomendada

- **TypeScript + Vite + Phaser 3** (renderização 2D WebGL com fallback compatível); alternativa aceitável: PixiJS + sistemas próprios.
- Interface de telas preferencialmente integrada ao canvas ou camada HTML cuidadosamente posicionada; manter foco e entrada previsíveis.
- Hospedagem estática GitHub Pages, com `base` correto de subdiretório.
- PWA instalável com manifest, service worker e estratégia de atualização controlada.
- Sem servidor para campanha, progresso local via IndexedDB ou localStorage versionado (escolher um padrão e encapsular).

### 14.2 Arquitetura modular obrigatória

```text
brinquedos-vs-pesadelos/
├── public/
│   ├── icons/
│   ├── manifest.webmanifest
│   └── assets/
│       ├── atlases/
│       ├── backgrounds/
│       ├── audio/
│       └── ui/
├── src/
│   ├── main.ts
│   ├── game/
│   │   ├── GameConfig.ts
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── MenuScene.ts
│   │   │   ├── LevelSelectScene.ts
│   │   │   ├── DeckScene.ts
│   │   │   ├── BattleScene.ts
│   │   │   └── ResultsScene.ts
│   │   ├── systems/
│   │   │   ├── GridSystem.ts
│   │   │   ├── ResourceSystem.ts
│   │   │   ├── PlacementSystem.ts
│   │   │   ├── WaveSystem.ts
│   │   │   ├── CombatSystem.ts
│   │   │   ├── CollisionSystem.ts
│   │   │   ├── StatusEffectSystem.ts
│   │   │   ├── EmergencyTrainSystem.ts
│   │   │   └── VictorySystem.ts
│   │   ├── entities/
│   │   │   ├── Toy.ts
│   │   │   ├── Enemy.ts
│   │   │   └── Projectile.ts
│   │   ├── ui/
│   │   │   ├── HUD.ts
│   │   │   ├── CardBar.ts
│   │   │   ├── PauseMenu.ts
│   │   │   └── Codex.ts
│   │   ├── services/
│   │   │   ├── AudioService.ts
│   │   │   ├── SaveService.ts
│   │   │   ├── AssetService.ts
│   │   │   └── SettingsService.ts
│   │   └── data/
│   │       ├── toys.json
│   │       ├── enemies.json
│   │       ├── chapters.json
│   │       └── levels/
│   └── styles/
├── tests/
│   ├── grid.test.ts
│   ├── combat.test.ts
│   ├── waves.test.ts
│   ├── save.test.ts
│   └── level-validation.test.ts
├── package.json
├── vite.config.ts
└── README.md
```

**Não colocar tudo num único HTML gigante.** Dados e regras ficam desacoplados de sprites e cena. Nenhuma unidade deve depender do nome de outra unidade em múltiplos sistemas; aplicar comportamentos via dados e componentes.

### 14.3 Modelo de dados de uma peça

```json
{
  "id": "T02",
  "name": "Soldadinho Estalo",
  "cost": 100,
  "cooldownSeconds": 6,
  "maxHp": 120,
  "category": "attacker",
  "targetMode": "first-enemy-in-lane",
  "attack": {
    "damage": 20,
    "intervalSeconds": 1.5,
    "projectileSpeedCellsPerSecond": 4.0
  },
  "animation": "toy_soldadinho",
  "icon": "card_soldadinho"
}
```

### 14.4 Simulação determinística

- **Separar lógica de render:** usar timestep fixo de 1/30 s com accumulator e limite de catch-up, por exemplo até 5 passos por frame.
- Usar ordem determinística para: entrada de inimigos, aquisição de alvo, dano, morte, coleta e verificação de fim de fase.
- Seed de PRNG por fase em eventos aleatórios; não usar `Math.random` espalhado pelos componentes críticos.
- Estado da batalha explicitamente modelado (`preparing`, `active`, `paused`, `victory`, `defeat`).
- Não atualizar spawns nem recursos ao pausar; não acelerar indefinidamente depois de aba voltar.
- Evitar loops de busca de alvo O(N²) onde a escala aumentar; indexar inimigos por faixa, ordenados por posição.
- Hitbox de inimigo independente da animação/sprite.

### 14.5 Otimização e carregamento

- Carregar apenas interface + atlas comum antes do menu; assets de capítulo sob demanda.
- Carregar próxima cena em segundo plano **sem atrasar ação do usuário**; mostrar barra real se for necessário.
- Reutilizar projéteis, números flutuantes e partículas (object pools).
- Limitar partículas em celulares e renderizar efeitos transitórios com atlas compartilhado.
- Não instanciar centenas de texturas duplicadas; utilizar texture atlases.
- Texturas com dimensões adequadas para dispositivos; não carregar imagens 4K num campo 2D simples.
- Desligar efeitos decorativos fora de tela, mas **jamais** parar entidades da simulação apenas por não estarem visíveis.
- Medir com ferramentas reais: tempo de frame, memória e tamanho de bundle.

### 14.6 Metas de desempenho (metas, não resultados)

| Indicador | Meta de projeto |
|---|---|
| FPS desktop comum | 60 fps |
| FPS Android intermediário | 50–60 fps; modo 30 fps disponível |
| Input-to-feedback | Menor que ~100 ms na maioria dos toques |
| Áudio simultâneo | Preferir no máximo 8–12 efeitos de combate ao mesmo tempo |
| Carregamento inicial | Interface utilizável rapidamente em rede móvel boa; verificar em dispositivos reais |
| Offline | Campanha e assets já baixados acessíveis sem internet |
| Save | Não perder desbloqueios após recarregar/fechar normalmente |

Não declarar metas atingidas sem benchmark real em celular e desktop.

### 14.7 PWA e GitHub Pages

- `manifest.webmanifest` com nome, ícones, `start_url`, `display: standalone`, theme color.
- Service worker com versionamento e cache de assets versionados. **Não substituir arquivos críticos no meio da partida**.
- Se atualizar: permitir instalar nova versão e pedir reinício ao fim da fase.
- Suporte a orientação paisagem recomendado; no retrato mostrar tela orientando girar, sem cortar botões.
- Área segura para notch, navegação e teclado virtual (sem teclado exigido).
- Testar modo offline com DevTools e sem conexão física depois da primeira instalação.

---

## 15. UX MOBILE E ACESSIBILIDADE

- Área do tabuleiro preservada com a proporção correta; HUD reflow conforme resolução.
- Selecionar carta com toque, depois casa: evita drag-and-drop impreciso. Arrastar opcional.
- Casas têm destaque quando podem receber brinquedo; ao falhar, mostrar causa (“Brilhos insuficientes”, “Recarga”, “Casa ocupada”).
- Toques em estrelas devem ser tolerantes a dedo e não conflitar com colocação.
- Na orientação vertical, informar que a experiência foi pensada para paisagem, sem travar navegação por sistema.
- Não depender de hover, clique direito, atalhos de teclado ou gesto complexo.
- Ícones acompanhados de palavras; feedback de som com alternativa visual.
- Modo menos animação reduz shake, flashes e partículas; não remove pistas importantes de ameaça.

---

## 16. SALVAMENTO E ESTRUTURA DE PROGRESSO

```json
{
  "saveVersion": 1,
  "lastCompletedLevel": "1-4",
  "unlockedLevels": ["1-1", "1-2", "1-3", "1-4", "1-5"],
  "unlockedToys": ["T01", "T02", "T03", "T04"],
  "stars": { "1-1": 3, "1-2": 2, "1-3": 2, "1-4": 1 },
  "codex": { "seenEnemies": ["E01", "E02"] },
  "settings": {
    "musicVolume": 0.7,
    "sfxVolume": 0.8,
    "graphicsMode": "auto",
    "reducedMotion": false
  }
}
```

- Migrar versões antigas de save com funções explícitas; nunca apagar automaticamente por mudança de schema.
- Tratar dados corrompidos sem travar o menu. Preservar backup quando possível.
- Testar exportação/importação, atualização do PWA e reabertura offline.

---

## 17. ROTEIRO DE IMPLEMENTAÇÃO

### Etapa A — Protótipo vertical (jogável)

- [ ] Tela inicial, campo 5x9, toque e mouse.
- [ ] Brilho caindo, coleta e contador.
- [ ] 3 brinquedos: Abajur, Soldadinho, Urso.
- [ ] 2 inimigos: Poeira Andante, Meia Zanzante.
- [ ] Tiros, HP, dano, animação de derrota, pausa.
- [ ] 3 fases simples com vitória/derrota e reinício.
- [ ] Áudio básico, save local e testes de lógica.

**Aceite:** completar três fases em Android e desktop, sem colocar peças fora da grade e sem continuar ondas em pausa.

### Etapa B — Primeiro capítulo completo

- [ ] Implementar 1-1 a 1-8 como dados.
- [ ] Mais brinquedos e inimigos do Capítulo 1.
- [ ] Trenzinhos, grande onda, boss Rei das Meias.
- [ ] Seleção de cartas, tutorial, desbloqueio e Brinquedopédia inicial.
- [ ] Ajustar curva de dificuldade com playtest.

**Aceite:** um usuário novo entende o jogo e conclui capítulo 1 sem instruções externas.

### Etapa C — Campanha principal

- [ ] Capítulos 2–5, terrenos, 20 brinquedos e 20 inimigos.
- [ ] Cinco chefes, histórias curtas e final.
- [ ] Configurações, acessibilidade e som por capítulo.
- [ ] Minigames prioritários e sobrevivência.

**Aceite:** todas as 40 fases vencíveis e todas as cartas úteis em pelo menos uma estratégia.

### Etapa D — Polimento e distribuição

- [ ] Refinar animações, hitboxes, ícones, contraste e UX touch.
- [ ] PWA offline, fluxo de atualização e GitHub Pages.
- [ ] Perfil móvel econômico, medição de FPS/memória.
- [ ] Teste de save/import/export e atualização entre versões.
- [ ] Trailer curto e capturas da campanha.

**Aceite:** release reproduzível, sem erros críticos de console, instalável e jogável offline após download inicial.

---

## 18. TESTES E CONTROLE DE QUALIDADE

### 18.1 Testes automatizados

1. Posicionar apenas em casa vazia e permitida.
2. Sem Brilho suficiente: não gasta recurso e não posiciona.
3. Recarga da carta: começa ao usar, termina no tempo correto e congela em pausa.
4. Tiros acertam alvo válido na faixa e não atravessam alvos sem permissão.
5. Dano e morte: entidade some da lógica uma única vez, sem dupla recompensa.
6. Trenzinho: dispara exatamente uma vez por faixa; segundo vazamento causa derrota.
7. Onda final: vitória apenas quando nenhum inimigo vivo nem spawn pendente existir.
8. Boss: scripts não duplicam eventos ao reiniciar.
9. Save: progresso sobreviver a atualização de versão, reload e modo offline.
10. Resoluções: 1280×720, 1920×1080, 854×480 e aparelhos com notch.

### 18.2 Playtests mínimos

- 3 pessoas sem experiência no gênero para tutorial.
- 3 pessoas fãs do gênero para curva de dificuldade.
- Android de entrada/intermediário e desktop com navegador.
- Capturar: vitórias, derrotas, desistências, cartas escolhidas, mapa de calor opcional local, duração e momento de falha.
- Metas de entendimento: jogador sabe dizer como ganhar, coletar recursos e defender uma faixa após a primeira fase.

### 18.3 Definição de pronto para cada fase

A fase está pronta somente quando: configurações validadas, onda final previsível, vitória/derrota testadas, tutorial (se necessário), desbloqueio salvando, UI em tela pequena, nenhuma imagem faltante, nenhuma falha crítica no console e playtest demonstrando possibilidade de vitória.

---

## 19. RISCOS E SOLUÇÕES

| Risco | Prevenção |
|---|---|
| Ficar parecido demais com PvZ na arte | Não utilizar plantas, zumbis, ícones, falas, cenário, música ou silhuetas parecidas; construir estilo próprio |
| Menus e sistemas incharem o jogo | Priorizar campanha linear; extras somente após core loop estável |
| Cartas inúteis | Garantir papel situacional e testar escolhas de deck em cada capítulo |
| Fases longas demais | Limitar pausas entre ondas e permitir progresso visível |
| Celular com UI apertada | Campo com escala uniforme, cartas selecionáveis por toque e HUD adaptável |
| Atualização quebrar save | Schema versionado e migrações testadas |
| Excesso de objetos e sons | Pooling, limites e atlas compartilhados |
| Boss frustrante | Ataques sinalizados, counters múltiplos e checkpoints só quando necessário |
| Repetição dos 40 níveis | Novas combinações e pressão gradual, não apenas mais HP |

---

## 20. CRITÉRIOS PARA UMA VERSÃO 1.0 DE QUALIDADE

**Jogabilidade — 30 pontos**
- Campo responsivo, recursos e colocação sem bugs (10)
- Estratégias variadas e balanceadas (10)
- Inimigos legíveis e chefes justos (10)

**Conteúdo — 25 pontos**
- 40 fases + 5 chefes (15)
- Brinquedos, bestiário e enciclopédia consistentes (10)

**Apresentação — 20 pontos**
- Arte 2D coerente, animações e feedback (12)
- Áudio original e interface organizada (8)

**Técnica — 15 pontos**
- Performance e carregamento em celular (7)
- PWA offline, GitHub Pages e save robusto (8)

**Polimento — 10 pontos**
- Tutoriais, acessibilidade e QA real (10)

**Alvo: 90+/100 antes de chamar de versão completa.** A nota final precisa vir de execução, verificação e playtests, não apenas de código escrito.

---

## 21. INSTRUÇÕES PARA IA PROGRAMADORA / GAMEFORGE

> Desenvolva **Brinquedos vs. Pesadelos** exatamente como um tower defense 2D casual por faixas. O núcleo da jogabilidade deve ser: campo fixo 5x9, coleta de Brilhos, cartas com custo e recarga, posicionamento por célula, defesas automáticas, monstros avançando da direita para a esquerda, ondas definidas por dados, trenzinho de emergência uma vez por faixa, derrota por invasão e vitória após derrotar a última onda.
>
> **Não transforme o jogo em:** 3D livre, RTS tradicional, RPG, sistema de crafting, roguelike de upgrades contínuos, defesa por caminhos sinuosos ou ação em tempo real controlada por personagem.
>
> **Comece pelo protótipo vertical:** primeiro 3 brinquedos, 2 inimigos e 3 fases. Entregue código modular TypeScript/Vite/Phaser 3, testes automatizados e uma versão web jogável. Depois faça o Capítulo 1 completo. Só então expanda o restante. **Não escreva um único arquivo monolítico.**
>
> Entregue, a cada etapa: código-fonte, instruções de execução, build para GitHub Pages, lista de arquivos alterados, testes efetivamente executados (distinguir de testes apenas previstos), métricas reais quando obtidas, bugs conhecidos e demonstração jogável.
>
> A aparência deve ser **cartoon 2D expressivo**, acolhedor, engraçado, com animações divertidas e interface que funcione em mouse e toque. Preserve a clareza e a diversão imediata características dos tower defenses por linhas do início dos anos 2010, mantendo identidade própria.

---

## 22. RECAPITULAÇÃO DA EXPERIÊNCIA

Ao iniciar, o jogador vê uma cama, o armário e cinco faixas no tapete. Um pequeno soldadinho atira bolinhas de papel em um monstro de poeira. Um Brilho cai, o jogador o coleta e posiciona outro brinquedo. Mais tarde, uma Meia Zanzante corre; o Urso Travesseiro segura o ataque; uma mola arremessa o monstro para trás; uma grande onda chega com uma fanfarra desafinada. O jogador ri, se preocupa um pouco, vence e ganha um brinquedo novo.

**Essa é a experiência principal a preservar em todas as decisões de desenvolvimento.**

---

**Documento de pré-produção — GDD v1.0.**


---

# Adendo de produção — v0.4.0 (Capítulo 2: Debaixo da Cama)

O primeiro capítulo (oito fases) permanece inalterado. O segundo capítulo começa depois da fase **1-8** e estreia com **2-1 a 2-4**. A principal regra continua: 5 faixas, 9 colunas, posicionamento por Brilhos, hordas vindas da direita, defesa de emergência por faixa.

## Identidade visual

Novo cenário noturno sob a cama de Lia, com tons azuis, bordas acolchoadas, estrelas no carpete e móveis de madeira ilustrados em Canvas 2D. Todos os brinquedos permanecem legíveis contra o fundo escuro. Não há recursos externos obrigatórios.

## Personagens inéditos

- **T06 — Carrinho Cometa**: custa 150 Brilhos, recarga de 10 s, 28 de dano, dispara a cada 2,0 s, atravessa até dois monstros diferentes por projétil.
- **T07 — Boneca Soninho**: custa 125 Brilhos, recarga de 12 s, 10 de dano, dispara a cada 4,7 s e interrompe movimento/ataques por 2,3 s.
- **E06 — Pula-Pula da Cama**: 125 de vida, velocidade 0,40 célula/s, salta uma defesa uma única vez; outras defesas continuam funcionando.
- **E07 — Cabide Blindado**: 165 de vida, escudo de 85 pontos que absorve dano até acabar, velocidade 0,25 célula/s.

## Organização de fases

- **2-1 — Barulhos sob a cama**: apresenta o Pula-Pula; recompensa T06.
- **2-2 — Carrinhos cruzando a pista**: grupos em linha e projéteis perfurantes.
- **2-3 — A dança dos cabides**: novo escudo de inimigos; recompensa T07.
- **2-4 — Todo mundo quietinho!**: uso do sono para atrasar monstros resistentes.

## Persistência, compatibilidade e verificação

O mesmo save `bvp-save-v1` é mantido. O progresso avançado agora usa o ID real da fase (`2-1` etc), não presume numeração `1-N`. O catálogo se adapta aos novos brinquedos, a seleção exibe capítulos em separado e o service worker incrementa sua versão para instalar os arquivos novos.

**Estado de desenvolvimento:** quatro fases do segundo capítulo, sem chefe final de capítulo ainda. Próximo marco sugerido: 2-5 a 2-8, chefe original e testes em aparelhos Android reais.


---

## Adendo de produção — v0.5.0 (Capítulo 2 concluído)

A campanha jogável possui **16 fases** (1-1 a 2-8). As fases **2-5 Teias no Tapete**, **2-6 O Relógio Perdeu a Hora**, **2-7 Estrelas pela Janela** e **2-8 A Dama da Insônia** completam o segundo capítulo.

**T08 — Móbile Musical:** custo 175, pausa temporariamente pesadelos da faixa onde foi colocado e das faixas adjacentes. **T09 — Estilingue de Estrelas:** custo 200, ataque de área que também atinge faixas vizinhas.

**E08 — Aranha do Estrado:** teias que atrasam a cadência de um brinquedo. **E09 — Despertador Zangado:** acelera quando perde metade da vida. **E10 — Dama da Insônia:** chefe, invoca dois grupos de reforços ao chegar a 65% e 30% de vida.

Os capítulos anteriores e os saves das versões 0.1–0.4 permanecem compatíveis; a jogabilidade continua com 5 linhas e 9 colunas.


---

## Implementação v0.6.0 — Capítulo 3: O Corredor Rangente

Fases jogáveis 3-1 a 3-4, somando 20. Portas avisam a faixa principal de ondas selecionadas com cinco segundos de antecedência. A fase 3-1 libera o Arco de Elástico (150 Brilhos, rebate num segundo alvo); a 3-3 libera a Caixa Surpresa (125 Brilhos, arma após 1,05 s, dano 190 em três faixas). O Ladrão de Brilhos pode roubar estrelas no tabuleiro mas nunca desconta energia guardada. Grid 5×9 preservado. Pendências: fases 3-5 a 3-8, chefe Vovô Poeirão e testes Android físicos.
