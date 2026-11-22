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
               desc:c=>`失去 ${V(c,'hp')} 点生命，本回合攻击伤害 +${V(c,'str')}。`, play:(g,c)=>{g.loseHp(V(c,'hp'));g.tmpStr+=V(c,'str')} },
  ironwall:  { name:'铁壁', type:'skill', cost:2, rarity:'uncommon', icon:'shield', blk:13, up:{blk:18},
               desc:c=>`获得 ${V(c,'blk')} 点格挡。`, play:(g,c)=>g.block(V(c,'blk')) },
  emberward: { name:'余烬甲', type:'skill', cost:1, rarity:'uncommon', icon:'flame', blk:5, draw:1, up:{blk:7},
               desc:c=>`获得 ${V(c,'blk')} 点格挡，抽 1 张牌。`, play:(g,c)=>{g.block(V(c,'blk'));g.draw(1)} },
  break:     { name:'破军', type:'attack', cost:2, rarity:'rare', icon:'sword', dmg:9, dmgV:15, up:{dmg:12,dmgV:19},
               desc:c=>`造成 ${V(c,'dmg')} 点伤害；若目标带有易伤，改为 ${V(c,'dmgV')} 点。`,
               play:(g,c)=>g.damage(g.enemy.vuln>0 ? V(c,'dmgV') : V(c,'dmg')) },
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
  boss:  { key:'boss',  name:'守烬者', hp:88, body:'boss', boss:true,
           move:t=> [ {t:'attack',dmg:12,name:'灰烬重锤'}, {t:'block',n:14,name:'烬甲'}, {t:'charge',name:'蓄爆'}, {t:'attack',dmg:22,name:'烬爆'} ][t%4] }
};

// 地图节点类型 → 图标
const NTYPE = { fight:'swords', camp:'camp', event:'compass', elite:'skull', boss:'crown' };
