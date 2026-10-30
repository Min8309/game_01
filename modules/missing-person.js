/* Three restored historical records reveal the final horror photograph. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GyeongMissingPerson=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
const PHOTO_URLS=[1,2,3].map(n=>'./assets/missing-person/photo-'+n+'.jpg');
const CREDIT='이 사진은 ai생성 이미지 입니다.';
class Puzzle{
 constructor(){this.found=new Set();this.teaserSeen=false;this.lastPhoto=null;}
 choose(photo,person){if(!Number.isInteger(photo)||photo<0||photo>2||person!=='record')return false;if(!this.found.has(photo))this.lastPhoto=photo;this.found.add(photo);return true;}
 get solved(){return this.found.size===3;}
}
function canEnd(space){return Boolean(space.archive?.unlocked&&space.archive?.solved&&space.developed&&space.missingPerson.solved);}
function render(space,index){
 const game=space.game,state=space.missingPerson,view=game.inspectViewRenderer.viewContainer;game.inspectViewRenderer.actionBar.replaceChildren();view.replaceChildren();game.interactionManager.inspectTagEl.textContent='乾燥室 · 초록 단서';
 const panel=document.createElement('section');panel.className='gm-expansion mp-puzzle';view.appendChild(panel);
 const h=document.createElement('h2');h.textContent='사진 속 사라진 기록';panel.appendChild(h);
 const progress=document.createElement('p');progress.setAttribute('role','status');panel.appendChild(progress);
 if(!canEnd(space)){progress.textContent='앞선 방과 사진방의 필수 기록을 모두 복원해야 마지막 사진이 열립니다.';return;}
 if(state.solved){
  space.refreshNotice();space.removeMissingPerson();
  h.textContent='모든 퍼즐을 해결했습니다.';progress.textContent='사진 기록 3/3 완료 · 게임이 종료되었습니다.';
  if(!space.finalEndingStarted){space.finalEndingStarted=true;document.documentElement.classList.add('photo-game-completed');game.gameEnded=true;game.ghostEncounters?.stop();game.tensionDirector?.silence();game.playerControls?.controls.unlock();if(game.playTimer){clearInterval(game.playTimer.interval);game.playTimer.startedAt=null;game.playTimer.start=()=>{};game.playTimer.display.style.display='none';}game.interactionManager.closeInspect=()=>{};const footer=document.getElementById('inspect-close');if(footer)footer.hidden=true;window.addEventListener('keydown',event=>{if(!['Tab','Enter','Space'].includes(event.code))event.preventDefault();event.stopImmediatePropagation();},{capture:true});}
  const card=document.createElement('div');card.className='mp-final-photo yk-end-ui';card.setAttribute('aria-label','마지막 사진이 뒤집히며 드러나는 다음 시즌 예고');
  const front=document.createElement('div');front.className='mp-final-front';const image=document.createElement('img');image.src=PHOTO_URLS[state.lastPhoto??2];image.alt='마지막으로 해결한 사진';front.appendChild(image);
  const back=document.createElement('div');back.className='mp-final-back';const title=document.createElement('strong');title.textContent='다음 시즌 예고 · 새벽의 윤전기';const teaser=document.createElement('blockquote');teaser.textContent='“분명 세 사람이 찍힌 사진이었다.\n뒷면에는 네 번째 이름이 적혀 있었다.\n그 이름은… 당신의 것이었다.\n\n새벽 네 시, 멈춘 윤전기가 다시 돌면\n아직 찍히지 않은 당신의 실종 기사가 인쇄된다.\n뒤에서 종이 넘기는 소리가 나도, 돌아보지 마라.”';back.append(title,teaser);card.append(front,back);panel.appendChild(card);
  const credit=document.createElement('p');credit.className='mp-photo-credit';credit.textContent=CREDIT;panel.appendChild(credit);
  const close=document.createElement('button');function returnToMain(){
    if(window.SikjasilExit)window.SikjasilExit();
    else location.href='../index.html';
  }
  close.textContent='예고 확인 · 게임 종료';
  close.onclick=()=>{state.teaserSeen=true;returnToMain();};
  panel.classList.add('yk-end-ui');panel.appendChild(close);view.scrollTop=0;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    card.classList.add('mp-flipped');
    if(!space.endingAudioStarted){
      space.endingAudioStarted=true;
      game.historyGame?.audio.play('ending',window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:.6);
    }
    // 사진 확인 5초 후 자동 복귀
    setTimeout(()=>{if(!document.hidden)returnToMain();},5000);
  }));
  return;
 }

}
return{Puzzle,render,PHOTO_URLS,CREDIT,canEnd};
});
