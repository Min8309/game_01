/* Quiet one-shot creature sounds, bounded to the apparition's visible lifetime. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SikjasilGhostAudio=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
const FILES=['creature_01_abyssal_behemoth.mp3','creature_02_insectoid_xenomorph.mp3','creature_03_mutated_infected.mp3'];
const VOLUME=.18,FADE_IN=.18,FADE_OUT=.45;
class PopupAudio{
 constructor(manager,random=Math.random){this.manager=manager;this.random=random;this.buffers=[];this.active=null;this.failedAssets=[];
  if(typeof document==='object')document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();});
  this.loaded=Promise.all(FILES.map(file=>fetch('./audio/creatures/'+file).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer();}).then(bytes=>({file,bytes})).catch(()=>{this.failedAssets.push(file);return null;})));
 }
 prepare(){const ctx=this.manager?.ctx;if(!ctx)return Promise.resolve(false);if(this.context===ctx)return this.prepared;
  this.context=ctx;this.prepared=this.loaded.then(items=>Promise.all(items.filter(Boolean).map(async item=>{
   try{const buffer=await ctx.decodeAudioData(item.bytes.slice(0));let peak=1;for(let channel=0;channel<buffer.numberOfChannels;channel++){const samples=buffer.getChannelData(channel);for(let i=0;i<samples.length;i++)peak=Math.max(peak,Math.abs(samples[i]));}return{file:item.file,buffer,scale:1/peak};}catch{this.failedAssets.push(item.file);return null;}
  }))).then(items=>{if(this.context===ctx)this.buffers=items.filter(Boolean);return this.buffers.length>0;});return this.prepared;
 }
 play(seconds){const ctx=this.manager?.ctx;if(!ctx||ctx!==this.context||ctx.state!=='running'||this.manager.isMuted||!this.buffers.length)return false;
  const item=this.buffers[Math.min(this.buffers.length-1,Math.floor(this.random()*this.buffers.length))],duration=Math.min(seconds,item.buffer.duration);if(duration<=0)return false;
  this.stop(0);const source=ctx.createBufferSource(),gain=ctx.createGain(),now=ctx.currentTime,peak=VOLUME*item.scale,fadeIn=Math.min(FADE_IN,duration/3),fadeOut=Math.min(FADE_OUT,duration/3);
  source.buffer=item.buffer;source.connect(gain);gain.connect(this.manager.masterGain||ctx.destination);
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(peak,now+fadeIn);gain.gain.setValueAtTime(peak,now+duration-fadeOut);gain.gain.linearRampToValueAtTime(0,now+duration);
  const voice={source,gain,file:item.file,startedAt:now,endsAt:now+duration,peak};this.active=voice;
  source.onended=()=>{source.disconnect();gain.disconnect();if(this.active===voice)this.active=null;};source.start(now);source.stop(now+duration);return true;
 }
 stop(fade=.06){const voice=this.active,ctx=this.context;if(!voice||!ctx||voice.stopping&&fade>0)return;voice.stopping=true;const now=ctx.currentTime,end=Math.max(now,Math.min(voice.endsAt,now+fade));
  if(voice.gain.gain.cancelAndHoldAtTime)voice.gain.gain.cancelAndHoldAtTime(now);else{const elapsed=now-voice.startedAt,remaining=voice.endsAt-now;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setValueAtTime(voice.peak*Math.max(0,Math.min(1,elapsed/FADE_IN,remaining/FADE_OUT)),now);}
  voice.gain.gain.linearRampToValueAtTime(0,end);try{voice.source.stop(end);}catch{};
 }
}
return{PopupAudio,FILES,VOLUME,FADE_IN,FADE_OUT};
});
