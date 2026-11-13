# Análise do jogo e do GDD — 13/11/2026

Base analisada: `ec460df` (ALFA 1.1.0). Entrega: ALFA 1.2.1, Oficina de estrelas e atualização de cache.

## Diagnóstico completo por área

| Área | Implementação existente | Diagnóstico / ação |
|---|---|---|
| Identidade | Quarto da Lia, monstros de pano, Canvas procedural, retratos SVG originais | Coerente com o tom do GDD. Reutilizar arte existente na Oficina evita downloads de imagens adicionais. |
| Campo e controles | Grade 5×9, cartas, toque e mouse, pá sem reembolso | Núcleo adequado; preservado. Celular ainda precisa de teste físico de tamanho de alvos. |
| Campanha | 1-1 a 2-8 e 3-1 a 3-4: 20 fases | Metade das 40 planejadas; esta atualização melhora todas as peças existentes, sem inventar que a campanha está completa. |
| Catálogo | 11 brinquedos, 11 pesadelos, incluindo dois chefes | Nomes e IDs diferem do catálogo preliminar, mas estão documentados nos adendos do GDD. Preservar os IDs de produção. |
| Chefes | Rei das Meias e Dama da Insônia; aura, anúncio e barra de vida | Dama tem dois gatilhos de reforços. Rei ainda tem comportamento mais simples que os dois padrões propostos. Vovô Poeirão e chefes dos capítulos 4 e 5 faltam. |
| Economia da batalha | Brilhos de 25, produção do Abajur, recarga por carta | Não misturar com estrelas permanentes. Custos, recargas e ondas preservados. |
| Progressão | Melhor resultado de 1–3 estrelas, desbloqueio linear | Estrelas antes não tinham utilidade além do mapa. Agora financiam melhorias opcionais. Vitória com menos estrelas nunca diminui o recorde. |
| Estratégia | Deck de cada fase é predeterminado, máximo seis cartas | Ainda falta seleção livre de cartas e prévia dos inimigos, previstas no GDD. Não exigir nova composição para avançar. |
| Dificuldade | Estratégias automatizadas vencem as 20 fases sem upgrades | Base mantida. Upgrades facilitam e ampliam escolhas; não aumentamos vida dos inimigos para compensar compras. Playtests humanos continuam necessários. |
| Salvamento | `localStorage`, chave `bvp-save-v1`, versão 1 | Normalização anterior aceitava estrelas inválidas e frações em desbloqueio. Corrigido. Compras/redistribuição só se confirmam após persistência bem-sucedida. Exportação/importação e backup continuam pendentes. |
| Determinismo | Simulação fixa a 30 Hz, PRNG por fase | Partículas consumiam o mesmo PRNG da lógica. Reproduzida diferença nos Brilhos com movimento reduzido; corrigida com gerador visual separado. |
| Animação | Recuo, caminhada, braços, expressões, impactos, limite de partículas | Preservada. Brinquedos evoluídos recebem pequenas estrelas na base e nível nas cartas. Sem novos assets pesados. |
| Desempenho | Fundos em cache Canvas, limites de partículas e impactos | Boa base para a escala atual. Há `filter/sort` e `grid.flat()` frequentes; otimizar por faixa somente com perfil real que justifique. Sem promessa de FPS em Android não medido. |
| Áudio | Web Audio procedural, música e efeitos com liga/desliga | Falta volume contínuo, mistura por grupo e trilha específica por capítulo conforme GDD. |
| Acessibilidade | Reduzir movimento, textos em português, foco visível, pausa ao perder foco | Oficina acrescenta tabelas com cabeçalhos, nomes de botões, estados de bloqueio e layout próprio no retrato. Faltam alto contraste, escala de UI e navegação integral do tabuleiro por teclado. |
| Menu e resultados | Jogar/continuar, mapa, enciclopédia, ajuda, opções | Oficina acessível no menu, mapa e vitória; volta ao lugar de origem. Resultado informa estrelas novas e saldo; não concede de novo ao voltar da Oficina. |
| Enciclopédia | Retratos SVG de todos os personagens, catálogo único | Faltam abas, Histórias e descoberta progressiva. Atlas externo não acompanhava o HTML único: agora incorporado no standalone. |
| PWA | Manifest, cache versionado, navegação online primeiro | Módulo de melhorias incluído no cache 1.2.0. O jogo mantém importações estáticas, sem trocar atributos de batalha em andamento. Fluxo explícito de aceite de atualização ainda é evolução futura. |
| Offline | HTML único gerado a partir de módulos | Inclui upgrades, CSS e atlas SVG. Não é APK Android nativo. |
| Extras e narrativa | Sem minigames, sobrevivência e quadrinhos de fim de capítulo | Continuam como entregas futuras; não escondidos atrás de estrelas. |
| Engenharia | JavaScript modular sem bibliotecas de execução, dois workflows de testes | Não trocar motor somente para imitar a stack sugerida. O jogo já tem arquitetura separada; testes ampliados na estrutura atual. Workflows duplicados são uma limpeza futura opcional. |

## Regras da Oficina

- Cada brinquedo começa no nível 1; três compras levam ao nível 4.
- Custos sucessivos de 2, 4 e 6 estrelas; custo total até o máximo: 12 por brinquedo.
- Saldo: melhores estrelas de todas as fases menos investimento nos brinquedos.
- As 20 fases oferecem até 60 estrelas. Como todas as melhorias custariam 132, há escolhas; redistribuir é gratuito e ilimitado.
- Repetir 3 estrelas não rende mais saldo. Melhorar de 1 para 3 rende duas novas.
- Estrelas já conquistadas antes desta versão têm o mesmo valor das novas.
- Um brinquedo bloqueado não pode ser evoluído; desbloqueio segue as fases existentes.
- Melhorias se aplicam no começo da próxima partida, sem modificar a batalha em andamento.
- Redistribuir zera somente as melhorias e devolve o investimento. Não apaga fases, estrelas, opções ou descobertas.

| Função | Bônus por melhoria, calculado sobre o valor base |
|---|---|
| Todos os brinquedos | +15% de vida; arredondamento para inteiro |
| Brinquedos com dano | +10% de dano |
| Abajur | −5% do intervalo de produção |
| Pião | +10% da duração do gelo |
| Boneca Soninho e Móbile | +10% da duração do sono |

Exemplo: Soldadinho no nível 2 tem 138 de vida e 22 de dano. No nível 4, 174 de vida e 26 de dano. Custo de colocação continua 100 Brilhos e recarga de colocação continua 6 segundos.

## Relação com o GDD

O §10 original excluía upgrades permanentes numéricos. O pedido atual do proprietário altera essa decisão: esta Oficina passa a ser uma extensão opcional. O requisito de não exigir grind (§8.3) permanece: as 20 fases continuam testadas sem bônus, estrelas não bloqueiam a história e todas as compras podem ser redistribuídas.

O GDD original e seus adendos também divergem entre si em nomes/IDs e no Capítulo 2. `src/data.js` e os adendos de produção representam o conteúdo efetivamente jogável. Não substituir IDs com base na tabela preliminar, pois isso quebraria saves e fases.

## Arquivos principais alterados

- `src/upgrades.js`: custos, limites e cópias dos atributos evoluídos.
- `src/save.js`: normalização, saldo, compra e redistribuição persistidas.
- `src/engine.js`: atributos por batalha e aleatoriedade visual separada.
- `src/main.js`, `src/style.css`, `src/render.js`: Oficina, resultados e níveis visuais.
- `sw.js`, `tools/build_standalone.py`, `JOGAR-OFFLINE.html`: distribuição e offline.
- `tests/upgrades.test.mjs`: regressões de economia e combate.
- `tools/browser_smoke.mjs`: verificação opcional de navegador com Playwright.

## Validação e limites

- Linha de base: 53 testes passando antes da mudança.
- Após Oficina, correção do PRNG e cache: 63 testes passando, incluindo simulações das 20 fases sem melhorias, migração, crédito incremental, compra, bloqueios, limite, armazenamento indisponível, redistribuição e dano/atributos reais.
- Build do standalone executado; novo HTML independente inclui atlas e módulos.
- Teste automatizado local de Chromium tentou iniciar, mas foi bloqueado pelo isolamento de sockets do executor (`socket() failed: Operation not permitted`). Não registrar esse teste como aprovado.
- Teste no navegador real: fase 1-1 concluída na v1.1.0 com duas estrelas, preparando migração real do progresso.
- Na atualização v1.2.0, reproduzido HTML novo com módulos antigos em cache. Correção v1.2.1: URLs de CSS/imports com versão e `Request.cache=reload` no precache. Novo teste falhou antes e passou depois da correção.
- Verificação manual no navegador do site principal v1.2.1: atualização a partir da v1.1.0, crédito das duas estrelas antigas, compra do Soldadinho nível 2 (138 de vida / 22 de dano), bloqueio por saldo insuficiente, recarga da página mantendo a compra, redistribuição devolvendo as duas estrelas, recorde de duas estrelas mantido no mapa, navegação Oficina↔mapa, início de fase com carta N2, colocação e pausa.
- HTML independente publicado também abriu e mostrou retratos e Oficina corretamente; isso verifica o bundle, mas não substitui desligar a rede e testar a instalação PWA.
- Os dois workflows de testes e a publicação Pages da revisão `6ee7ea3` concluíram com sucesso.
- Captura da Oficina no endereço principal: [oficina-v1.2.1.jpg](oficina-v1.2.1.jpg).
- Layout móvel, instalação PWA sem rede e fluxo vitória↔Oficina ainda precisam de playtest dedicado. A revisão independente não encontrou defeitos concretos de economia, atributos, navegação ou builder.
- Não foram medidos FPS/memória em aparelhos físicos, nem executados os playtests humanos do GDD. Não atribuir nota 90/100 ou chamar a campanha de completa.

## Ordem recomendada das próximas melhorias

1. Completar 3-5 a 3-8 e Vovô Poeirão com habilidades sinalizadas.
2. Prévia de inimigos, seleção de cartas e dicas situacionais sem interromper reprises.
3. Exportar/importar progresso, backup e aviso controlado de atualização PWA.
4. Sobrevivência simples depois de 1-8; em seguida, capítulos 4 e 5.
5. Medir Android físico antes de ampliar efeitos e quantidade de entidades.
