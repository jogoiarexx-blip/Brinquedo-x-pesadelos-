// Optional UI check: install Playwright locally, or set CODEX_PRIMARY_RUNTIME_NODE_MODULES.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ?`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/playwright/index.mjs`:'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const base=process.env.GAME_URL||'http://127.0.0.1:8000/';
const errors=[];
try {
  const context=await browser.newContext({viewport:{width:1366,height:900}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}?qa`);
  await page.locator('[data-action="workshop"]').click();
  await page.getByRole('heading',{name:'Oficina dos Brinquedos',exact:true}).waitFor();
  assert.equal(await page.locator('[data-upgrade]').count(),11);
  assert.equal(await page.locator('[data-upgrade="T02"]').isDisabled(),true);
  assert.equal(await page.locator('[data-upgrade="T01"]').isDisabled(),true);
  assert.match(await page.locator('[data-upgrade="T01"]').textContent(),/Bloqueado/);
  await page.evaluate(()=>localStorage.setItem('bvp-save-v1',JSON.stringify({version:1,unlocked:3,stars:{'1-1':3,'1-2':3},settings:{motion:false}})));
  await page.reload();await page.locator('[data-action="workshop"]').click();
  await page.locator('[data-upgrade="T02"]').click();
  assert.equal(await page.locator('[data-wallet="available"]').textContent(),'4');
  assert.match(await page.locator('[data-upgrade-card="T02"]').textContent(),/138/);
  await page.reload();await page.locator('[data-action="workshop"]').click();
  assert.equal(await page.locator('[data-wallet="available"]').textContent(),'4');
  await page.locator('[data-action="workshop-back"]').click();
  await page.locator('[data-action="levels"]').click();
  await page.locator('[data-action="level"][data-level="0"]').click();
  await page.locator('[data-toy="T02"]').click();
  await page.locator('#battle-canvas').click({position:{x:310,y:340}});
  assert.equal(await page.evaluate(()=>window.__QA__.battle().allToys[0]?.maxHp),138);
  await page.keyboard.press('Escape');
  const time=await page.evaluate(()=>window.__QA__.battle().time);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>window.__QA__.battle().time),time);
  await page.screenshot({path:'/tmp/bvp-pause.png'});
  await page.evaluate(()=>window.__QA__.menu());
  await page.locator('[data-action="workshop"]').click();
  await page.screenshot({path:'/tmp/bvp-workshop.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: fresh save, migration, buy, reload, real placement and pause');
  await context.close();
} finally {await browser.close();}
