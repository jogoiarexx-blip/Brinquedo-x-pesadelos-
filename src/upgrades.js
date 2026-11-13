import { TOYS } from './data.js?v=1.2.1';

export const UPGRADE_COSTS = Object.freeze([2,4,6]);
export function upgradeRank(value) {
  return Number.isInteger(value)&&value>=0&&value<=UPGRADE_COSTS.length?value:0;
}
export function upgradeSpent(value) {
  return UPGRADE_COSTS.slice(0,upgradeRank(value)).reduce((sum,cost)=>sum+cost,0);
}
export function upgradedToy(id,rank=0) {
  const base=TOYS[id];if(!base)return null;
  rank=upgradeRank(rank);
  const data={...base,rank,maxHp:Math.round(base.maxHp*(1+.15*rank))};
  const precision=value=>Math.round(value*1000)/1000;
  if(base.damage)data.damage=precision(base.damage*(1+.1*rank));
  if(base.kind==='producer')data.interval=precision(base.interval*(1-.05*rank));
  if(base.slowDuration)data.slowDuration=precision(base.slowDuration*(1+.1*rank));
  if(base.stunDuration)data.stunDuration=precision(base.stunDuration*(1+.1*rank));
  return data;
}
