# 画像ディレクトリ

このディレクトリには、アプリで使用する画像ファイルを配置します。

## ディレクトリ構成

- `products/` - 商品の画像（サムネイル、詳細画像など）
- `makers/` - 作り手の方々のプロフィール画像
- `stories/` - Stories（動画ページ）で使用する画像や動画
- `common/` - 共通で使用する画像（ロゴ、アイコンなど）

## 使い方

Viteでは、`public`ディレクトリ内のファイルはそのままルートパスで参照できます。

例：
- `public/images/products/vase.jpg` → `/images/products/vase.jpg` で参照
- `<img src="/images/products/vase.jpg" alt="花瓶" />`

## 推奨サイズ・形式

- **商品画像**: 1200x1600px 推奨（アスペクト比 3:4）
- **作り手画像**: 400x400px 推奨（正方形）
- **Stories動画**: MP4形式、縦型（9:16）推奨
- **形式**: JPG, PNG, WebP

