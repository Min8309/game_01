/* =========================================================
   3D 식자실 수사 수첩 (Investigation Notebook) 모듈
   - 1930년대 동아일보 식자실 단서 및 수집한 납 활자 실시간 기록
   ========================================================= */

(function () {
  'use strict';

  var clues = [
    {
      id: 'rules',
      title: '📜 식자실 작업 규정',
      text: '한 장의 신문을 조판하기 위해 흩어진 8개의 핵심 납 활자를 모두 찾아내 괘선대에 정렬해야 한다.',
      found: true
    },
    {
      id: 'mirror',
      title: '🔍 납 활자의 비밀',
      text: '1930년대 활판 인쇄술의 납 활자는 종이에 찍힐 때 바로 보이도록 좌우가 거울처럼 반전(양각)되어 주조된다.',
      found: true
    },
    {
      id: 'clock',
      title: '⏰ 괘종시계의 시간 암호',
      text: '사건이 벌어진 결정적 순간의 시각(時刻)을 가리킬 때 괘종시계의 비밀 태엽 장치가 해제된다.',
      found: false
    },
    {
      id: 'cipher',
      title: '🗝️ 괘선대 아래 숨겨진 쪽지',
      text: '어둠 속에서 귀신의 한탄이 들려올 때 벽면 틈새와 활자 상자 밑바닥을 주의 깊게 조사하라.',
      found: false
    }
  ];

  var leadTypes = [
    { char: '京', label: '서울 경', collected: true },
    { char: '城', label: '성 성', collected: true },
    { char: '野', label: '들 야', collected: false },
    { char: '錄', label: '기록할 록', collected: false },
    { char: '號', label: '이름 호', collected: false },
    { char: '外', label: '바깥 외', collected: false },
    { char: '特', label: '특별할 특', collected: false },
    { char: '輯', label: '모을 집', collected: false }
  ];

  function initNotebook() {
    if (document.getElementById('notebookModalOverlay')) return;

    // 토글 버튼
    var toggleBtn = document.createElement('button');
    toggleBtn.id = 'notebookToggleBtn';
    toggleBtn.className = 'notebook-toggle-btn';
    toggleBtn.setAttribute('type', 'button');
    toggleBtn.setAttribute('aria-label', '수사 수첩 열기 (단축키 N)');
    toggleBtn.innerHTML = '<span class="icon">📓</span><span>수사 수첩</span><span class="key-badge">N</span>';
    toggleBtn.style.display = 'none'; // 식자공의 수첩으로 일원화 (단추 숨김 보존)
    document.body.appendChild(toggleBtn);

    // 모달 오버레이
    var overlay = document.createElement('div');
    overlay.id = 'notebookModalOverlay';
    overlay.className = 'notebook-modal-overlay';

    var book = document.createElement('div');
    book.className = 'notebook-book';

    book.innerHTML =
      '<div class="notebook-header">' +
        '<h3><span>📖</span>1930년대 경성 인쇄소 수사 수첩 (搜査 手帖)</h3>' +
        '<button type="button" class="notebook-close-btn" id="notebookCloseBtn">✕ 수첩 덮기 (ESC)</button>' +
      '</div>' +
      '<div class="notebook-pages">' +
        '<div class="notebook-page left-page">' +
          '<h4 class="notebook-section-title"><span>📌</span>발견한 단서 및 작업 수칙</h4>' +
          '<div class="clue-list" id="notebookClueList"></div>' +
        '</div>' +
        '<div class="notebook-page right-page">' +
          '<h4 class="notebook-section-title"><span>🔲</span>수습한 납 활자 (活字 8선)</h4>' +
          '<p style="font-size:11.5px;color:#6b533e;margin:0 0 10px;line-height:1.4;">식자실 각지에서 수습한 8개의 납 활자 현황입니다.</p>' +
          '<div class="types-grid" id="notebookTypesGrid"></div>' +
          '<div style="margin-top:20px;padding:12px;background:#ede2cb;border:1px solid #c4b093;border-radius:4px;">' +
            '<div style="font-size:12px;font-weight:700;color:#291a0e;margin-bottom:4px;">💡 조작 안내</div>' +
            '<div style="font-size:11px;color:#5a422d;line-height:1.5;">' +
              '이동: [W, A, S, D] | 조사/상호작용: [마우스 좌클릭 / 화면 탭]<br>' +
              '시점 회전: 마우스 이동 | 수첩 토글: [N 키]' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="notebook-footer">' +
        '경성야록 3D 활판인쇄 식자실 — 납 활자를 모아 신문을 완성하고 탈출하세요.' +
      '</div>';

    overlay.style.display = 'none'; // 식자공의 수첩(#notebook-modal)으로 일원화
    overlay.appendChild(book);
    document.body.appendChild(overlay);

    function renderContent() {
      // 단서 리스트
      var clueList = document.getElementById('notebookClueList');
      if (clueList) {
        clueList.innerHTML = clues.map(function (c) {
          return '<div class="clue-card' + (c.found ? ' found' : '') + '">' +
                   '<div class="clue-title">' + c.title + (c.found ? ' <span style="font-size:10px;color:#226f42;font-weight:normal;">[확인됨]</span>' : '') + '</div>' +
                   '<p class="clue-body">' + c.text + '</p>' +
                 '</div>';
        }).join('');
      }

      // 활자 그리드
      var typesGrid = document.getElementById('notebookTypesGrid');
      if (typesGrid) {
        typesGrid.innerHTML = leadTypes.map(function (t) {
          return '<div class="type-slot' + (t.collected ? ' collected' : '') + '">' +
                   '<span>' + (t.collected ? t.char : '?') + '</span>' +
                   '<span class="slot-label">' + t.label + '</span>' +
                 '</div>';
        }).join('');
      }
    }

    // 식자공의 수첩(#notebook-modal) 내부에도 수사 단서 & 활자 8선 구역 삽입
    function injectIntoMainNotebook() {
      var rightPage = document.querySelector('#notebook-modal .right-page');
      if (!rightPage || document.getElementById('main-notebook-investigation-ext')) return;

      var extContainer = document.createElement('div');
      extContainer.id = 'main-notebook-investigation-ext';
      extContainer.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px dashed #7a6345;';
      extContainer.innerHTML = 
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
          '<h4 style="font-size:13px;font-weight:700;color:#3b2314;margin:0;">수습 납 활자 (活字 8선)</h4>' +
          '<span id="mainNotebookLeadCount" style="font-size:11px;color:#8a2020;font-weight:700;">2 / 8</span>' +
        '</div>' +
        '<div id="mainNotebookTypesGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;"></div>' +
        '<details style="margin-top:6px;font-size:11.5px;color:#5a422d;">' +
          '<summary style="cursor:pointer;font-weight:700;color:#2e1a0c;padding:3px 0;">식자실 작업 수칙 및 비망록 (펼치기)</summary>' +
          '<div id="mainNotebookClueList" style="display:flex;flex-direction:column;gap:5px;margin-top:6px;"></div>' +
        '</details>';

      var summaryEl = rightPage.querySelector('.notebook-status-summary');
      if (summaryEl) rightPage.insertBefore(extContainer, summaryEl);
      else rightPage.appendChild(extContainer);
    }

    function syncMainNotebookUI() {
      injectIntoMainNotebook();
      var grid = document.getElementById('mainNotebookTypesGrid');
      var list = document.getElementById('mainNotebookClueList');
      var countEl = document.getElementById('mainNotebookLeadCount');

      if (grid) {
        grid.innerHTML = leadTypes.map(function(t) {
          return '<div style="border:1px solid ' + (t.collected ? '#3a7d44' : '#b8a58a') + ';background:' + (t.collected ? '#eef8ef' : '#eae1cd') + ';padding:4px;text-align:center;border-radius:3px;">' +
                   '<span style="font-size:15px;font-weight:700;color:' + (t.collected ? '#1a4e23' : '#998a75') + ';display:block;">' + (t.collected ? t.char : '?') + '</span>' +
                   '<span style="font-size:10px;color:#6b533e;display:block;">' + t.label + '</span>' +
                 '</div>';
        }).join('');
      }
      if (countEl) {
        var cCount = leadTypes.filter(function(t) { return t.collected; }).length;
        countEl.textContent = cCount + ' / ' + leadTypes.length;
      }
      if (list) {
        list.innerHTML = clues.map(function(c) {
          return '<div style="background:#ede4d0;border-left:3px solid ' + (c.found ? '#2e6b3e' : '#a8947c') + ';padding:5px 8px;border-radius:2px;">' +
                   '<div style="font-weight:700;color:#2c190d;font-size:11.5px;">' + c.title + (c.found ? ' <span style="color:#226f42;font-size:10px;">[확인됨]</span>' : '') + '</div>' +
                   '<div style="font-size:11px;color:#5c4735;line-height:1.4;">' + c.text + '</div>' +
                 '</div>';
        }).join('');
      }
    }

    window.addEventListener('load', syncMainNotebookUI);
    window.addEventListener('sikjasil-ready', syncMainNotebookUI);

    var origRenderContent = renderContent;
    renderContent = function() {
      origRenderContent();
      syncMainNotebookUI();
    };

    renderContent();

    function openNotebook() {
      // 포인터 락 해제하여 마우스 커서 표시
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
      renderContent();
      overlay.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeNotebook() {
      overlay.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (overlay.classList.contains('open')) closeNotebook();
      else openNotebook();
    });

    document.getElementById('notebookCloseBtn').addEventListener('click', closeNotebook);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeNotebook();
    });

    // N키 단축키는 본체 Ou 클래스에서 통합 처리
    // window.addEventListener('keydown', function (e) {
    // if (e.key === 'n' || e.key === 'N') {
    // e.preventDefault();
    // // 본체 식자공의 수첩(#notebook-modal) 토글
    // var statusTag = document.getElementById('notebook-status');
    // if (statusTag) {
    // statusTag.click();
    // } else if (window.game && window.game.notebookUI) {
    // window.game.notebookUI.toggle();
    // }
    // } else if (e.key === 'Escape') {
    // if (overlay.classList.contains('open')) closeNotebook();
    // }
    // });

    // 전역 API 노출
    window.SIKJASIL_NOTEBOOK = {
      open: openNotebook,
      close: closeNotebook,
      unlockClue: function (id) {
        for (var i = 0; i < clues.length; i++) {
          if (clues[i].id === id) {
            clues[i].found = true;
            renderContent();
            break;
          }
        }
      },
      collectType: function (char) {
        for (var i = 0; i < leadTypes.length; i++) {
          if (leadTypes[i].char === char) {
            leadTypes[i].collected = true;
            renderContent();
            break;
          }
        }
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotebook);
  } else {
    initNotebook();
  }
})();
