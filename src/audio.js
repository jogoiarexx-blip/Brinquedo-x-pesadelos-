export class AudioService {
  constructor() { this.ctx=null; this.sfx=true; this.music=true; this.musicTimer=0; this.musicStep=0; this.lastShoot=-99; this.disabled=false; }
  resume() { if(this.disabled)return; try { const Context=window.AudioContext||window.webkitAudioContext; if(!Context)return; this.ctx ||=new Context(); if(this.ctx.state==='suspended') this.ctx.resume().catch(()=>{}); } catch {this.disabled=true;} }
  tone(freq, duration=.09, type='sine', vol=.045, at=0) {
    if (!this.ctx || this.ctx.state!=='running')return;
    const t=this.ctx.currentTime+at;
    try { const o=this.ctx.createOscillator(),g=this.ctx.createGain(); o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+duration+.02); }catch{}
  }
  play(type) {
    if (!this.sfx)return;
    switch(type){
      case 'click':this.tone(560,.065,'sine',.029);break;
      case 'place':this.tone(470,.09,'triangle',.06);this.tone(730,.11,'sine',.04,.065);break;
      case 'collect':this.tone(860,.085,'sine',.055);this.tone(1175,.14,'sine',.05,.07);break;
      case 'shoot':this.tone(350,.055,'triangle',.013);break;
      case 'freeze':this.tone(720,.11,'sine',.022);this.tone(990,.12,'sine',.014,.05);break;
      case 'confetti':this.tone(440,.085,'triangle',.026);this.tone(680,.09,'triangle',.02,.04);break;
      case 'sleep':this.tone(580,.2,'sine',.023);this.tone(400,.23,'sine',.022,.08);break;
      case 'jump':this.tone(300,.12,'triangle',.025);this.tone(590,.16,'sine',.03,.07);break;
      case 'hit':this.tone(195,.085,'triangle',.028);break;
      case 'remove':this.tone(220,.14,'sine',.045);break;
      case 'no':this.tone(170,.16,'sawtooth',.03);break;
      case 'enemy':this.tone(245,.07,'triangle',.022);break;
      case 'wave':this.tone(390,.22,'square',.038);this.tone(310,.24,'square',.035,.24);break;
      case 'victory': [523,659,784,1047].forEach((f,i)=>this.tone(f,.26,'triangle',.065,i*.14));break;
      case 'defeat':[350,310,220].forEach((f,i)=>this.tone(f,.25,'triangle',.046,i*.22));break;
    }
  }
  tick(dt,playing=true) {
    if(!playing || !this.music || !this.ctx || this.ctx.state!=='running')return;
    this.musicTimer+=dt;
    if(this.musicTimer>.41){this.musicTimer%=.41;
      // Pequena melodia composta para este jogo; não reproduz trilha de terceiros.
      const notes=[392,0,523,0,587,523,440,0,392,0,349,0,330,349,392,0];
      const f=notes[this.musicStep++%notes.length]; if(f)this.tone(f,.21,'sine',.012);
    }
  }
}
