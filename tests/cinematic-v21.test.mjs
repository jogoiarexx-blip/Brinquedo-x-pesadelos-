import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {Battle} from '../src/engine.js';
import {ENEMIES,LEVELS} from '../src/data.js';
import {bossPresentationState,render} from '../src/render.js';
import {buildStoryScreen} from '../src/story-ui.js';
import {STORY_ORDER} from '../src/story.js';
import {loadSave,markStorySeen} from '../src/save.js';

const audio={play(){}};
const ctx=()=>{
  const gradient={addColorStop(){}},texts=[];
  const target={fillText(value){texts.push(String(value));}};
  const c=new Proxy(target,{get(o,k){return String(k).startsWith('create')?()=>gradient:(o[k]??(()=>{}));},set(o,k,v){o[k]=v;return true;}});
  return {c,texts};
};
const fakeStore=()=>({raw:null,getItem(){return this.raw;},setItem(k,v){this.raw=v;}});

test('cinco chefes possuem identidades visuais, nome e barra de vida próprios',()=>{
  const ids=['E05','E10','E14','E18','E22'];
  const accents=new Set();
  for(const id of ids){
    const boss={type:id,hp:ENEMIES[id].hp,maxHp:ENEMIES[id].hp,bossPhase:'march',row:2,age:0};
    const display=bossPresentationState(boss);
    assert.ok(display);
    assert.equal(display.name,ENEMIES[id].bossLabel);
    assert.ok(display.accent.startsWith('#'));
    assert.ok(display.hpFraction===1);
    assert.equal(display.phase,'march');
    accents.add(display.accent);
  }
  assert.equal(accents.size,5);
  assert.equal(bossPresentationState(null),null);
  assert.equal(bossPresentationState({type:'E01'}),null);
  assert.equal(bossPresentationState({type:'E22',hp:-100,maxHp:3100}).hpFraction,0);
});

test('ataques do chefe final destacam todas as faixas afetadas sem alterar IA',()=>{
  const b=new Battle(39,audio);
  b.spawnEnemy('E22',3);
  const boss=b.enemies.at(-1);
  boss.bossForm=3;boss.bossPhase='warning';boss.phaseTimer=1.2;boss.targetLane=3;
  const state=bossPresentationState(boss);
  assert.deepEqual(state.warningLanes,[3,2]);
  assert.equal(state.formName,'TEMPESTADE');
  assert.equal(state.warningSeconds,1.2);
  const snapshot=JSON.stringify(b),{c,texts}=ctx();
  assert.doesNotThrow(()=>render(c,b,false,false));
  assert.equal(JSON.stringify(b),snapshot);
  assert.ok(texts.some(x=>x.includes('FAIXAS 4 / 3')));
  assert.ok(texts.some(x=>x.includes('FAIXA 4')));
  assert.ok(texts.some(x=>x.includes('FAIXA 3')));
  boss.targetLane=0;
  assert.deepEqual(bossPresentationState(boss).warningLanes,[0]);
  boss.bossForm=2;boss.targetLane=3;
  assert.deepEqual(bossPresentationState(boss).warningLanes,[3]);
});

test('Vovô anuncia faixas adjacentes quando chama mini-poeiras e Baronesa destaca só a faixa alvo',()=>{
  const b=new Battle(23,audio);b.spawnEnemy('E14',2);
  const grandpa=b.enemies.at(-1);
  grandpa.bossPhase='warning';grandpa.nextAttack='dust';grandpa.phaseTimer=.9;
  assert.deepEqual(bossPresentationState(grandpa).warningLanes,[1,3]);
  grandpa.nextAttack='gust';
  assert.deepEqual(bossPresentationState(grandpa).warningLanes,[2]);
  const curtains=new Battle(31,audio);curtains.spawnEnemy('E18',1);
  const baroness=curtains.enemies.at(-1);baroness.bossPhase='warning';baroness.targetLane=4;
  assert.deepEqual(bossPresentationState(baroness).warningLanes,[4]);
  baroness.bossPhase='rest';
  assert.deepEqual(bossPresentationState(baroness).warningLanes,[]);
  assert.match(bossPresentationState(baroness).status,/CONTRA-ATAQUE/);
});

test('cinemática inclui 8 cenas, storyboard, créditos, avanço acessível e quadros anteriores',()=>{
  assert.equal(STORY_ORDER.length,8);
  for(const id of STORY_ORDER){
    const first=buildStoryScreen(id,0,false);
    assert.ok(first.includes('story-no-motion'));
    assert.ok(first.includes('story-camera-'));
    assert.ok(first.includes('aria-live="polite"'));
    assert.ok(first.includes('data-action="story-skip"'));
    assert.ok(first.includes('data-action="story-next"'));
    assert.ok(first.includes('role="progressbar"'));
    assert.ok(first.includes('aria-valuenow="25"'));
    assert.ok(!first.includes('data-action="story-prev"'));
    const second=buildStoryScreen(id,1,true);
    assert.ok(second.includes('data-action="story-prev"'));
    assert.ok(second.includes('aria-valuenow="50"'));
    assert.ok(!second.includes('story-no-motion'));
    assert.ok(buildStoryScreen(id,3).includes('aria-valuenow="100"'));
  }
  assert.ok(buildStoryScreen('C07',0).includes('story-credits-logo'));
  assert.ok(buildStoryScreen('C07',2).includes('FIM DA HISTÓRIA'));
  assert.equal(buildStoryScreen('C07',4),'');
  assert.equal(buildStoryScreen('C01',-1),'');
  assert.equal(buildStoryScreen('C01',1.2),'');
});

test('novas apresentações não mudam save legado, estrelas ou controle das cenas',()=>{
  const s=fakeStore(),save=loadSave(s);
  const originalUnlock=save.unlocked,originalStars=JSON.stringify(save.stars);
  assert.equal(markStorySeen(save,'C00',s).ok,true);
  assert.equal(save.unlocked,originalUnlock);
  assert.equal(JSON.stringify(save.stars),originalStars);
  assert.deepEqual(loadSave(s).storySeen,['C00']);
});

test('sons de entrada e fase são acionados pelos eventos corretos do combate',()=>{
  const played=[],spy={play:id=>played.push(id)};
  const b=new Battle(39,spy);
  b.spawnEnemy('E22',2);
  assert.ok(played.includes('boss-arrival'));
  const enemy=b.enemies.at(-1);
  enemy.x=650;enemy.hp=enemy.maxHp*.65;
  b.update(1/30);
  assert.ok(played.includes('boss-phase'));
  enemy.phaseTimer=0;
  b.update(1/30);
  assert.ok(played.includes('boss-attack'));
  assert.equal(LEVELS.length,40);
});

test('PWA e arquivo offline incluem visual, áudio e navegação sem imports externos',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const renderSource=readFileSync(new URL('../src/render.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const offline=readFileSync(new URL('../JOGAR-OFFLINE.html',import.meta.url),'utf8');
  assert.ok(main.includes("action==='story-prev'"));
  assert.ok(main.includes("event.key==='ArrowLeft'"));
  assert.ok(main.includes("audio.play('story-turn')"));
  assert.ok(renderSource.includes('export function bossPresentationState'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(css.includes('story-camera-credits'));
  assert.ok(sw.includes('brinquedos-vs-pesadelos-v2.1.0'));
  assert.ok(index.includes('v2.1.0'));
  assert.ok(offline.includes('function drawBossWarningCountdown'));
  assert.ok(offline.includes('function bossPresentationState'));
  assert.ok(offline.includes('story-credits-logo'));
  const script=offline.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(script);
  assert.doesNotThrow(()=>new vm.Script(script[1],{filename:'JOGAR-OFFLINE.html'}));
  for(const src of ['src/render.js','src/main.js','src/story-ui.js','src/engine.js','src/audio.js','sw.js'])
    execFileSync(process.execPath,['--check',new URL('../'+src,import.meta.url).pathname]);
});
