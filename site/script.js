const levelSelect = document.getElementById('level');
const newBtn = document.getElementById('new');
const questionDiv = document.getElementById('question');
const answerInput = document.getElementById('answer');
const checkBtn = document.getElementById('check');
const showBtn = document.getElementById('show');
const feedbackDiv = document.getElementById('feedback');

// Define 10 niveles adecuados para 4º-7º
const levels = [
  { id:1, name:'Nivel 1 - Enteros: suma/resta básica', type:'int_add_sub' },
  { id:2, name:'Nivel 2 - Enteros: multiplicación básica', type:'int_mul' },
  { id:3, name:'Nivel 3 - Divisiones exactas y enteras', type:'int_div' },
  { id:4, name:'Nivel 4 - Decimales: suma/resta', type:'dec_add_sub' },
  { id:5, name:'Nivel 5 - Decimales: multiplicación/división', type:'dec_mul_div' },
  { id:6, name:'Nivel 6 - Fracciones: suma/resta con denominadores iguales', type:'frac_same' },
  { id:7, name:'Nivel 7 - Fracciones: suma/resta con denominadores distintos', type:'frac_diff' },
  { id:8, name:'Nivel 8 - Porcentajes: calcular porcentaje', type:'percent' },
  { id:9, name:'Nivel 9 - Álgebra básica: resolver x', type:'algebra' },
  { id:10, name:'Nivel 10 - Geometría simple: área/perímetro', type:'geometry' }
];

function populateLevels(){ levels.forEach(l=>{ const opt=document.createElement('option'); opt.value=l.id; opt.textContent=l.name; levelSelect.appendChild(opt); }) }

// util
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min }
function gcd(a,b){ return b?gcd(b,a%b):Math.abs(a) }

let currentAnswer = null;

function formatFraction(numer, denom){ if(denom===1) return ''+numer; const g = gcd(numer,denom); numer/=g; denom/=g; return `${numer}/${denom}` }

function parseFraction(str){ // accepts 'a/b' or decimal
  if(str.includes('/')){ const [a,b]=str.split('/').map(s=>Number(s.trim())); if(Number.isNaN(a)||Number.isNaN(b)||b===0) return null; return a/b }
  const v = Number(str); return Number.isNaN(v)?null:v
}

function generateQuestion(levelId){
  const cfg = levels.find(l=>l.id==levelId);
  currentAnswer = null;
  switch(cfg.type){
    case 'int_add_sub': {
      const a = randInt(10,120), b=randInt(0,90); if(Math.random()<0.5){ currentAnswer = a+b; return `${a} + ${b}` } else { const A=Math.max(a,b); const B=Math.min(a,b); currentAnswer = A-B; return `${A} - ${B}` }
    }
    case 'int_mul': { const a=randInt(2,12); const b=randInt(2,12); currentAnswer = a*b; return `${a} × ${b}` }
    case 'int_div': { const b=randInt(2,12); const q=randInt(2,10); const a=b*q; currentAnswer = q; return `${a} ÷ ${b}` }
    case 'dec_add_sub': { const a=(randInt(10,200))/10; const b=(randInt(0,150))/10; if(Math.random()<0.5){ currentAnswer=+(a+b).toFixed(2); return `${a.toFixed(1)} + ${b.toFixed(1)}` } else { const A=Math.max(a,b); const B=Math.min(a,b); currentAnswer=+(A-B).toFixed(2); return `${A.toFixed(1)} - ${B.toFixed(1)}` } }
    case 'dec_mul_div': { if(Math.random()<0.5){ const a=(randInt(10,50))/10; const b=(randInt(2,20))/10; currentAnswer=+(a*b).toFixed(2); return `${a.toFixed(1)} × ${b.toFixed(1)}` } else { const b=(randInt(1,10))/1; const q=(randInt(2,30))/10; const a=+(b*q).toFixed(2); currentAnswer=+(a/b).toFixed(2); return `${a.toFixed(2)} ÷ ${b}` } }
    case 'frac_same': { const denom=randInt(2,12); const a=randInt(1,denom-1); const b=randInt(1,denom-1); currentAnswer = (a+b)/denom; return `${a}/${denom} + ${b}/${denom}` }
    case 'frac_diff': { const d1=randInt(2,12); const d2=randInt(2,12); const a=randInt(1,d1-1); const b=randInt(1,d2-1); const numer = a*d2 + b*d1; const denom = d1*d2; currentAnswer = numer/denom; return `${a}/${d1} + ${b}/${d2} (simplifica si puedes)` }
    case 'percent': { const base=randInt(10,500); const pct=randInt(5,90); currentAnswer = +(base * pct/100).toFixed(2); return `${pct}% de ${base}` }
    case 'algebra': { const x = randInt(1,12); const m = randInt(1,6); const c = randInt(0,20); const rhs = m*x + c; currentAnswer = x; return `Resuelve: ${m}x + ${c} = ${rhs}` }
    case 'geometry': { if(Math.random()<0.5){ const a=randInt(3,12); const b=randInt(3,12); currentAnswer = a*b; return `Área de un rectángulo ${a} x ${b} (unidad²)` } else { const r=randInt(2,10); currentAnswer = +(Math.PI*r*r).toFixed(2); return `Área de un círculo radio ${r} (usar π ~ 3.1416)` } }
  }
}

newBtn.addEventListener('click', ()=>{
  const lvl = parseInt(levelSelect.value)||1; const q = generateQuestion(lvl); questionDiv.textContent = `Pregunta: ${q}`; feedbackDiv.textContent=''; answerInput.value='';
})

checkBtn.addEventListener('click', ()=>{
  const val = answerInput.value.trim(); if(!val){ feedbackDiv.textContent='Escribe una respuesta'; return }
  const parsed = parseFraction(val);
  if(parsed===null){ feedbackDiv.textContent='Respuesta no válida'; return }
  const diff = Math.abs(parsed - currentAnswer);
  if(diff < 1e-6 || diff < 0.01){ feedbackDiv.textContent='✅ Correcto'; }
  else{ feedbackDiv.textContent=`❌ Incorrecto. Respuesta correcta: ${ (Number.isInteger(currentAnswer) ? currentAnswer : currentAnswer.toFixed(2)) }` }
})

showBtn.addEventListener('click', ()=>{ if(currentAnswer===null){ feedbackDiv.textContent='Genera primero una pregunta'; return } feedbackDiv.textContent = `Respuesta: ${ (Number.isInteger(currentAnswer) ? currentAnswer : currentAnswer.toFixed(4)) }` })

populateLevels(); levelSelect.value=1;
