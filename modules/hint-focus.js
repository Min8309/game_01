/* Low-intensity clues brighten only under the pointer/aim; no global green pulse. */
(function(){'use strict';window.addEventListener('sikjasil-ready',function(event){
 const game=event.detail,T=game.sceneAPI,point=new T.Vector3(),pointer={x:0,y:0};let pointerUsed=false;
 const ray=new game.interactionManager.raycaster.constructor(),targets=[];ray.far=3.5;let paperHover=null,nextPaperCheck=0;
 const label=document.createElement('div');label.id='history-clue-label';label.hidden=true;document.body.appendChild(label);
 window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer.x=e.clientX/window.innerWidth*2-1;pointer.y=1-e.clientY/window.innerHeight*2;pointerUsed=true;});
 game.scene.traverse(object=>{if(!object.isMesh||!object.material)return;const materials=Array.isArray(object.material)?object.material:[object.material];if(object.isHintAccent||object.userData.isPuzzleMarker||materials.some(m=>m.color?.getHex()===0x39c85a)){
  object.material=Array.isArray(object.material)?materials.map(m=>m.clone()):object.material.clone();
  const list=Array.isArray(object.material)?object.material:[object.material];for(const m of list){m.transparent=true;m.opacity=.22;m.depthWrite=false;}targets.push({object,materials:list});
 }});
 const nativeUpdate=game.hintSystem.update.bind(game.hintSystem);game.hintSystem.update=(elapsed,delta)=>{
  nativeUpdate(elapsed,delta);
  const exploring=game.playerControls.controls.isLocked&&!game.gameEnded;
  // Locked desktop controls use the crosshair; unlocked pointer uses its actual position.
  ray.setFromCamera(exploring?{x:0,y:0}:pointerUsed?pointer:{x:0,y:0},game.camera);
  const hit=exploring?game.performanceControls?.aimHit:null;
  function related(object){for(let o=hit?.object;o;o=o.parent)if(o===object)return true;return false;}
  const now=performance.now();
  if(!exploring)paperHover=null;
  else if(now>=nextPaperCheck){
   nextPaperCheck=now+75;paperHover=null;
   for(const clue of game.historyGame.paperClues||[]){
    clue.object.getWorldPosition(point);if(point.distanceTo(game.camera.position)>3.5)continue;point.project(game.camera);
    if(point.z< -1||point.z>1||Math.hypot(point.x*innerWidth/2,point.y*innerHeight/2)>70)continue;
    ray.setFromCamera({x:point.x,y:point.y},game.camera);
    const first=ray.intersectObjects(game.performanceControls.candidates(),false).find(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});
    let belongs=false;for(let o=first?.object;o;o=o.parent)if(o===clue.object)belongs=true;
    if(belongs){paperHover={object:clue.object,text:clue.object.userData.name};break;}
   }
  }
  const hovered=exploring&&(game.historyGame.hoverLabels?.find(item=>related(item.object))||paperHover);label.hidden=!hovered;
  game.interactionManager.promptEl.classList.toggle('history-hover-prompt',!!hovered);
  if(hovered){hovered.object.getWorldPosition(point);if(hovered.object.userData.type==='history_cabinet')point.y+=.25;point.project(game.camera);label.textContent=(document.documentElement.classList.contains('touch-game')?'':'[클릭] ')+(hovered.getText?hovered.getText():hovered.text);label.style.left=Math.max(100,Math.min(innerWidth-100,(point.x+1)*innerWidth/2))+'px';label.style.top=Math.max(12,Math.min(innerHeight-48,(1-point.y)*innerHeight/2-48))+'px';}
  for(const item of game.hintSystem.clueRegistry){const active=exploring&&related(item.object);for(const m of item.meshList)if(m.emissive){m.emissive.setHex(0x39c85a);m.emissiveIntensity=active?1.25:.035;}}
  for(const target of targets){target.object.getWorldPosition(point);const active=exploring&&(related(target.object)||(target.object.userData.isPuzzleMarker&&related(target.object.parent))||(hit&&point.distanceTo(hit.point)<.55));const opacity=active?.92:.22;for(const m of target.materials)m.opacity+=(opacity-m.opacity)*Math.min(1,Math.max(0,delta)*12);}
  for(const clue of game.historyGame.paperClues||[]){const active=exploring&&(related(clue.object)||paperHover?.object===clue.object);clue.border.visible=active;for(const mesh of clue.meshes){mesh.material.color.setHex(active?0xb7e5bc:0xe5dfc9);mesh.material.emissiveIntensity=active?.85:0;}clue.border.traverse(o=>{if(o.isMesh)o.material.opacity=active?.95:0;});}

 };
 game.hintFocus={targets};
});})();
