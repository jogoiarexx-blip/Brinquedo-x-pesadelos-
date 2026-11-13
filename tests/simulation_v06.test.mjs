import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '../src/engine.js';
const audio={play(){}};
test('v0.6: quatro fases novas são vencíveis com defesa e coleta reais',()=>{
 const order=[2,0,4,1,3];
 for(let k=16;k<20;k++){
  const b=new Battle(k,audio),cnt=id=>b.allToys.filter(t=>t.type===id).length,can=id=>b.level.toys.includes(id)&&b.toyCooldowns[id]<=0;
  for(let n=0;n<18000&&b.state==='playing';n++){
   for(const s of [...b.stars])b.click(s.x,s.y);
   if(can('T01')&&b.glow>=50&&cnt('T01')<5)b.place(order[cnt('T01')],0,'T01');
   const priority=[...new Set([...b.enemies.map(e=>e.row),...b.level.waves.slice(b.waveIndex,b.waveIndex+3).flatMap(w=>w.enemies.map(e=>e.lane)),...order])];
   const place=(id,col,cost)=>{if(!can(id)||b.glow<cost)return;const lane=priority.find(r=>!b.grid[r][col]);if(lane!==undefined)b.place(lane,col,id);};
   place('T02',2,100);
   if(cnt('T02')>=4){place('T04',1,125);place('T09',4,200);place('T10',4,150);place('T06',3,150);place('T08',5,175);place('T07',5,125);place('T03',7,50);}
   if(cnt('T02')>=5&&can('T02')&&b.glow>=250)place('T02',6,100);
   b.update(1/30);
  }
  assert.equal(b.state,'victory','Fase '+b.level.id+' falhou aos '+b.time.toFixed(1)+' segundos');
 }
});
