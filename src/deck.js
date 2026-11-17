import { LEVELS, TOYS } from './data.js?v=1.5.0';

export const MAX_DECK=6;
export const offensive=id=>Boolean(TOYS[id]?.damage>0);
export function validDeck(deck,available) {
  if(!Array.isArray(deck)||deck.length<1||deck.length>MAX_DECK)return false;
  const allowed=available instanceof Set?available:new Set(available||[]);
  if(new Set(deck).size!==deck.length)return false;
  return deck.every(id=>typeof id==='string'&&Object.hasOwn(TOYS,id)&&allowed.has(id))
    && deck.some(offensive);
}
export function deckForLevel(index,chosen=null,available=null) {
  const level=LEVELS[index];
  if(!level)return [];
  const permitted=available==null?new Set(level.toys):available;
  return validDeck(chosen,permitted)?[...chosen]:[...level.toys];
}
