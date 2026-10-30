/* Shared ambient tension. Never changes puzzles, movement, or the ghost schedule. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GyeongTension=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
class FootstepSequence{
 constructor(now=0,random=Math.random){this.random=random;this.phase='waiting';this.nextAt=now+10+random()*10;this.index=0;}
 resumeWork(now){if(this.phase==='silenced'||this.phase==='waiting'){this.phase='waiting';this.nextAt=now+.8;}}
 tick(now,enabled,turned){
  if(!enabled)return null;
  if(this.phase==='approaching'&&turned){this.phase='silenced';return{type:'silence'};}
  if(this.phase==='silenced'||now<this.nextAt)return null;
  if(this.phase==='waiting'){this.phase='approaching';this.index=0;return{type:'begin'};}
  const distance=[5,4.3,3.6,2.9,2.2,1.5,1][this.index++];this.nextAt=now+.75;
  if(this.index===7){this.phase='waiting';this.nextAt=now+16+this.random()*12;}
  return{type:'step',distance};
 }
}
class PhotoMemory{
 constructor(){this.states=new Map();this.lastChange=-Infinity;}
 observe(id,visible,now){
  let state=this.states.get(id);if(!state){state={seen:false,visible:false,awaySince:now,changes:0};this.states.set(id,state);}
  const returning=visible&&!state.visible&&state.seen&&now-state.awaySince>=1.2;
  if(!visible&&state.visible)state.awaySince=now;
  state.visible=visible;if(visible)state.seen=true;
  if(returning&&now-this.lastChange>=12){state.changes++;this.lastChange=now;return state.changes;}
  return 0;
 }
}
class TensionDirector{
 constructor(game){
  this.game=game;this.T=game.sceneAPI;this.steps=new FootstepSequence(performance.now()/1000);this.photos=new PhotoMemory();this.history=[];this.photoHistory=[];this.sounds=new Set();this.behind=new this.T.Vector3();this.forward=new this.T.Vector3();this.world=new this.T.Vector3();this.relative=new this.T.Vector3();this.up=new this.T.Vector3();this.nextPhotoCheck=0;
  this.onInspect=()=>this.steps.resumeWork(performance.now()/1000);window.addEventListener('space-inspect',this.onInspect);
  const update=game.playerControls.update.bind(game.playerControls);game.playerControls.update=delta=>{update(delta);this.update();};
 }
 silence(){for(const sound of this.sounds){try{sound.gain.gain.cancelScheduledValues(sound.context.currentTime);sound.gain.gain.setTargetAtTime(0,sound.context.currentTime,.015);}catch{}}}
 positionAudio(context){
  const camera=this.game.camera,listener=context.listener;camera.getWorldDirection(this.forward);this.up.copy(camera.up).applyQuaternion(camera.quaternion);
  if(listener.positionX){for(const [name,value]of Object.entries({positionX:camera.position.x,positionY:camera.position.y,positionZ:camera.position.z,forwardX:this.forward.x,forwardY:this.forward.y,forwardZ:this.forward.z,upX:this.up.x,upY:this.up.y,upZ:this.up.z}))listener[name].setValueAtTime(value,context.currentTime);}
  else{listener.setPosition(camera.position.x,camera.position.y,camera.position.z);listener.setOrientation(this.forward.x,this.forward.y,this.forward.z,this.up.x,this.up.y,this.up.z);}
 }
 playStep(distance){
  const manager=this.game.soundManager,context=manager.ctx;if(!context||context.state!=='running')return;
  this.positionAudio(context);const now=context.currentTime,gain=context.createGain(),panner=context.createPanner();panner.panningModel='HRTF';panner.distanceModel='inverse';panner.refDistance=2;panner.rolloffFactor=.65;
  const camera=this.game.camera,point=camera.position.clone().addScaledVector(this.behind,distance);point.y=window.GyeongArchiveSpace.groundHeight(camera.position.x)+.08;
  if(panner.positionX){panner.positionX.value=point.x;panner.positionY.value=point.y;panner.positionZ.value=point.z;}else panner.setPosition(point.x,point.y,point.z);
  gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(.1+(5-distance)*.025,now+.012);gain.gain.exponentialRampToValueAtTime(.001,now+.19);gain.connect(panner);panner.connect(manager.masterGain);
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.19),context.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/samples.length*4);
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),thud=context.createOscillator();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=260;source.connect(filter);filter.connect(gain);thud.type='sine';thud.frequency.setValueAtTime(75,now);thud.frequency.exponentialRampToValueAtTime(35,now+.18);thud.connect(gain);
  const sound={gain,context};this.sounds.add(sound);source.onended=()=>{source.disconnect();filter.disconnect();thud.disconnect();gain.disconnect();panner.disconnect();this.sounds.delete(sound);};source.start(now);thud.start(now);thud.stop(now+.19);
  this.history.push({type:'step',distance,point:[point.x,point.y,point.z],at:performance.now()/1000});if(this.history.length>60)this.history.shift();
 }
 updatePhotos(now){
  const camera=this.game.camera,active=camera.position.x>=35&&camera.position.x<42;
  camera.getWorldDirection(this.forward);
  for(const [index,face]of this.game.mobileDarkroom.photos.entries()){
   face.getWorldPosition(this.world);this.relative.copy(this.world).sub(camera.position);const distance=this.relative.length(),visible=active&&distance<7&&this.relative.normalize().dot(this.forward)>.78;
   const variant=this.photos.observe(index,visible,now);if(!variant)continue;
   // Alter only the photographed figure, preserving the paper, peg and hanging rope.
   face.scale.x=variant%2?-1:1;face.position.x=variant%2?.025:-.025;face.rotation.z=variant%2?.045:-.025;
   face.userData.appearanceChanges=variant;this.photoHistory.push({photo:index,variant,at:now});if(this.photoHistory.length>40)this.photoHistory.shift();
  }
 }
 update(){
  const game=this.game,now=performance.now()/1000,enabled=game.playTimer.startedAt!==null&&!game.gameEnded&&!game.ending&&!document.hidden&&(game.playerControls.controls.isLocked||game.interactionManager.isInspecting);
  if(!enabled||game.ghostEncounters.active||document.querySelector('.gp-room-effect')){this.silence();return;}
  if(game.soundManager.ctx?.state==='running')this.positionAudio(game.soundManager.ctx);
  game.camera.getWorldDirection(this.forward);this.forward.y=0;this.forward.normalize();const turned=this.forward.dot(this.behind)>.35;
  const event=this.steps.tick(now,true,turned);
  if(event?.type==='begin'){this.behind.copy(this.forward).negate();this.history.push({type:'begin',at:now});}
  if(event?.type==='silence'){this.silence();this.history.push({type:'silence',at:now});}
  if(event?.type==='step')this.playStep(event.distance);
  if(now>=this.nextPhotoCheck){this.nextPhotoCheck=now+.15;this.updatePhotos(now);}
 }
}
return{FootstepSequence,PhotoMemory,TensionDirector};
});
