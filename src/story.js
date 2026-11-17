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
  }
});
export const STORY_ORDER=Object.freeze(['C00','C01','C02','C03']);
export const STORY_AFTER_LEVEL=Object.freeze({'1-8':'C01','2-8':'C02','3-8':'C03'});
export function getStory(id){
  return typeof id==='string'&&Object.hasOwn(STORY_SCENES,id)?STORY_SCENES[id]:null;
}
export function storyForVictory(levelId){
  return Object.hasOwn(STORY_AFTER_LEVEL,levelId)?STORY_AFTER_LEVEL[levelId]:null;
}
export function canReplayStory(save,id){
  if(!getStory(id))return false;
  if(id==='C00'||Array.isArray(save?.storySeen)&&save.storySeen.includes(id))return true;
  // Quem terminou capítulos antes da implantação também pode assistir às cenas.
  return Object.entries(STORY_AFTER_LEVEL).some(([level,scene])=>scene===id&&Number(save?.stars?.[level])>0);
}
