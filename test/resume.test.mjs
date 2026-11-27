/* Résumé(resume.html · resume.pdf) — 본인 레쥬메 PDF(2026. 11)를 옮긴 원본. 정보 순서, 사실 표기, 움직임의 안전장치,
 * 연락 동선, PDF 가 웹과 같은 원본에서 A4 1쪽으로 나왔는지 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const read = (f) => readFileSync(new URL("../" + f, import.meta.url));
const html = read("resume.html").toString("utf8");
const css = read("resume.css").toString("utf8");
const js = read("resume.js").toString("utf8");
const text = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("이름은 프랑스어 원문 Résumé — 페이지 · 상단 메뉴 · 인트로 · 모바일 메뉴 · 챗봇", () => {
  assert.ok(/<title>김유빈 \| Résumé/.test(html));
  assert.ok(text.includes("RÉSUMÉ") && html.includes('lang="fr">Résumé'));
  const jsx = read("sections.jsx").toString("utf8"), mnav = read("mnav.js").toString("utf8"), kb = read("kb.js").toString("utf8");
  assert.ok(jsx.includes('href="resume.html" className="hnav__cv" lang="fr">Résumé</a>'));
  assert.ok(jsx.includes('className="ix__cv font-ko" href="resume.html" onClick={() => ykIntro.skipSession()}><span lang="fr">Résumé</span> 보기'));
  assert.ok(mnav.includes('class="mnav__cv" href="resume.html" lang="fr">Résumé</a>'));
  assert.ok(kb.includes('title: "Résumé'));
  for (const s of [jsx, mnav, kb, html]) assert.ok(!s.includes("1페이지 이력"), "옛 이름이 남아 있음");
  assert.ok(read("index.html").toString("utf8").includes('href="resume.html"'), "프리렌더에 포함");
});

test("정보 순서 — 인물 → 숫자 4 → 보도 → 경력 → 프로젝트 → 교육 → 자격 · 수상 → 연락", () => {
  const order = ['id="rv-name"', 'id="rv-thesis"', 'id="rv-stats"', 'id="rv-press"', 'id="rv-exp"', 'id="rv-builds"', 'id="rv-edu"', 'id="rv-cred"', 'id="rv-contact"'];
  let at = -1;
  for (const k of order) { const i = html.indexOf(k); assert.ok(i > at, "순서: " + k); at = i; }
  assert.ok(text.includes("고위험 법률 · 부동산 업무에서, 담당자가 근거를 확인해 판단하는 AI 업무 절차를 설계합니다."));
  assert.equal((html.match(/class="rv-stat"/g) || []).length, 4);
  assert.equal((html.match(/class="rv-build"/g) || []).length, 4);
  assert.ok((html.match(/<li>/g) || []).length >= 5, "경력 항목");
});

test("레쥬메 PDF 의 사실 — 숫자 · 경력 · 프로젝트 · 교육 · 자격 · 수상", () => {
  for (const s of ["data-count=\"3\"", "data-count=\"15\"", "data-count=\"2\"", "data-count=\"1\""]) assert.ok(html.includes(s), s);
  for (const s of ["법무법인 경국", "전략기획실 · 사원", "2026. 06 – 재직 중", "발표자료 77장", "NAVER WORKS", "전자공탁", "LCP 5.2→2.0초", "15개 모두 검출, 오탐 0건",
    "집코노미 박람회 AI 전시관(코엑스)", "서울 핀테크 아카데미 14기 트랙 2 · 3 수료", "서울대 AI 교육 전문가 과정(AIED) 4기 수료", "매력일자리 3기 교육생",
    "SSAFY", "대구일마이스터고등학교 졸업", "한국사 3급", "OPIc IH", "강원열린군대 스타트업 2위", "제2군단장상", "육군훈련소 최우수 분대", "육군 군필", "Claude API"]) assert.ok(text.includes(s), s);
  assert.ok(text.includes("학위가 아닌 비학위 전문교육"));
});

test("사실 표기 — 실제 수행 · 개인 프로젝트를 나누고, 측정 안 된 수치 · 개인정보를 쓰지 않는다", () => {
  assert.ok(text.includes("실제 수행") && text.includes("개인 프로젝트") && text.includes("경국 도입 아님"));
  assert.ok(!/혁신적인 인재|압도적|세계 최고|최고의 전문가|독보적|정부 인증/.test(text), "자기평가 표현");
  assert.ok(!/\d+\s*%/.test(text), "측정 안 된 퍼센트");
  assert.ok(!/010[- ]?\d{3,4}[- ]?\d{4}|생년|주민|2004/.test(html), "전화 · 생년 등 불필요한 개인정보");
  assert.ok(!/단독 집필|단독 취재/.test(text));
});

test("근거 · 보도 링크는 실제 주소", () => {
  for (const u of ["https://www.hankyung.com/article/202611110211i", "https://www.joongang.co.kr/article/25477695",
    "https://zipcatch.vercel.app/", "https://yubinxe.github.io/Portfolio/cases.html", "https://yubinxe.github.io/Portfolio/career.html", "https://github.com/yubinxe"]) assert.ok(html.includes(`href="${u}"`), u);
  for (const m of html.matchAll(/src="(images\/[^"]+)"/g)) assert.ok(existsSync(new URL("../" + m[1], import.meta.url)), m[1]);
});

test("살아 움직이는 지면 — JS · 움직임 허용일 때만, 움직임 줄이기 · 인쇄 · JS 없음은 정지 화면", () => {
  assert.ok(/prefers-reduced-motion: reduce\)"\)\.matches/.test(html) && html.includes('classList.add("rv-live")'), "움직임은 rv-live 아래에서만");
  assert.ok(!/^\[data-reveal\]\{[^}]*opacity:0/m.test(css), "JS 없으면 숨기지 않는다");
  assert.ok(/\.rv-live \[data-reveal\]\{opacity:0/.test(css));
  assert.ok(/@media \(prefers-reduced-motion:reduce\)\{\*,\*::before,\*::after\{animation:none!important/.test(css));
  const pr = css.slice(css.indexOf("@media print{"));
  assert.ok(/animation:none!important/.test(pr) && /\.rv-reel,\.rv-shot/.test(pr), "인쇄는 정지 · 현장 사진 없음");
  assert.ok(/beforeprint/.test(js) && /IntersectionObserver/.test(js) && /data-count/.test(js));
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage/.test(js), "외부 전송 · 저장 없음");
  assert.equal((html.match(/class="[^"]*\bliving\b/g) || []).length, 6, "움직이는 사진 6곳(초상 · 현장 · 프로젝트 4)");
});

test("의견 · 협업 — 메일 앱을 여는 링크(제목 자동 입력), 보냈다고 표시하지 않는다", () => {
  const mails = [...html.matchAll(/href="mailto:([^"?]+)\?subject=([^"]+)"/g)].map((m) => [m[1], decodeURIComponent(m[2])]);
  assert.deepEqual(mails.map((m) => m[1]).sort(), ["[포트폴리오 피드백] 김유빈 Résumé 검토 의견", "[협업 제안] 김유빈 포트폴리오"]);
  assert.ok(mails.every((m) => m[0] === "yubin120866@gmail.com"));
  assert.ok(!/전송 완료|보냈습니다|접수되었습니다/.test(text), "보내지 않았는데 완료 표시 금지");
  assert.ok(text.includes("보내기는 메일 앱에서 직접 눌러 주세요"));
});

test("PDF — 같은 원본(resume.html · resume.css)에서 만든 A4 한 쪽, 지문이 현재 파일과 같다", () => {
  assert.ok(existsSync(new URL("../resume.pdf", import.meta.url)), "resume.pdf");
  const meta = JSON.parse(read("docs/resume-pdf.json").toString("utf8"));
  const hash = createHash("sha256").update(read("resume.html")).update(read("resume.css")).digest("hex").slice(0, 16);
  assert.equal(meta.hash, hash, "resume.html · resume.css 를 고쳤다면 npm run build:resume-pdf 로 PDF 를 다시 만드세요");
  const pdf = read("resume.pdf").toString("latin1");
  assert.equal((pdf.match(/\/Type\s*\/Page[^s]/g) || []).length, 1, "정확히 1쪽");
  assert.ok(/@page\{size:A4/.test(css));
  assert.ok(html.includes('href="resume.pdf" download'), "PDF 저장은 실제 파일");
});
