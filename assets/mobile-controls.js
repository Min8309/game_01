/* Touch input adapter; desktop keeps native PointerLockControls. */
(function () {
  'use strict';
  if (!matchMedia('(pointer: coarse)').matches && new URLSearchParams(location.search).get('mobilePreview') !== 'archive') return;
  document.documentElement.classList.add('touch-game');
  window.addEventListener('sikjasil-ready', function (event) {
    var game = event.detail, player = game.playerControls, controls = player.controls;
    controls.enabled = false; // Touch/preview look uses this adapter, never native mouse movement.
    var panel = document.createElement('div');
    panel.id = 'mobile-controls';
    panel.innerHTML = '<div id="mobile-pad" aria-label="이동 조이스틱"><span class="joystick-ring"></span><i></i><span class="joystick-label">이동</span></div>' +
      '<div class="mobile-actions" role="group" aria-label="픽업 및 탐색 기능">' +
      '<button class="mobile-pickup" data-key="KeyE" disabled><span aria-hidden="true">＋</span><b>픽업 · 조사</b><small>대상을 바라보세요</small></button>' +
      '<div class="mobile-tools"><button data-key="KeyN">수첩</button><button data-key="KeyF">손전등</button><button data-key="KeyZ">집중</button><button data-key="KeyM">음향</button></div></div>';
    document.body.appendChild(panel);
    var pad = panel.querySelector('#mobile-pad'), knob = pad.querySelector('i');
    var pickup = panel.querySelector('.mobile-pickup'), targetLabel = pickup.querySelector('small');
    var interaction = game.interactionManager, originalSetPrompt = interaction.setPrompt;
    interaction.setPrompt = function (target) {
      originalSetPrompt.call(this, target);
      pickup.disabled = !target;
      var label = target ? target.name : '대상을 바라보세요';
      if (targetLabel.textContent !== label) targetLabel.textContent = label;
    };
    // Aim assistance for small green clues, limited to nearby visible objects.
    var assistedTargets=[],nextTargetScan=0,assistPoint=new game.sceneAPI.Vector3(),assistForward=new game.sceneAPI.Vector3(),assistDirection=new game.sceneAPI.Vector3();
    var assistRay=new interaction.raycaster.constructor();
    var assistBounds=new game.sceneAPI.Box3(),nextAssistCheck=0,lastAssistedTarget=null,nearbyClues=[];
    var originalInteractionUpdate=interaction.update.bind(interaction);
    function visibleObject(object){for(var parent=object;parent;parent=parent.parent)if(!parent.visible)return false;return true;}
    function belongsTo(object,target){for(var parent=object;parent;parent=parent.parent)if(parent===target)return true;return false;}
    interaction.update=function(){
      originalInteractionUpdate();if(!canExplore()||this.isInspecting)return;
      var now=performance.now();if(now>=nextTargetScan){nextTargetScan=now+500;assistedTargets=[];game.scene.traverse(function(object){if(object.userData?.isInteractable&&object.userData.clueId&&object.userData.type!=='drawer_locked')assistedTargets.push(object);});}
      var current=this.currentInteractable;
      if(now<nextAssistCheck){if(current?.clueId&&current.type!=='drawer_locked')return;if(lastAssistedTarget){this.currentInteractable=lastAssistedTarget;this.setPrompt(lastAssistedTarget);}return;}nextAssistCheck=now+100;
      game.camera.getWorldDirection(assistForward);var best=null,bestScore=Infinity;nearbyClues=[];
      for(var target of assistedTargets){
        if(!visibleObject(target))continue;assistBounds.setFromObject(target);assistBounds.clampPoint(game.camera.position,assistPoint);if(assistPoint.distanceToSquared(game.camera.position)<.0001)target.getWorldPosition(assistPoint);assistDirection.subVectors(assistPoint,game.camera.position);var distance=assistDirection.length();if(distance>2.6||distance<.01)continue;assistDirection.normalize();var alignment=assistDirection.dot(assistForward);if(alignment<.15)continue;
        assistRay.set(game.camera.position,assistDirection);assistRay.far=distance+.25;var blocked=false;
        for(var hit of assistRay.intersectObjects(game.scene.children,true)){if(!visibleObject(hit.object))continue;if(belongsTo(hit.object,target))break;var material=hit.object.material;if(material&&!Array.isArray(material)&&!material.transparent&&hit.distance<distance-.2){blocked=true;break;}}
        if(blocked)continue;if(!nearbyClues.some(function(item){return item.clueId===target.userData.clueId;}))nearbyClues.push(target.userData);var score=distance+(1-alignment)*1.5;if(score<bestScore){best=target.userData;bestScore=score;}
      }
      if(current?.clueId&&current.type!=='drawer_locked')best=current;lastAssistedTarget=best;if(best){this.currentInteractable=best;this.setPrompt(best);}
    };
    var nearbyDialog=document.createElement('dialog');nearbyDialog.id='mobile-nearby-clues';nearbyDialog.setAttribute('aria-label','가까운 초록 단서 선택');document.body.appendChild(nearbyDialog);
    var choosingClue=false;
    function chooseNearbyClue(){reset();choosingClue=false;nearbyDialog.replaceChildren();var heading=document.createElement('h2');heading.textContent='가까운 초록 단서';nearbyDialog.appendChild(heading);for(var data of nearbyClues){var option=document.createElement('button');option.type='button';option.textContent=data.name;option.dataset.clueId=data.clueId;option.onclick=(function(clue){return function(){choosingClue=true;nearbyDialog.close();interaction.triggerInspect(clue);};})(data);nearbyDialog.appendChild(option);}var cancel=document.createElement('button');cancel.textContent='닫고 계속 탐색';cancel.onclick=function(){nearbyDialog.close();};nearbyDialog.appendChild(cancel);interaction.isInspecting=true;controls.unlock();nearbyDialog.showModal();}
    nearbyDialog.addEventListener('close',function(){interaction.isInspecting=false;if(!choosingClue&&!game.gameEnded&&!game.ending&&!document.hidden)controls.lock();choosingClue=false;});
    var moveId = null, lookId = null, lastX = 0, lastY = 0, moveStrength = 0;
    function canExplore() {
      return !game.gameEnded && !game.ending &&
        !interaction.isInspecting &&
        !game.notebookUI.isOpen &&
        !(game.rewardCardRenderer.modalEl && game.rewardCardRenderer.modalEl.classList.contains('active')) &&
        game.startScreen.classList.contains('hidden');
    }
    function reset() {
      moveId = lookId = null;
      moveStrength = 0;
      player.moveForward = player.moveBackward = player.moveLeft = player.moveRight = false;
      knob.style.transform = '';
      pad.classList.remove('active');
    }
    var guide = document.createElement('dialog');
    guide.id = 'mobile-play-guide';
    guide.setAttribute('aria-label', '모바일 진행 안내');
    guide.innerHTML = '<div class="mobile-guide-card">' +
      '<div class="mobile-guide-head"><b>경성 활판 인쇄소 (1934)</b><button type="button" class="mobile-guide-close" data-guide-close aria-label="닫기">×</button></div>' +
      '<div class="mobile-guide-body">' +
      '<section class="mobile-guide-block"><h3>현재 방의 목표</h3><p data-mobile-goal>다음 단서를 찾아 방의 비밀을 해결하세요.</p></section>' +
      '<section class="mobile-guide-block"><h3>조작 도움말</h3><ul>' +
      '<li><b>왼쪽 조이스틱:</b> 전후좌우 이동</li>' +
      '<li><b>화면 드래그:</b> 시선 회전</li>' +
      '<li><b>픽업 · 조사:</b> 정면 대상 조사 (초록 단서가 겹치면 목록 선택)</li>' +
      '<li><b>도구 버튼:</b> 수첩[N] · 손전등[F] · 확대 집중 · 음향 토글</li>' +
      '</ul></section>' +
      '<section class="mobile-guide-block"><h3>소지품</h3><div data-mobile-inventory>소지한 물품 없음</div></section>' +
      '</div>' +
      '<div class="mobile-guide-foot"><button type="button" class="mobile-guide-btn" data-guide-hints>방별 퍼즐 · 힌트 보기 (수첩)</button><button type="button" class="mobile-guide-btn primary" data-guide-close>닫고 탐색 계속하기</button></div>' +
      '</div>';
    document.body.appendChild(guide);
    guide.querySelector('[data-guide-hints]').onclick = function () {
      guide.close();
      if (game.notebookUI) game.notebookUI.open();
      else document.getElementById('notebook-status')?.click();
    };
    var guideBtn = document.createElement('button');
    guideBtn.type = 'button';
    guideBtn.id = 'mobile-guide-button';
    guideBtn.textContent = '진행 안내';
    document.body.appendChild(guideBtn);
    guideBtn.onclick = function () {
      if (!canExplore()) return;
      guide.querySelector('[data-mobile-goal]').textContent =
        (document.getElementById('quest-tracker-text')?.textContent) ||
        (document.getElementById('exploration-objective')?.textContent) ||
        '물건을 조사해 초록 단서를 찾으세요.';
      guide.querySelector('[data-mobile-inventory]').textContent =
        document.getElementById('inventory-items')?.textContent || '아직 모은 물건이 없습니다.';
      controls.unlock();
      guide.showModal();
    };
    guide.querySelector('[data-guide-close]').onclick = function () { guide.close(); };
    guide.addEventListener('close', function () {
      if (!game.gameEnded && !game.ending && !document.hidden) controls.lock();
    });
    function sync() {
      panel.hidden = !canExplore();
      if (panel.hidden) reset();
    }
    controls.lock = function () {
      if (game.gameEnded || game.ending || document.hidden) return;
      if (!this.isLocked) { this.isLocked = true; this.dispatchEvent({ type: 'lock' }); }
    };
    controls.unlock = function () {
      if (this.isLocked) { this.isLocked = false; this.dispatchEvent({ type: 'unlock' }); }
    };
    controls.addEventListener('lock', sync);
    controls.addEventListener('unlock', sync);
    panel.querySelectorAll('button').forEach(function (button) {
      button.type = 'button';
      button.addEventListener('click', function () {
        if (!canExplore()) return;
        var key = button.dataset.key;
        if (button.classList.contains('mobile-pickup')) {
          if (!interaction) return;
          if (interaction.isInspecting) { interaction.closeInspect(); return; }
          if (nearbyClues.length > 1 && nearbyClues.some(function(item) { return item.clueId === interaction.currentInteractable?.clueId; })) {
            chooseNearbyClue();
            return;
          }
          if (interaction.currentInteractable) {
            interaction.triggerInspect(interaction.currentInteractable);
          }
          return;
        }
        if (key === 'KeyN' || key === 'Tab') {
          if (game.notebookUI) game.notebookUI.toggle();
          else document.getElementById('notebook-status')?.click();
          return;
        }
        if (key === 'KeyZ') {
          player.isZooming = !player.isZooming;
          return;
        }
        if (key === 'KeyF') {
          if (player.lighting) player.lighting.toggleFlashlight(game.soundManager);
          else if (game.lighting) game.lighting.toggleFlashlight(game.soundManager);
          return;
        }
        if (key === 'KeyM') {
          if (game.soundManager) game.soundManager.toggleMute();
          return;
        }
        window.dispatchEvent(new KeyboardEvent('keydown', { code: key, bubbles: true, cancelable: true }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code: key, bubbles: true }));
      });
    });
    function move(event) {
      var rect = pad.getBoundingClientRect();
      var x = event.clientX - rect.left - rect.width / 2;
      var y = event.clientY - rect.top - rect.height / 2;
      var length = Math.hypot(x, y), limit = rect.width * .32;
      if (length > limit) { x *= limit / length; y *= limit / length; }
      knob.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      var magnitude = Math.min(length / limit, 1);
      moveStrength = magnitude < .15 ? 0 : (magnitude - .15) / .85;
      player.moveLeft = moveStrength ? Math.max(0, -x / limit) : false;
      player.moveRight = moveStrength ? Math.max(0, x / limit) : false;
      player.moveForward = moveStrength ? Math.max(0, -y / limit) : false;
      player.moveBackward = moveStrength ? Math.max(0, y / limit) : false;
    }
    pad.addEventListener('pointerdown', function (event) {
      if (!canExplore() || moveId !== null) return;
      event.preventDefault(); moveId = event.pointerId; pad.setPointerCapture(moveId); pad.classList.add('active'); move(event);
    });
    pad.addEventListener('pointermove', function (event) { if (event.pointerId === moveId) move(event); });
    function endMove(event) {
      if (event.pointerId !== moveId) return;
      moveId = null;
      moveStrength = 0;
      player.moveForward = player.moveBackward = player.moveLeft = player.moveRight = false;
      knob.style.transform = "";
      pad.classList.remove("active");
    }
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) { pad.addEventListener(name, endMove); });
    var canvas = game.renderer.domElement;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', function (event) {
      if (!canExplore() || lookId !== null) return;
      lookId = event.pointerId; lastX = event.clientX; lastY = event.clientY;
      canvas.setPointerCapture(lookId);
    });
    canvas.addEventListener('pointermove', function (event) {
      if (event.pointerId !== lookId || !canExplore()) return;
      game.camera.rotation.reorder('YXZ');
      game.camera.rotation.y -= (event.clientX - lastX) * .0035;
      game.camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2,
        game.camera.rotation.x - (event.clientY - lastY) * .0035));
      lastX = event.clientX; lastY = event.clientY;
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) {
      canvas.addEventListener(name, function (event) { if (event.pointerId === lookId) lookId = null; });
    });
    window.addEventListener('blur', function () { reset(); controls.unlock(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { reset(); controls.unlock(); } });
    window.addEventListener('resize', reset);
    game.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    document.querySelector('.start-btn-pulse').textContent = '화면을 터치하여 진입';
    document.querySelector('.controls-guide-box').textContent = '왼쪽 조이스틱: 이동 · 화면 드래그: 시선 · 오른쪽 버튼: 픽업 / 조사 · 가로 화면 권장';
    sync();
  });
})();
