import test from 'node:test';
import assert from 'node:assert/strict';
import { Battle } from '../src/engine.js';
import { render } from '../src/render.js';
const quiet={play(){}};
function canvasMock(){
  const gradient={addColorStop(){}};
  return new Proxy({},{
    get:(o,k)=>(k==='createLinearGradient'||k==='createRadialGradient')?()=>gradient:(o[k]??(()=>{})),
    set:(o,k,v)=>(o[k]=v,true)
  });
}
test('prévia do posicionamento não modifica a batalha',()=>{
  const game=new Battle(16,quiet),glow=game.glow;
  for(const id of game.level.toys){game.selected=id;game.hover={row:2,col:3};assert.doesNotThrow(()=>render(canvasMock(),game,false,true),id);}
  game.shovel=true;assert.doesNotThrow(()=>render(canvasMock(),game,false,false));
  assert.equal(game.glow,glow);assert.equal(game.allToys.length,0);assert.equal(game.time,0);
});
test('reduzir efeitos impede partículas decorativas sem impedir defesa',()=>{
  const game=new Battle(0,quiet);game.effectsEnabled=false;
  game.puff(250,300,'#fff',10);game.addImpact(260,300,'splash');
  assert.equal(game.particles.length,0);assert.equal(game.impacts.length,0);
  assert.equal(game.place(2,2,'T02'),true);assert.equal(game.grid[2][2].type,'T02');
  game.effectsEnabled=true;game.puff(250,300,'#fff',2);assert.equal(game.particles.length,2);
});
