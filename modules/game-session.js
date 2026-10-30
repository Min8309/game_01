/* Local save slots, optional timed challenges and event-driven horror. */
(function(){'use strict';
 const PREFIX='gyeongseong-session-v1-',PROFILE=PREFIX+'rewards';
 const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
 const time=ms=>`${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
 window.addEventListener('sikjasil-ready',event=>{
  const g=event.detail,h=g.historyGame,timer=g.playTimer,exit=h.exitRoom,dark=g.mobileDarkroom,archive=g.mobileArchive;
  const S=g.session={mode:'free',started:false,finished:false,hints:0,deadline:null,elapsedBase:0,startedWall:0,name:'익명의 기록자',storageOK:true};window.GyeongSession=S;
  let restoring=false,pendingResume=true,prepared=false,lastSave='',queue=[],seen=new Set(),lastScare=-Infinity;
  const profile=()=>{const p=read(PROFILE);return p&&typeof p==='object'&&!Array.isArray(p)?p:{};};
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{S.storageOK=false;status.textContent='이 브라우저에서는 저장할 수 없습니다. 저장 공간·개인정보 설정을 확인하세요.';return false;}}
  function remove(key){try{localStorage.removeItem(key);}catch{}}
  S.elapsed=()=>S.mode==='challenge'&&S.deadline?Math.max(0,600000-(S.deadline-Date.now())):S.elapsedBase+(S.started?Date.now()-S.startedWall:0);
  const completed=()=>h.state.solved.size===h.questions.length&&exit.mapPuzzle.solved;
  const reading=()=>g.interactionManager.isInspecting||g.notebookUI.isOpen||!!document.querySelector('dialog[open]')||document.hidden;
  const slot=()=>PREFIX+S.mode;const ready=()=>g.ghostEncounters.ready&&g.performanceControls.sceneReady;
  const count=()=>h.state.solved.size+Number(exit.mapPuzzle.solved);
  function enqueue(id){if(!S.started||S.finished||restoring||seen.has(id))return;seen.add(id);if(queue.length<4)queue.push(id);}
  function snapshot(){return{version:1,mode:S.mode,name:S.name,hints:S.hints,deadline:S.deadline,elapsed:S.elapsed(),solved:[...h.state.solved],readRecords:[...h.readRecords],attempts:[...h.state.attempts],inventory:g.sharedInventory.items(),position:g.camera.position.toArray(),rotation:[g.camera.rotation.x,g.camera.rotation.y],map:{key:exit.keyPlaced,route:exit.mapPuzzle.route,solved:exit.mapPuzzle.solved},cabinet:{discovered:h.cabinet.discovered,opened:h.cabinet.drawers.map(d=>d.opened)},curtains:dark.curtains.map(c=>c.opened),seen:[...seen],savedAt:Date.now()};}
  S.save=(force=false)=>{if(!S.started||S.finished||g.gameEnded||restoring)return;const data=snapshot(),serialized=JSON.stringify({...data,savedAt:0,elapsed:0});if((force||serialized!==lastSave)&&write(slot(),data)){lastSave=serialized;status.textContent='진행 자동 저장됨 · 이 브라우저에서 이어하기';}};
  function restore(data){
   if(!data||data.version!==1||data.mode!==S.mode||!Array.isArray(data.solved))return false;
   restoring=true;const valid=new Set(h.questions.map(q=>q.id));h.state.solved=new Set(data.solved.filter(id=>valid.has(id)));h.readRecords=new Set([...(Array.isArray(data.readRecords)?data.readRecords:[]),...h.state.solved].filter(id=>valid.has(id)));h.state.attempts=new Map((Array.isArray(data.attempts)?data.attempts:[]).filter(a=>Array.isArray(a)&&valid.has(a[0])&&Number.isInteger(a[1])&&a[1]>=0));
   for(const item of g.sharedInventory.items())g.sharedInventory.removeItem(item.id);
   for(const item of (Array.isArray(data.inventory)?data.inventory:[]).slice(0,32))if(item&&typeof item.id==='string'&&/^[a-z0-9_-]{1,64}$/.test(item.id))g.sharedInventory.addItem({id:item.id,name:String(item.name||item.id).slice(0,80),desc:String(item.desc||'').slice(0,300)});
   const cabinet=data.cabinet||{};h.cabinet.discovered=!!cabinet.discovered;
   h.cabinet.drawers.forEach((d,i)=>d.opened=!!cabinet.opened?.[i]);
   if(h.cabinet.discovered)h.cabinet.note.userData={isInteractable:true,clueId:'history_cabinet',type:'history_cabinet',name:'서랍 안의 역할표 · 난이도 중',description:'이길용—기자 / 이상범—화가'};
   if(data.map?.key&&h.state.complete('main'))exit.insertKey(h.cursedKey);
   exit.mapPuzzle.route=(Array.isArray(data.map?.route)?data.map.route:[]).filter((id,i,a)=>GyeongExitCaseMap.NODES.some(n=>n.id===id)&&a.indexOf(id)===i).slice(0,4);
   exit.mapPuzzle.solved=exit.keyPlaced&&!!data.map?.solved&&JSON.stringify(exit.mapPuzzle.route)===JSON.stringify(GyeongExitCaseMap.ROUTE);exit.updateBoard();
   if(exit.keyPlaced)g.sharedInventory.removeItem('rusty_key');
   if(exit.keyPlaced||g.sharedInventory.hasItem('rusty_key'))h.cursedKey.visible=false;
   archive.unlocked=h.state.complete('main')&&exit.mapPuzzle.solved;archive.open=archive.unlocked;if(archive.open)archive.updateDoor(2);
   archive.solved=archive.unlocked&&h.state.complete('archive');dark.developed=archive.solved&&h.state.complete('darkroom');
   dark.curtains.forEach((c,i)=>c.opened=!!data.curtains?.[i]&&(i===0?archive.solved:dark.developed));
   for(let i=0;i<3;i++)if(dark.developed&&h.state.solved.has('photo-'+i))dark.missingPerson.choose(i,'record');
   if(h.state.complete('main')&&(exit.keyPlaced||g.sharedInventory.hasItem('rusty_key'))){g.room.openDoor();g.room.updateDoor(5);}
   const p=data.position;let maxX=archive.unlocked?(archive.solved?(dark.developed?41:34.5):27.5):4.5;
   if(Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)&&p[0]>=-4.5&&p[0]<=maxX&&p[2]>=-22.1&&p[2]<=5.5){const floor=GyeongArchiveSpace.groundHeight(p[0]);g.playerControls.standHeight=1.65+floor;g.playerControls.crouchHeight=.95+floor;g.playerControls.currentHeight=1.65+floor;g.camera.position.set(p[0],1.65+floor,p[2]);if(p[0]>=35)dark.missingIntroShown=true;if(Array.isArray(data.rotation)&&data.rotation.every(Number.isFinite)){g.camera.rotation.x=Math.max(-1.4,Math.min(1.4,data.rotation[0]));g.camera.rotation.y=data.rotation[1];}}
   S.hints=Number.isInteger(data.hints)&&data.hints>=0?data.hints:0;S.elapsedBase=Math.max(0,Number(data.elapsed)||0);S.deadline=Number.isFinite(data.deadline)?data.deadline:null;S.name=String(data.name||S.name).slice(0,16);seen=new Set(Array.isArray(data.seen)?data.seen:[]);restoring=false;g.notebookUI.render();return true;
  }
  g.startScreen.querySelector('.intro-desc').textContent='1934년 경성, 시간이 뒤틀린 식자실에 1936년·1942년의 미래 기록까지 흘러들었습니다. 각 자료의 연도를 구분해 사라진 기록을 복원하세요. 자유 탐색은 시간제한 없음·자동 저장, 10분 도전은 특별 완주 보상을 제공합니다.';
  const menu=document.createElement('section');menu.id='session-menu';menu.innerHTML='<div class="session-modes"><button type="button" data-mode="free" aria-pressed="true"><b>자유 탐색</b><small>시간제한 없음 · 자동 저장</small></button><button type="button" data-mode="challenge" aria-pressed="false"><b>10분 도전</b><small>완주 보상 · 한정 호외</small></button></div><label class="session-name">호외에 넣을 이름 <input maxlength="16" placeholder="익명의 기록자" aria-label="호외 이름"></label><p class="session-description"></p><div class="session-start"><button type="button" data-session-new>새로 시작</button><button type="button" data-session-resume>이어하기</button></div><p class="session-save" role="status"></p><p class="session-record"></p>';
  g.startScreen.querySelector('.start-content').insertBefore(menu,g.startScreen.querySelector('.start-btn-pulse'));const status=menu.querySelector('.session-save');
  function refreshMenu(){menu.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===S.mode)));const saved=read(slot());menu.querySelector('[data-session-new]').disabled=!ready();menu.querySelector('[data-session-resume]').disabled=!saved||!ready();menu.querySelector('.session-description').textContent=S.mode==='free'?'기록을 천천히 읽고 탐색하세요. 퀴즈·수첩을 읽는 동안 공포 연출은 멈춥니다.':'14개 기록을 10분 안에 복원하면 전용 호외·후일담·완주 배지. 힌트 버튼 미사용 시 추가 칭호. 읽는 시간과 종료·백그라운드 시간도 제한시간에 포함됩니다.';status.textContent=!ready()?'조사실 리소스 준비 중…':saved?'저장된 진행이 있습니다. 이어하기를 선택하세요.':'이 기기·브라우저에 진행을 자동 저장합니다.';const p=profile();menu.querySelector('.session-record').textContent=p.bestMs?('최고 기록 '+time(p.bestMs)+' · 완주 '+(p.wins||0)+'회'):'';if(p.wins){for(const text of ['10분 내 사건 해결',...(p.noHint?['무힌트 기록관']:[])]){const badge=document.createElement('span');badge.className='session-badge';badge.textContent=text;menu.querySelector('.session-record').appendChild(badge);}}}
  function prepare(){if(prepared||!ready())return;prepared=true;menu.querySelectorAll('button').forEach(b=>b.disabled=true);const saved=read(slot());S.name=menu.querySelector('input').value.trim().slice(0,16)||'익명의 기록자';if(pendingResume&&saved)restore(saved);else remove(slot());document.documentElement.classList.toggle('session-free',S.mode==='free');}
  menu.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(S.started)return;S.mode=b.dataset.mode;pendingResume=true;prepared=false;refreshMenu();});
  for(const type of ['pointerdown','mousedown','touchstart','click','keydown'])menu.addEventListener(type,e=>e.stopPropagation());
  function begin(resume){pendingResume=resume;prepare();g.startScreen.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
  menu.querySelector('[data-session-new]').onclick=()=>begin(false);menu.querySelector('[data-session-resume]').onclick=()=>begin(true);
  g.startScreen.addEventListener('click',e=>{if(!menu.contains(e.target)){if(!ready()){e.stopImmediatePropagation();return;}prepare();}},{capture:true});refreshMenu();Promise.all([g.ghostEncounters.readyPromise,g.performanceControls.warmPromise]).then(()=>{if(!prepared)refreshMenu();});
  const nativeStart=timer.start.bind(timer),nativeUpdate=timer.update.bind(timer),nativeFinish=timer.finish.bind(timer);
  timer.start=function(){if(S.finished)return;if(!S.started){prepare();S.started=true;S.startedWall=Date.now();if(S.mode==='challenge'&&!S.deadline)S.deadline=Date.now()+600000;}
   if(S.mode==='free'){if(this.startedAt===null)this.startedAt=this.now();this.display.classList.add('running');this.update();}else{nativeStart();this.startedAt=this.now()-(600000-(S.deadline-Date.now()));nativeUpdate();}S.save();};
  timer.update=function(){if(S.mode==='challenge'){if(S.deadline)this.startedAt=this.now()-(600000-(S.deadline-Date.now()));return nativeUpdate();}if(!S.started)return;this.display.innerHTML='<span>복원 기록</span><strong>'+count()+' / 14</strong><small></small>';this.display.querySelector('small').textContent=document.getElementById('qtText')?.textContent||'주변 단서를 조사하세요';g.props.setCountdown('自由探索');};
  timer.finish=function(){if(S.mode==='free')return;remove(slot());return nativeFinish();};
  document.addEventListener('click',e=>{if(!S.started||S.finished)return;const b=e.target.closest('button');if(b&&/힌트/.test(b.textContent)){S.hints++;S.save();}},true);
  const saveSoon=()=>queueMicrotask(()=>S.save());for(const method of ['answer','setClock']){const old=h.state[method].bind(h.state);h.state[method]=(...args)=>{const before=h.state.solved.size,result=old(...args);if(h.state.solved.size>before)enqueue('record-'+args[0]);saveSoon();return result;};}
  const open=h.cabinet.open.bind(h.cabinet);h.cabinet.open=i=>{open(i);if(h.cabinet.drawers[i]?.opened)enqueue('drawer-'+i);saveSoon();};
  for(const method of ['select','reset','submit']){const old=exit.mapPuzzle[method].bind(exit.mapPuzzle);exit.mapPuzzle[method]=(...args)=>{const result=old(...args);if(method==='select'&&result)enqueue('map-connection');saveSoon();return result;};}
  window.addEventListener('inventory-changed',()=>{if(g.sharedInventory.hasItem('rusty_key'))enqueue('key-found');saveSoon();});
  const director=g.ghostEncounters,updateGhost=director.update.bind(director);director.update=function(now,enabled,elapsed){if(this.stopped)return;this.popupSound?.prepare?.();if(reading()||!enabled){this.hide();return;}if(!this.active&&queue.length&&now-lastScare>8000){queue.shift();lastScare=now;this.forceTrigger(SikjasilGhosts.GHOSTS[Math.floor(Math.random()*SikjasilGhosts.GHOSTS.length)].id);}return updateGhost(now,!!this.active,elapsed);};
  const roomAudio=exit.horror.audio,updateRoomAudio=roomAudio.update.bind(roomAudio);roomAudio.update=(inside,pan)=>updateRoomAudio(inside&&!reading(),pan);
  const tension=g.tensionDirector,updateTension=tension.update.bind(tension);tension.update=()=>{if(reading()){tension.silence();return;}return updateTension();};
  const inspect=g.interactionManager.triggerInspect.bind(g.interactionManager);g.interactionManager.triggerInspect=(...args)=>{director.hide();tension.silence();roomAudio.stop();return inspect(...args);};
  const openNotebook=g.notebookUI.open.bind(g.notebookUI);g.notebookUI.open=(...args)=>{director.hide();tension.silence();roomAudio.stop();return openNotebook(...args);};
  const effect=archive.playPuzzleEffect.bind(archive);archive.playPuzzleEffect=kind=>{if(reading()){enqueue('room-'+kind);return;}effect(kind);};
  S.complete=()=>{if(S.finished)return S.result;const elapsed=S.elapsed(),qualified=S.mode==='challenge'&&S.started&&completed()&&elapsed<600000;S.finished=true;S.result={qualified,elapsed,name:S.name,hints:S.hints,noHint:qualified&&S.hints===0};remove(slot());if(qualified){const p=profile();p.wins=(Number(p.wins)||0)+1;p.bestMs=Number.isFinite(p.bestMs)?Math.min(p.bestMs,elapsed):elapsed;p.noHint=!!p.noHint||S.result.noHint;p.last={...S.result,date:new Date().toISOString()};write(PROFILE,p);}return S.result;};
  S.renderRewards=panel=>{const r=S.complete(),section=document.createElement('section');section.className='session-rewards yk-end-ui';panel.appendChild(section);if(!r.qualified){section.innerHTML='<h3>기록 복원 완료 · 14 / 14</h3><p>본편의 모든 기록과 엔딩을 확인했습니다. 10분 도전에서는 전용 호외와 추가 후일담을 수집할 수 있습니다.</p>';return;}
   const title=document.createElement('h3');title.textContent='號外 · 10분 내 사건 해결';section.appendChild(title);const info=document.createElement('p');info.textContent=r.name+' · '+time(r.elapsed)+' · 14/14 복원 · '+(r.noHint?'무힌트 기록관':'경성 사건 해결사');section.appendChild(info);
   const story=document.createElement('details');story.innerHTML='<summary>도전 완주 후일담 · 지워지지 않은 이름</summary><p>새벽 네 시의 윤전기에는 마지막 지면 한 장이 남아 있었다. 실종자 명단에서 당신의 이름이 사라지고, 그 자리에 “기록을 되찾은 사람”이라는 문장이 새겨졌다. 붉은 실 끝의 봉투에는 다음 사건의 주소가 적혀 있었다.</p>';section.appendChild(story);
   const download=document.createElement('button');download.type='button';download.textContent='한정 호외 카드 저장 (PNG)';download.onclick=()=>{const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const c=canvas.getContext('2d');c.fillStyle='#d9c8a0';c.fillRect(0,0,1080,1440);c.strokeStyle='#3e2c1b';c.lineWidth=6;c.strokeRect(48,48,984,1344);c.textAlign='center';c.fillStyle='#271c14';c.font='bold 100px serif';c.fillText('京城日報 號外',540,220);c.font='48px serif';c.fillText('붉은 실의 사건 · 특별 완주판',540,330);c.font='bold 68px serif';c.fillText(r.name,540,550);c.font='52px serif';c.fillText('기록 복원 14 / 14',540,710);c.fillText('완료 시간 '+time(r.elapsed),540,810);c.fillStyle='#8e2520';c.fillText(r.noHint?'無提示 · 무힌트 기록관':'10분 내 사건 해결',540,990);c.fillStyle='#51412c';c.font='30px serif';c.fillText('경성야록 · 창작 사건 게임',540,1240);const a=document.createElement('a');a.download='경성야록-도전완주-호외.png';a.href=canvas.toDataURL('image/png');a.click();};section.appendChild(download);
  };
  const tick=setInterval(()=>{if(S.finished)return;if(S.mode==='free')timer.update();S.save();},5000);window.addEventListener('pagehide',()=>{S.save(true);clearInterval(tick);});document.addEventListener('visibilitychange',()=>{if(document.hidden)S.save(true);});
 });
})();
