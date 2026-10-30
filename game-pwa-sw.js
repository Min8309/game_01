/* Cache only game assets; never cache sign-in pages or cross-origin resources. */
'use strict';
const CACHE='gyeongseong-offline-20261030-review2';
const ASSETS=["./", "./assets/case-map/investigation-wall.webp", "./assets/death-scene.css", "./assets/death-scene.js", "./assets/fonts/YeonSung-Regular.woff2", "./assets/game-classic.js", "./assets/game-font.css", "./assets/ghost-audio.js", "./assets/ghost-director.css", "./assets/ghost-director.js", "./assets/ghosts/cabinet.png", "./assets/ghosts/cabinet_anim.webp", "./assets/ghosts/crawler.png", "./assets/ghosts/crawler_anim.webp", "./assets/ghosts/hanged.png", "./assets/ghosts/hanged_anim.webp", "./assets/ghosts/ink.png", "./assets/ghosts/ink_anim.webp", "./assets/ghosts/shroud.png", "./assets/ghosts/shroud_anim.webp", "./assets/ghosts/wall.png", "./assets/ghosts/wall_anim.webp", "./assets/history/aged-expo-poster.jpg", "./assets/history/hair-key.webp", "./assets/history/hand-shadow.webp", "./assets/history/worn-hardcover.jpg", "./assets/index-BnN-PICE.css", "./assets/missing-person/photo-1.jpg", "./assets/missing-person/photo-2.jpg", "./assets/missing-person/photo-3.jpg", "./assets/mobile-controls.css", "./assets/mobile-controls.js", "./assets/performance-controls.css", "./assets/performance-controls.js", "./assets/quest-navigator.css", "./assets/quest-navigator.js", "./assets/realistic-enhancer.js", "./assets/rusted-key.webp", "./audio/basement-bgm.mp3", "./audio/creatures/creature_01_abyssal_behemoth.mp3", "./audio/creatures/creature_02_insectoid_xenomorph.mp3", "./audio/creatures/creature_03_mutated_infected.mp3", "./audio/creatures/ghost-scream.wav", "./audio/feedback/correct.mp3", "./audio/feedback/ending.mp3", "./audio/ghost-scream.mp3", "./img/card/type_a.jpg", "./img/card/type_b.jpg", "./img/card/type_c.jpg", "./img/card/type_d.jpg", "./img/ending/empty_room_chair.png", "./img/ending/screaming_faces.png", "./index.html", "./manifest.webmanifest", "./modules/archive-bootstrap.js", "./modules/archive-space.css", "./modules/archive-space.js", "./modules/cabinet-prop.js", "./modules/darkroom-space.js", "./modules/exit-case-map.css", "./modules/exit-case-map.js", "./modules/exit-horror.js", "./modules/exit-room.js", "./modules/feedback-audio.js", "./modules/game-session.css", "./modules/game-session.js", "./modules/hint-focus.js", "./modules/history-game.js", "./modules/investigation-notebook.css", "./modules/investigation-notebook.js", "./modules/missing-person.js", "./modules/room-puzzles.css", "./modules/tension-director.js", "./pwa-icons/icon-192.png", "./pwa-icons/icon-512.png", "./pwa-install.js"];
const INDEX=new URL('./',self.registration.scope).href;
const PATHS=new Set(ASSETS.map(p=>new URL(p,self.registration.scope).pathname));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 let cursor=0;await Promise.all(Array.from({length:2},async()=>{while(cursor<ASSETS.length){const path=ASSETS[cursor++],url=new URL(path,self.registration.scope);const response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin'}));if(!response.ok||response.redirected||new URL(response.url).origin!==self.location.origin)throw new Error('Game asset unavailable');await cache.put(url,response);}}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('gyeongseong-offline-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
async function rangeResponse(request,response){
 const range=request.headers.get('range');if(!range||response.status!==200)return response;
 const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match)return response;
 const bytes=await response.arrayBuffer(),size=bytes.byteLength;
 const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));const end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
 if(start>=size||start>end)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 const headers=new Headers(response.headers);headers.set('Content-Range','bytes '+start+'-'+end+'/'+size);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
 return new Response(bytes.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const scopePath=new URL(self.registration.scope).pathname;const inScope=url.pathname===scopePath||url.pathname===scopePath+'index.html';
 if(request.mode==='navigate'&&inScope){event.respondWith((async()=>{try{const response=await fetch(request);if(response.ok&&!response.redirected){const cache=await caches.open(CACHE);await cache.put(INDEX,response.clone());}return response;}catch{const cached=await caches.match(INDEX,{cacheName:CACHE});return cached||Response.error();}})());return;}
 if(!PATHS.has(url.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const code=/\.(?:js|css)$/.test(url.pathname);if(code){try{const response=await fetch(request);if(response.ok&&!response.redirected)await cache.put(request,response.clone());return response;}catch{const cached=await cache.match(request,{ignoreSearch:true});return cached||Response.error();}}
 const cached=await cache.match(request,{ignoreSearch:true});if(cached)return rangeResponse(request,cached);return fetch(request);
 })());
});
