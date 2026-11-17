# GDD canônico v2 — Campanha, narrativa, cutscenes e estratégia 2.5D

**Projeto:** Brinquedos vs. Pesadelos  
**Marco inicial:** 17/11/2026; base jogável v1.6.0  
**Status deste documento:** plano de produção aprovado em direção geral; roteiros e números são propostas a implementar, testar e refinar.

## 0. Fonte de verdade e resolução de conflitos

- Este documento **alinha o plano ao que já está publicado**. `GDD.md` permanece como histórico de pré-produção, não como lista de recursos já existentes.
- Fonte da implementação de fases: `src/data.js`; do combate: `src/engine.js`; do fluxo: `src/main.js`.
- Capítulo 2 **canônico**: **Debaixo da Cama**, com **Dama da Insônia**. A antiga "Sala de Brincadeiras" e o "Capitão Guarda-Roupa" são conceitos históricos, não substituições automáticas de conteúdo já jogável.
- Capítulo 3 **canônico**: **O Corredor Rangente**, com **Vovô Poeirão**.
- A Oficina com upgrades de estrelas é canônica desde a v1.2.0, apesar da antiga vedação a upgrades em `GDD.md`.
- A v1.6.0 tem **24/40 fases**, **3/5 capítulos**, **3 chefes de campanha**, **12 brinquedos**, **14 inimigos**. A Noite Sem Fim é um modo extra; não encerra o enredo.
- Tudo que for apenas proposto está marcado como **PENDENTE**, para não confundir plano e entrega.

## 1. Visão criativa e escopo

- Tower defense humorístico e aconchegante, grade 5×9 com cinco faixas, inimigos avançam da direita para a esquerda, recurso Brilhos.
- Público casual e dispositivos Android/desktop; manter controle por toque/mouse/teclado e acessibilidade.
- Direção narrativa: **começo, meio, virada, confronto e epílogo**; diálogos curtos, sem interromper repetição de fases.
- Direção gráfica: **2.5D gradual** — ilusão de profundidade com camadas e iluminação; personagens e colisões seguem 2D. Cutscenes podem usar planos 3D futuramente, mas o conteúdo deve funcionar sem WebGL.
- A campanha deve continuar ganhável sem grind obrigatório nem compra de melhorias; estrelas opcionais.

## 2. Linha narrativa definitiva (roteiro-base proposto)

**Mundo:** a pequena **Lia** dorme. A Porta do Armário abre uma passagem para o **Reino dos Pesadelos**, cujas criaturas tentam capturar o **Coração da Imaginação**. Os brinquedos despertam por um pacto de proteção. O **Seu Pião** lidera com planos atrapalhados; o **Capitão Botão** organiza a defesa.

**Ato I — Despertar / Cap. 1 — O Armário (1-1 a 1-8) — JOGÁVEL.** O armário range, objetos ganham vida e o Rei das Meias quer conquistar o tapete. Ao cair, o Rei revela que "a escuridão vem de mais longe", deixando uma pista sob a cama. A esperança inicial vira a descoberta de uma invasão organizada.

**Ato II — Pistas / Cap. 2 — Debaixo da Cama (2-1 a 2-8) — JOGÁVEL.** A Dama da Insônia alimenta medos com sombras e insônia; depois da vitória, deixa escapar que algo está reunindo pesadelos no corredor. Lia dorme mais tranquila, mas o Coração pulsa: a ameaça ainda não terminou.

**Ato III — Revelação / Cap. 3 — O Corredor Rangente (3-1 a 3-8) — JOGÁVEL.** Portas anunciam ondas. Vovô Poeirão é mais um guardião relutante do caminho. Ao ser derrotado, aponta involuntariamente para o **Sótão Esquecido**. Um vulto com a silhueta do Grande Bicho-Papão é avistado de relance, sem revelar a forma inteira.

**Ato IV — Perda e reunião / Cap. 4 — O Sótão Esquecido (4-1 a 4-8) — PENDENTE.** Memórias esquecidas alimentam o exército do Bicho-Papão. Brinquedos antigos de Lia aparecem e exigem estratégias novas contra poeira e inimigos mistos. **Baronesa das Cortinas** tenta esconder o caminho até o Coração. Na vitória, os brinquedos descobrem que só a união — inclusive dos brinquedos esquecidos — ilumina a passagem de volta ao quarto.

**Ato V — Confronto e resolução / Cap. 5 — A Noite dos Mil Bocejos (5-1 a 5-8) — PENDENTE.** O quarto vira um sonho distorcido; pulsos alteram a velocidade dos pesadelos. **Grande Bicho-Papão** surge: é um manipulador vaidoso que cresce quando os brinquedos brigam ou perdem confiança. Na última fase apresenta **três padrões/etapas**, cada uma telegráfica e contra-atacável. Após a vitória, o Coração volta a brilhar, Lia acorda, encontra seus brinquedos organizados, e a última gag mostra Seu Pião caindo de lado. **Desfecho fechado**, com gancho opcional sutil, não um final em aberto.

## 3. Campanha canônica, condições e estado

| Capítulo | Fases | Chefe final | Estado | Nova regra |
|---|---|---|---|---|
| 1 — O Armário | 1-1…1-8 | Rei das Meias | IMPLEMENTADO | Aprender recursos, posicionamento e ondas |
| 2 — Debaixo da Cama | 2-1…2-8 | Dama da Insônia | IMPLEMENTADO | Escudos, salto e insônia |
| 3 — O Corredor Rangente | 3-1…3-8 | Vovô Poeirão | IMPLEMENTADO | Portas e avisos de faixa |
| 4 — O Sótão Esquecido | 4-1…4-8 | Baronesa das Cortinas | PENDENTE | Casas empoeiradas, penalidade de ação 15%; remoção opcional |
| 5 — A Noite dos Mil Bocejos | 5-1…5-8 | Grande Bicho-Papão | PENDENTE | Pulsos de sonho telegrafados, duração até 7s |

**Fases futuras:**

- 4-1: Introdução às casas com poeira. 4-2: Boneca Guarda-Chuva. 4-3: Sombrinha Assobiadora. 4-4: Robô de Lata Desajeitado. 4-5: Lencinho Invisível. 4-6: Tambor Fanfarrão. 4-7: Defesa híbrida de elite. 4-8: Baronesa das Cortinas, projéteis telegrafados e janela de vulnerabilidade.
- 5-1: Primeiro pulso de sonho. 5-2: Bichinho Sonolento. 5-3: Bola-Ímã e combinações. 5-4: Boneco de Neve de Algodão. 5-5: Guitarrinha Desafinada. 5-6: Cavalinho de Madeira e elite. 5-7: O último plano. 5-8: Grande Bicho-Papão, 3 etapas, final e créditos.

**Regras de aceite de fase:** plano de ondas declarativo, pelo menos uma estratégia vencível sem upgrades, novas habilidades com avisos visuais e contramedidas, teste automatizado + teste em mouse e toque, migração de save, PWA e offline.

## 4. Plano de cutscenes — PENDENTE de implementação

**Sistema:** sequências curtas de 2–4 quadros, com arte em camadas e movimento suave (parallax, luz, fade). Avançar por clique/toque/Enter; botão **Pular** em todas; **Histórias** na Brinquedopédia para rever cenas já vistas; legendas sempre presentes; salvar flags sem mudar a chave de save. Repetir fase não reapresenta cena automaticamente após marcada como vista. Ao pular, executar o mesmo destino normal, nunca recompensar ou destravar conteúdo apenas pela cena. Controles e opções de reduzir movimento devem funcionar em todas as cenas.

| ID | Gatilho | Duração-alvo | Conteúdo | Situação |
|---|---|---|---|---|
| C00 | Primeira entrada na campanha (1-1) | 20–30s | A porta abre; Seu Pião acorda; Capitão Botão mobiliza | IMPLEMENTADO v1.7.0 |
| C01 | Primeira vitória 1-8 | 10–20s | Rei das Meias revela pista sob a cama | IMPLEMENTADO v1.7.0 |
| C02 | Primeira vitória 2-8 | 10–20s | Insônia aponta para o corredor | IMPLEMENTADO v1.7.0 |
| C03 | Primeira vitória 3-8 | 10–20s | Poeirão menciona o sótão; sombra aparece | IMPLEMENTADO v1.7.0 |
| C04 | Primeira vitória 4-8 | 15–25s | Cortinas se abrem; Coração se ilumina | PENDENTE |
| C05 | Antes de 5-8, primeira vez | 10–20s | Grande Bicho-Papão se apresenta | PENDENTE |
| C06 | Primeira vitória 5-8 | até 45s | Coração restaurado, Lia acorda, desfecho | PENDENTE |
| C07 | Após C06 | 15–30s | Créditos e gag de Seu Pião; opção de rever | PENDENTE |

### Storyboard C00 — Abertura

1. **Plano geral, quarto à meia-noite:** Lua e cama da Lia ao fundo. Texto: "Quando Lia dorme, a imaginação continua acordada." Uma luz pequena pulsa atrás do armário.
2. **Plano médio, porta entreaberta:** sombras em forma de meias e poeira escapam. Fala distante: "O Coração da Imaginação será nosso!"
3. **Plano próximo, Seu Pião desperta:** ele gira desajeitado. Fala: "Brinquedos, acordem! A noite saiu do controle!"
4. **Plano médio, Capitão Botão e brinquedos:** o soldadinho ergue a mão: "Às posições! Ninguém atravessa o tapete!" **Transição:** iniciar 1-1.

### Storyboards resumidos C01–C07

- **C01:** Rei das Meias escorrega → aponta sem querer para baixo da cama → Pião acende a luz.
- **C02:** Dama se desfaz em estrelas → sombra corre pelo corredor → brinquedos seguem.
- **C03:** Poeirão espirra e abre um alçapão → imagem de sótão → silhueta do vilão.
- **C04:** Baronesa abre as cortinas → luz do Coração atravessa a poeira → equipe se une.
- **C05:** Quarto vira sonho → vilão se apresenta e enumera suas três artimanhas → batalha.
- **C06:** Derrota de cada forma → luz retorna, portais se fecham → Lia desperta e encontra brinquedos juntos.
- **C07:** Créditos → Pião tropeça → tela "Fim da história. A imaginação continua."

## 5. Estratégia gráfica 2.5D sem sacrificar o gameplay

**Camada A — Base (atual):** manter render Canvas 2D, mecânica determinística a 30 Hz, sombras e hitboxes originais em `src/engine.js`. A grade continua 5×9, fixa e legível.

**Camada B — Profundidade artística (primeiro incremento):** 3–5 planos decorativos de cenário com perspectiva pintada, deslocamento sutil e iluminação; movimento reduzido = imagem estática. Não acoplar iluminação à simulação. Arte exportada compacta, fundos carregados por capítulo sob demanda.

**Camada C — Objetos pré-renderizados (incremento intermediário):** renderizar móveis e detalhes 3D fora do runtime para sprites/planos 2D. Mantém desempenho, compatibilidade offline e permite visual sofisticado sem WebGL.

**Camada D — Cutscenes 3D opcionais (incremento posterior):** cenas em WebGL/Three.js com modelos low-poly e animações GLB compactadas, exibidas em canvas separado ou camada independente, **sem alterar gameplay**. Se falhar criação de contexto WebGL, carregar imediatamente quadros 2D equivalentes. Não habilitar por padrão sem testes em celular.

**Restrições:** 1280×720 lógico; não ocultar cartas, casas ou alertas; priorizar 60fps visual quando possível e fallback 30fps; sem prometer um orçamento de MB antes de medir assets reais; prever desligar parallax e efeitos. Inspecionar memória, draw calls, tempo de frame e carregamento em Android intermediário. Nunca exigir biblioteca gráfica para iniciar a campanha 2D.

## 6. Marcos versionados e dependências

| Marco | Entregas verificáveis | Estado |
|---|---|---|
| M0 — Checkpoint | Branch segura 1.6.0 + este GDD + plano rastreável | DOCUMENTAÇÃO |
| M1 — Narrativa base | Motor de cutscenes, C00 e C01–C03, pular/rever, salvar flags, testes | IMPLEMENTADO v1.7.0; C04–C07 pendentes |
| M2 — Fundos 2.5D | 3 cenários melhorados em camadas + fallback e medições de desempenho | PENDENTE |
| M3 — Capítulo 4 | 8 fases, novos tipos, poeira, Baronesa, C04 | PENDENTE |
| M4 — Capítulo 5 | 8 fases, sonho, boss 3 etapas, C05–C07 e final real | PENDENTE |
| M5 — Cutscenes 3D | Protótipo do quarto e 1 personagem 3D, fallback 2D, Android testado | PENDENTE |
| M6 — Polimento | QA integral das 40 fases, save legado, arte, áudio, créditos, acessibilidade | PENDENTE |

**Ordem preferida:** M0 → M1 → M2 → M3 → M4 → M5 → M6. M5 não bloqueia o lançamento da história: a campanha completa e as cenas em 2D têm prioridade.

## 7. Integração, QA, compatibilidade e rollback

- Cada PR atualiza `CHANGELOG.md`, documentação do marco, testes do módulo e integrações PWA/offline.
- Prefixar scripts e cache por versão; se adicionar módulo a `src/`, adicionar ao SW e ao construtor standalone **na ordem de dependência**.
- Não mudar IDs de fases nem rewards existentes, não destruir chaves `stars`, `unlocked`, `upgrades`, `decks`, `survival`.
- Persistir flags de histórias de forma normalizada e opcional; saves antigos continuam carregando. Preferir flag por `id` da cutscene e não por índice de fase.
- Regra de evento narrativa: salvar vitória antes de abrir interlúdio; derrota não dispara interlúdio; botão Pular não concede recursos.
- Confirmar falha de armazenamento sem quebrar a navegação. Executar testes em novas sessões, antigos saves 1.6.0, offline e modo sobreviver.
- Revisão de progresso: marcar somente IMPLEMENTADO após PR em main e testes aprovados. Imagens e roteiros planejados não equivalem a cutscenes já existentes.

## 8. Próxima intervenção de código

Criar `src/story.js` com definição de quadros; renderizador leve (HTML/CSS e ilustração em Canvas/SVG), integração com `src/main.js`, botão de rever histórias no menu/Brinquedopédia e gate para primeira partida. Cobrir avanço, pular, Escape, reduzir movimento, primeira vitória, replay, save legado e geração do HTML offline.

Depois elevar o primeiro capítulo com camadas 2.5D sem tocar no motor de colisões.

## 9. Marco de implementação v1.7.0 — primeiras cenas

A v1.7.0 introduz C00, C01, C02 e C03 em estilo ilustrado por camadas HTML/CSS, sem WebGL. C00 abre antes da primeira partida 1-1 e pode ser pulada; C01–C03 aparecem após vitórias nas fases finais dos três primeiros capítulos, e também ficam disponíveis pela galeria de Histórias para saves legados com capítulos concluídos. Marcar a cena como vista nunca altera vitórias, estrelas, upgrades ou desbloqueios. O GDD completo ainda exige C04–C07, 16 novas fases, dois chefes e os fundos 2.5D aprimorados.
