import { getStory } from './story.js?v=1.9.0';
const storyEscapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function buildStoryScreen(id,index,animate=true){
  const story=getStory(id),frame=story?.slides[index];
  if(!frame)return '';
  const sprite=frame.art?'<svg class="story-character-art" viewBox="0 0 80 80" aria-hidden="true"><use href="./assets/codex-atlas.svg?v=1.9.0#'+frame.art+'"></use></svg>':'<span class="story-character-emoji" aria-hidden="true">'+storyEscapeText(frame.emoji)+'</span>';
  const dots=story.slides.map((_,i)=>'<span class="story-dot '+(i===index?'active':'')+'" aria-hidden="true"></span>').join('');
  return '<section class="story-panel '+(animate?'':'story-no-motion')+'" aria-label="História: '+storyEscapeText(story.title)+'">'+
    '<div class="story-header"><span class="story-kicker">CAPÍTULO '+story.chapter+' · CENA '+storyEscapeText(id)+'</span><h1>'+storyEscapeText(story.title)+'</h1>'+
    '<button class="story-skip" data-action="story-skip" aria-label="Pular cena e continuar">Pular cena ✕</button></div>'+
    '<div class="story-stage story-stage-'+storyEscapeText(frame.stage)+'" role="img" aria-label="Ilustração narrativa do '+storyEscapeText(frame.stage)+'">'+
      '<div class="story-moon"></div><div class="story-backdrop"></div><div class="story-backdrop-front"></div>'+
      '<div class="story-character story-focus-'+storyEscapeText(frame.focus)+'">'+sprite+'</div>'+
      '<div class="story-vignette"></div></div>'+
    '<div class="story-dialogue" aria-live="polite"><strong>'+storyEscapeText(frame.speaker)+'</strong><p>'+storyEscapeText(frame.line)+'</p></div>'+
    '<div class="story-bottom"><div class="story-progress"><span>Quadro '+(index+1)+' de '+story.slides.length+'</span><div class="story-dots">'+dots+'</div></div>'+
    '<button class="big-btn story-next" data-action="story-next">'+(index+1===story.slides.length?'Continuar ▶':'Próximo quadro ▶')+'</button></div>'+
    '</section>';
}
