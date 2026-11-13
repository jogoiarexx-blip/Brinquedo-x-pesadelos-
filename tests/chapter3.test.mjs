import test from 'node:test';
import assert from 'node:assert/strict';
import { Battle } from '../src/engine.js';
import { LEVELS,TOYS,ENEMIES } from '../src/data.js';
import { colX,rowY,BOARD_RIGHT,STEP } from '../src/config.js';
import { loadSave,recordVictory,starWallet,purchaseUpgrade } from '../src/save.js';
import { render,drawIconCanvas } from '../src/render.js';
const quiet={play(){}};
const tick=(b,seconds)=>{for(let n=0;n<Math.ceil(seconds/STEP);n++)b.update(STEP);};
function dustBattle(){const b=new Battle(0,quiet);b.spawnEnemy('E14',2);const boss=b.enemies[0];boss.x=colX(7);return {b,boss};}

test('Capítulo 3 tem conclusão jogável, recompensas e chefe somente na 3-8',()=>{
  assert.deepEqual(LEVELS.slice(20).map(l=>l.id),['3-5','3-6','3-7','3-8']);
  assert.equal(LEVELS[20].reward,'T12');assert.ok(LEVELS[21].toys.includes('T12'));
  assert.ok(!LEVELS.slice(0,23).some(l=>l.waves.some(w=>w.enemies.some(e=>e.type==='E14'))));
  assert.ok(LEVELS[23].waves.at(-1).enemies.some(e=>e.type==='E14'));
});
test('Cuco afeta três faixas dentro do alcance, não causa dano e respeita resistência',()=>{
  const b=new Battle(21,quiet);assert.ok(b.place(2,3,'T12'));
  for(const [type,row,col] of [['E01',1,5],['E01',2,5],['E01',3,5],['E01',0,5],['E01',2,8],['E14',3,5]]){
    b.spawnEnemy(type,row);b.enemies.at(-1).x=colX(col);
  }
  b.grid[2][3].timer=0;b.update(STEP);
  assert.ok(b.enemies.slice(0,3).every(e=>e.slowFactor===.65&&e.hp===100));
  assert.equal(b.enemies[3].slowTime,0);assert.equal(b.enemies[4].slowTime,0);
  assert.equal(b.enemies[5].slowFactor,.825);
});
test('Cuco preserva gelo mais forte e sua melhoria estende duração na Oficina',()=>{
  const b=new Battle(21,quiet,{}, {T12:2});assert.ok(b.place(2,3,'T12'));
  b.spawnEnemy('E01',2);const e=b.enemies[0];e.x=colX(5);e.slowFactor=.48;e.slowTime=7;
  b.grid[2][3].timer=0;b.update(STEP);
  assert.equal(e.slowFactor,.48);assert.ok(e.slowTime>6.9);
  assert.equal(b.toyStats.T12.slowDuration,6);assert.equal(b.toyStats.T12.maxHp,156);
});
test('Móbile é resposta sonora ao fantasma sem aumentar dano nos outros inimigos',()=>{
  const b=new Battle(20,quiet);assert.ok(b.place(2,3,'T08'));
  b.spawnEnemy('E12',2);b.spawnEnemy('E01',1);
  b.enemies.forEach(e=>e.x=colX(5));b.grid[2][3].timer=0;b.update(STEP);
  assert.equal(b.enemies[0].hp,100);assert.equal(b.enemies[1].hp,100);
  assert.ok(b.enemies[0].stunTime>0);
});
test('rajada do chefe só recua projéteis leves depois do aviso e abre descanso',()=>{
  const {b,boss}=dustBattle();tick(b,6.05);
  assert.equal(boss.bossPhase,'warning');assert.match(b.banner,/ESPIRR/i);
  const shot={id:500,row:2,x:boss.x-200,y:boss.y-12,damage:20,kind:'shooter',age:0};
  const heavy={...shot,id:501,kind:'splash'},other={...shot,id:502,row:0};
  b.projectiles.push(shot,heavy,other);
  const before=shot.x;b.update(STEP);assert.ok(shot.x>before);
  boss.phaseTimer=STEP/2;const old=shot.x,oldHeavy=heavy.x,oldOther=other.x;b.update(STEP);
  assert.ok(shot.x<old-100);assert.ok(heavy.x>oldHeavy);assert.ok(other.x>oldOther);
  assert.equal(boss.bossPhase,'rest');assert.equal(boss.attackCount,1);
  const x=boss.x;tick(b,1);assert.equal(boss.x,x);
});
test('segundo ataque sinalizado gera mini-poeiras só nas faixas vizinhas e apenas uma vez',()=>{
  const {b,boss}=dustBattle();boss.nextAttack='dust';boss.phaseTimer=0;b.update(STEP);
  assert.equal(boss.bossPhase,'warning');assert.equal(b.enemies.length,1);
  tick(b,1.25);
  assert.deepEqual(b.enemies.filter(e=>e.type==='E13').map(e=>e.row),[1,3]);
  tick(b,.5);assert.equal(b.enemies.filter(e=>e.type==='E13').length,2);
});
test('pausa congela aviso do chefe e morte antes do espirro cancela a invocação',()=>{
  const {b,boss}=dustBattle();boss.nextAttack='dust';boss.phaseTimer=0;b.update(STEP);
  b.state='paused';const timer=boss.phaseTimer,x=boss.x;tick(b,3);
  assert.equal(boss.phaseTimer,timer);assert.equal(boss.x,x);assert.equal(b.enemies.length,1);
  b.state='playing';b.killEnemy(boss);tick(b,2);
  assert.equal(b.enemies.filter(e=>e.type==='E13').length,0);assert.match(b.banner,/VOVÔ.*DERROTADO/);
});
test('invocação limita mini-poeiras e não usa faixas fora do tabuleiro',()=>{
  const {b,boss}=dustBattle();boss.row=0;boss.y=rowY(0);
  for(let n=0;n<6;n++){b.spawnEnemy('E13',1);b.enemies.at(-1).x=BOARD_RIGHT;}
  boss.nextAttack='dust';boss.phaseTimer=0;b.update(STEP);tick(b,1.25);
  assert.equal(b.enemies.filter(e=>e.type==='E13').length,6);
  assert.ok(b.enemies.every(e=>e.row>=0&&e.row<5));
});
test('save antigo no fim da campanha abre 3-5 preservando estrelas e melhorias',()=>{
  const load=raw=>loadSave({getItem:()=>JSON.stringify(raw)});
  const raw={version:1,unlocked:20,stars:{'1-1':3,'3-4':3},upgrades:{T02:1},settings:{motion:false}};
  const s=load(raw);assert.equal(s.unlocked,21);assert.equal(s.upgrades.T02,1);
  assert.equal(starWallet(s).available,4);assert.equal(s.settings.motion,false);
  assert.equal(load({...raw,stars:{'1-1':3}}).unlocked,20);
  recordVictory(s,20,3);assert.equal(s.unlocked,22);
  assert.equal(purchaseUpgrade(s,'T12',{setItem(){}}).ok,true);
});
test('todos os dados novos apontam para ondas, brinquedos e avisos válidos',()=>{
  for(const level of LEVELS.slice(20)){
    assert.ok(level.toys.length<=6&&level.toys.every(id=>TOYS[id]));
    let last=0;for(const wave of level.waves){assert.ok(wave.at>last);last=wave.at;
      assert.ok(wave.enemies.every(e=>ENEMIES[e.type]&&e.lane>=0&&e.lane<5));
      if(wave.doorLane!==undefined)assert.ok(wave.enemies.some(e=>e.lane===wave.doorLane));
    }
  }
});
test('arte nova renderiza e intenção do chefe continua legível com movimento reduzido',()=>{
  const b=new Battle(23,quiet);b.place(2,2,'T12');
  for(const [i,id] of ['E12','E13','E14'].entries()){b.spawnEnemy(id,i+1);b.enemies.at(-1).x=colX(7);}
  const boss=b.enemies.at(-1);boss.bossPhase='warning';boss.nextAttack='dust';boss.row=2;
  const before=JSON.stringify(b);
  for(const motion of [true,false]){
    const text=[],gradient={addColorStop(){}};
    const c=new Proxy({fillText:value=>text.push(value)},{get:(o,k)=>k.startsWith('create')?()=>gradient:(o[k]??(()=>{})),set:(o,k,v)=>(o[k]=v,true)});
    render(c,b,false,motion);drawIconCanvas(c,'T12',0,0,1,0);
    assert.ok(text.includes('Vovô Poeirão'));
    assert.ok(text.some(value=>/MINI-POEIRAS/.test(value)));
  }
  assert.equal(JSON.stringify(b),before);
});
test('recomeçar fase reinicia o ciclo do chefe e Oficina cobra estrelas pelo Cuco',()=>{
  const {b,boss}=dustBattle();boss.phaseTimer=0;tick(b,1.3);assert.equal(boss.attackCount,1);
  const fresh=dustBattle();assert.equal(fresh.boss.attackCount,0);assert.equal(fresh.boss.nextAttack,'gust');
  const storage={value:JSON.stringify({version:1,campaignSize:24,unlocked:22,stars:{'3-5':3}}),getItem(){return this.value;},setItem(k,v){this.value=v;}};
  const s=loadSave(storage);assert.equal(purchaseUpgrade(s,'T12',storage).ok,true);
  assert.equal(starWallet(loadSave(storage)).available,1);assert.equal(loadSave(storage).upgrades.T12,1);
});
test('onda final preserva apresentação do Vovô em vez de sobrescrever com aviso genérico',()=>{
  const b=new Battle(23,quiet);b.time=b.level.waves.at(-1).at-STEP/2;b.update(STEP);
  assert.match(b.banner,/VOVÔ POEIRÃO/);
  assert.ok(b.enemies.some(e=>e.type==='E14'));
});
