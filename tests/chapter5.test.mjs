import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {LEVELS,TOYS,ENEMIES} from '../src/data.js';
import {Battle} from '../src/engine.js';
import {BOARD,STEP,colX} from '../src/config.js';
import {loadSave,recordVictory,starWallet,unlockedToys} from '../src/save.js';
import {buildBriefing} from '../src/briefing.js';
import {STORY_ORDER,getStory,storyForVictory,canReplayStory} from '../src/story.js';
import {buildStoryScreen} from '../src/story-ui.js';
import {render,drawIconCanvas} from '../src/render.js';

const audio={play(){}};
const store=()=>({text:null,getItem(){return this.text;},setItem(key,value){this.text=value;}});
test('campanha tem 40 fases, cinco capítulos de oito e chefes em seus finais',()=>{
  assert.equal(LEVELS.length,40);
  assert.deepEqual([1,2,3,4,5].map(ch=>LEVELS.filter(l=>(l.chapter||1)===ch).length),[8,8,8,8,8]);
  assert.deepEqual(LEVELS.slice(32).map(l=>l.id),['5-1','5-2','5-3','5-4','5-5','5-6','5-7','5-8']);
  assert.deepEqual(LEVELS.slice(32).map(l=>l.reward),['T18','T19','T20','T21','T22',null,null,null]);
  for(const [i,level] of LEVELS.slice(32).entries()){
    assert.equal(level.chapter,5);
    assert.ok(level.startingGlow>=600);
    assert.ok(level.waves.length>=10&&level.waves.at(-1).flag);
    assert.ok(level.waves.every((w,n)=>Number.isFinite(w.at)&&w.at<level.duration&&(n===0||w.at>level.waves[n-1].at)));
    assert.ok(level.toys.length>0&&level.toys.length<=6);
    assert.ok(level.toys.every(id=>TOYS[id]));
    assert.ok(level.toys.some(id=>TOYS[id].damage>0));
    assert.ok(level.waves.every(w=>w.enemies.every(e=>ENEMIES[e.type]&&e.lane>=0&&e.lane<BOARD.rows)));
    assert.ok(buildBriefing(i+32).totalScheduled>=level.waves.length);
  }
  assert.deepEqual([7,15,23,31,39].map(i=>LEVELS[i].waves.flatMap(w=>w.enemies.map(e=>e.type)).filter(id=>ENEMIES[id].boss)),
    [['E05'],['E10'],['E14'],['E18'],['E22']]);
  assert.ok(!LEVELS.slice(0,39).some(l=>l.waves.some(w=>w.enemies.some(e=>e.type==='E22'))));
});
test('pulsos de sonho anunciam antes, alternam rápido/lento e pausam sem progredir',()=>{
  const b=new Battle(32,audio);
  assert.equal(b.dreamPulse.phase,'idle');assert.equal(b.dreamPulse.nextAt,27);
  b.state='paused';b.update(120);assert.equal(b.time,0);
  b.state='playing';b.time=27;b.update(STEP);
  assert.equal(b.dreamPulse.phase,'warning');assert.equal(b.dreamPulse.kind,'rush');
  assert.match(b.banner,/SONHO ACELERANDO/);
  b.time=b.dreamPulse.until+.02;b.update(STEP);
  assert.equal(b.dreamPulse.phase,'active');
  b.time=b.dreamPulse.until+.02;b.update(STEP);
  assert.equal(b.dreamPulse.phase,'idle');
  assert.equal(b.dreamPulse.count,1);
  b.time=b.dreamPulse.nextAt+.02;b.update(STEP);
  assert.equal(b.dreamPulse.phase,'warning');assert.equal(b.dreamPulse.kind,'lull');
  assert.equal(new Battle(31,audio).dreamPulse,null);
});
test('Bola-Ímã aplica dano e recuo com limite, sem atravessar o cenário',()=>{
  const b=new Battle(34,audio);
  assert.ok(b.place(2,2,'T19'));
  b.spawnEnemy('E20',2);
  const enemy=b.enemies.at(-1);enemy.x=colX(5);
  const x=enemy.x,hp=enemy.hp;
  b.grid[2][2].timer=0;b.update(STEP);
  assert.equal(enemy.hp,hp-TOYS.T19.damage);
  assert.ok(enemy.x>x);
  assert.ok(enemy.x<=colX(8)+BOARD.cw);
});
test('Guitarrinha danifica três faixas, ajuda vizinhos e não afeta faixa distante',()=>{
  const b=new Battle(36,audio);
  assert.ok(b.place(2,2,'T21'));
  assert.ok(b.place(2,3,'T02'));
  const ally=b.grid[2][3];ally.timer=4;
  for(const row of [1,2,3,4]){b.spawnEnemy('E19',row);b.enemies.at(-1).x=colX(5);}
  b.grid[2][2].timer=0;b.update(STEP);
  for(const enemy of b.enemies.slice(0,3))assert.equal(enemy.hp,ENEMIES.E19.hp-TOYS.T21.damage);
  assert.equal(b.enemies[3].hp,ENEMIES.E19.hp);
  assert.ok(ally.timer<4-.5);
});
test('Cavalinho dispara ferraduras que perfuram três pesadelos',()=>{
  const b=new Battle(37,audio);
  assert.ok(b.place(2,2,'T22'));
  b.spawnEnemy('E20',2);b.enemies.at(-1).x=colX(5);
  b.grid[2][2].timer=0;b.update(STEP);
  assert.ok(b.projectiles.some(p=>p.kind==='pierce'&&p.piercesLeft===3&&p.damage>=44));
  assert.ok(b.grid[2][2].maxHp>=TOYS.T22.maxHp);
});
test('Bicho-Papão percorre sussurro, espelhos e tempestade com aviso e descanso vulnerável',()=>{
  const b=new Battle(39,audio);
  assert.ok(b.place(2,2,'T02'));
  b.spawnEnemy('E22',2);
  const boss=b.enemies.at(-1);boss.x=colX(7);
  assert.equal(boss.bossForm,1);
  boss.phaseTimer=0;b.update(STEP);
  assert.equal(boss.bossPhase,'warning');
  assert.equal(boss.targetLane,2);
  assert.match(b.banner,/SUSSURRO/);
  const timer=boss.phaseTimer;
  b.state='paused';b.update(4);assert.equal(boss.phaseTimer,timer);
  b.state='playing';b.update(1.81);
  assert.equal(boss.bossPhase,'rest');
  assert.ok(b.grid[2][2].webTime>0);
  assert.equal(b.bossDamageMultiplier(boss),1.4);
  boss.hp=boss.maxHp*.65;b.update(STEP);
  assert.equal(boss.bossForm,2);
  boss.phaseTimer=0;b.update(STEP);
  assert.match(b.banner,/ESPELHOS/);
  b.update(1.81);
  assert.ok(b.enemies.some(e=>e.type==='E19'));
  assert.ok(b.enemies.some(e=>e.type==='E20'));
  boss.hp=boss.maxHp*.3;b.update(STEP);
  assert.equal(boss.bossForm,3);
  boss.phaseTimer=0;b.update(STEP);
  assert.match(b.banner,/TEMPESTADE/);
  b.update(1.81);
  assert.ok(b.curtainShots.some(shot=>shot.kind==='dream'));
  assert.ok(b.curtainShots.length<=3);
});
test('vitória na fase 5-8 encerra o combate e dá estrelas sem perder progresso',()=>{
  let event=null;
  const b=new Battle(39,audio,{end:(result,stars)=>{event={result,stars};}});
  b.waveIndex=b.level.waves.length;
  b.enemies.length=0;b.trains.length=0;
  b.update(STEP);
  assert.equal(b.state,'victory');assert.deepEqual(event,{result:'victory',stars:3});
  const save=loadSave(store());recordVictory(save,39,3);
  assert.equal(save.unlocked,40);assert.equal(save.stars['5-8'],3);
});
test('cenas C05 antes do boss, C06 final e C07 créditos são acessíveis só com progresso real',()=>{
  assert.deepEqual(STORY_ORDER,['C00','C01','C02','C03','C04','C05','C06','C07']);
  assert.equal(storyForVictory('5-8'),'C06');
  assert.equal(storyForVictory('5-7'),null);
  for(const id of ['C05','C06','C07']){
    assert.equal(getStory(id).slides.length,4);
    assert.ok(buildStoryScreen(id,0,false).includes('story-no-motion'));
    assert.ok(buildStoryScreen(id,3).includes('story-skip'));
  }
  const save=loadSave(store());
  assert.equal(canReplayStory(save,'C05'),false);assert.equal(canReplayStory(save,'C06'),false);assert.equal(canReplayStory(save,'C07'),false);
  save.unlocked=40;save.stars['5-7']=2;
  assert.equal(canReplayStory(save,'C05'),true);assert.equal(canReplayStory(save,'C06'),false);
  save.stars['5-8']=1;
  assert.equal(canReplayStory(save,'C06'),true);assert.equal(canReplayStory(save,'C07'),true);
});
test('save v1.9 completo abre 5-1 e mantém estrelas, upgrades, recordes e galeria',()=>{
  const st=store();st.text=JSON.stringify({version:1,campaignSize:32,unlocked:32,stars:{'4-8':3,'1-1':3,'1-2':2},
    upgrades:{T02:1},decks:{'1-2':['T02','T01']},storySeen:['C00','C04'],
    survival:{best:{waves:8,kills:22,seconds:143,score:1000},runs:2,deck:[]}});
  const save=loadSave(st);
  assert.equal(save.unlocked,33);assert.equal(save.campaignSize,40);
  assert.equal(save.stars['4-8'],3);assert.equal(save.upgrades.T02,1);
  assert.deepEqual(save.decks['1-2'],['T02','T01']);assert.deepEqual(save.storySeen,['C00','C04']);
  assert.equal(save.survival.best.waves,8);assert.equal(starWallet(save).earned,8);
  assert.ok(!unlockedToys(save).has('T18'),'não liberar novas cartas antes de vencer 5-1');
  recordVictory(save,32,3);assert.equal(save.unlocked,34);assert.ok(unlockedToys(save).has('T18'));
  st.text=JSON.stringify({version:1,campaignSize:32,unlocked:32,stars:{'4-7':3}});
  assert.equal(loadSave(st).unlocked,32,'sem 4-8 vencida não deve abrir 5-1');
});
test('novo cenário, personagens, avisos de chefe e fallback estático renderizam',()=>{
  const b=new Battle(39,audio);
  b.spawnEnemy('E22',2);const boss=b.enemies.at(-1);
  boss.x=colX(7);boss.bossPhase='warning';boss.targetLane=2;
  b.curtainShots.push({row:2,x:colX(6),y:320,damage:54,kind:'dream',age:0});
  b.dreamPulse.phase='active';b.dreamPulse.kind='lull';
  const before=JSON.stringify(b);
  const gradient={addColorStop(){}};
  const ctx=new Proxy({fillText(){}},{get:(obj,key)=>String(key).startsWith('create')?()=>gradient:(obj[key]??(()=>{})),set:(obj,key,value)=>(obj[key]=value,true)});
  assert.doesNotThrow(()=>render(ctx,b,false,false));
  for(const id of ['T18','T19','T20','T21','T22'])assert.doesNotThrow(()=>drawIconCanvas(ctx,id,0,0,.8,0));
  assert.equal(JSON.stringify(b),before);
  const atlas=readFileSync(new URL('../assets/codex-atlas.svg',import.meta.url),'utf8');
  for(const id of ['toy-T18','toy-T19','toy-T20','toy-T21','toy-T22','enemy-E19','enemy-E20','enemy-E21','enemy-E22'])
    assert.ok(atlas.includes('id="'+id+'"'),id);
});
test('site, PWA e HTML offline incluem campanha e final sem importações ES pendentes',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const offline=readFileSync(new URL('../JOGAR-OFFLINE.html',import.meta.url),'utf8');
  assert.ok(main.includes("index===39&&!hasSeenStory('C05')"));
  assert.ok(main.includes("presentStory('C07',resultScreen)"));
  assert.ok(main.includes("data-action")); // Menu actions / story controls remain wired
  assert.ok(main.includes("story-final-replay"));
  assert.ok(index.includes('v2.1.0'));assert.ok(sw.includes('brinquedos-vs-pesadelos-v2.1.0'));
  assert.ok(offline.includes('function drawDream('));
  assert.ok(offline.includes('updateDreamBoss(enemy,dt)'));
  assert.ok(offline.includes('C07:{'));
  const script=offline.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(script);assert.doesNotThrow(()=>new vm.Script(script[1],{filename:'JOGAR-OFFLINE.html'}));
  for(const path of ['src/data.js','src/engine.js','src/render.js','src/story.js','src/main.js','sw.js'])
    execFileSync(process.execPath,['--check',new URL('../'+path,import.meta.url).pathname]);
});
