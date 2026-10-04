/* ────────────────────────────────────────────────────────────────
   Афиша «Искусство объединяет» — генеративная графика
   Лента КТК: тонкая нить прошивает заголовок и разворачивается
   в большой виток, вокруг которого собираются осколки смальты.
   ──────────────────────────────────────────────────────────────── */

const LIGHT = new URLSearchParams(location.search).get('theme') === 'light';

/* детерминированный шум — рендер воспроизводим */
let _s = 20260412;
const rnd = () => (_s = (_s * 1664525 + 1013904223) % 4294967296) / 4294967296;

const mix = (c1, c2, k) => c1.map((v, i) => Math.round(v + (c2[i] - v) * k));
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

const RAMP = LIGHT ? [
  [0.00, [ 78, 140, 236]], [0.13, [ 42,  98, 214]], [0.26, [ 27,  75, 155]],
  [0.38, [214,  28,  40]], [0.54, [232,  35,  42]], [0.70, [242,  78,  46]],
  [0.83, [248, 128,  62]], [0.93, [250, 162,  84]], [1.00, [252, 190, 124]]
] : [
  [0.00, [122, 176, 255]], [0.13, [ 62, 123, 240]], [0.26, [ 40,  82, 216]],
  [0.38, [232,  35,  42]], [0.54, [255,  58,  44]], [0.70, [255,  98,  56]],
  [0.83, [255, 152,  80]], [0.93, [255, 188, 112]], [1.00, [255, 214, 158]]
];
function ramp(t) {
  for (let i = 0; i < RAMP.length - 1; i++) {
    if (t >= RAMP[i][0] && t <= RAMP[i + 1][0]) {
      const k = (t - RAMP[i][0]) / (RAMP[i + 1][0] - RAMP[i][0]);
      return mix(RAMP[i][1], RAMP[i + 1][1], k);
    }
  }
  return RAMP[RAMP.length - 1][1];
}

/* Catmull–Rom по произвольному числу каналов: [x, y, ширина, позиция в градиенте] */
function catmull(pts, per = 12) {
  const p = [pts[0], ...pts, pts[pts.length - 1]], out = [], dim = pts[0].length;
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    for (let j = 0; j < per; j++) {
      const t = j / per, t2 = t * t, t3 = t2 * t, v = [];
      for (let d = 0; d < dim; d++) {
        v.push(.5 * (2*p1[d] + (-p0[d]+p2[d])*t + (2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2
                     + (-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3));
      }
      out.push(v);
    }
  }
  out.push(pts[pts.length - 1].slice());
  return out;
}

const key = (arr, p) => {
  for (let i = 0; i < arr.length - 1; i++) {
    const [a, av] = arr[i], [b, bv] = arr[i + 1];
    if (p >= a && p <= b) { const k = (p - a) / (b - a); return av + (bv - av) * (k * k * (3 - 2 * k)); }
  }
  return arr[arr.length - 1][1];
};

/* Нить: проходит в просвете между «ИСКУССТВО» и «ОБЪЕДИНЯЕТ»
   и растворяется в осколках, не доходя до витка */
function threadCtrl(gapY, end) {
  return [
    [       -40, gapY + 26, 0.8, 0],
    [       320, gapY + 20, 2.6, .03],
    [       660, gapY + 10, 4.6, .07],
    [       920, gapY +  2, 5.4, .11],
    [end[0] - 96, gapY -  1, 3.4, .15],
    [end[0], end[1], 2.0, .18]
  ];
}

/* Виток: эллипс с наклоном — увеличенная лента из логотипа.
   1,26 оборота по спирали, затем лента отрывается вправо и тает */
function loopCtrl(gapY) {
  const C = [1470, gapY - 4], rx = 300, ry = 198, tilt = -12 * Math.PI / 180;
  const WK = [[0,2],[.05,9],[.15,26],[.32,43],[.47,48],[.6,41],[.74,29],[.88,19],[1,13]];
  const th0 = 197.9, th1 = 197.9 + 455, steps = 46;   /* вход строго на уровне просвета */
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const p = i / steps, th = (th0 + (th1 - th0) * p) * Math.PI / 180;
    const s = 0.86 + 0.34 * p;   /* спираль: второй виток идёт снаружи первого */
    const x = rx * Math.cos(th) * s, y = ry * Math.sin(th) * s;
    pts.push([
      C[0] + x * Math.cos(tilt) - y * Math.sin(tilt),
      C[1] + x * Math.sin(tilt) + y * Math.cos(tilt),
      key(WK, p),
      0.18 + 0.76 * p
    ]);
  }
  pts.push([1706, gapY - 236, 10, .97], [1848, gapY - 224, 5, .99], [1944, gapY - 214, 0.5, 1]);
  return { pts, C };
}

const SHARD_COLORS = LIGHT ? [
  [214, 28, 40], [240, 96, 58], [236, 158, 52], [42, 98, 214], [22, 60, 130],
  [126, 148, 190], [98, 68, 186], [38, 158, 172], [226, 96, 130]
] : [
  [232, 35, 42], [255, 90, 60], [255, 178, 89], [62, 123, 240], [27, 75, 155],
  [238, 243, 255], [124, 92, 214], [72, 196, 206], [255, 120, 150]
];
const SPARK = LIGHT ? [16, 42, 92] : [255, 244, 230];

const poly = o => `<polygon points="${o.pts.map(p => p.join(',')).join(' ')}" fill="${o.fill}"/>`;

/* ─────────────────────────────────────────────────────────────
   Пояс орнаментов народов России внутри витка: мотивы разных
   культур, сшитые в одно непрерывное кольцо. Клетки-стежки
   ложатся в плоскость ленты, поэтому у пояса есть перспектива.
   ───────────────────────────────────────────────────────────── */
const MOTIFS = [
  /* ромб с лучами — славянская вышивка */
  ['.c..a..c.',
   '..a.a.a..',
   'a..aaa..a',
   '..a.a.a..',
   '.c..a..c.'],
  /* восьмиконечная звезда — алатырь */
  ['b..b.b..b',
   '.b.b.b.b.',
   'bbb.c.bbb',
   '.b.b.b.b.',
   'b..b.b..b'],
  /* бараний рог — кавказский и калмыцкий мотив */
  ['.ccc.ccc.',
   'c...c...c',
   'c.c.c.c.c',
   'c...c...c',
   '.ccc.ccc.'],
  /* бегущая волна — казачий и морской мотив */
  ['.bb...bb.',
   'b..b.b..b',
   '....b....',
   'b..b.b..b',
   '.bb...bb.'],
  /* тюльпан — степной мотив */
  ['.a..a..a.',
   '.a.aaa.a.',
   '.aaaaaaa.',
   '..aaaaa..',
   '...aaa...'],
  /* солярный крест */
  ['c..c.c..c',
   '.c.c.c.c.',
   'ccccccccc',
   '.c.c.c.c.',
   'c..c.c..c']
];

function ornamentBelt(C, rx, ry, tilt, r0, r1) {
  const P = (r, th) => {
    const x = rx * r * Math.cos(th), y = ry * r * Math.sin(th);
    return (C[0] + x * Math.cos(tilt) - y * Math.sin(tilt)).toFixed(1) + ',' +
           (C[1] + x * Math.sin(tilt) + y * Math.cos(tilt)).toFixed(1);
  };
  const PAL = LIGHT
    ? { a: 'rgba(214,28,40,.55)', b: 'rgba(16,44,96,.48)', c: 'rgba(158,116,48,.58)' }
    : { a: 'rgba(255,86,66,.52)',  b: 'rgba(126,176,255,.42)', c: 'rgba(255,190,120,.52)' };

  const mh = MOTIFS[0].length, W = MOTIFS[0][0].length;
  const rows = mh + 4;                       /* + кайма и отбивка сверху и снизу */
  const rMid = (r0 + r1) / 2;
  const perim = 2 * Math.PI * Math.sqrt(((rx * rMid) ** 2 + (ry * rMid) ** 2) / 2);
  const cell = (r1 - r0) * ((rx + ry) / 2) / rows;
  const reps = Math.max(6, Math.round(perim / cell / (W + 1)));
  const cols = reps * (W + 1);
  const dTh = 2 * Math.PI / cols, dR = (r1 - r0) / rows;

  const buckets = { a: '', b: '', c: '' };
  const put = (ch, i, j) => {
    const th0 = i * dTh, ra = r1 - j * dR, rb = ra - dR * 0.86;
    buckets[ch] += `<polygon points="${P(ra, th0)} ${P(ra, th0 + dTh * .86)} ` +
                   `${P(rb, th0 + dTh * .86)} ${P(rb, th0)}"/>`;
  };

  /* сплошная кайма сверху и снизу — она и сшивает мотивы в один пояс */
  for (let i = 0; i < cols; i++) {
    const ch = i % 2 ? 'b' : 'a';
    put(ch, i, 0); put(ch, i, rows - 1);
  }
  for (let n = 0; n < reps; n++) {
    const m = MOTIFS[n % MOTIFS.length];
    for (let i = 0; i < W; i++)
      for (let j = 0; j < mh; j++)
        if (m[j][i] !== '.') put(m[j][i], n * (W + 1) + i, j + 2);
    put('c', n * (W + 1) + W, 2 + (mh >> 1));   /* связка между мотивами */
  }
  return Object.keys(buckets).map(k => `<g fill="${PAL[k]}">${buckets[k]}</g>`).join('');
}

/* ─────────────────────────────────────────────────────────────
   Медаль внутри витка: чистая сердцевина + тонкий гильош по краю.
   Орнаментальный пояс — только снаружи, не в центре.
   ───────────────────────────────────────────────────────────── */
function rosette(C, rx, ry, tilt) {
  const T = (x, y) => [
    (C[0] + x * Math.cos(tilt) - y * Math.sin(tilt)).toFixed(1),
    (C[1] + x * Math.sin(tilt) + y * Math.cos(tilt)).toFixed(1)
  ];
  const wave = (scale, k, amp, phase, steps = 240) => {
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const th = i / steps * Math.PI * 2;
      const rr = scale * (1 + amp * Math.cos(k * th + phase));
      const p = T(rx * rr * Math.cos(th), ry * rr * Math.sin(th));
      d += (i ? 'L' : 'M') + p[0] + ' ' + p[1];
    }
    return d + 'Z';
  };
  const band = (scale, k, amp, copies, stroke, w) => {
    let g = '';
    for (let j = 0; j < copies; j++) g += `<path d="${wave(scale, k, amp, j * 2 * Math.PI / copies)}"/>`;
    return `<g fill="none" stroke="${stroke}" stroke-width="${w}">${g}</g>`;
  };

  const ink   = LIGHT ? 'rgba(11,27,61,'   : 'rgba(190,215,255,';
  const brass = LIGHT ? 'rgba(158,116,48,' : 'rgba(255,196,124,';
  const a = (light, dark) => (LIGHT ? light : dark) + ')';
  const core = LIGHT ? 'rgba(255,255,255,.92)' : 'rgba(12,24,58,.55)';
  const coreEdge = LIGHT ? 'rgba(214,224,240,.85)' : 'rgba(80,120,200,.22)';

  let out = '';
  /* чистое поле — без гильоша внутри */
  out += `<ellipse cx="${C[0].toFixed(1)}" cy="${C[1].toFixed(1)}" rx="${(rx * 0.46).toFixed(1)}" ` +
         `ry="${(ry * 0.46).toFixed(1)}" fill="${core}" transform="rotate(${(-12).toFixed(1)} ${C[0].toFixed(1)} ${C[1].toFixed(1)})"/>`;
  out += `<ellipse cx="${C[0].toFixed(1)}" cy="${C[1].toFixed(1)}" rx="${(rx * 0.46).toFixed(1)}" ` +
         `ry="${(ry * 0.46).toFixed(1)}" fill="none" stroke="${coreEdge}" stroke-width="1.2" ` +
         `transform="rotate(${(-12).toFixed(1)} ${C[0].toFixed(1)} ${C[1].toFixed(1)})"/>`;

  /* тонкая звезда-алатырь — едва заметный замок */
  let star = '';
  for (let i = 0; i < 16; i++) {
    const th = i / 16 * Math.PI * 2, s = i % 2 ? 0.04 : 0.11;
    const p = T(rx * s * Math.cos(th), ry * s * Math.sin(th));
    star += (i ? 'L' : 'M') + p[0] + ' ' + p[1];
  }
  out += `<path d="${star}Z" fill="none" stroke="${brass}${a('.35', '.22')}" stroke-width=".9"/>`;

  /* один тонкий гильошевый пояс — только по периметру медали */
  out += band(0.72, 28, 8 / (0.72 * rx), 6, ink + a('.12', '.08'), .45);
  out += `<path d="${wave(0.78, 1, 0, 0)}" fill="none" stroke="${ink}${a('.14', '.09')}" stroke-width=".8"/>`;
  out += `<path d="${wave(1.30, 1, 0, 0, 200)}" fill="none" stroke="${ink}${a('.16', '.10')}" stroke-width="1.1"/>`;

  /* «жемчужный» ободок */
  let beads = '';
  for (let i = 0; i < 120; i++) {
    const th = i / 120 * Math.PI * 2;
    const p = T(rx * 1.36 * Math.cos(th), ry * 1.36 * Math.sin(th));
    beads += `<circle cx="${p[0]}" cy="${p[1]}" r="1.8"/>`;
  }
  out += `<g fill="${ink}${a('.22', '.14')}">${beads}</g>`;

  return `<g>${out}</g>`;
}

/* ─────────────────────────────────────────────────────────────
   Объёмные инструменты — как на дипломе: разбросаны вокруг витка
   и частично перекрываются лентой (часть за, часть перед).
   ───────────────────────────────────────────────────────────── */
function propDefs() {
  return `
    <filter id="propSh" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="2" dy="14" stdDeviation="16" flood-color="#0A1330" flood-opacity="${LIGHT ? .22 : .42}"/>
    </filter>
    <filter id="propHi" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <filter id="propIn" x="-20%" y="-20%" width="140%" height="140%">
      <feOffset dx="1" dy="2"/><feGaussianBlur stdDeviation="3" result="b"/>
      <feComposite in="SourceGraphic" in2="b" operator="over"/>
    </filter>
    <linearGradient id="gGold" x1=".15" y1="0" x2=".85" y2="1">
      <stop offset="0" stop-color="${LIGHT ? '#F5E6BC' : '#F0DEB8'}"/>
      <stop offset=".35" stop-color="${LIGHT ? '#C9983A' : '#D4A040'}"/>
      <stop offset=".7" stop-color="${LIGHT ? '#A07828' : '#B08830'}"/>
      <stop offset="1" stop-color="${LIGHT ? '#6A5018' : '#785820'}"/>
    </linearGradient>
    <linearGradient id="gGoldD" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${LIGHT ? '#8A6830' : '#9A7838'}"/>
      <stop offset="1" stop-color="${LIGHT ? '#4A3810' : '#584818'}"/>
    </linearGradient>
    <linearGradient id="gWood" x1=".2" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="${LIGHT ? '#B88850' : '#C89858'}"/>
      <stop offset=".5" stop-color="${LIGHT ? '#8A5830' : '#986840'}"/>
      <stop offset="1" stop-color="${LIGHT ? '#5A3818' : '#684820'}"/>
    </linearGradient>
    <radialGradient id="gWoodR" cx=".38" cy=".32" r=".68">
      <stop offset="0" stop-color="${LIGHT ? '#D4A868' : '#E0B878'}"/>
      <stop offset=".55" stop-color="${LIGHT ? '#9A6838' : '#A87848'}"/>
      <stop offset="1" stop-color="${LIGHT ? '#4A2810' : '#583018'}"/>
    </radialGradient>
    <linearGradient id="gMask" x1=".3" y1="0" x2=".7" y2="1">
      <stop offset="0" stop-color="${LIGHT ? '#F8F0E4' : '#F0E8DC'}"/>
      <stop offset=".6" stop-color="${LIGHT ? '#D8C4A0' : '#E0CCAA'}"/>
      <stop offset="1" stop-color="${LIGHT ? '#A88860' : '#B89870'}"/>
    </linearGradient>
    <linearGradient id="gStr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E8E8F0"/><stop offset="1" stop-color="#A8A8B8"/>
    </linearGradient>`;
}

function wrapProp(x, y, s, r, inner) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r}) scale(${s})" filter="url(#propSh)">${inner}</g>`;
}

/* винтажный студийный микрофон — как на дипломе */
function propMicrophone(x, y, s, r) {
  return wrapProp(x, y, s, r, `
    <g transform="translate(-55,-130)">
      <path d="M34 148h42v8c0 6-9 10-21 10s-21-4-21-10v-8Z" fill="url(#gGoldD)"/>
      <rect x="48" y="128" width="14" height="22" rx="3" fill="url(#gGoldD)"/>
      <ellipse cx="55" cy="128" rx="26" ry="8" fill="#5A4018" opacity=".5"/>
      <path d="M18 72a37 37 0 0 0 74 0" fill="none" stroke="url(#gGold)" stroke-width="5.5"/>
      <path d="M22 72a33 33 0 0 0 66 0" fill="none" stroke="#6A5018" stroke-width="1.2" opacity=".45"/>
      <rect x="30" y="68" width="50" height="8" rx="2" fill="url(#gGoldD)"/>
      <rect x="34" y="8" width="42" height="64" rx="21" fill="url(#gGold)"/>
      <rect x="38" y="12" width="34" height="56" rx="17" fill="url(#gGoldD)" opacity=".35"/>
      <path d="M40 24h30M40 34h30M40 44h30M40 54h30" stroke="#6A5018" stroke-width="1" opacity=".55"/>
      <path d="M42 18v52M52 18v52M62 18v52" stroke="#6A5018" stroke-width=".8" opacity=".35"/>
      <ellipse cx="55" cy="28" rx="14" ry="18" fill="#FFF" opacity="${LIGHT ? .22 : .14}" filter="url(#propHi)"/>
      <rect x="51" y="64" width="8" height="10" rx="2" fill="url(#gGoldD)"/>
    </g>`);
}

/* балалайка — узнаваемый треугольный силуэт */
function propBalalaika(x, y, s, r) {
  return wrapProp(x, y, s, r, `
    <g transform="translate(-80,-120)">
      <path d="M80 118 18 198h124Z" fill="url(#gWoodR)" stroke="#4A2810" stroke-width="1.4"/>
      <path d="M80 118 28 188h104Z" fill="none" stroke="#3A1808" stroke-width=".8" opacity=".35"/>
      <path d="M38 168c12-8 32-8 44 0M44 178c8-4 24-4 32 0" fill="none" stroke="#5A3010" stroke-width=".9" opacity=".4"/>
      <circle cx="80" cy="158" r="14" fill="#2A1408" opacity=".55"/>
      <circle cx="80" cy="158" r="10" fill="none" stroke="#6A4020" stroke-width="1"/>
      <path d="M52 138c8-6 20-6 28 0" fill="none" stroke="#8A5830" stroke-width="1.2" opacity=".5"/>
      <rect x="76" y="28" width="8" height="94" rx="3" fill="url(#gWood)"/>
      <path d="M72 38h16M72 52h16M72 66h16M72 80h16" stroke="#4A2810" stroke-width=".7" opacity=".45"/>
      <circle cx="80" cy="22" r="4" fill="#8A6838"/><circle cx="80" cy="34" r="4" fill="#8A6838"/>
      <circle cx="80" cy="46" r="4" fill="#8A6838"/>
      <path d="M80 118v-24" stroke="url(#gStr)" stroke-width="1.2"/>
      <path d="M78 94c-2 18-2 36 0 54M82 94c2 18 2 36 0 54" stroke="url(#gStr)" stroke-width=".7" opacity=".85"/>
      <path d="M76 94c-1 18-1 36 0 54M84 94c1 18 1 36 0 54" stroke="url(#gStr)" stroke-width=".5" opacity=".65"/>
      <path d="M62 108l36-8" stroke="#3A1808" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="68" cy="142" rx="18" ry="10" fill="#FFF" opacity="${LIGHT ? .14 : .08}" filter="url(#propHi)"/>
    </g>`);
}

/* деревянная палитра с кистью */
function propPalette(x, y, s, r) {
  const P = [
    [34, 58, '#2858A8'], [52, 48, '#B82028'], [72, 56, '#C87820'],
    [88, 44, '#287838'], [98, 62, '#683898'], [44, 78, '#C84868']
  ];
  const dots = P.map(([px, py, c]) =>
    `<circle cx="${px}" cy="${py}" r="7" fill="${c}"/>
     <circle cx="${px}" cy="${py}" r="7" fill="none" stroke="#000" stroke-width=".4" opacity=".15"/>
     <ellipse cx="${px - 2}" cy="${py - 2.5}" rx="2.5" ry="1.8" fill="#FFF" opacity=".35"/>`
  ).join('');
  return wrapProp(x, y, s, r, `
    <g transform="translate(-72,-68)">
      <path d="M6 52c0-28 22-48 52-48 20 0 36 10 44 28 10 24-4 50-28 58-10 3-20-1-26-12-8 16-24 24-40 14-10-7-8-22 2-30-12-3-10-18 0-8Z"
            fill="url(#gWood)" stroke="#4A2810" stroke-width="1.3"/>
      <path d="M18 38c16-12 38-12 54 0M24 58c12 8 32 8 44 0" fill="none" stroke="#5A3818" stroke-width=".8" opacity=".35"/>
      <ellipse cx="48" cy="12" rx="9" ry="5.5" fill="#3A2010" opacity=".45"/>
      <ellipse cx="42" cy="28" rx="16" ry="9" fill="#FFF" opacity="${LIGHT ? .16 : .10}" filter="url(#propHi)"/>
      ${dots}
      <path d="M118 24l34-22" stroke="#5A3818" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M148 2c8 5 10 16 5 24-5 8-16 8-22 0-6-8-4-19 4-24" fill="#D8C8A8" stroke="#7A5830" stroke-width="1.2"/>
      <path d="M150 4c5 3 6 10 3 15" fill="none" stroke="#6A4820" stroke-width="1"/>
      <path d="M142 8l12-6" stroke="#8A6840" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    </g>`);
}

/* театральные маски — трагедия и комедия */
function propMasks(x, y, s, r) {
  return wrapProp(x, y, s, r, `
    <g transform="translate(-78,-54)">
      <path d="M6 28c0-10 12-16 22-16s22 6 22 16c0 26-10 50-22 50S6 54 6 28Z"
            fill="url(#gMask)" stroke="#9A7848" stroke-width="1.4"/>
      <path d="M6 28c0-10 12-16 22-16s22 6 22 16c0 26-10 50-22 50S6 54 6 28Z"
            fill="#000" opacity=".06"/>
      <path d="M14 36q6-7 11 0M30 36q6-7 11 0" fill="none" stroke="#6A5030" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 54q8 8 16 0" fill="none" stroke="#6A5030" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="18" cy="32" rx="5" ry="7" fill="#FFF" opacity=".18"/>
      <path d="M58 34c0-10 12-16 22-16s22 6 22 16c0 26-10 50-22 50s-22-24-22-50Z"
            fill="url(#gMask)" stroke="#9A7848" stroke-width="1.4"/>
      <path d="M66 44q6 7 11 0M82 44q6 7 11 0" fill="none" stroke="#6A5030" stroke-width="2" stroke-linecap="round"/>
      <path d="M72 66q8-7 16 0" fill="none" stroke="#6A5030" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M58 34c0-10 12-16 22-16" fill="none" stroke="#FFF" stroke-width="1" opacity=".25"/>
      <ellipse cx="74" cy="38" rx="5" ry="7" fill="#FFF" opacity=".18"/>
    </g>`);
}

function propNote(x, y, s, r, kind) {
  const body = kind === 0
    ? `<path d="M28 88c-8 0-14 6-14 13s6 13 14 13 14-6 14-13-6-13-14-13Z" fill="url(#gGold)"/>
       <rect x="40" y="18" width="4.5" height="72" rx="1.5" fill="url(#gGold)"/>
       <ellipse cx="34" cy="24" rx="5" ry="3" fill="#FFF" opacity=".25"/>`
    : `<path d="M22 82c-7 0-12 5-12 11s5 11 12 11 12-5 12-11-5-11-12-11Z" fill="url(#gGold)"/>
       <path d="M44 76c-7 0-12 5-12 11s5 11 12 11 12-5 12-11-5-11-12-11Z" fill="url(#gGold)"/>
       <rect x="32" y="16" width="4" height="68" rx="1.5" fill="url(#gGold)"/>
       <rect x="52" y="22" width="4" height="56" rx="1.5" fill="url(#gGold)"/>
       <path d="M36 16h20" stroke="url(#gGold)" stroke-width="4.5" stroke-linecap="round"/>`;
  return wrapProp(x, y, s, r, `<g transform="translate(-32,-52)" opacity=".88">${body}</g>`);
}

function propProps(LOOP) {
  const [cx, cy] = LOOP;
  const items = [
    { fn: propMicrophone, x: cx + 192, y: cy - 210, s: 1.62, r: 10, layer: 'back' },
    { fn: propBalalaika,  x: cx + 292, y: cy + 8,   s: 1.72, r: -22, layer: 'front' },
    { fn: propPalette,    x: cx - 288, y: cy + 98,  s: 1.68, r: 6, layer: 'front' },
    { fn: propMasks,      x: cx + 72,  y: cy + 208, s: 1.48, r: -3, layer: 'front' },
    { fn: (x, y, s, r) => propNote(x, y, s, r, 1), x: cx + 138, y: cy - 128, s: 1.05, r: 14, layer: 'front' },
    { fn: (x, y, s, r) => propNote(x, y, s, r, 0), x: cx + 348, y: cy - 82,  s: 0.92, r: -8, layer: 'front' }
  ];
  const mk = layer => items.filter(i => i.layer === layer)
    .map(i => i.fn(i.x, i.y, i.s, i.r)).join('');
  return { back: mk('back'), front: mk('front') };
}

const normal = (path, i) => {
  const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)];
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  return [-dy / l, dx / l];
};

/* лента — цепочка перекрывающихся четырёхугольников с цветом по пути */
function strip(path, forceFill) {
  let out = '';
  for (let i = 0; i < path.length - 2; i++) {
    const a = path[i], b = path[i + 2];
    const nA = normal(path, i), nB = normal(path, i + 2);
    const wA = Math.max(0, a[2]) / 2, wB = Math.max(0, b[2]) / 2;
    let c = ramp(Math.min(1, Math.max(0, a[3])));
    if (a[3] > 0.9) c = c.map(v => Math.round(v * 0.9 + 8));
    out += poly({
      fill: forceFill || rgb(c),
      pts: [
        [a[0] + nA[0]*wA, a[1] + nA[1]*wA], [b[0] + nB[0]*wB, b[1] + nB[1]*wB],
        [b[0] - nB[0]*wB, b[1] - nB[1]*wB], [a[0] - nA[0]*wA, a[1] - nA[1]*wA]
      ].map(p => [p[0].toFixed(1), p[1].toFixed(1)])
    });
  }
  return out;
}

function build(gapY, boxes) {
  const { pts: LOOPC, C: LOOP } = loopCtrl(gapY);
  const RING = catmull(LOOPC);
  const THREAD = catmull(threadCtrl(gapY, LOOPC[0]));
  const ribbon = strip(THREAD) + strip(RING);
  const shade = LIGHT ? strip(THREAD, '#0B1B3D') + strip(RING, '#0B1B3D') : '';

  /* осколки смальты, стягивающиеся к ленте */
  const inBox = (x, y, b) => x > b[0] && y > b[1] && x < b[2] && y < b[3];
  const TILT = -12 * Math.PI / 180;
  const inRing = (x, y) => {
    const dx = x - LOOP[0], dy = y - LOOP[1];
    const xl = dx * Math.cos(TILT) + dy * Math.sin(TILT);
    const yl = -dx * Math.sin(TILT) + dy * Math.cos(TILT);
    return (xl / 300) ** 2 + (yl / 198) ** 2 < 0.36;
  };
  const inCore = (x, y) => {
    const dx = x - LOOP[0], dy = y - LOOP[1];
    const xl = dx * Math.cos(TILT) + dy * Math.sin(TILT);
    const yl = -dx * Math.sin(TILT) + dy * Math.cos(TILT);
    return (xl / 300) ** 2 + (yl / 198) ** 2 < 0.22;
  };
  const props = propProps(LOOP);
  const dust = [];
  for (let n = 0; n < (LIGHT ? 1500 : 2100); n++) {
    const thread = rnd() < 0.44;
    const path = thread ? THREAD : RING;
    const i = thread ? (rnd() * (path.length - 1)) | 0
                     : (Math.pow(rnd(), 0.85) * (path.length - 1)) | 0;
    const p = path[i], nv = normal(path, i), tan = [-nv[1], nv[0]];
    const t = Math.min(1, Math.max(0, p[3]));

    /* у нити осколки разлетаются широко, у витка — жмутся к ленте снаружи */
    const spread = thread ? 210 + 540 * (1 - i / (path.length - 1)) : 250;
    let off = (rnd() - .5) * 2 * spread * Math.pow(rnd(), .5);
    if (!thread && rnd() > 0.24) {                        // наружу от центра витка
      const out = Math.sign(nv[0] * (p[0] - LOOP[0]) + nv[1] * (p[1] - LOOP[1])) || 1;
      off = Math.abs(off) * out;
    }
    const along = (rnd() - .5) * (thread ? 260 : 120);
    const x = p[0] + nv[0] * off + tan[0] * along;
    const y = p[1] + nv[1] * off + tan[1] * along;
    if (x < -40 || x > 1960 || y < -40 || y > 1120) continue;

    const d = Math.min(1, Math.abs(off) / spread);
    const spark = rnd() < 0.16;
    const size = spark ? 1.6 + rnd() * 2.2
                       : 2.2 + (LIGHT ? 10 : 13) * Math.pow(d, 1.4) * (0.35 + rnd());
    let alpha = (1 - d * .5) * (0.16 + rnd() * 0.72) * (spark ? 1.15 : 1);
    for (const b of boxes) if (inBox(x, y, b.r)) alpha *= b.k;
    if (inCore(x, y)) continue;
    if (inRing(x, y)) alpha *= 0.12;
    if (alpha < 0.04) continue;

    const near = rnd() < 0.6 - 0.34 * d;
    const c = spark ? SPARK
                    : near ? ramp(Math.min(1, Math.max(0, t + (rnd() - .5) * .22)))
                           : SHARD_COLORS[(rnd() * SHARD_COLORS.length) | 0];
    const rot = rnd() * Math.PI;
    const k = 0.5 + rnd() * 0.95;
    const el = rnd() < 0.3 ? 0.32 + rnd() * 0.3 : 1;      // часть осколков — тонкие сколы
    const pts = [[-1, -k], [1, -.72], [k, 1], [-.92, .82]].map(([px, py]) => {
      const sx = px * size, sy = py * size * el;
      return [
        (x + sx * Math.cos(rot) - sy * Math.sin(rot)).toFixed(1),
        (y + sx * Math.sin(rot) + sy * Math.cos(rot)).toFixed(1)
      ];
    });
    dust.push({ pts, fill: rgb(c), alpha, far: d > .55 && rnd() < .28 });
  }

  const layer = arr => arr.map(s => `<g opacity="${s.alpha.toFixed(3)}">${poly(s)}</g>`).join('');
  const back = dust.filter(s => !s.far), fore = dust.filter(s => s.far);
  const floor = Math.round(Math.max(...RING.map(p => p[1] + p[2] / 2)) + 26);

  document.getElementById('artBack').innerHTML = `
    <defs>
      <filter id="glowL" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="36"/></filter>
      <filter id="glowS" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="soft"  x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.8"/></filter>
      <filter id="refl"  x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="14"/></filter>
      <linearGradient id="fade" x1="0" y1="${floor}" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#fff" stop-opacity=".5"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <mask id="fadeMask"><rect x="0" y="${floor}" width="1920" height="${1080 - floor}" fill="url(#fade)"/></mask>
      <radialGradient id="core">
        <stop offset="0" stop-color="#FF7A46" stop-opacity="${LIGHT ? .07 : .14}"/>
        <stop offset="1" stop-color="#FF7A46" stop-opacity="0"/>
      </radialGradient>
      ${propDefs()}
    </defs>
    <ellipse cx="${LOOP[0]}" cy="${LOOP[1]}" rx="420" ry="300" fill="url(#core)"/>
    ${rosette(LOOP, 300, 198, -12 * Math.PI / 180)}
    ${ornamentBelt(LOOP, 300, 198, -12 * Math.PI / 180, 0.58, 0.74)}
    ${props.back}
    <g mask="url(#fadeMask)" filter="url(#refl)" opacity="${LIGHT ? .18 : .3}"
       transform="matrix(1,0,0,-1,0,${2 * floor})">${ribbon}</g>
    <g filter="url(#glowL)" opacity="${LIGHT ? .34 : .6}">${ribbon}</g>
    ${LIGHT ? `<g transform="translate(14,20)" filter="url(#glowS)" opacity=".2">${shade}</g>` : ''}
    <g>${layer(back)}</g>
    <g filter="url(#glowS)" opacity="${LIGHT ? .3 : .5}">${ribbon}</g>
    ${ribbon}
    <g filter="url(#soft)">${layer(fore)}</g>`;

  document.getElementById('artProps').innerHTML = `
    <defs>${propDefs()}</defs>
    ${props.front}`;

  /* полоса ровно в просвете строк — здесь лента идёт ПЕРЕД буквами */
  document.getElementById('artFront').innerHTML = `
    <defs>
      <clipPath id="gap"><rect x="0" y="${gapY - 34}" width="${Math.round(LOOPC[0][0]) + 4}" height="68"/></clipPath>
      <filter id="fg" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="7"/></filter>
    </defs>
    <g clip-path="url(#gap)">
      <g filter="url(#fg)" opacity="${LIGHT ? .35 : .65}">${ribbon}</g>
      ${ribbon}
    </g>`;
}

function fit() {
  const k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  document.getElementById('fit').style.transform = `scale(${k})`;
}

(async () => {
  if (LIGHT) {
    document.getElementById('poster').classList.add('light');
    document.getElementById('logoCorp').src = './logos/ktk-corp-navy.png';
    document.getElementById('logo30').src = './logos/ktk30-color.png';
  }
  try { await document.fonts.ready; } catch (e) {}

  const p = document.getElementById('poster').getBoundingClientRect();
  const rel = el => {
    const r = el.getBoundingClientRect(), k = 1920 / p.width;
    return { top: (r.top - p.top) * k, bottom: (r.bottom - p.top) * k,
             left: (r.left - p.left) * k, right: (r.right - p.left) * k };
  };
  const r1 = rel(document.getElementById('ln1'));
  const r2 = rel(document.getElementById('ln2'));
  const gapY = Math.round((r1.bottom + r2.top) / 2);

  const pad = (r, x = 40, y = 24) => [r.left - x, r.top - y, r.right + x, r.bottom + y];
  const boxes = [
    { r: pad(rel(document.querySelector('.stack')), 40, 30), k: .12 },
    { r: pad(rel(document.querySelector('.logo-main')), 60, 40), k: .1 },
    { r: pad(rel(document.querySelector('.logo-corp')), 60, 40), k: .1 },
    { r: pad(rel(document.querySelector('.foot')), 40, 30), k: .18 }
  ];
  build(gapY, boxes);
  document.body.dataset.ready = '1';
})();

fit();
window.addEventListener('resize', fit);
