/**
 * 台灣學制推算（簡化模型）
 * - 每學年度以 9/1 開學日為基準（與「滿幾歲入學」慣用算法一致）
 * - 國小一年級：開學日當天滿 6 歲（含）以上者入學該學年度小一
 * - 國小 6 年、國中 3 年；高中／高職／五專皆為國中畢業後銜接（同一屆）
 */

/**
 * @param {Date} birth
 * @param {Date} ref
 */
export function ageOnDate(birth, ref) {
  let age = ref.getFullYear() - birth.getFullYear();
  const md = (ref.getMonth() - birth.getMonth()) * 32 + (ref.getDate() - birth.getDate());
  if (md < 0) age--;
  return age;
}

/** 該年 9/1 */
export function sept1(calendarYear) {
  return new Date(calendarYear, 8, 1);
}

/**
 * 小一入學「西元曆年」= 該屆 9 月所在之年（例：2020 = 109 學年度入學小一）
 * @param {Date} birth
 */
export function elementaryEntryCalendarYear(birth) {
  let y = birth.getFullYear();
  for (let guard = 0; guard < 20; guard++) {
    const ref = sept1(y);
    if (ageOnDate(birth, ref) >= 6) return y;
    y++;
  }
  throw new Error("無法推算小一入學年（出生日異常）");
}

/** 民國學年度「數字」（以 9 月所在西元年換算：西元 Y 年 9 月開學 = (Y − 1911) 學年度） */
export function rocAcademicYearFromSeptWesternYear(westernSeptYear) {
  return westernSeptYear - 1911;
}

/** 西元「曆年」對應之民國紀年（元旦起算之年次，非學年度）：民國 = 西元 − 1911 */
export function rocCalendarYearFromWesternCalendarYear(westernCalendarYear) {
  return westernCalendarYear - 1911;
}

/** 9 月入學：〇〇「學年度」(該學年 9 月所在西元)。例：100學年度(2011) 9月 入學 */
export function labelSeptEnrollment(westernSeptYear) {
  const r = rocAcademicYearFromSeptWesternYear(westernSeptYear);
  return `${r}學年度(${westernSeptYear}) 9月 入學`;
}

/**
 * 6 月畢業：民國「曆年」(畢業典禮所在西元曆年)，不用學年度字樣。
 * 與入學不同：103學年度跨越至 2015 年 6 月畢業時，曆年已是民國104年／西元2015。
 * 例：104(2015) 6月 畢業（大學學士）
 */
export function labelJuneGraduation(westernJuneYear, degreeShort) {
  const rocCal = rocCalendarYearFromWesternCalendarYear(westernJuneYear);
  return `${rocCal}(${westernJuneYear}) 6月 畢業（${degreeShort}）`;
}

/** @param {number} startSeptWesternYear */
function addYears(startSeptWesternYear, delta) {
  return startSeptWesternYear + delta;
}

/**
 * 表單下拉選單數值（main.js 傳入）
 * @typedef {{
 *   elementary?: string;
 *   highSchool?: string;
 *   uniFour?: string;
 *   fiveTwo?: string;
 * }} CohortAdjustmentForm
 */

/**
 * @param {CohortAdjustmentForm} raw
 * @returns {{
 *   elementaryDelta: number;
 *   postSeniorGap: number;
 *   uniGradExtra: number;
 *   uniEntryGap: number;
 *   twoTechEntryGap: number;
 * }}
 */
export function parseCohortAdjustments(raw = {}) {
  const num = (v) => {
    const x = Number(v);
    return Number.isFinite(x) && x > 0 ? x : 0;
  };

  const elementary = String(raw.elementary ?? "0");
  let elementaryDelta = 0;
  if (elementary.startsWith("early-")) elementaryDelta = -num(elementary.slice(6));
  else if (elementary.startsWith("late-")) elementaryDelta = num(elementary.slice(5));

  const highSchool = String(raw.highSchool ?? "0");
  let postSeniorGap = 0;
  if (highSchool.startsWith("delay-")) postSeniorGap = num(highSchool.slice(6));
  else if (highSchool.startsWith("retake-")) postSeniorGap = num(highSchool.slice(7));

  const uniFour = String(raw.uniFour ?? "0");
  let uniGradExtra = 0;
  let uniEntryGap = 0;
  if (uniFour.startsWith("delay-")) uniGradExtra = num(uniFour.slice(6));
  else if (uniFour.startsWith("retake-")) uniEntryGap = num(uniFour.slice(7));

  const fiveTwo = String(raw.fiveTwo ?? "0");
  /** 延畢／重考皆視為晚 n 年才進入二技（五專結束後空檔或五專延長） */
  let twoTechEntryGap = 0;
  if (fiveTwo.startsWith("delay-")) twoTechEntryGap = num(fiveTwo.slice(6));
  else if (fiveTwo.startsWith("retake-")) twoTechEntryGap = num(fiveTwo.slice(7));

  return {
    elementaryDelta,
    postSeniorGap,
    uniGradExtra,
    uniEntryGap,
    twoTechEntryGap,
  };
}

/**
 * 目前所處學年度：以 9/1 為界，9/1（含）起算為該西元年的學年度起始
 * @param {Date} ref
 */
export function currentAcademicSeptWesternYear(ref) {
  const refY = ref.getFullYear();
  const refM = ref.getMonth();
  const refD = ref.getDate();
  if (refM > 8 || (refM === 8 && refD >= 1)) return refY;
  return refY - 1;
}

/**
 * @param {Date} birth
 * @param {Date} ref
 */
export function approximateStageToday(birth, ref) {
  const e1 = elementaryEntryCalendarYear(birth);
  const curSept = currentAcademicSeptWesternYear(ref);
  const roc = rocAcademicYearFromSeptWesternYear(curSept);
  const ys = curSept - e1;

  const num = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  /** @param {number} n */
  const digitZh = (n) => (n >= 1 && n <= 10 ? num[n] : String(n));

  let base = "";
  if (ys < 0) base = "尚未進入國小一年級（尚未滿足推算之小一入學年）";
  else if (ys <= 5) base = `國小${digitZh(ys + 1)}年級`;
  else if (ys <= 8) base = `國中${digitZh(ys - 5)}年級`;
  else base = "已進入高中職／五專以上階段（依升學管道分流）";

  const seniorHigh = (() => {
    if (ys < 9) return null;
    if (ys <= 11) return `高中普通科${digitZh(ys - 8)}年級`;
    if (ys <= 15) return `大學${digitZh(ys - 11)}年級（假設高中→大學、未延修）`;
    return "可能已大學畢業或就讀研究所／其他進修（超出推算範圍）";
  })();

  const vocational = (() => {
    if (ys < 9) return null;
    if (ys <= 11) return `高職${digitZh(ys - 8)}年級`;
    if (ys <= 14) return `四技${digitZh(ys - 10)}年級（假設高職應屆銜接四技二年級起）`;
    if (ys === 15) return "約四技／科大應屆畢業或已畢業（理想進度）";
    return "可能已四技／科大畢業或就業／進修（超出推算範圍）";
  })();

  const fiveJunior = (() => {
    if (ys < 9) return null;
    if (ys <= 13) return `五專${digitZh(ys - 8)}年級`;
    if (ys === 14) return "二技一年級（假設五專應屆銜接）";
    if (ys === 15) return "二技二年級（假設未延修）";
    return "可能已二技畢業或就業／進修（超出推算範圍）";
  })();

  return {
    referenceDateLocal: formatLocalYMD(ref),
    currentAcademicSeptWesternYear: curSept,
    rocAcademicYear: roc,
    yearsAfterElementaryGrade1Sept: ys,
    roughSummary: base,
    ifSeniorHighToUniversity: seniorHigh,
    ifVocationalToFourTech: vocational,
    ifFiveYearJuniorToTwoTech: fiveJunior,
    disclaimer:
      "以上「現在約幾年級」為理想進度；重讀、轉學、延畢、打工換宿間隔年等皆會偏離。",
  };
}

/** @param {Date} d */
export function formatLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * @param {Date} birth
 * @param {Date} [referenceDate]
 * @param {CohortAdjustmentForm} [adjustments]
 */
export function computeCohort(birth, referenceDate = new Date(), adjustments = {}) {
  const adj = parseCohortAdjustments(adjustments);

  const e1 = elementaryEntryCalendarYear(birth) + adj.elementaryDelta;
  const j1 = addYears(e1, 6); // 國中一年級 9 月
  const seniorTrack = addYears(j1, 3); // 高中／高職／五專 一年級

  const roc = (y) => rocAcademicYearFromSeptWesternYear(y);

  /** @param {number} septY */
  const enrollSept = (septY) => ({
    westernSeptYear: septY,
    rocAcademicYear: roc(septY),
    label: labelSeptEnrollment(septY),
  });

  /** 大一／四技一年級起算之西元 9 月年（含高中畢業後空檔／重考、大學重考延後入學） */
  const uniOrFourTechY1 = addYears(seniorTrack, 3) + adj.postSeniorGap + adj.uniEntryGap;
  /** 高職銜接四技二年級入學之西元 9 月年（與高中職畢業同年 9 月） */
  const vocFourTechY2 = uniOrFourTechY1;
  /** 五專後二技一年級（含二技重考延後入學） */
  const twoTechY1 = addYears(seniorTrack, 5) + adj.twoTechEntryGap;

  const uniGradJune = uniOrFourTechY1 + 4 + adj.uniGradExtra;
  const fourTechGradJune = uniGradJune;
  const vocBridgeGradJune = vocFourTechY2 + 3 + adj.uniGradExtra;

  const twoTechGradJune = twoTechY1 + 2;

  return {
    birth: formatLocalYMD(birth),

    elementaryGrade1: {
      westernSeptYear: e1,
      rocAcademicYear: roc(e1),
      label: labelSeptEnrollment(e1),
    },
    juniorHighGrade1: {
      westernSeptYear: j1,
      rocAcademicYear: roc(j1),
      label: labelSeptEnrollment(j1),
    },

    /** 國中畢業後主流路徑（同一屆） */
    afterJuniorHigh: {
      seniorHighGrade1: {
        westernSeptYear: seniorTrack,
        rocAcademicYear: roc(seniorTrack),
        label: labelSeptEnrollment(seniorTrack),
      },
      vocationalHighGrade1: {
        westernSeptYear: seniorTrack,
        rocAcademicYear: roc(seniorTrack),
        label: labelSeptEnrollment(seniorTrack),
      },
      fiveYearJuniorCollegeGrade1: {
        westernSeptYear: seniorTrack,
        rocAcademicYear: roc(seniorTrack),
        label: labelSeptEnrollment(seniorTrack),
      },
    },

    /** 高中 → 大學學士四年制（至畢業）／高中 → 四技四年制（至畢業） */
    universityFromSeniorHigh: {
      universityYear1: enrollSept(uniOrFourTechY1),
      universityYear2: enrollSept(addYears(uniOrFourTechY1, 1)),
      universityYear3: enrollSept(addYears(uniOrFourTechY1, 2)),
      universityYear4: enrollSept(addYears(uniOrFourTechY1, 3)),
      universityGraduation: {
        approximateWesternJuneYear: uniGradJune,
        label: labelJuneGraduation(uniGradJune, "大學學士"),
      },
      fourTechYear1FromSeniorHigh: enrollSept(uniOrFourTechY1),
      fourTechYear2FromSeniorHigh: enrollSept(addYears(uniOrFourTechY1, 1)),
      fourTechYear3FromSeniorHigh: enrollSept(addYears(uniOrFourTechY1, 2)),
      fourTechYear4FromSeniorHigh: enrollSept(addYears(uniOrFourTechY1, 3)),
      fourTechGraduationFromSeniorHigh: {
        approximateWesternJuneYear: fourTechGradJune,
        label: labelJuneGraduation(fourTechGradJune, "四技學士"),
      },
    },

    /** 高職 → 四技二年級銜接（再讀三年至學士畢業） */
    fourYearTechFromVocational: {
      note: "四技管道多元（申請入學、統測分發、技優甄審等），以下為「高職畢業後同年 9 月入四技二年級」之常見銜接；修業仍以取得學士為準。",
      techYear2Entry: enrollSept(vocFourTechY2),
      techYear3: enrollSept(addYears(vocFourTechY2, 1)),
      techYear4: enrollSept(addYears(vocFourTechY2, 2)),
      graduation: {
        approximateWesternJuneYear: vocBridgeGradJune,
        label: labelJuneGraduation(vocBridgeGradJune, "四技學士"),
      },
    },

    /** 五專 5 年，畢業後二技（2 年制）至二技畢業 */
    twoYearTechFromFiveYearCollege: {
      fiveYearEndsWesternSeptYear: addYears(seniorTrack, 5),
      twoTechYear1: enrollSept(twoTechY1),
      twoTechYear2: enrollSept(addYears(twoTechY1, 1)),
      twoTechGraduation: {
        approximateWesternJuneYear: twoTechGradJune,
        label: labelJuneGraduation(twoTechGradJune, "二技"),
      },
    },

    approximateStageToday: approximateStageToday(birth, referenceDate),

    /** 二技／四技也可由「軍校、離島、國外學歷」等，本工具不涵蓋 */
  };
}

export function parseBirthInput(str) {
  const s = String(str).trim();

  // 西元 YYYYMMDD（8 位數，例：20100520）
  if (/^\d{8}$/.test(s)) {
    const y = Number(s.slice(0, 4));
    const mo = Number(s.slice(4, 6));
    const d = Number(s.slice(6, 8));
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      throw new Error("無效的日期");
    }
    return dt;
  }

  // 民國 YYMMDD（6 位數，例：990520）
  if (/^\d{6}$/.test(s)) {
    const rocY = Number(s.slice(0, 2));
    const mo = Number(s.slice(2, 4));
    const d = Number(s.slice(4, 6));
    if (rocY < 1 || rocY > 99) throw new Error("六位民國格式請用 YYMMDD（民國年兩碼，例如 990520）");
    const y = rocY + 1911;
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      throw new Error("無效的日期");
    }
    return dt;
  }

  // YYYY-MM-DD
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      throw new Error("無效的日期");
    }
    return dt;
  }
  // ROC YYY/MM/DD or YYY-MM-DD (民國)
  m = /^(\d{2,3})[/-](\d{1,2})[/-](\d{1,2})$/.exec(s);
  if (m) {
    const rocY = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (rocY < 1 || rocY > 150) throw new Error("民國年不合理");
    const y = rocY + 1911;
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      throw new Error("無效的日期");
    }
    return dt;
  }
  throw new Error(
    "日期格式請用：西元 YYYY-MM-DD 或 YYYYMMDD（8 碼）；民國 YY-MM-DD、YY/MM/DD 或 YYMMDD（6 碼）",
  );
}
