//////////////////////////////////////////////////
// 糸島エリアの六角グリッド戦略ゲーム
//////////////////////////////////////////////////

// ---------- 盤面サイズ ----------
const COLS = 14;
const ROWS = 9;

// ---------- ヘックス設定 (pointy-top) ----------
const HEX_SIZE = 30;
const HEX_W = Math.sqrt(3) * HEX_SIZE;
const HEX_H = 2 * HEX_SIZE;
const HEX_VSTEP = 1.5 * HEX_SIZE;
const ISO_SHEAR_X = 0.48;
const ISO_SCALE_Y = 0.75;
const ISO_OFFSET_X = 54;
const ISO_OFFSET_Y = 10;

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
const SHRINE_CULTURE_PULSE = 1;
const WORKSHOP_TRADE_BONUS = 1;
const WORKSHOP_TRADE_BONUS_CAP = 3;
const ACTIONS_PER_TURN = 2;
const SEASON_SPAN_TURNS = 3;
let HUMAN_PLAYER_ID = 1;

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
};
let workshopBuildPopup = { open: false, c: -1, r: -1 };
let tileFx = [];

let buttons = [];

let mountainPassTurns = {};
let soundtrack = {
  enabled: true,
  ready: false,
  step: 0,
  nextAt: 0,
  tempo: 94,
  phrase: [0, 2, 4, 7, 9, 7, 4, 2, 0, -3, 0, 2, 4, 2, 0, -3],
  button: { x: 0, y: 0, w: 124, h: 28 },
};
let startPickPopup = { open: true };

// 盤面のズーム/パン（将来拡張）
let boardX = 18;
let boardY = TOP_H + 12;
let camera = { x: 0, y: 0, zoom: 1 };

// 山越え効果ターン

function setup() {
  const bounds = boardScreenBounds();
  const boardPixelW = ceil(bounds.maxX + 30);
  const boardPixelH = ceil(bounds.maxY + 36);
  const contentH = max(boardPixelH, TOP_H + PANEL_MIN_H);
  const canvas = createCanvas(boardPixelW + UI_W, contentH + BOTTOM_H);
  canvas.parent("app");

  textFont("sans-serif");
  initializeGame();
  openStartPickPopup();
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

function openStartPickPopup() {
  startPickPopup.open = true;
  message = "開始勢力を選んでください。";
}

function beginGameAs(playerId) {
  HUMAN_PLAYER_ID = playerId;
  initializeGame();
  startPickPopup.open = false;
  currentPlayer = max(0, players.findIndex((p) => p.id === HUMAN_PLAYER_ID));
  selected = startBaseTile(HUMAN_PLAYER_ID);
  const me = playerById(HUMAN_PLAYER_ID);
  message = `${me.name}として開始 (${startBaseName(HUMAN_PLAYER_ID)})`;
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

function drawStartPickPopup() {
  if (!startPickPopup.open) return;
  fill(0, 120);
  rect(0, 0, width, height);

  const r = startPickPopupRect();
  fill(255);
  stroke(24, 52, 84);
  strokeWeight(2);
  rect(r.x, r.y, r.w, r.h, 16);

  noStroke();
  fill(20);
  textAlign(LEFT, TOP);
  textSize(24);
  text("開始勢力を選択", r.x + 24, r.y + 20);
  fill(75);
  textSize(13);
  text("自分が操作する勢力を1つ選んで開始します。", r.x + 24, r.y + 60);

  for (const op of startPickOptionRects()) {
    fill(244, 248, 255);
    stroke(64, 102, 150);
    strokeWeight(1.5);
    rect(op.x, op.y, op.w, op.h, 12);
    noStroke();
    fill(25);
    textSize(18);
    textAlign(LEFT, TOP);
    text(op.name, op.x + 12, op.y + 10);
    textSize(12);
    fill(75);
    text(`拠点: ${op.base}`, op.x + 12, op.y + 42);
    text("クリックで開始", op.x + 12, op.y + 68);
  }
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
  } else if (kind === "attack") {
    stroke(190, 70, 70);
    line(-size * 0.8, size * 0.8, size * 0.8, -size * 0.8);
    line(-size * 0.35, size * 0.95, size * 0.95, -size * 0.35);
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

function drawTileTypeIcon(tile, x, y, size = 10) {
  const type = tile.type;
  if (type === TYPE.UMI) {
    push();
    stroke(44, 116, 186);
    noFill();
    for (let i = 0; i < 2; i++) {
      const yy = y + i * 5;
      arc(x - 5, yy, size, 5, 0, PI);
      arc(x + 3, yy, size, 5, 0, PI);
    }
    pop();
    return;
  }
  if (type === TYPE.YAMA) {
    push();
    stroke(86, 90, 106);
    fill(182, 188, 201);
    triangle(x - size * 0.9, y + size * 0.9, x, y - size * 0.95, x + size * 0.9, y + size * 0.9);
    pop();
    return;
  }
  if (type === TYPE.MINATO) {
    drawUiIcon("trade", x, y, size * 0.82);
    return;
  }
  if (type === TYPE.JINJA) {
    push();
    stroke(196, 66, 66);
    fill(252, 240, 228);
    rect(x - size * 0.95, y - size * 0.15, size * 1.9, size * 0.95, 2);
    line(x - size * 1.1, y - size * 0.15, x + size * 1.1, y - size * 0.15);
    line(x - size * 0.7, y + size * 0.85, x - size * 0.7, y + size * 0.05);
    line(x + size * 0.7, y + size * 0.85, x + size * 0.7, y + size * 0.05);
    pop();
    return;
  }
  if (type === TYPE.KOBO) {
    drawUiIcon("workshop", x, y, size * 0.86);
    return;
  }
  if (type === TYPE.JO) {
    drawUiIcon("castle", x, y, size * 0.9);
    return;
  }
  if (type === TYPE.TERA) {
    push();
    stroke(114, 80, 138);
    fill(236, 214, 246);
    rect(x - size * 0.75, y - size * 0.2, size * 1.5, size * 0.9, 2);
    triangle(x - size, y - size * 0.2, x, y - size * 0.95, x + size, y - size * 0.2);
    pop();
    return;
  }
  drawUiIcon("food", x, y, size * 0.72);
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
  fill(soundtrack.enabled ? color(219, 235, 255) : color(240, 240, 240));
  stroke(soundtrack.enabled ? color(70, 110, 172) : color(150, 150, 150));
  strokeWeight(1.5);
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
    const leadMidi = 67 + offset;
    soundtrack.lead.frequency.setValueAtTime(midiToHz(leadMidi), t);
    soundtrack.leadGain.gain.cancelScheduledValues(t);
    soundtrack.leadGain.gain.setValueAtTime(0.0001, t);
    soundtrack.leadGain.gain.linearRampToValueAtTime(0.06, t + 0.02);
    soundtrack.leadGain.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.45);

    if (soundtrack.step % 2 === 0) {
      const bassMidi = 43 + (offset >= 0 ? 0 : -2);
      soundtrack.bass.frequency.setValueAtTime(midiToHz(bassMidi), t);
      soundtrack.bassGain.gain.cancelScheduledValues(t);
      soundtrack.bassGain.gain.setValueAtTime(0.0001, t);
      soundtrack.bassGain.gain.linearRampToValueAtTime(0.045, t + 0.01);
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

function resourcePairs(p) {
  return [
    ["food", p.food],
    ["gold", p.gold],
    ["culture", p.culture],
    ["force", p.force],
    ["washi", p.washi],
    ["pottery", p.pottery],
    ["innovation", p.innovation],
  ];
}

function drawTopResourceLine(p, eventState, ap, x, y) {
  textAlign(LEFT, CENTER);
  textSize(11);
  let cx = x;
  for (const [kind, value] of resourcePairs(p)) {
    drawUiIcon(kind, cx + 5, y, 6);
    fill(245);
    text(`${value}`, cx + 14, y);
    cx += 44;
  }
  drawUiIcon("event", cx + 5, y, 6);
  fill(245);
  text(eventState, cx + 14, y);
  cx += 78;
  drawUiIcon("action", cx + 5, y, 6);
  fill(245);
  text(`${ap}/${ACTIONS_PER_TURN}`, cx + 14, y);
  cx += 64;
  fill(245);
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

function initializeGame() {
  players = [
    { name: "二丈軍", id: 1, food: 10, gold: 10, culture: 6, force: 3, washi: 0, pottery: 0, innovation: 0, col: color(56, 124, 255) },
    { name: "伊都軍", id: 2, food: 10, gold: 10, culture: 6, force: 3, washi: 0, pottery: 0, innovation: 0, col: color(236, 96, 84) },
    { name: "志摩軍", id: 3, food: 10, gold: 10, culture: 6, force: 3, washi: 0, pottery: 0, innovation: 0, col: color(90, 170, 118) },
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
  tileFx = [];
  mountainPassTurns = makePlayerStateMap(0);
  flipCapturesThisTurn = makePlayerStateMap(0);
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
  buildButtons();
}

function draw() {
  background(232, 240, 250);
  drawTopBar();
  drawHexGrid();
  drawRightPanel();
  drawBottomBar();
  if (eventPopup.open) drawEventPopup();
  if (workshopBuildPopup.open) drawWorkshopBuildPopup();
  if (gameState !== "playing") drawWinPopup();
  if (startPickPopup.open) drawStartPickPopup();
  updateSoundtrack();
}

function mousePressed() {
  activateSoundtrackByGesture();
  if (soundtrackButtonContains(mouseX, mouseY)) {
    toggleSoundtrack();
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

  if (eventPopup.open) {
    if (eventPopupOkContains(mouseX, mouseY)) {
      eventPopup.open = false;
    }
    return;
  }

  if (gameState !== "playing") {
    if (winPopupRestartContains(mouseX, mouseY)) {
      openStartPickPopup();
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
  return {
    c, r, type, name,
    owner: 0,
    inf,
    castleHp: type === TYPE.JO ? CASTLE_SIEGE_HITS : 0,
  };
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
  fill(26, 44, 72);
  noStroke();
  rect(0, 0, width, TOP_H);

  fill(245);
  textAlign(LEFT, CENTER);
  textSize(18);
  text(`第${turn}ターン - ${players[currentPlayer].name}の手番`, 14, TOP_H / 2);

  const me = players[currentPlayer];
  const used = !!eventUsedByPlayer[me.id];
  const ready = eventReadyThisTurn[me.id];
  const eventState = ready ? (used ? "使用済" : "使用可") : "発生なし";
  const ap = actionsLeft[me.id];
  textSize(12);
  drawTopResourceLine(me, eventState, ap, 340, TOP_H / 2);
  drawSoundtrackButton();
}

function drawHexGrid() {
  push();
  translate(camera.x, camera.y);
  scale(camera.zoom);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      const ctr = centers[r][c];
      const isoCtr = projectPoint(ctr.x, ctr.y);

      if (t.type === TYPE.YAMA) drawMountainShadow(ctr.x, ctr.y, HEX_SIZE);
      noStroke();
      fill(terrainColor(t.type));
      drawHex(ctr.x, ctr.y, HEX_SIZE);
      if (t.type === TYPE.UMI) drawSeaPattern(isoCtr.x, isoCtr.y, HEX_SIZE * 0.88);
      if (t.type === TYPE.MINATO) drawHarborPier(isoCtr.x, isoCtr.y, HEX_SIZE * 0.88, isFishingPort(t));

      if (t.owner === 0 && t.type !== TYPE.UMI) {
        const a = constrain((t.inf[HUMAN_PLAYER_ID] || 0) * 6, 0, 90);
        const b = constrain(maxOpponentInfluence(t, HUMAN_PLAYER_ID) * 6, 0, 90);
        if (a > 0) {
          fill(40, a);
          drawHex(ctr.x, ctr.y, HEX_SIZE * 0.78);
        }
        if (b > 0) {
          fill(160, b);
          drawHex(ctr.x, ctr.y, HEX_SIZE * 0.62);
        }
      }

      if (t.owner !== 0) {
        fill(players[t.owner - 1].col);
        drawHex(ctr.x, ctr.y, HEX_SIZE * 0.78);
      }

      fill(20);
      textAlign(CENTER, CENTER);
      textSize(14);
      if (t.type !== TYPE.UMI && t.type !== TYPE.HEICHI) {
        drawTileTypeIcon(t, isoCtr.x, isoCtr.y - 10, 11);
        textSize(10);
        text(tileLabel(t), isoCtr.x, isoCtr.y + 9);
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

  drawCoastlineRim();
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
  noFill();
  stroke(210, 235, 255, 110);
  strokeWeight(1.4);
  for (let i = 0; i < 3; i++) {
    const y = cy - size * 0.25 + i * size * 0.25;
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
  stroke(246, 251, 255, 170);
  strokeWeight(2.4);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.type === TYPE.UMI) continue;
      const coast = neighbors6(c, r).some((nt) => nt.type === TYPE.UMI);
      if (!coast) continue;
      const ctr = centers[r][c];
      drawHex(ctr.x, ctr.y, HEX_SIZE * 0.95);
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
  fill(245, 250, 255);
  noStroke();
  rect(px, py, UI_W, height - TOP_H - BOTTOM_H);

  fill(20);
  textAlign(LEFT, TOP);
  textSize(14);
  text("情報 / ターン", px + 18, py + 10);

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
  buttons[7].draw(playable && isPlayer);

  const meStat = playerById(HUMAN_PLAYER_ID);
  const rankLines = [meStat, ...players.filter((p) => p.id !== HUMAN_PLAYER_ID)].slice(0, 3);
  const enemyControl = round(maxEnemyControlRate(HUMAN_PLAYER_ID) * 100);
  fill(40);
  textSize(11);
  for (let i = 0; i < rankLines.length; i++) {
    const p = rankLines[i];
    const title = i === 0 ? `${p.name}(自分)` : p.name;
    text(`${title}: 文化${p.culture}/${CULTURE_WIN}・支配${round(controlRate(p.id) * 100)}%`, px + 18, py + 24 + i * 16);
  }
  const playerEventState = eventReadyThisTurn[HUMAN_PLAYER_ID] ? (eventUsedThisTurn ? "使用済" : "使用可") : "発生なし";
  text(`イベント:${playerEventState} / 交易:${tradeUsedThisTurn ? "使用済" : "未使用"}`, px + 18, py + 88);
  text(`行動: ${actionsLeft[HUMAN_PLAYER_ID]}/${ACTIONS_PER_TURN} / 文化転向: ${flipCapturesThisTurn[HUMAN_PLAYER_ID]}/${MAX_FLIPS_PER_PLAYER_TURN}`, px + 18, py + 104);
  const buttonsBottom = buttons.length > 0 ? buttons[buttons.length - 1].y + buttons[buttons.length - 1].h : py + 110;
  const tileInfoY = buttonsBottom + 20;

  fill(28, 45, 72);
  textSize(13);
  text(`選択: ${tileLabel(t)}`, px + 18, tileInfoY);
  text(`地形: ${t.type}`, px + 18, tileInfoY + 22);
  text(`所有: ${ownerName(t.owner)}`, px + 18, tileInfoY + 44);
  text(`影響力: 二丈${t.inf[1] || 0} / 伊都${t.inf[2] || 0} / 志摩${t.inf[3] || 0}`, px + 18, tileInfoY + 66);
  text(`役割: ${tileRoleTitle(t)}`, px + 18, tileInfoY + 88);
  textSize(11);
  text(tileRoleDetail(t, me.id), px + 18, tileInfoY + 106, UI_W - 36, 46);

  fill(180, 52, 52);
  textSize(12);
  text(`敵進捗: 支配率${enemyControl}% (勝利:${round(CONTROL_WIN_RATE * 100)}%)`, px + 18, tileInfoY + 132);

  fill(60);
  textSize(11);
  const portCombo = hasPortWorkshopCombo(HUMAN_PLAYER_ID) ? "有効(交易+2)" : "未成立";
  const shrineCombo = hasShrineTempleCombo(HUMAN_PLAYER_ID) ? "有効(文化波及+1)" : "未成立";
  const mountainCombo = hasMountainCastleCombo(HUMAN_PLAYER_ID) ? "有効(山城攻防+1)" : "未成立";
  text(`季節: ${seasonState.name} (${seasonState.desc})\nコンボ: 港+工房 ${portCombo}\nコンボ: 寺+神社 ${shrineCombo}\nコンボ: 山+城 ${mountainCombo}`, px + 18, tileInfoY + 150);
}

function drawBottomBar() {
  const y0 = height - BOTTOM_H;
  fill(255);
  noStroke();
  rect(0, y0, width, BOTTOM_H);

  fill(20);
  textAlign(LEFT, TOP);
  textSize(14);
  text("メッセージ", 14, y0 + 10);
  textSize(13);
  text(message, 14, y0 + 36);

  fill(35, 80, 130);
  textSize(12);
  if (latestComment) text(`ログ: ${latestComment}`, 14, y0 + 56);

  fill(60);
  textSize(12);
  const enemyRate = round(maxEnemyControlRate(HUMAN_PLAYER_ID) * 100);
  const controlGoal = round(CONTROL_WIN_RATE * 100);
  const dangerControlLine = max(0, controlGoal - 15);
  const danger = enemyRate >= dangerControlLine;
  const hint = danger
    ? `警戒: 敵の勝利が近い (支配率${enemyRate}%)`
    : `勝利条件: 支配率${controlGoal}% / 敵: 支配率${enemyRate}%`;
  text(hint, 14, y0 + 74);

  fill(45);
  textSize(11);
  const report = incomeReport[HUMAN_PLAYER_ID] || "収入内訳: まだ収益処理なし";
  text(report, 14, y0 + 92, width - 28, 48);
}

function drawEventPopup() {
  fill(0, 90);
  rect(0, 0, width, height);

  const w = min(580, width - 80);
  const h = 320;
  const x = (width - w) / 2;
  const y = (height - h) / 2;

  fill(255);
  stroke(20);
  strokeWeight(2);
  rect(x, y, w, h, 16);

  fill(20);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(22);
  text(eventPopup.title, x + 24, y + 22);

  fill(120);
  textSize(12);
  text(`ID: ${eventPopup.cardId}`, x + 24, y + 56);

  fill(40);
  textSize(15);
  text(eventPopup.desc, x + 24, y + 86, w - 48, 90);

  fill(30);
  textSize(14);
  text(eventPopup.effectText, x + 24, y + 186, w - 48, 56);

  fill(200);
  rect(x + w - 120, y + 18, 90, 28, 14);
  fill(20);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(eventPopup.usedLabel, x + w - 75, y + 32);

  const ok = eventPopupOkRect();
  fill(250);
  stroke(30);
  strokeWeight(2);
  rect(ok.x, ok.y, ok.w, ok.h, 12);
  noStroke();
  fill(20);
  textSize(16);
  text("OK", ok.x + ok.w / 2, ok.y + ok.h / 2);
}

function drawWinPopup() {
  fill(0, 100);
  rect(0, 0, width, height);

  const w = min(520, width - 100);
  const h = 290;
  const x = (width - w) / 2;
  const y = (height - h) / 2;

  fill(255);
  stroke(20);
  strokeWeight(2);
  rect(x, y, w, h, 16);

  fill(20);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  text(gameState === "win" ? "勝利" : "敗北", x + w / 2, y + 50);
  textSize(16);
  text(winText, x + 28, y + 92, w - 56, 120);

  const r = winPopupRestartRect();
  fill(250);
  stroke(30);
  strokeWeight(2);
  rect(r.x, r.y, r.w, r.h, 12);
  noStroke();
  fill(20);
  textSize(16);
  text("もう一度あそぶ", r.x + r.w / 2, r.y + r.h / 2);
}

function drawWorkshopBuildPopup() {
  fill(0, 100);
  rect(0, 0, width, height);

  const rectInfo = workshopBuildPopupRect();
  fill(255);
  stroke(20);
  strokeWeight(2);
  rect(rectInfo.x, rectInfo.y, rectInfo.w, rectInfo.h, 16);

  const t = getTile(workshopBuildPopup.c, workshopBuildPopup.r);
  fill(20);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(22);
  text("工房建設", rectInfo.x + 24, rectInfo.y + 20);
  textSize(13);
  fill(80);
  text(`建設先: ${t ? tileLabel(t) : "-"}`, rectInfo.x + 24, rectInfo.y + 56);
  text(`費用: 金${BUILD_WORKSHOP_COST}`, rectInfo.x + 24, rectInfo.y + 78);

  for (const op of workshopBuildOptionRects()) {
    fill(248, 252, 255);
    stroke(50, 84, 128);
    strokeWeight(1.5);
    rect(op.x, op.y, op.w, op.h, 12);
    noStroke();
    fill(20, 45, 80);
    textAlign(LEFT, CENTER);
    textSize(14);
    drawUiIcon(workshopKindIcon(op.kind), op.x + 15, op.y + op.h / 2, 8);
    text(op.label, op.x + 30, op.y + op.h / 2);
  }

  const c = workshopBuildCancelRect();
  fill(250);
  stroke(80);
  strokeWeight(1.5);
  rect(c.x, c.y, c.w, c.h, 10);
  noStroke();
  fill(30);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("キャンセル", c.x + c.w / 2, c.y + c.h / 2);
}

// ------------------ 繝懊ち繝ｳ ------------------

function buildButtons() {
  buttons = [];
  const px = width - UI_W + 18;
  let py = TOP_H + 128;
  const bw = UI_W - 36;
  const bh = 30;
  const gap = 4;

  buttons.push(new Button(px, py, bw, bh, "文化振興 (金3)", "culture", () => actionCulture())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "交易 (港で強)", "trade", () => actionTrade())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "軍備増強 (金3)", "force", () => actionForce())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "攻撃 (武力消費)", "attack", () => actionAttack())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "イベント (1回)", "event", () => actionEvent())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, `築城 (金${BUILD_CASTLE_COST})`, "castle", () => actionBuildCastle())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, `工房建設 (金${BUILD_WORKSHOP_COST})`, "workshop", () => actionBuildWorkshop())); py += bh + gap;
  buttons.push(new Button(px, py, bw, bh, "ターン終了", "end", () => actionEndTurn()));
}

class Button {
  constructor(x, y, w, h, label, iconKind, onClick) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.label = label; this.iconKind = iconKind || buttonIconKind(label); this.onClick = onClick;
  }
  contains(mx, my) { return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h; }
  draw(enabled = true) {
    stroke(enabled ? color(38, 70, 115) : color(175, 185, 200));
    strokeWeight(1.5);
    fill(enabled ? color(228, 239, 255) : color(240, 243, 248));
    rect(this.x, this.y, this.w, this.h, 12);
    drawUiIcon(this.iconKind, this.x + 14, this.y + this.h / 2, 8);
    noStroke();
    fill(enabled ? color(20, 45, 80) : color(140));
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
  if (kind === WORKSHOP_KIND.FABLAB) {
    return { culture: 1, gold: 2, force: 1, washi: 0, pottery: 0, innovation: 1 };
  }
  if (kind === WORKSHOP_KIND.WASHI) {
    return { culture: 2, gold: 1, force: 0, washi: 2, pottery: 0, innovation: 0 };
  }
  if (kind === WORKSHOP_KIND.POTTERY) {
    return { culture: 1, gold: 2, force: 0, washi: 0, pottery: 2, innovation: 0 };
  }
  return { culture: 1, gold: 1, force: 0, washi: 0, pottery: 0, innovation: 0 };
}

function workshopTradeBonus(tile) {
  const kind = workshopKind(tile);
  if (kind === WORKSHOP_KIND.FABLAB) {
    return { gold: 2, force: 1, culture: 0, washi: 0, pottery: 0, innovation: 1 };
  }
  if (kind === WORKSHOP_KIND.WASHI) {
    return { gold: 2, force: 0, culture: 1, washi: 1, pottery: 0, innovation: 0 };
  }
  if (kind === WORKSHOP_KIND.POTTERY) {
    return { gold: 3, force: 0, culture: 1, washi: 0, pottery: 1, innovation: 0 };
  }
  return { gold: 1, force: 0, culture: 0, washi: 0, pottery: 0, innovation: 0 };
}

function workshopCulturePower(tile) {
  const kind = workshopKind(tile);
  if (kind === WORKSHOP_KIND.WASHI) return 5;
  if (kind === WORKSHOP_KIND.FABLAB) return 4;
  if (kind === WORKSHOP_KIND.POTTERY) return 4;
  return 5;
}

function cultureActionGain(tile) {
  if (tile.type !== TYPE.KOBO) {
    const base = (tile.type === TYPE.JINJA || tile.type === TYPE.TERA) ? 4 : 2;
    const seasonBonus = (tile.type === TYPE.JINJA || tile.type === TYPE.TERA) ? seasonState.shrineCultureActionBonus : 0;
    return base + seasonBonus;
  }
  const b = workshopActionBonus(tile);
  return 3 + b.culture;
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
  spreadCulture(me.id);
  pushTileFx(t.c, t.r, `文化+${bonus}`, color(245, 145, 55));
  const baseMessage = t.type === TYPE.JINJA
    ? `文化振興を実行: 文化 +${bonus} / 神社波及 +${SHRINE_CULTURE_PULSE}`
    : `文化振興を実行: 文化 +${bonus}`;
  message = extraLogs.length > 0 ? `${baseMessage} / ${extraLogs.join(" / ")}` : baseMessage;
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
  tradeUsedThisTurn = true;
  pushTileFx(t.c, t.r, `金+${gain}`, color(56, 170, 255));
  const seasonGoldText = (t.type === TYPE.MINATO && seasonState.portTradeBonus > 0) ? ` / 季節金+${seasonState.portTradeBonus}` : "";
  const seasonFoodText = (isFishingPort(t) && seasonState.fishingFoodBonus > 0) ? ` / 季節食料+${seasonState.fishingFoodBonus}` : "";
  message = `交易を実行: 金 +${gain}${trade.food > 0 ? ` / 食料 +${trade.food}` : ""}（工房補正+${workshopBonus}${hasPortWorkshopCombo(me.id) ? " / 港+工房コンボ" : ""}${seasonGoldText}${seasonFoodText}）${extraInfo}`;
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
  me.force += 3;
  pushTileFx(t.c, t.r, "武力+3", color(235, 90, 80));
  message = "軍備を増強しました (+3)。";
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function actionAttack() {
  if (!canPlayerAct()) return;
  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  if (t.owner !== me.id) { message = "自領の拠点を選んでください。"; return; }
  const attackable = neighbors6(t.c, t.r).some((nt) => nt.type !== TYPE.UMI && nt.owner !== me.id);
  if (!attackable) { message = "攻撃できる隣接タイルがありません。"; return; }
  attackMode = { active: true, from: { c: t.c, r: t.r } };
  message = `攻撃先を選択してください: ${tileLabel(t)} の隣接マスをクリック`;
}

function actionEvent() {
  if (!canPlayerAct()) return;
  if (!eventReadyThisTurn[HUMAN_PLAYER_ID]) { message = "このターンはイベントが発生していません。"; return; }
  if (eventUsedThisTurn) { message = "このターンはイベントを使用済みです。"; return; }

  const me = players[currentPlayer];
  const t = getTile(selected.c, selected.r);
  const card = drawEventCard();
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
  t.type = TYPE.JO;
  t.name = "新城";
  t.castleHp = CASTLE_SIEGE_HITS;
  pushTileFx(t.c, t.r, "築城", color(196, 142, 112));
  message = `築城を実行: ${tileLabel(t)} を建設 (金-${BUILD_CASTLE_COST})`;
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
  t.type = TYPE.KOBO;
  if (kind === WORKSHOP_KIND.FABLAB) t.name = "ファブラボ";
  else if (kind === WORKSHOP_KIND.WASHI) t.name = "和紙工房";
  else if (kind === WORKSHOP_KIND.POTTERY) t.name = "陶芸工房";
  else t.name = "工房";

  selected = { c: t.c, r: t.r };
  pushTileFx(t.c, t.r, "工房建設", color(236, 150, 96));
  message = `工房建設を実行: ${t.name} を建設 (金-${BUILD_WORKSHOP_COST})`;
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

  const isAdjacent = neighbors6(from.c, from.r).some((nt) => nt.c === c && nt.r === r);
  if (!isAdjacent) {
    message = "攻撃先は攻撃元の隣接マスを選んでください。";
    return;
  }
  if (target.type === TYPE.UMI) {
    message = "海マスは攻撃・占領できません。";
    return;
  }
  if (target.owner === me.id) {
    message = "自領マスは攻撃できません。";
    return;
  }

  const ignoreMountain = mountainPassTurns[me.id] > 0;
  const penalty = target.type === TYPE.YAMA && !ignoreMountain ? 3 + seasonState.mountainAttackPenalty : 0;
  const castlePenalty = target.type === TYPE.JO ? CASTLE_DEFENSE_PENALTY : 0;
  const defenderComboPenalty = (target.owner !== 0 && hasMountainCastleCombo(target.owner) && (target.type === TYPE.YAMA || target.type === TYPE.JO)) ? 1 : 0;
  const discount = (from.type === TYPE.JO ? CASTLE_ATTACK_DISCOUNT : 0)
    + (from.type === TYPE.YAMA ? MOUNTAIN_ATTACK_DISCOUNT : 0)
    + ((hasMountainCastleCombo(me.id) && (from.type === TYPE.JO || from.type === TYPE.YAMA)) ? 1 : 0);
  const need = max(1, FORCE_ATTACK + penalty + castlePenalty + defenderComboPenalty - discount);
  if (me.force < need) {
    message = `武力不足です (必要: ${need})`;
    attackMode = { active: false, from: null };
    return;
  }

  me.force -= need;
  if (target.type === TYPE.JO) {
    const hpBefore = target.castleHp > 0 ? target.castleHp : CASTLE_SIEGE_HITS;
    const hpAfter = max(0, hpBefore - 1);
    target.castleHp = hpAfter;
    pushTileFx(target.c, target.r, hpAfter > 0 ? `攻城 ${hpAfter}/${CASTLE_SIEGE_HITS}` : "陥落", color(220, 70, 70));
    if (hpAfter > 0) {
      message = `攻城: ${tileLabel(target)} の耐久 ${hpAfter}/${CASTLE_SIEGE_HITS} (武力-${need})`;
      attackMode = { active: false, from: null };
      spendAction(me.id);
      message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
      return;
    }
  }

  target.owner = me.id;
  resetTileInfluence(target);
  if (target.type === TYPE.JO) target.castleHp = CASTLE_SIEGE_HITS;
  selected = { c, r };
  pushTileFx(target.c, target.r, "制圧", color(220, 70, 70));
  latestComment = gainComment(me.id, target, "攻撃");
  message = target.type === TYPE.JO
    ? `攻城成功: ${tileLabel(target)} が陥落し獲得 (武力-${need})`
    : `攻撃成功: ${tileLabel(target)} を獲得 (武力-${need})`;
  attackMode = { active: false, from: null };
  spendAction(me.id);
  message += ` / 行動:${actionsLeft[me.id]}/${ACTIONS_PER_TURN}`;
  checkWinConditions();
}

function canPlayerAct() {
  const me = players[currentPlayer];
  if (gameState !== "playing") return false;
  if (eventPopup.open) return false;
  if (workshopBuildPopup.open) return false;
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

function drawEventCard() {
  if (deck.length === 0) {
    deck = discard.slice();
    discard = [];
    shuffleDeck(deck);
  }
  return deck.pop();
}

function applyEvent(card, p, selectedTile, showMessage) {
  const result = card.apply(p, selectedTile) || {};
  const enemy = strongestEnemyByCulture(p.id);
  let logs = [];

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

  const effectText = logs.length > 0 ? `効果: ${logs.join(" / ")}` : "効果なし";
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

function hasPortWorkshopCombo(playerId) {
  return countOwnedType(playerId, TYPE.MINATO) > 0 && countOwnedType(playerId, TYPE.KOBO) > 0;
}

function hasShrineTempleCombo(playerId) {
  return countOwnedType(playerId, TYPE.JINJA) > 0 && countOwnedType(playerId, TYPE.TERA) > 0;
}

function tradeGain(playerId, tile) {
  const tileType = tile ? tile.type : TYPE.HEICHI;
  const fishing = isFishingPort(tile);
  const base = tileType === TYPE.MINATO ? (fishing ? 4 : 6) : 2;
  const combo = hasPortWorkshopCombo(playerId) ? 2 : 0;
  const workshopBonus = tradeWorkshopBonus(playerId);
  const seasonGold = tileType === TYPE.MINATO ? seasonState.portTradeBonus : 0;
  const seasonFood = tileType === TYPE.MINATO && fishing ? seasonState.fishingFoodBonus : 0;
  return { gold: base + combo + workshopBonus + seasonGold, food: (tileType === TYPE.MINATO && fishing ? 2 : 0) + seasonFood };
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
      checkWinConditions();
      const seasonMsg = prevSeasonId !== seasonState.id ? ` / 季節変化: ${seasonState.name}(${seasonState.desc})` : "";
      message = aiLogs.length > 0
        ? `敵ターン: ${aiLogs.join(" / ")} / あなたのターンです。`
        : "敵ターン終了。あなたのターンです。";
      message += seasonMsg;
      break;
    }

    const aiSummary = aiTurn(currentPlayer);
    passive(currentPlayer);
    spreadCulture(pid);
    if (checkWinConditions()) return;
    aiLogs.push(`${p.name}:${aiSummary || "行動なし"}`);
  }
}

function passive(playerIndex) {
  const p = players[playerIndex];
  let foodGain = 0, goldGain = 0, cultureGain = 0;
  let forceGain = 0, washiGain = 0, potteryGain = 0, innovationGain = 0;
  let plainCount = 0, portCount = 0, fishingPortCount = 0;
  let fablabCount = 0, washiWorkshopCount = 0, potteryWorkshopCount = 0, genericWorkshopCount = 0;
  let shrineCount = 0, templeCount = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.owner !== p.id) continue;

      if (t.type === TYPE.HEICHI) {
        foodGain += 1;
        plainCount += 1;
      }
      if (t.type === TYPE.MINATO) {
        if (isFishingPort(t)) {
          foodGain += 1;
          fishingPortCount += 1;
        } else {
          goldGain += 2;
          portCount += 1;
        }
      }
      if (t.type === TYPE.KOBO) {
        const kind = workshopKind(t);
        if (kind === WORKSHOP_KIND.FABLAB) {
          goldGain += 1;
          forceGain += 1;
          cultureGain += SOFT_CULTURE;
          innovationGain += 1;
          fablabCount += 1;
        } else if (kind === WORKSHOP_KIND.WASHI) {
          goldGain += 1;
          cultureGain += SOFT_CULTURE + 1;
          washiGain += 1;
          washiWorkshopCount += 1;
        } else if (kind === WORKSHOP_KIND.POTTERY) {
          goldGain += 2;
          cultureGain += SOFT_CULTURE + 1;
          potteryGain += 1;
          potteryWorkshopCount += 1;
        } else {
          cultureGain += SOFT_CULTURE;
          genericWorkshopCount += 1;
        }
      }
      if (t.type === TYPE.JINJA || t.type === TYPE.TERA) {
        cultureGain += SOFT_CULTURE;
        if (t.type === TYPE.JINJA) shrineCount += 1;
        if (t.type === TYPE.TERA) templeCount += 1;
      }
    }
  }

  p.food += foodGain;
  p.gold += goldGain;
  p.culture += cultureGain;
  p.force += forceGain;
  p.washi += washiGain;
  p.pottery += potteryGain;
  p.innovation += innovationGain;

  const upkeep = floor(p.force / 5) * FORCE_UPKEEP;
  p.gold -= upkeep;
  if (p.gold < 0) {
    p.gold = 0;
    p.force = max(0, p.force - 2);
  }

  const details = [];
  if (plainCount > 0) details.push(`平地x${plainCount}(食料+${plainCount})`);
  if (portCount > 0) details.push(`港x${portCount}(金+${portCount * 2})`);
  if (fishingPortCount > 0) details.push(`漁港x${fishingPortCount}(食料+${fishingPortCount})`);
  if (fablabCount > 0) details.push(`ファブラボx${fablabCount}(金+${fablabCount} 武力+${fablabCount} 文化+${SOFT_CULTURE * fablabCount} 機会+${fablabCount})`);
  if (washiWorkshopCount > 0) details.push(`和紙工房x${washiWorkshopCount}(金+${washiWorkshopCount} 文化+${(SOFT_CULTURE + 1) * washiWorkshopCount} 和紙+${washiWorkshopCount})`);
  if (potteryWorkshopCount > 0) details.push(`陶芸工房x${potteryWorkshopCount}(金+${potteryWorkshopCount * 2} 文化+${(SOFT_CULTURE + 1) * potteryWorkshopCount} 陶器+${potteryWorkshopCount})`);
  if (genericWorkshopCount > 0) details.push(`工房x${genericWorkshopCount}(文化+${SOFT_CULTURE * genericWorkshopCount})`);
  if (shrineCount + templeCount > 0) details.push(`寺社x${shrineCount + templeCount}(文化+${SOFT_CULTURE * (shrineCount + templeCount)})`);
  if (upkeep > 0) details.push(`維持費(金-${upkeep})`);

  const netGold = goldGain - upkeep;
  const goldText = netGold >= 0 ? `金+${netGold}` : `金${netGold}`;
  const totals = `収入: 食料+${foodGain} ${goldText} 文化+${cultureGain} 武力+${forceGain} 和紙+${washiGain} 陶器+${potteryGain} 機会+${innovationGain}`;
  incomeReport[p.id] = details.length > 0 ? `${totals} / ${details.join(" / ")}` : totals;
}

function spreadCulture(playerId) {
  const harmonyBonus = hasShrineTempleCombo(playerId) ? 1 : 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t.owner !== playerId) continue;

      const power = t.type === TYPE.KOBO ? workshopCulturePower(t) :
                    (t.type === TYPE.JINJA || t.type === TYPE.TERA) ? 4 :
                    t.type === TYPE.JO ? 2 :
                    t.type === TYPE.YAMA ? 2 : 1;
      const shrineSeason = (t.type === TYPE.JINJA || t.type === TYPE.TERA) ? seasonState.shrineSpreadBonus : 0;
      const finalPower = max(1, power - 1 + harmonyBonus + shrineSeason);

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
      const resist = t.type === TYPE.JO ? CASTLE_FLIP_RESIST : 0;
      const flipNeed = CULTURE_FLIP + resist;
      const dominateNeed = CULTURE_DOMINATE + resist;
      if (a >= flipNeed && a >= b + dominateNeed) {
        const changed = t.owner !== playerId;
        if (!changed) continue;
        if (flipCapturesThisTurn[playerId] >= MAX_FLIPS_PER_PLAYER_TURN) {
          blockedByCap = true;
          continue;
        }
        t.owner = playerId;
        resetTileInfluence(t);
        if (t.type === TYPE.JO) t.castleHp = CASTLE_SIEGE_HITS;
        flipCapturesThisTurn[playerId] += 1;
        latestComment = gainComment(playerId, t, "文化転向");
        const fxText = playerId === HUMAN_PLAYER_ID ? "文化獲得" : "敵が獲得";
        const fxCol = playerId === HUMAN_PLAYER_ID ? color(70, 140, 255) : color(240, 90, 90);
        pushTileFx(t.c, t.r, fxText, fxCol);
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
      const card = drawEventCard();
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

    if (base.type === TYPE.MINATO) {
      const gain = tradeGain(ai.id, base);
      ai.gold += gain.gold;
      if (gain.food > 0) ai.food += gain.food;
      pushTileFx(base.c, base.r, `敵金+${gain.gold}`, color(100, 180, 255));
      logs.push(`交易:+${gain.gold}${gain.food > 0 ? ` 食料+${gain.food}` : ""}`);
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
  drawPolygon(projectedHexPoints(cx, cy, size));
}

function pickHex(mx, my) {
  let hit = null;
  let hitDist = 1e9;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ctr = centers[r][c];
      if (pointInHex(mx, my, ctr.x, ctr.y, HEX_SIZE)) {
        const p = projectPoint(ctr.x, ctr.y);
        const d = dist(mx, my, p.x, p.y);
        if (d < hitDist) {
          hitDist = d;
          hit = { c, r };
        }
      }
    }
  }
  return hit;
}

function pointInHex(px, py, cx, cy, size) {
  const pts = projectedHexPoints(cx, cy, size);
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    const cross = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-9) + xi);
    if (cross) inside = !inside;
  }
  return inside;
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

function projectPoint(wx, wy) {
  const dx = wx - boardX;
  const dy = wy - boardY;
  return {
    x: boardX + ISO_OFFSET_X + dx + dy * ISO_SHEAR_X,
    y: boardY + ISO_OFFSET_Y + dy * ISO_SCALE_Y,
  };
}

function drawPolygon(pts) {
  beginShape();
  for (const p of pts) vertex(p.x, p.y);
  endShape(CLOSE);
}

function drawMountainShadow(cx, cy, size) {
  const pts = projectedHexPoints(cx, cy, size * 0.96);
  const sx = 9;
  const sy = 7;
  const shadowPts = pts.map((p) => ({ x: p.x + sx, y: p.y + sy }));
  noStroke();
  fill(12, 26, 40, 75);
  drawPolygon(shadowPts);
}

function boardScreenBounds() {
  let minX = 1e9;
  let minY = 1e9;
  let maxX = -1e9;
  let maxY = -1e9;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = boardX + c * HEX_W + (r % 2) * (HEX_W / 2) + HEX_W / 2;
      const cy = boardY + r * HEX_VSTEP + HEX_H / 2;
      const top = projectedHexPoints(cx, cy, HEX_SIZE);
      for (const p of top) {
        minX = min(minX, p.x);
        minY = min(minY, p.y);
        maxX = max(maxX, p.x + 10);
        maxY = max(maxY, p.y + 8);
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
  t.owner = playerId;
  resetTileInfluence(t);
  if (t.type === TYPE.JO) t.castleHp = CASTLE_SIEGE_HITS;
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
  if (tile.type === TYPE.UMI) {
    return "海域: 占領・建設不可。港を押さえると海上交易の利益を得られる。";
  }
  if (tile.type === TYPE.JINJA) {
    return `文化振興: 文化+4。実行時に隣接へ影響力+${SHRINE_CULTURE_PULSE}。`;
  }
  if (tile.type === TYPE.KOBO) {
    const bonus = tradeWorkshopBonus(playerId);
    const kind = workshopKind(tile);
    if (kind === WORKSHOP_KIND.FABLAB) {
      return `文化振興: 文化+${cultureActionGain(tile)}。新機会の開発で金・武力・機会が伸びる。交易時も追加で武力+1。`;
    }
    if (kind === WORKSHOP_KIND.WASHI) {
      return `文化振興: 文化+${cultureActionGain(tile)}。和紙を生産し、金も増える。交易時にも和紙獲得。`;
    }
    if (kind === WORKSHOP_KIND.POTTERY) {
      return `文化振興: 文化+${cultureActionGain(tile)}。陶器献上で金が増える。交易時にも陶器獲得。`;
    }
    return `文化振興: 文化+${cultureActionGain(tile)}。交易に工房ボーナス+${bonus}（最大+${WORKSHOP_TRADE_BONUS_CAP}）。`;
  }
  if (tile.type === TYPE.JO) {
    const hp = tile.castleHp > 0 ? tile.castleHp : CASTLE_SIEGE_HITS;
    return `攻撃時の武力コスト-${CASTLE_ATTACK_DISCOUNT}。被攻撃時は相手武力+${CASTLE_DEFENSE_PENALTY}必要。攻城${CASTLE_SIEGE_HITS}回で陥落（耐久${hp}/${CASTLE_SIEGE_HITS}）。文化転向に耐性+${CASTLE_FLIP_RESIST}。`;
  }
  if (tile.type === TYPE.YAMA) {
    return `攻撃元なら武力コスト-${MOUNTAIN_ATTACK_DISCOUNT}。山地への攻撃には追加コスト。`;
  }
  if (tile.type === TYPE.MINATO) {
    if (isFishingPort(tile)) {
      return "漁港: 毎ターン食料+1。交易で金+4・食料+2。工房を持つと交易金がさらに伸びる。";
    }
    return "港: 毎ターン金+2。交易で金+6。工房を持つとさらに伸びる。";
  }
  if (tile.type === TYPE.TERA) {
    return "文化振興: 文化+4。神社と合わせると文化伝播が強化。";
  }
  return `平地: 特殊効果なし。食料収入の基盤。金${BUILD_CASTLE_COST}で築城、金${BUILD_WORKSHOP_COST}で工房建設が可能（山でも可）。`;
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
  if (type === TYPE.UMI) return color(92, 154, 214);
  if (type === TYPE.HEICHI) return color(196, 228, 166);
  if (type === TYPE.YAMA) return color(148, 160, 169);
  if (type === TYPE.MINATO) return color(130, 191, 226);
  if (type === TYPE.JINJA) return color(246, 208, 133);
  if (type === TYPE.KOBO) return color(240, 173, 130);
  if (type === TYPE.JO) return color(210, 168, 148);
  if (type === TYPE.TERA) return color(224, 184, 219);
  return color(220, 230, 240);
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
  const w = min(580, width - 80);
  const h = 320;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
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











