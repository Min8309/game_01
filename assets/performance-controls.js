/* Shared, bounded scene queries and adaptive rendering. No puzzle state changes. */
(function(){
 'use strict';
 function attach(game){
  if(game.performanceControls)return;
  const mobile=matchMedia('(pointer: coarse)').matches||new URLSearchParams(location.search).has('mobilePreview');
  const renderer=game.renderer,scene=game.scene,interaction=game.interactionManager;
  const point=game.camera.position.clone(),lightPoint=point.clone();
  const perf=game.performanceControls={mobile,sceneReady:false,aimHit:null,searches:0,renderedFrames:0,quality:1};
  let indexed=[],nearby=[],lights=[],nextIndex=0,nextBounds=0,nextSearch=0,lastRender=-Infinity,qualitySince=performance.now(),sampleSince=qualitySince,sampleFrames=0,dialogRendered=false,pendingTier=null;
  function visible(object){for(let o=object;o;o=o.parent)if(!o.visible)return false;return true;}
  function index(){
   indexed=[];lights=[];
   scene.traverse(object=>{
    if((object.isPointLight||object.isSpotLight)&&!object.userData.performanceProxy){lights.push(object);if(object.isPointLight||mobile)object.castShadow=false;}
    if(!object.geometry||!object.raycast||object.userData.isPuzzleMarker)return;
    const geometry=object.geometry;if(!geometry.boundingSphere)geometry.computeBoundingSphere();
    if(geometry.boundingSphere)indexed.push(object);
   });nextIndex=Infinity;
  }
  perf.invalidate=()=>{nextIndex=0;nextBounds=0;dialogRendered=false;};window.addEventListener('inventory-changed',()=>queueMicrotask(perf.invalidate));
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
  const render=renderer.render.bind(renderer),baseRatio=Math.min(devicePixelRatio,1),qualities=[.65,.8,1];let tier=mobile?1:2;const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');if(debug&&/swiftshader|llvmpipe/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)))tier=0;perf.quality=qualities[tier];
  document.documentElement.classList.toggle('reduced-game-effects',tier<2);renderer.setPixelRatio(baseRatio*perf.quality);renderer.shadowMap.enabled=!mobile;index();
  const source=lights.find(l=>l.isPointLight),pool=[];if(source)for(let i=0;i<4;i++){const light=new source.constructor(0xffffff,0,0,2);light.userData.performanceProxy=true;light.castShadow=false;scene.add(light);pool.push(light);}perf.lightPool=pool;
  renderer.render=function(world,camera){
   if(!perf.sceneReady||document.hidden)return;
   const x=game.camera.position.x;
   if(game.mobileArchive?.contents)game.mobileArchive.contents.visible=x>=11.8;
   if(game.mobileDarkroom?.contents)game.mobileDarkroom.contents.visible=x>=26.4;
   const now=performance.now(),dialog=interaction.isInspecting||game.notebookUI.isOpen||!game.startScreen.classList.contains('hidden');
   if(dialog&&dialogRendered&&pendingTier===null)return;if(!dialog)dialogRendered=false;else dialogRendered=true;
   if(pendingTier!==null&&dialog){tier=pendingTier;pendingTier=null;perf.quality=qualities[tier];renderer.setPixelRatio(baseRatio*perf.quality);document.documentElement.classList.toggle('reduced-game-effects',tier<2);qualitySince=now;}
   lastRender=now;
   if(!dialog){sampleFrames++;if(now-sampleSince>2500){const fps=sampleFrames*1000/(now-sampleSince);let next=tier;if(fps<23&&tier>0)next--;if(next!==tier)pendingTier=next;sampleSince=now;sampleFrames=0;}}else{sampleSince=now;sampleFrames=0;}
   // A fixed light count avoids shader recompilation when crossing attenuation boundaries.
   const candidates=[];for(const light of lights){if(!light.isPointLight||!visible(light))continue;light.getWorldPosition(lightPoint);const distance=lightPoint.distanceTo(camera.position);if(!light.distance||distance<light.distance+6)candidates.push({light,score:light.intensity/(1+distance*distance)});}
   candidates.sort((a,b)=>b.score-a.score);for(let i=0;i<pool.length;i++){const proxy=pool[i],light=candidates[i]?.light;proxy.visible=true;if(!light){proxy.intensity=0;continue;}light.getWorldPosition(proxy.position);proxy.color.copy(light.color);proxy.intensity=light.intensity;proxy.distance=light.distance;proxy.decay=light.decay;}
   const hidden=[];for(const light of lights)if(light.isPointLight&&light.visible){hidden.push(light);light.visible=false;}
   try{perf.renderedFrames++;return render(world,camera);}finally{for(const light of hidden)light.visible=true;}
  };
  perf.ready=()=>{index();perf.warmPromise=new Promise(resolve=>setTimeout(async()=>{await game.ghostEncounters.readyPromise;index();const hidden=[];for(const light of lights)if(light.isPointLight&&light.visible){hidden.push(light);light.visible=false;}const ghost=game.ghostEncounters,oldMap=ghost.material?.map,oldVisible=ghost.sprite?.visible;const texture=ghost.textures.values().next().value;if(ghost.material&&texture){ghost.material.map=texture;ghost.material.needsUpdate=true;}if(ghost.sprite)ghost.sprite.visible=true;const start=performance.now();try{if(typeof renderer.compileAsync==='function'&&gl.getExtension('KHR_parallel_shader_compile'))await renderer.compileAsync(scene,game.camera);else renderer.compile(scene,game.camera);
    // Render tiny views while the menu is preparing: shadow and room-specific
    // shader variants otherwise appear on the first visit, after compile().
    const viewport={copy(v){this.x=v.x;this.y=v.y;this.z=v.z;this.w=v.w;return this;}};renderer.getViewport(viewport);
    const camera=game.camera.clone(),flash=game.lighting.flashlight,flashVisible=flash.visible,ambient=game.mobileArchive.ambient,ambientVisible=ambient.visible;
    const views=[[[0,1.65,4.2],[0,1,-3]],[[18,-1.95,-2.7],[22,-2.5,-2.7]],[[30,-1.95,-2.7],[32.3,-2.5,-.36]],[[38.3,-1.95,-2.7],[38.3,-2,-5.42]]];
    try{renderer.setViewport(0,0,48,48);for(let i=0;i<views.length;i++){ambient.visible=i>0;camera.position.set(...views[i][0]);camera.lookAt(...views[i][1]);camera.updateMatrixWorld();for(const on of [false,true]){flash.visible=on;render(scene,camera);}const status=document.querySelector('.session-save');if(status)status.textContent='그래픽 사전 준비 중 · '+(i+1)+' / '+views.length;await new Promise(requestAnimationFrame);}}
    finally{flash.visible=flashVisible;ambient.visible=ambientVisible;renderer.setViewport(viewport.x,viewport.y,viewport.z,viewport.w);}
    perf.warmPrograms=renderer.info.programs.length;
}catch(error){console.warn('Graphics preparation deferred to first render',error);}finally{for(const light of hidden)light.visible=true;if(ghost.material){ghost.material.map=oldMap;ghost.material.needsUpdate=true;}if(ghost.sprite)ghost.sprite.visible=oldVisible;perf.warmMs=performance.now()-start;perf.sceneReady=true;resolve();}},450));};
 }
 window.SikjasilPerformance={attach};
 window.addEventListener('sikjasil-ready',event=>{attach(event.detail);event.detail.performanceControls.ready();});
})();
