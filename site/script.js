const levelSelect = document.getElementById('level');
const newBtn = document.getElementById('new');
const questionDiv = document.getElementById('question');
const answerInput = document.getElementById('answer');
const checkBtn = document.getElementById('check');
const showBtn = document.getElementById('show');
const feedbackDiv = document.getElementById('feedback');

// Definir 10 niveles con rango de operaciones y dificultad
const levels = [
  { id:1, name:'Nivel 1 - Sumas simples (0-5)', type:'add', min:0, max:5 },
  { id:2, name:'Nivel 2 - Sumas (0-10)', type:'add', min:0, max:10 },
  { id:3, name:'Nivel 3 - Restas simples (0-10)', type:'sub', min:0, max:10 },
  { id:4, name:'Nivel 4 - Sumas y restas (0-20)', type:'mix', min:0, max:20 },
  { id:5, name:'Nivel 5 - Multiplicación (1-5)', type:'mul', min:1, max:5 },
  { id:6, name:'Nivel 6 - Multiplicación (1-10)', type:'mul', min:1, max:10 },
  { id:7, name:'Nivel 7 - División sencilla (1-10)', type:'div', min:1, max:10 },
  { id:8, name:'Nivel 8 - Operaciones mixtas (0-20)', type:'mix', min:0, max:20 },
  { id:9, name:'Nivel 9 - Problemas con complemento (0-50)', type:'mix', min:0, max:50 },
  { id:10, name:'Nivel 10 - Repaso general', type:'any', min:0, max:50 }
];

let currentAnswer = null;

function populateLevels(){
  levels.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.name;
    levelSelect.appendChild(opt);
  });
}

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min }

function generateQuestion(level){
  // `level` puede ser un id (number/string) o un objeto cfg.
  const cfg = (typeof level === 'object') ? level : levels.find(l => l.id==level);
  if(!cfg) return '';
  let a = randInt(cfg.min,cfg.max);
  let b = randInt(cfg.min,cfg.max);
  let q = '';
  switch(cfg.type){
    case 'add': q = `${a} + ${b}`; currentAnswer = a + b; break;
    case 'sub': if(a<b) [a,b]=[b,a]; q = `${a} - ${b}`; currentAnswer = a - b; break;
    case 'mul': q = `${a} × ${b}`; currentAnswer = a * b; break;
    case 'div': b = randInt(cfg.min,cfg.max); if(b===0) b=1; const product = a*b; q = `${product} ÷ ${b}`; currentAnswer = product / b; break;
    case 'mix': {
      const t = ['add','sub','mul'][randInt(0,2)];
      if(t==='add'){ q = `${a} + ${b}`; currentAnswer=a+b }
      if(t==='sub'){ if(a<b)[a,b]=[b,a]; q = `${a} - ${b}`; currentAnswer=a-b }
      if(t==='mul'){ q = `${a} × ${b}`; currentAnswer=a*b }
    } break;
    case 'any': {
      // Elegir una operación al azar y regenerar usando la misma configuración de rango
      const t2 = ['add','sub','mul','div'][randInt(0,3)];
      return generateQuestion({id:cfg.id || 0, name:'any', type:t2, min:cfg.min, max:cfg.max});
    }
  }
  return q;
}

newBtn.addEventListener('click', ()=>{
  const level = parseInt(levelSelect.value)||1;
  const q = generateQuestion(level);
  questionDiv.textContent = `Pregunta: ${q}`;
  feedbackDiv.textContent = '';
  answerInput.value = '';
});

checkBtn.addEventListener('click', ()=>{
  const val = answerInput.value.trim();
  if(val===''){ feedbackDiv.textContent='Escribe una respuesta'; return }
  const num = Number(val);
  if(Number.isNaN(num)){ feedbackDiv.textContent='Respuesta no válida'; return }
  if(Math.abs(num - currentAnswer) < 1e-9){ feedbackDiv.textContent='✅ ¡Correcto!'; }
  else{ feedbackDiv.textContent=`❌ Incorrecto. Intenta de nuevo.` }
});

showBtn.addEventListener('click', ()=>{
  if(currentAnswer===null){ feedbackDiv.textContent='Genera primero una pregunta'; return }
  feedbackDiv.textContent = `Respuesta: ${currentAnswer}`;
});

// iniciar
populateLevels();
levelSelect.value = 1;
