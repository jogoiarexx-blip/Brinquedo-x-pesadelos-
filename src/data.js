// Dados do capítulo 1 — novos conteúdos preservam a jogabilidade 5×9 de defesa por faixas.
export const TOYS = Object.freeze({
  T02: { id:'T02', name:'Soldadinho Estalo', short:'Estalo', cost:100, cooldown:6, maxHp:120, kind:'shooter', interval:1.5, damage:20, color:'#f3694c', description:'Dispara bolinhas de papel na própria faixa.' },
  T01: { id:'T01', name:'Abajur Pirilampo', short:'Pirilampo', cost:50, cooldown:7, maxHp:100, kind:'producer', interval:22, color:'#f6bf4f', description:'Produz Brilhos. É o herói da economia!' },
  T03: { id:'T03', name:'Urso Travesseiro', short:'Ursinho', cost:50, cooldown:18, maxHp:650, kind:'blocker', color:'#7ec9d9', description:'Segura monstros para proteger os atacantes.' },
  T04: { id:'T04', name:'Pião de Geada', short:'Pião', cost:125, cooldown:9, maxHp:105, kind:'slow', interval:2.3, damage:15, slowFactor:.48, slowDuration:4, color:'#7bd5ef', description:'Seus cristais gelados deixam os monstros mais lentos por 4 segundos.' },
  T05: { id:'T05', name:'Canhão de Confetes', short:'Confetes', cost:175, cooldown:12, maxHp:115, kind:'splash', interval:2.9, damage:34, splashRadius:95, splashRatio:.60, color:'#f5a2c6', description:'Explode confetes e atinge outros monstros próximos na mesma faixa.' },
});
export const ENEMIES = Object.freeze({
  E01: { id:'E01', name:'Poeira Andante', hp:100, speed:.30, damage:24, interval:1.15, description:'Uma poeirinha atrapalhada, mas persistente.' },
  E02: { id:'E02', name:'Meia Zanzante', hp:85, speed:.44, damage:20, interval:1.0, description:'Corre mais rápido, porém aguenta menos tiros.' },
  E03: { id:'E03', name:'Colcha Ambulante', hp:270, speed:.23, damage:30, interval:1.15, description:'Um cobertor de retalhos resistente. Precisa de vários disparos para cair.' },
  E04: { id:'E04', name:'Rabisco Corredor', hp:70, speed:.66, damage:18, interval:.9, description:'Um desenho que escapou do caderno. Corre depressa e é frágil.' },
  E05: { id:'E05', name:'Rei das Meias', hp:850, speed:.16, damage:37, interval:.95, boss:true, slowResistance:.6, description:'O grandalhão do armário: leva uma multidão de meias para a batalha final.' },
});
// Fases autorais com horário em segundos, inimigos e faixas explicitamente balanceados.
const wave = (at, foes, flag=false) => ({ at, enemies:foes.map(([type, lane])=>({ type, lane })), flag });
const ALL = ['T01','T02','T03','T04','T05'];
export const LEVELS = Object.freeze([
  { id:'1-1', title:'A primeira bagunça', subtitle:'Aprenda a colocar soldadinhos e coletar Brilhos.',
    hint:'Selecione o Soldadinho e toque em uma casa. Colete as estrelinhas para comprar mais!',
    startingGlow:275, toys:['T02'], reward:'T01', duration:130,
    waves:[wave(14,[['E01',2]]),wave(34,[['E01',1]]),wave(52,[['E01',3]]),wave(72,[['E01',0]]),wave(89,[['E01',4]]),wave(110,[['E01',2],['E01',1],['E01',3]],true)]
  },
  { id:'1-2', title:'Luz que dá sorte', subtitle:'O Abajur produz Brilhos extras para sua defesa.',
    hint:'Coloque um Abajur logo no começo! Ele produz Brilhos e ajuda a comprar soldados.',
    startingGlow:175, toys:['T01','T02'], reward:'T03', duration:157,
    waves:[wave(14,[['E01',2]]),wave(29,[['E01',1],['E01',4]]),wave(48,[['E01',0],['E01',3]]),wave(64,[['E01',2],['E01',4]]),wave(84,[['E01',1],['E01',3],['E01',0]]),wave(102,[['E02',2],['E01',4]]),wave(122,[['E02',0],['E01',1],['E01',3]]),wave(142,[['E01',0],['E01',1],['E01',2],['E01',3],['E01',4]],true)]
  },
  { id:'1-3', title:'Abraço de urso', subtitle:'O Ursinho segura os pesadelos no lugar.',
    hint:'Coloque o Urso Travesseiro na frente dos Soldadinhos para proteger seus atacantes.',
    startingGlow:175, toys:['T01','T02','T03'], reward:'T04', duration:184,
    waves:[wave(13,[['E01',2]]),wave(27,[['E01',0],['E01',4]]),wave(43,[['E01',1],['E01',3]]),wave(60,[['E02',2],['E01',0]]),wave(78,[['E01',4],['E01',1],['E01',3]]),wave(97,[['E02',0],['E02',4],['E01',2]]),wave(116,[['E01',1],['E01',2],['E01',3]]),wave(136,[['E02',0],['E02',2],['E02',4]]),wave(165,[['E01',0],['E01',1],['E02',2],['E01',3],['E01',4]],true)]
  },
  { id:'1-4', title:'Pião congelante', subtitle:'Experimente desacelerar os monstros do armário.',
    hint:'O Pião de Geada diminui a velocidade: combine com Soldadinhos para mais dano!',
    startingGlow:275, toys:ALL.slice(0,4), reward:null, duration:175,
    waves:[wave(12,[['E01',2]]),wave(28,[['E02',0],['E01',4]]),wave(43,[['E02',1],['E01',3]]),wave(60,[['E02',2],['E02',4]]),wave(79,[['E01',0],['E02',1],['E01',3]]),wave(96,[['E02',0],['E02',2],['E02',4]]),wave(117,[['E01',1],['E01',2],['E02',3]]),wave(136,[['E02',0],['E01',2],['E02',4]]),wave(154,[['E01',0],['E02',1],['E01',2],['E02',3],['E01',4]],true)]
  },
  { id:'1-5', title:'A colcha se mexe!', subtitle:'Uma criatura resistente sai de dentro do baú.',
    hint:'A Colcha Ambulante aguenta muito dano. Use Piões e Urso para segurar a frente.',
    startingGlow:225, toys:ALL.slice(0,4), reward:'T05', duration:191,
    waves:[wave(14,[['E03',2]]),wave(33,[['E01',0],['E02',4]]),wave(51,[['E03',1],['E01',3]]),wave(70,[['E02',0],['E01',2],['E02',4]]),wave(90,[['E03',3],['E01',1]]),wave(111,[['E03',0],['E02',2]]),wave(135,[['E03',4],['E01',1],['E02',3]]),wave(159,[['E03',1],['E03',3],['E02',2]]),wave(175,[['E03',0],['E02',1],['E03',2],['E02',3],['E03',4]],true)]
  },
  { id:'1-6', title:'Chuva de confete', subtitle:'Novas armas contra os monstros agrupados.',
    hint:'O Canhão de Confetes machuca vários inimigos próximos da mesma faixa.',
    startingGlow:250, toys:ALL, reward:null, duration:195,
    waves:[wave(13,[['E01',2],['E01',2]]),wave(31,[['E02',1],['E02',1]]),wave(48,[['E01',0],['E01',0],['E01',4]]),wave(67,[['E03',3],['E01',3]]),wave(89,[['E02',2],['E02',2],['E01',2]]),wave(110,[['E03',0],['E01',0],['E03',4]]),wave(133,[['E03',1],['E02',1],['E03',3]]),wave(156,[['E01',0],['E02',2],['E01',2],['E02',4]]),wave(178,[['E03',0],['E02',0],['E03',1],['E01',2],['E03',3],['E02',4]],true)]
  },
  { id:'1-7', title:'O caderno assustado', subtitle:'Rabiscos ligeiros escapam das páginas.',
    hint:'O Rabisco Corredor é rápido. O Pião de Geada é uma excelente resposta!',
    startingGlow:250, toys:ALL, reward:null, duration:204,
    waves:[wave(10,[['E04',2]]),wave(24,[['E02',0],['E04',4]]),wave(41,[['E04',1],['E04',3]]),wave(61,[['E03',2],['E04',2]]),wave(81,[['E04',0],['E01',1],['E04',4]]),wave(102,[['E03',1],['E04',3]]),wave(124,[['E04',0],['E04',2],['E04',4]]),wave(146,[['E03',0],['E02',2],['E03',4]]),wave(171,[['E04',1],['E04',3],['E03',2]]),wave(189,[['E04',0],['E03',1],['E04',2],['E03',3],['E04',4]],true)]
  },
  { id:'1-8', title:'O Rei das Meias', subtitle:'O último pesadelo do armário chegou!',
    hint:'Batalha final! Prepare economia e duas linhas de ataque. Proteja a faixa central.',
    startingGlow:300, toys:ALL, reward:null, duration:229,
    waves:[wave(12,[['E01',2]]),wave(28,[['E02',0],['E02',4]]),wave(47,[['E03',1],['E01',3]]),wave(64,[['E04',2],['E01',0],['E04',4]]),wave(86,[['E03',0],['E03',4]]),wave(108,[['E04',1],['E04',3],['E02',2]]),wave(128,[['E03',2],['E01',1],['E01',3]]),wave(150,[['E03',0],['E04',0],['E03',4],['E04',4]]),wave(172,[['E03',1],['E02',3],['E04',2]]),wave(202,[['E05',2],['E02',0],['E02',4],['E03',1],['E03',3]],true)]
  }
]);
