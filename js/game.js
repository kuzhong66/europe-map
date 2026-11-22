/* ============ 全局状态与启动 ============ */
const Game = {
  state:null,

  newState(){
    const deck = [];
    const add = (k, n) => { for(let i=0;i<n;i++) deck.push({ key:k, uid:UID++, up:false }) };
    // 费用分层起手：1费×8 + 0费×1 + 2费×1
    add('strike', 4); add('defend', 3); add('sear', 1);
    add('focus', 1); add('ironwall', 1);
    return { hp:72, maxHp:72, gold:0, kills:0, dmgTotal:0, deck };
  },

  newRun(){
    this.state = this.newState();
    MapSys.generate();
  },

  toMenu(){
    UI.wipe(()=>{ this.state = null; UI.show('screen-menu') });
  },

  startRun(){
    UI.wipe(()=>{
      this.newRun();
      UI.show('screen-map');
      MapSys.render();
    });
  },

  boot(){
    FX.init();
    // 注入静态图标与徽章
    $$('[data-ic]').forEach(el => el.innerHTML = Icon.get(el.dataset.ic));
    $$('[data-mark]').forEach(el => el.innerHTML = Icon.mark(+el.dataset.mark || 80));
    $('.load-mark').innerHTML = Icon.mark(110);

    // 音频：浏览器策略要求首次用户手势后才能发声
    document.addEventListener('pointerdown', ()=> AudioSys.start(), { once:true });

    // 声音开关（地图/战斗顶栏同步）
    $$('.snd-btn').forEach(b => b.addEventListener('pointerdown', ()=>{
      const m = AudioSys.toggleMute();
      $$('.snd-btn').forEach(x => x.innerHTML = Icon.get(m ? 'mute' : 'speaker'));
      UI.toast(m ? '声音已静默' : '声音已唤醒');
    }));

    // 菜单
    $('#btnStart').addEventListener('pointerdown', ()=> this.startRun());
    $('#btnCodex').addEventListener('pointerdown', ()=> UI.toast('卷轴仍在书写 —— v1.2 开启'));
    $('#btnSetting').addEventListener('pointerdown', ()=> UI.toast('设置尚未点燃 —— v1.2 开启'));

    // 地图
    $('#mapBook').addEventListener('pointerdown', ()=> this.state && Screens.vault('牌 组', this.state.deck));
    $('#mapGear').addEventListener('pointerdown', async ()=>{
      if(!this.state) return;
      const ok = await Modal.confirm({ title:'放弃远征？', desc:'离开将失去本次旅途的一切进度。', ok:'放弃远征', danger:true });
      if(ok) this.toMenu();
    });

    // 战斗
    $('#endTurnBtn').addEventListener('pointerdown', ()=> Battle.endTurn());
    $('#pileDraw').addEventListener('pointerdown', ()=> Battle.g && Screens.vault('抽 牌 堆', Battle.g.draw));
    $('#pileDiscard').addEventListener('pointerdown', ()=> Battle.g && Screens.vault('弃 牌 堆', Battle.g.discard));
    $('#battleGear').addEventListener('pointerdown', async ()=>{
      const ok = await Modal.confirm({ title:'离开战斗？', desc:'放弃远征将失去一切进度。', ok:'放弃远征', danger:true });
      if(ok) this.toMenu();
    });
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

    // 启动序列
    (async ()=>{
      await Loader.run();
      UI.wipe(()=> UI.show('screen-menu'));
    })();
  }
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
