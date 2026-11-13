import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('instalação PWA pede arquivos novos mesmo com cache HTTP antigo',async()=>{
  const handlers=new Map(),requested=[];
  class ScopedRequest extends Request {
    constructor(url,options){super(new URL(url,'https://example.test/game/'),options);}
  }
  vm.runInNewContext(readFileSync(new URL('../sw.js',import.meta.url),'utf8'),{
    Request:ScopedRequest,
    self:{addEventListener:(name,handler)=>handlers.set(name,handler),skipWaiting:()=>Promise.resolve()},
    caches:{open:async()=>({addAll:async requests=>{requested.push(...requests);}})}
  });
  let installed;handlers.get('install')({waitUntil:promise=>{installed=promise;}});await installed;
  assert.ok(requested.length>10);
  // This is the HTTP-cache contract emitted by our installation handler.
  for(const request of requested){assert.equal(request.cache,'reload',String(request));}
});
