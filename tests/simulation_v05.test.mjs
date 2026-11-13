import {Battle} from '../src/engine.js';
import assert from 'node:assert/strict';
import test from 'node:test';
const quiet={play(){}};
test('v0.5: quatro fases novas são vencíveis com economia e defesa planejadas',()=>{
 const order=[2,0,4,1,3];
 for(let k=12;k<16;k++){
  const b=new Battle(k,quiet);const count=id=>b.allToys.filter(t=>t.type===id).length;
  const can=id=>b.level.toys.includes(id)&&b.toyCooldowns[id]<=0;
  let peak=0;
  for(let n=0;n<18000&&b.state==='playing';n++){
   for(const s of [...b.stars])b.click(s.x,s.y);
   if(can('T01')&&b.glow>=50&&count('T01')<5)b.place(order[count('T01')],0,'T01');
   const lanes=[...new Set([...b.enemies.map(e=>e.row),...b.level.waves.slice(b.waveIndex,b.waveIndex+3).flatMap(w=>w.enemies.map(e=>e.lane)),...order])];
   const add=(id,col,cost)=>{if(!can(id)||b.glow<cost)return;const lane=lanes.find(l=>!b.grid[l][col]);if(lane!==undefined)b.place(lane,col,id);};
   add('T02',2,100);
   if(count('T02')>=4){add('T04',1,125);add('T09',4,200);add('T06',4,150);add('T08',5,175);add('T07',6,125);add('T03',7,50);}
   if(count('T02')>=5&&can('T02')&&b.glow>=225){const lane=lanes.find(l=>!b.grid[l][3]);if(lane!==undefined)b.place(lane,3,'T02');}
   b.update(1/30);peak=Math.max(peak,b.enemies.length);
  }
  assert.equal(b.state,'victory',`Falha na fase ${b.level.id} aos ${b.time.toFixed(1)}s`);
  assert.ok(b.killCount>0&&peak>=2);
 }
});
