import { BOARD, BOARD_RIGHT, BOARD_BOTTOM, colX, rowY, rectCell, clamp } from './config.js?v=1.2.1';
import { LEVELS, TOYS, ENEMIES } from './data.js?v=1.2.1';
import { upgradedToy } from './upgrades.js?v=1.2.1';

export class Battle {
  constructor(index=0, audio=null, events={}, upgrades={}) {
    this.levelIndex=index;
    this.level=LEVELS[index];
    if(!this.level)throw new Error('Fase desconhecida');
    this.audio=audio || {play(){}};
    this.events=events;
    this.toyStats=Object.fromEntries(Object.keys(TOYS).map(id=>[id,upgradedToy(id,upgrades[id])]));
    this.time=0;
    this.state='playing';
    this.glow=this.level.startingGlow;
    this.grid=Array.from({length:BOARD.rows},()=>Array(BOARD.cols).fill(null));
    this.enemies=[];this.projectiles=[];this.stars=[];this.particles=[];this.trains=[];
    this.effectsEnabled=true;
    this.feedback=[];this.defeated=[];this.impacts=[];
    this.trainReady=Array(BOARD.rows).fill(true);
    this.toyCooldowns=Object.fromEntries(this.level.toys.map(t=>[t,0]));
    this.selected=this.level.toys.includes('T02')?'T02':this.level.toys[0];this.hover=null;this.shovel=false;
    this.waveIndex=0;this.bigWaveAlert=false;this.totalSpawns=0;this.killCount=0;this.toysPlaced=0;
    this.lastDrop=0;this.nextDrop=5.8;this.banner='';this.bannerUntil=0;
    this.seed=0x2af00+(index+1)*1543;
    this.visualSeed=this.seed^0x7f4a;
    this.id=0;
    this.lastAction='';this.doorWarned=new Set();this.doorWarning=null;
    this.startToast(this.level.hint,6.3);
  }
  rand(){let x=this.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.seed=x|0;return (x>>>0)/4294967296;}
  visualRand(){let x=this.visualSeed|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.visualSeed=x|0;return (x>>>0)/4294967296;}
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
    const data=this.toyStats[id];
    const toy={id:this.id++,type:id,row,col,x:colX(col),y:rowY(row),hp:data.maxHp,maxHp:data.maxHp,
      rank:data.rank,timer:data.kind==='producer'?7.5:data.kind==='music'?3.2:.33+this.rand()*.6,hit:0,age:0,recoil:0,webTime:0,armed:false};
    this.grid[row][col]=toy;this.glow-=data.cost;this.toyCooldowns[id]=data.cooldown;this.toysPlaced++;
    this.audio.play('place');this.puff(toy.x,toy.y,'#ffe2a1',9);this.addFeedback(toy.x,toy.y-68,'+ Defesa','#fff1bd');this.events.changed?.();
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
      if(Math.hypot(x-s.x,y-s.y)<38){this.glow+=s.value;this.stars.splice(i,1);this.audio.play('collect');this.puff(s.x,s.y,'#ffe46a',9);this.addFeedback(s.x,s.y-26,`+${s.value} ✦`,'#ffe878');this.events.changed?.();return 'star';}
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
    this.enemies.push({id:this.id++,type,row:lane,x:BOARD_RIGHT+65+offset,y:rowY(lane),hp:d.hp,maxHp:d.hp,shield:d.shield||0,maxShield:d.shield||0,summons:0,webTimer:4.8,enraged:false,jumped:false,jumpTime:0,stunTime:0,attackTimer:.45,hit:0,age:0,slowTime:0,slowFactor:1,attack:0,stealTimer:1.4});
    if(d.boss)this.flashBanner(type==='E10'?'☾  A DAMA DA INSÔNIA DESPERTOU!':'👑  O REI DAS MEIAS CHEGOU!',3.4);
    this.totalSpawns++;
    this.events.enemySeen?.(type);
  }
  puff(x,y,color,n=6){
    if(!this.effectsEnabled)return;
    for(let i=0;i<n;i++){const a=this.visualRand()*6.283,v=34+this.visualRand()*95;
      this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,color,life:.38+this.visualRand()*.42,maxLife:.8,r:2+this.visualRand()*3});
    }
    if(this.particles.length>200)this.particles.splice(0,this.particles.length-200);
  }
  addFeedback(x,y,text,color='#fff2bb'){
    this.feedback.push({x,y,text,color,age:0,life:.88});
    if(this.feedback.length>32)this.feedback.splice(0,this.feedback.length-32);
  }
  addImpact(x,y,kind){
    if(!this.effectsEnabled)return;
    this.impacts.push({x,y,kind,age:0,life:kind==='splash'?.48:.32});
    if(this.impacts.length>28)this.impacts.splice(0,this.impacts.length-28);
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
    // Portas do corredor avisam cinco segundos antes da chegada real da onda.
    if(this.level.chapter===3){
      for(let i=this.waveIndex;i<this.level.waves.length;i++){
        const w=this.level.waves[i];
        if(w.doorLane!==undefined && !this.doorWarned.has(i) && this.time>=w.at-5 && this.time<w.at){
          this.doorWarned.add(i);this.doorWarning={lane:w.doorLane,until:w.at+1};
          this.startToast(`🚪 PORTA NA FAIXA ${w.doorLane+1}! Prepare as defesas!`,4.8);
          this.audio.play('door');this.events.door?.(w.doorLane);
        }
      }
      if(this.doorWarning&&this.time>this.doorWarning.until)this.doorWarning=null;
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
      toy.age+=dt;toy.hit=Math.max(0,toy.hit-dt);toy.recoil=Math.max(0,(toy.recoil||0)-dt);toy.webTime=Math.max(0,(toy.webTime||0)-dt);toy.timer-=dt*(toy.webTime>0?.56:1);
      const d=this.toyStats[toy.type];
      if(d.kind==='producer'&&toy.timer<=0){
        toy.timer+=d.interval;
        this.spawnStar(toy.x+21,toy.y-27,false);this.puff(toy.x,toy.y-23,'#ffee84',5);
      }
      if(d.kind==='trap' && toy.age>=1.05){
        toy.armed=true;
        const triggered=this.enemies.some(e=>e.hp>0&&Math.abs(e.row-toy.row)<=1&&Math.abs(e.x-toy.x)<71);
        if(triggered){
          let hitCount=0;
          for(const e of [...this.enemies]){
            if(e.hp<=0||Math.abs(e.row-toy.row)>1||Math.abs(e.x-toy.x)>d.splashRadius)continue;
            const absorbed=Math.min(e.shield||0,d.damage);e.shield=(e.shield||0)-absorbed;e.hp-=d.damage-absorbed;e.hit=.25;hitCount++;
            this.addImpact(e.x,e.y-15,'splash');this.puff(e.x,e.y-20,'#ffb8d7',8);
            if(e.hp<=0)this.killEnemy(e);
          }
          this.grid[toy.row][toy.col]=null;this.addImpact(toy.x,toy.y,'splash');
          this.puff(toy.x,toy.y,'#ffe59a',24);this.audio.play('confetti');
          this.addFeedback(toy.x,toy.y-61,`PUM! ×${hitCount}`,'#fff2b7');this.events.changed?.();
        }
      }
      if(d.kind==='music'&&toy.timer<=0){
        toy.timer+=d.interval;toy.recoil=.4;let affected=0;
        for(const enemy of this.enemies){
          if(Math.abs(enemy.row-toy.row)<=1 && enemy.hp>0 && Math.abs(enemy.x-toy.x)<BOARD.cw*6){
            enemy.stunTime=Math.max(enemy.stunTime,d.stunDuration*(ENEMIES[enemy.type].stunResistance??1));affected++;
            this.addImpact(enemy.x,enemy.y-30,'sleep');
          }
        }
        if(affected){this.puff(toy.x,toy.y-25,'#c1eec4',8);this.audio.play('sleep');}
      }
      if(['shooter','slow','splash','pierce','sleep','starburst','ricochet'].includes(d.kind)&&toy.timer<=0){
        const target=this.enemies.filter(e=>e.row===toy.row&&e.hp>0&&e.x>toy.x+18&&e.x<BOARD_RIGHT+118).sort((a,b)=>a.x-b.x)[0];
        if(target){
          toy.timer+=d.interval;toy.recoil=.22;
          this.projectiles.push({id:this.id++,row:toy.row,x:toy.x+27,y:toy.y-12,damage:d.damage,kind:d.kind,slowFactor:d.slowFactor,slowDuration:d.slowDuration,splashRadius:d.splashRadius,splashRatio:d.splashRatio,piercesLeft:d.pierces||1,hitIds:[],stunDuration:d.stunDuration,age:0});
          this.audio.play(d.kind==='slow'?'freeze':d.kind==='splash'?'confetti':d.kind==='sleep'?'sleep':'shoot');
        }else{toy.timer=.12;}
      }
    }
    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i],old=p.x;p.x+=dt*BOARD.cw*4.25;p.age+=dt;
      const hit=this.enemies.filter(e=>e.row===p.row&&e.hp>0&&e.x>=old-15&&e.x<=p.x+19&&!(p.hitIds||[]).includes(e.id)).sort((a,b)=>a.x-b.x)[0];
      if(hit){
        // A colisão é resolvida uma única vez: lento, impacto normal ou confete com dano em área.
        const victims=['splash','starburst','ricochet'].includes(p.kind)
          ? this.enemies.filter(e=>e.hp>0&&Math.abs(e.x-hit.x)<=p.splashRadius&&(p.kind==='starburst'?Math.abs(e.row-p.row)<=1:e.row===p.row)&&(p.kind!=='ricochet'||e===hit||e.x>hit.x)).sort((a,b)=>a.x-b.x).slice(0,p.kind==='ricochet'?2:undefined)
          : [hit];
        for(const victim of victims){
          const damage=victim===hit?p.damage:p.damage*p.splashRatio;
          const shieldDamage=Math.min(victim.shield||0,damage);
          victim.shield=(victim.shield||0)-shieldDamage;
          victim.hp-=damage-shieldDamage;
          victim.hit=.16;this.addImpact(victim.x,victim.y-16,p.kind);
          if(p.kind==='sleep'){
            const resist=ENEMIES[victim.type].stunResistance??1;
            victim.stunTime=Math.max(victim.stunTime||0,(p.stunDuration||0)*resist);
          }
          if(p.kind==='ricochet' && victim!==hit)this.addImpact(victim.x,victim.y-24,'ricochet');
          if(p.kind==='slow'){
            const resist=ENEMIES[victim.type].slowResistance??1;
            victim.slowFactor=Math.min(victim.slowFactor,1-(1-p.slowFactor)*resist);
            victim.slowTime=Math.max(victim.slowTime,p.slowDuration*resist);
          }
          this.puff(victim.x,victim.y-12,p.kind==='slow'?'#9beafb':['splash','starburst'].includes(p.kind)?'#ff9acc':p.kind==='sleep'?'#cfb4ff':'#ffdc8f',p.kind==='splash'?7:4);
          if(victim.hp<=0)this.killEnemy(victim);
        }
        if(p.kind==='pierce'){
          p.hitIds.push(hit.id);p.piercesLeft--;
          if(p.piercesLeft<=0)this.projectiles.splice(i,1);
        }else this.projectiles.splice(i,1);
      }else if(p.x>BOARD_RIGHT+95)this.projectiles.splice(i,1);
    }
    for(let i=this.enemies.length-1;i>=0;i--){
      const e=this.enemies[i],d=ENEMIES[e.type];e.age+=dt;e.hit=Math.max(0,e.hit-dt);e.attack=Math.max(0,(e.attack||0)-dt);e.jumpTime=Math.max(0,(e.jumpTime||0)-dt);e.slowTime=Math.max(0,e.slowTime-dt);if(e.slowTime===0)e.slowFactor=1;
      if(d.enrage&&!e.enraged&&e.hp<=e.maxHp*.5){e.enraged=true;this.addImpact(e.x,e.y-25,'jump');this.audio.play('wave');}
      if(d.summon){
        const threshold=[.65,.30];
        if(e.summons<threshold.length&&e.hp<=e.maxHp*threshold[e.summons]){
          e.summons++;const lanes=e.summons===1?[0,4]:[1,3];
          for(const lane of lanes)this.spawnEnemy(e.summons===1?'E08':'E09',lane,0);
          this.flashBanner('A DAMA CHAMOU MAIS PESADELOS!',3);this.audio.play('wave');
        }
      }
      if(d.thief){
        e.stealTimer=Math.max(0,(e.stealTimer||0)-dt);
        if(e.stealTimer<=0){
          const i=this.stars.findIndex(s=>s.age>=s.dropTime&&Math.abs(s.x-e.x)<72&&Math.abs(s.y-e.y)<58);
          if(i>=0){const stolen=this.stars.splice(i,1)[0];e.stealTimer=7.5;
            this.puff(stolen.x,stolen.y,'#c5a4ed',8);this.addFeedback(e.x,e.y-69,'ROUBOU ✦','#ffcae6');this.audio.play('steal');}
        }
      }
      if(d.web){
        e.webTimer-=dt;
        if(e.webTimer<=0){
          const nearby=this.grid[e.row].find(toy=>toy&&toy.x<e.x&&e.x-toy.x<BOARD.cw*3);
          if(nearby){nearby.webTime=Math.max(nearby.webTime||0,4.1);e.webTimer=8.5;this.addImpact(nearby.x,nearby.y-20,'slow');this.audio.play('hit');}
          else e.webTimer=.4;
        }
      }
      const wasAsleep=e.stunTime>0;e.stunTime=Math.max(0,(e.stunTime||0)-dt);if(wasAsleep)continue;
      if(d.jump&&!e.jumped){
        const hurdle=this.grid[e.row].filter(t=>t&&e.x>t.x+39&&e.x<t.x+87).sort((a,b)=>b.x-a.x)[0];
        if(hurdle){e.x=hurdle.x-53;e.jumped=true;e.jumpTime=.48;this.addImpact(e.x,e.y-20,'jump');this.audio.play('jump');}
      }
      const blockers=this.grid[e.row].filter(t=>t && e.x<=t.x+39 && e.x>=t.x-41).sort((a,b)=>b.x-a.x);
      if(blockers.length){
        const toy=blockers[0];e.attackTimer-=dt;
        if(e.attackTimer<=0){e.attackTimer=d.interval;e.attack=.28;toy.hp-=d.damage;toy.hit=.24;this.addImpact(toy.x,toy.y-22,'bite');
          if(toy.hp<=0){this.grid[toy.row][toy.col]=null;this.audio.play('remove');this.puff(toy.x,toy.y,'#eecb9e',14);this.events.changed?.();}
          else this.audio.play('hit');
        }
      }else{e.x-=d.speed*(e.enraged?1.75:1)*e.slowFactor*BOARD.cw*dt;e.attackTimer=Math.min(e.attackTimer,.35);}
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
    for(const list of [this.feedback,this.impacts,this.defeated]){
      for(let i=list.length-1;i>=0;i--){list[i].age+=dt;if(list[i].age>=list[i].life)list.splice(i,1);}
    }
    if(this.waveIndex===this.level.waves.length && this.enemies.length===0 && this.trains.length===0){
      this.state='victory';const stars=this.trainReady.every(Boolean)?3:this.trainsLeft>=3?2:1;
      this.audio.play('victory');this.events.end?.('victory',stars);
    }
  }
  killEnemy(enemy){
    const idx=this.enemies.indexOf(enemy);if(idx<0)return;
    this.enemies.splice(idx,1);this.killCount++;this.defeated.push({type:enemy.type,x:enemy.x,y:enemy.y,age:0,life:.62});if(this.defeated.length>18)this.defeated.shift();this.puff(enemy.x,enemy.y-13,'#c4a7db',ENEMIES[enemy.type].boss?32:11);if(ENEMIES[enemy.type].boss)this.flashBanner(enemy.type==='E10'?'A DAMA DA INSÔNIA FOI DERROTADA!':'O REI DAS MEIAS FOI DERROTADO!',3);this.audio.play('enemy');
  }
}
