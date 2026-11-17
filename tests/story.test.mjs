import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { LEVELS,TOYS,ENEMIES } from '../src/data.js';
import { STORY_ORDER,STORY_SCENES,getStory,storyForVictory,canReplayStory } from '../src/story.js';
import { buildStoryScreen } from '../src/story-ui.js';
import { loadSave,markStorySeen,recordVictory,starWallet } from '../src/save.js';

const store=()=>({text:null,getItem(){return this.text;},setItem(key,v){this.text=v;}});
test('quatro cutscenes com três ou mais quadros e artes reconhecidas',()=>{
  assert.deepEqual(STORY_ORDER,['C00','C01','C02','C03','C04','C05','C06','C07']);
  assert.equal(getStory('unknown'),null);
  assert.equal(getStory('__proto__'),null);
  assert.equal(storyForVictory('1-8'),'C01');
  assert.equal(storyForVictory('2-8'),'C02');
  assert.equal(storyForVictory('3-8'),'C03');
  assert.equal(storyForVictory('1-7'),null);
  for(const id of STORY_ORDER){
    const scene=getStory(id);
    assert.equal(scene.id,id);
    assert.ok(scene.slides.length>=3&&scene.slides.length<=4);
    for(let i=0;i<scene.slides.length;i++){
      const slide=scene.slides[i];
      assert.ok(slide.line.length>15);
      assert.ok(slide.speaker.length>1);
      if(slide.art){
        const type=slide.art.startsWith('enemy-')?'ene':'toy',identifier=slide.art.slice(slide.art.indexOf('-')+1);
        assert.ok(type==='toy'||type==='ene');
        assert.ok(TOYS[identifier]||ENEMIES[identifier],slide.art);
      }
      assert.ok(buildStoryScreen(id,i,true).includes('data-action="story-next"'));
      assert.ok(buildStoryScreen(id,i,true).includes('data-action="story-skip"'));
    }
    assert.equal(buildStoryScreen(id,scene.slides.length), '');
  }
  assert.equal(LEVELS.length,40);
});
test('migrar save legado com cenas inexistentes e evitar prototipagem de IDs',()=>{
  const s=store();
  s.text=JSON.stringify({version:1,campaignSize:24,unlocked:9,stars:{'1-8':3},storySeen:['C01','C01','C99','__proto__',null,22]});
  const recovered=loadSave(s);
  assert.deepEqual(recovered.storySeen,['C01']);
  assert.equal(canReplayStory(recovered,'C01'),true);
  assert.equal(canReplayStory(recovered,'C02'),false);
  assert.equal(canReplayStory(recovered,'C00'),true);
});
test('replay antigo: cenas de chefes concluídos antes desta versão',()=>{
  const save=loadSave(store());
  save.unlocked=24;
  save.stars['1-8']=3;
  save.stars['2-8']=2;
  assert.equal(canReplayStory(save,'C01'),true);
  assert.equal(canReplayStory(save,'C02'),true);
  assert.equal(canReplayStory(save,'C03'),false);
});
test('assistir não concede estrelas, não desbloqueia fases e persiste sem repetição',()=>{
  const st=store(),save=loadSave(st);
  const earned=starWallet(save).earned,before=save.unlocked;
  const first=markStorySeen(save,'C00',st);
  assert.deepEqual(first,{ok:true,already:false});
  assert.deepEqual(markStorySeen(save,'C00',st),{ok:true,already:true});
  assert.deepEqual(loadSave(st).storySeen,['C00']);
  assert.equal(save.unlocked,before);
  assert.equal(starWallet(save).earned,earned);
  assert.equal(markStorySeen(save,'C99',st).reason,'unknown');
});
test('falha do armazenamento mantém jogo e histórias sem mutação',()=>{
  const fail={getItem:()=>null,setItem(){throw Error('blocked');}},save=loadSave(fail);
  const initial=JSON.stringify(save);
  assert.equal(markStorySeen(save,'C00',fail).ok,false);
  assert.equal(JSON.stringify(save),initial);
});
test('tela respeita movimento reduzido e texto sem HTML de jogador',()=>{
  const markup=buildStoryScreen('C00',0,false);
  assert.ok(markup.includes('story-no-motion'));
  assert.ok(markup.includes('aria-live="polite"'));
  assert.ok(markup.includes('Pular cena'));
  assert.ok(markup.includes('Quadro 1 de 4'));
  assert.equal(buildStoryScreen('fake',0),'');
});
test('integração: PWA, browser, conteúdo offline e código sintaticamente válido',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const builder=readFileSync(new URL('../tools/build_standalone.py',import.meta.url),'utf8');
  const offline=readFileSync(new URL('../JOGAR-OFFLINE.html',import.meta.url),'utf8');
  assert.ok(main.includes("index===0&&!hasSeenStory('C00')"));
  assert.ok(main.includes("result==='victory'?storyForVictory"));
  assert.ok(main.includes("action==='story-skip'"));
  assert.ok(main.includes("action==='story-gallery'"));
  assert.ok(sw.includes('story.js?v=2.0.0'));
  assert.ok(sw.includes('story-ui.js?v=2.0.0'));
  assert.ok(builder.includes("'story.js','save.js'"));
  assert.ok(builder.includes("'story-ui.js','main.js'"));
  assert.ok(offline.includes('function buildStoryScreen'));
  assert.ok(offline.includes('function presentStory'));
  const script=offline.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(script,'script embutido existe');
  assert.doesNotThrow(()=>new vm.Script(script[1],{filename:'JOGAR-OFFLINE.html'}));
  for(const source of ['src/main.js','src/save.js','src/story.js','src/story-ui.js','sw.js'])
    execFileSync(process.execPath,['--check',new URL('../'+source,import.meta.url).pathname]);
});
