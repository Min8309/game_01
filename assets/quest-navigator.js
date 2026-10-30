/* =========================================================
   경성야록 식자실 — 실시간 3D 목표 내비게이션 & 가이드 시스템
   실제 3D 오브젝트 월드 좌표 및 퍼즐 진행 상태 실시간 동기화
   ========================================================= */
(function() {
  'use strict';

  var gameInstance = null;
  var bannerEl = null;
  var markerEl = null;
  var qtBadgeEl = null;
  var qtTextEl = null;
  var qtDistEl = null;
  var wpLabelEl = null;
  var wpArrowEl = null;

  var currentTarget = null;
  var lastTargetCheck = 0;

  // 재사용 벡터 (GC 가비지 컬렉션 렉 완전 방지)
  var vProj = null;
  var forwardVec = null;
  var toTargetVec = null;

  function initHUD() {
    if (document.getElementById('quest-tracker-banner')) return;

    bannerEl = document.createElement('div');
    bannerEl.id = 'quest-tracker-banner';
    bannerEl.innerHTML = 
      '<span class="qt-icon">◇</span>' +
      '<div class="qt-content">' +
        '<span class="qt-badge" id="qtBadge">목표 탐색</span>' +
        '<span class="qt-text" id="qtText">주변 단서를 조사하십시오</span>' +
      '</div>' +
      '<span class="qt-dist" id="qtDist">--m</span>';
    document.body.appendChild(bannerEl);

    markerEl = document.createElement('div');
    markerEl.id = 'waypoint-screen-marker';
    markerEl.style.display = 'none'; // 초록 목표 마커 비활성화 (보존)
    markerEl.innerHTML = '<span class="wp-arrow">▼</span><span id="wpLabel">목표</span>';
    document.body.appendChild(markerEl);

    // DOM 요소 캐싱
    qtBadgeEl = document.getElementById('qtBadge');
    qtTextEl = document.getElementById('qtText');
    qtDistEl = document.getElementById('qtDist');
    wpLabelEl = document.getElementById('wpLabel');
    wpArrowEl = markerEl.querySelector('.wp-arrow');
  }

  // 1층 식자실 및 지하 구역의 실제 단서 위치 좌표 테이블
  var CLUE_COORDS = {
    calendar: [-2.8, 1.95, -3.88],
    clock: [2.4, 2.5, -3.88],
    drawer: [0.9, 0.45, 1.82],
    proof: [0.85, 1.05, 1.55],
    poster: [-2.1, 1.95, 5.965],
    cabinet: [-3.6, 1.2, 5.0],
    book: [1.0, 0.15, -6.2],
    cursed_key: [-4.28, 1.25, 2.0],
    exit_note: [0, 0.93, -20.1],
    archive_entrance: [4.94, 1.4, -2.7],
    archive_records: [22.0, -2.57, -2.7],
    archive_language: [18.7, -1.8, -5.95],
    darkroom_door: [28.0, -2.2, -2.7],
    darkroom_photo: [32.3, -2.57, -0.36],
    photo_curtain: [35.0, -2.2, -2.7],
    photo_0: [38.3, -2.0, -5.42],
    photo_1: [38.3, -2.0, -3.0],
    photo_2: [38.3, -2.0, -0.6]
  };

  // 다음 목표 결정 (퍼즐 상태 실시간 동기화)
  function updateNextObjective() {
    if (!gameInstance || !gameInstance.camera) return;

    var camX = gameInstance.camera.position.x;
    var target = null;

    // 히스토리 모드 상태 확인
    var hg = gameInstance.historyGame;
    var state = hg ? hg.state : null;
    var solvedSet = state ? state.solved : null;
    var isSolved = function(id) {
      return solvedSet ? solvedSet.has(id) : false;
    };

    var inv = gameInstance.sharedInventory || (window.$ ? { hasItem: function(id) { return window.$.hasItem(id); } } : null);
    var hasItem = function(id) {
      if (inv && typeof inv.hasItem === 'function') return inv.hasItem(id);
      return false;
    };

    var exitRoom = hg ? hg.exitRoom : null;
    var keyPlaced = exitRoom ? exitRoom.keyPlaced : false;

    // 1층 메인 공간
    if (camX < 5.4) {
      if (hg && state) {
        if (!isSolved('calendar')) {
          target = { name: '벽의 달력 조사', pos: CLUE_COORDS.calendar, room: '1층 식자실' };
        } else if (!isSolved('clock')) {
          target = { name: '멈춘 괘종시계 조작', pos: CLUE_COORDS.clock, room: '1층 식자실' };
        } else if (!isSolved('drawer')) {
          target = { name: '테이블 아래 24번 서랍', pos: CLUE_COORDS.drawer, room: '1층 식자실' };
        } else if (!isSolved('proof')) {
          target = { name: '작업대 위 교정지', pos: CLUE_COORDS.proof, room: '1층 식자실' };
        } else if (!isSolved('poster')) {
          target = { name: '뒷벽의 조선박람회 포스터', pos: CLUE_COORDS.poster, room: '1층 식자실' };
        } else if (!isSolved('cabinet')) {
          target = { name: '캐비닛 3번 서랍 (역할표)', pos: CLUE_COORDS.cabinet, room: '1층 식자실' };
        } else if (!isSolved('book')) {
          target = { name: '복도 바닥의 낡은 책', pos: CLUE_COORDS.book, room: '1층 복도' };
        } else if (!hasItem('rusty_key') && !hasItem('hair_entangled_key') && !keyPlaced) {
          target = { name: '선반의 [머리카락 엉킨 열쇠] 획득', pos: CLUE_COORDS.cursed_key, room: '1층 식자실' };
        } else if (!keyPlaced) {
          target = { name: '철문 안 책상에 [열쇠 올려놓기]', pos: CLUE_COORDS.exit_note, room: '1층 출구 방' };
        } else {
          target = { name: '오른쪽 벽 [지하 자료실 입구] 내려가기', pos: CLUE_COORDS.archive_entrance, room: '1층 식자실' };
        }
      } else if (window.$) {
        // 클래식 모드 폴백
        var c = window.$;
        if (!c.inspectedClues.has('clue_calendar')) {
          target = { name: '벽의 달력 조사', pos: CLUE_COORDS.calendar, room: '1층 식자실' };
        } else if (!c.puzzles.puzzle_a) {
          target = { name: '멈춘 괘종시계 조사', pos: CLUE_COORDS.clock, room: '1층 식자실' };
        } else if (!c.hasItem('round_glasses')) {
          target = { name: '앞치마의 둥근 안경 획득', pos: [4.75, 2.0, -1.2], room: '1층 식자실' };
        } else if (!c.notebookClues.has('clue_proof_title')) {
          target = { name: '작업대 위 교정지 재조사', pos: CLUE_COORDS.proof, room: '1층 식자실' };
        } else {
          target = { name: '복도 끝 철문 조사', pos: [0, 1.5, -16.0], room: '1층 복도' };
        }
      } else {
        target = { name: '식자실 작업대 단서 조사', pos: CLUE_COORDS.proof, room: '1층 식자실' };
      }
    } else if (camX < 14) {
      target = { name: '계단을 내려가 지하 자료실로', pos: [14.0, -3.6, -2.7], room: '지하 계단' };
    } else if (camX < 28) {
      if (hg && !isSolved('archive-source')) {
        target = { name: '중앙 책상의 검열 기록 복원', pos: CLUE_COORDS.archive_records, room: '지하 자료실' };
      } else if (hg && !isSolved('archive-language')) {
        target = { name: '선반의 우리말 기록 풀기', pos: CLUE_COORDS.archive_language, room: '지하 자료실' };
      } else {
        target = { name: '자료실 끝 암실 철문 열기', pos: CLUE_COORDS.darkroom_door, room: '자료실 끝' };
      }
    } else if (camX < 35) {
      if (hg && !isSolved('darkroom')) {
        target = { name: '인화 작업대 보도사진 조사', pos: CLUE_COORDS.darkroom_photo, room: '암실' };
      } else {
        target = { name: '사진 건조실 커튼 열기', pos: CLUE_COORDS.photo_curtain, room: '암실 끝' };
      }
    } else {
      if (hg && !isSolved('photo-0')) {
        target = { name: '초록 집게 사진 ① 복원하기', pos: CLUE_COORDS.photo_0, room: '사진 건조실' };
      } else if (hg && !isSolved('photo-1')) {
        target = { name: '초록 집게 사진 ② 복원하기', pos: CLUE_COORDS.photo_1, room: '사진 건조실' };
      } else if (hg && !isSolved('photo-2')) {
        target = { name: '초록 집게 사진 ③ 복원하기', pos: CLUE_COORDS.photo_2, room: '사진 건조실' };
      } else {
        target = { name: '모든 역사 기록 복원 완료', pos: [38.3, -2.0, -2.7], room: '사진 건조실' };
      }
    }

    // [좌측 상단] 방 번호와 이름 실시간 동기화
    var roomNameEl = document.getElementById('hud-room-name');
    if (roomNameEl) {
      if (camX < 5.4) roomNameEl.textContent = '제1실 · 京城日報 活版植字室 (1934)';
      else if (camX < 14) roomNameEl.textContent = '계단실 · 지하 비밀 통로';
      else if (camX < 28) roomNameEl.textContent = '제2실 · 지하 사료 보관실';
      else if (camX < 35) roomNameEl.textContent = '제3실 · 보도사진 현상 암실';
      else roomNameEl.textContent = '제4실 · 비밀 사진 건조실';
    }

    // [우측 상단] 탈출 조건 단서 수집 수 실시간 동기화
    var clueCountEl = document.getElementById('sikjaClueCount');
    if (clueCountEl) {
      var count = 0;
      if (solvedSet) count = Math.min(4, solvedSet.size);
      else if (window.$ && window.$.inspectedClues) count = Math.min(4, window.$.inspectedClues.size);
      clueCountEl.textContent = count;
    }

    currentTarget = target;
  }

  // 매 프레임 위치 투영 (Zero-Allocation 최소 연산)
  function tick(timestamp) {
    requestAnimationFrame(tick);
    if (!gameInstance || !gameInstance.camera || !bannerEl || !markerEl) return;

    if (gameInstance.gameEnded || gameInstance.ending || document.body.classList.contains('photo-game-completed') || document.getElementById('red-ending-overlay')?.classList.contains('pulsing') || document.getElementById('screaming-ending-caption')?.classList.contains('visible')) {
      bannerEl.style.display = 'none';
      markerEl.style.display = 'none';
      return;
    }

    // 250ms마다 목표 상태 갱신
    if (timestamp - lastTargetCheck > 250) {
      lastTargetCheck = timestamp;
      updateNextObjective();
    }

    if (!currentTarget) {
      bannerEl.style.display = 'none';
      markerEl.style.display = 'none';
      return;
    }

    var cam = gameInstance.camera;
    var tPos = currentTarget.pos;

    // 3차원 유클리드 거리 계산
    var dx = tPos[0] - cam.position.x;
    var dy = tPos[1] - cam.position.y;
    var dz = tPos[2] - cam.position.z;
    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (bannerEl.style.display === 'none') bannerEl.style.display = 'flex';
    markerEl.style.display = 'none'; // 초록 목표 마커 표시 끄기 유지

    qtBadgeEl.textContent = currentTarget.room;
    qtTextEl.textContent = currentTarget.name;
    qtDistEl.textContent = dist.toFixed(1) + 'm';

    // Three.js 벡터 싱글톤 초기화
    var THREE = window.THREE;
    if (!THREE) return;
    if (!vProj) {
      vProj = new THREE.Vector3();
      forwardVec = new THREE.Vector3();
      toTargetVec = new THREE.Vector3();
    }

    vProj.set(tPos[0], tPos[1] + 0.25, tPos[2]);
    cam.getWorldDirection(forwardVec);
    toTargetVec.copy(vProj).sub(cam.position).normalize();
    var dot = forwardVec.dot(toTargetVec);

    vProj.project(cam);

    var w = window.innerWidth;
    var h = window.innerHeight;
    var sx = (vProj.x * 0.5 + 0.5) * w;
    var sy = (-vProj.y * 0.5 + 0.5) * h;

    if (dot > 0.15) {
      sx = Math.max(30, Math.min(w - 30, sx));
      sy = Math.max(40, Math.min(h - 40, sy));
      markerEl.style.transform = 'translate3d(' + (sx - 40) + 'px, ' + (sy - 15) + 'px, 0)';
      wpArrowEl.textContent = dist < 2.5 ? '▼' : '◆';
      wpLabelEl.textContent = currentTarget.name.split(' ')[0] + ' ' + dist.toFixed(1) + 'm';
      markerEl.style.opacity = dist < 0.9 ? '0.3' : '1';
    } else {
      var isLeft = vProj.x < 0;
      var edgeX = isLeft ? 40 : (w - 110);
      var edgeY = h * 0.5;
      markerEl.style.transform = 'translate3d(' + edgeX + 'px, ' + edgeY + 'px, 0)';
      wpArrowEl.textContent = isLeft ? '◀' : '▶';
      wpLabelEl.textContent = isLeft ? '왼쪽 ' + dist.toFixed(1) + 'm' : '오른쪽 ' + dist.toFixed(1) + 'm';
      markerEl.style.opacity = '0.9';
    }
  }

  window.addEventListener('sikjasil-ready', function(e) {
    gameInstance = (e.detail && e.detail.game) || e.detail;
    initHUD();
    requestAnimationFrame(tick);
  });

  window.addEventListener('load', function() {
    initHUD();
  });

})();
