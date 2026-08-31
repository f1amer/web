// Stops current speech when a visitor sends a new message and handles obvious gibberish locally.
(() => {
  const form=document.getElementById('aiForm');
  const input=document.getElementById('aiInput');
  if(!form||!input)return;

  const knownShort=new Set(['hi','hey','yo','yes','no','ok','okay','why','how','who','what','when','where','bye','thanks','help','joke','wifi','ram','cpu','dns','vpn','usb','ssd','pc','ai']);
  const vowels=/[aeiouy]/i;
  const commonWords=new Set(['the','and','this','that','with','from','have','what','when','where','which','your','you','are','can','could','would','should','please','computer','laptop','windows','wifi','internet','printer','browser','email','help','shishir','rangeforce','certificate','weather','hello','thanks','thank','good','bad','slow','error','screen','sound','mouse','keyboard','battery','update','driver','file','website','joke']);

  function looksLikeGibberish(text){
    const s=text.toLowerCase().trim();
    if(!s||knownShort.has(s))return false;
    if(/[0-9]/.test(s)&&/[+\-*/=]/.test(s))return false;
    const words=s.replace(/[^a-z\s'-]/g,' ').split(/\s+/).filter(Boolean);
    if(!words.length)return false;
    if(words.some(w=>commonWords.has(w)))return false;
    const suspicious=words.filter(w=>{
      if(w.length<5)return false;
      const noVowel=!vowels.test(w);
      const consonantRun=/[bcdfghjklmnpqrstvwxz]{5,}/i.test(w);
      const repeated=/([a-z])\1{3,}/i.test(w);
      const weirdRatio=(w.match(/[aeiouy]/gi)||[]).length/Math.max(w.length,1)<0.12;
      return noVowel||consonantRun||repeated||weirdRatio;
    });
    return suspicious.length===words.length && suspicious.length>0;
  }

  form.addEventListener('submit',e=>{
    if('speechSynthesis'in window)speechSynthesis.cancel();
    const q=input.value.trim();
    if(!looksLikeGibberish(q))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    input.value='';
    if(typeof addMessage==='function')addMessage(q,'user');
    const safe=q.slice(0,60).replace(/[<>]/g,'');
    const replies=[
      `I'm not sure what “${safe}” means. Could you rephrase that for me?`,
      `Hmm, I don't recognize “${safe}”. Maybe try typing it again in a different way?`,
      `I may have missed that one. What did you mean by “${safe}”?`,
      `That looks like a random word to me. Could you tell me what you meant by “${safe}”?`
    ];
    const reply=replies[Math.floor(Math.random()*replies.length)];
    if(typeof addMessage==='function')addMessage(reply,'bot',true);
    if(typeof speakText==='function')speakText(reply);
  },true);
})();