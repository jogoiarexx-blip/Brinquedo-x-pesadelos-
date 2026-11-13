import test from 'node:test';
import assert from 'node:assert/strict';
import * as saves from '../src/save.js';
import { Battle } from '../src/engine.js';
import { TOYS, LEVELS } from '../src/data.js';
const memory=(raw=null)=>({value:raw,getItem(){return this.value;},setItem(k,v){this.value=v;}});
const saved=(stars={'1-1':3},extra={})=>saves.loadSave(memory(JSON.stringify({version:1,unlocked:20,stars,...extra})));

test('estrelas históricas viram saldo e repetir vitória não duplica crédito',()=>{
  const save=saved({'1-1':1});
  assert.equal(saves.starWallet(save).available,1);
  saves.recordVictory(save,0,3);assert.equal(saves.starWallet(save).available,3);
  saves.recordVictory(save,0,2);assert.equal(saves.starWallet(save).available,3);
  const before=JSON.stringify(save);saves.recordVictory(save,-1,3);
  saves.recordVictory(save,0,NaN);assert.equal(JSON.stringify(save),before);
});
test('compra desconta uma vez, preserva recorde e sobrevive ao reload',()=>{
  const save=saved(),storage=memory();
  assert.equal(saves.purchaseUpgrade(save,'T02',storage).ok,true);
  assert.equal(save.upgrades.T02,1);assert.equal(save.stars['1-1'],3);
  assert.deepEqual(saves.starWallet(save),{earned:3,spent:2,available:1});
  assert.equal(saves.purchaseUpgrade(save,'T02',storage).ok,false);
  assert.equal(saves.loadSave(storage).upgrades.T02,1);
  assert.equal(saves.starWallet(saves.loadSave(storage)).available,1);
});
test('compra rejeita brinquedo bloqueado, ID inválido e nível máximo',()=>{
  const stars=Object.fromEntries(LEVELS.map(l=>[l.id,3])),save=saved(stars,{unlocked:1});
  assert.equal(saves.purchaseUpgrade(save,'T11',memory()).reason,'locked');
  assert.equal(saves.purchaseUpgrade(save,'inexistente',memory()).ok,false);
  for(let n=0;n<3;n++)assert.equal(saves.purchaseUpgrade(save,'T02',memory()).ok,true);
  assert.equal(saves.purchaseUpgrade(save,'T02',memory()).reason,'max');
  assert.equal(saves.starWallet(save).spent,12);
});
test('armazenamento bloqueado não consome estrelas nem confirma melhoria',()=>{
  const save=saved(),before=JSON.stringify(save);
  assert.equal(saves.purchaseUpgrade(save,'T02',{setItem(){throw Error('quota');}}).reason,'storage');
  assert.equal(JSON.stringify(save),before);
});
test('redistribuição devolve orçamento sem apagar vitórias e é persistida',()=>{
  const save=saved(),storage=memory();saves.purchaseUpgrade(save,'T02',storage);
  assert.equal(saves.resetUpgrades(save,storage),true);
  assert.equal(saves.starWallet(save).available,3);
  assert.equal(saves.loadSave(storage).stars['1-1'],3);
  assert.deepEqual(saves.loadSave(storage).upgrades,{});
});
test('save corrompido é normalizado sem perder progresso válido',()=>{
  const save=saved({'1-1':99,'1-2':-2,'1-3':'3','1-4':{},ghost:3},{unlocked:2.9,upgrades:{T02:999,T11:3,ghost:3},settings:{music:'yes',motion:false}});
  assert.equal(save.unlocked,2);assert.deepEqual(save.stars,{'1-1':3,'1-3':3});
  assert.deepEqual(save.upgrades,{});assert.equal(save.settings.music,true);assert.equal(save.settings.motion,false);
  assert.equal(saves.starWallet(save).available,6);
});
test('evolução afeta vida e dano real sem alterar brinquedo base ou custo',()=>{
  const game=new Battle(0,null,{}, {T02:1});game.place(2,1,'T02');
  assert.equal(game.grid[2][1].maxHp,138);assert.equal(game.glow,175);
  game.spawnEnemy('E01',2);game.enemies[0].x=game.grid[2][1].x+110;
  game.grid[2][1].timer=0;
  for(let i=0;i<12;i++)game.update(1/30);
  assert.equal(game.enemies[0].hp,78);assert.equal(TOYS.T02.damage,20);assert.equal(TOYS.T02.maxHp,120);
});
test('produção, gelo e sono evoluem e batalha copia melhorias ao iniciar',()=>{
  const upgrades={T01:3,T03:2,T04:1,T07:2,T08:3},game=new Battle(19,null,{},upgrades);
  assert.equal(game.toyStats.T01.interval,18.7);assert.equal(game.toyStats.T03.maxHp,845);
  assert.equal(game.toyStats.T04.slowDuration,4.4);assert.equal(game.toyStats.T07.stunDuration,2.76);
  assert.equal(game.toyStats.T08.stunDuration,2.08);
  upgrades.T01=0;assert.equal(game.toyStats.T01.interval,18.7);
  assert.equal(new Battle(0).toyStats.T02.damage,20);
});
test('opções de partículas não mudam a sequência da simulação',()=>{
  const a=new Battle(0),b=new Battle(0);b.effectsEnabled=false;
  a.place(2,1,'T02');b.place(2,1,'T02');
  for(let i=0;i<190;i++){a.update(1/30);b.update(1/30);}
  assert.deepEqual(a.stars,b.stars);
  assert.equal(a.seed,b.seed);
});
