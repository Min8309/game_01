const test=require('node:test');const assert=require('node:assert/strict');
const {EndlessSchedule,GHOSTS,PLACES,CONFIG,fadeOpacity,screenOrigin}=require('../assets/ghost-director.js');
function rng(){let seed=1934;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
test('free exploration keeps bounded, varied encounters after ten minutes and hours',()=>{
 const s=new EndlessSchedule(rng());let lastGhost,lastPlace;const ids=new Set(),places=new Set();
 for(let i=0;i<1800;i++){const e=s.encounter(i*20);assert.notEqual(e.ghost.id,lastGhost);assert.notEqual(e.place.id,lastPlace);assert.equal(e.seen,false);lastGhost=e.ghost.id;lastPlace=e.place.id;ids.add(lastGhost);places.add(lastPlace);assert(s.ghosts.length<GHOSTS.length);assert(s.places.length<PLACES.length);}
 assert.equal(ids.size,GHOSTS.length);assert.equal(places.size,PLACES.length);assert.equal(s.count,1800);
 const cycle=new EndlessSchedule(rng());for(let n=0;n<20;n++){const unique=new Set();for(let j=0;j<GHOSTS.length;j++)unique.add(cycle.encounter(1200+n*60).ghost.id);assert.equal(unique.size,GHOSTS.length);}
});
test('random interval, progress, reading pause and resume never cause a burst',()=>{
 const s=new EndlessSchedule(rng());s.arm(1000,0);assert(s.nextAt>=9000&&s.nextAt<=15000);assert.equal(s.due(s.nextAt-1),false);assert.equal(s.due(s.nextAt),true);
 for(let i=0;i<100;i++){const early=s.gap(0),late=s.gap(1);assert(early>=12000&&early<=24000);assert(late>=9000&&late<=19000);}
 s.pause();assert.equal(s.nextAt,null);assert.equal(s.due(3600000),false);s.arm(3600000,1);assert(s.nextAt>3600000);s.accelerate(3600000);assert(s.nextAt>=3603500&&s.nextAt<=3605500);
 s.encounter(4000);s.reschedule(3600000,1);assert(s.nextAt>=3609000&&s.nextAt<=3619000);
});
test('all origin types and the half-second arrival share one bounded fade duration',()=>{
 assert.equal(CONFIG.arrivalSeconds,.5);assert.equal(CONFIG.totalDuration,1.2);assert.equal(fadeOpacity(0),0);assert.equal(fadeOpacity(.5),1);assert(fadeOpacity(1.1)>0&&fadeOpacity(1.1)<.2);assert.equal(fadeOpacity(1.2),0);
 for(const p of PLACES){const origin=screenOrigin(p,rng());assert.equal(origin.length,2);assert(origin.every(n=>Number.isFinite(n)&&Math.abs(n)<=.5));}
});
