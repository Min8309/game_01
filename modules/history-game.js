/* Shared historical clues: all answers can be inferred inside the game. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GyeongHistoryGame=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
const QUESTIONS=[
 {id:'calendar',room:'main',place:'달력',level:'하',title:'뒤섞인 연도',clue:'『운수 좋은 날』은 1924년 작품이고, 손기정 일장기 말소사건은 1936년이다. 이 방은 서로 다른 시대의 기록을 보관한다.',question:'두 기록을 올바르게 설명한 문장은?',choices:['소설은 사건보다 먼저 나왔다.','소설은 1936년 사건을 보도한 기사다.','두 기록은 같은 해에 만들어졌다.'],answer:0,hints:['달력 옆의 두 연도를 비교하세요.','1924년과 1936년 중 먼저인 것은 무엇인가요?','작품은 사건보다 12년 먼저 나왔습니다.'],explanation:'같은 인물과 연결된 자료라도 작품 발표일과 사건 발생일은 다릅니다.',source:'경성야록 문학관 · 현진건 / 손기정 사건'},
 {id:'clock',kind:'clock',room:'main',place:'멈춘 괘종시계',level:'중',title:'자정에 돌아오는 식자공',initial:3,solution:23*60+47,clue:'시계 안쪽의 쪽지: “기록은 자정을 넘긴 00시 03분. 그가 마지막으로 문을 두드린 것은 이 기록보다 16분 전이다. 바늘을 그 시각으로 되돌려라. 자정을 다시 울리면… 이번에는 네 이름이 지워진다.”',question:'문밖의 발소리가 멎도록, 마지막 두드림의 시각을 맞추세요.',hints:['00시 03분에서 앞으로 가지 말고 16분을 거슬러 올라가세요.','먼저 3분을 빼면 00시 00분입니다. 거기서 13분을 더 되돌리세요.','자정 이전인 23시 47분에 맞추고 봉인을 확인하세요.'],explanation:'00시 03분에서 16분을 되돌리면 전날 23시 47분입니다. 초침이 멈추고 문밖의 발소리가 사라졌습니다.',source:'창작 공포 퍼즐 · 역사적 사건이나 실제 인물의 기록이 아님'},
 {id:'drawer',room:'main',place:'24번 서랍',level:'하',title:'서랍 속 세 장의 종이',clue:'한 장은 당시 신문 지면, 한 장은 현대어 요약, 한 장은 편집국이 새로 쓴 재현 대사이다. 재현 대사는 실제 발언으로 확인된 기록이 아니다.',question:'편집국이 새로 만든 대사에 붙일 표시는?',choices:['당시 기자의 실제 발언','창작 재구성','법원에서 확정된 사실'],answer:1,hints:['누가 언제 만든 자료인지 보세요.','새로 만든 문장과 당시 기록은 다릅니다.','실제 발언이 확인되지 않은 새 대사는 창작 재구성입니다.'],explanation:'원문·요약·창작을 구분해야 합니다. 당시 신문도 오류와 편향을 검토해야 합니다.',source:'경성야록 자료 유형 안내'},
 {id:'proof',room:'main',place:'테이블의 교정지',level:'중',title:'먹칠된 이름',clue:'현진건은 『운수 좋은 날』을 쓴 소설가이며 손기정 일장기 말소사건 당시 동아일보 사회부장이었다. 기사별 집필자는 서명이나 별도 자료로 확인한다.',question:'이 자료로 확인할 수 있는 현진건의 역할은?',choices:['사진 수정 화가만을 맡았다.','백백교의 교주였다.','소설가이자 신문사 사회부장이었다.'],answer:2,hints:['교정지의 작품명과 직책을 읽으세요.','글을 쓰는 역할과 신문사 직책을 함께 고르세요.','소설가 + 사회부장입니다.'],explanation:'작가와 기자의 활동은 연결될 수 있지만 특정 기사의 작성자까지 자동으로 증명하지는 않습니다.',source:'경성야록 인물면 · 현진건'},
 {id:'poster',room:'main',place:'벽의 포스터',level:'중',title:'빛나는 박람회의 그림자',clue:'1929년 조선박람회는 총독부가 통치 성과를 홍보한 행사였다. 화려한 광고와 함께 경복궁의 변화·관람 동원 자료를 비교해야 한다.',question:'포스터와 다른 기록을 함께 읽는 이유는?',choices:['홍보가 강조한 것과 생략한 맥락을 비교하려고','그림은 언제나 거짓이므로','모든 기록이 같은 목적을 가졌으므로'],answer:0,hints:['포스터를 만든 주체와 목적에 주목하세요.','홍보 자료에 모든 사정이 담길까요?','강조점과 생략된 맥락을 비교합니다.'],explanation:'자료의 제작 목적을 확인하고 다른 자료와 대조하면 선전의 성격을 읽을 수 있습니다.',source:'경성야록 부록 · 1929 조선박람회'},
 {id:'cabinet',room:'main',place:'뒤의 캐비닛',level:'중',title:'지워진 역할표',clue:'손기정 일장기 말소사건에서 이길용은 기자, 이상범은 사진 수정에 관여한 화가로 소개된다.',question:'인물의 역할을 올바르게 연결한 것은?',choices:['이길용—화가 / 이상범—선수','이길용—기자 / 이상범—화가','두 사람 모두 마라톤 선수'],answer:1,hints:['캐비닛의 역할표에서 직업을 확인하세요.','기사와 사진은 서로 다른 사람이 담당할 수 있습니다.','이길용은 기자, 이상범은 화가입니다.'],explanation:'사건에 관여한 사람의 역할을 구분해야 보도 과정을 이해할 수 있습니다.',source:'경성야록 문화면 · 손기정 사건'},
 {id:'book',room:'main',place:'복도에 떨어진 책',level:'상',title:'기사와 소설 사이',clue:'박태원의 『우맹』은 백백교 사건을 소재로 한 소설이다. 소설의 대사와 장면을 모두 실제 발언·사건으로 확인할 수는 없다.',question:'이 자료만으로 판단할 수 있는 내용은?',choices:['소설의 모든 대사가 실제 발언이다.','박태원이 최초 사건 기사를 썼다.','실제 사건이 문학의 소재가 되었다.'],answer:2,hints:['소재가 되었다는 말의 범위를 생각하세요.','소설 집필과 최초 뉴스 보도는 다른 일입니다.','확인되는 것은 사건과 작품의 소재 관계입니다.'],explanation:'문학적 재구성과 뉴스 보도는 구분합니다. 최초 보도 기자는 별도 원문 확인이 필요합니다.',source:'경성야록 문학관 · 박태원 『우맹』'},
 {id:'archive-source',room:'archive',place:'자료실 중앙 책상',level:'상',title:'서로 다른 숫자',clue:'백백교 사건의 피해자 수는 자료마다 다르다. 경성야록은 당시 동아일보 보도 기준임을 밝히며 수치를 제시한다.',question:'숫자가 다른 자료를 다룰 때 적절한 방법은?',choices:['출처·날짜·조사 범위를 함께 확인한다.','모든 숫자를 더한다.','가장 큰 숫자를 무조건 정답으로 쓴다.'],answer:0,hints:['숫자 옆의 출처 표시를 확인하세요.','조사 시기와 범위가 다를 수 있습니다.','출처·날짜·범위를 함께 확인해야 합니다.'],explanation:'수치만 외우지 말고 무엇을 언제 집계한 자료인지 확인합니다.',source:'경성야록 사회면 · 백백교 사건'},
 {id:'archive-language',room:'archive',place:'자료실 선반의 책',level:'중',title:'사라지지 않는 글자',clue:'조선어학회는 1933년 한글 맞춤법 통일안을 마련하고 사전 편찬을 추진했다. 1942년 조선어학회 사건으로 활동가들이 탄압받았다.',question:'이 활동의 역사적 의미는?',choices:['올림픽 경기 기록만 정리했다.','우리말과 민족 문화를 지키려 했다.','1933년에 이미 광복을 이루었다.'],answer:1,hints:['책 표지의 우리말·맞춤법·사전이라는 말을 보세요.','언어를 정리하고 기록하는 활동입니다.','우리말과 민족 문화 수호에 연결됩니다.'],explanation:'언어 연구·사전 편찬은 민족 문화 수호와 연결됩니다. 탄압 이후의 노력도 지워 설명하지 않습니다.',source:'교과 연계 설명 · 조선어학회와 문화 수호'},
 {id:'darkroom',room:'darkroom',place:'암실 인화 작업대',level:'중',title:'지워진 가슴',clue:'1936년 베를린 올림픽에서 우승한 손기정은 식민지 현실 속에서 일본 국적으로 출전했다. 일장기를 지운 사진의 보도는 민족의식과 언론 탄압의 문제로 이어졌다.',question:'일장기 말소사건을 이해하는 핵심 맥락은?',choices:['광복 후 독립 국가로 출전했다.','종이가 우연히 찢어졌을 뿐이다.','식민지 현실·민족의식·언론 탄압이다.'],answer:2,hints:['사진이 만들어진 1936년의 조선 상황을 보세요.','우승의 기쁨과 식민지 현실이 함께 있었습니다.','민족의식과 언론 탄압을 함께 읽습니다.'],explanation:'사진의 변화는 단순한 인쇄 오류가 아니라 당시 식민지 현실과 연결됩니다.',source:'경성야록 문화면 · 손기정 일장기 말소사건'},
 {id:'photo-0',room:'photos',place:'초록 집게 사진 ①',level:'하',title:'신문과 시',clue:'심훈의 「오오, 조선의 남아여!」는 손기정 우승에 대한 문학적 반응으로 경성야록에 소개된다. 경기 기록표와 시는 자료의 성격이 다르다.',question:'이 시에서 주로 읽을 수 있는 것은?',choices:['민족적 감정과 문학적 표현','법원 판결문','초 단위 경기 기록의 공식 수정'],answer:0,hints:['시와 경기 기록표의 목적을 비교하세요.','문학은 감정과 생각을 표현합니다.','민족적 감정과 문학적 표현입니다.'],explanation:'문학적 반응과 경기 결과 보도는 같은 자료가 아닙니다.',source:'경성야록 문학관 · 심훈'},
 {id:'photo-1',room:'photos',place:'초록 집게 사진 ②',level:'중',title:'범인이라고 쓰기 전에',clue:'죽첨정 사건 보도에는 무고한 가족을 유력 용의자로 지목한 일이 있었다. 조사 중인 용의자와 유죄가 확인된 범인은 구분해야 한다.',question:'조사 중인 사람을 부르는 적절한 표현은?',choices:['이미 확정된 범인','용의자','반드시 유죄인 사람'],answer:1,hints:['조사 중이라는 조건을 읽으세요.','혐의와 유죄 확정은 다릅니다.','아직 조사 중인 사람은 용의자입니다.'],explanation:'수사 발표를 그대로 유죄 확정처럼 보도하지 않아야 합니다.',source:'경성야록 사회면 · 죽첨정 사건의 오보'},
 {id:'photo-2',room:'photos',place:'초록 집게 사진 ③',level:'상',title:'마지막 지면의 판단',clue:'마리아 사건은 무죄 판결과 미제의 문제를 다룬다. 무죄 판결만으로 다른 범인의 신원이나 사건 자체의 부재를 증명할 수는 없다.',question:'무죄 판결 자료로 말할 수 있는 것은?',choices:['다른 범인의 신원이 확정되었다.','피해 사건이 없었다.','법원은 유죄를 인정하지 않았다.'],answer:2,hints:['판결 자료가 실제로 판단한 범위를 보세요.','알 수 없는 사실을 새로 덧붙이면 안 됩니다.','확인되는 것은 유죄를 인정하지 않았다는 판단입니다.'],explanation:'자료로 확인된 사실과 현재 판단할 수 없는 내용을 구분해야 합니다.',source:'경성야록 사회면 · 마리아 사건'}
];
const ROOMS={main:'1층 식자실',archive:'지하 자료실',darkroom:'암실',photos:'사진 건조방'};
class Progress{
 constructor(){this.solved=new Set();this.attempts=new Map();}
 answer(id,index){const q=QUESTIONS.find(q=>q.id===id);if(!q||q.kind==='clock'||!Number.isInteger(index)||index<0||index>=q.choices.length)return false;this.attempts.set(id,(this.attempts.get(id)||0)+1);if(index!==q.answer)return false;this.solved.add(id);return true;}
 setClock(hour,minute){if(!Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(minute)||minute<0||minute>59)return false;this.attempts.set('clock',(this.attempts.get('clock')||0)+1);if(hour*60+minute!==QUESTIONS.find(q=>q.id==='clock').solution)return false;this.solved.add('clock');return true;}
 remaining(room){return QUESTIONS.filter(q=>q.room===room&&!this.solved.has(q.id));}
 complete(room){return Boolean(ROOMS[room])&&this.remaining(room).length===0;}
}
function install(game){
 let clockMinutes=3;
 const state=new Progress(),archive=game.mobileArchive,dark=game.mobileDarkroom;game.historyGame={state,questions:QUESTIONS,audio:new window.GyeongFeedbackAudio(game.soundManager)};
 const view=game.inspectViewRenderer.viewContainer,bar=game.inspectViewRenderer.actionBar;
 let cabinet,exitRoom;
 const cursedKey=game.props.interactables.find(o=>o.userData.type==='cursed_key');game.historyGame.cursedKey=cursedKey;
 if(cursedKey){cursedKey.userData.clueId='history_cursed_key';cursedKey.userData.description='붉은 실과 머리카락이 엉킨 열쇠. 직접 챙겨야 한다.';
  const T=game.sceneAPI,keySurface=cursedKey.children.find(o=>o.isMesh&&o.material?.map),cutout=new Image();cutout.onload=()=>{if(!keySurface)return;const texture=new T.CanvasTexture(cutout);texture.colorSpace='srgb';keySurface.material.map=texture;keySurface.material.alphaTest=.08;keySurface.material.needsUpdate=true;game.historyGame.keyTextureReady=true;};cutout.src='./assets/history/hair-key.webp';if(keySurface)keySurface.scale.set(1.35,1.35,1);
  const hitbox=new T.Mesh(new T.BoxGeometry(.4,.1,.3),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hitbox.position.y=.025;cursedKey.add(hitbox);
  for(const [w,d,x,z]of [[.4,.009,0,-.15],[.4,.009,0,.15],[.009,.3,-.2,0],[.009,.3,.2,0]]){const edge=new T.Mesh(new T.BoxGeometry(w,.006,d),new T.MeshBasicMaterial({color:0x39c85a}));edge.position.set(x,.012,z);edge.userData.isPuzzleMarker=true;edge.raycast=()=>{};cursedKey.add(edge);}
 }
 function hasExitKey(){return exitRoom.keyPlaced||game.sharedInventory.hasItem('rusty_key');}
 function mainReady(){return state.complete('main')&&hasExitKey();}
 function mainNext(){return exitRoom.keyPlaced?'지하실 문이 열렸습니다. 오른쪽 자료실 문으로 내려가세요.':hasExitKey()?'철문 안 책상 위 종이에 머리카락 엉킨 열쇠를 올려놓으세요.':'1층 왼쪽 선반의 머리카락 엉킨 열쇠를 챙기세요.';}
 function syncDoors(){if(mainReady()&&game.room.openDoor())game.soundManager.playMetalDoorOpen();archive.unlocked=state.complete('main')&&exitRoom.keyPlaced;}
 function node(tag,text,parent){const e=document.createElement(tag);e.textContent=text;if(parent)parent.appendChild(e);return e;}
 function shell(title){view.replaceChildren();bar.replaceChildren();const host=node('section','',view);host.className='gm-expansion history-puzzle';node('h2',title,host);return host;}
 function goal(){const room=game.camera.position.x>=35?'photos':game.camera.position.x>=28?'darkroom':game.camera.position.x>=14?'archive':'main';const remaining=state.remaining(room);const text=remaining.length?`${ROOMS[room]} · 남은 ${remaining.length}개 · 다음: ${remaining[0].place} [${remaining[0].level}]`:room==='main'?('1층 완료 · '+mainNext()):room==='archive'?'자료실 완료 · 끝의 검은 커튼 →':room==='darkroom'?'암실 완료 · 뒤쪽 검은 커튼 →':'모든 기록을 복원했습니다.';const objective=document.getElementById('exploration-objective');if(objective) {if(objective.textContent!==text)objective.textContent=text;objective.hidden=false;}if(archive.notice.textContent!==text)archive.notice.textContent=text;archive.notice.hidden=room==='main';return text;}
 function finishRoom(room){
  if(!state.complete(room))return;
  if(room==='archive'){archive.solved=true;game.sharedInventory.addItem({id:'darkroom_iron_key',name:'암실 철문 열쇠',desc:'자료실의 출처·언어 기록을 복원해 얻은 열쇠.'});archive.playPuzzleEffect('editing');}
  if(room==='darkroom'){dark.developed=true;game.sharedInventory.addItem({id:'developed_press_photo',name:'복원된 손기정 보도사진',desc:'식민지 현실과 언론 탄압의 맥락을 확인한 기록.'});archive.playPuzzleEffect('develop');}
  goal();
 }
 function quiz(id){
  const q=QUESTIONS.find(q=>q.id===id);if(!q)return;
  if(id==='cabinet'&&!cabinet.discovered){const host=shell('캐비닛의 역할표 찾기');node('p','1층 뒤쪽 왼편 철제 캐비닛의 세 번째 서랍에 역할표가 있습니다. 서랍을 열고 안쪽 초록 기록을 조사하세요.',host);return;}
  game.interactionManager.inspectTitleEl.textContent=q.place;
  game.interactionManager.inspectTagEl.textContent=ROOMS[q.room]+' · 난이도 '+q.level;
  const host=shell('');host.querySelector('h2').remove();host.dataset.historyQuestion=id;
  node('h3',q.question,host);const feedback=node('p','',host);feedback.setAttribute('role','status');
  if(state.solved.has(id)){feedback.textContent='✓ 정답 · '+q.explanation;const next=state.remaining(q.room)[0];const text=next?`다음 단계: ${next.place} [난이도 ${next.level}]을 조사하세요.`:q.room==='main'?'다음 단계: '+mainNext():q.room==='archive'?'다음 단계: 자료실 끝 검은 커튼을 열고 암실 인화 작업대로 가세요.':q.room==='darkroom'?'다음 단계: 뒤쪽 검은 커튼을 열고 사진방의 초록 집게 사진을 조사하세요.':'모든 기록을 복원했습니다.';const step=node('p',text,host);step.className='history-next-step';return;}
  else{
   const explanation=node('p',q.clue,host);explanation.className='history-brief';
   if(q.kind==='clock')clockPuzzle(host,feedback,q);
   else{
   const actions=node('div','',host);actions.className='history-answers';
   q.choices.forEach((choice,index)=>{const b=node('button',choice,actions);b.type='button';b.onclick=()=>{
    if(state.solved.has(id)||game.gameEnded)return;
    if(!state.answer(id,index)){feedback.textContent='다시 선택해 보세요. 힌트로 확인할 수 있습니다.';return;}
    game.historyGame.audio.play('correct');
    finishRoom(q.room);
    if(q.room==='photos'){dark.missingPerson.choose(Number(id.slice(-1)),'record');if(state.complete('photos')){window.GyeongMissingPerson.render(dark,Number(id.slice(-1)));return;}}
    quiz(id);
   };});
   }
  }
  let level=0;const hintText=node('p','',host);hintText.className='gp-hints';hintText.hidden=true;const hint=node('button','힌트 1 보기',host);hint.type='button';hint.onclick=()=>{hintText.hidden=false;hintText.textContent=q.hints[Math.min(level,2)];level=Math.min(level+1,3);hint.textContent=level<3?`힌트 ${level+1} 보기`:'마지막 힌트 다시 보기';};
 }
 function clockPuzzle(host,feedback,q){
  node('small','창작 공포 퍼즐 · 24시간 표시 · 버튼으로 바늘을 조작하세요.',host);
  const layout=node('div','',host);layout.className='history-clock-layout';
  const dial=node('div','',layout);dial.className='history-clock-dial';dial.setAttribute('aria-hidden','true');
  for(const [text,cls]of [['12','top'],['3','right'],['6','bottom'],['9','left']])node('span',text,dial).className='clock-number '+cls;
  const hourHand=node('i','',dial);hourHand.className='clock-hand clock-hour';const minuteHand=node('i','',dial);minuteHand.className='clock-hand clock-minute';node('i','',dial).className='clock-pin';
  const controls=node('div','',layout);controls.className='history-clock-controls';
  const readout=node('output','',controls);readout.className='history-clock-readout';readout.setAttribute('aria-label','설정한 시각');readout.setAttribute('aria-live','polite');
  function refresh(){const hour=Math.floor(clockMinutes/60),minute=clockMinutes%60;readout.textContent=String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0');hourHand.style.transform=`rotate(${(hour%12)*30+minute*.5}deg)`;minuteHand.style.transform=`rotate(${minute*6}deg)`;}
  const buttons=node('div','',controls);buttons.className='history-clock-adjust';
  for(const [label,delta]of [['시 −',-60],['시 +',60],['분 −',-1],['분 +',1]]){const b=node('button',label,buttons);b.type='button';b.setAttribute('aria-label',delta===-60?'한 시간 뒤로':delta===60?'한 시간 앞으로':delta===-1?'일 분 뒤로':'일 분 앞으로');b.onclick=()=>{clockMinutes=(clockMinutes+delta+1440)%1440;refresh();};}
  const reset=node('button','처음 시각으로 되돌리기',controls);reset.type='button';reset.onclick=()=>{clockMinutes=q.initial;refresh();feedback.textContent='기록 속 시각으로 돌아왔습니다. 마지막 두드림은 16분 전입니다.';};
  const submit=node('button','시계의 봉인 확인',host);submit.type='button';submit.onclick=()=>{
   if(game.gameEnded||state.solved.has('clock'))return;
   if(!state.setClock(Math.floor(clockMinutes/60),clockMinutes%60)){feedback.textContent='똑… 똑… 문밖의 발소리가 한 걸음 가까워졌습니다. 시각이 맞지 않습니다. 다시 시도하세요.';dial.classList.remove('clock-wrong');void dial.offsetWidth;dial.classList.add('clock-wrong');return;}
   game.historyGame.audio.play('correct');finishRoom(q.room);quiz('clock');
  };
  refresh();
 }
 const locations={clock:'1층 식자실의 멈춘 괘종시계를 직접 조사하세요.',calendar:'1층 식자실 벽의 달력을 조사하세요.',drawer:'1층 테이블 아래 24번 서랍을 조사하세요.',proof:'1층 테이블 위 교정지를 조사하세요.',poster:'1층 뒤쪽 철제 캐비닛 옆 벽에 붙은 박람회 포스터를 조사하세요.',cabinet:'1층 뒤쪽 왼편 철제 캐비닛의 세 번째 서랍을 열고 안쪽 역할표를 조사하세요.',book:'1층 복도 바닥의 낡은 하드커버 책을 조사하세요.','archive-source':'지하 자료실 중앙 책상의 기록을 조사하세요.','archive-language':'지하 자료실 선반의 초록색 우리말 기록을 조사하세요.',darkroom:'암실 인화 작업대를 조사하세요.','photo-0':'사진 건조방의 초록 집게 사진 ①을 조사하세요.','photo-1':'사진 건조방의 초록 집게 사진 ②를 조사하세요.','photo-2':'사진 건조방의 초록 집게 사진 ③을 조사하세요.'};
 function guidance(q,host){
  const item=node('details','',host);item.dataset.historyGuide=q.id;
  node('summary',`${q.place} · 난이도 ${q.level}`,item);
  node('p','위치: '+locations[q.id],item);
  let level=0;const text=node('p','',item);text.hidden=true;
  const hint=node('button','힌트 1 보기',item);hint.type='button';
  hint.onclick=()=>{text.hidden=false;text.textContent=q.hints[Math.min(level,2)];level=Math.min(level+1,3);hint.textContent=level<3?`힌트 ${level+1} 보기`:'마지막 힌트 다시 보기';};
 }
 function list(room,title){
  const host=shell(title);node('p','여기서는 남은 게임의 위치와 힌트만 확인할 수 있습니다. 안내창을 닫고 해당 물건을 직접 찾아 조사하면 퀴즈가 열립니다.',host);
  const remaining=state.remaining(room);node('p',`남은 게임 ${remaining.length}개`,host);
  for(const q of remaining)guidance(q,host);
  if(!remaining.length)node('p','이 방의 기록을 모두 복원했습니다.',host);
  node('p',goal(),host);
 }
 function directGuide(id){const q=QUESTIONS.find(q=>q.id===id),host=shell('기록이 있는 곳');node('p','이 물건에서는 퀴즈를 풀 수 없습니다. 아래 위치로 이동해 해당 기록을 조사하세요.',host);guidance(q,host);host.querySelector('details').open=true;}
 function route(){
  game.interactionManager.inspectTitleEl.textContent='출구 철문';game.interactionManager.inspectTagEl.textContent='1층 · 완료 체크리스트';const host=shell('');host.querySelector('h2').remove();host.dataset.exitChecklist='true';
  const checks=QUESTIONS.filter(q=>q.room==='main').map(q=>({text:`${q.place} · 난이도 ${q.level}`,done:state.solved.has(q.id)}));checks.push({text:'머리카락 엉킨 열쇠 획득',done:hasExitKey()});
  const checklist=node('ul','',host);checklist.className='history-exit-checklist';
  for(const check of checks){const li=node('li',`${check.done?'☑':'☐'} ${check.text}`,checklist);li.dataset.complete=String(check.done);}
  node('p',`${checks.filter(c=>c.done).length}/${checks.length} 완료 · ${mainReady()?'철문이 열렸습니다.':'모두 체크되면 철문이 열립니다.'}`,host);syncDoors();
 }
 function inspectKey(){
  const host=shell('머리카락 엉킨 열쇠');game.interactionManager.inspectTagEl.textContent='1층 식자실 · 소지품';
  if(hasExitKey()){node('p',exitRoom.keyPlaced?'열쇠는 철문 안 책상의 종이 위에 놓여 있습니다.':'열쇠를 이미 챙겼습니다.',host);return;}
  node('p','붉은 실과 검은 머리카락이 녹슨 열쇠를 감고 있습니다.',host);
  const take=node('button','머리카락 엉킨 열쇠 챙기기',host);take.type='button';take.onclick=()=>{if(game.gameEnded||!cursedKey||game.camera.position.distanceTo(cursedKey.position)>3.5||hasExitKey())return;game.sharedInventory.addItem({id:'rusty_key',name:'머리카락 엉킨 열쇠',desc:'철문 안 책상 위 종이에 올려놓을 녹슨 열쇠.'});cursedKey.visible=false;cursedKey.traverse(o=>o.visible=false);game.soundManager.playDrawerUnlock();syncDoors();inspectKey();goal();};
 }
 function inspectExitPaper(){
  const host=shell('책상 위의 종이');game.interactionManager.inspectTagEl.textContent='1층 철문 안';
  node('p',exitRoom.keyPlaced?'머리카락 엉킨 열쇠가 종이 위에 놓여 있다. 지하실 문이 열렸다.':'머리카락 엉킨 열쇠를 이 종이 위에 올려놓으시오.',host).className='history-exit-message';
  if(exitRoom.keyPlaced)return;
  exitRoom.found=true;const place=node('button','종이 위에 머리카락 엉킨 열쇠 올려놓기',host);place.type='button';place.disabled=!game.sharedInventory.hasItem('rusty_key');
  place.onclick=()=>{if(game.gameEnded||!mainReady()||game.room.doorOpenProgress<1||game.camera.position.distanceTo(exitRoom.note.position)>3.5||exitRoom.keyPlaced||!game.sharedInventory.removeItem('rusty_key'))return;exitRoom.placeKey(cursedKey);syncDoors();archive.open=true;game.soundManager.playMetalDoorOpen();inspectExitPaper();goal();};
 }
 // Capture before legacy inspection listeners so old puzzles cannot replace the new tasks.
 const nativeRender=game.inspectViewRenderer.render.bind(game.inspectViewRenderer);
 const mapped={clock:'clock',calendar:'calendar',drawer_24:'drawer',proof:'proof',newspaper:'proof',history_poster:'poster',history_cabinet:'cabinet',history_book:'book',history_archive_hint:'archive-language'};
 const guided={mirror_plate:'calendar',drawer_locked:'drawer',desk:'proof',galley_slot:'proof',print_roller:'proof',cursed_cube:'cabinet',glasses:'cabinet',apron:'cabinet',rack:'book',type_rack_label:'book',censor_poster:'poster',radio:'book',mobile_archive_hint:'archive-language'};
 function handled(data){return Boolean(mapped[data.type]||guided[data.type]||['cursed_key','history_exit_note','history_cabinet_drawer','mobile_archive_records','mobile_darkroom_station','drying_missing_photo','drying_missing_note','mobile_archive_door','mobile_darkroom_curtain'].includes(data.type)||data.clueId==='clue_exit_door');}
 game.inspectViewRenderer.render=data=>{if(!handled(data)){nativeRender(data);game.interactionManager.inspectTagEl.textContent+=' · 선택 장치 · 난이도 중';}};
 window.addEventListener('space-inspect',event=>{const data=event.detail;if(!handled(data))return;event.stopImmediatePropagation();
  if(mapped[data.type])quiz(mapped[data.type]);
  else if(guided[data.type])directGuide(guided[data.type]);
  else if(data.type==='cursed_key')inspectKey();
  else if(data.type==='history_exit_note')inspectExitPaper();
  else if(data.type==='history_cabinet_drawer'){cabinet.open(data.drawerIndex);game.interactionManager.closeInspect();}
  else if(data.clueId==='clue_exit_door')route();
  else if(data.type==='mobile_archive_door'){const host=shell('지하실 문');node('p',archive.unlocked?'지하실 문이 열렸습니다. 계단을 내려가세요.':'지하실 문은 아직 봉인되어 있습니다.',host);}
  else if(data.type==='mobile_archive_records')quiz('archive-source');
  else if(data.type==='mobile_darkroom_station')quiz('darkroom');
  else if(data.type==='drying_missing_photo')quiz('photo-'+data.photoIndex);
  else if(data.type==='drying_missing_note')list('photos','寫眞乾燥室 · 마지막 세 기록');
  else if(data.type==='mobile_darkroom_curtain'){
   const room=data.curtainIndex===0?'archive':'darkroom',curtain=dark.curtains[data.curtainIndex];
   const host=shell('검은 커튼 · 다음 방의 봉인');
   node('p',state.complete(room)?'기록이 복원되어 봉인이 풀렸습니다.':'이 방의 기록을 모두 복원해야 커튼 너머로 갈 수 있습니다.',host);
   const check=node('button','이 방의 퍼즐·힌트 확인',host);check.onclick=()=>list(room,ROOMS[room]+' · 남은 기록');
   const b=node('button','검은 커튼 젖히기',host);b.disabled=!state.complete(room);b.onclick=()=>{curtain.opened=true;game.soundManager.playFloorboardCreak();game.interactionManager.closeInspect();};
  }
 },{capture:true});
 game.beginScreamingRoomEnding=()=>game.interactionManager.triggerInspect({type:'history_exit',clueId:'clue_exit_door',name:'1층 출구 · 지하실 안내',description:'바깥이 아니라 지하로 이어지는 기록이다.'});
 const update=game.playerControls.update.bind(game.playerControls);game.playerControls.update=delta=>{update(delta);game.historyGame.audio.prepare();if(!game.gameEnded){syncDoors();goal();}};
 // The corridor marked exit opens into an in-world direction sign, never the ending.
 const openDoor=game.room.openDoor.bind(game.room);game.room.openDoor=()=>mainReady()&&openDoor();
 game.room.updateExitSign=function(){if(this.historyExitDrawn)return;this.historyExitDrawn=true;const c=this.signCanvas.getContext('2d');c.fillStyle='#211910';c.fillRect(0,0,768,256);c.fillStyle='#d6c59e';c.textAlign='center';c.font='bold 100px serif';c.fillText('1층 출구',384,168);this.signTexture.needsUpdate=true;};
 game.room.updateExitSign();
 function prop(id,text,x,y,z,w=.9,h=.3){const mesh=archive.sign(text,w,h,true);mesh.position.set(x,y,z);if(id==='cabinet')mesh.rotation.y=Math.PI;mesh.userData={isInteractable:true,clueId:'history_'+id,type:'history_'+id,name:text,description:'어둠 속에 남은 기록. 조사하면 단서·퀴즈·힌트를 확인할 수 있다.'};game.scene.add(mesh);game.furniture.interactables.push(mesh);}
 // A paper poster mounted flush against the back wall, beside the filing cabinet.
 const PT=game.sceneAPI,posterWidth=.98,posterHeight=posterWidth*1400/1118;
 const poster=new PT.Mesh(new PT.PlaneGeometry(posterWidth,posterHeight),new PT.MeshStandardMaterial({color:0xc8b99d,roughness:1}));
 poster.position.set(-2.1,1.95,5.965);poster.rotation.y=Math.PI;
 poster.name='history-wall-poster';poster.userData={isInteractable:true,clueId:'history_poster',type:'history_poster',name:'벽에 붙은 조선박람회 포스터 · 난이도 중',description:'캐비닛 옆 벽에 붙어 있는 빛바랜 박람회 포스터.'};
 game.scene.add(poster);game.furniture.interactables.push(poster);game.historyGame.poster=poster;
 const posterImage=new Image();posterImage.onload=()=>{const texture=new PT.CanvasTexture(posterImage);texture.colorSpace='srgb';poster.material.map=texture;poster.material.color.setHex(0xffffff);poster.material.needsUpdate=true;game.historyGame.posterReady=true;};posterImage.src='./assets/history/aged-expo-poster.jpg';
 for(const [w,h,x,y]of [[posterWidth+.025,.009,0,-posterHeight/2-.012],[posterWidth+.025,.009,0,posterHeight/2+.012],[.009,posterHeight+.025,-posterWidth/2-.012,0],[.009,posterHeight+.025,posterWidth/2+.012,0]]){const edge=new PT.Mesh(new PT.PlaneGeometry(w,h),new PT.MeshBasicMaterial({color:0x39c85a}));edge.position.set(x,y,.002);edge.userData={isPuzzleMarker:true,clueId:'history_poster'};edge.raycast=()=>{};poster.add(edge);}
 game.renderer.domElement.addEventListener('click',event=>{const interaction=game.interactionManager;if(event.button===0&&game.playerControls.controls.isLocked&&!game.gameEnded&&!interaction.isInspecting&&interaction.currentInteractable?.type==='history_poster')interaction.triggerInspect(interaction.currentInteractable);});
 cabinet=window.GyeongCabinetProp.create(game,archive);game.historyGame.cabinet=cabinet;
 exitRoom=window.GyeongExitRoom.create(game,archive);game.historyGame.exitRoom=exitRoom;
 game.historyGame.hoverLabels.push({object:exitRoom.note,text:'테이블 위의 종이'});
 // Worn hardcover game prop; its generated texture is not a historical book facsimile.
 const T=game.sceneAPI,book=new T.Group();book.position.set(1,0,-6.2);book.rotation.y=-.28;
 const bookData={isInteractable:true,clueId:'history_book',type:'history_book',name:'복도의 책 · 난이도 상',description:'바닥에 떨어진 책. 가까이 겨냥하면 기록을 읽을 수 있다.'};book.userData=bookData;game.scene.add(book);game.furniture.interactables.push(book);
 function bookPart(geometry,material,y){const mesh=new T.Mesh(geometry,material);mesh.position.y=y;mesh.userData=bookData;book.add(mesh);return mesh;}
 bookPart(new T.BoxGeometry(.62,.025,.86),new T.MeshStandardMaterial({color:0x302617,roughness:.9}),.018);
 bookPart(new T.BoxGeometry(.57,.07,.8),new T.MeshStandardMaterial({color:0xb9aa87,roughness:1}),.06);
 bookPart(new T.BoxGeometry(.62,.014,.86),new T.MeshStandardMaterial({color:0x302017,roughness:1}),.102);
 const spine=bookPart(new T.BoxGeometry(.035,.11,.86),new T.MeshStandardMaterial({color:0x24170f,roughness:1}),.06);spine.position.x=-.3;
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=840;const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.colorSpace='srgb';
 function cover(image){ctx.fillStyle='#302017';ctx.fillRect(0,0,600,840);if(image)ctx.drawImage(image,0,0,600,840);texture.needsUpdate=true;}
 cover();const illustration=new Image();illustration.onload=()=>{cover(illustration);game.historyGame.bookCoverReady=true;};illustration.src='./assets/history/worn-hardcover.jpg';
 const coverMesh=bookPart(new T.PlaneGeometry(.62,.86),new T.MeshStandardMaterial({map:texture,roughness:.95,side:2}),.111);coverMesh.rotation.x=-Math.PI/2;
 for(const [w,d,x,z]of [[.67,.016,0,-.46],[.67,.016,0,.46],[.016,.92,-.335,0],[.016,.92,.335,0]]){const edge=new T.Mesh(new T.BoxGeometry(w,.008,d),new T.MeshBasicMaterial({color:0x39c85a}));edge.position.set(x,.12,z);edge.userData.isPuzzleMarker=true;edge.raycast=()=>{};book.add(edge);}
 game.historyGame.book=book;game.historyGame.hoverLabels.push({object:book,text:'복도의 책 · 난이도 상'});
 prop('archive_hint','우리말 기록 · 중',18.7,-1.8,-5.95,1.1,.35);
 // 원래 물건 고유 이름과 설명을 유지하고, 이름이 비어있는 경우에만 기본값 부여
game.scene.traverse(object=>{const data=object.userData,q=QUESTIONS.find(q=>q.id===mapped[data.type]);if(q&&!data.name){data.name=q.place+' · 난이도 '+q.level;data.description='남겨진 기록을 조사하면 역사 단서와 재시도 가능한 퀴즈를 확인할 수 있다.';}});
 const nativeUpdateTarget=game.explorationHUD.updateTarget.bind(game.explorationHUD);game.explorationHUD.updateTarget=()=>{game.explorationHUD.targetId=null;nativeUpdateTarget();};
 const notebookRender=game.notebookUI.render.bind(game.notebookUI);game.notebookUI.render=()=>{notebookRender();const right=document.querySelector('.notebook-page.right-page');if(!right)return;right.querySelectorAll('.puzzle-track-card,.notebook-status-summary,#notebook-puzzles-empty').forEach(e=>e.hidden=true);right.querySelector('.page-title').textContent='복원 기록 (HISTORY)';const clues=document.getElementById('notebook-clues-list');clues.replaceChildren();for(const q of QUESTIONS.filter(q=>state.attempts.has(q.id))){node('h4',q.place,clues);node('p',q.clue,clues);}if(!state.attempts.size)node('p','물건을 조사하면 단서가 문제 안에 나타납니다. 한 번 시도한 기록은 여기에 모입니다.',clues);let records=document.getElementById('history-notebook');if(!records){records=node('section','',right);records.id='history-notebook';}records.replaceChildren();for(const room of Object.keys(ROOMS)){node('h4',ROOMS[room],records);for(const q of QUESTIONS.filter(q=>q.room===room)){
    const solved=state.solved.has(q.id);
    const hintText=!solved&&q.hints?` — ${q.hints[0]}`:'';
    node('p',`${solved?'✓':'未'} ${q.place} (${q.title}) · 난이도 ${q.level}${hintText}`,records);
  }}};
 game.notebookUI.render();
 const guide=node('button','진행 안내');guide.type='button';guide.id='history-progress-button';guide.style.display='none';document.body.appendChild(guide);guide.onclick=()=>{if(game.gameEnded||!game.playerControls.controls.isLocked)return;game.interactionManager.triggerInspect({type:'history_progress',name:'방별 기록과 힌트',description:'다음 방의 봉인을 풀기 위한 안내'});list(game.camera.position.x>=35?'photos':game.camera.position.x>=28?'darkroom':game.camera.position.x>=14?'archive':'main','방별 기록 · 진행 안내');};
 game.playerControls.controls.addEventListener('lock',()=>{guide.hidden=game.gameEnded;});game.playerControls.controls.addEventListener('unlock',()=>{guide.hidden=true;});guide.hidden=true;
 const mobileGuide=document.getElementById('mobile-play-guide');if(mobileGuide){const tasks=node('button','방별 퍼즐·힌트 보기',mobileGuide);tasks.type='button';tasks.onclick=()=>{mobileGuide.close();if(game.notebookUI)game.notebookUI.open();else document.getElementById('notebook-status')?.click();};}
 const start=document.querySelector('.intro-desc');if(start)start.appendChild(node('span',' 방마다 필수 기록을 복원해야 다음 문이 열립니다. 난이도는 상·중·하입니다. 모든 퀴즈는 게임 안 단서와 힌트로 풀 수 있고, 오답은 다시 시도할 수 있습니다. 공포 연출과 10분 제한은 유지됩니다.'));
 goal();
}
if(typeof window==='object')window.addEventListener('sikjasil-ready',event=>install(event.detail));
return{QUESTIONS,ROOMS,Progress,install};
});
