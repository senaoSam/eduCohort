/** @param {number} westernSeptYear */
function enrollYm(westernSeptYear) {
  return `${westernSeptYear}/09`;
}

/** @param {number} westernJuneYear */
function gradYm(westernJuneYear) {
  return `${westernJuneYear}/06`;
}

/** @param {string} title @param {number} enrollSeptY @param {number} gradJuneY */
function rowLine(title, enrollSeptY, gradJuneY) {
  return `${title} ${enrollYm(enrollSeptY)} - ${gradYm(gradJuneY)}`;
}

/** @param {HTMLElement} container @param {object} data computeCohort 回傳物件 */
export function renderCohortList(container, data) {
  const e = data.elementaryGrade1.westernSeptYear;
  const j = data.juniorHighGrade1.westernSeptYear;
  const senior = data.afterJuniorHigh.seniorHighGrade1.westernSeptYear;
  const u = data.universityFromSeniorHigh;
  const m = data.masterAfterBachelor;
  const tt = data.twoYearTechFromFiveYearCollege;

  const card = document.createElement("div");
  card.className = "card cohort-list-card";

  const hint = document.createElement("p");
  hint.className = "cohort-list-hint";
  hint.textContent = "前方為入學（9 月）、後方為畢業（6 月），皆為西元約略年月。";
  card.appendChild(hint);

  const readNote = document.createElement("p");
  readNote.className = "cohort-list-read-mode";
  readNote.textContent =
    data.elementaryReadMode === "年頭讀" ? "已套用：年頭讀。" : "已套用：年尾讀。";
  card.appendChild(readNote);

  /** @param {string} heading @param {string[]} lines */
  function addSection(heading, lines) {
    const sec = document.createElement("section");
    sec.className = "cohort-list-section";
    const h = document.createElement("h3");
    h.className = "cohort-list-heading";
    h.textContent = heading;
    sec.appendChild(h);
    const ul = document.createElement("ul");
    ul.className = "cohort-list";
    for (const text of lines) {
      const li = document.createElement("li");
      li.className = "cohort-list-item";
      li.textContent = text;
      ul.appendChild(li);
    }
    sec.appendChild(ul);
    card.appendChild(sec);
  }

  addSection("國中小", [
    rowLine("國小", e, e + 6),
    rowLine("國中", j, j + 3),
    rowLine("高中(職)", senior, senior + 3),
  ]);

  addSection("普高銜接（擇一）", [
    rowLine("大學", u.universityYear1.westernSeptYear, u.universityGraduation.approximateWesternJuneYear),
    rowLine(
      "四技",
      u.fourTechYear1FromSeniorHigh.westernSeptYear,
      u.fourTechGraduationFromSeniorHigh.approximateWesternJuneYear,
    ),
    rowLine("碩士", m.masterYear1.westernSeptYear, m.masterGraduation.approximateWesternJuneYear),
  ]);

  addSection("五專 · 二技", [
    rowLine("五專", senior, senior + 5),
    rowLine("二技", tt.twoTechYear1.westernSeptYear, tt.twoTechGraduation.approximateWesternJuneYear),
  ]);

  container.appendChild(card);
}
