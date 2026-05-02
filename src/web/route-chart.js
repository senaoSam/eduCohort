import { rocAcademicYearFromSeptWesternYear } from "../cohort.js";



/**

 * @param {string} label 供 aria；showStageLabel 為 false 時主標不顯示階段名

 * @param {{ showStageLabel?: boolean; leaf?: boolean }} opts

 */

function segEl(label, years, westernSeptYear, kind, opts = {}) {

  const { showStageLabel = true, leaf = false } = opts;

  const r = rocAcademicYearFromSeptWesternYear(westernSeptYear);

  const el = document.createElement("div");

  el.className = `route-seg route-seg--${kind}${leaf ? " route-seg--leaf" : ""}`;

  const title = document.createElement("strong");

  title.textContent = showStageLabel ? `${label} · ${years}年` : `${years}年`;

  el.appendChild(title);

  const y1 = document.createElement("span");

  y1.className = "route-seg-year";

  y1.textContent = `${r}(${westernSeptYear})`;

  el.appendChild(y1);

  const y2 = document.createElement("span");

  y2.className = "route-seg-meta";

  y2.textContent = "9月入學";

  el.appendChild(y2);

  return el;

}



/** 國中小後：上分「三年段」、下分「五年段」 */

function forkSvgThreeVsFive() {

  const ns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");

  svg.setAttribute("class", "route-flow-fork-svg");

  svg.setAttribute("viewBox", "0 0 48 100");

  svg.setAttribute("preserveAspectRatio", "none");

  svg.setAttribute("aria-hidden", "true");

  const g = document.createElementNS(ns, "g");

  g.setAttribute("fill", "none");

  g.setAttribute("stroke", "currentColor");

  g.setAttribute("stroke-linecap", "round");

  g.setAttribute("stroke-linejoin", "round");

  /* 主幹在 viewBox 水平中央 (x≈24)，垂直 50% 對齊左欄卡片垂直中心 */
  const paths = ["M 2,50 H 24", "M 24,30 V 72", "M 24,30 H 46", "M 24,72 H 46"];

  for (const d of paths) {

    const p = document.createElementNS(ns, "path");

    p.setAttribute("d", d);

    g.appendChild(p);

  }

  svg.appendChild(g);

  return svg;

}



/** 三年共用節點後：二分至大學／四技（普高） */

function forkSvgDualLeaves() {

  const ns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");

  svg.setAttribute("class", "route-flow-fork-svg route-flow-fork-svg--dual");

  svg.setAttribute("viewBox", "0 0 44 100");

  svg.setAttribute("preserveAspectRatio", "none");

  svg.setAttribute("aria-hidden", "true");

  const g = document.createElementNS(ns, "g");

  g.setAttribute("fill", "none");

  g.setAttribute("stroke", "currentColor");

  g.setAttribute("stroke-linecap", "round");

  g.setAttribute("stroke-linejoin", "round");

  /* 樞紐置中 (x=22)，岔開高度對齊上下兩列葉節點 */
  const paths = ["M 2,50 H 22", "M 22,31 V 69", "M 22,31 H 42", "M 22,69 H 42"];

  for (const d of paths) {

    const p = document.createElementNS(ns, "path");

    p.setAttribute("d", d);

    g.appendChild(p);

  }

  svg.appendChild(g);

  return svg;

}



/** @param {object} data computeCohort 回傳物件 */

export function renderRouteChart(container, data) {

  const e = data.elementaryGrade1.westernSeptYear;

  const j = data.juniorHighGrade1.westernSeptYear;

  const hi = data.afterJuniorHigh.seniorHighGrade1.westernSeptYear;

  const fj = data.afterJuniorHigh.fiveYearJuniorCollegeGrade1.westernSeptYear;

  const u = data.universityFromSeniorHigh;

  const tt = data.twoYearTechFromFiveYearCollege;



  const re = rocAcademicYearFromSeptWesternYear(e);

  const rj = rocAcademicYearFromSeptWesternYear(j);

  const rThree = rocAcademicYearFromSeptWesternYear(hi);



  const threeYearLeaves = [

    {

      segment: ["大學", 4, u.universityYear1.westernSeptYear, "degree4"],

      grad: u.universityGraduation.label,

      aria: "大學四年取得學士",

    },

    {

      segment: ["四技", 4, u.fourTechYear1FromSeniorHigh.westernSeptYear, "degree4"],

      grad: u.fourTechGraduationFromSeniorHigh.label,

      aria: "高中後四技四年取得學士",

    },

  ];



  const fiveYearSegments = [

    ["五專", 5, fj, "five"],

    ["二技", 2, tt.twoTechYear1.westernSeptYear, "two"],

  ];



  const card = document.createElement("div");

  card.className = "card route-chart-card";

  const flow = document.createElement("div");

  flow.className = "route-flow";



  const commonWrap = document.createElement("div");

  commonWrap.className = "route-flow-common";



  const commonCard = document.createElement("div");

  commonCard.className = "route-flow-common-card";

  commonCard.setAttribute("role", "group");

  commonCard.setAttribute("aria-label", "國小六年、國中三年（各線相同）");



  const ct = document.createElement("div");

  ct.className = "route-flow-common-title";

  ct.textContent = "國中小";

  commonCard.appendChild(ct);



  const line1 = document.createElement("div");

  line1.className = "route-flow-common-line";

  line1.appendChild(document.createTextNode(`國小 · 6年`));

  commonCard.appendChild(line1);

  const meta1 = document.createElement("div");

  meta1.className = "route-flow-common-meta";

  meta1.textContent = `${re}(${e}) 9月`;

  commonCard.appendChild(meta1);



  const line2 = document.createElement("div");

  line2.className = "route-flow-common-line";

  line2.appendChild(document.createTextNode(`國中 · 3年`));

  commonCard.appendChild(line2);

  const meta2 = document.createElement("div");

  meta2.className = "route-flow-common-meta";

  meta2.textContent = `${rj}(${j}) 9月`;

  commonCard.appendChild(meta2);



  commonWrap.appendChild(commonCard);

  flow.appendChild(commonWrap);



  const forkWrap = document.createElement("div");

  forkWrap.className = "route-flow-fork";

  forkWrap.appendChild(forkSvgThreeVsFive());

  flow.appendChild(forkWrap);



  const tree = document.createElement("div");

  tree.className = "route-flow-tree";



  const clusterThree = document.createElement("div");

  clusterThree.className = "route-cluster route-cluster--three";

  clusterThree.setAttribute("role", "group");

  clusterThree.setAttribute("aria-label", "國中畢業後三年段（高中／高職）");



  const innerThree = document.createElement("div");

  innerThree.className = "route-cluster-inner";



  const sharedThree = document.createElement("div");

  sharedThree.className = "route-shared-stage-card";

  sharedThree.setAttribute("role", "group");

  sharedThree.setAttribute("aria-label", "高中或高職三年");

  const stTitle = document.createElement("div");

  stTitle.className = "route-shared-stage-title";

  stTitle.textContent = "三年";

  sharedThree.appendChild(stTitle);

  const stSub = document.createElement("div");

  stSub.className = "route-shared-stage-sub";

  stSub.textContent = "高中／高職等";

  sharedThree.appendChild(stSub);

  const stMeta = document.createElement("div");

  stMeta.className = "route-shared-stage-meta";

  stMeta.textContent = `${rThree}(${hi}) 9月`;

  sharedThree.appendChild(stMeta);

  innerThree.appendChild(sharedThree);



  const forkNested = document.createElement("div");

  forkNested.className = "route-flow-fork route-flow-fork--nested";

  forkNested.appendChild(forkSvgDualLeaves());

  innerThree.appendChild(forkNested);



  for (const leaf of threeYearLeaves) {

    const leafRow = document.createElement("div");

    leafRow.className = "route-leaf-row";



    const bar = document.createElement("div");

    bar.className = "route-track-bar route-track-bar--single";

    bar.setAttribute("role", "img");

    bar.setAttribute("aria-label", leaf.aria);

    const [label, years, wy, kind] = leaf.segment;

    bar.appendChild(segEl(label, years, wy, kind, { showStageLabel: true, leaf: true }));



    const grad = document.createElement("div");

    grad.className = "route-track-grad";

    grad.textContent = leaf.grad;



    leafRow.appendChild(bar);

    leafRow.appendChild(grad);

    innerThree.appendChild(leafRow);

  }



  clusterThree.appendChild(innerThree);

  tree.appendChild(clusterThree);



  const clusterFive = document.createElement("div");

  clusterFive.className = "route-cluster route-cluster--five";

  clusterFive.setAttribute("role", "group");

  clusterFive.setAttribute("aria-label", "五專五年後二技二年");



  const rowFive = document.createElement("div");

  rowFive.className = "route-flow-row route-flow-row--five";



  const barFive = document.createElement("div");

  barFive.className = "route-track-bar";

  barFive.style.gridTemplateColumns = `repeat(${fiveYearSegments.length}, minmax(0, 1fr))`;

  barFive.setAttribute("role", "img");

  barFive.setAttribute("aria-label", "五專五年、二技二年");

  for (const [label, years, wy, kind] of fiveYearSegments) {

    barFive.appendChild(segEl(label, years, wy, kind, { showStageLabel: true, leaf: true }));

  }

  rowFive.appendChild(barFive);



  const gradFive = document.createElement("div");

  gradFive.className = "route-track-grad";

  gradFive.textContent = tt.twoTechGraduation.label;

  rowFive.appendChild(gradFive);



  clusterFive.appendChild(rowFive);

  tree.appendChild(clusterFive);



  flow.appendChild(tree);

  card.appendChild(flow);

  container.appendChild(card);

}


