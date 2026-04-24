//////////////////////////////////////////////////
// 糸島エリアの六角グリッド戦略ゲーム
//////////////////////////////////////////////////

// ---------- 盤面サイズ ----------
const COLS = 14;
const ROWS = 9;

// ---------- ヘックス設定 (pointy-top) ----------
const HEX_SIZE = 60;
const HEX_W = Math.sqrt(3) * HEX_SIZE;
const HEX_H = 2 * HEX_SIZE;
const HEX_VSTEP = 1.5 * HEX_SIZE;
const ISO_SHEAR_X = 0.48;
const ISO_SCALE_Y = 0.75;
const ISO_OFFSET_X = 54;
const ISO_OFFSET_Y = 10;
const ISO_TILE_W = HEX_W * 1.02;
const ISO_TILE_H = HEX_SIZE * 0.9;
const ISO_TILE_DEPTH = 0;
const ISO_TILE_OVERLAP = 2.6;
const ASSET_REV = "20260423a";
const STRUCTURE_VISUAL_SCALE = 0.62;
const TILE_NAME_W = 96;
const TILE_NAME_H = 24;
const TILE_NAME_FONT = 14;

// ---------- UI ----------
const UI_W = 320;
const TOP_H = 64;
const BOTTOM_H = 150;
const PANEL_MIN_H = 560;

// ---------- タイル種別 ----------
const TYPE = {
  UMI: "海",
  HEICHI: "平地",
  YAMA: "山",
  MINATO: "港",
  JINJA: "神社",
  KOBO: "工房",
  JO: "城",
  TERA: "寺",
};

const WORKSHOP_KIND = {
  FABLAB: "fablab",
  WASHI: "washi",
  POTTERY: "pottery",
  GENERIC: "generic",
};

const WORKSHOP_BUILD_OPTIONS = [
  { kind: WORKSHOP_KIND.FABLAB, label: "ファブラボ" },
  { kind: WORKSHOP_KIND.WASHI, label: "和紙工房" },
  { kind: WORKSHOP_KIND.POTTERY, label: "陶芸工房" },
];

const OPENING_STORY = [
  {
    chapter: "序",
    title: "潮境の糸島",
    body: "博多湾の西、玄界灘に向き合う糸島では、海と山の恵みをめぐって三つの勢力がせめぎ合っていた。港は富を運び、峠は兵を導き、社寺は人の心を束ねる。",
    note: "土地を治めるには、武だけでなく文化と商いも要る。",
  },
  {
    chapter: "変",
    title: "都からの圧",
    body: "京からは勅命が下り、諸勢力には祭礼、交易、人集め、開発の成果が求められるようになった。応えられぬ者は名を失い、応えた者は糸島全土に影響を広げていく。",
    note: "数ターンごとに情勢は変わり、機を逃せば主導権は移る。",
  },
  {
    chapter: "起",
    title: "新たな当主",
    body: "いま、あなたは二丈・伊都・志摩のいずれかを率い、この地の行く末を決める。城を築くか、工房を育てるか、信仰と文化で民心をつかむか。",
    note: "クリックで物語を進め、最後に開始勢力を選ぶ。",
  },
];


// ---------- バランス ----------
const CULTURE_FLIP = 14;
const CULTURE_DOMINATE = 5;
const MAX_FLIPS_PER_PLAYER_TURN = 2;
const CULTURE_WIN = 80;
const CONTROL_WIN_RATE = 0.9;

const FORCE_ATTACK = 8;
const FORCE_UPKEEP = 1;
const SOFT_CULTURE = 1;
const INF_DECAY_RATE = 0.9;
const EVENT_SPAWN_RATE = 0.45;
const BUILD_CASTLE_COST = 8;
const BUILD_WORKSHOP_COST = 6;
const CASTLE_ATTACK_DISCOUNT = 1;
const MOUNTAIN_ATTACK_DISCOUNT = 1;
const CASTLE_FLIP_RESIST = 3;
const CASTLE_DEFENSE_PENALTY = 2;
const CASTLE_SIEGE_HITS = 5;
const BUILDING_LEVEL_MAX = 3;
const SHRINE_CULTURE_PULSE = 1;
const WORKSHOP_TRADE_BONUS = 1;
const WORKSHOP_TRADE_BONUS_CAP = 3;
const ACTIONS_PER_TURN = 2;
const MISSION_OFFER_CHANCE = 0.35;
const MISSION_CARRY_TURNS = 2;
const RECRUIT_COST = 4;
const SEASON_SPAN_TURNS = 3;
let HUMAN_PLAYER_ID = 1;
const POP_GROWTH_FOOD_STEP = 6;
const MAX_POP_GROWTH_PER_TURN = 2;

const OFFICER_NAME_POOL = {
  1: ["宗像左近", "高祖玄蕃", "深江兵庫", "雷山内記", "二丈新八", "可也源三"],
  2: ["怡土采女", "高田主水", "今宿織部", "波多江隼人", "周船寺兵部", "志登孫六"],
  3: ["桜井主計", "引津将監", "芥屋大膳", "岐志玄朔", "野北又兵衛", "船越修理"],
};

const CLAN_THEMES = {
  1: {
    id: "futajo",
    accent: [56, 124, 255],
    accentDark: [28, 68, 146],
    accentLight: [201, 223, 255],
    panelA: [234, 240, 250],
    panelB: [205, 218, 236],
    crest: "wave",
  },
  2: {
    id: "ito",
    accent: [236, 96, 84],
    accentDark: [132, 46, 40],
    accentLight: [253, 220, 214],
    panelA: [248, 236, 232],
    panelB: [233, 208, 202],
    crest: "sun",
  },
  3: {
    id: "shima",
    accent: [90, 170, 118],
    accentDark: [42, 98, 60],
    accentLight: [212, 240, 219],
    panelA: [236, 244, 236],
    panelB: [208, 226, 211],
    crest: "leaf",
  },
};

const ART_SPRITES = {
  terrain: {
    sea: { path: `assets/terrain-sea.png?v=${ASSET_REV}`, alpha: 255, scale: 1.04 },
    plains: { path: `assets/terrain-plains.png?v=${ASSET_REV}`, alpha: 255, scale: 1.02 },
    mountain: { path: `assets/terrain-mountain.png?v=${ASSET_REV}`, alpha: 255, scale: 1.04 },
  },
  structures: {
    port: { path: `assets/structure-port.png?v=${ASSET_REV}`, scale: 1.24, anchorY: 0.72 },
    castle: { path: `assets/structure-castle.png?v=${ASSET_REV}`, scale: 1.3, anchorY: 0.78 },
    shrine: { path: `assets/structure-shrine.png?v=${ASSET_REV}`, scale: 1.2, anchorY: 0.76 },
    temple: { path: `assets/structure-temple.png?v=${ASSET_REV}`, scale: 1.22, anchorY: 0.76 },
    workshop: { path: `assets/structure-workshop.png?v=${ASSET_REV}`, scale: 1.18, anchorY: 0.76 },
    workshopFablab: { path: `assets/structure-workshop-fablab.png?v=${ASSET_REV}`, scale: 1.18, anchorY: 0.76 },
    workshopWashi: { path: `assets/structure-workshop-washi.png?v=${ASSET_REV}`, scale: 1.18, anchorY: 0.76 },
    workshopPottery: { path: `assets/structure-workshop-pottery.png?v=${ASSET_REV}`, scale: 1.18, anchorY: 0.76 },
    mountain: { path: `assets/structure-mountain.png?v=${ASSET_REV}`, scale: 1.16, anchorY: 0.8 },
    mountainRaizan: { path: `assets/structure-mountain-raizan.png?v=${ASSET_REV}`, scale: 1.78, anchorY: 0.84 },
    mountainKeyaCave: { path: `assets/structure-mountain-keya-cave.png?v=${ASSET_REV}`, scale: 1.16, anchorY: 0.72 },
    mountainKaya: { path: `assets/structure-mountain-kaya.png?v=${ASSET_REV}`, scale: 1.28, anchorY: 0.76 },
  },
  events: {
    C01: { path: `assets/event-C01.png?v=${ASSET_REV}` },
    C02: { path: `assets/event-C02.png?v=${ASSET_REV}` },
    C03: { path: `assets/event-C03.png?v=${ASSET_REV}` },
    C04: { path: `assets/event-C04.png?v=${ASSET_REV}` },
    C05: { path: `assets/event-C05.png?v=${ASSET_REV}` },
    C06: { path: `assets/event-C06.png?v=${ASSET_REV}` },
    C07: { path: `assets/event-C07.png?v=${ASSET_REV}` },
    C08: { path: `assets/event-C08.png?v=${ASSET_REV}` },
    E01: { path: `assets/event-E01.png?v=${ASSET_REV}` },
    E02: { path: `assets/event-E02.png?v=${ASSET_REV}` },
    W01: { path: `assets/event-C03.png?v=${ASSET_REV}` },
    W02: { path: `assets/event-W02.png?v=${ASSET_REV}` },
    W03: { path: `assets/event-W03.png?v=${ASSET_REV}` },
    H01: { path: `assets/event-E01.png?v=${ASSET_REV}` },
    H02: { path: `assets/event-C04.png?v=${ASSET_REV}` },
    recruitOfficer: { path: `assets/event-recruit-officer.png?v=${ASSET_REV}` },
    imperialMission: { path: `assets/event-imperial-mission.png?v=${ASSET_REV}` },
    castleFall: { path: `assets/event-castle-fall.png?v=${ASSET_REV}` },
  },
};

// ---------- 迥ｶ諷・----------
let grid = [];
let centers = [];
let selected = { c: 0, r: 0 };
let attackMode = { active: false, from: null };

let players = [];
let currentPlayer = 0;
let turn = 1;
let message = "ヘックスをクリックして、右のボタンで行動してね。";
let latestComment = "";
let incomeReport = {};
let flipCapturesThisTurn = {};
let missionStateByPlayer = {};

let gameState = "playing"; // "playing" | "win" | "lose"
let winText = "";

let eventUsedThisTurn = false;
let eventUsedByPlayer = {};
let eventReadyThisTurn = {};
let tradeUsedThisTurn = false;
let deck = [];
let discard = [];
let actionsLeft = {};
let seasonState = {
  id: "fishing",
  name: "豊漁期",
  desc: "港交易+2 / 漁港食料+1",
  portTradeBonus: 2,
  fishingFoodBonus: 1,
  mountainAttackPenalty: 0,
  mountainResistBonus: 0,
  shrineCultureActionBonus: 0,
  shrineSpreadBonus: 0,
};
let eventPopup = {
  open: false,
  title: "",
  desc: "",
  effectText: "",
  usedLabel: "",
  cardId: "",
  artId: "",
};
let workshopBuildPopup = { open: false, c: -1, r: -1 };
let battlePopup = {
  open: false,
  phase: "choose",
  from: null,
  target: null,
  need: 0,
  tacticId: "",
  resultText: "",
  resultLines: [],
};
let siegeScene = {
  open: false,
  tactic: null,
  from: null,
  target: null,
  startedAt: 0,
  phase: "command",
  round: 1,
  maxRounds: 3,
  hp: 0,
  hpMax: 0,
  baseCost: 0,
  extraCost: 0,
  logs: [],
  lastCommand: null,
  lastOutcome: null,
  resolved: false,
  resultText: "",
  resultLines: [],
};
let tileFx = [];

let buttons = [];

let mountainPassTurns = {};
let soundtrack = {
  enabled: true,
  ready: false,
  step: 0,
  nextAt: 0,
  tempo: 94,
  themeId: "futajo",
  phrase: [0, 2, 4, 7, 9, 7, 4, 2, 0, -3, 0, 2, 4, 2, 0, -3],
  button: { x: 0, y: 0, w: 124, h: 28 },
};
let openingStory = {
  open: true,
  index: 0,
};
let startPickPopup = { open: true };
let artLibrary = {
  status: "idle",
  total: 0,
  loaded: 0,
  failed: 0,
  images: {},
};

// 盤面のズーム/パン（将来拡張）
let boardX = 18;
let boardY = TOP_H + 12;
let camera = { x: 0, y: 0, zoom: 1 };
let cameraShake = { framesLeft: 0, strength: 0 };

// 山越え効果ターン

function collectArtSpriteDefs() {
  const defs = [];
  for (const groupName of Object.keys(ART_SPRITES)) {
    const group = ART_SPRITES[groupName];
    for (const key of Object.keys(group)) {
      defs.push({
        id: `${groupName}.${key}`,
        group: groupName,
        key,
        ...group[key],
      });
    }
  }
  return defs;
}

function initArtLibrary() {
  const defs = collectArtSpriteDefs();
  artLibrary = {
    status: defs.length ? "loading" : "idle",
    total: defs.length,
    loaded: 0,
    failed: 0,
    images: {},
  };
  defs.forEach((def) => {
    artLibrary.images[def.id] = {
      img: null,
      ready: false,
      failed: false,
      ...def,
    };
    loadImage(def.path, (img) => {
      artLibrary.loaded += 1;
      artLibrary.images[def.id] = {
        img,
        ready: true,
        failed: false,
        ...def,
      };
      if (artLibrary.loaded + artLibrary.failed >= artLibrary.total) artLibrary.status = "ready";
    }, () => {
      artLibrary.failed += 1;
      artLibrary.images[def.id] = {
        img: null,
        ready: false,
        failed: true,
        ...def,
      };
      if (artLibrary.loaded + artLibrary.failed >= artLibrary.total) artLibrary.status = "ready";
    });
  });
}

function artEntry(id) {
  return artLibrary.images[id] || null;
}

function structureArtId(tile) {
  if (tile.type === TYPE.JO) return "structures.castle";
  if (tile.type === TYPE.MINATO) return "structures.port";
  if (tile.type === TYPE.JINJA) return "structures.shrine";
  if (tile.type === TYPE.TERA) return "structures.temple";
  if (tile.type === TYPE.YAMA) return mountainStructureArtId(tile);
  if (tile.type === TYPE.KOBO) {
    const kind = workshopKind(tile);
    if (kind === WORKSHOP_KIND.FABLAB) return "structures.workshopFablab";
    if (kind === WORKSHOP_KIND.WASHI) return "structures.workshopWashi";
    if (kind === WORKSHOP_KIND.POTTERY) return "structures.workshopPottery";
    return "structures.workshop";
  }
  return null;
}

function mountainStructureArtId(tile) {
  const name = tile?.name || "";
  if (name.includes("雷山")) return "structures.mountainRaizan";
  if (name.includes("立石山") || name.includes("芥屋")) return "structures.mountainKeyaCave";
  if (name.includes("可也山")) return "structures.mountainKaya";
  return "structures.mountain";
}

function terrainArtId(tile) {
  if (tile.type === TYPE.UMI) return "terrain.sea";
  return "terrain.plains";
}

function drawImageCover(img, x, y, w, h) {
  const srcRatio = img.width / max(1, img.height);
  const dstRatio = w / max(1, h);
  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;
  if (srcRatio > dstRatio) {
    dh = h;
    dw = h * srcRatio;
    dx = x - (dw - w) / 2;
  } else {
    dw = w;
    dh = w / srcRatio;
    dy = y - (dh - h) / 2;
  }
  image(img, dx, dy, dw, dh);
}

function clipToPolygon(points) {
  const ctx = drawingContext;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.clip();
}

function drawTerrainArtOverlay(tile, pts) {
  const entry = artEntry(terrainArtId(tile));
  if (!entry || !entry.ready || !entry.img) return false;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = min(...xs);
  const maxX = max(...xs);
  const minY = min(...ys);
  const maxY = max(...ys);
  const padX = (maxX - minX) * ((entry.scale || 1) - 1) * 0.5;
  const padY = (maxY - minY) * ((entry.scale || 1) - 1) * 0.5;
  push();
  drawingContext.save();
  clipToPolygon(pts);
  tint(255, entry.alpha || 255);
  drawImageCover(entry.img, minX - padX, minY - padY, (maxX - minX) + padX * 2, (maxY - minY) + padY * 2);
  noTint();
  drawingContext.restore();
  pop();
  return true;
}

function drawStructureArt(tile, x, y, size = 18) {
  const id = structureArtId(tile);
  if (!id) return false;
  const entry = artEntry(id);
  if (!entry || !entry.ready || !entry.img) return false;
  const scale = entry.scale || 1;
  const h = size * 2.55 * scale * STRUCTURE_VISUAL_SCALE;
  const w = h * (entry.img.width / max(1, entry.img.height));
  const anchorY = entry.anchorY == null ? 0.76 : entry.anchorY;
  push();
  imageMode(CORNER);
  tint(255, entry.alpha || 255);
  image(entry.img, x - w / 2, y - h * anchorY, w, h);
  noTint();
  pop();
  return true;
}

function preload() {
  initArtLibrary();
}

function setup() {
  const bounds = boardScreenBounds();
  const boardPixelW = ceil(bounds.maxX + 30);
  const boardPixelH = ceil(bounds.maxY + 36);
  const contentH = max(boardPixelH, TOP_H + PANEL_MIN_H);
  const canvas = createCanvas(boardPixelW + UI_W, contentH + BOTTOM_H);
  canvas.parent("app");

  textFont('"BIZ UDPMincho", "Yu Mincho", "Hiragino Mincho ProN", serif');
  initializeGame();
  openOpeningStory();
}

function startBaseTile(playerId) {
  if (playerId === 1) return { c: 4, r: 6 };
  if (playerId === 2) return { c: 10, r: 4 };
  return { c: 8, r: 2 };
}

function startBaseName(playerId) {
  if (playerId === 1) return "二丈城";
  if (playerId === 2) return "怡土城";
  return "桜井神社";
}

function openOpeningStory() {
  openingStory.open = true;
  openingStory.index = 0;
  startPickPopup.open = false;
  message = "オープニングストーリーを読んでください。";
}

function advanceOpeningStory() {
  if (!openingStory.open) return;
  if (openingStory.index < OPENING_STORY.length - 1) {
    openingStory.index++;
    return;
  }
  openingStory.open = false;
  openStartPickPopup();
}

function openStartPickPopup() {
  startPickPopup.open = true;
  message = "開始勢力を選んでください。";
}

function openInfoPopup(title, desc, effectText, usedLabel = "確認", cardId = "", artId = "") {
  eventPopup = {
    open: true,
    title,
    desc,
    effectText,
    usedLabel,
    cardId,
    artId,
  };
}

function beginGameAs(playerId) {
  HUMAN_PLAYER_ID = playerId;
  initializeGame();
  openingStory.open = false;
  startPickPopup.open = false;
  currentPlayer = max(0, players.findIndex((p) => p.id === HUMAN_PLAYER_ID));
  selected = startBaseTile(HUMAN_PLAYER_ID);
  const me = playerById(HUMAN_PLAYER_ID);
  message = `${me.name}として開始 (${startBaseName(HUMAN_PLAYER_ID)})`;
  openMissionPopup(HUMAN_PLAYER_ID);
}

function startPickPopupRect() {
  const w = min(640, width - 80);
  const h = 260;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

function startPickOptionRects() {
  const r = startPickPopupRect();
  const gap = 14;
  const w = (r.w - 56 - gap * 2) / 3;
  const y = r.y + 112;
  return players.map((p, i) => ({
    id: p.id,
    name: p.name,
    base: startBaseName(p.id),
    x: r.x + 28 + i * (w + gap),
    y,
    w,
    h: 102,
  }));
}

function pickStartOption(mx, my) {
  for (const op of startPickOptionRects()) {
    if (mx >= op.x && mx <= op.x + op.w && my >= op.y && my <= op.y + op.h) return op;
  }
  return null;
}

function clanTheme(playerId) {
  return CLAN_THEMES[playerId] || CLAN_THEMES[1];
}

function currentTheme() {
  const p = players[currentPlayer] || playerById(HUMAN_PLAYER_ID) || players[0];
  return clanTheme(p ? p.id : 1);
}

function themeColor(theme, key, alpha = 255) {
  const src = theme[key];
  return color(src[0], src[1], src[2], alpha);
}

function soundtrackThemeConfig(themeId) {
  if (themeId === "ito") {
    return {
      tempo: 102,
      phrase: [0, 3, 7, 10, 7, 3, 0, -2, 0, 5, 8, 12, 8, 5, 3, 0],
    };
  }
  if (themeId === "shima") {
    return {
      tempo: 90,
      phrase: [0, 2, 5, 9, 5, 2, -1, -3, 0, 2, 4, 7, 4, 2, 0, -5],
    };
  }
  return {
    tempo: 94,
    phrase: [0, 2, 4, 7, 9, 7, 4, 2, 0, -3, 0, 2, 4, 2, 0, -3],
  };
}

function updateSoundtrackTheme(force = false) {
  const theme = currentTheme();
  if (!theme) return;
  if (!force && soundtrack.themeId === theme.id) return;
  const cfg = soundtrackThemeConfig(theme.id);
  soundtrack.themeId = theme.id;
  soundtrack.tempo = cfg.tempo;
  soundtrack.phrase = [...cfg.phrase];
  soundtrack.step = 0;
  if (soundtrack.ready && soundtrack.ctx) {
    soundtrack.nextAt = soundtrack.ctx.currentTime + 0.06;
  }
}

function triggerCameraShake(strength = 7, frames = 12) {
  cameraShake.framesLeft = max(cameraShake.framesLeft, frames);
  cameraShake.strength = max(cameraShake.strength, strength);
}

function updateCameraShake() {
  if (cameraShake.framesLeft <= 0) {
    camera.x = 0;
    camera.y = 0;
    cameraShake.strength = 0;
    return;
  }
  const t = cameraShake.framesLeft / 12;
  const s = cameraShake.strength * t;
  camera.x = sin(frameCount * 1.9) * s;
  camera.y = cos(frameCount * 2.3) * s * 0.7;
  cameraShake.framesLeft -= 1;
}

function drawClanCrestMark(kind, x, y, size, col, alpha = 255) {
  push();
  translate(x, y);
  stroke(red(col), green(col), blue(col), alpha);
  fill(red(col), green(col), blue(col), alpha * 0.2);
  strokeWeight(1.8);
  if (kind === "wave") {
    noFill();
    arc(-size * 0.18, 0, size * 0.9, size * 0.9, PI * 0.15, PI * 0.95);
    arc(size * 0.18, 0, size * 0.9, size * 0.9, PI * 1.05, PI * 1.85);
    line(-size * 0.68, 0, size * 0.68, 0);
  } else if (kind === "sun") {
    ellipse(0, 0, size * 1.05, size * 1.05);
    for (let i = 0; i < 8; i++) {
      const a = (TWO_PI / 8) * i;
      line(cos(a) * size * 0.78, sin(a) * size * 0.78, cos(a) * size * 1.18, sin(a) * size * 1.18);
    }
  } else {
    beginShape();
    vertex(0, -size * 1.02);
    bezierVertex(size * 0.94, -size * 0.62, size * 0.78, size * 0.42, 0, size * 1.12);
    bezierVertex(-size * 0.78, size * 0.42, -size * 0.94, -size * 0.62, 0, -size * 1.02);
    endShape(CLOSE);
    line(0, -size * 0.82, 0, size * 0.82);
  }
  pop();
}

function drawStartPickPopup() {
  if (!startPickPopup.open) return;
  fill(0, 120);
  rect(0, 0, width, height);

  const r = startPickPopupRect();
  drawPanelCard(r.x, r.y, r.w, r.h, 22);

  noStroke();
  fill(24, 38, 56);
  textAlign(LEFT, TOP);
  textSize(24);
  text("開始勢力を選択", r.x + 24, r.y + 20);
  fill(75);
  textSize(13);
  text("自分が操作する勢力を1つ選んで開始します。", r.x + 24, r.y + 60);

  for (const op of startPickOptionRects()) {
    const theme = clanTheme(op.id);
    fill(255);
    noStroke();
    rect(op.x + 5, op.y + 7, op.w, op.h, 14);
    stroke(32, 32, 32, 180);
    strokeWeight(1.4);
    fill(255);
    rect(op.x, op.y, op.w, op.h, 14);
    drawClanCrestMark(theme.crest, op.x + op.w - 22, op.y + 22, 9, themeColor(theme, "accentDark"), 190);
    noStroke();
    fill(0);
    textSize(18);
    textAlign(LEFT, TOP);
    text(op.name, op.x + 12, op.y + 10);
    textSize(12);
    fill(0);
    text(`拠点: ${op.base}`, op.x + 12, op.y + 42);
    fill(40);
    text("クリックで開始", op.x + 12, op.y + 68);
  }
}

function openingStoryRect() {
  const w = min(760, width - 80);
  const h = min(560, height - 70);
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

function openingStoryNextRect() {
  const r = openingStoryRect();
  return { x: r.x + r.w - 196, y: r.y + r.h - 64, w: 160, h: 40 };
}

function openingStoryNextContains(mx, my) {
  const r = openingStoryNextRect();
  return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
}

function drawOpeningStory() {
  if (!openingStory.open) return;
  const page = OPENING_STORY[openingStory.index] || OPENING_STORY[0];
  const theme = clanTheme((openingStory.index % 3) + 1);
  const r = openingStoryRect();

  fill(7, 10, 18, 170);
  rect(0, 0, width, height);
  drawPanelCard(r.x, r.y, r.w, r.h, 24);
  drawThemeFrame(r.x, r.y, r.w, r.h, theme, 24);
  fillLinearGradientRect(r.x + 18, r.y + 18, r.w - 36, 180,
    color(36, 54, 84, 242), themeColor(theme, "accentDark"), false, 18);

  const badgeW = 70;
  fill(248, 236, 202, 230);
  noStroke();
  rect(r.x + 28, r.y + 28, badgeW, 28, 14);
  fill(74, 54, 24);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(page.chapter, r.x + 28 + badgeW / 2, r.y + 42);

  fill(255, 248, 236);
  textAlign(LEFT, TOP);
  textSize(30);
  text(page.title, r.x + 28, r.y + 70);

  fill(226, 232, 242);
  textSize(15);
  text("糸島三国記 オープニング", r.x + 30, r.y + 124);

  const artX = r.x + 26;
  const artY = r.y + 176;
  const artW = r.w - 52;
  const artH = 168;
  fillLinearGradientRect(artX, artY, artW, artH, themeColor(theme, "accentLight"), color(244, 236, 220), true, 20);
  noStroke();
  for (let i = 0; i < 6; i++) {
    fill(255, 255, 255, 36);
    ellipse(artX + 70 + i * 105, artY + 44 + sin(frameCount * 0.03 + i) * 10, 72, 26);
  }
  fill(92, 122, 136, 170);
  rect(artX, artY + artH - 42, artW, 42, 0, 0, 20, 20);
  drawClanCrestMark(theme.crest, artX + 90, artY + 92, 28, themeColor(theme, "accentDark"), 130);
  drawClanCrestMark("sun", artX + artW - 132, artY + 82, 22, color(242, 182, 92), 120);
  drawClanCrestMark("leaf", artX + artW * 0.52, artY + 106, 24, color(72, 124, 88), 120);

  fill(34, 36, 42);
  textAlign(LEFT, TOP);
  textSize(17);
  text(page.body, r.x + 34, r.y + 372, r.w - 68, 96);

  fill(themeColor(theme, "accentDark"));
  textSize(14);
  text(page.note, r.x + 34, r.y + 470, r.w - 240, 40);

  fill(108);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(`${openingStory.index + 1} / ${OPENING_STORY.length}`, r.x + 34, r.y + r.h - 44);

  const next = openingStoryNextRect();
  fillLinearGradientRect(next.x, next.y, next.w, next.h, themeColor(theme, "accent"), themeColor(theme, "accentDark"), false, 12);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text(openingStory.index === OPENING_STORY.length - 1 ? "勢力選択へ" : "次へ", next.x + next.w / 2, next.y + next.h / 2);

  fill(96);
  textSize(12);
  text("画面クリックでも進行できます。", r.x + r.w - 216, r.y + r.h - 86);
}
function drawUiIcon(kind, x, y, size = 8) {
  push();
  translate(x, y);
  stroke(30);
  strokeWeight(1.4);
  noFill();
  if (kind === "food") {
    stroke(196, 136, 46);
    line(0, size * 0.9, 0, -size * 0.9);
    line(-size * 0.45, size * 0.35, 0, -size * 0.25);
    line(size * 0.45, size * 0.2, 0, -size * 0.4);
  } else if (kind === "gold") {
    fill(245, 194, 54);
    stroke(172, 120, 22);
    ellipse(0, 0, size * 1.8, size * 1.1);
  } else if (kind === "culture") {
    stroke(230, 108, 58);
    fill(255, 228, 190);
    beginShape();
    vertex(-size * 0.75, size * 0.7);
    vertex(-size * 0.35, -size * 0.7);
    vertex(size * 0.75, -size * 0.15);
    vertex(size * 0.35, size * 0.85);
    endShape(CLOSE);
  } else if (kind === "force") {
    stroke(88, 88, 102);
    line(-size * 0.7, size * 0.7, size * 0.65, -size * 0.65);
    line(-size * 0.25, size * 0.95, size * 0.95, -size * 0.25);
  } else if (kind === "washi") {
    fill(250, 250, 246);
    stroke(120, 120, 120);
    rect(-size * 0.8, -size * 0.95, size * 1.4, size * 1.9, 2);
    line(size * 0.3, -size * 0.95, size * 0.65, -size * 0.55);
  } else if (kind === "pottery") {
    stroke(142, 88, 55);
    fill(224, 164, 126);
    beginShape();
    vertex(-size * 0.45, -size * 0.75);
    vertex(size * 0.45, -size * 0.75);
    vertex(size * 0.32, size * 0.4);
    vertex(0, size * 0.9);
    vertex(-size * 0.32, size * 0.4);
    endShape(CLOSE);
  } else if (kind === "innovation") {
    stroke(232, 188, 42);
    fill(252, 232, 120);
    ellipse(0, -size * 0.08, size * 1.15, size * 1.15);
    stroke(150, 120, 22);
    line(-size * 0.6, size * 0.95, size * 0.6, size * 0.95);
  } else if (kind === "event") {
    stroke(78, 88, 176);
    fill(186, 198, 252);
    rect(-size * 0.85, -size * 0.75, size * 1.7, size * 1.5, 3);
    line(-size * 0.45, -size * 0.15, 0, size * 0.25);
    line(0, size * 0.25, size * 0.5, -size * 0.25);
  } else if (kind === "action") {
    stroke(42, 140, 196);
    fill(126, 210, 255);
    triangle(-size * 0.65, -size * 0.8, -size * 0.65, size * 0.8, size * 0.85, 0);
  } else if (kind === "flip") {
    stroke(190, 104, 50);
    fill(246, 198, 132);
    arc(-size * 0.12, 0, size * 1.45, size * 1.45, PI * 0.22, PI * 1.62);
    line(size * 0.55, -size * 0.22, size * 0.9, -size * 0.05);
    line(size * 0.9, -size * 0.05, size * 0.65, size * 0.28);
  } else if (kind === "trade") {
    stroke(60, 122, 186);
    noFill();
    arc(-size * 0.2, 0, size * 1.45, size * 1.45, PI * 1.05, PI * 1.95);
    line(size * 0.55, -size * 0.52, size * 0.95, -size * 0.52);
    line(size * 0.95, -size * 0.52, size * 0.75, -size * 0.25);
  } else if (kind === "castle") {
    stroke(102, 76, 56);
    fill(210, 186, 166);
    rect(-size * 0.9, -size * 0.8, size * 1.8, size * 1.6, 2);
    fill(110, 82, 62);
    rect(-size * 0.24, size * 0.05, size * 0.48, size * 0.75, 1.5);
  } else if (kind === "workshop") {
    stroke(108, 108, 132);
    noFill();
    ellipse(0, 0, size * 1.35, size * 1.35);
    for (let i = 0; i < 6; i++) {
      const a = (TWO_PI / 6) * i;
      line(cos(a) * size * 0.72, sin(a) * size * 0.72, cos(a) * size * 1.05, sin(a) * size * 1.05);
    }
  } else if (kind === "recruit") {
    stroke(84, 90, 120);
    fill(226, 232, 246);
    ellipse(0, -size * 0.45, size * 0.9, size * 0.9);
    noFill();
    arc(0, size * 0.45, size * 1.7, size * 1.4, PI, TWO_PI);
    line(size * 0.95, -size * 0.2, size * 1.45, -size * 0.2);
    line(size * 1.2, -size * 0.45, size * 1.2, 0.05 * size);
  } else if (kind === "attack") {
    stroke(190, 70, 70);
    line(-size * 0.8, size * 0.8, size * 0.8, -size * 0.8);
    line(-size * 0.35, size * 0.95, size * 0.95, -size * 0.35);
  } else if (kind === "upgrade") {
    stroke(44, 130, 88);
    noFill();
    rect(-size * 0.75, -size * 0.1, size * 1.5, size * 0.95, 2);
    line(0, size * 0.8, 0, -size * 0.85);
    line(0, -size * 0.85, -size * 0.38, -size * 0.45);
    line(0, -size * 0.85, size * 0.38, -size * 0.45);
  } else if (kind === "end") {
    stroke(64, 116, 76);
    fill(142, 214, 154);
    triangle(-size * 0.6, -size * 0.9, -size * 0.6, size * 0.9, size * 0.9, 0);
    line(size * 1.05, -size * 0.9, size * 1.05, size * 0.9);
  } else if (kind === "musicOn") {
    stroke(46, 116, 182);
    line(-size * 0.45, size * 0.75, -size * 0.45, -size * 0.65);
    line(-size * 0.45, -size * 0.65, size * 0.58, -size * 0.95);
    ellipse(size * 0.58, -size * 0.2, size * 0.55, size * 0.4);
    arc(size * 0.95, 0, size * 0.85, size * 0.85, -PI * 0.35, PI * 0.35);
  } else if (kind === "musicOff") {
    drawUiIcon("musicOn", 0, 0, size);
    stroke(188, 72, 72);
    line(-size * 1.05, -size * 0.95, size * 1.05, size * 0.95);
  }
  pop();
}

function drawIsoPrism(x, y, w, d, h, topCol, leftCol, rightCol, edgeCol = [70, 70, 80]) {
  const n = { x: x, y: y - d * 0.6 - h };
  const e = { x: x + w * 0.52, y: y - d * 0.1 - h };
  const s = { x: x, y: y + d * 0.32 - h };
  const wv = { x: x - w * 0.52, y: y - d * 0.1 - h };
  const e2 = { x: e.x, y: e.y + h };
  const s2 = { x: s.x, y: s.y + h };
  const w2 = { x: wv.x, y: wv.y + h };

  stroke(edgeCol[0], edgeCol[1], edgeCol[2], 170);
  strokeWeight(1.2);
  fill(leftCol[0], leftCol[1], leftCol[2]);
  beginShape();
  vertex(wv.x, wv.y);
  vertex(s.x, s.y);
  vertex(s2.x, s2.y);
  vertex(w2.x, w2.y);
  endShape(CLOSE);

  fill(rightCol[0], rightCol[1], rightCol[2]);
  beginShape();
  vertex(e.x, e.y);
  vertex(s.x, s.y);
  vertex(s2.x, s2.y);
  vertex(e2.x, e2.y);
  endShape(CLOSE);

  fill(topCol[0], topCol[1], topCol[2]);
  beginShape();
  vertex(n.x, n.y);
  vertex(e.x, e.y);
  vertex(s.x, s.y);
  vertex(wv.x, wv.y);
  endShape(CLOSE);
}

function drawIsoRoof(x, y, w, d, h, roofCol = [160, 74, 66], edgeCol = [80, 40, 40]) {
  const topY = y - h - d * 0.55;
  const left = { x: x - w * 0.56, y: y - h - d * 0.1 };
  const right = { x: x + w * 0.56, y: y - h - d * 0.1 };
  const front = { x: x, y: y - h + d * 0.35 };
  const apex = { x: x, y: topY - d * 0.45 };
  stroke(edgeCol[0], edgeCol[1], edgeCol[2], 180);
  strokeWeight(1.2);
  fill(roofCol[0], roofCol[1], roofCol[2]);
  beginShape();
  vertex(apex.x, apex.y);
  vertex(right.x, right.y);
  vertex(front.x, front.y);
  vertex(left.x, left.y);
  endShape(CLOSE);
}

function drawCastleWindows(x, y, size, level) {
  noStroke();
  fill(74, 54, 46, 190);
  rect(x - size * 0.18, y - size * 0.55, size * 0.08, size * 0.13, 2);
  rect(x + size * 0.1, y - size * 0.55, size * 0.08, size * 0.13, 2);
  if (level >= 2) {
    rect(x - size * 0.62, y - size * 0.35, size * 0.06, size * 0.11, 2);
    rect(x + size * 0.56, y - size * 0.35, size * 0.06, size * 0.11, 2);
  }
  if (level >= 3) {
    rect(x - size * 0.05, y - size * 0.9, size * 0.05, size * 0.09, 2);
  }
}

function drawStoneSteps(x, y, size, steps = 3) {
  noStroke();
  for (let i = 0; i < steps; i++) {
    const w = size * (0.28 + i * 0.12);
    fill(188 - i * 10, 176 - i * 8, 162 - i * 6, 230);
    rect(x - w / 2, y + i * size * 0.06, w, size * 0.05, 2);
  }
}

function drawLantern(x, y, size, glow = [255, 226, 164]) {
  stroke(92, 76, 60, 170);
  strokeWeight(1.1);
  line(x, y, x, y - size * 0.42);
  noStroke();
  fill(236, 226, 212, 230);
  rect(x - size * 0.08, y - size * 0.34, size * 0.16, size * 0.18, 2);
  fill(glow[0], glow[1], glow[2], 120);
  ellipse(x, y - size * 0.25, size * 0.2, size * 0.16);
}

function drawWorkshopProps(x, y, size, kind) {
  noStroke();
  fill(116, 84, 58, 220);
  rect(x - size * 0.56, y + size * 0.1, size * 0.16, size * 0.2, 3);
  rect(x - size * 0.34, y + size * 0.14, size * 0.14, size * 0.16, 3);
  if (kind === WORKSHOP_KIND.WASHI) {
    fill(248, 245, 236, 235);
    rect(x - size * 0.68, y - size * 0.16, size * 0.2, size * 0.12, 2);
  } else if (kind === WORKSHOP_KIND.POTTERY) {
    fill(174, 110, 76, 230);
    ellipse(x - size * 0.58, y + size * 0.06, size * 0.13, size * 0.14);
  } else if (kind === WORKSHOP_KIND.FABLAB) {
    fill(132, 182, 214, 220);
    rect(x - size * 0.7, y - size * 0.12, size * 0.18, size * 0.08, 2);
  }
}

function drawHarborBoat(x, y, size) {
  noStroke();
  fill(112, 76, 48, 220);
  quad(x - size * 0.34, y, x + size * 0.18, y, x + size * 0.3, y + size * 0.08, x - size * 0.28, y + size * 0.08);
  stroke(96, 78, 58, 180);
  strokeWeight(1.1);
  line(x - size * 0.04, y, x - size * 0.04, y - size * 0.34);
  noStroke();
  fill(246, 244, 232, 210);
  triangle(x - size * 0.04, y - size * 0.34, x - size * 0.04, y - size * 0.08, x + size * 0.18, y - size * 0.16);
}

function drawCastleStructure(tile, x, y, size) {
  const level = buildingLevel(tile);

  drawIsoPrism(x, y + size * 0.16, size * 1.12, size * 0.72, size * 0.22, [170, 158, 146], [144, 130, 118], [132, 118, 108]);
  drawIsoPrism(x, y + size * 0.04, size * 0.9, size * 0.58, size * 0.42, [198, 184, 164], [168, 150, 132], [154, 138, 122]);
  drawIsoPrism(x, y - size * 0.02, size * 0.86, size * 0.56, size * 0.72, [220, 207, 188], [190, 172, 152], [176, 158, 140]);
  drawIsoRoof(x, y - size * 0.04, size * 0.9, size * 0.58, size * 0.72, [130, 78, 66], [74, 42, 38]);
  drawStoneSteps(x, y + size * 0.16, size, 4);

  drawIsoPrism(x - size * 0.5, y - size * 0.08, size * 0.34, size * 0.28, size * 0.58, [226, 214, 198], [198, 181, 162], [184, 169, 152]);
  drawIsoPrism(x + size * 0.5, y - size * 0.08, size * 0.34, size * 0.28, size * 0.58, [226, 214, 198], [198, 181, 162], [184, 169, 152]);

  if (level >= 2) {
    drawIsoRoof(x - size * 0.5, y - size * 0.1, size * 0.36, size * 0.28, size * 0.58, [112, 68, 60], [66, 38, 36]);
    drawIsoRoof(x + size * 0.5, y - size * 0.1, size * 0.36, size * 0.28, size * 0.58, [112, 68, 60], [66, 38, 36]);
    drawIsoPrism(x, y - size * 0.5, size * 0.48, size * 0.32, size * 0.42, [236, 224, 208], [206, 190, 174], [190, 176, 162]);
    drawIsoRoof(x, y - size * 0.54, size * 0.54, size * 0.34, size * 0.42, [146, 92, 76], [82, 50, 44]);
  }

  if (level >= 3) {
    drawIsoPrism(x, y - size * 0.82, size * 0.28, size * 0.18, size * 0.34, [244, 236, 222], [214, 202, 188], [198, 188, 176]);
    drawIsoRoof(x, y - size * 0.86, size * 0.34, size * 0.2, size * 0.34, [158, 104, 86], [92, 58, 50]);
    drawIsoPrism(x - size * 0.82, y - size * 0.12, size * 0.2, size * 0.16, size * 0.42, [214, 200, 184], [188, 170, 154], [172, 156, 142]);
    drawIsoPrism(x + size * 0.82, y - size * 0.12, size * 0.2, size * 0.16, size * 0.42, [214, 200, 184], [188, 170, 154], [172, 156, 142]);
    drawIsoRoof(x - size * 0.82, y - size * 0.14, size * 0.22, size * 0.18, size * 0.42, [118, 72, 64], [70, 42, 38]);
    drawIsoRoof(x + size * 0.82, y - size * 0.14, size * 0.22, size * 0.18, size * 0.42, [118, 72, 64], [70, 42, 38]);
  }
  drawCastleWindows(x, y, size, level);
}

function drawCastleAnimation(tile, x, y, size) {
  const ownerTheme = tile.owner ? clanTheme(tile.owner) : clanTheme(1);
  const flutter = sin(frameCount * 0.14 + tile.c * 0.8 + tile.r * 0.5);
  stroke(themeColor(ownerTheme, "accentDark", 190));
  strokeWeight(1.2);
  line(x + size * 0.72, y - size * 0.86, x + size * 0.72, y - size * 1.58);
  noStroke();
  fill(themeColor(ownerTheme, "accent", 210));
  beginShape();
  vertex(x + size * 0.74, y - size * 1.56);
  vertex(x + size * 1.1 + flutter * size * 0.08, y - size * 1.48);
  vertex(x + size * 0.9, y - size * 1.18);
  vertex(x + size * 0.74, y - size * 1.22);
  endShape(CLOSE);
  fill(255, 220, 120, 120 + 40 * sin(frameCount * 0.1 + tile.c));
  ellipse(x - size * 0.12, y - size * 0.48, size * 0.12, size * 0.12);
  ellipse(x + size * 0.14, y - size * 0.54, size * 0.1, size * 0.1);
  const officer = garrisonOfficer(tile);
  if (officer) {
    noStroke();
    fill(255, 246, 228, 226);
    ellipse(x - size * 0.58, y - size * 0.34, size * 0.28, size * 0.28);
    drawClanCrestMark(ownerTheme.crest, x - size * 0.58, y - size * 0.34, size * 0.09, themeColor(ownerTheme, "accentDark"), 220);
  }
}

function drawShrineAnimation(tile, x, y, size) {
  const t = frameCount * 0.06 + tile.c * 0.4 + tile.r * 0.6;
  noFill();
  stroke(tile.type === TYPE.JINJA ? color(232, 196, 112, 120) : color(202, 188, 230, 116));
  strokeWeight(1.4);
  ellipse(x, y - size * 0.64, size * (0.9 + 0.06 * sin(t)), size * (0.34 + 0.04 * cos(t)));
  ellipse(x, y - size * 0.64, size * (1.18 + 0.06 * cos(t)), size * (0.46 + 0.04 * sin(t)));
  stroke(255, 248, 236, 120);
  line(x - size * 0.4, y - size * 0.95, x - size * 0.4, y - size * 0.46);
  line(x - size * 0.2, y - size * 0.92, x - size * 0.2, y - size * 0.5);
  line(x, y - size * 0.9, x, y - size * 0.48);
  line(x + size * 0.2, y - size * 0.92, x + size * 0.2, y - size * 0.5);
  line(x + size * 0.4, y - size * 0.95, x + size * 0.4, y - size * 0.46);
}

function drawWorkshopAnimation(tile, x, y, size) {
  const kind = workshopKind(tile);
  const t = frameCount * 0.08 + tile.c + tile.r;
  if (kind === WORKSHOP_KIND.FABLAB) {
    noStroke();
    fill(128, 214, 255, 110);
    for (let i = 0; i < 3; i++) {
      const px = x - size * 0.2 + i * size * 0.22 + sin(t + i) * size * 0.04;
      const py = y - size * 0.84 - i * size * 0.08;
      ellipse(px, py, size * 0.08, size * 0.08);
    }
    stroke(128, 214, 255, 120);
    strokeWeight(1.2);
    line(x - size * 0.24, y - size * 0.78, x + size * 0.16, y - size * 0.98);
  } else if (kind === WORKSHOP_KIND.WASHI) {
    noStroke();
    fill(252, 248, 238, 150);
    rect(x - size * 0.62, y - size * 0.88 + sin(t) * 2, size * 0.18, size * 0.26, 3);
    rect(x - size * 0.38, y - size * 0.82 + sin(t + 0.8) * 2, size * 0.14, size * 0.22, 3);
  } else if (kind === WORKSHOP_KIND.POTTERY) {
    noStroke();
    fill(255, 192, 112, 126 + 30 * sin(t));
    ellipse(x + size * 0.04, y - size * 0.24, size * 0.16, size * 0.18);
    fill(255, 220, 152, 80);
    ellipse(x + size * 0.04, y - size * 0.3, size * 0.26, size * 0.12);
  } else {
    noStroke();
    fill(180, 180, 180, 90);
    ellipse(x + size * 0.28, y - size * 1.1 + sin(t) * 1.5, size * 0.15, size * 0.1);
  }
}

function drawIsoStructure(tile, x, y, size = 18) {
  const t = tile.type;
  if (t === TYPE.UMI) {
    if (drawStructureArt(tile, x, y + size * 0.12, size)) return;
    drawSeaPattern(x, y + size * 0.15, size * 0.9);
    return;
  }
  if (t === TYPE.YAMA) {
    if (drawStructureArt(tile, x, y + size * 0.08, size)) return;
    push();
    noStroke();
    fill(150, 162, 175, 220);
    triangle(x - size * 0.8, y + size * 0.5, x, y - size * 1.05, x + size * 0.85, y + size * 0.5);
    fill(192, 202, 214, 200);
    triangle(x - size * 0.18, y - size * 0.5, x, y - size * 1.05, x + size * 0.24, y - size * 0.5);
    pop();
    return;
  }
  if (t === TYPE.MINATO) {
    if (drawStructureArt(tile, x, y + size * 0.08, size)) return;
    drawHarborPier(x, y + size * 0.12, size * 0.86, isFishingPort(tile));
    drawHarborBoat(x - size * 0.28, y + size * 0.18, size * 0.72);
    drawIsoPrism(x + size * 0.32, y - size * 0.05, size * 0.62, size * 0.42, size * 0.42, [214, 222, 236], [186, 197, 216], [168, 179, 198]);
    drawIsoRoof(x + size * 0.32, y - size * 0.08, size * 0.6, size * 0.42, size * 0.42, [94, 132, 176], [56, 82, 118]);
    if (isFishingPort(tile)) {
      noStroke();
      fill(250, 252, 255, 180);
      ellipse(x - size * 0.36, y - size * 0.46 + sin(frameCount * 0.08 + tile.c) * 1.5, size * 0.14, size * 0.08);
      ellipse(x - size * 0.18, y - size * 0.54 + sin(frameCount * 0.08 + tile.r) * 1.2, size * 0.1, size * 0.06);
    }
    return;
  }
  if (t === TYPE.JO) {
    if (drawStructureArt(tile, x, y + size * 0.04, size)) return;
    drawCastleStructure(tile, x, y, size);
    drawCastleAnimation(tile, x, y, size);
    return;
  }
  if (t === TYPE.KOBO) {
    if (drawStructureArt(tile, x, y + size * 0.04, size)) return;
    const kind = workshopKind(tile);
    drawIsoPrism(x, y + size * 0.14, size * 1.02, size * 0.62, size * 0.18, [158, 142, 126], [132, 118, 106], [120, 108, 98]);
    drawIsoPrism(x, y + size * 0.08, size * 0.9, size * 0.56, size * 0.56, [232, 196, 156], [205, 166, 126], [190, 152, 114]);
    drawIsoRoof(x, y + size * 0.06, size * 0.9, size * 0.54, size * 0.56, [120, 88, 72], [70, 52, 45]);
    stroke(86, 68, 58, 180);
    strokeWeight(1.1);
    line(x + size * 0.22, y - size * 0.62, x + size * 0.22, y - size * 0.98);
    noStroke();
    fill(170, 170, 170, 140);
    ellipse(x + size * 0.28, y - size * 1.08 + sin(frameCount * 0.07) * 1.2, size * 0.16, size * 0.12);
    fill(92, 70, 52, 180);
    rect(x - size * 0.12, y - size * 0.08, size * 0.16, size * 0.22, 2);
    rect(x + size * 0.12, y - size * 0.04, size * 0.14, size * 0.12, 2);
    drawWorkshopProps(x, y, size, kind);
    drawWorkshopAnimation(tile, x, y, size);
    return;
  }
  if (t === TYPE.TERA) {
    if (drawStructureArt(tile, x, y + size * 0.04, size)) return;
    drawStoneSteps(x, y + size * 0.16, size, 3);
    drawIsoPrism(x, y + size * 0.08, size * 0.94, size * 0.58, size * 0.5, [236, 224, 208], [210, 195, 178], [196, 182, 166]);
    drawIsoRoof(x, y + size * 0.06, size * 1.15, size * 0.72, size * 0.5, [108, 90, 86], [64, 54, 52]);
    fill(84, 60, 46, 170);
    noStroke();
    rect(x - size * 0.1, y - size * 0.02, size * 0.18, size * 0.22, 2);
    drawLantern(x - size * 0.56, y + size * 0.08, size * 0.9, [255, 232, 188]);
    drawLantern(x + size * 0.56, y + size * 0.08, size * 0.9, [255, 232, 188]);
    drawShrineAnimation(tile, x, y, size);
    return;
  }
  if (t === TYPE.JINJA) {
    if (drawStructureArt(tile, x, y + size * 0.04, size)) return;
    drawStoneSteps(x, y + size * 0.18, size * 0.92, 3);
    drawIsoPrism(x, y + size * 0.1, size * 0.86, size * 0.52, size * 0.46, [246, 232, 220], [224, 208, 194], [208, 192, 178]);
    drawIsoRoof(x, y + size * 0.09, size * 0.94, size * 0.54, size * 0.46, [190, 72, 66], [112, 46, 42]);
    stroke(188, 62, 56);
    strokeWeight(2.1);
    line(x - size * 0.65, y + size * 0.22, x - size * 0.65, y - size * 0.32);
    line(x + size * 0.65, y + size * 0.22, x + size * 0.65, y - size * 0.32);
    line(x - size * 0.85, y - size * 0.34, x + size * 0.85, y - size * 0.34);
    noStroke();
    fill(244, 236, 224, 220);
    rect(x - size * 0.1, y - size * 0.02, size * 0.18, size * 0.2, 2);
    drawLantern(x - size * 0.64, y + size * 0.08, size * 0.88, [255, 220, 156]);
    drawLantern(x + size * 0.64, y + size * 0.08, size * 0.88, [255, 220, 156]);
    drawShrineAnimation(tile, x, y, size);
    return;
  }
}

function drawTileTypeIcon(tile, x, y, size = 10) {
  drawIsoStructure(tile, x, y, size * 1.2);
}

function fillLinearGradientRect(x, y, w, h, c1, c2, horizontal = false, radius = 0) {
  push();
  noFill();
  noStroke();
  drawingContext.save();
  beginShape();
  if (radius > 0) {
    rect(x, y, w, h, radius);
  } else {
    rect(x, y, w, h);
  }
  drawingContext.clip();
  const steps = max(1, floor(horizontal ? w : h));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const col = lerpColor(c1, c2, t);
    stroke(col);
    if (horizontal) line(x + i, y, x + i, y + h);
    else line(x, y + i, x + w, y + i);
  }
  drawingContext.restore();
  pop();
}

function drawPanelCard(x, y, w, h, radius = 18) {
  push();
  fill(255, 250);
  noStroke();
  rect(x + 10, y + 12, w, h, radius);
  fillLinearGradientRect(x, y, w, h, color(255, 252, 246, 252), color(236, 243, 250, 244), false, radius);
  stroke(112, 136, 164, 70);
  strokeWeight(1.2);
  rect(x, y, w, h, radius);
  stroke(255, 255, 255, 180);
  line(x + 18, y + 14, x + w - 18, y + 14);
  pop();
}

function drawThemeFrame(x, y, w, h, theme, radius = 18) {
  push();
  noFill();
  stroke(themeColor(theme, "accent", 110));
  strokeWeight(1.4);
  rect(x, y, w, h, radius);
  stroke(themeColor(theme, "accentLight", 120));
  strokeWeight(1);
  line(x + 16, y + 14, x + w - 16, y + 14);
  drawClanCrestMark(theme.crest, x + w - 22, y + 22, 8, themeColor(theme, "accentDark"), 180);
  pop();
}

function drawWovenPattern(x, y, w, h, alpha = 18) {
  push();
  stroke(74, 102, 122, alpha);
  strokeWeight(1);
  for (let ix = x; ix < x + w; ix += 18) line(ix, y, ix + 12, y + h);
  for (let iy = y; iy < y + h; iy += 18) line(x, iy, x + w, iy + 10);
  pop();
}

function drawBoardBackdrop() {
  fillLinearGradientRect(0, 0, width, height, color(238, 230, 212), color(198, 220, 232));
  push();
  noStroke();
  fill(255, 255, 255, 70);
  ellipse(width * 0.2, height * 0.08, width * 0.5, 120);
  fill(36, 58, 76, 26);
  ellipse(width * 0.32, height * 0.92, width * 0.75, 180);
  fill(92, 116, 78, 28);
  ellipse(width * 0.78, height * 0.18, width * 0.42, 90);
  pop();
}

function isoTileMetrics(scale = 1) {
  return {
    w: ISO_TILE_W * scale,
    h: ISO_TILE_H * scale,
    depth: ISO_TILE_DEPTH * scale,
  };
}

function isoTileTopPointsScreen(sx, sy, scale = 1, grow = 0) {
  const m = isoTileMetrics(scale);
  return [
    { x: sx, y: sy - m.h / 2 - grow },
    { x: sx + m.w / 2 + grow, y: sy },
    { x: sx, y: sy + m.h / 2 + grow },
    { x: sx - m.w / 2 - grow, y: sy },
  ];
}

function isoTileRightFacePointsScreen(sx, sy, scale = 1, grow = 0) {
  const top = isoTileTopPointsScreen(sx, sy, scale, grow);
  const depth = isoTileMetrics(scale).depth;
  return [
    top[1],
    top[2],
    { x: top[2].x, y: top[2].y + depth },
    { x: top[1].x, y: top[1].y + depth },
  ];
}

function isoTileLeftFacePointsScreen(sx, sy, scale = 1, grow = 0) {
  const top = isoTileTopPointsScreen(sx, sy, scale, grow);
  const depth = isoTileMetrics(scale).depth;
  return [
    top[2],
    top[3],
    { x: top[3].x, y: top[3].y + depth },
    { x: top[2].x, y: top[2].y + depth },
  ];
}

function drawIsoTileOutlineScreen(sx, sy, scale = 1) {
  drawPolygon(isoTileTopPointsScreen(sx, sy, scale));
}

function drawIsoTileShadowScreen(sx, sy, scale = 1, alpha = 34) {
  return;
}

function drawTerrainArtTile(tile, sx, sy, scale = 1) {
  const entry = artEntry(terrainArtId(tile));
  if (!entry || !entry.ready || !entry.img) return false;
  const top = isoTileTopPointsScreen(sx, sy, scale, ISO_TILE_OVERLAP);
  const xs = top.map((p) => p.x);
  const ys = top.map((p) => p.y);
  const minX = min(...xs);
  const maxX = max(...xs);
  const minY = min(...ys);
  const maxY = max(...ys);
  const pad = 6 * scale;
  push();
  drawingContext.save();
  clipToPolygon(top);
  tint(255, entry.alpha || 255);
  drawImageCover(entry.img, minX - pad, minY - pad, (maxX - minX) + pad * 2, (maxY - minY) + pad * 2);
  noTint();
  drawingContext.restore();
  pop();
  return true;
}

function drawIsoTerrainShell(tile, sx, sy, scale = 1) {
  const top = isoTileTopPointsScreen(sx, sy, scale, ISO_TILE_OVERLAP);
  const base = color(terrainColor(tile.type));
  const topCol = tile.type === TYPE.UMI ? color(74, 136, 176) : base;
  noStroke();
  fill(topCol);
  drawPolygon(top);
}

function drawIsoTerrainFallback(tile, sx, sy, scale = 1) {
  const top = isoTileTopPointsScreen(sx, sy, scale);
  stroke(255, 255, 255, tile.type === TYPE.UMI ? 56 : 90);
  strokeWeight(1.1);
  line(top[0].x, top[0].y, top[1].x, top[1].y);
  line(top[0].x, top[0].y, top[3].x, top[3].y);
  stroke(32, 44, 56, 70);
  line(top[1].x, top[1].y, top[2].x, top[2].y);
  line(top[2].x, top[2].y, top[3].x, top[3].y);
  noStroke();
  fill(255, 255, 255, tile.type === TYPE.UMI ? 16 : 28);
  beginShape();
  vertex(top[3].x, lerp(top[3].y, top[0].y, 0.4));
  vertex(top[0].x, top[0].y);
  vertex(top[1].x, lerp(top[1].y, top[0].y, 0.55));
  vertex(sx, sy);
  endShape(CLOSE);
}

function drawHexTileBase(tile, cx, cy, size) {
  const ctr = projectPoint(cx, cy);
  drawIsoTileShadowScreen(ctr.x, ctr.y, size / HEX_SIZE);
  drawIsoTerrainShell(tile, ctr.x, ctr.y, size / HEX_SIZE);
  if (drawTerrainArtTile(tile, ctr.x, ctr.y, size / HEX_SIZE)) {
    const top = isoTileTopPointsScreen(ctr.x, ctr.y, size / HEX_SIZE);
    stroke(255, 255, 255, tile.type === TYPE.UMI ? 44 : 70);
    strokeWeight(1);
    line(top[0].x, top[0].y, top[1].x, top[1].y);
    line(top[0].x, top[0].y, top[3].x, top[3].y);
    noStroke();
  } else {
    drawIsoTerrainFallback(tile, ctr.x, ctr.y, size / HEX_SIZE);
  }
}

function drawOwnerCrest(tile, cx, cy, size) {
  if (tile.owner === 0) return;
  const theme = clanTheme(tile.owner);
  const crestColor = themeColor(theme, "accent");
  const ctr = projectPoint(cx, cy);
  push();
  fill(red(crestColor), green(crestColor), blue(crestColor), 150);
  stroke(255, 255, 255, 120);
  strokeWeight(1.2);
  drawHex(cx, cy, size);
  fill(255, 245);
  stroke(themeColor(theme, "accentDark", 170));
  strokeWeight(1);
  ellipse(ctr.x, ctr.y - size * 0.08, size * 0.72, size * 0.52);
  noFill();
  drawClanCrestMark(theme.crest, ctr.x, ctr.y - size * 0.08, size * 0.22, themeColor(theme, "accentDark"), 220);
  pop();
}

function soundtrackButtonRect() {
  soundtrack.button.x = width - soundtrack.button.w - 12;
  soundtrack.button.y = floor((TOP_H - soundtrack.button.h) / 2);
  return soundtrack.button;
}

function soundtrackButtonContains(mx, my) {
  const r = soundtrackButtonRect();
  return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
}

function drawSoundtrackButton() {
  const r = soundtrackButtonRect();
  fillLinearGradientRect(r.x, r.y, r.w, r.h,
    soundtrack.enabled ? color(222, 233, 246) : color(238, 238, 238),
    soundtrack.enabled ? color(170, 194, 224) : color(208, 208, 208),
    false, 8);
  stroke(soundtrack.enabled ? color(70, 110, 172) : color(150, 150, 150));
  strokeWeight(1.2);
  rect(r.x, r.y, r.w, r.h, 8);
  drawUiIcon(soundtrack.enabled ? "musicOn" : "musicOff", r.x + 16, r.y + r.h / 2, 7);
  noStroke();
  fill(20, 45, 80);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(soundtrack.enabled ? "BGM ON" : "BGM OFF", r.x + 30, r.y + r.h / 2);
}

function midiToHz(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function ensureSoundtrack() {
  if (soundtrack.ready) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const lead = ctx.createOscillator();
  lead.type = "triangle";
  const leadGain = ctx.createGain();
  leadGain.gain.value = 0;
  lead.connect(leadGain);
  leadGain.connect(master);
  lead.start();

  const bass = ctx.createOscillator();
  bass.type = "sine";
  const bassGain = ctx.createGain();
  bassGain.gain.value = 0;
  bass.connect(bassGain);
  bassGain.connect(master);
  bass.start();

  soundtrack.ctx = ctx;
  soundtrack.master = master;
  soundtrack.lead = lead;
  soundtrack.leadGain = leadGain;
  soundtrack.bass = bass;
  soundtrack.bassGain = bassGain;
  soundtrack.step = 0;
  soundtrack.nextAt = ctx.currentTime + 0.06;
  soundtrack.ready = true;
  updateSoundtrackGain();
}

function updateSoundtrackGain() {
  if (!soundtrack.ready) return;
  const now = soundtrack.ctx.currentTime;
  const target = soundtrack.enabled ? 0.16 : 0.0001;
  soundtrack.master.gain.cancelScheduledValues(now);
  soundtrack.master.gain.setTargetAtTime(target, now, 0.12);
}

function activateSoundtrackByGesture() {
  ensureSoundtrack();
  if (!soundtrack.ready) return;
  if (soundtrack.ctx.state === "suspended") soundtrack.ctx.resume();
  updateSoundtrackGain();
}

function updateSoundtrack() {
  if (!soundtrack.ready || !soundtrack.enabled) return;
  const beat = 60 / soundtrack.tempo;
  const lookAhead = 0.12;
  while (soundtrack.nextAt <= soundtrack.ctx.currentTime + lookAhead) {
    const t = soundtrack.nextAt;
    const offset = soundtrack.phrase[soundtrack.step % soundtrack.phrase.length];
    const themeShift = soundtrack.themeId === "ito" ? 2 : soundtrack.themeId === "shima" ? -1 : 0;
    const leadMidi = 67 + offset + themeShift;
    soundtrack.lead.frequency.setValueAtTime(midiToHz(leadMidi), t);
    soundtrack.leadGain.gain.cancelScheduledValues(t);
    soundtrack.leadGain.gain.setValueAtTime(0.0001, t);
    soundtrack.leadGain.gain.linearRampToValueAtTime(soundtrack.themeId === "ito" ? 0.07 : soundtrack.themeId === "shima" ? 0.052 : 0.06, t + 0.02);
    soundtrack.leadGain.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.45);

    if (soundtrack.step % 2 === 0) {
      const bassMidi = 43 + (offset >= 0 ? 0 : -2) + (soundtrack.themeId === "shima" ? -2 : 0);
      soundtrack.bass.frequency.setValueAtTime(midiToHz(bassMidi), t);
      soundtrack.bassGain.gain.cancelScheduledValues(t);
      soundtrack.bassGain.gain.setValueAtTime(0.0001, t);
      soundtrack.bassGain.gain.linearRampToValueAtTime(soundtrack.themeId === "ito" ? 0.04 : 0.045, t + 0.01);
      soundtrack.bassGain.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9);
    }

    soundtrack.step++;
    soundtrack.nextAt += beat / 2;
  }
}

function toggleSoundtrack() {
  soundtrack.enabled = !soundtrack.enabled;
  activateSoundtrackByGesture();
  updateSoundtrackGain();
}

function playBattleSfx(intensity = 1) {
  ensureSoundtrack();
  if (!soundtrack.ready) return;

  const ctx = soundtrack.ctx;
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;
  const power = constrain(intensity / FORCE_ATTACK, 0.7, 1.35);

  const out = ctx.createGain();
  out.gain.value = 0.0001;
  out.connect(ctx.destination);
  out.gain.setValueAtTime(0.0001, now);
  out.gain.linearRampToValueAtTime(0.22 * power, now + 0.01);
  out.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

  const drum = ctx.createOscillator();
  const drumGain = ctx.createGain();
  drum.type = "square";
  drum.frequency.setValueAtTime(160 * power, now);
  drum.frequency.exponentialRampToValueAtTime(70, now + 0.16);
  drumGain.gain.setValueAtTime(0.24 * power, now);
  drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  drum.connect(drumGain);
  drumGain.connect(out);
  drum.start(now);
  drum.stop(now + 0.18);

  const clash = ctx.createOscillator();
  const clashGain = ctx.createGain();
  clash.type = "triangle";
  clash.frequency.setValueAtTime(920, now + 0.03);
  clash.frequency.exponentialRampToValueAtTime(420, now + 0.12);
  clashGain.gain.setValueAtTime(0.11 * power, now + 0.03);
  clashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  clash.connect(clashGain);
  clashGain.connect(out);
  clash.start(now + 0.03);
  clash.stop(now + 0.2);

  const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.14), ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.75;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(1100, now);
  bp.Q.setValueAtTime(0.9, now);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.12 * power, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  noise.connect(bp);
  bp.connect(noiseGain);
  noiseGain.connect(out);
  noise.start(now);
  noise.stop(now + 0.15);
}


function resourcePairs(p) {
  return [
    ["food", p.food],
    ["gold", p.gold],
    ["culture", p.culture],
    ["force", p.force],
    ["recruit", officerCount(p)],
  ];
}

function drawTopResourceLine(p, eventState, ap, x, y) {
  textAlign(LEFT, CENTER);
  textSize(10);
  let cx = x;
  for (const [kind, value] of resourcePairs(p)) {
    drawUiIcon(kind, cx + 5, y, 6);
    fill(0);
    text(`${value}`, cx + 14, y);
    cx += 38;
  }
  drawUiIcon("event", cx + 5, y, 6);
  fill(0);
  text(eventState, cx + 14, y);
  cx += 70;
  drawUiIcon("action", cx + 5, y, 6);
  fill(0);
  text(`${ap}/${ACTIONS_PER_TURN}`, cx + 14, y);
  cx += 54;
  fill(0);
  text(`季節:${seasonState.name}`, cx + 2, y);
}

function buttonIconKind(label) {
  if (label.includes("文化振興")) return "culture";
  if (label.includes("交易")) return "trade";
  if (label.includes("軍備")) return "force";
  if (label.includes("攻撃")) return "attack";
  if (label.includes("イベント")) return "event";
  if (label.includes("築城")) return "castle";
  if (label.includes("工房")) return "workshop";
  if (label.includes("改修")) return "upgrade";
  if (label.includes("登用")) return "recruit";
  if (label.includes("ターン終了")) return "end";
  return "action";
}

function workshopKindIcon(kind) {
  if (kind === WORKSHOP_KIND.WASHI) return "washi";
  if (kind === WORKSHOP_KIND.POTTERY) return "pottery";
  return "innovation";
}
function playerIds() {
  return players.map((p) => p.id);
}

function playerById(playerId) {
  return players.find((p) => p.id === playerId) || null;
}

function makePlayerStateMap(defaultValue) {
  const map = {};
  for (const p of players) map[p.id] = defaultValue;
  return map;
}

function resetTileInfluence(tile) {
  for (const pid of playerIds()) tile.inf[pid] = 0;
}

function strongestEnemyByCulture(playerId) {
  let enemy = null;
  for (const p of players) {
    if (p.id === playerId) continue;
    if (!enemy || p.culture > enemy.culture) enemy = p;
  }
  return enemy;
}

function maxOpponentInfluence(tile, playerId) {
  let maxInf = 0;
  for (const pid of playerIds()) {
    if (pid === playerId) continue;
    maxInf = max(maxInf, tile.inf[pid] || 0);
  }
  return maxInf;
}

function clanOfficerPool(playerId) {
  return [...(OFFICER_NAME_POOL[playerId] || [`在地武将${playerId}-1`, `在地武将${playerId}-2`])];
}

function officerCount(playerOrId) {
  const p = typeof playerOrId === "object" ? playerOrId : playerById(playerOrId);
  return p && Array.isArray(p.officers) ? p.officers.length : 0;
}

function officerLimit(playerId) {
  return 2 + countOwnedType(playerId, TYPE.JO) + floor(totalPopulation(playerId) / 18);
}

function strongestOfficerStat(playerId, stat) {
  const p = playerById(playerId);
  if (!p || !p.officers || p.officers.length === 0) return 0;
  return max(...p.officers.map((o) => o[stat] || 0));
}

function officerSummary(playerId) {
  const p = playerById(playerId);
  if (!p || officerCount(p) <= 0) return "武将なし";
  const lead = [...p.officers].sort((a, b) => (b.valor + b.wit + b.admin) - (a.valor + a.wit + a.admin))[0];
  return `${lead.name} ${lead.role} 武${lead.valor} 知${lead.wit} 政${lead.admin}`;
}

function officerById(playerId, officerId) {
  const p = playerById(playerId);
  if (!p || !p.officers) return null;
  return p.officers.find((o) => o.id === officerId) || null;
}

function castleKey(tileOrCoords) {
  const tile = tileOrCoords;
  return tile ? `${tile.c},${tile.r}` : "";
}

function findCastleByKey(key) {
  if (!key) return null;
  const [c, r] = key.split(",").map((v) => parseInt(v, 10));
  if (!Number.isInteger(c) || !Number.isInteger(r)) return null;
  return getTile(c, r);
}

function garrisonOfficer(tile) {
  if (!tile || tile.type !== TYPE.JO || !tile.garrisonOfficerId || !tile.owner) return null;
  return officerById(tile.owner, tile.garrisonOfficerId);
}

function releaseOfficerAssignment(officer) {
  if (!officer || !officer.assignedCastleKey) return;
  const castle = findCastleByKey(officer.assignedCastleKey);
  if (castle && castle.garrisonOfficerId === officer.id) castle.garrisonOfficerId = null;
  officer.assignedCastleKey = null;
}

function assignOfficerToCastle(playerId, officer, castleTile) {
  if (!castleTile || castleTile.type !== TYPE.JO || castleTile.owner !== playerId) return false;
  const current = garrisonOfficer(castleTile);
  if (current) current.assignedCastleKey = null;
  castleTile.garrisonOfficerId = null;
  if (!officer) return true;
  if (officer.assignedCastleKey) {
    const prevCastle = findCastleByKey(officer.assignedCastleKey);
    if (prevCastle && prevCastle.garrisonOfficerId === officer.id) prevCastle.garrisonOfficerId = null;
  }
  officer.assignedCastleKey = castleKey(castleTile);
  castleTile.garrisonOfficerId = officer.id;
  return true;
}

function castleDefenseBonus(tile) {
  const officer = garrisonOfficer(tile);
  return officer ? ceil(officer.valor / 2) : 0;
}

function castleFlipBonus(tile) {
  const officer = garrisonOfficer(tile);
  return officer ? max(1, floor(max(officer.wit, officer.admin) / 3)) : 0;
}

function freeOfficerCount(playerId) {
  const p = playerById(playerId);
  if (!p || !p.officers) return 0;
  return p.officers.filter((o) => !o.assignedCastleKey).length;
}

function officerBonuses(playerId) {
  return {
    culture: floor(strongestOfficerStat(playerId, "wit") / 4),
    trade: floor(strongestOfficerStat(playerId, "admin") / 4),
    forceTrain: floor(strongestOfficerStat(playerId, "valor") / 4),
    attackDiscount: floor(strongestOfficerStat(playerId, "valor") / 5),
    spread: floor(strongestOfficerStat(playerId, "wit") / 5),
  };
}

function createOfficerFromTile(playerId, tile) {
  const p = playerById(playerId);
  if (!p) return null;
  if (!p.officerPool || p.officerPool.length === 0) p.officerPool = clanOfficerPool(playerId);
  const idx = floor(random(p.officerPool.length));
  const baseName = p.officerPool.splice(idx, 1)[0];
  const terrain = tile ? tile.type : TYPE.HEICHI;
  let valor = 3 + floor(random(3));
  let wit = 3 + floor(random(3));
  let admin = 3 + floor(random(3));
  if (terrain === TYPE.JO || terrain === TYPE.YAMA) valor += 2;
  if (terrain === TYPE.MINATO || terrain === TYPE.KOBO) admin += 2;
  if (terrain === TYPE.JINJA || terrain === TYPE.TERA) wit += 2;
  if (terrain === TYPE.HEICHI) {
    valor += 1;
    admin += 1;
  }
  valor = constrain(valor, 1, 9);
  wit = constrain(wit, 1, 9);
  admin = constrain(admin, 1, 9);
  const top = max(valor, wit, admin);
  const role = top === valor ? "猛将" : top === wit ? "知将" : "奉行";
  return {
    id: `${playerId}-${++p.officerSeq}`,
    name: baseName,
    role,
    valor,
    wit,
    admin,
    loyalty: 6 + floor(random(4)),
    assignedCastleKey: null,
    origin: tile ? tileLabel(tile) : "本拠",
  };
}

function leadOfficer(playerId, actionKind) {
  const p = playerById(playerId);
  if (!p || !p.officers || p.officers.length === 0) return null;
  const stat = actionKind === "culture"
    ? "wit"
    : (actionKind === "trade" || actionKind === "develop" || actionKind === "recruit") ? "admin" : "valor";
  return [...p.officers].sort((a, b) => (b[stat] || 0) - (a[stat] || 0))[0];
}

function tryOfficerMoment(playerId, actionKind, tile, target = null) {
  const p = playerById(playerId);
  const officer = leadOfficer(playerId, actionKind);
  if (!p || !officer) return "";
  const stat = actionKind === "culture"
    ? officer.wit
    : (actionKind === "trade" || actionKind === "develop" || actionKind === "recruit") ? officer.admin : officer.valor;
  const chance = 0.18 + max(0, stat - 6) * 0.08;
  if (stat < 7 || random() > chance) return "";

  if (actionKind === "culture" && tile) {
    for (const nt of neighbors6(tile.c, tile.r)) nt.inf[playerId] += 2;
    return `${officer.name}が演説を成功させ、隣接影響+2`;
  }
  if (actionKind === "trade") {
    const extraGold = 1 + floor(officer.admin / 4);
    p.gold += extraGold;
    return `${officer.name}が商談をまとめ、金+${extraGold}`;
  }
  if (actionKind === "force") {
    const extraForce = 1 + floor(officer.valor / 4);
    p.force += extraForce;
    return `${officer.name}が兵を鼓舞し、武力+${extraForce}`;
  }
  if (actionKind === "recruit") {
    p.culture += 1;
    return `${officer.name}が口利きし、文化+1`;
  }
  if (actionKind === "develop") {
    const refund = 2;
    p.gold += refund;
    return `${officer.name}が普請を取り仕切り、金+${refund}`;
  }
  if (actionKind === "attack") {
    const refundForce = 1 + floor(officer.valor / 6);
    p.force += refundForce;
    if (target) {
      for (const nt of neighbors6(target.c, target.r)) nt.inf[playerId] += 2;
    }
    return `${officer.name}が追撃し、武力+${refundForce} / 周辺影響+2`;
  }
  return "";
}

function buildMissionCandidates(playerId) {
  const candidates = [];
  const owned = [];
  let canDevelop = false;
  let canCapture = false;
  let hasPort = false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.owner !== playerId) continue;
      owned.push(t);
      if (t.type === TYPE.MINATO) hasPort = true;
      if (canUpgradeBuilding(t, playerId) || canBuildCastleOnTile(t) || canBuildWorkshopOnTile(t)) canDevelop = true;
      if (!canCapture) {
        canCapture = neighbors6(c, r).some((nt) => nt.type !== TYPE.UMI && nt.owner !== playerId);
      }
    }
  }
  if (owned.length > 0) {
    candidates.push({
      id: "culture",
      title: "勅命: 祭礼を仕切れ",
      desc: "このターン中に文化振興を1回実行せよ。",
      kind: "culture",
      target: 1,
      reward: { culture: 5, gold: 3 },
    });
  }
  if (hasPort) {
    candidates.push({
      id: "trade",
      title: "勅命: 港を潤せ",
      desc: "このターン中に交易を1回実行せよ。",
      kind: "trade",
      target: 1,
      reward: { gold: 7, food: 4 },
    });
  }
  if (officerCount(playerId) < officerLimit(playerId)) {
    candidates.push({
      id: "recruit",
      title: "勅命: 人材を集めよ",
      desc: "このターン中に武将を1人登用せよ。",
      kind: "recruit",
      target: 1,
      reward: { culture: 4, force: 4, gold: 2 },
    });
  }
  if (canDevelop) {
    candidates.push({
      id: "develop",
      title: "勅命: 国力を整えよ",
      desc: "このターン中に築城・工房建設・改修のいずれかを行え。",
      kind: "develop",
      target: 1,
      reward: { gold: 5, culture: 4, force: 2 },
    });
  }
  if (canCapture) {
    candidates.push({
      id: "capture",
      title: "勅命: 版図を広げよ",
      desc: "このターン中に敵地か中立地を1マス獲得せよ。",
      kind: "capture",
      target: 1,
      reward: { gold: 6, culture: 4, force: 4 },
    });
  }
  if (candidates.length === 0) {
    candidates.push({
      id: "culture",
      title: "勅命: 民心を繋ぎ止めよ",
      desc: "このターン中に文化振興を1回実行せよ。",
      kind: "culture",
      target: 1,
      reward: { culture: 5, food: 3 },
    });
  }
  return candidates;
}

function assignMission(playerId) {
  const candidates = buildMissionCandidates(playerId);
  const picked = candidates[floor(random(candidates.length))];
  missionStateByPlayer[playerId] = { ...picked, progress: 0, completed: false, turnsLeft: MISSION_CARRY_TURNS };
}

function maybeOfferMission(playerId, force = false) {
  const current = missionStateByPlayer[playerId];
  if (current && !current.completed && (current.turnsLeft || 0) > 0) return false;
  missionStateByPlayer[playerId] = null;
  if (!force && random() >= MISSION_OFFER_CHANCE) return false;
  assignMission(playerId);
  return true;
}

function tickMissionTurns(playerId) {
  const mission = missionStateByPlayer[playerId];
  if (!mission || mission.completed) return;
  mission.turnsLeft = max(0, (mission.turnsLeft || 1) - 1);
  if (mission.turnsLeft <= 0) missionStateByPlayer[playerId] = null;
}

function openMissionPopup(playerId) {
  const mission = missionStateByPlayer[playerId];
  if (!mission || mission.completed) return;
  openInfoPopup(
    mission.title,
    mission.desc,
    `下賜: ${missionRewardText(mission.reward)} / 行動を選ぶ前に今回の勅命を確認してください。`,
    "勅命",
    `M-${mission.id}`,
    "imperialMission",
  );
}

function missionRewardText(reward) {
  const logs = [];
  if (reward.gold) logs.push(`金+${reward.gold}`);
  if (reward.food) logs.push(`食料+${reward.food}`);
  if (reward.culture) logs.push(`文化+${reward.culture}`);
  if (reward.force) logs.push(`武力+${reward.force}`);
  return logs.join(" / ");
}

function missionStatusText(playerId) {
  const mission = missionStateByPlayer[playerId];
  if (!mission) return "勅命なし";
  const remain = mission.completed ? "" : ` / 猶予${mission.turnsLeft || 1}T`;
  const state = mission.completed ? "達成" : `${mission.progress}/${mission.target}${remain}`;
  return `${mission.title} (${state})`;
}

function completeMission(playerId, tile = null) {
  const mission = missionStateByPlayer[playerId];
  const p = playerById(playerId);
  if (!mission || mission.completed || !p) return "";
  mission.completed = true;
  const reward = mission.reward || {};
  p.gold += reward.gold || 0;
  p.food += reward.food || 0;
  p.culture += reward.culture || 0;
  p.force += reward.force || 0;
  if (tile) pushTileFx(tile.c, tile.r, "勅命達成", color(255, 196, 82));
  latestComment = `${p.name}が勅命達成: ${mission.title}`;
  return `勅命達成: ${mission.title} / 下賜: ${missionRewardText(reward)}`;
}

function advanceMission(playerId, kind, tile = null, amount = 1) {
  const mission = missionStateByPlayer[playerId];
  if (!mission || mission.completed || mission.kind !== kind) return "";
  mission.progress = min(mission.target, mission.progress + amount);
  if (mission.progress >= mission.target) return completeMission(playerId, tile);
  return "";
}

function initializeGame() {
  players = [
    { name: "二丈軍", id: 1, theme: clanTheme(1), food: 10, gold: 10, culture: 6, force: 3, officers: [], officerPool: clanOfficerPool(1), officerSeq: 0, washi: 0, pottery: 0, innovation: 0, col: color(...CLAN_THEMES[1].accent) },
    { name: "伊都軍", id: 2, theme: clanTheme(2), food: 10, gold: 10, culture: 6, force: 3, officers: [], officerPool: clanOfficerPool(2), officerSeq: 0, washi: 0, pottery: 0, innovation: 0, col: color(...CLAN_THEMES[2].accent) },
    { name: "志摩軍", id: 3, theme: clanTheme(3), food: 10, gold: 10, culture: 6, force: 3, officers: [], officerPool: clanOfficerPool(3), officerSeq: 0, washi: 0, pottery: 0, innovation: 0, col: color(...CLAN_THEMES[3].accent) },
  ];
  currentPlayer = 0;
  turn = 1;
  message = "ヘックスをクリックして、右のボタンで行動してね。";
  latestComment = "";
  incomeReport = makePlayerStateMap("");
  gameState = "playing";
  winText = "";
  eventUsedThisTurn = false;
  eventUsedByPlayer = makePlayerStateMap(false);
  eventReadyThisTurn = makePlayerStateMap(false);
  eventReadyThisTurn[HUMAN_PLAYER_ID] = rollEventReady();
  tradeUsedThisTurn = false;
  actionsLeft = makePlayerStateMap(ACTIONS_PER_TURN);
  eventPopup.open = false;
  workshopBuildPopup.open = false;
  workshopBuildPopup.c = -1;
  workshopBuildPopup.r = -1;
  siegeScene.open = false;
  siegeScene.tactic = null;
  siegeScene.from = null;
  siegeScene.target = null;
  siegeScene.phase = "command";
  siegeScene.round = 1;
  siegeScene.hp = 0;
  siegeScene.hpMax = 0;
  siegeScene.extraCost = 0;
  siegeScene.logs = [];
  siegeScene.lastCommand = null;
  siegeScene.lastOutcome = null;
  siegeScene.resolved = false;
  tileFx = [];
  mountainPassTurns = makePlayerStateMap(0);
  flipCapturesThisTurn = makePlayerStateMap(0);
  missionStateByPlayer = makePlayerStateMap(null);
  seasonState = seasonForTurn(turn);

  buildGrid();
  computeCenters();
  makeFixedItoshimaMap();

  setOwner(1, 4, 6);
  setOwner(2, 10, 4);
  setOwner(3, 8, 2);
  selected = { c: 4, r: 6 };
  attackMode = { active: false, from: null };

  initEventDeck();
  for (const pid of playerIds()) maybeOfferMission(pid, pid === HUMAN_PLAYER_ID);
  updateSoundtrackTheme(true);
  buildButtons();
}

function draw() {
  updateCameraShake();
  updateSoundtrackTheme();
  background(232, 240, 250);
  drawTopBar();
  drawHexGrid();
  drawRightPanel();
  drawBottomBar();
  if (eventPopup.open) drawEventPopup();
  if (workshopBuildPopup.open) drawWorkshopBuildPopup();
  if (gameState !== "playing") drawWinPopup();
  if (battlePopup.open && !siegeScene.open) drawBattlePopup();
  if (siegeScene.open) drawSiegeScene();
  if (openingStory.open) drawOpeningStory();
  if (startPickPopup.open) drawStartPickPopup();
  updateSoundtrack();
}

function mousePressed() {
  activateSoundtrackByGesture();
  if (soundtrackButtonContains(mouseX, mouseY)) {
    toggleSoundtrack();
    return;
  }

  if (openingStory.open) {
    if (openingStoryNextContains(mouseX, mouseY)) {
      advanceOpeningStory();
      return;
    }
    const r = openingStoryRect();
    if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h) {
      advanceOpeningStory();
    }
    return;
  }

  if (startPickPopup.open) {
    const pickedSide = pickStartOption(mouseX, mouseY);
    if (pickedSide) beginGameAs(pickedSide.id);
    return;
  }

  if (workshopBuildPopup.open) {
    if (workshopBuildCancelContains(mouseX, mouseY)) {
      workshopBuildPopup.open = false;
      return;
    }
    const picked = pickWorkshopBuildOption(mouseX, mouseY);
    if (picked) {
      buildWorkshopSelected(picked.kind);
    }
    return;
  }

  if (siegeScene.open) {
    handleSiegeSceneClick(mouseX, mouseY);
    return;
  }

  if (battlePopup.open) {
    handleBattlePopupClick(mouseX, mouseY);
    return;
  }

  if (eventPopup.open) {
    if (eventPopupOkContains(mouseX, mouseY)) {
      eventPopup.open = false;
    }
    return;
  }

  if (gameState !== "playing") {
    if (winPopupRestartContains(mouseX, mouseY)) {
      openOpeningStory();
    }
    return;
  }

  if (mouseX < width - UI_W && mouseY > TOP_H && mouseY < height - BOTTOM_H) {
    const world = screenToWorld(mouseX, mouseY);
    const hit = pickHex(world.x, world.y);
    if (hit) {
      if (attackMode.active) {
        handleAttackTargetClick(hit.c, hit.r);
        return;
      }
      selected = { c: hit.c, r: hit.r };
      const t = getTile(hit.c, hit.r);
      message = `選択: ${tileLabel(t)} / 所有: ${ownerName(t.owner)} / 役割: ${tileRoleTitle(t)}`;
      return;
    }
  }

  for (const b of buttons) {
    if (b.contains(mouseX, mouseY)) {
      b.onClick();
      return;
    }
  }
}

// ------------------ グリッド生成 ------------------

function buildGrid() {
  grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(makeTile(c, r, TYPE.HEICHI, ""));
    }
    grid.push(row);
  }
}

function computeCenters() {
  centers = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const x = boardX + c * HEX_W + (r % 2) * (HEX_W / 2) + HEX_W / 2;
      const y = boardY + r * HEX_VSTEP + HEX_H / 2;
      row.push({ x, y });
    }
    centers.push(row);
  }
}

function makeTile(c, r, type, name) {
  const inf = {};
  for (const p of players) inf[p.id] = 0;
  const level = initialBuildingLevel(type);
  return {
    c, r, type, name,
    owner: 0,
    inf,
    level,
    castleHp: type === TYPE.JO ? castleMaxHp({ type, level }) : 0,
    garrisonOfficerId: null,
    population: initialPopulationForType(type),
  };
}

function supportsBuildingLevel(tileOrType) {
  const type = typeof tileOrType === "string" ? tileOrType : (tileOrType ? tileOrType.type : "");
  return type === TYPE.JO || type === TYPE.KOBO || type === TYPE.MINATO || type === TYPE.JINJA || type === TYPE.TERA;
}

function initialBuildingLevel(type) {
  return supportsBuildingLevel(type) ? 1 : 0;
}

function buildingLevel(tile) {
  if (!supportsBuildingLevel(tile)) return 0;
  return constrain(tile.level || 1, 1, BUILDING_LEVEL_MAX);
}

function buildingLevelBonus(tile) {
  return max(0, buildingLevel(tile) - 1);
}

function castleMaxHp(tile) {
  if (!tile || tile.type !== TYPE.JO) return 0;
  return CASTLE_SIEGE_HITS + buildingLevelBonus(tile) * 2;
}

function upgradeCost(tile) {
  if (!supportsBuildingLevel(tile)) return 0;
  const level = buildingLevel(tile);
  return (tile.type === TYPE.JO ? 5 : 4) + level * 3;
}

function canUpgradeBuilding(tile, playerId) {
  return !!tile && tile.owner === playerId && supportsBuildingLevel(tile) && buildingLevel(tile) < BUILDING_LEVEL_MAX;
}

function normalizeTileBuildingState(tile) {
  if (!tile) return;
  const currentLevel = tile.level;
  tile.level = supportsBuildingLevel(tile) ? constrain(currentLevel || 1, 1, BUILDING_LEVEL_MAX) : 0;
  if (tile.type === TYPE.JO) {
    tile.castleHp = constrain(tile.castleHp || castleMaxHp(tile), 0, castleMaxHp(tile));
  } else {
    tile.castleHp = 0;
    tile.garrisonOfficerId = null;
  }
}

function initialPopulationForType(type) {
  if (type === TYPE.MINATO) return 3;
  if (type === TYPE.KOBO) return 3;
  if (type === TYPE.JO) return 3;
  if (type === TYPE.JINJA || type === TYPE.TERA) return 2;
  if (type === TYPE.YAMA) return 1;
  if (type === TYPE.UMI) return 0;
  return 2;
}

function populationCap(tile) {
  if (!tile) return 0;
  const bonus = buildingLevelBonus(tile);
  if (tile.type === TYPE.MINATO) return 8 + bonus;
  if (tile.type === TYPE.KOBO) return 7 + bonus;
  if (tile.type === TYPE.JO) return 7 + bonus * 2;
  if (tile.type === TYPE.JINJA || tile.type === TYPE.TERA) return 5 + bonus;
  if (tile.type === TYPE.YAMA) return 4;
  if (tile.type === TYPE.UMI) return 0;
  return 6;
}

function clampTilePopulation(tile) {
  if (!tile) return;
  tile.population = constrain(tile.population || 0, 0, populationCap(tile));
}

function capturePopulationLoss(tile) {
  if (!tile || tile.type === TYPE.UMI) return;
  tile.population = max(1, ceil((tile.population || initialPopulationForType(tile.type)) * 0.65));
  clampTilePopulation(tile);
}

function totalPopulation(playerId) {
  let total = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const t = grid[r][c];
    if (t.owner === playerId) total += t.population || 0;
  }
  return total;
}

function populationYield(tile) {
  const pop = tile.population || 0;
  if (pop <= 0) return { food: 0, gold: 0, culture: 0, force: 0 };
  if (tile.type === TYPE.HEICHI) return { food: floor(pop / 2), gold: 0, culture: 0, force: 0 };
  if (tile.type === TYPE.MINATO) {
    if (isFishingPort(tile)) return { food: ceil(pop / 3), gold: 0, culture: 0, force: 0 };
    return { food: 0, gold: ceil(pop / 2), culture: 0, force: 0 };
  }
  if (tile.type === TYPE.KOBO) return { food: 0, gold: floor(pop / 2), culture: floor(pop / 4), force: 0 };
  if (tile.type === TYPE.JO) return { food: 0, gold: floor(pop / 3), culture: 0, force: floor(pop / 5) };
  if (tile.type === TYPE.JINJA || tile.type === TYPE.TERA) return { food: 0, gold: 0, culture: ceil(pop / 3), force: 0 };
  if (tile.type === TYPE.YAMA) return { food: floor(pop / 4), gold: 0, culture: 0, force: 0 };
  return { food: 0, gold: 0, culture: 0, force: 0 };
}

function populationFoodDemand(tile) {
  if (!tile || tile.type === TYPE.UMI || tile.owner === 0) return 0;
  return max(1, ceil((tile.population || 0) / 3));
}

function populationGrowthPriority(tile) {
  if (tile.type === TYPE.MINATO) return 6;
  if (tile.type === TYPE.KOBO) return 5;
  if (tile.type === TYPE.HEICHI) return 4;
  if (tile.type === TYPE.JO) return 3;
  if (tile.type === TYPE.JINJA || tile.type === TYPE.TERA) return 2;
  if (tile.type === TYPE.YAMA) return 1;
  return 0;
}

function applyPopulationPhase(playerId) {
  const p = playerById(playerId);
  const owned = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const t = grid[r][c];
    if (t.owner === playerId && t.type !== TYPE.UMI) owned.push(t);
  }

  let demand = 0;
  for (const tile of owned) demand += populationFoodDemand(tile);

  let starvationLoss = 0;
  if (p.food >= demand) {
    p.food -= demand;
  } else {
    let deficit = demand - p.food;
    p.food = 0;
    owned.sort((a, b) => (b.population || 0) - (a.population || 0));
    for (const tile of owned) {
      while (deficit > 0 && (tile.population || 0) > 1) {
        tile.population -= 1;
        starvationLoss += 1;
        deficit -= 1;
      }
      if (deficit <= 0) break;
    }
  }

  let growth = 0;
  const growthCandidates = owned
    .filter((tile) => (tile.population || 0) < populationCap(tile))
    .sort((a, b) => {
      const prioDiff = populationGrowthPriority(b) - populationGrowthPriority(a);
      if (prioDiff !== 0) return prioDiff;
      return (a.population || 0) - (b.population || 0);
    });
  const growthBudget = min(MAX_POP_GROWTH_PER_TURN, floor(p.food / POP_GROWTH_FOOD_STEP));
  for (let i = 0; i < growthBudget && i < growthCandidates.length; i++) {
    growthCandidates[i].population += 1;
    clampTilePopulation(growthCandidates[i]);
    growth += 1;
  }

  return { demand, growth, starvationLoss };
}

function place(c, r, type, name) {
  if (!inBounds(c, r)) return;
  grid[r][c] = makeTile(c, r, type, name);
}

// ------------------ 固定マップ配置 ------------------

function makeFixedItoshimaMap() {
  // 北(上)を海岸線、南(下)を山地帯に寄せて東西方向を拡張
  const sea = [
    [0, 0], [1, 0], [3, 0], [5, 0], [6, 0], [8, 0], [9, 0], [11, 0], [12, 0], [13, 0],
    [1, 1], [2, 1], [3, 1], [5, 1], [7, 1], [8, 1], [9, 1], [11, 1], [12, 1],
    [0, 2], [1, 2], [2, 2], [4, 2], [5, 2], [6, 2], [12, 2], [13, 2],
    [0, 3], [1, 3], [2, 3], [12, 3], [13, 3],
    [0, 4], [13, 4], [0, 5], [13, 5],
  ];
  for (const [c, r] of sea) place(c, r, TYPE.UMI, "玄界灘");

  place(1, 4, TYPE.MINATO, "福吉漁港");
  place(3, 3, TYPE.MINATO, "深江漁港");
  place(4, 0, TYPE.MINATO, "加布里港");
  place(7, 0, TYPE.MINATO, "芥屋港");
  place(10, 0, TYPE.MINATO, "岐志港");
  place(12, 4, TYPE.MINATO, "野北漁港");
  place(12, 2, TYPE.MINATO, "姉子の浜漁港");
  place(7, 5, TYPE.MINATO, "千如寺前漁港");

  place(6, 1, TYPE.YAMA, "可也山");
  place(7, 1, TYPE.YAMA, "立石山");
  place(10, 2, TYPE.YAMA, "高祖山");
  place(3, 6, TYPE.YAMA, "十坊山");
  place(5, 6, TYPE.YAMA, "井原山");
  place(6, 7, TYPE.YAMA, "雷山");
  place(8, 7, TYPE.YAMA, "羽金山");
  place(10, 6, TYPE.YAMA, "女岳");
  place(11, 7, TYPE.YAMA, "長野峠");
  place(12, 6, TYPE.YAMA, "峠道");

  place(4, 6, TYPE.JO, "二丈城");
  place(10, 4, TYPE.JO, "怡土城");

  place(7, 4, TYPE.TERA, "千如寺");
  place(8, 2, TYPE.JINJA, "桜井神社");
  place(11, 3, TYPE.JINJA, "志摩神社");

  place(4, 3, TYPE.KOBO, "ファブラボ");
  place(6, 4, TYPE.KOBO, "和紙工房");
  place(8, 4, TYPE.KOBO, "陶芸工房");
}

// ------------------ 謠冗判 ------------------

function drawTopBar() {
  const theme = currentTheme();
  fillLinearGradientRect(0, 0, width, TOP_H, themeColor(theme, "accentDark"), themeColor(theme, "accent"));
  drawWovenPattern(0, 0, width, TOP_H, 12);
  stroke(themeColor(theme, "accentLight", 90));
  line(0, TOP_H - 1, width, TOP_H - 1);

  fill(245);
  textAlign(LEFT, CENTER);
  textSize(20);
  text(`第${turn}ターン`, 18, TOP_H / 2 - 8);
  textSize(12);
  fill(themeColor(theme, "accentLight"));
  text(`${players[currentPlayer].name}の手番`, 20, TOP_H / 2 + 12);
  drawClanCrestMark(theme.crest, 120, TOP_H / 2 - 1, 9, color(255), 210);

  const me = players[currentPlayer];
  const used = !!eventUsedByPlayer[me.id];
  const ready = eventReadyThisTurn[me.id];
  const eventState = ready ? (used ? "使用済" : "使用可") : "発生なし";
  const ap = actionsLeft[me.id];
  textSize(12);
  drawTopResourceLine(me, eventState, ap, 170, TOP_H / 2);
  drawSoundtrackButton();
}

function drawHexGrid() {
  drawBoardBackdrop();
  push();
  translate(camera.x, camera.y);
  scale(camera.zoom);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      const ctr = centers[r][c];
      const isoCtr = projectPoint(ctr.x, ctr.y);
      const tileGroundY = isoCtr.y - isoTileMetrics(1).depth * 0.48;

      if (t.type === TYPE.YAMA) drawMountainShadow(ctr.x, ctr.y, HEX_SIZE);
      drawHexTileBase(t, ctr.x, ctr.y, HEX_SIZE);
      if (t.type === TYPE.UMI && !artEntry(terrainArtId(t))?.ready) drawSeaPattern(isoCtr.x, isoCtr.y, HEX_SIZE * 0.88);

      if (t.owner === 0 && t.type !== TYPE.UMI) {
        const a = constrain((t.inf[HUMAN_PLAYER_ID] || 0) * 6, 0, 90);
        const b = constrain(maxOpponentInfluence(t, HUMAN_PLAYER_ID) * 6, 0, 90);
        if (a > 0) {
          fill(58, 88, 128, a);
          drawHex(ctr.x, ctr.y, HEX_SIZE * 0.78);
        }
        if (b > 0) {
          fill(156, 70, 74, b);
          drawHex(ctr.x, ctr.y, HEX_SIZE * 0.62);
        }
      }

      drawOwnerCrest(t, ctr.x, ctr.y, HEX_SIZE * 0.78);

      fill(20);
      textAlign(CENTER, CENTER);
      textSize(24);
      if (t.type !== TYPE.HEICHI) {
        drawIsoStructure(t, isoCtr.x, tileGroundY, HEX_SIZE * 0.62);
        if (t.type !== TYPE.UMI && t.type !== TYPE.YAMA) {
          textSize(TILE_NAME_FONT);
          fill(12, 20, 28, 215);
          rect(isoCtr.x - TILE_NAME_W / 2, isoCtr.y + isoTileMetrics(1).depth * 0.5, TILE_NAME_W, TILE_NAME_H, 8);
          fill(247, 243, 233);
          text(tileLabel(t), isoCtr.x, isoCtr.y + isoTileMetrics(1).depth * 0.5 + TILE_NAME_H / 2);
        }
      }

      if (selected.c === c && selected.r === r) {
        const pulse = 0.9 + 0.06 * sin(frameCount * 0.2);
        noFill();
        stroke(20, 130, 230);
        strokeWeight(2.5);
        drawHex(ctr.x, ctr.y, HEX_SIZE * pulse, true);
      }
      if (attackMode.active && attackMode.from && attackMode.from.c === c && attackMode.from.r === r) {
        noFill();
        stroke(230, 70, 70);
        strokeWeight(3);
        drawHex(ctr.x, ctr.y, HEX_SIZE * 0.98, true);
      }
    }
  }

  drawTileFx();
  pop();
}

function pushTileFx(c, r, text, col) {
  if (!inBounds(c, r)) return;
  const ctr = centers[r][c];
  tileFx.push({
    x: ctr.x,
    y: ctr.y,
    text,
    col,
    life: 0,
    maxLife: 40,
  });
}

function drawTileFx() {
  for (let i = tileFx.length - 1; i >= 0; i--) {
    const fx = tileFx[i];
    fx.life += 1;
    const t = fx.life / fx.maxLife;
    if (t >= 1) {
      tileFx.splice(i, 1);
      continue;
    }

    const rise = 22 * t;
    const alpha = floor(255 * (1 - t));
    const ringSize = HEX_SIZE * (0.5 + 0.7 * t);

    noFill();
    stroke(red(fx.col), green(fx.col), blue(fx.col), alpha);
    strokeWeight(2);
    drawHex(fx.x, fx.y, ringSize);

    const ctr = projectPoint(fx.x, fx.y);
    noStroke();
    fill(red(fx.col), green(fx.col), blue(fx.col), alpha);
    textAlign(CENTER, CENTER);
    textSize(13);
    text(fx.text, ctr.x, ctr.y - 16 - rise);
  }
}

function drawSeaPattern(cx, cy, size) {
  const t = frameCount * 0.08;
  noStroke();
  fill(255, 255, 255, 24);
  ellipse(cx - size * 0.18, cy - size * 0.12, size * 1.2, size * 0.28);
  fill(228, 247, 255, 60);
  for (let i = 0; i < 4; i++) {
    const y = cy - size * 0.28 + i * size * 0.22;
    beginShape();
    for (let k = -2; k <= 2; k++) {
      const x = cx + k * size * 0.38;
      const wy = y + sin(t + i * 0.9 + k * 1.2) * size * 0.06;
      curveVertex(x, wy);
    }
    endShape();
  }
}

function drawCoastlineRim() {
  noFill();
  stroke(248, 251, 242, 150);
  strokeWeight(2.8);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.type === TYPE.UMI) continue;
      const coast = neighbors6(c, r).some((nt) => nt.type === TYPE.UMI);
      if (!coast) continue;
      const ctr = projectPoint(centers[r][c].x, centers[r][c].y);
      drawIsoTileOutlineScreen(ctr.x, ctr.y, 0.96);
      stroke(98, 128, 146, 36);
      strokeWeight(1.4);
      drawIsoTileOutlineScreen(ctr.x, ctr.y, 1.03);
      stroke(248, 251, 242, 150);
      strokeWeight(2.8);
    }
  }
}

function drawHarborPier(cx, cy, size, fishing = false) {
  stroke(88, 67, 42, 190);
  strokeWeight(2);
  const baseY = cy + size * 0.22;
  line(cx - size * 0.28, baseY, cx + size * 0.28, baseY);
  line(cx - size * 0.16, baseY, cx - size * 0.16, baseY + size * 0.2);
  line(cx, baseY, cx, baseY + size * 0.24);
  line(cx + size * 0.16, baseY, cx + size * 0.16, baseY + size * 0.2);

  if (!fishing) return;
  noStroke();
  fill(250, 252, 255, 190);
  ellipse(cx + size * 0.25, cy - size * 0.22, size * 0.12, size * 0.08);
  ellipse(cx + size * 0.33, cy - size * 0.17, size * 0.09, size * 0.06);
}

function drawRightPanel() {
  const px = width - UI_W;
  const py = TOP_H;
  const theme = currentTheme();
  fillLinearGradientRect(px, py, UI_W, height - TOP_H - BOTTOM_H, themeColor(theme, "panelA"), themeColor(theme, "panelB"));
  drawWovenPattern(px, py, UI_W, height - TOP_H - BOTTOM_H, 10);
  drawPanelCard(px + 10, py + 10, UI_W - 20, height - TOP_H - BOTTOM_H - 20, 22);
  drawThemeFrame(px + 10, py + 10, UI_W - 20, height - TOP_H - BOTTOM_H - 20, theme, 22);

  fill(28, 42, 58);
  textAlign(LEFT, TOP);
  textSize(15);
  text("軍議 / 情報", px + 28, py + 24);

  const t = getTile(selected.c, selected.r);

  const me = players[currentPlayer];
  const isMine = t.owner === me.id;
  const isPlayer = me.id === HUMAN_PLAYER_ID;
  const playable = gameState === "playing" && !eventPopup.open && !workshopBuildPopup.open;
  const hasAction = actionsLeft[HUMAN_PLAYER_ID] > 0;

  buttons[0].draw(playable && isPlayer && hasAction && isMine && me.gold >= 3);
  buttons[1].draw(playable && isPlayer && hasAction && isMine && !tradeUsedThisTurn);
  buttons[2].draw(playable && isPlayer && hasAction && isMine && me.gold >= 3);
  buttons[3].draw(playable && isPlayer && hasAction && isMine && me.force >= 1);
  buttons[4].draw(playable && isPlayer && hasAction && eventReadyThisTurn[HUMAN_PLAYER_ID] && !eventUsedThisTurn);
  buttons[5].draw(playable && isPlayer && hasAction && isMine && canBuildCastleOnTile(t) && me.gold >= BUILD_CASTLE_COST);
  buttons[6].draw(playable && isPlayer && hasAction && isMine && canBuildWorkshopOnTile(t) && me.gold >= BUILD_WORKSHOP_COST);
  buttons[7].draw(playable && isPlayer && hasAction && isMine && canUpgradeBuilding(t, me.id) && me.gold >= upgradeCost(t));
  buttons[8].draw(playable && isPlayer && hasAction && isMine && me.gold >= RECRUIT_COST && officerCount(me) < officerLimit(me.id));
  buttons[9].draw(playable && isPlayer && hasAction && isMine && t.type === TYPE.JO && officerCount(me) > 0);
  buttons[10].draw(playable && isPlayer);

  const meStat = playerById(HUMAN_PLAYER_ID);
  const rankLines = [meStat, ...players.filter((p) => p.id !== HUMAN_PLAYER_ID)].slice(0, 3);
  const enemyControl = round(maxEnemyControlRate(HUMAN_PLAYER_ID) * 100);
  fill(40, 48, 56);
  textSize(11);
  for (let i = 0; i < rankLines.length; i++) {
    const p = rankLines[i];
    const title = i === 0 ? `${p.name}(自分)` : p.name;
    text(`${title}: 人口${totalPopulation(p.id)} 文化${p.culture}/${CULTURE_WIN}・支配${round(controlRate(p.id) * 100)}%`, px + 28, py + 44 + i * 16);
  }
  const playerEventState = eventReadyThisTurn[HUMAN_PLAYER_ID] ? (eventUsedThisTurn ? "使用済" : "使用可") : "発生なし";
  text(`イベント:${playerEventState} / 交易:${tradeUsedThisTurn ? "使用済" : "未使用"}`, px + 28, py + 108);
  text(`行動: ${actionsLeft[HUMAN_PLAYER_ID]}/${ACTIONS_PER_TURN} / 文化転向: ${flipCapturesThisTurn[HUMAN_PLAYER_ID]}/${MAX_FLIPS_PER_PLAYER_TURN}`, px + 28, py + 124);
  text(`武将: ${officerCount(HUMAN_PLAYER_ID)}/${officerLimit(HUMAN_PLAYER_ID)} / 先鋒: ${officerSummary(HUMAN_PLAYER_ID)}`, px + 28, py + 140, UI_W - 56, 30);
  text(`勅命: ${missionStatusText(HUMAN_PLAYER_ID)}`, px + 28, py + 172, UI_W - 56, 30);
  text(`産物: 和紙${meStat.washi} / 陶器${meStat.pottery} / 機会${meStat.innovation}`, px + 28, py + 196, UI_W - 56, 18);
  text(`守将待機: ${freeOfficerCount(HUMAN_PLAYER_ID)}名`, px + 28, py + 212, UI_W - 56, 18);
  const buttonsBottom = buttons.length > 0 ? buttons[buttons.length - 1].y + buttons[buttons.length - 1].h : py + 110;
  const tileInfoY = buttonsBottom + 20;

  fill(24, 42, 68);
  textSize(13);
  text(`選択: ${tileLabel(t)}`, px + 28, tileInfoY);
  const levelText = supportsBuildingLevel(t) ? ` / Lv${buildingLevel(t)}` : "";
  text(`地形: ${t.type}${levelText} / 人口:${t.population || 0}/${populationCap(t)}`, px + 28, tileInfoY + 22);
  text(`所有: ${ownerName(t.owner)}`, px + 28, tileInfoY + 44);
  text(`影響力: 二丈${t.inf[1] || 0} / 伊都${t.inf[2] || 0} / 志摩${t.inf[3] || 0}`, px + 28, tileInfoY + 66);
  text(`役割: ${tileRoleTitle(t)}`, px + 28, tileInfoY + 88);
  if (t.type === TYPE.JO) {
    const guard = garrisonOfficer(t);
    const guardText = guard ? `守将: ${guard.name} 武${guard.valor} 知${guard.wit} 政${guard.admin}` : "守将: 未配置";
    text(guardText, px + 28, tileInfoY + 104, UI_W - 56, 18);
  }
  textSize(11);
  text(tileRoleDetail(t, me.id), px + 28, tileInfoY + (t.type === TYPE.JO ? 124 : 106), UI_W - 56, 46);

  fill(150, 56, 52);
  textSize(12);
  text(`敵進捗: 支配率${enemyControl}% (勝利:${round(CONTROL_WIN_RATE * 100)}%)`, px + 28, tileInfoY + 150);

  fill(48, 54, 62);
  textSize(11);
  const portCombo = hasPortWorkshopCombo(HUMAN_PLAYER_ID) ? "有効(交易+2)" : "未成立";
  const shrineCombo = hasShrineTempleCombo(HUMAN_PLAYER_ID) ? "有効(文化波及+1)" : "未成立";
  const mountainCombo = hasMountainCastleCombo(HUMAN_PLAYER_ID) ? "有効(山城攻防+1)" : "未成立";
  const ob = officerBonuses(HUMAN_PLAYER_ID);
  text(`季節: ${seasonState.name} (${seasonState.desc})\nコンボ: 港+工房 ${portCombo}\nコンボ: 寺+神社 ${shrineCombo}\nコンボ: 山+城 ${mountainCombo}\n武将補正: 文化+${ob.culture} / 交易+${ob.trade} / 軍備+${ob.forceTrain} / 攻撃軽減-${ob.attackDiscount}`, px + 28, tileInfoY + 168, UI_W - 56, 110);
}

function drawBottomBar() {
  const y0 = height - BOTTOM_H;
  const theme = clanTheme(HUMAN_PLAYER_ID);
  fillLinearGradientRect(0, y0, width, BOTTOM_H, themeColor(theme, "panelA"), themeColor(theme, "panelB"));
  drawWovenPattern(0, y0, width, BOTTOM_H, 10);
  drawPanelCard(10, y0 + 10, width - 20, BOTTOM_H - 20, 18);
  drawThemeFrame(10, y0 + 10, width - 20, BOTTOM_H - 20, theme, 18);

  fill(28, 42, 58);
  textAlign(LEFT, TOP);
  textSize(14);
  text("戦況報告", 24, y0 + 20);
  textSize(12);
  text(message, 24, y0 + 44, width - 48, 28);

  fill(50, 86, 126);
  textSize(11);
  if (latestComment) text(`軍記: ${latestComment}`, 24, y0 + 74, width - 48, 18);

  fill(78, 78, 78);
  textSize(11);
  const enemyRate = round(maxEnemyControlRate(HUMAN_PLAYER_ID) * 100);
  const controlGoal = round(CONTROL_WIN_RATE * 100);
  const dangerControlLine = max(0, controlGoal - 15);
  const danger = enemyRate >= dangerControlLine;
  const hint = danger
    ? `警戒: 敵の勝利が近い (支配率${enemyRate}%)`
    : `勝利条件: 支配率${controlGoal}% / 敵: 支配率${enemyRate}%`;
  text(hint, 24, y0 + 92);

  const mission = missionStateByPlayer[HUMAN_PLAYER_ID];
  const missionLine = mission
    ? `${mission.title} - ${mission.desc} / 下賜: ${missionRewardText(mission.reward)} / 状態:${mission.completed ? "達成" : `${mission.progress}/${mission.target}`}`
    : "勅命: なし";
  text(missionLine, 24, y0 + 108, width - 48, 22);

  fill(64, 64, 64);
  textSize(10);
  const report = incomeReport[HUMAN_PLAYER_ID] || "収入内訳: まだ収益処理なし";
  text(report, 24, y0 + 130, width - 48, 16);
}

function drawOutcomeBackdrop(x, y, w, h, outcome) {
  push();
  const theme = outcome === "win" ? clanTheme(HUMAN_PLAYER_ID) : clanTheme(max(1, players[(currentPlayer + 1) % max(1, players.length)]?.id || 2));
  fillLinearGradientRect(x, y, w, h,
    outcome === "win" ? themeColor(theme, "accentLight") : color(54, 36, 44),
    outcome === "win" ? themeColor(theme, "accent") : color(18, 18, 28),
    false, 22);
  const cx = x + w / 2;
  const cy = y + h * 0.38;
  noFill();
  for (let i = 0; i < 8; i++) {
    const ang = (TWO_PI / 8) * i + frameCount * 0.002;
    stroke(outcome === "win" ? 255 : 180, outcome === "win" ? 220 : 80, outcome === "win" ? 170 : 90, 70);
    strokeWeight(3);
    line(cx, cy, cx + cos(ang) * w * 0.34, cy + sin(ang) * h * 0.22);
  }
  drawClanCrestMark(theme.crest, cx, cy, 28, color(255, 250), 210);
  if (outcome === "win") {
    noStroke();
    for (let i = 0; i < 18; i++) {
      fill(255, 232, 176, 120);
      const px = x + (i / 18) * w + sin(frameCount * 0.02 + i) * 10;
      const py = y + 30 + (i % 5) * 18 + sin(frameCount * 0.04 + i) * 6;
      ellipse(px, py, 6, 6);
    }
  }
  pop();
}

function drawEventPopup() {
  fill(0, 90);
  rect(0, 0, width, height);
  const theme = currentTheme();

  const w = min(700, width - 80);
  const h = min(560, height - 70);
  const x = (width - w) / 2;
  const y = (height - h) / 2;

  drawPanelCard(x, y, w, h, 22);
  drawThemeFrame(x, y, w, h, theme, 22);
  fill(166, 124, 64, 34);
  noStroke();
  rect(x + 18, y + 18, w - 36, 46, 14);

  fill(32, 42, 56);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(22);
  text(eventPopup.title, x + 24, y + 22);

  fill(120);
  textSize(12);
  text(`ID: ${eventPopup.cardId}`, x + 24, y + 56);

  const artId = eventPopup.artId || eventPopup.cardId;
  const art = artEntry(`events.${artId}`);
  const artX = x + 24;
  const artY = y + 78;
  const artW = w - 48;
  const artH = min(300, h - 250);
  if (art && art.ready && art.img) {
    drawEventArtImage(art.img, artX, artY, artW, artH);
  } else {
    fill(238, 230, 214);
    rect(artX, artY, artW, artH, 18);
    fill(120);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("情景画を読込中", artX + artW / 2, artY + artH / 2);
  }

  fill(40);
  textAlign(LEFT, TOP);
  textSize(15);
  const descY = artY + artH + 18;
  text(eventPopup.desc, x + 24, descY, w - 48, 50);

  fill(30);
  textSize(14);
  text(eventPopup.effectText, x + 24, descY + 62, w - 48, 56);

  fill(242, 228, 196);
  rect(x + w - 130, y + 18, 100, 28, 14);
  fill(74, 60, 40);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(eventPopup.usedLabel, x + w - 80, y + 32);

  const ok = eventPopupOkRect();
  fill(255);
  stroke(28, 34, 44, 130);
  strokeWeight(1.4);
  rect(ok.x, ok.y, ok.w, ok.h, 12);
  noStroke();
  fill(0);
  textSize(16);
  text("OK", ok.x + ok.w / 2, ok.y + ok.h / 2);
}

function drawEventArtImage(img, x, y, w, h) {
  push();
  fill(25, 28, 34);
  noStroke();
  rect(x, y, w, h, 18);
  drawingContext.save();
  roundedRectPath(drawingContext, x, y, w, h, 18);
  drawingContext.clip();
  drawImageContain(img, x, y, w, h);
  drawingContext.restore();
  noFill();
  stroke(255, 255, 255, 100);
  strokeWeight(1.4);
  rect(x, y, w, h, 18);
  pop();
}

function drawImageContain(img, x, y, w, h) {
  const srcRatio = img.width / max(1, img.height);
  const dstRatio = w / max(1, h);
  let dw = w;
  let dh = h;
  if (srcRatio > dstRatio) {
    dh = w / srcRatio;
  } else {
    dw = h * srcRatio;
  }
  image(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawWinPopup() {
  fill(0, 100);
  rect(0, 0, width, height);
  const theme = gameState === "win" ? clanTheme(HUMAN_PLAYER_ID) : currentTheme();

  const w = min(520, width - 100);
  const h = 290;
  const x = (width - w) / 2;
  const y = (height - h) / 2;

  drawOutcomeBackdrop(x, y, w, h, gameState);
  drawPanelCard(x, y, w, h, 22);
  drawThemeFrame(x, y, w, h, theme, 22);

  fill(gameState === "win" ? color(28, 116, 82) : color(168, 52, 52));
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(34);
  text(gameState === "win" ? "勝利" : "敗北", x + w / 2, y + 52);
  fill(40);
  textSize(15);
  text(winText, x + 28, y + 102, w - 56, 118);

  const r = winPopupRestartRect();
  fillLinearGradientRect(r.x, r.y, r.w, r.h, themeColor(theme, "accent"), themeColor(theme, "accentDark"), false, 12);
  stroke(240, 242, 244, 120);
  strokeWeight(1.3);
  rect(r.x, r.y, r.w, r.h, 12);
  noStroke();
  fill(248);
  textSize(16);
  text("もう一度あそぶ", r.x + r.w / 2, r.y + r.h / 2);
}

function drawWorkshopBuildPopup() {
  fill(0, 100);
  rect(0, 0, width, height);
  const theme = currentTheme();

  const rectInfo = workshopBuildPopupRect();
  drawPanelCard(rectInfo.x, rectInfo.y, rectInfo.w, rectInfo.h, 22);
  drawThemeFrame(rectInfo.x, rectInfo.y, rectInfo.w, rectInfo.h, theme, 22);

  const t = getTile(workshopBuildPopup.c, workshopBuildPopup.r);
  fill(32, 42, 56);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(22);
  text("工房建設", rectInfo.x + 24, rectInfo.y + 20);
  textSize(13);
  fill(80);
  text(`建設先: ${t ? tileLabel(t) : "-"}`, rectInfo.x + 24, rectInfo.y + 56);
  text(`費用: 金${BUILD_WORKSHOP_COST}`, rectInfo.x + 24, rectInfo.y + 78);

  for (const op of workshopBuildOptionRects()) {
    fillLinearGradientRect(op.x, op.y, op.w, op.h, themeColor(theme, "panelA"), themeColor(theme, "panelB"), false, 16);
    stroke(themeColor(theme, "accentDark", 110));
    strokeWeight(1.2);
    rect(op.x, op.y, op.w, op.h, 16);
    noStroke();
    fill(28, 42, 58);
    textAlign(LEFT, CENTER);
    textSize(14);
    drawUiIcon(workshopKindIcon(op.kind), op.x + 15, op.y + op.h / 2, 8);
    text(op.label, op.x + 30, op.y + op.h / 2);
  }

  const c = workshopBuildCancelRect();
  fillLinearGradientRect(c.x, c.y, c.w, c.h, themeColor(theme, "accent"), themeColor(theme, "accentDark"), false, 10);
  stroke(240, 244, 246, 110);
  strokeWeight(1.2);
  rect(c.x, c.y, c.w, c.h, 10);
  noStroke();
  fill(248);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("キャンセル", c.x + c.w / 2, c.y + c.h / 2);
}

function drawBattlePopup() {
  fill(0, 120);
  rect(0, 0, width, height);
  const theme = currentTheme();
  const r = battleRect();
  const from = battlePopup.from ? getTile(battlePopup.from.c, battlePopup.from.r) : null;
  const target = battlePopup.target ? getTile(battlePopup.target.c, battlePopup.target.r) : null;
  if (!from || !target) return;
  const attackerOfficer = battleAttackerOfficer();
  const defender = tileDefenseProfile(target);

  drawPanelCard(r.x, r.y, r.w, r.h, 24);
  drawThemeFrame(r.x, r.y, r.w, r.h, theme, 24);
  fill(32, 42, 56);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(25);
  text(target.type === TYPE.JO ? "攻城戦" : (target.type === TYPE.JINJA || target.type === TYPE.TERA) ? "制圧戦" : "急襲戦", r.x + 26, r.y + 22);
  textSize(13);
  fill(72, 78, 88);
  text(`${tileLabel(from)} から ${tileLabel(target)} へ進軍`, r.x + 28, r.y + 58);

  const leftX = r.x + 28;
  const rightX = r.x + r.w / 2 + 20;
  fill(246, 248, 244, 225);
  rect(leftX, r.y + 88, r.w / 2 - 48, 92, 16);
  rect(rightX, r.y + 88, r.w / 2 - 48, 92, 16);
  fill(28, 42, 58);
  textSize(15);
  text("攻撃側", leftX + 16, r.y + 104);
  text("防御側", rightX + 16, r.y + 104);
  textSize(13);
  fill(45, 52, 60);
  text(`兵力: 武力${playerById(HUMAN_PLAYER_ID).force} / 基本消費${battlePopup.need}`, leftX + 16, r.y + 130);
  text(attackerOfficer ? `先鋒: ${attackerOfficer.name} 武${attackerOfficer.valor} 知${attackerOfficer.wit} 政${attackerOfficer.admin}` : "先鋒: 足軽隊のみ", leftX + 16, r.y + 152);
  const hpText = target.type === TYPE.JO ? ` / 耐久${target.castleHp || castleMaxHp(target)}/${castleMaxHp(target)}` : "";
  text(`拠点: ${tileLabel(target)}${hpText}`, rightX + 16, r.y + 130);
  text(defender.desc, rightX + 16, r.y + 152);

  if (battlePopup.phase === "result") {
    fill(30, 36, 44);
    textSize(15);
    text("戦闘結果", r.x + 28, r.y + 206);
    textSize(13);
    fill(48, 54, 62);
    text(battlePopup.resultLines.join("\n"), r.x + 28, r.y + 236, r.w - 56, 110);
    const ok = battleOkRect();
    drawBattleButton(ok, "マップへ戻る", true, theme);
    return;
  }

  fill(30, 36, 44);
  textSize(15);
  text("戦術を選択", r.x + 28, r.y + 188);
  for (const box of battleTacticRects()) {
    const cost = tacticCost(battlePopup.need, box.tactic);
    const enabled = tacticAvailable(box.tactic, target, cost);
    fill(enabled ? color(255) : color(226, 226, 226));
    stroke(enabled ? color(48, 56, 66) : color(150));
    strokeWeight(1.2);
    rect(box.x, box.y, box.w, box.h, 14);
    noStroke();
    fill(enabled ? color(0) : color(100));
    textAlign(LEFT, TOP);
    textSize(14);
    text(`${box.tactic.name}  武力-${cost}`, box.x + 14, box.y + 9);
    textSize(11);
    text(box.tactic.desc, box.x + 14, box.y + 30, box.w - 28, 24);
  }
  drawBattleButton(battleCancelRect(), "中止", true, theme);
}

function drawBattleButton(r, label, enabled, theme) {
  fill(enabled ? 255 : 226);
  stroke(enabled ? themeColor(theme, "accentDark") : color(150));
  strokeWeight(1.2);
  rect(r.x, r.y, r.w, r.h, 12);
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(label, r.x + r.w / 2, r.y + r.h / 2);
}

function rectContains(rectInfo, mx, my) {
  return mx >= rectInfo.x && mx <= rectInfo.x + rectInfo.w && my >= rectInfo.y && my <= rectInfo.y + rectInfo.h;
}

function handleBattlePopupClick(mx, my) {
  if (battlePopup.phase === "result") {
    if (rectContains(battleOkRect(), mx, my)) battlePopup.open = false;
    return;
  }
  if (rectContains(battleCancelRect(), mx, my)) {
    battlePopup.open = false;
    attackMode = { active: false, from: null };
    message = "攻撃を中止しました。";
    return;
  }
  const target = battlePopup.target ? getTile(battlePopup.target.c, battlePopup.target.r) : null;
  if (!target) return;
  for (const box of battleTacticRects()) {
    const cost = tacticCost(battlePopup.need, box.tactic);
    if (rectContains(box, mx, my) && tacticAvailable(box.tactic, target, cost)) {
      resolveBattleTactic(box.tactic);
      return;
    }
  }
}

function openSiegeScene(tactic) {
  const from = battlePopup.from ? getTile(battlePopup.from.c, battlePopup.from.r) : null;
  const target = battlePopup.target ? getTile(battlePopup.target.c, battlePopup.target.r) : null;
  if (!from || !target) return;
  const maxHp = castleMaxHp(target);
  const hpBefore = target.castleHp > 0 ? target.castleHp : maxHp;
  siegeScene = {
    open: true,
    tactic,
    from: { c: from.c, r: from.r, name: tileLabel(from), owner: from.owner },
    target: {
      c: target.c,
      r: target.r,
      name: tileLabel(target),
      owner: target.owner,
      hpBefore,
      hpMax: maxHp,
      level: buildingLevel(target),
    },
    startedAt: frameCount,
    phase: "command",
    round: 1,
    maxRounds: 3,
    hp: hpBefore,
    hpMax: maxHp,
    baseCost: tacticCost(battlePopup.need, tactic),
    extraCost: 0,
    logs: [`${tactic.name}: ${battleAttackerOfficer() ? `${battleAttackerOfficer().name}が攻城を指揮` : "足軽隊が攻城を開始"}`],
    lastCommand: null,
    lastOutcome: null,
    resolved: false,
    resultText: "",
    resultLines: [],
  };
  battlePopup.phase = "scene";
  message = `${tileLabel(target)}攻城戦: 指示を選んでください。`;
}

function siegeSceneBackRect() {
  const r = siegeSceneRect();
  return { x: r.x + r.w - 152, y: r.y + r.h - 52, w: 124, h: 34 };
}

function siegeSceneRect() {
  const w = min(900, width - 64);
  const h = min(560, height - 64);
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

function handleSiegeSceneClick(mx, my) {
  if (siegeScene.resolved) {
    if (rectContains(siegeSceneBackRect(), mx, my)) {
      siegeScene.open = false;
      battlePopup.open = false;
    }
    return;
  }
  if (siegeScene.phase === "anim") {
    siegeScene.startedAt = min(siegeScene.startedAt, frameCount - 34);
    return;
  }
  if (siegeScene.phase !== "command") return;
  for (const box of siegeCommandRects()) {
    if (rectContains(box, mx, my)) {
      resolveSiegeCommand(box.command);
      return;
    }
  }
}

function siegeCommandRects() {
  const r = siegeSceneRect();
  const gap = 10;
  const y = r.y + r.h - 76;
  const w = (r.w - 48 - gap * 3) / 4;
  return SIEGE_COMMANDS.map((command, i) => ({
    command,
    x: r.x + 24 + i * (w + gap),
    y,
    w,
    h: 52,
  }));
}

function siegeCommandEnabled(command) {
  if (command.withdraw) return true;
  const me = playerById(HUMAN_PLAYER_ID);
  if (!me) return false;
  return me.force >= siegeScene.baseCost + siegeScene.extraCost + command.cost;
}

function resolveSiegeCommand(command) {
  if (!siegeScene.open || siegeScene.phase !== "command" || siegeScene.resolved) return;
  if (!siegeCommandEnabled(command)) {
    message = `${command.name}には武力が足りません。`;
    return;
  }
  if (command.withdraw) {
    finishSiegeBattle(false, true);
    return;
  }

  const target = siegeScene.target ? getTile(siegeScene.target.c, siegeScene.target.r) : null;
  if (!target) return;
  const attackerOfficer = battleAttackerOfficer();
  const defender = tileDefenseProfile(target);
  const attackStat = attackerOfficer ? (attackerOfficer[command.stat] || 0) : 3;
  const defenseStat = defender[command.stat] || 1;
  const roll = floor(random(1, 7));
  const score = attackStat + roll + (command.scoreBonus || 0);
  const defenseScore = defenseStat + (defender.hasOfficer ? 3 : 1) + buildingLevelBonus(target);
  const success = score >= defenseScore;
  let damage = command.baseDamage + (success ? 1 : 0);
  if (command.id === "surprise" && success && score >= defenseScore + 2) damage += command.critDamage || 0;
  if (command.id === "gate" && !success) damage = max(0, damage - 1);
  if (siegeScene.tactic && siegeScene.tactic.id === "assault" && command.id === "gate") damage += 1;
  if (siegeScene.tactic && siegeScene.tactic.id === "siege" && command.id === "encircle") damage += 1;
  if (siegeScene.tactic && siegeScene.tactic.id === "raid" && command.id === "surprise") damage += 1;
  damage = max(0, damage);

  siegeScene.extraCost += command.cost + (!success && command.risk ? command.risk : 0);
  const hpBefore = siegeScene.hp;
  siegeScene.hp = max(0, siegeScene.hp - damage);
  siegeScene.lastCommand = command;
  siegeScene.lastOutcome = { success, score, defenseScore, damage, hpBefore, hpAfter: siegeScene.hp };
  siegeScene.logs.push(`${siegeScene.round}R ${command.name}: 攻${score} vs 守${defenseScore} / ${success ? "成功" : "苦戦"} / 耐久 ${hpBefore}->${siegeScene.hp}`);
  siegeScene.phase = "anim";
  siegeScene.startedAt = frameCount;
  playBattleSfx(max(1, command.cost + damage));
  triggerCameraShake(min(14, 5 + damage * 2), 12);
  message = `${command.name}: 城耐久 ${siegeScene.hp}/${siegeScene.hpMax}`;
}

function updateSiegeSceneResolution(elapsed) {
  if (!siegeScene.open || siegeScene.resolved || siegeScene.phase !== "anim" || elapsed < 38) return;
  if (siegeScene.hp <= 0) {
    finishSiegeBattle(true, false);
    return;
  }
  if (siegeScene.round >= siegeScene.maxRounds) {
    finishSiegeBattle(false, false);
    return;
  }
  siegeScene.round += 1;
  siegeScene.phase = "command";
  message = `攻城戦 ${siegeScene.round}/${siegeScene.maxRounds}: 次の指示を選んでください。`;
}

function finishSiegeBattle(captured, withdrew) {
  if (!siegeScene.open || siegeScene.resolved) return;
  const me = players[currentPlayer];
  const from = getTile(battlePopup.from.c, battlePopup.from.r);
  const target = getTile(battlePopup.target.c, battlePopup.target.r);
  if (!me || !from || !target) return;
  const totalCost = max(1, siegeScene.baseCost + siegeScene.extraCost);
  const paidCost = min(me.force, totalCost);
  me.force -= paidCost;
  const maxHp = castleMaxHp(target);
  const hpBefore = siegeScene.target.hpBefore;
  const lines = [...siegeScene.logs];

  attackMode = { active: false, from: null };
  spendAction(me.id);

  if (!captured) {
    target.castleHp = max(1, siegeScene.hp);
    pushTileFx(target.c, target.r, withdrew ? "撤退" : `攻城 ${target.castleHp}/${maxHp}`, color(220, 90, 70));
    const reason = withdrew ? "撤退" : "攻め切れず";
    lines.push(`城耐久: ${hpBefore}/${maxHp} -> ${target.castleHp}/${maxHp}`);
    message = `攻城${reason}: ${tileLabel(target)} の耐久 ${target.castleHp}/${maxHp} (武力-${paidCost})`;
    message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
    battlePopup.phase = "result";
    battlePopup.tacticId = siegeScene.tactic.id;
    battlePopup.resultText = message;
    battlePopup.resultLines = lines;
    siegeScene.resolved = true;
    siegeScene.phase = "result";
    siegeScene.resultText = message;
    siegeScene.resultLines = lines;
    return;
  }

  const prevOfficer = garrisonOfficer(target);
  if (prevOfficer) prevOfficer.assignedCastleKey = null;
  target.garrisonOfficerId = null;
  target.owner = me.id;
  resetTileInfluence(target);
  capturePopulationLoss(target);
  target.castleHp = castleMaxHp(target);

  selected = { c: target.c, r: target.r };
  const officerMoment = tryOfficerMoment(me.id, "attack", from, target);
  pushTileFx(target.c, target.r, "制圧", color(220, 70, 70));
  latestComment = gainComment(me.id, target, "攻撃");
  message = `攻城成功: ${tileLabel(target)} が陥落し獲得 (武力-${paidCost})`;
  if (officerMoment) message += ` / ${officerMoment}`;
  lines.push(`城耐久: ${hpBefore}/${maxHp} -> 陥落`);
  lines.push(`${tileLabel(target)} を制圧`);
  if (officerMoment) lines.push(officerMoment);
  const missionText = advanceMission(me.id, "capture", target);
  if (missionText) {
    message += ` / ${missionText}`;
    lines.push(missionText);
  }
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
  battlePopup.phase = "result";
  battlePopup.tacticId = siegeScene.tactic.id;
  battlePopup.resultText = message;
  battlePopup.resultLines = lines;
  openInfoPopup(
    `${tileLabel(target)} 陥落`,
    `${tileLabel(target)}の城門を破り、軍勢が城内へなだれ込みました。旗印が替わり、この城は新たな支配下に入ります。`,
    `攻城成功 / 武力-${paidCost}${officerMoment ? ` / ${officerMoment}` : ""}${missionText ? ` / ${missionText}` : ""}`,
    "陥落",
    "CASTLE-FALL",
    "castleFall",
  );
  siegeScene.resolved = true;
  siegeScene.phase = "result";
  siegeScene.resultText = message;
  siegeScene.resultLines = lines;
}

function drawSiegeScene() {
  const elapsed = frameCount - siegeScene.startedAt;
  updateSiegeSceneResolution(elapsed);

  const r = siegeSceneRect();
  const fromTile = siegeScene.from ? getTile(siegeScene.from.c, siegeScene.from.r) : null;
  const targetTile = siegeScene.target ? getTile(siegeScene.target.c, siegeScene.target.r) : null;
  if (!fromTile || !targetTile) return;

  const attacker = playerById(HUMAN_PLAYER_ID);
  const defenderPlayer = playerById(siegeScene.target.owner);
  const attackerTheme = clanTheme(HUMAN_PLAYER_ID);
  const defenderTheme = clanTheme(siegeScene.target.owner || targetTile.owner || HUMAN_PLAYER_ID);
  const tactic = siegeScene.tactic || BATTLE_TACTICS[0];
  const attackerOfficer = battleAttackerOfficer();
  const defender = tileDefenseProfile(targetTile);
  const troopProgress = siegeScene.phase === "anim" ? constrain(elapsed / 38, 0, 1) : 0.18 + (siegeScene.round - 1) * 0.18;
  const impactPulse = siegeScene.phase === "anim" ? max(0, sin(elapsed * 0.42)) : 0;

  fill(0, 168);
  rect(0, 0, width, height);
  drawPanelCard(r.x, r.y, r.w, r.h, 16);
  drawThemeFrame(r.x, r.y, r.w, r.h, attackerTheme, 16);

  const fieldX = r.x + 24;
  const fieldY = r.y + 74;
  const fieldW = r.w - 48;
  const fieldH = r.h - 238;
  fillLinearGradientRect(fieldX, fieldY, fieldW, fieldH, color(202, 216, 198), color(146, 170, 148), false, 8);
  drawWovenPattern(fieldX, fieldY, fieldW, fieldH, 12);

  noStroke();
  fill(24, 36, 50);
  textAlign(LEFT, TOP);
  textSize(24);
  text("攻城戦", r.x + 28, r.y + 22);
  textSize(13);
  fill(72, 78, 88);
  text(`${siegeScene.from.name} から ${siegeScene.target.name} へ進軍 / 戦術: ${tactic.name} / ${siegeScene.round}/${siegeScene.maxRounds}R`, r.x + 30, r.y + 54);

  drawSiegeHills(fieldX, fieldY, fieldW, fieldH);
  drawSiegeCastle(targetTile, fieldX + fieldW * 0.74, fieldY + fieldH * 0.62, min(62, fieldH * 0.18), defenderTheme, impactPulse);
  drawSiegeUnits(fieldX, fieldY, fieldW, fieldH, attackerTheme, defenderTheme, troopProgress, impactPulse);
  drawSiegeProjectiles(fieldX, fieldY, fieldW, fieldH, elapsed, troopProgress);
  drawSiegeBanner(fieldX + 22, fieldY + 24, attackerTheme, attacker ? attacker.name : "攻撃側");
  drawSiegeBanner(fieldX + fieldW - 150, fieldY + 24, defenderTheme, defenderPlayer ? defenderPlayer.name : "防御側");

  const hpMax = siegeScene.hpMax || siegeScene.target.hpMax || castleMaxHp(targetTile);
  const hpNow = siegeScene.resolved && targetTile.owner === HUMAN_PLAYER_ID ? 0 : siegeScene.hp;
  drawSiegeStatusPanel(r, attacker, attackerOfficer, defender, hpNow, hpMax, tactic);

  if (siegeScene.resolved) {
    drawSiegeResultPanel(r);
  } else if (siegeScene.phase === "command") {
    drawSiegeCommandCards();
  } else {
    fill(24, 36, 50);
    textAlign(CENTER, CENTER);
    textSize(13);
    text("攻撃中... クリックで早送り", r.x + r.w / 2, r.y + r.h - 34);
  }
}

function drawSiegeHills(x, y, w, h) {
  noStroke();
  fill(94, 126, 104, 100);
  beginShape();
  vertex(x, y + h * 0.68);
  bezierVertex(x + w * 0.18, y + h * 0.5, x + w * 0.34, y + h * 0.62, x + w * 0.5, y + h * 0.48);
  bezierVertex(x + w * 0.66, y + h * 0.34, x + w * 0.84, y + h * 0.48, x + w, y + h * 0.38);
  vertex(x + w, y + h);
  vertex(x, y + h);
  endShape(CLOSE);
  fill(92, 88, 74, 48);
  rect(x + w * 0.1, y + h * 0.72, w * 0.82, h * 0.1, 100);
}

function drawSiegeCastle(tile, x, y, size, theme, impactPulse) {
  push();
  translate(impactPulse * 3, -abs(impactPulse) * 2);
  drawCastleStructure(tile, x, y, size);
  drawClanCrestMark(theme.crest, x + size * 0.88, y - size * 1.42, size * 0.13, themeColor(theme, "accentDark"), 230);
  stroke(themeColor(theme, "accentDark", 220));
  strokeWeight(1.4);
  line(x + size * 0.72, y - size * 0.9, x + size * 0.72, y - size * 1.55);
  noStroke();
  fill(themeColor(theme, "accent", 225));
  triangle(x + size * 0.72, y - size * 1.55, x + size * 1.16, y - size * 1.42, x + size * 0.72, y - size * 1.28);
  pop();
  if (impactPulse > 0.2) {
    noFill();
    stroke(255, 240, 170, 170);
    strokeWeight(2);
    ellipse(x - size * 0.4, y - size * 0.62, size * (0.5 + impactPulse), size * (0.28 + impactPulse * 0.2));
  }
}

function drawSiegeUnits(x, y, w, h, attackerTheme, defenderTheme, progress, impactPulse) {
  const ease = progress * progress * (3 - 2 * progress);
  for (let i = 0; i < 7; i++) {
    const lane = (i - 3) * h * 0.055;
    const sx = x + w * (0.18 + ease * 0.36) + (i % 2) * 12;
    const sy = y + h * 0.72 + lane;
    drawSiegeSoldier(sx, sy, 14, attackerTheme, 1);
  }
  for (let i = 0; i < 5; i++) {
    const sx = x + w * 0.68 + (i % 2) * 16 + impactPulse * 2;
    const sy = y + h * 0.48 + i * h * 0.045;
    drawSiegeSoldier(sx, sy, 12, defenderTheme, -1);
  }
}

function drawSiegeSoldier(x, y, size, theme, dir) {
  stroke(38, 42, 48, 210);
  strokeWeight(1.2);
  fill(themeColor(theme, "accent", 235));
  ellipse(x, y - size * 0.75, size * 0.55, size * 0.55);
  rect(x - size * 0.36, y - size * 0.46, size * 0.72, size * 0.68, 3);
  stroke(themeColor(theme, "accentDark", 230));
  line(x + dir * size * 0.28, y - size * 0.22, x + dir * size * 0.94, y - size * 0.74);
  line(x - size * 0.18, y + size * 0.2, x - size * 0.4, y + size * 0.64);
  line(x + size * 0.18, y + size * 0.2, x + size * 0.42, y + size * 0.64);
}

function drawSiegeProjectiles(x, y, w, h, elapsed, progress) {
  const active = siegeScene.phase === "anim" && elapsed < 38;
  if (!active) return;
  stroke(66, 54, 42, 190);
  strokeWeight(2);
  for (let i = 0; i < 4; i++) {
    const t = (progress + i * 0.16) % 1;
    const px = lerp(x + w * 0.33, x + w * 0.7, t);
    const arc = sin(t * PI) * h * 0.24;
    const py = lerp(y + h * 0.56, y + h * 0.42, t) - arc + i * 7;
    line(px - 12, py + 5, px + 10, py - 4);
    noStroke();
    fill(240, 96, 56, 190);
    ellipse(px + 12, py - 5, 8, 6);
    stroke(66, 54, 42, 190);
  }
}

function drawSiegeBanner(x, y, theme, label) {
  fill(255, 248, 236, 230);
  stroke(themeColor(theme, "accentDark", 180));
  strokeWeight(1.2);
  rect(x, y, 128, 30, 6);
  drawClanCrestMark(theme.crest, x + 18, y + 15, 6, themeColor(theme, "accentDark"), 220);
  noStroke();
  fill(24, 36, 50);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(label, x + 32, y + 15);
}

function drawSiegeCommandCards() {
  const me = playerById(HUMAN_PLAYER_ID);
  const r = siegeSceneRect();
  fill(24, 36, 50);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(`指示を選択 / 消費予定 武力-${siegeScene.baseCost + siegeScene.extraCost}${me ? ` / 残武力${me.force}` : ""}`, r.x + 28, r.y + r.h - 92);
  for (const box of siegeCommandRects()) {
    const command = box.command;
    const enabled = siegeCommandEnabled(command);
    fill(enabled ? color(255, 252, 246, 242) : color(222, 222, 222, 220));
    stroke(enabled ? color(48, 56, 66, 170) : color(132, 132, 132, 150));
    strokeWeight(1.2);
    rect(box.x, box.y, box.w, box.h, 8);
    noStroke();
    fill(enabled ? color(24, 36, 50) : color(96));
    textAlign(LEFT, TOP);
    textSize(13);
    text(command.name, box.x + 12, box.y + 8);
    textSize(10.5);
    const costText = command.withdraw ? "戦闘終了" : `追加武力-${command.cost}`;
    text(costText, box.x + box.w - 70, box.y + 10, 58, 12);
    fill(enabled ? color(58, 64, 72) : color(110));
    text(command.desc, box.x + 12, box.y + 26, box.w - 24, 22);
  }
}

function drawSiegeStatusPanel(r, attacker, attackerOfficer, defender, hpNow, hpMax, tactic) {
  const y = r.y + r.h - 152;
  fill(255, 252, 246, 235);
  stroke(68, 82, 96, 70);
  strokeWeight(1.1);
  rect(r.x + 24, y, r.w - 48, 54, 8);
  noStroke();
  fill(28, 42, 58);
  textAlign(LEFT, TOP);
  textSize(12);
  text(`攻撃: ${attacker ? attacker.name : "攻撃側"} / ${attackerOfficer ? `${attackerOfficer.name} 武${attackerOfficer.valor} 知${attackerOfficer.wit} 政${attackerOfficer.admin}` : "足軽隊"}`, r.x + 42, y + 10);
  text(`防御: ${defender.desc}`, r.x + 42, y + 30);
  textAlign(RIGHT, TOP);
  text(`${tactic.name} / 城耐久 ${max(0, hpNow)}/${hpMax}`, r.x + r.w - 42, y + 10);
  const barW = 160;
  const bx = r.x + r.w - 42 - barW;
  const by = y + 33;
  fill(86, 88, 92, 80);
  rect(bx, by, barW, 8, 4);
  fill(196, 72, 68, 210);
  rect(bx, by, barW * constrain(hpNow / max(1, hpMax), 0, 1), 8, 4);
}

function drawSiegeResultPanel(r) {
  const panelW = min(520, r.w - 80);
  const panelH = 142;
  const x = r.x + (r.w - panelW) / 2;
  const y = r.y + 112;
  fill(255, 252, 246, 244);
  stroke(48, 56, 66, 120);
  strokeWeight(1.3);
  rect(x, y, panelW, panelH, 10);
  noStroke();
  fill(24, 36, 50);
  textAlign(LEFT, TOP);
  textSize(17);
  text("戦闘結果", x + 18, y + 14);
  textSize(12);
  fill(48, 54, 62);
  text(siegeScene.resultLines.join("\n"), x + 18, y + 42, panelW - 36, 64);
  drawBattleButton(siegeSceneBackRect(), "マップへ戻る", true, currentTheme());
}

// ------------------ 繝懊ち繝ｳ ------------------

function buildButtons() {
  buttons = [];
  const px = width - UI_W + 18;
  let py = TOP_H + 220;
  const bw = UI_W - 36;
  const bh = 26;
  const gap = 3;
  const selectedTile = getTile(selected.c, selected.r);
  const upgradeLabel = canUpgradeBuilding(selectedTile, HUMAN_PLAYER_ID)
    ? `改修 (金${upgradeCost(selectedTile)})`
    : "改修 (条件あり)";

  buttons.push(new Button(px, py, bw, bh, "文化振興 (金3)", "culture", () => actionCulture())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "交易 (港で強)", "trade", () => actionTrade())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "軍備増強 (金3)", "force", () => actionForce())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "攻撃 (武力消費)", "attack", () => actionAttack())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "イベント (1回)", "event", () => actionEvent())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, `築城 (金${BUILD_CASTLE_COST})`, "castle", () => actionBuildCastle())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, `工房建設 (金${BUILD_WORKSHOP_COST})`, "workshop", () => actionBuildWorkshop())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, upgradeLabel, "upgrade", () => actionUpgradeBuilding())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, `武将登用 (金${RECRUIT_COST})`, "recruit", () => actionRecruitOfficer())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "守将配置", "castle", () => actionAssignCastleOfficer())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "ターン終了", "end", () => actionEndTurn()));
}

class Button {
  constructor(x, y, w, h, label, iconKind, onClick) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.label = label; this.iconKind = iconKind || buttonIconKind(label); this.onClick = onClick;
  }
  contains(mx, my) { return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h; }
  draw(enabled = true) {
    const fillCol = color(255, 255, 255);
    const borderCol = enabled ? color(48, 56, 66) : color(120, 120, 120);
    const labelCol = color(0, 0, 0);
    fill(fillCol);
    noStroke();
    rect(this.x, this.y, this.w, this.h, 12);
    stroke(borderCol);
    strokeWeight(enabled ? 1.4 : 1.1);
    rect(this.x, this.y, this.w, this.h, 12);
    stroke(230, 230, 230);
    strokeWeight(1);
    line(this.x + 12, this.y + 8, this.x + this.w - 12, this.y + 8);
    drawUiIcon(this.iconKind, this.x + 14, this.y + this.h / 2, 8);
    noStroke();
    fill(labelCol);
    textAlign(LEFT, CENTER);
    textSize(12);
    text(this.label, this.x + 28, this.y + this.h / 2);
  }
}
function workshopKind(tile) {
  if (!tile || tile.type !== TYPE.KOBO) return WORKSHOP_KIND.GENERIC;
  const name = tile.name || "";
  if (name.includes("ファブラボ")) return WORKSHOP_KIND.FABLAB;
  if (name.includes("和紙")) return WORKSHOP_KIND.WASHI;
  if (name.includes("陶")) return WORKSHOP_KIND.POTTERY;
  return WORKSHOP_KIND.GENERIC;
}

function workshopActionBonus(tile) {
  const kind = workshopKind(tile);
  const bonus = buildingLevelBonus(tile);
  function scaled(base) {
    return {
      culture: base.culture + bonus,
      gold: base.gold + bonus,
      force: base.force + (base.force > 0 ? bonus : 0),
      washi: base.washi + (base.washi > 0 ? bonus : 0),
      pottery: base.pottery + (base.pottery > 0 ? bonus : 0),
      innovation: base.innovation + (base.innovation > 0 ? bonus : 0),
    };
  }
  if (kind === WORKSHOP_KIND.FABLAB) {
    return scaled({ culture: 1, gold: 2, force: 1, washi: 0, pottery: 0, innovation: 1 });
  }
  if (kind === WORKSHOP_KIND.WASHI) {
    return scaled({ culture: 2, gold: 1, force: 0, washi: 2, pottery: 0, innovation: 0 });
  }
  if (kind === WORKSHOP_KIND.POTTERY) {
    return scaled({ culture: 1, gold: 2, force: 0, washi: 0, pottery: 2, innovation: 0 });
  }
  return scaled({ culture: 1, gold: 1, force: 0, washi: 0, pottery: 0, innovation: 0 });
}

function workshopTradeBonus(tile) {
  const kind = workshopKind(tile);
  const bonus = buildingLevelBonus(tile);
  function scaled(base) {
    return {
      gold: base.gold + bonus,
      force: base.force + (base.force > 0 ? bonus : 0),
      culture: base.culture + (base.culture > 0 ? bonus : 0),
      washi: base.washi + (base.washi > 0 ? bonus : 0),
      pottery: base.pottery + (base.pottery > 0 ? bonus : 0),
      innovation: base.innovation + (base.innovation > 0 ? bonus : 0),
    };
  }
  if (kind === WORKSHOP_KIND.FABLAB) {
    return scaled({ gold: 2, force: 1, culture: 0, washi: 0, pottery: 0, innovation: 1 });
  }
  if (kind === WORKSHOP_KIND.WASHI) {
    return scaled({ gold: 2, force: 0, culture: 1, washi: 1, pottery: 0, innovation: 0 });
  }
  if (kind === WORKSHOP_KIND.POTTERY) {
    return scaled({ gold: 3, force: 0, culture: 1, washi: 0, pottery: 1, innovation: 0 });
  }
  return scaled({ gold: 1, force: 0, culture: 0, washi: 0, pottery: 0, innovation: 0 });
}

function workshopCulturePower(tile) {
  const kind = workshopKind(tile);
  const bonus = buildingLevelBonus(tile);
  if (kind === WORKSHOP_KIND.WASHI) return 5 + bonus;
  if (kind === WORKSHOP_KIND.FABLAB) return 4 + bonus;
  if (kind === WORKSHOP_KIND.POTTERY) return 4 + bonus;
  return 5 + bonus;
}

function cultureActionGain(tile) {
  const ownerBonus = tile && tile.owner ? officerBonuses(tile.owner).culture : 0;
  if (tile.type !== TYPE.KOBO) {
    const base = (tile.type === TYPE.JINJA || tile.type === TYPE.TERA) ? 4 + buildingLevelBonus(tile) : 2;
    const seasonBonus = (tile.type === TYPE.JINJA || tile.type === TYPE.TERA) ? seasonState.shrineCultureActionBonus : 0;
    return base + seasonBonus + ownerBonus;
  }
  const b = workshopActionBonus(tile);
  return 3 + b.culture + ownerBonus;
}

// ------------------ 陦悟虚 ------------------

function actionCulture() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の拠点を選んでください。"; return; }
  if (me.gold < 3) { message = "金が足りません (必要: 3)。"; return; }

  me.gold -= 3;
  const bonus = cultureActionGain(t);
  me.culture += bonus;
  const extraLogs = [];
  if (t.type === TYPE.KOBO) {
    const b = workshopActionBonus(t);
    me.gold += b.gold;
    me.force += b.force;
    me.washi += b.washi;
    me.pottery += b.pottery;
    me.innovation += b.innovation;
    if (b.gold > 0) extraLogs.push(`金 +${b.gold}`);
    if (b.force > 0) extraLogs.push(`武力 +${b.force}`);
    if (b.washi > 0) extraLogs.push(`和紙 +${b.washi}`);
    if (b.pottery > 0) extraLogs.push(`陶器 +${b.pottery}`);
    if (b.innovation > 0) extraLogs.push(`機会 +${b.innovation}`);
  }
  if (t.type === TYPE.JINJA) {
    for (const nt of neighbors6(t.c, t.r)) nt.inf[me.id] += SHRINE_CULTURE_PULSE;
  }
  const officerMoment = tryOfficerMoment(me.id, "culture", t);
  spreadCulture(me.id);
  pushTileFx(t.c, t.r, `文化+${bonus}`, color(245, 145, 55));
  const baseMessage = t.type === TYPE.JINJA
    ? `文化振興を実行: 文化 +${bonus} / 神社波及 +${SHRINE_CULTURE_PULSE}`
    : `文化振興を実行: 文化 +${bonus}`;
  const pieces = [baseMessage];
  if (extraLogs.length > 0) pieces.push(extraLogs.join(" / "));
  if (officerMoment) pieces.push(officerMoment);
  message = pieces.join(" / ");
  const missionText = advanceMission(me.id, "culture", t);
  if (missionText) message += ` / ${missionText}`;
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function actionTrade() {
  if (!canPlayerAct()) return;
  if (tradeUsedThisTurn) { message = "このターンは交易を使用済みです。"; return; }
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の拠点を選んでください。"; return; }

  const trade = tradeGain(me.id, t);
  let gain = trade.gold;
  const workshopBonus = tradeWorkshopBonus(me.id);
  let extraInfo = "";
  if (t.type === TYPE.KOBO) {
    const b = workshopTradeBonus(t);
    gain += b.gold;
    me.force += b.force;
    me.culture += b.culture;
    me.washi += b.washi;
    me.pottery += b.pottery;
    me.innovation += b.innovation;
    const logs = [];
    if (b.force > 0) logs.push(`武力 +${b.force}`);
    if (b.culture > 0) logs.push(`文化 +${b.culture}`);
    if (b.washi > 0) logs.push(`和紙 +${b.washi}`);
    if (b.pottery > 0) logs.push(`陶器 +${b.pottery}`);
    if (b.innovation > 0) logs.push(`機会 +${b.innovation}`);
    if (logs.length > 0) extraInfo = ` / ${logs.join(" / ")}`;
  }
  me.gold += gain;
  if (trade.food > 0) me.food += trade.food;
  const officerMoment = tryOfficerMoment(me.id, "trade", t);
  tradeUsedThisTurn = true;
  pushTileFx(t.c, t.r, `金+${gain}`, color(56, 170, 255));
  const seasonGoldText = (t.type === TYPE.MINATO && seasonState.portTradeBonus > 0) ? ` / 季節金+${seasonState.portTradeBonus}` : "";
  const seasonFoodText = (isFishingPort(t) && seasonState.fishingFoodBonus > 0) ? ` / 季節食料+${seasonState.fishingFoodBonus}` : "";
  message = `交易を実行: 金 +${gain}${trade.food > 0 ? ` / 食料 +${trade.food}` : ""}（工房補正+${workshopBonus}${hasPortWorkshopCombo(me.id) ? " / 港+工房コンボ" : ""}${seasonGoldText}${seasonFoodText}）${extraInfo}${officerMoment ? ` / ${officerMoment}` : ""}`;
  const missionText = advanceMission(me.id, "trade", t);
  if (missionText) message += ` / ${missionText}`;
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function actionForce() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の拠点を選んでください。"; return; }
  if (me.gold < 3) { message = "金が足りません (必要: 3)。"; return; }

  me.gold -= 3;
  const bonus = officerBonuses(me.id).forceTrain;
  me.force += 3 + bonus;
  const officerMoment = tryOfficerMoment(me.id, "force", t);
  pushTileFx(t.c, t.r, `武力+${3 + bonus}`, color(235, 90, 80));
  message = bonus > 0 ? `軍備を増強しました (+${3 + bonus}, 武将補正+${bonus})。` : "軍備を増強しました (+3)。";
  if (officerMoment) message += ` / ${officerMoment}`;
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function actionRecruitOfficer() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の拠点を選んでください。"; return; }
  if (me.gold < RECRUIT_COST) { message = `金が足りません (必要: ${RECRUIT_COST})。`; return; }
  const limit = officerLimit(me.id);
  if (officerCount(me) >= limit) {
    message = `これ以上は抱えきれません。武将上限 ${limit} 名です。`;
    return;
  }
  const officer = createOfficerFromTile(me.id, t);
  if (!officer) { message = "登用候補がいません。"; return; }
  me.gold -= RECRUIT_COST;
  me.officers.push(officer);
  const officerMoment = tryOfficerMoment(me.id, "recruit", t);
  pushTileFx(t.c, t.r, officer.role, color(124, 116, 208));
  message = `武将を登用: ${officer.name} (${officer.role}) / 武${officer.valor} 知${officer.wit} 政${officer.admin} / 金-${RECRUIT_COST}${officerMoment ? ` / ${officerMoment}` : ""}`;
  const missionText = advanceMission(me.id, "recruit", t);
  openInfoPopup(
    `武将登用: ${officer.name}`,
    `${tileLabel(t)}にて${officer.role}を家臣に迎えました。以後、内政・交易・戦で能力に応じた補正を発揮します。`,
    `武${officer.valor} / 知${officer.wit} / 政${officer.admin} / 金-${RECRUIT_COST}${officerMoment ? ` / ${officerMoment}` : ""}${missionText ? ` / ${missionText}` : ""}`,
    "登用",
    "RECRUIT",
    "recruitOfficer",
  );
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
}

function actionAssignCastleOfficer() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id || t.type !== TYPE.JO) { message = "自領の城を選んでください。"; return; }
  if (!me.officers || me.officers.length === 0) { message = "配置できる武将がいません。"; return; }
  const roster = [null, ...me.officers];
  const currentId = t.garrisonOfficerId;
  const currentIndex = roster.findIndex((o) => (o ? o.id : null) === currentId);
  const nextIndex = (currentIndex + 1 + roster.length) % roster.length;
  const nextOfficer = roster[nextIndex];
  assignOfficerToCastle(me.id, nextOfficer, t);
  const defense = CASTLE_DEFENSE_PENALTY + buildingLevelBonus(t) + castleDefenseBonus(t);
  const flipResist = CASTLE_FLIP_RESIST + buildingLevelBonus(t) + castleFlipBonus(t);
  message = nextOfficer
    ? `守将配置: ${nextOfficer.name}を${tileLabel(t)}に配置 / 防衛+${defense} / 文化耐性+${flipResist}`
    : `守将配置を解除: ${tileLabel(t)} を空き城に戻しました。`;
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
}

function attackNeed(from, target, attackerId) {
  const ignoreMountain = mountainPassTurns[attackerId] > 0;
  const penalty = target.type === TYPE.YAMA && !ignoreMountain ? 3 + seasonState.mountainAttackPenalty : 0;
  const castlePenalty = target.type === TYPE.JO ? CASTLE_DEFENSE_PENALTY + buildingLevelBonus(target) + castleDefenseBonus(target) : 0;
  const defenderComboPenalty = (target.owner !== 0 && hasMountainCastleCombo(target.owner) && (target.type === TYPE.YAMA || target.type === TYPE.JO)) ? 1 : 0;
  const officerDiscount = officerBonuses(attackerId).attackDiscount;
  const discount = (from.type === TYPE.JO ? CASTLE_ATTACK_DISCOUNT : 0)
    + (from.type === TYPE.YAMA ? MOUNTAIN_ATTACK_DISCOUNT : 0)
    + ((hasMountainCastleCombo(attackerId) && (from.type === TYPE.JO || from.type === TYPE.YAMA)) ? 1 : 0)
    + officerDiscount;
  return max(1, FORCE_ATTACK + penalty + castlePenalty + defenderComboPenalty - discount);
}

function attackTargetStatus(attacker, from, target) {
  if (!from || from.owner !== attacker.id) {
    return { ok: false, reason: "攻撃元が無効です。" };
  }
  if (!target) {
    return { ok: false, reason: "攻撃先が不正です。" };
  }
  const isAdjacent = neighbors6(from.c, from.r).some((nt) => nt.c === target.c && nt.r === target.r);
  if (!isAdjacent) {
    return { ok: false, reason: `${tileLabel(target)} は隣接していないため攻撃できません。` };
  }
  if (target.type === TYPE.UMI) {
    return { ok: false, reason: `${tileLabel(target)} は海域のため攻撃できません。` };
  }
  if (target.owner === attacker.id) {
    return { ok: false, reason: `${tileLabel(target)} は自領のため攻撃できません。` };
  }
  const need = attackNeed(from, target, attacker.id);
  if (attacker.force < need) {
    return { ok: false, reason: `${tileLabel(target)} への攻撃には武力${need}が必要です。`, need };
  }
  return { ok: true, need };
}

const BATTLE_TACTICS = [
  {
    id: "assault",
    name: "強攻",
    desc: "武勇で押し切る。城耐久を大きく削るが消耗も重い。",
    stat: "valor",
    costMod: 1,
    baseDamage: 2,
    targetTypes: null,
  },
  {
    id: "siege",
    name: "包囲",
    desc: "堅実に包囲する。守将がいない拠点に安定して効く。",
    stat: "admin",
    costMod: 0,
    baseDamage: 1,
    targetTypes: null,
  },
  {
    id: "raid",
    name: "奇襲",
    desc: "知略で混乱を狙う。成功すれば消耗を抑えて制圧しやすい。",
    stat: "wit",
    costMod: 0,
    baseDamage: 1,
    targetTypes: null,
  },
  {
    id: "persuade",
    name: "調略",
    desc: "守備の心を崩す。神社・寺・守将なし拠点で特に有効。",
    stat: "wit",
    costMod: -1,
    baseDamage: 1,
    targetTypes: [TYPE.JINJA, TYPE.TERA, TYPE.KOBO, TYPE.MINATO],
  },
  {
    id: "duel",
    name: "一騎駆け",
    desc: "猛将向け。守将や足軽隊を圧倒できれば一気に士気を折る。",
    stat: "valor",
    costMod: 0,
    baseDamage: 1,
    targetTypes: null,
  },
];

const SIEGE_COMMANDS = [
  {
    id: "gate",
    name: "門攻め",
    desc: "城門へ押し込む。削りは大きいが反撃を受けやすい。",
    stat: "valor",
    cost: 2,
    baseDamage: 2,
    risk: 1,
  },
  {
    id: "encircle",
    name: "包囲",
    desc: "退路を断って堅実に削る。失敗しにくい。",
    stat: "admin",
    cost: 1,
    baseDamage: 1,
    scoreBonus: 1,
  },
  {
    id: "surprise",
    name: "奇襲",
    desc: "隙を突く。知略で勝てば大きく崩せる。",
    stat: "wit",
    cost: 1,
    baseDamage: 1,
    critDamage: 2,
  },
  {
    id: "withdraw",
    name: "撤退",
    desc: "ここで兵を引く。城耐久の削りだけを残す。",
    stat: "admin",
    cost: 0,
    baseDamage: 0,
    withdraw: true,
  },
];

function battleRect() {
  const w = min(760, width - 80);
  const h = 430;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

function battleTacticRects() {
  const r = battleRect();
  const cardW = (r.w - 64) / 2;
  const cardH = 58;
  return BATTLE_TACTICS.map((tactic, i) => ({
    tactic,
    x: r.x + 24 + (i % 2) * (cardW + 16),
    y: r.y + 208 + floor(i / 2) * (cardH + 10),
    w: cardW,
    h: cardH,
  }));
}

function battleOkRect() {
  const r = battleRect();
  return { x: r.x + r.w - 142, y: r.y + r.h - 58, w: 118, h: 34 };
}

function battleCancelRect() {
  const r = battleRect();
  return { x: r.x + 24, y: r.y + r.h - 58, w: 118, h: 34 };
}

function tileDefenseProfile(tile) {
  const guard = garrisonOfficer(tile);
  if (guard) {
    return {
      name: guard.name,
      label: `${guard.name} (${guard.role})`,
      valor: guard.valor,
      wit: guard.wit,
      admin: guard.admin,
      desc: `守将: 武${guard.valor} 知${guard.wit} 政${guard.admin}`,
      hasOfficer: true,
    };
  }
  const base = tile.type === TYPE.JO ? 4 : (tile.type === TYPE.JINJA || tile.type === TYPE.TERA) ? 3 : 2;
  return {
    name: "足軽守備隊",
    label: "足軽守備隊",
    valor: base,
    wit: max(1, base - 1),
    admin: max(1, base - 1),
    desc: `守将なし: 足軽隊 武${base} 知${max(1, base - 1)} 政${max(1, base - 1)}`,
    hasOfficer: false,
  };
}

function battleAttackerOfficer() {
  return leadOfficer(HUMAN_PLAYER_ID, "attack");
}

function tacticAvailable(tactic, target, cost) {
  const me = playerById(HUMAN_PLAYER_ID);
  if (!me || me.force < cost) return false;
  if (!tactic.targetTypes) return true;
  return tactic.targetTypes.includes(target.type) || !tileDefenseProfile(target).hasOfficer;
}

function tacticCost(baseNeed, tactic) {
  return max(1, baseNeed + (tactic.costMod || 0));
}

function openBattlePopup(from, target, need) {
  battlePopup = {
    open: true,
    phase: "choose",
    from: { c: from.c, r: from.r },
    target: { c: target.c, r: target.r },
    need,
    tacticId: "",
    resultText: "",
    resultLines: [],
  };
  message = `${tileLabel(target)} 攻撃: 戦術を選んでください。`;
}

function actionAttack() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の拠点を選んでください。"; return; }
  const targets = neighbors6(t.c, t.r)
    .filter((nt) => nt.type !== TYPE.UMI && nt.owner !== me.id)
    .map((nt) => attackTargetStatus(me, t, nt));
  const attackable = targets.some((info) => info.ok);
  if (!attackable) {
    const minNeed = targets.filter((info) => typeof info.need === "number").reduce((acc, info) => min(acc, info.need), 999);
    message = minNeed < 999
      ? `隣接先へ攻撃できません。最小でも武力${minNeed}が必要です。`
      : "攻撃できる隣接タイルがありません。";
    return;
  }
  attackMode = { active: true, from: { c: t.c, r: t.r } };
  message = `攻撃先を選択してください: ${tileLabel(t)} の隣接マスをクリック。攻撃不可なら理由を表示します。`;
}

function actionEvent() {
  if (!canPlayerAct()) return;
  if (!eventReadyThisTurn[HUMAN_PLAYER_ID]) { message = "このターンはイベントが発生していません。"; return; }
  if (eventUsedThisTurn) { message = "このターンはイベントを使用済みです。"; return; }

  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  const card = drawEventCard(me);
  const effectText = applyEvent(card, me, t, true);
  eventUsedThisTurn = true;
  eventUsedByPlayer[me.id] = true;
  discard.push(card);
  pushTileFx(t.c, t.r, "イベント", color(130, 145, 250));

  eventPopup = {
    open: true,
    title: `イベント: ${card.name}`,
    desc: card.desc,
    effectText,
    usedLabel: "使用済",
    cardId: card.id,
    artId: card.id,
  };
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function actionBuildCastle() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の拠点を選んでください。"; return; }
  if (!canBuildCastleOnTile(t)) { message = "築城できるのは自領の平地・山・工房・城です。"; return; }
  if (me.gold < BUILD_CASTLE_COST) { message = `金が足りません (必要: ${BUILD_CASTLE_COST})。`; return; }

  me.gold -= BUILD_CASTLE_COST;
  const keepLevel = t.type === TYPE.JO ? buildingLevel(t) : 1;
  t.type = TYPE.JO;
  t.level = keepLevel;
  t.name = "新城";
  t.castleHp = castleMaxHp(t);
  t.population = min(populationCap(t), max(t.population || 0, 3));
  const officerMoment = tryOfficerMoment(me.id, "develop", t);
  pushTileFx(t.c, t.r, "築城", color(196, 142, 112));
  message = `築城を実行: ${tileLabel(t)} を建設 (金-${BUILD_CASTLE_COST})${officerMoment ? ` / ${officerMoment}` : ""}`;
  const missionText = advanceMission(me.id, "develop", t);
  if (missionText) message += ` / ${missionText}`;
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function actionBuildWorkshop() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の拠点を選んでください。"; return; }
  if (!canBuildWorkshopOnTile(t)) { message = "工房を建設できるのは自領の平地・山・城・工房です。"; return; }
  if (me.gold < BUILD_WORKSHOP_COST) { message = `金が足りません (必要: ${BUILD_WORKSHOP_COST})。`; return; }

  workshopBuildPopup.open = true;
  workshopBuildPopup.c = t.c;
  workshopBuildPopup.r = t.r;
  message = "建設する工房を選んでください。";
}

function buildWorkshopSelected(kind) {
  const me = players[currentPlayer];
  const t = getTile(workshopBuildPopup.c, workshopBuildPopup.r);
  workshopBuildPopup.open = false;
  workshopBuildPopup.c = -1;
  workshopBuildPopup.r = -1;
  if (!t) return;
  if (t.owner !== me.id || !canBuildWorkshopOnTile(t)) {
    message = "建設条件を満たさなくなったため中止しました。";
    return;
  }
  if (me.gold < BUILD_WORKSHOP_COST) {
    message = `金が足りません (必要: ${BUILD_WORKSHOP_COST})。`;
    return;
  }

  me.gold -= BUILD_WORKSHOP_COST;
  const keepLevel = t.type === TYPE.KOBO ? buildingLevel(t) : 1;
  t.type = TYPE.KOBO;
  t.level = keepLevel;
  if (kind === WORKSHOP_KIND.FABLAB) t.name = "ファブラボ";
  else if (kind === WORKSHOP_KIND.WASHI) t.name = "和紙工房";
  else if (kind === WORKSHOP_KIND.POTTERY) t.name = "陶芸工房";
  else t.name = "工房";
  t.castleHp = 0;
  t.population = min(populationCap(t), max(t.population || 0, 3));

  selected = { c: t.c, r: t.r };
  const officerMoment = tryOfficerMoment(me.id, "develop", t);
  pushTileFx(t.c, t.r, "工房建設", color(236, 150, 96));
  message = `工房建設を実行: ${t.name} を建設 (金-${BUILD_WORKSHOP_COST})${officerMoment ? ` / ${officerMoment}` : ""}`;
  const missionText = advanceMission(me.id, "develop", t);
  if (missionText) message += ` / ${missionText}`;
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function actionUpgradeBuilding() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の建物を選んでください。"; return; }
  if (!supportsBuildingLevel(t)) { message = "改修できるのは城・工房・港・神社・寺です。"; return; }
  if (buildingLevel(t) >= BUILDING_LEVEL_MAX) { message = `${tileLabel(t)} は最大レベルです。`; return; }
  const cost = upgradeCost(t);
  if (me.gold < cost) { message = `金が足りません (必要: ${cost})。`; return; }

  me.gold -= cost;
  t.level = buildingLevel(t) + 1;
  if (t.type === TYPE.JO) t.castleHp = castleMaxHp(t);
  t.population = min(populationCap(t), max(t.population || 0, initialPopulationForType(t.type) + buildingLevelBonus(t)));
  const officerMoment = tryOfficerMoment(me.id, "develop", t);
  pushTileFx(t.c, t.r, `Lv${buildingLevel(t)}`, color(58, 170, 110));
  message = `改修を実行: ${tileLabel(t)} をLv${buildingLevel(t)}に増築 (金-${cost})${officerMoment ? ` / ${officerMoment}` : ""}`;
  const missionText = advanceMission(me.id, "develop", t);
  if (missionText) message += ` / ${missionText}`;
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function actionEndTurn() {
  if (gameState !== "playing") return;
  if (eventPopup.open || workshopBuildPopup.open) return;
  if (players[currentPlayer].id !== HUMAN_PLAYER_ID) return;
  attackMode = { active: false, from: null };
  endTurn();
}

function handleAttackTargetClick(c, r) {
  if (!attackMode.active || !attackMode.from) return;
  if (!canPlayerAct()) { attackMode = { active: false, from: null }; return; }

  const me = players[currentPlayer];
  const from = getTile(attackMode.from.c, attackMode.from.r);
  const target = getTile(c, r);
  if (!from || !target || from.owner !== me.id) {
    attackMode = { active: false, from: null };
    message = "攻撃元が無効になりました。やり直してください。";
    return;
  }
  const status = attackTargetStatus(me, from, target);
  if (!status.ok) {
    message = status.reason;
    return;
  }
  const need = status.need;
  openBattlePopup(from, target, need);
}

function resolveBattleTactic(tactic, fromSiegeScene = false) {
  if (!battlePopup.open || (battlePopup.phase !== "choose" && battlePopup.phase !== "scene")) return;
  const me = players[currentPlayer];
  const from = getTile(battlePopup.from.c, battlePopup.from.r);
  const target = getTile(battlePopup.target.c, battlePopup.target.r);
  if (!from || !target || from.owner !== me.id) {
    battlePopup.open = false;
    attackMode = { active: false, from: null };
    message = "攻撃元が無効になりました。";
    return;
  }
  const baseNeed = battlePopup.need;
  const finalCost = tacticCost(baseNeed, tactic);
  if (!tacticAvailable(tactic, target, finalCost)) {
    message = `${tactic.name} は条件を満たしていません。`;
    return;
  }

  if (target.type === TYPE.JO && !fromSiegeScene) {
    openSiegeScene(tactic);
    return;
  }

  const attackerOfficer = battleAttackerOfficer();
  const defender = tileDefenseProfile(target);
  const attackStat = attackerOfficer ? (attackerOfficer[tactic.stat] || 0) : 3;
  const defenseStat = defender[tactic.stat] || 1;
  const roll = floor(random(1, 7));
  const score = attackStat + roll + (tactic.id === "persuade" && (target.type === TYPE.JINJA || target.type === TYPE.TERA) ? 2 : 0);
  const defenseScore = defenseStat + (defender.hasOfficer ? 3 : 1) + buildingLevelBonus(target);
  const success = score >= defenseScore;
  let damage = tactic.baseDamage + (success ? 1 : 0);
  if (tactic.id === "siege" && target.type === TYPE.JO) damage += 1;
  if (tactic.id === "duel" && success && attackStat >= defenseStat + 2) damage += 1;
  if (tactic.id === "raid" && !success) damage = max(0, damage - 1);
  if (target.type !== TYPE.JO && success) damage += 1;
  damage = max(0, damage);

  me.force -= finalCost;
  playBattleSfx(finalCost);
  triggerCameraShake(min(14, 6 + finalCost * 0.5), 14);

  const lines = [
    `${tactic.name}: ${attackerOfficer ? `${attackerOfficer.name}が指揮` : "足軽隊が前進"}`,
    `${defender.desc}`,
    `判定: 攻${score} vs 守${defenseScore} / ${success ? "成功" : "苦戦"}`,
  ];
  if (target.type === TYPE.JO) {
    const maxHp = castleMaxHp(target);
    const hpBefore = target.castleHp > 0 ? target.castleHp : maxHp;
    const hpAfter = max(0, hpBefore - damage);
    target.castleHp = hpAfter;
    pushTileFx(target.c, target.r, hpAfter > 0 ? `攻城 ${hpAfter}/${maxHp}` : "陥落", color(220, 70, 70));
    if (hpAfter > 0) {
      lines.push(`城耐久: ${hpBefore}/${maxHp} -> ${hpAfter}/${maxHp}`);
      message = `攻城: ${tileLabel(target)} の耐久 ${hpAfter}/${maxHp} (武力-${finalCost})`;
      attackMode = { active: false, from: null };
      spendAction(me.id);
      message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
      battlePopup.phase = "result";
      battlePopup.tacticId = tactic.id;
      battlePopup.resultText = message;
      battlePopup.resultLines = lines;
      return;
    }
    lines.push(`城耐久: ${hpBefore}/${maxHp} -> 陥落`);
  }

  if (target.type !== TYPE.JO && !success && defender.hasOfficer) {
    lines.push(`${defender.name}が踏みとどまり、攻撃を押し返した`);
    message = `攻撃失敗: ${tileLabel(target)} の守備を崩せませんでした (武力-${finalCost})`;
    attackMode = { active: false, from: null };
    spendAction(me.id);
    message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
    battlePopup.phase = "result";
    battlePopup.tacticId = tactic.id;
    battlePopup.resultText = message;
    battlePopup.resultLines = lines;
    return;
  }

  if (target.type === TYPE.JO) {
    const prevOfficer = garrisonOfficer(target);
    if (prevOfficer) prevOfficer.assignedCastleKey = null;
    target.garrisonOfficerId = null;
  }
  target.owner = me.id;
  resetTileInfluence(target);
  capturePopulationLoss(target);
  if (target.type === TYPE.JO) target.castleHp = castleMaxHp(target);

  selected = { c: target.c, r: target.r };
  const officerMoment = tryOfficerMoment(me.id, "attack", from, target);
  pushTileFx(target.c, target.r, "制圧", color(220, 70, 70));
  latestComment = gainComment(me.id, target, "攻撃");
  message = target.type === TYPE.JO
    ? `攻城成功: ${tileLabel(target)} が陥落し獲得 (武力-${finalCost})`
    : `攻撃成功: ${tileLabel(target)} を獲得 (武力-${finalCost})`;
  if (officerMoment) message += ` / ${officerMoment}`;
  lines.push(`${tileLabel(target)} を制圧`);
  if (officerMoment) lines.push(officerMoment);
  const missionText = advanceMission(me.id, "capture", target);
  if (missionText) {
    message += ` / ${missionText}`;
    lines.push(missionText);
  }
  attackMode = { active: false, from: null };
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
  battlePopup.phase = "result";
  battlePopup.tacticId = tactic.id;
  battlePopup.resultText = message;
  battlePopup.resultLines = lines;
  if (target.type === TYPE.JO) {
    openInfoPopup(
      `${tileLabel(target)} 陥落`,
      `${tileLabel(target)}の城門を破り、軍勢が城内へなだれ込みました。旗印が替わり、この城は新たな支配下に入ります。`,
      `攻城成功 / 武力-${finalCost}${officerMoment ? ` / ${officerMoment}` : ""}${missionText ? ` / ${missionText}` : ""}`,
      "陥落",
      "CASTLE-FALL",
      "castleFall",
    );
  }
}

function canPlayerAct() {
  const me = players[currentPlayer];
  if (gameState !== "playing") return false;
  if (eventPopup.open) return false;
  if (workshopBuildPopup.open) return false;
  if (siegeScene.open) return false;
  if (battlePopup.open) return false;
  if (me.id !== HUMAN_PLAYER_ID) return false;
  if (actionsLeft[HUMAN_PLAYER_ID] <= 0) {
    message = "このターンの行動を使い切りました。ターン終了してください。";
    return false;
  }
  return true;
}

function spendAction(playerId) {
  actionsLeft[playerId] = max(0, actionsLeft[playerId] - 1);
}

function seasonForTurn(turnNum) {
  const idx = floor((turnNum - 1) / SEASON_SPAN_TURNS) % 3;
  if (idx === 0) {
    return {
      id: "fishing",
      name: "豊漁期",
      desc: "港交易+2 / 漁港食料+1",
      portTradeBonus: 2,
      fishingFoodBonus: 1,
      mountainAttackPenalty: 0,
      mountainResistBonus: 0,
      shrineCultureActionBonus: 0,
      shrineSpreadBonus: 0,
    };
  }
  if (idx === 1) {
    return {
      id: "rain",
      name: "豪雨期",
      desc: "山越えコスト+2 / 山地文化耐性+1",
      portTradeBonus: 0,
      fishingFoodBonus: 0,
      mountainAttackPenalty: 2,
      mountainResistBonus: 1,
      shrineCultureActionBonus: 0,
      shrineSpreadBonus: 0,
    };
  }
  return {
    id: "festival",
    name: "祭礼期",
    desc: "寺社の文化振興+2 / 寺社波及+1",
    portTradeBonus: 0,
    fishingFoodBonus: 0,
    mountainAttackPenalty: 0,
    mountainResistBonus: 0,
    shrineCultureActionBonus: 2,
    shrineSpreadBonus: 1,
  };
}

function hasMountainCastleCombo(playerId) {
  return countOwnedType(playerId, TYPE.YAMA) > 0 && countOwnedType(playerId, TYPE.JO) > 0;
}

// ------------------ イベント ------------------

function initEventDeck() {
  deck = [
    { id: "C01", name: "祝祭の日", desc: "文化が高まる。", type: "culture", apply: () => ({ culture: 5 }) },
    { id: "C02", name: "祭礼", desc: "地域の祭りで文化が広がる。", type: "culture", apply: () => ({ culture: 3, spread: true }) },
    { id: "C03", name: "工房活性", desc: "工房ネットワークが活性化する。", type: "culture", apply: () => ({ culture: 2, workshopPulse: 2 }) },
    { id: "C04", name: "噂の拡散", desc: "文化の噂が周辺へ伝播する。", type: "culture", apply: () => ({ spread: true, rumor: 2 }) },
    { id: "C05", name: "寺社参詣", desc: "寺社の力で文化が高まる。", type: "culture", apply: () => ({ culture: 2, shrinePulse: 1 }) },
    { id: "C06", name: "山越えの道", desc: "山地ペナルティを一時的に無視する。", type: "culture", apply: () => ({ mountainPass: 2 }) },
    { id: "C07", name: "文化展示", desc: "目玉展示で文化が上がる。", type: "culture", apply: () => ({ culture: 4 }) },
    { id: "C08", name: "寺の巡礼", desc: "寺から文化が広がる。", type: "culture", apply: () => ({ templePulse: 2 }) },
    { id: "E01", name: "港の大市", desc: "交易が活性化し収入が増える。", type: "economy", apply: () => ({ gold: 4, portBonus: true }) },
    { id: "E02", name: "豊作", desc: "食料が増え、文化も少し上がる。", type: "economy", apply: () => ({ food: 5, culture: 1 }) },
    {
      id: "W01",
      name: "試作機の完成",
      desc: "ファブラボで新しい機械が生まれる。",
      type: "workshop",
      requires: (p) => countOwnedWorkshopKind(p.id, WORKSHOP_KIND.FABLAB) > 0,
      apply: (p) => {
        const labs = countOwnedWorkshopKind(p.id, WORKSHOP_KIND.FABLAB);
        return {
          gold: 2 + labs,
          force: 1 + floor(labs / 2),
          innovation: 1 + labs,
          story: `ファブラボで新しい機械を発明した`,
        };
      },
    },
    {
      id: "W02",
      name: "朝廷への献上紙",
      desc: "和紙工房の品が献上される。",
      type: "workshop",
      requires: (p) => countOwnedWorkshopKind(p.id, WORKSHOP_KIND.WASHI) > 0,
      apply: (p) => {
        const mills = countOwnedWorkshopKind(p.id, WORKSHOP_KIND.WASHI);
        return {
          gold: 1 + mills * 2,
          culture: 1 + mills,
          washi: mills,
          story: `和紙工房が紙を献上した`,
        };
      },
    },
    {
      id: "W03",
      name: "海の向こうの評判",
      desc: "陶芸品が海外で評判を呼ぶ。",
      type: "workshop",
      requires: (p) => countOwnedWorkshopKind(p.id, WORKSHOP_KIND.POTTERY) > 0,
      apply: (p) => {
        const kilns = countOwnedWorkshopKind(p.id, WORKSHOP_KIND.POTTERY);
        return {
          gold: 2 + kilns * 2,
          culture: 1 + kilns,
          pottery: kilns,
          story: `陶器がヨーロッパで売れた`,
        };
      },
    },
    { id: "H01", name: "海賊", desc: "港の混乱で資金を失う。", type: "harass", apply: () => ({ goldLoss: 2 }) },
    { id: "H02", name: "内紛", desc: "相手の文化が低下する。", type: "harass", apply: () => ({ enemyCultureDown: 2 }) },
  ];
  shuffleDeck(deck);
  discard = [];
}

function shuffleDeck(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

function drawEventCard(player = null) {
  if (deck.length === 0) {
    deck = discard.slice();
    discard = [];
    shuffleDeck(deck);
  }
  if (!player) return deck.pop();

  for (let i = deck.length - 1; i >= 0; i--) {
    const card = deck[i];
    if (!card.requires || card.requires(player)) {
      deck.splice(i, 1);
      return card;
    }
  }

  return deck.pop();
}

function applyEvent(card, p, selectedTile, showMessage) {
  const result = card.apply(p, selectedTile) || {};
  const enemy = strongestEnemyByCulture(p.id);
  let logs = [];
  let storyText = result.story || "";

  if (result.culture) {
    p.culture += result.culture;
    logs.push(`文化 +${result.culture}`);
  }
  if (result.gold) {
    p.gold += result.gold;
    logs.push(`金 +${result.gold}`);
  }
  if (result.food) {
    p.food += result.food;
    logs.push(`食料 +${result.food}`);
  }
  if (result.force) {
    p.force += result.force;
    logs.push(`武力 +${result.force}`);
  }
  if (result.washi) {
    p.washi += result.washi;
    logs.push(`和紙 +${result.washi}`);
  }
  if (result.pottery) {
    p.pottery += result.pottery;
    logs.push(`陶器 +${result.pottery}`);
  }
  if (result.innovation) {
    p.innovation += result.innovation;
    logs.push(`機会 +${result.innovation}`);
  }
  if (result.goldLoss) {
    p.gold = max(0, p.gold - result.goldLoss);
    logs.push(`金 -${result.goldLoss}`);
  }
  if (result.enemyCultureDown && enemy) {
    enemy.culture = max(0, enemy.culture - result.enemyCultureDown);
    logs.push(`${enemy.name}文化 -${result.enemyCultureDown}`);
  }
  if (result.portBonus) {
    const portsOwned = countOwnedType(p.id, TYPE.MINATO);
    const bonus = portsOwned;
    p.gold += bonus;
    logs.push(`港ボーナス +${bonus}`);
  }
  if (result.spread) {
    spreadCulture(p.id);
    logs.push("文化が周辺へ伝播");
  }
  if (result.rumor) {
    rumorPulse(p.id, result.rumor);
    logs.push(`噂伝播 +${result.rumor}`);
  }
  if (result.workshopPulse) {
    pulseFromOwnedType(p.id, TYPE.KOBO, result.workshopPulse);
    logs.push(`工房波及 +${result.workshopPulse}`);
  }
  if (result.shrinePulse) {
    pulseFromOwnedTypes(p.id, [TYPE.JINJA, TYPE.TERA], result.shrinePulse);
    logs.push(`寺社波及 +${result.shrinePulse}`);
  }
  if (result.templePulse) {
    pulseFromOwnedType(p.id, TYPE.TERA, result.templePulse);
    logs.push(`寺波及 +${result.templePulse}`);
  }
  if (result.mountainPass) {
    mountainPassTurns[p.id] = max(mountainPassTurns[p.id], result.mountainPass);
    logs.push(`山越え有効 ${result.mountainPass}ターン`);
  }

  checkCultureFlipByPlayer(p.id);

  const effectText = `${storyText ? `${storyText} / ` : ""}${logs.length > 0 ? `効果: ${logs.join(" / ")}` : "効果なし"}`;
  if (showMessage) {
    message = `イベント発動: ${card.name} / ${effectText}`;
  }
  return effectText;
}

function rumorPulse(playerId, value) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.owner !== 0 && t.owner !== playerId) continue;
      for (const nt of neighbors6(c, r)) {
        if (nt.owner === 0) nt.inf[playerId] += value;
      }
    }
  }
}

function pulseFromOwnedType(playerId, targetType, value) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.owner !== playerId || t.type !== targetType) continue;
      for (const nt of neighbors6(c, r)) nt.inf[playerId] += value;
    }
  }
}

function pulseFromOwnedTypes(playerId, targetTypes, value) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.owner !== playerId || !targetTypes.includes(t.type)) continue;
      for (const nt of neighbors6(c, r)) nt.inf[playerId] += value;
    }
  }
}

function countOwnedType(playerId, type) {
  let n = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const t = grid[r][c];
    if (t.owner === playerId && t.type === type) n++;
  }
  return n;
}

function countOwnedWorkshopKind(playerId, kind) {
  let n = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const t = grid[r][c];
    if (t.owner === playerId && t.type === TYPE.KOBO && workshopKind(t) === kind) n++;
  }
  return n;
}

function hasPortWorkshopCombo(playerId) {
  return countOwnedType(playerId, TYPE.MINATO) > 0 && countOwnedType(playerId, TYPE.KOBO) > 0;
}

function hasShrineTempleCombo(playerId) {
  return countOwnedType(playerId, TYPE.JINJA) > 0 && countOwnedType(playerId, TYPE.TERA) > 0;
}

function tradeGain(playerId, tile) {
  const tileType = tile ? tile.type : TYPE.HEICHI;
  const fishing = isFishingPort(tile);
  const levelBonus = buildingLevelBonus(tile);
  const base = tileType === TYPE.MINATO ? (fishing ? 4 + levelBonus : 6 + levelBonus * 2) : 2;
  const combo = hasPortWorkshopCombo(playerId) ? 2 : 0;
  const workshopBonus = tradeWorkshopBonus(playerId);
  const seasonGold = tileType === TYPE.MINATO ? seasonState.portTradeBonus : 0;
  const seasonFood = tileType === TYPE.MINATO && fishing ? seasonState.fishingFoodBonus : 0;
  const officerTrade = officerBonuses(playerId).trade;
  return { gold: base + combo + workshopBonus + seasonGold + officerTrade, food: (tileType === TYPE.MINATO && fishing ? 2 + levelBonus : 0) + seasonFood };
}

function tradeWorkshopBonus(playerId) {
  const workshops = countOwnedType(playerId, TYPE.KOBO);
  return min(WORKSHOP_TRADE_BONUS_CAP, workshops * WORKSHOP_TRADE_BONUS);
}

// ------------------ ターン処理 ------------------

function endTurn() {
  passive(currentPlayer);
  spreadCulture(players[currentPlayer].id);
  if (checkWinConditions()) return;

  const aiLogs = [];
  while (true) {
    currentPlayer = (currentPlayer + 1) % players.length;
    const p = players[currentPlayer];
    const pid = p.id;

    actionsLeft[pid] = ACTIONS_PER_TURN;
    eventReadyThisTurn[pid] = rollEventReady();
    flipCapturesThisTurn[pid] = 0;
    eventUsedByPlayer[pid] = false;

    if (pid === HUMAN_PLAYER_ID) {
      turn += 1;
      const prevSeasonId = seasonState.id;
      seasonState = seasonForTurn(turn);
      eventUsedThisTurn = false;
      tradeUsedThisTurn = false;
      applyInfluenceDecay();
      tickBuffTurns();
      tickMissionTurns(pid);
      const missionOffered = maybeOfferMission(pid);
      checkWinConditions();
      const seasonMsg = prevSeasonId !== seasonState.id ? ` / 季節変化: ${seasonState.name}(${seasonState.desc})` : "";
      message = aiLogs.length > 0
        ? `敵ターン: ${aiLogs.join(" / ")} / あなたのターンです。`
        : "敵ターン終了。あなたのターンです。";
      message += seasonMsg;
      if (missionOffered) openMissionPopup(HUMAN_PLAYER_ID);
      break;
    }

    tickMissionTurns(pid);
    maybeOfferMission(pid);
    const aiSummary = aiTurn(currentPlayer);
    passive(currentPlayer);
    spreadCulture(pid);
    if (checkWinConditions()) return;
    aiLogs.push(`${p.name}:${aiSummary || "行動なし"}`);
  }
}

function passive(playerIndex) {
  const p = players[playerIndex];
  const officerBoost = officerBonuses(p.id);
  let foodGain = 0, goldGain = 0, cultureGain = 0;
  let forceGain = 0, washiGain = 0, potteryGain = 0, innovationGain = 0;
  let popFoodGain = 0, popGoldGain = 0, popCultureGain = 0, popForceGain = 0;
  let portGoldIncome = 0, fishingFoodIncome = 0;
  let fablabGoldIncome = 0, fablabForceIncome = 0, fablabCultureIncome = 0, fablabInnovationIncome = 0;
  let washiGoldIncome = 0, washiCultureIncome = 0, washiIncome = 0;
  let potteryGoldIncome = 0, potteryCultureIncome = 0, potteryIncome = 0;
  let genericWorkshopCultureIncome = 0;
  let shrineTempleCultureIncome = 0;
  let plainCount = 0, portCount = 0, fishingPortCount = 0;
  let fablabCount = 0, washiWorkshopCount = 0, potteryWorkshopCount = 0, genericWorkshopCount = 0;
  let shrineCount = 0, templeCount = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.owner !== p.id) continue;
      clampTilePopulation(t);
      const popYield = populationYield(t);
      popFoodGain += popYield.food;
      popGoldGain += popYield.gold;
      popCultureGain += popYield.culture;
      popForceGain += popYield.force;

      if (t.type === TYPE.HEICHI) {
        foodGain += 1;
        plainCount += 1;
      }
      if (t.type === TYPE.MINATO) {
        const bonus = buildingLevelBonus(t);
        if (isFishingPort(t)) {
          foodGain += 1 + bonus;
          fishingFoodIncome += 1 + bonus;
          fishingPortCount += 1;
        } else {
          goldGain += 2 + bonus;
          portGoldIncome += 2 + bonus;
          portCount += 1;
        }
      }
      if (t.type === TYPE.KOBO) {
        const kind = workshopKind(t);
        const bonus = buildingLevelBonus(t);
        if (kind === WORKSHOP_KIND.FABLAB) {
          goldGain += 1 + bonus;
          forceGain += 1 + bonus;
          cultureGain += SOFT_CULTURE + bonus;
          innovationGain += 1 + bonus;
          fablabGoldIncome += 1 + bonus;
          fablabForceIncome += 1 + bonus;
          fablabCultureIncome += SOFT_CULTURE + bonus;
          fablabInnovationIncome += 1 + bonus;
          fablabCount += 1;
        } else if (kind === WORKSHOP_KIND.WASHI) {
          goldGain += 1 + bonus;
          cultureGain += SOFT_CULTURE + 1 + bonus;
          washiGain += 1 + bonus;
          washiGoldIncome += 1 + bonus;
          washiCultureIncome += SOFT_CULTURE + 1 + bonus;
          washiIncome += 1 + bonus;
          washiWorkshopCount += 1;
        } else if (kind === WORKSHOP_KIND.POTTERY) {
          goldGain += 2 + bonus;
          cultureGain += SOFT_CULTURE + 1 + bonus;
          potteryGain += 1 + bonus;
          potteryGoldIncome += 2 + bonus;
          potteryCultureIncome += SOFT_CULTURE + 1 + bonus;
          potteryIncome += 1 + bonus;
          potteryWorkshopCount += 1;
        } else {
          cultureGain += SOFT_CULTURE + bonus;
          genericWorkshopCultureIncome += SOFT_CULTURE + bonus;
          genericWorkshopCount += 1;
        }
      }
      if (t.type === TYPE.JINJA || t.type === TYPE.TERA) {
        const bonus = buildingLevelBonus(t);
        cultureGain += SOFT_CULTURE + bonus;
        shrineTempleCultureIncome += SOFT_CULTURE + bonus;
        if (t.type === TYPE.JINJA) shrineCount += 1;
        if (t.type === TYPE.TERA) templeCount += 1;
      }
    }
  }

  foodGain += popFoodGain;
  goldGain += popGoldGain;
  cultureGain += popCultureGain;
  forceGain += popForceGain;
  goldGain += officerBoost.trade > 0 ? 1 : 0;
  cultureGain += officerBoost.culture > 0 ? 1 : 0;
  p.food += foodGain;
  p.gold += goldGain;
  p.culture += cultureGain;
  p.force += forceGain;
  p.washi += washiGain;
  p.pottery += potteryGain;
  p.innovation += innovationGain;

  const popPhase = applyPopulationPhase(p.id);

  const upkeep = floor(p.force / 5) * FORCE_UPKEEP;
  p.gold -= upkeep;
  if (p.gold < 0) {
    p.gold = 0;
    p.force = max(0, p.force - 2);
  }

  const details = [];
  if (plainCount > 0) details.push(`平地x${plainCount}(食料+${plainCount})`);
  if (portCount > 0) details.push(`港x${portCount}(金+${portGoldIncome})`);
  if (fishingPortCount > 0) details.push(`漁港x${fishingPortCount}(食料+${fishingFoodIncome})`);
  if (fablabCount > 0) details.push(`ファブラボx${fablabCount}(金+${fablabGoldIncome} 武力+${fablabForceIncome} 文化+${fablabCultureIncome} 機会+${fablabInnovationIncome})`);
  if (washiWorkshopCount > 0) details.push(`和紙工房x${washiWorkshopCount}(和紙+${washiIncome} / 和紙献上で金+${washiGoldIncome} / 文化+${washiCultureIncome})`);
  if (potteryWorkshopCount > 0) details.push(`陶芸工房x${potteryWorkshopCount}(陶器+${potteryIncome} / 陶器献上で金+${potteryGoldIncome} / 文化+${potteryCultureIncome})`);
  if (genericWorkshopCount > 0) details.push(`工房x${genericWorkshopCount}(文化+${genericWorkshopCultureIncome})`);
  if (shrineCount + templeCount > 0) details.push(`寺社x${shrineCount + templeCount}(文化+${shrineTempleCultureIncome})`);
  if (officerCount(p) > 0) details.push(`家臣団x${officerCount(p)}(金+${officerBoost.trade > 0 ? 1 : 0} 文化+${officerBoost.culture > 0 ? 1 : 0})`);
  if (popFoodGain + popGoldGain + popCultureGain + popForceGain > 0) details.push(`人口収益(食料+${popFoodGain} 金+${popGoldGain} 文化+${popCultureGain} 武力+${popForceGain})`);
  if (popPhase.demand > 0) details.push(`人口扶養(食料-${popPhase.demand})`);
  if (popPhase.growth > 0) details.push(`人口成長+${popPhase.growth}`);
  if (popPhase.starvationLoss > 0) details.push(`飢餓で人口-${popPhase.starvationLoss}`);
  if (upkeep > 0) details.push(`維持費(金-${upkeep})`);

  const netGold = goldGain - upkeep;
  const goldText = netGold >= 0 ? `金+${netGold}` : `金${netGold}`;
  const totals = `収入: 食料+${foodGain - popPhase.demand} ${goldText} 文化+${cultureGain} 武力+${forceGain} 和紙+${washiGain} 陶器+${potteryGain} 機会+${innovationGain} 人口${totalPopulation(p.id)}`;
  incomeReport[p.id] = details.length > 0 ? `${totals} / ${details.join(" / ")}` : totals;
}

function spreadCulture(playerId) {
  const harmonyBonus = hasShrineTempleCombo(playerId) ? 1 : 0;
  const officerSpreadBonus = officerBonuses(playerId).spread;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.owner !== playerId) continue;

      const power = t.type === TYPE.KOBO ? workshopCulturePower(t) :
                    (t.type === TYPE.JINJA || t.type === TYPE.TERA) ? 4 + buildingLevelBonus(t) :
                    t.type === TYPE.JO ? 2 + buildingLevelBonus(t) :
                    t.type === TYPE.YAMA ? 2 : 1;
      const shrineSeason = (t.type === TYPE.JINJA || t.type === TYPE.TERA) ? seasonState.shrineSpreadBonus : 0;
      const finalPower = max(1, power - 1 + harmonyBonus + shrineSeason + officerSpreadBonus);

      for (const nt of neighbors6(c, r)) {
        const ignoreMountain = mountainPassTurns[playerId] > 0;
        const resist = nt.type === TYPE.YAMA && !ignoreMountain ? 2 + seasonState.mountainResistBonus : 0;
        nt.inf[playerId] += max(0, finalPower - resist);
      }
    }
  }
  checkCultureFlipByPlayer(playerId);
}

function checkCultureFlipByPlayer(playerId) {
  let blockedByCap = false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.type === TYPE.UMI) continue;
      const a = t.inf[playerId] || 0;
      const b = maxOpponentInfluence(t, playerId);
      const resist = t.type === TYPE.JO ? CASTLE_FLIP_RESIST + buildingLevelBonus(t) + castleFlipBonus(t) : 0;
      const flipNeed = CULTURE_FLIP + resist;
      const dominateNeed = CULTURE_DOMINATE + resist;
      if (a >= flipNeed && a >= b + dominateNeed) {
        const changed = t.owner !== playerId;
        if (!changed) continue;
        if (flipCapturesThisTurn[playerId] >= MAX_FLIPS_PER_PLAYER_TURN) {
          blockedByCap = true;
          continue;
        }
        if (t.type === TYPE.JO) {
          const prevOfficer = garrisonOfficer(t);
          if (prevOfficer) prevOfficer.assignedCastleKey = null;
          t.garrisonOfficerId = null;
        }
        t.owner = playerId;
        resetTileInfluence(t);
        capturePopulationLoss(t);
        if (t.type === TYPE.JO) t.castleHp = castleMaxHp(t);
        flipCapturesThisTurn[playerId] += 1;
        latestComment = gainComment(playerId, t, "文化転向");
        const fxText = playerId === HUMAN_PLAYER_ID ? "文化獲得" : "敵が獲得";
        const fxCol = playerId === HUMAN_PLAYER_ID ? color(70, 140, 255) : color(240, 90, 90);
        pushTileFx(t.c, t.r, fxText, fxCol);
        const missionText = advanceMission(playerId, "capture", t);
        if (missionText && playerId === HUMAN_PLAYER_ID) message += ` / ${missionText}`;
      }
    }
  }
  if (blockedByCap && playerId === HUMAN_PLAYER_ID) {
    message = `文化転向はこのターン上限 (${MAX_FLIPS_PER_PLAYER_TURN}) に到達`;
  }
}

function applyInfluenceDecay() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      for (const pid of playerIds()) t.inf[pid] = floor((t.inf[pid] || 0) * INF_DECAY_RATE);
    }
  }
}

function tickBuffTurns() {
  for (const pid of playerIds()) mountainPassTurns[pid] = max(0, (mountainPassTurns[pid] || 0) - 1);
}

function controlRate(playerId) {
  let owned = 0;
  let total = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (grid[r][c].type === TYPE.UMI) continue;
    total++;
    if (grid[r][c].owner === playerId) owned++;
  }
  if (total <= 0) return 0;
  return owned / total;
}

function maxEnemyCulture(playerId) {
  let maxCulture = 0;
  for (const p of players) {
    if (p.id === playerId) continue;
    maxCulture = max(maxCulture, p.culture);
  }
  return maxCulture;
}

function maxEnemyControlRate(playerId) {
  let maxRate = 0;
  for (const p of players) {
    if (p.id === playerId) continue;
    maxRate = max(maxRate, controlRate(p.id));
  }
  return maxRate;
}

function checkWinConditions() {
  const me = playerById(HUMAN_PLAYER_ID);
  const myRate = controlRate(HUMAN_PLAYER_ID);
  const myRatePct = round(myRate * 100);
  const lines = [];
  for (const p of players) {
    lines.push(`${p.name} 文化:${p.culture}/${CULTURE_WIN} 支配:${round(controlRate(p.id) * 100)}%`);
  }
  const detail = lines.join("\n");

  if (myRate >= CONTROL_WIN_RATE) {
    gameState = "win";
    winText = `領土勝利（${myRatePct}% >= ${round(CONTROL_WIN_RATE * 100)}%）\n${detail}`;
    return true;
  }
  for (const p of players) {
    if (p.id === HUMAN_PLAYER_ID) continue;
    const rate = controlRate(p.id);
    const ratePct = round(rate * 100);
    if (rate >= CONTROL_WIN_RATE) {
      gameState = "lose";
      winText = `${p.name}が領土勝利（${ratePct}% >= ${round(CONTROL_WIN_RATE * 100)}%）\n${detail}`;
      return true;
    }
  }
  return false;
}

function aiTurn(aiIndex) {
  const ai = players[aiIndex];
  const aiId = ai.id;
  const logs = [];
  while (actionsLeft[aiId] > 0) {
    let owned = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = grid[r][c];
        if (t.owner === ai.id) owned.push(t);
      }
    }
    if (owned.length === 0) break;

    if (eventReadyThisTurn[aiId] && !eventUsedByPlayer[aiId] && random() < 0.45) {
      const card = drawEventCard(ai);
      applyEvent(card, ai, owned[0], false);
      discard.push(card);
      eventUsedByPlayer[aiId] = true;
      pushTileFx(owned[0].c, owned[0].r, "敵イベント", color(210, 110, 230));
      logs.push(`イベント:${card.name}`);
      spendAction(aiId);
      continue;
    }

    const protectBase = owned
      .filter((t) => t.type === TYPE.KOBO || t.type === TYPE.JINJA || t.type === TYPE.TERA)
      .sort((a, b) => neutralNeighborCount(b) - neutralNeighborCount(a))[0];
    const base = protectBase || owned.sort((a, b) => aiTileScore(b) - aiTileScore(a))[0];
    const unguardedCastle = owned.find((t) => t.type === TYPE.JO && !t.garrisonOfficerId);

    if (unguardedCastle && freeOfficerCount(aiId) > 0 && random() < 0.4) {
      const freeOfficer = [...ai.officers]
        .filter((o) => !o.assignedCastleKey)
        .sort((a, b) => (b.valor + b.wit + b.admin) - (a.valor + a.wit + a.admin))[0];
      if (freeOfficer) {
        assignOfficerToCastle(aiId, freeOfficer, unguardedCastle);
        logs.push(`守将配置:${freeOfficer.name}`);
        spendAction(aiId);
        continue;
      }
    }

    if (ai.gold >= 3 && protectBase && neutralNeighborCount(protectBase) > 0) {
      ai.gold -= 3;
      const gain = cultureActionGain(protectBase);
      ai.culture += gain;
      spreadCulture(ai.id);
      pushTileFx(protectBase.c, protectBase.r, `敵文化+${gain}`, color(246, 166, 80));
      logs.push(`文化振興:+${gain}`);
      spendAction(aiId);
      continue;
    }

    if (ai.gold >= RECRUIT_COST && officerCount(ai) < officerLimit(aiId) && random() < 0.28) {
      const officer = createOfficerFromTile(aiId, base);
      if (officer) {
        ai.gold -= RECRUIT_COST;
        ai.officers.push(officer);
        pushTileFx(base.c, base.r, "敵登用", color(142, 126, 214));
        logs.push(`登用:${officer.name}`);
        spendAction(aiId);
        continue;
      }
    }

    if (base.type === TYPE.MINATO) {
      const gain = tradeGain(ai.id, base);
      ai.gold += gain.gold;
      if (gain.food > 0) ai.food += gain.food;
      pushTileFx(base.c, base.r, `敵金+${gain.gold}`, color(100, 180, 255));
      logs.push(`交易:+${gain.gold}${gain.food > 0 ? ` 食料+${gain.food}` : ""}`);
      spendAction(aiId);
      continue;
    }

    if (canUpgradeBuilding(base, aiId) && ai.gold >= upgradeCost(base) && random() < 0.35) {
      const cost = upgradeCost(base);
      ai.gold -= cost;
      base.level = buildingLevel(base) + 1;
      if (base.type === TYPE.JO) base.castleHp = castleMaxHp(base);
      base.population = min(populationCap(base), max(base.population || 0, initialPopulationForType(base.type) + buildingLevelBonus(base)));
      pushTileFx(base.c, base.r, `敵Lv${buildingLevel(base)}`, color(78, 176, 126));
      logs.push(`改修:${tileLabel(base)} Lv${buildingLevel(base)}`);
      spendAction(aiId);
      continue;
    }

    const strongestEnemyForce = max(...players.filter((p) => p.id !== aiId).map((p) => p.force));
    if (ai.gold >= 3 && strongestEnemyForce > ai.force + 4) {
      ai.gold -= 3;
      ai.force += 3;
      pushTileFx(base.c, base.r, "敵武力+3", color(236, 92, 92));
      logs.push("軍備増強:+3");
      spendAction(aiId);
      continue;
    }

    ai.gold += 2;
    pushTileFx(base.c, base.r, "敵金+2", color(100, 180, 255));
    logs.push("交易:+2");
    spendAction(aiId);
  }
  return logs.join(" / ");
}

function rollEventReady() {
  return random() < EVENT_SPAWN_RATE;
}

function neutralNeighborCount(tile) {
  let n = 0;
  for (const nt of neighbors6(tile.c, tile.r)) if (nt.type !== TYPE.UMI && nt.owner === 0) n++;
  return n;
}

function aiTileScore(t) {
  if (t.type === TYPE.KOBO) {
    const kind = workshopKind(t);
    if (kind === WORKSHOP_KIND.FABLAB) return 102;
    if (kind === WORKSHOP_KIND.WASHI) return 100;
    if (kind === WORKSHOP_KIND.POTTERY) return 98;
    return 96;
  }
  if (t.type === TYPE.JINJA || t.type === TYPE.TERA) return 90;
  if (t.type === TYPE.MINATO) return 70;
  if (t.type === TYPE.JO) return 60;
  if (t.type === TYPE.HEICHI) return 40;
  if (t.type === TYPE.YAMA) return 10;
  return 0;
}

// ------------------ ヘックス描画・クリック判定 ------------------

function drawHex(cx, cy, size) {
  const ctr = projectPoint(cx, cy);
  drawIsoTileOutlineScreen(ctr.x, ctr.y, size / HEX_SIZE);
}

function pickHex(mx, my) {
  let hit = null;
  let hitDist = 1e9;
  let nearHit = null;
  let nearDist = 1e9;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ctr = centers[r][c];
      const p = projectPoint(ctr.x, ctr.y);
      if (pointInHex(mx, my, ctr.x, ctr.y, HEX_SIZE)) {
        const d = dist(mx, my, p.x, p.y);
        if (d < hitDist) {
          hitDist = d;
          hit = { c, r };
        }
      } else if (pointNearTileVisual(mx, my, ctr.x, ctr.y, HEX_SIZE)) {
        const d = dist(mx, my, p.x, p.y);
        if (d < nearDist) {
          nearDist = d;
          nearHit = { c, r };
        }
      }
    }
  }
  return hit || nearHit;
}

function pointInHex(px, py, cx, cy, size) {
  const ctr = projectPoint(cx, cy);
  const pts = isoTileTopPointsScreen(ctr.x, ctr.y, size / HEX_SIZE);
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    const cross = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-9) + xi);
    if (cross) inside = !inside;
  }
  return inside;
}

function pointNearTileVisual(px, py, cx, cy, size) {
  const ctr = projectPoint(cx, cy);
  const m = isoTileMetrics(size / HEX_SIZE);
  const dx = abs(px - ctr.x);
  const dy = py - ctr.y;
  const topArea = (dx / (m.w * 0.68)) + (abs(dy) / (m.h * 0.95)) <= 1.2;
  if (topArea) return true;
  const structureArea = dy < 0 && dx <= m.w * 0.62 && abs(dy) <= m.h * 1.75;
  return structureArea;
}

function worldToScreen(wx, wy) {
  return { x: wx * camera.zoom + camera.x, y: wy * camera.zoom + camera.y };
}

function screenToWorld(sx, sy) {
  return { x: (sx - camera.x) / camera.zoom, y: (sy - camera.y) / camera.zoom };
}

function hexVertices(cx, cy, size) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const ang = radians(60 * i - 30);
    pts.push({ x: cx + cos(ang) * size, y: cy + sin(ang) * size });
  }
  return pts;
}

function projectedHexPoints(cx, cy, size) {
  return hexVertices(cx, cy, size).map((p) => projectPoint(p.x, p.y));
}

function tileCoordFromWorldCenter(wx, wy) {
  const r = round((wy - boardY - HEX_H / 2) / HEX_VSTEP);
  const c = round((wx - boardX - HEX_W / 2 - (r % 2) * (HEX_W / 2)) / HEX_W);
  return {
    c: constrain(c, 0, COLS - 1),
    r: constrain(r, 0, ROWS - 1),
  };
}

function tileScreenCenter(c, r) {
  const m = isoTileMetrics(1);
  const originX = boardX + ISO_OFFSET_X + ROWS * (m.w / 2) + 18;
  const originY = boardY + ISO_OFFSET_Y + 26;
  return {
    x: originX + (c - r) * (m.w / 2),
    y: originY + (c + r) * (m.h / 2),
  };
}

function projectPoint(wx, wy) {
  const tile = tileCoordFromWorldCenter(wx, wy);
  return tileScreenCenter(tile.c, tile.r);
}

function drawPolygon(pts) {
  beginShape();
  for (const p of pts) vertex(p.x, p.y);
  endShape(CLOSE);
}

function drawMountainShadow(cx, cy, size) {
  const ctr = projectPoint(cx, cy);
  const pts = isoTileTopPointsScreen(ctr.x, ctr.y, size / HEX_SIZE);
  const shadowPts = pts.map((p) => ({ x: p.x + 10, y: p.y + 9 }));
  noStroke();
  fill(12, 26, 40, 52);
  drawPolygon(shadowPts);
}

function boardScreenBounds() {
  let minX = 1e9;
  let minY = 1e9;
  let maxX = -1e9;
  let maxY = -1e9;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ctr = tileScreenCenter(c, r);
      const top = isoTileTopPointsScreen(ctr.x, ctr.y, 1);
      const depth = isoTileMetrics(1).depth;
      for (const p of top) {
        minX = min(minX, p.x - 24);
        minY = min(minY, p.y - 26);
        maxX = max(maxX, p.x + 24);
        maxY = max(maxY, p.y + depth + 28);
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

// ------------------ 隣接取得（odd-r） ------------------

function neighbors6(c, r) {
  const odd = r % 2 === 1;
  const dirsEven = [
    { dc: 0, dr: -1 }, { dc: +1, dr: -1 },
    { dc: -1, dr: 0 }, { dc: +1, dr: 0 },
    { dc: 0, dr: +1 }, { dc: +1, dr: +1 },
  ];
  const dirsOdd = [
    { dc: -1, dr: -1 }, { dc: 0, dr: -1 },
    { dc: -1, dr: 0 }, { dc: +1, dr: 0 },
    { dc: -1, dr: +1 }, { dc: 0, dr: +1 },
  ];

  const dirs = odd ? dirsOdd : dirsEven;
  const res = [];
  for (const d of dirs) {
    const nc = c + d.dc;
    const nr = r + d.dr;
    if (inBounds(nc, nr)) res.push(grid[nr][nc]);
  }
  return res;
}

// ------------------ ユーティリティ ------------------

function inBounds(c, r) {
  return c >= 0 && c < COLS && r >= 0 && r < ROWS;
}

function canBuildCastleOnTile(tile) {
  if (!tile) return false;
  return tile.type === TYPE.HEICHI || tile.type === TYPE.YAMA || tile.type === TYPE.KOBO || tile.type === TYPE.JO;
}

function canBuildWorkshopOnTile(tile) {
  if (!tile) return false;
  return tile.type === TYPE.HEICHI || tile.type === TYPE.YAMA || tile.type === TYPE.JO || tile.type === TYPE.KOBO;
}

function getTile(c, r) {
  if (!inBounds(c, r)) return null;
  return grid[r][c];
}

function setOwner(playerId, c, r) {
  const t = getTile(c, r);
  if (!t) return;
  if (t.type === TYPE.UMI) return;
  const prevOwner = t.owner;
  if (t.type === TYPE.JO && prevOwner !== playerId) {
    const prevOfficer = garrisonOfficer(t);
    if (prevOfficer) prevOfficer.assignedCastleKey = null;
    t.garrisonOfficerId = null;
  }
  t.owner = playerId;
  resetTileInfluence(t);
  normalizeTileBuildingState(t);
}

function ownerName(ownerId) {
  if (ownerId === 0) return "中立";
  return players[ownerId - 1].name;
}

function tileLabel(t) {
  if (!t) return "";
  return t.name ? t.name : t.type;
}

function isFishingPort(tile) {
  return !!tile && tile.type === TYPE.MINATO && (tile.name || "").includes("漁港");
}

function tileRoleTitle(tileOrType) {
  const tile = typeof tileOrType === "string" ? null : tileOrType;
  const type = typeof tileOrType === "string" ? tileOrType : tileOrType.type;
  if (type === TYPE.UMI) return "海域";
  if (type === TYPE.JINJA) return "文化加速";
  if (type === TYPE.KOBO) {
    const kind = workshopKind(tile);
    if (kind === WORKSHOP_KIND.FABLAB) return "技術開発拠点";
    if (kind === WORKSHOP_KIND.WASHI) return "和紙生産拠点";
    if (kind === WORKSHOP_KIND.POTTERY) return "献上工芸拠点";
    return "交易・文化拠点";
  }
  if (type === TYPE.JO) return "軍事・防衛拠点";
  if (type === TYPE.YAMA) return "地形支配";
  if (type === TYPE.MINATO) return "交易拠点";
  if (type === TYPE.TERA) return "文化拠点";
  return "基礎地形";
}

function tileRoleDetail(tile, playerId) {
  if (!tile) return "";
  const levelText = supportsBuildingLevel(tile) ? `Lv${buildingLevel(tile)}。` : "";
  const popText = `${levelText}人口${tile.population || 0}/${populationCap(tile)}。`;
  if (tile.type === TYPE.UMI) {
    return "海域: 占領・建設不可。港を押さえると海上交易の利益を得られる。";
  }
  if (tile.type === TYPE.JINJA) {
    return `${popText} 文化振興: 文化+${cultureActionGain(tile)}。実行時に隣接へ影響力+${SHRINE_CULTURE_PULSE}。Lvごとに常時文化伝播も強くなる。`;
  }
  if (tile.type === TYPE.KOBO) {
    const bonus = tradeWorkshopBonus(playerId);
    const kind = workshopKind(tile);
    if (kind === WORKSHOP_KIND.FABLAB) {
      return `${popText} 文化振興: 文化+${cultureActionGain(tile)}。新機会の開発で金・武力・機会が伸びる。交易時も追加で武力+1。`;
    }
    if (kind === WORKSHOP_KIND.WASHI) {
      return `${popText} 文化振興: 文化+${cultureActionGain(tile)}。和紙を生産し、金も増える。交易時にも和紙獲得。`;
    }
    if (kind === WORKSHOP_KIND.POTTERY) {
      return `${popText} 文化振興: 文化+${cultureActionGain(tile)}。陶器献上で金が増える。交易時にも陶器獲得。`;
    }
    return `${popText} 文化振興: 文化+${cultureActionGain(tile)}。交易に工房ボーナス+${bonus}（最大+${WORKSHOP_TRADE_BONUS_CAP}）。`;
  }
  if (tile.type === TYPE.JO) {
    const hpMax = castleMaxHp(tile);
    const hp = tile.castleHp > 0 ? tile.castleHp : hpMax;
    const guard = garrisonOfficer(tile);
    const guardText = guard ? ` 守将:${guard.name}で防衛+${castleDefenseBonus(tile)} / 文化耐性+${castleFlipBonus(tile)}。` : " 守将未配置。";
    return `${popText} 攻撃時の武力コスト-${CASTLE_ATTACK_DISCOUNT}。被攻撃時は相手武力+${CASTLE_DEFENSE_PENALTY + buildingLevelBonus(tile) + castleDefenseBonus(tile)}必要。攻城${hpMax}回で陥落（耐久${hp}/${hpMax}）。文化転向に耐性+${CASTLE_FLIP_RESIST + buildingLevelBonus(tile) + castleFlipBonus(tile)}。${guardText}`;
  }
  if (tile.type === TYPE.YAMA) {
    const landmark = mountainLandmarkText(tile);
    return `${popText} ${landmark}攻撃元なら武力コスト-${MOUNTAIN_ATTACK_DISCOUNT}。山地への攻撃には追加コスト。`;
  }
  if (tile.type === TYPE.MINATO) {
    if (isFishingPort(tile)) {
      return `${popText} 漁港: 毎ターン食料+${1 + buildingLevelBonus(tile)}。交易で金+${4 + buildingLevelBonus(tile)}・食料+${2 + buildingLevelBonus(tile)}。工房を持つと交易金がさらに伸びる。`;
    }
    return `${popText} 港: 毎ターン金+${2 + buildingLevelBonus(tile)}。交易で金+${6 + buildingLevelBonus(tile) * 2}。工房を持つとさらに伸びる。`;
  }
  if (tile.type === TYPE.TERA) {
    return `${popText} 文化振興: 文化+${cultureActionGain(tile)}。神社と合わせると文化伝播が強化。`;
  }
  return `${popText} 平地: 特殊効果なし。食料収入の基盤。金${BUILD_CASTLE_COST}で築城、金${BUILD_WORKSHOP_COST}で工房建設が可能（山でも可）。`;
}

function gainComment(playerId, tile, reason) {
  const actor = ownerName(playerId);
  const target = tileLabel(tile);
  if (tile.type === TYPE.MINATO) return `${actor}が港「${target}」を${reason}で獲得`;
  if (tile.type === TYPE.JO) return `${actor}が城「${target}」を${reason}で獲得`;
  if (tile.type === TYPE.JINJA) return `${actor}が神社「${target}」を${reason}で獲得`;
  if (tile.type === TYPE.TERA) return `${actor}が寺「${target}」を${reason}で獲得`;
  return `${actor}が「${target}」を${reason}で獲得`;
}

function terrainColor(type) {
  if (type === TYPE.UMI) return color(94, 130, 166);
  if (type === TYPE.HEICHI) return color(154, 174, 112);
  if (type === TYPE.YAMA) return color(118, 128, 122);
  if (type === TYPE.MINATO) return color(112, 150, 164);
  if (type === TYPE.JINJA) return color(198, 150, 92);
  if (type === TYPE.KOBO) return color(168, 122, 92);
  if (type === TYPE.JO) return color(146, 122, 108);
  if (type === TYPE.TERA) return color(146, 122, 138);
  return color(200, 208, 214);
}

function tileIcon(tileOrType) {
  const tile = typeof tileOrType === "string" ? null : tileOrType;
  const type = typeof tileOrType === "string" ? tileOrType : tileOrType.type;
  if (type === TYPE.UMI) return "波";
  if (type === TYPE.HEICHI) return "平";
  if (type === TYPE.YAMA) return "山";
  if (type === TYPE.MINATO) return isFishingPort(tile) ? "漁" : "港";
  if (type === TYPE.JINJA) return "社";
  if (type === TYPE.KOBO) return "工";
  if (type === TYPE.JO) return "城";
  if (type === TYPE.TERA) return "寺";
  return "地";
}

function eventPopupRect() {
  const w = min(700, width - 80);
  const h = min(560, height - 70);
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

function mountainLandmarkText(tile) {
  const name = tile?.name || "";
  if (name.includes("雷山")) return "霊峰としてひときわ高く、山岳景観が強調される。";
  if (name.includes("立石山")) return "芥屋の大戸を望む海沿いの山。海蝕洞と断崖が見える。";
  if (name.includes("可也山")) return "糸島富士とも呼ばれる双峰の山容が目印。";
  return "";
}

function workshopBuildPopupRect() {
  const w = min(540, width - 120);
  const h = 320;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

function workshopBuildOptionRects() {
  const r = workshopBuildPopupRect();
  const left = r.x + 24;
  const top = r.y + 112;
  const gap = 10;
  const w = r.w - 48;
  const h = 44;
  return WORKSHOP_BUILD_OPTIONS.map((opt, i) => ({
    ...opt,
    x: left,
    y: top + i * (h + gap),
    w,
    h,
  }));
}

function workshopBuildCancelRect() {
  const r = workshopBuildPopupRect();
  return { x: r.x + r.w - 150, y: r.y + r.h - 58, w: 126, h: 34 };
}

function workshopBuildCancelContains(mx, my) {
  const r = workshopBuildCancelRect();
  return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
}

function pickWorkshopBuildOption(mx, my) {
  for (const op of workshopBuildOptionRects()) {
    if (mx >= op.x && mx <= op.x + op.w && my >= op.y && my <= op.y + op.h) return op;
  }
  return null;
}

function eventPopupOkRect() {
  const rect = eventPopupRect();
  return { x: rect.x + rect.w - 140, y: rect.y + rect.h - 64, w: 110, h: 40 };
}

function eventPopupOkContains(mx, my) {
  const r = eventPopupOkRect();
  return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
}

function winPopupRect() {
  const w = min(520, width - 100);
  const h = 240;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

function winPopupRestartRect() {
  const r = winPopupRect();
  return { x: r.x + r.w / 2 - 90, y: r.y + 150, w: 180, h: 44 };
}

function winPopupRestartContains(mx, my) {
  const r = winPopupRestartRect();
  return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
}
