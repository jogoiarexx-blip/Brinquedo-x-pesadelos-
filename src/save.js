import { LEVELS,TOYS,ENEMIES } from './data.js?v=1.3.0';
import { SAVE_KEY } from './config.js?v=1.3.0';
import { UPGRADE_COSTS,upgradeRank,upgradeSpent } from './upgrades.js?v=1.3.0';
const defaults = () => ({ version:1, campaignSize:LEVELS.length, unlocked:1, stars:{}, upgrades:{}, seenEnemies:[], settings:{ music:true, sfx:true, motion:true } });
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
