import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, ENEMIES } from '../src/data.js';
import { SurvivalBattle,makeSurvivalWave,waveTime,SURVIVAL_INTERVAL } from '../src/survival.js';
import { loadSave,canPlaySurvival,getSurvivalDeck,saveSurvivalDeck,recordSurvivalRun,starWallet } from '../src/save.js';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const audio={play(){}};
const storage=()=>({text:null,getItem(){return this.text;},setItem(key,value){this.text=value;}});
test('geração determinística, horários e chefes a cada dez ondas',()=>{
  assert.equal(makeSurvivalWave(0),null);
  assert.equal(makeSurvivalWave(1.5),null);
  for(let n=1;n<=200;n++){
    const w=makeSurvivalWave(n);
    assert.deepEqual(w,makeSurvivalWave(n));
    assert.equal(w.at,waveTime(n));
    assert.equal(w.flag,n%5===0);
    assert.ok(w.enemies.length>=2&&w.enemies.length<=15);
    for(const e of w.enemies){
      assert.ok(ENEMIES[e.type],e.type);
      assert.ok(Number.isInteger(e.lane)&&e.lane>=0&&e.lane<5);
    }
    assert.equal(w.enemies.filter(e=>ENEMIES[e.type].boss).length,n%10===0?1:0);
    if(n>1)assert.equal(w.at-waveTime(n-1),SURVIVAL_INTERVAL);
  }
  assert.equal(makeSurvivalWave(10).enemies.at(-1).type,'E05');
  assert.equal(makeSurvivalWave(20).enemies.at(-1).type,'E10');
  assert.equal(makeSurvivalWave(30).enemies.at(-1).type,'E14');
});
test('motor chega a 35 ondas sem vitória nem alteração de campanha',()=>{
  const original=JSON.stringify(LEVELS);
  const deck=['T01','T02','T04','T05'];
  const game=new SurvivalBattle(audio,{}, {},deck,new Set(deck));
  game.effectsEnabled=false;
  assert.equal(game.mode,'survival');assert.deepEqual(game.deck,deck);
  assert.equal(game.glow,425);
  for(let n=1;n<=35;n++){
    game.time=waveTime(n)-0.005;
    game.update(0.01);
    assert.equal(game.waveReached,n,'onda '+n);
    assert.equal(game.state,'playing');
    assert.ok(game.level.waves.length-game.waveIndex>=2);
    game.enemies.length=0;game.projectiles.length=0;
  }
  assert.equal(JSON.stringify(LEVELS),original);
  assert.ok(game.progress>=0&&game.progress<=1);
});
test('liberação exige vitória 1-8 e só permite brinquedos já desbloqueados',()=>{
  const save=loadSave(storage());
  assert.equal(canPlaySurvival(save),false);
  save.unlocked=9;save.stars['1-8']=2;
  assert.equal(canPlaySurvival(save),true);
  assert.deepEqual(getSurvivalDeck(save),LEVELS[7].toys);
  assert.equal(saveSurvivalDeck(save,['T12'],storage()).ok,false);
  const s=storage();
  assert.equal(saveSurvivalDeck(save,['T01','T02'],s).ok,true);
  assert.deepEqual(loadSave(s).survival.deck,['T01','T02']);
});
test('recordes persistem e não geram estrelas de campanha',()=>{
  const store=storage(),save=loadSave(store);
  save.unlocked=9;save.stars['1-8']=3;save.stars['1-1']=2;
  const stars=starWallet(save).earned;
  let r=recordSurvivalRun(save,{waves:12,kills:90,seconds:235.6},store);
  assert.equal(r.ok,true);assert.equal(r.newRecord,true);
  assert.equal(r.run.waves,12);
  r=recordSurvivalRun(save,{waves:9,kills:300,seconds:550},store);
  assert.equal(r.ok,true);assert.equal(r.newRecord,false);
  const restored=loadSave(store);
  assert.equal(restored.survival.best.waves,12);
  assert.equal(restored.survival.runs,2);
  assert.equal(restored.stars['1-8'],3);
  assert.equal(starWallet(restored).earned,stars);
});
test('falha ao salvar ou recorde adulterado não alteram progresso',()=>{
  const broken={getItem:()=>null,setItem(){throw Error('quota')}},save=loadSave(broken);
  save.unlocked=9;save.stars['1-8']=3;
  const before=JSON.stringify(save);
  assert.equal(recordSurvivalRun(save,{waves:3,kills:2,seconds:10},broken).ok,false);
  assert.equal(saveSurvivalDeck(save,['T02'],broken).ok,false);
  assert.equal(JSON.stringify(save),before);
  assert.equal(recordSurvivalRun(save,{waves:-1,kills:4,seconds:1},storage()).reason,'invalid');
});
test('site e versão offline incluem a sobrevivência e seus arquivos',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const offline=readFileSync(new URL('../JOGAR-OFFLINE.html',import.meta.url),'utf8');
  const build=readFileSync(new URL('../tools/build_standalone.py',import.meta.url),'utf8');
  assert.ok(main.includes('function startSurvival'));
  assert.ok(main.includes("action==='survival'"));
  assert.ok(sw.includes('survival.js?v=1.6.0'));
  assert.ok(sw.includes('survival-ui.js?v=1.6.0'));
  assert.ok(build.includes("'survival.js'"));
  assert.ok(offline.includes('class SurvivalBattle'));
  assert.ok(offline.includes('function survivalSetup'));
  for(const name of ['src/survival.js','src/survival-ui.js','src/main.js','src/save.js','sw.js'])
    execFileSync(process.execPath,['--check',new URL('../'+name,import.meta.url).pathname]);
});
