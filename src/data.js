// Capítulos 1 e 2 — tabuleiro clássico 5×9 e novas mecânicas autorais.
export const TOYS = Object.freeze({
  T02: { id:'T02', name:'Soldadinho Estalo', short:'Estalo', cost:100, cooldown:6, maxHp:120, kind:'shooter', interval:1.5, damage:20, color:'#f3694c', description:'Dispara bolinhas de papel na própria faixa.' },
  T01: { id:'T01', name:'Abajur Pirilampo', short:'Pirilampo', cost:50, cooldown:7, maxHp:100, kind:'producer', interval:22, color:'#f6bf4f', description:'Produz Brilhos. É o herói da economia!' },
  T03: { id:'T03', name:'Urso Travesseiro', short:'Ursinho', cost:50, cooldown:18, maxHp:650, kind:'blocker', color:'#7ec9d9', description:'Segura monstros para proteger os atacantes.' },
  T04: { id:'T04', name:'Pião de Geada', short:'Pião', cost:125, cooldown:9, maxHp:105, kind:'slow', interval:2.3, damage:15, slowFactor:.48, slowDuration:4, color:'#7bd5ef', description:'Seus cristais gelados deixam os monstros mais lentos por 4 segundos.' },
  T05: { id:'T05', name:'Canhão de Confetes', short:'Confetes', cost:175, cooldown:12, maxHp:115, kind:'splash', interval:2.9, damage:34, splashRadius:95, splashRatio:.60, color:'#f5a2c6', description:'Explode confetes e atinge outros monstros próximos na mesma faixa.' },
  T06: { id:'T06', name:'Carrinho Cometa', short:'Cometa', cost:150, cooldown:10, maxHp:115, kind:'pierce', interval:2.0, damage:28, pierces:2, color:'#ffbd67', description:'Dispara carrinhos de brinquedo que atravessam até dois pesadelos.' },
  T07: { id:'T07', name:'Boneca Soninho', short:'Soninho', cost:125, cooldown:12, maxHp:95, kind:'sleep', interval:4.7, damage:10, stunDuration:2.3, color:'#c5b0ef', description:'Lança bocejos mágicos que fazem um pesadelo parar por alguns segundos.' },
  T08: { id:'T08', name:'Móbile Musical', short:'Móbile', cost:175, cooldown:17, maxHp:110, kind:'music', interval:9.2, stunDuration:1.6, color:'#a9e3c2', description:'Toca uma canção e paralisa pesadelos das três faixas próximas por instantes.' },
  T09: { id:'T09', name:'Estilingue de Estrelas', short:'Estrelas', cost:200, cooldown:15, maxHp:100, kind:'starburst', interval:3.3, damage:46, splashRatio:.5, splashRadius:115, color:'#f7d88c', description:'Dispara uma estrela que causa dano também aos inimigos das faixas vizinhas.' },
});
export const ENEMIES = Object.freeze({
  E01: { id:'E01', name:'Poeira Andante', hp:100, speed:.30, damage:24, interval:1.15, description:'Uma poeirinha atrapalhada, mas persistente.' },
  E02: { id:'E02', name:'Meia Zanzante', hp:85, speed:.44, damage:20, interval:1.0, description:'Corre mais rápido, porém aguenta menos tiros.' },
  E03: { id:'E03', name:'Colcha Ambulante', hp:270, speed:.23, damage:30, interval:1.15, description:'Um cobertor de retalhos resistente. Precisa de vários disparos para cair.' },
  E04: { id:'E04', name:'Rabisco Corredor', hp:70, speed:.66, damage:18, interval:.9, description:'Um desenho que escapou do caderno. Corre depressa e é frágil.' },
  E05: { id:'E05', name:'Rei das Meias', hp:850, speed:.16, damage:37, interval:.95, boss:true, slowResistance:.6, description:'O grandalhão do armário: leva uma multidão de meias para a batalha final.' },
  E06: { id:'E06', name:'Pula-Pula da Cama', hp:125, speed:.40, damage:23, interval:1.1, jump:true, description:'Usa as molas dos sapatos para saltar uma defesa uma única vez.' },
  E07: { id:'E07', name:'Cabide Blindado', hp:165, shield:85, speed:.25, damage:26, interval:1.2, description:'Veste um cabide como escudo; primeiro é preciso quebrar sua proteção.' },
  E08: { id:'E08', name:'Aranha do Estrado', hp:135, speed:.37, damage:23, interval:1.0, web:true, description:'Lança teias nos brinquedos e reduz a cadência de seus disparos temporariamente.' },
  E09: { id:'E09', name:'Despertador Zangado', hp:180, speed:.28, damage:29, interval:1.15, enrage:true, description:'Quando perde metade da vida, dispara correndo pelo tabuleiro.' },
  E10: { id:'E10', name:'Dama da Insônia', hp:1150, speed:.14, damage:38, interval:1, boss:true, slowResistance:.65, stunResistance:.5, summon:true, description:'Chefe que convoca sombras em duas fases da batalha, mantendo as cinco faixas perigosas.' },
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
  },
  { id:'2-1', chapter:2, title:'Barulhos sob a cama', subtitle:'O chão esconde um novo mundo de sombras saltitantes.',
    hint:'Os Pula-Pulas saltam uma defesa! Coloque ursos na frente e outra linha mais atrás.',
    startingGlow:275, toys:ALL, reward:'T06', duration:173,
    waves:[wave(14,[['E01',2]]),wave(30,[['E06',1]]),wave(48,[['E02',4],['E06',0]]),wave(70,[['E03',2],['E06',3]]),wave(91,[['E06',0],['E06',4]]),wave(114,[['E01',1],['E03',3],['E06',2]]),wave(137,[['E06',1],['E06',3],['E03',4]]),wave(158,[['E03',0],['E06',1],['E02',2],['E06',3],['E03',4]],true)]
  },
  { id:'2-2', chapter:2, title:'Carrinhos cruzando a pista', subtitle:'Os Cometas passam por dois monstros de uma vez.',
    hint:'Use o Carrinho Cometa para atravessar duplas; a economia do Abajur ainda é essencial.',
    startingGlow:300, toys:['T01','T02','T03','T04','T06'], reward:null, duration:186,
    waves:[wave(15,[['E01',2],['E01',2]]),wave(34,[['E02',0],['E02',4]]),wave(52,[['E06',1],['E06',1]]),wave(75,[['E03',3],['E01',3]]),wave(98,[['E06',0],['E06',2],['E06',4]]),wave(119,[['E03',1],['E03',3]]),wave(143,[['E02',2],['E03',2],['E02',4]]),wave(167,[['E06',0],['E03',1],['E03',2],['E06',3],['E03',4]],true)]
  },
  { id:'2-3', chapter:2, title:'A dança dos cabides', subtitle:'Armaduras rangendo atravessam o tapete.',
    hint:'Os Cabides Blindados protegem a vida até perderem o escudo. Dê tempo aos atiradores.',
    startingGlow:300, toys:['T01','T02','T03','T05','T06'], reward:'T07', duration:199,
    waves:[wave(14,[['E07',2]]),wave(34,[['E06',0],['E01',4]]),wave(54,[['E07',1],['E02',3]]),wave(77,[['E07',4],['E06',2]]),wave(100,[['E03',0],['E07',3]]),wave(121,[['E07',1],['E06',1],['E02',4]]),wave(144,[['E07',0],['E07',4],['E06',2]]),wave(165,[['E06',0],['E07',2],['E03',3]]),wave(183,[['E07',0],['E07',1],['E06',2],['E07',3],['E07',4]],true)]
  },
  { id:'2-4', chapter:2, title:'Todo mundo quietinho!', subtitle:'A Boneca Soninho coloca os pesadelos para dormir.',
    hint:'Os bocejos seguram monstros resistentes. Combine Soninho, Cometa e Abajur.',
    startingGlow:325, toys:['T01','T02','T03','T04','T06','T07'], reward:'T08', duration:210,
    waves:[wave(15,[['E01',2],['E06',2]]),wave(32,[['E07',0],['E06',4]]),wave(54,[['E03',1],['E07',3]]),wave(76,[['E06',0],['E06',2],['E06',4]]),wave(101,[['E07',1],['E07',3],['E03',2]]),wave(126,[['E07',0],['E06',1],['E07',4]]),wave(149,[['E03',0],['E07',2],['E06',3]]),wave(173,[['E07',1],['E03',3],['E07',4]]),wave(192,[['E07',0],['E06',0],['E07',1],['E03',2],['E07',3],['E06',4]],true)]
  }
,
  { id:'2-5', chapter:2, title:'Teias no tapete', subtitle:'Aranhas travessas deixam brinquedos grudados no chão.',
    hint:'A Aranha do Estrado atrasa os atiradores. O Móbile Musical bloqueia faixas vizinhas!',
    startingGlow:350, toys:['T01','T02','T03','T04','T07','T08'], reward:null, duration:214,
    waves:[wave(16,[['E08',2]]),wave(35,[['E01',0],['E08',4]]),wave(57,[['E06',1],['E08',3]]),wave(79,[['E07',0],['E08',2]]),wave(103,[['E08',1],['E08',3],['E02',4]]),wave(126,[['E07',2],['E06',0],['E08',4]]),wave(151,[['E03',1],['E08',1],['E07',3]]),wave(177,[['E08',0],['E06',2],['E08',4]]),wave(197,[['E08',0],['E07',1],['E08',2],['E07',3],['E08',4]],true)]
  },
  { id:'2-6', chapter:2, title:'O relógio perdeu a hora', subtitle:'Despertadores correm quando ficam irritados.',
    hint:'O Despertador acelera quando sua vida chega à metade. Pião ou Soninho ajudam!',
    startingGlow:350, toys:['T01','T02','T04','T06','T07','T08'], reward:'T09', duration:228,
    waves:[wave(15,[['E09',2]]),wave(36,[['E09',0],['E01',4]]),wave(55,[['E08',1],['E09',3]]),wave(77,[['E06',0],['E09',4]]),wave(100,[['E07',2],['E09',2]]),wave(126,[['E09',1],['E08',3],['E09',4]]),wave(149,[['E03',0],['E09',2],['E08',4]]),wave(172,[['E09',0],['E07',1],['E09',3]]),wave(191,[['E09',1],['E08',2],['E09',4]]),wave(211,[['E09',0],['E08',1],['E07',2],['E08',3],['E09',4]],true)]
  },
  { id:'2-7', chapter:2, title:'Estrelas pela janela', subtitle:'Uma chuva brilhante espanta a escuridão.',
    hint:'Estilingue de Estrelas atinge inimigos das faixas vizinhas. Coloque no centro!',
    startingGlow:375, toys:['T01','T02','T03','T07','T08','T09'], reward:null, duration:240,
    waves:[wave(15,[['E07',2],['E08',2]]),wave(35,[['E09',0],['E09',4]]),wave(56,[['E08',1],['E08',3]]),wave(79,[['E03',2],['E09',2]]),wave(105,[['E07',0],['E06',1],['E07',4]]),wave(129,[['E08',0],['E09',1],['E08',3]]),wave(151,[['E07',2],['E09',4],['E08',2]]),wave(177,[['E09',0],['E07',1],['E09',3]]),wave(200,[['E08',0],['E08',2],['E08',4]]),wave(224,[['E07',0],['E09',1],['E07',2],['E09',3],['E07',4]],true)]
  },
  { id:'2-8', chapter:2, title:'A Dama da Insônia', subtitle:'A rainha da noite se recusou a dormir!',
    hint:'Prepare Brilhos, brinquedos em várias linhas e Móbiles. A Dama da Insônia invoca reforços!',
    startingGlow:400, toys:['T01','T02','T04','T07','T08','T09'], reward:null, duration:266,
    waves:[wave(14,[['E08',2]]),wave(33,[['E09',0],['E09',4]]),wave(53,[['E07',1],['E07',3]]),wave(75,[['E06',0],['E08',2],['E06',4]]),wave(99,[['E09',1],['E09',3],['E07',2]]),wave(124,[['E08',0],['E08',4]]),wave(147,[['E07',0],['E09',2],['E07',4]]),wave(170,[['E08',1],['E08',3],['E09',4]]),wave(193,[['E09',0],['E07',2],['E09',4]]),wave(213,[['E08',1],['E08',3]]),wave(241,[['E10',2],['E07',0],['E07',4]],true)]
  }
]);
