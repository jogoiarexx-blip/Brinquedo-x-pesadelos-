import { BOARD, BOARD_RIGHT, BOARD_BOTTOM, colX, rowY, rectCell, clamp } from './config.js';
import { LEVELS, TOYS, ENEMIES } from './data.js';

export class Battle {
  constructor(index=0, audio=null, events={}) {
    this.levelIndex=index;
    this.level=LEVELS[index];
    if(!this.level)throw new Error('Fase desconhecida');
    this.audio=audio || {play(){}};
    this.events=events;
    this.time=0;
    this.state='playing';
    this.glow=this.level.startingGlow;
    this.grid=Array.from({length:BOARD.rows},()=>Array(BOARD.cols).fill(null));
    this.enemies=[];this.projectiles=[];this.stars=[];this.particles=[];this.trains=[];
    this.trainReady=Array(BOARD.rows).fill(true);
    this.toyCooldowns=Object.fromEntries(this.level.toys.map(t=>[t,0]));
    this.selected='T02';this.hover=null;this.shovel=false;
    this.waveIndex=0;this.bigWaveAlert=false;this.totalSpawns=0;this.killCount=0;this.toysPlaced=0;
    this.lastDrop=0;this.nextDrop=5.8;this.banner='';this.bannerUntil=0;
    this.seed=0x2af00+(index+1)*1543;
    this.id=0;
    this.lastAction='';
    this.startToast(this.level.hint,6.3);
  }
  rand(){let x=this.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.seed=x|0;return (x>>>0)/4294967296;}
  startToast(text,seconds=2.3){this.lastAction=text;this.toastUntil=this.time+seconds;this.events.toast?.(text,seconds);}
  selectToy(id){if(!this.level.toys.includes(id))return false;this.selected=id;this.shovel=false;this.audio.play('click');return true;}
  selectShovel(){this.shovel=!this.shovel;this.audio.play('click');}
  canPlace(row,col,id=this.selected){
    if(this.state!=='playing')return 'Fase pausada';
    if(!TOYS[id])return 'Escolha um brinquedo';
    if(!Number.isInteger(row)||!Number.isInteger(col)||row<0||row>=BOARD.rows||col<0||col>=BOARD.cols)return 'Fora do tapete';
    if(this.grid[row][col])return 'Esta casa já está ocupada';
    if(!this.level.toys.includes(id))return 'Brinquedo bloqueado';
    if(this.toyCooldowns[id]>0)return 'Aguarde a recarga';
    if(this.glow<TOYS[id].cost)return 'Brilhos insuficientes';
    return null;
  }
  place(row,col,id=this.selected){
    const error=this.canPlace(row,col,id);
    if(error){this.audio.play('no');this.startToast(error,1.3);return false;}
    const data=TOYS[id];
    const toy={id:this.id++,type:id,row,col,x:colX(col),y:rowY(row),hp:data.maxHp,maxHp:data.maxHp,
      timer:data.kind==='producer'?7.5:.33+this.rand()*.6,hit:0,age:0};
    this.grid[row][col]=toy;this.glow-=data.cost;this.toyCooldowns[id]=data.cooldown;this.toysPlaced++;
    this.audio.play('place');this.puff(toy.x,toy.y,'#ffe2a1',9);this.events.changed?.();
    return true;
  }
  remove(row,col){
    if(row<0||row>=BOARD.rows||col<0||col>=BOARD.cols)return false;
    const toy=this.grid[row][col];if(!toy)return false;
    this.grid[row][col]=null;this.puff(toy.x,toy.y,'#efdbba',12);this.audio.play('remove');this.events.changed?.();return true;
  }
  click(x,y){
    if(this.state!=='playing')return;
    for(let i=this.stars.length-1;i>=0;i--){const s=this.stars[i];
      if(Math.hypot(x-s.x,y-s.y)<38){this.glow+=s.value;this.stars.splice(i,1);this.audio.play('collect');this.puff(s.x,s.y,'#ffe46a',9);this.events.changed?.();return 'star';}
    }
    if(x>=BOARD.x&&x<BOARD_RIGHT&&y>=BOARD.y&&y<BOARD_BOTTOM){
      const {row,col}=rectCell(x,y);
      if(this.shovel)return this.remove(row,col)?'removed':'empty';
      return this.place(row,col)?'placed':'invalid';
    }
  }
  spawnStar(x,y,fromSky=true){
    this.stars.push({id:this.id++,x,y:fromSky?BOARD.y-45:y,initialY:fromSky?BOARD.y-45:y-13,
      targetY:y,age:0,dropTime:fromSky?.9:.5,value:25});
  }
  spawnEnemy(type,lane,offset=0){
    const d=ENEMIES[type];if(!d)return;
    this.enemies.push({id:this.id++,type,row:lane,x:BOARD_RIGHT+65+offset,y:rowY(lane),hp:d.hp,maxHp:d.hp,attackTimer:.45,hit:0,age:0});
    this.totalSpawns++;
    this.events.enemySeen?.(type);
  }
  puff(x,y,color,n=6){
    for(let i=0;i<n;i++){const a=this.rand()*6.283,v=34+this.rand()*95;
      this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,color,life:.38+this.rand()*.42,maxLife:.8,r:2+this.rand()*3});
    }
    if(this.particles.length>200)this.particles.splice(0,this.particles.length-200);
  }
  flashBanner(text,duration=2.8){this.banner=text;this.bannerUntil=this.time+duration;}
  get progress(){return clamp(this.time/this.level.duration,0,1);}
  get wavesLeft(){return this.level.waves.length-this.waveIndex;}
  get trainsLeft(){return this.trainReady.filter(Boolean).length;}
  get allToys(){return this.grid.flat().filter(Boolean);}
  update(dt){
    if(this.state!=='playing')return;
    this.time+=dt;
    if(!this.bigWaveAlert){const next=this.level.waves.find(w=>w.flag);
      if(next && this.time>=next.at-3){this.bigWaveAlert=true;this.flashBanner('⚑  GRANDE ONDA SE APROXIMANDO!',3.0);this.audio.play('wave');this.events.wave?.();}
    }
    while(this.waveIndex<this.level.waves.length && this.time>=this.level.waves[this.waveIndex].at){
      const w=this.level.waves[this.waveIndex++];w.enemies.forEach((e,i)=>this.spawnEnemy(e.type,e.lane,i*38));
      if(w.flag)this.flashBanner('⚑  A GRANDE ONDA CHEGOU!',2.7);
    }
    if(this.time>=this.nextDrop){
      const x=BOARD.x+48+this.rand()*(BOARD.cols*BOARD.cw-96),y=BOARD.y+36+this.rand()*(BOARD.rows*BOARD.ch-72);
      this.spawnStar(x,y,true);this.nextDrop=this.time+9+this.rand()*4;
    }
    for(const id in this.toyCooldowns)this.toyCooldowns[id]=Math.max(0,this.toyCooldowns[id]-dt);
    for(let i=this.stars.length-1;i>=0;i--){const s=this.stars[i];s.age+=dt;
      s.y=s.initialY+(s.targetY-s.initialY)*Math.min(1,s.age/s.dropTime);
      if(s.age>s.dropTime+8)this.stars.splice(i,1);
    }
    for(const toy of this.allToys){
      toy.age+=dt;toy.hit=Math.max(0,toy.hit-dt);toy.timer-=dt;
      const d=TOYS[toy.type];
      if(d.kind==='producer'&&toy.timer<=0){
        toy.timer+=d.interval;
        this.spawnStar(toy.x+21,toy.y-27,false);this.puff(toy.x,toy.y-23,'#ffee84',5);
      }
      if(d.kind==='shooter'&&toy.timer<=0){
        const target=this.enemies.filter(e=>e.row===toy.row&&e.hp>0&&e.x>toy.x+18&&e.x<BOARD_RIGHT+118).sort((a,b)=>a.x-b.x)[0];
        if(target){
          toy.timer+=d.interval;
          this.projectiles.push({id:this.id++,row:toy.row,x:toy.x+27,y:toy.y-12,damage:d.damage,age:0});
          this.audio.play('shoot');
        }else{toy.timer=.12;}
      }
    }
    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i],old=p.x;p.x+=dt*BOARD.cw*4.25;p.age+=dt;
      const hit=this.enemies.filter(e=>e.row===p.row&&e.hp>0&&e.x>=old-15&&e.x<=p.x+19).sort((a,b)=>a.x-b.x)[0];
      if(hit){hit.hp-=p.damage;hit.hit=.16;this.puff(hit.x,hit.y-12,'#ffdc8f',4);this.projectiles.splice(i,1);
        if(hit.hp<=0)this.killEnemy(hit);
      }else if(p.x>BOARD_RIGHT+95)this.projectiles.splice(i,1);
    }
    for(let i=this.enemies.length-1;i>=0;i--){
      const e=this.enemies[i],d=ENEMIES[e.type];e.age+=dt;e.hit=Math.max(0,e.hit-dt);
      const blockers=this.grid[e.row].filter(t=>t && e.x<=t.x+39 && e.x>=t.x-41).sort((a,b)=>b.x-a.x);
      if(blockers.length){
        const toy=blockers[0];e.attackTimer-=dt;
        if(e.attackTimer<=0){e.attackTimer=d.interval;toy.hp-=d.damage;toy.hit=.24;
          if(toy.hp<=0){this.grid[toy.row][toy.col]=null;this.audio.play('remove');this.puff(toy.x,toy.y,'#eecb9e',14);this.events.changed?.();}
          else this.audio.play('hit');
        }
      }else{e.x-=d.speed*BOARD.cw*dt;e.attackTimer=Math.min(e.attackTimer,.35);}
      if(e.x<BOARD.x-29){
        if(this.trainReady[e.row]){
          this.trainReady[e.row]=false;this.trains.push({row:e.row,x:BOARD.x-83,age:0});
          this.flashBanner('O TRENZINHO SALVOU A FAIXA!',2);this.audio.play('wave');this.events.changed?.();
        }else if(!this.trains.some(t=>t.row===e.row)){
          this.state='defeat';this.audio.play('defeat');this.events.end?.('defeat',0);return;
        }
      }
    }
    for(let i=this.trains.length-1;i>=0;i--){
      const t=this.trains[i];t.age+=dt;t.x+=780*dt;
      for(const e of [...this.enemies])if(e.row===t.row&&e.x<=t.x+27&&e.x>=t.x-55)this.killEnemy(e);
      if(t.x>BOARD_RIGHT+125)this.trains.splice(i,1);
    }
    for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=170*dt;if(p.life<=0)this.particles.splice(i,1);}
    if(this.waveIndex===this.level.waves.length && this.enemies.length===0 && this.trains.length===0){
      this.state='victory';const stars=this.trainReady.every(Boolean)?3:this.trainsLeft>=3?2:1;
      this.audio.play('victory');this.events.end?.('victory',stars);
    }
  }
  killEnemy(enemy){
    const idx=this.enemies.indexOf(enemy);if(idx<0)return;
    this.enemies.splice(idx,1);this.killCount++;this.puff(enemy.x,enemy.y-13,'#c4a7db',11);this.audio.play('enemy');
  }
}
