const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='ezzNotesUniverseV1';
let db=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}})()||{books:[],missions:[],xp:0,focusMinutes:0,streak:0,lastOpen:'',theme:'space',currentBook:null,currentNote:null};
let seconds=1500,interval=null;
const palette=['#7c5cff','#ff6fae','#00b8d9','#ff9f43','#2ecc9a','#ff5d5d'];const icons=['📘','💻','🧠','🏛️','🌍','🔬'];
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random()}function save(){localStorage.setItem(KEY,JSON.stringify(db));}function toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),1800)}
function ensure(){if(!db.books.length){const b={id:uid(),name:'My First Galaxy',icon:'🪐',color:'#7c5cff',notes:[{id:uid(),name:'Welcome',text:'Welcome to your Study Universe! ✨\n\nThis is not just a notes app. Build your knowledge, complete missions and level up.'}]};db.books.push(b);db.currentBook=b.id;db.currentNote=b.notes[0].id}const today=new Date().toDateString();{const y=new Date(Date.now()-864e5).toDateString();if(db.lastStudy&&db.lastStudy!==today&&db.lastStudy!==y)db.streak=0;db.lastOpen=today}save()}
function currentBook(){return db.books.find(b=>b.id===db.currentBook)||db.books[0]}function currentNote(){return currentBook()?.notes.find(n=>n.id===db.currentNote)||currentBook()?.notes[0]}
function level(){return Math.floor(db.xp/250)+1}function progress(){const total=db.missions.length;return total?Math.round(db.missions.filter(m=>m.done).length/total*100):0}
function renderStats(){$('#xp').textContent=db.xp;$('#level').textContent=level();$('#streak').textContent=db.streak;$('#notesCount').textContent=db.books.reduce((a,b)=>a+b.notes.length,0);$('#focusHours').textContent=db.focusMinutes;$('#missionProgress').textContent=progress()+'%'}
function renderMissions(){const el=$('#missions');el.innerHTML=db.missions.length?'':'';if(!db.missions.length){el.innerHTML='<p style="color:var(--muted)">No mission yet. Create one and start your journey ✦</p>';return}db.missions.forEach(m=>{const d=document.createElement('div');d.className='mission '+(m.done?'done':'');d.innerHTML=`<input type="checkbox" ${m.done?'checked':''}><span>${esc(m.text)}</span><button>×</button>`;d.querySelector('input').onchange=e=>{if(!m.done&&e.target.checked)db.xp+=25;m.done=e.target.checked;m.doneOn=m.done?new Date().toDateString():'';if(m.done)markStudy();save();renderAll()};d.querySelector('button').onclick=()=>{db.missions=db.missions.filter(x=>x.id!==m.id);save();renderAll()};el.append(d)})}
function renderBooks(){const grid=$('#bookGrid'),recent=$('#recentBooks');grid.innerHTML='';recent.innerHTML='';db.books.forEach((b,i)=>{const card=document.createElement('article');card.className='book';card.style.setProperty('--c1',b.color);card.innerHTML=`<div class="emoji">${b.icon}</div><h3>${esc(b.name)}</h3><small>${b.notes.length} knowledge pages</small><div class="orb"></div>`;card.onclick=()=>{db.currentBook=b.id;db.currentNote=b.notes[0]?.id;save();show('editor')};grid.append(card);if(i<4){const r=document.createElement('div');r.className='mini-book';r.textContent=`${b.icon} ${b.name}`;recent.append(r)}})}
function renderEditor(){const b=currentBook();if(!b)return;const list=$('#noteList');list.innerHTML='';b.notes.forEach(n=>{const d=document.createElement('div');d.className='note-item '+(n.id===db.currentNote?'active':'');d.textContent=n.name;d.onclick=()=>{ if(inkMode) saveInkNow(); else save(); db.currentNote=n.id; renderEditor(); };list.append(d)});const n=currentNote();$('#editorName').value=n?.name||'';$('#noteText').value=n?.text||'';words()}
function renderMap(){const el=$('#knowledgeMap');el.innerHTML='';db.books.forEach((b,i)=>{const n=document.createElement('div');n.className='node';n.style.left=(8+(i%4)*23)+'%';n.style.top=(15+Math.floor(i/4)*40)+'%';n.style.background=`linear-gradient(135deg,${b.color},#29204d)`;n.innerHTML=`<b>${b.icon} ${esc(b.name)}</b><small>${b.notes.length} pages</small>`;n.onclick=()=>{db.currentBook=b.id;db.currentNote=b.notes[0]?.id;show('editor')};el.append(n)})}
function renderBadges(){const rules=[['🌱','First Spark',db.books.length>=1,'Create your first notebook'],['📝','Note Maker',db.books.reduce((a,b)=>a+b.notes.length,0)>=5,'Create 5 pages'],['🔥','On Fire',db.streak>=3,'Reach a 3-day streak'],['⚡','Focused Mind',db.focusMinutes>=60,'Focus for 60 minutes'],['👑','Study Master',level()>=5,'Reach Level 5']];$('#badges').innerHTML=rules.map(x=>`<div class="badge ${x[2]?'':'locked'}"><div class="icon">${x[0]}</div><h3>${x[1]}</h3><small>${x[3]}</small></div>`).join('')}
function renderAll(){renderStats();renderMissions();renderBooks();renderEditor();renderMap();renderBadges()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function show(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));const titles={home:'Mission Control',library:'Notebook Galaxy',editor:'Creative Studio',focus:'Focus Portal',map:'Knowledge Map',achievements:'Achievements',adventure:'Adventure Mode'};$('#title').textContent=titles[id];setNav(false);window.scrollTo(0,0);if(id==='editor')renderEditor()}
$$('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));$('.hero .primary').onclick=()=>show('focus');
function openModal(html){$('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden')}function closeModal(){$('#modal').classList.add('hidden')}$('#closeModal').onclick=closeModal;
function createBook(){openModal(`<h2>Create a Galaxy</h2><input id="bookName" placeholder="Notebook name"><select id="bookIcon">${icons.map(i=>`<option>${i}</option>`).join('')}</select><button class="primary" id="makeBook">Create Galaxy ✦</button>`);$('#makeBook').onclick=()=>{const name=$('#bookName').value.trim()||'New Galaxy';const b={id:uid(),name,icon:$('#bookIcon').value,color:palette[db.books.length%palette.length],notes:[{id:uid(),name:'Page 1',text:''}]};db.books.push(b);db.currentBook=b.id;db.currentNote=b.notes[0].id;db.xp+=10;save();closeModal();renderAll();show('library');toast('New galaxy discovered ✦')}}$('#newBook').onclick=createBook;$('#newBook2').onclick=createBook;
$('#addMission').onclick=()=>openModal(`<h2>New Mission</h2><input id="missionText" placeholder="What will you achieve today?"><button class="primary" id="makeMission">Add Mission</button>`);document.addEventListener('click',e=>{if(e.target.id==='makeMission'){const text=$('#missionText').value.trim();if(text){db.missions.push({id:uid(),text,done:false});save();closeModal();renderMissions()}}});
$('#newNote').onclick=()=>{const b=currentBook(),n={id:uid(),name:'New Idea '+(b.notes.length+1),text:''};b.notes.push(n);db.currentNote=n.id;db.xp+=5;save();renderAll();toast('+5 XP for creating a page')};
$('#noteText').oninput=()=>{const n=currentNote();if(n){n.text=$('#noteText').value;save();words()}};function words(){$('#wordCount').textContent=(($('#noteText').value.trim().match(/\S+/g)||[]).length)+' words'}

function renderTimer(){const m=Math.floor(seconds/60),s=seconds%60;$('#timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}$('#startFocus').onclick=()=>{if(interval){clearInterval(interval);interval=null;$('#startFocus').textContent='Resume Session';return}$('#startFocus').textContent='Pause Session';interval=setInterval(()=>{seconds--;renderTimer();if(seconds<=0){clearInterval(interval);interval=null;db.focusMinutes+=Math.round((1500)/60);db.xp+=100;save();renderAll();toast('Mission complete! +100 XP');seconds=1500;renderTimer();$('#startFocus').textContent='Launch Session'}},1000)};$('#resetFocus').onclick=()=>{clearInterval(interval);interval=null;seconds=1500;renderTimer();$('#startFocus').textContent='Launch Session'};$$('.presets button').forEach(b=>b.onclick=()=>{clearInterval(interval);interval=null;seconds=+b.dataset.min*60;renderTimer();$('#startFocus').textContent='Launch Session'});
$('#backup').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));a.download='EZZ-Notes-Study-Universe-Backup.json';a.click()};$('#restore').onchange=e=>{const f=e.target.files[0],r=new FileReader();if(f){r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!Array.isArray(d.books)||!Array.isArray(d.missions))throw 0;db=d;ensure();renderAll();toast('Universe restored')}catch{toast('Invalid backup')}};r.readAsText(f)}};
ensure();

// ✍ PRO HANDWRITING ENGINE — each note owns its own canvas data
let last=null, inkMode=false, drawing=false, inkTool='pen';
let inkPageToken=0;
let saveTimer=null;
let undoStack=[], redoStack=[];
const canvas=$('#inkCanvas');
const ctx=canvas.getContext('2d',{willReadFrequently:true});

function getInkSize(){ return +(('#inkSize' in window) ? $('#inkSize').value : 4); }
function canvasSize(){
  const r=canvas.getBoundingClientRect();
  return {w:Math.max(1,Math.round(r.width)),h:Math.max(1,Math.round(r.height)),d:window.devicePixelRatio||1};
}
function setupCanvas(){
  const {w,h,d}=canvasSize();
  canvas.width=Math.max(1,Math.round(w*d));
  canvas.height=Math.max(1,Math.round(h*d));
  ctx.setTransform(d,0,0,d,0,0);
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.clearRect(0,0,w,h);
}
function clearCanvasOnly(){
  const {w,h}=canvasSize();
  ctx.save(); ctx.setTransform(window.devicePixelRatio||1,0,0,window.devicePixelRatio||1,0,0);
  ctx.clearRect(0,0,w,h); ctx.restore();
}
function canvasData(){
  return canvas.toDataURL('image/png');
}
function saveInkNow(){
  const n=currentNote();
  if(!n) return;
  n.ink = canvasData();
  n.updatedAt=Date.now();
  save();
}
function autoSaveInk(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(saveInkNow,250);
}
function loadInkForCurrentPage(){
  const token=++inkPageToken;
  const n=currentNote();
  setupCanvas();
  undoStack=[]; redoStack=[];
  if(!n || !n.ink) return;
  const img=new Image();
  img.onload=()=>{
    if(token!==inkPageToken) return; // ignore an old page load
    const {w,h}=canvasSize();
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.restore();
    ctx.drawImage(img,0,0,w,h);
  };
  img.src=n.ink;
}
function resizeInkWithoutLosingPage(){
  if(inkMode && drawing) return;
  const n=currentNote();
  if(inkMode && n) { n.ink=canvasData(); n.updatedAt=Date.now(); save(); }
  if(!n) return;
  const data=n.ink || (inkMode ? canvasData() : null);
  setupCanvas();
  if(!data) return;
  const token=++inkPageToken;
  const img=new Image();
  img.onload=()=>{
    if(token!==inkPageToken || currentNote()?.id!==n.id) return;
    const {w,h}=canvasSize();
    ctx.drawImage(img,0,0,w,h);
  };
  img.src=data;
}
function point(e){
  const r=canvas.getBoundingClientRect();
  return {x:e.clientX-r.left,y:e.clientY-r.top};
}
function snapshot(){
  if(!inkMode) return;
  undoStack.push(canvasData());
  if(undoStack.length>30) undoStack.shift();
  redoStack=[];
}
function restoreData(data){
  const token=++inkPageToken;
  setupCanvas();
  if(!data) return;
  const img=new Image();
  img.onload=()=>{
    if(token!==inkPageToken) return;
    const {w,h}=canvasSize(); ctx.drawImage(img,0,0,w,h);
    saveInkNow();
  };
  img.src=data;
}
function drawStart(e){
  if(!inkMode) return;
  e.preventDefault();
  if(e.pointerType==='mouse' && e.button!==0) return;
  canvas.setPointerCapture?.(e.pointerId);
  snapshot();
  drawing=true;
  const p=point(e); last=p;
  ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+.01,p.y+.01); ctx.stroke();
  ctx.lineCap='round'; ctx.lineJoin='round';
}
function drawMove(e){
  if(!drawing || !inkMode) return;
  e.preventDefault();
  const p=point(e);
  ctx.lineWidth=getInkSize()*(inkTool==='highlighter'?3:1);
  if(inkTool==='eraser'){
    ctx.globalCompositeOperation='destination-out';
    ctx.strokeStyle='rgba(0,0,0,1)';
  }else{
    ctx.globalCompositeOperation='source-over';
    ctx.strokeStyle=$('#inkColor')?.value || '#161326';
    if(inkTool==='highlighter') ctx.globalAlpha=.28;
    else ctx.globalAlpha=1;
  }
  ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last=p;
  ctx.globalAlpha=1;
}
function drawEnd(){
  if(!drawing) return;
  drawing=false;
  ctx.closePath();
  autoSaveInk();
}
canvas.addEventListener('pointerdown',drawStart,{passive:false});
canvas.addEventListener('pointermove',drawMove,{passive:false});
['pointerup','pointercancel','pointerleave'].forEach(x=>canvas.addEventListener(x,drawEnd));

$('#handwrite').onclick=()=>{
  inkMode=!inkMode;
  $('#paper').classList.toggle('handwriting',inkMode);
  $('#handControls').style.display=inkMode?'flex':'none';
  $('#handwrite').classList.toggle('active',inkMode);
  if(inkMode){
    setTimeout(loadInkForCurrentPage,30);
  }
};
$('#penTool').onclick=()=>{
  inkTool='pen'; $('#penTool').classList.add('active'); $('#eraserTool').classList.remove('active'); $('#highlighterTool')?.classList.remove('active');
};
$('#highlighterTool')?.addEventListener('click',()=>{
  inkTool='highlighter'; $('#highlighterTool').classList.add('active'); $('#penTool').classList.remove('active'); $('#eraserTool').classList.remove('active');
});
$('#eraserTool').onclick=()=>{
  inkTool='eraser'; $('#eraserTool').classList.add('active'); $('#penTool').classList.remove('active'); $('#highlighterTool')?.classList.remove('active');
};
$('#undoInk')?.addEventListener('click',()=>{
  if(!undoStack.length) return;
  redoStack.push(canvasData()); restoreData(undoStack.pop());
});
$('#redoInk')?.addEventListener('click',()=>{
  if(!redoStack.length) return;
  undoStack.push(canvasData()); restoreData(redoStack.pop());
});
$('#clearInk').onclick=()=>{
  if(confirm('Clear all handwriting on this page?')){
    snapshot(); clearCanvasOnly();
    const n=currentNote(); if(n){delete n.ink;n.updatedAt=Date.now();save();}
    toast('Handwriting cleared from this page');
  }
};

// Re-rendering a page ALWAYS invalidates previous async image loads and then loads only that page.
const originalRenderEditor=renderEditor;
renderEditor=function(){
  inkPageToken++;
  originalRenderEditor();
  if(inkMode) setTimeout(loadInkForCurrentPage,20);
  else { setupCanvas(); }
};

// New page: explicitly starts with independent, empty handwriting data.
const originalNewNote=$('#newNote').onclick;
$('#newNote').onclick=()=>{
  if(inkMode) saveInkNow(); else save();
  inkPageToken++;
  originalNewNote();
  const n=currentNote();
  if(n) delete n.ink;
  clearTimeout(saveTimer); save();
  if(inkMode) setTimeout(loadInkForCurrentPage,30);
};

// Autosave everything while the user works.
let generalSaveTimer=null;
function scheduleGeneralSave(){
  clearTimeout(generalSaveTimer);
  generalSaveTimer=setTimeout(()=>save(),300);
}
$('#noteText').addEventListener('input',()=>{ scheduleGeneralSave(); });
window.addEventListener('resize',()=>{ if(inkMode) resizeInkWithoutLosingPage(); });
window.addEventListener('beforeunload',()=>{ clearTimeout(saveTimer); clearTimeout(generalSaveTimer); if(inkMode) saveInkNow(); else save(); });
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ if(inkMode) saveInkNow(); else save(); }});

/* ===== v5: sidebar drawer, writing tools, timer, adventure ===== */
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){toast('Storage full - export a backup & clear old ink')}}
function setNav(o){document.body.classList.toggle('nav-open',o);const m=$('#menu');if(m){m.setAttribute('aria-expanded',o);m.setAttribute('aria-label',o?'Close menu':'Open menu')}}
$('#menu').onclick=()=>setNav(!document.body.classList.contains('nav-open'));$('#scrim').onclick=$('#sideClose').onclick=()=>setNav(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')setNav(false)});window.addEventListener('resize',()=>{if(innerWidth>900)setNav(false)});
const P=(()=>{try{return JSON.parse(localStorage.getItem('ezzPrefs'))||{}}catch{return{}}})();Object.assign(P,{fs:P.fs||18,font:P.font||'sans',paper:P.paper||'lines',light:!!P.light,col:!!P.col});
const sp=()=>localStorage.setItem('ezzPrefs',JSON.stringify(P));
function applyPrefs(){document.body.classList.toggle('light',P.light);document.body.classList.toggle('collapsed',P.col);const pa=$('#paper');pa.style.setProperty('--fs',P.fs+'px');pa.style.setProperty('--lh',Math.round(P.fs*1.8)+'px');pa.dataset.font=P.font;['lines','dots','grid','blank'].forEach(c=>pa.classList.toggle(c,c===P.paper));$$('[data-paper]').forEach(b=>b.classList.toggle('active',b.dataset.paper===P.paper));$('#fontSel').value=P.font;$('#theme .ico').textContent=P.light?'☀':'☾';$('#collapse .ico').textContent=P.col?'»':'«';$('meta[name=theme-color]').content=P.light?'#f3f4fb':'#080b14'}
$('#theme').onclick=()=>{P.light=!P.light;sp();applyPrefs()};$('#collapse').onclick=()=>{P.col=!P.col;sp();applyPrefs()};
$$('[data-paper]').forEach(b=>b.onclick=()=>{P.paper=b.dataset.paper;sp();applyPrefs()});
$('#fsUp').onclick=()=>{P.fs=Math.min(32,P.fs+2);sp();applyPrefs()};$('#fsDown').onclick=()=>{P.fs=Math.max(13,P.fs-2);sp();applyPrefs()};$('#fontSel').onchange=e=>{P.font=e.target.value;sp();applyPrefs()};
// sidebar external links
(()=>{const L=(window.EZZ_LINKS||[]).filter(x=>x&&x.label),box=$('#sideLinks');if(!L.length)return;$('#linksHead').hidden=false;L.forEach(x=>{const a=document.createElement('a');a.className='navlink';a.innerHTML=`<span class="ico">${esc(x.icon||'↗')}</span><span class="lbl">${esc(x.label)}</span>`;let u=(x.url||'').trim();if(u&&!/^https?:\/\//i.test(u))u='https://'+u;if(u){a.href=u;if(x.newTab!==false){a.target='_blank';a.rel='noopener noreferrer'}}else{a.href='#';a.onclick=e=>{e.preventDefault();toast('Link not set - open links.js and paste your address')}}box.append(a)})})();
// text formatting
const tx=$('#noteText');function fire(){tx.focus();tx.dispatchEvent(new Event('input'))}
function wrapSel(a,b){const s=tx.selectionStart,e=tx.selectionEnd,t=tx.value.slice(s,e);tx.setRangeText(a+t+b,s,e,'end');if(!t)tx.setSelectionRange(s+a.length,s+a.length);fire()}
function prefixLines(p){const v=tx.value;let s=v.lastIndexOf('\n',tx.selectionStart-1)+1,e=v.indexOf('\n',tx.selectionEnd);if(e<0)e=v.length;const ls=v.slice(s,e).split('\n'),all=ls.every(l=>l.startsWith(p));tx.setRangeText(ls.map(l=>all?l.slice(p.length):p+l).join('\n'),s,e,'end');fire()}
const FM={b:()=>wrapSel('**','**'),i:()=>wrapSel('_','_'),h:()=>prefixLines('# '),ul:()=>prefixLines('• '),todo:()=>prefixLines('☐ '),q:()=>prefixLines('> '),code:()=>wrapSel('`','`'),hr:()=>{tx.setRangeText('\n──────────\n',tx.selectionEnd,tx.selectionEnd,'end');fire()}};
$$('[data-fmt]').forEach(b=>b.onclick=()=>FM[b.dataset.fmt]());
tx.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&k==='b'){e.preventDefault();FM.b()}else if((e.ctrlKey||e.metaKey)&&k==='i'){e.preventDefault();FM.i()}else if((e.ctrlKey||e.metaKey)&&k==='s'){e.preventDefault();$('#saveNote').click()}else if(e.key==='Enter'&&!e.shiftKey){const v=tx.value,s=v.lastIndexOf('\n',tx.selectionStart-1)+1,line=v.slice(s,tx.selectionStart),m=line.match(/^(• |☐ |☑ )/);if(m){e.preventDefault();if(line===m[1]){tx.setRangeText('',s,tx.selectionStart,'end')}else tx.setRangeText('\n'+(m[1]==='• '?'• ':'☐ '),tx.selectionStart,tx.selectionEnd,'end');fire()}}});
tx.addEventListener('click',()=>{const v=tx.value,p=tx.selectionStart,s=v.lastIndexOf('\n',p-1)+1;if(p-s<=1&&/^[☐☑]/.test(v.slice(s,s+1))&&tx.selectionStart===tx.selectionEnd&&p===s+1){tx.setRangeText(v[s]==='☐'?'☑':'☐',s,s+1,'end');fire()}});
function words(){const t=$('#noteText').value,w=(t.trim().match(/\S+/g)||[]).length;$('#wordCount').textContent=w+' words · '+t.length+' chars · ~'+Math.max(1,Math.round(w/200))+' min'}
// page title / delete / export / notebook management
$('#editorName').oninput=e=>{const n=currentNote();if(n){n.name=e.target.value;save();const a=$('.note-item.active');if(a)a.textContent=n.name||'Untitled'}};
$('#saveNote').onclick=()=>{if(inkMode)saveInkNow();save();markStudy();db.xp+=2;save();renderAll();toast('Saved ✦ +2 XP')};
$('#deleteNote').onclick=()=>{const b=currentBook(),n=currentNote();if(!n)return;if(b.notes.length<2)return toast('A notebook needs at least one page');if(!confirm('Delete this page?'))return;b.notes=b.notes.filter(x=>x.id!==n.id);db.currentNote=b.notes[0].id;save();renderAll()};
$('#exportNote').onclick=()=>{const n=currentNote();if(!n)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([(n.name||'Untitled')+'\n\n'+tx.value],{type:'text/plain'}));a.download=(n.name||'note').replace(/[^\w\- ]+/g,'')+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('#renameBook').onclick=()=>{const b=currentBook(),v=prompt('Notebook name',b.name);if(v&&v.trim()){b.name=v.trim();save();renderAll()}};
$('#deleteBook').onclick=()=>{if(db.books.length<2)return toast('Keep at least one notebook');const b=currentBook();if(!confirm('Delete notebook "'+b.name+'" and all its pages?'))return;db.books=db.books.filter(x=>x.id!==b.id);db.currentBook=db.books[0].id;db.currentNote=db.books[0].notes[0]?.id;save();renderAll()};
$('#swatches').innerHTML=['#161326','#e11d48','#2563eb','#16a34a','#f59e0b'].map(c=>`<button class="sw" data-c="${c}" style="background:${c}" aria-label="Ink ${c}"></button>`).join('');
$$('.sw').forEach(b=>b.onclick=()=>{$('#inkColor').value=b.dataset.c;if(inkTool==='eraser')$('#penTool').click()});
// streak / daily state
function day(){const t=new Date().toDateString();if(!db.day||db.day.date!==t)db.day={date:t,minutes:0,notes:0,event:false,boss:false};return db.day}
function markStudy(){const t=new Date().toDateString();if(db.lastStudy===t)return;const y=new Date(Date.now()-864e5).toDateString();db.streak=db.lastStudy===y?(db.streak||0)+1:1;db.lastStudy=t}
const prevNew=$('#newNote').onclick;$('#newNote').onclick=()=>{prevNew();day().notes++;markStudy();save();renderAll()};
tx.addEventListener('input',()=>{if(tx.value.trim())markStudy()});
// timer (uses end time, so it stays accurate in background tabs)
let total=1500,endAt=0;
function renderTimer(){const m=Math.floor(seconds/60),s=seconds%60;$('#timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');document.title=interval?$('#timer').textContent+' · EZZ Notes':'EZZ Notes • Study Universe'}
function beep(){try{const c=new(window.AudioContext||window.webkitAudioContext)();[660,880,1100].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.2,c.currentTime+i*.25);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.25+.22);o.start(c.currentTime+i*.25);o.stop(c.currentTime+i*.25+.25)})}catch{}}
function stopT(){clearInterval(interval);interval=null}
function tick(){seconds=Math.max(0,Math.ceil((endAt-Date.now())/1000));renderTimer();if(seconds<=0){stopT();const m=Math.round(total/60);db.focusMinutes+=m;day().minutes+=m;db.xp+=Math.max(10,m*4);markStudy();save();beep();toast('Session complete! +'+Math.max(10,m*4)+' XP');seconds=total;renderTimer();$('#startFocus').textContent='Launch Session';renderAll()}}
$('#startFocus').onclick=()=>{if(interval){stopT();$('#startFocus').textContent='Resume Session';renderTimer();return}endAt=Date.now()+seconds*1000;interval=setInterval(tick,250);$('#startFocus').textContent='Pause Session';tick()};
$('#resetFocus').onclick=()=>{stopT();seconds=total;renderTimer();$('#startFocus').textContent='Launch Session'};
$$('.presets button').forEach(b=>{b.onclick=()=>{stopT();total=seconds=+b.dataset.min*60;renderTimer();$('#startFocus').textContent='Launch Session';$$('.presets button').forEach(x=>x.classList.toggle('active',x===b))};if(b.dataset.min==='25')b.classList.add('active')});
// adventure mode
const STAGES=[[0,'🌑','Uncharted Space','Complete missions and focus sessions to awaken your galaxy.'],[250,'🌒','Awakening Nebula','Gas clouds glow as your knowledge grows.'],[600,'🌍','Living World','Life appears on your first planet!'],[1200,'🪐','Ringed Giant','Your universe has rings, moons and stories.'],[2500,'🌌','Living Galaxy','You built a whole galaxy. Legendary.']],PETS=[[0,'🐣','Baby Explorer'],[250,'🐥','Curious Scout'],[600,'🦊','Star Fox'],[1200,'🐲','Nova Dragon'],[2500,'🦄','Cosmic Legend']];
function renderAdventure(){const xp=db.xp,d=day(),today=new Date().toDateString(),md=db.missions.filter(m=>m.doneOn===today).length;let i=0;STAGES.forEach((s,k)=>{if(xp>=s[0])i=k});const st=STAGES[i],nx=STAGES[i+1];$('#corePlanet').textContent=st[1];$('#universeLevel').textContent=level();$('#universeStage').textContent=st[2];$('#universeMessage').textContent=st[3];$('#universeProgress').style.width=(nx?Math.round((xp-st[0])/(nx[0]-st[0])*100):100)+'%';$('#universeNext').textContent=nx?'Next evolution at '+nx[0]+' XP ('+(nx[0]-xp)+' to go)':'Max evolution reached 🎉';
let pi=0;PETS.forEach((p,k)=>{if(xp>=p[0])pi=k});$('#petOrb').textContent=PETS[pi][1];$('#petStage').textContent=PETS[pi][2];const en=Math.min(100,Math.round((d.minutes/60*60)+md*15+d.notes*10));$('#petEnergy').style.width=en+'%';$('#petText').textContent=en>=100?'Nova is full of energy! ⚡':'Study today to give Nova energy ('+en+'%)';
const ok=md>=2;$('#eventStatus').textContent=Math.min(md,2)+' / 2 missions'+(d.event?' · claimed ✓':'');$('#eventClaim').disabled=!ok||d.event;$('#eventClaim').textContent=d.event?'Claimed ✓':'Claim Reward';
const steps=[['Complete 3 missions',md>=3,Math.min(md,3)+'/3'],['Study 60 minutes',d.minutes>=60,Math.min(d.minutes,60)+'/60'],['Create a page',d.notes>=1,Math.min(d.notes,1)+'/1']],done=steps.filter(s=>s[1]).length;$('#bossHp').style.width=(100-Math.round(done/3*100))+'%';$('#bossSteps').innerHTML=steps.map(s=>`<div class="bstep ${s[1]?'ok':''}">${s[1]?'✓':'○'} ${s[0]} <small>${s[2]}</small></div>`).join('');
if(done===3&&!d.boss){d.boss=true;db.xp+=150;save();toast('Boss defeated! +150 XP 👾');renderStats()}$('#bossName').textContent=d.boss?'Boss defeated today ✓':'The Procrastination Monster'}
$('#eventClaim').onclick=()=>{const d=day();if(d.event)return;d.event=true;db.xp+=50;save();toast('Meteor bonus! +50 XP ☄️');renderAll()};
function renderAll(){renderStats();renderMissions();renderBooks();renderEditor();renderMap();renderBadges();renderAdventure()}
applyPrefs();renderAll();renderTimer();
