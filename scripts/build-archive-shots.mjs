/* 그 밖의 작업(#research) 카드 썸네일 — 각 작업이 무엇인지 첫눈에 보이도록 실제 화면 한 장씩.
 * 웹: 본인이 배포한 공개 화면을 1280×800 으로 촬영 · 영상: 본인 영상 2초 지점 한 프레임 · 시뮬레이터: 기존 사진(fw-gwanghwamun)
 * 결과: images/archive/<n>-640.{avif,webp}  (메타데이터 없음 — sharp 기본값은 EXIF 를 버린다)
 *
 *   node scripts/build-archive-shots.mjs      (화면이 크게 바뀌었을 때만 다시 실행) */
import sharp from "sharp";
import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "images/archive");

export const WEB = [
  ["14", "https://seongbun.vercel.app"],
  ["11", "https://malsseum-guwon.vercel.app/"],
  ["13", "https://gotgan-three.vercel.app"],
  ["15", "https://yubin-project-plaza.vercel.app"],
];
export const VIDEO = [["01", "video/edition-04.mp4", 5], ["02", "video/edition-05.mp4", 2], ["03", "video/edition-06.mp4", 14], ["04", "video/edition-03.mp4", 5]]; /* [번호, 파일, 초] — 제목 장면이 보이는 지점 */
export const STILL = [["10", "images/fw-gwanghwamun.jpg"]];

async function save(n, buf) {
  const base = sharp(buf).resize({ width: 640, height: 400, fit: "cover", position: "top" });
  await base.clone().avif({ quality: 50 }).toFile(path.join(OUT, `${n}-640.avif`));
  await base.clone().webp({ quality: 72 }).toFile(path.join(OUT, `${n}-640.webp`));
  console.log("saved", n);
}

await mkdir(OUT, { recursive: true });
const tmp = await mkdtemp(path.join(os.tmpdir(), "arch-"));
for (const [n, f] of STILL) await save(n, await readFile(path.join(ROOT, f)));
for (const [n, f, sec] of VIDEO) {
  const png = path.join(tmp, n + ".png");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(sec), "-i", path.join(ROOT, f), "-frames:v", "1", png]);
  await save(n, await readFile(png));
}
if (!process.argv.includes("--no-web")) {
  const { createRequire } = await import("node:module");
  const { chromium } = createRequire(import.meta.url)("playwright"); /* 전역 설치본도 찾도록 CJS 해석 */
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  for (const [n, u] of WEB) {
    try {
      await p.goto(u, { waitUntil: "networkidle", timeout: 45000 });
      await p.waitForTimeout(2500);
      await save(n, await p.screenshot());
    } catch (e) { console.log("skip", n, e.message.split("\n")[0]); }
  }
  await b.close();
}
