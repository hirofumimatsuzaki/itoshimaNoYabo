# Art Asset Slots

このディレクトリは、手描きフォールバックを置き換えるための画像差し込み口です。

## 想定ファイル

- `terrain-sea.webp`
- `terrain-plains.webp`
- `terrain-mountain.webp`
- `structure-port.webp`
- `structure-castle.webp`
- `structure-shrine.webp`
- `structure-temple.webp`
- `structure-workshop.webp`
- `structure-workshop-fablab.webp`
- `structure-workshop-washi.webp`
- `structure-workshop-pottery.webp`
- `structure-mountain.webp`

## 使い方

- ファイルが存在すれば `sketch.js` が自動で読み込みます。
- ファイルが無ければ現在の p5 手描き描画に戻ります。
- 推奨形式は `webp`、透過あり、1枚ごとの長辺は `1024px` 前後です。
- 地形画像はヘックス形状にクリップされます。
- 建物画像は中央下寄せで配置されるので、被写体は画像下側に寄せてください。

## 差し替え方

- 同名で上書きするだけで反映されます。
- 建物ごとに別絵を使いたい場合は、`ART_SPRITES` にキーを追加してください。
