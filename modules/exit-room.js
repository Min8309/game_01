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
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d');c.fillStyle='#cfc5a4';c.fillRect(0,0,1024,512);c.fillStyle='#211d17';c.font='bold 44px serif';c.textAlign='center';c.fillText('머리카락 엉킨 열쇠를',512,215);c.fillText('이 종이 위에 올려놓으시오',512,290);const noteTexture=new T.CanvasTexture(canvas);noteTexture.colorSpace='srgb';
 const note=new T.Mesh(new T.PlaneGeometry(.58,.35),new T.MeshStandardMaterial({map:noteTexture,roughness:1,side:2}));note.rotation.x=-Math.PI/2;note.rotation.z=-.08;note.position.set(0,.925,-20.1);note.userData={isInteractable:true,type:'history_exit_note',clueId:'history_exit_note',name:'테이블 위의 종이',description:'낡은 종이에 한 줄이 남아 있다.'};group.add(note);game.furniture.interactables.push(note);
 archive.markPuzzle(0,.93,-20.1,.64,.42);
 const horror=window.GyeongExitHorror.create(game,group);
 return{group,note,horror,found:false,keyPlaced:false,placedKey:null,placeKey(source){if(this.keyPlaced)return false;this.keyPlaced=true;const key=source.clone(true);key.position.set(0,.94,-20.1);key.traverse(o=>{o.visible=!o.userData.isPuzzleMarker;o.userData={};});group.add(key);this.placedKey=key;return true;}};
}};})(window);
