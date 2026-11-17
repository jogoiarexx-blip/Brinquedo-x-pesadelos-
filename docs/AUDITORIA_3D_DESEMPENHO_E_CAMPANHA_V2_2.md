# Auditoria técnica — Brinquedos vs. Pesadelos v2.2.0

Data: 17/11/2026. Escopo: motor da campanha completa de 40 fases, efeitos 3D opcionais nas cutscenes e orçamento de render.

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
