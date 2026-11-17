import { getStory } from './story.js?v=2.2.0';
// A exibição é totalmente estática e acessível também no HTML offline.
const storyEscapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function buildStoryScreen(id,index,animate=true){
  const story=getStory(id),frame=Number.isInteger(index)?story?.slides[index]:null;
  if(!frame)return '';
  const credits=id==='C07';
  const stage=['bedroom','wardrobe','underbed','corridor','attic','dream'].includes(frame.stage)?frame.stage:'bedroom';
  const focus=/^[a-zA-Z0-9_-]{1,32}$/.test(frame.focus||'')?frame.focus:'center';
  const camera=credits?'story-camera-credits':index%2===0?'story-camera-left':'story-camera-right';
  const sprite=frame.art?'<svg class="story-character-art" viewBox="0 0 80 80" aria-hidden="true"><use href="./assets/codex-atlas.svg?v=2.2.0#'+storyEscapeText(frame.art)+'"></use></svg>':'<span class="story-character-emoji" aria-hidden="true">'+storyEscapeText(frame.emoji)+'</span>';
  const dots=story.slides.map((_,i)=>'<span class="story-dot '+(i===index?'active':'')+'" aria-hidden="true"></span>').join('');
  const pct=Math.round((index+1)/story.slides.length*100);
  const creditsLogo=credits?'<div class="story-credits-logo" aria-hidden="true"><span>BRINQUEDOS</span><b>VS. PESADELOS</b><small>FIM DA HISTÓRIA</small></div>':'';
  const prev=index>0?'<button class="story-prev" data-action="story-prev" aria-label="Voltar ao quadro anterior">◀ Anterior</button>':'';
  return '<section class="story-panel '+(animate?'':'story-no-motion')+(credits?' story-credits-mode':'')+'" aria-label="História: '+storyEscapeText(story.title)+'">'+
    '<div class="story-header"><div><span class="story-kicker">'+(credits?'CRÉDITOS E EPÍLOGO':'HISTÓRIA DO QUARTO')+' · CAPÍTULO '+story.chapter+' · '+storyEscapeText(id)+'</span><h1>'+storyEscapeText(story.title)+'</h1></div>'+
    '<button class="story-skip" data-action="story-skip" aria-label="Pular cena e continuar">Pular cena ✕</button></div>'+
    '<div class="story-stage story-stage-'+stage+' story-scene-'+storyEscapeText(id)+' '+camera+' story-frame-'+index+'" role="img" aria-label="Ilustração narrativa: '+storyEscapeText(frame.speaker)+'">'+
      '<div class="story-moon"></div><div class="story-backdrop"></div><div class="story-backdrop-front"></div>'+
      '<div class="story-character story-focus-'+focus+'">'+sprite+'</div>'+creditsLogo+
      '<div class="story-vignette"></div></div>'+
    '<div class="story-dialogue" aria-live="polite"><strong>'+storyEscapeText(frame.speaker)+'</strong><p>'+storyEscapeText(frame.line)+'</p></div>'+
    '<div class="story-bottom"><div class="story-progress"><span>Quadro '+(index+1)+' de '+story.slides.length+'</span><div class="story-dots">'+dots+'</div>'+
      '<div class="story-progress-track" role="progressbar" aria-label="Progresso da cena" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><span style="width:'+pct+'%"></span></div></div>'+
      '<div class="story-navigation">'+prev+'<button class="big-btn story-next" data-action="story-next">'+(index+1===story.slides.length?'Continuar ▶':'Próximo quadro ▶')+'</button></div></div>'+
    '</section>';
}
