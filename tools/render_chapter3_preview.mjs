// Optional developer preview of the real Canvas renderer in a prepared battle.
// Requires @napi-rs/canvas locally or CODEX_PRIMARY_RUNTIME_NODE_MODULES.
import {writeFile} from 'node:fs/promises';
import {Battle} from '../src/engine.js';
import {render} from '../src/render.js';
import {colX} from '../src/config.js';
const {createCanvas,GlobalFonts}=await import(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ?`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/@napi-rs/canvas/index.js`:'@napi-rs/canvas');
if(process.env.PREVIEW_FONT)GlobalFonts.registerFromPath(process.env.PREVIEW_FONT,'Trebuchet MS');
const b=new Battle(23);b.glow=2000;
for(const [row,col,id] of [[2,2,'T02'],[1,4,'T12'],[3,4,'T08'],[2,6,'T03'],[0,2,'T05']]){
  b.toyCooldowns[id]=0;b.place(row,col,id);
}
for(const [id,row,col] of [['E14',2,7],['E12',0,6],['E13',3,7]]){
  b.spawnEnemy(id,row);b.enemies.at(-1).x=colX(col);
}
b.enemies[0].bossPhase='warning';b.enemies[0].nextAttack='dust';b.time=10;b.bannerUntil=0;
const canvas=createCanvas(1280,720);render(canvas.getContext('2d'),b,false,false);
await writeFile(new URL('../docs/capitulo3-previa.png',import.meta.url),canvas.toBuffer('image/png'));
console.log('Prepared renderer preview saved: docs/capitulo3-previa.png');
