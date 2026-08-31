// Smarter local conversation layer: typo tolerance, context, follow-ups and richer small talk.
(()=>{
  const base=window.ShishirKnowledge;
  if(!base)return;
  const oldAnswer=base.answer.bind(base);
  const norm=s=>s.toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim();
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const state={lastTopic:null,lastUser:null,lastReply:null,turns:0};

  const typoMap={
    'helo':'hello','helllo':'hello','hii':'hi','hiii':'hi','hy':'hey','wht':'what','whta':'what','wat':'what','whats':'what is','whr':'where','wer':'where','hw':'how','hwo':'how','cn':'can','plz':'please','pls':'please','thnks':'thanks','tahnks':'thanks','wifi':'wifi','wi fi':'wifi','internat':'internet','interent':'internet','intrnet':'internet','lptop':'laptop','lapotp':'laptop','laptopo':'laptop','compter':'computer','computr':'computer','windwos':'windows','widnows':'windows','prnter':'printer','pritner':'printer','keybord':'keyboard','kyboard':'keyboard','mose':'mouse','bluetooh':'bluetooth','blutooth':'bluetooth','scren':'screen','moniter':'monitor','battrery':'battery','batery':'battery','updae':'update','udpate':'update','drver':'driver','diver':'driver','pasword':'password','passwrod':'password','certifcate':'certificate','certficate':'certificate','rangforce':'rangeforce','rangefroce':'rangeforce','shisir':'shishir','shishr':'shishir','projet':'project','porject':'project','educaton':'education','eduction':'education','securty':'security','cybersecurty':'cybersecurity','jok':'joke','jokee':'joke','funy':'funny','funni':'funny'};

  function correct(s){
    let out=' '+norm(s)+' ';
    Object.entries(typoMap).forEach(([a,b])=>{out=out.replace(new RegExp(`\\b${a.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`,'g'),b)});
    return out.trim();
  }

  const chat=[
    [/(how was your day|how's your day|hows your day)/,["Pretty good so far. I've mostly been answering questions and trying not to crash.","Not bad at all. A quiet day in the browser is a good day.","Going well. I'm ready for whatever you throw at me next."]],
    [/(what do you like|what are your interests)/,["I’m built around computers, cybersecurity, troubleshooting and Shishir’s portfolio, so those are definitely my favourite topics.","Tech, security, solving problems, and the occasional terrible joke.","Anything that involves figuring out why a computer is misbehaving gets my attention."]],
    [/(do you like me|what do you think of me)/,["You seem nice to chat with. I only know you from what you type here, though.","So far, you're keeping the conversation interesting.","I don't know you personally, but I’m enjoying the chat."]],
    [/(are you happy|are you sad|do you have feelings)/,["I don't have feelings like a person does, but I can still respond in a warm and natural way.","I don't experience emotions, but I can understand the tone of what you say and respond appropriately.","No real emotions here, but I can definitely keep the conversation friendly."]],
    [/(what should we talk about|what can we talk about)/,["We can talk about everyday stuff, computers, cybersecurity, Shishir’s portfolio, or I can tell you a joke.","Your choice: casual chat, tech help, cyber topics, or something about Shishir.","Anything within my knowledge works. If you want, start with what you're doing today."]],
    [/(i'm hungry|im hungry|hungry)/,["That sounds like a good reason to get something to eat. What are you in the mood for?","Food break sounds justified. Sweet, spicy, or something proper?","Your body is sending a pretty clear notification there."]],
    [/(i'm sleepy|im sleepy|sleepy)/,["Sounds like your system is asking for sleep mode.","You might be due for a recharge.","That's your human battery warning, I think."]],
    [/(i'm working|im working|at work)/,["Hope work is treating you well. Busy day?","Nice. What are you working on?","Good luck with it. If it's technical, I may be able to help."]],
    [/(i'm studying|im studying|studying)/,["Good luck with the study session. What subject are you working on?","Nice. If it's IT or cybersecurity, ask me anything you get stuck on.","Study mode activated. What topic are you on?"]],
    [/(i'm at home|im at home)/,["Nice. Hopefully you get a bit of time to relax.","Home mode. Are you relaxing or still working on something?","Sounds comfortable. What are you up to there?"]],
    [/(i'm bored|im bored)/,["I can fix that. Want a joke, a weird tech fact, or a quick cybersecurity question?","Let's make the boredom useful. Pick: joke, computer tip, or random chat.","Boredom detected. I recommend one bad joke immediately."]],
    [/(sorry|my bad|apologies)/,["No problem at all.","You're all good.","No worries. We can keep going."]],
    [/(really|seriously|for real)/,["Yep.","Seriously.","Absolutely."]],
    [/(okay|ok|alright|got it|i see)/,["Yep, exactly.","Perfect.","Sounds good.","You got it."]],
    [/(yes|yeah|yep|sure)/,["Alright, let's do it.","Great.","Perfect, go ahead."]],
    [/(no|nope|nah)/,["No problem.","Fair enough.","All good."]],
    [/(wow|nice|cool|awesome|great)/,["Glad you like it!","Nice, right?","Happy that worked for you."]],
    [/(lol|haha|hahaha|lmao)/,["Glad I got a laugh out of you.","I'll count that as a successful joke.","Nice, my comedy module survived another test."]],
    [/(what are you thinking|what do you think)/,["Mostly trying to understand what you mean and give you the most useful answer I can.","Right now, I'm thinking about your last message.","I'm working out the best response from the knowledge built into me."]],
    [/(can you talk|can you speak|do you speak)/,["Yes. If your browser allows speech, I can read my replies aloud.","I can speak my replies using the voices available on your device.","Yep. My voice comes from your browser's built-in speech system."]],
    [/(why are you here|what is your purpose)/,["I'm here to make Shishir’s portfolio more useful: answer questions, chat naturally, and help with common computer problems.","My job is to guide visitors around the portfolio and help with practical tech questions.","I’m basically the interactive help desk for this website."]]
  ];

  const topicReplies={
    skills:["Want me to break his skills into cybersecurity, networking, and IT support?","I can also tell you which of his skills best match a junior SOC or IT support role."],
    projects:["Want a quick summary of his strongest cybersecurity project examples?","I can explain one of his projects in more detail if you want."],
    education:["I can also tell you about his First-Class Honours degree or postgraduate security study.","Want the short version of his education or the full one?"],
    certifications:["I can show the RangeForce certificate or the publicly verifiable HackerRank SQL credential.","Want me to open one of the certificate links?"],
    troubleshooting:["If that doesn't fix it, tell me what you see on screen and what changed before the problem started.","If you try those steps and it still fails, send me the exact error message."],
    jokes:["Want another one?","I have plenty more where that came from."]
  };

  function detectTopic(s,reply){
    if(/skill|cyber|soc|siem|wazuh|nmap/.test(s))return'skills';
    if(/project|lab|log4shell|heartbleed|shellshock/.test(s))return'projects';
    if(/education|degree|university|study/.test(s))return'education';
    if(/certificate|certification|rangeforce|hackerrank/.test(s))return'certifications';
    if(/joke|funny|laugh/.test(s))return'jokes';
    if(reply&&/(restart|task manager|driver|windows|router|device manager|troubleshoot|update)/i.test(reply))return'troubleshooting';
    return null;
  }

  function followUp(s){
    if(!state.lastTopic)return null;
    if(/^(why|how|what about|and|then|more|tell me more|explain|what else|anything else|another one|again|continue)[ ?!]*$/.test(s)||/^(why|how) (that|so|though)/.test(s)){
      const pool=topicReplies[state.lastTopic];
      if(pool)return pick(pool);
    }
    if(/^(more|tell me more|what else|anything else)/.test(s)){
      const pool=topicReplies[state.lastTopic];
      if(pool)return pick(pool);
    }
    return null;
  }

  function richerChat(q){
    const s=correct(q);
    const f=followUp(s); if(f)return f;
    for(const [re,arr] of chat)if(re.test(s))return pick(arr);
    return null;
  }

  const originalNormal=base.normalAnswer?.bind(base);
  const originalTrouble=base.troubleAnswer?.bind(base);
  const originalJoke=base.jokeAnswer?.bind(base);

  base.answer=function(q){
    state.turns++;
    state.lastUser=q;
    const corrected=correct(q);
    let reply=richerChat(corrected);
    if(!reply)reply=originalJoke?.(corrected)||null;
    if(!reply)reply=originalNormal?.(corrected)||null;
    if(!reply)reply=originalTrouble?.(corrected)||null;
    if(!reply)reply=oldAnswer(corrected);
    if(reply){state.lastTopic=detectTopic(corrected,reply)||state.lastTopic;state.lastReply=reply;}
    return reply;
  };

  base.smart={state,correct,richerChat};
})();