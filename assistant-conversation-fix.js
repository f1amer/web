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
    [/^(how about u|what about u|and u|u|good u)$/,["I'm good too, thanks! What should I call you?","Doing well! And what's your name?","I'm doing great. What should I call you?"]],
    [/^(so|so then|then|then what|what next|and then|okay then|ok then)$/,["So, what would you like to talk about next?","I'm with you. What are you thinking about?","Go on — I'm listening.","Alright, where do you want to go from here?"]],
    [/^(hmm|hmmm|hm|uhm|umm|um)$/,["Hmm indeed. What's on your mind?","Take your time — I'm listening.","Thinking about something? Tell me."]],
    [/^(oh|oh okay|oh ok|ah|aha)$/,["Yep. Want to keep going?","Exactly. What are you thinking now?","Yep, that's it."]],
    [/^(right|right then|alright then|fair enough)$/,["Yep, exactly. What's next?","Right. Want to ask me something else?","Sounds good. I'm ready for the next one."]],
    [/^(anyway|anyways)$/,["Anyway — what do you want to talk about now?","Sure, let's switch gears. What's next?","Alright, new topic. What are you thinking about?"]],
    [/^(go on|continue|keep going)$/,["Sure. What part do you want me to continue with?","Absolutely. I'm listening.","Go ahead — let's keep going."]],
    [/^(really|seriously|for real)$/,["Yep, really.","Seriously.","For real."]],
    [/^(maybe|maybe later|not sure|i don't know|idk)$/,["That's okay. We can just chat for a bit.","No problem. Want me to suggest something?","Fair enough. We can keep it casual."]]
  ];

  base.answer=function(q){
    const s=clean(q);
    for(const [re,replies] of natural){
      if(re.test(s)){
        const reply=pick(replies);
        if(base.smart?.state){
          base.smart.state.turns++;
          base.smart.state.lastUser=q;
          if(/what should i call you|what's your name/i.test(reply))base.smart.state.askedName=true;
          base.smart.state.lastReply=reply;
        }
        return reply;
      }
    }
    return previous(q);
  };
})();