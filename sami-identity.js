// Gives the portfolio assistant its own identity: Sami.
(()=>{
  const greeting="Hi, I'm Sami, Shishir's portfolio assistant. It's lovely to meet you. You can chat with me normally, ask about Shishir, get computer help, check the weather or time, do a calculation, ask for a joke, or prepare an email. How are you today?";

  function brandSami(){
    const openBtn=document.getElementById('openAiBtn');
    const fab=document.getElementById('aiFab');
    const panel=document.getElementById('aiPanel');
    if(openBtn)openBtn.textContent='Ask Sami';
    if(fab){fab.setAttribute('aria-label','Open Sami');const dot=fab.querySelector('.ai-dot');fab.innerHTML='';if(dot)fab.appendChild(dot);fab.append(' SAMI');}
    if(panel)panel.setAttribute('aria-label','Sami — Shishir portfolio assistant');
    const title=document.querySelector('.ai-header strong');
    const subtitle=document.querySelector('.ai-header small');
    if(title)title.textContent='SAMI';
    if(subtitle)subtitle.textContent="Shishir's Portfolio Assistant";
    const initial=document.querySelector('#aiMessages .message.bot');
    if(initial)initial.textContent="Hi, I'm Sami, Shishir's portfolio assistant. Ask me about his cybersecurity skills, certifications, projects or education, or just chat with me normally.";
  }

  brandSami();

  // Run before the original click handler so only Sami's greeting is spoken.
  const greetBeforeOpen=()=>{
    try{
      if(typeof hasGreeted!=='undefined'&&!hasGreeted){
        hasGreeted=true;
        if(typeof speakText==='function')speakText(greeting);
      }
    }catch{}
  };
  document.getElementById('aiFab')?.addEventListener('click',greetBeforeOpen,true);
  document.getElementById('openAiBtn')?.addEventListener('click',greetBeforeOpen,true);

  // Make identity questions answer as Sami while preserving every other assistant feature.
  const base=window.ShishirKnowledge;
  if(base?.answer){
    const previous=base.answer.bind(base);
    base.answer=function(q){
      const s=q.toLowerCase().replace(/[^a-z0-9'\s]/g,' ').replace(/\s+/g,' ').trim();
      if(/^(who are you|what are you|what is your name|what's your name|whats your name|your name|who is sami|are you sami)$/.test(s)){
        return "I'm Sami, Shishir's portfolio assistant. I can chat with you, answer questions about Shishir, help with common computer problems, tell jokes, check weather and local time, do calculations, and help prepare an email.";
      }
      if(/^(hi sami|hello sami|hey sami|sami)$/.test(s)){
        return "Hi! Yep, that's me — Sami. Nice to see you. How can I help?";
      }
      return previous(q);
    };
  }
})();

// Cyber robot interaction effects: click sound + loading/run animation.
(()=>{
  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const style=document.createElement('style');
  style.textContent=`
    .robot-loader{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;pointer-events:none;opacity:0;visibility:hidden;background:radial-gradient(circle at center,rgba(8,28,24,.82),rgba(2,7,11,.96) 65%);backdrop-filter:blur(5px);transition:opacity .16s ease,visibility .16s ease}
    .robot-loader.active{opacity:1;visibility:visible}
    .robot-stage{position:relative;width:min(92vw,560px);height:320px;perspective:800px;overflow:hidden}
    .robot-grid{position:absolute;left:-15%;right:-15%;bottom:-55px;height:190px;background:linear-gradient(rgba(65,255,154,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(65,255,154,.16) 1px,transparent 1px);background-size:34px 34px;transform:rotateX(66deg);transform-origin:center top;filter:drop-shadow(0 0 7px rgba(65,255,154,.2))}
    .cyber-robot{--rx:0px;--ry:0px;position:absolute;left:50%;top:50%;width:118px;height:176px;transform:translate(-50%,-48%) scale(.72);filter:drop-shadow(0 0 15px rgba(65,255,154,.36));transition:transform .15s ease}
    .robot-loader.active .cyber-robot{animation:robotRunForward .78s cubic-bezier(.2,.75,.24,1) both}
    .robot-head{position:absolute;left:23px;top:0;width:72px;height:58px;border:2px solid #41ff9a;border-radius:18px 18px 14px 14px;background:linear-gradient(180deg,#102722,#07120f);box-shadow:inset 0 0 16px rgba(65,255,154,.11),0 0 14px rgba(65,255,154,.24)}
    .robot-antenna{position:absolute;left:35px;top:-20px;width:2px;height:20px;background:#41ff9a;box-shadow:0 0 8px #41ff9a}.robot-antenna:after{content:'';position:absolute;left:-4px;top:-5px;width:10px;height:10px;border-radius:50%;background:#41ff9a;box-shadow:0 0 10px #41ff9a}
    .robot-face{position:absolute;inset:12px 10px;border-radius:9px;background:#02090a;border:1px solid rgba(93,232,255,.4);display:flex;align-items:center;justify-content:space-around;overflow:hidden}
    .robot-eye{width:15px;height:10px;border-radius:50%;background:#5de8ff;box-shadow:0 0 10px #5de8ff;transform:translate(var(--rx),var(--ry));transition:transform .08s linear}
    .robot-body{position:absolute;left:25px;top:66px;width:68px;height:74px;border:2px solid #41ff9a;border-radius:14px;background:linear-gradient(145deg,#10251f,#06100d);box-shadow:inset 0 0 14px rgba(65,255,154,.12)}
    .robot-core{position:absolute;left:24px;top:20px;width:20px;height:20px;border-radius:50%;border:2px solid #5de8ff;box-shadow:0 0 14px #5de8ff,inset 0 0 8px #5de8ff;animation:robotCorePulse .55s ease-in-out infinite alternate}
    .robot-arm,.robot-leg{position:absolute;border:2px solid #41ff9a;background:#081712;border-radius:10px;transform-origin:top center}
    .robot-arm{top:73px;width:16px;height:65px}.robot-arm.left{left:6px}.robot-arm.right{right:6px}
    .robot-leg{top:134px;width:18px;height:58px}.robot-leg.left{left:30px}.robot-leg.right{right:30px}
    .robot-loader.active .robot-arm.left,.robot-loader.active .robot-leg.right{animation:robotLimbA .25s ease-in-out infinite alternate}
    .robot-loader.active .robot-arm.right,.robot-loader.active .robot-leg.left{animation:robotLimbB .25s ease-in-out infinite alternate}
    .robot-status{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);font:600 12px/1.4 'JetBrains Mono',monospace;letter-spacing:.18em;color:#41ff9a;text-align:center;text-shadow:0 0 12px rgba(65,255,154,.55);white-space:nowrap}
    .robot-status:after{content:'...';animation:robotDots .8s steps(4,end) infinite}
    @keyframes robotRunForward{0%{transform:translate(-50%,-48%) scale(.48)}35%{transform:translate(-50%,-47%) scale(.8)}75%{transform:translate(-50%,-43%) scale(1.22)}100%{transform:translate(-50%,-37%) scale(1.72)}}
    @keyframes robotLimbA{from{transform:rotate(23deg)}to{transform:rotate(-23deg)}}
    @keyframes robotLimbB{from{transform:rotate(-23deg)}to{transform:rotate(23deg)}}
    @keyframes robotCorePulse{from{opacity:.55;transform:scale(.86)}to{opacity:1;transform:scale(1.08)}}
    @keyframes robotDots{0%{opacity:.2}100%{opacity:1}}
    @media (max-width:520px){.robot-stage{height:280px}.robot-status{font-size:10px}.cyber-robot{transform:translate(-50%,-48%) scale(.64)}}
    @media (prefers-reduced-motion:reduce){.robot-loader,.cyber-robot,.robot-arm,.robot-leg,.robot-core{animation:none!important;transition:none!important}.robot-loader.active .cyber-robot{transform:translate(-50%,-48%) scale(.85)}}
  `;
  document.head.appendChild(style);

  const loader=document.createElement('div');
  loader.className='robot-loader';
  loader.setAttribute('aria-hidden','true');
  loader.innerHTML=`<div class="robot-stage"><div class="robot-grid"></div><div class="cyber-robot"><div class="robot-head"><div class="robot-antenna"></div><div class="robot-face"><span class="robot-eye"></span><span class="robot-eye"></span></div></div><div class="robot-body"><div class="robot-core"></div></div><div class="robot-arm left"></div><div class="robot-arm right"></div><div class="robot-leg left"></div><div class="robot-leg right"></div></div><div class="robot-status">SAMI // ACCESSING</div></div>`;
  document.body.appendChild(loader);

  let audioCtx=null;
  function robotClick(){
    try{
      audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended')audioCtx.resume();
      const now=audioCtx.currentTime;
      const osc=audioCtx.createOscillator();
      const gain=audioCtx.createGain();
      osc.type='square';
      osc.frequency.setValueAtTime(520,now);
      osc.frequency.exponentialRampToValueAtTime(190,now+.055);
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(.045,now+.005);
      gain.gain.exponentialRampToValueAtTime(.0001,now+.07);
      osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+.075);
    }catch{}
  }

  let hideTimer;
  function showRobot(duration=760,label='SAMI // ACCESSING'){
    const status=loader.querySelector('.robot-status');
    if(status)status.firstChild ? status.firstChild.textContent=label : status.textContent=label;
    clearTimeout(hideTimer);
    loader.classList.remove('active');
    void loader.offsetWidth;
    loader.classList.add('active');
    hideTimer=setTimeout(()=>loader.classList.remove('active'),reduceMotion?260:duration);
  }

  document.addEventListener('pointermove',e=>{
    if(reduceMotion)return;
    const rect=loader.getBoundingClientRect();
    const x=((e.clientX-rect.width/2)/(rect.width/2))*3.2;
    const y=((e.clientY-rect.height/2)/(rect.height/2))*2.4;
    loader.style.setProperty('--rx',`${Math.max(-3.2,Math.min(3.2,x))}px`);
    loader.style.setProperty('--ry',`${Math.max(-2.4,Math.min(2.4,y))}px`);
  },{passive:true});

  // A short robotic sound for every user click/tap.
  document.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    robotClick();
  },{passive:true,capture:true});

  // Show the robot when navigating around the one-page portfolio.
  document.addEventListener('click',e=>{
    const anchor=e.target.closest?.('a[href^="#"]');
    if(anchor)showRobot(650,'SAMI // LOADING SECTION');
  },true);

  // Show on first page load, so visitors immediately see the AI robot come alive.
  if(document.readyState==='complete')setTimeout(()=>showRobot(820,'SAMI // SYSTEM ONLINE'),90);
  else window.addEventListener('load',()=>setTimeout(()=>showRobot(820,'SAMI // SYSTEM ONLINE'),90),{once:true});
})();