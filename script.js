
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

// GPT-powered portfolio assistant.
// This frontend calls /api/chat. The OpenAI API key stays on the server.
const aiPanel = document.getElementById('aiPanel');
const aiFab = document.getElementById('aiFab');
const openAiBtn = document.getElementById('openAiBtn');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiForm = document.getElementById('aiForm');
const aiInput = document.getElementById('aiInput');
const aiMessages = document.getElementById('aiMessages');

let conversation = [];

function openAI(){
  aiPanel.classList.add('open');
  setTimeout(() => aiInput.focus(), 100);
}
function closeAI(){ aiPanel.classList.remove('open'); }

aiFab.addEventListener('click', openAI);
openAiBtn.addEventListener('click', openAI);
closeAiBtn.addEventListener('click', closeAI);

function addMessage(text, type){
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return div;
}

async function askPortfolioAI(question){
  if(!question.trim()) return;

  addMessage(question, 'user');
  conversation.push({ role: 'user', content: question });
  const thinking = addMessage('Analyzing portfolio data…', 'bot');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        history: conversation.slice(-8)
      })
    });

    const data = await response.json();
    thinking.remove();

    if(!response.ok){
      throw new Error(data.error || 'AI service unavailable');
    }

    addMessage(data.reply, 'bot');
    conversation.push({ role: 'assistant', content: data.reply });
  } catch (error) {
    thinking.textContent =
      'The AI assistant is temporarily unavailable. Please use the Contact section to reach Shishir directly.';
    console.error(error);
  }
}

aiForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = aiInput.value.trim();
  if(!q) return;
  aiInput.value = '';
  askPortfolioAI(q);
});

document.querySelectorAll('.suggestions button').forEach(btn => {
  btn.addEventListener('click', () => askPortfolioAI(btn.dataset.question));
});
