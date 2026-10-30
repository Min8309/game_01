/* Shared PC/mobile 3D archive, injected with the host game's Three.js constructors. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GyeongArchiveSpace=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
const ROUTE=Object.freeze({doorX:5,doorZ:-2.7,halfDoor:.9,steps:20,stepDepth:.32,stepRise:.18,stairStart:5.8,stairEnd:12.2,floor:-3.6,archiveStart:14,archiveEnd:28,minZ:-6.2,maxZ:.8});
function groundHeight(x){if(x<=ROUTE.stairStart)return 0;if(x>=ROUTE.stairEnd)return ROUTE.floor;return -Math.min(ROUTE.steps,Math.floor((x-ROUTE.stairStart)/ROUTE.stepDepth)+1)*ROUTE.stepRise;}
class ArchiveSpace{
 constructor(game,THREE){
  this.game=game;this.T=THREE;this.scene=game.scene;this.room=game.room;this.player=game.playerControls;this.open=false;this.unlocked=false;this.progress=0;this.zone='main';this.solved=false;this.originalLocationTitle=document.querySelector('.location-title').textContent;
  this.group=new THREE.Group();this.group.name='mobile-underground-archive';this.scene.add(this.group);
  this.ambient=new THREE.AmbientLight(0x819386,.25);this.ambient.visible=false;this.group.add(this.ambient);
  this.materials=this.makeMaterials();this.cutDoorway();this.buildEntrance();this.buildStairs();this.buildArchive();this.buildEditingProps();this.installMovement();
  this.originalFog={color:this.scene.fog.color.clone(),density:this.scene.fog.density};
  this.notice=document.createElement('div');this.notice.id='archive-route-notice';this.notice.setAttribute('role','status');document.body.appendChild(this.notice);this.notice.hidden=true;
 }
 texture(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle=kind==='wood'?'#30291d':kind==='paper'?'#aaa088':'#414840';c.fillRect(0,0,256,256);
  let seed=1934;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  for(let i=0;i<4000;i++){let shade=Math.floor(25+rand()*100);c.fillStyle=`rgba(${shade},${shade+4},${shade},${rand()*.3})`;c.fillRect(rand()*256,rand()*256,1+rand()*5,1+rand()*7);}
  if(kind==='wood'){for(let i=0;i<70;i++){c.strokeStyle='#100e0970';c.beginPath();c.moveTo(rand()*256,0);c.lineTo(rand()*256,256);c.stroke();}}
  else if(kind==='paper'){c.fillStyle='#3a342680';for(let y=24;y<230;y+=12)c.fillRect(18,y,140+rand()*80,2);}
  else{for(let row=0;row<8;row++){c.strokeStyle='#111a1677';c.strokeRect(-20+(row%2)*32,row*32,300,32);for(let col=0;col<5;col++)c.strokeRect(col*64+(row%2)*32,row*32,64,32);}for(let i=0;i<25;i++){c.fillStyle='#101e1766';c.fillRect(rand()*256,rand()*256,3+rand()*20,20+rand()*140);}}
  const texture=new this.T.CanvasTexture(canvas);texture.colorSpace='srgb';return texture;
 }
 makeMaterials(){const M=this.T.MeshStandardMaterial;return{stone:new M({map:this.texture('stone'),roughness:1,side:2}),wood:new M({map:this.texture('wood'),roughness:.95}),paper:new M({map:this.texture('paper'),roughness:1}),iron:new M({color:0x34382f,roughness:.8,metalness:.45}),dark:new M({color:0x121712,roughness:1})};}
 box(w,h,d,x,y,z,mat,collide=false,parent=this.group){const mesh=new this.T.Mesh(new this.T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.receiveShadow=true;parent.add(mesh);if(collide)this.room.addColliderBox(new this.T.Vector3(x,y,z),new this.T.Vector3(w,h,d));return mesh;}
 cutDoorway(){
  const wall=this.scene.children.find(o=>o.isMesh&&Math.abs(o.position.x-5)<.001&&Math.abs(o.position.z-1)<.001&&o.geometry.parameters.width===10&&o.geometry.parameters.height===4.3);
  if(!wall)throw new Error('메인 오른쪽 벽을 찾지 못했습니다.');wall.visible=false;
  this.room.colliders=this.room.colliders.filter(b=>!(Math.abs(b.min.x-5)<.001&&Math.abs(b.max.x-5.4)<.001&&Math.abs(b.min.z+4)<.001&&Math.abs(b.max.z-6)<.001));
  for(const [min,max]of[[-4,-3.6],[-1.8,6]]){const width=max-min;const m=new this.T.Mesh(new this.T.PlaneGeometry(width,4.3),wall.material);m.rotation.y=-Math.PI/2;m.position.set(5,2.15,(min+max)/2);m.receiveShadow=true;this.group.add(m);this.room.addColliderBox(new this.T.Vector3(5.2,2.15,(min+max)/2),new this.T.Vector3(.4,4.3,width));}
  this.box(.4,1.6,1.8,5.2,3.5,-2.7,wall.material,true);
  const trim=this.scene.children.find(o=>o.isMesh&&o.position.x===4.95&&o.geometry.parameters.width===.08&&o.geometry.parameters.depth===10);if(trim)trim.visible=false;
 }
 sign(text,w=.9,h=.24,accent=false){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#211b11';c.fillRect(0,0,512,128);c.strokeStyle=accent?'#39c85a':'#897757';c.strokeRect(8,8,496,112);c.fillStyle=accent?'#9aefb2':'#d1bd95';c.font='bold 56px serif';c.textAlign='center';c.fillText(text,256,87);const mesh=new this.T.Mesh(new this.T.PlaneGeometry(w,h),new this.T.MeshBasicMaterial({map:new this.T.CanvasTexture(canvas),side:2}));mesh.isHintAccent=accent;return mesh;}
 buildEntrance(){
  const frame=new this.T.Group();frame.name='archive-entrance';this.group.add(frame);
  const data={isInteractable:true,clueId:'mobile_archive_door',type:'mobile_archive_door',name:'지하 자료실 입구',description:'오른쪽 벽의 낡은 자료실 문. 아래로 이어지는 계단에서 젖은 종이 냄새가 올라온다.'};frame.userData=data;
  this.box(.22,2.8,.15,4.94,1.4,-3.62,this.materials.wood,false,frame);this.box(.22,2.8,.15,4.94,1.4,-1.78,this.materials.wood,false,frame);this.box(.22,.15,2,4.94,2.75,-2.7,this.materials.wood,false,frame);
  this.hinge=new this.T.Group();this.hinge.position.set(5,0,-3.57);frame.add(this.hinge);
  this.box(.09,2.6,1.74,0,1.3,.87,this.materials.wood,false,this.hinge);this.box(.06,.12,.2,-.07,1.1,1.5,this.materials.iron,false,this.hinge);
  const sign=this.sign('地下 資料室',1.25,.32);sign.rotation.y=-Math.PI/2;sign.position.set(4.88,3.12,-2.7);frame.add(sign);
  this.room.addColliderBox(new this.T.Vector3(5.1,1.3,-2.7),new this.T.Vector3(.3,2.6,1.8));this.doorCollider=this.room.colliders[this.room.colliders.length-1];
 }
 light(x,y,z,intensity=1.8){const light=new this.T.PointLight(0xcab892,intensity,7,2);light.position.set(x,y,z);this.group.add(light);const lamp=this.box(.1,.12,.1,x,y+.04,z,new this.T.MeshBasicMaterial({color:0xc5b282}));return lamp;}
 buildStairs(){
  const {stone,iron,dark}=this.materials;
  this.box(.9,.12,2.2,5.35,-.06,-2.7,stone);
  for(let i=0;i<20;i++){const x=5.8+(i+.5)*.32,y=-(i+1)*.18;this.box(.32,.2,2.2,x,y-.1,-2.7,stone);this.box(.035,.045,2.15,x-.14,y+.025,-2.7,iron);}
  this.box(1.9,.16,2.2,13.15,-3.68,-2.7,stone);
  this.box(9.1,8,.18,9.55,.3,-3.9,stone,true);this.box(9.1,8,.18,9.55,.3,-1.5,stone,true);
  const roof=this.box(Math.hypot(6.4,3.6),.15,2.35,9,.95,-2.7,dark);roof.rotation.z=-Math.atan2(3.6,6.4);
  for(const z of[-3.72,-1.68]){const rail=this.box(Math.hypot(6.4,3.6),.04,.045,9,-.85,z,iron);rail.rotation.z=-Math.atan2(3.6,6.4);}
  this.light(5.55,2.45,-2.7,5);this.light(9.4,.3,-2.7,7);this.light(13.1,-1.05,-2.7,6);
 }
 buildArchive(){
  const f=-3.6,{stone,wood,paper,iron,dark}=this.materials;
  this.box(14,.18,7,21,f-.09,-2.7,stone);
  this.box(.22,3.4,2.6,14,f+1.7,-4.9,stone,true);this.box(.22,3.4,2.6,14,f+1.7,-.5,stone,true);this.box(.22,1.1,2.2,14,f+2.85,-2.7,stone,true);
  this.box(.26,2.2,7.2,14,f+4.4,-2.7,stone,true); // 돔 천장 위 뚫린 틈새를 완전히 밀폐
  this.box(14,3.6,.22,21,f+1.8,-6.2,stone,true);this.box(14,3.6,.22,21,f+1.8,.8,stone,true);this.box(.24,5.35,7,28,f+2.675,-2.7,stone,true);
  const vault=new this.T.Mesh(new this.T.CylinderGeometry(3.5,3.5,14,24,1,true,0,Math.PI),stone);vault.rotation.z=Math.PI/2;vault.position.set(21,f+1.8,-2.7);this.group.add(vault);
  for(const x of[14.2,17.6,21,24.4,27.7]){const rib=new this.T.Mesh(new this.T.CylinderGeometry(3.43,3.43,.14,24,1,true,0,Math.PI),iron);rib.rotation.z=Math.PI/2;rib.position.set(x,f+1.8,-2.7);this.group.add(rib);}
  // One instanced draw for the many book/document piles.
  const books=new this.T.InstancedMesh(new this.T.BoxGeometry(1,1,1),paper,240);const transform=new this.T.Object3D();let bookIndex=0;
  for(const z of[-5.68,.28])for(let bay=0;bay<5;bay++){const x=15.35+bay*2.5;this.box(1.9,2.4,.12,x,f+1.2,z,wood);for(const side of[-.94,.94])this.box(.08,2.4,.8,x+side,f+1.2,z,iron,true);for(let shelf=0;shelf<4;shelf++){const y=f+.25+shelf*.56;this.box(1.95,.07,.85,x,y,z,wood,true);for(let b=0;b<6;b++){transform.position.set(x-.76+b*.29,y+.08+(b%2)*.04,z);transform.scale.set(.23,.11+(b%3)*.035,.45+(b%2)*.15);transform.rotation.set(0,(b%3-1)*.12,0);transform.updateMatrix();books.setMatrixAt(bookIndex++,transform.matrix);}}}
  this.group.add(books);
  for(let i=0;i<18;i++){const x=15.3+(i%6)*2.15,z=i<9?-4.95:-.55;const box=this.box(.65,.35,.5,x,f+.18+(i%3)*.32,z,wood,true);box.rotation.y=(i%3-1)*.2;}
  for(let i=0;i<22;i++){const page=new this.T.Mesh(new this.T.PlaneGeometry(.3+(i%3)*.06,.42),paper);page.rotation.set(-Math.PI/2,0,i*.9);page.position.set(14.5+(i%9)*1.35,f+.012,-4.3+(i%4)*1.05);this.group.add(page);}
  const table=this.box(2.1,.14,1.1,22,f+.92,-2.7,wood,true);for(const dx of[-.9,.9])for(const dz of[-.42,.42])this.box(.09,.92,.09,22+dx,f+.46,-2.7+dz,iron,true);
  const dossier=this.box(.62,.06,.48,22,f+1.03,-2.7,paper);dossier.userData={isInteractable:true,clueId:'mobile_archive_records',type:'mobile_archive_records',name:'지하 편집실 검열문 대조 작업대',description:'붉은 압수 도장이 찍힌 검열 기사 대장과 회전식 날짜 스탬프. 서랍 틈의 천공 먹지를 맞춰야 한다.'};
  this.editingData=dossier.userData;this.markPuzzle(22,f+1.065,-2.7,.7,.55);const label=this.sign('檢閱 · 퍼즐',.6,.16,true);label.rotation.x=-Math.PI/2;label.position.set(22,f+1.067,-2.7);label.userData=dossier.userData;this.group.add(label);
  for(const [x,z,text] of [[20,-5.15,'발행일 11월 24일'],[22.6,-2.7,'날짜 스탬프 1124']]){
   const note=this.sign(text,1.4,.35,true);note.position.set(x,f+1.65,z);
   note.userData={isInteractable:true,type:'mobile_archive_hint',clueId:'archive_date_note_'+x,name:'편집자의 초록 날짜 메모',description:'검열 기사 발행일은 11월 24일. 날짜 스탬프에는 월 두 자리 11과 일 두 자리 24를 이어 1124를 넣으세요. 중앙 책상에서 먹지를 얻고 한 번에 맞춘 뒤 스탬프를 찍으면 암실 열쇠가 나옵니다.'};this.group.add(note);
  }
  const exit=this.sign('植字室 ←',1.1,.28);exit.rotation.y=Math.PI/2;exit.position.set(14.13,f+2.95,-2.7);this.group.add(exit);
  this.light(16.5,f+3.15,-2.7,16);this.light(21.2,f+3.4,-2.7,22);this.light(25.8,f+3.15,-2.7,14);
  this.rubble=new this.T.InstancedMesh(new this.T.BoxGeometry(1,1,1),dark,42);for(let i=0;i<42;i++){transform.position.set(14.8+(i%12)*1.04,f+.03,i%2?-.9:-4.5);transform.scale.set(.04+(i%4)*.035,.035,.07+(i%3)*.025);transform.rotation.set(i,.5*i,i*.7);transform.updateMatrix();this.rubble.setMatrixAt(i,transform.matrix);}this.group.add(this.rubble);
 }
 markPuzzle(x,y,z,width,depth){
  const accent=new this.T.MeshBasicMaterial({color:0x39c85a});const edges=[this.box(width,.014,.02,x,y,z-depth/2,accent),this.box(width,.014,.02,x,y,z+depth/2,accent),this.box(.02,.014,depth,x-width/2,y,z,accent),this.box(.02,.014,depth,x+width/2,y,z,accent)];for(const edge of edges){edge.raycast=()=>{};edge.userData.isPuzzleMarker=true;}
 }
 buildEditingProps(){
  const f=ROUTE.floor,metal=new this.T.MeshStandardMaterial({color:0x3a3e38,metalness:.65,roughness:.75});this.box(.6,.12,.5,22.65,f+1.04,-2.85,metal);this.box(.55,.2,.2,22.65,f+1.16,-3,metal);
  for(let row=0;row<3;row++)for(let col=0;col<8;col++)this.box(.038,.025,.038,22.43+col*.062,f+1.115,-2.7-row*.055,metal);
  const roller=new this.T.Mesh(new this.T.CylinderGeometry(.06,.06,.52,12),metal);roller.rotation.z=Math.PI/2;roller.position.set(22.65,f+1.27,-3.03);this.group.add(roller);this.typewriterRoller=roller;
  const sheet=this.sign('보지 말아야 할 것을 보았구나',.55,.3);sheet.position.set(22.65,f+1.38,-3.04);sheet.visible=false;this.group.add(sheet);this.typewriterSheet=sheet;
  const caseBox=this.box(.58,.3,.48,21.25,f+1.15,-2.9,metal);caseBox.userData=this.editingData;this.markPuzzle(21.25,f+1.31,-2.9,.61,.51);const seal=this.sign('押收 · 檢閱',.34,.14,true);seal.userData=this.editingData;seal.position.set(21.25,f+1.33,-2.9);seal.rotation.x=-Math.PI/2;this.group.add(seal);
  this.box(1.4,.08,.07,22,f+.55,-3.3,this.materials.wood);const paper=this.box(.25,.014,.17,21.8,f+.58,-3.27,this.materials.paper);this.markPuzzle(21.8,f+.59,-3.27,.29,.21);paper.userData={isInteractable:true,type:'mobile_archive_records',clueId:'mobile_editing_carbon',name:'서랍 틈의 천공 먹지',description:'구겨진 먹지를 검열 기사 대장에 맞춰야 한다.'};
  for(let i=0;i<8;i++){const page=this.sign('京城日報 · 押收 · 檢閱',.55,.38);page.rotation.x=-Math.PI/2;page.rotation.z=i*.5;page.position.set(18.4+i*.9,f+.014,-4+(i%2)*3);this.group.add(page);}
 }
 installMovement(){
  const update=this.player.update.bind(this.player),T=this.T,originalStand=this.player.standHeight,originalCrouch=this.player.crouchHeight;
  this.player.checkCollision=position=>{const floor=groundHeight(position.x),r=this.player.playerRadius;const bounds=new T.Box3(new T.Vector3(position.x-r,floor+.1,position.z-r),new T.Vector3(position.x+r,floor+(this.player.isCrouching?originalCrouch:originalStand)-.05,position.z+r));return this.room.colliders.some(box=>bounds.intersectsBox(box));};
  this.player.update=delta=>{
   this.updateDoor(delta);if(this.effectUntil>performance.now())this.typewriterRoller.rotation.x+=delta*35;
   const floor=groundHeight(this.game.camera.position.x);this.player.standHeight=originalStand+floor;this.player.crouchHeight=originalCrouch+floor;
   update(delta);
   const x=this.game.camera.position.x,zone=x>=14?'archive':x>5.4?'stairs':'main';
   if(zone!==this.zone){this.zone=zone;this.ambient.visible=zone!=='main';document.documentElement.classList.toggle('mobile-archive-zone',zone!=='main');this.scene.fog.density=zone==='archive'?.05:this.originalFog.density;this.updateNotice();}
   if(this.game.gameEnded||this.game.ending)this.notice.hidden=true;
  };
 }
 updateDoor(delta){if(!this.open||this.progress>=1)return;this.progress=Math.min(1,this.progress+delta/1.1);this.hinge.rotation.y=-this.progress*Math.PI/2;if(this.progress===1)this.room.colliders=this.room.colliders.filter(b=>b!==this.doorCollider);}
 updateNotice(){this.notice.hidden=this.zone==='main';document.querySelector('.location-title').textContent=this.zone==='archive'?'京城日報 地下資料室':this.zone==='stairs'?'京城日報 地下階段':this.originalLocationTitle;this.notice.textContent=this.zone==='stairs'?'地下階段 · 아래로 이어지는 자료실':this.solved?'자료실 완료 · 끝의 暗室 표지·검은 커튼 조사 → 철문 열기':'자료실 · 중앙 책상과 선반의 역사 기록을 확인하세요';}
 playPuzzleEffect(kind){
  if(kind==='editing')this.typewriterSheet.visible=true;const element=document.createElement('div');element.className='gp-room-effect';element.setAttribute('role','status');const caption=document.createElement('p');caption.textContent=kind==='editing'?'타자기 롤러가 헛돈다…\n보지 말아야 할 것을 보았구나':'사진 속 얼굴이 움직인다 — 붉은 안전등이 깨졌다';element.appendChild(caption);
  if(kind==='develop'&&!this.game.interactionManager.isInspecting&&this.game.playerControls.controls.isLocked){const image=document.createElement('img');image.src='./assets/ghosts/shroud.png';image.alt='인화지 뒤편의 일그러진 그림자';element.appendChild(image);}
  document.body.appendChild(element);const audio=this.game.soundManager.ctx||this.game.soundManager.audioContext;
  if(audio&&audio.state==='running'){const count=kind==='editing'?14:1;for(let i=0;i<count;i++){const oscillator=audio.createOscillator(),gain=audio.createGain(),time=audio.currentTime+i*.065;oscillator.type=kind==='editing'?'square':'sawtooth';oscillator.frequency.setValueAtTime(kind==='editing'?170+(i%4)*80:1800,time);oscillator.frequency.exponentialRampToValueAtTime(45,time+.12);gain.gain.setValueAtTime(.07,time);gain.gain.exponentialRampToValueAtTime(.001,time+.15);oscillator.connect(gain);gain.connect(this.game.soundManager.masterGain||audio.destination);oscillator.start(time);oscillator.stop(time+.16);}}
  const lights=[];this.scene.traverse(object=>{if(object.isLight){lights.push([object,object.visible]);object.visible=false;}});this.effectUntil=performance.now()+4500;setTimeout(()=>{for(const [light,visible]of lights)light.visible=visible;element.remove();},4600);
 }

}
return{ArchiveSpace,ROUTE,groundHeight};
});
