const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
document.querySelectorAll('#navMenu a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();

// Subtle matrix background
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
let width, height, columns, drops;
function resizeMatrix(){
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  columns = Math.floor(width / 18);
  drops = Array(columns).fill(1);
}
function drawMatrix(){
  ctx.fillStyle = 'rgba(2,7,11,0.07)';
  ctx.fillRect(0,0,width,height);
  ctx.fillStyle = '#41ff9a';
  ctx.font = '13px JetBrains Mono';
  const chars = '01ABCDEF$#<>/[]{}';
  for(let i=0;i<drops.length;i++){
    const text = chars[Math.floor(Math.random()*chars.length)];
    ctx.fillText(text,i*18,drops[i]*18);
    if(drops[i]*18 > height && Math.random() > 0.985) drops[i]=0;
    drops[i]++;
  }
}
resizeMatrix();
window.addEventListener('resize', resizeMatrix);
setInterval(drawMatrix, 70);

// Free local portfolio assistant — no paid AI API.
const aiPanel = document.getElementById('aiPanel');
const aiFab = document.getElementById('aiFab');
const openAiBtn = document.getElementById('openAiBtn');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiForm = document.getElementById('aiForm');
const aiInput = document.getElementById('aiInput');
const aiMessages = document.getElementById('aiMessages');

const assistantGreeting = "Hi, I'm Shishir's chat assistant. It's nice to meet you. You can chat with me normally, ask about Shishir, do a calculation, check the weather, or prepare a secure email to him. How can I help you today?";
let hasGreeted = false;
let preferredVoice = null;

function loadPreferredVoice(){
  if(!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if(!voices.length) return;
  const preferredNames = [
    'Samantha','Karen','Moira','Tessa','Victoria','Zira','Sonia','Aria','Jenny',
    'Microsoft Ava','Microsoft Emma','Microsoft Jenny','Google UK English Female','Google US English'
  ];
  preferredVoice = voices.find(v => preferredNames.some(name => v.name.toLowerCase().includes(name.toLowerCase())))
    || voices.find(v => /^en-AU/i.test(v.lang))
    || voices.find(v => /^en-GB/i.test(v.lang))
    || voices.find(v => /^en-US/i.test(v.lang))
    || voices[0];
}

if('speechSynthesis' in window){
  loadPreferredVoice();
  window.speechSynthesis.onvoiceschanged = loadPreferredVoice;
}

function speakText(text){
  if(!('speechSynthesis' in window)) return;
  loadPreferredVoice();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if(preferredVoice) utterance.voice = preferredVoice;
  utterance.lang = preferredVoice?.lang || 'en-AU';
  utterance.rate = 0.96;
  utterance.pitch = 1.02;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function openAI(){
  aiPanel.classList.add('open');
  if(!hasGreeted){
    hasGreeted = true;
    speakText(assistantGreeting);
  }
  aiInput.focus();
}
function closeAI(){
  aiPanel.classList.remove('open');
  if('speechSynthesis' in window) window.speechSynthesis.cancel();
}

aiFab.addEventListener('click', openAI);
openAiBtn.addEventListener('click', openAI);
closeAiBtn.addEventListener('click', closeAI);

function addMessage(text, type, withVoice = false){
  const wrap = document.createElement('div');
  wrap.className = `message ${type}`;
  const textNode = document.createElement('div');
  textNode.textContent = text;
  wrap.appendChild(textNode);

  if(withVoice && 'speechSynthesis' in window){
    const voiceBtn = document.createElement('button');
    voiceBtn.type = 'button';
    voiceBtn.textContent = '🔊 Speak';
    voiceBtn.style.marginTop = '8px';
    voiceBtn.style.border = '1px solid rgba(65,255,154,.25)';
    voiceBtn.style.background = 'transparent';
    voiceBtn.style.color = '#41ff9a';
    voiceBtn.style.borderRadius = '999px';
    voiceBtn.style.padding = '5px 9px';
    voiceBtn.style.cursor = 'pointer';
    voiceBtn.style.fontSize = '.7rem';
    voiceBtn.addEventListener('click', () => speakText(text));
    wrap.appendChild(voiceBtn);
  }

  aiMessages.appendChild(wrap);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return wrap;
}

function addActionButton(label, action){
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.style.alignSelf = 'flex-start';
  btn.style.border = '1px solid rgba(65,255,154,.35)';
  btn.style.background = '#071914';
  btn.style.color = '#41ff9a';
  btn.style.borderRadius = '999px';
  btn.style.padding = '8px 11px';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '.72rem';
  btn.addEventListener('click', action);
  aiMessages.appendChild(btn);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

const portfolioAnswers = {
  profile: "Shishir Bhattarai is an Adelaide-based cybersecurity-focused IT professional with a First-Class Honours degree in Computing and postgraduate study in Information Technology with a Security Management focus. His interests include defensive security, SOC operations, IT support and networking.",
  skills: "Shishir's cybersecurity skill set includes Wazuh, Windows event analysis, SIEM and SOAR fundamentals, Nmap, endpoint protection, Active Directory security, network-security concepts, vulnerability analysis, cyber risk, NIST CSF, ISO 27001 and ISO 31000 exposure.",
  rangeforce: "Shishir completed a RangeForce Certificate of Continuing Education with 132 modules and 47 hours 30 minutes of study. Topics include Splunk, Active Directory, Windows event logs, Linux, Nmap, Wazuh, SIEM and SOAR, MITRE ATT&CK, NIST CSF, endpoint protection and vulnerability-focused labs.",
  certifications: "Shishir's portfolio includes a RangeForce Certificate of Continuing Education and a verified HackerRank SQL Basic certificate, along with Google Digital Garage learning. The RangeForce certificate is available directly from the portfolio.",
  projects: "His cybersecurity portfolio includes Windows security-event analysis, Wazuh and SIEM-oriented exercises, Nmap enumeration, vulnerability walkthroughs such as Log4Shell, Heartbleed, Shellshock and Zerologon, plus cyber risk and governance analysis using recognised frameworks.",
  education: "Shishir holds a BSc Honours in Computing from Leeds Beckett University with First-Class Honours. He also has postgraduate study in Information Technology with a Security Management focus in Australia.",
  roles: "Shishir is targeting cybersecurity, junior SOC analyst, security operations, IT support, service desk and networking-oriented opportunities where he can build on his defensive-security training and technical background.",
  whyhire: "Shishir combines a strong computing foundation, hands-on cybersecurity labs, security-framework knowledge, technical teaching experience and clear communication. He would be particularly well suited to an entry-level or junior role where learning ability, troubleshooting and security awareness are important.",
  contact: "You can contact Shishir through Email, LinkedIn or GitHub. If you'd like to prepare an email here, just type: email Shishir: followed by your message.",
  fallback: "I totally understand what you're asking. I'm Shishir's portfolio chat assistant, so my knowledge is intentionally limited. I can have a normal conversation, answer questions about Shishir, do basic calculations, check current weather by city, and help prepare an email. For anything beyond that, please contact Shishir directly. Maybe tell him to give me an upgrade next time!"
};

function getPortfolioAnswer(question){
  const q = question.toLowerCase().trim();
  const clean = q.replace(/[^a-z0-9\s']/g, '').trim();

  if(/^(hi|hello|hey|hiya|yo|good morning|good afternoon|good evening)$/.test(clean))
    return "Hi! It's nice to meet you. I'm Shishir's chat assistant. How are you today?";
  if(q.includes('how are you') || q.includes('how r u') || q.includes('howre you'))
    return "I'm doing great, thank you for asking! I'm here and ready to help. How are you doing?";
  if(q.includes('i am good') || q.includes("i'm good") || q.includes('im good') || q.includes('doing good') || q.includes('doing well'))
    return "That's good to hear! We can chat, or I can tell you about Shishir and his cybersecurity background.";
  if(q.includes('thank you') || q.includes('thanks') || q === 'thx')
    return "You're very welcome! Happy to help.";
  if(q.includes('who are you') || q.includes('what are you'))
    return "I'm Shishir's portfolio chat assistant. I can welcome visitors, chat normally, answer portfolio questions, do basic calculations, check current weather, and help prepare an email to Shishir.";
  if(q.includes('nice to meet you')) return "Nice to meet you too! I'm glad you stopped by Shishir's portfolio.";
  if(q.includes('good night')) return "Good night! Thanks for visiting Shishir's portfolio. Have a lovely night.";
  if(/\b(bye|goodbye|see you|see ya)\b/.test(q)) return "Goodbye! Thanks for visiting Shishir's portfolio. Have a great day!";
  if(q.includes('what can you do') || q.includes('what do you know'))
    return "I can chat normally, tell you about Shishir's cybersecurity skills and experience, do basic calculations, check current weather by city, and help prepare a secure email.";

  if(q.includes('rangeforce') || q.includes('132') || q.includes('47 hour')) return portfolioAnswers.rangeforce;
  if(q.includes('certificate') || q.includes('certification') || q.includes('hackerrank') || q.includes('sql')) return portfolioAnswers.certifications;
  if(q.includes('project') || q.includes('lab') || q.includes('vulnerability') || q.includes('log4shell') || q.includes('heartbleed')) return portfolioAnswers.projects;
  if(q.includes('education') || q.includes('degree') || q.includes('university') || q.includes('study')) return portfolioAnswers.education;
  if(q.includes('role') || q.includes('job') || q.includes('looking for') || q.includes('target')) return portfolioAnswers.roles;
  if(q.includes('why hire') || q.includes('suitable') || q.includes('good candidate') || q.includes('hire shishir')) return portfolioAnswers.whyhire;
  if(q.includes('contact') || q.includes('email') || q.includes('linkedin') || q.includes('github')) return portfolioAnswers.contact;
  if(q.includes('skill') || q.includes('cyber') || q.includes('security') || q.includes('soc') || q.includes('siem') || q.includes('wazuh') || q.includes('nmap')) return portfolioAnswers.skills;
  if(q.includes('who is shishir') || q.includes('about shishir') || q.includes('profile')) return portfolioAnswers.profile;

  return portfolioAnswers.fallback;
}

function tryCalculation(question){
  let expr = question.toLowerCase()
    .replace(/what is|calculate|calc|please|equals|=/g, '')
    .replace(/[x×]/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')
    .trim();

  if(!expr || !/[0-9]/.test(expr)) return null;
  if(!/^[0-9+\-*/().%\s*]+$/.test(expr)) return null;
  try{
    const result = Function(`"use strict"; return (${expr})`)();
    if(typeof result !== 'number' || !Number.isFinite(result)) return null;
    return `The answer is ${Number.isInteger(result) ? result : Number(result.toFixed(8))}.`;
  }catch{
    return null;
  }
}

function weatherDescription(code){
  if(code === 0) return 'clear skies';
  if([1,2,3].includes(code)) return 'partly cloudy conditions';
  if([45,48].includes(code)) return 'foggy conditions';
  if([51,53,55,56,57].includes(code)) return 'drizzle';
  if([61,63,65,66,67,80,81,82].includes(code)) return 'rain';
  if([71,73,75,77,85,86].includes(code)) return 'snow';
  if([95,96,99].includes(code)) return 'thunderstorms';
  return 'mixed weather conditions';
}

async function getWeatherAnswer(question){
  const lower = question.toLowerCase();
  if(!lower.includes('weather') && !lower.includes('temperature')) return null;

  let city = '';
  const inMatch = question.match(/(?:weather|temperature)(?:\s+(?:today|now|right now))?\s+(?:in|at|for)\s+([a-zA-Z .'-]+)/i);
  if(inMatch) city = inMatch[1].trim();
  if(!city){
    const looseMatch = question.match(/(?:weather|temperature)\s+([a-zA-Z .'-]{2,})/i);
    if(looseMatch) city = looseMatch[1].replace(/today|now|right now/gi,'').trim();
  }
  if(!city) return "Sure — tell me the city, for example: 'weather in Adelaide'.";

  try{
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geo = await fetch(geoUrl);
    if(!geo.ok) throw new Error('Location lookup failed');
    const geoData = await geo.json();
    const place = geoData.results?.[0];
    if(!place) return `I couldn't find ${city}. Try the city name again.`;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const weather = await fetch(weatherUrl);
    if(!weather.ok) throw new Error('Weather lookup failed');
    const data = await weather.json();
    const c = data.current;
    return `Right now in ${place.name}${place.country ? ', ' + place.country : ''}, it's ${Math.round(c.temperature_2m)} degrees Celsius with ${weatherDescription(c.weather_code)}. It feels like ${Math.round(c.apparent_temperature)} degrees, with wind around ${Math.round(c.wind_speed_10m)} kilometres per hour.`;
  }catch{
    return "I couldn't get the live weather just now. Please try again in a moment.";
  }
}

function handleSecureEmail(question){
  const match = question.match(/^(?:email shishir|send(?: an)? email(?: to shishir)?|message shishir)\s*:\s*(.+)$/i);
  if(!match) return false;

  const rawMessage = match[1].trim();
  const safeMessage = rawMessage.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s{3,}/g, ' ').slice(0, 1500);
  if(safeMessage.length < 3){
    const reply = "Please add a little more detail to your message before I prepare the email.";
    addMessage(reply, 'bot', true);
    speakText(reply);
    return true;
  }

  const reply = "I've prepared the message securely. For your privacy and Shishir's security, I don't send mail silently or store your details. Click the button below and your own email app will open with the message ready to send.";
  addMessage(reply, 'bot', true);
  speakText(reply);

  const subject = 'Portfolio enquiry for Shishir Bhattarai';
  const mailto = `mailto:shishirbhattarai033@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeMessage)}`;
  addActionButton('✉️ Open secure email', () => { window.location.href = mailto; });
  return true;
}

async function askPortfolioAssistant(question){
  if(!question.trim()) return;
  addMessage(question, 'user');

  if(handleSecureEmail(question)) return;

  const weatherReply = await getWeatherAnswer(question);
  if(weatherReply){
    addMessage(weatherReply, 'bot', true);
    speakText(weatherReply);
    return;
  }

  const calculation = tryCalculation(question);
  if(calculation){
    addMessage(calculation, 'bot', true);
    speakText(calculation);
    return;
  }

  const reply = getPortfolioAnswer(question);
  setTimeout(() => {
    addMessage(reply, 'bot', true);
    speakText(reply);
  }, 120);
}

aiForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = aiInput.value.trim();
  if(!q) return;
  aiInput.value = '';
  askPortfolioAssistant(q);
});

document.querySelectorAll('.suggestions button').forEach(btn => {
  btn.addEventListener('click', () => askPortfolioAssistant(btn.dataset.question));
});
