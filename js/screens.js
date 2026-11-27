/* ============ 卡牌元素渲染（各屏共用） ============ */
function cardEl(c, cls=''){
  const d = CARDS[c.key];
  const el = document.createElement('div');
  const costCls = d.cost === 0 ? 'cost0' : (d.cost >= 2 ? 'cost2' : 'cost1');
  el.className = `card r-${d.rarity} t-${d.type} ${c.up ? 'up' : ''} ${cls}`;
  // 场景插画按卡牌 key 索引（与 SCENES 定义一致）
  const art = (typeof SCENES !== 'undefined' && SCENES[c.key])
    ? `<svg class="scene" viewBox="0 0 60 40">${SCENES[c.key]}</svg>`
    : Icon.get(d.icon);
  el.innerHTML = `
    <div class="c-cost ${costCls}"><b>${d.cost}</b></div>
    <div class="c-name">${d.name}${c.up ? '+' : ''}</div>
    <div class="c-art">${art}</div>
    <div class="c-desc">${d.desc(c)}</div>
    ${d.exhaust ? '<div class="c-tag">消耗</div>' : ''}
    ${c.up ? '<div class="c-up">强化</div>' : ''}`;
  return el;
}

/* ============ 各屏幕 ============ */
const Screens = {

  /* ---- 奖励 ---- */
async reward(){ const st = Game.state; 
                const hasR = id => st.relics.includes(id); 
                const kind = Battle.kind || 'fight'; 
                let relic = null; if(kind === 'elite'){ relic = Relics.pick('regular');
                st.relics.push(relic.id); } const gold = Math.round(ri(22, 44) * (hasR('beads') ? 1.4 : 1)); 
                st.gold += gold;
    const picks = shuffle(POOL.slice()).slice(0,3).map(k => ({ key:k, uid:UID++, up:false }));
    $('#screen-reward').innerHTML = `
      <div class="scr-narrow">
        <h2 class="rn-title">战 利 品</h2>
        <div class="rn-gold">${Icon.get('coin')}<b id="goldNum">0</b><span>余烬金币</span></div> ${relic ? `<div class="rn-relic"><span class="rr-ic">${Icon.get(relic.icon)}</span><div class="rr-txt"><b>遗物 · ${relic.name}</b><span>${relic.desc}</span></div></div>` : ''}
        <p class="rn-hint">拾取一张战利品，纳入行囊</p>
        <div class="rn-cards" id="rnCards"></div>
        <button class="btn ghost" id="rnSkip">放　弃</button>
      </div>`;
    UI.show('screen-reward');
    S('coin'); if(relic){ UI.banner('获得遗物 · ' + relic.name); S('buff'); }
    countUp($('#goldNum'), gold, 900);
    const rc = $('#rnCards');
    picks.forEach((c, i) => {
      const el = cardEl(c, 'rn-card pop');
      el.style.animationDelay = (260 + i*100) + 'ms';
      onTap(el, ()=>{
        S('card');
        st.deck.push(c);
        UI.toast('习得 · ' + CARDS[c.key].name);
        MapSys.finish();
      });
      rc.appendChild(el);
    });
    $('#rnSkip').addEventListener('pointerdown', ()=> MapSys.finish());
  },

  /* ---- 篝火 ---- */
  camp(){
    const st = Game.state;
    const heal = Math.ceil(st.maxHp * .3);
    $('#screen-camp').innerHTML = `
      <div class="scr-narrow">
        <div class="rn-mark">${Icon.mark(72)}</div>
        <h2 class="rn-title">篝　火</h2>
        <p class="rn-sub">火光摇曳 · 灰烬温热</p>
        <div class="camp-opts">
          <div class="camp-opt" data-a="rest">
            ${Icon.get('camp')}<h3>休　息</h3><p>恢复 ${heal} 点生命</p>
          </div>
          <div class="camp-opt" data-a="forge">
            ${Icon.get('hammer')}<h3>锻　造</h3><p>强化一张牌</p>
          </div>
        </div>
      </div>`;
    UI.show('screen-camp');
    S('fire');
    $$('#screen-camp .camp-opt').forEach(el => {
      el.addEventListener('pointerdown', async ()=>{
        if(el.dataset.a === 'rest'){
          st.hp = Math.min(st.maxHp, st.hp + heal);
          S('heal');
          UI.toast('火光疗愈了伤口（+' + heal + '）');
          MapSys.finish();
        } else {
          const forgeable = st.deck.filter(c => !c.up);
          if(!forgeable.length){
            UI.toast('牌组皆已锻造至极致 · 只能休息了');
            return;
          }
          S('click');
          this.select({
            title: '锻　造',
            cards: forgeable,
            onPick: c => this.forgePreview(c), onCancel: () => this.camp() });
        }
      });
    });
  },

  /* ---- 通用选卡 ---- */
  select({ title, cards, onPick, onCancel }){
    const el = $('#screen-select');
    el.innerHTML = `
      <div class="scr-wide">
        <h2 class="rn-title">${title}</h2>
        <p class="rn-hint">点选一张牌</p>
        <div class="sel-grid" id="selGrid"></div>
        ${onCancel ? '<button class="btn ghost" id="selCancel">返　回</button>' : ''}
      </div>`;
    UI.show('screen-select');
    const grid = $('#selGrid');
    cards.forEach((c, i) => {
      const el2 = cardEl(c, 'sel-card pop');
      el2.style.animationDelay = (i*35) + 'ms';
      onTap(el2, ()=> onPick(c));
      grid.appendChild(el2);
    });
    if(onCancel) $('#selCancel').addEventListener('pointerdown', onCancel);
  },

  /* ---- 查看牌堆 ---- */
  vault(title, cards){
    const el = $('#vault');
    el.classList.add('show');
    el.innerHTML = `
      <div class="vm-box">
        <header><b>${title}</b><span>${cards.length} 张</span>
          <button class="btn ghost sm" id="vmClose">关 闭</button></header>
        <div class="vm-grid" id="vmGrid"></div>
      </div>`;
    const grid = $('#vmGrid');
    cards.forEach(c => grid.appendChild(cardEl(c)));
    $('#vmClose').addEventListener('pointerdown', closeVault);
    el.addEventListener('pointerdown', e => { if(e.target === el) closeVault() });
    function closeVault(){ el.classList.remove('show'); el.innerHTML = '' }
  },

  /* ---- 结算 ---- */
  over(win){ 
    const st = Game.state; let trophy = null; if(win && Battle.kind === 'boss'){ trophy = Relics.pick('rare'); st.relics.push(trophy.id); }
    $('#screen-over').innerHTML = `
      <div class="scr-narrow">
        <div class="ov-mark ${win ? 'win' : 'lose'}">${Icon.mark(90)}</div>
        <h1 class="ov-title ${win ? '' : 'lose'}">${win ? '远征功成' : '旅途终结'}</h1>
        <p class="ov-sub">${win ? '你守住了灰烬中的最后一点火。' : '火熄灭了。但灰烬之下，总有火星残存。'}</p> ${trophy ? `<div class="rn-relic ov-relic"><span class="rr-ic">${Icon.get(trophy.icon)}</span><div class="rr-txt"><b>稀有遗物 · ${trophy.name}</b><span>${trophy.desc}</span></div></div>` : ''}
        <div class="ov-stats" id="ovStats"></div>
        <button class="btn primary" id="ovBack">重　燃</button>
      </div>`;
    UI.show('screen-over');
    S(win ? 'win' : 'lose');
    SaveSys.clear('auto');          // 通关/死亡后自动存档作废
    Game.state = null;              // 主菜单"继续旅途"随之隐藏

    if(win){
      setTimeout(()=> FX.burst(innerWidth/2, innerHeight*.38, 70), 300);
      setTimeout(()=> FX.burst(innerWidth/2, innerHeight*.3, 50), 700);
    }
    const rows = [
      ['行进层数', MapSys.floor()], ['斩杀敌手', st.kills],
      ['累计伤害', st.dmgTotal], ['余烬金币', st.gold]
    ];
    const box = $('#ovStats');
    rows.forEach(([k, v], i) => {
      const d = document.createElement('div');
      d.className = 'ov-stat';
      d.style.animationDelay = (200 + i*90) + 'ms';
      d.innerHTML = `<b>0</b><span>${k}</span>`;
      box.appendChild(d);
      countUp(d.querySelector('b'), v, 900);
    });
    $('#ovBack').addEventListener('pointerdown', ()=> Game.toMenu()); }, /* ---- 锻造确认预览 ---- */
forgePreview(c){
  const el = document.createElement('div');
  el.className = 'relic-bag';
  el.innerHTML = `
    <div class="pm-box forge-box">
      <h3>锻 造 · 确 认</h3>
      <div class="forge-cmp">
        <div class="forge-side"><div class="forge-lab">强 化 前</div><div id="fB"></div></div>
        <div class="forge-arrow">→</div>
        <div class="forge-side"><div class="forge-lab">强 化 后</div><div id="fA"></div></div>
      </div>
      <div class="pm-row">
        <button class="btn ghost" id="fNo">取 消</button>
        <button class="btn primary" id="fYes">确 认 强 化</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  S('card');
  $('#fB').appendChild(cardEl({ key:c.key, uid:c.uid, up:false }));
  $('#fA').appendChild(cardEl({ key:c.key, uid:c.uid, up:true }));
  $('#fNo').addEventListener('pointerdown', ()=>{
    S('click'); el.remove();
    this.select({ title:'锻 造', cards: Game.state.deck.filter(x=>!x.up), onPick: cc => this.forgePreview(cc), onCancel: ()=> this.camp() });
  });
  $('#fYes').addEventListener('pointerdown', ()=>{
    c.up = true; S('buff'); el.remove();
    UI.toast('强化 · ' + CARDS[c.key].name + '+');
    MapSys.finish();
  });
},
/* ===== v1.5 图鉴 ===== */
codex(){
  const FOE_NOTES = {
    crow:'荒径的拾荒者，啄击与尖啸交替而来，弱小却阴魂不散。',
    golem:'行走的山石，以岩击筑甲自护，碾碎一切挡路之人。',
    shade:'灰烬之下的暗影，双蛰蚀体，悄悄夺走你的力量。',
    overlord:'旧军团的残魂统帅，天生披甲，督罚从不留情。',
    spider:'喉藏毒网的猎手，织网布下易伤，再伺机穿喉。',
    magma:'地火凝成的巨兽，蓄能一息之后，熔核重锤山石俱焚。',
    boss:'烬径尽头的守门人。重锤、烬甲、蓄爆、烬爆——循环有律，破绽亦在其中。'
  };
  const st = Game.state || {};
  const el = document.createElement('div');
  el.className = 'cx-wrap';
  el.innerHTML = `
    <div class="cx-box">
      <div class="cx-head">
        <div class="cx-title">图 鉴</div>
        <button class="btn ghost sm" id="cxClose">关 闭</button>
      </div>
      <div class="cx-tabs">
        <button class="btn ghost sm cx-tab" data-t="cards">卡 牌</button>
        <button class="btn ghost sm cx-tab" data-t="relics">遗 物</button>
        <button class="btn ghost sm cx-tab" data-t="foes">敌 人</button>
      </div>
      <div class="cx-body" id="cxBody"></div>
    </div>`;
  document.body.appendChild(el);
  S('click');
  cxNote(Game.state);
  const body = el.querySelector('#cxBody');
  let tab = 'cards';
  const ups = new Set();
  el.querySelector('#cxClose').addEventListener('pointerdown', () => { S('click'); el.remove(); });
  el.addEventListener('pointerdown', e => { if(e.target === el){ S('click'); el.remove(); } });
  const render = () => {
    el.querySelectorAll('.cx-tab').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    const keep = body.scrollTop;
    if(tab === 'cards'){
      const deck = st.deck || [];
      body.innerHTML = `<div class="cx-hint">共 ${Object.keys(CARDS).length} 张 · 点按卡牌可预览强化后形态</div><div class="cx-grid cx-cards"></div>`;
      const grid = body.querySelector('.cx-grid');
      const seenC = cxLoad();
      Object.keys(CARDS).forEach(k => {
        const n = deck.filter(c => c.key === k).length;
        const know = n > 0 || seenC.cards.includes(k);
        const cell = document.createElement('div');
        cell.className = 'cx-card';
        if(know){
          cell.innerHTML = `<div class="cx-slot"></div><div class="cx-cap${n ? '' : ' dim'}">${n ? '牌组 ×' + n : '已解锁'}</div>`;
          cell.querySelector('.cx-slot').appendChild(cardEl({ key:k, uid:0, up:ups.has(k) }));
          cell.addEventListener('pointerdown', () => { S('click'); ups.has(k) ? ups.delete(k) : ups.add(k); render(); });
        } else {
          cell.innerHTML = `<div class="cx-slot cx-slot-q">?</div><div class="cx-cap dim">尚未获得</div>`;
        }
        grid.appendChild(cell);
      });
} else if(tab === 'relics'){
  const owned = st.relics || [];
  const seenR = cxLoad();
  body.innerHTML = `<div class="cx-hint">共 ${Object.keys(Relics.pool.all).length} 件 · 灰暗者为尚未获得</div><div class="cx-grid cx-relics"></div>`;
  const grid = body.querySelector('.cx-grid');
  Object.keys(Relics.pool.all).forEach(id => {
    const r = Relics.pool.all[id], has = owned.includes(id) || seenR.relics.includes(id);
    const cell = document.createElement('div');
    cell.className = 'cx-relic' + (has ? '' : ' cx-locked');
    cell.innerHTML = has
      ? `<div class="cx-r-ic">${Icon.get(r.icon)}</div><b>${r.name}</b><span>${r.desc}</span>`
      : `<div class="cx-r-ic cx-q">?</div><span class="cx-unk">尚未获得</span>`;
    grid.appendChild(cell);
  });
} else {
  body.innerHTML = `<div class="cx-hint">击败敌人后解锁档案——未遭遇者，只余一个谜</div><div class="cx-grid cx-foes"></div>`;
      const grid = body.querySelector('.cx-grid');
      const seenF = cxLoad();
      ['crow','golem','shade','overlord','spider','magma','boss'].forEach(k => {
        const e = ENEMIES[k];
        const cell = document.createElement('div');
        cell.className = 'cx-foe';
        if(seenF.foes.includes(k)){
          const tag = e.boss ? '守关' : (e.elite ? '精英' : '寻常');
          cell.innerHTML = `<div class="cx-f-body"><div class="bwrap">${BODIES[e.body]}</div></div>
            <div class="cx-f-info">
              <div class="cx-f-name">${e.name}<i class="cx-tag ${e.boss ? 'tg-boss' : e.elite ? 'tg-elite' : 'tg-norm'}">${tag}</i></div>
              <div class="cx-f-hp">${Icon.get('heart')} 生命 ${e.hp}</div>
              <div class="cx-f-desc">${FOE_NOTES[k]}</div>
            </div>`;
        } else {
          cell.innerHTML = `<div class="cx-f-body cx-f-q">?</div>
            <div class="cx-f-info">
              <div class="cx-f-name" style="color:var(--faint,#9a8f80)">？？？？？</div>
              <div class="cx-f-desc">尚未遭遇 · 击败后解锁档案</div>
            </div>`;
        }
        grid.appendChild(cell);
      });
    }
    body.scrollTop = keep;
  };
  el.querySelectorAll('.cx-tab').forEach(b => b.addEventListener('pointerdown', () => { tab = b.dataset.t; S('click'); render(); }));
  render();
},
relicBag(){
const st = Game.state; if(!st) return; const el = document.createElement('div'); el.className = 'relic-bag'; const list = st.relics.length ? st.relics.map(id => Relics.get(id)).filter(Boolean).map(r => `<div class="rn-relic"><span class="rr-ic">${Icon.get(r.icon)}</span><div class="rr-txt"><b>${r.name}</b><span>${r.desc}</span></div></div>`).join('') : '<p class="rn-hint">行囊空空 —— 尚未获得任何遗物</p>'; el.innerHTML = ` <div class="pm-box"> <h3>行 囊 · 遗 物</h3> <div class="rr-list">${list}</div> <div class="pm-row"><button class="btn ghost" id="rbClose">关 闭</button></div> </div>`; document.body.appendChild(el); S('page'); $('#rbClose').addEventListener('pointerdown', ()=> el.remove()); el.addEventListener('pointerdown', e => { if(e.target === el) el.remove() }); 
                                                                                   } 
};
/* ===== v1.5 图鉴按钮接线 ===== */
(function(){
  const wire = () => {
    const b = document.getElementById('btnCodex');
    if(b && !b._codexBound){ b._codexBound = 1; b.addEventListener('pointerdown', () => Screens.codex()); }
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
/* ===== v1.5.1 收藏册（永久解锁记录）===== */
const CXKEY = 'ember_codex_v1';
function cxLoad(){ try{ const d = JSON.parse(localStorage.getItem(CXKEY)); return d && d.cards && d.relics && d.foes ? d : {cards:[],relics:[],foes:[]}; }catch(e){ return {cards:[],relics:[],foes:[]}; } }
function cxSave(d){ try{ localStorage.setItem(CXKEY, JSON.stringify(d)); }catch(e){} }
function cxNote(st, foe){ if(!st) return; const d = cxLoad(); let ch = false; (st.relics||[]).forEach(id => { if(!d.relics.includes(id)){ d.relics.push(id); ch = true; } }); (st.deck||[]).forEach(c => { if(!d.cards.includes(c.key)){ d.cards.push(c.key); ch = true; } }); if(foe && !d.foes.includes(foe)){ d.foes.push(foe); ch = true; } if(ch) cxSave(d); }
window.CXNOTE = cxNote;
