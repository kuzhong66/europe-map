/* ============ 数值与内容配置 ============ */
let UID = 1;

// 卡牌数值读取（含强化）
function V(c, f) {
  const d = CARDS[c.key];
  return (c.up && d.up && d.up[f] != null) ? d.up[f] : d[f];
}
// 伤害修正：攻击方虚弱 -25%，受击方易伤 +50%
function calcDmg(base, atkWeak, defVuln) {
  let d = base;
  if (atkWeak) d *= .75;
  if (defVuln) d *= 1.5;
  return Math.floor(d);
}

const CARDS = {
  strike:    { name:'打击', type:'attack', cost:1, rarity:'basic',    icon:'sword',  dmg:6,  up:{dmg:9},
               desc:c=>`造成 ${V(c,'dmg')} 点伤害。`, play:(g,c)=>g.damage(V(c,'dmg')) },
  defend:    { name:'防御', type:'skill', cost:1, rarity:'basic',    icon:'shield', blk:5,  up:{blk:8},
               desc:c=>`获得 ${V(c,'blk')} 点格挡。`, play:(g,c)=>g.block(V(c,'blk')) },
  sear:      { name:'灼痕', type:'attack', cost:1, rarity:'basic',    icon:'target', dmg:4, vuln:1, up:{dmg:6,vuln:2},
               desc:c=>`造成 ${V(c,'dmg')} 点伤害，施加 ${V(c,'vuln')} 层易伤。`, play:(g,c)=>{g.damage(V(c,'dmg'));g.vuln(V(c,'vuln'))} },
  cleave:    { name:'横斩', type:'attack', cost:1, rarity:'uncommon', icon:'sword',  dmg:4,  up:{dmg:6},
               desc:c=>`造成 ${V(c,'dmg')} 点伤害，共两次。`, play:async(g,c)=>{await g.damage(V(c,'dmg'));await g.damage(V(c,'dmg'))} },
  deter:     { name:'威慑', type:'skill', cost:1, rarity:'uncommon', icon:'shield', blk:4, weak:1, up:{blk:6,weak:2},
               desc:c=>`获得 ${V(c,'blk')} 点格挡，施加 ${V(c,'weak')} 层虚弱。`, play:(g,c)=>{g.block(V(c,'blk'));g.weak(V(c,'weak'))} },
  focus:     { name:'蓄势', type:'skill', cost:0, rarity:'uncommon', icon:'cards',  draw:2, up:{draw:3},
               desc:c=>`抽 ${V(c,'draw')} 张牌。`, play:(g,c)=>g.draw(V(c,'draw')) },
  bloodrage: { name:'血怒', type:'skill', cost:0, rarity:'uncommon', icon:'up', str:2, hp:3, up:{str:3,hp:2},
               desc:c=>`失去 ${V(c,'hp')} 点生命，本回合攻击伤害 +${V(c,'str')}。`, play:async(g,c)=>{await g.loseHp(V(c,'hp'));g.g.tmpStr+=V(c,'str')} },
  ironwall:  { name:'铁壁', type:'skill', cost:2, rarity:'uncommon', icon:'shield', blk:13, up:{blk:18},
               desc:c=>`获得 ${V(c,'blk')} 点格挡。`, play:(g,c)=>g.block(V(c,'blk')) },
  emberward: { name:'余烬甲', type:'skill', cost:1, rarity:'uncommon', icon:'flame', blk:5, draw:1, up:{blk:7},
               desc:c=>`获得 ${V(c,'blk')} 点格挡，抽 1 张牌。`, play:(g,c)=>{g.block(V(c,'blk'));g.draw(1)} },
  break:     { name:'破军', type:'attack', cost:2, rarity:'rare', icon:'sword', dmg:9, dmgV:15, up:{dmg:12,dmgV:19},
               desc:c=>`造成 ${V(c,'dmg')} 点伤害；若目标带有易伤，改为 ${V(c,'dmgV')} 点。`,
               play:(g,c)=>{ const t = g.g.enemy.vuln > 0 ? V(c,'dmgV') : V(c,'dmg'); return g.damage(t); } },
  stillness: { name:'收势', type:'skill', cost:1, rarity:'uncommon', icon:'shield', blk:8, exhaust:true, up:{blk:12},
               desc:c=>`获得 ${V(c,'blk')} 点格挡，抽 1 张牌。消耗。`, play:(g,c)=>{g.block(V(c,'blk'));g.draw(1)} },
  flameblade:{ name:'燃刃', type:'attack', cost:1, rarity:'rare', icon:'flame', dmg:14, exhaust:true, up:{dmg:19},
               desc:c=>`造成 ${V(c,'dmg')} 点伤害。消耗。`, play:(g,c)=>g.damage(V(c,'dmg')) }
};

// 奖励卡池（基础卡不入池）
const POOL = ['cleave','deter','focus','bloodrage','ironwall','emberward','break','stillness','flameblade'];

// 敌人配置：move(回合数) 返回意图
const ENEMIES = {
  crow:  { key:'crow',  name:'灰鸦',   hp:24, body:'crow',
           move:t=> t%2 ? {t:'attack',dmg:8,name:'尖啸'} : {t:'attack',dmg:5,name:'啄击'} },
  golem: { key:'golem', name:'岩壳魔', hp:40, body:'golem',
           move:t=> t%2 ? {t:'attack',dmg:9,name:'碾碎'} : {t:'attack',dmg:5,block:6,name:'岩击'} },
  shade: { key:'shade', name:'蛰影',   hp:30, body:'shade',
           move:t=>{ const m=t%3; return m===1 ? {t:'weak',n:1,name:'蚀影'} : (m===2 ? {t:'attack',dmg:7,name:'刺击'} : {t:'attack',dmg:3,hits:2,name:'双蛰'}) } },
  boss: { key:'boss', name:'守烬者', hp:88, body:'boss', boss:true, move:t=> [ {t:'attack',dmg:12,name:'灰烬重锤'}, {t:'block',n:14,name:'烬甲'}, {t:'charge',name:'蓄爆'}, {t:'attack',dmg:22,name:'烬爆'} ][t%4] },
/* ===== v1.3 精英敌人 ===== */
overlord: { key:'overlord', name:'灰骸督军', hp:66, body:'overlord', elite:true, guard:6, move:t=> [ {t:'attack',dmg:9,name:'军阵斩'}, {t:'block',n:10,name:'竖盾结阵'}, {t:'attack',dmg:14,name:'督罚'} ][t%3] },
spider: { key:'spider', name:'烬喉织蛛', hp:58, body:'spider', elite:true, move:t=> t%3===0 ? {t:'vuln',n:2,name:'织毒网'} : (t%3===1 ? {t:'attack',dmg:4,hits:3,name:'绞缠咬'} : {t:'attack',dmg:11,name:'穿喉螫'}) },
magma: { key:'magma', name:'熔核兽', hp:64, body:'magma', elite:true, move:t=> t%3===0 ? {t:'attack',dmg:7,name:'熔爪'} : (t%3===1 ? {t:'charge',name:'熔核蓄能'} : {t:'attack',dmg:22,name:'熔核重锤'}) } };
// 地图节点类型 → 图标
const NTYPE = { fight:'swords', camp:'camp', event:'compass', elite:'skull', boss:'crown' };
/* ============ 事件数据（v1.2） ============ */
const EVENTS = {
  shrine: {
    name:'烬祠', scene:'ev_shrine',
    lines:[
      '荒径尽头立着一座半塌的石祠，香案上的积灰足有三指厚。',
      '案心却燃着一点余烬，明明灭灭——像是在呼吸。'
    ],
    options:[
      { label:'把手伸向余烬', run(st){
          const r = ri(0,2);
          if(r===0){ st.hp = clamp(st.hp+22, 1, st.maxHp); return '火光顺着指尖游上手臂，伤口在暖意中缓缓合拢。（生命 +22）'; }
          if(r===1){ const k = pick(POOL); st.deck.push({key:k, uid:UID++, up:false}); return '余烬忽然腾起，化作一张卡牌落入你的掌心。（习得 · '+CARDS[k].name+'）'; }
          st.hp = clamp(st.hp-9, 1, st.maxHp); st.gold += 45;
          return '火舌舔过皮肤，一阵灼痛——指缝间却滚出几枚温热的旧币。（生命 -9 · 金币 +45）';
      }},
      { label:'搜刮香案供品', run(st){ st.gold += 30; return '香炉底下压着一只钱袋，里面的金币还带着上一位旅人的体温。（金币 +30）'; }},
      { label:'敬而远之', run(st){ return '你绕开石祠继续赶路。身后，那点余烬慢慢暗了下去。'; }}
    ]
  },
  trader: {
    name:'灰鸦行商', scene:'ev_trader',
    lines:[
      '一只灰鸦立在断桩顶上，颈间挂着一串褪色的铜铃。',
      '它歪着头打量你，爪下压着一只半开的木匣。'
    ],
    options:[
      { label:'购买秘藏 · 50金币', can: st=> st.gold>=50, run(st){
          st.gold -= 50; const k = pick(['break','flameblade','stillness']);
          st.deck.push({key:k, uid:UID++, up:false});
          return '灰鸦用喙拨开木匣夹层，一枚泛着烬光的卡牌滑了出来。（习得 · '+CARDS[k].name+'）';
      }},
      { label:'购买草药 · 25金币', can: st=> st.gold>=25, run(st){
          st.gold -= 25; st.hp = clamp(st.hp+25, 1, st.maxHp);
          return '灰鸦从匣底衔出一束焦叶。嚼碎咽下，暖流涌遍四肢。（生命 +25）';
      }},
      { label:'摇响铜铃', run(st){
          if(Math.random() < .5){ st.gold += 18; return '铃声惊起林间飞鸟——它们掉落了几枚亮闪闪的东西。（金币 +18）'; }
          st.hp = clamp(st.hp-7, 1, st.maxHp);
          return '铃声未落，枯枝里窜出什么东西抓了你一把，随即消失。（生命 -7）';
      }},
      { label:'转身离开', run(st){ return '灰鸦目送你走远，铜铃在风里轻轻响了一声。'; }}
    ]
  },
  blade: {
    name:'无名断剑', scene:'ev_blade',
    lines:[
      '路旁斜插着半柄断剑，剑身布满焦痕，柄上缠着褪色的红绳。',
      '靠近时，你听见剑身深处传来极轻的、火炭般的嗡鸣。'
    ],
    options:[
      { label:'拔出断剑', run(st){
          st.hp = clamp(st.hp-10, 1, st.maxHp);
          st.deck.push({key:'flameblade', uid:UID++, up:false});
          return '剑身滚烫，拔出的瞬间烫伤了你的手——但它认你了。（生命 -10 · 习得 燃刃）';
      }},
      { label:'以血饲剑', run(st){
          st.hp = clamp(st.hp-14, 1, st.maxHp);
          const cs = st.deck.filter(x=>!x.up);
          if(cs.length){ const c = pick(cs); c.up = true;
            return '血渗进焦痕，嗡鸣化作一声清越的剑吟。（生命 -14 · '+CARDS[c.key].name+' 强化）'; }
          return '血渗进焦痕，剑身却毫无回应。（生命 -14）';
      }},
      { label:'让它安睡', run(st){ return '你为断剑拢了拢风尘。嗡鸣声低了下去，像一句道谢。'; }}
    ]
  },
  ember: {
    name:'临终余火', scene:'ev_ember',
    lines:[
      '一堆将熄的篝火蜷在岩缝里，火星一粒一粒地灭。',
      '它似乎在等你——等你决定这最后一点热，该给谁。'
    ],
    options:[
      { label:'添一把干柴', run(st){
          st.hp = clamp(st.hp+18, 1, st.maxHp);
          return '火重新旺了起来。你烘着手，冻僵的指节恢复了知觉。（生命 +18）';
      }},
      { label:'取一粒火种', run(st){
          const cs = st.deck.filter(x=>!x.up);
          if(cs.length){ const c = pick(cs); c.up = true;
            return '火种落进你的行囊，与一件随身旧物产生共鸣。（'+CARDS[c.key].name+' 强化）'; }
          return '火种落进行囊，却找不到可以栖身的东西，慢慢冷了。';
      }},
      { label:'吹熄它', run(st){
          st.gold += 22;
          return '你俯身吹气。灰烬里滚出几枚前人遗落的金币——冷灰不语。（金币 +22）';
      }}
    ]
  }
};
/* ===== v1.3 遗物 ===== */ const Relics = { get(id){ return this.pool.all[id]; }, pick(tier){ const arr = this.tiers[tier]; return this.get(arr[ri(0, arr.length - 1)]); }, tiers:{ regular:['aegis','wisp','fang','beads'], rare:['core','ashen'] }, pool:{ all:{ aegis:{ id:'aegis', name:'烬盾残章', icon:'hammer', desc:'战斗开始时，获得 8 点格挡' }, wisp:{ id:'wisp', name:'灰羽护符', icon:'camp', desc:'每回合开始时，获得 2 点格挡' }, fang:{ id:'fang', name:'蚀骨之牙', icon:'skull', desc:'击杀敌人后，回复 4 点生命' }, beads:{ id:'beads', name:'商队算珠', icon:'coin', desc:'战利品金币 +40%' }, core:{ id:'core', name:'燃烬之芯', icon:'hourglass', desc:'能量上限 +1' }, ashen:{ id:'ashen', name:'不灭余烬', icon:'target', desc:'每场战斗首次致命伤害至多留 1 点生命' } } } };
