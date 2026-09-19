(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => a + Math.random() * (b - a);

  const markup = `
    <button class="cyber-arcade-fab" id="cyberArcadeFab" aria-label="Open Cyber Arcade"><span class="arcade-live"></span>CYBER ARCADE</button>
    <div class="arcade-pop-note" id="arcadePopNote" role="status">
      <strong>VISITOR DETECTED // CHALLENGE READY</strong>
      <span>Take a quick break: fight Shadow Bot or smash a virtual computer.</span>
      <button type="button" id="arcadePopPlay">PLAY</button>
    </div>
    <div class="arcade-overlay" id="cyberArcadeOverlay" aria-hidden="true">
      <div class="arcade-shell" role="dialog" aria-modal="true" aria-label="Cyber Arcade">
        <div class="arcade-header">
          <div class="arcade-title"><span class="arcade-title-badge"></span><div><strong>SHISHIR // CYBER ARCADE</strong><small>OFF-DUTY SECURITY LAB</small></div></div>
          <div class="arcade-header-actions">
            <button class="arcade-icon-btn" id="arcadeHome" type="button" hidden>HOME</button>
            <button class="arcade-icon-btn" id="arcadeSound" type="button" aria-label="Toggle sound">SOUND: ON</button>
            <button class="arcade-icon-btn" id="arcadeClose" type="button" aria-label="Close arcade">✕</button>
          </div>
        </div>
        <div class="arcade-content">
          <section class="arcade-screen active" id="arcadeMenu">
            <div class="arcade-intro">
              <div class="arcade-code">// CHOOSE_YOUR_DISTRACTION</div>
              <h2>Two tiny games. One cyber portfolio.</h2>
              <p>Built directly into the website. No downloads, no external game engine, and everything works with mouse, keyboard or touch.</p>
            </div>
            <div class="arcade-game-grid">
              <button class="arcade-game-card" type="button" data-open-game="fight">
                <span class="game-no">GAME_01 // COMBAT</span><h3>Stickman: Shadow Protocol</h3>
                <p>Fight an AI stickman in a neon rooftop arena. Move, jump, punch and kick before Shadow Bot empties your health bar.</p><span class="play-tag">ENTER ARENA →</span>
              </button>
              <button class="arcade-game-card" type="button" data-open-game="smash">
                <span class="game-no">GAME_02 // RAGE MODE</span><h3>System Smash</h3>
                <p>A nostalgic computer-smashing game: destroy the monitor, tower, keyboard and mouse. Build combos and wreck the whole setup.</p><span class="play-tag">START SMASHING →</span>
              </button>
            </div>
          </section>

          <section class="arcade-screen" id="fightScreen">
            <div class="arcade-game-top">
              <div class="arcade-game-name"><span>01</span><h3>STICKMAN: SHADOW PROTOCOL</h3></div>
              <div class="arcade-hud"><div class="arcade-stat">YOU <b id="fightPlayerHp">100</b>%</div><div class="arcade-stat">BOT <b id="fightBotHp">100</b>%</div></div>
            </div>
            <div class="arcade-canvas-wrap"><canvas class="arcade-canvas" id="fightCanvas" width="900" height="460"></canvas><div class="arcade-toast" id="fightToast">FIGHT!</div></div>
            <div class="mobile-fight-controls" id="mobileFightControls">
              <button data-fight-key="a">◀</button><button data-fight-key="d">▶</button><button data-fight-key="w">↑</button><button data-fight-key="j">👊</button><button data-fight-key="k">🦶</button>
            </div>
            <div class="arcade-help"><span><span class="arcade-key">A</span><span class="arcade-key">D</span> move · <span class="arcade-key">W</span> jump · <span class="arcade-key">J</span> punch · <span class="arcade-key">K</span> kick</span><div class="arcade-action-row"><button class="arcade-action" id="fightRestart" type="button">RESTART</button></div></div>
          </section>

          <section class="arcade-screen" id="smashScreen">
            <div class="arcade-game-top">
              <div class="arcade-game-name"><span>02</span><h3>SYSTEM SMASH</h3></div>
              <div class="arcade-hud"><div class="arcade-stat">DAMAGE <b id="smashDamage">0</b>%</div><div class="arcade-stat">SCORE <b id="smashScore">0</b></div><div class="arcade-stat">COMBO <b id="smashCombo">x1</b></div></div>
            </div>
            <div class="arcade-canvas-wrap"><canvas class="arcade-canvas" id="smashCanvas" width="900" height="500"></canvas><div class="arcade-toast" id="smashToast">CLICK THE COMPUTER!</div></div>
            <div class="arcade-help"><span>Click/tap the monitor, tower, keyboard or mouse. Different tools do different damage.</span><div class="arcade-action-row" id="smashTools"><button class="arcade-action active" data-tool="fist" type="button">👊 FIST</button><button class="arcade-action" data-tool="hammer" type="button">🔨 HAMMER</button><button class="arcade-action" data-tool="boot" type="button">🥾 BOOT</button><button class="arcade-action" id="smashRestart" type="button">RESET</button></div></div>
          </section>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', markup);

  const overlay = $('#cyberArcadeOverlay');
  const menu = $('#arcadeMenu');
  const fightScreen = $('#fightScreen');
  const smashScreen = $('#smashScreen');
  const homeBtn = $('#arcadeHome');
  const note = $('#arcadePopNote');
  let currentGame = null;
  let soundOn = true;
  let audioCtx = null;

  function audioTone(freq = 180, duration = .06, type = 'square', vol = .035) {
    if (!soundOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }
  function impactSound(power = 1) { audioTone(120 - power * 8, .045 + power * .01, 'square', .025 + power * .004); }

  function showToast(el, text, ms = 900) {
    el.textContent = text; el.classList.add('show'); clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), ms);
  }
  function setScreen(which) {
    [menu, fightScreen, smashScreen].forEach(x => x.classList.remove('active'));
    which.classList.add('active');
    homeBtn.hidden = which === menu;
  }
  function openArcade(game = null) {
    note.classList.remove('show'); overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
    if (game === 'fight') openFight(); else if (game === 'smash') openSmash(); else { currentGame = null; setScreen(menu); }
  }
  function closeArcade() {
    overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.documentElement.style.overflow = '';
    fight.running = false; currentGame = null;
  }
  function goHome() { fight.running = false; currentGame = null; setScreen(menu); }

  $('#cyberArcadeFab').addEventListener('click', () => openArcade());
  $('#arcadeClose').addEventListener('click', closeArcade);
  homeBtn.addEventListener('click', goHome);
  $('#arcadePopPlay').addEventListener('click', () => openArcade());
  $('#arcadeSound').addEventListener('click', e => { soundOn = !soundOn; e.currentTarget.textContent = `SOUND: ${soundOn ? 'ON' : 'OFF'}`; if(soundOn) audioTone(420,.05,'sine',.02); });
  overlay.addEventListener('click', e => { if (e.target === overlay) closeArcade(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeArcade(); });
  document.querySelectorAll('[data-open-game]').forEach(btn => btn.addEventListener('click', () => openArcade(btn.dataset.openGame)));

  setTimeout(() => {
    if (!sessionStorage.getItem('shishirArcadePrompted')) {
      sessionStorage.setItem('shishirArcadePrompted','1'); note.classList.add('show');
      setTimeout(() => note.classList.remove('show'), 9000);
    }
  }, 5500);

  const fightCanvas = $('#fightCanvas');
  const fctx = fightCanvas.getContext('2d');
  const fightToast = $('#fightToast');
  const fight = { running:false, last:0, over:false, keys:{}, ground:380, particles:[] };
  const makeFighter = (x, color, dir) => ({ x,y:fight.ground,vx:0,vy:0,dir,health:100,color,onGround:true,attack:null,attackTime:0,hitDone:false,stun:0,aiCooldown:0 });
  let hero = makeFighter(175,'#e8fff5',1), bot = makeFighter(725,'#ff5c73',-1);

  function resetFight() {
    hero = makeFighter(175,'#e8fff5',1); bot = makeFighter(725,'#ff5c73',-1); fight.over=false; fight.particles=[];
    updateFightHud(); showToast(fightToast,'FIGHT!',700);
  }
  function updateFightHud(){ $('#fightPlayerHp').textContent=Math.max(0,Math.ceil(hero.health)); $('#fightBotHp').textContent=Math.max(0,Math.ceil(bot.health)); }
  function fightAttack(f,type){ if(fight.over || f.attackTime>0 || f.stun>0)return; f.attack=type; f.attackTime=type==='kick'?.32:.22; f.hitDone=false; audioTone(type==='kick'?120:170,.035,'square',.018); }
  function spawnHit(x,y,color){ for(let i=0;i<10;i++) fight.particles.push({x,y,vx:rand(-150,150),vy:rand(-160,40),life:rand(.2,.45),color}); }
  function checkHit(a,d){
    if(!a.attack || a.attackTime<=0 || a.hitDone)return;
    const range=a.attack==='kick'?88:68, damage=a.attack==='kick'?13:8;
    if(Math.abs(a.x-d.x)<range && Math.abs(a.y-d.y)<58){
      d.health=clamp(d.health-damage,0,100); d.vx+=a.dir*(a.attack==='kick'?290:190); d.stun=.12; a.hitDone=true; spawnHit(d.x,d.y-58,a===hero?'#41ff9a':'#ff5c73'); impactSound(a.attack==='kick'?2:1); updateFightHud();
      if(d.health<=0){fight.over=true;showToast(fightToast,a===hero?'ACCESS GRANTED // YOU WIN':'ACCESS DENIED // BOT WINS',2200);}
    }
  }
  function updateFighter(f,dt){
    if(f.stun>0)f.stun-=dt; f.vy+=1180*dt; f.x+=f.vx*dt; f.y+=f.vy*dt; f.vx*=Math.pow(.001,dt);
    if(f.y>=fight.ground){f.y=fight.ground;f.vy=0;f.onGround=true}else f.onGround=false;
    f.x=clamp(f.x,42,fightCanvas.width-42);
    if(f.attackTime>0){f.attackTime-=dt;if(f.attackTime<=0){f.attack=null;f.hitDone=false;}}
  }
  function heroControl(){ if(fight.over||hero.stun>0)return; if(fight.keys.a){hero.vx=-245;hero.dir=-1} if(fight.keys.d){hero.vx=245;hero.dir=1} if(fight.keys.w&&hero.onGround){hero.vy=-495;hero.onGround=false;audioTone(250,.04,'sine',.012)} }
  function botControl(dt){ if(fight.over||bot.stun>0)return; bot.aiCooldown-=dt; const dx=hero.x-bot.x; bot.dir=dx>=0?1:-1; if(Math.abs(dx)>82)bot.vx=Math.sign(dx)*158; else if(bot.aiCooldown<=0){fightAttack(bot,Math.random()>.48?'kick':'punch');bot.aiCooldown=rand(.45,.9)} if(Math.random()<.003&&bot.onGround&&Math.abs(dx)>170)bot.vy=-455; }
  function drawFighter(c,f){
    c.save();c.translate(f.x,f.y);c.strokeStyle=f.color;c.fillStyle=f.color;c.lineWidth=7;c.lineCap='round';
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,7,34,7,0,0,Math.PI*2);c.fill();c.strokeStyle=f.color;
    c.beginPath();c.arc(0,-92,17,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(0,-74);c.lineTo(0,-32);c.stroke();
    let ax=29*f.dir,ay=-57,bx=-23*f.dir,by=-47;if(f.attack==='punch'){ax=61*f.dir;ay=-58}c.beginPath();c.moveTo(0,-61);c.lineTo(ax,ay);c.moveTo(0,-61);c.lineTo(bx,by);c.stroke();
    let lx=26*f.dir,ly=0,rx=-24*f.dir,ry=0;if(f.attack==='kick'){lx=65*f.dir;ly=-27}c.beginPath();c.moveTo(0,-32);c.lineTo(lx,ly);c.moveTo(0,-32);c.lineTo(rx,ry);c.stroke();
    c.fillStyle=f===hero?'#35e7ff':'#ff355e';c.beginPath();c.arc(6*f.dir,-95,3,0,Math.PI*2);c.fill();c.restore();
  }
  function drawFight(){
    const c=fctx,w=fightCanvas.width,h=fightCanvas.height; const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#06172b');g.addColorStop(.62,'#0d2f3b');g.addColorStop(.621,'#071013');g.addColorStop(1,'#010507');c.fillStyle=g;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(53,231,255,.12)';c.beginPath();c.arc(730,82,54,0,Math.PI*2);c.fill();c.fillStyle='#02090d';
    [[0,245,90,135],[75,215,105,165],[165,270,115,110],[270,190,105,190],[365,235,120,145],[475,175,115,205],[580,250,105,130],[675,205,105,175],[770,235,130,145]].forEach(b=>c.fillRect(...b));
    c.strokeStyle='rgba(65,255,154,.16)';c.lineWidth=2;c.beginPath();c.moveTo(0,fight.ground+4);c.lineTo(w,fight.ground+4);c.stroke();
    c.fillStyle='rgba(0,0,0,.45)';c.fillRect(30,25,300,14);c.fillRect(w-330,25,300,14);c.fillStyle='#41ff9a';c.fillRect(30,25,300*(hero.health/100),14);c.fillStyle='#ff5c73';const bw=300*(bot.health/100);c.fillRect(w-30-bw,25,bw,14);
    drawFighter(c,hero);drawFighter(c,bot);
    fight.particles.forEach(p=>{c.globalAlpha=clamp(p.life*3,0,1);c.fillStyle=p.color;c.fillRect(p.x,p.y,4,4)});c.globalAlpha=1;
    if(fight.over){c.fillStyle='rgba(0,0,0,.42)';c.fillRect(0,0,w,h);c.textAlign='center';c.fillStyle='#e8fff5';c.font='700 40px Orbitron, sans-serif';c.fillText(hero.health>0?'YOU WIN':'SHADOW BOT WINS',w/2,210);c.font='16px JetBrains Mono, monospace';c.fillStyle='#8ea9a3';c.fillText('Press RESTART for another round',w/2,244);}
  }
  function fightLoop(now){if(!fight.running)return;const dt=Math.min((now-fight.last)/1000,.03)||.016;fight.last=now;heroControl();botControl(dt);if(hero.x<bot.x){hero.dir=1;bot.dir=-1}else{hero.dir=-1;bot.dir=1}updateFighter(hero,dt);updateFighter(bot,dt);checkHit(hero,bot);checkHit(bot,hero);fight.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.life-=dt});fight.particles=fight.particles.filter(p=>p.life>0);drawFight();requestAnimationFrame(fightLoop)}
  function openFight(){ currentGame='fight';setScreen(fightScreen);resetFight();fight.running=true;fight.last=performance.now();requestAnimationFrame(fightLoop); }
  $('#fightRestart').addEventListener('click',resetFight);
  window.addEventListener('keydown',e=>{if(currentGame!=='fight')return;const k=e.key.toLowerCase();if(['a','d','w','j','k'].includes(k))e.preventDefault();fight.keys[k]=true;if(k==='j')fightAttack(hero,'punch');if(k==='k')fightAttack(hero,'kick');});
  window.addEventListener('keyup',e=>fight.keys[e.key.toLowerCase()]=false);
  document.querySelectorAll('[data-fight-key]').forEach(btn=>{
    const k=btn.dataset.fightKey; const down=e=>{e.preventDefault();fight.keys[k]=true;if(k==='j')fightAttack(hero,'punch');if(k==='k')fightAttack(hero,'kick')}; const up=e=>{e.preventDefault();fight.keys[k]=false};
    btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);
  });

  const smashCanvas=$('#smashCanvas'),sctx=smashCanvas.getContext('2d'),smashToast=$('#smashToast');
  const smash={damage:0,score:0,combo:1,lastHit:0,tool:'fist',cracks:[],debris:[],shake:0,destroyed:false,hits:0};
  const parts={monitor:{x:225,y:120,w:330,h:220,hp:100},tower:{x:610,y:155,w:145,h:250,hp:100},keyboard:{x:260,y:390,w:320,h:55,hp:100},mouse:{x:635,y:405,w:75,h:42,hp:100}};
  const tools={fist:{dmg:8,score:90,power:1},hammer:{dmg:13,score:130,power:2},boot:{dmg:17,score:165,power:3}};
  function resetSmash(){smash.damage=0;smash.score=0;smash.combo=1;smash.lastHit=0;smash.cracks=[];smash.debris=[];smash.shake=0;smash.destroyed=false;smash.hits=0;Object.values(parts).forEach(p=>p.hp=100);updateSmashHud();drawSmash();showToast(smashToast,'CLICK THE COMPUTER!',900)}
  function updateSmashHud(){ $('#smashDamage').textContent=Math.round(smash.damage);$('#smashScore').textContent=smash.score;$('#smashCombo').textContent='x'+smash.combo; }
  function partAt(x,y){return Object.entries(parts).find(([,p])=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h)}
  function smashHit(x,y){
    if(smash.destroyed)return;const found=partAt(x,y);if(!found){showToast(smashToast,'MISS!',350);return}const [name,p]=found;const t=tools[smash.tool];const now=performance.now();smash.combo=(now-smash.lastHit<700)?Math.min(9,smash.combo+1):1;smash.lastHit=now;p.hp=clamp(p.hp-t.dmg,0,100);smash.hits++;smash.score+=Math.round(t.score*smash.combo);smash.shake=5+t.power*2;smash.cracks.push({x,y,r:rand(18,42)+t.power*4,a:rand(0,Math.PI*2),part:name});for(let i=0;i<5+t.power*3;i++)smash.debris.push({x,y,vx:rand(-180,180),vy:rand(-220,-40),life:rand(.35,.8),size:rand(2,6),color:Math.random()>.5?'#8ea9a3':'#35e7ff'});impactSound(t.power);if(name==='monitor'&&p.hp<55)audioTone(rand(70,110),.08,'sawtooth',.02);const lost=Object.values(parts).reduce((a,q)=>a+(100-q.hp),0);smash.damage=lost/4;updateSmashHud();showToast(smashToast,`${smash.tool.toUpperCase()} HIT +${Math.round(t.score*smash.combo)}`,430);if(smash.damage>=99.9){smash.damage=100;smash.destroyed=true;smash.score+=2500;updateSmashHud();showToast(smashToast,'SYSTEM DESTROYED +2500',2200);for(let i=0;i<70;i++)smash.debris.push({x:450,y:270,vx:rand(-380,380),vy:rand(-380,80),life:rand(.7,1.5),size:rand(2,8),color:Math.random()>.5?'#41ff9a':'#35e7ff'});audioTone(65,.35,'sawtooth',.05)}
  }
  function crack(c,q){c.save();c.translate(q.x,q.y);c.rotate(q.a);c.strokeStyle='rgba(225,255,250,.72)';c.lineWidth=1.3;for(let i=0;i<6;i++){const a=(Math.PI*2/6)*i+rand(-.16,.16);c.beginPath();c.moveTo(0,0);const ex=Math.cos(a)*q.r,ey=Math.sin(a)*q.r;c.lineTo(ex,ey);c.lineTo(ex+rand(-8,8),ey+rand(-8,8));c.stroke()}c.restore()}
  function drawSmash(){
    const c=sctx,w=smashCanvas.width,h=smashCanvas.height;c.save();const sx=smash.shake?rand(-smash.shake,smash.shake):0,sy=smash.shake?rand(-smash.shake,smash.shake):0;c.translate(sx,sy);smash.shake*=.72;
    const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#10181d');bg.addColorStop(1,'#03080b');c.fillStyle=bg;c.fillRect(-20,-20,w+40,h+40);c.fillStyle='#15242a';c.fillRect(0,350,w,150);c.fillStyle='#20343a';c.fillRect(80,350,740,20);c.fillStyle='#0a1114';c.fillRect(130,370,18,130);c.fillRect(755,370,18,130);
    let p=parts.tower;c.fillStyle=p.hp>0?'#18262c':'#0c1113';c.fillRect(p.x,p.y,p.w,p.h);c.strokeStyle='#51656a';c.lineWidth=3;c.strokeRect(p.x,p.y,p.w,p.h);c.fillStyle='#061014';c.fillRect(p.x+18,p.y+32,p.w-36,38);c.fillStyle=p.hp>0?'#41ff9a':'#ff5c73';c.beginPath();c.arc(p.x+p.w-25,p.y+22,5,0,Math.PI*2);c.fill();for(let i=0;i<3;i++){c.strokeStyle='#33484e';c.strokeRect(p.x+25,p.y+105+i*45,p.w-50,28)}
    p=parts.monitor;c.fillStyle=p.hp>0?'#17272c':'#0a1113';c.fillRect(p.x,p.y,p.w,p.h);c.strokeStyle='#536b70';c.lineWidth=4;c.strokeRect(p.x,p.y,p.w,p.h);const screenHp=p.hp;c.fillStyle=screenHp>0?(screenHp<55?'#102b2d':'#07181c'):'#020405';c.fillRect(p.x+18,p.y+18,p.w-36,p.h-45);if(screenHp>0){c.fillStyle=screenHp<55?'#ff5c73':'#41ff9a';c.font='700 17px JetBrains Mono, monospace';c.fillText(screenHp<55?'KERNEL PANIC_':'SYSTEM ONLINE_',p.x+36,p.y+58);c.fillStyle='#35e7ff';c.font='13px JetBrains Mono, monospace';c.fillText('> threat_scan --all',p.x+36,p.y+92);c.fillStyle='#668b83';c.fillText('> no threats detected',p.x+36,p.y+120);if(screenHp<75){for(let i=0;i<6;i++){c.fillStyle=`rgba(255,92,115,${rand(.08,.3)})`;c.fillRect(p.x+20,p.y+rand(28,190),p.w-40,rand(2,7))}}}c.fillStyle='#1d2e33';c.fillRect(p.x+145,p.y+p.h,40,50);c.fillRect(p.x+105,p.y+p.h+45,120,12);
    p=parts.keyboard;c.fillStyle=p.hp>0?'#203138':'#0b1114';c.beginPath();c.roundRect(p.x,p.y,p.w,p.h,9);c.fill();for(let r=0;r<3;r++)for(let k=0;k<13;k++){c.fillStyle=p.hp>35?'#3a4d52':'#202b2e';c.fillRect(p.x+12+k*23,p.y+9+r*13,17,8)}
    p=parts.mouse;c.fillStyle=p.hp>0?'#2d4147':'#101719';c.beginPath();c.ellipse(p.x+p.w/2,p.y+p.h/2,p.w/2,p.h/2,0,0,Math.PI*2);c.fill();c.strokeStyle='#35e7ff';c.beginPath();c.moveTo(p.x+p.w/2,p.y+5);c.lineTo(p.x+p.w/2,p.y+21);c.stroke();
    smash.cracks.forEach(q=>crack(c,q));smash.debris.forEach(d=>{c.globalAlpha=clamp(d.life*2,0,1);c.fillStyle=d.color;c.fillRect(d.x,d.y,d.size,d.size)});c.globalAlpha=1;
    if(smash.destroyed){c.fillStyle='rgba(0,0,0,.34)';c.fillRect(0,0,w,h);c.textAlign='center';c.fillStyle='#41ff9a';c.font='800 42px Orbitron, sans-serif';c.fillText('SYSTEM DESTROYED',w/2,225);c.font='15px JetBrains Mono, monospace';c.fillStyle='#d8fff3';c.fillText(`FINAL SCORE ${smash.score}`,w/2,260)}c.restore();
  }
  function smashAnim(){if(currentGame!=='smash')return;smash.debris.forEach(d=>{d.x+=d.vx*.016;d.y+=d.vy*.016;d.vy+=440*.016;d.life-=.016});smash.debris=smash.debris.filter(d=>d.life>0);drawSmash();requestAnimationFrame(smashAnim)}
  function smashPointer(e){const r=smashCanvas.getBoundingClientRect();const x=(e.clientX-r.left)*(smashCanvas.width/r.width),y=(e.clientY-r.top)*(smashCanvas.height/r.height);smashHit(x,y)}
  function openSmash(){ currentGame='smash';fight.running=false;setScreen(smashScreen);resetSmash();requestAnimationFrame(smashAnim); }
  smashCanvas.addEventListener('pointerdown',e=>{e.preventDefault();smashPointer(e)});
  $('#smashRestart').addEventListener('click',resetSmash);
  document.querySelectorAll('#smashTools [data-tool]').forEach(btn=>btn.addEventListener('click',()=>{smash.tool=btn.dataset.tool;document.querySelectorAll('#smashTools [data-tool]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');audioTone(smash.tool==='hammer'?280:smash.tool==='boot'?180:360,.04,'sine',.018)}));

  drawFight(); drawSmash();
})();
