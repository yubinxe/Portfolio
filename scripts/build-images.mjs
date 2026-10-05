/* 반응형 이미지 빌드 — 원본 JPEG 하나에서 AVIF · WebP · JPEG 를 폭별로 뽑는다.
 *
 * 왜: 3배율 폰에서는 sizes × 3 이 기존 700px 변형을 넘어서 브라우저가 원본을 고른다
 *     (모바일 전체 스크롤 이미지 1.5MB). AVIF 는 같은 화질에서 JPEG 의 1/3~1/4.
 * 결과: images/opt/<name>-<w>.{avif,webp}  — sections.jsx 의 <Pic> 이 사용.
 *       JPEG 폴백은 폭별로 만들지 않고 기존 원본을 쓴다(WebP 미지원 브라우저는 사실상 없음 — 저장소 증가 억제).
 *
 *   npm run build:images      (원본을 바꿨거나 목록에 추가했을 때만 실행) */
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "images/opt");

/* [원본, 출력 이름] — 화면 폭 대비 크게 그려지는 사진만 */
export const IMAGES = [
  ["hero-gangnam.jpg", "hero-gangnam"],
  ["footer-seoul.jpg", "footer-seoul"],
  ["profile-yubin.jpg", "profile-yubin"],
  ["ssafy-presentation.jpg", "ssafy-presentation"],
  ["youth-day-venue.jpg", "youth-day-venue"],
  ["youth-day-dialogue.jpg", "youth-day-dialogue"],
  ["youth-day-yonhap.jpg", "youth-day-yonhap"],
  ["youth-day-selfie.jpg", "youth-day-selfie"],
  ["youth-day-mbc-02.jpg", "youth-day-mbc-02"],
  ["fw-gwanghwamun.jpg", "fw-gwanghwamun"],
  ["fw-street.jpg", "fw-street"],
  ["fw-map.jpg", "fw-map"],
  ["fw-phone.jpg", "fw-phone"],
];
export const WIDTHS = [480, 800, 1200];

/* 원본보다 큰 폭은 만들지 않는다 — 원본 폭 자체를 마지막 단계로 */
export async function widthsFor(src) {
  const { width } = await sharp(src).metadata();
  const ws = WIDTHS.filter((w) => w < width);
  return [...ws, Math.min(width, 1600)];
}

if (process.argv[1] && process.argv[1].endsWith("build-images.mjs")) {
  await mkdir(OUT, { recursive: true });
  let before = 0, after = 0;
  for (const [file, name] of IMAGES) {
    const src = path.join(ROOT, "images", file);
    before += (await stat(src)).size;
    const ws = await widthsFor(src);
    for (const w of ws) {
      const base = sharp(src).resize({ width: w, withoutEnlargement: true });
      await base.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`));
      await base.clone().webp({ quality: 74, effort: 5 }).toFile(path.join(OUT, `${name}-${w}.webp`));
    }
    const top = ws[ws.length - 1];
    const a = (await stat(path.join(OUT, `${name}-${top}.avif`))).size;
    after += a;
    console.log(`${name.padEnd(20)} ${ws.join("/")}w · 원본 ${Math.round((await stat(src)).size / 1024)}KB → AVIF@${top} ${Math.round(a / 1024)}KB`);
  }
  console.log(`\n최대폭 기준 합계: JPEG 원본 ${Math.round(before / 1024)}KB → AVIF ${Math.round(after / 1024)}KB`);
}
