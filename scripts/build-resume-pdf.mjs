/* 1페이지 이력 PDF — resume.html 을 그대로 A4 로 인쇄해 resume.pdf 를 만든다(웹과 PDF 의 원본이 같다).
 * 한 쪽을 넘으면 실패한다. resume.html · resume.css 의 지문을 docs/resume-pdf.json 에 남겨,
 * 내용을 고쳤는데 PDF 를 다시 만들지 않으면 test/resume.test.mjs 가 잡는다.
 *   npm run build:resume-pdf   (설치된 Playwright · Chromium 사용, 웹 글꼴은 네트워크로 받음) */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { console.error("Playwright 가 없습니다 — PDF 를 만들 수 없습니다."); process.exit(1); }

export const resumeHash = () => createHash("sha256").update(readFileSync(path.join(ROOT, "resume.html"))).update(readFileSync(path.join(ROOT, "resume.css"))).digest("hex").slice(0, 16);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(ROOT, "resume.html")).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: "print" });
const pdf = await page.pdf({ format: "A4", preferCSSPageSize: true, printBackground: true });
await browser.close();
const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
if (pages !== 1) { console.error(`resume.pdf 가 ${pages}쪽입니다 — A4 한 쪽이어야 합니다. resume.css 의 @media print 를 줄이세요.`); process.exit(1); }
writeFileSync(path.join(ROOT, "resume.pdf"), pdf);
writeFileSync(path.join(ROOT, "docs/resume-pdf.json"), JSON.stringify({ source: "resume.html + resume.css", hash: resumeHash(), pages, bytes: pdf.length }, null, 2) + "\n");
console.log(`resume.pdf ${pages}쪽 · ${(pdf.length / 1024).toFixed(0)} KB · 지문 ${resumeHash()}`);
