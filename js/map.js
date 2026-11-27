/* ============ 横版节点地图 ============ */
const MapSys = {
  nodes:[], edges:[], pos:null, done:null, pending:null,

  generate(){
    this.nodes = []; this.edges = [];
    const layout = [1,2,3,2,3,2,1];
    const types  = [['fight'],['fight','fight'],['fight','camp','fight'],
                    ['fight','event','fight'],['camp','elite','fight'],['fight','elite'],['boss']];
    let uid = 0;
    layout.forEach((n, c) => {
      const colNodes = [];
      for(let r=0; r<n; r++){
        const y = (n===1) ? 280 : 90 + (r+.5)*(380/n) + rand(-20,20);
        const node = { id:'n'+(uid++), col:c, row:r,
                       x: Math.round(80 + c*(840/6)), y: Math.round(y),
                       type: types[c][r], hasPrev:false };
        this.nodes.push(node); colNodes.push(node);
      }
      if(c > 0){
        const prev = this.nodes.filter(nd => nd.col === c-1);
        colNodes.forEach(b => {
          const s = prev.slice().sort((p,q)=> Math.abs(p.y-b.y) - Math.abs(q.y-b.y));
          this.link(s[0], b);
          if(s[1] && Math.random() < .4) this.link(s[1], b);
        });
        prev.forEach(a => {
          if(!this.edges.some(e => e.from === a.id)){
            const s = colNodes.slice().sort((p,q)=> Math.abs(p.y-a.y) - Math.abs(q.y-a.y));
            this.link(a, s[0]);
          }
        });
      }
    });
    this.pos = this.nodes[0].id;
    this.done = new Set();
    this.pending = null;
  },

  link(a,b){ if(a && b){ this.edges.push({from:a.id, to:b.id}); b.hasPrev = true } },
  node(id){ return this.nodes.find(n => n.id === id) },
  avail(){ return this.edges.filter(e => e.from === this.pos).map(e => e.to) },
  floor(){ const n = this.node(this.pos); return (n.col === 6 && this.done.has(n.id)) ? 7 : n.col + 1 },

  render(){
    const svg = $('#mapSvg');
    const avail = this.avail();
    let edges = '';
    this.edges.forEach(e => {
      const a = this.node(e.from), b = this.node(e.to), mx = (a.x+b.x)/2;
      const cls = (e.from === this.pos && avail.includes(e.to)) ? 'open'
                : (this.done.has(e.from) && this.done.has(e.to)) ? 'on' : 'off';
      edges += `<path class="medge ${cls}" d="M${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}" pathLength="1"/>`;
    });
    let ns = '';
    this.nodes.forEach((n, i) => {
      const st = n.id === this.pos ? 'cur' : avail.includes(n.id) ? 'avail' : this.done.has(n.id) ? 'done' : 'lock';
      ns += `<g class="mnode ${st}" data-id="${n.id}" transform="translate(${n.x},${n.y})">
        <g class="mn-in" style="animation-delay:${i*45}ms">
          <circle class="mn-halo" r="30"/>
          <circle class="mn-ring" r="20"/>
          <g class="mn-ic" transform="translate(-11,-11) scale(0.92)">${Icon.raw(NTYPE[n.type])}</g>
          ${st==='cur' ? '<circle class="mn-dot" r="5"/>' : ''}
        </g></g>`;
    });
    svg.innerHTML = edges + ns;
    if(!svg._bound){
      svg._bound = true;
      svg.addEventListener('pointerdown', e => {
        const g = e.target.closest('.mnode');
        if(g) this.enter(g.dataset.id);
      });
    }
    $('#mhZone').textContent  = this.node(this.pos).col < 4 ? '烬径 · 外垣' : '烬径 · 深处';
    $('#mhFloor').textContent = '第 ' + this.floor() + ' 层';
    $('#mhHp').textContent    = Game.state.hp + '/' + Game.state.maxHp;
    $('#mhGold').textContent  = Game.state.gold;
  },

  flashAvail(){
    $$('#mapSvg .mnode.avail').forEach(nd => {
      nd.classList.remove('flash'); void nd.getBoundingClientRect(); nd.classList.add('flash');
    });
    setTimeout(()=> $$('#mapSvg .mnode.flash').forEach(nd => nd.classList.remove('flash')), 900);
  },

  async enter(id){
    const n = this.node(id);
    if(!this.avail().includes(id)){
      UI.toast('此路不通 · 只能沿亮起的火线行进');
      this.flashAvail();
      return;
    }
    this.pending = id;
    S('click');
    if(n.type === 'event'){
      await UI.wipe(()=> Story.start(pick(Object.keys(EVENTS))));
      return;
    }
    await UI.wipe(()=>{
      if(n.type === 'fight' || n.type === 'elite' || n.type === 'boss') Battle.start(n.type);
      else if(n.type === 'camp') Screens.camp();
    });
  },

  /* 所有节点（战斗/篝火/事件）回地图的唯一出口 —— 自动存档挂在这里 */
  async finish(){
    this.done.add(this.pos);
    this.pos = this.pending; this.done.add(this.pos);
    this.pending = null;
    await UI.wipe(()=>{ UI.show('screen-map'); this.render(); });
    SaveSys.auto();
  }
};
