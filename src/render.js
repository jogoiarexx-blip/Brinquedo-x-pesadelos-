import { W,H,BOARD,BOARD_RIGHT,BOARD_BOTTOM,colX,rowY,clamp } from './config.js';
import { TOYS, ENEMIES } from './data.js';
const TAU=Math.PI*2;
const COLORS={ink:'#3b2749',cream:'#fff6da'};
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();}
function rr(c,x,y,w,h,r,fill,stroke=null,lw=2){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function line(c,pts,color,width=2){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
function star(c,x,y,outer,inner,color,rot=-Math.PI/2){c.beginPath();for(let i=0;i<10;i++){const r=i%2===0?outer:inner,a=rot+i*Math.PI/5;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fillStyle=color;c.fill();}
function txt(c,text,x,y,size=18,color='#fff8e7',align='center',weight=800){c.textAlign=align;c.textBaseline='middle';c.font=`${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;c.fillStyle=color;c.fillText(text,x,y);}
function eye(c,x,y,r=5){ellipse(c,x,y,r,r*1.13,'#fffdf7');ellipse(c,x+1.3,y+.9,r*.45,r*.6,COLORS.ink);ellipse(c,x+.5,y-r*.25,r*.16,r*.16,'white');}
function drawCloud(c,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);ellipse(c,0,0,66,20,'#281a4480');ellipse(c,-20,-12,33,24,'#b7a8e0');ellipse(c,19,-15,35,29,'#cab8ed');ellipse(c,0,-30,30,31,'#dfcdf2');ellipse(c,-18,-23,11,9,'#e3d7f7');c.restore();}
export function drawBackground(c,time=0){
  const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#40345f');sky.addColorStop(.58,'#675276');sky.addColorStop(1,'#2c3754');c.fillStyle=sky;c.fillRect(0,0,W,H);
  for(let i=0;i<25;i++){const x=(i*293+57)%W,y=(i*61+26)%185;ellipse(c,x,y,2+(i%3===0),2+(i%3===0),'#fbefb59c');}
  // Parede com listras e rodapé.
  c.globalAlpha=.12;for(let x=5;x<W;x+=58){rr(c,x,0,22,327,11,'#f2abc0');}c.globalAlpha=1;
  rr(c,28,22,243,171,16,'#392d58','#b78a9a',7);rr(c,42,35,214,144,10,'#1d3655','#a8c5cd',5);
  ellipse(c,204,81,33,33,'#fff5bf');ellipse(c,216,72,29,31,'#243653');
  for(let i=0;i<13;i++){star(c,57+(i*73)%188,55+(i*47)%100,3.5,1.7,'#fff5be');}
  line(c,[[150,35],[150,179]],'#a8c5cd',5);line(c,[[42,105],[254,105]],'#a8c5cd',5);
  rr(c,23,184,255,18,7,'#6b456b','#dbafab',4);
  // Prateleira com peças decorativas.
  rr(c,445,74,382,14,5,'#e2aa89','#764b69',4);
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
function drawToy(c,t,time){
  const d=TOYS[t.type];c.save();c.translate(t.x,t.y+4);let s=1+Math.sin(time*3+t.id*.8)*.024;
  if(t.hit>0){c.globalAlpha=.78;s*=.95;}c.scale(s,s);
  ellipse(c,0,26,37,10,'#203b4a55');
  if(d.kind==='shooter'){
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
  }else if(d.kind==='producer'){
    // Abajur fofinho com uma estrelinha no peito.
    ellipse(c,0,-18,49,50,'#f7dd7850');
    rr(c,-23,9,45,16,9,'#c98e8b','#936683',3);rr(c,-10,-18,22,30,8,'#a5dac6','#628a93',3);
    c.beginPath();c.moveTo(-33,-29);c.lineTo(-19,-59);c.quadraticCurveTo(0,-68,23,-56);c.lineTo(35,-28);c.closePath();c.fillStyle='#ffe18d';c.fill();c.strokeStyle='#bb8791';c.lineWidth=4;c.stroke();
    ellipse(c,-17,-26,5,5,'#faebbb');ellipse(c,20,-29,5,5,'#faebbb');
    eye(c,-7,-36,4);eye(c,10,-36,4);line(c,[[-4,-24],[7,-24]],'#995c71',2.5);
    star(c,0,-51,8,4,'#fef5d5');
    line(c,[[-24,24],[25,24]],'#764d70',4);
  }else if(d.kind==='blocker'){
    // Urso Travesseiro gigante, com orelhas fofas.
    ellipse(c,-23,-42,18,18,'#b97d74');ellipse(c,25,-42,18,18,'#b97d74');
    ellipse(c,-23,-43,10,10,'#e7ada5');ellipse(c,25,-43,10,10,'#e7ada5');
    ellipse(c,0,-9,36,38,'#dda797');ellipse(c,-25,0,17,23,'#d69a8b');ellipse(c,28,0,17,23,'#d69a8b');
    ellipse(c,0,-43,39,35,'#e5b1a0');ellipse(c,0,-26,19,14,'#f6dac0');
    eye(c,-13,-48,5);eye(c,13,-48,5);ellipse(c,0,-31,7,5,'#74526b');
    line(c,[[-7,-23],[0,-19],[7,-23]],'#a66d78',2.3);
    rr(c,-28,-2,57,28,10,'#8ab9cc','#4c7190',3);star(c,1,11,11,5,'#f8e2a0');
    ellipse(c,-18,24,14,8,'#b77a77');ellipse(c,19,24,14,8,'#b77a77');
  }
  if(t.hp<t.maxHp){rr(c,-34,-70,68,6,3,'#5d4454');rr(c,-33,-69,66*t.hp/t.maxHp,4,2,t.hp/t.maxHp>.4?'#9bddb1':'#e67c84');}
  c.restore();
}
function drawEnemy(c,e,time){
  c.save();c.translate(e.x,e.y+7);const bob=Math.sin(e.age*8+e.id)*3;c.translate(0,bob);
  if(e.hit>0)c.globalAlpha=.68;
  ellipse(c,0,27,34,9,'#3032475a');
  if(e.type==='E01'){
    // Poeira Andante: nuvem lilás engraçada, perninha fina.
    line(c,[[-17,3],[-18,23]],'#6f5b83',6);line(c,[[16,4],[16,22]],'#6f5b83',6);
    ellipse(c,-22,-13,22,27,'#9b8eba');ellipse(c,17,-14,29,32,'#9d90ba');
    ellipse(c,1,-31,32,31,'#c2b1d6');ellipse(c,-24,-24,11,12,'#cdbde2');
    ellipse(c,0,-29,8,7,'#ddcee8');eye(c,-11,-30,7);eye(c,15,-28,7);
    ellipse(c,2,-12,9,6,'#675273');ellipse(c,-12,-12,7,3,'#e9a9b3');
    line(c,[[25,-44],[35,-51],[34,-42]],'#cdbde2',5);
  }else{
    // Meia Zanzante: meia vermelha rajada e cara maluca.
    line(c,[[-17,0],[-23,26]],'#685179',7);line(c,[[15,0],[20,24]],'#685179',7);
    rr(c,-24,-50,44,66,19,'#dd7a9d','#765b89',4);
    rr(c,-24,-49,44,12,6,'#ffdbb0');
    rr(c,-22,-14,65,31,15,'#e994ac','#765b89',4);
    rr(c,-17,-28,34,8,3,'#ffe1c5');rr(c,-17,-9,46,8,3,'#ffe1c5');
    eye(c,-9,-38,6);eye(c,9,-38,6);ellipse(c,3,-25,8,4,'#88516d');
    ellipse(c,37,-1,9,13,'#fac6b0');
  }
  if(e.hp<e.maxHp){rr(c,-30,-73,60,6,3,'#574a6e');rr(c,-29,-72,58*clamp(e.hp/e.maxHp,0,1),4,2,'#f2a2a7');}
  c.restore();
}
function drawGlow(c,s,time){
  c.save();const bob=Math.sin(time*5+s.id)*3;c.translate(s.x,s.y+bob);
  const fade=clamp((s.dropTime+8-s.age)/1.5,0,1);c.globalAlpha=fade;
  ellipse(c,0,0,27,27,'#ffe07360');star(c,0,0,21,11,'#ffcc58');star(c,0,-2,15,8,'#fff0a2');
  ellipse(c,-5,-3,2.7,3,'#715474');ellipse(c,6,-3,2.7,3,'#715474');
  line(c,[[-3,6],[2,8],[7,5]],'#9f6c6a',2);
  c.restore();
}
function drawProjectile(c,p){ellipse(c,p.x,p.y,12,10,'#fff0bb');ellipse(c,p.x+4,p.y-1,7,6,'#ffffff');line(c,[[p.x-15,p.y],[p.x-23,p.y]],'#fff2c8b3',4);}
export function render(c,game,menu=false,visualMotion=true){
  const t=visualMotion ? (game?.time ?? performance.now()*.001) : 0;
  c.clearRect(0,0,W,H);drawBackground(c,t);
  for(let r=0;r<BOARD.rows;r++){
    const x=game?.trainReady[r]===false?109:109;
    drawTrain(c,x,rowY(r),game?(!game.trainReady[r]&&!game.trains.some(tr=>tr.row===r)):false);
  }
  if(game){
    // Pré-visualização suave da casa selecionada.
    if(game.hover && game.state==='playing'){
      const {col,row}=game.hover;
      if(row>=0&&row<BOARD.rows&&col>=0&&col<BOARD.cols){const ok=game.shovel?!!game.grid[row][col]:!game.canPlace(row,col);
        rr(c,BOARD.x+col*BOARD.cw+4,BOARD.y+row*BOARD.ch+4,BOARD.cw-8,BOARD.ch-8,12,ok?'#f5eeb04c':'#f77f8e44',ok?'#ffdf7b':'#f47d88',3);
      }
    }
    for(const toy of game.allToys)drawToy(c,toy,t);
    for(const p of game.projectiles)drawProjectile(c,p);
    // Inimigos desenhados por faixa e posição; o sprite não afeta a hitbox.
    for(const e of game.enemies)drawEnemy(c,e,t);
    for(const tr of game.trains)drawTrain(c,tr.x,rowY(tr.row),false,true);
    for(const s of game.stars)drawGlow(c,s,t);
    for(const p of game.particles){c.globalAlpha=clamp(p.life/p.maxLife,0,1);ellipse(c,p.x,p.y,p.r,p.r,p.color);}c.globalAlpha=1;
    if(game.bannerUntil>game.time){rr(c,314,147,652,41,20,'#4a3265d9','#f2cf8a',3);txt(c,game.banner,640,168,22,'#fff0b9');}
    if(game.state==='playing'){
      txt(c,`${game.killCount} monstros espantados`,1062,676,15,'#fff3db','right',700);
    }
  }else{
    // Cena decorativa no menu, sem inimigos de verdade nem simulação.
    drawToy(c,{id:0,x:colX(2),y:rowY(3),hp:120,maxHp:120,type:'T02'},t);
    drawToy(c,{id:1,x:colX(3),y:rowY(2),hp:650,maxHp:650,type:'T03'},t);
    drawToy(c,{id:2,x:colX(4),y:rowY(3),hp:100,maxHp:100,type:'T01'},t);
    drawEnemy(c,{id:1,x:colX(7),y:rowY(2),row:2,type:'E01',age:t,hp:100,maxHp:100,hit:0},t);
    drawEnemy(c,{id:2,x:colX(8),y:rowY(3),row:3,type:'E02',age:t,hp:85,maxHp:85,hit:0},t);
  }
  // Textura discreta para dar aparência de ilustração.
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#fff2c00a');g.addColorStop(1,'#120b340c');c.fillStyle=g;c.fillRect(0,0,W,H);
}
export function drawIconCanvas(c,id,x,y,scale=.65,time=0){
  const d=TOYS[id];if(!d)return;
  drawToy(c,{id:0,type:id,x,y,hp:d.maxHp,maxHp:d.maxHp,hit:0},time);
}
