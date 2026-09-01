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