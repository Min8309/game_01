/* Free installable web app. Installation remains a user gesture. */
(function(){
 'use strict';let promptEvent=null;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;});
 window.addEventListener('appinstalled',()=>{promptEvent=null;const status=document.getElementById('pwa-install-status');if(status)status.textContent='홈 화면 설치가 완료되었습니다.';});
 if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('../game-pwa-sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{}));
 function addInstallHelp(){const guide=document.getElementById('mobile-play-guide');if(!guide||document.getElementById('pwa-install-button'))return;const section=document.createElement('section');const title=document.createElement('h3');title.textContent='무료 테스트 앱 설치';const status=document.createElement('p');status.id='pwa-install-status';status.textContent=matchMedia('(display-mode: standalone)').matches||navigator.standalone?'홈 화면 앱으로 실행 중입니다.':'Android Chrome: 앱 설치 또는 홈 화면에 추가 · iPhone Safari: 공유 → 홈 화면에 추가. 처음 실행할 때는 인터넷에 연결하세요.';const button=document.createElement('button');button.id='pwa-install-button';button.type='button';button.textContent='홈 화면에 앱 설치';button.onclick=async()=>{if(!promptEvent){status.textContent='Android는 브라우저 메뉴의 앱 설치/홈 화면에 추가를, iPhone은 Safari 공유 메뉴의 홈 화면에 추가를 선택하세요.';return;}const event=promptEvent;promptEvent=null;await event.prompt();const result=await event.userChoice;status.textContent=result.outcome==='accepted'?'설치를 요청했습니다. 홈 화면의 경성야록 아이콘으로 실행하세요.':'설치를 취소했습니다. 브라우저에서도 계속 플레이할 수 있습니다.';};section.append(title,status,button);guide.querySelector('[data-guide-close]').before(section);}
 window.addEventListener('sikjasil-ready',()=>setTimeout(addInstallHelp,0));window.addEventListener('load',addInstallHelp);

  // 게임 시작 시 앱 설치 관련 요소가 인게임 조작 안내를 가리지 않도록 숨김
  window.addEventListener('sikjasil-ready', function() {
    var startScreen = document.getElementById('start-screen');
    if (startScreen) {
      startScreen.addEventListener('click', function() {
        var installBtn = document.getElementById('pwa-install-button');
        if (installBtn && !document.getElementById('mobile-play-guide')) {
          installBtn.style.display = 'none';
        }
      });
    }
  }); // pwa-in-game-guard

})();
