import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBriefing } from '../src/briefing.js';
import { LEVELS, TOYS, ENEMIES } from '../src/data.js';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

test('reconhecimento existe para todas as 40 fases, sem inventar inimigos',()=>{
  assert.equal(LEVELS.length,40);
  for (const [index,level] of LEVELS.entries()) {
    const preview=buildBriefing(index);
    assert.equal(preview.id,level.id);
    assert.equal(preview.waveCount,level.waves.length);
    assert.equal(preview.totalScheduled,level.waves.reduce((s,w)=>s+w.enemies.length,0));
    assert.equal(preview.doorWarnings,level.waves.filter(w=>Number.isInteger(w.doorLane)).length);
    assert.deepEqual(preview.toys.map(t=>t.id),level.toys);
    assert.equal(preview.enemies.reduce((s,e)=>s+e.count,0),preview.totalScheduled);
    for(const enemy of preview.enemies) {
      assert.equal(enemy.name,ENEMIES[enemy.id].name);
      assert.equal(enemy.boss,!!ENEMIES[enemy.id].boss);
    }
    for(const toy of preview.toys) assert.equal(toy.cost,TOYS[toy.id].cost);
  }
});
test('avisa chefes e reforços sem contá-los duas vezes',()=>{
  assert.equal(buildBriefing(7).enemies.some(e=>e.id==='E05'&&e.boss),true);
  assert.equal(buildBriefing(15).enemies.some(e=>e.id==='E10'&&e.boss),true);
  assert.equal(buildBriefing(23).enemies.some(e=>e.id==='E14'&&e.boss),true);
  assert.equal(buildBriefing(23).reward,null);
});
test('não aceita índice inválido e não modifica o plano da campanha',()=>{
  for (const index of [-1,40,1.5,NaN,Infinity,'0']) assert.equal(buildBriefing(index),null);
  const before=JSON.stringify(LEVELS);
  buildBriefing(23);buildBriefing(0);
  assert.equal(JSON.stringify(LEVELS),before);
});
test('UI, service worker e versão offline incluem a prévia',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const offline=readFileSync(new URL('../JOGAR-OFFLINE.html',import.meta.url),'utf8');
  assert.ok(main.includes('data-action="preview"'));
  assert.ok(main.includes('function previewLevel'));
  assert.ok(sw.includes('briefing.js?v=2.1.0'));
  assert.match(offline,/function buildBriefing/);
  assert.match(offline,/function previewLevel/);
  for(const path of ['src/main.js','src/briefing.js','sw.js'])
    execFileSync(process.execPath,['--check',new URL('../'+path,import.meta.url).pathname]);
});
