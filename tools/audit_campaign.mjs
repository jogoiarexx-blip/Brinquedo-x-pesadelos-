#!/usr/bin/env node
// Auditoria reprodutível da campanha, sem dependência de serviços externos.
// node tools/audit_campaign.mjs; não simula playtest humano ou FPS de aparelho real.
import { LEVELS,TOYS,ENEMIES } from '../src/data.js';
import { Battle } from '../src/engine.js';
import { performance } from 'node:perf_hooks';

const safe=(v)=>Number.isFinite(v)&&v>=0;
const summary=[],issues=[],chapterAgg=new Map();
const ids=new Set(),newToys=new Set(),bosses=[];
const quiet={play(){}};
for(const [index,stage] of LEVELS.entries()){
  if(ids.has(stage.id))issues.push('ID repetido: '+stage.id);
  ids.add(stage.id);
  const chapter=Math.floor(index/8)+1,expected=chapter+'-'+(index%8+1);
  if(stage.id!==expected||(stage.chapter||1)!==chapter)issues.push('Ordem incorreta: '+stage.id+' esperado '+expected);
  if(!safe(stage.duration)||stage.duration<=0||!safe(stage.startingGlow))issues.push('Duração/Brilhos inválidos '+stage.id);
  if(!Array.isArray(stage.waves)||!stage.waves.length)issues.push('Sem ondas: '+stage.id);
  if(stage.reward){
    if(!TOYS[stage.reward]||newToys.has(stage.reward))issues.push('Recompensa inválida/repetida: '+stage.id);
    newToys.add(stage.reward);
  }
  if(!stage.toys?.length||stage.toys.length>6||stage.toys.some(id=>!TOYS[id]||!id))issues.push('Cartas inválidas: '+stage.id);
  let total=0,hp=0,prev=-1,maxBurst=0;
  const waves=[];
  for(const wave of stage.waves||[]){
    if(!safe(wave.at)||wave.at<=prev||wave.at>=stage.duration)issues.push('Tempo inválido: '+stage.id);
    prev=wave.at;
    const waveEnemies=wave.enemies||[];
    if(waveEnemies.some(enemy=>!ENEMIES[enemy.type]||!Number.isInteger(enemy.lane)||enemy.lane<0||enemy.lane>4))issues.push('Inimigo/faixa inválida: '+stage.id);
    total+=waveEnemies.length;
    hp+=waveEnemies.reduce((n,e)=>n+(ENEMIES[e.type]?.hp||0)+(ENEMIES[e.type]?.shield||0),0);
    waves.push({at:wave.at,enemies:waveEnemies.length});
    for(const enemy of waveEnemies)if(ENEMIES[enemy.type]?.boss)bosses.push({stage:stage.id,id:enemy.type});
  }
  for(const w of waves){
    const count=waves.filter(other=>other.at>=w.at&&other.at<w.at+30).reduce((n,other)=>n+other.enemies,0);
    maxBurst=Math.max(maxBurst,count);
  }
  const last=stage.waves.at(-1);
  if(!last?.flag)issues.push('Sem marcação de última onda: '+stage.id);
  if(stage.duration-last?.at<10)issues.push('Janela final menor que 10 segundos: '+stage.id);
  summary.push({id:stage.id,chapter,seconds:stage.duration,waves:stage.waves.length,enemies:total,hp,boss:stage.waves.some(w=>w.enemies.some(e=>ENEMIES[e.type]?.boss)),burst30:maxBurst});
  const agg=chapterAgg.get(chapter)||{chapter,levels:0,waves:0,enemies:0,hp:0,peakBurst:0,seconds:0};
  agg.levels++;agg.waves+=stage.waves.length;agg.enemies+=total;agg.hp+=hp;agg.seconds+=stage.duration;agg.peakBurst=Math.max(agg.peakBurst,maxBurst);
  chapterAgg.set(chapter,agg);
}
const expectedBosses=['E05','E10','E14','E18','E22'].map((id,i)=>({stage:(i+1)+'-8',id}));
if(JSON.stringify(bosses)!==JSON.stringify(expectedBosses))issues.push('Chefes fora da ordem/capítulos esperados');
if(LEVELS.length!==40)issues.push('Campanha diferente de 40 fases');
if(Object.keys(TOYS).length!==22)issues.push('Catálogo de brinquedos mudou: '+Object.keys(TOYS).length);
if(newToys.size===0)issues.push('Sem progressão de desbloqueios');

// Smoke-test lógico do motor: valida execução das 40 fases mesmo sem defender (não testa vencer).
const started=performance.now();let simulatedFrames=0;
for(let index=0;index<LEVELS.length;index++){
  const b=new Battle(index,quiet);
  const initial=b.level.id;
  for(let k=0;k<1200&&b.state==='playing';k++){b.update(1/30);simulatedFrames++;}
  if(b.level.id!==initial||!Number.isFinite(b.glow)||!Number.isFinite(b.time))issues.push('Simulação inválida: '+initial);
}
const simulationMs=Math.round((performance.now()-started)*10)/10;
const results={
  version:'2.2.0',levels:LEVELS.length,chapters:chapterAgg.size,
  toys:Object.keys(TOYS).length,enemies:Object.keys(ENEMIES).length,bosses,
  simulatedFrames,
  simulationWallTimeMs:simulationMs,
  chapterMetrics:[...chapterAgg.values()],warnings:issues,stages:summary
};
if(process.argv.includes('--json'))console.log(JSON.stringify(results,null,2));
else{
 console.log('# Auditoria automatizada da campanha — v2.2.0');
 console.log('Métrica da implementação, NÃO FPS de celular nem garantia de dificuldade perfeita.\n');
 console.log('| Capítulo | Fases | Ondas | Inimigos escalados | HP+Escudo programado | Maior pico 30 s |');
 console.log('|---|---:|---:|---:|---:|---:|');
 for(const c of results.chapterMetrics)console.log('| '+c.chapter+' | '+c.levels+' | '+c.waves+' | '+c.enemies+' | '+c.hp+' | '+c.peakBurst+' |');
 console.log('\nChefes:',bosses.map(b=>b.stage+':'+b.id).join(', '));
 console.log('Smoke lógico 40 fases:',simulationMs,'ms em Node (não comparável a FPS no navegador)');
 console.log('Problemas estáticos:',issues.length?issues.join('; '):'nenhum');
}
if(issues.length)process.exitCode=1;
