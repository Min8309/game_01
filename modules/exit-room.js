/* A quiet exit room: one table, one lamp, a key offering on a sheet of paper. */
(function(root){'use strict';root.GyeongExitRoom={create(game,archive){
 const T=game.sceneAPI,group=new T.Group();group.name='history-exit-room';game.scene.add(group);
 game.room.colliders=game.room.colliders.filter(b=>{const x=(b.min.x+b.max.x)/2,z=(b.min.z+b.max.z)/2;return !(Math.abs(Math.abs(x)-.88)<.01&&Math.abs(z+17.2)<.01||Math.abs(z+18.45)<.01);});
 const stone=new T.MeshStandardMaterial({map:archive.texture('stone'),color:0x60665d,roughness:1}),wood=archive.materials.wood,metal=new T.MeshStandardMaterial({color:0x2a3029,roughness:.8,metalness:.3});
 function box(w,h,d,x,y,z,mat,collide=false){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);if(collide)game.room.addColliderBox(new T.Vector3(x,y,z),new T.Vector3(w,h,d));return mesh;}
 box(4.1,.12,6.5,0,-.06,-19.2,stone);box(4.1,.12,6.5,0,3.15,-19.2,stone);
 for(const x of[-2,2])box(.14,3.1,6.5,x,1.55,-19.2,stone,true);box(4.1,3.1,.14,0,1.55,-22.4,stone,true);
 for(const x of[-1.45,1.45])box(1.14,3.1,.14,x,1.55,-16,stone,true);
 box(1.7,.075,.9,0,.88,-20.2,wood);for(const x of[-.72,.72])for(const z of[-20.55,-19.85])box(.075,.85,.075,x,.425,z,wood);
 box(1.5,.12,.05,0,.7,-20.55,wood);game.room.addColliderBox(new T.Vector3(0,.45,-20.2),new T.Vector3(1.72,.9,.92));
 const cord=new T.Mesh(new T.CylinderGeometry(.007,.007,.43,8),metal);cord.position.set(0,2.91,-20.2);group.add(cord);
 const shade=new T.Mesh(new T.CylinderGeometry(.12,.31,.2,24),metal);shade.position.set(0,2.6,-20.2);group.add(shade);
 box(.11,.028,.11,0,2.49,-20.2,new T.MeshStandardMaterial({color:0xd9e4d7,emissive:0xbad0b6,emissiveIntensity:1}));
 const light=new T.PointLight(0xd2decf,16,6,2);light.position.set(0,2.47,-20.2);light.castShadow=true;group.add(light);
 const mapPuzzle=new window.GyeongExitCaseMap.Puzzle(),canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
 const c=canvas.getContext('2d'),mapTexture=new T.CanvasTexture(canvas);mapTexture.colorSpace='srgb';let boardImage=null;
 function paint(){c.fillStyle='#30291d';c.fillRect(0,0,1536,1024);if(boardImage)c.drawImage(boardImage,0,0,1536,1024);c.fillStyle='#17130de0';c.fillRect(335,18,870,92);c.fillStyle='#ead7ac';c.textAlign='center';c.font='bold 30px serif';c.fillText('1934 京城 · 붉은 실의 사건 기록',768,58);c.font='19px serif';c.fillText(mapPuzzle.solved?'봉인 해제 · 지하 자료실 개방':mapPuzzle.keyInserted?'열쇠 장착 · 네 현장을 시간순으로 연결하시오':'소지한 열쇠를 지도 아래 잠금장치에 삽입하시오',768,90);
  if(mapPuzzle.solved){c.strokeStyle='#f04b38';c.lineWidth=7;c.beginPath();window.GyeongExitCaseMap.ROUTE.forEach((id,i)=>{const n=window.GyeongExitCaseMap.NODES.find(n=>n.id===id);if(i)c.lineTo(n.x/100*1536,n.y/100*1024);else c.moveTo(n.x/100*1536,n.y/100*1024);});c.stroke();}
  c.fillStyle='#17130de0';c.fillRect(340,970,856,38);c.fillStyle='#c1af8d';c.font='17px serif';c.fillText('창작 사건 · AI 생성 사진 · 실제 피해자 기록이 아님',768,995);mapTexture.needsUpdate=true;
 }
 paint();const illustration=new Image();illustration.onload=()=>{boardImage=illustration;paint();};illustration.src=window.GyeongExitCaseMap.IMAGE;
 const data={isInteractable:true,type:'history_exit_map',clueId:'history_exit_map',name:'붉은 실의 사건 지도',description:'실종자와 피살 사건 기록이 경성 지도 위에서 연결되어 있다.'};
 const boards=[];function board(w,h,x,y,z,ry,primary){const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:mapTexture,color:primary?0xffffff:0xb6a28a,toneMapped:false}));mesh.position.set(x,y,z);mesh.rotation.y=ry;mesh.userData=data;mesh.name=primary?'exit-case-map-main':'exit-case-map-side';group.add(mesh);boards.push(mesh);game.furniture.interactables.push(mesh);return mesh;}
 const note=board(3.78,2.7,0,1.62,-22.29,0,true);board(5.95,2.7,-1.915,1.62,-19.2,Math.PI/2,false);board(5.95,2.7,1.915,1.62,-19.2,-Math.PI/2,false);
 const socketCanvas=document.createElement('canvas');socketCanvas.width=256;socketCanvas.height=160;const ink=socketCanvas.getContext('2d');ink.fillStyle='#785428';ink.fillRect(0,0,256,160);ink.strokeStyle='#c09b55';ink.lineWidth=8;ink.strokeRect(8,8,240,144);ink.fillStyle='#100d08';ink.beginPath();ink.arc(128,58,21,0,Math.PI*2);ink.fill();ink.beginPath();ink.moveTo(116,71);ink.lineTo(140,71);ink.lineTo(148,126);ink.lineTo(108,126);ink.closePath();ink.fill();const socketTexture=new T.CanvasTexture(socketCanvas);socketTexture.colorSpace='srgb';
 const socket=new T.Mesh(new T.PlaneGeometry(.25,.16),new T.MeshBasicMaterial({map:socketTexture,color:0xffffff,toneMapped:false}));socket.position.set(0,.56,-22.265);socket.userData=data;group.add(socket);game.furniture.interactables.push(socket);
 const horror=window.GyeongExitHorror.create(game,group);
 for(const shadow of horror.shadows)if(shadow.wall!=='ceiling')shadow.hand.visible=false;
 const room={group,note,boards,horror,mapPuzzle,socket,found:false,keyPlaced:false,placedKey:null,updateBoard:paint,
  isInside(){const p=game.camera.position;return Math.abs(p.x)<1.9&&p.z< -16.2&&p.z> -22.3;},
  insertKey(source){if(this.keyPlaced||!source||!mapPuzzle.insertKey())return false;this.keyPlaced=true;const key=source.clone(true);key.position.set(0,.57,-22.20);key.rotation.set(Math.PI/2,0,Math.PI/2);key.traverse(o=>{o.visible=!o.userData.isPuzzleMarker;o.userData={};});key.userData=data;group.add(key);this.placedKey=key;socket.material.color.setHex(0xb58b45);paint();return true;},
  placeKey(source){return this.insertKey(source);}
 };return room;
}};})(window);
