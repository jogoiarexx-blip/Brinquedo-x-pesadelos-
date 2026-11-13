import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '../src/engine.js';
import {TOYS} from '../src/data.js';
import {render,drawIconCanvas} from '../src/render.js';

const quiet={play(){}};
function mockCanvas(){
  const gradient={addColorStop(){}};
  return new Proxy({},{
    get:(obj,key)=>(key==='createLinearGradient'||key==='createRadialGradient')?()=>gradient:(obj[key]??(()=>{})),
    set:(obj,key,value)=>(obj[key]=value,true)
  });
}

test('v0.7: renderizador desenha os três cenários com e sem movimento',()=>{
  for(const index of [0,8,16]){
    const battle=new Battle(index,quiet);
    assert.doesNotThrow(()=>render(mockCanvas(),battle,false,true),'capítulo da fase '+battle.level.id);
    assert.doesNotThrow(()=>render(mockCanvas(),battle,false,false),'modo reduzir movimento da fase '+battle.level.id);
  }
});

test('v0.7: todas as cartas recebem miniaturas desenhadas sem exceção',()=>{
  for(const [id,toy] of Object.entries(TOYS)){
    assert.doesNotThrow(()=>drawIconCanvas(mockCanvas(),id,48,52,.66,0),'miniatura '+toy.name);
  }
});

test('v0.7: a renderização não altera vida, posição ou estado da batalha',()=>{
  const battle=new Battle(16,quiet);
  battle.spawnEnemy('E01',2);
  const enemy=battle.enemies[0],before={x:enemy.x,hp:enemy.hp,state:battle.state,time:battle.time};
  render(mockCanvas(),battle,false,true);
  assert.deepEqual({x:enemy.x,hp:enemy.hp,state:battle.state,time:battle.time},before);
});
