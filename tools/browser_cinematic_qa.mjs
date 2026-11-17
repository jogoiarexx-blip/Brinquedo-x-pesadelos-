// End-to-end em Chromium: personagens GLB reais, fallback, story, FPS e layout mobile.
// Executado por GitHub Actions com Playwright e Three.js temporários (sem bundler no jogo).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const base=process.env.GAME_URL||'http://127.0.0.1:8000/';
const artifacts=path.join(root,'browser-artifacts');
mkdirSync(artifacts,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[],errors=[];
const timeout=ms=>new Promise(r=>setTimeout(r,ms));
function capture(page,label){
  page.on('pageerror',error=>errors.push(label+': '+error.message));
  page.on('console',msg=>{if(msg.type()==='error'&&!/cdn.jsdelivr.net|Failed to load resource|WebGL/.test(msg.text()))errors.push(label+' console: '+msg.text().slice(0,240));});
}
async function openMenu(page){
  await page.goto(base+'?qa',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="options"]').waitFor({timeout:15000});
}
async function openStoryViaGallery(page){
  await page.locator('[data-action="story-gallery"]').click();
  await page.locator('[data-action="story-replay"][data-story="C00"]').click();
  await page.locator('.story-stage').waitFor();
}
async function switchSetting(page,name){
  const button=page.locator('[data-action="toggle"][data-setting="'+name+'"]');
  await button.click();
}
async function play2D(){
  const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const page=await context.newPage();capture(page,'desktop-2d');
  await openMenu(page);
  await page.locator('[data-action="options"]').click();
  await switchSetting(page,'showPerf');
  await page.locator('[data-action="menu"]').click();
  await page.locator('[data-action="play"]').click();
  await page.locator('.story-stage').waitFor();
  assert.equal(await page.locator('.story-stage').getAttribute('data-cinematic'),null,'3D não deve ligar automaticamente');
  assert.equal(await page.locator('.story-3d-layer').count(),0);
  await page.keyboard.press('ArrowRight');
  assert.match(await page.locator('.story-progress').innerText(),/Quadro 2 de 4/);
  await page.keyboard.press('ArrowLeft');
  assert.match(await page.locator('.story-progress').innerText(),/Quadro 1 de 4/);
  await page.locator('[data-action="story-skip"]').click();
  await page.locator('#hud:not(.hidden)').waitFor();
  await page.locator('#perf-stats:not(.hidden)').waitFor({timeout:7000});
  await page.waitForTimeout(1300);
  assert.match(await page.locator('#perf-stats').innerText(),/\d+ FPS/);
  assert.ok(await page.evaluate(()=>window.__QA__.battle()?.level.id==='1-1'));
  await page.screenshot({path:path.join(artifacts,'desktop-canvas-2d.png')});
  await context.close();
  results.push('Desktop: cutscene 2D, teclas, jogo Canvas e medidor FPS');
}
async function playFallback(){
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  await context.route('https://cdn.jsdelivr.net/**',r=>r.abort('failed'));
  const page=await context.newPage();capture(page,'fallback');
  await openMenu(page);
  await page.locator('[data-action="options"]').click();
  await switchSetting(page,'cinematic3d');
  await page.locator('[data-action="menu"]').click();
  await openStoryViaGallery(page);
  await page.waitForFunction(()=>['fallback','active'].includes(document.querySelector('.story-stage')?.dataset?.cinematic),{timeout:13000}).catch(()=>{});
  assert.equal(await page.locator('.story-3d-layer').count(),0);
  assert.ok(await page.locator('.story-character').isVisible());
  const visibility=await page.locator('.story-character').evaluate(el=>getComputedStyle(el).visibility);
  assert.equal(visibility,'visible','SVG mantém visibilidade quando CDN falha');
  await page.screenshot({path:path.join(artifacts,'fallback-2d-sem-cdn.png')});
  await context.close();
  results.push('3D sem CDN: fallback SVG intacto e cena utilizável');
}
async function playRealGLB(){
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  // Intercepta CDN do importmap com a MESMA versão do pacote, via Node do runner:
  // teste verdadeiro do carregador GLB + WebGL, sem depender da rede externa do CDN.
  let served=0;
  await context.route(/^https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.170\.0\/.+/,route=>{
    const url=new URL(route.request().url());
    const m=url.pathname.match(/^\/npm\/three@0\.170\.0\/((?:build|examples\/jsm)\/[A-Za-z0-9_./-]+\.js)$/);
    if(!m||m[1].includes('..'))return route.abort('blockedbyclient');
    let source;
    try{source=readFileSync(path.join(root,'node_modules/three',m[1]));}
    catch{return route.abort('failed');}
    served++;
    return route.fulfill({status:200,body:source,headers:{'content-type':'text/javascript; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'}});
  });
  const page=await context.newPage();capture(page,'GLB');
  await openMenu(page);
  await page.locator('[data-action="options"]').click();
  await switchSetting(page,'cinematic3d');
  await page.locator('[data-action="menu"]').click();
  await openStoryViaGallery(page);
  await page.locator('.story-stage.story-glb-active').waitFor({timeout:18000});
  const first=await page.locator('.story-3d-layer canvas').evaluate(el=>({width:el.width,height:el.height,display:getComputedStyle(el).display}));
  assert.ok(first.width>0&&first.height>0,'GLB gerou canvas de WebGL');
  assert.ok(served>=2,'Three.js e GLTFLoader usados realmente');
  await page.screenshot({path:path.join(artifacts,'capitao-ou-piao-3d.png')});
  // C00, quarto quadro tem Capitão Botão: dois modelos originais diferentes na mesma cena.
  for(let i=0;i<3;i++)await page.keyboard.press('ArrowRight');
  await page.locator('.story-stage.story-glb-active').waitFor({timeout:13000});
  const second=await page.locator('.story-3d-layer canvas').evaluate(el=>({width:el.width,height:el.height}));
  assert.ok(second.width>0&&second.height>0);
  await page.screenshot({path:path.join(artifacts,'capitao-botao-3d.png')});
  await page.locator('[data-action="story-skip"]').click();
  assert.equal(await page.locator('.story-3d-layer').count(),0,'GPU deve ser liberada ao sair da história');
  await context.close();
  results.push('WebGL real: 2 GLBs animados renderizados + troca de quadro e limpeza de GPU');
}
async function playMobile(){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage();capture(page,'mobile');
  await openMenu(page);
  await page.locator('[data-action="options"]').click();
  await switchSetting(page,'cinematic3d');
  await page.locator('[data-action="menu"]').click();
  await openStoryViaGallery(page);
  const frame=await page.locator('.story-stage').boundingBox();
  assert.ok(frame&&frame.width>=200&&frame.height>=130,'cinemática deve caber na tela móvel');
  await page.screenshot({path:path.join(artifacts,'mobile-cena-2d.png')});
  await page.locator('[data-action="story-next"]').click();
  await page.locator('[data-action="story-prev"]').click();
  assert.match(await page.locator('.story-progress').innerText(),/Quadro 1 de 4/);
  await page.locator('[data-action="story-skip"]').click();
  assert.ok(await page.locator('[data-action="story-gallery"]').count()===0,'retorna à galeria após rever');
  await context.close();
  results.push('Viewport mobile: cutscene, toque e navegação dos quadros');
}
try{
  await play2D();
  await playFallback();
  await playRealGLB();
  await playMobile();
  assert.deepEqual(errors,[],'Erros JavaScript detectados no Chromium');
  writeFileSync(path.join(artifacts,'resultado.json'),JSON.stringify({date:new Date().toISOString(),results,errors},null,2));
  console.log('PASS: '+results.join(' | '));
}catch(error){
  writeFileSync(path.join(artifacts,'falha.json'),JSON.stringify({error:String(error),stack:error?.stack,results,errors},null,2));
  throw error;
}finally{
  await browser.close();
}
