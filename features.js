(() => {
'use strict';
const api=window.EditorV5,$=s=>document.querySelector(s),config=api.getConfig();
const trajectories={'straight':'Строго прямо (вправо)','strict-left':'Строго влево','strict-right':'Строго вправо','strict-up':'Строго вверх','strict-down':'Строго вниз'};
for(const [value,label] of Object.entries(trajectories))$('#trajectory').add(new Option(label,value));
$('#trajectory').value=config.target.trajectory;
$('#hitEffect').insertAdjacentHTML('afterend','<label>Что происходит с целью<select id="targetHitAnimation"><option value="fall">Падение с вращением</option><option value="fade">Плавное исчезновение</option><option value="shrink">Уменьшение</option><option value="spin">Вихрь</option><option value="rise">Взлёт вверх</option><option value="pulse">Вспышка с увеличением</option><option value="flip">Переворот</option></select></label>');
$('#targetHitAnimation').value=config.target.hitAnimation||'fall';$('#targetHitAnimation').onchange=e=>{config.target.hitAnimation=e.target.value;api.applyConfig()};
$('#targets').insertAdjacentHTML('beforebegin','<div class="subcard"><label><input id="multiTargetMode" type="checkbox"> Выбирать несколько целей</label><p class="help">Нажмите цели в библиотеке, чтобы добавить их в набор. Загружать можно сразу несколько файлов. В предпросмотре «Цель» перетаскивайте зелёные пунктирные рамки: игра начнётся с этих мест. Количество одновременно задаётся в сложности.</p><div id="targetSet"></div><button type="button" id="clearTargetSet" class="mini">Очистить набор</button></div>');
function renderSet(){const box=$('#targetSet');box.replaceChildren();(config.target.items||[]).forEach((item,i)=>{const b=document.createElement('button');b.className='mini';b.textContent=(item.name||item.kind||'Цель')+' ×';b.onclick=()=>{config.target.items.splice(i,1);api.applyConfig();renderSet();showPositions()};box.append(b)})}
function addCurrent(name){config.target.items??=[];config.target.items.push({kind:config.target.kind,custom:config.target.custom,markup:$('#flyingTarget').innerHTML,name,start:{x:15+(config.target.items.length%4)*20,y:35}});api.applyConfig();renderSet()}
$('#targets').addEventListener('click',e=>{const b=e.target.closest('[data-target]');if(b&&$('#multiTargetMode').checked){addCurrent(b.querySelector('small')?.textContent);showPositions()}});
$('#clearTargetSet').onclick=()=>{config.target.items=[];api.applyConfig();renderSet();showPositions()};
const upload=$('#targetUpload');upload.multiple=true;const oldUpload=upload.onchange;
upload.onchange=async e=>{const files=[...e.target.files];if(files.length===1&&!$('#multiTargetMode').checked){oldUpload(e);return}try{const loaded=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{if(!file.type.startsWith('image/')||file.size>15e6)return reject(Error('Выберите изображения до 15 МБ'));const r=new FileReader();r.onload=()=>resolve({file,src:r.result});r.onerror=reject;r.readAsDataURL(file)})));for(const {file,src} of loaded){const img=document.createElement('img');img.src=src;img.alt=file.name;config.target.items??=[];config.target.items.push({kind:'custom',custom:src,name:file.name,markup:img.outerHTML,start:{x:15+(config.target.items.length%4)*20,y:35}})}api.applyConfig();renderSet();showPositions()}catch(err){alert(err.message)}finally{upload.value=''}};
function showPositions(){document.querySelectorAll('.target-position').forEach(x=>x.remove());if($('#gameStage').classList.contains('testing')||document.body.classList.contains('v8-player-mode')||window.__editorPreviewScreen!=='target')return;$('#flyingTarget').getAnimations().forEach(a=>a.cancel());$('#flyingTarget').style.display='none';const items=config.target.items?.length?config.target.items:[{markup:$('#flyingTarget').innerHTML,start:config.target.start||{x:40,y:40}}];items.forEach((item,i)=>{const el=document.createElement('div');el.className='target-position';el.innerHTML='<div class="target-preview-art">'+item.markup+'</div>';el.title='Перетащите стартовую позицию';const pos=item.start||{x:40,y:40};el.style.cssText=`left:${pos.x}%;top:${pos.y}%;width:${config.target.size}px;height:${config.target.size}px`;$('#gameStage').append(el);let drag;el.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const r=el.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};el.setPointerCapture(e.pointerId)};el.onpointermove=e=>{if(!drag)return;const r=$('#gameStage').getBoundingClientRect(),x=Math.max(0,Math.min(100-el.offsetWidth/r.width*100,(e.clientX-r.left-drag.dx)/r.width*100)),y=Math.max(0,Math.min(100-el.offsetHeight/r.height*100,(e.clientY-r.top-drag.dy)/r.height*100));item.start={x,y};if(!config.target.items?.length)config.target.start={x,y};el.style.left=x+'%';el.style.top=y+'%'};el.onpointerup=el.onpointercancel=e=>{drag=null;api.saveNow();el.releasePointerCapture(e.pointerId)}})}
document.addEventListener('click',e=>{if(e.target.closest('[data-preview],#toggleTest,#restartGame'))setTimeout(showPositions)});document.addEventListener('input',()=>setTimeout(showPositions));document.addEventListener('change',()=>setTimeout(showPositions));document.addEventListener('aimquiz:project-loaded',()=>{renderSet();showPositions()});
// Preview uses the same particle renderer and hit keyframes as the running game.
let effectTimer;
function previewTargetEffect(motion=false){
 if($('#gameStage').classList.contains('testing')||document.body.classList.contains('v8-player-mode'))return;
 window.EditorPreviewV8.display('target');showPositions();
 const stage=$('#gameStage'),rect=stage.getBoundingClientRect();
 let layer=$('#targetEffectPreview');if(!layer){layer=document.createElement('div');layer.id='targetEffectPreview';layer.className='particle-layer target-effect-preview';stage.append(layer)}layer.replaceChildren();
 document.querySelectorAll('.target-position').forEach((el,i)=>{
  const art=el.querySelector('.target-preview-art'),box=el.getBoundingClientRect();
  if(motion){const kind=config.target.trajectory==='random'?'straight':config.target.trajectory,points=api.targetPoints(config.target,kind,i,[parseFloat(el.style.left),parseFloat(el.style.top),110,40]);
   const dx=(points[2]-points[0])*rect.width/100,dy=(points[3]-points[1])*rect.height/100;
   const lift=kind==='arc'?-100:kind==='wave'?80:kind==='zigzag'?110:0;
   art.animate([{transform:'translate(0,0)'},{offset:.4,transform:`translate(${dx*.4}px,${dy*.4+lift}px)`},{offset:.7,transform:`translate(${dx*.7}px,${dy*.7-(kind==='wave'||kind==='zigzag'?80:0)}px)`},{transform:`translate(${dx}px,${dy}px)`}],{duration:Math.max(.5,+config.target.duration||4)*1000,easing:'linear'});
  }else{
   api.renderHitEffect(config.target,layer,box.left-rect.left+box.width/2,box.top-rect.top+box.height/2,()=>{});
   art.animate(api.hitFrames(config.target.hitAnimation,Math.max(rect.height*.48,rect.bottom-box.top+box.height),520),{duration:760,easing:'cubic-bezier(.38,.02,.88,.55)'});
  }
 });
}
$('#targetHitAnimation').insertAdjacentHTML('afterend','<button id="replayTargetEffect" class="mini" type="button">Повторить эффект</button>');
$('#replayTargetEffect').onclick=()=>previewTargetEffect();
const effectFields=new Set(['hitEffect','targetHitAnimation','effectSize','particleCount','effectColor','effectColor2']);
for(const event of ['input','change'])document.addEventListener(event,e=>{const id=e.target.id;if(effectFields.has(id)||id==='trajectory'||id==='targetDuration'){clearTimeout(effectTimer);effectTimer=setTimeout(()=>previewTargetEffect(id==='trajectory'||id==='targetDuration'),0)}});
const area=$('#v8RoundTaskSource');
function selectedTaskIndex(source=area.value,offset=area.selectionStart){const start=source.lastIndexOf('\n',Math.max(0,offset-1))+1;return api.parseTasks(source.slice(0,start)).tasks.length}
function selectTask(){api.setPreviewTaskIndex(selectedTaskIndex());if(window.__editorPreviewScreen==='task')window.EditorPreviewV8.display('task')}
area.addEventListener('click',selectTask);area.addEventListener('keyup',selectTask);area.addEventListener('input',selectTask);
area.insertAdjacentHTML('beforebegin','<div class="subcard"><label>Картинка к вопросу<input id="taskImageUpload" type="file" accept="image/*"></label><p class="help">Поставьте курсор в строку нужного задания и загрузите картинку. Она появится под вопросом в предпросмотре. Устный вопрос: [устно] Вопрос | Пояснение после проверки.</p></div>');
$('#taskImageUpload').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 const source=area.value,offset=area.selectionStart,round=window.EditorV8.getActiveRound();
 try{
  if(!file.type.startsWith('image/')||file.size>15e6)throw Error('Выберите изображение до 15 МБ');
  const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  const img=new Image();img.src=src;await img.decode();
  const canvas=document.createElement('canvas'),scale=Math.min(1,1000/img.width,800/img.height);canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  if(round!==window.EditorV8.getActiveRound()||area.value!==source)throw Error('Задание изменилось во время загрузки. Выберите картинку ещё раз.');
  const lineStart=source.lastIndexOf('\n',Math.max(0,offset-1))+1,lineEnd=source.indexOf('\n',offset),end=lineEnd<0?source.length:lineEnd,line=source.slice(lineStart,end);
  if(line.trim().startsWith('#'))throw Error('Поставьте курсор в строку задания, а не комментария.');
  // Locate the first answer separator while preserving escaped pipes and math.
  let separator=-1,math='';for(let i=0;i<line.length;i++){if(line[i]==='\\'){i++;continue}if(line[i]==='$'){const token=line[i+1]==='$'?'$$':'$';math=math===token?'':math||token;if(token==='$$')i++;continue}if(line[i]==='|'&&!math){separator=i;break}}
  const insert=lineStart+(separator<0?line.length:separator),token=' ![Картинка]('+canvas.toDataURL('image/webp',.85)+') ';
  const taskIndex=selectedTaskIndex(source,offset);
  area.setRangeText((line.trim()?'':'[устно] Рассмотрите картинку')+token,insert,insert,'end');
  api.setPreviewTaskIndex(taskIndex);area.dispatchEvent(new Event('input',{bubbles:true}));
  setTimeout(()=>{api.setPreviewTaskIndex(taskIndex);window.EditorPreviewV8.display('task')},0);
 }catch(err){alert(err.message)}finally{e.target.value=''}
};
renderSet();
})();
