/* Wall-bound shadows and quiet creature ambience confined to the iron-door room. */
(function(){'use strict';
class RoomAmbience{
 constructor(manager){this.manager=manager;this.voice=null;this.buffer=null;this.inside=false;document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();});this.bytes=fetch('./audio/creatures/creature_02_insectoid_xenomorph.mp3').then(r=>r.ok?r.arrayBuffer():null).catch(()=>null);}
 prepare(){const ctx=this.manager.ctx;if(!ctx)return;if(this.context===ctx)return this.prepared;this.context=ctx;this.prepared=this.bytes.then(bytes=>bytes?ctx.decodeAudioData(bytes.slice(0)):null).then(buffer=>{this.buffer=buffer;}).catch(()=>{});return this.prepared;}
 stop(){const voice=this.voice;if(!voice)return;this.voice=null;const now=this.context.currentTime;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setValueAtTime(voice.gain.gain.value,now);voice.gain.gain.linearRampToValueAtTime(0,now+.04);try{voice.source.stop(now+.04);}catch{}}
 update(inside,pan){this.inside=inside;this.prepare();const ctx=this.context;if(!inside||this.manager.isMuted||ctx?.state!=='running'){this.stop();return;}if(!this.buffer)return;
  if(!this.voice){const source=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),panner=ctx.createStereoPanner();source.buffer=this.buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=2200;source.connect(filter);filter.connect(gain);gain.connect(panner);panner.connect(this.manager.masterGain);gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.055,ctx.currentTime+.8);const voice={source,gain,filter,panner};this.voice=voice;source.onended=()=>{source.disconnect();gain.disconnect();filter.disconnect();panner.disconnect();};source.start();}
  this.voice.panner.pan.setTargetAtTime(pan,ctx.currentTime,.15);
 }
}
window.GyeongExitHorror={create(game,parent){
 const T=game.sceneAPI,group=new T.Group();group.name='exit-room-moving-hands';parent.add(group);const wallLight=new T.PointLight(0x8d9b92,5,5,2);wallLight.position.set(0,1.8,-21.15);group.add(wallLight);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const texture=new T.CanvasTexture(canvas);const image=new Image();image.onload=()=>{texture.image=image;texture.needsUpdate=true;controller.textureReady=true;};image.src='./assets/history/hand-shadow.webp';
 const shadows=[];
 function shadow(wall,x,y,z,rx,ry,index){const anchor=new T.Group();anchor.position.set(x,y,z);anchor.rotation.set(rx,ry,0);group.add(anchor);const material=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:.82,color:0x090b09,depthWrite:false,side:2});const hand=new T.Mesh(new T.PlaneGeometry(.65,1.12),material);hand.raycast=()=>{};anchor.add(hand);shadows.push({wall,anchor,hand,phase:index*2.17,index});}
 let index=0;
 for(const y of [.9,2.15])for(const x of [-1.28,0,1.28])shadow('back',x,y,-22.31,0,0,index++);
 for(const side of [-1,1])for(const y of [.9,2.15])for(const z of [-17.5,-19.5,-21.5])shadow(side<0?'left':'right',side*1.91,y,z,0,-side*Math.PI/2,index++);
 for(const x of [-1.1,0,1.1])for(const z of [-18.15,-21])shadow('ceiling',x,3.065,z,Math.PI/2,0,index++);
 const audio=new RoomAmbience(game.soundManager),right=new T.Vector3(),toward=new T.Vector3();
 const controller={group,shadows,audio,textureReady:false,inside:false,update(delta){
  const p=game.camera.position,near=Math.abs(p.x)<3&&p.z< -14.5&&p.z> -24;group.visible=near&&game.room.doorOpenProgress>0;
  this.inside=Math.abs(p.x)<1.88&&p.z< -16.25&&p.z> -22.25&&p.y>=0&&p.y<3.1&&game.room.doorOpenProgress>=1&&!game.gameEnded&&!document.hidden;
  right.set(1,0,0).applyQuaternion(game.camera.quaternion);toward.set(-p.x,0,-20.2-p.z).normalize();audio.update(this.inside,Math.max(-.55,Math.min(.55,right.dot(toward)*.55)));
  if(!near)return;const time=performance.now()/1000;for(const s of shadows){const wave=Math.sin(time*.65+s.phase);s.hand.rotation.z=wave*.13+(s.index%2?-.12:.12);s.hand.scale.set(1+wave*.08,1+Math.sin(time*.9+s.phase)*.14,1);s.hand.position.set(Math.sin(time*.5+s.phase)*.035,wave*.045,.015+(1+wave)*.018);s.hand.material.opacity=.72+Math.sin(time*.8+s.phase)*.12;}
 }};
 if(game.playTimer){const onEnd=game.playTimer.onEnd;game.playTimer.onEnd=function(...args){audio.stop();return onEnd?.apply(this,args);};}
 const update=game.playerControls.update.bind(game.playerControls);game.playerControls.update=delta=>{update(delta);controller.update(delta);};return controller;
}};
})();
