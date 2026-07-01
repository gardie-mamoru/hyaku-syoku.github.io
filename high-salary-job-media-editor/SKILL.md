---
name: high-salary-job-media-editor
description: >-
  20代・第二新卒向けの「高年収求人トレンドメディア」運営を半自動化するSkill。
  公開されている求人情報をもとに、求人票をそのまま転載せず、キャリア解説コンテンツ（X投稿・
  Instagramカルーセル・LINE誘導文）に変換する。求人探索・求人スコアリング・求人票の読み解き・
  投稿原稿生成・職務経歴書アドバイスの整理・投稿前リスクチェックを扱う。
  「求人を探して」「この求人を投稿にして」「今週の投稿を決めて」「投稿前チェックして」などの
  依頼で使用する。
---

# High-Salary Job Media Editor Skill

## このSkillの役割

公開されている求人情報を素材に、**求人票をそのまま転載せず**、20代・第二新卒向けの
「キャリア解説コンテンツ」に変換するためのSkillです。

このメディアは **「求人紹介」ではなく「求人票の読み解き」** として運用します。
求職者を企業に紹介・推薦・応募代行することは一切しません（職業紹介事業にあたる行為を避けます）。

## いつ使うか（トリガー）

以下のような依頼のときにこのSkillを使ってください。

- 「高年収の求人を探して」「求人候補をリストにして」
- 「この求人をX投稿にして」「Instagramカルーセルの原稿を作って」
- 「LINE誘導文を書いて」
- 「この求人をスコアリングして」
- 「求人票を読み解いて、注目ポイントと注意点を整理して」
- 「職務経歴書で強調すべきポイントを教えて」
- 「今週の投稿計画を立てて」
- 「投稿前のリスクチェックをして」

## このSkillが扱う8つの機能

1. **求人探索** — ログイン不要の公開求人から高年収候補を探す（→ `prompts/job-research-agent.md`）
2. **求人スコアリング** — 100点満点で投稿価値を評価する（→ `references/job-scoring-rubric.md`）
3. **求人票の読み解き** — 転載せず、注目ポイント・注意点・向いている人を独自分析する
4. **X投稿生成** — 単発投稿／スレッド（→ `references/post-templates.md`）
5. **Instagramカルーセル原稿生成** — 5枚／7枚構成
6. **LINE誘導文生成** — 公式LINEへの導線
7. **職務経歴書で強調すべきポイントの整理** — 応募者視点でのキャリアの棚卸し
8. **投稿前リスクチェック** — 法務・規約リスクの最終確認（→ `references/legal-risk-checklist.md`）

## 基本ワークフロー

```
① 求人探索        prompts/job-research-agent.md をChrome/Agent Browserで実行
        ↓        （URL・企業名・職種・年収レンジ・注目点・注意点だけを要約）
② 台帳に転記      references/google-sheets-schema.md の列定義でGoogle Sheetsに記録
        ↓
③ 投稿変換        prompts/job-analysis-to-post.md で1件を投稿原稿一式に変換
        ↓        （スコアリング＋読み解き＋X/IG/LINE原稿＋職経アドバイス）
④ 投稿前チェック  references/legal-risk-checklist.md でリスク確認
        ↓
⑤ 週次運用        prompts/weekly-operation.md で今週の5〜7件と投稿順を決定
```

## 必ず守る前提（詳細は references/ を参照）

- **求人票の本文をそのままコピーしない。** 要約と独自分析だけを扱う。
- **出典URLと確認日を必ず記録する。**
- **ログインが必要な求人は扱わない。** 公開ページのみ。
- **推薦・紹介・応募代行・面談調整をしない。** 職業紹介に見える表現を避ける。
- **高年収を煽りすぎない。** 断定・誇大表現を避け、条件と注意点を併記する。
- **企業ロゴ・企業の画像を使わない。**

## 参照ファイル

| ファイル | 用途 |
| --- | --- |
| `references/editorial-policy.md` | 編集方針・トーン・表現ルール |
| `references/legal-risk-checklist.md` | 法務・規約リスクの回避チェックリスト |
| `references/job-scoring-rubric.md` | 求人100点満点スコアリング基準 |
| `references/post-templates.md` | X／Instagram／LINEの投稿テンプレート |
| `references/google-sheets-schema.md` | 求人台帳（Google Sheets）の列定義 |
| `prompts/job-research-agent.md` | 求人探索用（Claude in Chrome / Agent Browser） |
| `prompts/job-analysis-to-post.md` | 1件の求人 → 投稿一式への変換 |
| `prompts/weekly-operation.md` | 週次の投稿選定・運用計画 |

## 運用スタック（PoC段階）

管理画面やWebアプリは作りません。当面は次の組み合わせで運用します。

- **Claude Skill / Claude Project** … 本Skill一式
- **Claude in Chrome / Agent Browser** … 求人探索
- **Google Sheets** … 求人台帳
- **Canva** … Instagramカルーセルのデザイン
- **LINE公式** … 読者との接点・配信
