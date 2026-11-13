import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '../src/engine.js';
test('quatro novas fases são vencíveis sem melhorias, com economia e defesas reais',()=>{
  const order=[2,0,4,1,3];
  for(let k=20;k<24;k++){
    const b=new Battle(k),cnt=id=>b.allToys.filter(t=>t.type===id).length,can=id=>b.level.toys.includes(id)&&b.toyCooldowns[id]<=0;
    for(let n=0;n<21000&&b.state==='playing';n++){
      for(const star of [...b.stars])b.click(star.x,star.y);
      if(can('T01')&&b.glow>=50&&cnt('T01')<5)b.place(order[cnt('T01')],0,'T01');
      const priority=[...new Set([...b.enemies.map(e=>e.row),...b.level.waves.slice(b.waveIndex,b.waveIndex+3).flatMap(w=>w.enemies.map(e=>e.lane)),...order])];
      const place=(id,col,cost)=>{if(!can(id)||b.glow<cost)return;const lane=priority.find(r=>!b.grid[r][col]);if(lane!==undefined)b.place(lane,col,id);};
      place('T02',2,100);
      if(cnt('T02')>=4){place('T04',1,125);place('T05',4,175);place('T09',4,200);place('T10',4,150);place('T08',5,175);place('T12',3,175);place('T03',7,50);}
      if(cnt('T02')>=5&&b.glow>=250)place('T02',6,100);
      b.update(1/30);
    }
    assert.equal(b.state,'victory',`${b.level.id}: ${b.state} aos ${b.time.toFixed(1)}s; ${b.killCount} derrotados`);
    if(k===23)assert.equal(b.trainReady[2],true,'O chefe deve ser vencido por combate, preservando o trem da sua faixa.');
    assert.ok(Object.values(b.toyStats).every(toy=>toy.rank===0));
  }
});
