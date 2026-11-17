import { Battle } from './engine.js?v=1.9.0';
import { LEVELS, ENEMIES } from './data.js?v=1.9.0';
import { BOARD } from './config.js?v=1.9.0';

// Uma onda a cada 17 s; a quantidade, os tipos e a resistência crescem.
export const SURVIVAL_INTERVAL=17;
export const SURVIVAL_FIRST_AT=12;
const FOES=['E01','E02','E04','E03','E06','E07','E08','E09','E11','E12'];
const BOSSES=['E05','E10','E14'];
const randomFor=wave=>{
  let seed=(0x5f3759df ^ Math.imul(wave,0x9e3779b9))|0;
  return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
};
export const waveTime=number=>SURVIVAL_FIRST_AT+(number-1)*SURVIVAL_INTERVAL;
export function makeSurvivalWave(number) {
  if(!Number.isSafeInteger(number)||number<1)return null;
  const random=randomFor(number),boss=number%10===0;
  const foeTypes=FOES.slice(0,Math.min(FOES.length,2+Math.floor(number/3)));
  const count=Math.min(14,2+Math.floor(number/2));
  const enemies=Array.from({length:count},(_,i)=>{
    const type=foeTypes[Math.floor(random()*foeTypes.length)];
    return {type,lane:(Math.floor(random()*BOARD.rows)+i)%BOARD.rows};
  });
  if(boss)enemies.push({type:BOSSES[(number/10-1)%BOSSES.length],lane:2});
  return {at:waveTime(number),enemies,flag:number%5===0,number};
}

export class SurvivalBattle extends Battle {
  constructor(audio=null,events={},upgrades={},deck=null,available=null) {
    // Herda regras, colisões e cartas do capítulo 1, mas nunca altera LEVELS.
    super(7,audio,events,upgrades,deck,available);
    this.mode='survival';
    this.level={
      ...LEVELS[7], id:'∞', title:'Noite Sem Fim', chapter:1,
      hint:'A cada 17 segundos chegam novos pesadelos. Um chefe a cada dez ondas!',
      startingGlow:425, duration:Infinity, reward:null,
      toys:[...this.deck], waves:[]
    };
    this.glow=425;
    this.bigWaveAlert=true; // As prévias de grandes ondas são controladas por número.
    this.lastAlertWave=0;
    this.nextWaveToGenerate=1;
    this.ensureWaves();
    this.startToast(this.level.hint,5.5);
  }
  ensureWaves() {
    // Sempre existem duas ondas futuras: vitória de campanha é impossível.
    while(this.level.waves.length-this.waveIndex<2){
      this.level.waves.push(makeSurvivalWave(this.nextWaveToGenerate++));
    }
  }
  get waveReached(){return this.waveIndex;}
  get progress(){
    const prev=this.level.waves[this.waveIndex-1]?.at||0;
    const next=this.level.waves[this.waveIndex]?.at??prev+SURVIVAL_INTERVAL;
    return Math.max(0,Math.min(1,(this.time-prev)/(next-prev)));
  }
  spawnEnemy(type,lane,offset=0){
    const before=this.enemies.length;
    super.spawnEnemy(type,lane,offset);
    if(this.enemies.length===before)return;
    const enemy=this.enemies.at(-1);
    const boost=Math.min(3.2,1+Math.max(0,this.waveIndex-1)*0.035);
    enemy.maxHp=Math.max(1,Math.round(ENEMIES[type].hp*boost));
    enemy.hp=enemy.maxHp;
  }
  update(dt){
    if(this.state!=='playing')return;
    this.ensureWaves();
    const next=this.level.waves.slice(this.waveIndex).find(w=>w.flag);
    if(next && this.lastAlertWave!==next.number && this.time+dt>=next.at-3){
      this.lastAlertWave=next.number;
      this.flashBanner('⚑  ONDA '+next.number+' SE APROXIMANDO!',2.8);
      this.audio.play('wave');
    }
    super.update(dt);
    if(this.state==='playing')this.ensureWaves();
  }
}
