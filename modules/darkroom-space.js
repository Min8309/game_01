/* Archive -> black curtain -> developing room -> curtain -> red photo room. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GyeongDarkroomSpace=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
const LAYOUT=Object.freeze({floor:-3.6,entryX:28,secondCurtainX:35,endX:42,minZ:-5.7,maxZ:.3,centerZ:-2.7});
class DarkroomSpace{
 constructor(game,T,archive){
  this.game=game;this.T=T;this.archive=archive;this.room=game.room;this.group=new T.Group();this.group.name='mobile-darkroom-spaces';game.scene.add(this.group);this.curtains=[];this.photos=[];this.pulseLights=[];this.zone='archive';this.developed=false;
  this.originalFlashlightColor=game.lighting.flashlight.color.clone();this.originalAmbientColor=archive.ambient.color.clone();
  this.mats={...archive.materials,curtain:new T.MeshStandardMaterial({color:0x121217,roughness:.95,side:2}),metal:new T.MeshStandardMaterial({color:0x555b54,roughness:.65,metalness:.6}),liquid:new T.MeshStandardMaterial({color:0x343b2f,roughness:.2,metalness:.15}),bottle:new T.MeshStandardMaterial({color:0x42351d,roughness:.3,metalness:.2})};
  this.cutArchiveExit();this.buildRooms();this.buildWorkstations();this.buildPhotographs();this.buildMissingPerson();this.installUpdate();
  Promise.all([...game.ghostEncounters.pending.values()]).then(()=>{const types=window.SikjasilGhosts.GHOSTS;this.photos.forEach((mesh,index)=>{const texture=game.ghostEncounters.textures.get(types[index%types.length].id);if(texture){mesh.material.map=texture;mesh.material.needsUpdate=true;}});});
 }
 box(w,h,d,x,y,z,mat,collide=false,parent=this.group){return this.archive.box(w,h,d,x,y,z,mat,collide,parent);}
 cylinder(r1,r2,h,x,y,z,mat,parent=this.group){const mesh=new this.T.Mesh(new this.T.CylinderGeometry(r1,r2,h,12),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 cutArchiveExit(){
  const wall=this.archive.group.children.find(o=>o.isMesh&&o.position.x===28&&o.geometry.parameters.width===.24&&o.geometry.parameters.height===5.35);if(!wall)throw Error('자료실 끝 벽을 찾지 못했습니다.');wall.visible=false;
  this.room.colliders=this.room.colliders.filter(b=>!(Math.abs(b.min.x-27.88)<.001&&Math.abs(b.max.x-28.12)<.001&&Math.abs(b.min.z+6.2)<.001&&Math.abs(b.max.z-.8)<.001));
  const f=-3.6;this.box(.24,5.35,2.5,28,f+2.675,-4.95,this.mats.stone,true);this.box(.24,5.35,2.5,28,f+2.675,-.45,this.mats.stone,true);this.box(.24,2.35,2,28,f+4.175,-2.7,this.mats.stone,true);
 }
 addLight(x,y,z,color,intensity,pulse=false){const light=new this.T.PointLight(color,intensity,8,2);light.position.set(x,y,z);this.group.add(light);const material=new this.T.MeshBasicMaterial({color});const bulb=this.cylinder(.08,.08,.12,x,y+.06,z,material);this.cylinder(.25,.07,.13,x,y+.15,z,this.mats.metal);if(pulse)this.pulseLights.push({light,material,intensity});return light;}
 buildRooms(){
  const f=-3.6;this.box(14,.16,6,35,f-.08,-2.7,this.mats.stone);this.box(14,3.2,.2,35,f+1.6,-5.7,this.mats.stone,true);this.box(14,3.2,.2,35,f+1.6,.3,this.mats.stone,true);this.box(14,.14,6,35,f+3.2,-2.7,this.mats.wood);this.box(.22,3.2,6,42,f+1.6,-2.7,this.mats.stone,true);
  for(const z of[-4.7,-.7])this.box(.16,3.2,2,35,f+1.6,z,this.mats.wood,true);this.box(.16,.35,2,35,f+3.025,-2.7,this.mats.wood,true);
  for(const x of[29,31,33,35,37,39,41])this.box(.13,.2,6,x,f+3.05,-2.7,this.mats.wood);
  this.createCurtain(28,0);this.createCurtain(35,1);
  this.ironHinge=new this.T.Group();this.ironHinge.position.set(28.12,f,-3.7);this.group.add(this.ironHinge);this.box(.1,2.8,1.96,0,1.4,.98,this.mats.metal,false,this.ironHinge);this.box(.16,.07,.28,-.09,1.1,1.7,this.mats.metal,false,this.ironHinge);this.ironHinge.userData={...this.curtains[0].group.userData};
  this.workLights=[this.addLight(30,f+2.7,-2.7,0x9e1515,12),this.addLight(33.2,f+2.7,-2.7,0xcc1818,10)];
  this.addLight(37.4,f+2.7,-2.7,0xff241f,22,true);this.addLight(40.1,f+2.7,-2.7,0xe41419,18,true);
 }
 createCurtain(x,index){
  const group=new this.T.Group();this.group.add(group);group.userData={isInteractable:true,clueId:'mobile_darkroom_curtain_'+index,type:'mobile_darkroom_curtain',curtainIndex:index,name:index===0?'資料室 끝의 검은 커튼':'붉은 사진 건조실의 검은 커튼',description:index===0?'두꺼운 검은 천 뒤에서 약품 냄새가 새어 나온다.':'커튼 틈으로 붉은 빛이 간헐적으로 새어 나온다. 천장에 매달린 종이가 바스락거린다.'};
  const panels=[];for(const side of[-1,1]){const geometry=new this.T.PlaneGeometry(1.02,2.85,20,18),a=geometry.attributes.position;for(let i=0;i<a.count;i++){const px=a.getX(i),py=a.getY(i);a.setZ(i,Math.sin(px*24)*.045);if(py<-1.3)a.setY(i,py+.015*Math.sin(px*35));}geometry.computeVertexNormals();const mesh=new this.T.Mesh(geometry,this.mats.curtain);mesh.rotation.y=-Math.PI/2;mesh.position.set(x-.07,-3.6+1.43,-2.7+side*.49);group.add(mesh);panels.push({mesh,side});}
  this.box(.09,.08,2.2,x,-3.6+2.94,-2.7,this.mats.metal,false,group);
  const plaque=this.archive.sign(index===0?'暗室':'寫眞 乾燥室',1,.24);plaque.rotation.y=-Math.PI/2;plaque.position.set(x-.17,-3.6+3.04,-2.7);group.add(plaque);
  this.room.addColliderBox(new this.T.Vector3(x,-3.6+1.4,-2.7),new this.T.Vector3(.22,2.8,2));this.curtains.push({index,group,panels,opened:false,progress:0,collider:this.room.colliders[this.room.colliders.length-1]});
 }
 bench(x,z,width=2.3){const f=-3.6;const top=this.box(width,.1,.82,x,f+.93,z,this.mats.wood,true);for(const dx of[-width/2+.12,width/2-.12])for(const dz of[-.3,.3])this.box(.08,.93,.08,x+dx,f+.465,z+dz,this.mats.metal,true);this.box(width,.07,.7,x,f+.25,z,this.mats.wood);return top;}
 tray(x,z){const f=-3.6;const group=new this.T.Group();group.position.set(x,f+1,z);this.group.add(group);this.box(.44,.025,.36,0,0,0,this.mats.metal,false,group);for(const dx of[-.23,.23])this.box(.025,.06,.4,dx,.025,0,this.mats.metal,false,group);for(const dz of[-.19,.19])this.box(.48,.06,.025,0,.025,dz,this.mats.metal,false,group);this.box(.4,.006,.32,0,.016,0,this.mats.liquid,false,group);this.box(.26,.003,.23,0,.021,0,this.mats.paper,false,group);return group;}
 enlarger(x,z){const f=-3.6;this.box(.62,.035,.65,x,f+.99,z,this.mats.metal);this.box(.055,1.15,.055,x,f+1.53,z-.23,this.mats.metal);this.cylinder(.18,.14,.44,x,f+2.06,z-.08,this.mats.metal);for(let i=0;i<7;i++)this.box(.28,.025,.25,x,f+1.76+i*.035,z,this.mats.curtain);this.cylinder(.1,.12,.13,x,f+1.64,z,this.mats.metal);this.box(.46,.02,.42,x,f+1.025,z+.05,this.mats.paper);}
 bottle(x,y,z,i){this.cylinder(.055,.065,.22+(i%3)*.025,x,y+.11,z,this.mats.bottle);this.cylinder(.025,.027,.07,x,y+.26,z,this.mats.metal);this.box(.06,.1,.005,x,y+.13,z+.058,this.mats.paper);}
 buildWorkstations(){
  const f=-3.6;
  for(const x of[29.7,32.3]){this.bench(x,-5.04);this.enlarger(x-.45,-5.04);this.tray(x+.46,-5.04);for(let i=0;i<4;i++)this.bottle(x-.7+i*.2,f+1,-5.34,i);}
  this.bench(32.3,-.36);const station=this.tray(32.3,-.36);station.userData={isInteractable:true,clueId:'mobile_darkroom_station',type:'mobile_darkroom_station',name:'암실 인화 작업대',description:'붉은 안전등, 세척액, 현상액, 정착액이 놓여 있다. 작업 순서를 잘못 맞추면 사진은 사라진다.'};this.archive.markPuzzle(32.3,f+1.065,-.36,.56,.46);const memo=this.archive.sign('현상사 메모 · 퍼즐',1,.25,true);memo.position.set(32.3,f+1.65,.18);memo.rotation.y=Math.PI;memo.userData=station.userData;this.group.add(memo);for(let i=0;i<7;i++)this.bottle(31.55+i*.22,f+1,-.12,i);
  for(const x of[29.3,31.4,33.5]){this.box(.8,.06,.38,x,f+2.05,-5.45,this.mats.wood);for(let i=0;i<3;i++)this.bottle(x-.24+i*.23,f+2.09,-5.44,i);}
  for(const x of[36.6,39.3]){this.bench(x,-5.03,2.5);for(let i=0;i<3;i++)this.tray(x-.7+i*.7,-5.03);for(let i=0;i<4;i++)this.bottle(x-.8+i*.2,f+1,-5.31,i);}
  this.bench(40.5,-.4,1.7);this.enlarger(40.5,-.4);
  for(const x of[29.4,32.1,37.1,40.2])this.box(.66,.6,.6,x,f+.31,-5.03,this.mats.wood,true);
  // Wall conduits and power boxes, all kept outside the central walking aisle.
  for(const x of[30.1,33.4,39.6]){this.box(.24,.4,.12,x,f+1.8,-5.49,this.mats.metal);this.cylinder(.012,.012,1.1,x,f+2.45,-5.48,this.mats.metal);}
 }
 photo(x,y,z,rotation,index){const group=new this.T.Group();group.position.set(x,y,z);group.rotation.y=rotation;group.rotation.z=(index%5-2)*.045;this.group.add(group);this.box(.48,.68,.025,0,0,0,this.mats.curtain,false,group);this.box(.44,.64,.01,0,0,.019,this.mats.paper,false,group);const material=new this.T.MeshStandardMaterial({color:0xbdb7a9,transparent:true,side:2,roughness:1});const face=new this.T.Mesh(new this.T.PlaneGeometry(.38,.54),material);face.position.z=.027;group.add(face);this.box(.035,.07,.045,0,.36,0,this.mats.wood,false,group);this.photos.push(face);}
 buildPhotographs(){
  const f=-3.6;for(let row=0;row<2;row++)for(let i=0;i<9;i++){this.photo(35.8+i*.67,f+1.25+row*.92,-5.56,0,i+row*9);this.photo(35.8+i*.67,f+1.25+row*.92,.16,Math.PI,i+row*9+2);}
  for(const [row,x]of[36.8,38.4,40].entries()){const line=this.cylinder(.006,.006,5.4,x,f+2.8,-2.7,this.mats.curtain);line.rotation.x=Math.PI/2;for(let i=0;i<7;i++){const z=-5.1+i*.8;const string=this.cylinder(.004,.004,.32,x,f+2.65,z,this.mats.curtain);this.photo(x,f+2.18+(i%3)*.04,z,-Math.PI/2,i+row*7);}}
  for(let i=0;i<6;i++)this.photo(41.85,f+1.55,-4.85+i*.83,-Math.PI/2,i);
 }
 missingPhotoTexture(index,empty=false){
  const canvas=document.createElement('canvas');canvas.width=440;canvas.height=640;const c=canvas.getContext('2d'),texture=new this.T.CanvasTexture(canvas);
  const background=()=>{c.fillStyle='#b4a68a';c.fillRect(0,0,440,640);c.strokeStyle='#39c85a';c.lineWidth=6;c.strokeRect(8,8,424,624);c.fillStyle='#203d2a';c.textAlign='center';c.font='bold 24px serif';c.fillText(empty?'역사 기록 복원 완료':'신문사 보관 사진 '+(index+1),220,95);c.font='20px serif';c.fillText('가까이에서 사진을 조사하세요',220,520);c.font='17px serif';c.fillText(window.GyeongMissingPerson.CREDIT,220,565);};background();
  const image=new Image();image.onload=()=>{background();const width=416,height=width*image.height/image.width,y=(640-height)/2;c.drawImage(image,12,y,width,height);if(empty){c.fillStyle='#203d2a';c.fillText('✓ 확인 완료',220,590);}texture.needsUpdate=true;};image.src=window.GyeongMissingPerson.PHOTO_URLS[index];return texture;
 }
 buildMissingPerson(){
  this.missingIntroShown=false;
  this.missingPerson=new window.GyeongMissingPerson.Puzzle();this.missingPhotos=[];
  for(const [index,x] of [36,38.3,40.6].entries()){
   const frame=new this.T.Group();frame.position.set(x,-2,-5.42);this.group.add(frame);
   const data={isInteractable:true,type:'drying_missing_photo',clueId:'drying_missing_photo_'+index,photoIndex:index,name:'초록 집게 사진 '+(index+1),description:'원본에는 없던 흔적 한 곳이 건조 사진에 남아 있다.'};frame.userData=data;
   this.box(.48,.68,.025,0,0,0,this.mats.curtain,false,frame);
   const photo=new this.T.Mesh(new this.T.PlaneGeometry(.44,.64),new this.T.MeshBasicMaterial({map:this.missingPhotoTexture(index)}));photo.position.z=.019;photo.userData=data;frame.add(photo);this.missingPhotos.push(photo);
   this.box(.035,.07,.045,0,.36,0,new this.T.MeshBasicMaterial({color:0x39c85a}),false,frame);
   const clip=this.archive.sign(['①','②','③'][index],.12,.08,true);clip.position.set(0,.39,.027);clip.userData=data;frame.add(clip);

  }
  const memo=this.archive.sign('사진사의 초록 메모',1.1,.3,true);memo.position.set(36,-1.4,-5.4);const paper=document.createElement('canvas');paper.width=512;paper.height=160;const ink=paper.getContext('2d');ink.fillStyle='#172b20';ink.fillRect(0,0,512,160);ink.strokeStyle='#39c85a';ink.lineWidth=4;ink.strokeRect(8,8,496,144);ink.fillStyle='#b9f1c8';ink.font='bold 30px serif';ink.textAlign='center';ink.fillText('사진사의 초록 메모',256,58);ink.fillText('역사 기록 · 초록 집게 사진 3장',256,110);memo.material.map.dispose();memo.material.map=new this.T.CanvasTexture(paper);memo.material.needsUpdate=true;memo.userData={isInteractable:true,type:'drying_missing_note',clueId:'drying_missing_note',name:'사진사의 초록 메모',description:'왼쪽 벽의 초록 집게 사진 세 장에서 역사 기록을 읽고 단서·힌트로 퀴즈를 해결하세요.'};this.group.add(memo);
 }
 removeMissingPerson(){if(this.missingRemoved)return;this.missingRemoved=true;for(const [index,photo] of this.missingPhotos.entries()){const old=photo.material.map;photo.material.map=this.missingPhotoTexture(index,true);photo.material.needsUpdate=true;old?.dispose();}}
 refreshNotice(){this.archive.notice.hidden=false;this.archive.notice.textContent=this.zone==='photos'?'사진 건조방 · 초록 집게 사진 3장의 역사 기록을 복원하세요':this.developed?'암실 완료 · 뒤쪽 검은 커튼을 조사하세요':'암실 · 인화 작업대에서 지워진 사진의 의미를 확인하세요';}

 triggerDoorTransition(onComplete){
  if(this.doorTransitioning)return;
  this.doorTransitioning=true;
  this.game.isDoorTransitioning=true;
  if(this.game.ghostEncounters)this.game.ghostEncounters.suppressUntil=performance.now()+5000;
  
  if(this.game.soundManager?.playMetalDoorOpen){
    this.game.soundManager.playMetalDoorOpen();
  }else if(this.game.soundManager?.playFloorboardCreak){
    this.game.soundManager.playFloorboardCreak();
  }

  let overlay=document.getElementById('sikjasil-door-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='sikjasil-door-overlay';
    overlay.style.cssText='position:fixed;inset:0;background:#000;z-index:9999;pointer-events:none;opacity:0;transition:opacity 0.6s ease-in-out;';
    document.body.appendChild(overlay);
  }
  requestAnimationFrame(()=>{overlay.style.opacity='1';});

  const sound=this.game.soundManager,audio=sound?.ctx;
  if(audio&&audio.state==='running'){
    const playBeat=(delay,freq,gainVal)=>{
      const t=audio.currentTime+delay;
      const o=audio.createOscillator(),g=audio.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(freq,t);
      o.frequency.exponentialRampToValueAtTime(25,t+0.16);
      g.gain.setValueAtTime(gainVal,t);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.2);
      o.connect(g);g.connect(sound.masterGain||audio.destination);
      o.start(t);o.stop(t+0.22);
    };
    playBeat(0.12,68,0.7);
    playBeat(0.28,52,0.5);
    playBeat(0.72,64,0.75);
    playBeat(0.88,48,0.55);
  }

  setTimeout(()=>{
    if(this.game.renderer?.compile&&this.game.scene&&this.game.camera){
      try{this.game.renderer.compile(this.game.scene,this.game.camera);}catch(e){}
    }
  },500);

  setTimeout(()=>{
    this.game.soundManager?.playFlashlightClick?.();
    overlay.style.transition='opacity 0.08s ease';
    overlay.style.opacity='0.25';
    setTimeout(()=>{
      overlay.style.opacity='0.85';
      setTimeout(()=>{
        this.game.soundManager?.playFlashlightClick?.();
        overlay.style.transition='opacity 0.45s ease-out';
        overlay.style.opacity='0';
        this.doorTransitioning=false;
        this.game.isDoorTransitioning=false;
        setTimeout(()=>{
          overlay.remove();
          onComplete?.();
        },500);
      },90);
    },90);
  },1100);
 }

 installUpdate(){const update=this.game.playerControls.update.bind(this.game.playerControls);this.game.playerControls.update=delta=>{
   update(delta);
   this.ironHinge.rotation.y=-this.curtains[0].progress*Math.PI/2;
   for(const curtain of this.curtains)if(curtain.opened&&curtain.progress<1){curtain.progress=Math.min(1,curtain.progress+delta);for(const {mesh,side}of curtain.panels){mesh.position.z=-2.7+side*(.49+curtain.progress*1.08);mesh.scale.x=1-curtain.progress*.6;}if(curtain.progress===1)this.room.colliders=this.room.colliders.filter(b=>b!==curtain.collider);}
   if(this.curtains[0]&&this.curtains[0].opened&&!this.curtains[0].transitionTriggered){
     this.curtains[0].transitionTriggered=true;
     this.triggerDoorTransition();
   }
   const x=this.game.camera.position.x,zone=x>=35?'photos':x>=28?'develop':'archive';if(zone!==this.zone){this.zone=zone;if(this.game.ghostEncounters)this.game.ghostEncounters.suppressUntil=performance.now()+3000;document.documentElement.classList.toggle('mobile-darkroom-zone',zone!=='archive');document.documentElement.classList.toggle('mobile-redroom-zone',zone==='photos');if(zone==='photos'){this.game.lighting.flashlight.color.setHex(0xf43c32);this.archive.ambient.color.setHex(0x5c1212);}else{this.game.lighting.flashlight.color.copy(this.originalFlashlightColor);this.archive.ambient.color.copy(this.originalAmbientColor);}if(zone==='archive')this.archive.updateNotice();else{document.querySelector('.location-title').textContent=zone==='photos'?'京城日報 寫眞乾燥室':'京城日報 暗室';this.refreshNotice();}}
   if(!document.documentElement.classList.contains('touch-game')&&this.zone==='photos'&&!this.missingIntroShown&&!this.game.interactionManager.isInspecting&&this.game.playerControls.controls.isLocked&&!this.game.gameEnded){this.missingIntroShown=true;this.game.interactionManager.triggerInspect({type:'drying_missing_note',clueId:'drying_room_intro',name:'사진 건조방 · 기록 복원 안내',description:'초록 집게 사진 세 장의 역사 기록을 복원하세요.'});}
   const time=performance.now()/1000;
   if(this.game.playTimer.startedAt!==null&&!this.game.gameEnded&&time>(this.nextAmbient||0)){this.nextAmbient=time+(zone==='archive'?5:1.6);const sound=this.game.soundManager,audio=sound.ctx;if(x>=14&&audio?.state==='running'){const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.type=zone==='archive'?'square':'sine';o.frequency.setValueAtTime(zone==='archive'?210:900,now);o.frequency.exponentialRampToValueAtTime(zone==='archive'?85:180,now+.07);g.gain.setValueAtTime(.022,now);g.gain.exponentialRampToValueAtTime(.001,now+.1);o.connect(g);g.connect(sound.masterGain);o.start();o.stop(now+.11);}}
this.pulseLights.forEach((item,i)=>{const pulse=Math.sin(time*5+i*.9)>-.2?1:.12;item.light.intensity=item.intensity*pulse;item.material.color.setRGB(.9*pulse,.04*pulse,.035*pulse);});
  };}
}
return{DarkroomSpace,LAYOUT};
});
