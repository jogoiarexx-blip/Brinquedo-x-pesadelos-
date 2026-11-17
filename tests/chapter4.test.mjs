import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { LEVELS,TOYS,ENEMIES } from '../src/data.js';
import { Battle } from '../src/engine.js';
import { BOARD,STEP,colX } from '../src/config.js';
import { loadSave,starWallet } from '../src/save.js';
import { buildBriefing } from '../src/briefing.js';
import { render,drawIconCanvas } from '../src/render.js';

const silent={play(){}};
const mockStorage=()=>({data:null,getItem(){return this.data;},setItem(k,v){this.data=v;}});
test('4-1 a 4-4 são fases reais, ordenadas e com dados de onda válidos',()=>{
  assert.equal(LEVELS.length,40);
  assert.deepEqual(LEVELS.slice(24,28).map(l=>l.id),['4-1','4-2','4-3','4-4']);
  assert.ok(LEVELS.slice(0,24).every(l=>l.chapter!==4));
  for(const [i,level] of LEVELS.slice(24,28).entries()){
    assert.equal(level.chapter,4);
    assert.ok(level.startingGlow>0);
    assert.ok(level.toys.length>0&&level.toys.length<=6);
    assert.ok(level.toys.every(id=>TOYS[id]));
    assert.ok(level.toys.some(id=>TOYS[id].damage>0));
    assert.ok(level.waves.length>=9);
    assert.ok(level.waves.every(w=>Number.isFinite(w.at)&&w.at<level.duration));
    assert.ok(level.waves.at(-1).flag);
    assert.ok(level.waves.every((w,k)=>k===0||w.at>level.waves[k-1].at));
    assert.ok(level.waves.every(w=>w.enemies.every(e=>ENEMIES[e.type]&&Number.isInteger(e.lane)&&e.lane>=0&&e.lane<BOARD.rows)));
    assert.ok(level.dust?.length>0);
    const spots=new Set(level.dust.map(([row,col])=>{assert.ok(Number.isInteger(row)&&row>=0&&row<BOARD.rows);assert.ok(Number.isInteger(col)&&col>=0&&col<BOARD.cols);return row+':'+col;}));
    assert.equal(spots.size,level.dust.length);
    const preview=buildBriefing(24+i);
    assert.equal(preview.dustCells,level.dust.length);
    assert.equal(preview.totalScheduled,level.waves.reduce((sum,w)=>sum+w.enemies.length,0));
  }
  assert.equal(LEVELS[24].reward,'T13');
  assert.equal(LEVELS[25].reward,'T14');
  assert.equal(LEVELS[26].reward,'T15');
  assert.equal(LEVELS[27].reward,null);
  assert.ok(!LEVELS.slice(24,28).some(l=>l.waves.some(w=>w.enemies.some(e=>ENEMIES[e.type].boss))));
});

test('poeira reduz em 15% a cadência sem travar escolhas ou combate antigo',()=>{
  const game=new Battle(24,silent);
  assert.equal(game.dust.size,5);
  assert.equal(game.isDusty(0,2),true);
  assert.equal(game.isDusty(0,0),false);
  assert.ok(game.place(0,0,'T02'));
  game.toyCooldowns.T02=0;
  assert.ok(game.place(0,2,'T02'));
  game.grid[0][0].timer=30;
  game.grid[0][2].timer=30;
  game.update(1);
  assert.ok(Math.abs(game.grid[0][0].timer-29)<1e-8);
  assert.ok(Math.abs(game.grid[0][2].timer-29.15)<1e-8);
  game.state='paused';
  const before=game.grid[0][2].timer;
  game.update(1);
  assert.equal(game.grid[0][2].timer,before);
  const original=new Battle(23,silent);
  assert.equal(original.dust.size,0);
  assert.equal(original.isDusty(0,2),false);
});

test('Boneca Guarda-Chuva limpa poeira e repara aliadas sem ultrapassar vida',()=>{
  const game=new Battle(25,silent);
  const before=game.dust.size;
  assert.ok(game.place(1,2,'T13'));
  assert.ok(game.dust.size<before);
  assert.equal(game.isDusty(0,1),false);
  assert.equal(game.isDusty(1,3),false);
  assert.equal(game.isDusty(2,2),false);
  assert.ok(game.place(1,1,'T02'));
  const soldier=game.grid[1][1];
  soldier.hp=50;
  game.grid[1][2].timer=0;
  game.update(STEP);
  assert.equal(soldier.hp,70);
  soldier.hp=soldier.maxHp-4;
  game.grid[1][2].timer=0;
  game.update(STEP);
  assert.equal(soldier.hp,soldier.maxHp);
});

test('Sombrinha Assobiadora causa dano e lentidão em até três faixas',()=>{
  const game=new Battle(26,silent);
  assert.ok(game.place(2,2,'T14'));
  game.spawnEnemy('E15',1);
  game.enemies.at(-1).x=colX(4);
  game.spawnEnemy('E15',4);
  game.enemies.at(-1).x=colX(4);
  const [hit,safe]=game.enemies;
  game.grid[2][2].timer=0;
  game.update(STEP);
  assert.equal(hit.hp,ENEMIES.E15.hp-game.toyStats.T14.damage);
  assert.ok(hit.slowTime>0);
  assert.equal(safe.hp,ENEMIES.E15.hp);
  assert.equal(safe.slowTime,0);
});

test('Robô de Lata tem vida própria, dispara munição perfurante e pode evoluir',()=>{
  const game=new Battle(27,silent,{}, {T15:2});
  assert.ok(game.place(2,1,'T15'));
  const robot=game.grid[2][1];
  assert.ok(robot.maxHp>TOYS.T15.maxHp);
  game.spawnEnemy('E16',2);game.enemies.at(-1).x=colX(5);
  game.grid[2][1].timer=0;
  game.update(STEP);
  assert.ok(game.projectiles.some(p=>p.kind==='pierce'&&p.piercesLeft===2));
  assert.ok(game.toyCooldowns.T15>0);
  assert.equal(game.toyStats.T15.rank,2);
});

test('save v1.7 que concluiu Vovô abre 4-1 mantendo estrelas, baralhos e Oficina',()=>{
  const raw={version:1,campaignSize:24,unlocked:24,stars:{'3-8':3,'1-1':3,'1-2':2},upgrades:{T02:1},decks:{'1-2':['T02','T01']},storySeen:['C00','C03']};
  const st=mockStorage();st.data=JSON.stringify(raw);
  const save=loadSave(st);
  assert.equal(save.campaignSize,40);
  assert.equal(save.unlocked,25);
  assert.equal(save.stars['3-8'],3);
  assert.equal(save.upgrades.T02,1);
  assert.deepEqual(save.decks['1-2'],['T02','T01']);
  assert.deepEqual(save.storySeen,['C00','C03']);
  assert.equal(starWallet(save).earned,8);
  st.data=JSON.stringify({...raw,stars:{'1-1':3}});
  assert.equal(loadSave(st).unlocked,24,'sem vitória não abrir o Sótão');
});

test('renderização do Sótão, novos personagens e perigo ambiental funcionam sem animação',()=>{
  const game=new Battle(27,silent);
  game.place(0,0,'T13');game.place(2,1,'T15');game.spawnEnemy('E15',2);game.spawnEnemy('E16',3);
  const snapshot=JSON.stringify(game);
  const gradient={addColorStop(){}},labels=[];
  const ctx=new Proxy({fillText:v=>labels.push(v)},{get:(o,k)=>k.startsWith('create')?()=>gradient:(o[k]??(()=>{})),set:(o,k,v)=>(o[k]=v,true)});
  assert.doesNotThrow(()=>render(ctx,game,false,false));
  for(const id of ['T13','T14','T15'])assert.doesNotThrow(()=>drawIconCanvas(ctx,id,0,0,.8,0));
  assert.equal(JSON.stringify(game),snapshot);
  const atlas=readFileSync(new URL('../assets/codex-atlas.svg',import.meta.url),'utf8');
  for(const id of ['toy-T13','toy-T14','toy-T15','enemy-E15','enemy-E16'])
    assert.ok(atlas.includes('id="'+id+'"'),id);
});

test('site e jogo independente usam v1.8 e não vazam módulo ES no offline',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../JOGAR-OFFLINE.html',import.meta.url),'utf8');
  assert.ok(main.includes('🕯 Capítulo 4'));
  assert.ok(main.includes('level-attic'));
  assert.ok(index.includes('v2.1.0'));
  assert.ok(sw.includes('brinquedos-vs-pesadelos-v2.1.0'));
  assert.ok(sw.includes('render.js?v=2.1.0'));
  assert.ok(html.includes('function drawAttic'));
  assert.ok(html.includes('function drawDustCells'));
  assert.ok(html.includes('A Boneca Guarda-Chuva'));
  const code=html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(code);
  assert.doesNotThrow(()=>new vm.Script(code[1],{filename:'JOGAR-OFFLINE.html'}));
  for(const path of ['src/data.js','src/engine.js','src/render.js','src/main.js','sw.js'])
    execFileSync(process.execPath,['--check',new URL('../'+path,import.meta.url).pathname]);
});
