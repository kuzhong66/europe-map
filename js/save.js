/* ============ 存档系统：1 自动 + 3 手动，localStorage 持久化 ============ */
const SaveSys = {
  KEY:'emberpath_saves', VER:12,
  slots:{ auto:null, m1:null, m2:null, m3:null },

  loadAll(){
    try{
      const raw = JSON.parse(localStorage.getItem(this.KEY) || '{}');
      ['auto','m1','m2','m3'].forEach(k => { if(raw[k]) this.slots[k] = raw[k] });
    }catch(e){}
  },
  persist(){
    try{ localStorage.setItem(this.KEY, JSON.stringify(this.slots)) }catch(e){}
  },
  capture(){
    return {
      ver:this.VER, time:Date.now(), floor: MapSys.floor(),
      state: JSON.parse(JSON.stringify(Game.state)),
      map: {
        nodes: JSON.parse(JSON.stringify(MapSys.nodes)),
        edges: JSON.parse(JSON.stringify(MapSys.edges)),
        pos: MapSys.pos,
        done: [...MapSys.done]           // Set → Array 才能序列化
      }
    };
  },
  save(id){ if(!Game.state) return false; this.slots[id] = this.capture(); this.persist(); return true },
  auto(){ if(Game.state) this.save('auto') },
  restore(d){
  if(!d || d.ver !== this.VER) return false; Game.state = d.state; if(!Array.isArray(Game.state.relics)) Game.state.relics = [];
    MapSys.nodes = d.map.nodes;
    MapSys.edges = d.map.edges;
    MapSys.pos   = d.map.pos;
    MapSys.done  = new Set(d.map.done);  // 重建 Set
    MapSys.pending = null;
    return true;
  },
  load(id){
    const d = this.slots[id];
    if(!d || !this.restore(d)){ UI.toast('这份记录已无法辨认'); return }
    UI.wipe(()=>{ UI.show('screen-map'); MapSys.render() });
  },
  clear(id){ this.slots[id] = null; this.persist() },
  has(id){ return !!this.slots[id] }
};

function fmtTime(t){
  const d = new Date(t), p = n=> String(n).padStart(2,'0');
  return `${d.getMonth()+1}月${d.getDate()}日 ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ============ 存档馆界面 ============ */
const SavesUI = {
  TAGS:{ auto:'自动存档', m1:'手记 · 一', m2:'手记 · 二', m3:'手记 · 三' },
  open(inGame){
    const el = $('#screen-saves');
    const row = (id, i) => {
      const d = SaveSys.slots[id];
      const info = d
        ? `第 ${d.floor} 层 · 血 ${d.state.hp}/${d.state.maxHp} · 金 ${d.state.gold}<br><span>${fmtTime(d.time)}</span>`
        : '<span class="sv-empty">— 空白之页 —</span>';
      const btns = [];
      if(d) btns.push(`<button class="btn sm" data-a="load" data-id="${id}">读取</button>`);
      if(inGame && id !== 'auto') btns.push(`<button class="btn sm primary" data-a="save" data-id="${id}">记录</button>`);
      if(d && id !== 'auto') btns.push(`<button class="btn sm danger" data-a="del" data-id="${id}">抹去</button>`);
      return `<div class="sv-slot ${d?'':'blank'}" style="animation-delay:${i*70}ms">
        <div class="sv-tag">${this.TAGS[id]}</div>
        <div class="sv-info">${info}</div>
        <div class="sv-btns">${btns.join('')}</div></div>`;
    };
    el.innerHTML = `
      <div class="scr-narrow sv-wrap">
        <h2 class="rn-title">存 档 馆</h2>
        <p class="rn-hint">旅途被记录于灰烬之中</p>
        <div class="sv-list">
          ${row('auto',0)}${row('m1',1)}${row('m2',2)}${row('m3',3)}
        </div>
        <button class="btn ghost" id="svBack">返　回</button>
      </div>`;
    UI.show('screen-saves');
    $('#svBack').addEventListener('pointerdown', ()=> this.back(inGame));
    el.querySelectorAll('[data-a]').forEach(b => b.addEventListener('pointerdown', async ()=>{
      const id = b.dataset.id, a = b.dataset.a;
      if(a === 'load'){ S('click'); SaveSys.load(id); }
      else if(a === 'save'){
        S('page'); SaveSys.save(id);
        UI.toast('旅途已记入 · ' + this.TAGS[id]);
        this.open(inGame);
      }
      else if(a === 'del'){
        const ok = await Modal.confirm({title:'抹去这段旅途？', desc:'记录将化为冷灰，无法找回。', ok:'抹　去', danger:true});
        if(ok){ SaveSys.clear(id); S('shuffle'); this.open(inGame) }
      }
    }));
  },
  back(inGame){
    UI.wipe(()=>{
      if(inGame && Game.state && MapSys.pos){ UI.show('screen-map'); MapSys.render() }
      else UI.show('screen-menu');
    });
  }
};
