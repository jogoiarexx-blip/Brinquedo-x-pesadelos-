import test from 'node:test';
import assert from 'node:assert/strict';
import { Battle } from '../src/engine.js';
import { BOARD, colX, rowY } from '../src/config.js';
import { loadSave, recordVictory } from '../src/save.js';
const quiet={play(){}};
test('tabuleiro 5x9 e energia inicial',()=>{let g=new Battle(0,quiet);assert.equal(g.grid.length,5);assert.equal(g.grid[0].length,9);assert.equal(g.glow,275);});
test('colocar unidade consome energia e impede sobreposição',()=>{let g=new Battle(0,quiet);assert.equal(g.place(2,1),true);assert.equal(g.glow,175);assert.equal(g.place(2,1),false);});
test('colocação respeita recarga',()=>{let g=new Battle(0,quiet);g.place(2,1);assert.match(g.canPlace(3,1),/recarga/);for(let i=0;i<190;i++)g.update(1/30);assert.equal(g.canPlace(3,1),null);});
test('coletar brilho aumenta estoque e impede coleta duplicada',()=>{let g=new Battle(0,quiet);g.spawnStar(400,300,false);let before=g.glow;assert.equal(g.click(400,300),'star');assert.equal(g.glow,before+25);assert.equal(g.stars.length,0);});
test('projéteis derrotam monstro, sem bloquear movimento',()=>{let g=new Battle(0,quiet);g.place(2,1);g.spawnEnemy('E01',2);g.enemies[0].x=colX(4);for(let i=0;i<450;i++)g.update(1/30);assert.ok(g.killCount>=1);});
test('trenzinho é consumido e remove monstro da faixa',()=>{let g=new Battle(0,quiet);g.spawnEnemy('E01',1);g.enemies[0].x=BOARD.x-31;g.update(1/30);assert.equal(g.trainReady[1],false);for(let i=0;i<80;i++)g.update(1/30);assert.ok(g.killCount>=1);});
test('pausa congela ondas, dano e Brilhos',()=>{let g=new Battle(0,quiet);g.state='paused';g.update(25);assert.equal(g.time,0);assert.equal(g.waveIndex,0);assert.equal(g.glow,275);});
test('salvamento tolera dados corrompidos e registra progresso',()=>{const mock={getItem:()=>'{bad'};const s=loadSave(mock);assert.equal(s.unlocked,1);recordVictory(s,0,3);assert.equal(s.unlocked,2);assert.equal(s.stars['1-1'],3);});
test('sem derrota antecipada antes de aparecer a primeira onda',()=>{let g=new Battle(0,quiet);g.update(1/30);assert.equal(g.state,'playing');});

test('todas as ondas referenciam inimigos válidos, faixas válidas e horários crescentes',async ()=>{
  for(const level of (await import('../src/data.js')).LEVELS){
    let last=0;
    for(const wave of level.waves){assert.ok(wave.at>=last);last=wave.at;
      for(const foe of wave.enemies){assert.ok(foe.lane>=0&&foe.lane<5);assert.ok(['E01','E02'].includes(foe.type));}
    }
  }
});
test('três fases são vencíveis com coleta e defesa planejada', async ()=>{
  const {LEVELS}=await import('../src/data.js');
  for(let k=0;k<3;k++){
    const b=new Battle(k,quiet);
    const soldier=row=>b.grid[row].some(t=>t?.type==='T02');
    for(let n=0;n<12500&&b.state==='playing';n++){
      for(const s of [...b.stars])b.click(s.x,s.y);
      const producers=b.allToys.filter(t=>t.type==='T01').length;
      if(k>0&&b.glow>=50&&b.toyCooldowns.T01<=0&&producers<3)b.place([0,1,4][producers],0,'T01');
      if(b.glow>=100&&b.toyCooldowns.T02<=0){
        const priority=[...new Set([...b.enemies.map(e=>e.row),...LEVELS[k].waves.slice(b.waveIndex,b.waveIndex+2).flatMap(w=>w.enemies.map(e=>e.lane))])];
        const row=priority.find(r=>!soldier(r));if(row!==undefined)b.place(row,2,'T02');
      }
      b.update(1/30);
    }
    assert.equal(b.state,'victory',`A fase ${k+1} não foi vencida`);
  }
});
