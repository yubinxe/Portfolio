/* 챗봇 로컬 답변 품질 고정 — kb.js 의 rank() 가 실제 질문에 맞는 카드를 1순위로 올리는지.
 * 카드나 태그를 고칠 때 이 테스트가 깨지면, 방문자가 엉뚱한 답을 받는다는 뜻입니다. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const KB = require("../kb.js");

/* [질문, 1순위로 와야 할 카드 id 후보] — 후보 중 하나면 통과 */
const CASES = [
  ["김유빈 님은 어떤 분인가요?", ["profile"]],
  ["핵심 역량을 한눈에 요약해 주세요", ["composite"]],
  ["전략기획 경험이 있나요?", ["dom-strategy"]],
  ["어떤 프로젝트를 만들었나요?", ["projects"]],
  ["대시보드 만든 거 보여주세요", ["ed-05", "dom-data"]],
  ["강의 하시나요? 커리큘럼 알려주세요", ["lectures", "dom-teaching"]],
  ["프롬프트 엔지니어링 강의 있나요?", ["lec-02"]],
  ["바이브 코딩 교육 가능한가요?", ["lec-03"]],
  ["하네스 엔지니어링이 뭔가요?", ["lec-04"]],
  ["AI 기초 강의 듣고 싶어요", ["lec-01"]],
  ["공공데이터 강의 시간이 어떻게 되나요?", ["lec-06"]],
  ["브랜드 필름 제작 강의", ["lec-07"]],
  ["강사 자격이 있으신가요?", ["lec-basis"]],
  ["SSAFY 이수하셨나요?", ["tl-ssafy"]],
  ["서울대 AIED 과정 들으셨나요?", ["tl-aied"]],
  ["수상 경력 알려주세요", ["creds", "tl-army-startup", "tl-army"]],
  ["자격증 뭐 있으세요?", ["creds"]],
  ["경력 타임라인 정리해 주세요", ["trajectory"]],
  ["어디서 일하시나요?", ["office"]],
  ["연락은 어떻게 하나요?", ["contact"]],
  ["방송 출연한 적 있나요?", ["media"]],
  ["부동산 관련 경험", ["dom-domain", "tl-krema", "ed-05"]],
  ["청와대 청년의날 갔다면서요", ["tl-youth-day"]],
  ["정비사업 용역비 수집한 거", ["ed-08", "dom-strategy"]],
  ["급여명세서 자동화", ["ed-07"]],
  ["VOC 트리아지가 뭔가요", ["ed-06"]],
  ["루이비통 영상", ["ed-03"]],
  ["르엘 성수", ["ed-02"]],
  ["지방선거 카드뉴스", ["ed-01"]],
  ["사용하는 툴이 뭔가요", ["arsenal"]],
  ["일하는 철학이 궁금해요", ["thesis"]],
  /* --- 의도는 같고 표현이 다른 질문 (과적합 방지) --- */
  ["출강 문의드립니다", ["lectures", "contact"]],
  ["법률 도메인 이해도가 있나요", ["dom-domain"]],
  ["인스타그램 콘텐츠 만드신 적 있나요", ["ed-01"]],
  ["군대에서는 무슨 일을 하셨나요", ["tl-army", "tl-army-startup"]],
  ["독일 연수 다녀오셨다고요", ["tl-vattenfall"]],
  ["한국부동산마케팅협회 활동", ["tl-krema"]],
  ["서초구 청년네트워크에서 무슨 역할인가요", ["tl-seocho", "office"]],
  ["영어 점수 있으세요", ["creds"]],
  ["갤러리 사진 보고 싶어요", ["gallery"]],
];

test("rank() 가 질문 의도에 맞는 카드를 1순위로 올린다", () => {
  const miss = [];
  for (const [q, expect] of CASES) {
    const top = KB.rank(q)[0];
    if (!(top && top.s > 0 && expect.includes(top.c.id))) {
      miss.push(`${q} → 기대 ${expect.join("|")} / 실제 ${top && top.s > 0 ? `${top.c.id}(${top.s})` : "매칭 없음"}`);
    }
  }
  assert.equal(miss.length, 0, `빗나간 질문 ${miss.length}건\n` + miss.join("\n"));
});

test("포트폴리오에 없는 질문은 0점 — 지어내지 않고 이메일로 넘긴다", () => {
  for (const q of ["비트코인 시세 알려줘", "오늘 서울 날씨", "파이썬 문법 알려줘"]) {
    assert.equal(KB.rank(q)[0].s, 0, `"${q}" 가 카드에 매칭되면 안 됩니다`);
  }
});

test("구체적인 태그가 일반 태그를 이긴다", () => {
  const specific = KB.rank("바이브 코딩 강의")[0];
  assert.equal(specific.c.id, "lec-03");
  const general = KB.rank("교육 프로그램 있나요")[0];
  assert.equal(general.c.cat, "강의");
});
