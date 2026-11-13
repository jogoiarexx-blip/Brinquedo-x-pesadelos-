import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '../src/engine.js';
import {LEVELS,TOYS,ENEMIES} from '../src/data.js';
import {colX,rowY} from '../src/config.js';
import {loadSave,recordVictory} from '../src/save.js';
const quiet={play(){}};

test('v0.6: fases 3-1 a 3-4, ondas e até seis cartas válidas',()=>{
 assert.ok(LEVELS.length>=20);
 assert.deepEqual(LEVELS.slice(16,20).map(l=>l.id),['3-1','3-2','3-3','3-4']);
 for(const l of LEVELS){assert.ok(l.toys.length<=6);for(const w of l.waves){
  assert.ok(w.enemies.every(e=>ENEMIES[e.type]&&e.lane>=0&&e.lane<5));
  if(w.doorLane!==undefined)assert.ok(w.enemies.some(e=>e.lane===w.doorLane));
 }}
 assert.equal(LEVELS[16].reward,'T10');assert.equal(LEVELS[18].reward,'T11');
});

test('v0.6: aviso de porta 5 s antes, apenas uma vez',()=>{
 const doors=[],b=new Battle(16,quiet,{door:l=>doors.push(l)});
 b.time=25.96;b.update(1/30);assert.equal(b.doorWarning,null);
 b.update(1/30);assert.equal(b.doorWarning.lane,0);
 assert.equal(b.waveIndex,1);assert.deepEqual(doors,[0]);
 for(let i=0;i<50;i++)b.update(1/30);
 assert.deepEqual(doors,[0]);assert.equal(b.waveIndex,1);
 b.time=31;b.update(1/30);assert.ok(b.enemies.some(e=>e.row===0));
});

test('v0.6: ricochete tem exatamente dois alvos na faixa',()=>{
 const b=new Battle(17,quiet);
 for(let i=0;i<4;i++){b.spawnEnemy('E01',2);b.enemies[i].x=colX(4)+i*45;}
 b.projectiles.push({id:100,row:2,x:colX(4)-27,y:rowY(2)-12,damage:33,kind:'ricochet',splashRadius:132,splashRatio:.58,piercesLeft:1,hitIds:[],age:0});
 b.update(1/30);
 assert.equal(b.enemies[0].hp,67);assert.ok(b.enemies[1].hp<100);
 assert.equal(b.enemies[2].hp,100);assert.equal(b.enemies[3].hp,100);
});

test('v0.6: armadilha demora armar, explode em três linhas, respeita escudo',()=>{
 const b=new Battle(19,quiet);assert.ok(b.place(2,4,'T11'));
 const box=b.grid[2][4];
 for(const lane of [0,1,2,3,4]){b.spawnEnemy('E07',lane);b.enemies[lane].x=box.x+55;}
 b.update(.65);assert.equal(b.grid[2][4],box);
 b.update(.45);assert.equal(b.grid[2][4],null);
 for(const e of b.enemies)if(Math.abs(e.row-2)<=1){assert.ok(e.hp<165);assert.equal(e.shield,0);}else{assert.equal(e.hp,165);assert.equal(e.shield,85);}
});

test('v0.6: ladrão remove só Brilho não coletado',()=>{
 const b=new Battle(18,quiet);b.spawnEnemy('E11',2);const e=b.enemies[0];e.x=colX(5);e.stealTimer=0;
 b.stars.push({id:100,x:e.x,y:e.y,initialY:e.y,targetY:e.y,age:2,dropTime:.9,value:25});
 const glow=b.glow;b.update(1/30);assert.equal(b.stars.length,0);
 assert.equal(b.glow,glow);assert.ok(e.stealTimer>7);
});

test('v0.6: save antigo preservado e 2-8 libera capítulo 3',()=>{
 const s=loadSave({getItem:()=>JSON.stringify({version:1,unlocked:16,stars:{'2-8':3},settings:{motion:false}})});
 recordVictory(s,15,3);assert.equal(s.unlocked,17);recordVictory(s,18,2);
 assert.equal(s.unlocked,20);assert.equal(s.stars['2-8'],3);assert.equal(s.settings.motion,false);
});

test('v0.6: cenário e desenhos novos sem erro de render',async()=>{
 const {render}=await import('../src/render.js');const b=new Battle(19,quiet);
 b.grid[1][2]={id:0,type:'T10',row:1,col:2,x:colX(2),y:rowY(1),hp:110,maxHp:110,hit:0,age:0,recoil:.21,webTime:0};
 b.grid[3][3]={id:1,type:'T11',row:3,col:3,x:colX(3),y:rowY(3),hp:135,maxHp:135,hit:0,age:3,armed:true,webTime:0};
 b.spawnEnemy('E11',2);b.enemies[0].x=colX(6);b.doorWarning={lane:2,until:20};
 const gr={addColorStop(){}};
 const c=new Proxy({}, {get:(o,k)=>(k==='createLinearGradient'||k==='createRadialGradient')?()=>gr:(o[k]??(()=>{})),set:(o,k,v)=>(o[k]=v,true)});
 assert.doesNotThrow(()=>render(c,b,false,true));assert.doesNotThrow(()=>render(c,b,false,false));
});
