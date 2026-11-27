/* ============ 基础工具 ============ */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a,b) => a + Math.random()*(b-a);
const ri = (a,b) => Math.floor(rand(a, b+1));
const pick = a => a[ri(0, a.length-1)];
const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
const shuffle = a => { for(let i=a.length-1;i>0;i--){ const j=ri(0,i); [a[i],a[j]]=[a[j],a[i]] } return a };

/* ---- 跨模块安全调用（顶层 const 不挂 window，禁止用 window.X 判断） ---- */
function S(name){ if(typeof AudioSys!=='undefined') AudioSys.sfx(name) }

/* ---- 防误触点按：滚动/拖动超过阈值则取消，抬手才生效 ---- */
function onTap(el, fn){
  let sx=0, sy=0, moved=false;
  el.addEventListener('pointerdown', e=>{ sx=e.clientX; sy=e.clientY; moved=false; });
  el.addEventListener('pointermove', e=>{ if(Math.hypot(e.clientX-sx, e.clientY-sy) > 12) moved=true; });
  el.addEventListener('pointercancel', ()=>{ moved=true; });
  el.addEventListener('pointerup', e=>{ if(!moved) fn(e); });
}

/* ============ 余烬粒子引擎 ============ */
const FX = {
  cv:null, ctx:null, ps:[], bursts:[], t:0,
  intensity:1, target:1, sprE:null, sprG:null, W:0, H:0,
  init(){
    this.cv = $('#fx'); this.ctx = this.cv.getContext('2d');
    const rs = () => { this.W = this.cv.width = innerWidth; this.H = this.cv.height = innerHeight; };
    rs(); addEventListener('resize', rs);
    this.sprE = this.mkSprite('255,140,60');
    this.sprG = this.mkSprite('232,190,90');
    for(let i=0;i<110;i++) this.ps.push(this.newP(true));
    const loop = t => { this.t = t/1000; this.draw(); requestAnimationFrame(loop) };
    requestAnimationFrame(loop);
  },
  mkSprite(rgb){
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0, `rgba(${rgb},.9)`); g.addColorStop(.4, `rgba(${rgb},.32)`); g.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = g; x.fillRect(0,0,64,64);
    return c;
  },
  newP(any){
    return { x0: rand(0, innerWidth), y: any ? rand(0, innerHeight) : innerHeight + rand(0,40),
      vy: rand(.25,.85), s: rand(7,22), ph: rand(0,6.28), sp: rand(.6,1.6), gold: Math.random()<.16 };
  },
  setIntensity(v){ this.target = v },
  burst(x,y,n){
    for(let i=0;i<n;i++){
      const a = rand(0,6.28), sp = rand(1,7);
      this.bursts.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - rand(0,2.5), s:rand(6,20), life:1, decay:rand(.012,.03), gold:Math.random()<.3 });
    }
  },
  draw(){
    const c = this.ctx;
    this.intensity += (this.target - this.intensity) * .04;
    c.clearRect(0,0,this.W,this.H);
    const n = Math.floor(110 * this.intensity);
    for(let i=0;i<n;i++){
      const p = this.ps[i];
      p.y -= p.vy; 
      const x = p.x0 + Math.sin(this.t*p.sp + p.ph) * 10;
      if(p.y < -24){ Object.assign(p, this.newP(false)); }
      const a = (.22 + .3*(.5 + .5*Math.sin(this.t*2 + p.ph))) * this.intensity;
      c.globalAlpha = Math.max(0, a);
      c.drawImage(p.gold ? this.sprG : this.sprE, x - p.s/2, p.y - p.s/2, p.s, p.s);
    }
    for(let i=this.bursts.length-1;i>=0;i--){
      const b = this.bursts[i];
      b.x += b.vx; b.y += b.vy; b.vx *= .96; b.vy = b.vy*.96 + .06; b.life -= b.decay;
      if(b.life <= 0){ this.bursts.splice(i,1); continue }
      c.globalAlpha = b.life * .9;
      c.drawImage(b.gold ? this.sprG : this.sprE, b.x - b.s/2, b.y - b.s/2, b.s*b.life, b.s*b.life);
    }
    c.globalAlpha = 1;
  }
};

/* ============ UI 组件 ============ */
const UI = {
  _tt:null, lastScreen:'screen-menu',
  toast(msg){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(this._tt);
    this._tt = setTimeout(()=> t.classList.remove('show'), 2100);
  },
  float(x,y,txt,cls=''){
    const el = document.createElement('div');
    el.className = 'fmsg ' + cls;
    el.textContent = txt;
    el.style.left = (x + rand(-14,14)) + 'px';
    el.style.top  = (y + rand(-10,10)) + 'px';
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 1000);
  },
  shake(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake') },
  slash(x,y,big=false){
    const el = document.createElement('div');
    el.className = 'slash' + (big ? ' big' : '');
    el.style.left = (x-70)+'px'; el.style.top = (y-70)+'px';
    el.style.transform = `rotate(${ri(-40,25)}deg)`;
    el.innerHTML = `<svg viewBox="0 0 140 140"><path d="M20 110 C50 70 80 50 122 28" pathLength="1"/><path d="M34 120 C62 88 96 66 126 48" pathLength="1"/></svg>`;
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 480);
  },
  async banner(txt){
    const b = $('#banner');
    b.querySelector('.b-txt').textContent = txt;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    await sleep(1150);
    b.classList.remove('show');
    await sleep(160);
  },
  async wipe(swap){
    if(typeof AudioSys!=='undefined') AudioSys.sfx('whoosh');
    const w = $('#wipe');
    w.classList.remove('out'); w.classList.add('on','in');
    await sleep(470);
    swap();
    await sleep(70);
    w.classList.remove('in'); w.classList.add('out');
    await sleep(520);
    w.classList.remove('on','out');
  },
  show(id){
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
const INTENS = { 'screen-loading':2, 'screen-menu':1.5, 'screen-map':1, 'screen-battle':.55,
                     'screen-reward':.8, 'screen-camp':.95, 'screen-select':.8, 'screen-over':1.9,
                     'screen-event':.9, 'screen-saves':.7 };

    FX.setIntensity(INTENS[id] || 1);
    this.lastScreen = id;
    if(typeof AudioSys!=='undefined') AudioSys.setMood(id);
  }
};
// 按钮涟漪 + 统一点击音（全局委托）
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.btn');
  if(!b) return;
  S('click');
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2;
  const i = document.createElement('i');
  i.className = 'ripple';
  i.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;
  b.appendChild(i);
  setTimeout(()=> i.remove(), 650);
});

/* ============ 加载器 ============ */
const Loader = {
  async run(){
    const tips = ['点燃第一簇火…','磨利手中的铁…','辨认烬中的路标…'];
    const tipEl = $('#loadTip'), bar = $('#loadBar i');
    let ti = 0;
    tipEl.classList.add('show');
    const tt = setInterval(()=>{
      tipEl.classList.remove('show');
      setTimeout(()=>{ ti=(ti+1)%tips.length; tipEl.textContent=tips[ti]; tipEl.classList.add('show') }, 240);
    }, 1600);
    let p = 0, done = false;
    const t0 = performance.now();
    Promise.race([ document.fonts ? document.fonts.ready : Promise.resolve(), sleep(3200) ]).then(()=> done = true);
    await new Promise(res=>{
      const step = t => {
        const floor = Math.min(.9, (t - t0) / 2300 * .9);
        p = Math.max(p, done ? Math.min(floor + (t-t0)/2300*.2, 1) : floor);
        bar.style.width = (p*100) + '%';
        p >= 1 ? res() : requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    clearInterval(tt);
    await sleep(260);
    $('#screen-loading').classList.add('done');
    await sleep(620);
    $('#screen-loading').classList.remove('active','done');
  }
};

// 数字滚动
function countUp(el, to, dur=800){
  const t0 = performance.now();
  const f = t => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1-k, 3);
    el.textContent = Math.round(to * e);
    if(k < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}
