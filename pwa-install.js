/* Install the same game on desktop, Android and iOS. */
(function(){
 'use strict';
 let promptEvent=null,game=null,dialog,launch,status,installButton,offlineStarted=false;
 function prepareOffline(){if(offlineStarted||!('serviceWorker' in navigator)||location.protocol==='file:')return;offlineStarted=true;
   navigator.serviceWorker.register('./game-pwa-sw.js',{scope:'./',updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>{status.textContent='오프라인 실행 파일 준비 완료 · 설치 후에도 새로고침하면 최신 내용을 확인할 수 있습니다.';}).catch(()=>{status.textContent='오프라인 파일을 준비하지 못했습니다. 인터넷 연결 후 다시 열어 주세요.';});
 }
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
 const installed=()=>{promptEvent=null;if(status)status.textContent='설치되었습니다. 홈 화면이나 앱 목록에서 경성야록을 실행하세요.';sync();};
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;if(installButton)installButton.textContent='지금 설치';});
 window.addEventListener('appinstalled',installed);
 function sync(){if(launch)launch.hidden=!!standalone()||!!(game&&(game.gameEnded||game.startScreen.classList.contains('hidden')));}
 async function install(){
  if(!promptEvent){dialog.showModal();return;}
  const event=promptEvent;promptEvent=null;
  try{await event.prompt();const result=await event.userChoice;status.textContent=result.outcome==='accepted'?'설치를 요청했습니다. 홈 화면이나 앱 목록을 확인하세요.':'설치를 취소했습니다. 브라우저에서 계속 플레이할 수 있습니다.';}
  catch{status.textContent='아래 안내에 따라 브라우저 메뉴에서 설치해 주세요.';}
 }
 function init(){
  if(document.getElementById('game-install-dialog'))return;
  const style=document.createElement('style');style.textContent=`
   #game-install-launch{position:fixed;left:max(16px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:150;padding:12px 18px;min-height:44px;background:#14271f;color:#eddfbd;border:1px solid #b38b4b;border-radius:6px;font:16px serif;cursor:pointer}#game-install-launch[hidden]{display:none}
   #game-install-dialog{box-sizing:border-box;width:min(500px,calc(100vw - 28px));max-height:calc(100dvh - 28px);overflow:auto;margin:auto;padding:24px;background:#102219;color:#f0e4c7;border:1px solid #ad8b50;border-radius:10px;z-index:20000;line-height:1.65;font-family:serif}#game-install-dialog::backdrop{background:#000c}#game-install-dialog h2{font-size:23px;margin:0 0 12px}#game-install-dialog h3{font-size:17px;margin:16px 0 4px;color:#c5e1bf}#game-install-dialog p{margin:6px 0}#game-install-dialog button{min-height:44px;padding:10px 16px;margin:12px 8px 0 0;background:#274332;color:#fff0ce;border:1px solid #b38b4b;border-radius:5px;font-size:16px;cursor:pointer}#game-install-status{font-size:14px;color:#d9c995}
   @media(max-height:450px){#game-install-dialog{padding:16px}#game-install-launch{padding:8px 12px;font-size:14px}}
  `;document.head.appendChild(style);
  dialog=document.createElement('dialog');dialog.id='game-install-dialog';dialog.setAttribute('aria-labelledby','game-install-title');
  dialog.innerHTML='<h2 id="game-install-title">경성야록 앱 설치</h2><p>설치 후 홈 화면이나 앱 목록에서 바로 실행하세요.</p><h3>PC · Chrome / Edge</h3><p>주소창의 설치 아이콘 또는 브라우저 메뉴의 “앱 설치”를 선택하세요.</p><h3>안드로이드 · Chrome</h3><p>메뉴 ⋮ → “앱 설치” 또는 “홈 화면에 추가”를 선택하세요.</p><h3>아이폰 · 아이패드 · Safari</h3><p>Safari에서 이 게임을 연 뒤 공유 버튼 → “홈 화면에 추가” → “추가”를 누르세요.</p><p id="game-install-status" role="status">처음 실행할 때는 인터넷 연결이 필요합니다.</p><button type="button" id="game-install-now">설치 안내</button><button type="button" id="game-install-close">닫기</button>';
  document.body.appendChild(dialog);status=document.getElementById('game-install-status');installButton=document.getElementById('game-install-now');installButton.textContent=promptEvent?'지금 설치':'설치 안내';
  installButton.onclick=()=>{if(promptEvent)install();else status.textContent='사용 중인 기기에 해당하는 위의 설치 방법을 따라 주세요. 앱 내 브라우저라면 Safari 또는 Chrome에서 다시 열어 주세요.';};
  document.getElementById('game-install-close').onclick=()=>dialog.close();
  for(const type of ['pointerdown','mousedown','touchstart','click','keydown'])dialog.addEventListener(type,e=>e.stopPropagation());
  launch=document.createElement('button');launch.id='game-install-launch';launch.type='button';launch.textContent='앱 설치 · PC / 모바일';launch.onclick=()=>{dialog.showModal();if(promptEvent)install();};document.body.appendChild(launch);sync();
  setTimeout(prepareOffline,15000);
 }
 function attachGame(event){game=event.detail;init();sync();game.ghostEncounters.readyPromise.then(()=>setTimeout(prepareOffline,1200));new MutationObserver(sync).observe(game.startScreen,{attributes:true,attributeFilter:['class']});
  const guide=document.getElementById('mobile-play-guide');if(guide&&!document.getElementById('pwa-install-button')){const button=document.createElement('button');button.id='pwa-install-button';button.type='button';button.textContent='앱 설치 안내';button.onclick=()=>{guide.close();dialog.showModal();};guide.appendChild(button);}
 }
 window.addEventListener('sikjasil-ready',attachGame);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
