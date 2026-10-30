/* Four physical drawers; the third drawer reveals the historical role card. */
(function(root){'use strict';root.GyeongCabinetProp={create(game,archive){
 const T=game.sceneAPI,group=new T.Group();group.position.set(-3.6,0,5);group.name='history-filing-cabinet';
 const legacy=game.scene.children.find(o=>o.position.x===-3.6&&o.position.z===5);
 if(legacy){legacy.visible=false;legacy.traverse(o=>{o.raycast=()=>{};o.userData={};});}
 game.room.colliders=game.room.colliders.filter(b=>!(Math.abs(b.min.x+4.55)<.01&&Math.abs(b.min.z-4.65)<.01));
 game.room.addColliderBox(new T.Vector3(-3.6,1.01,5),new T.Vector3(.96,2.02,.72));game.scene.add(group);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#626960';c.fillRect(0,0,256,256);let seed=1936;for(let i=0;i<1600;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%256;seed=(Math.imul(seed,1664525)+1013904223)>>>0;c.fillStyle=i%3?'#42372644':'#b9b9a733';c.fillRect(x,seed%256,1+i%4,1+i%7);}
 const texture=new T.CanvasTexture(canvas),metal=new T.MeshStandardMaterial({map:texture,roughness:.85,metalness:.45}),handle=new T.MeshStandardMaterial({color:0x24291f,roughness:.7,metalness:.65}),paper=new T.MeshStandardMaterial({color:0xb1a184,roughness:1});
 function box(w,h,d,x,y,z,mat,parent=group){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 box(.93,2.04,.035,0,1.02,.34,metal);for(const x of[-.45,.45])box(.035,2.04,.7,x,1.02,0,metal);for(const y of[.02,2.02])box(.93,.035,.7,0,y,0,metal);
 const drawers=[];let note;
 for(let index=0;index<4;index++){
  const drawer=new T.Group();drawer.position.y=.28+index*.46;group.add(drawer);const data={isInteractable:true,type:'history_cabinet_drawer',clueId:'history_cabinet_drawer_'+index,drawerIndex:index,name:`캐비닛 ${index+1}번 서랍`,description:'낡은 서랍을 열어 안쪽 기록을 확인하세요.'};drawer.userData=data;
  box(.81,.4,.03,0,0,-.34,metal,drawer).userData=data;box(.78,.018,.59,0,-.18,-.02,metal,drawer);
  for(const x of[-.39,.39])box(.018,.3,.59,x,-.035,-.02,metal,drawer);box(.78,.3,.02,0,-.035,.27,metal,drawer);
  box(.23,.085,.014,0,.095,-.365,paper,drawer).userData=data;box(.21,.024,.035,0,-.025,-.405,handle,drawer).userData=data;
  for(const x of[-.1,.1])box(.022,.055,.06,x,-.015,-.38,handle,drawer).userData=data;
  box(.59,.03,.36,0,-.14,0,paper,drawer);
  drawers.push({group:drawer,progress:0,opened:false,index});
  if(index===2){
    const sign=archive.sign('',.67,.3,true),card=document.createElement('canvas');
    card.width=512;card.height=256;
    const ink=card.getContext('2d');
    ink.fillStyle='#b9ac85';ink.fillRect(0,0,512,256);
    ink.strokeStyle='#39c85a';ink.lineWidth=6;ink.strokeRect(10,10,492,236);
    ink.fillStyle='#203b27';ink.textAlign='center';ink.font='bold 36px serif';
    ink.fillText('이길용 — 기자',256,105);ink.fillText('이상범 — 화가',256,175);
    sign.material.map.dispose();sign.material.map=new T.CanvasTexture(card);
    sign.rotation.x=-Math.PI/2;sign.position.set(0,-.115,-.08);
    // 클릭 판정 범위(히트박스)를 서랍 안쪽 전체로 확장
    const hitBox=new T.Mesh(new T.BoxGeometry(.72,.22,.38),new T.MeshBasicMaterial({visible:false}));
    hitBox.position.set(0,.05,0);
    sign.add(hitBox);
    drawer.add(sign);
    sign.visible=false;note=sign;
  }
 }
 const cabinet={group,drawers,note,discovered:false,open(index){const d=drawers[index];if(!d)return;d.opened=!d.opened;game.soundManager.playDrawerUnlock();}};
 const update=game.playerControls.update.bind(game.playerControls);game.playerControls.update=delta=>{
  update(delta);for(const d of drawers){const target=d.opened?1:0;d.progress+=Math.sign(target-d.progress)*Math.min(Math.abs(target-d.progress),Math.max(0,delta)*1.8);d.group.position.z=-.5*(d.progress*d.progress*(3-2*d.progress));}
  const visible=drawers[2].progress>.95;note.visible=visible;
  if(visible&&!cabinet.discovered){cabinet.discovered=true;note.userData={isInteractable:true,clueId:'history_cabinet',type:'history_cabinet',name:'서랍 안의 역할표 · 난이도 중',description:'이길용은 기자, 이상범은 화가. 발견한 역할표를 읽어 퀴즈를 해결하세요.'};game.sharedInventory.addItem({id:'history_role_card',name:'캐비닛의 역할표',desc:'이길용—기자 / 이상범—화가. 캐비닛 세 번째 서랍에서 발견한 기록.'});}
 };
 game.furniture.interactables.push(...drawers.map(d=>d.group),note);
 game.historyGame.hoverLabels=[...(game.historyGame.hoverLabels||[]),...drawers.map(d=>({object:d.group,getText:()=>`캐비닛 ${d.index+1}번 서랍 · ${d.opened?'닫기':'열기'}`}))];
 game.historyGame.hoverLabels.unshift({object:note,text:'발견한 역할표 · 난이도 중'});
 return cabinet;
}};})(window);
