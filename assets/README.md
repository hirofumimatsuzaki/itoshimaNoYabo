# Art Asset Slots

このディレクトリは、手描きフォールバックを置き換えるための画像差し込み口です。

## 現在入っている画像

- `terrain-sea.png`
- `terrain-plains.png`
- `terrain-mountain.png`
- `structure-sheet.png`
- `structure-castle.png`
- `structure-shrine.png`
- `structure-temple.png`
- `structure-port.png`
- `structure-mountain.png`
- `structure-workshop.png`
- `structure-workshop-fablab.png`
- `structure-workshop-washi.png`
- `structure-workshop-pottery.png`
- `event-castle-fall.png`

## 想定ファイル

- `terrain-sea.png`
- `terrain-plains.png`
- `terrain-mountain.png`
- `structure-port.png`
- `structure-castle.png`
- `structure-shrine.png`
- `structure-temple.png`
- `structure-workshop.png`
- `structure-workshop-fablab.png`
- `structure-workshop-washi.png`
- `structure-workshop-pottery.png`
- `structure-mountain.png`

## 使い方

- ファイルが存在すれば `sketch.js` が自動で読み込みます。
- ファイルが無ければ現在の p5 手描き描画に戻ります。
- 推奨形式は `png` か `webp`、透過あり、1枚ごとの長辺は `1024px` 前後です。
- 地形画像はヘックス形状にクリップされます。
- 建物画像は中央下寄せで配置されるので、被写体は画像下側に寄せてください。

## 差し替え方

- 同名で上書きするだけで反映されます。
- 建物ごとに別絵を使いたい場合は、`ART_SPRITES` にキーを追加してください。
