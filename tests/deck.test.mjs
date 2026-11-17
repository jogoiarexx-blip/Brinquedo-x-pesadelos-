import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../src/data.js';
import { MAX_DECK,validDeck,deckForLevel } from '../src/deck.js';
import { loadSave,getDeck,saveDeck,resetDeck } from '../src/save.js';
import { Battle } from '../src/engine.js';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const quiet={play(){}};
const store=()=>({raw:null,getItem(){return this.raw;},setItem(key,value){this.raw=value;}});
test('baralhos originais continuam idênticos nas 40 fases',()=>{
  for(const [index,level] of LEVELS.entries()){
    const battle=new Battle(index,quiet);
    assert.deepEqual(battle.deck,level.toys);
    assert.deepEqual(Object.keys(battle.toyCooldowns),level.toys);
    assert.deepEqual(deckForLevel(index),level.toys);
  }
  assert.equal(MAX_DECK,6);
});
test('seleção permite 1 a 6 cartas distintas, com atacante e desbloqueio',()=>{
  const all=new Set(['T01','T02','T03','T04','T05','T06','T08']);
  assert.equal(validDeck(['T02'],all),true);
  assert.equal(validDeck(['T02','T01','T03','T04','T05','T06'],all),true);
  for(const input of [[],['T01'],['T03','T08'],['T02','T02'],['T02','T12'],['T02','nope'],['T02','T01','T03','T04','T05','T06','T08'],'T02',null])
    assert.equal(validDeck(input,all),false,JSON.stringify(input));
  assert.deepEqual(deckForLevel(0,['T12'],new Set(['T02'])),LEVELS[0].toys);
});
test('batalha usa o baralho escolhido em seleção, posicionamento e recarga',()=>{
  const deck=['T01','T02','T04'];
  const battle=new Battle(3,quiet,{}, {},deck,new Set(deck));
  assert.deepEqual(battle.deck,deck);
  assert.deepEqual(Object.keys(battle.toyCooldowns),deck);
  assert.equal(battle.selectToy('T04'),true);
  assert.equal(battle.selectToy('T05'),false);
  assert.equal(battle.place(2,2,'T05'),false);
  assert.equal(battle.place(2,2,'T04'),true);
  assert.equal(battle.grid[2][2].type,'T04');
});
test('baralho personalizado persiste e pode restaurar o padrão sem perder saves',()=>{
  const storage=store(),save=loadSave(storage);
  save.unlocked=24;save.stars={'1-1':3,'1-2':2};save.upgrades={T02:1};
  const chosen=['T02','T01','T05','T08','T10','T12'];
  assert.equal(saveDeck(save,0,chosen,storage).ok,true);
  assert.deepEqual(getDeck(save,0),chosen);
  assert.deepEqual(getDeck(loadSave(storage),0),chosen);
  assert.equal(loadSave(storage).stars['1-1'],3);
  assert.equal(loadSave(storage).upgrades.T02,1);
  assert.equal(resetDeck(save,0,storage).ok,true);
  assert.deepEqual(getDeck(loadSave(storage),0),LEVELS[0].toys);
});
test('recusa cartas não liberadas, repetidas, escolhas de fases bloqueadas e saves adulterados',()=>{
  const storage=store(),save=loadSave(storage);
  const before=JSON.stringify(save);
  assert.equal(saveDeck(save,2,['T02'],storage).ok,false);
  assert.equal(saveDeck(save,0,['T12'],storage).ok,false);
  assert.equal(saveDeck(save,0,['T02','T02'],storage).ok,false);
  assert.equal(JSON.stringify(save),before);
  const legacy=store();legacy.raw=JSON.stringify({version:1,campaignSize:24,unlocked:4,stars:{'1-1':2},decks:{'1-1':['T12'],'1-2':['T02','T01'],unknown:['T02']}});
  const restored=loadSave(legacy);
  assert.deepEqual(getDeck(restored,0),LEVELS[0].toys);
  assert.deepEqual(getDeck(restored,1),['T02','T01']);
  assert.equal(Object.hasOwn(restored.decks,'unknown'),false);
});
test('falha de armazenamento preserva estado sem salvar compras ou cartas',()=>{
  const storage={getItem:()=>null,setItem(){throw Error('blocked')}},save=loadSave(storage);
  const before=JSON.stringify(save);
  assert.deepEqual(saveDeck(save,0,['T02'],storage),{ok:false,reason:'storage'});
  assert.equal(JSON.stringify(save),before);
});
test('PWA e standalone incluem seleção e imports do novo módulo',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../JOGAR-OFFLINE.html',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const builder=readFileSync(new URL('../tools/build_standalone.py',import.meta.url),'utf8');
  assert.ok(main.includes('data-action="deck-toggle"'));
  assert.ok(main.includes('battle.deck.map('));
  assert.ok(main.includes('function toggleDeckToy'));
  assert.ok(html.includes('function deckForLevel'));
  assert.ok(html.includes('function toggleDeckToy'));
  assert.ok(sw.includes('deck.js?v=2.0.0'));
  assert.ok(builder.includes("'deck.js'"));
  for(const name of ['src/deck.js','src/save.js','src/engine.js','src/main.js','sw.js'])
    execFileSync(process.execPath,['--check',new URL('../'+name,import.meta.url).pathname]);
});
