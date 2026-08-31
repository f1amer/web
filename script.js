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

// Free local portfolio assistant — no API, no paid service.
const aiPanel = document.getElementById('aiPanel');
const aiFab = document.getElementById('aiFab');
const openAiBtn = document.getElementById('openAiBtn');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiForm = document.getElementById('aiForm');
const aiInput = document.getElementById('aiInput');
const aiMessages = document.getElementById('aiMessages');

function openAI(){
  aiPanel.classList.add('open');
  setTimeout(() => aiInput.focus(), 100);
}
function closeAI(){ aiPanel.classList.remove('open'); }

aiFab.addEventListener('click', openAI);
openAiBtn.addEventListener('click', openAI);
closeAiBtn.addEventListener('click', closeAI);

function speakText(text){
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.98;
  utterance.pitch = 1;
  utterance.lang = 'en-AU';
  window.speechSynthesis.speak(utterance);
}

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

const portfolioAnswers = {
  profile: "Shishir Bhattarai is an Adelaide-based cybersecurity-focused IT professional with a First-Class Honours degree in Computing and postgraduate study in Information Technology with a Security Management focus. His interests include defensive security, SOC operations, IT support and networking.",
  skills: "Shishir's cybersecurity skill set includes Wazuh, Windows event analysis, SIEM and SOAR fundamentals, Nmap, endpoint protection, Active Directory security, network-security concepts, vulnerability analysis, cyber risk, NIST CSF, ISO 27001 and ISO 31000 exposure.",
  rangeforce: "Shishir completed a RangeForce Certificate of Continuing Education with 132 modules and 47 hours 30 minutes of study. Topics include Splunk, Active Directory, Windows event logs, Linux, Nmap, Wazuh, SIEM and SOAR, MITRE ATT&CK, NIST CSF, endpoint protection and vulnerability-focused labs.",
  certifications: "Shishir's portfolio includes a RangeForce Certificate of Continuing Education and a verified HackerRank SQL Basic certificate, along with Google Digital Garage learning. The RangeForce certificate is available directly from the portfolio.",
  projects: "His cybersecurity portfolio includes Windows security-event analysis, Wazuh and SIEM-oriented exercises, Nmap enumeration, vulnerability walkthroughs such as Log4Shell, Heartbleed, Shellshock and Zerologon, plus cyber risk and governance analysis using recognised frameworks.",
  education: "Shishir holds a BSc Honours in Computing from Leeds Beckett University with First-Class Honours. He also has postgraduate study in Information Technology with a Security Management focus in Australia.",
  roles: "Shishir is targeting cybersecurity, junior SOC analyst, security operations, IT support, service desk and networking-oriented opportunities where he can build on his defensive-security training and technical background.",
  whyhire: "Shishir combines a strong computing foundation, hands-on cybersecurity labs, security-framework knowledge, technical teaching experience and clear communication. He would be particularly well suited to an entry-level or junior role where learning ability, troubleshooting and security awareness are important.",
  contact: "You can contact Shishir through the Email, LinkedIn or GitHub links in the Contact section of this portfolio."
};

function getPortfolioAnswer(question){
  const q = question.toLowerCase();

  if(q.includes('rangeforce') || q.includes('132') || q.includes('47 hour')) return portfolioAnswers.rangeforce;
  if(q.includes('certificate') || q.includes('certification') || q.includes('hackerrank') || q.includes('sql')) return portfolioAnswers.certifications;
  if(q.includes('project') || q.includes('lab') || q.includes('vulnerability') || q.includes('log4shell') || q.includes('heartbleed')) return portfolioAnswers.projects;
  if(q.includes('education') || q.includes('degree') || q.includes('university') || q.includes('study')) return portfolioAnswers.education;
  if(q.includes('role') || q.includes('job') || q.includes('looking for') || q.includes('target')) return portfolioAnswers.roles;
  if(q.includes('why hire') || q.includes('suitable') || q.includes('good candidate') || q.includes('hire shishir')) return portfolioAnswers.whyhire;
  if(q.includes('contact') || q.includes('email') || q.includes('linkedin') || q.includes('github')) return portfolioAnswers.contact;
  if(q.includes('skill') || q.includes('cyber') || q.includes('security') || q.includes('soc') || q.includes('siem') || q.includes('wazuh') || q.includes('nmap')) return portfolioAnswers.skills;
  if(q.includes('who') || q.includes('about') || q.includes('profile') || q.includes('shishir')) return portfolioAnswers.profile;

  return "I can help with Shishir's cybersecurity profile, skills, RangeForce training, certifications, projects, education, target roles and contact details. Try asking 'What cybersecurity skills does Shishir have?' or 'Why hire Shishir?'";
}

function askPortfolioAssistant(question){
  if(!question.trim()) return;
  addMessage(question, 'user');
  const reply = getPortfolioAnswer(question);
  setTimeout(() => addMessage(reply, 'bot', true), 180);
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
