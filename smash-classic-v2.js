(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const content=$('.arcade-content'), smashCard=$('[data-open-game="smash"]'), homeBtn=$('#arcadeHome');
  const fab=$('#cyberArcadeFab'), popPlay=$('#arcadePopPlay');
  if(!content||!smashCard||!homeBtn)return;

  smashCard.querySelector('.game-no').textContent='GAME_02 // RAGE MODE';
  smashCard.querySelector('h3').textContent='System Smash: Rage Room';
  smashCard.querySelector('p').textContent='Tap the computer and hear different realistic impact sounds as the screen, tower, keyboard and mouse break apart.';
  smashCard.querySelector('.play-tag').textContent='SMASH THE COMPUTER →';

  content.insertAdjacentHTML('beforeend',`
    <section class="arcade-screen" id="classicSmashScreen">
      <div class="arcade-game-top rage-top">
        <div class="arcade-game-name"><span>02</span><h3>SYSTEM SMASH // RAGE ROOM</h3></div>
        <div class="arcade-hud"><div class="arcade-stat">DAMAGE <b id="rageDamage">0</b>%</div><div class="arcade-stat">HITS <b id="rageHits">0</b></div><div class="arcade-stat">COMBO <b id="rageCombo">x1</b></div></div>
      </div>
      <div class="rage-stage-wrap">
        <canvas id="rageCanvas" width="960" height="560" aria-label="Interactive computer smashing game"></canvas>
        <div class="rage-banner" id="rageBanner"><strong>ERROR!</strong><span>YOUR COMPUTER HAS STOPPED RESPONDING.</span><small>Tap anywhere on the computer to deal with it.</small></div>
        <div class="rage-complete" id="rageComplete"><div class="rage-skull">☠</div><b>RAGE COMPLETE</b><span>Nothing useful remains.</span><button type="button" id="rageAgain">SMASH AGAIN</button></div>
      </div>
      <div class="rage-bottom"><span><b>HOW TO PLAY:</b> Tap/click each part. The monitor cracks, keys fly, metal bends and every object has its own impact sound.</span><button class="arcade-action" id="rageReset" type="button">RESET ROOM</button></div>
    </section>`);

  const screen=$('#classicSmashScreen'),canvas=$('#rageCanvas'),ctx=canvas.getContext('2d'),banner=$('#rageBanner'),complete=$('#rageComplete');
  const damageEl=$('#rageDamage'),hitsEl=$('#rageHits'),comboEl=$('#rageCombo');
  const W=960,H=560;
  const parts={monitor:{x:235,y:96,w:355,h:255,max:8,hp:8},tower:{x:655,y:126,w:165,h:315,max:9,hp:9},keyboard:{x:250,y:395,w:350,h:86,max:12,hp:12},mouse:{x:620,y:430,w:80,h:58,max:6,hp:6}};
  let hits=0,combo=1,lastHit=0,shake=0,flash=0,particles=[],cracks=[],keys=[],debris=[],smoke=[],raf=0,prev=performance.now();
  let fist={active:false,x:800,y:530,t:0};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a),destroyed=p=>p.hp<=0,stage=p=>Math.ceil((1-p.hp/p.max)*4);

  // Procedural impact audio: no external sound files, so hits vary naturally and work on desktop/mobile.
  let ac=null,noiseBuffer=null;
  function soundEnabled(){return !($('#arcadeSound')?.textContent||'').includes('OFF');}
  function audio(){
    if(!soundEnabled())return null;
    try{
      ac ||= new (window.AudioContext||window.webkitAudioContext)();
      if(ac.state==='suspended')ac.resume();
      if(!noiseBuffer){
        noiseBuffer=ac.createBuffer(1,Math.floor(ac.sampleRate*.75),ac.sampleRate);const d=noiseBuffer.getChannelData(0);
        for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      }
      return ac;
    }catch{return null;}
  }
  function noise({delay=0,d=.08,gain=.12,type='bandpass',freq=1200,q=.7}={}){
    const a=audio();if(!a)return;const now=a.currentTime+delay,src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
    src.buffer=noiseBuffer;f.type=type;f.frequency.value=freq;f.Q.value=q;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(gain,now+.004);g.gain.exponentialRampToValueAtTime(.0001,now+d);src.connect(f);f.connect(g);g.connect(a.destination);src.start(now);src.stop(now+d+.02);
  }
  function osc({delay=0,f=100,to=45,d=.12,gain=.12,type='sine'}={}){
    const a=audio();if(!a)return;const now=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(Math.max(25,to),now+d);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(gain,now+.003);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.connect(g);g.connect(a.destination);o.start(now);o.stop(now+d+.02);
  }
  function clickTick(delay=.02,f=1800,gain=.025){osc({delay,f,to:f*.65,d:.025,gain,type:'square'});}
  function impact(kind,isFinal=false){
    const v=rand(.9,1.12);
    // body impact shared by all objects
    noise({d:.055,gain:.12*v,type:'lowpass',freq:420});osc({f:105*v,to:42,d:.12,gain:.13*v,type:'sine'});
    if(kind==='monitor'){
      noise({delay:.008,d:.095,gain:.16*v,type:'highpass',freq:2200,q:.4});
      for(let i=0;i<4+(isFinal?5:0);i++) clickTick(.012+i*.012,rand(2100,4800),rand(.018,.035));
      if(isFinal) noise({delay:.05,d:.25,gain:.15,type:'highpass',freq:1600});
    }else if(kind==='tower'){
      osc({delay:.004,f:rand(330,430),to:190,d:.22,gain:.095*v,type:'triangle'});osc({delay:.006,f:rand(610,780),to:360,d:.16,gain:.055*v,type:'sine'});
      noise({delay:.015,d:.11,gain:.09*v,type:'bandpass',freq:850,q:2});
      if(isFinal){osc({delay:.03,f:180,to:55,d:.34,gain:.15,type:'sawtooth'});noise({delay:.04,d:.32,gain:.13,type:'lowpass',freq:900});}
    }else if(kind==='keyboard'){
      noise({delay:.004,d:.07,gain:.11*v,type:'bandpass',freq:1300,q:.8});
      for(let i=0;i<5+(isFinal?7:0);i++)clickTick(.005+i*.018,rand(700,1900),rand(.018,.04));
      if(isFinal)noise({delay:.04,d:.2,gain:.12,type:'bandpass',freq:650,q:.5});
    }else if(kind==='mouse'){
      noise({delay:.004,d:.065,gain:.1*v,type:'bandpass',freq:1050,q:1.1});osc({delay:.002,f:260,to:105,d:.09,gain:.07*v,type:'triangle'});clickTick(.018,rand(900,1500),.03);
      if(isFinal){noise({delay:.035,d:.15,gain:.12,type:'highpass',freq:900});osc({delay:.025,f:150,to:55,d:.18,gain:.09,type:'sawtooth'});}
    }else{
      noise({d:.045,gain:.06,type:'bandpass',freq:700});
    }
  }
  function finalCrash(){osc({f:95,to:28,d:.45,gain:.18,type:'sine'});noise({d:.38,gain:.17,type:'lowpass',freq:650});noise({delay:.035,d:.3,gain:.11,type:'highpass',freq:1900});for(let i=0;i<8;i++)clickTick(.025+i*.028,rand(500,2600),rand(.015,.035));}

  function partAt(x,y){return Object.entries(parts).find(([,p])=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h);}
  function totalDamage(){const m=Object.values(parts).reduce((s,p)=>s+p.max,0),l=Object.values(parts).reduce((s,p)=>s+p.hp,0);return Math.round((1-l/m)*100);}
  function hud(){damageEl.textContent=totalDamage();hitsEl.textContent=hits;comboEl.textContent=`x${combo}`;}
  function burst(x,y,k){const n=k==='monitor'?18:k==='keyboard'?13:11;for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-270,270),vy:rand(-310,-40),life:rand(.35,.9),size:rand(2,7),kind:k});if(k==='tower'&&parts.tower.hp<=4)for(let i=0;i<4;i++)smoke.push({x:x+rand(-20,20),y:y+rand(-8,8),r:rand(8,15),life:rand(.7,1.2),vy:rand(-48,-18)});}
  function addCrack(x,y){cracks.push({x,y,r:rand(25,55),rot:rand(0,Math.PI)});if(cracks.length>15)cracks.shift();}
  function popKey(){const i=Math.floor(Math.random()*48),c=i%12,r=Math.floor(i/12);keys.push({x:parts.keyboard.x+18+c*25.5,y:parts.keyboard.y+18+r*14,vx:rand(-140,140),vy:rand(-250,-110),rot:0,vr:rand(-9,9),life:3});}
  function dropDebris(kind,p){const n=kind==='monitor'?7:kind==='keyboard'?7:4;for(let i=0;i<n;i++)debris.push({x:p.x+rand(0,p.w),y:p.y+rand(0,p.h),vx:rand(-200,200),vy:rand(-280,-80),w:rand(10,30),h:rand(5,18),rot:rand(0,6),vr:rand(-8,8),life:4});}
  function hit(name,p,x,y){
    if(destroyed(p))return;const now=performance.now();combo=now-lastHit<720?Math.min(9,combo+1):1;lastHit=now;p.hp--;hits++;shake=Math.min(19,7+combo);flash=.1;fist={active:true,x,y,t:.16};
    const final=p.hp===0;impact(name,final);burst(x,y,name);if(name==='monitor')addCrack(x,y);if(name==='keyboard'){popKey();if(Math.random()>.42)popKey();}if(final)dropDebris(name,p);hud();
    if(Object.values(parts).every(destroyed)){setTimeout(()=>{finalCrash();complete.classList.add('show');},380);}
  }
  function pointerPos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();banner.classList.add('hide');const{x,y}=pointerPos(e),f=partAt(x,y);if(f)hit(f[0],f[1],x,y);else{fist={active:true,x,y,t:.11};impact('desk',false);}});

  function reset(){Object.values(parts).forEach(p=>p.hp=p.max);hits=0;combo=1;lastHit=0;shake=0;flash=0;particles=[];cracks=[];keys=[];debris=[];smoke=[];banner.classList.remove('hide');complete.classList.remove('show');hud();}
  $('#rageReset').addEventListener('click',reset);$('#rageAgain').addEventListener('click',reset);
  function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
  function room(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#19242b');g.addColorStop(.58,'#0d1418');g.addColorStop(.581,'#6d5238');g.addColorStop(1,'#2d2118');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(53,231,255,.045)';for(let x=0;x<W;x+=52)ctx.fillRect(x,0,1,325);ctx.fillStyle='#725437';ctx.fillRect(85,350,790,22);ctx.fillStyle='#3d2b1c';ctx.fillRect(105,372,750,20);ctx.fillStyle='#0a0f12';ctx.fillRect(105,520,750,9);}
  function monitor(){const p=parts.monitor,s=stage(p);if(destroyed(p)){ctx.save();ctx.translate(405,335);ctx.rotate(-.16);rounded(-145,-42,290,58,8,'#15191c','#31383c');ctx.fillStyle='#030607';ctx.fillRect(-125,-31,245,35);ctx.restore();ctx.fillStyle='#24292c';ctx.fillRect(368,352,80,22);ctx.fillRect(340,373,138,12);return;}rounded(p.x,p.y,p.w,p.h,18,'#191e21','#485156');ctx.lineWidth=4;rounded(p.x+25,p.y+23,p.w-50,p.h-68,8,'#081113','#273238');const g=ctx.createLinearGradient(p.x,p.y,p.x+p.w,p.y+p.h);g.addColorStop(0,s>=2?'#260b0e':'#0c2631');g.addColorStop(1,s>=3?'#050303':'#061012');ctx.fillStyle=g;ctx.fillRect(p.x+35,p.y+33,p.w-70,p.h-88);if(s<2){ctx.fillStyle='#ff566b';ctx.font='700 18px JetBrains Mono';ctx.fillText('FATAL ERROR',p.x+112,p.y+95);ctx.fillStyle='#9bb8bf';ctx.font='12px JetBrains Mono';ctx.fillText('SYSTEM_NOT_RESPONDING',p.x+78,p.y+126);}cracks.forEach(c=>{ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.strokeStyle='rgba(220,245,255,.85)';ctx.lineWidth=1.3;for(let a=0;a<8;a++){const an=a*Math.PI/4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(an)*c.r,Math.sin(an)*c.r);ctx.lineTo(Math.cos(an+.16)*c.r*1.32,Math.sin(an+.16)*c.r*1.32);ctx.stroke();}ctx.restore();});ctx.fillStyle='#30383c';ctx.fillRect(p.x+150,p.y+p.h,55,40);ctx.fillRect(p.x+105,p.y+p.h+36,145,13);}
  function tower(){const p=parts.tower,s=stage(p);if(destroyed(p)){ctx.save();ctx.translate(735,410);ctx.rotate(.22);ctx.fillStyle='#15191c';ctx.fillRect(-70,-28,140,52);ctx.restore();ctx.strokeStyle='#41ff9a';ctx.beginPath();ctx.moveTo(675,390);ctx.bezierCurveTo(710,350,760,455,805,370);ctx.stroke();return;}rounded(p.x,p.y,p.w,p.h,10,'#191d20','#485156');ctx.fillStyle='#0c1012';ctx.fillRect(p.x+20,p.y+26,p.w-40,p.h-52);ctx.strokeStyle='#343c40';for(let y=p.y+58;y<p.y+p.h-40;y+=22){ctx.beginPath();ctx.moveTo(p.x+35,y);ctx.lineTo(p.x+p.w-35,y);ctx.stroke();}ctx.fillStyle=s>=2?'#ff4b60':'#41ff9a';ctx.beginPath();ctx.arc(p.x+p.w/2,p.y+44,8,0,Math.PI*2);ctx.fill();if(s>=2){ctx.fillStyle='#262b2e';ctx.save();ctx.translate(p.x+70,p.y+195);ctx.rotate(-.12);ctx.fillRect(-55,-65,110,130);ctx.restore();}if(s>=3){ctx.strokeStyle='#41ff9a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x+34,p.y+205);ctx.bezierCurveTo(p.x+88,p.y+155,p.x+80,p.y+290,p.x+135,p.y+250);ctx.stroke();}}
  function keyboard(){const p=parts.keyboard,s=stage(p);if(destroyed(p)){ctx.save();ctx.translate(425,455);ctx.rotate(.08);ctx.fillStyle='#171b1d';ctx.fillRect(-170,-22,340,35);ctx.restore();return;}ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h/2);ctx.rotate(s>=3?.035:0);ctx.translate(-p.w/2,-p.h/2);rounded(0,0,p.w,p.h,9,'#1d2225','#505a5e');const removed=Math.min(38,Math.floor((1-p.hp/p.max)*45));let k=0;for(let r=0;r<4;r++)for(let c=0;c<12;c++,k++){if(k<removed&&((k*7+3)%11)<7)continue;ctx.fillStyle='#0a0d0f';ctx.fillRect(15+c*26.5,12+r*16,21,11);}ctx.restore();}
  function mouse(){const p=parts.mouse,s=stage(p);if(destroyed(p)){ctx.fillStyle='#171b1d';ctx.save();ctx.translate(p.x+35,p.y+28);ctx.rotate(-.35);ctx.beginPath();ctx.ellipse(-18,0,22,29,0,0,Math.PI*2);ctx.fill();ctx.rotate(.7);ctx.beginPath();ctx.ellipse(20,0,22,29,0,0,Math.PI*2);ctx.fill();ctx.restore();return;}ctx.fillStyle='#1d2225';ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h/2,p.w/2,p.h/2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=s>=2?'#ff5368':'#505a5e';ctx.stroke();if(s>=3){ctx.beginPath();ctx.moveTo(p.x+18,p.y+13);ctx.lineTo(p.x+61,p.y+45);ctx.stroke();}}
  function fx(dt){particles.forEach(q=>{q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=620*dt;ctx.globalAlpha=clamp(q.life*1.7,0,1);ctx.fillStyle=q.kind==='monitor'?'#c8f1ff':q.kind==='tower'?'#ffb24c':'#c8d0d2';ctx.fillRect(q.x,q.y,q.size,q.size);});particles=particles.filter(q=>q.life>0);ctx.globalAlpha=1;keys.forEach(q=>{q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=620*dt;q.rot+=q.vr*dt;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.fillStyle='#080b0d';ctx.fillRect(-8,-5,16,10);ctx.restore();});keys=keys.filter(q=>q.life>0);debris.forEach(q=>{q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=700*dt;q.rot+=q.vr*dt;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.fillStyle='#252b2e';ctx.fillRect(-q.w/2,-q.h/2,q.w,q.h);ctx.restore();});debris=debris.filter(q=>q.life>0);smoke.forEach(q=>{q.life-=dt;q.y+=q.vy*dt;q.r+=14*dt;ctx.globalAlpha=clamp(q.life*.35,0,.32);ctx.fillStyle='#aab2b5';ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();});smoke=smoke.filter(q=>q.life>0);ctx.globalAlpha=1;if(fist.active){fist.t-=dt;const p=clamp(fist.t/.16,0,1),ease=Math.sin((1-p)*Math.PI),x=fist.x+135*(1-ease),y=fist.y+155*(1-ease);ctx.save();ctx.translate(x,y);ctx.rotate(-.45);rounded(-36,-20,72,48,18,'#d6a06e','#7f5536');ctx.fillStyle='#bd8357';for(let i=0;i<4;i++)rounded(-32+i*16,-28,15,24,7,'#bd8357','#7f5536');ctx.restore();if(fist.t<=0)fist.active=false;}}
  function frame(now){const dt=Math.min(.035,(now-prev)/1000);prev=now;if(!screen.classList.contains('active'))return;ctx.save();if(shake>0){ctx.translate(rand(-shake,shake),rand(-shake,shake));shake*=.82;if(shake<.5)shake=0;}room();monitor();tower();keyboard();mouse();fx(dt);if(flash>0){flash-=dt;ctx.fillStyle=`rgba(255,255,255,${flash*1.7})`;ctx.fillRect(0,0,W,H);}ctx.restore();raf=requestAnimationFrame(frame);}
  function hide(){screen.classList.remove('active');cancelAnimationFrame(raf);}
  function open(e){if(e){e.preventDefault();e.stopImmediatePropagation();}document.querySelectorAll('.arcade-screen').forEach(s=>s.classList.remove('active'));screen.classList.add('active');homeBtn.hidden=false;reset();prev=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}
  smashCard.addEventListener('click',open,true);homeBtn.addEventListener('click',hide,true);fab?.addEventListener('click',hide,true);popPlay?.addEventListener('click',hide,true);document.querySelectorAll('[data-open-game="fight"],#openCtfGame').forEach(el=>el.addEventListener('click',hide,true));$('#arcadeClose')?.addEventListener('click',hide,true);
})();