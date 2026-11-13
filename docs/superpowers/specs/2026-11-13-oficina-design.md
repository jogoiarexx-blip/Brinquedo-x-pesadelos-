# Oficina de estrelas — desenho da implementação

Pedido: analisar o jogo existente e o GDD e melhorar brinquedos com estrelas das fases.

Preservar JavaScript modular e Canvas 2D, grade 5×9, os 20 níveis e IDs existentes, chave `bvp-save-v1` e campanha vencível sem upgrades (GDD §9). Não reescrever em Phaser nem prometer os 40 níveis do planejamento nesta entrega.

## Abordagens

- Melhorias temporárias durante a partida confundiriam estrelas de campanha e Brilhos.
- Árvore extensa exigiria rebalanceamento e muitos menus.
- Escolha de implementação: Oficina entre fases, três melhorias permanentes por brinquedo. Dá uso às estrelas preservando a partida atual.

## Regras

Cada brinquedo começa no nível 1 e pode chegar ao 4. Custos sucessivos: 2, 4 e 6 estrelas. Cada melhoria dá +15% da vida base e, quando aplicável, +10% do dano base. Abajur reduz intervalo de produção em 5% do valor base por melhoria; Pião aumenta duração do gelo em 10%; Soninho e Móbile aumentam duração do sono em 10%. Custo em Brilhos, recarga de colocação, ondas e inimigos mantidos.

Saldo = soma dos melhores resultados válidos das fases menos o custo das melhorias compradas. Repetir resultado não dá crédito; melhorar 1 para 3 dá apenas 2. Estrelas históricas são aproveitadas automaticamente. Melhorias só para brinquedos já liberados; efeitos entram na próxima batalha, com uma cópia de atributos por batalha. Pontuação no mapa nunca é consumida.

Mostrar saldo, conquistadas/gastas, nível atual, comparação de atributos e custo; botões bloqueados explicam a razão. Oficina acessível no menu, mapa e resultado. Compras só se confirmam em memória depois da gravação; falha de armazenamento informa o jogador sem gastar estrelas. Incluir redistribuição gratuita de todas as melhorias para não prender escolhas em campanha com orçamento finito.

## Correções verificáveis

- Normalizar estrelas, níveis e compras de saves antigos/corrompidos sem travar telas.
- Separar aleatoriedade de partículas da simulação: opções gráficas não podem mudar a partida.
- HTML independente incorpora também atlas da enciclopédia.
- Atualizar cache PWA e versão offline com os módulos novos.

## Validação

Testes de migração, crédito incremental, compra, limites, bloqueios, falha de gravação, redistribuição, atributos reais de combate e determinismo. Suíte existente de simulação das 20 fases. Playwright em desktop e celular, incluindo reload, resultado, pausa, versão independente e PWA offline. Android físico permanece uma validação externa.
