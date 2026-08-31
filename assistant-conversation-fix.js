// Handles short human-style replies that should never fall into the portfolio fallback.
(()=>{
  const base=window.ShishirKnowledge;
  if(!base)return;
  const previous=base.answer.bind(base);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const clean=s=>s.toLowerCase().replace(/[^a-z0-9'\s]/g,' ').replace(/\s+/g,' ').trim();

  const natural=[
    [/^(good|good you|good and you|good how about you|i'm good you|im good you|i am good you|doing good you|doing well you)$/,["I'm good too, thanks for asking! By the way, what should I call you?","Doing well too, thank you! What's your name?","I'm doing great too. And before we keep chatting, what should I call you?"]],
    [/^(and you|you|you too|what about you|how about you|what about yourself|how about yourself)$/,["I'm doing well, thanks for asking! By the way, what should I call you?","I'm good too! What's your name?","I'm doing nicely, thank you. What should I call you?"]],
    [/^(fine|fine you|fine and you|i'm fine you|im fine you)$/,["I'm good too, thanks! What should I call you?","Glad you're fine. I'm doing well too. What's your name?","Nice to hear. I'm good as well — what should I call you?"]],
    [/^(great|great you|great and you|awesome you|not bad you|pretty good you)$/,["I'm doing well too, thank you! What's your name?","Nice! I'm good too. What should I call you?","Glad to hear it. I'm doing great as well — what should I call you?"]],
    [/^(how about u|what about u|and u|u|good u)$/,["I'm good too, thanks! What should I call you?","Doing well! And what's your name?","I'm doing great. What should I call you?"]]
  ];

  base.answer=function(q){
    const s=clean(q);
    for(const [re,replies] of natural){
      if(re.test(s)){
        const reply=pick(replies);
        if(base.smart?.state){
          base.smart.state.turns++;
          base.smart.state.lastUser=q;
          base.smart.state.askedName=true;
          base.smart.state.lastReply=reply;
        }
        return reply;
      }
    }
    return previous(q);
  };
})();