import { W,H,BOARD,BOARD_RIGHT,BOARD_BOTTOM,colX,rowY,clamp } from './config.js?v=2.0.0';
import { TOYS, ENEMIES } from './data.js?v=2.0.0';
const TAU=Math.PI*2;
const COLORS={ink:'#3b2749',cream:'#fff6da'};
const BACKDROP_CACHE=new Map();
function paintBackdrop(c,chapter){
  // Fundos estáticos são desenhados uma vez por capítulo, não a cada frame.
  if(typeof document==='undefined'){drawBackground(c,0,chapter);return;}
  let backdrop=BACKDROP_CACHE.get(chapter);
  if(!backdrop){
    backdrop=document.createElement('canvas');backdrop.width=W;backdrop.height=H;
    const ctx=backdrop.getContext('2d',{alpha:false});
    if(!ctx){drawBackground(c,0,chapter);return;}
    drawBackground(ctx,0,chapter);BACKDROP_CACHE.set(chapter,backdrop);
  }
  c.drawImage(backdrop,0,0);
}
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();}
function rr(c,x,y,w,h,r,fill,stroke=null,lw=2){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function line(c,pts,color,width=2){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
function star(c,x,y,outer,inner,color,rot=-Math.PI/2){c.beginPath();for(let i=0;i<10;i++){const r=i%2===0?outer:inner,a=rot+i*Math.PI/5;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fillStyle=color;c.fill();}
function txt(c,text,x,y,size=18,color='#fff8e7',align='center',weight=800){c.textAlign=align;c.textBaseline='middle';c.font=`${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;c.fillStyle=color;c.fillText(text,x,y);}
function eye(c,x,y,r=5){ellipse(c,x,y,r,r*1.13,'#fffdf7');ellipse(c,x+1.3,y+.9,r*.45,r*.6,COLORS.ink);ellipse(c,x+.5,y-r*.25,r*.16,r*.16,'white');}
function drawCloud(c,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);ellipse(c,0,0,66,20,'#281a4480');ellipse(c,-20,-12,33,24,'#b7a8e0');ellipse(c,19,-15,35,29,'#cab8ed');ellipse(c,0,-30,30,31,'#dfcdf2');ellipse(c,-18,-23,11,9,'#e3d7f7');c.restore();}

function drawAmbientPolish(c,time,chapter,visualMotion=true){
  const tone=chapter===5?'rgba(196,172,245,.16)':chapter===4?'rgba(231,203,167,.14)':chapter===2?'rgba(117,177,255,.14)':chapter===3?'rgba(255,190,119,.13)':'rgba(255,219,156,.14)';
  const halo=c.createRadialGradient(205,118,4,205,118,490);halo.addColorStop(0,tone);halo.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=halo;c.fillRect(0,0,W,H);
  const vignette=c.createRadialGradient(W*.5,H*.48,230,W*.5,H*.48,850);
  vignette.addColorStop(0,'rgba(17,12,36,0)');vignette.addColorStop(.72,'rgba(17,12,36,.025)');vignette.addColorStop(1,'rgba(17,12,36,.22)');
  c.fillStyle=vignette;c.fillRect(0,0,W,H);
  for(let i=0;i<18;i++){
    const drift=visualMotion?time*(5+(i%4)*2):0,phase=visualMotion?time*.7+i:i;
    const x=((i*173+drift+(visualMotion?Math.sin(phase)*17:0))%(W+30)+W+30)%(W+30)-15;
    const y=28+((i*79+(visualMotion?Math.sin(phase*.8)*13:0))%(H-56));
    c.save();c.globalAlpha=.055+.035*(.5+.5*Math.sin(phase*1.7));
    ellipse(c,x,y,1.2+(i%3)*.55,1.2+(i%3)*.55,i%4===0?'#fff0bd':'#e6f2ff');
    if(i%6===0)star(c,x+5,y-4,3.2,1.3,'#fff2c6');c.restore();
  }
}
function drawBoardTrim(c,time,chapter){
  const x=BOARD.x-16,y=BOARD.y-13,w=BOARD.cw*BOARD.cols+32,h=BOARD.ch*BOARD.rows+26;
  const trim=chapter===2?'#d9e8ff':'#fff0d4';
  rr(c,x,y,w,h,24,null,chapter===2?'#d9e8ff7a':'#fff0d47a',2.4);
  line(c,[[x+22,y+3],[x+w-22,y+3]],chapter===2?'#eff6ff77':'#fff8e477',2);
  line(c,[[x+22,y+h-3],[x+w-22,y+h-3]],'#37274438',2);
  for(let row=0;row<BOARD.rows;row++)for(let col=0;col<BOARD.cols;col++){
    const tx=BOARD.x+col*BOARD.cw,ty=BOARD.y+row*BOARD.ch;
    line(c,[[tx+9,ty+7],[tx+BOARD.cw-9,ty+7]],'#fff8e51b',1);
    if((row*3+col)%7===0)ellipse(c,tx+9,ty+9,1.7,1.7,trim);
  }
  for(const [bx,by] of [[x+13,y+13],[x+w-13,y+13],[x+13,y+h-13],[x+w-13,y+h-13]]){
    ellipse(c,bx,by,4.2,4.2,'#604761');ellipse(c,bx-1,by-1,1.5,1.5,'#fff0c6');
  }
}
// Cenário dedicado: evita desenhar dois fundos completos no mesmo quadro.
function drawCorridor(c){
    // Corredor Rangente: arquitetura em perspectiva com luzes de rodapé e carpete quente.
    const hall=c.createLinearGradient(0,0,W,H);
    hall.addColorStop(0,'#162a46');hall.addColorStop(.52,'#4e385d');hall.addColorStop(1,'#16263c');
    c.fillStyle=hall;c.fillRect(0,0,W,H);
    // Papel de parede, quadros tortos e luminárias de corredor.
    for(let i=0;i<17;i++){const x=i*78;rr(c,x+13,18,24,350,10,'#a89ab118');}
    for(let i=0;i<3;i++){
      const x=86+i*344,y=53+i%2*19;c.save();c.translate(x,y);c.rotate((i%2?-.09:.08));
      rr(c,-43,-28,86,82,8,'#966f7b','#f2d6a8',6);rr(c,-32,-17,64,59,4,'#334960','#b2c4ba',3);
      star(c,0,10,20,9,'#ebcaa0');c.restore();
    }
    for(const x of [157,1096]){rr(c,x,78,32,126,9,'#b8959b','#f4d0a3',4);ellipse(c,x+16,76,15,14,'#fff1b4');}
    // Molduras das cinco portas: o brilho muda por onda no render da batalha.
    rr(c,1114,124,125,460,16,'#292642','#8b7199',7);
    for(let lane=0;lane<5;lane++){
      const y=BOARD.y+lane*BOARD.ch+3;
      rr(c,1126,y,94,BOARD.ch-7,10,'#322f4a','#a78998',3);
      ellipse(c,1200,y+BOARD.ch*.49,5,6,'#ecc47e');
    }
    // Carpete do corredor: a grade continua inteiramente visível.
    rr(c,BOARD.x-18,BOARD.y-15,BOARD.cw*BOARD.cols+36,BOARD.ch*BOARD.rows+30,23,'#514563','#c6a586',6);
    for(let row=0;row<BOARD.rows;row++)for(let col=0;col<BOARD.cols;col++){
      const x=BOARD.x+col*BOARD.cw,y=BOARD.y+row*BOARD.ch;
      rr(c,x+2,y+2,BOARD.cw-4,BOARD.ch-4,7,(row+col)%2?'#79687d':'#877387');
      if((row+col*2)%6===0)star(c,x+15,y+17,4.5,2,'#e6d0a57a');
    }
    for(let row=0;row<=BOARD.rows;row++)line(c,[[BOARD.x,BOARD.y+row*BOARD.ch],[BOARD_RIGHT,BOARD.y+row*BOARD.ch]],'#e9cfaa79',2);
    for(let col=0;col<=BOARD.cols;col++)line(c,[[BOARD.x+col*BOARD.cw,BOARD.y],[BOARD.x+col*BOARD.cw,BOARD_BOTTOM]],'#e9cfaa52',2);
    for(let i=0;i<6;i++){const x=i*244;ellipse(c,x,681,4,7,'#fff1aa');}
    rr(c,12,374,144,176,17,'#71899d','#ffe0a2',5);rr(c,14,356,139,32,11,'#c8a180','#664f76',4);
    star(c,82,454,36,17,'#f9d781');
}

// Sótão: cenário 2.5D com vigas, janela, caixas e tapete em perspectiva.
// Todas as casas continuam no mesmo tabuleiro lógico 5x9; nenhuma colisão depende da arte.
function drawAttic(c){
  const bg=c.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#29243c');bg.addColorStop(.53,'#685269');bg.addColorStop(1,'#382d3f');
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  // Telhado e planos de madeira recuados.
  c.beginPath();c.moveTo(0,171);c.lineTo(640,10);c.lineTo(W,171);c.lineTo(W,0);c.lineTo(0,0);c.closePath();
  c.fillStyle='#221b38';c.fill();
  for(const side of [-1,1]){
    const start=side<0?0:W;
    line(c,[[start,165],[640,6]],'#94738d',12);
    line(c,[[start,182],[640,21]],'#c89b7d44',3);
  }
  for(let i=0;i<7;i++){
    const x=68+i*192;line(c,[[x,0],[x+32,172]],'#b494a049',11);
    line(c,[[x+12,0],[x+40,172]],'#e3c5a833',3);
  }
  // Janela circular com luz de luar e feixe diagonal no ar.
  const beam=c.createRadialGradient(312,85,20,312,85,320);
  beam.addColorStop(0,'#f5e4af4d');beam.addColorStop(1,'#f1dbaf00');
  c.fillStyle=beam;c.fillRect(0,0,850,500);
  ellipse(c,312,84,72,65,'#604963');ellipse(c,312,84,58,53,'#93b9c7');ellipse(c,323,73,33,32,'#f5e8c2');
  line(c,[[312,26],[312,140]],'#b58e7d',7);line(c,[[255,84],[370,84]],'#b58e7d',7);
  // Caixotes em profundidade (topo e bordas).
  for(const [x,y,w,h] of [[55,92,125,92],[950,72,176,101],[1104,151,125,110],[718,109,111,54]]){
    rr(c,x,y,w,h,8,'#745567','#d1a081',5);
    line(c,[[x+12,y+19],[x+w-12,y+19]],'#dab696',3);
    line(c,[[x+19,y+9],[x+19,y+h-12]],'#4b3855',4);
    line(c,[[x+w-22,y+9],[x+w-22,y+h-12]],'#4b3855',4);
    star(c,x+w*.58,y+h*.59,9,4,'#dfbe8b');
  }
  // Lanternas, lençóis pendurados e bicicleta antiga no plano de fundo.
  line(c,[[939,0],[939,61]],'#f1d5ae',4);
  ellipse(c,939,79,24,26,'#f5d18c');ellipse(c,939,79,36,40,'#e6a16f32');
  c.beginPath();c.moveTo(540,46);c.quadraticCurveTo(555,106,536,159);
  c.quadraticCurveTo(595,173,641,156);c.quadraticCurveTo(702,171,716,154);
  c.lineTo(697,46);c.closePath();c.fillStyle='#c0adc0ac';c.fill();
  for(let i=0;i<3;i++)line(c,[[558+i*60,55],[559+i*60,144]],'#eee1c03a',2);
  // Rodapé e tábuas mantidos abaixo da defesa.
  const floor=c.createLinearGradient(0,272,0,H);
  floor.addColorStop(0,'#594555');floor.addColorStop(1,'#916c69');
  c.fillStyle=floor;c.fillRect(0,304,W,H-304);
  for(let i=0;i<13;i++)line(c,[[0,310+i*38],[W,310+i*38]],'#c29a8144',3);
  for(let i=0;i<11;i++)line(c,[[140+i*127,311],[72+i*144,H]],'#e5bba026',2);
  // Tapete do sótão: superfície 5x9 com profundidade visual sem alterar hitboxes.
  rr(c,BOARD.x-21,BOARD.y-17,BOARD.cols*BOARD.cw+42,BOARD.rows*BOARD.ch+34,25,'#362b47a6','#caa889',7);
  rr(c,BOARD.x-10,BOARD.y-9,BOARD.cols*BOARD.cw+20,BOARD.rows*BOARD.ch+18,18,'#7b6b76','#ebccae',3);
  for(let row=0;row<BOARD.rows;row++)for(let col=0;col<BOARD.cols;col++){
    const x=BOARD.x+col*BOARD.cw,y=BOARD.y+row*BOARD.ch;
    rr(c,x+2,y+2,BOARD.cw-4,BOARD.ch-4,6,(row+col)%2?'#847782':'#95828c');
    line(c,[[x+8,y+10],[x+BOARD.cw-8,y+10]],'#f6dbb21f',1.5);
  }
  for(let row=0;row<=BOARD.rows;row++)
    line(c,[[BOARD.x,BOARD.y+row*BOARD.ch],[BOARD_RIGHT,BOARD.y+row*BOARD.ch]],'#eacbab70',2);
  for(let col=0;col<=BOARD.cols;col++)
    line(c,[[BOARD.x+col*BOARD.cw,BOARD.y],[BOARD.x+col*BOARD.cw,BOARD_BOTTOM]],'#eacbab46',2);
  // Coração e baú à esquerda, sempre fora das 45 casas.
  rr(c,10,365,151,174,15,'#876f78','#efd3ae',6);
  rr(c,4,354,163,38,10,'#cb9e77','#67445d',5);
  star(c,83,444,32,14,'#ffe7a6');txt(c,'♥',83,444,27,'#da8d95');
  // Primeiro plano: caixotes pequenos por baixo do campo.
  for(const [x,y,w,h] of [[38,636,171,71],[1081,626,158,83]]){
    rr(c,x,y,w,h,9,'#69475c','#c29d80',5);
    line(c,[[x+12,y+17],[x+w-10,y+17]],'#e3ba97',3);
  }
}
function drawDepthAccents(c,time,chapter,visualMotion=true){
  // Camadas leves na borda superior e inferior; não cobrem a grade.
  const drift=visualMotion?Math.sin(time*.32)*7:0;
  c.save();
  const color=chapter===5?'#dfc4f1':chapter===4?'#f1d4ad':chapter===3?'#edc1a7':chapter===2?'#accde9':'#f6d6af';
  for(let i=0;i<4;i++){
    const x=55+i*350+drift*(.4+i*.15);
    c.globalAlpha=.065+i*.006;
    line(c,[[x,-6],[x-23,170]],color,9);
  }
  c.globalAlpha=.12;
  for(let i=0;i<5;i++){
    const x=28+i*285-drift*.5;
    ellipse(c,x,690+(i%2)*11,65+i*4,8,color);
  }
  c.restore();
}
function drawDustCells(c,game,time,visualMotion=true){
  if(!game?.dust?.size)return;
  c.save();
  for(const spot of game.dust){
    const [r,k]=spot.split(':').map(Number);
    const x=BOARD.x+k*BOARD.cw,y=BOARD.y+r*BOARD.ch;
    const pulse=visualMotion?.80+.12*Math.sin(time*1.7+k*.71+r):.82;
    c.globalAlpha=pulse;
    rr(c,x+5,y+5,BOARD.cw-10,BOARD.ch-10,9,'#d5b27b36','#f2da9c82',2);
    for(let i=0;i<4;i++)ellipse(c,x+16+i*17,y+15+(i*13+r*7)%52,2+(i%2),2+(i%2),'#ffebbd');
    txt(c,'☷',x+BOARD.cw-19,y+BOARD.ch-18,14,'#fff0bf');
  }
  c.restore();
}

// Plano 2.5D final: quarto transformado em sonho, com planos de profundidade sem WebGL.
function drawDream(c){
  const sky=c.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#171637');sky.addColorStop(.55,'#58417b');sky.addColorStop(1,'#372c54');
  c.fillStyle=sky;c.fillRect(0,0,W,H);
  const mist=c.createRadialGradient(870,160,20,870,160,570);
  mist.addColorStop(0,'#b896f04d');mist.addColorStop(1,'#b896f000');
  c.fillStyle=mist;c.fillRect(0,0,W,H);
  // Lua que guarda o Coração, estrelas e portais distantes.
  ellipse(c,325,98,68,68,'#f3dfb7');ellipse(c,349,77,65,65,'#352d5b');
  for(let i=0;i<37;i++){const x=(i*239+31)%W,y=(i*113+33)%247;
    star(c,x,y,3+i%4,2,'#efddbb');}
  for(const [x,y,w,h] of [[60,145,125,182],[1009,94,170,240],[837,159,102,151]]){
    rr(c,x,y,w,h,15,'#50406e','#bfa9d3',6);
    rr(c,x+14,y+13,w-28,h-26,9,'#28233f','#cdbbcf',3);
    ellipse(c,x+w*.5,y+55,18,33,'#a37bc856');
    star(c,x+w*.5,y+h*.5,17,8,'#e6c6ee');
  }
  // Camadas que se afastam em perspectiva até o horizonte do quarto.
  c.beginPath();c.moveTo(0,282);c.lineTo(456,184);c.lineTo(824,184);c.lineTo(W,282);c.lineTo(W,H);c.lineTo(0,H);c.closePath();
  c.fillStyle='#483a68';c.fill();
  for(let row=0;row<12;row++){
    const y=280+row*38;
    line(c,[[0,y],[W,y]],row%2?'#b5a0d326':'#f2dab22e',2);
  }
  for(let n=0;n<12;n++)line(c,[[n*128-100,H],[640+(n-5)*45,249]],'#d7b7d525',2);
  // A grade é a mesma 5×9; apenas a superfície recebe aparência diferente.
  rr(c,BOARD.x-23,BOARD.y-17,BOARD.cols*BOARD.cw+46,BOARD.rows*BOARD.ch+37,23,'#241e43ae','#e6c8dc',7);
  rr(c,BOARD.x-11,BOARD.y-9,BOARD.cols*BOARD.cw+22,BOARD.rows*BOARD.ch+20,16,'#8a73a7','#d5b6e7',3);
  for(let row=0;row<BOARD.rows;row++)for(let col=0;col<BOARD.cols;col++){
    const x=BOARD.x+col*BOARD.cw,y=BOARD.y+row*BOARD.ch;
    rr(c,x+2,y+2,BOARD.cw-4,BOARD.ch-4,6,(col+row)%2?'#8275aa':'#a087b1');
    line(c,[[x+7,y+9],[x+BOARD.cw-7,y+9]],'#f5ecdd28',1.3);
  }
  for(let row=0;row<=BOARD.rows;row++)line(c,[[BOARD.x,BOARD.y+row*BOARD.ch],[BOARD_RIGHT,BOARD.y+row*BOARD.ch]],'#f0d3ea65',2);
  for(let col=0;col<=BOARD.cols;col++)line(c,[[BOARD.x+col*BOARD.cw,BOARD.y],[BOARD.x+col*BOARD.cw,BOARD_BOTTOM]],'#f0d3ea48',2);
  // Coração da Imaginação à esquerda, mantido fora da grade de combate.
  rr(c,6,355,158,186,17,'#65527e','#f8deca',5);
  star(c,85,440,49,22,'#ffe2ac');
  txt(c,'♥',83,441,35,'#e885a3');
  for(const x of [34,1212])star(c,x,267,15,6,'#d8c9f1');
}
function drawDreamPulse(c,pulse,time,visualMotion=true){
  if(!pulse||pulse.phase==='idle')return;
  const warning=pulse.phase==='warning',fast=pulse.kind==='rush';
  const tint=fast?'#ffd28b':'#c5b4ff';
  c.save();
  c.globalAlpha=warning?.16+(visualMotion?.06*Math.sin(time*10):0):.12;
  c.fillStyle=tint;c.fillRect(BOARD.x,BOARD.y,BOARD.cols*BOARD.cw,BOARD.rows*BOARD.ch);
  c.globalAlpha=1;
  rr(c,385,137,510,36,14,'#2a1c4bd9',tint,3);
  txt(c,warning?(fast?'⚠ SONHO VAI ACELERAR':'⚠ SONHO VAI DESACELERAR'):(fast?'⏩ SONHO ACELERADO':'🌙 SONHO DESACELERADO'),
      640,155,17,'#fff1dc');
  c.restore();
}
export function drawBackground(c,time=0,chapter=1){
  if(chapter===3){drawCorridor(c);return;}
  if(chapter===4){drawAttic(c);return;}
  if(chapter===5){drawDream(c);return;}
  const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#40345f');sky.addColorStop(.58,'#675276');sky.addColorStop(1,'#2c3754');c.fillStyle=sky;c.fillRect(0,0,W,H);
  for(let i=0;i<25;i++){const x=(i*293+57)%W,y=(i*61+26)%185;ellipse(c,x,y,2+(i%3===0),2+(i%3===0),'#fbefb59c');}
  // Parede com listras e rodapé.
  c.globalAlpha=.12;for(let x=5;x<W;x+=58){rr(c,x,0,22,327,11,'#f2abc0');}c.globalAlpha=1;
  rr(c,28,22,243,171,16,'#392d58','#b78a9a',7);rr(c,42,35,214,144,10,'#1d3655','#a8c5cd',5);
  ellipse(c,204,81,33,33,'#fff5bf');ellipse(c,216,72,29,31,'#243653');
  for(let i=0;i<13;i++){star(c,57+(i*73)%188,55+(i*47)%100,3.5,1.7,'#fff5be');}
  line(c,[[150,35],[150,179]],'#a8c5cd',5);line(c,[[42,105],[254,105]],'#a8c5cd',5);
  rr(c,23,184,255,18,7,'#6b456b','#dbafab',4);
  // Prateleira com peças decorativas e marcas de madeira pintada.
  rr(c,445,74,382,14,5,'#e2aa89','#764b69',4);
  for(let i=0;i<8;i++)line(c,[[455+i*47,78],[475+i*47,78]],'#fff0ce55',1.4);
  rr(c,852,38,118,76,9,'#6d526f','#d8b9a2',4);rr(c,861,47,100,57,5,'#b6d4cb','#f2dfb9',3);star(c,911,75,20,9,'#f7d68d');
  for(let i=0;i<5;i++)ellipse(c,1000+i*13,94+(i%2)*3,3,3,'#f6d6a0');
  rr(c,477,36,46,37,6,'#6ac9bd','#345a79',3);rr(c,533,25,36,49,7,'#f5d186','#a46e70',3);
  rr(c,582,43,38,31,6,'#d79ec7','#996489',3);rr(c,632,28,50,46,6,'#a8deda','#477fa0',3);
  ellipse(c,729,53,23,23,'#f0c2a2');eye(c,721,50,4);eye(c,737,50,4);line(c,[[720,64],[737,63]],'#916b74',3);
  rr(c,803,34,12,40,5,'#fae59f');
  // Guarda-roupa de onde os inimigos aparecem.
  rr(c,1081,56,162,586,23,'#4e386a','#bd829c',9);rr(c,1097,77,133,540,13,'#342b54','#775c86',5);
  rr(c,1108,100,111,488,15,'#282647','#9b7597',3);
  for(let i=0;i<5;i++){ellipse(c,1172,145+i*85,41,32,i%2?'#44315b':'#403053');}
  ellipse(c,1135,149,7,10,'#f2e7d2');ellipse(c,1158,150,7,10,'#f2e7d2');
  // Piso e tapete.
  const floor=c.createLinearGradient(0,275,0,H);floor.addColorStop(0,'#886579');floor.addColorStop(1,'#b47d83');c.fillStyle=floor;c.fillRect(0,310,W,410);
  rr(c,0,313,W,13,0,'#d4a0a0');for(let y=340;y<H;y+=95)line(c,[[0,y],[W,y]],'#edb2a46b',4);
  // Baú da imaginação à esquerda.
  rr(c,12,369,144,181,24,'#9bd1ce','#325d73',6);rr(c,2,351,166,39,14,'#f6cb7d','#906080',5);
  rr(c,41,410,91,88,13,'#f5dc99','#af8b8b',5);star(c,86,455,32,15,'#f9b747');
  txt(c,'♥',86,458,25,'#ee6e82');
  // Sombra do campo.
  rr(c,BOARD.x-20,BOARD.y-17,BOARD.cw*BOARD.cols+39,BOARD.ch*BOARD.rows+36,28,'#321d4388');
  rr(c,BOARD.x-12,BOARD.y-10,BOARD.cw*BOARD.cols+24,BOARD.ch*BOARD.rows+20,24,'#dbb18a','#654562',6);
  for(let r=0;r<BOARD.rows;r++){
    rr(c,BOARD.x,BOARD.y+r*BOARD.ch,BOARD.cw*BOARD.cols,BOARD.ch,0,r%2===0?'#88b6ad':'#78a9a1');
    for(let col=0;col<BOARD.cols;col++){
      const x=BOARD.x+col*BOARD.cw,y=BOARD.y+r*BOARD.ch;
      rr(c,x+4,y+4,BOARD.cw-8,BOARD.ch-8,12,(col+r)%2===0?'#ffffff11':'#112f4b08');
      if(col<BOARD.cols-1)line(c,[[x+BOARD.cw,y+8],[x+BOARD.cw,y+BOARD.ch-8]],'#e6f5d139',2);
      if((r*11+col)%4===0){c.save();c.globalAlpha=.17;line(c,[[x+14,y+BOARD.ch-13],[x+BOARD.cw-16,y+BOARD.ch-13]],'#f4e8c6',1.2);c.restore();}
    }
    if(r<BOARD.rows-1)line(c,[[BOARD.x+5,BOARD.y+(r+1)*BOARD.ch],[BOARD_RIGHT-5,BOARD.y+(r+1)*BOARD.ch]],'#47656b40',3);
  }
  // Faixas costuradas do tapete.
  line(c,[[BOARD.x+8,BOARD.y+5],[BOARD_RIGHT-9,BOARD.y+5]],'#f3d5ad',4);
  line(c,[[BOARD.x+8,BOARD_BOTTOM-5],[BOARD_RIGHT-9,BOARD_BOTTOM-5]],'#f3d5ad',4);
  for(let i=0;i<BOARD.rows;i++){star(c,BOARD.x+14,rowY(i),4,2,'#e5f5d98f');}
  // Enfeites, cantos e chão.
  rr(c,290,652,175,20,10,'#7c53768f');ellipse(c,365,643,100,20,'#6b4c7788');
  rr(c,1114,665,145,18,9,'#69446b');
  if(chapter===2){
    // Sob a cama: paleta nova, cama acima do campo e tapete bordado de estrelas.
    c.fillStyle='#0a133a7b';c.fillRect(0,0,W,H);
    rr(c,BOARD.x-17,BOARD.y-15,BOARD.cw*BOARD.cols+34,BOARD.ch*BOARD.rows+30,23,'#20324cd9','#7d92b9',5);
    for(let row=0;row<BOARD.rows;row++)for(let col=0;col<BOARD.cols;col++){
      const x=BOARD.x+col*BOARD.cw,y=BOARD.y+row*BOARD.ch;
      rr(c,x+2,y+2,BOARD.cw-4,BOARD.ch-4,9,(row+col)%2?'#3f5974':'#496987');
      if((row*7+col)%5===0)star(c,x+14,y+15,5,2,'#b6d8ef81');
    }
    for(let row=0;row<=BOARD.rows;row++)line(c,[[BOARD.x,BOARD.y+row*BOARD.ch],[BOARD_RIGHT,BOARD.y+row*BOARD.ch]],'#d0daf244',2);
    for(let col=0;col<=BOARD.cols;col++)line(c,[[BOARD.x+col*BOARD.cw,BOARD.y],[BOARD.x+col*BOARD.cw,BOARD_BOTTOM]],'#d0daf229',1.6);
    // Estrutura da cama acima, sem cobrir a área interativa.
    rr(c,168,76,901,109,28,'#594a73','#d7b2a0',8);
    rr(c,183,88,870,58,19,'#8a9bc7','#e9d7c2',5);
    for(let i=0;i<15;i++)star(c,220+i*54,114+(i%3)*7,5,2,'#e9f2ce');
    rr(c,170,145,30,480,11,'#654562','#af8fa4',5);
    rr(c,1051,145,29,475,11,'#654562','#af8fa4',5);
    ellipse(c,108,617,89,32,'#2a1b4780');
    rr(c,36,555,115,75,29,'#b1a0c6','#554777',4);ellipse(c,70,556,17,20,'#b7e0e4');ellipse(c,121,556,17,20,'#b7e0e4');
    for(let i=0;i<13;i++){
      const x=210+(i*127)%800,y=203+(i*79)%394;
      ellipse(c,x,y,1.8,1.8,'#d7e8fe7f');
    }
  }

}
function drawTrain(c,x,y,spent=false,moving=false){
  c.save();c.translate(x,y);if(spent)c.globalAlpha=.28;
  ellipse(c,0,26,39,10,'#35314d5c');
  rr(c,-34,-14,61,32,11,moving?'#f8b251':'#e15d67','#6d3b69',3);
  rr(c,-27,-29,31,21,7,'#82d3dc','#466079',3);
  rr(c,2,-21,22,11,5,'#ffcc7a','#6d3b69',2);
  ellipse(c,-18,21,10,10,'#4b4766');ellipse(c,14,21,10,10,'#4b4766');
  ellipse(c,-18,21,4,4,'#fbe8b6');ellipse(c,14,21,4,4,'#fbe8b6');
  rr(c,27,-12,12,7,2,'#f9d67e');
  c.restore();
}
function drawToy(c,t,time,visualMotion=true){
  const d=TOYS[t.type];c.save();
  const recoil=visualMotion?clamp((t.recoil||0)/.22,0,1):0,bounce=visualMotion?Math.sin((t.age||time)*3+t.id*.8)*2:0;
  c.translate(t.x-9*recoil,t.y+4+bounce);
  let s=1+(visualMotion?Math.sin(time*3+t.id*.8)*.024:0);
  if(t.hit>0){c.globalAlpha=.78;s*=.95;}c.scale(s+recoil*.04,s-recoil*.035);
  const toyShadow=c.createRadialGradient(0,26,2,0,26,42);toyShadow.addColorStop(0,'rgba(28,35,57,.38)');toyShadow.addColorStop(1,'rgba(28,35,57,0)');ellipse(c,0,26,42,12,toyShadow);
  // Braços de pano articulados: cada unidade ganha um ciclo próprio de espera e disparo.
  if(visualMotion){const swing=Math.sin((t.age||time)*4.2+(t.id||0)*.9)*5,reach=recoil*9;
    const armColor=d.kind==='producer'?'#c98e8b':d.kind==='blocker'?'#d69a8b':d.kind==='slow'?'#6eb7c3':d.kind==='splash'?'#ec98c0':'#9b88a8';
    line(c,[[-23,-2],[-34,-1+swing-reach]],armColor,7);line(c,[[23,-2],[34,-1-swing-reach]],armColor,7);
    ellipse(c,-34,-1+swing-reach,4.5,4.5,'#f4d2b5');ellipse(c,34,-1-swing-reach,4.5,4.5,'#f4d2b5');
  }
  if(t.type==='T18'){
    // Bichinho Sonolento: pelúcia azul de orelhas compridas e bocejos.
    ellipse(c,-21,-43,15,30,'#b5a3d7');ellipse(c,22,-43,15,31,'#c7b1de');
    ellipse(c,0,-5,32,36,'#b7a5dd');ellipse(c,0,-40,29,28,'#d9c8ee');
    ellipse(c,-10,-41,8,5,'#f7e6d9');ellipse(c,11,-41,8,5,'#f7e6d9');
    line(c,[[-15,-41],[-6,-39]],'#685784',2.4);line(c,[[7,-39],[16,-41]],'#685784',2.4);
    ellipse(c,1,-25,7,10,'#8d6f9e');ellipse(c,0,-5,15,13,'#f4e9ed');
    star(c,0,9,11,5,'#fff1ae');if(t.recoil>0)txt(c,'Zz',36,-76,21,'#efe4ff');
  }else if(t.type==='T19'){
    // Bola-Ímã: planeta redondo com polos e aro magnético.
    ellipse(c,0,-22,37,37,'#a6d7e1');ellipse(c,0,-22,28,28,'#d3eff0');
    c.save();c.rotate(-.25);rr(c,-38,-31,76,18,8,'#d4a7b8','#6a7d9f',4);c.restore();
    rr(c,-31,-29,14,19,4,'#e58fa7');rr(c,17,-29,14,19,4,'#7ba5cf');
    eye(c,-10,-20,6);eye(c,10,-20,6);ellipse(c,0,-7,8,4,'#7588ae');
    star(c,3,-47,11,5,'#fff8c0');
  }else if(t.type==='T20'){
    // Boneco de neve de algodão: montinho fofo com cachecol.
    ellipse(c,0,4,36,34,'#e8f7f4');ellipse(c,0,-37,29,29,'#f4fbfa');
    rr(c,-34,-23,68,12,6,'#d39caf','#8e7196',3);rr(c,17,-21,12,42,5,'#d39caf');
    eye(c,-11,-39,5);eye(c,11,-39,5);ellipse(c,0,-25,7,5,'#a8c5d2');
    star(c,0,4,9,4,'#cfb8ef');star(c,-26,-59,8,4,'#ffffff');
  }else if(t.type==='T21'){
    // Guitarrinha Desafinada: corpo de madeira e notas coloridas.
    c.save();c.rotate(-.15);
    ellipse(c,-3,1,31,29,'#e3b7d9');ellipse(c,0,-32,21,20,'#ecc8e7');
    rr(c,-7,-93,14,68,5,'#c6a37d','#8a708c',3);
    ellipse(c,0,-9,11,12,'#fce8bb');
    for(const x of [-4,0,4])line(c,[[x,-84],[x,-4]],'#fff8d9',1.3);
    c.restore();eye(c,-12,-36,4);eye(c,10,-36,4);
    if(t.recoil>0){txt(c,'♫',33,-74,20,'#ffe9c2');txt(c,'♪',-42,-63,18,'#dbefed');}
  }else if(t.type==='T22'){
    // Cavalinho de madeira com crina de pano e ferraduras.
    ellipse(c,0,6,33,26,'#c89673');
    line(c,[[-21,12],[-24,32]],'#825e6e',8);line(c,[[20,10],[22,31]],'#825e6e',8);
    c.beginPath();c.moveTo(4,-11);c.lineTo(10,-66);c.lineTo(37,-74);
    c.lineTo(44,-45);c.lineTo(23,-25);c.closePath();c.fillStyle='#dcb08a';c.fill();c.strokeStyle='#8c6175';c.lineWidth=4;c.stroke();
    for(let i=0;i<4;i++)line(c,[[6,-59+i*10],[-11,-64+i*10]],'#8d6888',4);
    ellipse(c,29,-58,4,5,'#fff8db');ellipse(c,30,-57,1.8,2,'#554861');
    rr(c,-27,-8,42,12,6,'#9c86b5');star(c,-7,3,12,5,'#ffe3a6');
    if(t.recoil>0)txt(c,'⚡',47,-57,18,'#fff0b9');
  }
  if(d.kind==='shooter' && !['T18','T19','T20','T21','T22'].includes(t.type)){
    // Soldadinho Estalo: um soldado de pano com atirador de papel.
    line(c,[[-14,8],[-18,24]],'#584b64',10);line(c,[[10,8],[13,24]],'#584b64',10);
    rr(c,-30,-5,60,38,15,'#6bc6b3','#426f81',4);
    rr(c,-19,-40,41,47,17,'#f9d5a0','#654b68',4);
    rr(c,-30,-45,61,16,7,'#5e89bd','#455278',4);
    rr(c,-19,-57,42,19,6,'#6ba4cb','#455278',4);
    rr(c,9,-8,47,13,5,'#ecc084','#8c5471',3);
    rr(c,44,-13,13,21,3,'#f9e0a0','#8c5471',2);
    eye(c,-8,-23,5);eye(c,10,-23,5);ellipse(c,1,-10,7,3,'#b46b74');
    ellipse(c,-19,-12,5,3,'#ed9b91');
    star(c,1,11,9,4,'#ffd96c');
  }else if(d.kind==='producer' && !['T18','T19','T20','T21','T22'].includes(t.type)){
    // Abajur fofinho com uma estrelinha no peito.
    ellipse(c,0,-18,49,50,'#f7dd7850');
    rr(c,-23,9,45,16,9,'#c98e8b','#936683',3);rr(c,-10,-18,22,30,8,'#a5dac6','#628a93',3);
    c.beginPath();c.moveTo(-33,-29);c.lineTo(-19,-59);c.quadraticCurveTo(0,-68,23,-56);c.lineTo(35,-28);c.closePath();c.fillStyle='#ffe18d';c.fill();c.strokeStyle='#bb8791';c.lineWidth=4;c.stroke();
    ellipse(c,-17,-26,5,5,'#faebbb');ellipse(c,20,-29,5,5,'#faebbb');
    eye(c,-7,-36,4);eye(c,10,-36,4);line(c,[[-4,-24],[7,-24]],'#995c71',2.5);
    star(c,0,-51,8,4,'#fef5d5');
    line(c,[[-24,24],[25,24]],'#764d70',4);
  }else if(d.kind==='blocker' && !['T18','T19','T20','T21','T22'].includes(t.type)){
    // Urso Travesseiro gigante, com orelhas fofas.
    ellipse(c,-23,-42,18,18,'#b97d74');ellipse(c,25,-42,18,18,'#b97d74');
    ellipse(c,-23,-43,10,10,'#e7ada5');ellipse(c,25,-43,10,10,'#e7ada5');
    ellipse(c,0,-9,36,38,'#dda797');ellipse(c,-25,0,17,23,'#d69a8b');ellipse(c,28,0,17,23,'#d69a8b');
    ellipse(c,0,-43,39,35,'#e5b1a0');ellipse(c,0,-26,19,14,'#f6dac0');
    eye(c,-13,-48,5);eye(c,13,-48,5);ellipse(c,0,-31,7,5,'#74526b');
    line(c,[[-7,-23],[0,-19],[7,-23]],'#a66d78',2.3);
    rr(c,-28,-2,57,28,10,'#8ab9cc','#4c7190',3);star(c,1,11,11,5,'#f8e2a0');
    ellipse(c,-18,24,14,8,'#b77a77');ellipse(c,19,24,14,8,'#b77a77');
  }else if(d.kind==='slow' && !['T18','T19','T20','T21','T22'].includes(t.type)){
    // Pião de Geada: madeira pintada, ponta giratória e flocos leves.
    ellipse(c,0,14,28,13,'#6eb7c3');
    line(c,[[0,-64],[0,-40]],'#deaf78',9);
    ellipse(c,0,-64,7,8,'#ffe6a0');
    c.beginPath();c.moveTo(-25,-33);c.lineTo(-38,-9);c.lineTo(0,26);c.lineTo(38,-9);c.lineTo(25,-33);c.closePath();
    c.fillStyle='#9fe8ee';c.fill();c.strokeStyle='#4d8ca6';c.lineWidth=4;c.stroke();
    rr(c,-25,-41,50,17,8,'#568fb5','#d3f4eb',3);
    ellipse(c,0,-12,20,16,'#d1f7fa');eye(c,-8,-16,4);eye(c,9,-16,4);
    line(c,[[-5,-4],[0,-1],[5,-4]],'#438ca2',2);
    star(c,0,8,11,4,'#ffffff');
    for(let i=0;i<3;i++)star(c,-36+i*36,-51+(i%2)*9,5,2,'#d7faff');
  }else if(d.kind==='splash' && !['T18','T19','T20','T21','T22'].includes(t.type)){
    // Canhão de Confetes: brinquedo mecânico, tubos de papel e fitas coloridas.
    rr(c,-29,-18,58,40,16,'#ec98c0','#7b5a91',4);
    rr(c,-20,-40,40,36,10,'#ffc875','#936080',4);
    rr(c,9,-30,46,25,8,'#e1bbf0','#755b90',4);
    ellipse(c,53,-17,15,18,'#ffe5b9');ellipse(c,53,-17,8,10,'#7e638f');
    eye(c,-11,-24,4);eye(c,7,-24,4);ellipse(c,-1,-13,6,3,'#a15c87');
    star(c,-20,12,9,4,'#fff0a0');
    line(c,[[-14,18],[-17,31]],'#805c89',7);line(c,[[17,18],[19,31]],'#805c89',7);
    for(let i=0;i<4;i++){
      c.save();c.translate(-38+i*26,-50-(i%2)*7);c.rotate((i-1)*.4);rr(c,-4,-6,8,12,2,['#fff1a0','#8ee7d1','#ff9bad','#c4afff'][i]);c.restore();
    }
  }
  if(d.kind==='pierce'){
    // Carrinho Cometa: carrinho de corrida com lançador de rodas brilhantes.
    rr(c,-31,-17,59,35,12,'#ffbf6a','#895e75',4);
    rr(c,-12,-39,34,27,10,'#88ced8','#506b83',3);
    rr(c,9,-33,42,13,5,'#ffdca0','#935c73',3);
    ellipse(c,-24,22,12,12,'#4b5277');ellipse(c,23,22,12,12,'#4b5277');
    ellipse(c,-24,22,5,5,'#ffd685');ellipse(c,23,22,5,5,'#ffd685');
    eye(c,-10,-26,5);eye(c,7,-26,5);
    star(c,-4,0,11,5,'#faefff');star(c,46,-28,6,2,'#fff0ae');
  }else if(d.kind==='sleep' && !['T18','T19','T20','T21','T22'].includes(t.type)){
    // Boneca Soninho: pijama lilás, bocejos mágicos e chapéu de dormir.
    line(c,[[-11,12],[-14,28]],'#81628a',7);line(c,[[12,12],[17,28]],'#81628a',7);
    rr(c,-28,-11,56,42,17,'#bdb0e9','#70658f',4);
    ellipse(c,0,-38,26,27,'#ffdbbf');
    c.beginPath();c.moveTo(-27,-49);c.quadraticCurveTo(0,-91,35,-67);c.lineTo(17,-44);c.closePath();c.fillStyle='#9481cc';c.fill();c.strokeStyle='#665585';c.lineWidth=3;c.stroke();
    ellipse(c,34,-68,9,9,'#f8e7aa');
    line(c,[[-17,-39],[-9,-36],[-2,-39]],'#685574',3);line(c,[[6,-39],[13,-36],[19,-39]],'#685574',3);
    ellipse(c,0,-25,6,8,'#9a6489');star(c,0,7,10,5,'#fff1ac');
    ellipse(c,26,-67,5,5,'#d3c4fc');
  }
  if(t.type==='T08'){
    // Móbile Musical: sininhos suspensos que fazem os pesadelos cochilar.
    rr(c,-6,-48,12,72,5,'#a6bea6','#557d84',3);
    line(c,[[-35,-57],[35,-57]],'#f0d68f',5);
    line(c,[[-25,-57],[-25,-31]],'#d9e9e1',3);line(c,[[24,-57],[24,-30]],'#d9e9e1',3);
    ellipse(c,-25,-22,14,15,'#f9db87');ellipse(c,24,-19,14,17,'#b0d7e9');
    ellipse(c,-25,-14,5,4,'#7b6887');ellipse(c,24,-11,5,4,'#7b6887');
    rr(c,-21,9,41,21,11,'#9ddfc5','#537b8a',3);
    eye(c,-11,18,4);eye(c,8,18,4);star(c,0,-59,12,5,'#ffeba6');
    if(t.recoil>0){for(let i=0;i<3;i++)txt(c,'♪',-40+i*30,-68-i%2*11,16,'#e3ffba');}
  }else if(t.type==='T09'){
    // Estilingue de Estrelas: base com madeira elástica e munição luminosa.
    line(c,[[-15,20],[-14,-26],[-31,-53]],'#b4867b',12);
    line(c,[[-13,-23],[14,-52]],'#b4867b',12);
    line(c,[[-31,-53],[-8,-34],[14,-52]],'#fae5b7',4);
    rr(c,-33,6,60,22,10,'#77b7c4','#4e738b',3);
    ellipse(c,-5,-15,25,22,'#f8cf78');eye(c,-12,-16,5);eye(c,4,-16,5);
    star(c,-4,-43,19,9,'#fff3a7');ellipse(c,-12,-50,4,4,'#ffffff');
    star(c,27,-19,8,3,'#ffd77a');
  }
  if(t.type==='T10'){
    // Arco com duas hastes e lâmina de borracha vibrante.
    rr(c,-31,12,62,18,8,'#8db6a2','#4e7180',3);
    line(c,[[-22,12],[-22,-37],[-34,-55]],'#d1a377',10);
    line(c,[[15,12],[15,-40],[29,-55]],'#d1a377',10);
    line(c,[[-34,-55],[-7,-34],[29,-55]],'#b3ebc0',5);
    ellipse(c,0,-8,25,26,'#b8e09f');eye(c,-8,-13,5);eye(c,9,-13,5);
    star(c,-4,6,10,4,'#fff4be');
    if(t.recoil>0)line(c,[[-30,-54],[-5,-31+Math.sin(time*18)*6],[30,-54]],'#edfcaf',3);
  }else if(t.type==='T11'){
    // Caixa armadilha: braços de mola, fita e tampa que treme antes do PUM.
    const shake=t.armed&&visualMotion?Math.sin(time*13+t.id)*3:0;
    c.save();c.translate(shake,0);rr(c,-34,-17,68,48,9,'#eaa9ae','#7b5676',4);
    rr(c,-40,-23,80,15,6,'#ffe09d','#93627d',4);
    rr(c,-8,-23,16,54,3,'#f8dd85');star(c,0,0,12,5,'#fff8c5');
    eye(c,-19,-6,5);eye(c,20,-6,5);ellipse(c,1,10,8,5,'#a45e78');
    if(t.armed){txt(c,'!',25,-48,22,'#fff3ae');star(c,-28,-41,7,3,'#ffe3a3');}
    else txt(c,'···',0,-49,20,'#fff9c1');c.restore();
  }else if(t.type==='T12'){
    // Casinha de madeira, pêndulo e cuco de pano.
    const swing=visualMotion?Math.sin(time*3)*8:0;
    line(c,[[0,5],[swing,27]],'#e7c77e',4);ellipse(c,swing,28,9,8,'#ffe4a0');
    rr(c,-29,-53,58,62,9,'#b88770','#694e74',4);
    line(c,[[-36,-47],[0,-77],[36,-47]],'#ebbd86',9);
    ellipse(c,0,-23,23,24,'#fff1c1');ellipse(c,0,-23,18,19,'#eddfab');
    line(c,[[0,-23],[0,-37]],'#6b6685',3);line(c,[[0,-23],[12,-17]],'#6b6685',3);
    eye(c,-9,-23,4);eye(c,9,-23,4);rr(c,-10,-63,20,15,6,'#655272');
    const peek=t.recoil>0?8:0;ellipse(c,peek,-59,8,7,'#9cd8cf');
    line(c,[[peek+5,-59],[peek+13,-57],[peek+5,-55]],'#ffd77a',3);
    if(t.recoil>0)txt(c,'CU-CO!',0,-88,13,'#fff0bd');
  }
  if(t.type==='T13'){
    // Boneca Guarda-Chuva: capa azul, guarda-chuva de tecido e mãos de pano.
    line(c,[[-13,8],[-17,29]],'#7386a0',8);line(c,[[14,8],[18,29]],'#7386a0',8);
    rr(c,-22,-3,44,37,12,'#a0c8d9','#687c9a',4);
    ellipse(c,0,-24,25,26,'#f1d1ba');eye(c,-9,-27,4);eye(c,10,-27,4);
    line(c,[[-5,-15],[1,-12],[7,-15]],'#996a7e',2.5);
    line(c,[[28,-66],[28,21]],'#96798b',5);
    c.beginPath();c.moveTo(-38,-54);c.quadraticCurveTo(13,-108,69,-51);c.quadraticCurveTo(50,-61,28,-52);
    c.quadraticCurveTo(7,-58,-38,-54);c.closePath();c.fillStyle='#8cd2cb';c.fill();c.strokeStyle='#567d92';c.lineWidth=4;c.stroke();
    star(c,29,-72,9,4,'#fff1b4');
    if(t.recoil>0)txt(c,'+',0,-75,20,'#deffba');
  }else if(t.type==='T14'){
    // Sombrinha Assobiadora: boca soprando e notas que flutuam na magia.
    rr(c,-26,-4,51,34,12,'#b1a4d3','#655d91',4);
    ellipse(c,0,-31,28,27,'#f7c9be');eye(c,-9,-35,5);eye(c,11,-35,5);
    ellipse(c,1,-21,6,7,'#ae6d96');
    c.beginPath();c.moveTo(-35,-55);c.quadraticCurveTo(0,-89,36,-56);c.closePath();c.fillStyle='#daaddf';c.fill();c.strokeStyle='#8d729a';c.lineWidth=4;c.stroke();
    line(c,[[3,-74],[3,-92]],'#fff2b8',4);
    if(t.recoil>0){txt(c,'♪',46,-64,25,'#fff3b8');txt(c,'♫',57,-35,20,'#e1f8bf');}
  }else if(t.type==='T15'){
    // Robô de lata: tronco quadrado, parafusos e canhão mecânico.
    line(c,[[-20,12],[-24,32]],'#837a81',10);line(c,[[19,12],[22,31]],'#837a81',10);
    rr(c,-31,-23,62,53,10,'#9fb1b5','#5f7184',4);
    rr(c,-23,-66,46,40,6,'#d9b583','#856679',4);
    ellipse(c,-10,-45,6,7,'#fff6d7');ellipse(c,12,-45,6,7,'#fff6d7');
    ellipse(c,-9,-44,2,3,'#4f6174');ellipse(c,13,-44,2,3,'#4f6174');
    line(c,[[-11,-31],[11,-31]],'#745969',3);
    line(c,[[0,-67],[0,-79]],'#aa8e7e',4);ellipse(c,0,-82,7,7,'#f9d88d');
    rr(c,16,-11,45,16,5,'#c8a77f','#80637c',3);ellipse(c,57,-3,8,10,'#dbe0d3');
    star(c,0,2,11,5,'#ffdb93');
  }
  if(t.type==='T16'){
    // Lencinho Invisível: proteção de tecido translúcido e botão brilhante.
    c.save();c.globalAlpha=.78;
    ellipse(c,0,2,40,33,'#c3bbec63');
    c.beginPath();c.moveTo(-29,19);c.quadraticCurveTo(-42,-34,-12,-52);c.quadraticCurveTo(8,-66,29,-46);
    c.quadraticCurveTo(43,-23,30,19);c.lineTo(14,12);c.lineTo(0,22);c.lineTo(-12,12);c.closePath();
    c.fillStyle='#ded6ec';c.fill();c.strokeStyle='#8975a7';c.lineWidth=3;c.stroke();
    eye(c,-11,-21,5);eye(c,11,-21,5);ellipse(c,0,-7,9,4,'#d4b2cd');
    star(c,0,-43,10,4,'#ffeeb7');
    rr(c,-26,22,52,10,5,'#c5b7e2','#85739d',2);
    c.restore();
  }else if(t.type==='T17'){
    // Tambor Fanfarrão: tambor de brinquedo com duas baquetas.
    line(c,[[-20,-26],[-34,-59]],'#bc947d',5);
    line(c,[[20,-26],[33,-57]],'#bc947d',5);
    ellipse(c,-34,-60,6,6,'#fee9b6');ellipse(c,33,-58,6,6,'#fee9b6');
    rr(c,-33,-34,66,57,13,'#e0a783','#8d6476',4);
    ellipse(c,0,-33,33,12,'#f3d3a3');ellipse(c,0,22,33,12,'#9e6b7e');
    for(const x of [-21,0,21])line(c,[[x,-29],[x,20]],'#fae3af',2);
    star(c,0,-7,14,6,'#fff2b6');
    eye(c,-11,-28,4);eye(c,11,-28,4);
    if((t.recoil||0)>0){txt(c,'♫',43,-73,23,'#fff2ba');txt(c,'♪',-41,-76,16,'#f9d5ac');}
  }
  // Reações exclusivas por função: brilho, confete, música e magia de gelo.
  if(visualMotion){
    const pulse=.5+.5*Math.sin(time*5.2+(t.id||0));
    if(d.kind==='producer'){c.save();c.globalAlpha=.18+.24*pulse;ellipse(c,0,-34,31+6*pulse,31+6*pulse,'#ffe78c');c.restore();if(pulse>.94)star(c,0,-72,7,3,'#fff8cb',time*2);}
    if(recoil>0&&['shooter','slow','splash','pierce','sleep','starburst','ricochet'].includes(d.kind)){c.save();c.globalAlpha=recoil;c.translate(56,-14);star(c,0,0,13,5,d.kind==='slow'?'#c8f8ff':d.kind==='splash'?'#ffd4ed':'#fff0a5',time*5);ellipse(c,0,0,4,4,'#fffdf0');c.restore();}
    if(d.kind==='music'&&pulse>.68){c.save();c.globalAlpha=(pulse-.68)*2.8;txt(c,'♪',-39,-69,16,'#e4ffc5');txt(c,'♫',35,-66,14,'#fff0b2');c.restore();}
    if(d.kind==='slow'&&pulse>.78){star(c,-39,-34,5,2,'#e6ffff',time*2);star(c,38,-45,4,2,'#e6ffff',-time*2);}
    if(d.kind==='trap'&&t.armed){c.save();c.globalAlpha=.55+.45*pulse;star(c,0,-65,6+3*pulse,2,'#fff0b1',time*4);c.restore();}
  }
  if(t.webTime>0){
    c.save();c.globalAlpha=.7;
    for(let i=-1;i<=1;i++)line(c,[[-33,-44+i*21],[33,-12+i*21]],'#e5edfa',2);
    c.restore();
  }
  if(t.rank>0){rr(c,-27,29,54,16,7,'#483254','#e9c36d',1);for(let i=0;i<t.rank;i++)star(c,(i-(t.rank-1)/2)*14,37,5,2.3,'#ffe7a2');}
  if(t.hp<t.maxHp){rr(c,-34,-70,68,6,3,'#5d4454');rr(c,-33,-69,66*t.hp/t.maxHp,4,2,t.hp/t.maxHp>.4?'#9bddb1':'#e67c84');}
  if(visualMotion){c.save();c.globalAlpha=.12+.055*(.5+.5*Math.sin(time*1.8+(t.id||0)));c.strokeStyle='#fff9e2';c.lineWidth=2;c.beginPath();c.ellipse(-15,-43,12,4,-.42,Math.PI,Math.PI*2);c.stroke();if(Math.sin(time*2.1+(t.id||0))>.82)star(c,28,-56,4,1.8,'#fff4c8');c.restore();}
  c.restore();
}
function drawEnemy(c,e,time,visualMotion=true){
  c.save();c.translate(e.x,e.y+7);if(e.jumpTime>0)c.translate(0,-40*Math.sin(Math.PI*Math.min(1,e.jumpTime/.48)));const bob=Math.sin(e.age*8+e.id)*3;
  const bite=visualMotion?clamp((e.attack||0)/.28,0,1):0;c.translate(-10*bite,visualMotion?bob-3*Math.sin(e.age*11):0);c.rotate(-.055*bite+(visualMotion?.018*Math.sin(e.age*8+e.id):0));
  if(ENEMIES[e.type].mini)c.scale(.6,.6);
  if(e.hit>0)c.globalAlpha=.68;
  const enemyShadow=c.createRadialGradient(0,27,2,0,27,40);enemyShadow.addColorStop(0,'rgba(24,25,49,.42)');enemyShadow.addColorStop(1,'rgba(24,25,49,0)');ellipse(c,0,27,40,11,enemyShadow);
  if(visualMotion){const gait=Math.sin(e.age*13+e.id),arm=e.attack>0?1:0;c.save();c.lineCap='round';line(c,[[-25,-5],[-35,2+gait*7-arm*8]],e.type==='E02'?'#bd718e':'#89759f',7);line(c,[[25,-5],[35,2-gait*7-arm*8]],e.type==='E02'?'#bd718e':'#89759f',7);ellipse(c,-35,2+gait*7-arm*8,4,4,'#f1c5b5');ellipse(c,35,2-gait*7-arm*8,4,4,'#f1c5b5');c.restore();}
  if(e.defeated&&visualMotion){c.rotate(Math.sin(e.age*10)*.12);c.scale(1+.08*Math.sin(e.age*18),.82);}
  if(e.type==='E01'||e.type==='E13'){
    // Poeira Andante: nuvem lilás engraçada, perninha fina.
    line(c,[[-17,3],[-18,23]],'#6f5b83',6);line(c,[[16,4],[16,22]],'#6f5b83',6);
    ellipse(c,-22,-13,22,27,'#9b8eba');ellipse(c,17,-14,29,32,'#9d90ba');
    ellipse(c,1,-31,32,31,'#c2b1d6');ellipse(c,-24,-24,11,12,'#cdbde2');
    ellipse(c,0,-29,8,7,'#ddcee8');eye(c,-11,-30,7);eye(c,15,-28,7);
    ellipse(c,2,-12,9,6,'#675273');ellipse(c,-12,-12,7,3,'#e9a9b3');
    line(c,[[25,-44],[35,-51],[34,-42]],'#cdbde2',5);
  }else if(e.type==='E02'){
    // Meia Zanzante: meia vermelha rajada e cara maluca.
    line(c,[[-17,0],[-23,26]],'#685179',7);line(c,[[15,0],[20,24]],'#685179',7);
    rr(c,-24,-50,44,66,19,'#dd7a9d','#765b89',4);
    rr(c,-24,-49,44,12,6,'#ffdbb0');
    rr(c,-22,-14,65,31,15,'#e994ac','#765b89',4);
    rr(c,-17,-28,34,8,3,'#ffe1c5');rr(c,-17,-9,46,8,3,'#ffe1c5');
    eye(c,-9,-38,6);eye(c,9,-38,6);ellipse(c,3,-25,8,4,'#88516d');
    ellipse(c,37,-1,9,13,'#fac6b0');
  }else if(e.type==='E03'){
    // Colcha Ambulante: várias camadas e remendos, lenta e resistente.
    line(c,[[-23,8],[-25,27]],'#73577f',9);line(c,[[20,8],[23,27]],'#73577f',9);
    rr(c,-42,-56,84,78,18,'#88b4a9','#546f8f',5);
    rr(c,-34,-48,32,31,5,'#efb38d','#8c7593',3);
    rr(c,4,-48,30,31,5,'#f8d49b','#8c7593',3);
    rr(c,-33,-11,31,24,5,'#b9a3d8','#8c7593',3);
    rr(c,4,-10,29,22,5,'#f2aab4','#8c7593',3);
    line(c,[[-1,-50],[-1,20]],'#eff3ca',3);
    ellipse(c,-9,-27,10,9,'#fff4e7');ellipse(c,15,-27,10,9,'#fff4e7');
    eye(c,-9,-28,5);eye(c,15,-28,5);ellipse(c,4,-11,11,6,'#594c75');
    star(c,-22,4,7,3,'#ffebac');
  }else if(e.type==='E04'){
    // Rabisco Corredor: um borrão de lápis com olhos desconfiados.
    line(c,[[-9,2],[-21,23]],'#58456f',7);line(c,[[13,3],[27,23]],'#58456f',7);
    ellipse(c,0,-19,30,35,'#f4d88f');
    line(c,[[-24,-31],[-35,-51],[-11,-42],[6,-64],[19,-41],[32,-49]],'#755f99',7);
    line(c,[[-17,2],[-32,11],[-11,13]],'#8f75b2',5);
    eye(c,-10,-25,7);eye(c,14,-25,7);ellipse(c,4,-9,11,6,'#835d83');
    star(c,0,14,8,3,'#b192cb');
  }else if(e.type==='E05'){
    // Rei das Meias: monstro grandalhão, capa de retalhos e coroa de botões.
    ellipse(c,-27,21,19,11,'#9e4d76');ellipse(c,29,21,19,11,'#9e4d76');
    ellipse(c,0,-13,47,49,'#a77db9');
    rr(c,-43,-27,83,44,20,'#df82a6','#785b9d',5);
    rr(c,-29,-51,57,55,22,'#edacc4','#825b9a',4);
    ellipse(c,-33,-5,15,27,'#f1c3bd');ellipse(c,32,-5,15,27,'#f1c3bd');
    c.beginPath();c.moveTo(-30,-53);c.lineTo(-26,-82);c.lineTo(-11,-66);c.lineTo(0,-87);c.lineTo(13,-65);c.lineTo(26,-82);c.lineTo(29,-53);c.closePath();c.fillStyle='#f9d371';c.fill();c.strokeStyle='#a96d7a';c.lineWidth=4;c.stroke();
    for(let x of [-25,0,25])ellipse(c,x,-58,5,5,'#a8d5db');
    eye(c,-14,-38,7);eye(c,14,-38,7);ellipse(c,0,-18,15,7,'#78456e');
    rr(c,-30,1,60,10,5,'#ffdf94');star(c,0,6,7,3,'#e894c5');
  }
  if(e.type==='E06'){
    // Sombra saltadora com sapatos de molas e corpo elástico.
    line(c,[[-16,6],[-21,21],[-11,26]],'#7767a9',7);line(c,[[14,6],[18,21],[28,24]],'#7767a9',7);
    rr(c,-35,-51,68,67,27,'#806ab4','#4c4375',5);
    ellipse(c,0,-42,32,28,'#9a8acc');
    ellipse(c,-13,-41,11,9,'#f7efd9');ellipse(c,13,-41,11,9,'#f7efd9');
    eye(c,-13,-41,5);eye(c,13,-41,5);ellipse(c,0,-20,10,7,'#61466d');
    line(c,[[-20,19],[-27,26],[-16,26]],'#f1c77f',4);line(c,[[15,19],[23,26],[35,24]],'#f1c77f',4);
    star(c,0,3,9,4,'#ffeab1');
  }else if(e.type==='E07'){
    // Cabide usado como escudo. O corpo fica visível após perder proteção.
    line(c,[[-16,4],[-19,25]],'#725b83',8);line(c,[[14,4],[15,25]],'#725b83',8);
    rr(c,-33,-49,66,62,21,'#cf9fb9','#775b88',5);
    rr(c,-23,-56,46,17,8,'#f7dcaa','#86658c',3);
    eye(c,-12,-33,6);eye(c,12,-33,6);ellipse(c,0,-17,8,5,'#825e80');
    if(e.shield>0){
      c.save();c.globalAlpha=.8;rr(c,-39,-62,79,85,16,'#78bce280','#d8f6fc',5);
      line(c,[[-27,-57],[0,-70],[28,-57]],'#d8e8f8',4);ellipse(c,0,-70,5,5,'#fff2cc');
      c.restore();
    }
  }
  if(e.type==='E08'){
    // Aranha do Estrado: pernas de mola, olhos grandes e teias feitas com lã.
    for(let side of [-1,1])for(let n=0;n<3;n++){
      const y=-35+n*19;line(c,[[side*19,y],[side*(41+n*3),y-14+n*4],[side*(44+n*4),y+16]],'#7c78ab',5);
    }
    ellipse(c,0,-17,34,31,'#8a78bd');ellipse(c,0,-42,24,23,'#b5a5d8');
    eye(c,-10,-45,6);eye(c,11,-45,6);ellipse(c,1,-30,8,5,'#5f4e85');
    star(c,-18,-4,7,3,'#f5dc9f');star(c,17,-4,7,3,'#f5dc9f');
    if(e.webTimer<1.1)line(c,[[-6,-10],[-27,20],[24,8]],'#f4f6ff',2);
  }else if(e.type==='E09'){
    // Despertador Zangado: carrilhão de duas campainhas, fica vermelho ao acelerar.
    const angry=e.enraged;
    line(c,[[-22,3],[-25,25]],'#806a86',8);line(c,[[23,3],[28,25]],'#806a86',8);
    ellipse(c,0,-25,35,37,angry?'#ed7c84':'#e5b37e');
    ellipse(c,0,-25,28,29,'#fff1c8');
    ellipse(c,-25,-62,17,12,'#a1c3d0');ellipse(c,24,-62,17,12,'#a1c3d0');
    line(c,[[-18,-43],[-28,-57]],'#7e7294',5);line(c,[[18,-43],[27,-57]],'#7e7294',5);
    line(c,[[0,-25],[0,-45]],'#6d6683',4);line(c,[[0,-25],[15,-17]],'#6d6683',4);
    eye(c,-12,-23,5);eye(c,12,-23,5);ellipse(c,0,-12,angry?11:6,5,'#6d516f');
    if(angry){star(c,0,-65,7,3,'#ffd3a0');line(c,[[-23,-11],[-36,-8]],'#fa9a9c',4);}
  }else if(e.type==='E10'){
    // Dama da Insônia: chefe original de sombras e lençóis, coroa de luas.
    ellipse(c,-26,22,17,11,'#544b86');ellipse(c,30,22,17,11,'#544b86');
    rr(c,-44,-31,88,56,21,'#6964a6','#322e69',5);
    ellipse(c,0,-43,38,39,'#b2a4d5');
    ellipse(c,-41,-13,15,24,'#9791c9');ellipse(c,42,-13,15,24,'#9791c9');
    c.beginPath();c.moveTo(-30,-74);c.lineTo(-22,-91);c.lineTo(-4,-75);c.lineTo(13,-98);c.lineTo(22,-72);c.lineTo(31,-81);c.lineTo(29,-63);c.closePath();c.fillStyle='#c6baff';c.fill();c.strokeStyle='#5f549a';c.lineWidth=4;c.stroke();
    star(c,10,-83,11,5,'#fff5b5');
    eye(c,-13,-44,7);eye(c,14,-44,7);ellipse(c,1,-21,9,7,'#5a4b7c');
    for(let i=0;i<3;i++)star(c,-31+i*31,5+(i%2)*6,7,3,'#e2e7f7');
    if((e.summons||0)>0){c.save();c.globalAlpha=.6;ellipse(c,0,-24,48,54,'#8074d351');c.restore();}
  }
  if(e.type==='E11'){
    // Ladrão de Brilhos: saco roxo de estrelas e luvas furtivas.
    line(c,[[-17,7],[-25,25]],'#5f4b75',8);line(c,[[17,7],[26,25]],'#5f4b75',8);
    ellipse(c,0,-19,32,37,'#776195');ellipse(c,0,-39,28,28,'#ab95be');
    rr(c,-39,-8,30,38,13,'#9a7caa','#5a4976',4);star(c,-24,8,12,5,'#ffe79e');
    eye(c,-11,-43,6);eye(c,14,-43,6);ellipse(c,1,-22,12,5,'#5c466d');
    line(c,[[-26,-58],[-8,-68],[18,-57]],'#dbb6be',4);
    if(e.stealTimer>6)star(c,25,-60,9,3,'#ffdc7a');
  }else if(e.type==='E12'){
    c.beginPath();c.moveTo(-34,19);c.quadraticCurveTo(-34,-62,0,-65);c.quadraticCurveTo(35,-62,35,19);
    for(let x=35;x>-30;x-=13)c.quadraticCurveTo(x-6,4,x-13,19);
    c.closePath();c.fillStyle='#e5e7ec';c.fill();c.strokeStyle='#7d80a6';c.lineWidth=4;c.stroke();
    line(c,[[-26,-6],[-5,-18],[27,-5]],'#b2b5d0',5);line(c,[[-24,4],[0,-6],[26,5]],'#c3c7de',4);
    eye(c,-11,-35,7);eye(c,12,-35,7);ellipse(c,0,-17,7,9,'#827a9f');
    line(c,[[25,-24],[43,-35],[38,-12],[25,-24]],'#a3c7d8',5);
  }else if(e.type==='E14'){
    ellipse(c,-27,24,17,12,'#76657e');ellipse(c,27,24,17,12,'#76657e');
    ellipse(c,-32,-5,24,32,'#a58f9b');ellipse(c,30,-6,27,33,'#ac97a4');
    ellipse(c,0,-28,49,51,'#cdb7b7');ellipse(c,-27,-50,25,25,'#dfcdc5');ellipse(c,25,-55,27,23,'#e6d6cd');
    rr(c,-40,-3,80,24,10,'#a692b3','#786480',3);
    for(const x of [-25,-9,8,25])ellipse(c,x,-6,13,18,'#eee4d1');
    ellipse(c,-18,-40,13,12,'#f4e8c8');ellipse(c,17,-40,13,12,'#f4e8c8');
    eye(c,-18,-40,6);eye(c,17,-40,6);line(c,[[-6,-40],[5,-40]],'#78667e',3);
    c.strokeStyle='#78667e';c.lineWidth=3;c.beginPath();c.arc(-18,-40,13,0,TAU);c.stroke();c.beginPath();c.arc(17,-40,13,0,TAU);c.stroke();
    ellipse(c,0,-25,13,9,'#d99fa4');ellipse(c,-10,-13,17,10,'#fff0d7');ellipse(c,11,-13,17,10,'#fff0d7');
    c.save();c.translate(-45,0);c.rotate(-.2);rr(c,-18,-23,34,35,4,'#a4d4d7','#648a9e',3);line(c,[[-12,-15],[11,3]],'#e2f4e9',3);c.restore();
    if(e.bossPhase==='warning'){txt(c,'!',0,-107,29,'#ffe2a1');ellipse(c,0,-18,8,9,'#806478');}
    if(e.bossPhase==='rest')txt(c,'uff...',0,-96,14,'#fff0cd');
  }
  if(e.type==='E15'){
    // Traça do Sótão: asas de tecido e rastro de fios.
    ellipse(c,-22,-22,27,31,'#b3a4c9');ellipse(c,24,-22,29,33,'#a38ab8');
    ellipse(c,0,-34,18,26,'#d5bbc8');
    line(c,[[-7,-54],[-18,-72]],'#9c86a7',4);line(c,[[8,-54],[18,-72]],'#9c86a7',4);
    eye(c,-8,-38,6);eye(c,9,-38,6);ellipse(c,1,-23,7,5,'#8a6d8d');
    line(c,[[-23,10],[-29,29]],'#806b9a',6);line(c,[[21,12],[26,28]],'#806b9a',6);
  }else if(e.type==='E16'){
    // Baú Saltitante: tampa articulada, tranca e pernas de mola.
    line(c,[[-23,10],[-29,25],[-18,30]],'#816479',7);
    line(c,[[22,10],[30,24],[19,30]],'#816479',7);
    rr(c,-40,-30,78,57,9,'#ba8f70','#785b74',5);
    rr(c,-43,-53,84,25,7,'#d1ad82','#805c71',5);
    rr(c,-5,-37,12,36,4,'#eacb8d');
    eye(c,-15,-20,7);eye(c,18,-20,7);ellipse(c,0,-8,9,5,'#75516f');
    star(c,0,16,12,5,'#ffe5a2');
  }
  if(e.type==='E17'){
    // Retalho Escorregadio: corpo dobrado como lenço que troca de faixa.
    c.beginPath();c.moveTo(-30,-54);c.quadraticCurveTo(-15,-72,0,-60);
    c.quadraticCurveTo(22,-78,35,-47);c.lineTo(29,26);
    c.quadraticCurveTo(10,8,-2,26);c.quadraticCurveTo(-20,9,-32,24);c.closePath();
    c.fillStyle='#dd9eb5';c.fill();c.strokeStyle='#835c83';c.lineWidth=4;c.stroke();
    rr(c,-26,-43,51,11,5,'#ba7899','#f6d7c2',2);
    eye(c,-11,-23,5);eye(c,13,-23,5);ellipse(c,1,-10,9,5,'#8f6389');
    if(e.fluttered)star(c,27,-56,8,3,'#fff0ac');
  }else if(e.type==='E18'){
    // Baronesa: cortinas duplas, coroa de pregas e manto teatral.
    c.save();
    c.globalAlpha=.72;ellipse(c,0,-9,55,58,'#cca2d066');c.restore();
    c.beginPath();c.moveTo(-28,-54);c.lineTo(-51,23);c.quadraticCurveTo(-27,8,-12,27);
    c.lineTo(10,21);c.quadraticCurveTo(31,6,52,24);c.lineTo(28,-54);c.closePath();
    c.fillStyle='#926ca9';c.fill();c.strokeStyle='#4f406d';c.lineWidth=5;c.stroke();
    for(const x of [-34,-17,17,34])line(c,[[x,-31],[x*.8,17]],'#dfb8d3',3);
    ellipse(c,0,-48,30,29,'#e7bfd5');ellipse(c,-28,-25,14,25,'#ac89b4');ellipse(c,29,-25,14,25,'#ac89b4');
    c.beginPath();c.moveTo(-28,-64);c.lineTo(-24,-91);c.lineTo(-10,-77);c.lineTo(0,-95);
    c.lineTo(12,-77);c.lineTo(26,-91);c.lineTo(28,-64);c.closePath();c.fillStyle='#ffdf9d';c.fill();c.strokeStyle='#ac6c98';c.lineWidth=3;c.stroke();
    star(c,0,-75,9,4,'#fff3cf');eye(c,-12,-49,7);eye(c,13,-49,7);ellipse(c,2,-29,11,5,'#a46c97');
    rr(c,-19,7,38,14,7,'#efc0d8','#7f527b',3);
    if(e.bossPhase==='warning'){txt(c,'!',0,-112,30,'#ffe5a9');star(c,36,-84,8,4,'#fff2b4');}
    if(e.bossPhase==='rest'){txt(c,'ABERTA!',0,-109,15,'#e8f6bd');}
  }
  if(e.type==='E19'){
    // Pijama Sussurrante: camisa com botões e braços de tecido.
    rr(c,-31,-46,62,70,15,'#b8aacb','#706087',4);
    rr(c,-18,-57,36,20,6,'#dcd2e4','#76627e',3);
    for(const y of [-22,-1,18])ellipse(c,0,y,4,4,'#eee5ae');
    eye(c,-12,-42,6);eye(c,13,-42,6);ellipse(c,1,-30,9,5,'#967bad');
    line(c,[[-30,-23],[-41,6]],'#8f7eab',9);line(c,[[31,-24],[42,7]],'#8f7eab',9);
    if(e.webTimer<2)txt(c,'Z',28,-78,18,'#e8dafa');
  }else if(e.type==='E20'){
    // Bocejo Corredor: boca grande e sapatos de corrida.
    ellipse(c,0,-24,28,35,'#ecd3ad');
    ellipse(c,-22,-41,18,21,'#c99dce');ellipse(c,22,-41,18,21,'#c99dce');
    eye(c,-12,-34,5);eye(c,12,-34,5);ellipse(c,0,-16,12,16,'#775a84');
    line(c,[[-12,7],[-21,26]],'#a389ba',7);line(c,[[12,7],[20,28]],'#a389ba',7);
    ellipse(c,-21,29,15,6,'#cf8fa7');ellipse(c,22,30,15,6,'#8bb8d7');
  }else if(e.type==='E21'){
    // Sombrinha do Escuro: escudo abaulado com ponta da lua.
    ellipse(c,0,-5,28,34,'#9183bd');
    c.beginPath();c.moveTo(-44,-38);c.quadraticCurveTo(0,-95,45,-38);
    c.quadraticCurveTo(23,-48,0,-39);c.quadraticCurveTo(-25,-49,-44,-38);c.closePath();
    c.fillStyle='#675991';c.fill();c.strokeStyle='#d6b9df';c.lineWidth=4;c.stroke();
    line(c,[[0,-58],[0,20]],'#f0d4a8',4);
    eye(c,-12,-13,6);eye(c,13,-13,6);ellipse(c,0,3,8,5,'#c4a5c9');
    star(c,0,-64,10,4,'#ffe8b4');
  }else if(e.type==='E22'){
    // Transformações progressivas: o corpo muda forma/cores, sem mudar as colisões.
    const form=e.bossForm||1;
    const coat=form===1?'#716099':form===2?'#aa78ae':'#674279';
    const shadow=form===3?'#e5b4e8':'#b0a4da';
    c.save();ellipse(c,0,-9,62,65,'#b7a0e138');c.restore();
    for(const side of [-1,1]){
      c.beginPath();c.moveTo(side*14,-54);c.lineTo(side*56,-83);
      c.lineTo(side*44,-21);c.lineTo(side*59,21);c.lineTo(side*20,14);c.closePath();
      c.fillStyle=shadow;c.fill();c.strokeStyle='#46345d';c.lineWidth=3;c.stroke();
    }
    c.beginPath();c.moveTo(-40,-26);c.quadraticCurveTo(-58,16,-43,43);
    c.lineTo(-20,24);c.lineTo(0,44);c.lineTo(21,24);c.lineTo(42,43);
    c.quadraticCurveTo(59,10,38,-26);c.closePath();
    c.fillStyle=coat;c.fill();c.strokeStyle='#392c57';c.lineWidth=5;c.stroke();
    ellipse(c,0,-56,41,39,'#74578d');
    for(const x of [-26,26])ellipse(c,x,-59,19,18,'#9271a9');
    if(form>=2){
      for(const x of [-46,0,46])star(c,x,-88,form===3?13:8,5,'#e4b7f0');
    }
    if(form===3)for(const x of [-34,34])line(c,[[x,-70],[x*1.5,-102]],'#f3c6f1',6);
    ellipse(c,-16,-59,12,10,'#f8e8ce');ellipse(c,17,-59,12,10,'#f8e8ce');
    ellipse(c,-15,-58,5,6,'#c65794');ellipse(c,17,-58,5,6,'#c65794');
    ellipse(c,1,-35,17,12,'#3e2d53');star(c,0,-14,14,5,'#ffdfb5');
    if(e.bossPhase==='warning')txt(c,'⚠',0,-114,27,'#fff1b8');
    if(e.bossPhase==='rest')txt(c,'ATACAR!',0,-113,15,'#e8f4bb');
    txt(c,'FORMA '+form,0,52,13,'#fff1d9');
  }
  drawEnemyFaceFX(c,e,time,visualMotion);
  if(e.stunTime>0){
    txt(c,'Z z',12,-87,17,'#e1d7ff');star(c,26,-71,5,2,'#d8ccff');
  }
  if(e.slowTime>0){
    ellipse(c,0,27,39,6,'#91e0ed77');
    star(c,-33,-52,8,3,'#d4f9ff');star(c,35,-29,6,3,'#d4f9ff');
  }
  if(e.hit>0){c.save();c.globalAlpha=clamp(e.hit/.16,0,.7);star(c,34,-61,9,3,'#fff4bc');c.restore();}
  if(e.hp<e.maxHp){rr(c,-30,-73,60,6,3,'#574a6e');rr(c,-29,-72,58*clamp(e.hp/e.maxHp,0,1),4,2,'#f2a2a7');}
  if(visualMotion){c.save();c.globalAlpha=.10+.06*(.5+.5*Math.sin(time*1.55+(e.id||0)));c.strokeStyle='#fff5e6';c.lineWidth=2;c.beginPath();c.ellipse(-13,-49,11,4,-.35,Math.PI,Math.PI*2);c.stroke();if(e.hit>0)star(c,31,-60,5,2,'#fff3c7');c.restore();}
  c.restore();
}
function drawEnemyFaceFX(c,e,time,visualMotion=true){
  const faces={E01:[-11,-30,15,-28,-12],E02:[-9,-38,9,-38,-25],E03:[-9,-28,15,-28,-11],E04:[-10,-25,14,-25,-9],E05:[-14,-38,14,-38,-18],E06:[-13,-41,13,-41,-20],E07:[-12,-31,12,-31,-12],E08:[-10,-34,11,-34,-15],E09:[-12,-23,12,-23,-12],E10:[-13,-44,14,-44,-21],E11:[-11,-43,14,-43,-22],E12:[-11,-35,12,-35,-17],E13:[-11,-30,15,-28,-12],E14:[-18,-40,17,-40,-13],E15:[-8,-38,9,-38,-23],E16:[-15,-20,18,-20,-8],E17:[-11,-23,13,-23,-10],E18:[-12,-49,13,-49,-29],E19:[-12,-42,13,-42,-30],E20:[-12,-34,12,-34,-16],E21:[-12,-13,13,-13,3],E22:[-16,-59,17,-59,-35]};
  const [lx,ly,rx,ry,my]=faces[e.type]||[-11,-30,11,-30,-12],blink=visualMotion&&Math.sin(e.age*2.4+(e.id||0)*2.1)>.985,look=e.attack>0?3:visualMotion?Math.sin(e.age*1.7)*1.5:0;
  c.save();c.lineCap='round';if(!blink){ellipse(c,lx+look,ly+1,1.8,2.5,'#493b60');ellipse(c,rx+look,ry+1,1.8,2.5,'#493b60');}
  const angry=!!e.enraged||e.attack>0,hurt=e.hit>0;line(c,[[lx-5,ly-9],[lx,ly-(angry?12:8)],[lx+5,ly-8]],hurt?'#fff6e7':angry?'#68465f':'#8b718c',2.4);line(c,[[rx-5,ry-8],[rx,ry-(angry?12:8)],[rx+5,ry-9]],hurt?'#fff6e7':angry?'#68465f':'#8b718c',2.4);
  if(blink){line(c,[[lx-5,ly],[lx+5,ly]],'#6b536f',3);line(c,[[rx-5,ry],[rx+5,ry]],'#6b536f',3);}if(hurt){ellipse(c,lx-8,ly+8,4,2.5,'#f29ba6');ellipse(c,rx+8,ry+8,4,2.5,'#f29ba6');}
  if(e.defeated)txt(c,'×',0,my,15,'#fff1dc');else if(e.attack>0){ellipse(c,0,my,7,8,'#563c61');ellipse(c,0,my+2,3,2,'#f4a0a5');}else if(e.enraged)line(c,[[-6,my+2],[0,my-1],[6,my+2]],'#67475f',2.8);else line(c,[[-5,my],[0,my+2],[5,my]],'#79556e',2.5);c.restore();
}
function drawGlow(c,s,time){
  c.save();const bob=Math.sin(time*5+s.id)*3;c.translate(s.x,s.y+bob);
  const fade=clamp((s.dropTime+8-s.age)/1.5,0,1);c.globalAlpha=fade;
  ellipse(c,0,0,27,27,'#ffe07360');star(c,0,0,21,11,'#ffcc58');star(c,0,-2,15,8,'#fff0a2');
  ellipse(c,-5,-3,2.7,3,'#715474');ellipse(c,6,-3,2.7,3,'#715474');
  line(c,[[-3,6],[2,8],[7,5]],'#9f6c6a',2);
  c.restore();
}

function drawProjectileTrail(c,p,time,visualMotion=true){
  const colors={shooter:'#fff0c0',slow:'#a8f0ff',splash:'#ff9dc9',pierce:'#ffd28a',sleep:'#d2c2ff',starburst:'#fff1a5',ricochet:'#b9efaa'};
  const length=visualMotion?27+Math.sin(time*23+(p.id||0))*4:22;
  const g=c.createLinearGradient(p.x-length,p.y,p.x+3,p.y);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,colors[p.kind]||'#fff0c0');
  c.save();c.globalAlpha=.58;line(c,[[p.x-length,p.y+1],[p.x-4,p.y]],g,p.kind==='splash'||p.kind==='starburst'?7:5);
  c.globalAlpha=.32;ellipse(c,p.x-3,p.y,9,6,colors[p.kind]||'#fff0c0');c.restore();
}
function drawProjectile(c,p){
  if(p.kind==='ricochet'){ellipse(c,p.x,p.y,15,11,'#b0e5a9');star(c,p.x+3,p.y-2,10,5,'#fff6c8');line(c,[[p.x-12,p.y],[p.x-28,p.y+6]],'#daffcd',3);
  }else if(p.kind==='pierce'){
    rr(c,p.x-13,p.y-8,28,16,6,'#f9b965','#a06876',2);
    ellipse(c,p.x-7,p.y+7,5,5,'#6f638d');ellipse(c,p.x+8,p.y+7,5,5,'#6f638d');
    star(c,p.x,p.y-3,7,3,'#fff4bf');
  }else if(p.kind==='starburst'){
    star(c,p.x,p.y,20,9,'#fff0ab');star(c,p.x,p.y,10,4,'#efab66');
    for(let i=0;i<3;i++)star(c,p.x-24+i*23,p.y-10+(i%2)*18,5,2,'#fffbd2');
  }else if(p.kind==='sleep'){
    ellipse(c,p.x,p.y,15,12,'#b8a7eb');txt(c,'z',p.x,p.y-2,15,'#f6f0ff');
  }else if(p.kind==='slow'){
    ellipse(c,p.x,p.y,12,10,'#9ee8f5');star(c,p.x,p.y,11,5,'#e6fcff');line(c,[[p.x-15,p.y],[p.x-23,p.y]],'#a8eef2b3',4);
  }else if(p.kind==='splash'){
    ellipse(c,p.x,p.y,15,13,'#fda5c9');star(c,p.x,p.y,12,5,'#fff4ac');ellipse(c,p.x-8,p.y+4,4,4,'#a8ede5');
  }else{ellipse(c,p.x,p.y,12,10,'#fff0bb');ellipse(c,p.x+4,p.y-1,7,6,'#ffffff');line(c,[[p.x-15,p.y],[p.x-23,p.y]],'#fff2c8b3',4);}
}
function drawImpact(c,i){
  const k=clamp(i.age/i.life,0,1);c.save();c.globalAlpha=(1-k)*.8;
  const r=(['splash','starburst'].includes(i.kind)?12:6)+(['splash','starburst'].includes(i.kind)?50:25)*k;
  c.lineWidth=i.kind==='slow'?4:3;c.strokeStyle=i.kind==='sleep'?'#e0cbff':i.kind==='jump'?'#e2d1ff':i.kind==='slow'?'#c9f9ff':i.kind==='bite'?'#ffe3af':i.kind==='splash'?'#ffe3b3':'#fff4d6';
  c.beginPath();c.arc(i.x,i.y,r,0,TAU);c.stroke();
  if(['splash','starburst'].includes(i.kind)){for(let a=0;a<7;a++){const theta=a*TAU/7+k;star(c,i.x+Math.cos(theta)*(r+6),i.y+Math.sin(theta)*(r+6),5,2,['#f7a1ca','#fff09d','#9ce9d9'][a%3]);}}
  if(i.kind==='ricochet')for(let a=0;a<3;a++){const theta=a*TAU/3;star(c,i.x+Math.cos(theta)*(r+7),i.y+Math.sin(theta)*(r+7),6,2,'#c9ef9b');}
  if(i.kind==='slow')for(let a=0;a<4;a++){const theta=a*TAU/4;star(c,i.x+Math.cos(theta)*(r+6),i.y+Math.sin(theta)*(r+6),7,3,'#e3fcff');}
  const core=c.createRadialGradient(i.x,i.y,1,i.x,i.y,Math.max(3,r*.52));core.addColorStop(0,'rgba(255,255,239,.42)');core.addColorStop(1,'rgba(255,255,239,0)');ellipse(c,i.x,i.y,Math.max(4,r*.52),Math.max(4,r*.52),core);
  c.restore();
}
function drawParticle(c,p,time){
  const alpha=clamp(p.life/p.maxLife,0,1),pulse=.72+.28*Math.sin(time*17+p.x*.03);c.save();c.globalAlpha=alpha*.7;
  const glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4.2);glow.addColorStop(0,p.color);glow.addColorStop(.32,p.color+'99');glow.addColorStop(1,'rgba(255,255,255,0)');ellipse(c,p.x,p.y,p.r*4.2,p.r*4.2,glow);c.globalAlpha=alpha;ellipse(c,p.x,p.y,p.r*pulse,p.r*pulse,p.color);if(p.r>3)star(c,p.x,p.y,p.r*1.7,p.r*.55,'#fff7d6',time*.8);c.restore();
}
function drawFeedback(c,f){
  const k=clamp(f.age/f.life,0,1);c.save();c.globalAlpha=1-k;
  c.shadowColor='#34223e';c.shadowBlur=6;
  txt(c,f.text,f.x,f.y-31*k,18*(1-.16*k),f.color);
  c.restore();
}
function drawDefeated(c,d){
  c.save();const k=clamp(d.age/d.life,0,1);c.globalAlpha=(1-k)*.7;c.translate(0,-35*k);c.rotate((d.type==='E05'?-1:1)*k*.12);
  const data=ENEMIES[d.type];drawEnemy(c,{...d,id:0,age:d.age,hit:0,attack:0,slowTime:0,hp:data.hp,maxHp:data.hp,defeated:true},d.age);
  c.restore();
}
function drawBossAura(c,boss,time,visualMotion=true){
  const d=ENEMIES[boss.type];if(!d?.boss)return;
  const pulse=visualMotion ? .5+.5*Math.sin(time*3.2+boss.id) : .5;
  c.save();c.translate(boss.x,boss.y-19);
  const radius=47+pulse*8;
  const glow=c.createRadialGradient(0,0,12,0,0,radius+28);
  glow.addColorStop(0,boss.type==='E10'?'rgba(158,176,255,.20)':'rgba(255,205,111,.22)');
  glow.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=glow;c.beginPath();c.arc(0,0,radius+28,0,TAU);c.fill();
  c.globalAlpha=.34+pulse*.2;c.strokeStyle=boss.type==='E10'?'#c4d2ff':'#ffe0a0';c.lineWidth=3;
  c.setLineDash([7,8]);c.beginPath();c.arc(0,0,radius,0,TAU);c.stroke();c.setLineDash([]);
  c.restore();
}
function drawBossHealth(c,game){
  const boss=game.enemies.find(e=>ENEMIES[e.type]?.boss);
  if(!boss)return;
  const ratio=clamp(boss.hp/boss.maxHp,0,1);
  rr(c,415,646,453,42,16,'#382946ea','#ffda9a',3);
  txt(c,ENEMIES[boss.type].bossLabel||ENEMIES[boss.type].name,425,658,15,'#ffdeab','left');
  rr(c,618,652,229,19,9,'#241a32','#b88da9',2);
  rr(c,622,655,221*ratio,13,6,ratio>.35?'#f795af':'#ffe18d');
}
function drawBossIntent(c,boss){
  if(ENEMIES[boss.type].dreamBoss){
    if(boss.bossPhase==='warning'){
      const row=boss.targetLane??boss.row;
      rr(c,BOARD.x+3,BOARD.y+row*BOARD.ch+3,BOARD.cols*BOARD.cw-6,BOARD.ch-6,12,'#df9ce45a','#ffe6bd',4);
      txt(c,'⚠ BICHO-PAPÃO • FORMA '+boss.bossForm+' • FAIXA '+(row+1),640,626,18,'#ffe4eb');
    }else if(boss.bossPhase==='rest')txt(c,'CHEFE EXPOSTO • DANO +40%!',640,625,18,'#e5f8bb');
    return;
  }
  if(ENEMIES[boss.type].curtainBoss){
    if(boss.bossPhase==='warning'){
      const lane=boss.targetLane??boss.row;
      rr(c,BOARD.x+4,BOARD.y+lane*BOARD.ch+5,BOARD.cols*BOARD.cw-8,BOARD.ch-10,9,
         '#ef99c65a','#fff0aa',5);
      txt(c,'⚠ CORTINA • FAIXA '+(lane+1),640,625,18,'#ffecc6');
    }else if(boss.bossPhase==='rest'){
      txt(c,'CORTINAS ABERTAS • DANO +45%!',640,625,17,'#e7f8b5');
    }
    return;
  }
  if(!ENEMIES[boss.type].dustBoss)return;
  if(boss.bossPhase==='warning'){
    const lanes=(boss.nextAttack==='dust'?[boss.row-1,boss.row+1]:[boss.row]).filter(row=>row>=0&&row<BOARD.rows);
    for(const row of lanes){rr(c,BOARD.x+3,BOARD.y+row*BOARD.ch+4,BOARD.cols*BOARD.cw-6,BOARD.ch-8,10,'#ffe0a02b','#ffe5b0',3);txt(c,'!',BOARD.x+18,rowY(row),24,'#fff1cb');}
    const label=boss.nextAttack==='dust'?`MINI-POEIRAS • FAIXAS ${lanes.map(row=>row+1).join(' / ')}`:`RAJADA • FAIXA ${boss.row+1}`;
    txt(c,label,640,628,16,'#ffe7b7');
  }else if(boss.bossPhase==='rest')txt(c,'VOVÔ DESCANSANDO • ATAQUE!',640,628,15,'#d3f4c6');
}
function drawCurtainShot(c,shot,time,visualMotion=true){
  const bob=visualMotion?Math.sin(time*12+shot.row)*5:0;
  const dream=shot.kind==='dream';
  c.save();c.translate(shot.x,shot.y-9+bob);
  c.rotate(visualMotion?-0.08+Math.sin(time*10)*.11:0);
  ellipse(c,0,0,32,24,dream?'#ad9de599':'#cf98cc63');
  c.beginPath();c.moveTo(-31,-22);c.quadraticCurveTo(0,-33,32,-18);
  c.lineTo(26,20);c.quadraticCurveTo(4,9,-9,24);c.lineTo(-32,12);c.closePath();
  c.fillStyle=dream?'#b79ce3':'#d9a2ce';c.fill();c.strokeStyle=dream?'#e4d9ff':'#fff1c0';c.lineWidth=3;c.stroke();
  star(c,4,-7,7,3,'#ffedaf');
  c.restore();
}
function drawPlacementPreview(c,game,time){
  const cell=game.hover;if(!cell||game.state!=='playing')return;
  const {row,col}=cell;if(row<0||row>=BOARD.rows||col<0||col>=BOARD.cols)return;
  const valid=game.shovel?Boolean(game.grid[row][col]):!game.canPlace(row,col);
  const toy=TOYS[game.selected],x=colX(col),y=rowY(row);
  c.save();
  if(valid&&!game.shovel&&toy){
    const kind=toy.kind;
    if(['shooter','slow','splash','pierce','sleep','starburst','ricochet'].includes(kind)){
      const start=x+21;c.globalAlpha=.12;c.fillStyle=toy.color||'#fff2ad';
      c.fillRect(start,BOARD.y+row*BOARD.ch+12,BOARD_RIGHT-start,BOARD.ch-24);
    }else if(kind==='veil'||kind==='drum'){
      const reach=BOARD.cw*(kind==='veil'?1.45:toy.rangeCells||4);
      c.globalAlpha=.14;c.fillStyle=toy.color||'#fff2ad';
      for(let lane=Math.max(0,row-1);lane<=Math.min(BOARD.rows-1,row+1);lane++)
        c.fillRect(Math.max(BOARD.x,x-reach),BOARD.y+lane*BOARD.ch+12,
          Math.min(BOARD_RIGHT,x+reach)-Math.max(BOARD.x,x-reach),BOARD.ch-24);
    }else if(kind==='music'||kind==='trap'||kind==='clock'){
      const reach=kind==='music'?BOARD.cw*6:kind==='clock'?BOARD.cw*toy.rangeCells:toy.splashRadius;
      const left=Math.max(BOARD.x,x-reach),right=Math.min(BOARD_RIGHT,x+reach);
      c.globalAlpha=.105;c.fillStyle=toy.color||'#fff2ad';
      for(let lane=Math.max(0,row-1);lane<=Math.min(BOARD.rows-1,row+1);lane++)
        c.fillRect(left,BOARD.y+lane*BOARD.ch+11,right-left,BOARD.ch-22);
    }
  }
  c.globalAlpha=1;
  rr(c,BOARD.x+col*BOARD.cw+4,BOARD.y+row*BOARD.ch+4,BOARD.cw-8,BOARD.ch-8,12,
    valid?'#f5eeb04c':'#f77f8e44',valid?'#ffdf7b':'#f47d88',3);
  if(game.shovel)txt(c,'✕',x,y,36,valid?'#ffefbe':'#f4a1a7');
  else if(valid&&toy){c.globalAlpha=.58;drawIconCanvas(c,game.selected,x,y,.78,time);}
  c.restore();
}
export function render(c,game,menu=false,visualMotion=true){
  const t=visualMotion ? (game?.time ?? performance.now()*.001) : 0;
  c.clearRect(0,0,W,H);paintBackdrop(c,game?.level?.chapter??1);
  const chapter=game?.level?.chapter??1;drawDepthAccents(c,t,chapter,visualMotion);drawAmbientPolish(c,t,chapter,visualMotion);drawBoardTrim(c,t,chapter);if(game)drawDustCells(c,game,t,visualMotion);
  if(game?.levelIndex>=4){
    // Capítulo mais avançado ganha um leve clima de armário encantado, sem outra textura ou download.
    c.fillStyle=game.levelIndex===7?'#50204e19':'#34246b0b';c.fillRect(0,0,W,H);
  }
  for(let r=0;r<BOARD.rows;r++){
    const x=109;
    drawTrain(c,x,rowY(r),game?(!game.trainReady[r]&&!game.trains.some(tr=>tr.row===r)):false);
  }
  if(game){
    if(game.doorWarning && game.level.chapter===3){
      const {lane}=game.doorWarning;
      const pulse=visualMotion?(.55+.27*Math.sin(t*9)):.65;
      c.save();c.globalAlpha=pulse;
      rr(c,BOARD.x+2,BOARD.y+lane*BOARD.ch+3,BOARD.cw*BOARD.cols-4,BOARD.ch-6,12,'#ffce6f27','#ffe6a0',5);
      rr(c,1119,BOARD.y+lane*BOARD.ch+2,112,BOARD.ch-4,10,'#efbd7088','#fff1b9',5);
      c.restore();txt(c,'🚪',1173,rowY(lane),27,'#fff1c9');
      txt(c,`PORTA • FAIXA ${lane+1}`,790,BOARD.y+lane*BOARD.ch+12,14,'#fff7cd');
    }
    drawDreamPulse(c,game.dreamPulse,t,visualMotion);
    // Fantasma do brinquedo e indicação da sua área de ação.
    drawPlacementPreview(c,game,t);
    for(const enemy of game.enemies)drawBossIntent(c,enemy);
    const toys=game.allToys;
    for(const toy of toys)drawToy(c,toy,t,visualMotion);
    if(visualMotion)for(const toy of toys){
      if((toy.recoil||0)>.13 && TOYS[toy.type].kind!=='trap' && TOYS[toy.type].kind!=='producer'){
        const f=(toy.recoil-.13)/.09;c.save();c.globalAlpha=clamp(f,0,.8);
        star(c,toy.x+41,toy.y-15,9+5*f,4+2*f,'#fff6c5');c.restore();
      }
    }
    for(const p of game.projectiles){drawProjectileTrail(c,p,t,visualMotion);drawProjectile(c,p);}
    for(const shot of game.curtainShots||[])drawCurtainShot(c,shot,t,visualMotion);
    // Aura puramente visual dos chefes, desenhada atrás dos personagens.
    for(const e of game.enemies)if(ENEMIES[e.type]?.boss)drawBossAura(c,e,t,visualMotion);
    // Inimigos desenhados por faixa e posição; o sprite não afeta a hitbox.
    for(const e of game.enemies)drawEnemy(c,e,t,visualMotion);
    if(visualMotion)for(const d of game.defeated||[])drawDefeated(c,d);
    for(const tr of game.trains)drawTrain(c,tr.x,rowY(tr.row),false,true);
    for(const s of game.stars)drawGlow(c,s,t);
    if(visualMotion){
      for(const i of game.impacts||[])drawImpact(c,i);
      for(const p of game.particles)drawParticle(c,p,t);
      c.globalAlpha=1;
      for(const f of game.feedback||[])drawFeedback(c,f);
    }
    drawBossHealth(c,game);
    if(game.bannerUntil>game.time){rr(c,314,147,652,41,20,'#4a3265d9','#f2cf8a',3);txt(c,game.banner,640,168,22,'#fff0b9');}
    if(game.state==='playing'){
      txt(c,`${game.killCount} monstros espantados`,1062,676,15,'#fff3db','right',700);
    }
  }else{
    // Cena decorativa no menu, sem inimigos de verdade nem simulação.
    drawToy(c,{id:0,x:colX(2),y:rowY(3),hp:120,maxHp:120,type:'T02'},t);
    drawToy(c,{id:1,x:colX(3),y:rowY(2),hp:650,maxHp:650,type:'T03'},t);
    drawToy(c,{id:2,x:colX(4),y:rowY(3),hp:100,maxHp:100,type:'T01'},t);
    drawToy(c,{id:3,x:colX(5),y:rowY(4),hp:105,maxHp:105,type:'T04'},t);
    drawEnemy(c,{id:1,x:colX(7),y:rowY(2),row:2,type:'E01',age:t,hp:100,maxHp:100,hit:0},t);
    drawEnemy(c,{id:2,x:colX(8),y:rowY(3),row:3,type:'E02',age:t,hp:85,maxHp:85,hit:0},t);
  }
  // Textura discreta para dar aparência de ilustração.
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#fff2c00a');g.addColorStop(1,'#120b340c');c.fillStyle=g;c.fillRect(0,0,W,H);
}
export function drawIconCanvas(c,id,x,y,scale=.65,time=0){
  const d=TOYS[id];if(!d)return;
  c.save();c.translate(x,y);c.scale(scale,scale);
  drawToy(c,{id:0,type:id,x:0,y:0,hp:d.maxHp,maxHp:d.maxHp,hit:0,age:time,recoil:0},time,false);
  c.restore();
}
