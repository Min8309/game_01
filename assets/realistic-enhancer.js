/* =========================================================
   경성야록 식자실 — 실시간 3D 입체 텍스처 & 세월의 굴곡 리마스터
   - 리얼한 납 활자(Lead Types) 3D 입체 질감 및 양각 한자 글리프 셰이딩
   - 평면 3D를 탈피한 세월의 굴곡 (마룻바닥 중앙 침하, 오래된 목재 휨)
   - 벽면 포스터(작업 규정, 식자 완료 표찰) 복원 및 선명한 3D 배치
   - Tangent-Space 3D Normal Map & Bevel Highlight
   ========================================================= */
(function() {
  'use strict';

  // 1. 높이맵(Heightmap)으로부터 3D 법선 벡터 노멀맵(Normal Map) 생성
  function createNormalMapFromHeight(heightCanvas, THREE, strength) {
    var width = heightCanvas.width;
    var height = heightCanvas.height;
    var hCtx = heightCanvas.getContext('2d');
    var src = hCtx.getImageData(0, 0, width, height).data;

    var normCanvas = document.createElement('canvas');
    normCanvas.width = width;
    normCanvas.height = height;
    var nCtx = normCanvas.getContext('2d');
    var nImgData = nCtx.createImageData(width, height);
    var dst = nImgData.data;

    strength = strength || 2.4;

    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var x0 = x > 0 ? x - 1 : width - 1;
        var x1 = x < width - 1 ? x + 1 : 0;
        var y0 = y > 0 ? y - 1 : height - 1;
        var y1 = y < height - 1 ? y + 1 : 0;

        var hL = src[(y * width + x0) * 4];
        var hR = src[(y * width + x1) * 4];
        var hU = src[(y0 * width + x) * 4];
        var hD = src[(y1 * width + x) * 4];

        var dx = (hR - hL) / 255.0 * strength;
        var dy = (hD - hU) / 255.0 * strength;
        var invLen = 1.0 / Math.sqrt(dx * dx + dy * dy + 1.0);
        var idx = (y * width + x) * 4;
        dst[idx]     = ((dx * invLen * 0.5 + 0.5) * 255) | 0;
        dst[idx + 1] = ((-dy * invLen * 0.5 + 0.5) * 255) | 0;
        dst[idx + 2] = ((invLen * 0.5 + 0.5) * 255) | 0;
        dst[idx + 3] = 255;
      }
    }

    nCtx.putImageData(nImgData, 0, 0);
    var tex = new THREE.CanvasTexture(normCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // 2. 3D 리얼 납 활자(Lead Types) 텍스처 (타일 느낌 완전 탈피, 양각 거울상 한자 글리프 + 납 금속 질감)
  function create3DLeadTypes(THREE) {
    var size = 512;
    var diffCanvas = document.createElement('canvas');
    diffCanvas.width = diffCanvas.height = size;
    var dCtx = diffCanvas.getContext('2d');

    var heightCanvas = document.createElement('canvas');
    heightCanvas.width = heightCanvas.height = size;
    var hCtx = heightCanvas.getContext('2d');

    var roughCanvas = document.createElement('canvas');
    roughCanvas.width = roughCanvas.height = size;
    var rCtx = roughCanvas.getContext('2d');

    // 고목 활자함 격자 베이스 (나무 틀)
    dCtx.fillStyle = '#1c140d';
    dCtx.fillRect(0, 0, size, size);
    hCtx.fillStyle = '#202020';
    hCtx.fillRect(0, 0, size, size);
    rCtx.fillStyle = '#908070';
    rCtx.fillRect(0, 0, size, size);

    var cols = 16;
    var rows = 16;
    var cw = size / cols;
    var ch = size / rows;

    // 실제 1930년대 활판 인쇄에 쓰이던 한자/부호 목록
    var glyphs = [
      '京', '城', '日', '報', '號', '外', '活', '版', '植', '字', '工', '鉛', '墨', '印', '刷',
      '局', '道', '社', '會', '記', '事', '未', '詳', '夜', '時', '分', '鐵', '門', '暗', '號',
      '秘', '密', '案', '內', '紙', '本', '手', '帖', '鏡', '鐘', '針', '輪', '轉', '機', '電'
    ];

    dCtx.textAlign = 'center';
    dCtx.textBaseline = 'middle';
    dCtx.font = 'bold ' + Math.floor(ch * 0.58) + 'px "Noto Serif KR", "Nanum Myeongjo", serif';

    hCtx.textAlign = 'center';
    hCtx.textBaseline = 'middle';
    hCtx.font = 'bold ' + Math.floor(ch * 0.58) + 'px "Noto Serif KR", "Nanum Myeongjo", serif';

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = c * cw;
        var y = r * ch;

        // 10% 확률로 비어있는 슬롯 (활자를 뽑아 조판 중인 빈 홈)
        var isEmpty = ((r * 13 + c * 7) % 11 === 0);

        // 칸 테두리 (나무 파티션 단차)
        dCtx.strokeStyle = '#0a0704';
        dCtx.lineWidth = 1.5;
        dCtx.strokeRect(x, y, cw, ch);

        if (isEmpty) {
          // 어둡게 패인 빈 홈
          dCtx.fillStyle = '#0a0705';
          dCtx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
          hCtx.fillStyle = '#050505';
          hCtx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
          continue;
        }

        // 납 활자 기둥 베이스 (거친 은회색 납 합금)
        var leadTone = 110 + ((r * 19 + c * 23) % 45);
        dCtx.fillStyle = 'rgb(' + leadTone + ',' + (leadTone + 2) + ',' + (leadTone + 6) + ')';
        dCtx.fillRect(x + 1.5, y + 1.5, cw - 3, ch - 3);

        // 납 표면 거친 텍스처 노이즈
        dCtx.fillStyle = 'rgba(20, 20, 20, 0.2)';
        dCtx.fillRect(x + 2, y + 2, (cw - 4) * 0.8, 1);

        // 모서리 베벨(입체 음영)
        dCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        dCtx.fillRect(x + 1.5, y + 1.5, cw - 3, 1);
        dCtx.fillRect(x + 1.5, y + 1.5, 1, ch - 3);

        dCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        dCtx.fillRect(x + 1.5, y + ch - 2.5, cw - 3, 1);
        dCtx.fillRect(x + cw - 2.5, y + 1.5, 1, ch - 3);

        // 높이맵 (활자 기둥은 솟아있음)
        hCtx.fillStyle = '#b0b0b0';
        hCtx.fillRect(x + 1.5, y + 1.5, cw - 3, ch - 3);

        // 거친 금속 거칠기
        rCtx.fillStyle = '#757575';
        rCtx.fillRect(x + 1, y + 1, cw - 2, ch - 2);

        // 실제 거울상(Mirror) 양각 글자 렌더링 (인쇄용 활자는 반대로 새겨짐)
        var char = glyphs[(r * cols + c) % glyphs.length];
        var cx = x + cw * 0.5;
        var cy = y + ch * 0.5;

        // 먹물 잉크 찌꺼기 번짐 (검은 잉크가 획 틈새에 고임)
        dCtx.save();
        dCtx.translate(cx, cy);
        dCtx.scale(-1, 1); // 활자 거울상 반전!
        dCtx.fillStyle = '#100a08';
        dCtx.fillText(char, 0.5, 0.5);
        dCtx.fillStyle = '#222224';
        dCtx.fillText(char, 0, 0);
        dCtx.restore();

        // 글자 양각 높이맵 (획이 앞으로 튀어나옴 -> 노멀맵에서 입체 음영 생성)
        hCtx.save();
        hCtx.translate(cx, cy);
        hCtx.scale(-1, 1);
        hCtx.fillStyle = '#ffffff'; // 최상단 양각
        hCtx.fillText(char, 0, 0);
        hCtx.restore();

        // 잉크 묻은 글자면은 거칠기가 낮아 빛을 반사함
        rCtx.save();
        rCtx.translate(cx, cy);
        rCtx.scale(-1, 1);
        rCtx.fillStyle = '#3a3a3a';
        rCtx.fillText(char, 0, 0);
        rCtx.restore();
      }
    }

    var diffuse = new THREE.CanvasTexture(diffCanvas);
    diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;

    var normal = createNormalMapFromHeight(heightCanvas, THREE, 3.2);

    var roughness = new THREE.CanvasTexture(roughCanvas);
    roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

    return { diffuse: diffuse, normal: normal, roughness: roughness };
  }

  // 3. 3D 원목 테이블/책상 텍스처
  function create3DHorrorWood(THREE) {
    var size = 256;
    var diffCanvas = document.createElement('canvas');
    diffCanvas.width = diffCanvas.height = size;
    var dCtx = diffCanvas.getContext('2d');

    var heightCanvas = document.createElement('canvas');
    heightCanvas.width = heightCanvas.height = size;
    var hCtx = heightCanvas.getContext('2d');

    var roughCanvas = document.createElement('canvas');
    roughCanvas.width = roughCanvas.height = size;
    var rCtx = roughCanvas.getContext('2d');

    dCtx.fillStyle = '#1c130c';
    dCtx.fillRect(0, 0, size, size);
    hCtx.fillStyle = '#808080';
    hCtx.fillRect(0, 0, size, size);
    rCtx.fillStyle = '#b0b0b0';
    rCtx.fillRect(0, 0, size, size);

    for (var p = 0; p < size; p += 64) {
      dCtx.fillStyle = '#0a0604';
      dCtx.fillRect(0, p, size, 3);
      hCtx.fillStyle = '#202020';
      hCtx.fillRect(0, p, size, 3);

      dCtx.fillStyle = '#3a2718';
      dCtx.fillRect(0, p + 3, size, 1.5);
      hCtx.fillStyle = '#d0d0d0';
      hCtx.fillRect(0, p + 3, size, 1.5);
    }

    for (var k = 0; k < 6; k++) {
      var kx = (k * 43) % size;
      var ky = (k * 61) % size;
      var len = 15 + (k * 7) % 25;
      var angle = 0.2 + (k % 3) * 0.4;

      dCtx.strokeStyle = 'rgba(8, 4, 2, 0.85)';
      dCtx.lineWidth = 1.2;
      dCtx.beginPath();
      dCtx.moveTo(kx, ky);
      dCtx.lineTo(kx + Math.cos(angle) * len, ky + Math.sin(angle) * len);
      dCtx.stroke();

      hCtx.strokeStyle = '#101010';
      hCtx.lineWidth = 2;
      hCtx.beginPath();
      hCtx.moveTo(kx, ky);
      hCtx.lineTo(kx + Math.cos(angle) * len, ky + Math.sin(angle) * len);
      hCtx.stroke();
    }

    var diffuse = new THREE.CanvasTexture(diffCanvas);
    diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;

    var normal = createNormalMapFromHeight(heightCanvas, THREE, 2.4);

    var roughness = new THREE.CanvasTexture(roughCanvas);
    roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

    return { diffuse: diffuse, normal: normal, roughness: roughness };
  }

  // 4. 3D 녹슨 철제 캐비닛
  function create3DHorrorMetal(THREE) {
    var size = 256;
    var diffCanvas = document.createElement('canvas');
    diffCanvas.width = diffCanvas.height = size;
    var dCtx = diffCanvas.getContext('2d');

    var heightCanvas = document.createElement('canvas');
    heightCanvas.width = heightCanvas.height = size;
    var hCtx = heightCanvas.getContext('2d');

    var roughCanvas = document.createElement('canvas');
    roughCanvas.width = roughCanvas.height = size;
    var rCtx = roughCanvas.getContext('2d');

    dCtx.fillStyle = '#2f352e';
    dCtx.fillRect(0, 0, size, size);
    hCtx.fillStyle = '#808080';
    hCtx.fillRect(0, 0, size, size);
    rCtx.fillStyle = '#707070';
    rCtx.fillRect(0, 0, size, size);

    dCtx.fillStyle = '#4a5448';
    dCtx.fillRect(0, 0, size, 6);
    dCtx.fillRect(0, 0, 6, size);
    hCtx.fillStyle = '#c0c0c0';
    hCtx.fillRect(0, 0, size, 6);
    hCtx.fillRect(0, 0, 6, size);

    dCtx.fillStyle = '#151b14';
    dCtx.fillRect(0, size - 6, size, 6);
    dCtx.fillRect(size - 6, 0, 6, size);
    hCtx.fillStyle = '#303030';
    hCtx.fillRect(0, size - 6, size, 6);
    hCtx.fillRect(size - 6, 0, 6, size);

    for (var r = 0; r < 14; r++) {
      var rx = (r * 73) % (size - 40) + 20;
      var ry = (r * 119) % (size - 40) + 20;
      var rw = 15 + (r * 9) % 40;
      var rh = 12 + (r * 11) % 30;

      var rustGrad = dCtx.createRadialGradient(rx, ry, 0, rx, ry, Math.max(rw, rh));
      rustGrad.addColorStop(0, 'rgba(96, 40, 20, 0.95)');
      rustGrad.addColorStop(0.5, 'rgba(64, 28, 14, 0.8)');
      rustGrad.addColorStop(0.85, 'rgba(40, 20, 12, 0.5)');
      rustGrad.addColorStop(1, 'rgba(47, 53, 46, 0)');

      dCtx.fillStyle = rustGrad;
      dCtx.beginPath();
      dCtx.ellipse(rx, ry, rw, rh, (r * 0.3), 0, Math.PI * 2);
      dCtx.fill();
    }

    var diffuse = new THREE.CanvasTexture(diffCanvas);
    var normal = createNormalMapFromHeight(heightCanvas, THREE, 2.6);
    var roughness = new THREE.CanvasTexture(roughCanvas);

    return { diffuse: diffuse, normal: normal, roughness: roughness };
  }

  // 5. 3D 세월의 굴곡 적용 (평면 탈피: 오래된 마룻바닥 중앙 침하 및 목재 휨)
  function applyAgeWarping(scene, THREE) {
    if (!scene || !THREE) return;

    scene.traverse(function(node) {
      if (!node.isMesh || !node.geometry) return;
      var geom = node.geometry;

      // 1) 바닥 평면 메쉬인 경우 (Y축 높이 0 근처)
      var isFloor = (Math.abs(node.rotation.x + Math.PI / 2) < 0.1 || Math.abs(node.rotation.x - Math.PI / 2) < 0.1) &&
                    node.position.y <= 0.15;

      if (isFloor && geom.isBufferGeometry) {
        // 평면이 4개 버텍스짜리면 세분화된 지오메트리로 교체하여 굴곡 생성
        var pos = geom.attributes.position;
        if (pos && pos.count <= 6) {
          var width = 10;
          var height = 10;
          if (geom.parameters) {
            width = geom.parameters.width || 10;
            height = geom.parameters.height || 10;
          }
          // 20x20 그리드로 세분화하여 삐걱거리는 굴곡 부여
          var subGeom = new THREE.PlaneGeometry(width, height, 20, 20);
          var subPos = subGeom.attributes.position;
          for (var i = 0; i < subPos.count; i++) {
            var vx = subPos.getX(i);
            var vy = subPos.getY(i);
            // 사람이 자주 밟은 중앙 통로(x=0 근처)가 아래로 약간 꺼지는 곡률
            var wear = -Math.exp(-(vx * vx) / 4.5) * 0.024;
            // 판자 휨 미세 노이즈
            var warp = Math.sin(vx * 7.5 + vy * 3.2) * 0.007 + Math.cos(vy * 9.0) * 0.004;
            subPos.setZ(i, wear + warp);
          }
          subGeom.computeVertexNormals();
          node.geometry.dispose();
          node.geometry = subGeom;
        }
      }

      // 2) 책상 상판이나 선반도 약간의 세월 휨 적용
      var name = (node.name || '').toLowerCase();
      if ((name.indexOf('desk') > -1 || name.indexOf('table') > -1) && geom.isBufferGeometry) {
        var p = geom.attributes.position;
        if (p && p.count > 20) {
          for (var j = 0; j < p.count; j++) {
            var px = p.getX(j);
            var py = p.getY(j);
            p.setY(j, py - Math.sin(px * 3.0) * 0.003);
          }
          geom.computeVertexNormals();
        }
      }
    });
  }

  // 6. 벽면에 선명한 3D 독립 포스터 오브젝트 부착 (사라졌던 작업 규정 및 식자 표찰 복원)
  function createWallPosters(scene, THREE) {
    if (!scene || !THREE) return;

    // 1) 【 作業 規程 】 (작업 규정 포스터)
    var p1Canvas = document.createElement('canvas');
    p1Canvas.width = 380;
    p1Canvas.height = 520;
    var ctx1 = p1Canvas.getContext('2d');

    // 낡은 한지 바탕
    ctx1.fillStyle = '#d2be92';
    ctx1.fillRect(0, 0, 380, 520);
    for (var i = 0; i < 800; i++) {
      ctx1.fillStyle = Math.random() > 0.5 ? 'rgba(70,45,20,0.06)' : 'rgba(230,220,190,0.08)';
      ctx1.fillRect(Math.random() * 380, Math.random() * 520, 2, 2);
    }
    ctx1.strokeStyle = '#5a3d1e';
    ctx1.lineWidth = 3;
    ctx1.strokeRect(10, 10, 360, 500);
    ctx1.lineWidth = 1;
    ctx1.strokeRect(16, 16, 348, 488);

    ctx1.fillStyle = '#1c130b';
    ctx1.font = 'bold 24px "Noto Serif KR", serif';
    ctx1.textAlign = 'center';
    ctx1.fillText('【 作業 規程 】', 190, 55);

    ctx1.fillStyle = '#2b1c0f';
    ctx1.font = '14px serif';
    ctx1.textAlign = 'left';
    var rules = [
      '一. 活版 植字는 자정 전에 마칠 것.',
      '二. 鉛 活字 큐브는 눈동자를 위로 둘 것.',
      '三. 24일 서랍은 정지된 시각에 열 것.',
      '四. 벤젠 세척액으로 굳은 잉크를 닦을 것.',
      '五. 야간 작업 시 괘종시계를 주시할 것.'
    ];
    for (var r = 0; r < rules.length; r++) {
      ctx1.fillText(rules[r], 30, 110 + r * 50);
      ctx1.fillRect(30, 125 + r * 50, 320, 1);
    }

    // 붉은 총독부 검인(檢) 도장
    ctx1.strokeStyle = '#aa251e';
    ctx1.lineWidth = 3.5;
    ctx1.strokeRect(260, 380, 75, 75);
    ctx1.fillStyle = '#aa251e';
    ctx1.font = 'bold 36px serif';
    ctx1.textAlign = 'center';
    ctx1.fillText('檢', 297, 432);

    var tex1 = new THREE.CanvasTexture(p1Canvas);
    var mat1 = new THREE.MeshStandardMaterial({
      map: tex1,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    var poster1 = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.15), mat1);
    poster1.position.set(-3.2, 2.15, -3.94); // 벽면 바로 앞 (Z-fighting 방지)
    poster1.name = 'poster-work-rule';
    scene.add(poster1);

    // 2) 【 10/24 植字 完了 】 (식자 완료 표찰)
    var p2Canvas = document.createElement('canvas');
    p2Canvas.width = 300;
    p2Canvas.height = 400;
    var ctx2 = p2Canvas.getContext('2d');

    ctx2.fillStyle = '#ded0a8';
    ctx2.fillRect(0, 0, 300, 400);
    ctx2.strokeStyle = '#4a1510';
    ctx2.lineWidth = 2.5;
    ctx2.strokeRect(8, 8, 284, 384);

    ctx2.fillStyle = '#6b1812';
    ctx2.font = 'bold 22px serif';
    ctx2.textAlign = 'center';
    ctx2.fillText('10/24 植字 完了', 150, 55);

    ctx2.fillStyle = '#22150c';
    ctx2.font = '13px serif';
    ctx2.textAlign = 'left';
    ctx2.fillText('담당: 제3조 식자공 외 2명', 25, 110);
    ctx2.fillText('판형: 경성일보 제1면 호외판', 25, 150);
    ctx2.fillText('비고: 야간 활자 소실 주의', 25, 190);

    // 핏빛 손자국 얼룩 (호러 분위기)
    ctx2.fillStyle = 'rgba(90, 15, 15, 0.4)';
    ctx2.beginPath();
    ctx2.arc(220, 290, 35, 0, Math.PI * 2);
    ctx2.fill();

    var tex2 = new THREE.CanvasTexture(p2Canvas);
    var mat2 = new THREE.MeshStandardMaterial({
      map: tex2,
      roughness: 0.88,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    var poster2 = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.88), mat2);
    poster2.position.set(3.2, 2.15, -3.94);
    poster2.name = 'poster-finish-tag';
    scene.add(poster2);
  }

  // 7. 씬 내의 메쉬들에 3D 입체 머티리얼 적용
  function apply3DRemaster(scene, THREE) {
    if (!scene || !THREE) return;

    var wood3D = create3DHorrorWood(THREE);
    var metal3D = create3DHorrorMetal(THREE);
    var lead3D = create3DLeadTypes(THREE);

    scene.traverse(function(node) {
      if (!node.isMesh || !node.material) return;
      var mats = Array.isArray(node.material) ? node.material : [node.material];
      var name = (node.name || '').toLowerCase();
      var parentName = (node.parent && node.parent.name || '').toLowerCase();

      mats.forEach(function(mat) {
        if (!mat) return;
        var supportsNormal = mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial || mat.isMeshPhongMaterial;

        // 1) 활자장 및 활자 큐브/조판대 (3D 리얼 납 활자 양각 셰이딩)
        var isLeadType = name.indexOf('type') > -1 || name.indexOf('rack') > -1 ||
                         name.indexOf('galley') > -1 || parentName.indexOf('rack') > -1 ||
                         (node.userData && (node.userData.clueId === 'clue_rack_types' || node.userData.type === 'lead_cube'));

        if (isLeadType && supportsNormal) {
          mat.map = lead3D.diffuse;
          mat.normalMap = lead3D.normal;
          if (!mat.normalScale) mat.normalScale = new THREE.Vector2(1, 1);
          mat.normalScale.set(3.0, 3.0);
          mat.roughnessMap = lead3D.roughness;
          if (mat.roughness !== undefined) mat.roughness = 0.42;
          if (mat.metalness !== undefined) mat.metalness = 0.85; // 진짜 납 합금 광택
          if (mat.color && mat.color.setHex) mat.color.setHex(0xd0d4da);
          mat.needsUpdate = true;
        }

        // 2) 캐비닛 본체 및 서랍 (3D 녹슨 철판 노멀맵 적용)
        var isCabinet = name.indexOf('cabinet') > -1 || parentName.indexOf('cabinet') > -1 ||
                        (node.userData && node.userData.type && node.userData.type.indexOf('cabinet') > -1);

        if (isCabinet && supportsNormal) {
          mat.map = metal3D.diffuse;
          mat.normalMap = metal3D.normal;
          if (!mat.normalScale) mat.normalScale = new THREE.Vector2(1, 1);
          mat.normalScale.set(2.5, 2.5);
          mat.roughnessMap = metal3D.roughness;
          if (mat.roughness !== undefined) mat.roughness = 0.75;
          if (mat.metalness !== undefined) mat.metalness = 0.55;
          if (mat.color && mat.color.setHex) mat.color.setHex(0xb0b0b0);
          mat.needsUpdate = true;
        }

        // 3) 책상, 테이블, 서랍장 (3D 원목 깊이감 및 나뭇결 노멀맵 적용)
        var isDeskOrTable = name.indexOf('desk') > -1 || name.indexOf('table') > -1 ||
                            name.indexOf('drawer') > -1 || parentName.indexOf('desk') > -1 ||
                            (node.userData && (node.userData.type === 'drawer_24' || node.userData.type === 'galley_slot'));

        if (isDeskOrTable && !isLeadType && supportsNormal) {
          mat.map = wood3D.diffuse;
          mat.normalMap = wood3D.normal;
          if (!mat.normalScale) mat.normalScale = new THREE.Vector2(1, 1);
          mat.normalScale.set(2.2, 2.2);
          mat.roughnessMap = wood3D.roughness;
          if (mat.roughness !== undefined) mat.roughness = 0.8;
          if (mat.metalness !== undefined) mat.metalness = 0.08;
          if (mat.color && mat.color.setHex) mat.color.setHex(0xa09080);
          mat.needsUpdate = true;
        }

        // 4) 벽면 콘크리트 및 천장 (3D 굴곡 심화)
        if (mat.name && mat.name.indexOf('aged-concrete') > -1) {
          if (mat.roughness !== undefined) mat.roughness = 0.92;
          if (mat.metalness !== undefined) mat.metalness = 0.04;
          if (mat.bumpMap && mat.bumpScale !== undefined) mat.bumpScale = 0.14; // 세월의 요철 깊이감 강화
          mat.needsUpdate = true;
        }

        // 5) 괘종시계 3D 앤틱 마호가니 재질
        if (name.indexOf('clock') > -1 || (node.userData && node.userData.type === 'clock')) {
          if (mat.roughness !== undefined) {
            mat.roughness = 0.65;
            if (mat.metalness !== undefined) mat.metalness = 0.15;
            mat.needsUpdate = true;
          }
        }
      });

      // 6) 총독부 검열 포스터 위치 보정 (벽면 파묻힘 방지)
      if (node.userData && node.userData.clueId === 'clue_censor') {
        node.position.z = -3.85; // 벽면(-4.0) 앞으로 더 띄워서 선명하게 표시
        if (node.material) {
          if (Array.isArray(node.material)) node.material.forEach(function(m) { if (m) m.side = THREE.DoubleSide; });
          else node.material.side = THREE.DoubleSide;
        }
      }
    });

    // 세월의 굴곡 및 포스터 오브젝트 부착
    applyAgeWarping(scene, THREE);
    createWallPosters(scene, THREE);
  }

  // 8. 초경량 공기 중 먼지 입자 (게임 종료 시 cancelAnimationFrame 지원)
  function spawnDustMotes(scene, THREE) {
    if (!scene || !THREE || !THREE.BufferGeometry || !THREE.Points) return null;

    var count = 120;
    var geom = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3);

    for (var i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 4.0 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22 - 4;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    var mat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xd2c4a8,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    var pSystem = new THREE.Points(geom, mat);
    scene.add(pSystem);

    var animId = null;
    var stopped = false;
    function rotateDust() {
      if (stopped) return;
      pSystem.rotation.y += 0.0004;
      pSystem.rotation.x += 0.0002;
      animId = requestAnimationFrame(rotateDust);
    }
    rotateDust();

    return function() {
      stopped = true;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };
  }

  // 9. 음산한 대기 안개 톤 조절
  function tuneHorrorAtmosphere(scene) {
    if (!scene || !scene.fog) return;
    scene.fog.color.setHex(0x0a1410);
    if (scene.fog.density) {
      scene.fog.density = 0.048;
    }
  }

  // 게임 로드 완료 시 game.sceneAPI를 통해 안전하게 연동 및 종료 시 클린업
  window.addEventListener('sikjasil-ready', function(e) {
    var game = (e.detail && e.detail.game) || e.detail;
    if (!game) return;

    // window.scene 직접 접근을 피하고 game.sceneAPI / game.scene 경유
    var THREE = window.THREE || game.sceneAPI;
    var scene = game.scene;
    if (!scene) return;

    var stopDust = null;

    setTimeout(function() {
      apply3DRemaster(scene, THREE);
      if (THREE) {
        stopDust = spawnDustMotes(scene, THREE);
      }
      tuneHorrorAtmosphere(scene);
    }, 350);

    function cleanupOnEnd() {
      if (typeof stopDust === 'function') {
        stopDust();
        stopDust = null;
      }
    }

    window.addEventListener('sikjasil-game-over', cleanupOnEnd);
    window.addEventListener('sikjasil-game-ended', cleanupOnEnd);
    window.addEventListener('sikjasil-escaped', cleanupOnEnd);

    // 성공/실패 화면 활성화 시 rotateDust 루프 중단
    var endObserver = new MutationObserver(function() {
      var rModal = document.getElementById('reward-card-modal');
      var tOverlay = document.getElementById('timeout-overlay');
      var dOverlay = document.getElementById('death-overlay');
      if ((rModal && rModal.classList.contains('active')) ||
          (tOverlay && !tOverlay.hidden) ||
          (dOverlay && !dOverlay.hidden) ||
          (game.gameEnded)) {
        cleanupOnEnd();
      }
    });
    endObserver.observe(document.body, { attributes: true, subtree: true, childList: true });
  });

})();
