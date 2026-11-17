// Medidor de desempenho de execução real. Não mede FPS em testes Node como se fosse Android.
export class FrameTelemetry {
  constructor(maxSamples=90){
    this.maxSamples=Math.max(10,Math.min(180,Math.floor(maxSamples)||90));
    this.reset();
  }
  reset(){this.previous=null;this.deltas=[];this.renderDurations=[];return this;}
  sample(timestamp,renderMs=0){
    if(!Number.isFinite(timestamp))return;
    if(this.previous!==null){
      const dt=timestamp-this.previous;
      // Registra até ~1,3 FPS em aparelhos lentos; ignora pausas/segundo plano prolongados.
      if(dt>=4&&dt<=750){
        this.deltas.push(dt);this.renderDurations.push(Math.max(0,Math.min(250,Number(renderMs)||0)));
        if(this.deltas.length>this.maxSamples)this.deltas.shift();
        if(this.renderDurations.length>this.maxSamples)this.renderDurations.shift();
      }
    }
    this.previous=timestamp;
  }
  snapshot(){
    if(!this.deltas.length)return {fps:null,renderMs:null,samples:0};
    const sum=(a)=>a.reduce((n,x)=>n+x,0);
    const fps=Math.round(1000*this.deltas.length/sum(this.deltas));
    const renderMs=Math.round(sum(this.renderDurations)/this.renderDurations.length*10)/10;
    return {fps,renderMs,samples:this.deltas.length};
  }
}
