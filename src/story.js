// Roteiros narrativos independentes das regras de combate.
export const STORY_SCENES=Object.freeze({
  C00:{
    id:'C00',title:'O Despertar',chapter:1,unlock:'start-1-1',
    slides:[
      {stage:'bedroom',speaker:'Narrador',line:'Quando Lia adormece, sua imaginação continua acordada.',art:'toy-T01',emoji:'🌙',focus:'lua'},
      {stage:'wardrobe',speaker:'Voz na escuridão',line:'O Coração da Imaginação será nosso!',art:'enemy-E01',emoji:'🚪',focus:'armario'},
      {stage:'bedroom',speaker:'Seu Pião',line:'Brinquedos, acordem! A noite saiu do controle!',art:null,emoji:'🌀',focus:'piao'},
      {stage:'bedroom',speaker:'Capitão Botão',line:'Às posições! Ninguém atravessa o tapete!',art:'toy-T02',emoji:'🪖',focus:'soldado'}
    ]
  },
  C01:{
    id:'C01',title:'Uma pista sob a cama',chapter:1,unlock:'after-1-8',
    slides:[
      {stage:'wardrobe',speaker:'Narrador',line:'O Rei das Meias escorrega... e sua coroa voa pelo tapete.',art:'enemy-E05',emoji:'👑',focus:'rei'},
      {stage:'underbed',speaker:'Rei das Meias',line:'Vocês venceram... mas ainda não viram o que vive debaixo da cama!',art:'enemy-E05',emoji:'🧦',focus:'rei'},
      {stage:'underbed',speaker:'Seu Pião',line:'Debaixo da cama? Então precisamos de mais Brilhos... e coragem!',art:'toy-T01',emoji:'💡',focus:'luz'}
    ]
  },
  C02:{
    id:'C02',title:'O corredor chama',chapter:2,unlock:'after-2-8',
    slides:[
      {stage:'underbed',speaker:'Narrador',line:'A Dama da Insônia se desfaz em pequenas estrelas brilhantes.',art:'enemy-E10',emoji:'🌘',focus:'dama'},
      {stage:'corridor',speaker:'Dama da Insônia',line:'Não fui eu quem abriu todas as portas... Ouçam o corredor!',art:'enemy-E10',emoji:'🚪',focus:'dama'},
      {stage:'corridor',speaker:'Capitão Botão',line:'Formação! Seguiremos os rangidos, uma porta de cada vez.',art:'toy-T02',emoji:'🪖',focus:'soldado'}
    ]
  },
  C03:{
    id:'C03',title:'O Sótão Esquecido',chapter:3,unlock:'after-3-8',
    slides:[
      {stage:'corridor',speaker:'Narrador',line:'Vovô Poeirão solta um espirro tão forte que revela um alçapão escondido.',art:'enemy-E14',emoji:'🤧',focus:'vovo'},
      {stage:'attic',speaker:'Vovô Poeirão',line:'Ai, meu lenço! O verdadeiro chefe escondeu tudo lá no sótão!',art:'enemy-E14',emoji:'🗝️',focus:'vovo'},
      {stage:'attic',speaker:'Seu Pião',line:'O Sótão Esquecido... e aquela sombra atrás dos baús? A aventura continua!',art:null,emoji:'🌀',focus:'sombra'}
    ]
  },
  C04:{
    id:'C04',title:'O Coração encontra a luz',chapter:4,unlock:'after-4-8',
    slides:[
      {stage:'attic',speaker:'Narrador',line:'A última cortina cai e revela a janela esquecida no alto do sótão.',art:'enemy-E18',emoji:'🎭',focus:'baronesa'},
      {stage:'attic',speaker:'Baronesa das Cortinas',line:'O Coração da Imaginação não pertence a mim... O Grande Bicho-Papão espera no quarto dos sonhos!',art:'enemy-E18',emoji:'🌒',focus:'baronesa'},
      {stage:'attic',speaker:'Boneca Guarda-Chuva',line:'Até os brinquedos esquecidos podem ajudar. Juntos, nossa luz alcança a noite!',art:'toy-T13',emoji:'☂️',focus:'guardachuva'},
      {stage:'bedroom',speaker:'Seu Pião',line:'A última porta se abriu. Pela Lia, vamos enfrentar o Grande Bicho-Papão!',art:'toy-T17',emoji:'💖',focus:'coracao'}
    ]
  },
  C05:{
    id:'C05',title:'O último pesadelo',chapter:5,unlock:'before-5-8',
    slides:[
      {stage:'dream',speaker:'Narrador',line:'No centro do sonho, o quarto se dobra sobre si mesmo. A última porta se abre.',art:null,emoji:'🌙',focus:'lua'},
      {stage:'dream',speaker:'Grande Bicho-Papão',line:'Eu sou o medo de esquecer, a dúvida e a escuridão! Três formas, nenhuma saída!',art:'enemy-E22',emoji:'🌑',focus:'vilao'},
      {stage:'dream',speaker:'Capitão Botão',line:'Primeiro ele sussurra, depois cria reflexos e por fim uma tempestade. Olhem os avisos!',art:'toy-T02',emoji:'🪖',focus:'soldado'},
      {stage:'dream',speaker:'Seu Pião',line:'Ainda temos os brinquedos, o Coração e uma última defesa. Por Lia!',art:'toy-T22',emoji:'🐴',focus:'cavalo'}
    ]
  },
  C06:{
    id:'C06',title:'O amanhecer da imaginação',chapter:5,unlock:'after-5-8',
    slides:[
      {stage:'dream',speaker:'Narrador',line:'As três formas do Grande Bicho-Papão se desfazem. O último medo vira uma estrelinha.',art:'enemy-E22',emoji:'⭐',focus:'vilao'},
      {stage:'bedroom',speaker:'Boneca Guarda-Chuva',line:'O Coração da Imaginação voltou a brilhar! Todos os brinquedos fizeram sua parte.',art:'toy-T13',emoji:'💖',focus:'coracao'},
      {stage:'bedroom',speaker:'Lia',line:'Que sonho estranho... Meus brinquedos parecem tão felizes hoje!',art:null,emoji:'👧',focus:'lia'},
      {stage:'bedroom',speaker:'Narrador',line:'Lia desperta em segurança. E, enquanto existir imaginação, nenhum brinquedo estará sozinho.',art:'toy-T01',emoji:'🌅',focus:'amanhecer'}
    ]
  },
  C07:{
    id:'C07',title:'Fim da história • Créditos',chapter:5,unlock:'after-5-8',
    slides:[
      {stage:'bedroom',speaker:'FIM',line:'A imaginação continua. Brinquedos vs. Pesadelos — campanha concluída!',art:null,emoji:'💗',focus:'coraçao'},
      {stage:'bedroom',speaker:'Personagens',line:'Lia, Seu Pião, Capitão Botão e os brinquedos do quarto. Obrigado por proteger o Coração da Imaginação.',art:'toy-T02',emoji:'🧸',focus:'soldado'},
      {stage:'dream',speaker:'O mundo dos pesadelos',line:'Rei das Meias, Dama da Insônia, Vovô Poeirão, Baronesa das Cortinas e Grande Bicho-Papão.',art:'enemy-E22',emoji:'🌛',focus:'vilao'},
      {stage:'bedroom',speaker:'Cena pós-créditos',line:'Seu Pião tenta fazer uma reverência... tropeça, gira três vezes e cai! Lia ri. FIM.',art:null,emoji:'🌀',focus:'piao'}
    ]
  }
});
export const STORY_ORDER=Object.freeze(['C00','C01','C02','C03','C04','C05','C06','C07']);
export const STORY_AFTER_LEVEL=Object.freeze({'1-8':'C01','2-8':'C02','3-8':'C03','4-8':'C04','5-8':'C06'});
export function getStory(id){
  return typeof id==='string'&&Object.hasOwn(STORY_SCENES,id)?STORY_SCENES[id]:null;
}
export function storyForVictory(levelId){
  return Object.hasOwn(STORY_AFTER_LEVEL,levelId)?STORY_AFTER_LEVEL[levelId]:null;
}
export function canReplayStory(save,id){
  if(!getStory(id))return false;
  if(id==='C00'||Array.isArray(save?.storySeen)&&save.storySeen.includes(id))return true;
  if(id==='C05')return Number(save?.stars?.['5-7'])>0 && Number(save?.unlocked)>=40;
  if(id==='C07')return Number(save?.stars?.['5-8'])>0;
  // Quem terminou capítulos antes da implantação também pode assistir às cenas.
  return Object.entries(STORY_AFTER_LEVEL).some(([level,scene])=>scene===id&&Number(save?.stars?.[level])>0);
}
