/* ============================================================
   名づけ帖 — 姓名判断ツール ロジック
   外格 = 天格 + 地格 − 人格（霊数は天格・地格に算入、総格には不算入）
   ============================================================ */

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];

/* 文字列を1文字ずつ（サロゲートペア対応） */
function chars(str){ return [...str.trim()].filter(c => c.trim() !== ""); }

/* 吉凶 → CSSクラス */
function luckClass(type){
  return { "大吉":"daikichi", "吉":"kichi", "半吉":"hankichi", "凶":"kyou" }[type] || "kyou";
}

/* 入力欄から各文字の画数を集める。未登録は manual から補完。不足なら null */
function collectStrokes(text, manualMap){
  return chars(text).map(ch => {
    if (manualMap[ch] != null && manualMap[ch] !== "") return { ch, n: Number(manualMap[ch]), src:"manual" };
    if (KANJI[ch] != null) return { ch, n: KANJI[ch], src:"dict" };
    return { ch, n: null, src:"unknown" };
  });
}

/* 未登録文字に対する手動入力UIを描画 */
function renderManualInputs(){
  const sei = chars($("#in-sei").value);
  const mei = chars($("#in-mei").value);
  const box = $("#manual-area");
  const need = [];
  [...sei, ...mei].forEach(ch => {
    if (KANJI[ch] == null && !need.includes(ch)) need.push(ch);
  });
  if (need.length === 0){ box.innerHTML = ""; return; }
  box.innerHTML = `<div class="manual-strokes">
    <p style="font-size:.86rem;color:var(--ink-soft);margin:4px 0 8px;">
      辞書に無い文字の画数を入力してください（伝統流派は旧字体で数えます）：</p>
    ${need.map(ch => `
      <div class="mrow">
        <span class="ch">${ch}</span>
        <span>の画数：</span>
        <input type="number" min="1" max="40" data-ch="${ch}"
               value="${(window.__manual&&window.__manual[ch])||""}" />
        <span>画</span>
      </div>`).join("")}
  </div>`;
  $$('#manual-area input[type=number]').forEach(inp => {
    inp.addEventListener("input", () => {
      window.__manual = window.__manual || {};
      window.__manual[inp.dataset.ch] = inp.value;
    });
  });
}

/* メイン計算 */
function compute(){
  const manual = window.__manual || {};
  const sei = collectStrokes($("#in-sei").value, manual);
  const mei = collectStrokes($("#in-mei").value, manual);

  if (sei.length === 0 || mei.length === 0){
    alert("姓と名を両方入力してください。");
    return;
  }
  const unknown = [...sei, ...mei].filter(x => x.n == null || isNaN(x.n));
  if (unknown.length){
    renderManualInputs();
    alert("画数が分からない文字があります。下の欄に画数を入力してください：" + unknown.map(x=>x.ch).join("、"));
    return;
  }

  // 霊数（一字姓 → 姓側に1、一字名 → 名側に1）
  const seiN = sei.map(x=>x.n);
  const meiN = mei.map(x=>x.n);
  const reiSei = seiN.length === 1;
  const reiMei = meiN.length === 1;

  const sumSei = seiN.reduce((a,b)=>a+b,0);
  const sumMei = meiN.reduce((a,b)=>a+b,0);

  const ten  = sumSei + (reiSei ? 1 : 0);              // 天格
  const chi  = sumMei + (reiMei ? 1 : 0);              // 地格
  const jin  = seiN[seiN.length-1] + meiN[0];          // 人格
  const sou  = sumSei + sumMei;                        // 総格（霊数なし）
  const gai  = ten + chi - jin;                        // 外格

  renderResult({
    seiStr: sei.map(x=>x.ch).join(""),
    meiStr: mei.map(x=>x.ch).join(""),
    reading: $("#in-yomi").value.trim(),
    ten, jin, chi, gai, sou, reiSei, reiMei
  });
}

function luckBadge(n){
  const [type, mean] = LUCK81[((n-1)%81)+1] || ["凶",""];
  return { type, mean, cls: luckClass(type) };
}

function renderResult(d){
  const cards = [
    ["天格", d.ten, "家系から受け継ぐ運（参考）"],
    ["人格", d.jin, "性格・才能・中年期の中心 ★最重要"],
    ["地格", d.chi, "幼少〜青年期・基礎"],
    ["外格", d.gai, "対人・社会運"],
    ["総格", d.sou, "人生全体・晩年運 ★重要"]
  ];

  // 五格グリッド
  $("#name-display").textContent = d.seiStr + d.meiStr;
  $("#name-reading").textContent = d.reading ? `（${d.reading}）` : "";

  $("#gokaku-grid").innerHTML = cards.map(([name,n])=>{
    const b = luckBadge(n);
    return `<div class="gokaku">
      <div class="gname">${name}</div>
      <div class="gnum t-${b.cls}">${n}</div>
      <span class="gbadge b-${b.cls}">${b.type}</span>
    </div>`;
  }).join("");

  // 詳細
  $("#gokaku-detail").innerHTML = cards.map(([name,n,desc])=>{
    const b = luckBadge(n);
    return `<div class="drow">
      <span class="dk">${name}</span>
      <span class="dnum">${n}画 <b class="t-${b.cls}">${b.type}</b></span>
      <span class="dmean">${b.mean}／${desc}</span>
    </div>`;
  }).join("");

  // 三才（天・人・地の五行）
  const g = [gogyoOf(d.ten), gogyoOf(d.jin), gogyoOf(d.chi)];
  let rel;
  const sou1 = isSousei(g[0],g[1]) || g[0]===g[1];
  const sou2 = isSousei(g[1],g[2]) || g[1]===g[2];
  if (sou1 && sou2) rel = "相生・比和でつながり、気がよく巡る理想的な並び ◎";
  else if (isSoukoku(g[0],g[1]) && isSoukoku(g[1],g[2])) rel = "剋が重なる並び。各格の吉凶で総合判断を △";
  else rel = "一部に剋を含むが概ね良好な並び ○";
  $("#sanzai").innerHTML = `三才配置（天-人-地の五行）：<b>${g.join(" - ")}</b>　${rel}`;

  // 総合コメント（人格・総格を最重視）
  const jb = luckBadge(d.jin), sb = luckBadge(d.sou);
  const all = [d.ten,d.jin,d.chi,d.gai,d.sou].map(luckBadge);
  const kyouCount = all.filter(b=>b.type==="凶").length;
  let verdict, vclass;
  if (kyouCount===0){ verdict="五格すべてが吉以上。バランスの取れた良い画数構成です。"; vclass="daikichi"; }
  else if (["大吉","吉"].includes(jb.type) && ["大吉","吉"].includes(sb.type)){
    verdict=`最重要の人格・総格がともに吉。${kyouCount}つの格に弱点がありますが、合格ラインの構成です。`; vclass="kichi";
  } else if (["大吉","吉"].includes(jb.type) || ["大吉","吉"].includes(sb.type)){
    verdict="人格か総格の一方に弱点があります。気になる場合は止め字の画数調整を検討すると良いでしょう。"; vclass="hankichi";
  } else {
    verdict="最重要の人格・総格に弱点があります。画数の組み合わせを見直す余地があります。"; vclass="kyou";
  }
  $("#verdict").innerHTML = `<h4 class="t-${vclass}">総合：${jb.type==="凶"||sb.type==="凶"?"要検討":"良好"}</h4><p>${verdict}</p>`;

  let reiNote = "";
  if (d.reiSei || d.reiMei){
    reiNote = `※ ${d.reiSei?"一字姓":""}${d.reiSei&&d.reiMei?"・":""}${d.reiMei?"一字名":""}のため、霊数（仮の1画）を加えて計算しています。`;
  }
  $("#rei-note").textContent = reiNote;

  $("#result").classList.add("show");
  $("#result").scrollIntoView({ behavior:"smooth", block:"start" });
}

/* イベント */
document.addEventListener("DOMContentLoaded", () => {
  window.__manual = {};
  ["#in-sei","#in-mei"].forEach(sel => $(sel).addEventListener("input", renderManualInputs));
  $("#calc-btn").addEventListener("click", compute);
  // サンプル
  $$("[data-sample]").forEach(b => b.addEventListener("click", () => {
    const [s,m,y] = b.dataset.sample.split("|");
    $("#in-sei").value=s; $("#in-mei").value=m; $("#in-yomi").value=y||"";
    renderManualInputs(); compute();
  }));
});
