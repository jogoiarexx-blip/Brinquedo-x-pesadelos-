import { LEVELS, TOYS } from './data.js?v=2.1.0';
import { MAX_DECK, offensive } from './deck.js?v=2.1.0';
import { unlockedToys } from './save.js?v=2.1.0';
const escapeSurvivalHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function survivalPanel(save,deck) {
  const record=save.survival?.best??{waves:0,kills:0,seconds:0,score:0};
  const selected=new Set(deck),suggested=new Set(LEVELS[7].toys);
  const choices=[...unlockedToys(save)].filter(id=>TOYS[id]).map(id=>{
    const toy=TOYS[id],picked=selected.has(id),rank=1+(save.upgrades[id]||0);
    return '<button class="survival-choice '+(picked?'survival-picked':'')+'" data-action="survival-toggle" data-survival-id="'+id+'" aria-pressed="'+picked+'" aria-label="'+escapeSurvivalHTML(toy.name)+(picked?', remover':', adicionar')+'">'+
      '<svg class="deck-art" viewBox="0 0 80 80" aria-hidden="true"><use href="./assets/codex-atlas.svg?v=2.1.0#toy-'+id+'"></use></svg>'+
      '<span class="deck-copy"><strong>'+escapeSurvivalHTML(toy.short)+'</strong><small>✦ '+toy.cost+' · N'+rank+'</small><small>'+(suggested.has(id)?'★ Original':'Desbloqueado')+'</small></span>'+
      '<span class="deck-check">'+(picked?'✓':'+')+'</span></button>';
  }).join('');
  const slots=Array.from({length:MAX_DECK},(_,i)=>'<div class="deck-slot '+(deck[i]?'occupied':'')+'">'+(deck[i]?escapeSurvivalHTML(TOYS[deck[i]].short):'Vazio')+'<small>'+(i+1)+'/'+MAX_DECK+'</small></div>').join('');
  const best=record.waves>0?'🌊 Onda '+record.waves+' · '+record.kills+' derrotados · '+record.score+' pontos':'Sem recorde ainda';
  return '<div class="survival-record"><strong>🏆 Melhor resultado</strong><p>'+best+'</p><small>'+Number(save.survival?.runs||0)+' tentativa(s) registradas neste navegador</small></div>'+
    '<p>Defenda o quarto pelo maior tempo possível. Uma nova onda chega a cada 17 segundos, a resistência dos inimigos aumenta e há um chefe a cada dez ondas.</p>'+
    '<p>Este modo é liberado ao vencer 1-8. Seus recordes são locais e não concedem estrelas, mantendo a Oficina e a campanha intactas.</p>'+
    '<section class="deck-editor"><h2>🎴 Sua equipe · '+deck.length+'/'+MAX_DECK+'</h2><p>Escolha de 1 a 6 brinquedos desbloqueados e mantenha ao menos um atacante.</p>'+
    '<div class="deck-slots">'+slots+'</div><div class="deck-choices survival-choices">'+choices+'</div></section>';
}
export function changeSurvivalDeck(deck,id,available) {
  if(!Array.isArray(deck)||!TOYS[id]||!available.has(id))return {ok:false,message:'Brinquedo bloqueado.'};
  const next=[...deck],pos=next.indexOf(id);
  if(pos>=0) {
    next.splice(pos,1);
    if(!next.length||!next.some(offensive))return {ok:false,message:'Mantenha ao menos um atacante.'};
  } else {
    if(next.length>=MAX_DECK)return {ok:false,message:'Máximo de seis brinquedos.'};
    next.push(id);
  }
  return {ok:true,deck:next};
}
