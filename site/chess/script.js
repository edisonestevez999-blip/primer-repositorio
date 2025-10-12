// Simple chess with legal moves, drag-and-drop and a basic bot with levels
// This is a compact implementation using algebraic coordinates (a1..h8). It supports
// moves validation, en passant, castling and promotion (promotion asks to choose queen by default).

const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');
const statusEl = document.getElementById('status');
const newBtn = document.getElementById('new');
const levelSelect = document.getElementById('level');

// Piece glyphs (simple unicode)
const glyphs = {
  'P':'♙','R':'♖','N':'♘','B':'♗','Q':'♕','K':'♔',
  'p':'♟','r':'♜','n':'♞','b':'♝','q':'♛','k':'♚'
};

let game = null;

function createEmptyBoard(){
  const b = {};
  const files = 'abcdefgh';
  for(let r=1;r<=8;r++) for(let f=0;f<8;f++) b[files[f]+r] = null;
  return b;
}

function setupStart(){
  const b = createEmptyBoard();
  const back = ['r','n','b','q','k','b','n','r'];
  for(let i=0;i<8;i++){ b[''+String.fromCharCode(97+i)+1] = back[i].toUpperCase(); b[''+String.fromCharCode(97+i)+2] = 'P'; b[''+String.fromCharCode(97+i)+7] = 'p'; b[''+String.fromCharCode(97+i)+8] = back[i]; }
  return { board:b, turn:'w', castling:{K:true,Q:true,k:true,q:true}, enpassant:null, halfmove:0, fullmove:1 };
}

function renderBoard(state){
  boardEl.innerHTML='';
  const files = 'abcdefgh';
  for(let r=8;r>=1;r--){
    for(let f=0;f<8;f++){
      const sq = files[f]+r;
      const div = document.createElement('div'); div.className='square '+(((f+r)%2)?'dark':'light'); div.dataset.square=sq;
      const piece = state.board[sq];
      if(piece){ const p = document.createElement('div'); p.className='piece'; p.textContent = glyphs[piece]; p.dataset.piece=piece; p.dataset.square=sq; div.appendChild(p); }
      boardEl.appendChild(div);
    }
  }
  turnEl.textContent = state.turn==='w'?'Blancas':'Negras';
}

// Move generation & validation (simplified but covers rules)
function isUpper(c){ return c===c.toUpperCase() }
function enemy(color,piece){ if(!piece) return false; return (color==='w')? !isUpper(piece): isUpper(piece); }
function friendly(color,piece){ if(!piece) return false; return (color==='w')? isUpper(piece): !isUpper(piece); }

function coords(sq){ return {file:sq.charCodeAt(0)-97, rank:parseInt(sq[1])}; }
function sqName(f,r){ return String.fromCharCode(97+f)+r; }

function generateMoves(state, from){
  const piece = state.board[from]; if(!piece) return [];
  const color = isUpper(piece)?'w':'b';
  if((color==='w' && state.turn!=='w') || (color==='b' && state.turn!=='b')) return [];
  const type = piece.toLowerCase();
  const {file,rank} = coords(from);
  const moves=[];
  const addMove = (tgt, capture=false, special=null)=>{ moves.push({from, to:tgt, capture, special}); };

  if(type==='p'){ // pawn
    const dir = (color==='w')?1:-1;
    const startRank = (color==='w')?2:7;
    const one = sqName(file, rank+dir);
    if(state.board[one]===null) addMove(one);
    const two = sqName(file, rank+2*dir);
    if(rank===startRank && state.board[one]===null && state.board[two]===null) addMove(two);
    // captures
    for(const df of [-1,1]){
      const f2 = file+df; if(f2<0||f2>7) continue; const to = sqName(f2, rank+dir);
      if(state.board[to] && enemy(color, state.board[to])) addMove(to,true);
      // en passant
      if(state.enpassant===to){ addMove(to,true,'enpassant'); }
    }
    return moves;
  }

  const addSlides = (dirs)=>{
    for(const [df,dr] of dirs){
      let f=file+df, r=rank+dr;
      while(f>=0 && f<8 && r>=1 && r<=8){
        const s = sqName(f,r);
        if(state.board[s]===null){ addMove(s); }
        else{ if(enemy(color,state.board[s])) addMove(s,true); break; }
        f+=df; r+=dr;
      }
    }
  };

  if(type==='n'){ const deltas=[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]; for(const [df,dr] of deltas){ const f=file+df, r=rank+dr; if(f>=0&&f<8&&r>=1&&r<=8){ const s=sqName(f,r); if(!friendly(color,state.board[s])) addMove(s,!!state.board[s]); }} return moves; }
  if(type==='b'){ addSlides([[1,1],[1,-1],[-1,1],[-1,-1]]); return moves; }
  if(type==='r'){ addSlides([[1,0],[-1,0],[0,1],[0,-1]]); return moves; }
  if(type==='q'){ addSlides([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]); return moves; }
  if(type==='k'){ // king (castling handled separately)
    for(const df of [-1,0,1]) for(const dr of [-1,0,1]){ if(df===0 && dr===0) continue; const f=file+df, r=rank+dr; if(f>=0&&f<8&&r>=1&&r<=8){ const s=sqName(f,r); if(!friendly(color,state.board[s])) addMove(s,!!state.board[s]); }}
    // castling
    if((color==='w' && from==='e1') || (color==='b' && from==='e8')){
      const kingSide = (color==='w')? state.castling.K : state.castling.k;
      const queenSide = (color==='w')? state.castling.Q : state.castling.q;
      if(kingSide){ const between = (color==='w')?['f1','g1']:['f8','g8']; if(between.every(s=>state.board[s]===null)) addMove(between[1],false,'castleK'); }
      if(queenSide){ const between = (color==='w')?['d1','c1','b1']:['d8','c8','b8']; if(between.slice(0,2).every(s=>state.board[s]===null)) addMove(between[1],false,'castleQ'); }
    }
    return moves;
  }
  return moves;
}

function makeMove(state, move){
  const ns = JSON.parse(JSON.stringify(state));
  const piece = ns.board[move.from];
  // handle enpassant capture
  if(move.special==='enpassant'){ ns.board[move.to]=piece; ns.board[move.from]=null; const capRank = (isUpper(piece)?parseInt(move.to[1])-1:parseInt(move.to[1])+1); ns.board[move.to[0]+capRank]=null; ns.enpassant=null; }
  else{ ns.board[move.to]=piece; ns.board[move.from]=null; }
  // castling move adjust
  if(move.special==='castleK'){ if(piece==='K'){ ns.board['h1']=null; ns.board['f1']='R'; } else { ns.board['h8']=null; ns.board['f8']='r'; } }
  if(move.special==='castleQ'){ if(piece==='K'){ ns.board['a1']=null; ns.board['d1']='R'; } else { ns.board['a8']=null; ns.board['d8']='r'; } }
  // promotion (auto to queen)
  if(piece.toLowerCase()==='p'){ const rank = parseInt(move.to[1]); if((piece==='P'&&rank===8)||(piece==='p'&&rank===1)){ ns.board[move.to]= (piece==='P'?'Q':'q'); } }
  // update castling rights
  if(piece==='K'){ ns.castling.K=false; ns.castling.Q=false; }
  if(piece==='k'){ ns.castling.k=false; ns.castling.q=false; }
  if(move.from==='a1' || move.to==='a1') ns.castling.Q=false; if(move.from==='h1' || move.to==='h1') ns.castling.K=false;
  if(move.from==='a8' || move.to==='a8') ns.castling.q=false; if(move.from==='h8' || move.to==='h8') ns.castling.k=false;
  // enpassant target set when pawn moves two
  ns.enpassant=null; if(piece.toLowerCase()==='p'){ const ffrom = parseInt(move.from[1]); const tto=parseInt(move.to[1]); if(Math.abs(ffrom - tto)===2){ ns.enpassant = move.from[0]+((ffrom+tto)/2); } }
  ns.turn = (ns.turn==='w')?'b':'w';
  return ns;
}

// Basic bot: minimax with material eval and depth proportional to level
function evaluate(state){
  const vals = {'p':100,'n':320,'b':330,'r':500,'q':900,'k':20000}; let s=0; for(const sq in state.board){ const p=state.board[sq]; if(!p) continue; const v = vals[p.toLowerCase()]||0; s += isUpper(p)? v : -v; } return s;
}

function listAllMoves(state){ const moves=[]; for(const sq in state.board){ if(state.board[sq] && ((state.turn==='w')? isUpper(state.board[sq]) : !isUpper(state.board[sq]))){ const mvs = generateMoves(state,sq); for(const m of mvs) moves.push(m); }} return moves; }

function minimax(state,depth,alpha,beta,maximizing){
  if(depth===0) return {score:evaluate(state)};
  const moves = listAllMoves(state);
  if(moves.length===0) return {score: evaluate(state)};
  let best=null;
  if(maximizing){ let value=-Infinity; for(const m of moves){ const ns=makeMove(state,m); const res=minimax(ns,depth-1,alpha,beta,false); if(res.score>value){ value=res.score; best=m; } alpha=Math.max(alpha,value); if(alpha>=beta) break; } return {score:value, move:best}; }
  else{ let value=Infinity; for(const m of moves){ const ns=makeMove(state,m); const res=minimax(ns,depth-1,alpha,beta,true); if(res.score<value){ value=res.score; best=m; } beta=Math.min(beta,value); if(alpha>=beta) break; } return {score:value, move:best}; }
}

function botMove(level){
  const depth = Math.min(1+Math.floor(level/2), 4); // cap depth small for performance
  const res = minimax(game, depth, -Infinity, Infinity, game.turn==='w');
  if(res.move) game = makeMove(game,res.move);
}

// Drag and drop handling
let dragging = null;
boardEl.addEventListener('pointerdown', e=>{
  const p = e.target.closest('.piece'); if(!p) return; const sq = p.dataset.square; const piece = game.board[sq]; if(!piece) return;
  if((game.turn==='w' && !isUpper(piece)) || (game.turn==='b' && isUpper(piece))){ statusEl.textContent='No es tu turno'; return; }
  dragging = {el:p, from:sq, startX:e.clientX, startY:e.clientY}; p.classList.add('dragging'); p.setPointerCapture(e.pointerId);
});

boardEl.addEventListener('pointermove', e=>{ if(!dragging) return; const dx=e.clientX-dragging.startX, dy=e.clientY-dragging.startY; dragging.el.style.transform = `translate(${dx}px, ${dy}px)`; });

boardEl.addEventListener('pointerup', e=>{
  if(!dragging) return; const target = document.elementFromPoint(e.clientX,e.clientY).closest('.square'); const to = target?target.dataset.square:null; const from = dragging.from; dragging.el.classList.remove('dragging'); dragging.el.style.transform=''; dragging.el.releasePointerCapture(e.pointerId);
  // validate move
  const legal = generateMoves(game,from).some(m=>m.to===to || m.to===to);
  if(!to || !legal){ statusEl.textContent='Movimiento ilegal según las reglas'; dragging=null; return; }
  // find exact move
  const mv = generateMoves(game,from).find(m=>m.to===to);
  game = makeMove(game,mv);
  dragging=null; statusEl.textContent='';
  renderBoard(game);
  // bot plays
  setTimeout(()=>{ const lvl = parseInt(levelSelect.value); botMove(lvl); renderBoard(game); }, 250);
});

newBtn.addEventListener('click', ()=>{ game = setupStart(); renderBoard(game); statusEl.textContent='Nueva partida'; });

// init
newBtn.click();

// Note: This is a compact implementation. The bot is basic (minimax) and will respond slower at higher depths.
// There is room to improve move legality checks (check detection), better promotion UI, and performance.
