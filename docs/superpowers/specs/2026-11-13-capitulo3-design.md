# Capítulo 3 completo — v1.3.0

Continuação autorizada pelo pedido «PROXIMA», seguindo a prioridade 1 da análise anterior e o GDD: completar 3-5 a 3-8 e Vovô Poeirão.

## Abordagens e escolha

Expandir apenas ondas repetidas acrescentaria duração sem as novidades do GDD. Reescrever motor e catálogos quebraria continuidade. Escolha: acrescentar quatro fases no final dos dados existentes, um brinquedo e três pesadelos, usando os sistemas atuais e habilidades com aviso.

## Conteúdo e regras

- 3-5 «O lençol que flutua»: introduz E12 Fantasma Enrolado (160 HP, 0,28 casa/s). O Móbile causa 60 de dano sonoro adicional nesse inimigo. Recompensa T12 Relógio Cuco.
- 3-6 «O cuco perdeu a hora»: introduz T12, custo 175 Brilhos, recarga 20 s, 120 HP. Pulso em três faixas e até três casas de distância horizontal: lentidão 35% por 5 s, intervalo 18 s, primeiro pulso em 3 s. Oficina melhora vida e duração, como os controles existentes.
- 3-7 «Três portas, nenhum sossego»: combina avisos de portas, fantasmas, ladrões e armaduras; sem novo desbloqueio.
- 3-8 «O espirro do Vovô»: E14 Vovô Poeirão, 1700 HP, 0,10 casa/s, resistência a sono/lentidão. Alterna dois ataques, sempre com aviso de 1,2 s: rajada que recua projéteis leves 120 px na faixa do chefe; espirro que gera duas E13 Poeirinhas Espirradas (35 HP) nas faixas vizinhas. Descansa 4 s depois de agir. Primeira ação após 6 s dentro do campo; próximas após 14 s de caminhada. Máximo de seis mini-poeiras vivas. Projéteis pesados, Cuco e Móbile oferecem respostas distintas.
- Aviso de faixa e intenção continua visível com movimento reduzido; simulação congela na pausa. A derrota cancela ações futuras do chefe.
- Manter 20 fases anteriores, grade 5×9, `bvp-save-v1`, estrelas, IDs e upgrades. Save adiciona `campaignSize` para migrar a antiga fronteira: jogador que terminou 3-4 recebe acesso imediato a 3-5; quem não terminou continua na 3-4.
- Campanha passa a 24 fases e 72 estrelas máximas; o novo brinquedo pode ser melhorado na Oficina depois de liberado.

## Apresentação e distribuição

Desenhos Canvas e retratos SVG próprios para os quatro personagens novos. Anúncio, aura, barra e derrota do novo chefe usam seus nomes corretos. Menus e final informam a quantidade real de fases. Distribuir v1.3.0 com todos os imports e caches versionados e standalone regenerado.

## Aceite

Novas fases vencíveis sem upgrades em simulação com posicionamento/coleta reais. Testes de pausa, gatilhos sem duplicação, resistência, limite de minions, migração e render normal/reduzido. Revisão independente antes de publicar e inspeção do jogo publicado. Não prometer desempenho em Android físico ou conclusão das 40 fases.
