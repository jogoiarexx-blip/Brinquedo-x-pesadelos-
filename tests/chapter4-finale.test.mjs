import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {LEVELS,TOYS,ENEMIES} from '../src/data.js';
import {Battle} from '../src/engine.js';
import {STEP,BOARD,colX} from '../src/config.js';
import {loadSave,starWallet,recordVictory} from '../src/save.js';
import {STORY_ORDER,getStory,storyForVictory,canReplayStory} from '../src/story.js';
import {buildStoryScreen} from '../src/story-ui.js';
import {buildBriefing} from '../src/briefing.js';
import {render,drawIconCanvas} from '../src/render.js';
const audio={play(){}};
const store=()=>({raw:null,getItem(){return this.raw;},setItem(k,v){this.raw=v;}});
test('32 fases, Capítulo 4 completo e chefe exclusivo da fase 4-8',()=>{
  assert.equal(LEVELS.length,32);
  assert.deepEqual(LEVELS.slice(24).map(l=>l.id),['4-1','4-2','4-3','4-4','4-5','4-6','4-7','4-8']);
  for(const level of LEVELS.slice(28)){
    assert.equal(level.chapter,4);
    assert.ok(level.toys.length>0&&level.toys.length<=6);
    assert.ok(level.toys.every(id=>TOYS[id]));
    assert.ok(level.toys.some(id=>TOYS[id].damage));
    assert.ok(level.waves.length>=10&&level.waves.at(-1).at<level.duration);
    assert.equal(level.waves.at(-1).flag,true);
    assert.ok(level.waves.every((wave,i)=>i===0||wave.at>level.waves[i-1].at));
    assert.ok(level.waves.every(wave=>wave.enemies.every(e=>ENEMIES[e.type]&&e.lane>=0&&e.lane<BOARD.rows)));
    assert.ok(level.dust.every(([row,col])=>row>=0&&row<5&&col>=0&&col<9));
    assert.equal(buildBriefing(LEVELS.indexOf(level)).totalScheduled,level.waves.reduce((n,w)=>n+w.enemies.length,0));
  }
  assert.deepEqual(LEVELS.slice(28).map(l=>l.reward),['T16','T17',null,null]);
  assert.ok(LEVELS[31].waves.at(-1).enemies.some(e=>e.type==='E18'));
  assert.ok(!LEVELS.slice(0,31).some(l=>l.waves.some(w=>w.enemies.some(e=>e.type==='E18'))));
});

test('Lencinho Invisível reduz dano de ataques de contato e não quebra a colocação',()=>{
  const b=new Battle(29,audio);
  assert.ok(b.place(2,2,'T16'));
  assert.ok(b.place(2,3,'T02'));
  const protectedToy=b.grid[2][3],hp=protectedToy.hp;
  assert.equal(b.protectionFactor(protectedToy),.60);
  b.spawnEnemy('E01',2);const e=b.enemies.at(-1);
  e.x=colX(3);e.attackTimer=0;
  b.update(STEP);
  assert.equal(protectedToy.hp,hp-Math.round(ENEMIES.E01.damage*.60));
  assert.ok(b.remove(2,2));
  assert.equal(b.protectionFactor(protectedToy),1);
});

test('Tambor Fanfarrão bate em três faixas, causa dano e respeita resistência',()=>{
  const b=new Battle(30,audio);
  assert.ok(b.place(2,2,'T17'));
  for(const row of [1,2,3,4]){
    b.spawnEnemy('E15',row);b.enemies.at(-1).x=colX(4);
  }
  b.grid[2][2].timer=0;b.update(STEP);
  for(const e of b.enemies.slice(0,3)){
    assert.equal(e.hp,ENEMIES.E15.hp-TOYS.T17.damage);
    assert.ok(e.stunTime>0);
  }
  assert.equal(b.enemies[3].hp,ENEMIES.E15.hp);
});

test('Retalho muda de faixa apenas uma vez e continua dentro do tabuleiro',()=>{
  const b=new Battle(28,audio);
  b.spawnEnemy('E17',2);const e=b.enemies.at(-1);
  e.x=colX(6);b.update(STEP);
  assert.notEqual(e.row,2);
  assert.ok(e.row>=0&&e.row<5);
  const row=e.row;
  b.update(STEP);assert.equal(e.row,row);
  assert.equal(e.fluttered,true);
});

test('Baronesa anuncia faixa, dispara um retalho e descansa vulnerável',()=>{
  const b=new Battle(31,audio);
  assert.ok(b.place(2,3,'T16'));
  assert.ok(b.place(2,4,'T02'));
  const soldier=b.grid[2][4],hp=soldier.hp;
  b.spawnEnemy('E18',2);const boss=b.enemies.at(-1);
  boss.x=colX(7);boss.phaseTimer=0;b.update(STEP);
  assert.equal(boss.bossPhase,'warning');
  assert.equal(boss.targetLane,2);
  assert.match(b.banner,/CORTINA NA FAIXA 3/);
  const warning=boss.phaseTimer;
  b.state='paused';b.update(2);assert.equal(boss.phaseTimer,warning);
  b.state='playing';b.update(1.7);
  assert.equal(boss.bossPhase,'rest');
  assert.equal(b.curtainShots.length,1);
  assert.equal(b.bossDamageMultiplier(boss),1.45);
  for(let i=0;i<90&&b.curtainShots.length;i++)b.update(STEP);
  assert.equal(b.curtainShots.length,0);
  assert.equal(soldier.hp,hp-Math.round(64*.60));
});

test('segundo ataque da Baronesa cobre casas com poeira, avisa e invoca reforço',()=>{
  const b=new Battle(31,audio);
  b.spawnEnemy('E18',2);const boss=b.enemies.at(-1);
  boss.x=colX(7);boss.phaseTimer=0;boss.nextAttack='dust';const before=b.dust.size;
  b.update(STEP);assert.equal(boss.bossPhase,'warning');
  b.update(1.7);
  assert.equal(boss.bossPhase,'rest');
  assert.ok(b.dust.size>=before);
  assert.equal(b.enemies.filter(e=>e.type==='E17').length,1);
});

test('danos durante descanso da Baronesa aumentam, sem afetar outras criaturas',()=>{
  const b=new Battle(31,audio);
  assert.ok(b.place(2,2,'T17'));
  b.spawnEnemy('E18',2);const boss=b.enemies.at(-1);
  boss.x=colX(4);boss.bossPhase='rest';boss.phaseTimer=5;
  b.grid[2][2].timer=0;
  b.update(STEP);
  assert.ok(Math.abs(boss.hp-(ENEMIES.E18.hp-TOYS.T17.damage*1.45))<1e-7);
  assert.equal(b.bossDamageMultiplier({type:'E15',bossPhase:'rest'}),1);
});

test('save v1.8 com vitória 4-4 libera 4-5 sem apagar stars, oficina e histórias',()=>{
  const storage=store();
  storage.raw=JSON.stringify({version:1,campaignSize:28,unlocked:28,stars:{'4-4':3,'1-1':3,'1-2':2},upgrades:{T02:1},
    decks:{'1-2':['T01','T02']},storySeen:['C03'],survival:{best:{waves:9,kills:23,seconds:160,score:1260},runs:2,deck:[]}});
  const save=loadSave(storage);
  assert.equal(save.campaignSize,32);assert.equal(save.unlocked,29);
  assert.deepEqual(save.decks['1-2'],['T01','T02']);
  assert.equal(save.upgrades.T02,1);
  assert.equal(save.stars['4-4'],3);
  assert.deepEqual(save.storySeen,['C03']);
  assert.equal(save.survival.best.waves,9);
  assert.equal(starWallet(save).earned,8);
  recordVictory(save,28,3);assert.equal(save.unlocked,30);
});

test('C04 aparece após 4-8, pode ser pulada/revista e não existe sem vitória',()=>{
  assert.deepEqual(STORY_ORDER,['C00','C01','C02','C03','C04']);
  assert.equal(storyForVictory('4-8'),'C04');
  assert.equal(storyForVictory('4-7'),null);
  assert.equal(getStory('C04').slides.length,4);
  assert.ok(buildStoryScreen('C04',0,false).includes('story-no-motion'));
  const save=loadSave(store());
  assert.equal(canReplayStory(save,'C04'),false);
  save.stars['4-8']=3;
  assert.equal(canReplayStory(save,'C04'),true);
  assert.ok(buildStoryScreen('C04',3).includes('story-skip'));
});

test('Canvas, bestiário e offline contêm chefe e mecânicas novas',()=>{
  const b=new Battle(31,audio);
  b.spawnEnemy('E18',2);b.enemies.at(-1).x=colX(7);
  b.enemies.at(-1).bossPhase='warning';b.enemies.at(-1).targetLane=2;
  b.curtainShots.push({row:2,x:colX(5),y:350,damage:64,age:0});
  const snapshot=JSON.stringify(b);
  const gradient={addColorStop(){}};
  const c=new Proxy({fillText(){}},{get:(o,k)=>k.startsWith('create')?()=>gradient:(o[k]??(()=>{})),set:(o,k,v)=>(o[k]=v,true)});
  assert.doesNotThrow(()=>render(c,b,false,false));
  for(const id of ['T16','T17'])assert.doesNotThrow(()=>drawIconCanvas(c,id,0,0,.8,0));
  assert.equal(JSON.stringify(b),snapshot);
  const atlas=readFileSync(new URL('../assets/codex-atlas.svg',import.meta.url),'utf8');
  for(const id of ['toy-T16','toy-T17','enemy-E17','enemy-E18'])
    assert.ok(atlas.includes('id="'+id+'"'),id);
  const offline=readFileSync(new URL('../JOGAR-OFFLINE.html',import.meta.url),'utf8');
  assert.ok(offline.includes('updateCurtainBoss(enemy,dt)'));
  assert.ok(offline.includes('Baronesa das Cortinas'));
  const script=offline.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(script);
  assert.doesNotThrow(()=>new vm.Script(script[1],{filename:'JOGAR-OFFLINE.html'}));
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  assert.ok(sw.includes('brinquedos-vs-pesadelos-v1.9.0'));
  for(const path of ['src/data.js','src/engine.js','src/render.js','src/main.js','src/story.js','sw.js'])
    execFileSync(process.execPath,['--check',new URL('../'+path,import.meta.url).pathname]);
});
