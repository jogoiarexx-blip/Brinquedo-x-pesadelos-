import {Battle} from '../src/engine.js';
import {LEVELS,TOYS,ENEMIES} from '../src/data.js';
import {colX,rowY} from '../src/config.js';
import {recordVictory,loadSave} from '../src/save.js';
import assert from 'node:assert/strict';
import test from 'node:test';
const quiet={play(){}};
test('v0.5: capítulo 2 completo, chefe só na 2-8 e recompensas',()=>{
 assert.ok(LEVELS.length>=16);
 assert.deepEqual(LEVELS.slice(8,16).map(l=>l.id),['2-1','2-2','2-3','2-4','2-5','2-6','2-7','2-8']);
 assert.equal(LEVELS[15].waves.filter(w=>w.enemies.some(e=>e.type==='E10')).length,1);
 assert.ok(LEVELS.slice(0,15).every(l=>!l.waves.some(w=>w.enemies.some(e=>e.type==='E10'))));
 assert.equal(LEVELS[11].reward,'T08');assert.equal(LEVELS[13].reward,'T09');
 for(const l of LEVELS){assert.ok(l.toys.length<=6);for(const w of l.waves)for(const e of w.enemies){assert.ok(ENEMIES[e.type]);assert.ok(e.lane>=0&&e.lane<5);}}
});
test('v0.5: móbile paralisa a sua faixa e vizinhas, mas não duas faixas de distância',()=>{
 const b=new Battle(12,quiet);b.place(2,2,'T08');const mobile=b.grid[2][2];
 for(let row=0;row<5;row++){b.spawnEnemy('E01',row);b.enemies[row].x=mobile.x+94;}
 mobile.timer=0;b.update(1/30);
 for(const enemy of b.enemies){if(Math.abs(enemy.row-2)<=1)assert.ok(enemy.stunTime>1);else assert.equal(enemy.stunTime,0);}
});
test('v0.5: estilingue de estrela atinge três faixas e respeita escudo',()=>{
 const b=new Battle(14,quiet);
 for(let row=0;row<5;row++){b.spawnEnemy('E07',row);b.enemies[row].x=colX(5);}
 b.projectiles.push({id:990,row:2,x:colX(5)-29,y:rowY(2)-12,damage:46,kind:'starburst',splashRadius:115,splashRatio:.5,hitIds:[],age:0});b.update(1/30);
 assert.equal(b.enemies[2].shield,39);for(const row of [1,3])assert.equal(b.enemies[row].shield,62);for(const row of [0,4])assert.equal(b.enemies[row].shield,85);
});
test('v0.5: aranha tece teia e penalidade de cadência expira',()=>{
 const b=new Battle(12,quiet);b.place(2,2,'T02');const toy=b.grid[2][2];
 b.spawnEnemy('E08',2);const e=b.enemies[0];e.x=toy.x+105;e.webTimer=0;b.update(1/30);
 assert.ok(toy.webTime>4);assert.ok(e.webTimer>8);toy.timer=3;b.update(1);assert.ok(toy.timer>2.3);
 b.killEnemy(e);b.update(4.2);assert.equal(toy.webTime,0);
});
test('v0.5: despertador acelera abaixo da metade da vida',()=>{
 const b=new Battle(13,quiet);b.spawnEnemy('E09',2);const e=b.enemies[0];e.x=colX(6);b.update(1/30);assert.equal(e.enraged,false);
 e.hp=89;const before=e.x;b.update(1);assert.equal(e.enraged,true);assert.ok(before-e.x>ENEMIES.E09.speed*80);
});
test('v0.5: chefe invoca quatro reforços em dois gatilhos sem duplicar',()=>{
 const b=new Battle(15,quiet);b.spawnEnemy('E10',2);const boss=b.enemies[0];boss.x=colX(6);
 boss.hp=boss.maxHp*.64;b.update(1/30);assert.equal(boss.summons,1);assert.equal(b.enemies.filter(e=>e.type==='E08').length,2);
 boss.hp=boss.maxHp*.29;b.update(1/30);assert.equal(boss.summons,2);assert.equal(b.enemies.filter(e=>e.type==='E09').length,2);
 for(let n=0;n<30;n++)b.update(1/30);assert.equal(boss.summons,2);assert.equal(b.totalSpawns,5);
});
test('v0.5: saves legados e desbloqueio preservam estrelas antigas',()=>{
 const save=loadSave({getItem:()=>JSON.stringify({version:1,unlocked:12,stars:{'2-4':3},settings:{music:false}})});
 assert.equal(save.unlocked,12);recordVictory(save,11,3);assert.equal(save.unlocked,13);
 assert.equal(save.stars['2-4'],3);recordVictory(save,15,2);assert.equal(save.unlocked,17);assert.equal(save.stars['2-8'],2);assert.equal(save.settings.music,false);
});
test('v0.5: desenho dos personagens inéditos sem exceção',async()=>{
 const {render}=await import('../src/render.js');const b=new Battle(15,quiet);
 for(const [i,id] of ['T08','T09'].entries()){b.grid[i+1][2]={id:i,type:id,row:i+1,col:2,x:colX(2),y:rowY(i+1),hp:TOYS[id].maxHp,maxHp:TOYS[id].maxHp,age:0,hit:0,webTime:1};}
 for(const [i,id] of ['E08','E09','E10'].entries()){b.spawnEnemy(id,i);b.enemies[i].x=colX(6);}
 const gradient={addColorStop(){}};const c=new Proxy({}, {get:(o,k)=>(k==='createLinearGradient'||k==='createRadialGradient')?()=>gradient:(o[k]??(()=>{})),set:(o,k,v)=>(o[k]=v,true)});
 assert.doesNotThrow(()=>render(c,b,false,true));
});
