/* 챗봇 로컬 답변 품질 고정 — kb.js 의 rank() 가 실제 질문에 맞는 카드를 1순위로 올리는지.
 * 카드나 태그를 고칠 때 이 테스트가 깨지면, 방문자가 엉뚱한 답을 받는다는 뜻입니다. */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const KB = require("../kb.js");

/* [질문, 1순위로 와야 할 카드 id 후보] — 후보 중 하나면 통과 */
const CASES = [
  ["직접 만들어서 자주 쓰는 서비스가 뭐예요?", ["everyday-tools"]],
  ["법무법인에서는 어떤 업무를 자동화했나요?", ["work-systems"]],
  ["AI 에이전트는 회사에서 운영하나요?", ["ed-17"]],
  ["재정경제부 차관 간담회 다녀왔나요?", ["tl-moef-youth"]],
  ["부동산산업의 날에서 무슨 일 했어요?", ["tl-rei-day"]],
  ["김유빈 님은 어떤 분인가요?", ["profile"]],
  ["김유빈은 어떤 사람인가요?", ["profile"]],
  ["정책 참여는 어떤 걸 했나요?", ["policy"]],
  ["공론장이나 정책 거버넌스 활동", ["policy", "tl-gender-forum", "tl-seocho"]],
  ["역량 구조가 궁금해요", ["composite"]],
  ["핵심 역량을 한눈에 요약해 주세요", ["composite"]],
  ["전략기획 경험이 있나요?", ["dom-strategy"]],
  ["전략 컨설팅 경험이 있나요?", ["dom-strategy"]],
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
  ["민주청년지도자 양성과정 들어갔어요?", ["tl-dyl"]],
  ["성평등 공론장 참석했나요", ["tl-gender-forum"]],
  ["국민통합위원회 대토론회에서 뭘 발표했어요?", ["tl-national-debate"]],
  ["미래배당펀드가 뭐예요", ["tl-national-debate"]],
  ["국정 한눈에 상황판은 뭐예요", ["ed-12"]],
  ["법조시장 한눈에 로펌 상황판 알려줘", ["ed-16"]],
  ["곳간 유통기한 알림 서비스 알려줘", ["ed-13"]],
  ["성분관 피부 진단은 뭐예요", ["ed-14"]],
  ["유튜브 기능 제안서 보여줘", ["ed-15"]],
  ["광명시흥 보상자료 분석한 거", ["ax-compensation"]],
  ["총회결의 하자 검증은 뭐예요", ["ax-assembly", "ax-desk"]],
  ["계약변경 레드라인", ["ax-contract", "ax-desk"]],
  ["경국 AX 현황판", ["ax-desk"]],
  ["광명시흥 보상자료", ["ax-compensation"]],
  ["급여명세서 자동화", ["ed-07"]],
  ["집캐치가 뭔가요", ["ed-09"]],
  ["공공임대 추천 서비스 만든 거", ["ed-09"]],
  ["VOC 트리아지가 뭔가요", ["ed-06"]],
  ["고객 메일 자동 분류가 뭔가요", ["ed-06"]],
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
  ["Vattenfall에서 일한 적이 있나요?", ["tl-vattenfall"]],
  ["독일 인턴십 기간은 언제인가요?", ["tl-vattenfall"]],
  ["OSZ TIEM은 어떤 기관인가요?", ["tl-osz-tiem"]],
  ["독일에서 어떤 교육을 받았나요?", ["tl-osz-tiem"]],
  ["독일 기업으로부터 받은 평가가 있나요?", ["tl-vattenfall"]],
  ["독일에서 배운 전기 기술은 무엇인가요?", ["tl-vattenfall", "tl-osz-tiem"]],
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
