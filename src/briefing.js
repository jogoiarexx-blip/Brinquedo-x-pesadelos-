import { LEVELS, TOYS, ENEMIES } from './data.js?v=2.2.0';

// Reconhecimento determinístico: lê o plano da fase sem iniciar nem alterar uma batalha.
export function buildBriefing(index) {
  if (!Number.isInteger(index) || index < 0 || index >= LEVELS.length) return null;
  const level = LEVELS[index];
  const incoming = new Map();
  let doorWarnings = 0;
  for (const wave of level.waves) {
    if (Number.isInteger(wave.doorLane)) doorWarnings++;
    for (const foe of wave.enemies) {
      if (!ENEMIES[foe.type]) continue;
      incoming.set(foe.type, (incoming.get(foe.type) || 0) + 1);
    }
  }
  const enemies = [...incoming.entries()].map(([id, count]) => ({
    id, name: ENEMIES[id].name, count, boss: !!ENEMIES[id].boss,
    description: ENEMIES[id].description
  })).sort((a,b) => Number(b.boss)-Number(a.boss) || b.count-a.count || a.id.localeCompare(b.id));
  return {
    id: level.id, title: level.title, subtitle: level.subtitle, hint: level.hint,
    chapter: level.chapter || 1, waveCount: level.waves.length, doorWarnings, dustCells:level.dust?.length||0,
    totalScheduled: enemies.reduce((sum,enemy)=>sum+enemy.count,0),
    enemies, toys: level.toys.map(id=>({id,name:TOYS[id].name,short:TOYS[id].short,cost:TOYS[id].cost,description:TOYS[id].description})),
    reward: level.reward ? {id:level.reward,name:TOYS[level.reward].name} : null
  };
}
