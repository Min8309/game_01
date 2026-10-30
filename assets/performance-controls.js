/* Shared, bounded scene queries and adaptive rendering. No puzzle state changes. */
(function(){
 'use strict';
 function attach(game){
  if(game.performanceControls)return;
  const mobile=matchMedia('(pointer: coarse)').matches||new URLSearchParams(location.search).has('mobilePreview');
  const renderer=game.renderer,scene=game.scene,interaction=game.interactionManager;
  const point=game.camera.position.clone(),lightPoint=point.clone();
  const perf=game.performanceControls={mobile,sceneReady:false,aimHit:null,searches:0,renderedFrames:0,quality:1};
  let indexed=[],nearby=[],lights=[],nextIndex=0,nextBounds=0,nextSearch=0,lastRender=-Infinity,qualitySince=performance.now(),sampleSince=qualitySince,sampleFrames=0;
  function visible(object){for(let o=object;o;o=o.parent)if(!o.visible)return false;return true;}
  function index(){
   indexed=[];lights=[];
   scene.traverse(object=>{
    if(object.isPointLight||object.isSpotLight){lights.push(object);if(object.isPointLight||mobile)object.castShadow=false;}
    if(!object.geometry||!object.raycast||object.userData.isPuzzleMarker)return;
    const geometry=object.geometry;if(!geometry.boundingSphere)geometry.computeBoundingSphere();
    if(geometry.boundingSphere)indexed.push(object);
   });nextIndex=performance.now()+1500;
  }
  perf.candidates=function(force=false){
   const now=performance.now();if(force||now>=nextIndex)index();
   if(!force&&now<nextBounds)return nearby;
   nextBounds=now+75;nearby=[];scene.updateMatrixWorld();
   for(const object of indexed){if(!visible(object))continue;if(object.isInstancedMesh){nearby.push(object);continue;}const sphere=object.geometry.boundingSphere;point.copy(sphere.center).applyMatrix4(object.matrixWorld);const radius=sphere.radius*object.matrixWorld.getMaxScaleOnAxis();if(point.distanceToSquared(game.camera.position)<(4.2+radius)*(4.2+radius))nearby.push(object);}
   return nearby;
  };
  const ray=interaction.raycaster,cast=ray.intersectObjects.bind(ray),update=interaction.update.bind(interaction);
  ray.far=3.5;
  ray.intersectObjects=function(objects,recursive,target){const hits=cast(perf.candidates(),false,target);if(interaction.centerCoord.x===0&&interaction.centerCoord.y===0)perf.aimHit=hits[0]||null;return hits;};
  interaction.update=function(force=false){
   if(this.isInspecting||!game.playerControls.controls.isLocked){perf.aimHit=null;nextSearch=0;return update();}
   const now=performance.now();if(!force&&now<nextSearch)return;
   nextSearch=now+75;perf.searches++;return update();
  };
  interaction.refreshTarget=()=>{nextSearch=0;nextBounds=0;return interaction.update(true);};
  const render=renderer.render.bind(renderer),baseRatio=Math.min(devicePixelRatio,1),qualities=[.65,.8,1];let tier=2;
  renderer.setPixelRatio(baseRatio);renderer.shadowMap.enabled=!mobile;index();
  renderer.render=function(world,camera){
   if(!perf.sceneReady||document.hidden)return;
   const now=performance.now(),dialog=interaction.isInspecting||game.notebookUI.isOpen||!game.startScreen.classList.contains('hidden');
   if(dialog&&now-lastRender<100)return;
   lastRender=now;
   if(!dialog){sampleFrames++;if(now-sampleSince>2500){const fps=sampleFrames*1000/(now-sampleSince);let next=tier;if(fps<23&&tier>0)next--;else if(fps>(mobile?50:55)&&tier<2&&now-qualitySince>12000)next++;if(next!==tier){tier=next;perf.quality=qualities[tier];renderer.setPixelRatio(baseRatio*perf.quality);qualitySince=now;document.documentElement.classList.toggle('reduced-game-effects',tier<2);}sampleSince=now;sampleFrames=0;}}else{sampleSince=now;sampleFrames=0;}
   // Lights beyond their attenuation radius cannot affect the player's room.
   const hidden=[];for(const light of lights){if(!light.visible||!light.isPointLight||!light.distance)continue;light.getWorldPosition(lightPoint);if(lightPoint.distanceTo(game.camera.position)>light.distance+6){hidden.push(light);light.visible=false;}}
   try{perf.renderedFrames++;return render(world,camera);}finally{for(const light of hidden)light.visible=true;}
  };
  perf.ready=()=>{index();setTimeout(()=>{index();perf.sceneReady=true;},450);};
 }
 window.SikjasilPerformance={attach};
 window.addEventListener('sikjasil-ready',event=>{attach(event.detail);event.detail.performanceControls.ready();});
})();
