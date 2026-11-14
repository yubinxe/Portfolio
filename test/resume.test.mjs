/* 1페이지 이력(resume.html · resume.pdf) — 정보 순서, 사실 표기, 연락 동선, PDF 가 웹과 같은 원본에서 1쪽으로 나왔는지 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const read = (f) => readFileSync(new URL("../" + f, import.meta.url));
const html = read("resume.html").toString("utf8");
const text = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("정보 순서 — 인물 → 전문성 → 실행 성과 → 교육 → 근거 → 연락", () => {
  const order = ['id="rv-name"', 'id="rv-cap"', 'id="rv-res"', 'id="rv-edu"', 'id="rv-proof"', 'id="rv-ct"'];
  let at = -1;
  for (const k of order) { const i = html.indexOf(k); assert.ok(i > at, "순서: " + k); at = i; }
  assert.ok(text.includes("복잡한 문제를 구조화하고, 기술로 실행합니다.") && text.includes("AI 전략 · 업무혁신(AX) · 법률·부동산 산업 적용"));
  assert.equal((html.match(/class="rv-case"/g) || []).length, 3, "대표 성과는 세 가지");
  assert.equal((html.match(/<li><a href="https:\/\/(yubinxe|zipcatch)/g) || []).length, 3, "근거 링크 세 묶음");
});

test("사실 표기 — 실제 수행 · 개인 프로젝트 · 제안을 구분하고, 측정하지 않은 수치와 자기평가를 쓰지 않는다", () => {
  assert.ok(text.includes("실제 수행 · 화면 비공개") && text.includes("개인 프로젝트") && text.includes("정책 채택 · 결정 권한 아님"));
  assert.ok(text.includes("처리 시간 단축률은 측정 자료가 없어 적지 않았습니다"));
  assert.ok(text.includes("학위가 아닌 비학위 전문교육") && text.includes("대구일마이스터고등학교 졸업"));
  assert.ok(text.includes("트랙 1·2·3·4 전 과정 수료 · 그랜드마스터 배지") && text.includes("서울 핀테크 아카데미 14기") && text.includes("민선 9기 서울시장 공약평가단"));
  assert.ok(!/혁신적인 인재|압도적|세계 최고|최고의 전문가/.test(text), "자기평가 표현");
  assert.ok(!/\d+\s*%/.test(text), "측정 안 된 퍼센트");
  assert.ok(!/010[- ]?\d{3,4}[- ]?\d{4}|생년|주민|2004/.test(text), "전화 · 생년 등 불필요한 개인정보");
  assert.ok(!/사내 도입[^ ]*(집캐치|Trial Brief)/.test(text), "개인 프로젝트를 사내 도입으로 쓰지 않는다");
});

test("근거 · 보도 링크는 실제 주소", () => {
  for (const u of ["https://www.hankyung.com/article/202611110211i", "https://www.joongang.co.kr/article/25477695", "https://www.seoulfn.com/news/articleView.html?idxno=642571",
    "https://zipcatch.vercel.app/", "https://yubinxe.github.io/Portfolio/cases.html", "https://yubinxe.github.io/Portfolio/career.html"]) assert.ok(html.includes(`href="${u}"`), u);
});

test("의견 · 협업 — 메일 앱을 여는 링크(제목 자동 입력), 보냈다고 표시하지 않는다", () => {
  const mails = [...html.matchAll(/href="mailto:([^"?]+)\?subject=([^"]+)"/g)].map((m) => [m[1], decodeURIComponent(m[2])]);
  assert.deepEqual(mails.map((m) => m[1]).sort(), ["[포트폴리오 피드백] 김유빈 1페이지 이력 검토 의견", "[협업 제안] 김유빈 포트폴리오"]);
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
  assert.ok(/@page\{size:A4/.test(read("resume.css").toString("utf8")));
  assert.ok(html.includes('href="resume.pdf" download'), "PDF 저장은 실제 파일");
});

test("어디서든 1페이지 이력으로 — 상단 메뉴 · 인트로 · 모바일 메뉴", () => {
  const jsx = read("sections.jsx").toString("utf8"), mnav = read("mnav.js").toString("utf8");
  assert.ok(jsx.includes('href="resume.html" className="hnav__cv'));
  assert.ok(jsx.includes('className="ix__cv font-ko" href="resume.html"'));
  assert.ok(mnav.includes('class="mnav__cv" href="resume.html"'));
  assert.ok(read("index.html").toString("utf8").includes('href="resume.html"'), "프리렌더에 포함");
});
