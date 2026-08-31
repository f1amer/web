const menuToggle=document.getElementById('menuToggle');
const navMenu=document.getElementById('navMenu');
menuToggle?.addEventListener('click',()=>navMenu?.classList.toggle('open'));
document.querySelectorAll('#navMenu a').forEach(a=>a.addEventListener('click',()=>navMenu?.classList.remove('open')));
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();

// Matrix background
const canvas=document.getElementById('matrixCanvas');
if(canvas){const ctx=canvas.getContext('2d');let width,height,drops=[];const resize=()=>{width=canvas.width=innerWidth;height=canvas.height=innerHeight;drops=Array(Math.floor(width/18)).fill(1)};const draw=()=>{ctx.fillStyle='rgba(2,7,11,.07)';ctx.fillRect(0,0,width,height);ctx.fillStyle='#41ff9a';ctx.font='13px JetBrains Mono';const chars='01ABCDEF$#<>/[]{}';drops.forEach((d,i)=>{ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*18,d*18);if(d*18>height&&Math.random()>.985)drops[i]=0;drops[i]++})};resize();addEventListener('resize',resize);setInterval(draw,70)}

const aiPanel=document.getElementById('aiPanel');
const aiFab=document.getElementById('aiFab');
const openAiBtn=document.getElementById('openAiBtn');
const closeAiBtn=document.getElementById('closeAiBtn');
const aiForm=document.getElementById('aiForm');
const aiInput=document.getElementById('aiInput');
const aiMessages=document.getElementById('aiMessages');
const assistantGreeting="Hi, I'm Shishir's chat assistant. It's lovely to meet you. You can chat with me normally, ask about Shishir, ask for a joke, get help with common computer problems, check the weather, do a calculation, or prepare an email to him. How are you today?";
let hasGreeted=false,preferredVoice=null;

function loadPreferredVoice(){
 if(!('speechSynthesis'in window))return;
 const voices=speechSynthesis.getVoices();if(!voices.length)return;
 const smooth=['Microsoft Ava','Microsoft Emma','Microsoft Jenny','Samantha','Karen','Sonia','Aria','Jenny','Google UK English Female','Google US English','Moira','Tessa','Victoria','Zira'];
 preferredVoice=voices.find(v=>smooth.some(n=>v.name.toLowerCase().includes(n.toLowerCase())))||voices.find(v=>/^en-AU/i.test(v.lang))||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en-US/i.test(v.lang))||voices[0];
}
if('speechSynthesis'in window){loadPreferredVoice();speechSynthesis.onvoiceschanged=loadPreferredVoice}
function speakText(text){if(!('speechSynthesis'in window))return;loadPreferredVoice();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);if(preferredVoice)u.voice=preferredVoice;u.lang=preferredVoice?.lang||'en-AU';u.rate=.92;u.pitch=1.0;u.volume=1;speechSynthesis.speak(u)}
function openAI(){aiPanel?.classList.add('open');if(!hasGreeted){hasGreeted=true;speakText(assistantGreeting)}aiInput?.focus()}
function closeAI(){aiPanel?.classList.remove('open');if('speechSynthesis'in window)speechSynthesis.cancel()}
aiFab?.addEventListener('click',openAI);openAiBtn?.addEventListener('click',openAI);closeAiBtn?.addEventListener('click',closeAI);

function addMessage(text,type,withVoice=false){const wrap=document.createElement('div');wrap.className=`message ${type}`;const d=document.createElement('div');d.textContent=text;wrap.appendChild(d);if(withVoice&&'speechSynthesis'in window){const b=document.createElement('button');b.type='button';b.textContent='🔊 Speak';Object.assign(b.style,{marginTop:'8px',border:'1px solid rgba(65,255,154,.25)',background:'transparent',color:'#41ff9a',borderRadius:'999px',padding:'5px 9px',cursor:'pointer',fontSize:'.7rem'});b.onclick=()=>speakText(text);wrap.appendChild(b)}aiMessages?.appendChild(wrap);if(aiMessages)aiMessages.scrollTop=aiMessages.scrollHeight;return wrap}
function addActionButton(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;Object.assign(b.style,{alignSelf:'flex-start',border:'1px solid rgba(65,255,154,.35)',background:'#071914',color:'#41ff9a',borderRadius:'999px',padding:'8px 11px',cursor:'pointer',fontSize:'.72rem'});b.onclick=action;aiMessages?.appendChild(b);if(aiMessages)aiMessages.scrollTop=aiMessages.scrollHeight}

const A={
 profile:"Shishir Bhattarai is an Adelaide-based cybersecurity-focused IT professional with a First-Class Honours degree in Computing and postgraduate study in Information Technology with a Security Management focus. His interests include defensive security, SOC operations, IT support and networking.",
 skills:"Shishir's cybersecurity skill set includes Wazuh, Windows event analysis, SIEM and SOAR fundamentals, Nmap, endpoint protection, Active Directory security, network-security concepts, vulnerability analysis, cyber risk, NIST CSF, ISO 27001 and ISO 31000 exposure.",
 rangeforce:"Shishir completed a RangeForce Certificate of Continuing Education with 132 modules and 47 hours 30 minutes of study, covering topics such as Splunk, Active Directory, Windows event logs, Linux, Nmap, Wazuh, SIEM and SOAR, MITRE ATT&CK, NIST CSF and endpoint protection.",
 certifications:"Shishir's portfolio includes a RangeForce Certificate of Continuing Education, a verified HackerRank SQL Basic certificate and Google Digital Garage learning.",
 projects:"His portfolio includes Windows security-event analysis, Wazuh and SIEM-oriented exercises, Nmap enumeration, vulnerability walkthroughs including Log4Shell, Heartbleed, Shellshock and Zerologon, plus cyber-risk and governance analysis.",
 education:"Shishir holds a BSc Honours in Computing from Leeds Beckett University with First-Class Honours and has postgraduate study in Information Technology with a Security Management focus in Australia.",
 roles:"Shishir is targeting cybersecurity, junior SOC analyst, security operations, IT support, service desk and networking-oriented opportunities.",
 whyhire:"Shishir combines a strong computing foundation, hands-on cybersecurity labs, security-framework knowledge, technical teaching experience and clear communication. He is well suited to junior roles where learning ability, troubleshooting and security awareness matter.",
 contact:"You can contact Shishir through Email, LinkedIn or GitHub. To prepare an email here, type: email Shishir: followed by your message.",
 fallback:"I get what you're asking. I'm mainly Shishir's portfolio assistant, so I don't know everything yet. I can still chat with you, tell jokes, tell you about Shishir, help with many common computer problems, do basic calculations, check weather by city, and help prepare an email. For anything else, Shishir will be the best person to ask."
};

function normalChat(q){const s=q.toLowerCase().trim();const clean=s.replace(/[^a-z0-9\s']/g,'').trim();
 if(/^(hi|hello|hey|hiya|yo|good morning|good afternoon|good evening)$/.test(clean))return"Hi! Nice to meet you. How are you doing today?";
 if(s.includes('how are you')||s.includes('how r u')||s.includes('howre you'))return"I'm doing well, thanks for asking. I'm here keeping Shishir's portfolio company and helping visitors. How are you?";
 if(/^(not good|bad|not great|terrible|awful|not well|could be better)$/.test(clean)||s.includes("i'm not good")||s.includes('im not good'))return"I'm sorry to hear that. I hope things get a little easier for you. If you want, we can keep things light and chat for a moment, or I can help you find what you need here.";
 if(s.includes("i'm tired")||s.includes('im tired')||s.includes('very tired'))return"That sounds exhausting. I hope you get a proper chance to rest soon. Want to keep this simple and just chat, or are you looking for something specific?";
 if(s.includes("i'm stressed")||s.includes('im stressed')||s.includes('stressed out'))return"That sounds like a lot to carry. I can keep things easy here — we can chat, or I can help with something simple.";
 if(s.includes("i'm sad")||s.includes('im sad')||s.includes('feeling sad'))return"I'm sorry you're having a rough moment. I can stay here and chat with you for a bit if you'd like.";
 if(s.includes('i am good')||s.includes("i'm good")||s.includes('im good')||s.includes('doing good')||s.includes('doing well')||s.includes("i'm fine")||s.includes('im fine'))return"Glad to hear it! What brings you to Shishir's portfolio today?";
 if(s.includes('what are you doing')||s.includes('what r u doing'))return"Just hanging out here, helping visitors learn about Shishir and answering whatever I can.";
 if(s.includes('tell me something'))return"Here's a quick one: Shishir completed 132 RangeForce cybersecurity modules. That's one of the strongest hands-on learning highlights in this portfolio.";
 if(s.includes('you are funny')||s.includes("you're funny")||s.includes('ur funny'))return"I'll take that as a compliment! I try not to be too serious all the time.";
 if(s.includes('do you like shishir'))return"I may be his portfolio assistant, so I'm probably a little biased — but I can definitely say he has given me plenty to talk about!";
 if(s.includes('thank you')||s.includes('thanks')||s==='thx')return"You're very welcome! Happy to help.";
 if(s.includes('nice to meet you'))return"Nice to meet you too! I'm glad you stopped by.";
 if(s.includes('who are you')||s.includes('what are you'))return"I'm Shishir's portfolio chat assistant. I can chat normally, answer questions about his background, tell jokes, troubleshoot common computer problems, do basic calculations, check current weather and help prepare an email.";
 if(s.includes('good night'))return"Good night! Thanks for stopping by, and I hope you have a peaceful night.";
 if(/\b(bye|goodbye|see you|see ya)\b/.test(s))return"Goodbye! Thanks for visiting Shishir's portfolio. It was nice chatting with you. Have a great day, and feel free to come back anytime.";
 if(s.includes('what can you do')||s.includes('what do you know'))return"I can chat normally, tell jokes, tell you about Shishir's cybersecurity background, show his certifications, troubleshoot many common computer problems, do basic calculations, check current weather by city, and help prepare an email.";
 return null}

function portfolioAnswer(q){const s=q.toLowerCase();if(s.includes('rangeforce')||s.includes('132')||s.includes('47 hour'))return A.rangeforce;if(s.includes('certificate')||s.includes('certification')||s.includes('hackerrank')||s.includes('sql'))return A.certifications;if(s.includes('project')||s.includes('lab')||s.includes('vulnerability')||s.includes('log4shell')||s.includes('heartbleed'))return A.projects;if(s.includes('education')||s.includes('degree')||s.includes('university')||s.includes('study'))return A.education;if(s.includes('role')||s.includes('job')||s.includes('looking for')||s.includes('target'))return A.roles;if(s.includes('why hire')||s.includes('suitable')||s.includes('good candidate')||s.includes('hire shishir'))return A.whyhire;if(s.includes('contact')||s.includes('email')||s.includes('linkedin')||s.includes('github'))return A.contact;if(s.includes('skill')||s.includes('cyber')||s.includes('security')||s.includes('soc')||s.includes('siem')||s.includes('wazuh')||s.includes('nmap'))return A.skills;if(s.includes('who is shishir')||s.includes('about shishir')||s.includes('profile'))return A.profile;return A.fallback}

function tryCalculation(question){let expr=question.toLowerCase().replace(/what is|calculate|calc|please|equals|=/g,'').replace(/[x×]/g,'*').replace(/÷/g,'/').replace(/\^/g,'**').trim();if(!expr||!/[0-9]/.test(expr)||!/^[0-9+\-*/().%\s*]+$/.test(expr))return null;try{const r=Function(`"use strict";return (${expr})`)();if(typeof r!=='number'||!Number.isFinite(r))return null;return`The answer is ${Number.isInteger(r)?r:Number(r.toFixed(8))}.`}catch{return null}}
function weatherDescription(c){if(c===0)return'clear skies';if([1,2,3].includes(c))return'partly cloudy conditions';if([45,48].includes(c))return'foggy conditions';if([51,53,55,56,57].includes(c))return'drizzle';if([61,63,65,66,67,80,81,82].includes(c))return'rain';if([71,73,75,77,85,86].includes(c))return'snow';if([95,96,99].includes(c))return'thunderstorms';return'mixed weather conditions'}
async function getWeatherAnswer(question){const lower=question.toLowerCase();if(!lower.includes('weather')&&!lower.includes('temperature'))return null;let city='';const m=question.match(/(?:weather|temperature)(?:\s+(?:today|now|right now))?\s+(?:in|at|for)\s+([a-zA-Z .'-]+)/i);if(m)city=m[1].trim();if(!city){const m2=question.match(/(?:weather|temperature)\s+([a-zA-Z .'-]{2,})/i);if(m2)city=m2[1].replace(/today|now|right now/gi,'').trim()}if(!city)return"Sure — tell me the city, for example: weather in Adelaide.";try{const g=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);const gd=await g.json();const p=gd.results?.[0];if(!p)return`I couldn't find ${city}. Try the city name again.`;const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);const d=await w.json(),c=d.current;return`Right now in ${p.name}${p.country?', '+p.country:''}, it's ${Math.round(c.temperature_2m)} degrees Celsius with ${weatherDescription(c.weather_code)}. It feels like ${Math.round(c.apparent_temperature)} degrees, with wind around ${Math.round(c.wind_speed_10m)} kilometres per hour.`}catch{return"I couldn't get the live weather just now. Please try again in a moment."}}
function handleSecureEmail(question){const m=question.match(/^(?:email shishir|send(?: an)? email(?: to shishir)?|message shishir)\s*:\s*(.+)$/i);if(!m)return false;const msg=m[1].trim().replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s{3,}/g,' ').slice(0,1500);const reply="I've prepared the message securely. I don't send mail silently or store your details. Click the button below and your own email app will open with the message ready to send.";addMessage(reply,'bot',true);speakText(reply);const mailto=`mailto:shishirbhattarai033@gmail.com?subject=${encodeURIComponent('Portfolio enquiry for Shishir Bhattarai')}&body=${encodeURIComponent(msg)}`;addActionButton('✉️ Open secure email',()=>location.href=mailto);return true}

function handleResumeRequest(question){const s=question.toLowerCase();if(!/\b(resume|cv|curriculum vitae)\b/.test(s))return false;const reply="Shishir's resume is not available for download through this portfolio assistant. I can show you his portfolio information, certifications, education, skills and projects instead.";addMessage(reply,'bot',true);speakText(reply);return true}

function handleCertificationRequest(question){const s=question.toLowerCase();if(!/(show|open|view|see|give me|display).*(certificate|certification)|(?:certificate|certification).*(show|open|view|see)/.test(s))return false;const reply="Sure. I can show you Shishir's certification and credential links here. Choose one below.";addMessage(reply,'bot',true);speakText(reply);addActionButton('📄 View RangeForce Certificate',()=>window.open('assets/img/713175ae-f629-4195-a662-cfc9d42f8876.pdf','_blank','noopener'));addActionButton('✅ Verify HackerRank SQL',()=>window.open('https://www.hackerrank.com/certificates/c1eb038ff2f8','_blank','noopener'));return true}

async function askPortfolioAssistant(question){
 if(!question.trim())return;
 addMessage(question,'user');
 if(handleResumeRequest(question))return;
 if(handleCertificationRequest(question))return;
 if(handleSecureEmail(question))return;
 const weather=await getWeatherAnswer(question);
 if(weather){addMessage(weather,'bot',true);speakText(weather);return}
 const calc=tryCalculation(question);
 if(calc){addMessage(calc,'bot',true);speakText(calc);return}
 const knowledge=window.ShishirKnowledge?.answer?.(question);
 if(knowledge){addMessage(knowledge,'bot',true);speakText(knowledge);return}
 const chat=normalChat(question);
 const reply=chat||portfolioAnswer(question);
 addMessage(reply,'bot',true);speakText(reply);
}
aiForm?.addEventListener('submit',e=>{e.preventDefault();const q=aiInput?.value.trim();if(!q)return;aiInput.value='';askPortfolioAssistant(q)});
document.querySelectorAll('.suggestions button').forEach(b=>b.addEventListener('click',()=>askPortfolioAssistant(b.dataset.question||'')));
