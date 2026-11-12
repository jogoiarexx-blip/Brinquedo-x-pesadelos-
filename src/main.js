import { W,H,STEP,BOARD,rectCell,clamp } from './config.js';
import { LEVELS,TOYS,ENEMIES } from './data.js';
import { Battle } from './engine.js';
import { loadSave,persistSave,recordVictory } from './save.js';
import { AudioService } from './audio.js';
import { render } from './render.js';
const $=id=>document.getElementById(id);
const canvas=$('battle-canvas'),context=canvas.getContext('2d',{alpha:false});
const audio=new AudioService();const save=loadSave();audio.music=save.settings.music;audio.sfx=save.settings.sfx;
let battle=null,screen='menu',last=0,accumulator=0,hudUpdate=0,toastTimer=null,optionsBack='menu',lastResult=null,pendingConfirm=null;
const icons={T01:'💡',T02:'🪖',T03:'🧸',E01:'☁️',E02:'🧦'};
const escapeHTML=v=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function showToast(text,seconds=2.8){let toast=$('toast');toast.textContent=text;toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),seconds*1000);}
function setScreen(name,content=''){screen=name;const layer=$('screen');if(name==='battle'){layer.classList.add('hidden');$('hud').classList.remove('hidden');return;}
  layer.classList.remove('hidden');layer.innerHTML=content; $('hud').classList.toggle('hidden',name==='menu'||name==='levels'||name==='help'||name==='codex'||name==='credits'||(name==='options'&&!battle));
  layer.classList.toggle('no-backdrop',false);
}
function button(text,action,kind='big-btn',additional=''){return `<button class="${kind}" data-action="${action}" ${additional}>${text}</button>`;}
function panel(title,kicker,content,back='menu',extra=''){setScreen(extra||'panel',`<section class="panel" aria-label="${escapeHTML(title)}"><div class="panel-head"><div><span class="subheading">${kicker}</span><h1>${title}</h1></div>${button('✕ Voltar',back,'tiny-btn')}</div>${content}</section>`);}
function menu(){battle=null;
  setScreen('menu',`<div class="menu-content"><div class="menu-hero"><span class="kicker">✦ Uma aventura no quarto da Lia</span><h1 class="logo">BRINQUEDOS <span class="vs">VS.</span><br><em>PESADELOS!</em></h1><p class="menu-description">Quando o armário se abre... o quarto revida! Monte sua defesa e espante monstros muito atrapalhados.</p><div class="menu-note">✦ 3 fases jogáveis &nbsp; ✦ 5 faixas &nbsp; ✦ Salva automaticamente</div></div><nav class="menu-actions" aria-label="Menu principal">${button(save.unlocked>1?'▶ CONTINUAR':'▶ JOGAR','play')}${button('🗺 ESCOLHER FASE','levels','outline-btn')}${button('📖 BRINQUEDOPÉDIA','codex','outline-btn')}${button('❔ COMO JOGAR','help','text-btn')}${button('⚙ OPÇÕES','options','text-btn')}</nav></div>`);
}
function levels(){
  const cards=LEVELS.map((lvl,i)=>{const unlocked=i<save.unlocked;
    return `<button class="level-choice" data-action="level" data-level="${i}" ${unlocked?'':'disabled'}><strong>${unlocked?'✦':'🔒'} ${lvl.id}</strong><span>${escapeHTML(lvl.title)}</span><small>${unlocked?'⭐'.repeat(save.stars[lvl.id]||0)||'Jogar agora':'Conclua a anterior'}</small></button>`;}).join('');
  panel('O Quarto Acordou','Capítulo 1 · selecione sua fase',`<p>Comece pelo início ou rejogue uma fase já liberada.</p><div class="levels">${cards}</div><p>As fases 1-4 a 1-8 e os próximos capítulos serão adicionados nas próximas versões.</p>`);
}
function help(back=battle?'pause':'menu'){
  panel('Como jogar','Seu Pião explica',`<p>Você precisa impedir que os pesadelos cheguem ao baú da imaginação.</p><div class="guide"><div class="guide-item"><strong>1. Escolha um brinquedo</strong><br>Toque em uma carta na faixa superior.</div><div class="guide-item"><strong>2. Defenda uma casa</strong><br>Toque em um quadradinho vazio do tapete.</div><div class="guide-item"><strong>3. Colete ✦ Brilhos</strong><br>Toque nas estrelinhas douradas; cada uma vale 25.</div><div class="guide-item"><strong>4. Proteja as 5 faixas</strong><br>Um trenzinho salva cada faixa apenas uma vez.</div><div class="guide-item"><strong>5. Economize</strong><br>Abajures criam Brilhos; soldadinhos atacam; ursos bloqueiam.</div><div class="guide-item"><strong>6. Vitória!</strong><br>Espante todos os monstros, inclusive a grande onda.</div></div><p>Atalhos no PC: teclas <strong>1, 2, 3</strong> selecionam cartas; <strong>Esc</strong> abre a pausa.</p>`,back,'help');
}
function codex(){
  const toys=Object.values(TOYS).map(t=>`<div class="catalog-entry"><div class="emoji">${icons[t.id]}</div><div><strong>${t.name}</strong><small>✦ ${t.cost} · ${t.description}</small></div></div>`).join('');
  const enemies=Object.values(ENEMIES).map(e=>`<div class="catalog-entry"><div class="emoji">${icons[e.id]}</div><div><strong>${e.name}</strong><small>${e.description}</small></div></div>`).join('');
  panel('Brinquedopédia','Conheça os moradores',`<p>Os defensores e os primeiros pesadelos desta versão.</p><div class="catalog">${toys}${enemies}</div>`,'menu','codex');
}
function options(back=battle?'pause':'menu'){
  optionsBack=back;
  const setting=(name,text)=>`<div class="option-row"><span>${text}</span><button class="toggle ${save.settings[name]?'':'off'}" data-action="toggle" data-setting="${name}">${save.settings[name]?'Ligado':'Desligado'}</button></div>`;
  panel('Opções','Ajuste a experiência',`${setting('music','🎵 Música original suave')}${setting('sfx','🔊 Efeitos sonoros')}${setting('motion','✨ Partículas e efeitos visuais')}<p>O progresso é salvo automaticamente no seu navegador. Este protótipo funciona sem conta.</p>`,back,'options');
}
function pause(){if(!battle||battle.state==='victory'||battle.state==='defeat')return;
  battle.state='paused';setScreen('pause',`<section class="panel result-panel" style="max-width:620px"><span class="subheading">Brinquedos descansando...</span><h1>⏸ Jogo pausado</h1><p>${battle.level.id} · ${battle.level.title}</p><div class="panel-actions">${button('▶ Continuar','resume')}${button('↻ Reiniciar fase','restart','outline-btn')}${button('⚙ Opções','options','text-btn')}${button('❔ Como jogar','help','text-btn')}${button('⌂ Menu principal','menu','text-btn')}</div></section>`);
}
function confirmBefore(kind){
  pendingConfirm=kind;
  setScreen('confirm',`<section class="panel result-panel" style="max-width:610px"><span class="subheading">Cuidado com os brinquedos!</span><h1>Você tem certeza?</h1><p>${kind==='restart'?'Reiniciar vai apagar a defesa construída nesta tentativa.':'Sair agora vai encerrar a fase atual. As fases concluídas continuam salvas.'}</p><div class="panel-actions">${button('Não, voltar','cancel-confirm','outline-btn')}${button('Sim, continuar','accept-confirm','text-btn')}</div></section>`);
}
function resume(){if(!battle)return;battle.state='playing';setScreen('battle');last=performance.now();accumulator=0;}
function start(index){if(index>=save.unlocked)return;
  battle=new Battle(index,audio,{toast:showToast,changed:()=>updateHUD(),end:finish,enemySeen:type=>{if(!save.seenEnemies.includes(type)){save.seenEnemies.push(type);persistSave(save);}}});
  audio.resume();renderCards();setScreen('battle');$('level-label').textContent=`Fase ${battle.level.id}`;$('phase-name').textContent=battle.level.title;
  last=performance.now();accumulator=0;hudUpdate=0;updateHUD();
}
function finish(result,stars){if(!battle)return;
  lastResult=result;if(result==='victory'){recordVictory(save,battle.levelIndex,stars);persistSave(save);}
  const isLast=battle.levelIndex>=LEVELS.length-1;
  const unlock=battle.level.reward?`<div class="result-unlock">🎁 Novo brinquedo para a próxima fase: <strong>${TOYS[battle.level.reward].name}</strong>!</div>`:'';
  setScreen('result',`<section class="panel result-panel"><span class="subheading">${result==='victory'?'A noite está a salvo!':'Os pesadelos bagunçaram tudo!'}</span><h1>${result==='victory'?'🎉 Vitória!':'😵 Tente de novo!'}</h1><div class="result-score">${result==='victory'?'⭐'.repeat(stars)+'☆'.repeat(3-stars):'☁️'}</div><p>${result==='victory'?'Você espantou '+battle.killCount+' monstros e protegeu a imaginação da Lia.':'Sua defesa não segurou a invasão. Experimente colocar soldados em mais faixas.'}</p>${result==='victory'?unlock:''}<div class="panel-actions">${result==='victory'&&!isLast?button('▶ Próxima fase','next'):''}${button('↻ '+(result==='victory'?'Jogar novamente':'Tentar de novo'),'restart','outline-btn')}${button('🗺 Escolher fase','levels','text-btn')}${button('⌂ Menu','menu','text-btn')}</div>${isLast&&result==='victory'?'<p>Você completou todas as fases jogáveis desta primeira versão! ✨</p>':''}</section>`);
}
function renderCards(){if(!battle)return;const el=$('toy-cards');el.innerHTML=battle.level.toys.map((id,i)=>{const d=TOYS[id];return `<button class="toy-card ${battle.selected===id?'selected':''}" data-toy="${id}" title="${d.name}: ${d.description}" aria-label="${d.name}, custa ${d.cost} Brilhos"><span class="toy-card-icon">${icons[id]}</span><span class="toy-card-name">${d.short}</span><span class="cost">✦ ${d.cost}</span><span class="cooldown hidden"></span></button>`;}).join('');}
function updateHUD(){if(!battle)return;$('glow-count').textContent=Math.floor(battle.glow);
  $('wave-progress').style.width=`${Math.round(battle.progress*100)}%`;
  $('waves-text').textContent=battle.wavesLeft?`${battle.wavesLeft} ondas pela frente`:'Últimos monstros!';
  document.querySelectorAll('[data-toy]').forEach(btn=>{const id=btn.dataset.toy;btn.classList.toggle('selected',battle.selected===id&&!battle.shovel);btn.classList.toggle('afford-no',battle.glow<TOYS[id].cost);const cd=battle.toyCooldowns[id];const layer=btn.querySelector('.cooldown');layer.classList.toggle('hidden',cd<=.01);if(cd>.01)layer.textContent=Math.ceil(cd)+'s';});
  $('shovel-btn').classList.toggle('selected',battle.shovel);
}
function handleAction(action,target){
  audio.resume();if(action!=='toggle')audio.play('click');
  if(action==='play')start(save.unlocked-1);
  else if(action==='level')start(Number(target.dataset.level));
  else if(action==='levels')levels();
  else if(action==='menu'){if(battle&&battle.state==='paused'&&screen==='pause')confirmBefore('menu');else menu();}
  else if(action==='help')help();
  else if(action==='codex')codex();
  else if(action==='options')options();
  else if(action==='pause')pause();
  else if(action==='resume')resume();
  else if(action==='restart'&&battle){if(screen==='pause')confirmBefore('restart');else start(battle.levelIndex);}
  else if(action==='next'&&battle)start(Math.min(battle.levelIndex+1,LEVELS.length-1));
  else if(action==='cancel-confirm')pause();
  else if(action==='accept-confirm'){const kind=pendingConfirm;pendingConfirm=null;if(kind==='restart'&&battle)start(battle.levelIndex);else if(kind==='menu')menu();}
  else if(action==='shovel'&&battle){battle.selectShovel();updateHUD();}
  else if(action==='toggle'){
    const id=target.dataset.setting;save.settings[id]=!save.settings[id];audio.music=save.settings.music;audio.sfx=save.settings.sfx;persistSave(save);options(optionsBack);
  }
}
document.addEventListener('click',event=>{
  const toy=event.target.closest('[data-toy]');if(toy&&battle&&screen==='battle'){audio.resume();battle.selectToy(toy.dataset.toy);updateHUD();return;}
  const btn=event.target.closest('[data-action]');if(btn&&!btn.disabled)handleAction(btn.dataset.action,btn);
});
canvas.addEventListener('pointerdown',event=>{
  if(!battle||screen!=='battle')return;
  event.preventDefault();const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*W/r.width,y=(event.clientY-r.top)*H/r.height;
  battle.click(x,y);updateHUD();
});
canvas.addEventListener('pointermove',event=>{
  if(!battle)return;
  const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*W/r.width,y=(event.clientY-r.top)*H/r.height;
  const cell=rectCell(x,y);battle.hover=(cell.col>=0&&cell.col<BOARD.cols&&cell.row>=0&&cell.row<BOARD.rows)?cell:null;
});
canvas.addEventListener('pointerleave',()=>{if(battle)battle.hover=null;});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){if(screen==='battle')pause();else if(screen==='pause')resume();else if(screen==='options'&&battle)pause();else if(screen!=='menu')menu();}
  if(screen==='battle'&&battle){const num=Number(event.key);if(num>=1&&num<=battle.level.toys.length){battle.selectToy(battle.level.toys[num-1]);updateHUD();}}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='battle')pause();});
function loop(now){let delta=last?Math.min((now-last)/1000,.16):0;last=now;
  if(battle&&screen==='battle'&&battle.state==='playing'){
    accumulator+=delta;let steps=0;
    while(accumulator>=STEP&&steps++<5&&battle.state==='playing'){
      battle.update(STEP);audio.tick(STEP);accumulator-=STEP;
    }
    if(steps>=5)accumulator=0;
    hudUpdate+=delta;if(hudUpdate>=.12){hudUpdate=0;updateHUD();}
  }else accumulator=0;
  render(context,battle,screen!=='battle'&&!battle,save.settings.motion);
  requestAnimationFrame(loop);
}
menu();requestAnimationFrame(loop);
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
if(new URLSearchParams(location.search).has('qa'))window.__QA__={start,battle:()=>battle,save,menu};
