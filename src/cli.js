#!/usr/bin/env node
import { computeCohort, parseBirthInput } from "./cohort.js";

function printHelp() {
  console.log(`
edu-cohort — 依出生日推算台灣學制約略入學年

用法:
  pnpm cli -- <出生日期> [--ref YYYY-MM-DD]
  node src/cli.js <出生日期> [--ref YYYY-MM-DD]

選項:
  --ref   「截至某日」推算現在約幾年級（預設為今天）

日期格式:
  西元: 2010-05-20 或 20100520（8 碼）
  民國: 99-05-20、99/05/20 或 990520（六位數 YYMMDD）

範例:
  pnpm cli -- 20100520
  pnpm cli -- 990520 --ref 20261001
`);
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    printHelp();
    process.exit(argv.length === 0 ? 1 : 0);
  }

  let raw = argv[0];
  let refDate = new Date();
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--ref" && argv[i + 1]) {
      try {
        refDate = parseBirthInput(argv[i + 1]);
      } catch (e) {
        console.error("--ref:", String(e.message || e));
        process.exit(1);
      }
      i++;
    }
  }

  let birth;
  try {
    birth = parseBirthInput(raw);
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(1);
  }

  const r = computeCohort(birth, refDate);

  console.log(JSON.stringify(r, null, 2));
}

main();
