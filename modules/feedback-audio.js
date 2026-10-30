/* Uploaded quiz and final-photo sounds share the game's volume and mute control. */
(function(){
'use strict';
class FeedbackAudio{
 constructor(manager){this.manager=manager;this.buffers={};this.active=null;this.request=0;
  this.loaded=Promise.all(['correct','ending'].map(async name=>{try{const response=await fetch('./audio/feedback/'+name+'.mp3');if(!response.ok)return null;return{name,bytes:await response.arrayBuffer()};}catch{return null;}}));
 }
 prepare(){const ctx=this.manager.ctx;if(!ctx)return Promise.resolve(false);if(this.context===ctx)return this.prepared;this.context=ctx;
  this.prepared=this.loaded.then(items=>Promise.all(items.filter(Boolean).map(async item=>{try{this.buffers[item.name]=await ctx.decodeAudioData(item.bytes.slice(0));}catch{}}))).then(()=>true);return this.prepared;
 }
 async play(name,delay=0){const request=++this.request;await this.prepare();const ctx=this.manager.ctx,buffer=this.buffers[name];if(request!==this.request||!buffer||this.manager.isMuted||ctx?.state!=='running')return false;
  const when=ctx.currentTime+delay;if(this.active){try{this.active.source.stop(when);}catch{}}
  const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.connect(gain);gain.connect(this.manager.masterGain);
  gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(.35,when+.02);gain.gain.setValueAtTime(.35,when+Math.max(.02,buffer.duration-.15));gain.gain.linearRampToValueAtTime(0,when+buffer.duration);
  const voice={name,source,gain,startedAt:when,endsAt:when+buffer.duration};this.active=voice;
  source.onended=()=>{source.disconnect();gain.disconnect();if(this.active===voice)this.active=null;};source.start(when);source.stop(voice.endsAt);return true;
 }
}
window.GyeongFeedbackAudio=FeedbackAudio;
})();
