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
  async reward(){
    const st = Game.state;
    const gold = ri(22, 44);
    st.gold += gold;
    const picks = shuffle(POOL.slice()).slice(0,3).map(k => ({ key:k, uid:UID++, up:false }));
    $('#screen-reward').innerHTML = `
      <div class="scr-narrow">
        <h2 class="rn-title">战 利 品</h2>
        <div class="rn-gold">${Icon.get('coin')}<b id="goldNum">0</b><span>余烬金币</span></div>
        <p class="rn-hint">拾取一张战利品，纳入行囊</p>
        <div class="rn-cards" id="rnCards"></div>
        <button class="btn ghost" id="rnSkip">放　弃</button>
      </div>`;
    UI.show('screen-reward');
    S('coin');
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
            onPick: c => { c.up = true; S('buff'); UI.toast('强化 · ' + CARDS[c.key].name + '+'); MapSys.finish() },
            onCancel: () => this.camp()
          });
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
    const st = Game.state;
    $('#screen-over').innerHTML = `
      <div class="scr-narrow">
        <div class="ov-mark ${win ? 'win' : 'lose'}">${Icon.mark(90)}</div>
        <h1 class="ov-title ${win ? '' : 'lose'}">${win ? '远征功成' : '旅途终结'}</h1>
        <p class="ov-sub">${win ? '你守住了灰烬中的最后一点火。' : '火熄灭了。但灰烬之下，总有火星残存。'}</p>
        <div class="ov-stats" id="ovStats"></div>
        <button class="btn primary" id="ovBack">重　燃</button>
      </div>`;
    UI.show('screen-over');
    S(win ? 'win' : 'lose');
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
    $('#ovBack').addEventListener('pointerdown', ()=> Game.toMenu());
  }
};
