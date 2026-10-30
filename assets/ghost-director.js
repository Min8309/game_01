/* One encounter director shared by desktop and touch browsers. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SikjasilGhosts = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';

  /* =========================================================
     귀신 공포감 및 출현 연출 강도 조절 설정
     ========================================================= */
  var GHOST_CONFIG = {
    roomScale: 2.4,              // 방 안 3D 스프라이트 크기 배율 (기존 1.5 -> 2.4, 약 1.6배)
    spawnDistance: 2.5,          // 플레이어 시야 전방 출현 거리 (2~3m)
    screenMaxScale: 1.15,        // 화면 덮치는 귀신 최대 크기 배율
    fadeInSeconds: 0.1,          // 화면 귀신이 선명해지는 시간 (0.1초)
    staySeconds: 0.75,           // 화면에 선명하게 머무는 시간 (0.6~0.9초)
    totalDuration: 1.2,          // 화면 연출 전체 지속 시간 (초)
    screenShakeIntensity: 8,     // 화면 흔들림 강도 (px)
    shakeDuration: 0.3,          // 화면 흔들림 지속 시간 (초)
    darknessIntensity: 0.95,     // 어두워짐 및 암흑 비네트 강도 (0.0 ~ 1.0)
    flashColor: '#8a1c14'        // 나오는 순간 붉은 섬광 색상
  };

  var GHOSTS = [
    { id: 'crawler', name: '고개 꺾인 식자공', sheet: './assets/ghosts/crawler_anim.webp', cols: 4, rows: 2, frames: 8 },
    { id: 'shroud', name: '소복의 그림자', sheet: './assets/ghosts/shroud_anim.webp', cols: 4, rows: 2, frames: 8 },
    { id: 'wall', name: '벽을 찢고 나오는 것', sheet: './assets/ghosts/wall_anim.webp', cols: 4, rows: 2, frames: 8 },
    { id: 'hanged', name: '들보에 매달린 해골', sheet: './assets/ghosts/hanged_anim.webp', cols: 4, rows: 2, frames: 8 },
    { id: 'cabinet', name: '얼굴이 열린 여인', sheet: './assets/ghosts/cabinet_anim.webp', cols: 4, rows: 2, frames: 8 },
    { id: 'ink', name: '찢어진 웃음', sheet: './assets/ghosts/ink_anim.webp', cols: 4, rows: 2, frames: 8 }
  ];

  var PLACES = [
    { id: 'ceiling', name: '천장', point: [2.6, 3.3, -2.4], offset: [0, 1.1, 0] },
    { id: 'floor', name: '바닥', point: [0, .8, 2.4], offset: [0, -1.3, 0] },
    { id: 'corner', name: '코너', point: [-3.7, 1.8, -3.1], offset: [-.7, 0, 0] },
    { id: 'cabinet', name: '캐비닛 뒤', point: [-3.7, 2, .1], offset: [-.8, 0, 0] },
    { id: 'wall', name: '벽', point: [4.2, 2.1, -1.8], offset: [.8, 0, 0] },
    { id: 'corridor', name: '복도', point: [0, 1.9, -8.5], offset: [0, 0, -1.8] },
    { id: 'drawer', name: '서랍', point: [.9, 1.1, 1.8], offset: [0, -.8, -.2] },
    { id: 'door', name: '철문 뒤', point: [0, 1.8, -16.2], offset: [0, 0, -1.4] }
  ];

  function shuffled(list, random) {
    var result = list.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var value = result[i]; result[i] = result[j]; result[j] = value;
    }
    return result;
  }

  var ACTIONS = ['drop', 'rise', 'sweep', 'rush', 'corner', 'retreat'];

  var SCHEDULE_BASES = [20, 55, 95, 140, 190, 245];
  var SCHEDULE_RANGES = [15, 20, 25, 30, 35, 45];

  function createPlan(random) {
    random = random || Math.random;
    var ghosts = shuffled(GHOSTS, random);
    var places = shuffled([PLACES[0], PLACES[1], ...shuffled(PLACES.slice(2), random).slice(0, 4)], random);
    var actions = shuffled(ACTIONS.filter(a => a !== 'drop' && a !== 'rise'), random);
    var hasCeiling = places.slice(0, 6).some(p => p.id === 'ceiling');
    var hasFloor = places.slice(0, 6).some(p => p.id === 'floor');
    if (!hasCeiling) actions.push('drop');
    if (!hasFloor) actions.push('rise');
    return ghosts.map(function (ghost, i) {
      return {
        at: SCHEDULE_BASES[i] + random() * SCHEDULE_RANGES[i],
        ghost: ghost,
        place: places[i],
        action: places[i].id === 'ceiling' ? 'drop' : places[i].id === 'floor' ? 'rise' : actions.shift(),
        seen: false
      };
    });
  }

  function resolveExpandedPlace(position, forward, random, fallback) {
    if (position.x < 5.4) return fallback;
    random = random || Math.random;
    var zone = position.x >= 35 ? 'photos' : position.x >= 28 ? 'darkroom' : position.x >= 14 ? 'archive' : 'stairs';
    var bounds = zone === 'photos' ? [35, 42, -5.7, .3, 3.2] : zone === 'darkroom' ? [28, 35, -5.7, .3, 3.2] : zone === 'archive' ? [14, 28, -6.2, .8, 5.2] : [5.4, 14, -3.9, -1.5, 2.8];
    var floor = zone === 'stairs' ? -Math.max(0, Math.min(20, Math.floor((position.x - 5.8) / .32) + 1)) * .18 : -3.6;
    var clamp = (value, min, max) => Math.max(min + .35, Math.min(max - .35, value));
    var x = clamp(position.x + forward.x * 2.2, bounds[0], bounds[1]), z = clamp(position.z + forward.z * 2.2, bounds[2], bounds[3]);
    var kind = fallback?.action === 'drop' ? 'ceiling' : fallback?.action === 'rise' ? 'floor' : fallback?.action ? ['wall', 'corner'][Math.min(1, Math.floor(random() * 2))] : ['ceiling', 'floor', 'wall', 'corner'][Math.min(3, Math.floor(random() * 4))];
    var y = floor + 1.5, offset = [0, 0, 0];
    if (kind === 'ceiling') { y = floor + bounds[4] - 1.05; offset = [0, .8, 0]; }
    if (kind === 'floor') { y = floor + .65; offset = [0, -.9, 0]; }
    if (kind === 'wall') { z = forward.z > 0 ? bounds[3] - .25 : bounds[2] + .25; offset = [0, 0, forward.z > 0 ? .6 : -.6]; }
    if (kind === 'corner') { x = forward.x > 0 ? bounds[1] - .4 : bounds[0] + .4; z = forward.z > 0 ? bounds[3] - .4 : bounds[2] + .4; offset = [forward.x > 0 ? .5 : -.5, 0, 0]; }
    var names = { ceiling: '천장', floor: '바닥', wall: '벽', corner: '코너' };
    return { id: kind, name: names[kind], zone: zone, point: [x, y, z], offset: offset };
  }

  function fadeOpacity(seconds) {
    if (seconds < 0 || seconds >= 2.4) return 0;
    if (seconds <= GHOST_CONFIG.fadeInSeconds) {
      return seconds / GHOST_CONFIG.fadeInSeconds;
    }
    if (seconds <= GHOST_CONFIG.staySeconds) {
      return 1.0;
    }
    return Math.max(0, (2.4 - seconds) / (2.4 - GHOST_CONFIG.staySeconds));
  }

  class Director {
    constructor(options) {
      options = options || {};
      Object.assign(this, options);
      this.popupSound = window.SikjasilGhostAudio?.PopupAudio ? new window.SikjasilGhostAudio.PopupAudio(this.soundManager, this.random || Math.random) : null;
      this.plan = createPlan(options.random);
      this.encounters = this.plan;
      this.history = [];
      this.active = null;
      this.stopped = false;
      this.ready = false;
      this.lastEncounter = -Infinity;
      this.textures = new Map();
      this.images = new Map();
      this.animatedFrames = new Map();
      this.currentFrameIdx = -1;
      this.pending = new Map();
      this.failedAssets = [];

      var T = this.THREE;
      if (T && T.SpriteMaterial) {
        this.material = new T.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false, toneMapped: false });
        this.sprite = new T.Sprite(this.material);
        this.sprite.visible = false;
        this.sprite.renderOrder = 500;
        this.sprite.userData.isGhostEffect = true;
        this.sprite.raycast = function () {};
        if (this.scene) this.scene.add(this.sprite);
      }

      if (typeof document !== 'undefined') {
        this.layer = document.createElement('div');
        this.layer.id = 'ghost-apparition-overlay';
        this.layer.setAttribute('aria-hidden', 'true');
        this.layer.innerHTML = '<div class="ghost-veil"></div><div class="ghost-figure" draggable="false"></div>';
        document.body.appendChild(this.layer);
        this.figure = this.layer.querySelector('.ghost-figure');
      }

      var loader = T && T.TextureLoader ? new T.TextureLoader() : null;
      var loadPromises = GHOSTS.map(ghost => {
        var sheetUrl = this.resolveMedia ? this.resolveMedia(ghost.sheet) : ghost.sheet;
        var image = typeof Image !== 'undefined' ? new Image() : { complete: true, naturalWidth: 2048 };
        var decoded = new Promise(resolve => {
          if (typeof Image === 'undefined') return resolve(true);
          image.onload = () => (image.decode ? image.decode() : Promise.resolve()).then(() => resolve(true), () => resolve(true));
          image.onerror = () => resolve(false);
          image.src = sheetUrl;
        });
        this.images.set(ghost.id, image);

        var textured = new Promise(resolve => {
          if (!loader) {
            this.textures.set(ghost.id, {});
            return resolve(true);
          }
          loader.load(sheetUrl, texture => {
            texture.colorSpace = T.SRGBColorSpace;
            texture.repeat.set(1 / ghost.cols, 1 / ghost.rows);
            texture.offset.set(0, 1 - 1 / ghost.rows);
            this.textures.set(ghost.id, texture);
            resolve(true);
          }, undefined, () => resolve(false));
        });

        var p = Promise.all([decoded, textured]).then(result => {
          if (!result.every(Boolean)) this.failedAssets.push(ghost.sheet);
          return result.every(Boolean);
        });
        this.pending.set(ghost.id, p);
        return p;
      });

      this.readyPromise = Promise.all(loadPromises).then(results => {
        this.ready = results.every(Boolean);
        if (this.renderer) {
          this.warmup(this.renderer, this.scene, this.camera);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sikjasil-ghosts-ready', { detail: { ready: this.ready } }));
        }
        return this.ready;
      });

      this.lastGhostId = null;
      if (typeof window !== 'undefined') {
        this._onProgress = () => {
          this.accelerateUnseen(this._lastElapsed || 0);
        };
        window.addEventListener('space-inspect-close', this._onProgress);
        window.addEventListener('room-puzzles', this._onProgress);
        window.addEventListener('sikjasil-clue', this._onProgress);
        initGhostTestUI(this);
      }
    }

    warmup(renderer, scene, camera) {
      if (!renderer) return;
      var targetScene = scene || this.scene;
      var targetCam = camera || this.camera;
      this.textures.forEach((texture) => {
        if (renderer.initTexture && texture && texture.image) {
          try { renderer.initTexture(texture); } catch (e) {}
        }
        if (this.material && targetScene && targetCam) {
          this.material.map = texture;
          this.material.needsUpdate = true;
          try {
            renderer.compile(targetScene, targetCam);
          } catch (e) {}
        }
      });
      if (this.material) {
        this.material.map = null;
        this.material.needsUpdate = true;
      }
    }

    applyFrame(ghost, frameIdx) {
      var cols = ghost.cols || 4;
      var rows = ghost.rows || 2;
      var col = frameIdx % cols;
      var row = Math.floor(frameIdx / cols);
      var x = cols > 1 ? (col / (cols - 1)) * 100 : 0;
      var y = rows > 1 ? (row / (rows - 1)) * 100 : 0;

      if (this.figure && this.figure.style) {
        this.figure.style.backgroundPosition = x + '% ' + y + '%';
      }

      var tex = this.textures.get(ghost.id);
      if (tex && tex.offset) {
        tex.offset.set(col / cols, 1 - (row + 1) / rows);
      }
    }

    accelerateUnseen(elapsed) {
      if (!this.plan) return;
      var unseen = this.plan.filter(e => !e.seen);
      if (unseen.length === 0) return;
      var target = unseen[0];
      if (target.at > elapsed) {
        target.at = Math.max(0, elapsed);
      }
    }

    canShow() {
      return this.isAllowed ? this.isAllowed() : true;
    }

    trigger(encounter, now) {
      if (this.stopped || this.active || encounter.seen || !this.ready || !this.canShow()) return false;
      encounter.seen = true;
      var requested = { ...encounter.place, action: encounter.action };
      var place = this.resolvePlace ? this.resolvePlace(requested) : requested;
      var T = this.THREE, point = new T.Vector3(...place.point);
      var origin = point.clone().add(new T.Vector3(...place.offset));
      this.active = { encounter: encounter, startedAt: now, origin: origin, target: point };
      this.currentFrameIdx = -1;

      var tex = this.textures.get(encounter.ghost.id);
      if (tex) {
        this.material.map = tex;
        this.material.needsUpdate = true;
      }
      this.material.opacity = 0;
      this.sprite.visible = false;
      this.sprite.position.copy(origin);
      this.sprite.scale.set(GHOST_CONFIG.roomScale, GHOST_CONFIG.roomScale * 1.5, 1);
      if (this.camera && this.THREE) {
        var T = this.THREE;
        var camPos = this.camera.position.clone();
        var camDir = new T.Vector3();
        this.camera.getWorldDirection(camDir);
        camDir.y = 0;
        if (camDir.lengthSq() > 0.01) {
          camDir.normalize();
          var spawnPos = camPos.clone().add(camDir.multiplyScalar(GHOST_CONFIG.spawnDistance));
          spawnPos.y = camPos.y - 0.15;
          this.sprite.position.copy(spawnPos);
        }
      }

      var img = this.images.get(encounter.ghost.id);
      var sheetUrl = img ? img.src : (this.resolveMedia ? this.resolveMedia(encounter.ghost.sheet) : encounter.ghost.sheet);
      if (this.figure && this.figure.style) {
        this.figure.style.backgroundImage = 'url("' + sheetUrl + '")';
      }
      this.applyFrame(encounter.ghost, 0);
      this.currentFrameIdx = 0;

      if (this.layer && this.layer.dataset) {
        this.layer.dataset.location = place.id;
        this.layer.dataset.zone = place.zone || 'main';
        this.layer.dataset.ghost = encounter.ghost.id;
        this.layer.dataset.action = encounter.action || 'rush';
        this.layer.classList.remove('active');
        void this.layer.offsetWidth;
        this.layer.classList.add('active');
      }

      var reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reducedMotion && typeof document !== 'undefined' && document.body) {
        document.body.classList.add('ghost-shock', 'ghost-impact-flash');
        setTimeout(function () {
          document.body.classList.remove('ghost-shock', 'ghost-impact-flash');
        }, GHOST_CONFIG.shakeDuration * 1000);
      }
      this.lighting?.triggerFlicker?.();
      this.popupSound?.play?.(GHOST_CONFIG.totalDuration);
      this.lastGhostId = encounter.ghost.id;

      var record = {
        number: this.history.length + 1,
        action: encounter.action || 'rush',
        ghost: encounter.ghost.id,
        location: place.id,
        zone: place.zone || 'main',
        point: place.point.slice(),
        scheduledSeconds: encounter.at,
        shownAt: now
      };
      this.history.push(record);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('ghost-encounter', { detail: record }));
      }
      return true;
    }

    hide() {
      this.popupSound?.stop?.();
      if (typeof document !== 'undefined' && document.body) document.body.classList.remove('ghost-shock');
      if (this.sprite) this.sprite.visible = false;
      if (this.material) this.material.opacity = 0;
      if (this.layer && this.layer.classList) this.layer.classList.remove('active');
      this.active = null;
      this.currentFrameIdx = -1;
    }


    forceTrigger(ghostId) {
      var ghost = GHOSTS.find(function (g) { return g.id === ghostId; }) || GHOSTS[0];
      var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      var dummyEncounter = {
        at: 0,
        ghost: ghost,
        place: PLACES[0],
        action: 'rush',
        seen: false
      };
      if (this.active) this.hide();
      this.trigger(dummyEncounter, now);
    }
    stop() {
      this.stopped = true;
      if (typeof window !== 'undefined' && this._onProgress) {
        window.removeEventListener('space-inspect-close', this._onProgress);
        window.removeEventListener('room-puzzles', this._onProgress);
        window.removeEventListener('sikjasil-clue', this._onProgress);
      }
      this.hide();
    }

    update(now, enabled, elapsed) {
      this._lastElapsed = elapsed;
      this.popupSound?.prepare?.();
      if (this.soundManager?.isMuted) this.popupSound?.stop?.(0);
      if (this.stopped) return;
      if (!enabled || !this.canShow()) {
        if (this.active) this.lastEncounter = now;
        this.hide();
        return;
      }
      if (this.active) {
        var seconds = (now - this.active.startedAt) / 1000;
        if (seconds >= 2.4) {
          this.hide();
          this.lastEncounter = now;
          return;
        }

        // 2.0초 동안 8단계 연속 프레임 애니메이션 (0ms 오버헤드 background-position / UV offset 이동)
        var ghost = this.active.encounter.ghost;
        var totalFrames = ghost.frames || 8;
        var targetFrame = Math.min(totalFrames - 1, Math.floor((seconds / 2.0) * totalFrames));
        if (this.currentFrameIdx !== targetFrame) {
          this.currentFrameIdx = targetFrame;
          this.applyFrame(ghost, targetFrame);
        }

        if (this.sprite && this.active.origin && this.active.target) {
          var lunge = 1 - Math.pow(1 - Math.min(1, seconds / .2), 3);
          this.sprite.position.lerpVectors(this.active.origin, this.active.target, lunge);
          var scale = 1 + Math.min(.3, seconds * .5);
          this.sprite.scale.set(1.5 * scale, 2.25 * scale, 1);
        }
        if (this.material) {
          this.material.opacity = fadeOpacity(seconds);
        }
        return;
      }
      if (!this.ready || (typeof document !== 'undefined' && (document.hidden || document.querySelector('.gp-room-effect'))) || now - this.lastEncounter < 8000) return;
      var next = this.plan.find(encounter => !encounter.seen && (!this.lastGhostId || encounter.ghost.id !== this.lastGhostId)) || this.plan.find(encounter => !encounter.seen);
      // 계획된 6마리가 모두 소진된 경우, 순환 덱으로 새로운 6마리 셔플 계획 추가
      if (!next && elapsed < 597) {
        var extraPlan = createPlan(this.random || Math.random);
        extraPlan.forEach(e => {
          e.at += elapsed;
          this.plan.push(e);
        });
        next = this.plan.find(encounter => !encounter.seen);
      }
      if (next && elapsed >= next.at && elapsed < 597) this.trigger(next, now);
    }
  }


  function initGhostTestUI(director) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('ghosttest') !== '1') return;
      if (document.getElementById('ghost-test-panel')) return;

      var panel = document.createElement('div');
      panel.id = 'ghost-test-panel';
      panel.style.cssText = 'position:fixed;top:80px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:6px;background:rgba(15,7,7,0.92);border:1px solid #d32f2f;padding:10px 12px;border-radius:6px;box-shadow:0 0 16px rgba(211,47,47,0.6);font-family:sans-serif;pointer-events:auto;';

      var title = document.createElement('div');
      title.style.cssText = 'color:#ff8888;font-size:12px;font-weight:bold;margin-bottom:4px;text-align:center;letter-spacing:0.5px;';
      title.textContent = '귀신 테스트 모드';
      panel.appendChild(title);

      GHOSTS.forEach(function (g) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'ghost-test-btn-' + g.id;
        btn.textContent = g.name;
        btn.style.cssText = 'background:#2d0a0a;color:#ffdada;border:1px solid #a82424;padding:6px 12px;font-size:11px;font-weight:600;border-radius:3px;cursor:pointer;text-align:left;transition:all 0.15s;';
        btn.onmouseenter = function () { btn.style.background = '#5c1414'; };
        btn.onmouseleave = function () { btn.style.background = '#2d0a0a'; };
        btn.onclick = function () {
          director.forceTrigger(g.id);
        };
        panel.appendChild(btn);
      });

      document.body.appendChild(panel);
    } catch (e) {
      console.warn('initGhostTestUI error:', e);
    }
  }

  return {
    Director: Director,
    createPlan: createPlan,
    GHOSTS: GHOSTS,
    PLACES: PLACES,
    resolveExpandedPlace: resolveExpandedPlace,
    fadeOpacity: fadeOpacity,
    ACTIONS: ACTIONS
  };
});
