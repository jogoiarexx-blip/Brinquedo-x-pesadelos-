import { SAVE_KEY } from './config.js';
const defaults = () => ({ version:1, unlocked:1, stars:{}, seenEnemies:[], settings:{ music:true, sfx:true, motion:true } });
export function loadSave(storage=globalThis.localStorage) {
  try {
    const raw = JSON.parse(storage.getItem(SAVE_KEY));
    if (!raw || raw.version !== 1) return defaults();
    return { ...defaults(), ...raw, unlocked:Math.max(1,Math.min(3,Number(raw.unlocked)||1)), stars:raw.stars && typeof raw.stars==='object'?raw.stars:{}, settings:{ ...defaults().settings, ...(raw.settings||{}) } };
  } catch { return defaults(); }
}
export function persistSave(save,storage=globalThis.localStorage) {
  try { storage.setItem(SAVE_KEY,JSON.stringify(save)); return true; }
  catch { return false; }
}
export function recordVictory(save,levelIndex,stars) {
  save.unlocked = Math.max(save.unlocked,Math.min(3,levelIndex+2));
  const id=`1-${levelIndex+1}`;
  save.stars[id]=Math.max(save.stars[id]||0,stars);
  return save;
}
