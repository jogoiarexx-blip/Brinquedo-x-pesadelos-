# Capítulo 3 completo — ALFA 1.3.0

Próxima etapa da análise anterior: quatro fases novas, um brinquedo e três pesadelos. A campanha passa de 20 para 24 fases, com três capítulos completos, 12 brinquedos e 14 pesadelos (três chefes incluídos).

| Fase | Novidade |
|---|---|
| 3-5 — O lençol que flutua | Fantasma Enrolado, vulnerável ao Móbile; libera o Cuco |
| 3-6 — O cuco perdeu a hora | Pulso de lentidão em três faixas próximas |
| 3-7 — Três portas, nenhum sossego | Ondas mistas e avisos de portas em faixas diferentes |
| 3-8 — O espirro do Vovô | Vovô Poeirão e mini-poeiras |

## Novas estratégias

O Relógio Cuco custa 175 Brilhos, tem 120 de vida e recarga de colocação de 20 segundos. Depois do primeiro pulso em 3 segundos, age a cada 18 segundos: desacelera 35% por 5 segundos em até três faixas e três casas de alcance horizontal. Não causa dano. Sua vida e duração de lentidão evoluem na Oficina.

O Fantasma Enrolado tem 160 de vida e recebe 60 de dano sonoro quando alcançado pela canção do Móbile. Os outros brinquedos também podem derrotá-lo; não exige uma única resposta.

Vovô Poeirão tem 1700 de vida e alterna rajada e invocação, com aviso de 1,2 segundo e quatro segundos de descanso após cada ação. A rajada recua em 120 pixels tiros leves da faixa do chefe; confetes, carrinhos, estrelas e elásticos seguem funcionando, assim como Cuco e Móbile. A invocação cria duas mini-poeiras de 35 de vida nas faixas vizinhas, limitadas a seis vivas. As faixas ameaçadas ficam marcadas mesmo com animações reduzidas. Sono pode atrasar a preparação; o chefe resiste parcialmente a sono e lentidão.

## Continuidade e distribuição

- Save continua em `bvp-save-v1`; estrelas, escolhas da Oficina, opções e fases anteriores preservadas.
- Se 3-4 já estava concluída, 3-5 abre automaticamente. Se não, a antiga fronteira continua na 3-4.
- Novo campo `campaignSize` registra o tamanho da campanha para futuras expansões.
- Até 72 estrelas nas 24 fases; melhorias continuam opcionais e redistribuíveis.
- Menu e resultado exibem o número real de fases; mapa apresenta as oito fases do corredor.
- Novos personagens recebem arte Canvas e retratos SVG; atlas, CSS e imports são versionados juntos.
- HTML independente inclui todos os módulos e o atlas, regenerado para v1.3.0.
- Corrigido o anúncio de chefe que era sobrescrito pelo aviso genérico de grande onda.
- Menus sem batalha escondem o HUD vazio; seleção de fase não deixa controles de combate atrás do painel.

## Validação executada antes da publicação

- Linha de base: 63 testes aprovados. Nova suíte: 77 testes aprovados.
- Quatro fases novas vencidas por simulação com coleta e posicionamento pelas regras reais, sem upgrades e com os cinco trenzinhos preservados: 3-5 em 219 s, 3-6 em 235 s, 3-7 em 249 s e 3-8 em 292 s. O chefe foi vencido por combate. As simulações das 20 fases anteriores continuam aprovadas.
- Testados aviso antes da ação, projéteis leves/pesados, faixas adjacentes, limite de invocações, pausa, morte antes do espirro, reinício, resistência a controle e dano sonoro.
- Testados migração da antiga fronteira e compra/reload de melhoria do Cuco.
- Renderização de personagens, intenção e nome do chefe testados com movimento normal e reduzido, sem mutação do combate.
- Atlas SVG validado; JavaScript do standalone verificado e build regenerado.
- [Prévia de cenário preparado](capitulo3-previa.png) usa o renderizador real em Node. Não representa uma partida manual nem medição de desempenho.

Ainda faltam os capítulos 4 e 5, seleção de cartas, modos extras, testes em Android físico e teste dedicado de instalação PWA sem rede. A campanha de 40 fases do GDD não está concluída. Publicação verificada no GitHub Pages na revisão `1e44726`: os dois workflows e o deploy concluíram com sucesso. No navegador, confirmados menu v1.3.0, 24 botões de fases (incluindo 3-5 a 3-8), HUD escondido no mapa, Cuco na Oficina com duração da lentidão correta, melhoria antiga do Soldadinho N2 preservada e retratos novos carregados. Não apareceram erros do domínio do jogo no console consultado. A conta de teste só havia concluído 1-1; as batalhas novas e migração do final foram verificadas por simulação/testes, não por campanha manual no navegador.

[Captura dos personagens publicados](capitulo3-publicado.jpg).

## Próxima prioridade

Prévia de inimigos e seleção de cartas, preservando decks orientados nos tutoriais. Depois, exportação/importação de progresso e Capítulo 4.
