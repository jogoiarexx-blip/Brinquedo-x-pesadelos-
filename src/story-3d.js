// v2.3.0 — Cinemática GLB real e *opt-in*. O jogo 2D nunca importa Three.js.
// Import map com versão fixa: carregado apenas após consentimento explícito em Opções.
export const STORY_GLB_MODELS=Object.freeze({
  'toy-T01':'./assets/models/piao-da-lia.glb',
  'toy-T02':'./assets/models/soldadinho.glb',
  'toy-T13':'./assets/models/boneca-guarda-chuva.glb',
  'enemy-E22':'./assets/models/grande-bicho-papao.glb'
});
export function modelForStoryFrame(frame){
  const art=frame?.art;
  return typeof art==='string'&&Object.hasOwn(STORY_GLB_MODELS,art)?STORY_GLB_MODELS[art]:null;
}
export function canAttemptStory3D(locationProtocol=globalThis.location?.protocol){
  return locationProtocol==='https:'||locationProtocol==='http:';
}
let activeSession=null,libraryPromise=null,libraryFailed=false;
const LOAD_TIMEOUT_MS=9000;
async function importRuntime(){
  if(libraryFailed)throw Error('Biblioteca 3D não disponível');
  if(!libraryPromise)libraryPromise=Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js')
  ]).catch(error=>{libraryFailed=true;throw error;});
  return libraryPromise;
}
function disposeModel(gltf){
  if(!gltf?.scene)return;
  gltf.scene.traverse(node=>{
    node.geometry?.dispose?.();
    if(node.material){
      const mats=Array.isArray(node.material)?node.material:[node.material];
      for(const material of mats){
        for(const value of Object.values(material))if(value?.isTexture)value.dispose?.();
        material.dispose?.();
      }
    }
  });
}
export function stopStory3D(){
  const session=activeSession;activeSession=null;
  if(!session)return;
  session.cancelled=true;
  if(session.timeout)clearTimeout(session.timeout);
  if(session.raf&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(session.raf);
  session.resizeObserver?.disconnect?.();
  if(session.resizeListener&&typeof window!=='undefined')window.removeEventListener('resize',session.resizeListener);
  if(session.sceneAsset)disposeModel(session.sceneAsset);
  session.mixer?.stopAllAction?.();
  session.renderer?.dispose?.();
  session.renderer?.forceContextLoss?.();
  session.host?.remove();
  session.stage?.classList.remove('story-glb-active');
  if(session.stage?.dataset)session.stage.dataset.cinematic='2d';
}
export async function mountStory3D(stage,frame,motion=true){
  stopStory3D();
  const file=modelForStoryFrame(frame);
  if(!file||!stage||typeof document==='undefined'||!canAttemptStory3D()||libraryFailed)return false;
  stage.dataset.cinematic='loading';
  const session={cancelled:false,stage,host:null,raf:0,renderer:null,sceneAsset:null,mixer:null,resizeObserver:null,resizeListener:null};
  activeSession=session;
  const live=()=>activeSession===session&&!session.cancelled&&stage.isConnected;
  try{
    // Evita que uma CDN sem resposta deixe a cena permanentemente em "carregando".
    const deadline=new Promise((_,reject)=>{
      session.timeout=setTimeout(()=>reject(new Error('Tempo limite de carregamento GLB')),LOAD_TIMEOUT_MS);
    });
    // Carrega a biblioteca apenas quando a pessoa ativar 3D; o fallback não é tocado.
    const [THREE,{GLTFLoader}]=await Promise.race([importRuntime(),deadline]);
    if(!live())return false;
    const loader=new GLTFLoader();
    loader.setCrossOrigin('anonymous');
    const url=new URL(file,document.baseURI);
    if(url.origin!==location.origin)throw Error('Modelo externo bloqueado');
    const asset=await Promise.race([loader.loadAsync(url.href),deadline]);
    session.sceneAsset=asset;
    if(!live()){disposeModel(asset);session.sceneAsset=null;return false;}
    const host=document.createElement('div');
    host.className='story-3d-layer';
    host.setAttribute('aria-hidden','true');
    session.host=host;stage.appendChild(host);
    const scene=new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffeedd,0x4a3668,2.2));
    const key=new THREE.DirectionalLight(0xffdfa5,2.5);key.position.set(-4,7,7);scene.add(key);
    const rim=new THREE.DirectionalLight(0xaacaff,1.2);rim.position.set(5,2,-4);scene.add(rim);
    const actor=new THREE.Group();actor.add(asset.scene);scene.add(actor);
    const bounds=new THREE.Box3().setFromObject(asset.scene);
    const center=bounds.getCenter(new THREE.Vector3());
    const size=bounds.getSize(new THREE.Vector3());
    asset.scene.position.sub(center);
    const camera=new THREE.PerspectiveCamera(36,1,.1,100);
    const span=Math.max(size.y,size.x,1.8);
    camera.position.set(0,.10,span*1.9);camera.lookAt(0,0,0);
    const renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
    session.renderer=renderer;
    renderer.setClearColor(0x000000,0);
    const maxRatio=1.25;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,maxRatio));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost',event=>{
      event.preventDefault();
      if(live()){stopStory3D();stage.dataset.cinematic='fallback';}
    },{once:true});
    const fit=()=>{
      if(!live())return;
      const w=Math.min(640,Math.max(160,Math.round(host.clientWidth||stage.clientWidth*.45)));
      const h=Math.min(380,Math.max(145,Math.round(host.clientHeight||stage.clientHeight)));
      camera.aspect=w/h;camera.updateProjectionMatrix();
      renderer.setSize(w,h,false);
    };
    fit();
    if(typeof ResizeObserver!=='undefined'){
      session.resizeObserver=new ResizeObserver(()=>fit());
      session.resizeObserver.observe(host);
    }else{
      session.resizeListener=fit;window.addEventListener('resize',fit,{passive:true});
    }
    const mixer=asset.animations?.length?new THREE.AnimationMixer(asset.scene):null;
    session.mixer=mixer;
    if(mixer){for(const clip of asset.animations.slice(0,1))mixer.clipAction(clip).play();}
    if(!motion&&mixer)mixer.setTime(.5);
    renderer.render(scene,camera);
    if(!live())return false;
    stage.classList.add('story-glb-active');
    stage.dataset.cinematic='active';
    // Limite de 30 FPS. Em movimento reduzido faz só um frame estático.
    if(motion){
      let last=0;
      const frame3D=(now)=>{
        if(!live())return;
        session.raf=requestAnimationFrame(frame3D);
        if(document.hidden||now-last<1000/30)return;
        const dt=Math.min(.05,last?(now-last)/1000:0);last=now;
        mixer?.update(dt);
        actor.position.y=Math.sin(now*.0018)*.035;
        actor.rotation.z=Math.sin(now*.0011)*.025;
        renderer.render(scene,camera);
      };
      session.raf=requestAnimationFrame(frame3D);
    }
    return true;
  }catch{
    // Sem rede/WebGL/modelo: deixa visível a ilustração 2D original.
    if(activeSession===session){stopStory3D();stage.dataset.cinematic='fallback';}
    return false;
  }finally{
    if(session.timeout)clearTimeout(session.timeout);
  }
}
