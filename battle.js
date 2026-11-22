/* ============ 战斗核心（音效助手 S 定义于 ui.js） ============ */
function unitCenter(sel){
  const r = $(sel).querySelector('.bwrap').getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height*.42 };
}
function chips(o){
  let s = '';
  if(o.str  > 0) s += `<span class="chip c-gold">${Icon.get('up')}<b>${o.str}</b></span>`;
  if(o.vuln > 0) s += `<span class="chip c-red">${Icon.get('target')}<b>${o.vuln}</b></span>`;
  if(o.weak > 0) s += `<span class="chip c-cyan">${Icon.get('down')}<b>${o.weak}</b></span>`;
  return s;
}
function intentHTML(m){
  const g = Battle.g;
  let ic = '';
  if(m.t === 'attack'){
    ic = `<span class="it-a">${Icon.get('sword')}<b>${calcDmg(m.dmg, g.enemy.weak>0, g.vuln>0)}${m.hits>1 ? '×'+m.hits : ''}</b></span>`;
    if(m.block) ic += `<span class="it-b">${Icon.get('shield')}<b>${m.block}</b></span>`;
  }
  else if(m.t === 'block') ic = `<span class="it-b">${Icon.get('shield')}<b>${m.n}</b></span>`;
  else if(m.t === 'charge') ic = `<span class="it-c">${Icon.get('hourglass')}</span>`;
  else if(m.t === 'weak') ic = `<span class="it-d">${Icon.get('down')}<b>${m.n}</b></span>`;
  return `<div class="it-ic">${ic}</div><div class="it-name">${m.name}</div>`;
}
function flyClone(fromEl, to, mode){
  const card = fromEl.querySelector('.card');
  const r = card.getBoundingClientRect();
  const cl = card.cloneNode(true);
  cl.classList.add('fly-card');
  Object.assign(cl.style, { position:'fixed', left:r.left+'px', top:r.top+'px', width:r.width+'px', height:r.height+'px',
    margin:0, transition:'all .38s cubic-bezier(.5,0,.4,1)' });
  document.body.appendChild(cl);
  requestAnimationFrame(()=>{
    Object.assign(cl.style, {
      left:(to.x - r.width/2)+'px', top:(to.y - r.height/2)+'px',
      transform: mode==='burn' ? 'translateY(-14vh) scale(.5)' : 'scale(.45) rotate(6deg)',
      opacity:0
    });
  });
  setTimeout(()=> cl.remove(), 420);
}

const Battle = {
  g:null,

  async start(kind){
    const st = Game.state;
    const def = kind === 'boss' ? ENEMIES.boss : pick([ENEMIES.crow, ENEMIES.golem, ENEMIES.shade]);
    this.g = {
      kind, floor: MapSys.floor(), def,
      enemy: { def, hp:def.hp, maxHp:def.hp, block:0, vuln:0, weak:0, turn:0, pending:def.move(0) },
      hp: st.hp, maxHp: st.maxHp,
      energy:3, maxE:3, block:0, vuln:0, weak:0, tmpStr:0,
      hand:[], discard:[], draw: shuffle(st.deck.map(c => ({...c}))),
      turn:0, busy:true, sel:null, stats:{ dmg:0 }
    };
    this._pA = this._pE = undefined;
    this.renderStatic();
    UI.show('screen-battle');
    await sleep(850);
    UI.banner(kind === 'boss' ? '守烬者 拦于途尽' : '遭遇 · ' + def.name);
    await sleep(1150);
    this.startPlayerTurn();
  },

  renderStatic(){
    const g = this.g;
    $('#btFloor').textContent = `烬径 · 第 ${g.floor} 层`;
    const au = $('#allyUnit'), eu = $('#enemyUnit');
    au.className = 'unit ally'; eu.className = 'unit enemy';
    au.innerHTML = this.npHTML('执烬者', false) + `<div class="bwrap">${BODIES.hero}</div>`;
    eu.innerHTML = this.npHTML(g.enemy.def.name, true) +
      `<div class="bwrap">${BODIES[g.enemy.def.body]}</div>`;
    if(g.enemy.def.boss) eu.querySelector('.bwrap').style.width = 'clamp(180px,42vh,380px)';
    $('#hand').innerHTML = '';
    $('#battleField').classList.remove('tg-e','tg-a');
    $('#targetTip').classList.remove('show');
    this.updateAll(); this.renderHand();
  },

  npHTML(name, withIntent){
    return `<div class="np">
      ${withIntent ? '<div class="intent"></div>' : ''}
      <div class="np-name">${name}</div>
      <div class="np-hp">${Icon.get('heart')}<div class="hpbar"><i></i></div><span class="hpnum"></span></div>
      <div class="np-x"><span class="blk">${Icon.get('shield')}<b>0</b></span><span class="buffs"></span></div>
    </div>`;
  },

  setHp(el, cur, max, prevRef){
    const i = el.querySelector('.hpbar i');
    el.querySelector('.hpnum').textContent = `${cur}/${max}`;
    i.style.width = Math.max(0, cur/max*100) + '%';
    if(prevRef.v !== undefined && cur < prevRef.v){
      i.classList.remove('hurt'); void i.offsetWidth; i.classList.add('hurt');
    }
    prevRef.v = cur;
  },

  updateAll(){
    const g = this.g;
    const au = $('#allyUnit'), eu = $('#enemyUnit');
    this.setHp(au, g.hp, g.maxHp, this._pA ||= {});
    this.setHp(eu, g.enemy.hp, g.enemy.maxHp, this._pE ||= {});
    const ab = au.querySelector('.blk');
    ab.classList.toggle('on', g.block > 0);
    ab.querySelector('b').textContent = g.block;
    const eb = eu.querySelector('.blk');
    eb.classList.toggle('on', g.enemy.block > 0);
    eb.querySelector('b').textContent = g.enemy.block;
    au.querySelector('.buffs').innerHTML = chips({ str:g.tmpStr, vuln:g.vuln, weak:g.weak });
    eu.querySelector('.buffs').innerHTML = chips({ str:0, vuln:g.enemy.vuln, weak:g.enemy.weak });
    const m = g.enemy.pending;
    eu.querySelector('.intent').innerHTML = m ? intentHTML(m) : '';
    $('#eCur').textContent = g.energy;
    $('#nDraw').textContent = g.draw.length;
    $('#nDisc').textContent = g.discard.length;
  },

  cw(){ return Math.min(Math.max(78, innerHeight*.165), 126) },

  renderHand(){
    const hand = $('#hand'), n = this.g.hand.length;
    const hw = Math.max(0, hand.clientWidth - this.cw());
    const gap = n > 1 ? Math.min(this.cw()*.62, hw/(n-1)) : 0;
    [...hand.children].forEach(el => {
      if(!el.dataset.uid) return;
      const idx = this.g.hand.findIndex(c => c.uid == el.dataset.uid);
      if(idx < 0){ el.remove(); return }
      const c = this.g.hand[idx], mid = idx - (n-1)/2;
      el.style.zIndex = this.g.sel === c.uid ? 60 : 10 + idx;
      el.style.transform = `translate(calc(-50% + ${mid*gap}px), ${Math.abs(mid)*6}px) rotate(${mid*3}deg)`;
      el.querySelector('.card').classList.toggle('sel', this.g.sel === c.uid);
    });
  },

  addHandEls(){
    const hand = $('#hand');
    this.g.hand.forEach((c, i) => {
      if(hand.querySelector(`[data-uid="${c.uid}"]`)) return;
      const w = document.createElement('div');
      w.className = 'hcard deal'; w.dataset.uid = c.uid;
      const el = cardEl(c); el.style.animationDelay = (i*70)+'ms';
      w.appendChild(el);
      w.addEventListener('pointerdown', e => { e.stopPropagation(); this.onCardClick(c) });
      hand.appendChild(w);
    });
  },

  tip(t){
    const el = $('#targetTip');
    if(t){ el.textContent = t; el.classList.add('show') } else el.classList.remove('show');
  },

  onCardClick(c){
    const g = this.g;
    if(g.busy) return;
    const d = CARDS[c.key];
    if(g.sel === c.uid){ g.sel = null; this.renderHand(); this.tip(''); this.fieldCls(''); return }
    if(g.energy < d.cost){
      const o = $('#eOrb');
      o.classList.remove('nope'); void o.offsetWidth; o.classList.add('nope');
      S('orb');
      UI.toast('能量不足'); return;
    }
    g.sel = c.uid;
    S('card');
    this.renderHand();
    if(d.type === 'attack'){ this.tip('点按敌人出牌'); this.fieldCls('tg-e') }
    else { this.tip('点按自己出牌'); this.fieldCls('tg-a') }
  },
  fieldCls(c){
    const f = $('#battleField');
    f.classList.remove('tg-e','tg-a');
    if(c) f.classList.add(c);
  },

  async playCard(c){
    const g = this.g, d = CARDS[c.key];
    if(g.busy || g.sel !== c.uid) return;
    g.busy = true; g.sel = null;
    this.tip(''); this.fieldCls('');
    g.energy -= d.cost;
    const idx = g.hand.indexOf(c);
    g.hand.splice(idx, 1);
    const w = $(`#hand [data-uid="${c.uid}"]`);
    const target = d.type === 'attack' ? unitCenter('#enemyUnit') : unitCenter('#allyUnit');
    if(w){ flyClone(w, target, d.exhaust ? 'burn' : 'hit'); w.remove() }
    const o = $('#eOrb');
    o.classList.remove('pop'); void o.offsetWidth; o.classList.add('pop');
    S('cardplay');
    this.renderHand(); this.updateAll();
    await sleep(150);
    await d.play(this, c);
    if(!d.exhaust) g.discard.push(c);
    this.updateAll();
    if(g.enemy.hp <= 0){ await this.winSequence(); return }
    g.busy = false;
  },

  /* ---- 卡牌效果上下文 ---- */
  async damage(n, hits=1){
    const g = this.g;
    for(let k=0; k<hits; k++){
      if(g.enemy.hp <= 0) break;
      const d = calcDmg(n + g.tmpStr, g.weak > 0, g.enemy.vuln > 0);
      const ab = Math.min(g.enemy.block, d);
      g.enemy.block -= ab;
      const real = d - ab;
      g.enemy.hp = Math.max(0, g.enemy.hp - real);
      g.stats.dmg += real;
      const p = unitCenter('#enemyUnit');
      UI.slash(p.x, p.y, real >= 10);
      S('slash');
      UI.float(p.x, p.y - 26, '-' + d, ab >= d ? 'f-block' : (real >= 10 ? 'f-dmg f-big' : 'f-dmg'));
      if(real > 0){
        S('hit');
        const eu = $('#enemyUnit');
        eu.classList.remove('hit'); void eu.offsetWidth; eu.classList.add('hit');
        UI.shake($('#battleField'));
      } else {
        S('block');
        const eu = $('#enemyUnit');
        eu.classList.remove('blk-hit'); void eu.offsetWidth; eu.classList.add('blk-hit');
      }
      FX.burst(p.x, p.y, 6);
      this.updateAll();
      await sleep(k < hits-1 ? 180 : 130);
    }
  },
  async block(n){
    const g = this.g;
    g.block += n;
    S('block');
    const p = unitCenter('#allyUnit');
    UI.float(p.x, p.y - 20, '+' + n, 'f-block');
    const au = $('#allyUnit');
    au.classList.remove('blk-hit'); void au.offsetWidth; au.classList.add('blk-hit');
    this.updateAll();
    await sleep(160);
  },
  async vuln(n){
    const g = this.g;
    g.enemy.vuln += n;
    S('debuff');
    const p = unitCenter('#enemyUnit');
    UI.float(p.x, p.y, '易伤 +' + n, 'f-debuff');
    this.updateAll();
    await sleep(140);
  },
  async weak(n){
    const g = this.g;
    g.enemy.weak += n;
    S('debuff');
    const p = unitCenter('#enemyUnit');
    UI.float(p.x, p.y, '虚弱 +' + n, 'f-debuff');
    this.updateAll();
    await sleep(140);
  },
  async draw(n){
    const g = this.g;
    for(let k=0; k<n; k++){
      if(!g.draw.length){
        if(!g.discard.length) break;
        g.draw = shuffle(g.discard.splice(0));
        S('shuffle');
        const r = $('#pileDraw').getBoundingClientRect();
        UI.float(r.left + r.width/2, r.top, '洗牌', 'f-note');
      }
      if(g.hand.length >= 9) break;
      g.hand.push(g.draw.shift());
      S('draw');
      this.addHandEls(); this.renderHand(); this.updateAll();
      await sleep(95);
    }
  },
  async loseHp(n){
    const g = this.g;
    g.hp = Math.max(1, g.hp - n);
    S('hurt');
    const p = unitCenter('#allyUnit');
    UI.float(p.x, p.y - 20, '-' + n, 'f-hurt');
    const au = $('#allyUnit');
    au.classList.remove('hit'); void au.offsetWidth; au.classList.add('hit');
    this.updateAll();
    await sleep(160);
  },

  /* ---- 回合流程 ---- */
  async startPlayerTurn(){
    const g = this.g;
    g.block = 0;
    g.energy = g.maxE;
    this.updateAll();
    if(g.turn > 0) await UI.banner('你的回合');
    g.turn++;
    $('#endTurnBtn').classList.remove('dim');
    await this.draw(5);
    g.busy = false;
  },

  async endTurn(){
    const g = this.g;
    if(g.busy) return;
    g.busy = true;
    g.sel = null; this.tip(''); this.fieldCls('');
    g.discard.push(...g.hand.splice(0));
    this.renderHand();
    g.tmpStr = 0;
    g.vuln = Math.max(0, g.vuln-1);
    g.weak = Math.max(0, g.weak-1);
    $('#endTurnBtn').classList.add('dim');
    await sleep(280);
    await UI.banner('敌方回合');
    const e = g.enemy, m = e.pending;
    e.block = 0;
    if(m.t === 'attack') await this.enemyAttack(m);
    else if(m.t === 'block'){
      e.block += m.n;
      S('block');
      const p = unitCenter('#enemyUnit');
      UI.float(p.x, p.y - 16, '+' + m.n, 'f-block');
      const eu = $('#enemyUnit');
      eu.classList.remove('blk-hit'); void eu.offsetWidth; eu.classList.add('blk-hit');
    }
    else if(m.t === 'weak'){
      g.weak += m.n;
      S('debuff');
      const p = unitCenter('#allyUnit');
      UI.float(p.x, p.y, '虚弱 +' + m.n, 'f-debuff');
    }
    else if(m.t === 'charge'){
      S('charge');
      const bw = $('#enemyUnit .bwrap');
      bw.classList.add('charging');
      await UI.banner('它正在积蓄力量…');
      bw.classList.remove('charging');
    }
    this.updateAll();
    if(g.hp <= 0){ await this.loseSequence(); return }
    await sleep(320);
    e.turn++;
    e.vuln = Math.max(0, e.vuln-1);
    e.weak = Math.max(0, e.weak-1);
    e.pending = e.def.move(e.turn);
    this.updateAll();
    await this.startPlayerTurn();
  },

  async enemyAttack(m){
    const e = this.g.enemy;
    const bw = $('#enemyUnit .bwrap');
    bw.classList.add('lunge');
    await sleep(250);
    for(let k=0; k<(m.hits||1); k++){
      const d = calcDmg(m.dmg, e.weak > 0, this.g.vuln > 0);
      const ab = Math.min(this.g.block, d);
      this.g.block -= ab;
      const real = d - ab;
      this.g.hp = Math.max(0, this.g.hp - real);
      const p = unitCenter('#allyUnit');
      UI.slash(p.x, p.y, real >= 10);
      S('slash');
      UI.float(p.x, p.y - 26, '-' + d, ab >= d ? 'f-block' : 'f-hurt');
      if(real > 0){
        S('hit');
        const au = $('#allyUnit');
        au.classList.remove('hit'); void au.offsetWidth; au.classList.add('hit');
        UI.shake($('#battleField'));
        FX.burst(p.x, p.y, 5);
      } else {
        S('block');
      }
      this.updateAll();
      await sleep(210);
    }
    bw.classList.remove('lunge');
  },

  async winSequence(){
    const g = this.g;
    g.busy = true;
    const p = unitCenter('#enemyUnit');
    $('#enemyUnit').classList.add('die');
    S('die');
    FX.burst(p.x, p.y, g.enemy.def.boss ? 80 : 36);
    UI.shake($('#battleField'));
    await sleep(1150);
    const st = Game.state;
    st.hp = g.hp; st.kills++; st.dmgTotal += g.stats.dmg;
    const boss = g.kind === 'boss';
    await UI.wipe(()=> boss ? Screens.over(true) : Screens.reward());
  },

  async loseSequence(){
    const g = this.g;
    g.busy = true;
    $('#allyUnit').classList.add('die');
    S('die');
    await UI.banner('你倒下了…');
    await sleep(500);
    await UI.wipe(()=> Screens.over(false));
  }
};
