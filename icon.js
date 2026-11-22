/* ============ 原创图标库（24×24 线性体系，全部手绘 path） ============ */
const Icon = {
  P: {
    sword: '<path d="M4 20 L8.7 15.3"/><path d="M7.5 12.5 L11.5 16.5"/><path d="M9.5 14.5 L19 5 L20.5 3.5 L20 9"/><circle cx="4.4" cy="19.6" r=".7"/>',
    shield: '<path d="M12 3 L19.5 5.8 V11 C19.5 16.3 16.4 19.9 12 21.3 C7.6 19.9 4.5 16.3 4.5 11 V5.8 Z"/><path d="M12 7 V17.5"/>',
    heart: '<path d="M12 20 C7.2 15.8 4 12.6 4 9.1 C4 6.3 6.2 4.1 8.9 4.1 C10.4 4.1 11.6 4.8 12 5.8 C12.4 4.8 13.6 4.1 15.1 4.1 C17.8 4.1 20 6.3 20 9.1 C20 12.6 16.8 15.8 12 20 Z"/>',
    flame: '<path d="M12 3 C13 6.5 17 8.6 17 13 C17 16.6 14.8 19.2 12 19.2 C9.2 19.2 7 16.6 7 13 C7 10.6 8.4 9 9.6 7.2 C9.9 8.8 10.7 9.7 11.6 10 C11.3 7.8 11.6 5.3 12 3 Z"/><path d="M12 12.5 C12.8 13.7 13.6 14.4 13.6 15.6 C13.6 17 12.9 17.9 12 17.9 C11.1 17.9 10.4 17 10.4 15.6 C10.4 14.4 11.2 13.7 12 12.5 Z"/>',
    cards: '<rect x="4" y="6.5" width="9" height="13" rx="1.5" transform="rotate(-8 8.5 13)"/><rect x="11" y="4.5" width="9" height="13" rx="1.5" transform="rotate(8 15.5 11)"/>',
    skull: '<path d="M12 3 C7.5 3 4.5 6.2 4.5 10.4 C4.5 13 5.8 14.6 7.2 15.7 L7.2 18 C7.2 19 7.9 19.7 8.9 19.7 L15.1 19.7 C16.1 19.7 16.8 19 16.8 18 L16.8 15.7 C18.2 14.6 19.5 13 19.5 10.4 C19.5 6.2 16.5 3 12 3 Z"/><circle cx="9.3" cy="10.5" r="1.5"/><circle cx="14.7" cy="10.5" r="1.5"/><path d="M10.9 19.7 V17.6 M13.1 19.7 V17.6"/>',
    camp: '<path d="M3 19.5 L12 4.5 L21 19.5 H15.4 L12 14.2 L8.6 19.5 Z"/><path d="M12 4.5 V14.2"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2 L13.3 13.3 L9.2 14.8 L10.7 10.7 Z"/>',
    crown: '<path d="M4.5 17.5 V8.5 L8.8 12 L12 6.5 L15.2 12 L19.5 8.5 V17.5 Z"/><path d="M4.5 17.5 H19.5"/>',
    coin: '<circle cx="12" cy="12" r="8.2"/><rect x="9.4" y="9.4" width="5.2" height="5.2"/>',
    gear: '<circle cx="12" cy="12" r="3.1"/><path d="M12 2.8 V5.2 M12 18.8 V21.2 M21.2 12 H18.8 M5.2 12 H2.8 M18.5 5.5 L16.8 7.2 M7.2 16.8 L5.5 18.5 M18.5 18.5 L16.8 16.8 M7.2 7.2 L5.5 5.5"/>',
    book: '<path d="M4 5.5 C6 4.8 8 4.6 9.8 5.2 C11 5.6 11.7 6.2 12 6.8 C12.3 6.2 13 5.6 14.2 5.2 C16 4.6 18 4.8 20 5.5 V18.2 C18 17.6 16 17.5 14.2 18 C13 18.4 12.3 19 12 19.5 C11.7 19 11 18.4 9.8 18 C8 17.5 6 17.6 4 18.2 Z"/><path d="M12 6.8 V19.5"/>',
    hammer: '<path d="M3.5 20.5 L10 14"/><path d="M13 4 L20 11 L16.5 14.5 L9.5 7.5 Z"/>',
    hourglass: '<path d="M6.5 3.5 H17.5 M6.5 20.5 H17.5 M7.5 3.5 C7.5 8 11 9.3 11 12 C11 14.7 7.5 16 7.5 20.5 M16.5 3.5 C16.5 8 13 9.3 13 12 C13 14.7 16.5 16 16.5 20.5"/>',
    up: '<path d="M6 13.5 L12 7.5 L18 13.5"/><path d="M6 18 L12 12 L18 18"/>',
    down: '<path d="M6 10.5 L12 16.5 L18 10.5"/><path d="M6 6 L12 12 L18 6"/>',
    target: '<path d="M4 8.5 V5.5 C4 4.7 4.7 4 5.5 4 H8.5 M15.5 4 H18.5 C19.3 4 20 4.7 20 5.5 V8.5 M20 15.5 V18.5 C20 19.3 19.3 20 18.5 20 H15.5 M8.5 20 H5.5 C4.7 20 4 19.3 4 18.5 V15.5"/><circle cx="12" cy="12" r="1.6"/>',
    swords: '<path d="M5 4 L18.2 17.2"/><path d="M5.8 14.8 L9.2 18.2"/><path d="M4 20 L7.5 16.5"/><path d="M19 4 L5.8 17.2"/><path d="M18.2 14.8 L14.8 18.2"/><path d="M20 20 L16.5 16.5"/>',
    question: '<path d="M9.2 8.8 C9.2 6.6 10.8 5.4 12.5 5.4 C14.4 5.4 15.6 6.7 15.6 8.4 C15.6 10.8 12.4 10.9 12.4 13.6"/><path d="M12.4 16.6 V17.4"/>',
    check: '<path d="M5 12.5 L10 17.5 L19 7"/>',
    chevrons: '<path d="M6 5 L13 12 L6 19"/><path d="M13 5 L20 12 L13 19"/>',
    speaker: '<path d="M4 9.5 H7.5 L12 5.5 V18.5 L7.5 14.5 H4 Z"/><path d="M15 9 C16.6 10.6 16.6 13.4 15 15"/><path d="M17.5 6.5 C20.4 9.4 20.4 14.6 17.5 17.5"/>',
    mute: '<path d="M4 9.5 H7.5 L12 5.5 V18.5 L7.5 14.5 H4 Z"/><path d="M16 9.5 L21 14.5 M21 9.5 L16 14.5"/>'
  },
  raw(n) {
    return `<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${this.P[n]||''}</g>`;
  },
  get(n, cls='') {
    return `<svg class="ic ${cls}" viewBox="0 0 24 24">${this.raw(n)}</svg>`;
  },
  mark(s=80) {
    return `<svg class="mark" style="width:${s}px;height:${s}px" viewBox="0 0 120 120">
      <circle class="mk-ring" cx="60" cy="60" r="44"/>
      <path class="mk-flame" d="M60 30 C63 42 72 47 74 58 C76 68 70 78 60 78 C50 78 44 68 46 58 C47.5 51 52 47 54 42 C55 47 57.5 49 59.5 49.5 C58.5 43.5 59 35 60 30 Z"/>
      <path class="mk-flame2" d="M60 52 C62 57 65 59.5 65 64 C65 68.5 62.8 71 60 71 C57.2 71 55 68.5 55 64 C55 59.5 58 57 60 52 Z"/>
      <path class="mk-base" d="M40 88 H80"/>
    </svg>`;
  }
};

/* ============ 卡面小场景插画（60×40 微型剪影，全部手绘） ============ */
const SCENES = {
  /* 打击：斜劈之剑与斩击弧 */
  strike: `<path class="sc-ground" d="M6 33 H54"/>
    <g class="sc-main"><path d="M26 5 L47 26 L42 31 L21 10 Z"/></g>
    <path class="ln" d="M15 8 L23 16"/>
    <path class="sc-fx" d="M9 31 C23 21 41 18 52 23"/>
    <circle class="sc-spark" cx="49" cy="14" r="1.4"/><circle class="sc-spark s2" cx="13" cy="23" r="1.1"/>`,
  /* 防御：立盾与背光 */
  defend: `<circle class="sc-moon" cx="30" cy="19" r="12"/>
    <path class="sc-ground" d="M10 33 H50"/>
    <g class="sc-main"><path d="M30 7 L41 11 V21 C41 28 36 32 30 34 C24 32 19 28 19 21 V11 Z"/></g>
    <path class="ln" d="M30 9 V32"/>
    <circle class="sc-spark" cx="45" cy="13" r="1.3"/>`,
  /* 灼痕：靶环与裂纹 */
  sear: `<path class="sc-ground" d="M12 33 H48"/>
    <g class="sc-main"><circle cx="30" cy="20" r="11"/><circle cx="30" cy="20" r="5.5" style="fill:#221609"/></g>
    <path class="sc-fx" d="M30 20 L30 6 M30 20 L41 27 M30 20 L19 27"/>
    <circle class="sc-spark" cx="30" cy="5" r="1.3"/><circle class="sc-spark s2" cx="42" cy="28" r="1.1"/>`,
  /* 横斩：交叉双弧 */
  cleave: `<path class="sc-ground" d="M6 35 H54"/>
    <path class="sc-fx" d="M10 28 C20 10 40 10 50 28 M10 12 C20 30 40 30 50 12"/>
    <g class="sc-main"><path d="M30 20 L33.5 23.5 L30 27 L26.5 23.5 Z"/></g>
    <circle class="sc-spark" cx="34" cy="15" r="1.3"/><circle class="sc-spark s2" cx="26" cy="31" r="1.1"/>`,
  /* 威慑：盾与冲击波 */
  deter: `<path class="sc-ground" d="M8 33 H52"/>
    <g class="sc-main"><path d="M22 9 L32 13 V22 C32 28 27 31 22 33 C17 31 12 28 12 22 V13 Z"/></g>
    <path class="ln" d="M22 11 V31"/>
    <path class="sc-fx" d="M37 13 C42 17.5 42 24.5 37 29 M43 10 C50 16 50 26 43 32"/>
    <circle class="sc-spark" cx="47" cy="15" r="1.2"/>`,
  /* 蓄势：三张牌与弧光 */
  focus: `<g class="sc-main">
      <rect x="13" y="15" width="9.5" height="13" rx="1.6" transform="rotate(-14 17.7 21.5)"/>
      <rect x="25" y="12" width="9.5" height="13" rx="1.6"/>
      <rect x="36.5" y="15" width="9.5" height="13" rx="1.6" transform="rotate(14 41.2 21.5)"/></g>
    <path class="sc-fx" d="M18 8 C24 3.5 36 3.5 42 8"/>
    <circle class="sc-spark" cx="30" cy="2.5" r="1.2"/><circle class="sc-spark s2" cx="46" cy="10" r="1"/>`,
  /* 血怒：双升箭与火基 */
  bloodrage: `<path class="ln" d="M17 24 L30 12 L43 24"/>
    <path class="ln" d="M17 33 L30 21 L43 33"/>
    <path class="sc-fx" d="M30 38.5 C27 35 28.5 32 30 29 C31.5 32 33 35 30 38.5"/>
    <circle class="sc-spark" cx="30" cy="7" r="1.3"/><circle class="sc-spark s2" cx="44" cy="9" r="1"/>`,
  /* 铁壁：城垛 */
  ironwall: `<path class="sc-ground" d="M6 33 H54"/>
    <g class="sc-main"><path d="M11 33 V18 H15 V13 H20 V18 H24 V13 H30 V18 H34 V13 H40 V18 H44 V13 H49 V18 V33 Z"/></g>
    <path d="M26 33 V27 C26 24.5 32 24.5 32 27 V33 Z" style="fill:#241608"/>
    <circle class="sc-spark" cx="52" cy="10" r="1.2"/>`,
  /* 余烬甲：盾内之火 */
  emberward: `<circle class="sc-moon" cx="30" cy="20" r="12"/>
    <g class="sc-main"><path d="M30 6 L41 10 V20 C41 27 36 31 30 33 C24 31 19 27 19 20 V10 Z"/></g>
    <path class="sc-fx" d="M30 14 C27.5 18 26 20.5 26 23.5 C26 27 28 29 30 29 C32 29 34 27 34 23.5 C34 20.5 32.5 18 30 14"/>
    <circle class="sc-spark" cx="45" cy="12" r="1.2"/>`,
  /* 破军：裂盾 */
  break: `<g class="sc-main"><path d="M30 6 L41 10 V20 C41 27 36 31 30 33 C24 31 19 27 19 20 V10 Z"/></g>
    <path class="sc-fx" d="M33 6 L30 15 L34 21 L28 32 M33 6 L36 3"/>
    <circle class="sc-spark" cx="36" cy="2" r="1.2"/><circle class="sc-spark s2" cx="27" cy="25" r="1.1"/>`,
  /* 收势：环与呼吸弧 */
  stillness: `<circle class="ring" cx="30" cy="20" r="12.5"/>
    <path class="sc-fx" d="M23 23 C26 27.5 34 27.5 37 23 M26 15.5 C28 13 32 13 34 15.5"/>
    <circle class="sc-spark" cx="30" cy="4.5" r="1.2"/><circle class="sc-spark s2" cx="45" cy="29" r="1"/>`,
  /* 燃刃：燃烧之剑 */
  flameblade: `<path class="sc-ground" d="M6 34 H54"/>
    <g class="sc-main"><path d="M27.5 4 L32.5 4 L32.5 25 L30 30 L27.5 25 Z"/></g>
    <path class="ln" d="M23 11 H37"/>
    <path class="sc-fx" d="M32.5 12 C36 16 36.5 22 33.5 26 M27.5 13 C24 17 24 22 27 25"/>
    <circle class="sc-spark" cx="39" cy="8" r="1.3"/><circle class="sc-spark s2" cx="21" cy="20" r="1.1"/>`
};

/* ============ 角色与敌人剪影（原创绘制：剪影 + 烬色轮廓光 + 发光眼） ============ */
const BODIES = {
  hero: `<svg class="body-svg" viewBox="0 0 150 150">
    <ellipse class="b-shadow" cx="72" cy="141" rx="42" ry="6"/>
    <g class="b-main">
      <path class="b-scarf" d="M58 46 C42 50 30 60 16 62 C11 62.7 9 65 11 67 C26 70 44 62 60 55 Z"/>
      <path d="M62 47 C52 50 46 60 46 74 C46 90 48 106 44 128 L60 128 L64 102 L69 102 L73 128 L89 128 C85 106 87 90 87 74 C87 60 80 49 68 47 Z"/>
      <path d="M56 30 C53 15 66 6 78 11 C87 15 89 26 86 35 C92 37 93 42 90 45 C80 51 62 51 57 45 C54 41 54 35 56 30 Z"/>
      <path d="M80 62 C88 60 95 55 100 49 L107 56 C99 65 90 70 82 72 Z"/>
      <path d="M103 55 L132 22 L139 29 L110 62 Z"/>
      <path d="M96 47 L112 63 L106 69 L90 53 Z"/>
    </g>
    <g class="b-glow"><circle cx="79" cy="33" r="2.2"/></g>
  </svg>`,
  crow: `<svg class="body-svg" viewBox="0 0 150 130">
    <ellipse class="b-shadow" cx="75" cy="120" rx="44" ry="6"/>
    <g class="b-main">
      <path d="M104 58 L128 48 L108 68 L126 72 L106 78 L122 88 L102 78 Z"/>
      <path d="M70 40 C94 33 110 47 108 68 C106 90 88 101 66 99 C46 97 36 84 39 65 C42 50 54 43 70 40 Z"/>
      <circle cx="52" cy="40" r="14"/>
      <path d="M39 37 L20 42 L39 46 Z"/>
      <path d="M78 62 C92 58 101 65 99 77 C93 89 76 93 63 87 C71 79 76 71 78 62 Z"/>
      <path d="M58 99 L54 114"/><path d="M72 99 L74 114"/>
    </g>
    <g class="b-glow"><circle cx="47" cy="37" r="2.4"/></g>
  </svg>`,
  golem: `<svg class="body-svg" viewBox="0 0 160 130">
    <ellipse class="b-shadow" cx="80" cy="122" rx="52" ry="6"/>
    <g class="b-main">
      <path d="M56 34 L63 17 L72 34 M84 29 L91 11 L98 30 M109 33 L116 19 L121 36"/>
      <path d="M40 118 L32 78 C30 55 48 34 80 31 C114 28 133 45 133 71 L127 118 Z"/>
      <path d="M36 70 L18 108 L31 113 L46 85 Z"/>
      <path d="M128 70 L146 106 L133 112 L119 85 Z"/>
    </g>
    <g class="b-vein"><path d="M72 42 L79 62 L67 84 M100 40 L94 64 L108 82"/></g>
    <g class="b-glow">
      <path d="M62 54 L68 58 L62 62 L57 58 Z"/>
      <path d="M96 52 L102 56 L96 60 L91 56 Z"/>
    </g>
  </svg>`,
  shade: `<svg class="body-svg" viewBox="0 0 150 130">
    <ellipse class="b-shadow" cx="72" cy="120" rx="46" ry="6"/>
    <g class="b-main">
      <path d="M96 90 L124 54 L110 92 Z"/>
      <path d="M32 100 C40 68 62 58 82 63 C106 68 114 84 102 95 C92 103 78 99 80 88" style="fill:none;stroke:#171009;stroke-width:13"/>
      <circle cx="34" cy="100" r="10"/>
    </g>
    <g class="b-glow"><circle cx="30" cy="97" r="2.2"/></g>
  </svg>`,
  boss: `<svg class="body-svg" viewBox="0 0 180 170">
    <ellipse class="b-shadow" cx="92" cy="160" rx="58" ry="7"/>
    <g class="b-main">
      <path d="M66 46 C56 26 58 12 74 5 C69 20 77 31 84 42 Z"/>
      <path d="M118 46 C128 26 126 12 110 5 C115 20 107 31 100 42 Z"/>
      <path d="M60 152 L50 92 C46 58 70 30 95 30 C121 30 140 56 135 90 L126 152 Z"/>
      <path d="M52 82 L26 132 L44 143 L68 102 Z"/>
      <path d="M134 82 L160 130 L142 143 L120 102 Z"/>
    </g>
    <g class="b-vein"><path d="M74 60 L82 84 L70 108 M112 58 L106 82 L118 104 M92 66 L92 78"/></g>
    <g class="b-glow">
      <circle cx="84" cy="47" r="2.4"/><circle cx="106" cy="47" r="2.4"/>
      <path class="b-core" d="M95 80 L104 92 L95 104 L86 92 Z"/>
    </g>
  </svg>`
};
