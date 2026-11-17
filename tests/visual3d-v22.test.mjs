import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {STORY_GLB_MODELS,modelForStoryFrame,canAttemptStory3D,mountStory3D,stopStory3D} from '../src/story-3d.js';
import {FrameTelemetry} from '../src/perf.js';
import {loadSave,persistSave} from '../src/save.js';
import {getStory,STORY_ORDER} from '../src/story.js';
import {LEVELS} from '../src/data.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const fakeStorage=()=>({raw:null,getItem(){return this.raw;},setItem(key,content){this.raw=content;}});
const modelEntries=Object.entries(STORY_GLB_MODELS);
function parseGLB(file){
  const bytes=readFileSync(new URL('../'+file.slice(2),import.meta.url));
  assert.ok(bytes.byteLength<24_000,'GLB deve ser leve: '+file);
  assert.equal(bytes.toString('ascii',0,4),'glTF');
  assert.equal(bytes.readUInt32LE(4),2);
  assert.equal(bytes.readUInt32LE(8),bytes.byteLength);
  const jsonSize=bytes.readUInt32LE(12),jsonType=bytes.readUInt32LE(16);
  assert.equal(jsonType,0x4E4F534A,'JSON chunk');
  const json=JSON.parse(bytes.subarray(20,20+jsonSize).toString('utf8'));
  const binaryOffset=20+jsonSize;
  assert.equal(bytes.readUInt32LE(binaryOffset+4),0x004E4942,'BIN chunk');
  const binSize=bytes.readUInt32LE(binaryOffset),bufferSize=json.buffers[0].byteLength;
  assert.ok(binSize>=bufferSize&&binSize-bufferSize<=3,'BIN padding valid');
  assert.equal(binaryOffset+8+binSize,bytes.length);
  assert.equal(json.asset.version,'2.0');
  assert.equal(json.scene,0);
  assert.ok(json.meshes.length>=5);
  assert.ok(json.nodes.length>=5);
  assert.ok(json.animations.some(animation=>animation.channels.length>=1));
  for(const view of json.bufferViews){
    assert.ok(view.byteOffset>=0&&view.byteOffset+view.byteLength<=bufferSize,'Buffer view dentro do BIN');
  }
  for(const accessor of json.accessors){
    const view=json.bufferViews[accessor.bufferView];
    assert.ok(view&&accessor.count>0);
    assert.ok([5123,5126].includes(accessor.componentType));
  }
  return {json,bytes:bytes.length};
}
test('quatro GLBs originais existem e são glTF 2.0 animados, válidos e pequenos',()=>{
  assert.equal(modelEntries.length,4);
  let bytesTotal=0;
  for(const [id,path] of modelEntries){
    assert.match(id,/^(toy-T|enemy-E)\d{2}$/);
    const result=parseGLB(path);
    bytesTotal+=result.bytes;
    assert.equal(result.json.animations[0].name,'Idle');
    assert.ok(result.json.animations[0].channels.some(ch=>ch.target.path==='rotation'));
    assert.equal(modelForStoryFrame({art:id}),path);
  }
  assert.ok(bytesTotal<60_000);
});
test('somente personagens com GLB original são elegíveis e protocolo offline sempre recua ao 2D',async()=>{
  assert.equal(modelForStoryFrame({art:'toy-T03'}),null);
  assert.equal(modelForStoryFrame({art:'<img src=x>'}),null);
  assert.equal(modelForStoryFrame({art:null}),null);
  assert.equal(modelForStoryFrame(null),null);
  assert.equal(canAttemptStory3D('file:'),false);
  assert.equal(canAttemptStory3D('https:'),true);
  assert.equal(canAttemptStory3D('http:'),true);
  assert.equal(canAttemptStory3D('data:'),false);
  assert.equal(await mountStory3D(null,{art:'toy-T01'}),false);
  assert.doesNotThrow(()=>stopStory3D());
});
test('oito cutscenes não dependem do 3D e quatro modelos aparecem em quadros reais',()=>{
  const seen=new Set();
  for(const id of STORY_ORDER){
    const story=getStory(id);
    assert.ok(story.slides.length>=3);
    for(const slide of story.slides)if(modelForStoryFrame(slide))seen.add(slide.art);
  }
  for(const key of Object.keys(STORY_GLB_MODELS))
    assert.ok(seen.has(key),'modelo acessível em quadros: '+key);
});
test('medidor estima FPS, separa custo de desenho e ignora retorno de segundo plano',()=>{
  const meter=new FrameTelemetry(12);
  assert.deepEqual(meter.snapshot(),{fps:null,renderMs:null,samples:0});
  for(let i=0;i<10;i++)meter.sample(i*1000/60,2.5);
  let result=meter.snapshot();
  assert.ok(result.fps>=59&&result.fps<=61);
  assert.equal(result.renderMs,2.5);
  meter.sample(8000,24);
  assert.ok(meter.snapshot().fps>=59);
  meter.sample(8016.667,4.5);
  assert.ok(meter.snapshot().renderMs<5);
  assert.equal(meter.snapshot().samples,10);
  meter.reset();assert.equal(meter.snapshot().samples,0);
  meter.sample(NaN);assert.equal(meter.snapshot().samples,0);
});
test('modo 3D e medidor permanecem desligados após migrar um save da versão 2.1',()=>{
  const storage=fakeStorage();
  storage.raw=JSON.stringify({version:1,campaignSize:40,unlocked:40,stars:{'5-8':3},settings:{music:false,sfx:true,motion:false}});
  const save=loadSave(storage);
  assert.equal(save.unlocked,40);assert.equal(save.stars['5-8'],3);
  assert.equal(save.settings.music,false);
  assert.equal(save.settings.motion,false);
  assert.equal(save.settings.cinematic3d,false);
  assert.equal(save.settings.showPerf,false);
  save.settings.cinematic3d=true;save.settings.showPerf=true;
  assert.equal(persistSave(save,storage),true);
  const restored=loadSave(storage);
  assert.equal(restored.settings.cinematic3d,true);
  assert.equal(restored.settings.showPerf,true);
  assert.equal(restored.stars['5-8'],3);
});
test('auditoria das 40 fases aprova integridade estrutural e expõe métricas de pressão',()=>{
  const script=fileURLToPath(new URL('../tools/audit_campaign.mjs',import.meta.url));
  const run=spawnSync(process.execPath,[script,'--json'],{encoding:'utf8',timeout:30_000});
  const audit=JSON.parse(run.stdout);
  assert.deepEqual(audit.warnings,[],'problemas detectados: '+JSON.stringify(audit.warnings));
  assert.equal(run.status,0,run.stderr||'auditoria retornou erro');
  assert.equal(audit.levels,40);
  assert.equal(audit.chapters,5);
  assert.equal(audit.stages.length,40);
  assert.equal(audit.bosses.length,5);
  assert.equal(audit.chapterMetrics.length,5);
  assert.ok(audit.chapterMetrics.every(c=>c.levels===8&&c.enemies>0&&c.hp>0));
  assert.deepEqual(audit.warnings,[]);
  assert.ok(audit.simulationWallTimeMs>=0);
  assert.equal(LEVELS.length,40);
});
test('PWA, import map e standalone conectam o 3D sem carregar Three.js por padrão',()=>{
  const index=read('index.html'),main=read('src/main.js'),sw=read('sw.js');
  const offline=read('JOGAR-OFFLINE.html'),module=read('src/story-3d.js');
  assert.ok(index.includes('v2.3.0'));
  assert.ok(index.includes('type="importmap"'));
  assert.ok(index.includes('three@0.170.0'));
  assert.ok(index.includes('id="perf-stats"'));
  assert.ok(main.includes('cinematic3d')&&main.includes('showPerf'));
  assert.ok(main.includes('void mountStory3D(stage,frame,motionEnabled())'));
  assert.ok(sw.includes('brinquedos-vs-pesadelos-v2.3.0'));
  assert.ok(sw.includes('story-3d.js?v=2.3.0'));
  assert.ok(sw.includes('perf.js?v=2.3.0'));
  assert.ok(!sw.includes('cdn.jsdelivr.net'),'CDN não deve ser pré-requisito do cache offline');
  assert.ok(module.includes("import('three')"));
  assert.ok(module.includes('forceContextLoss'));
  assert.ok(offline.includes('function mountStory3D')||offline.includes('async function mountStory3D'));
  assert.ok(offline.includes('class FrameTelemetry'));
  const script=offline.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(script);
  assert.doesNotThrow(()=>new vm.Script(script[1]));
  for(const name of ['src/story-3d.js','src/perf.js','src/main.js','src/save.js'])
    execFileSync(process.execPath,['--check',fileURLToPath(new URL('../'+name,import.meta.url))]);
});
