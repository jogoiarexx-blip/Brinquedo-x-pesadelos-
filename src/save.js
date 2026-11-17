import { LEVELS,TOYS,ENEMIES } from './data.js?v=1.8.0';
import { SAVE_KEY } from './config.js?v=1.8.0';
import { validDeck, deckForLevel } from './deck.js?v=1.8.0';
import { getStory } from './story.js?v=1.8.0';
import { UPGRADE_COSTS,upgradeRank,upgradeSpent } from './upgrades.js?v=1.8.0';
const defaults = () => ({ version:1, campaignSize:LEVELS.length, unlocked:1, stars:{}, upgrades:{}, decks:{}, storySeen:[], survival:{ best:{waves:0,kills:0,seconds:0,score:0},runs:0,deck:[] }, seenEnemies:[], settings:{ music:true, sfx:true, motion:true } });
const starScore=value=>['number','string'].includes(typeof value)&&Number.isFinite(Number(value))?Math.max(0,Math.min(3,Math.floor(Number(value)))):0;
export function unlockedToys(save) {
  return new Set(LEVELS.slice(0,save.unlocked).flatMap(level=>level.toys));
}
export function starWallet(save) {
  const earned=LEVELS.reduce((sum,level)=>sum+starScore(save.stars?.[level.id]),0);
  const spent=Object.keys(TOYS).reduce((sum,id)=>sum+upgradeSpent(save.upgrades?.[id]),0);
  return {earned,spent,available:Math.max(0,earned-spent)};
}
function normalizeSave(raw) {
  const save=defaults();
  if(!raw||raw.version!==1)return save;
  const unlocked=Number(raw.unlocked);
  save.unlocked=Number.isFinite(unlocked)?Math.max(1,Math.min(LEVELS.length,Math.floor(unlocked))):1;
  for(const level of LEVELS){const score=starScore(raw.stars?.[level.id]);if(score)save.stars[level.id]=score;}
  // Saves até v1.2 não tinham campaignSize; a campanha terminava na 3-4.
  const previousCap=Number.isInteger(raw.campaignSize)?raw.campaignSize:20;
  if(previousCap>0&&previousCap<LEVELS.length&&save.unlocked===previousCap&&save.stars[LEVELS[previousCap-1].id])save.unlocked++;
  save.seenEnemies=Array.isArray(raw.seenEnemies)?[...new Set(raw.seenEnemies.filter(id=>Object.hasOwn(ENEMIES,id)))]:[];
  for(const key of Object.keys(save.settings))if(typeof raw.settings?.[key]==='boolean')save.settings[key]=raw.settings[key];
  let budget=starWallet(save).earned;
  const unlockedIds=unlockedToys(save);
  for(const id of Object.keys(TOYS)){
    const rank=upgradeRank(raw.upgrades?.[id]),cost=upgradeSpent(rank);
    if(rank&&unlockedIds.has(id)&&cost<=budget){save.upgrades[id]=rank;budget-=cost;}
  }
  // Compatível com saves antigos: os baralhos são opcionais e nunca liberam cartas.
  const configured=raw.decks&&typeof raw.decks==='object'&&!Array.isArray(raw.decks)?raw.decks:{};
  for(const level of LEVELS.slice(0,save.unlocked)) {
    const deck=configured[level.id];
    if(validDeck(deck,unlockedIds))save.decks[level.id]=[...deck];
  }
  // Recordes e equipes opcionais: carregamento não altera o progresso da campanha.
  const rs=raw.survival&&typeof raw.survival==='object'&&!Array.isArray(raw.survival)?raw.survival:{};
  const b=rs.best&&typeof rs.best==='object'?rs.best:{};
  const safeInt=(value,max)=>Number.isSafeInteger(value)&&value>=0?Math.min(value,max):0;
  save.survival.best={waves:safeInt(b.waves,10000000),kills:safeInt(b.kills,100000000),seconds:safeInt(b.seconds,1000000000),score:safeInt(b.score,1000000000)};
  save.survival.runs=safeInt(rs.runs,10000000);
  if(canPlaySurvival(save)&&validDeck(rs.deck,unlockedIds))save.survival.deck=[...rs.deck];
  // Cenas são opcionais em saves legados, sempre identificadas por IDs conhecidos.
  save.storySeen=Array.isArray(raw.storySeen)
    ? [...new Set(raw.storySeen.filter(id=>Boolean(getStory(id))))]:[];
  return save;
}
export function loadSave(storage=null) {
  try {
    storage ||= globalThis.localStorage;
    return normalizeSave(JSON.parse(storage.getItem(SAVE_KEY)));
  } catch { return defaults(); }
}
export function persistSave(save,storage=null) {
  try {
    storage ||= globalThis.localStorage; storage.setItem(SAVE_KEY,JSON.stringify(save)); return true; }
  catch { return false; }
}
export function recordVictory(save,levelIndex,stars) {
  if(!Number.isInteger(levelIndex)||!LEVELS[levelIndex]||!Number.isInteger(stars)||stars<1||stars>3)return save;
  save.unlocked = Math.max(save.unlocked,Math.min(LEVELS.length,levelIndex+2));
  const id=LEVELS[levelIndex]?.id;
  save.stars[id]=Math.max(starScore(save.stars[id]),stars);
  return save;
}
export function purchaseUpgrade(save,id,storage=null) {
  if(!Object.hasOwn(TOYS,id))return {ok:false,reason:'unknown'};
  if(!unlockedToys(save).has(id))return {ok:false,reason:'locked'};
  const rank=upgradeRank(save.upgrades?.[id]);
  if(rank>=UPGRADE_COSTS.length)return {ok:false,reason:'max'};
  if(starWallet(save).available<UPGRADE_COSTS[rank])return {ok:false,reason:'stars'};
  const upgrades={...save.upgrades,[id]:rank+1};
  if(!persistSave({...save,upgrades},storage))return {ok:false,reason:'storage'};
  save.upgrades=upgrades;return {ok:true};
}
export function resetUpgrades(save,storage=null) {
  if(!persistSave({...save,upgrades:{}},storage))return false;
  save.upgrades={};return true;
}

export function getDeck(save,index) {
  const level=LEVELS[index];
  if(!level)return [];
  return deckForLevel(index,save.decks?.[level.id],unlockedToys(save));
}
export function saveDeck(save,index,deck,storage=null) {
  if(!Number.isInteger(index)||index<0||index>=save.unlocked||index>=LEVELS.length)return {ok:false,reason:'locked'};
  if(!validDeck(deck,unlockedToys(save)))return {ok:false,reason:'invalid'};
  const level=LEVELS[index],decks={...save.decks};
  if(deck.length===level.toys.length&&deck.every((id,i)=>id===level.toys[i]))delete decks[level.id];
  else decks[level.id]=[...deck];
  if(!persistSave({...save,decks},storage))return {ok:false,reason:'storage'};
  save.decks=decks;
  return {ok:true};
}
export function resetDeck(save,index,storage=null) {
  if(!Number.isInteger(index)||index<0||index>=save.unlocked||index>=LEVELS.length)return {ok:false,reason:'locked'};
  return saveDeck(save,index,[...LEVELS[index].toys],storage);
}

export function canPlaySurvival(save) {
  return Boolean(save?.unlocked>=9 && Number(save?.stars?.['1-8'])>=1);
}
export function getSurvivalDeck(save) {
  const suggested=LEVELS[7].toys;
  return canPlaySurvival(save)&&validDeck(save.survival?.deck,unlockedToys(save))
    ? [...save.survival.deck]:[...suggested];
}
export function saveSurvivalDeck(save,deck,storage=null) {
  if(!canPlaySurvival(save))return {ok:false,reason:'locked'};
  if(!validDeck(deck,unlockedToys(save)))return {ok:false,reason:'invalid'};
  const survival={...save.survival,deck:[...deck]};
  if(!persistSave({...save,survival},storage))return {ok:false,reason:'storage'};
  save.survival=survival;return {ok:true};
}
// Recorde local de ondas alcançadas; não concede estrelas ou upgrades.
export function recordSurvivalRun(save,result,storage=null) {
  if(!canPlaySurvival(save))return {ok:false,reason:'locked'};
  if(!result || !Number.isSafeInteger(result.waves) || result.waves<0 ||
     !Number.isSafeInteger(result.kills) || result.kills<0 ||
     !Number.isFinite(result.seconds) || result.seconds<0)return {ok:false,reason:'invalid'};
  const waves=Math.min(10000000,result.waves),kills=Math.min(100000000,result.kills);
  const seconds=Math.min(1000000000,Math.floor(result.seconds));
  const score=Math.min(1000000000,waves*100+kills*10+seconds);
  const current={waves,kills,seconds,score};
  const old=save.survival?.best??{waves:0,score:0};
  const newRecord=waves>old.waves||(waves===old.waves&&score>old.score);
  const survival={...save.survival,best:newRecord?current:{...old},runs:Math.min(10000000,(save.survival?.runs||0)+1)};
  if(!persistSave({...save,survival},storage))return {ok:false,reason:'storage',newRecord};
  save.survival=survival;
  return {ok:true,newRecord,record:survival.best,run:current};
}

export function markStorySeen(save,id,storage=null) {
  if(!getStory(id))return {ok:false,reason:'unknown'};
  if(save.storySeen?.includes(id))return {ok:true,already:true};
  const storySeen=[...(save.storySeen||[]),id];
  if(!persistSave({...save,storySeen},storage))return {ok:false,reason:'storage'};
  save.storySeen=storySeen;return {ok:true,already:false};
}
