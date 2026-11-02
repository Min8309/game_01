/* Fictional 1934 case route. Evidence and answers are available inside this room. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GyeongExitCaseMap=api;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const IMAGE='./assets/case-map/investigation-wall.webp';
 const NODES=[
  {id:'station',name:'경성역',time:'21:10',x:29,y:69,detail:'현장 ① · 한서윤의 마지막 목격. 붉은 실을 묶은 소포를 들고 북쪽으로 향했다.'},
  {id:'printshop',name:'종로 인쇄소',time:'21:35',x:49,y:28,detail:'현장 ② · 소포 수령 장부. 납 활자 가루와 같은 붉은 실이 발견됐다.'},
  {id:'bridge',name:'광통교',time:'22:05',x:75,y:52,detail:'현장 ③ · 피살자 정도현의 유류품 발견 기록. 봉투에는 지하 자료실 출입 표식이 있었다.'},
  {id:'archive',name:'지하 자료실',time:'22:40',x:55,y:78,detail:'현장 ④ · 밀봉 봉투 도착. 수령인 이름이 지워져 있다. 사건 기록의 마지막 행선지.'},
  {id:'police',name:'종로 경찰서',time:'21:50',x:76,y:20,detail:'행정 기록 · 실종 신고 접수 시각. 현장 방문이나 소포 이동 기록이 아니다.'},
  {id:'mortuary',name:'감식 기록실',time:'23:00',x:27,y:36,detail:'행정 기록 · 감식 의뢰서 작성 시각. 현장 이동 경로에 포함하지 않는다.'}
 ];
 const ROUTE=['station','printshop','bridge','archive'];
 class Puzzle{
  constructor(){this.keyInserted=false;this.route=[];this.solved=false;this.attempts=0;}
  insertKey(){if(this.keyInserted)return false;this.keyInserted=true;return true;}
  select(id){if(!this.keyInserted||this.solved||!NODES.some(n=>n.id===id)||this.route.includes(id)||this.route.length>=4)return false;this.route.push(id);return true;}
  reset(){if(!this.solved)this.route=[];}
  submit(){if(!this.keyInserted||this.solved||this.route.length!==4)return false;this.attempts++;this.solved=this.route.every((id,i)=>id===ROUTE[i]);return this.solved;}
 }
 function render(game,room,actions){
  const view=game.inspectViewRenderer.viewContainer,bar=game.inspectViewRenderer.actionBar;view.replaceChildren();bar.replaceChildren();
  game.interactionManager.inspectTitleEl.textContent='1934 · 붉은 실의 사건 지도';game.interactionManager.inspectTagEl.textContent='1층 미제사건 조사실 · 사건 연결 퍼즐';
  const puzzle=room.mapPuzzle,host=document.createElement('section');host.className='gm-expansion case-map-puzzle';view.appendChild(host);
  host.innerHTML='<div class="case-heading"><span>京城 未解決事件</span><h2>사라진 사람들, 하나의 행선지</h2><p>열쇠로 지도 잠금을 풀고, 현장 기록 네 곳을 시간순으로 연결하세요.</p></div><div class="case-layout"><div class="case-board" aria-label="인물 사진과 붉은 실로 연결된 경성 사건 지도"><img src="'+IMAGE+'" alt="창작 인물의 흑백 사진, 경성 지도와 붉은 실로 꾸민 조사벽"><svg class="case-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg><div class="case-map-nodes"></div><button type="button" class="case-lock" data-case-insert>열쇠 삽입</button></div><aside class="case-records"><h3>수사 기록</h3><p class="case-fiction">1934년 경성을 배경으로 한 창작 사건입니다. 사진은 AI 생성 소품이며 실제 피해자 사진이 아닙니다.</p><article><b>실종 · 한서윤</b><p>10월 24일 21:10, 경성역에서 마지막으로 목격. 21:35 종로 인쇄소 장부에 같은 붉은 실의 소포가 기록됐다.</p></article><article><b>피살 사건 · 정도현</b><p>22:05 광통교에서 유류품이 발견됐다. 봉투의 표식은 지하 자료실로 이어진다.</p></article><article><b>사라진 수령인</b><p>22:40 지하 자료실에 밀봉 봉투가 도착했다. 수령인 이름만 먹칠돼 있다.</p></article><details><summary>지도를 읽는 방법</summary><p>경찰서의 신고 접수와 감식 의뢰는 행정 기록입니다. 현장 기록 ①~④만 선택하세요. 오답은 다시 연결할 수 있습니다.</p></details></aside></div><div class="case-footer"><p class="case-selection" aria-live="polite"></p><p class="case-feedback" role="status"></p><div class="case-actions"><button type="button" data-case-reset>실 연결 다시 하기</button><button type="button" data-case-submit>연결 확인 · 봉인 해제</button></div></div>';
  const layer=host.querySelector('.case-map-nodes'),svg=host.querySelector('svg'),feedback=host.querySelector('.case-feedback'),selection=host.querySelector('.case-selection'),insert=host.querySelector('[data-case-insert]'),submit=host.querySelector('[data-case-submit]'),reset=host.querySelector('[data-case-reset]');
  function draw(){
   layer.replaceChildren();svg.replaceChildren();
   for(const n of NODES){const button=document.createElement('button');button.type='button';button.className='case-node';button.dataset.caseNode=n.id;button.style.left=n.x+'%';button.style.top=n.y+'%';const order=puzzle.route.indexOf(n.id);button.classList.toggle('selected',order>=0);button.innerHTML='<span class="case-pin">'+(order>=0?order+1:'●')+'</span><span>'+n.name+'<small>'+n.time+'</small></span>';button.disabled=!puzzle.keyInserted||puzzle.solved;button.title=n.detail;button.onclick=()=>{feedback.textContent=n.detail;if(puzzle.select(n.id))draw();};layer.appendChild(button);}
   for(let i=1;i<puzzle.route.length;i++){const a=NODES.find(n=>n.id===puzzle.route[i-1]),b=NODES.find(n=>n.id===puzzle.route[i]),line=document.createElementNS('http://www.w3.org/2000/svg','line');for(const [k,v]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))line.setAttribute(k,v);svg.appendChild(line);}
   insert.disabled=puzzle.keyInserted||!actions.canInsert();insert.textContent=puzzle.solved?'봉인 해제 완료':puzzle.keyInserted?'열쇠 장착됨':'소지한 열쇠 삽입';
   selection.textContent=puzzle.route.length?puzzle.route.map((id,i)=>(i+1)+'. '+NODES.find(n=>n.id===id).name).join(' → '):'연결한 현장 0 / 4';
   submit.disabled=!puzzle.keyInserted||puzzle.route.length!==4||puzzle.solved;reset.disabled=!puzzle.route.length||puzzle.solved;
   if(puzzle.solved)feedback.textContent='네 현장이 하나의 기록으로 이어졌다. 지하 자료실 문이 열렸습니다.';
   else if(!puzzle.keyInserted)feedback.textContent=actions.canInsert()?'붉은 실에 감긴 열쇠를 아래 잠금장치에 삽입하세요.':'식자실에서 머리카락 엉킨 열쇠를 획득한 뒤 이곳으로 가져오세요.';
  }
  insert.onclick=()=>{if(game.gameEnded||!actions.insert())return;feedback.textContent='철컥. 지도 위 현장 네 곳을 연결하세요.';draw();};
  reset.onclick=()=>{puzzle.reset();feedback.textContent='실을 거두었습니다. 현장 기록 ①~④의 시각을 다시 읽어 보세요.';draw();};
  submit.onclick=()=>{if(game.gameEnded)return;if(puzzle.submit()){actions.solved();draw();}else feedback.textContent='연결이 맞지 않습니다. 행정 기록을 제외하고 현장 네 곳을 이른 시각부터 연결하세요.';};
  draw();return host;
 }
 return{Puzzle,NODES,ROUTE,IMAGE,render};
});
