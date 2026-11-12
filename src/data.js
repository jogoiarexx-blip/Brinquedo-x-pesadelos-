export const TOYS = Object.freeze({
  T02: { id:'T02', name:'Soldadinho Estalo', short:'Estalo', cost:100, cooldown:6, maxHp:120, kind:'shooter', interval:1.5, damage:20, color:'#f3694c', description:'Dispara bolinhas de papel na própria faixa.' },
  T01: { id:'T01', name:'Abajur Pirilampo', short:'Pirilampo', cost:50, cooldown:7, maxHp:100, kind:'producer', interval:22, color:'#f6bf4f', description:'Produz Brilhos. É o herói da economia!' },
  T03: { id:'T03', name:'Urso Travesseiro', short:'Ursinho', cost:50, cooldown:18, maxHp:650, kind:'blocker', color:'#7ec9d9', description:'Segura monstros para proteger os atacantes.' },
});
export const ENEMIES = Object.freeze({
  E01: { id:'E01', name:'Poeira Andante', hp:100, speed:.30, damage:24, interval:1.15, description:'Uma poeirinha atrapalhada, mas persistente.' },
  E02: { id:'E02', name:'Meia Zanzante', hp:85, speed:.44, damage:20, interval:1.0, description:'Corre mais rápido, porém aguenta menos tiros.' },
});
// Os horários e faixas são autorais e podem ser balanceados por playtest.
const wave = (at, foes, flag=false) => ({ at, enemies:foes.map(([type, lane])=>({ type, lane })), flag });
export const LEVELS = Object.freeze([
  {
    id:'1-1', title:'A primeira bagunça', subtitle:'Aprenda a colocar soldadinhos e coletar Brilhos.',
    hint:'Selecione o Soldadinho e toque em uma casa. Colete as estrelinhas para comprar mais!',
    startingGlow:275, toys:['T02'], reward:'T01', duration:130,
    waves:[wave(14,[['E01',2]]),wave(34,[['E01',1]]),wave(52,[['E01',3]]),wave(72,[['E01',0]]),wave(89,[['E01',4]]),wave(110,[['E01',2],['E01',1],['E01',3]],true)]
  },
  {
    id:'1-2', title:'Luz que dá sorte', subtitle:'O Abajur produz Brilhos extras para sua defesa.',
    hint:'Coloque um Abajur logo no começo! Ele produz Brilhos e ajuda a comprar soldados.',
    startingGlow:175, toys:['T01','T02'], reward:'T03', duration:157,
    waves:[wave(14,[['E01',2]]),wave(29,[['E01',1],['E01',4]]),wave(48,[['E01',0],['E01',3]]),wave(64,[['E01',2],['E01',4]]),wave(84,[['E01',1],['E01',3],['E01',0]]),wave(102,[['E02',2],['E01',4]]),wave(122,[['E02',0],['E01',1],['E01',3]]),wave(142,[['E01',0],['E01',1],['E01',2],['E01',3],['E01',4]],true)]
  },
  {
    id:'1-3', title:'Abraço de urso', subtitle:'O Ursinho segura os pesadelos no lugar.',
    hint:'Coloque o Urso Travesseiro na frente dos Soldadinhos para proteger seus atacantes.',
    startingGlow:175, toys:['T01','T02','T03'], reward:null, duration:184,
    waves:[wave(13,[['E01',2]]),wave(27,[['E01',0],['E01',4]]),wave(43,[['E01',1],['E01',3]]),wave(60,[['E02',2],['E01',0]]),wave(78,[['E01',4],['E01',1],['E01',3]]),wave(97,[['E02',0],['E02',4],['E01',2]]),wave(116,[['E01',1],['E01',2],['E01',3]]),wave(136,[['E02',0],['E02',2],['E02',4]]),wave(165,[['E01',0],['E01',1],['E02',2],['E01',3],['E01',4]],true)]
  },
]);
