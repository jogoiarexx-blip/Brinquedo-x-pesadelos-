# Auditoria técnica — Brinquedos vs. Pesadelos v2.2.0

Data: 17/11/2026. Escopo: motor da campanha completa de 40 fases, efeitos 3D opcionais nas cutscenes e orçamento de render.

## Resultados medidos no CI — integridade estrutural

| Capítulo | Fases | Ondas | Inimigos programados | HP + escudo | Pico de inimigos em 30 s |
|---|---:|---:|---:|---:|---:|
| 1 — O Armário | 8 | 70 | 181 | 23.235 | 10 |
| 2 — Debaixo da Cama | 8 | 74 | 195 | 36.070 | 9 |
| 3 — Corredor Rangente | 8 | 71 | 188 | 34.580 | 10 |
| 4 — Sótão Esquecido | 8 | 81 | 218 | 42.165 | 9 |
| 5 — Noite dos Mil Bocejos | 8 | 80 | 206 | 46.625 | 8 |
| **Total** | **40** | **376** | **988** | **182.675** | **10** |

Fonte: `npm run audit` executado com sucesso em <https://github.com/jogoiarexx-blip/Brinquedo-x-pesadelos-/actions/runs/44132818790>. A soma representa HP/escudo **programado para spawn**, não dano real de uma partida; os picos mostram eventos escalados em uma janela de 30 segundos, não contagem simultânea de inimigos vivos. Nenhum problema estrutural foi detectado. O smoke lógico foi executado em Node, não em celular.

**Interpretação:** o capítulo 5 possui o maior total de resistência e o capítulo 4 a maior quantidade de inimigos programados. O capítulo 3 usa mais mecânicas de corredor apesar de somar menos HP que o capítulo 2. Essas métricas ajudam a priorizar playtests, mas não comprovam que a progressão de dificuldade esteja correta.

## 1. O que foi efetivamente validado por código

- 40 fases em 5 capítulos de 8; cada fase com ondas válidas, inimigos e faixas existentes, intervalos ordenados e marcação de última onda.
- Chefes nas fases 1-8, 2-8, 3-8, 4-8 e 5-8; progressão de recompensas e baralhos preservada.
- Script \`npm run audit\` calcula total de inimigos escalados e HP+escudo por capítulo, quantidade de ondas e pico máximo programado em janela de 30 segundos. Também roda até 1.200 passos por fase sem ações do jogador, somente para detectar inconsistências fatais.
- Quatro GLBs binários próprios de aproximadamente 10–11 KB cada, com malha, materiais, animação e buffers reconhecidos por parser de testes.
- Preferências \`cinematic3d\` e \`showPerf\` são falsas por padrão e respeitam migração de saves da versão 2.1.
- \`JOGAR-OFFLINE.html\` permanece independente de rede para a experiência 2D; não tenta abrir o modo GLB em \`file://\`.
- PWA mantém biblioteca 3D de CDN fora da instalação/cache obrigatório. A compra, progresso, estrelas, ataques e colisões do jogo permanecem em Canvas 2D.

## 2. Reproduzir a auditoria

\`\`\`sh
npm test
npm run audit
node tools/audit_campaign.mjs --json
python3 tools/build_standalone.py
\`\`\`

O primeiro comando roda testes de dados, renders simulados, arquivos GLB e preservação de save. O segundo imprime uma tabela de cinco capítulos com ondas, inimigos escalados, HP+escudo total e pico por janela de 30 segundos. O terceiro devolve os números em JSON. O quarto gera a página standalone a partir dos módulos.

**Importante:** a simulação lógica de Node **não fornece FPS reais** e não confirma que todas as fases são vencíveis em todas as dificuldades e combinações de baralho.

## 3. Verificações de dispositivos ainda pendentes

| Ensaio | Procedimento | Critério sugerido | Status |
|---|---|---|---|
| Partida 2D em Android intermediário | 15 minutos com FPS habilitado | Mediana >=45 FPS, sem travamentos | Não testado em aparelho real |
| GLB ativo em Android | Rever C00, C04, C05, C06 | Quatro modelos animados quando suas cenas aparecem | Não testado em aparelho real |
| Falta de CDN/rede | Ativar 3D, bloquear conexão externa | Permanecer com SVG 2D e controles operantes | Cobertura lógica; teste browser pendente |
| WebGL indisponível | Forçar falha de contexto | SVG 2D continua visível | Cobertura lógica; teste browser pendente |
| Uso de GPU | Entrar/sair de 10 quadros GLB | Nenhum loop 3D fantasma / memory leak | Código inclui descarte; medição real pendente |
| Movimento reduzido | Ativar acessibilidade do SO | GLB estático e cenas sem animações | Cobertura de código; teste browser pendente |
| Equilíbrio sem Oficina | Vencer as 40 fases sem melhorias permanentes | Fases vencíveis com estratégias claras | Pendente |
| Chefes e progressão | Vencer cinco chefes, salvar e voltar | Cutscenes/recompensas corretas | Testes automatizados; jogo completo pendente |

## 4. Recomendações para o próximo ciclo

Priorizar partidas reais em celulares e verificar modelos GLB no navegador, antes de adicionar texturas, efeitos ou aumentar o número de modelos. Registrar FPS médio, menor FPS, aquecimento e tempo de carregamento por capítulo. Ajustar fases com evidência de playtests, não apenas pelo somatório de HP. Manter a chave de save e os checkpoints. O motor 3D permanece **experimental e desativado por padrão**.
