import { BOARD, BOARD_RIGHT, BOARD_BOTTOM, colX, rowY, rectCell, clamp } from './config.js?v=2.0.0';
import { LEVELS, TOYS, ENEMIES } from './data.js?v=2.0.0';
import { upgradedToy } from './upgrades.js?v=2.0.0';
import { deckForLevel } from './deck.js?v=2.0.0';

export class Battle {
  constructor(index=0, audio=null, events={}, upgrades={}, deck=null, available=null) {
    this.levelIndex=index;
    this.level=LEVELS[index];
    if(!this.level)throw new Error('Fase desconhecida');
    this.deck=deckForLevel(index,deck,available);
    this.audio=audio || {play(){}};
    this.events=events;
    this.toyStats=Object.fromEntries(Object.keys(TOYS).map(id=>[id,upgradedToy(id,upgrades[id])]));
    this.time=0;
    this.state='playing';
    this.glow=this.level.startingGlow;
    this.grid=Array.from({length:BOARD.rows},()=>Array(BOARD.cols).fill(null));
    this.dust=new Set((this.level.dust||[]).map(([row,col])=>`${row}:${col}`));
    this.dustTutorialShown=false;
    this.dreamPulse=this.level.chapter===5?{phase:'idle',kind:'rush',count:0,nextAt:27,until:0}:null;
    this.enemies=[];this.projectiles=[];this.curtainShots=[];this.stars=[];this.particles=[];this.trains=[];
    this.effectsEnabled=true;
    this.feedback=[];this.defeated=[];this.impacts=[];
    this.trainReady=Array(BOARD.rows).fill(true);
    this.toyCooldowns=Object.fromEntries(this.deck.map(t=>[t,0]));
    this.selected=this.deck.includes('T02')?'T02':this.deck[0];this.hover=null;this.shovel=false;
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
  selectToy(id){if(!this.deck.includes(id))return false;this.selected=id;this.shovel=false;this.audio.play('click');return true;}
  selectShovel(){this.shovel=!this.shovel;this.audio.play('click');}
  isDusty(row,col){return this.dust.has(`${row}:${col}`);}
  cleanDustAround(row,col){
    let cleared=0;
    for(let r=Math.max(0,row-1);r<=Math.min(BOARD.rows-1,row+1);r++)
      for(let c=Math.max(0,col-1);c<=Math.min(BOARD.cols-1,col+1);c++){
        if(this.dust.delete(`${r}:${c}`))cleared++;
      }
    return cleared;
  }
  canPlace(row,col,id=this.selected){
    if(this.state!=='playing')return 'Fase pausada';
    if(!TOYS[id])return 'Escolha um brinquedo';
    if(!Number.isInteger(row)||!Number.isInteger(col)||row<0||row>=BOARD.rows||col<0||col>=BOARD.cols)return 'Fora do tapete';
    if(this.grid[row][col])return 'Esta casa já está ocupada';
    if(!this.deck.includes(id))return 'Brinquedo bloqueado';
    if(this.toyCooldowns[id]>0)return 'Aguarde a recarga';
    if(this.glow<TOYS[id].cost)return 'Brilhos insuficientes';
    return null;
  }
  place(row,col,id=this.selected){
    const error=this.canPlace(row,col,id);
    if(error){this.audio.play('no');this.startToast(error,1.3);return false;}
    const data=this.toyStats[id];
    const toy={id:this.id++,type:id,row,col,x:colX(col),y:rowY(row),hp:data.maxHp,maxHp:data.maxHp,
      rank:data.rank,timer:data.kind==='producer'?7.5:data.kind==='music'?3.2:data.kind==='clock'?3:.33+this.rand()*.6,hit:0,age:0,recoil:0,webTime:0,armed:false};
    this.grid[row][col]=toy;this.glow-=data.cost;this.toyCooldowns[id]=data.cooldown;this.toysPlaced++;
    if(data.kind==='umbrella'){
      const n=this.cleanDustAround(row,col);
      if(n)this.addFeedback(toy.x,toy.y-66,`✨ -${n} poeira`,'#c5f8df');
    }else if(this.isDusty(row,col)&&!this.dustTutorialShown){
      this.dustTutorialShown=true;
      this.startToast('Poeira: esta casa tem 15% menos velocidade de ação. Use Guarda-Chuva para limpar!',4.2);
    }
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
    if(d.dustBoss)Object.assign(this.enemies.at(-1),{bossPhase:'march',phaseTimer:6,nextAttack:'gust',attackCount:0});
    if(d.curtainBoss)Object.assign(this.enemies.at(-1),{bossPhase:'march',phaseTimer:9,nextAttack:'ribbon',attackCount:0,targetLane:lane});
    if(d.dreamBoss)Object.assign(this.enemies.at(-1),{bossPhase:'march',bossForm:1,phaseTimer:7,attackCount:0,targetLane:lane});
    if(d.boss)this.flashBanner(d.bossIntro,3.4);
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
  updateDustBoss(enemy,dt){
    // O aviso e o descanso são estados de combate, inclusive sem partículas.
    if(enemy.x>BOARD_RIGHT+10)return false;
    enemy.phaseTimer-=dt;
    if(enemy.bossPhase==='march'){
      if(enemy.phaseTimer>0)return false;
      enemy.bossPhase='warning';enemy.phaseTimer=1.2;
      this.flashBanner(enemy.nextAttack==='gust'?`VOVÔ VAI ESPIRRAR • FAIXA ${enemy.row+1}!`:'VOVÔ VAI CHAMAR MINI-POEIRAS!',1.2);
      this.audio.play('sneeze-warn');return true;
    }
    if(enemy.bossPhase==='warning'&&enemy.phaseTimer<=0){
      if(enemy.nextAttack==='gust'){
        for(const p of this.projectiles)if(p.row===enemy.row&&p.x<enemy.x&&p.x>enemy.x-BOARD.cw*5&&['shooter','slow','sleep'].includes(p.kind))p.x=Math.max(BOARD.x-20,p.x-120);
        this.addImpact(enemy.x-80,enemy.y-20,'gust');enemy.nextAttack='dust';
      }else{
        let minis=this.enemies.filter(e=>e.type==='E13').length;
        for(const lane of [enemy.row-1,enemy.row+1])if(lane>=0&&lane<BOARD.rows&&minis<6){
          this.spawnEnemy('E13',lane);this.enemies.at(-1).x=Math.max(colX(5),Math.min(BOARD_RIGHT+45,enemy.x+60));minis++;
        }
        enemy.nextAttack='gust';
      }
      enemy.attackCount++;enemy.bossPhase='rest';enemy.phaseTimer=4;
      this.flashBanner('ATCHIM! VOVÔ DESCANSA • CONTRA-ATAQUE!',2.4);this.audio.play('sneeze');
      this.puff(enemy.x-15,enemy.y-25,'#eee0c2',16);return true;
    }
    if(enemy.bossPhase==='rest'&&enemy.phaseTimer<=0){enemy.bossPhase='march';enemy.phaseTimer=14;}
    return enemy.bossPhase!=='march';
  }
  // Uma defesa de Lencinho nas casas vizinhas reduz o dano; não altera hitboxes.
  protectionFactor(toy){
    return this.grid.some(row=>row.some(friend=>friend&&friend.type==='T16'&&friend.hp>0&&
      Math.abs(friend.row-toy.row)<=1&&Math.abs(friend.col-toy.col)<=1))?.60:1;
  }
  bossDamageMultiplier(enemy){
    if(enemy.type==='E18'&&enemy.bossPhase==='rest')return 1.45;
    if(enemy.type==='E22'&&enemy.bossPhase==='rest')return 1.4;
    return 1;
  }
  updateDreamPulse(){
    const pulse=this.dreamPulse;if(!pulse)return;
    if(pulse.phase==='idle'&&this.time>=pulse.nextAt){
      pulse.phase='warning';pulse.until=this.time+3;
      pulse.kind=pulse.count%2===0?'rush':'lull';
      this.flashBanner(pulse.kind==='rush'?'⚠ SONHO ACELERANDO! PREPARE AS FAIXAS!':'⚠ SONHO ADORMECENDO! ATAQUE COM CALMA!',3);
      this.audio.play('wave');
    }else if(pulse.phase==='warning'&&this.time>=pulse.until){
      pulse.phase='active';pulse.until=this.time+6;
      this.flashBanner(pulse.kind==='rush'?'⏩ O SONHO ESTÁ RÁPIDO!':'🌙 O SONHO ESTÁ LENTO!',2.2);
    }else if(pulse.phase==='active'&&this.time>=pulse.until){
      pulse.phase='idle';pulse.count++;pulse.nextAt=this.time+34;
    }
  }
  updateDreamBoss(enemy,dt){
    if(enemy.x>BOARD_RIGHT+10)return false;
    const ratio=enemy.hp/enemy.maxHp;
    const form=ratio<=.34?3:ratio<=.67?2:1;
    if(form>enemy.bossForm){
      enemy.bossForm=form;enemy.bossPhase='march';enemy.phaseTimer=1.2;
      this.flashBanner(form===2?'👁 SEGUNDA FORMA • SALA DOS ESPELHOS!':'🌪 TERCEIRA FORMA • TEMPESTADE DOS MEDOS!',4);
      this.audio.play('wave');this.puff(enemy.x,enemy.y-25,'#e3b7f4',20);
    }
    enemy.phaseTimer-=dt;
    if(enemy.bossPhase==='march'&&enemy.phaseTimer<=0){
      const counts=this.grid.map(row=>row.filter(Boolean).length);
      const preferred=(enemy.row+enemy.attackCount)%BOARD.rows;
      const occupied=counts.map((count,row)=>({count,row})).filter(v=>v.count>0);
      enemy.targetLane=occupied.length?occupied.sort((a,b)=>b.count-a.count||Math.abs(a.row-preferred)-Math.abs(b.row-preferred))[0].row:preferred;
      enemy.bossPhase='warning';enemy.phaseTimer=1.8;
      const move=enemy.bossForm===1?'SUSSURRO':enemy.bossForm===2?'ESPELHOS':'TEMPESTADE';
      this.flashBanner(`⚠ ${move} • FAIXA ${enemy.targetLane+1}!`,1.8);
      this.audio.play('wave');return true;
    }
    if(enemy.bossPhase==='warning'&&enemy.phaseTimer<=0){
      if(enemy.bossForm===1){
        // Forma 1: adormece temporariamente os brinquedos da faixa avisada.
        for(const toy of this.grid[enemy.targetLane])if(toy){
          toy.webTime=Math.max(toy.webTime,3.7);this.addImpact(toy.x,toy.y-28,'sleep');
        }
      }else if(enemy.bossForm===2){
        // Forma 2: espelhos chamam reflexos, sem gerar inimigos ilimitadamente.
        let existing=this.enemies.filter(e=>e.type==='E19'||e.type==='E20').length;
        for(const lane of [enemy.targetLane,Math.min(BOARD.rows-1,enemy.targetLane+1)]){
          if(existing>=6)break;
          this.spawnEnemy(lane===enemy.targetLane?'E19':'E20',lane);
          this.enemies.at(-1).x=Math.min(BOARD_RIGHT+28,enemy.x+BOARD.cw);
          existing++;
        }
      }else{
        // Forma 3: tempestade envia dois ataques de sombra, ambos visíveis.
        const lanes=new Set([enemy.targetLane,Math.max(0,enemy.targetLane-1)]);
        for(const lane of lanes)this.curtainShots.push({row:lane,x:Math.min(BOARD_RIGHT+56,enemy.x-25),y:rowY(lane),damage:54,kind:'dream',age:0});
      }
      enemy.attackCount++;enemy.bossPhase='rest';enemy.phaseTimer=3.6;
      this.flashBanner('✨ BICHO-PAPÃO EXPOSTO! ATAQUE AGORA!',2.8);
      this.puff(enemy.x,enemy.y-15,'#dab4ed',10);
      return true;
    }
    if(enemy.bossPhase==='rest'&&enemy.phaseTimer<=0){enemy.bossPhase='march';enemy.phaseTimer=enemy.bossForm===3?6.6:8.4;}
    return enemy.bossPhase!=='march';
  }
  updateCurtainBoss(enemy,dt){
    if(enemy.x>BOARD_RIGHT+10)return false;
    enemy.phaseTimer-=dt;
    if(enemy.bossPhase==='march'&&enemy.phaseTimer<=0){
      // Alterna faixas, priorizando uma com brinquedos. Um aviso claro precede qualquer dano.
      const counts=this.grid.map(row=>row.filter(Boolean).length);
      const preferred=(enemy.row+enemy.attackCount)%BOARD.rows;
      const occupied=counts.map((count,row)=>({count,row})).filter(item=>item.count>0);
      enemy.targetLane=occupied.length?occupied.sort((a,b)=>b.count-a.count||Math.abs(a.row-preferred)-Math.abs(b.row-preferred))[0].row:preferred;
      enemy.bossPhase='warning';enemy.phaseTimer=1.6;
      this.flashBanner(`CORTINA NA FAIXA ${enemy.targetLane+1}! PROTEJA OS BRINQUEDOS!`,1.6);
      this.audio.play('wave');return true;
    }
    if(enemy.bossPhase==='warning'&&enemy.phaseTimer<=0){
      if(enemy.nextAttack==='ribbon'){
        this.curtainShots.push({row:enemy.targetLane,x:Math.min(enemy.x-32,BOARD_RIGHT+65),
          y:rowY(enemy.targetLane),damage:64,age:0});
        enemy.nextAttack='dust';
      }else{
        const center=3+(enemy.attackCount%2);
        for(const col of [center-1,center,center+1])if(col>=0&&col<BOARD.cols)this.dust.add(`${enemy.targetLane}:${col}`);
        if(this.enemies.filter(e=>e.type==='E17').length<6){
          this.spawnEnemy('E17',enemy.targetLane);
          this.enemies.at(-1).x=Math.min(BOARD_RIGHT+30,enemy.x+BOARD.cw);
        }
        enemy.nextAttack='ribbon';
      }
      enemy.attackCount++;enemy.bossPhase='rest';enemy.phaseTimer=4.2;
      this.flashBanner('CORTINAS ABERTAS! BARONESA VULNERÁVEL!',3);
      this.puff(enemy.x,enemy.y-30,'#edc1ee',12);this.audio.play('sneeze');
      return true;
    }
    if(enemy.bossPhase==='rest'&&enemy.phaseTimer<=0){enemy.bossPhase='march';enemy.phaseTimer=10;}
    return enemy.bossPhase!=='march';
  }
  get progress(){return clamp(this.time/this.level.duration,0,1);}
  get wavesLeft(){return this.level.waves.length-this.waveIndex;}
  get trainsLeft(){return this.trainReady.filter(Boolean).length;}
  get allToys(){return this.grid.flat().filter(Boolean);}
  update(dt){
    if(this.state!=='playing')return;
    this.time+=dt;
    this.updateDreamPulse();
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
      if(w.flag&&!w.enemies.some(e=>ENEMIES[e.type]?.boss))this.flashBanner('⚑  A GRANDE ONDA CHEGOU!',2.7);
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
      toy.age+=dt;toy.hit=Math.max(0,toy.hit-dt);toy.recoil=Math.max(0,(toy.recoil||0)-dt);toy.webTime=Math.max(0,(toy.webTime||0)-dt);toy.timer-=dt*(toy.webTime>0?.56:1)*(this.isDusty(toy.row,toy.col)?.85:1)*(this.dreamPulse?.phase==='active'?(this.dreamPulse.kind==='rush'?.82:1.18):1);
      const d=this.toyStats[toy.type];
      if(d.kind==='umbrella'&&toy.timer<=0){
        toy.timer+=d.interval;toy.recoil=.32;let repaired=0;
        for(const friend of this.allToys){
          if(Math.abs(friend.row-toy.row)<=1&&Math.abs(friend.col-toy.col)<=1&&friend.hp<friend.maxHp){
            const heal=Math.min(d.heal,friend.maxHp-friend.hp);friend.hp+=heal;repaired+=heal;
          }
        }
        if(repaired>0){this.addFeedback(toy.x,toy.y-69,`+${Math.round(repaired)} reparo`,'#e3fad0');this.audio.play('collect');}
      }
      if(d.kind==='whistle'&&toy.timer<=0){
        const target=this.enemies.filter(enemy=>enemy.hp>0&&Math.abs(enemy.row-toy.row)<=1&&enemy.x>toy.x+8&&enemy.x<toy.x+BOARD.cw*(d.rangeCells||3)).sort((a,b)=>a.x-b.x)[0];
        if(target){
          toy.timer+=d.interval;toy.recoil=.3;
          const absorbed=Math.min(target.shield||0,d.damage*this.bossDamageMultiplier(target));
          target.shield=(target.shield||0)-absorbed;target.hp-=d.damage*this.bossDamageMultiplier(target)-absorbed;
          const resistance=ENEMIES[target.type].slowResistance??1;
          target.slowFactor=Math.min(target.slowFactor,1-(1-d.slowFactor)*resistance);
          target.slowTime=Math.max(target.slowTime,d.slowDuration*resistance);
          target.hit=.25;this.addImpact(target.x,target.y-22,'slow');this.audio.play('sleep');
          if(target.hp<=0)this.killEnemy(target);
        }else toy.timer=.15;
      }
      if(d.kind==='drum'&&toy.timer<=0){
        toy.timer+=d.interval;toy.recoil=.4;let hitCount=0;
        for(const enemy of [...this.enemies])if(enemy.hp>0&&Math.abs(enemy.row-toy.row)<=1&&
          Math.abs(enemy.x-toy.x)<BOARD.cw*(d.rangeCells||4)){
          const damage=d.damage*this.bossDamageMultiplier(enemy);
          const absorbed=Math.min(enemy.shield||0,damage);enemy.shield=(enemy.shield||0)-absorbed;
          enemy.hp-=damage-absorbed;enemy.hit=.24;
          enemy.stunTime=Math.max(enemy.stunTime,d.stunDuration*(ENEMIES[enemy.type].stunResistance??1));
          this.addImpact(enemy.x,enemy.y-25,'sleep');hitCount++;
          if(enemy.hp<=0)this.killEnemy(enemy);
        }
        if(hitCount){this.addFeedback(toy.x,toy.y-72,`TUM! ×${hitCount}`,'#ffe9ae');this.audio.play('cuckoo');}
      }
      if(d.kind==='magnet'&&toy.timer<=0){
        const target=this.enemies.filter(enemy=>enemy.hp>0&&enemy.row===toy.row&&enemy.x>toy.x+20&&enemy.x<BOARD_RIGHT+75)
          .sort((a,b)=>a.x-b.x)[0];
        if(target){
          toy.timer+=d.interval;toy.recoil=.33;
          const damage=d.damage*this.bossDamageMultiplier(target);
          const absorbed=Math.min(target.shield||0,damage);
          target.shield=(target.shield||0)-absorbed;target.hp-=damage-absorbed;
          const pull=BOARD.cw*(ENEMIES[target.type].boss?.17:d.pullCells||.5);
          target.x=Math.min(BOARD_RIGHT+55,target.x+pull);target.hit=.24;
          this.addImpact(target.x,target.y-30,'slow');this.audio.play('freeze');
          if(target.hp<=0)this.killEnemy(target);
        }else toy.timer=.18;
      }
      if(d.kind==='guitar'&&toy.timer<=0){
        toy.timer+=d.interval;toy.recoil=.35;let struck=0;
        for(const enemy of [...this.enemies])if(enemy.hp>0&&Math.abs(enemy.row-toy.row)<=1&&
          Math.abs(enemy.x-toy.x)<=BOARD.cw*(d.rangeCells||4)){
          const damage=d.damage*this.bossDamageMultiplier(enemy),absorbed=Math.min(enemy.shield||0,damage);
          enemy.shield=(enemy.shield||0)-absorbed;enemy.hp-=damage-absorbed;enemy.hit=.2;
          this.addImpact(enemy.x,enemy.y-21,'ricochet');struck++;
          if(enemy.hp<=0)this.killEnemy(enemy);
        }
        for(const friend of this.allToys)if(friend!==toy&&Math.abs(friend.row-toy.row)<=1&&Math.abs(friend.col-toy.col)<=1)
          friend.timer=Math.max(0,friend.timer-.6);
        if(struck){this.audio.play('cuckoo');this.addFeedback(toy.x,toy.y-70,`♪ ×${struck}`,'#ffebc1');}
      }
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
            const trapDamage=d.damage*this.bossDamageMultiplier(e);const absorbed=Math.min(e.shield||0,trapDamage);e.shield=(e.shield||0)-absorbed;e.hp-=trapDamage-absorbed;e.hit=.25;hitCount++;
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
        for(const enemy of [...this.enemies]){
          if(Math.abs(enemy.row-toy.row)<=1 && enemy.hp>0 && Math.abs(enemy.x-toy.x)<BOARD.cw*6){
            enemy.stunTime=Math.max(enemy.stunTime,d.stunDuration*(ENEMIES[enemy.type].stunResistance??1));affected++;
            this.addImpact(enemy.x,enemy.y-30,'sleep');
            const sonicDamage=ENEMIES[enemy.type].sonicWeakness||0;
            if(sonicDamage){enemy.hp-=sonicDamage;enemy.hit=.16;if(enemy.hp<=0)this.killEnemy(enemy);}
          }
        }
        if(affected){this.puff(toy.x,toy.y-25,'#c1eec4',8);this.audio.play('sleep');}
      }
      if(d.kind==='clock'&&toy.timer<=0){
        toy.timer+=d.interval;toy.recoil=.4;let affected=0;
        for(const enemy of this.enemies)if(enemy.hp>0&&Math.abs(enemy.row-toy.row)<=1&&Math.abs(enemy.x-toy.x)<=BOARD.cw*d.rangeCells){
          const resist=ENEMIES[enemy.type].slowResistance??1;
          enemy.slowFactor=Math.min(enemy.slowFactor,1-(1-d.slowFactor)*resist);
          enemy.slowTime=Math.max(enemy.slowTime,d.slowDuration*resist);affected++;
          this.addImpact(enemy.x,enemy.y-25,'slow');
        }
        if(affected){this.audio.play('cuckoo');this.puff(toy.x,toy.y-36,'#ffe3a1',7);}
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
          const damage=(victim===hit?p.damage:p.damage*p.splashRatio)*this.bossDamageMultiplier(victim);
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
    // Retalhos da Baronesa percorrem a faixa avisada até atingir o primeiro brinquedo.
    for(let i=this.curtainShots.length-1;i>=0;i--){
      const shot=this.curtainShots[i],oldX=shot.x;shot.x-=BOARD.cw*6.2*dt;shot.age+=dt;
      const target=this.grid[shot.row].filter(toy=>toy&&toy.x>=shot.x-38&&toy.x<=oldX+38)
        .sort((a,b)=>b.x-a.x)[0];
      if(target){
        const damage=Math.round(shot.damage*this.protectionFactor(target));target.hp-=damage;target.hit=.35;
        this.addImpact(target.x,target.y-27,'gust');this.addFeedback(target.x,target.y-65,`-${damage} ♧`,'#ffe0e9');
        if(target.hp<=0){this.grid[target.row][target.col]=null;this.audio.play('remove');this.events.changed?.();}
        else this.audio.play('hit');
        this.curtainShots.splice(i,1);
      }else if(shot.x<BOARD.x-65||shot.age>3.3)this.curtainShots.splice(i,1);
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
      if(d.flutter&&!e.fluttered&&e.x<colX(7)&&e.x>BOARD.x+BOARD.cw){
        const newRow=e.row===4?3:e.row===0?1:e.row+(e.id%2?1:-1);
        e.row=newRow;e.y=rowY(newRow);e.fluttered=true;e.jumpTime=.48;
        this.addFeedback(e.x,e.y-65,'OUTRA FAIXA!','#f0d6e5');
      }
      const wasAsleep=e.stunTime>0;e.stunTime=Math.max(0,(e.stunTime||0)-dt);if(wasAsleep)continue;
      if(d.dustBoss&&this.updateDustBoss(e,dt))continue;
      if(d.curtainBoss&&this.updateCurtainBoss(e,dt))continue;
      if(d.dreamBoss&&this.updateDreamBoss(e,dt))continue;
      if(d.jump&&!e.jumped){
        const hurdle=this.grid[e.row].filter(t=>t&&e.x>t.x+39&&e.x<t.x+87).sort((a,b)=>b.x-a.x)[0];
        if(hurdle){e.x=hurdle.x-53;e.jumped=true;e.jumpTime=.48;this.addImpact(e.x,e.y-20,'jump');this.audio.play('jump');}
      }
      const blockers=this.grid[e.row].filter(t=>t && e.x<=t.x+39 && e.x>=t.x-41).sort((a,b)=>b.x-a.x);
      if(blockers.length){
        const toy=blockers[0];e.attackTimer-=dt;
        if(e.attackTimer<=0){e.attackTimer=d.interval;e.attack=.28;toy.hp-=Math.round(d.damage*this.protectionFactor(toy));toy.hit=.24;this.addImpact(toy.x,toy.y-22,'bite');
          if(toy.hp<=0){this.grid[toy.row][toy.col]=null;this.audio.play('remove');this.puff(toy.x,toy.y,'#eecb9e',14);this.events.changed?.();}
          else this.audio.play('hit');
        }
      }else{e.x-=d.speed*(e.enraged?1.75:1)*e.slowFactor*BOARD.cw*dt*(this.dreamPulse?.phase==='active'?(this.dreamPulse.kind==='rush'?1.3:.72):1);e.attackTimer=Math.min(e.attackTimer,.35);}
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
    this.enemies.splice(idx,1);this.killCount++;this.defeated.push({type:enemy.type,x:enemy.x,y:enemy.y,age:0,life:.62});if(this.defeated.length>18)this.defeated.shift();this.puff(enemy.x,enemy.y-13,'#c4a7db',ENEMIES[enemy.type].boss?32:11);if(ENEMIES[enemy.type].boss)this.flashBanner(ENEMIES[enemy.type].bossDefeat,3);this.audio.play('enemy');
  }
}
