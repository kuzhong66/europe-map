/* ============ 全局状态与启动 ============ */
const Game = {
  state:null,

  newState(){
    const deck = [];
    const add = (k, n) => { for(let i=0;i<n;i++) deck.push({ key:k, uid:UID++, up:false }) };
    add('strike', 4); add('defend', 3); add('sear', 1);
    add('focus', 1); add('ironwall', 1);
    return { hp:72, maxHp:72, gold:0, kills:0, dmgTotal:0, relics:[], deck };
  },

  newRun(){
    this.state = this.newState();
    MapSys.generate();
  },

  /* 返回主菜单：不再销毁进度（自动存档兜底） */
  toMenu(){
    UI.wipe(()=>{ Battle.g = null; UI.show('screen-menu'); this.refreshMenu() });
  },

  refreshMenu(){
    $('#btnCont').classList.toggle('hidden', !SaveSys.has('auto'));
  },

  async startRun(){
    if(SaveSys.has('auto')){
      const ok = await Modal.confirm({ title:'开始新的远征？', desc:'当前的自动存档将被覆盖。', ok:'启　程' });
      if(!ok) return;
    }
    UI.wipe(()=>{
      this.newRun();
      SaveSys.auto();               // 新游戏立即落自动存档
      UI.show('screen-map');
      MapSys.render();
    });
  },

  boot(){
    FX.init();
    SaveSys.loadAll();
    $$('[data-ic]').forEach(el => el.innerHTML = Icon.get(el.dataset.ic));
    $$('[data-mark]').forEach(el => el.innerHTML = Icon.mark(+el.dataset.mark || 80));
    $('.load-mark').innerHTML = Icon.mark(110);

    // 音频：首次手势激活（浏览器策略）
    document.addEventListener('pointerdown', ()=> AudioSys.start(), { once:true });

    // 主菜单
    $('#btnStart').addEventListener('pointerdown', ()=> this.startRun());
    $('#btnCont').addEventListener('pointerdown', ()=>{ S('click'); SaveSys.load('auto') });
    $('#btnSaves').addEventListener('pointerdown', ()=>{ S('click'); SavesUI.open(false) });
    $('#btnSetting').addEventListener('pointerdown', ()=> Settings.open());
    // 地图
    $('#mapBook').addEventListener('pointerdown', ()=> this.state && Screens.vault('牌 组', this.state.deck));
    $('#mapSave').addEventListener('pointerdown', ()=> this.state && SavesUI.open(true));
    $('#mapGear').addEventListener('pointerdown', ()=> Settings.open());

    // 战斗
    $('#endTurnBtn').addEventListener('pointerdown', ()=> Battle.endTurn());
    $('#pileDraw').addEventListener('pointerdown', ()=> Battle.g && Screens.vault('抽 牌 堆', Battle.g.draw));
    $('#pileDiscard').addEventListener('pointerdown', ()=> Battle.g && Screens.vault('弃 牌 堆', Battle.g.discard));
    $('#battleGear').addEventListener('pointerdown', ()=> Settings.open());
    $('#enemyUnit').addEventListener('pointerdown', ()=>{
      const g = Battle.g;
      if(!g || g.busy || !g.sel) return;
      const c = g.hand.find(x => x.uid === g.sel);
      if(c && CARDS[c.key].type === 'attack') Battle.playCard(c);
    });
    $('#allyUnit').addEventListener('pointerdown', ()=>{
      const g = Battle.g;
      if(!g || g.busy || !g.sel) return;
      const c = g.hand.find(x => x.uid === g.sel);
      if(c && CARDS[c.key].type !== 'attack') Battle.playCard(c);
    });
    $('#battleField').addEventListener('pointerdown', e=>{
      const g = Battle.g;
      if(!g || g.busy || !g.sel) return;
      if(e.target.closest('.unit')) return;
      g.sel = null;
      Battle.renderHand(); Battle.tip(''); Battle.fieldCls('');
    });

    (async ()=>{
      await Loader.run();
      UI.wipe(()=>{ UI.show('screen-menu'); this.refreshMenu() });
    })();
  }
};

/* ============ 设置弹窗（音乐/音效独立开关 + 音量滑块） ============ */
const Settings = {
  open(){
    const inGame = !!(Game.state && MapSys.pos);
    const el = $('#pause');
    el.classList.add('show');
    el.innerHTML = `
      <div class="pm-box set-box">
        <h3>设　置</h3>
        <div class="set-row">
          <span>音　乐</span>
          <button class="tgl ${AudioSys.musicOn?'on':''}" data-t="music">${AudioSys.musicOn?'开':'关'}</button>
          <input type="range" min="0" max="1" step="0.05" value="${AudioSys.musicVol}" data-v="music">
        </div>
        <div class="set-row">
          <span>音　效</span>
          <button class="tgl ${AudioSys.sfxOn?'on':''}" data-t="sfx">${AudioSys.sfxOn?'开':'关'}</button>
          <input type="range" min="0" max="1" step="0.05" value="${AudioSys.sfxVol}" data-v="sfx">
        </div>
        <p class="set-note">拖动滑块实时调整音量 · 设置会自动保存</p>
       <div class="pm-row"> ${inGame ? '<button class="btn ghost" id="setRelics">行囊 · 遗物</button>' : ''} ${inGame ? '<button class="btn danger" id="setQuit">放弃远征</button>' : ''} <button class="btn ghost" id="setClose">关 闭
       </button> 
       </div>
      </div>`;
    el.querySelectorAll('.tgl').forEach(b => b.addEventListener('pointerdown', ()=>{
      if(b.dataset.t === 'music') AudioSys.setMusicOn(!AudioSys.musicOn);
      else AudioSys.setSfxOn(!AudioSys.sfxOn);
      b.classList.toggle('on');
      b.textContent = b.classList.contains('on') ? '开' : '关';
      S('click');
    }));
    el.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', ()=>{
      if(r.dataset.v === 'music') AudioSys.setMusicVol(+r.value);
      else AudioSys.setSfxVol(+r.value);
    }));
    $('#setClose').addEventListener('pointerdown', ()=> this.close()); const rb = $('#setRelics'); if(rb) rb.addEventListener('pointerdown', ()=>{ this.close(); Screens.relicBag(); });
    const q = $('#setQuit');
    if(q) q.addEventListener('pointerdown', async ()=>{
      this.close();
      const ok = await Modal.confirm({ title:'放弃远征？', desc:'自动存档已保留，可随时从主菜单继续。', ok:'返回主菜单', danger:true });
      if(ok) Game.toMenu();
    });
  },
  close(){ const el = $('#pause'); el.classList.remove('show'); el.innerHTML = '' }
};

/* ============ 通用确认弹窗 ============ */
const Modal = {
  confirm({ title, desc, ok='确 认', danger=false }){
    return new Promise(res=>{
      const el = $('#pause');
      el.classList.add('show');
      el.innerHTML = `
        <div class="pm-box">
          <h3>${title}</h3><p>${desc}</p>
          <div class="pm-row">
            <button class="btn ghost" data-r="0">取 消</button>
            <button class="btn primary ${danger?'danger':''}" data-r="1">${ok}</button>
          </div>
        </div>`;
      el.addEventListener('pointerdown', function h(e){
        const b = e.target.closest('[data-r]');
        if(!b) return;
        el.removeEventListener('pointerdown', h);
        el.classList.remove('show'); el.innerHTML = '';
        res(b.dataset.r === '1');
      });
    });
  }
};

Game.boot();
