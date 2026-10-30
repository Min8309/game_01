/* =========================================================
   경성야록 식자실 — 시간 초과 사망 점프스케어 & 손전등 연출
   - 메인 사운드 매니저와 완벽 연동 (AudioContext 단일화 & M키 음소거 연동)
   - 타임오버 시 귀신 급습 점프스케어 후 경성일보 호외 팝업 (다시 도전하기하기)
   ========================================================= */
(function() {
  'use strict';

  var isDead = false;
  var audioCtx = null;

  function getAudioCtx() {
    if (window.__gameSoundManager && window.__gameSoundManager.ctx) {
      return window.__gameSoundManager.ctx;
    }
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function() {});
    }
    return audioCtx;
  }

  function isMuted() {
    if (window.__gameSoundManager && window.__gameSoundManager.isMuted) {
      return true;
    }
    return false;
  }

  // 1. 심장 박동 합성음 (저주파 쿵쾅)
  function playHeartbeat(volume) {
    if (isMuted()) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    gain.gain.setValueAtTime(volume || 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(window.__gameSoundManager?.masterGain || ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 2. 급습 비명 & 충격음 합성
  function playDeathScream() {
    if (isMuted()) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    var t = ctx.currentTime;

    // 묵직한 타격음
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.6);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(g);
    g.connect(window.__gameSoundManager?.masterGain || ctx.destination);
    osc.start(t);
    osc.stop(t + 0.85);

    // 날카로운 금속 비명 소음
    var len = Math.floor(ctx.sampleRate * 0.9);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.linearRampToValueAtTime(3200, t + 0.4);
    var sg = ctx.createGain();
    sg.gain.setValueAtTime(0.7, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    src.connect(filter).connect(sg);
    sg.connect(window.__gameSoundManager?.masterGain || ctx.destination);
    src.start(t);
  }

  // 3. DOM 요소 생성
  function buildDeathDoms() {
    if (document.getElementById('death-jumpscare-overlay')) return;

    // 점프스케어 화면
    var overlay = document.createElement('div');
    overlay.id = 'death-jumpscare-overlay';
    overlay.innerHTML = '<img class="death-ghost" src="./assets/ghosts/crawler.png" alt="귀신">';
    document.body.appendChild(overlay);

    // 신문 호외 화면
    var modal = document.createElement('div');
    modal.id = 'death-newspaper-modal';
    modal.className = 'yk-end-ui';
    modal.innerHTML = 
      '<article class="death-paper-card">' +
        '<div class="death-paper-header">' +
          '<span class="death-paper-tag">京城日報 號外</span>' +
          '<div class="death-paper-date">1934年 10월 25일 · 號外 (第 一號)</div>' +
        '</div>' +
        '<h2 class="death-paper-title">『活版室 植字工, 闇黑 속으로 消失』</h2>' +
        '<p class="death-paper-sub">자정 2분 전 멈춘 시계… 인쇄소 문은 안에서 잠겨 있었다</p>' +
        '<div class="death-paper-body">' +
          '<div class="death-paper-stamp">未歸</div>' +
          '어젯밤 식자실에 들어간 식자공이 제한된 시간을 넘긴 채 흔적도 없이 사라졌다. ' +
          '인쇄기 롤러 사이에는 벗어 둔 앞치마만 감겨 있었고, 멈춘 괘종시계 아래 바닥에는 핏빛 먹물 발자국만이 찍혀 있었다고 전한다. ' +
          '총독부 경무국은 활판실 전체를 영구 폐쇄 조치하고 수색을 중단하였다.' +
        '</div>' +
        '<div class="death-paper-actions">' +
          '<button type="button" class="death-btn-retry" id="deathRetryBtn">다시 도전하기하기</button>' +
          '<button type="button" class="death-btn-exit" id="deathExitBtn">신문 본지로 나가기</button>' +
        '</div>' +
      '</article>';
    document.body.appendChild(modal);

    document.getElementById('deathRetryBtn').onclick = function() {
      try {
        sessionStorage.setItem('sikjasil_instant_restart', 'true');
      } catch (e) {}
      location.reload();
    };
    document.getElementById('deathExitBtn').onclick = function() {
      if (window.SikjasilExit) window.SikjasilExit();
      else location.href = '../index.html';
    };
  }

  // 4. 사망 연출 실행 (3단계)
  function triggerTimeoutDeath() {
    if (isDead) return;
    isDead = true;
    buildDeathDoms();

    var overlay = document.getElementById('death-jumpscare-overlay');
    var modal = document.getElementById('death-newspaper-modal');

    // 1단계: 암전
    overlay.className = 'blackout';
    playHeartbeat(0.9);

    // 마우스 포인터 락 해제
    if (document.exitPointerLock) document.exitPointerLock();

    // 2단계: 0.35초 후 귀신 급습 점프스케어
    setTimeout(function() {
      overlay.className = 'blackout rush';
      playDeathScream();
    }, 350);

    // 3단계: 1.5초 후 사망 신문 호외 팝업
    setTimeout(function() {
      modal.className = 'yk-end-ui active';
    }, 1500);
  }

  // 5. 손전등 깜빡임 연출
  var flickerTimer = null;
  function startFlicker() {
    if (document.body.classList.contains('flashlight-flicker')) return;
    document.body.classList.add('flashlight-flicker');
    if (!flickerTimer) {
      flickerTimer = setInterval(function() {
        if (isDead) { clearInterval(flickerTimer); return; }
        playHeartbeat(0.4);
      }, 900);
    }
  }

  function stopFlicker() {
    document.body.classList.remove('flashlight-flicker');
    if (flickerTimer) {
      clearInterval(flickerTimer);
      flickerTimer = null;
    }
  }

  // 전역 API 공개
  window.SikjasilDeathScene = {
    triggerTimeoutDeath: triggerTimeoutDeath,
    startFlicker: startFlicker,
    stopFlicker: stopFlicker
  };

  window.addEventListener('load', buildDeathDoms);

  // 주기적으로 타이머를 확인하여 30초 이하 시 손전등 깜빡임, 0초 시 사망 처리
  setInterval(function() {
    if (isDead) return;
    var timerEl = document.getElementById('play-timer');
    if (!timerEl) return;
    var strong = timerEl.querySelector('strong');
    if (!strong) return;
    var text = strong.textContent.trim();
    var parts = text.split(':');
    if (parts.length === 2) {
      var sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      if (sec <= 30 && sec > 0) {
        startFlicker();
      } else if (sec > 30) {
        stopFlicker();
      }
      if (sec === 0 && !isDead) {
        triggerTimeoutDeath();
      }
    }
  }, 400);

})();
