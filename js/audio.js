/* ============ 音频系统（WebAudio 全程序化合成，零外部素材） ============ */
/* 音乐/音效双通道：独立开关 + 独立音量滑块，设置持久化到 localStorage */
const AudioSys = {
  ctx:null, master:null, music:null, sfxBus:null, delay:null, fb:null, wet:null, noiseBuf:null,
  started:false, mood:null,
  musicOn:true, sfxOn:true, musicVol:.8, sfxVol:.9,
  _drone:[], _timers:[], PREF:'emberpath_audio',
  SCALE:[220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3],

  start(){
    if(this.started) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    this.started = true;
    this.ctx = new AC();
    if(this.ctx.state === 'suspended') this.ctx.resume();
    this.master = this.ctx.createGain();
    this.master.gain.value = 1;
    this.master.connect(this.ctx.destination);
    this.delay = this.ctx.createDelay(1); this.delay.delayTime.value = .36;
    this.fb = this.ctx.createGain(); this.fb.gain.value = .34;
    this.delay.connect(this.fb); this.fb.connect(this.delay);
    this.wet = this.ctx.createGain(); this.wet.gain.value = .3;
    this.delay.connect(this.wet); this.wet.connect(this.master);
    this.music = this.ctx.createGain(); this.music.gain.value = 0;
    this.music.connect(this.master); this.music.connect(this.delay);
    this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = 0;
    this.sfxBus.connect(this.master);
    const len = Math.floor(this.ctx.sampleRate * 1.2);
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
    this.loadPrefs(); this.applyVolumes();
    this.setMood((typeof UI!=='undefined' && UI.lastScreen) || 'menu');
  },

  /* ---- 双通道音量控制 ---- */
  applyVolumes(){
    if(!this.ctx) return;
    this.music.gain.value = this.musicOn ? this.musicVol * .8 : 0;
    this.sfxBus.gain.value = this.sfxOn ? this.sfxVol : 0;
  },
  setMusicOn(b){ this.musicOn = b; this.applyVolumes(); this.savePrefs() },
  setSfxOn(b){ this.sfxOn = b; this.applyVolumes(); this.savePrefs() },
  setMusicVol(v){ this.musicVol = v; this.applyVolumes(); this.savePrefs() },
  setSfxVol(v){ this.sfxVol = v; this.applyVolumes(); this.savePrefs() },
  loadPrefs(){
    try{
      const p = JSON.parse(localStorage.getItem(this.PREF) || '{}');
      if(p.musicOn != null) this.musicOn = p.musicOn;
      if(p.sfxOn   != null) this.sfxOn   = p.sfxOn;
      if(p.musicVol != null) this.musicVol = p.musicVol;
      if(p.sfxVol   != null) this.sfxVol   = p.sfxVol;
    }catch(e){}
  },
  savePrefs(){
    try{ localStorage.setItem(this.PREF, JSON.stringify(
      { musicOn:this.musicOn, sfxOn:this.sfxOn, musicVol:this.musicVol, sfxVol:this.sfxVol })) }catch(e){}
  },

  tone({f=440, f2=null, type='sine', t=.2, v=.2, when=0, attack=.005, dest=null}){
    if(!this.ctx || !this.sfxOn) return;
    const now = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, now);
    if(f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), now + t);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(v, now + attack);
    g.gain.exponentialRampToValueAtTime(.0001, now + t);
    o.connect(g); g.connect(dest || this.sfxBus);
    o.start(now); o.stop(now + t + .05);
  },

  noise({t=.15, v=.2, fc=1000, fc2=null, when=0, dest=null}){
    if(!this.ctx || !this.sfxOn) return;
    const now = this.ctx.currentTime + when;
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(fc, now);
    if(fc2) f.frequency.exponentialRampToValueAtTime(Math.max(40, fc2), now + t);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(v, now);
    g.gain.exponentialRampToValueAtTime(.0001, now + t);
    s.connect(f); f.connect(g); g.connect(dest || this.sfxBus);
    s.start(now); s.stop(now + t + .05);
  },

  sfx(name){
    if(!this.started) return;
    switch(name){
      case 'click':    this.tone({f:720, f2:520, type:'triangle', t:.06, v:.12}); break;
      case 'card':     this.tone({f:520, f2:660, type:'triangle', t:.09, v:.16}); this.noise({t:.05, v:.05, fc:3000}); break;
      case 'cardplay': this.tone({f:400, f2:640, type:'triangle', t:.12, v:.2});  this.noise({t:.08, v:.08, fc:2400}); break;
      case 'draw':     this.noise({t:.06, v:.06, fc:2600, fc2:900}); break;
      case 'shuffle':  this.noise({t:.22, v:.12, fc:1800, fc2:600}); break;
      case 'slash':    this.noise({t:.1,  v:.24, fc:5200, fc2:800}); this.tone({f:900, f2:180, type:'sawtooth', t:.09, v:.1}); break;
      case 'hit':      this.tone({f:130, f2:45, type:'sine', t:.18, v:.4}); this.noise({t:.1, v:.18, fc:900, fc2:200}); break;
      case 'hurt':     this.tone({f:100, f2:40, type:'sine', t:.24, v:.45}); break;
      case 'block':    this.tone({f:220, type:'square', t:.1,  v:.1}); this.tone({f:330, type:'square', t:.12, v:.08, when:.03}); break;
      case 'buff':     [440, 554, 660].forEach((f,i)=> this.tone({f, type:'triangle', t:.1, v:.12, when:i*.06})); break;
      case 'debuff':   this.tone({f:392, f2:262, type:'triangle', t:.22, v:.14}); break;
      case 'heal':     this.tone({f:523, type:'sine', t:.18, v:.16}); this.tone({f:784, type:'sine', t:.3, v:.14, when:.12}); break;
      case 'coin':     this.tone({f:1319, type:'sine', t:.12, v:.14}); this.tone({f:1760, type:'sine', t:.2, v:.12, when:.07}); break;
      case 'orb':      this.tone({f:110, type:'square', t:.16, v:.14}); break;
      case 'charge':   this.tone({f:70, f2:150, type:'sawtooth', t:.8, v:.2}); break;
      case 'die':      this.tone({f:220, f2:36, type:'sawtooth', t:.55, v:.22}); this.noise({t:.5, v:.14, fc:1200, fc2:150}); break;
      case 'fire':     this.noise({t:1.1, v:.1, fc:700, fc2:250}); break;
      case 'whoosh':   this.noise({t:.35, v:.16, fc:500, fc2:3000}); break;
      /* v1.2 对话音效 */
      case 'type':     this.tone({f:1150, f2:880, type:'square', t:.03, v:.05}); break;
      case 'page':     this.noise({t:.13, v:.09, fc:2200, fc2:700}); break;
      case 'win':      [523, 659, 784, 1047].forEach((f,i)=> this.tone({f, type:'triangle', t:.32, v:.16, when:i*.13})); break;
      case 'lose':     [392, 330, 262, 196].forEach((f,i)=> this.tone({f, type:'sine', t:.4, v:.16, when:i*.24})); break;
    }
  },

  /* ---- 场景氛围乐 ---- */
  setMood(id){
    if(!this.started) return;
    const M = { 'screen-loading':'menu', 'screen-menu':'menu', 'screen-map':'map',
                'screen-battle':'battle', 'screen-camp':'camp', 'screen-event':'map',
                'screen-reward':'map', 'screen-select':'map', 'screen-saves':'menu', 'screen-over':'menu' };
    const mood = M[id] || 'map';
    if(mood === this.mood) return;
    this.mood = mood;
    this._stopMusic();
    this._droneBase(mood === 'battle' ? 98 : 110);
    const cfg = {
      menu:  { every:2600, chance:.75, full:true,  vol:.095, heart:0    },
      map:   { every:2100, chance:.7,  full:true,  vol:.1,   heart:0    },
      battle:{ every:2600, chance:.5,  full:false, vol:.085, heart:1200 },
      camp:  { every:1500, chance:.8,  full:true,  vol:.105, heart:0    }
    }[mood];
    this._timers.push(setInterval(()=>{
      if(!this.musicOn || document.hidden) return;
      if(Math.random() < cfg.chance){
        const notes = cfg.full ? this.SCALE : this.SCALE.slice(0, 5);
        const f = notes[ri(0, notes.length-1)];
        this.tone({f, type:'triangle', t:2.4, v:cfg.vol, attack:.6, dest:this.music});
        if(Math.random() < .3) this.tone({f:f*1.5, type:'sine', t:2, v:cfg.vol*.5, when:.2, attack:.8, dest:this.music});
      }
    }, cfg.every));
    if(cfg.heart) this._timers.push(setInterval(()=>{
      if(!this.musicOn || document.hidden) return;
      this.tone({f:55, f2:38, type:'sine', t:.22, v:.34, dest:this.music});
      this.tone({f:55, f2:38, type:'sine', t:.18, v:.24, when:.16, dest:this.music});
    }, cfg.heart));
  },

  _droneBase(f){
    [[f, 'sine', .07], [f*1.5, 'triangle', .04], [f*2.02, 'sine', .024]].forEach(([fr, tp, vv])=>{
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      const fl = this.ctx.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value = 340;
      o.type = tp; o.frequency.value = fr; o.detune.value = rand(-6, 6);
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(vv, this.ctx.currentTime + 2);
      o.connect(fl); fl.connect(g); g.connect(this.music);
      o.start();
      this._drone.push({o, g});
    });
  },

  _stopMusic(){
    this._timers.forEach(clearInterval);
    this._timers = [];
    if(!this.ctx) return;
    const now = this.ctx.currentTime;
    this._drone.forEach(({o, g})=>{ g.gain.linearRampToValueAtTime(0, now + 1.2); o.stop(now + 1.3) });
    this._drone = [];
  }
};
