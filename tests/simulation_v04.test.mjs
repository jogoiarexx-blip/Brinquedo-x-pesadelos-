import { Battle } from '../src/engine.js';
import assert from 'node:assert/strict';
import test from 'node:test';
const quiet={play(){}};
test('v0.4: todas as quatro fases do Capítulo 2 podem ser vencidas com economia e defesa planejadas',()=>{
for(let k=8;k<12;k++){
 const b=new Battle(k,quiet);
 const count=id=>b.allToys.filter(t=>t.type===id).length;
 const can=id=>b.level.toys.includes(id)&&b.toyCooldowns[id]<=0;
 let peak=0;
 for(let n=0;n<19000&&b.state==='playing';n++){
  for(const s of [...b.stars])b.click(s.x,s.y);
  if(can('T01')&&b.glow>=50&&count('T01')<5){b.place([0,4,1,3,2][count('T01')],0,'T01');}
  const priority=[...new Set([...b.enemies.map(e=>e.row),...b.level.waves.slice(b.waveIndex,b.waveIndex+3).flatMap(w=>w.enemies.map(e=>e.lane)),2,0,4,1,3])];
  if(can('T02')&&b.glow>=100){let r=priority.find(r=>!b.grid[r].some(t=>t?.type==='T02'));if(r!==undefined)b.place(r,2,'T02');else{r=priority.find(r=>!b.grid[r][3]);if(r!==undefined&&b.glow>=225)b.place(r,3,'T02');}}
  if(can('T04')&&b.glow>=125&&count('T02')>=3){let r=priority.find(r=>!b.grid[r].some(t=>t?.type==='T04')&&b.grid[r].some(t=>t?.type==='T02'));if(r!==undefined)b.place(r,1,'T04');}
  if(can('T06')&&b.glow>=150&&count('T02')>=4){let r=priority.find(r=>!b.grid[r].some(t=>t?.type==='T06')&&!b.grid[r][4]);if(r!==undefined)b.place(r,4,'T06');}
  if(can('T05')&&b.glow>=175&&count('T02')>=5){let r=priority.find(r=>!b.grid[r][4]);if(r!==undefined)b.place(r,4,'T05');}
  if(can('T07')&&b.glow>=125&&count('T02')>=5){let r=priority.find(r=>!b.grid[r].some(t=>t?.type==='T07')&&!b.grid[r][5]);if(r!==undefined)b.place(r,5,'T07');}
  b.update(1/30);peak=Math.max(peak,b.enemies.length);
 }
 assert.equal(b.state,'victory',`Falha na ${b.level.id}, t=${b.time.toFixed(1)}s`);
 assert.ok(b.killCount>0);
}
});
