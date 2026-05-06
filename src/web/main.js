import { computeCohort, parseBirthInput } from "../cohort.js";
import { renderCohortList } from "./route-list.js";
import "./style.css";

function textEl(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  n.textContent = text;
  return n;
}

/** @param {HTMLSelectElement} sel */
function addYearPairOptions(sel, delayPrefix, retakePrefix, delayLabel, retakeLabel) {
  sel.appendChild(new Option("無（不調整）", "0"));
  for (let i = 1; i <= 5; i++) {
    sel.appendChild(new Option(`${delayLabel} ${i}年`, `${delayPrefix}-${i}`));
    sel.appendChild(new Option(`${retakeLabel} ${i}年`, `${retakePrefix}-${i}`));
  }
}

function renderResults(container, data) {
  container.replaceChildren();
  renderCohortList(container, data);
}

function mount() {
  const root = document.getElementById("app");
  const page = document.createElement("div");
  page.className = "page";

  page.appendChild(textEl("h1", "", "學制入學年推算"));

  const formCard = document.createElement("div");
  formCard.className = "card";
  const form = document.createElement("form");
  form.className = "form-grid";

  const birthLab = document.createElement("label");
  birthLab.className = "field";
  birthLab.appendChild(textEl("span", "", "生日"));
  birthLab.appendChild(
    textEl("span", "field-hint", "例如：20100520、990520、2010-05-20"),
  );
  const birthText = document.createElement("input");
  birthText.type = "text";
  birthText.className = "input-birth-main";
  birthText.name = "birth";
  birthText.autocomplete = "bday";
  birthLab.appendChild(birthText);

  form.appendChild(birthLab);

  function mkSelectRow(id, labelText, fill) {
    const row = document.createElement("div");
    row.className = "field field-select-row";
    const lab = document.createElement("label");
    lab.className = "field-select-label";
    lab.htmlFor = id;
    lab.textContent = labelText;
    row.appendChild(lab);
    const sel = document.createElement("select");
    sel.className = "field-select";
    sel.id = id;
    sel.name = id;
    fill(sel);
    row.appendChild(sel);
    form.appendChild(row);
    return sel;
  }

  const elementarySel = mkSelectRow("adj-elementary", "早讀／晚讀（小一入學）", (sel) => {
    sel.appendChild(new Option("無（不調整）", "0"));
    for (let i = 1; i <= 5; i++) {
      sel.appendChild(new Option(`早讀 ${i}年`, `early-${i}`));
      sel.appendChild(new Option(`晚讀 ${i}年`, `late-${i}`));
    }
  });

  const highSchoolSel = mkSelectRow("adj-highSchool", "高中延畢／重考（延畢只延畢業；重考入學與畢業皆延）", (sel) => {
    addYearPairOptions(sel, "delay", "retake", "高中延畢", "重考");
  });

  const uniFourSel = mkSelectRow("adj-uniFour", "大學／四技延畢／重考", (sel) => {
    addYearPairOptions(sel, "delay", "retake", "大學／四技延畢", "重考");
  });

  const fiveTwoSel = mkSelectRow("adj-fiveTwo", "五專／二技（延畢＝五專多讀；重考＝五專畢業後晚入二技）", (sel) => {
    addYearPairOptions(sel, "delay", "retake", "五專／二技延畢", "重考");
  });

  const adjustmentSelects = [elementarySel, highSchoolSel, uniFourSel, fiveTwoSel];

  const err = document.createElement("div");
  err.className = "error";
  err.hidden = true;
  form.appendChild(err);

  const actions = document.createElement("div");
  actions.className = "row-actions";
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "primary";
  submit.textContent = "推算";
  actions.appendChild(submit);
  form.appendChild(actions);

  formCard.appendChild(form);

  const workspace = document.createElement("div");
  workspace.className = "workspace-split";

  const formCol = document.createElement("div");
  formCol.className = "workspace-form";
  formCol.appendChild(formCard);

  const results = document.createElement("div");
  results.id = "results";
  results.className = "workspace-results";

  workspace.appendChild(formCol);
  workspace.appendChild(results);
  page.appendChild(workspace);

  root.appendChild(page);

  function collectAdjustments() {
    return {
      elementary: elementarySel.value,
      highSchool: highSchoolSel.value,
      uniFour: uniFourSel.value,
      fiveTwo: fiveTwoSel.value,
    };
  }

  function runCompute() {
    err.hidden = true;
    const typed = birthText.value.trim();
    if (!typed) return;
    try {
      const birth = parseBirthInput(typed);
      const data = computeCohort(birth, new Date(), collectAdjustments());
      renderResults(results, data);
    } catch (ex) {
      err.textContent = ex.message || String(ex);
      err.hidden = false;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runCompute();
  });

  for (const sel of adjustmentSelects) {
    sel.addEventListener("change", () => {
      if (birthText.value.trim()) runCompute();
    });
  }
}

mount();
