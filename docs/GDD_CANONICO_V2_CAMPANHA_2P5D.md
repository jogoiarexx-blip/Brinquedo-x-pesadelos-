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

**Ato IV — Perda e reunião / Cap. 4 — O Sótão Esquecido (4-1 a 4-8) — IMPLEMENTADO v1.9.0.** Memórias esquecidas alimentam o exército do Bicho-Papão. Brinquedos antigos de Lia aparecem e exigem estratégias novas contra poeira e inimigos mistos. **Baronesa das Cortinas** tenta esconder o caminho até o Coração. Na vitória, os brinquedos descobrem que só a união — inclusive dos brinquedos esquecidos — ilumina a passagem de volta ao quarto.

**Ato V — Confronto e resolução / Cap. 5 — A Noite dos Mil Bocejos (5-1 a 5-8) — IMPLEMENTADO v2.0.0.** O quarto vira um sonho distorcido; pulsos alteram a velocidade dos pesadelos. **Grande Bicho-Papão** surge: é um manipulador vaidoso que cresce quando os brinquedos brigam ou perdem confiança. Na última fase apresenta **três padrões/etapas**, cada uma telegráfica e contra-atacável. Após a vitória, o Coração volta a brilhar, Lia acorda, encontra seus brinquedos organizados, e a última gag mostra Seu Pião caindo de lado. **Desfecho fechado**, com gancho opcional sutil, não um final em aberto.

## 3. Campanha canônica, condições e estado

| Capítulo | Fases | Chefe final | Estado | Nova regra |
|---|---|---|---|---|
| 1 — O Armário | 1-1…1-8 | Rei das Meias | IMPLEMENTADO | Aprender recursos, posicionamento e ondas |
| 2 — Debaixo da Cama | 2-1…2-8 | Dama da Insônia | IMPLEMENTADO | Escudos, salto e insônia |
| 3 — O Corredor Rangente | 3-1…3-8 | Vovô Poeirão | IMPLEMENTADO | Portas e avisos de faixa |
| 4 — O Sótão Esquecido | 4-1…4-8 | Baronesa das Cortinas | IMPLEMENTADO v1.9.0 | Casas empoeiradas, penalidade de ação 15%; remoção opcional |
| 5 — A Noite dos Mil Bocejos | 5-1…5-8 | Grande Bicho-Papão | IMPLEMENTADO v2.0.0 | Pulsos de sonho telegrafados, duração até 7s |

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
| C04 | Primeira vitória 4-8 | 15–25s | Cortinas se abrem; Coração se ilumina | IMPLEMENTADO v1.9.0 |
| C05 | Antes de 5-8, primeira vez | 10–20s | Grande Bicho-Papão se apresenta | IMPLEMENTADO v2.0.0 |
| C06 | Primeira vitória 5-8 | até 45s | Coração restaurado, Lia acorda, desfecho | IMPLEMENTADO v2.0.0 |
| C07 | Após C06 | 15–30s | Créditos e gag de Seu Pião; opção de rever | IMPLEMENTADO v2.0.0 |

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
| M1 — Narrativa base | Motor de cutscenes, C00–C07, pular/rever, salvar flags, testes | IMPLEMENTADO v2.0.0 |
| M2 — Fundos 2.5D | 3 cenários melhorados em camadas + fallback e medições de desempenho | EM ANDAMENTO v1.8.0: profundidade Canvas e sótão; medições Android pendentes |
| M3 — Capítulo 4 | 8 fases, novos tipos, poeira, Baronesa, C04 | IMPLEMENTADO v1.9.0; testes de desempenho em celular ainda necessários |
| M4 — Capítulo 5 | 8 fases, sonho, boss 3 etapas, C05–C07 e final real | IMPLEMENTADO v2.0.0; QA móvel real pendente |
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

## 10. Marco jogável v1.8.0 — Sótão Esquecido, parte 1

**Implementado:** as fases 4-1 a 4-4 (28 no total) com 10 ondas programadas cada. A nova mecânica é um `Set` de células empoeiradas, por fase, que reduz a taxa de ações em 15%, sem afetar hitbox, coordenadas, custos ou a campanha anterior. A Boneca Guarda-Chuva (T13) limpa imediatamente as casas em área 3×3 e periodicamente repara brinquedos vizinhos; a Sombrinha Assobiadora (T14) causa dano e lentidão em três faixas até alcance 3 células; o Robô de Lata (T15) dispara dois acertos perfurantes, com vida elevada.

**Inimigos novos:** Traça do Sótão (E15), que usa o comportamento de teia, e Baú Saltitante (E16), que salta uma defesa; ambos possuem arte original Canvas e retrato no SVG da enciclopédia.

**Arte:** fundo exclusivo do Sótão com arquitetura de madeira, lua, lanternas e caixotes em perspectiva pintada; camadas luminosas decorativas com movimento opcional, sem introduzir WebGL/Three.js no combate. As casas empoeiradas são destacadas visualmente em dourado claro.

**Salvamento:** quando um save antigo atingiu o limite de 24 fases e venceu 3-8, a normalização existente libera 4-1. A chave `bvp-save-v1` e os IDs das 24 fases anteriores são preservados.

**Pendente:** 4-5…4-8, Baronesa das Cortinas, C04, mais ativos detalhados para todos os capítulos, medição de FPS/memória em aparelhos reais, Capítulo 5 e cutscenes finais.

**Critério de qualidade para encerrar o marco:** GitHub Actions de testes e qualidade verdes, build offline sintaticamente válido, preservação do checkpoint e GitHub Pages publicado.

## 11. Marco v1.9.0 — Capítulo 4 completo e Baronesa das Cortinas

**Jogável:** fases 4-5…4-8 (32/40 fases), com Lencinho Invisível, Tambor Fanfarrão e Retalho Escorregadio. O Lencinho fornece uma aura defensiva 3×3 que reduz 40% do dano de contatos e projéteis, enquanto o Tambor atinge três faixas e causa breve atordoamento. O Retalho muda de faixa uma vez antes de atingir a defesa.

**Chefe E18 (4-8):** a Baronesa das Cortinas é apresentada na última onda com barra de vida e padrão em estados controlados: marcha → aviso com faixa claramente destacada → projétil de cortina ou poeira reforçada → descanso vulnerável (+45% de dano). As faixas têm sinalização visual e sonora antes do ataque. O Lencinho mitiga o retalho; a Guarda-Chuva pode limpar a poeira; Tambor e Robô exploram o descanso.

**Narrativa:** C04 exibe quatro quadros após a primeira vitória em 4-8, mostra a abertura das cortinas, revela a ameaça do Grande Bicho-Papão e prepara o capítulo final. Pulável e com replay em Histórias, sem modificar o progresso ao ser vista.

**Compatibilidade:** saves v1.8 com fase 4-4 vencida abrem 4-5. Saves v1.6/v1.7 continuam migrando normalmente. Preservados IDs da campanha, estrelas, upgrades, decks, recordes, acessibilidade, PWA e HTML offline.

**Pendente:** Capítulo 5 (5-1…5-8), chefe final com três etapas, C05–C07, créditos, QA de vitória sem upgrades e medições reais em dispositivos móveis. O visual 3D em tempo real permanece experimental, e o jogo não depende dele.

## 12. Marco v2.0.0 — A Noite dos Mil Bocejos e FINAL da campanha

**Estado:** cinco capítulos jogáveis (40/40 fases), chefes dos cinco capítulos, oito cutscenes C00–C07, créditos e conclusão narrativa. A versão 1.6.0 permanece preservada na branch de checkpoint e constitui referência de rollback; este GDD mantém o histórico de versões anteriores sem reescrevê-las.

**Mecânica de sonho:** pulsos determinísticos e temporizados exclusivos do Capítulo 5, com 3 s de aviso e 6 s de efeito, alternando sonho rápido (inimigos mais velozes, brinquedos menos rápidos) e lento (inimigos mais lentos, brinquedos mais rápidos). Pausar congela pulsos. Não muda os cálculos do tabuleiro 5×9.

**Novos brinquedos:** T18 Bichinho Sonolento, T19 Bola-Ímã (puxa inimigos), T20 Boneco de Neve de Algodão, T21 Guitarrinha Desafinada (som e auxílio à equipe) e T22 Cavalinho de Madeira (projéteis perfurantes). Todas as cartas podem ser escolhidas via baralho após o desbloqueio real, sem romper Oficina ou campanhas antigas.

**Inimigos:** E19 Pijama Sussurrante, E20 Bocejo Corredor, E21 Sombrinha do Escuro, e E22 Grande Bicho-Papão (apenas na fase 5-8).

**Boss E22, três formas por vida restante:** forma 1 (acima de 67%: Sussurro) reduz temporariamente a cadência dos brinquedos da faixa avisada; forma 2 (67% a 34%: Espelhos) convoca reflexos; forma 3 (34% ou menos: Tempestade) lança dois projéteis de sombra. Cada padrão possui estados de marcha → aviso telegrafado → ataque → descanso, com +40% de dano recebido no descanso. A HUD destaca a faixa ameaçada e a forma atual.

**História:** C05 é exibida antes da primeira entrada em 5-8. Na vitória em 5-8, a progressão é salva antes do final; C06 mostra Lia acordando e o Coração restaurado, imediatamente seguida de C07 com créditos e gag de Seu Pião. Ambas podem ser puladas, e as oito cenas podem ser revistas após desbloqueio. A tela final oferece repetição de cenas e acesso à campanha existente. Nenhuma cena por si concede estrelas ou desbloqueia fases.

**Compatibilidade:** chave de salvamento `bvp-save-v1`, `campaignSize=40`, migração automática de saves anteriores mediante vitória no último capítulo disponível, e preservação de estrelas, upgrades, baralhos, galeria e modo sobrevivência. Não habilitar 3D em tempo real sem fallback.

**Etapas que ainda exigem validação adicional:** partidas completas de todos os 40 níveis sem melhorias, medição real de FPS, bateria, memória e interação em celulares Android intermediários; revisão de dificuldade após playtests; protótipo opcional 3D com fallback. Código do capítulo e testes automatizados não substituem playtest humano.

## 13. Marco v2.1.0 — polimento cinematográfico após a conclusão

**Objetivo:** elevar a qualidade percebida sem trocar o motor de colisão ou atrasar a narrativa com um port 3D integral.

**Apresentação dos chefes:** todos os cinco chefes recebem cores e luzes únicas, sinalização de chegada, barras mais claras e leitura distinta de marcha, aviso e descanso. O Grande Bicho-Papão tem três trechos de HP representados na HUD. O ataque da Tempestade informa as duas faixas afetadas **antes** de disparar, e os outros avisos seguem os estados reais do combate; não se alteram dano, HP, velocidades, progressão, posicionamento nem hitboxes neste marco.

**Cutscenes C00–C07:** câmeras 2.5D decorativas alternadas por quadro, enquadramento e letterbox, tratamento diferenciado dos créditos, avanço/retorno manual por botões e setas, progresso acessível e som sintetizado original. O usuário ainda pode pular cenas, ativar movimento reduzido e rever capítulos desbloqueados. Não existe vídeo ou modelo 3D obrigatório.

**Validação esperada:** tests/ com regressão de boss, oito cenas, PWA, HTML offline compilado e parsing Node; builds de workflow e publicação Pages após PR. Playtests integrais de 40 fases com jogadores reais e medições em Android ainda precisam ser executados antes de declarar polimento final concluído.

**Próximo passo recomendado:** separar o protótipo 3D opcional em branch/experimento com fallback automático 2D, sem introduzir WebGL obrigatório no jogo existente.

## 14. Marco v2.2.0 — 3D opt-in, auditoria e qualidade mensurável

**Protótipo GLB:** quatro modelos inéditos gerados como glTF binary v2 com malhas Low Poly, materiais simples e uma animação Idle por personagem; integrados nas cutscenes que já possuem essas artes. A escolha `cinematic3d` nasce **false** em todo save; a chave e a versão do save permanecem inalteradas. A criação 3D não muda story gates, script narrativo, música, dados de combate ou campanha.

**Fallback obrigatório:** o visualizador usa Three.js 0.170/GLTFLoader carregados sob demanda, apenas quando a preferência está ativada e o protocolo é HTTP(S). Os GLBs só podem ser buscados por URLs locais pré-definidas. Caso haja falha de biblioteca, de GLB, de WebGL ou de rede, a ilustração SVG original continua visível. `file://` desativa a tentativa, garantindo que `JOGAR-OFFLINE.html` funcione independente do CDN.

**Orçamento de render:** até 30 FPS, pixel ratio até 1,25, sem texturas externas e sem modelos de terceiros; o modelo é descarregado e o contexto liberado na troca de quadro/tela. Respeita movimento reduzido.

**Métricas reais do navegador:** uma opção `showPerf` mostra FPS médio e tempo médio de desenho Canvas da batalha. O código filtra intervalos altos por suspensão do navegador, mas não substitui telemetria profissional de CPU/GPU, memória, bateria ou WebGL.

**Auditoria estrutural:** `tools/audit_campaign.mjs` confere 40 fases, cinco chefes, dados de ondas, intervalos, recompensas, HP/escudo e pico de inimigos programados por janela de 30s, além de rodar um smoke lógico para detectar crashes. O relatório por capítulo é emitido em terminal e auditado no CI. Esses números não medem dificuldade sentida nem FPS em dispositivo.

**Próximas decisões:** playtest de 40 fases em aparelhos reais, confirmação dos quatro GLBs em navegadores móveis, melhoria opcional dos modelos artísticos e ajustes de dificuldade com métricas coletadas. Só ampliar a adoção 3D após testes, preservando fallback e checkpoints.

## 15. Marco v2.3.0 — QA de browser e prévia transparente de pressão

**Objetivo:** testar o carregamento dos quatro GLBs em um navegador real automatizado, impedir regressões quando CDN/WebGL falham e oferecer dados para orientar estratégias antes das 40 fases sem alterar o equilíbrio sem evidências.

**Renderização:** modo GLB somente opcional nas cutscenes, com tempo limite de 9s e fallback SVG ao falhar carregamento, WebGL ou contexto. Animação de Idle recebe pequeno balanço procedural. Movimento reduzido ainda mostra quadro estático. A chave de save e os quatro checkpoints anteriores são mantidos.

**Teste automatizado de navegador:** workflow independente executa Playwright em Chromium, com Three.js 0.170 fixo e entregue por interceptação local do CDN, testa GLTFLoader e arquivos GLB verdadeiros, falha de CDN, teclas e gestos em viewport mobile emulado, screenshots e dados do medidor de FPS. Emulação móvel não substitui aparelho físico. Se o ambiente não permitir WebGL/Chromium o workflow deve acusar falha em vez de simular aprovação.

**Prévia da dificuldade:** mostrar pressão do plano de ondas por fase: maior número programado em 30s, HP + escudo total e faixa mais visitada. Sem rótulos fáceis/difíceis inventados: não inclui reforços invocados, mudanças de caminho ou a estratégia do jogador.

**Próximas verificações humanas:** campanha completa sem upgrades em desktop e Android, fluidez/perda de GPU em celulares reais, medição de aquecimento e visual dos quatro modelos GLB com revisão artística.
