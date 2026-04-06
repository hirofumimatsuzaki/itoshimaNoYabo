const GRID_COLS = 7;
const GRID_ROWS = 5;
const TILE_SIZE = 90;
const GRID_X = 34;
const GRID_Y = 138;
const SIDEBAR_W = 360;
const HEADER_H = 110;
const FOOTER_H = 132;
const CANVAS_W = GRID_X * 2 + GRID_COLS * TILE_SIZE + SIDEBAR_W;
const CANVAS_H = GRID_Y + GRID_ROWS * TILE_SIZE + FOOTER_H;

const STATS = ["money", "culture", "population", "visitors", "artists"];

const STAGE_DEFS = [
  { key: "hamlet", label: "小さな集落", needs: { culture: 0, population: 0, artists: 0, visitors: 0 } },
  { key: "sprout", label: "文化の芽生え", needs: { culture: 40, population: 28, artists: 1, visitors: 18 } },
  { key: "town", label: "芸術の町", needs: { culture: 95, population: 42, artists: 4, visitors: 55 } },
  { key: "village", label: "芸術村", needs: { culture: 170, population: 62, artists: 8, visitors: 95 } },
];

const BUILDINGS = {
  gallery: {
    id: "gallery",
    label: "ギャラリー",
    short: "画",
    cost: 24,
    color: "#d97f70",
    desc: "展示文化の核。来訪者と文化を大きく伸ばす。",
    effect: { money: 1, culture: 6, visitors: 4, artists: 0 },
  },
  cafe: {
    id: "cafe",
    label: "カフェ",
    short: "茶",
    cost: 16,
    color: "#c99754",
    desc: "交流の滞在拠点。来訪者をお金に変える。",
    effect: { money: 5, culture: 1, visitors: 2, artists: 0 },
  },
  farm: {
    id: "farm",
    label: "農場",
    short: "農",
    cost: 14,
    color: "#8cab5b",
    desc: "地域らしさと暮らしを支える土台。",
    effect: { money: 4, culture: 1, population: 3, visitors: 0, artists: 0 },
  },
  housing: {
    id: "housing",
    label: "住居",
    short: "住",
    cost: 18,
    color: "#9d836f",
    desc: "定住人口を増やし、村の土台を固める。",
    effect: { money: -1, culture: 0, population: 5, visitors: 0, artists: 0 },
  },
  atelier: {
    id: "atelier",
    label: "アトリエ",
    short: "ア",
    cost: 22,
    color: "#7e8fd6",
    desc: "創作の拠点。文化を育て、アーティスト出現条件になる。",
    effect: { money: -1, culture: 5, population: 1, visitors: 1, artists: 0 },
  },
  inn: {
    id: "inn",
    label: "宿泊施設",
    short: "宿",
    cost: 26,
    color: "#6da7a8",
    desc: "滞在型の来訪を支え、展示の波及を広げる。",
    effect: { money: 6, culture: 1, visitors: 5, artists: 0 },
  },
  library: {
    id: "library",
    label: "図書館",
    short: "図",
    cost: 20,
    color: "#7d9f79",
    desc: "学びと記録の場。文化を安定して伸ばす。",
    effect: { money: 0, culture: 4, population: 1, visitors: 1, artists: 0 },
  },
  workshop: {
    id: "workshop",
    label: "工房",
    short: "工",
    cost: 19,
    color: "#c67f52",
    desc: "ものづくりの現場。収益と交流を生む。",
    effect: { money: 4, culture: 3, population: 1, visitors: 2, artists: 0 },
  },
};

const TILE_TYPES = {
  meadow: { label: "草地", color: "#d7e8b2" },
  coast: { label: "海辺", color: "#b7d8e8" },
  grove: { label: "林", color: "#bed1a5" },
  field: { label: "畑地", color: "#e4d7a1" },
};

let tiles = [];
let buildButtons = [];
let actionButtons = [];
let selectedTile = { c: 0, r: 0 };
let selectedBuilding = "gallery";
let hoveredTile = null;
let message = "右の建物を選んで空き地に配置します。";
let monthTickFrames = 0;

const state = {
  month: 1,
  season: "春",
  stageIndex: 0,
  money: 72,
  culture: 12,
  population: 18,
  visitors: 8,
  artists: 0,
  exhibitionCooldown: 0,
  lastMonthlyDelta: null,
  log: ["海と畑のあいだに、静かな文化の拠点づくりが始まりました。"],
};

function setup() {
  const canvas = createCanvas(CANVAS_W, CANVAS_H);
  canvas.parent("app");
  textFont("sans-serif");
  initWorld();
  buildUiButtons();
}

function draw() {
  drawBackground();
  hoveredTile = mouseInGrid() ? pickTile(mouseX, mouseY) : null;
  drawHeader();
  drawGrid();
  drawSidebar();
  drawFooter();
}

function mousePressed() {
  if (handleButtons()) return;

  if (!mouseInGrid()) return;
  const tile = pickTile(mouseX, mouseY);
  if (!tile) return;
  selectedTile = { c: tile.c, r: tile.r };
  if (!tile.building) {
    message = `${tile.typeLabel}の区画を選択中。${BUILDINGS[selectedBuilding].label}を建てられます。`;
    return;
  }

  message = `${tile.building.label}: ${tile.building.desc}`;
}

function initWorld() {
  tiles = [];
  const layout = [
    ["coast", "coast", "meadow", "meadow", "field", "field", "grove"],
    ["coast", "meadow", "meadow", "field", "field", "grove", "grove"],
    ["meadow", "meadow", "field", "field", "grove", "grove", "meadow"],
    ["meadow", "field", "field", "grove", "grove", "meadow", "meadow"],
    ["field", "field", "grove", "grove", "meadow", "meadow", "coast"],
  ];

  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const type = layout[r][c];
      row.push({
        c,
        r,
        type,
        typeLabel: TILE_TYPES[type].label,
        building: null,
      });
    }
    tiles.push(row);
  }

  placeStarter("farm", 1, 3);
  placeStarter("housing", 2, 2);
  placeStarter("atelier", 4, 2);
  placeStarter("cafe", 1, 1);
}

function placeStarter(id, c, r) {
  tiles[r][c].building = BUILDINGS[id];
}

function buildUiButtons() {
  buildButtons = Object.values(BUILDINGS).map((building, index) => {
    const x = CANVAS_W - SIDEBAR_W + 22;
    const y = 204 + index * 42;
    return {
      kind: "building",
      id: building.id,
      x,
      y,
      w: 150,
      h: 32,
      label: building.label,
    };
  });

  actionButtons = [
    { id: "build", x: CANVAS_W - SIDEBAR_W + 194, y: 204, w: 144, h: 36, label: "配置する" },
    { id: "tick", x: CANVAS_W - SIDEBAR_W + 194, y: 252, w: 144, h: 36, label: "1か月進める" },
    { id: "event", x: CANVAS_W - SIDEBAR_W + 194, y: 300, w: 144, h: 36, label: "展示を開く" },
  ];
}

function handleButtons() {
  for (const button of buildButtons) {
    if (!contains(mouseX, mouseY, button)) continue;
    selectedBuilding = button.id;
    message = `${BUILDINGS[button.id].label}を選択しました。`;
    return true;
  }

  for (const button of actionButtons) {
    if (!contains(mouseX, mouseY, button)) continue;
    if (button.id === "build") {
      tryBuildSelected();
      return true;
    }
    if (button.id === "tick") {
      advanceMonth();
      return true;
    }
    if (button.id === "event") {
      runExhibition();
      return true;
    }
  }
  return false;
}

function tryBuildSelected() {
  const tile = currentTile();
  if (tile.building) {
    message = "その区画にはすでに建物があります。";
    return;
  }

  const def = BUILDINGS[selectedBuilding];
  if (state.money < def.cost) {
    message = `資金不足です。${def.label}には${def.cost}円相当の資金が必要です。`;
    return;
  }

  tile.building = def;
  state.money -= def.cost;
  message = `${tile.typeLabel}に${def.label}を建てました。`;
  pushLog(`${def.label}を新設。村の表情が少し変わりました。`);
  updateStage();
}

function runExhibition() {
  const galleries = countBuildings("gallery");
  if (galleries === 0) {
    message = "展示にはギャラリーが必要です。";
    return;
  }
  if (state.exhibitionCooldown > 0) {
    message = `展示は準備中です。あと${state.exhibitionCooldown}か月待つ必要があります。`;
    return;
  }
  if (state.money < 12) {
    message = "展示開催には準備資金12が必要です。";
    return;
  }

  const artistBoost = max(1, state.artists);
  const visitorBoost = galleries * 8 + countBuildings("inn") * 4 + countBuildings("cafe") * 3;
  const cultureBoost = galleries * 10 + countBuildings("library") * 3 + artistBoost * 2;
  const incomeBoost = floor(visitorBoost * 0.55) + countBuildings("workshop") * 2;

  state.money += incomeBoost - 12;
  state.culture += cultureBoost;
  state.visitors += visitorBoost;
  state.artists += galleries >= 2 && state.culture >= 60 ? 1 : 0;
  state.exhibitionCooldown = 3;
  message = "展示イベントを開催しました。外から人が集まり、村に熱が生まれました。";
  pushLog(`展示開催: 来訪者+${visitorBoost} / 文化+${cultureBoost} / 収支${incomeBoost - 12 >= 0 ? "+" : ""}${incomeBoost - 12}`);
  updateStage();
}

function advanceMonth() {
  state.month += 1;
  state.season = seasonLabel(state.month);
  if (state.exhibitionCooldown > 0) state.exhibitionCooldown -= 1;

  const delta = simulateMonthlyDelta();
  applyDelta(delta);
  maybeSpawnArtist();
  updateStage();

  state.lastMonthlyDelta = delta;
  message = `${state.month}か月目。${delta.summary}`;
}

function simulateMonthlyDelta() {
  const delta = { money: 0, culture: 0, population: 0, visitors: 0, artists: 0, summary: "" };
  const buildingCounts = {};
  for (const key of Object.keys(BUILDINGS)) buildingCounts[key] = 0;

  for (const row of tiles) {
    for (const tile of row) {
      if (!tile.building) continue;
      const effect = tile.building.effect;
      for (const stat of STATS) delta[stat] += effect[stat] || 0;
      buildingCounts[tile.building.id] += 1;
      applyAdjacencyBonus(tile, delta);
    }
  }

  const localFood = buildingCounts.farm * 3;
  const residentsNeed = max(0, floor(state.population / 8));
  delta.money -= max(2, floor(state.population * 0.12));
  delta.visitors += buildingCounts.gallery + buildingCounts.inn;
  delta.culture += floor((buildingCounts.gallery + buildingCounts.atelier + buildingCounts.library) * 0.5);

  if (localFood >= residentsNeed) {
    delta.population += 2 + floor(buildingCounts.housing / 2);
    delta.culture += 1;
  } else {
    delta.population -= 1;
    delta.money -= 4;
  }

  if (buildingCounts.cafe > 0) {
    delta.money += min(20, floor((state.visitors + delta.visitors) * (0.15 + buildingCounts.cafe * 0.03)));
  }

  if (buildingCounts.gallery > 0 && buildingCounts.atelier > 0) {
    delta.culture += 5;
    delta.visitors += 4;
  }
  if (buildingCounts.library > 0 && buildingCounts.atelier > 0) {
    delta.culture += 3;
  }
  if (buildingCounts.inn > 0 && buildingCounts.gallery > 0) {
    delta.money += 6;
    delta.visitors += 5;
  }
  if (buildingCounts.workshop > 0 && buildingCounts.farm > 0) {
    delta.money += 4;
    delta.culture += 2;
  }

  if (state.stageIndex >= 2) {
    delta.visitors += 3;
    delta.money += 4;
  }

  delta.summary = `資金${signed(delta.money)} / 文化${signed(delta.culture)} / 人口${signed(delta.population)} / 来訪${signed(delta.visitors)}`;
  return delta;
}

function applyAdjacencyBonus(tile, delta) {
  const neighbors = neighboringTiles(tile.c, tile.r);
  if (tile.building.id === "gallery") {
    if (neighbors.some((n) => n.building && n.building.id === "cafe")) {
      delta.money += 2;
      delta.visitors += 2;
    }
    if (neighbors.some((n) => n.building && n.building.id === "inn")) {
      delta.visitors += 3;
    }
  }
  if (tile.building.id === "atelier") {
    if (neighbors.some((n) => n.building && n.building.id === "library")) delta.culture += 2;
    if (neighbors.some((n) => n.building && n.building.id === "housing")) delta.population += 1;
  }
  if (tile.building.id === "workshop") {
    if (neighbors.some((n) => n.building && n.building.id === "gallery")) delta.culture += 1;
  }
  if (tile.building.id === "farm") {
    if (tile.type === "coast") delta.visitors += 1;
    if (neighbors.some((n) => n.building && n.building.id === "cafe")) delta.money += 1;
  }
}

function maybeSpawnArtist() {
  const atelierCount = countBuildings("atelier");
  const libraryCount = countBuildings("library");
  const housingCount = countBuildings("housing");
  const thresholdMet = state.culture >= 50 && atelierCount >= 1 && (libraryCount >= 1 || housingCount >= 2);
  if (!thresholdMet) return;

  const chance = 0.18 + atelierCount * 0.05 + libraryCount * 0.04 + min(0.18, state.visitors / 500);
  if (random() < chance) {
    state.artists += 1;
    state.culture += 4;
    pushLog("新しいアーティストが移り住みました。創作の気配が濃くなっています。");
    message = "アーティストがこの村に拠点を構えました。";
  }
}

function applyDelta(delta) {
  for (const stat of STATS) {
    state[stat] += delta[stat] || 0;
    state[stat] = max(0, floor(state[stat]));
  }
}

function updateStage() {
  let nextIndex = 0;
  for (let i = 0; i < STAGE_DEFS.length; i++) {
    if (meetsNeeds(STAGE_DEFS[i].needs)) nextIndex = i;
  }
  if (nextIndex > state.stageIndex) {
    state.stageIndex = nextIndex;
    pushLog(`発展段階が「${STAGE_DEFS[nextIndex].label}」になりました。`);
    message = `${STAGE_DEFS[nextIndex].label}へ発展しました。`;
  } else {
    state.stageIndex = nextIndex;
  }
}

function meetsNeeds(needs) {
  return state.culture >= needs.culture &&
    state.population >= needs.population &&
    state.artists >= needs.artists &&
    state.visitors >= needs.visitors;
}

function drawBackground() {
  background("#f3eddc");
  noStroke();
  fill(184, 221, 214, 160);
  ellipse(170, 84, 240, 140);
  fill(217, 232, 188, 140);
  ellipse(520, 74, 360, 180);
  fill(130, 170, 122, 64);
  for (let i = 0; i < 8; i++) {
    ellipse(80 + i * 118, 118 + sin(frameCount * 0.01 + i) * 6, 160, 58);
  }
}

function drawHeader() {
  fill(255, 248, 239, 220);
  noStroke();
  rect(18, 18, width - 36, HEADER_H, 24);

  fill("#263326");
  textAlign(LEFT, TOP);
  textSize(28);
  text("糸島 芸術村シミュレーター", 36, 34);
  textSize(13);
  fill("#53624f");
  text("文化と生活が循環する小さな町を育てるプロトタイプ", 38, 70);

  const cards = [
    { label: "資金", value: state.money, x: 36 },
    { label: "文化", value: state.culture, x: 146 },
    { label: "人口", value: state.population, x: 256 },
    { label: "来訪者", value: state.visitors, x: 366 },
    { label: "アーティスト", value: state.artists, x: 496 },
  ];

  for (const card of cards) drawStatCard(card.x, 86, 96, 30, card.label, card.value);

  textAlign(RIGHT, TOP);
  textSize(14);
  fill("#445842");
  text(`${state.month}か月目 / ${state.season} / ${STAGE_DEFS[state.stageIndex].label}`, width - 44, 38);
  text(`展示クールダウン: ${state.exhibitionCooldown}`, width - 44, 62);
}

function drawStatCard(x, y, w, h, label, value) {
  fill(245, 242, 228);
  stroke(114, 136, 102, 50);
  rect(x, y, w, h, 14);
  noStroke();
  fill("#617358");
  textSize(11);
  textAlign(LEFT, CENTER);
  text(label, x + 10, y + h / 2);
  fill("#223123");
  textAlign(RIGHT, CENTER);
  textSize(14);
  text(value, x + w - 10, y + h / 2);
}

function drawGrid() {
  for (const row of tiles) {
    for (const tile of row) drawTile(tile);
  }
}

function drawTile(tile) {
  const x = GRID_X + tile.c * TILE_SIZE;
  const y = GRID_Y + tile.r * TILE_SIZE;
  const isSelected = selectedTile.c === tile.c && selectedTile.r === tile.r;
  const isHovered = hoveredTile && hoveredTile.c === tile.c && hoveredTile.r === tile.r;

  stroke(isSelected ? "#38503a" : "rgba(60, 82, 56, 0.14)");
  strokeWeight(isSelected ? 3 : 1);
  fill(TILE_TYPES[tile.type].color);
  rect(x, y, TILE_SIZE - 10, TILE_SIZE - 10, 22);

  if (tile.type === "coast") {
    noFill();
    stroke(255, 255, 255, 120);
    for (let i = 0; i < 3; i++) {
      arc(x + 26 + i * 14, y + 58, 18, 10, PI, TWO_PI);
    }
  }

  if (tile.building) {
    drawBuildingGlyph(tile, x, y);
  } else {
    noStroke();
    fill(255, 255, 255, 110);
    rect(x + 12, y + 12, TILE_SIZE - 34, TILE_SIZE - 34, 16);
    fill("#6f8365");
    textAlign(CENTER, CENTER);
    textSize(16);
    text("空き地", x + (TILE_SIZE - 10) / 2, y + (TILE_SIZE - 10) / 2);
  }

  noStroke();
  fill("#4d6048");
  textAlign(LEFT, TOP);
  textSize(11);
  text(tile.typeLabel, x + 10, y + 8);

  if (isHovered) {
    noFill();
    stroke(59, 107, 85, 170);
    strokeWeight(2);
    rect(x + 4, y + 4, TILE_SIZE - 18, TILE_SIZE - 18, 18);
  }
}

function drawBuildingGlyph(tile, x, y) {
  const building = tile.building;
  noStroke();
  fill(building.color);
  rect(x + 14, y + 22, TILE_SIZE - 38, TILE_SIZE - 44, 16);
  fill(255, 250, 244, 230);
  textAlign(CENTER, CENTER);
  textSize(26);
  text(building.short, x + (TILE_SIZE - 10) / 2, y + 44);
  textSize(12);
  text(building.label, x + (TILE_SIZE - 10) / 2, y + 68);
}

function drawSidebar() {
  const x = width - SIDEBAR_W + 10;
  const y = 138;
  fill(255, 250, 243, 232);
  noStroke();
  rect(x, y, SIDEBAR_W - 28, 430, 24);

  fill("#283529");
  textAlign(LEFT, TOP);
  textSize(18);
  text("建物と運営", x + 18, y + 16);
  textSize(12);
  fill("#667463");
  text("文化、交流、暮らしの循環を作ります。", x + 18, y + 42);

  for (const button of buildButtons) drawBuildingButton(button);
  for (const button of actionButtons) drawActionButton(button);

  const tile = currentTile();
  const detailY = y + 356;
  fill("#314131");
  textSize(15);
  text("選択中の区画", x + 18, detailY);
  textSize(12);
  fill("#61705d");
  text(`${tile.typeLabel} (${tile.c + 1}, ${tile.r + 1})`, x + 18, detailY + 24);
  text(tile.building ? tile.building.label : "空き地", x + 18, detailY + 42);

  const selectedDef = BUILDINGS[selectedBuilding];
  fill("#314131");
  textSize(15);
  text("選択中の建物", x + 18, detailY + 78);
  textSize(12);
  fill("#61705d");
  text(`${selectedDef.label} / コスト ${selectedDef.cost}`, x + 18, detailY + 102);
  text(selectedDef.desc, x + 18, detailY + 122, SIDEBAR_W - 70, 54);

  drawStagePanel(x, y + 448, SIDEBAR_W - 28, 120);
}

function drawBuildingButton(button) {
  const active = selectedBuilding === button.id;
  fill(active ? "#6f8d5c" : "#efe7d7");
  stroke(active ? "#3f5635" : "rgba(63, 86, 53, 0.12)");
  rect(button.x, button.y, button.w, button.h, 14);
  noStroke();
  fill(active ? "#fffdf7" : "#334132");
  textAlign(LEFT, CENTER);
  textSize(12);
  text(button.label, button.x + 12, button.y + button.h / 2);
  textAlign(RIGHT, CENTER);
  text(BUILDINGS[button.id].cost, button.x + button.w - 10, button.y + button.h / 2);
}

function drawActionButton(button) {
  const disabled = button.id === "event" && countBuildings("gallery") === 0;
  fill(disabled ? "#ddd7ca" : "#d4e0bf");
  stroke(disabled ? "rgba(80,80,80,0.08)" : "rgba(57, 84, 49, 0.14)");
  rect(button.x, button.y, button.w, button.h, 14);
  noStroke();
  fill(disabled ? "#8f9188" : "#314131");
  textAlign(CENTER, CENTER);
  textSize(12);
  text(button.label, button.x + button.w / 2, button.y + button.h / 2);
}

function drawStagePanel(x, y, w, h) {
  fill(252, 246, 235, 238);
  noStroke();
  rect(x, y, w, h, 22);
  fill("#2f3d2f");
  textAlign(LEFT, TOP);
  textSize(16);
  text("発展段階", x + 18, y + 14);
  textSize(13);
  fill("#5f6e59");
  text(STAGE_DEFS[state.stageIndex].label, x + 18, y + 42);
  const nextStage = STAGE_DEFS[min(STAGE_DEFS.length - 1, state.stageIndex + 1)];
  if (nextStage === STAGE_DEFS[state.stageIndex]) {
    text("最終段階に到達済み", x + 18, y + 68);
    return;
  }
  text(`次: ${nextStage.label}`, x + 18, y + 68);
  text(stageNeedText(nextStage.needs), x + 18, y + 88, w - 36, 28);
}

function drawFooter() {
  const y = height - FOOTER_H + 8;
  fill(255, 249, 240, 232);
  noStroke();
  rect(18, y, width - 36, FOOTER_H - 18, 22);

  fill("#2c3a2d");
  textAlign(LEFT, TOP);
  textSize(14);
  text("メッセージ", 36, y + 14);
  textSize(13);
  fill("#586656");
  text(message, 36, y + 40, width - 72, 24);

  fill("#2c3a2d");
  textSize(13);
  text("今月の変動", 36, y + 72);
  fill("#586656");
  const summary = state.lastMonthlyDelta ? state.lastMonthlyDelta.summary : "まだ月次処理を進めていません。";
  text(summary, 126, y + 72);

  fill("#2c3a2d");
  text("最近の動き", 36, y + 94);
  fill("#586656");
  text(state.log.slice(-2).join(" / "), 126, y + 94, width - 180, 20);
}

function drawStageNeedText(needs) {
  return `文化${state.culture}/${needs.culture} 人口${state.population}/${needs.population} 来訪${state.visitors}/${needs.visitors} 作家${state.artists}/${needs.artists}`;
}

function currentTile() {
  return tiles[selectedTile.r][selectedTile.c];
}

function pickTile(mx, my) {
  for (const row of tiles) {
    for (const tile of row) {
      const x = GRID_X + tile.c * TILE_SIZE;
      const y = GRID_Y + tile.r * TILE_SIZE;
      if (mx >= x && mx <= x + TILE_SIZE - 10 && my >= y && my <= y + TILE_SIZE - 10) return tile;
    }
  }
  return null;
}

function neighboringTiles(c, r) {
  const offsets = [
    [0, -1], [1, 0], [0, 1], [-1, 0],
  ];
  const result = [];
  for (const [dc, dr] of offsets) {
    const nc = c + dc;
    const nr = r + dr;
    if (nc < 0 || nc >= GRID_COLS || nr < 0 || nr >= GRID_ROWS) continue;
    result.push(tiles[nr][nc]);
  }
  return result;
}

function countBuildings(id) {
  let count = 0;
  for (const row of tiles) {
    for (const tile of row) {
      if (tile.building && tile.building.id === id) count += 1;
    }
  }
  return count;
}

function seasonLabel(month) {
  const index = (month - 1) % 12;
  if (index <= 1) return "春";
  if (index <= 4) return "初夏";
  if (index <= 7) return "夏";
  if (index <= 9) return "秋";
  return "冬";
}

function mouseInGrid() {
  return mouseX >= GRID_X &&
    mouseX <= GRID_X + GRID_COLS * TILE_SIZE &&
    mouseY >= GRID_Y &&
    mouseY <= GRID_Y + GRID_ROWS * TILE_SIZE;
}

function contains(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

function signed(value) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function pushLog(entry) {
  state.log.push(entry);
  if (state.log.length > 8) state.log.shift();
}
