import test from 'node:test';
import assert from 'node:assert/strict';
import { Battle } from '../src/engine.js';
import { BOARD, colX, rowY } from '../src/config.js';
import { loadSave, recordVictory } from '../src/save.js';
const quiet={play(){}};
test('tabuleiro 5x9 e energia inicial',()=>{let g=new Battle(0,quiet);assert.equal(g.grid.length,5);assert.equal(g.grid[0].length,9);assert.equal(g.glow,275);});
test('colocar unidade consome energia e impede sobreposição',()=>{let g=new Battle(0,quiet);assert.equal(g.place(2,1),true);assert.equal(g.glow,175);assert.equal(g.place(2,1),false);});
test('colocação respeita recarga',()=>{let g=new Battle(0,quiet);g.place(2,1);assert.match(g.canPlace(3,1),/recarga/);for(let i=0;i<190;i++)g.update(1/30);assert.equal(g.canPlace(3,1),null);});
test('coletar brilho aumenta estoque e impede coleta duplicada',()=>{let g=new Battle(0,quiet);g.spawnStar(400,300,false);let before=g.glow;assert.equal(g.click(400,300),'star');assert.equal(g.glow,before+25);assert.equal(g.stars.length,0);});
test('projéteis derrotam monstro, sem bloquear movimento',()=>{let g=new Battle(0,quiet);g.place(2,1);g.spawnEnemy('E01',2);g.enemies[0].x=colX(4);for(let i=0;i<450;i++)g.update(1/30);assert.ok(g.killCount>=1);});
test('trenzinho é consumido e remove monstro da faixa',()=>{let g=new Battle(0,quiet);g.spawnEnemy('E01',1);g.enemies[0].x=BOARD.x-31;g.update(1/30);assert.equal(g.trainReady[1],false);for(let i=0;i<80;i++)g.update(1/30);assert.ok(g.killCount>=1);});
test('pausa congela ondas, dano e Brilhos',()=>{let g=new Battle(0,quiet);g.state='paused';g.update(25);assert.equal(g.time,0);assert.equal(g.waveIndex,0);assert.equal(g.glow,275);});
test('salvamento tolera dados corrompidos e registra progresso',()=>{const mock={getItem:()=>'{bad'};const s=loadSave(mock);assert.equal(s.unlocked,1);recordVictory(s,0,3);assert.equal(s.unlocked,2);assert.equal(s.stars['1-1'],3);});
test('sem derrota antecipada antes de aparecer a primeira onda',()=>{let g=new Battle(0,quiet);g.update(1/30);assert.equal(g.state,'playing');});

test('todas as ondas referenciam inimigos válidos, faixas válidas e horários crescentes',async ()=>{
  for(const level of (await import('../src/data.js')).LEVELS){
    let last=0;
    for(const wave of level.waves){assert.ok(wave.at>=last);last=wave.at;
      for(const foe of wave.enemies){assert.ok(foe.lane>=0&&foe.lane<5);assert.ok((await import('../src/data.js')).ENEMIES[foe.type]);}
    }
  }
});
test('três fases são vencíveis com coleta e defesa planejada', async ()=>{
  const {LEVELS}=await import('../src/data.js');
  for(let k=0;k<3;k++){
    const b=new Battle(k,quiet);
    const soldier=row=>b.grid[row].some(t=>t?.type==='T02');
    for(let n=0;n<12500&&b.state==='playing';n++){
      for(const s of [...b.stars])b.click(s.x,s.y);
      const producers=b.allToys.filter(t=>t.type==='T01').length;
      if(k>0&&b.glow>=50&&b.toyCooldowns.T01<=0&&producers<3)b.place([0,1,4][producers],0,'T01');
      if(b.glow>=100&&b.toyCooldowns.T02<=0){
        const priority=[...new Set([...b.enemies.map(e=>e.row),...LEVELS[k].waves.slice(b.waveIndex,b.waveIndex+2).flatMap(w=>w.enemies.map(e=>e.lane))])];
        const row=priority.find(r=>!soldier(r));if(row!==undefined)b.place(row,2,'T02');
      }
      b.update(1/30);
    }
    assert.equal(b.state,'victory',`A fase ${k+1} não foi vencida`);
  }
});


test('o capítulo 1 tem oito fases e o Rei das Meias aparece somente na batalha final', async ()=>{
  const {LEVELS, ENEMIES, TOYS}=await import('../src/data.js');
  assert.ok(LEVELS.length>=16);
  assert.ok(Object.keys(TOYS).length>=9);
  assert.ok(Object.keys(ENEMIES).length>=10);
  assert.ok(LEVELS[7].waves.some(w=>w.enemies.some(e=>e.type==='E05')));
  assert.equal(LEVELS.slice(0,7).some(l=>l.waves.some(w=>w.enemies.some(e=>e.type==='E05'))),false);
});

test('Pião de Geada desacelera e o efeito passa após quatro segundos',()=>{
  const b=new Battle(3,quiet);
  b.spawnEnemy('E02',2);const e=b.enemies[0];e.x=colX(5);
  b.projectiles.push({id:9000,row:2,x:colX(5)-30,y:rowY(2)-12,damage:15,kind:'slow',slowFactor:.48,slowDuration:4,age:0});
  b.update(1/30);
  assert.ok(e.slowFactor<1);assert.ok(e.slowTime>3.9);
  b.update(4.2);
  assert.equal(e.slowFactor,1);assert.equal(e.slowTime,0);
});

test('Canhão de Confetes atinge inimigos próximos e não outras faixas',()=>{
  const b=new Battle(5,quiet);
  b.spawnEnemy('E03',2);b.spawnEnemy('E03',2);b.spawnEnemy('E03',3);
  const [a,c,d]=b.enemies;a.x=colX(5);c.x=a.x+60;d.x=a.x;
  b.projectiles.push({id:9001,row:2,x:a.x-18,y:rowY(2)-12,damage:34,kind:'splash',splashRadius:95,splashRatio:.6,age:0});
  b.update(1/30);
  assert.ok(a.hp<a.maxHp);assert.ok(c.hp<c.maxHp);assert.equal(d.hp,d.maxHp);
  assert.ok(a.hp<c.hp,'acerto central causa dano maior');
});

test('progresso salvo antigo continua válido e pode desbloquear a fase 1-8',()=>{
  const raw=JSON.stringify({version:1,unlocked:3,stars:{'1-1':3,'1-2':2},seenEnemies:['E01'],settings:{music:false}});
  const storage={getItem:()=>raw};const s=loadSave(storage);
  assert.equal(s.unlocked,3);assert.equal(s.stars['1-1'],3);assert.equal(s.settings.music,false);
  for(let i=2;i<8;i++)recordVictory(s,i,2);
  assert.equal(s.unlocked,9);assert.equal(s.stars['1-8'],2);
});

test('todas as 8 fases podem ser vencidas com estratégia de produção, defesa e tiro',()=>{
  for(let k=0;k<8;k++){
    const b=new Battle(k,quiet);
    const can=id=>b.level.toys.includes(id)&&b.toyCooldowns[id]<=0;
    const count=id=>b.allToys.filter(t=>t.type===id).length;
    for(let n=0;n<16000&&b.state==='playing';n++){
      for(const s of [...b.stars])b.click(s.x,s.y);
      if(can('T01')&&b.glow>=50&&count('T01')<5){const r=[0,4,1,3,2][count('T01')];b.place(r,0,'T01');}
      const priority=[...new Set([...b.enemies.map(e=>e.row),...b.level.waves.slice(b.waveIndex,b.waveIndex+2).flatMap(w=>w.enemies.map(e=>e.lane)),2,0,4,1,3])];
      if(can('T02')&&b.glow>=100){
        let r=priority.find(r=>!b.grid[r].some(t=>t?.type==='T02'));
        if(r!==undefined)b.place(r,2,'T02');
        else {r=priority.find(r=>!b.grid[r][3]);if(r!==undefined&&b.glow>=225)b.place(r,3,'T02');}
      }
      if(can('T04')&&b.glow>=125){const r=priority.find(r=>!b.grid[r].some(t=>t?.type==='T04')&&b.grid[r].some(t=>t?.type==='T02'));
        if(r!==undefined&&count('T02')>=4)b.place(r,1,'T04');}
      if(can('T05')&&b.glow>=175){const r=priority.find(r=>!b.grid[r][4]&&b.grid[r].some(t=>t?.type==='T02'));
        if(r!==undefined&&count('T02')>=5)b.place(r,4,'T05');}
      b.update(1/30);
    }
    assert.equal(b.state,'victory',`Fase ${b.level.id} não foi vencida; tempo ${b.time.toFixed(1)}s`);
    assert.ok(b.killCount>0);
  }
});

test('o renderizador suporta todas as cinco defesas, cinco monstros e projéteis novos',async ()=>{
  const {render}=await import('../src/render.js');
  const b=new Battle(7,quiet);
  for(const [row,id] of ['T01','T02','T03','T04','T05'].entries()){
    const d=(await import('../src/data.js')).TOYS[id];
    b.grid[row][2]={id:row,type:id,row,col:2,x:colX(2),y:rowY(row),hp:d.maxHp,maxHp:d.maxHp,hit:0,age:0};
  }
  for(const [row,id] of ['E01','E02','E03','E04','E05'].entries()){b.spawnEnemy(id,row);b.enemies[row].x=colX(6);}
  b.enemies[4].slowTime=2;
  b.projectiles.push({id:202,row:3,x:colX(4),y:rowY(3)-12,kind:'slow'});
  b.projectiles.push({id:203,row:4,x:colX(4),y:rowY(4)-12,kind:'splash'});
  const gradient={addColorStop(){}};
  const c=new Proxy({}, {get:(obj,key)=>(key==='createLinearGradient'||key==='createRadialGradient')?()=>gradient:(obj[key]??(()=>{})),set:(obj,key,value)=>(obj[key]=value,true)});
  assert.doesNotThrow(()=>render(c,b,false,true));
  assert.doesNotThrow(()=>render(c,null,true,true));
});

test('v0.3: coleta e colocação geram feedback curto, com limite de partículas',()=>{
  const b=new Battle(0,quiet);b.place(2,1);
  assert.ok(b.feedback.some(f=>f.text.includes('Defesa')));
  b.spawnStar(360,330,false);b.click(360,330);
  assert.ok(b.feedback.some(f=>f.text==='+25 ✦'));
  for(let i=0;i<65;i++)b.addFeedback(400,400,'+1');
  assert.ok(b.feedback.length<=32);
  b.update(1);
  assert.equal(b.feedback.length,0);
});

test('v0.3: disparo anima brinquedo, gera impacto e não altera o dano',()=>{
  const b=new Battle(0,quiet);b.place(2,1);
  const toy=b.grid[2][1];
  b.spawnEnemy('E01',2);const enemy=b.enemies[0];enemy.x=colX(4);
  let fired=false,impacted=false;
  for(let i=0;i<110;i++){b.update(1/30);fired||=toy.recoil>0;impacted||=b.impacts.length>0;}
  assert.ok(fired,'o soldado precisa recuar ao atirar');
  assert.ok(enemy.hp<enemy.maxHp);
  assert.ok(impacted,'a colisão precisa gerar impacto visual');
});

test('v0.3: inimigo derrotado deixa efeito visual temporário sem causar novo dano',()=>{
  const b=new Battle(0,quiet);b.spawnEnemy('E01',3);
  const victim=b.enemies[0];
  b.killEnemy(victim);
  assert.equal(b.enemies.length,0);
  assert.equal(b.defeated.length,1);
  b.update(1);
  assert.equal(b.defeated.length,0);
});


test('v0.4: capítulo 2 possui quatro fases, desbloqueio após 1-8 e salva estrelas corretamente',async()=>{
  const {LEVELS}=await import('../src/data.js');
  assert.deepEqual(LEVELS.slice(8,16).map(l=>l.id),['2-1','2-2','2-3','2-4','2-5','2-6','2-7','2-8']);
  assert.ok(LEVELS.slice(8,16).every(l=>l.chapter===2));
  const save=loadSave({getItem:()=>JSON.stringify({version:1,unlocked:8,stars:{'1-8':2},seenEnemies:[],settings:{}})});
  assert.equal(save.unlocked,8);
  recordVictory(save,7,3);assert.equal(save.unlocked,9);
  recordVictory(save,8,2);assert.equal(save.unlocked,10);
  assert.equal(save.stars['2-1'],2);assert.equal(save.stars['1-8'],3);
});

test('v0.4: Carrinho Cometa atravessa dois inimigos uma vez cada, sem acerto infinito',()=>{
  const b=new Battle(9,quiet);b.spawnEnemy('E03',2);b.spawnEnemy('E03',2);b.spawnEnemy('E03',2);
  const [a,c,d]=b.enemies;a.x=colX(4);c.x=colX(5);d.x=colX(6);
  b.projectiles.push({id:12345,row:2,x:a.x-35,y:rowY(2)-12,damage:28,kind:'pierce',piercesLeft:2,hitIds:[],age:0});
  for(let i=0;i<50;i++)b.update(1/30);
  assert.equal(a.hp,a.maxHp-28);assert.equal(c.hp,c.maxHp-28);assert.equal(d.hp,d.maxHp);
});

test('v0.4: escudo do Cabide Blindado absorve dano antes de sua vida',()=>{
  const b=new Battle(10,quiet);b.spawnEnemy('E07',2);const e=b.enemies[0];e.x=colX(5);
  for(let i=0;i<4;i++){
    b.projectiles.push({id:330+i,row:2,x:e.x-30,y:rowY(2)-12,damage:28,kind:'shooter',hitIds:[],age:0});
    b.update(1/30);
  }
  assert.equal(e.shield,0);assert.equal(e.hp,e.maxHp-27);
});

test('v0.4: Pula-Pula salta uma única defesa',()=>{
  const b=new Battle(8,quiet);b.place(2,4,'T03');b.toyCooldowns.T03=0;b.place(2,2,'T03');
  b.spawnEnemy('E06',2);const e=b.enemies[0];e.x=b.grid[2][4].x+67;
  b.update(1/30);assert.equal(e.jumped,true);assert.ok(e.x<b.grid[2][4].x-40);
  e.x=b.grid[2][2].x+63;b.update(1/30);assert.ok(e.x>b.grid[2][2].x+39,'segundo bloqueio não pode ser saltado');
});

test('v0.4: Soninho interrompe deslocamento e ataques e após efeito volta ao normal',()=>{
  const b=new Battle(11,quiet);b.spawnEnemy('E03',2);const e=b.enemies[0];e.x=colX(5);
  b.projectiles.push({id:1234,row:2,x:e.x-32,y:rowY(2)-12,damage:10,kind:'sleep',stunDuration:2.3,hitIds:[],age:0});
  b.update(1/30);assert.ok(e.stunTime>2);
  const x=e.x;b.update(1);assert.equal(e.x,x);b.update(1);assert.equal(e.x,x);
  b.update(.5);b.update(1/30);assert.ok(e.x<x);
});

test('v0.4: renderizador aceita novos brinquedos, inimigos e cenário noturno',async()=>{
  const {render}=await import('../src/render.js');const {TOYS}=await import('../src/data.js');
  const b=new Battle(11,quiet);
  for(const [i,id] of ['T06','T07'].entries()){
    b.grid[i][2]={id:i,type:id,row:i,col:2,x:colX(2),y:rowY(i),hp:TOYS[id].maxHp,maxHp:TOYS[id].maxHp,hit:0,age:0};
    b.spawnEnemy(i?'E07':'E06',i);b.enemies[i].x=colX(5);
  }
  b.enemies[0].jumpTime=.2;b.enemies[1].stunTime=1;
  const grad={addColorStop(){}};
  const c=new Proxy({}, {get:(o,k)=>(k==='createLinearGradient'||k==='createRadialGradient')?()=>grad:(o[k]??(()=>{})),set:(o,k,v)=>(o[k]=v,true)});
  assert.doesNotThrow(()=>render(c,b,false,true));
});


test('v0.9: todos os brinquedos renderizam com animação ligada e movimento reduzido',async()=>{
  const {render}=await import('../src/render.js');const {TOYS}=await import('../src/data.js');
  const b=new Battle(19,quiet);
  for(const [row,id] of Object.keys(TOYS).entries()){
    const d=TOYS[id];b.grid[row%5][Math.floor(row/5)]={id:row,type:id,row:row%5,col:Math.floor(row/5),x:colX(Math.floor(row/5)),y:rowY(row%5),hp:d.maxHp,maxHp:d.maxHp,hit:0,age:row*.31,recoil:row%2?.12:0,webTime:0,armed:row%3===0};
  }
  const gradient={addColorStop(){}};const ctx=new Proxy({}, {get:(o,k)=>(k==='createLinearGradient'||k==='createRadialGradient')?()=>gradient:(o[k]??(()=>{})),set:(o,k,v)=>(o[k]=v,true)});
  assert.doesNotThrow(()=>render(ctx,b,false,true));
  assert.doesNotThrow(()=>render(ctx,b,false,false));
});

test('v0.9: renderizar efeitos não altera estado da partida nem atributos das defesas',async()=>{
  const {render}=await import('../src/render.js');const b=new Battle(19,quiet);b.place(2,1,'T02');const toy=b.grid[2][1];toy.recoil=.18;const before={age:toy.age,recoil:toy.recoil,hp:toy.hp,glow:b.glow};
  const gradient={addColorStop(){}};const ctx=new Proxy({}, {get:(o,k)=>(k==='createLinearGradient'||k==='createRadialGradient')?()=>gradient:(o[k]??(()=>{})),set:(o,k,v)=>(o[k]=v,true)});
  render(ctx,b,false,true);assert.deepEqual({age:toy.age,recoil:toy.recoil,hp:toy.hp,glow:b.glow},before);
});
