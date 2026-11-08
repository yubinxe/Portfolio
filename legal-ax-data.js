/* legal-ax-data.js — 법률 AX 업무체계 공개 시연용 데이터 (모두 새로 만든 허구의 사례)
 *
 * 원칙
 *  · 실제 의뢰인 · 사건번호 · 주민등록번호 · 계약서 원본 · 사내 자료를 넣지 않는다. 당사자는 갑 · 을 · 병 같은 역할 이름만 쓴다.
 *  · 문서 상태(unreviewed …)와 법률상 사실인정은 다르다. 이 데이터의 '검토 필요'는 사람이 다시 보라는 표시일 뿐이다.
 *  · 법령 원문(verbatim: true)은 작성 시점에 옮긴 텍스트로, 국가법령정보센터 API 에 연결돼 있지 않다 — 화면에 '원문 대조 필요'로 표시한다.
 *    원문을 싣지 않은 자료는 verbatim: false 로 '출처 확인 필요'를 띄운다. 판례 번호 · 판시사항은 만들지 않는다.
 *  · 금액 · 날짜는 시연을 위한 허구다. */
(function (root) {
  "use strict";
  var LAW = function (name, art) { return "https://www.law.go.kr/법령/" + name + (art ? "/" + art : ""); };

  var fields = [
    { id: "civil", ko: "민사·상사", en: "Civil & Commercial", caseId: "LAX-CV-01", contract: "service", work: "용역대금 분쟁의 주장 · 증거 연결" },
    { id: "criminal", ko: "형사", en: "Criminal", caseId: "LAX-CR-01", contract: null, work: "진술과 객관자료의 시간순 대조" },
    { id: "family", ko: "가사", en: "Family", caseId: "LAX-FM-01", contract: null, work: "재산 관련 자료와 쟁점 분류" },
    { id: "corporate", ko: "기업법무", en: "Corporate", caseId: "LAX-CO-01", contract: "nda", contract2: "b2b", work: "NDA · 기업 간 계약 변경 비교" },
    { id: "labor", ko: "노동", en: "Labor", caseId: "LAX-LB-01", contract: "employment", work: "근로계약 조항 변경 검토" },
    { id: "admin", ko: "행정", en: "Administrative", caseId: "LAX-AD-01", contract: null, work: "처분 관련 문서 · 기한 검토자료 정리" },
    { id: "realestate", ko: "부동산·정비사업", en: "Real Estate & Redevelopment", caseId: "LAX-RE-01", contract: "construction", work: "공사계약 변경과 절차 검토" },
  ];

  /* 공통 — 사건마다 문서(paras: 문단) · 사건 흐름(events) · 쟁점(issues) · 주장(claims, facts: 주장한 사실) ·
   * 증거(evidence, record: 자료에 적힌 사실) · 확인 과제(tasks) · 진행(matter) · 관련 자료(research) */
  var cases = [
    {
      id: "LAX-CV-01", field: "civil", title: "웹 예약 시스템 개발 용역대금 청구 (가상)",
      summary: "용역 수행사 갑이 발주사 을에게 잔금을 청구한 가상 사건입니다. 결과물의 완성 · 검수 시점과 지급기일이 쟁점입니다.",
      participants: [{ id: "p1", role: "원고 · 용역 수행사", name: "갑 주식회사(가상)" }, { id: "p2", role: "피고 · 발주사", name: "을 주식회사(가상)" }],
      documents: [
        { id: "D1", type: "계약서", title: "웹 예약 시스템 개발 용역계약서", date: "2026-01-15", by: "p1", paras: [
          "제1조(목적) 갑은 을의 웹 예약 시스템을 개발하고, 을은 그 대가를 지급한다.",
          "제3조(대금) 용역대금은 금 3,000만 원으로 하고, 착수금 1,000만 원과 잔금 2,000만 원으로 나누어 지급한다.",
          "제5조(검수) 을은 최종 산출물을 납품받은 날부터 10일 이내에 검수 결과를 서면 또는 전자우편으로 통지한다. 위 기간 내 이의가 없으면 검수를 마친 것으로 본다.",
          "제6조(지급) 을은 검수를 마친 날부터 30일 이내에 잔금을 지급한다." ] },
        { id: "D2", type: "이메일", title: "최종 산출물 납품 통지", date: "2026-03-10", by: "p1", paras: [
          "갑 → 을: 계약 제5조에 따라 최종 산출물(소스 · 운영 매뉴얼)을 오늘 납품합니다.",
          "첨부: 산출물 목록 1부, 테스트 결과 요약 1부." ] },
        { id: "D3", type: "이메일", title: "검수 의견 — 결제 모듈 오류 3건", date: "2026-03-17", by: "p2", paras: [
          "을 → 갑: 3월 10일 납품분을 검수한 결과 결제 모듈에서 오류 3건을 확인했습니다.",
          "계약 제5조의 검수 의견으로 통지하며, 수정 후 재납품을 요청합니다." ] },
        { id: "D4", type: "이메일", title: "수정 산출물 재납품", date: "2026-03-24", by: "p1", paras: [
          "갑 → 을: 3월 17일 지적하신 오류 3건을 수정해 재납품합니다.",
          "수정 내역서 1부를 첨부합니다." ] },
        { id: "D5", type: "공지", title: "을 회사 예약 서비스 정식 오픈 공지", date: "2026-04-01", by: "p2", paras: [
          "을 회사 홈페이지 공지: 4월 1일부터 새 웹 예약 서비스를 정식으로 운영합니다." ] },
        { id: "D6", type: "서면", title: "원고 준비서면 요지", date: "2026-07-02", by: "p1", paras: [
          "원고는 3월 10일 최종 산출물을 납품했고, 피고는 10일 이내에 아무런 이의를 제기하지 않았으므로 3월 20일 검수를 마친 것으로 보아야 한다고 주장한다.",
          "원고는 피고가 4월 1일부터 결과물을 실제 서비스에 사용하고 있다고 주장한다." ] },
        { id: "D7", type: "서면", title: "피고 답변서 요지", date: "2026-07-20", by: "p2", paras: [
          "피고는 3월 17일 검수 의견을 통지했으므로 3월 20일 검수 간주는 성립하지 않는다고 주장한다.",
          "피고는 재납품 이후에도 일부 오류가 남아 있었다고 주장한다." ] },
      ],
      events: [
        { id: "E1", date: "2026-01-15", label: "용역계약 체결", evidence: ["EV1"] },
        { id: "E2", date: "2026-03-10", label: "최종 산출물 납품", evidence: ["EV2"] },
        { id: "E3", date: "2026-03-17", label: "을의 검수 의견(오류 3건)", evidence: ["EV3"] },
        { id: "E4", date: "2026-03-24", label: "수정 산출물 재납품", evidence: ["EV4"] },
        { id: "E5", date: "2026-04-01", label: "을의 서비스 정식 오픈", evidence: ["EV5"] },
      ],
      issues: [
        { id: "I1", title: "검수 완료 시점", status: "needs_check" },
        { id: "I2", title: "잔금 지급기일", status: "unreviewed" },
        { id: "I3", title: "재납품 후 오류 잔존 여부", status: "unreviewed" },
      ],
      claims: [
        { id: "C1", issue: "I1", party: "p1", text: "10일 이내 이의가 없어 3월 20일 검수를 마쳤다", facts: { objection: false }, evidence: ["EV2", "EV1b", "EV6"], verification: "disputed" },
        { id: "C2", issue: "I1", party: "p2", text: "3월 17일 검수 의견을 통지했다", facts: { objection: true }, evidence: ["EV3"], verification: "supported" },
        { id: "C3", issue: "I2", party: "p1", text: "을은 4월 1일부터 결과물을 실제로 쓰고 있다", facts: { inUse: true }, evidence: ["EV5"], verification: "supported" },
        { id: "C4", issue: "I3", party: "p2", text: "재납품 이후에도 오류가 남아 있었다", facts: {}, evidence: ["EV7"], verification: "asserted" },
      ],
      evidence: [
        { id: "EV1", doc: "D1", loc: { para: 2 }, summary: "잔금 2,000만 원 — 계약 제3조" },
        { id: "EV1b", doc: "D1", loc: { para: 3 }, summary: "검수 10일 · 이의 없으면 검수 간주 — 계약 제5조" },
        { id: "EV2", doc: "D2", loc: { para: 1 }, summary: "3월 10일 최종 산출물 납품 통지" },
        { id: "EV3", doc: "D3", loc: { para: 1 }, summary: "3월 17일 오류 3건 검수 의견", record: { objection: true, date: "2026-03-17" } },
        { id: "EV4", doc: "D4", loc: { para: 1 }, summary: "3월 24일 수정 재납품" },
        { id: "EV5", doc: "D5", loc: { para: 1 }, summary: "4월 1일 서비스 정식 운영 공지", record: { inUse: true, date: "2026-04-01" } },
        { id: "EV6", doc: "D6", loc: { para: 1 }, summary: "원고 주장 — 이의 없음 · 3월 20일 검수 간주" },
        { id: "EV7", doc: "D7", loc: { para: 2 }, summary: "피고 주장 — 재납품 후 오류 잔존(뒷받침 자료 미제출)" },
      ],
      tasks: [
        { id: "T1", issue: "I1", text: "3월 17일 이메일이 계약 제5조의 '검수 결과 통지'에 해당하는지 확인", status: "needs_check" },
        { id: "T2", issue: "I2", text: "검수 완료일이 정해지면 그날부터 30일의 지급기일을 다시 계산", status: "unreviewed" },
        { id: "T3", issue: "I3", text: "피고에게 오류 잔존을 보여 줄 자료가 있는지 확인", status: "unreviewed" },
      ],
      matter: { stage: 3, assignee: "담당 변호사 A(가상)", docs: [["용역계약서", true], ["납품 · 검수 이메일", true], ["수정 내역서", false], ["세금계산서", false]],
        deadlines: [{ id: "DL1", label: "잔금 지급기일(검수 완료일 기준)", base: "2026-03-24", days: 30, kind: "약정기간", basis: ["민법-157"], note: "검수 완료일이 3월 20일인지 3월 24일 이후인지에 따라 달라집니다." }] },
      research: ["민법-664", "민법-665", "민법-390", "민법-157"],
    },
    {
      id: "LAX-CR-01", field: "criminal", title: "상가 출입문 유리 파손 사건 — 진술과 기록 대조 (가상)",
      summary: "상가 출입문 유리가 깨진 가상 사건입니다. 피의자 병의 귀가 시각 진술과 영상 · 결제 기록의 시각을 시간순으로 맞대어 봅니다.",
      participants: [{ id: "p1", role: "피의자", name: "병(가상)" }, { id: "p2", role: "목격자", name: "정(가상)" }, { id: "p3", role: "피해 상가", name: "무 상회(가상)" }],
      documents: [
        { id: "D1", type: "진술 요지", title: "피의자 병 진술 요지", date: "2026-05-03", by: "p1", paras: [
          "병은 사건 당일 21시 50분쯤 상가 앞을 지나 바로 귀가했다고 진술했다.",
          "병은 상가 출입문에 손을 댄 적이 없다고 진술했다." ] },
        { id: "D2", type: "진술 요지", title: "목격자 정 진술 요지", date: "2026-05-02", by: "p2", paras: [
          "정은 22시 40분쯤 유리 깨지는 소리를 듣고 밖을 내다봤다고 진술했다.",
          "정은 어두워서 사람의 얼굴은 보지 못했다고 진술했다." ] },
        { id: "D3", type: "확인 보고", title: "상가 CCTV 영상 확인 보고", date: "2026-05-04", by: "p3", paras: [
          "영상 화면에 표시된 시각 22시 41분, 모자를 쓴 사람이 출입문 앞에 서 있는 모습이 찍혔다.",
          "영상 장치의 시계가 실제 시각과 맞는지는 아직 확인하지 않았다." ] },
        { id: "D4", type: "결제 기록", title: "인근 편의점 카드 결제 기록 요약", date: "2026-05-05", by: "p1", paras: [
          "병 명의 카드로 22시 35분 상가에서 약 200m 떨어진 편의점에서 결제한 기록이 있다." ] },
      ],
      events: [
        { id: "E1", date: "2026-05-01 21:50", label: "병이 진술한 귀가 시각", evidence: ["EV1"] },
        { id: "E2", date: "2026-05-01 22:35", label: "인근 편의점 카드 결제", evidence: ["EV4"] },
        { id: "E3", date: "2026-05-01 22:40", label: "목격자가 소리를 들은 시각", evidence: ["EV2"] },
        { id: "E4", date: "2026-05-01 22:41", label: "CCTV 화면 표시 시각", evidence: ["EV3"] },
      ],
      issues: [
        { id: "I1", title: "사건 시각 무렵 병의 위치", status: "needs_check" },
        { id: "I2", title: "CCTV 시계의 정확성", status: "needs_check" },
        { id: "I3", title: "영상 속 인물의 식별", status: "unreviewed" },
      ],
      claims: [
        { id: "C1", issue: "I1", party: "p1", text: "21시 50분쯤 귀가했다", facts: { location: "21시 50분 이후 자택" }, evidence: ["EV1", "EV4"], verification: "disputed" },
        { id: "C2", issue: "I3", party: "p1", text: "출입문에 손을 댄 적이 없다", facts: {}, evidence: ["EV1b"], verification: "asserted" },
      ],
      evidence: [
        { id: "EV1", doc: "D1", loc: { para: 1 }, summary: "병 — 21시 50분쯤 귀가 진술" },
        { id: "EV1b", doc: "D1", loc: { para: 2 }, summary: "병 — 출입문 접촉 부인" },
        { id: "EV2", doc: "D2", loc: { para: 1 }, summary: "목격자 — 22시 40분쯤 소리" },
        { id: "EV3", doc: "D3", loc: { para: 1 }, summary: "CCTV 표시 시각 22시 41분(시계 오차 미확인)" },
        { id: "EV4", doc: "D4", loc: { para: 1 }, summary: "22시 35분 인근 편의점 결제", record: { location: "22시 35분 상가 인근 편의점" } },
      ],
      tasks: [
        { id: "T1", issue: "I2", text: "CCTV 장치 시계와 실제 시각의 차이 확인 요청", status: "needs_check" },
        { id: "T2", issue: "I1", text: "결제 카드를 병 본인이 사용했는지 확인", status: "unreviewed" },
        { id: "T3", issue: "I3", text: "영상 속 인물 식별 근거가 따로 있는지 확인", status: "unreviewed" },
      ],
      matter: { stage: 3, assignee: "담당 변호사 B(가상)", docs: [["진술 요지 2건", true], ["CCTV 원본 영상", false], ["카드 결제 원장", false]],
        deadlines: [] },
      research: ["형법-366"],
    },
    {
      id: "LAX-FM-01", field: "family", title: "이혼에 따른 재산분할 자료 분류 (가상)",
      summary: "가상 부부 기와 경의 재산분할 사건입니다. 재산마다 취득 시기와 형성 경위를 자료로 확인해 분할 대상 여부를 검토 과제로 나눕니다.",
      participants: [{ id: "p1", role: "청구인", name: "기(가상)" }, { id: "p2", role: "상대방", name: "경(가상)" }],
      documents: [
        { id: "D1", type: "등기 요약", title: "아파트 등기사항 요약", date: "2026-06-10", by: "p1", paras: [
          "소유자 경, 등기 원인 매매, 등기 접수 2021년 8월.",
          "근저당권 설정 — 채권최고액 1억 2,000만 원." ] },
        { id: "D2", type: "가족관계 요약", title: "혼인 신고 일자 요약", date: "2026-06-10", by: "p1", paras: [
          "기와 경의 혼인 신고일은 2020년 10월이다." ] },
        { id: "D3", type: "금융 요약", title: "예금 잔액 요약", date: "2026-06-12", by: "p2", paras: [
          "경 명의 정기예금 4,000만 원 — 2022년부터 매월 적립.",
          "기 명의 보통예금 900만 원." ] },
        { id: "D4", type: "서면", title: "상대방 경의 주장서면 요지", date: "2026-07-01", by: "p2", paras: [
          "경은 아파트를 혼인 전인 2019년에 취득한 자신의 고유재산이라고 주장한다.",
          "경은 근저당 대출은 아파트 취득을 위한 채무라고 주장한다." ] },
      ],
      events: [
        { id: "E1", date: "2020-10", label: "혼인 신고", evidence: ["EV2"] },
        { id: "E2", date: "2021-08", label: "아파트 등기 접수", evidence: ["EV1"] },
        { id: "E3", date: "2022-01", label: "정기예금 적립 시작", evidence: ["EV3"] },
      ],
      issues: [
        { id: "I1", title: "아파트가 분할 대상인지(취득 시기)", status: "needs_check" },
        { id: "I2", title: "혼인 중 적립한 예금", status: "unreviewed" },
        { id: "I3", title: "근저당 채무의 귀속", status: "unreviewed" },
      ],
      claims: [
        { id: "C1", issue: "I1", party: "p2", text: "아파트는 혼인 전(2019년) 취득한 고유재산이다", facts: { acquired: "2019" }, evidence: ["EV4", "EV1"], verification: "disputed" },
        { id: "C2", issue: "I3", party: "p2", text: "근저당 대출은 아파트 취득을 위한 채무다", facts: {}, evidence: ["EV4b"], verification: "asserted" },
      ],
      evidence: [
        { id: "EV1", doc: "D1", loc: { para: 1 }, summary: "등기 접수 2021년 8월", record: { acquired: "2021" } },
        { id: "EV2", doc: "D2", loc: { para: 1 }, summary: "혼인 신고 2020년 10월" },
        { id: "EV3", doc: "D3", loc: { para: 1 }, summary: "정기예금 — 2022년부터 적립" },
        { id: "EV4", doc: "D4", loc: { para: 1 }, summary: "경 — 2019년 취득 주장" },
        { id: "EV4b", doc: "D4", loc: { para: 2 }, summary: "경 — 대출은 취득 채무 주장" },
      ],
      tasks: [
        { id: "T1", issue: "I1", text: "2019년 계약 · 대금 지급 자료가 따로 있는지 확인(등기일과 취득 원인일이 다를 수 있음)", status: "needs_check" },
        { id: "T2", issue: "I3", text: "대출 실행일과 사용처 자료 요청", status: "unreviewed" },
      ],
      matter: { stage: 3, assignee: "담당 변호사 C(가상)", docs: [["등기사항 요약", true], ["매매계약서", false], ["대출 약정서", false], ["예금 거래내역", true]],
        deadlines: [{ id: "DL1", label: "재산분할청구권 행사기간(이혼한 날 기준)", base: "2026-09-01", days: 730, kind: "제척기간 후보", basis: ["민법-839의2"], note: "이혼한 날이 확정되지 않았습니다. 기간의 성격과 기산점은 담당 변호사가 확인합니다." }] },
      research: ["민법-839의2", "민법-157", "민법-161"],
    },
    {
      id: "LAX-CO-01", field: "corporate", title: "기술 협력 협상 중 비밀유지계약(NDA) 수정 검토 (가상)",
      summary: "가상 기업 신과 임이 공동 개발을 협상하며 주고받은 NDA 수정안을 검토합니다. 비밀정보의 범위 · 존속기간 · 손해배상 조항이 바뀌었습니다.",
      participants: [{ id: "p1", role: "의뢰 기업", name: "신 주식회사(가상)" }, { id: "p2", role: "상대 기업", name: "임 주식회사(가상)" }],
      documents: [
        { id: "D1", type: "이메일", title: "임 측 NDA 수정안 송부", date: "2026-04-08", by: "p2", paras: [
          "임 → 신: 협의한 내용을 반영한 NDA 수정안을 보냅니다. 비밀유지 기간과 손해배상 조항을 정리했습니다.",
          "이번 주 안에 서명을 희망합니다." ] },
        { id: "D2", type: "회의록", title: "1차 협상 회의록 요지", date: "2026-04-02", by: "p1", paras: [
          "양사는 비밀유지 기간을 계약 종료 후 2년으로 하기로 의견을 모았다.",
          "손해배상은 실제 손해를 기준으로 한다는 데 의견을 모았다." ] },
      ],
      events: [
        { id: "E1", date: "2026-04-02", label: "1차 협상 회의", evidence: ["EV2"] },
        { id: "E2", date: "2026-04-08", label: "임 측 수정안 송부", evidence: ["EV1"] },
      ],
      issues: [
        { id: "I1", title: "수정안이 회의 합의와 같은지", status: "needs_check" },
        { id: "I2", title: "손해배상액 예정 조항 추가", status: "needs_check" },
      ],
      claims: [
        { id: "C1", issue: "I1", party: "p2", text: "수정안은 협의한 내용을 반영했다", facts: { term: "계약 종료 후 5년" }, evidence: ["EV1", "EV2"], verification: "disputed" },
      ],
      evidence: [
        { id: "EV1", doc: "D1", loc: { para: 1 }, summary: "임 — 협의 내용 반영 수정안이라고 설명" },
        { id: "EV2", doc: "D2", loc: { para: 1 }, summary: "회의록 — 계약 종료 후 2년", record: { term: "계약 종료 후 2년" } },
      ],
      tasks: [
        { id: "T1", issue: "I1", text: "수정안 비밀유지 기간(5년)과 회의록(2년)의 차이를 상대방에 확인", status: "needs_check" },
        { id: "T2", issue: "I2", text: "손해배상액 예정 금액의 적정성은 사업 담당과 함께 검토", status: "unreviewed" },
      ],
      matter: { stage: 4, assignee: "담당 변호사 D(가상)", docs: [["NDA 초안", true], ["NDA 수정안", true], ["회의록", true]], deadlines: [] },
      research: ["민법-390"],
    },
    {
      id: "LAX-LB-01", field: "labor", title: "근로계약서 갱신안의 조항 변경 검토 (가상)",
      summary: "가상 회사 하가 직원 을과 갱신하려는 근로계약서 변경안을 검토합니다. 근로시간 · 임금 구성 · 경업금지 조항이 바뀌었고, 변경안 전달 시점에 대한 설명이 서로 다릅니다.",
      participants: [{ id: "p1", role: "사용자", name: "하 주식회사(가상)" }, { id: "p2", role: "근로자", name: "을(가상)" }],
      documents: [
        { id: "D1", type: "메신저 기록", title: "변경안 전달 메신저 기록 요약", date: "2026-02-27", by: "p2", paras: [
          "2월 27일 오후 5시 인사 담당이 변경안 파일을 을에게 전달했다.",
          "같은 날 오후 6시까지 서명해 달라는 요청이 함께 왔다." ] },
        { id: "D2", type: "의견서", title: "회사 인사 담당 의견서 요지", date: "2026-03-10", by: "p1", paras: [
          "회사는 변경안을 서명 3일 전인 2월 24일에 미리 설명했다고 밝혔다." ] },
      ],
      events: [
        { id: "E1", date: "2026-02-24", label: "회사가 말하는 사전 설명일", evidence: ["EV2"] },
        { id: "E2", date: "2026-02-27", label: "변경안 파일 전달 · 서명 요청", evidence: ["EV1"] },
      ],
      issues: [
        { id: "I1", title: "변경안을 언제 전달 · 설명했는지", status: "needs_check" },
        { id: "I2", title: "근로조건 변경 내용의 서면 명시", status: "unreviewed" },
      ],
      claims: [
        { id: "C1", issue: "I1", party: "p1", text: "서명 3일 전(2월 24일)에 미리 설명했다", facts: { delivered: "2026-02-24" }, evidence: ["EV2", "EV1"], verification: "disputed" },
      ],
      evidence: [
        { id: "EV1", doc: "D1", loc: { para: 1 }, summary: "2월 27일 변경안 파일 전달", record: { delivered: "2026-02-27" } },
        { id: "EV2", doc: "D2", loc: { para: 1 }, summary: "회사 — 2월 24일 사전 설명" },
      ],
      tasks: [
        { id: "T1", issue: "I1", text: "2월 24일 설명을 보여 주는 자료(회의 일정 · 메일)가 있는지 확인", status: "needs_check" },
        { id: "T2", issue: "I2", text: "변경된 임금 구성 · 근로시간이 서면에 명시됐는지 원문 확인", status: "unreviewed" },
      ],
      matter: { stage: 2, assignee: "담당 변호사 E(가상)", docs: [["기존 근로계약서", true], ["변경안", true], ["취업규칙", false]], deadlines: [] },
      research: ["근로기준법-17"],
    },
    {
      id: "LAX-AD-01", field: "admin", title: "음식점 영업정지 처분 관련 검토자료 정리 (가상)",
      summary: "가상 음식점 운영자 차가 받은 영업정지 처분에 대해 처분서 · 송달 · 사전통지 자료와 불복 기간의 기산점 후보를 정리합니다.",
      participants: [{ id: "p1", role: "처분 상대방", name: "차(가상 음식점 운영자)" }, { id: "p2", role: "처분청", name: "가상 구청" }],
      documents: [
        { id: "D1", type: "처분서", title: "영업정지 처분서 요지", date: "2026-09-01", by: "p2", paras: [
          "처분 일자 2026년 9월 1일, 영업정지 7일.",
          "처분 사유: 위생 점검 결과 보관 기준 위반(가상)." ] },
        { id: "D2", type: "송달 기록", title: "처분서 등기우편 수령 기록", date: "2026-09-04", by: "p2", paras: [
          "등기우편 수령일 2026년 9월 4일, 수령인 본인." ] },
        { id: "D3", type: "사전통지", title: "처분 사전통지서 송달 기록", date: "2026-08-18", by: "p2", paras: [
          "사전통지서 송달일 2026년 8월 18일, 의견 제출 기한 8월 28일." ] },
        { id: "D4", type: "진술 요지", title: "처분 상대방 차의 진술 요지", date: "2026-09-10", by: "p1", paras: [
          "차는 처분 전에 사전통지를 받지 못해 의견을 낼 기회가 없었다고 말했다." ] },
      ],
      events: [
        { id: "E1", date: "2026-08-18", label: "사전통지서 송달(기록상)", evidence: ["EV3"] },
        { id: "E2", date: "2026-09-01", label: "영업정지 처분", evidence: ["EV1"] },
        { id: "E3", date: "2026-09-04", label: "처분서 수령", evidence: ["EV2"] },
      ],
      issues: [
        { id: "I1", title: "사전통지 · 의견 제출 절차", status: "needs_check" },
        { id: "I2", title: "행정심판 · 소송 기간의 기산점", status: "needs_check" },
        { id: "I3", title: "처분 사유의 사실관계", status: "unreviewed" },
      ],
      claims: [
        { id: "C1", issue: "I1", party: "p1", text: "사전통지를 받지 못했다", facts: { preNotice: false }, evidence: ["EV4", "EV3"], verification: "disputed" },
      ],
      evidence: [
        { id: "EV1", doc: "D1", loc: { para: 1 }, summary: "처분일 2026년 9월 1일" },
        { id: "EV2", doc: "D2", loc: { para: 1 }, summary: "처분서 수령 2026년 9월 4일 — 기산점 후보" },
        { id: "EV3", doc: "D3", loc: { para: 1 }, summary: "사전통지서 송달 기록 8월 18일", record: { preNotice: true } },
        { id: "EV4", doc: "D4", loc: { para: 1 }, summary: "차 — 사전통지 미수령 진술" },
      ],
      tasks: [
        { id: "T1", issue: "I1", text: "8월 18일 송달의 수령인 · 방법 확인", status: "needs_check" },
        { id: "T2", issue: "I2", text: "'처분이 있음을 안 날'을 9월 4일로 볼지 확인", status: "needs_check" },
      ],
      matter: { stage: 3, assignee: "담당 변호사 F(가상)", docs: [["처분서", true], ["송달 기록", true], ["사전통지서 원본", false], ["위생 점검 결과서", false]],
        deadlines: [
          { id: "DL1", label: "행정심판 청구 기간 후보(안 날부터 90일)", base: "2026-09-04", days: 90, kind: "불변기간 후보", basis: ["행정심판법-27"], note: "기산점(안 날)이 9월 4일인지 확인해야 합니다." },
          { id: "DL2", label: "취소소송 제소 기간 후보(안 날부터 90일)", base: "2026-09-04", days: 90, kind: "불변기간 후보", basis: ["행정소송법-20"], note: "행정심판을 거치면 기산점이 달라질 수 있습니다." } ] },
      research: ["행정심판법-27", "행정소송법-20", "민법-157", "민법-161"],
    },
    {
      id: "LAX-RE-01", field: "realestate", title: "정비사업 공사도급계약 변경안과 절차 검토 (가상)",
      summary: "가상 정비사업 조합과 시공사 사이의 공사도급계약 변경안을 검토합니다. 공사비 조정 조항과 함께, 변경에 필요한 조합 내부 절차를 확인합니다.",
      participants: [{ id: "p1", role: "도급인", name: "가상 ○○구역 재건축정비사업조합" }, { id: "p2", role: "수급인", name: "가상 시공사 타 건설" }],
      documents: [
        { id: "D1", type: "요청서", title: "시공사 공사비 변경 요청서 요지", date: "2026-05-20", by: "p2", paras: [
          "시공사는 자재 가격 상승을 이유로 공사비 조정을 요청했다.",
          "시공사는 조합 이사회가 변경안을 이미 승인했다고 적었다." ] },
        { id: "D2", type: "회의록", title: "조합 이사회 회의록 요지", date: "2026-05-27", by: "p1", paras: [
          "안건 3. 공사비 변경안 — 추가 자료 제출을 요청하고 의결을 보류했다." ] },
        { id: "D3", type: "계약서", title: "공사도급계약서(변경 전) 요지", date: "2025-11-10", by: "p1", paras: [
          "도급금액은 계약 시 확정한다.",
          "설계 변경 비용은 수급인이 부담한다." ] },
      ],
      events: [
        { id: "E1", date: "2025-11-10", label: "공사도급계약 체결", evidence: ["EV3"] },
        { id: "E2", date: "2026-05-20", label: "시공사 공사비 변경 요청", evidence: ["EV1"] },
        { id: "E3", date: "2026-05-27", label: "조합 이사회 — 의결 보류", evidence: ["EV2"] },
      ],
      issues: [
        { id: "I1", title: "변경안의 조합 내부 승인 단계", status: "needs_check" },
        { id: "I2", title: "총회 의결이 필요한 사항인지", status: "needs_check" },
        { id: "I3", title: "공사비 조정 근거 자료", status: "unreviewed" },
      ],
      claims: [
        { id: "C1", issue: "I1", party: "p2", text: "조합 이사회가 변경안을 승인했다", facts: { board: "승인" }, evidence: ["EV1", "EV2"], verification: "disputed" },
        { id: "C2", issue: "I3", party: "p2", text: "자재 가격 상승으로 조정이 필요하다", facts: {}, evidence: ["EV1b"], verification: "asserted" },
      ],
      evidence: [
        { id: "EV1", doc: "D1", loc: { para: 2 }, summary: "시공사 — 이사회 승인 완료라고 기재" },
        { id: "EV1b", doc: "D1", loc: { para: 1 }, summary: "시공사 — 자재 가격 상승 이유(근거 자료 미첨부)" },
        { id: "EV2", doc: "D2", loc: { para: 1 }, summary: "이사회 회의록 — 의결 보류", record: { board: "보류" } },
        { id: "EV3", doc: "D3", loc: { para: 1 }, summary: "변경 전 계약 — 도급금액 계약 시 확정" },
      ],
      tasks: [
        { id: "T1", issue: "I1", text: "5월 27일 이후 이사회 재상정 여부 확인", status: "needs_check" },
        { id: "T2", issue: "I2", text: "정관과 관련 법령상 총회 의결 사항인지 확인", status: "needs_check" },
        { id: "T3", issue: "I3", text: "물가 자료 등 조정 근거 제출 요청", status: "unreviewed" },
      ],
      matter: { stage: 4, assignee: "담당 변호사 G(가상)", docs: [["공사도급계약서", true], ["변경 요청서", true], ["이사회 회의록", true], ["정관", false]], deadlines: [] },
      research: ["도시정비법-45", "민법-664"],
    },
  ];

  /* 계약서 두 버전 — 조항 key 로 맞대어 비교한다. tags 는 '중요 조항' 규칙이 보는 분류 */
  var contracts = [
    { id: "nda", ko: "비밀유지계약", en: "NDA", parties: "신(가상) · 임(가상)", v1: "초안 (2026. 4. 2 협상 반영)", v2: "임 측 수정안 (2026. 4. 8)",
      a: [
        { key: "purpose", no: "제1조", title: "목적", text: "양 당사자는 공동 개발 협의를 위하여 제공하는 정보를 이 계약에 따라 보호한다.", tags: [] },
        { key: "scope", no: "제2조", title: "비밀정보", text: "비밀정보는 서면으로 '비밀'이라고 표시하여 제공한 기술 · 영업 정보를 말한다.", tags: ["confidentiality"] },
        { key: "term", no: "제5조", title: "존속기간", text: "비밀유지 의무는 계약 종료 후 2년간 존속한다.", tags: ["term", "confidentiality"] },
        { key: "damages", no: "제7조", title: "손해배상", text: "위반한 당사자는 상대방이 입은 실제 손해를 배상한다.", tags: ["damages"] },
        { key: "court", no: "제9조", title: "관할", text: "이 계약에 관한 분쟁은 서울중앙지방법원을 제1심 관할법원으로 한다.", tags: ["jurisdiction"] },
      ],
      b: [
        { key: "purpose", no: "제1조", title: "목적", text: "양 당사자는 공동 개발 협의를 위하여 제공하는 정보를 이 계약에 따라 보호한다.", tags: [] },
        { key: "scope", no: "제2조", title: "비밀정보", text: "비밀정보는 표시 여부와 관계없이 협의 과정에서 제공되거나 알게 된 모든 기술 · 영업 정보를 말한다.", tags: ["confidentiality"] },
        { key: "term", no: "제5조", title: "존속기간", text: "비밀유지 의무는 계약 종료 후 5년간 존속한다.", tags: ["term", "confidentiality"] },
        { key: "damages", no: "제7조", title: "손해배상", text: "위반한 당사자는 위반 1건마다 금 1억 원을 손해배상액으로 지급한다.", tags: ["damages"] },
        { key: "court", no: "제9조", title: "관할", text: "이 계약에 관한 분쟁은 임 회사 본점 소재지 관할법원을 제1심 관할법원으로 한다.", tags: ["jurisdiction"] },
        { key: "nonsolicit", no: "제10조", title: "인력 유인 금지", text: "양 당사자는 계약 기간과 종료 후 1년간 상대방 직원에게 이직을 권유하지 않는다.", tags: [] },
      ] },
    { id: "service", ko: "용역계약", en: "Service Agreement", parties: "갑(가상) · 을(가상)", v1: "체결본 (2026. 1. 15)", v2: "변경 합의안 (2026. 3. 30 제안)",
      a: [
        { key: "fee", no: "제3조", title: "대금", text: "용역대금은 금 3,000만 원으로 하고, 착수금 1,000만 원과 잔금 2,000만 원으로 나누어 지급한다.", tags: ["payment"] },
        { key: "inspect", no: "제5조", title: "검수", text: "을은 최종 산출물을 납품받은 날부터 10일 이내에 검수 결과를 통지한다. 위 기간 내 이의가 없으면 검수를 마친 것으로 본다.", tags: ["term"] },
        { key: "pay", no: "제6조", title: "지급", text: "을은 검수를 마친 날부터 30일 이내에 잔금을 지급한다.", tags: ["payment", "term"] },
        { key: "liab", no: "제8조", title: "책임 제한", text: "갑의 손해배상 책임은 용역대금 총액을 한도로 한다.", tags: ["liability", "damages"] },
      ],
      b: [
        { key: "fee", no: "제3조", title: "대금", text: "용역대금은 금 3,000만 원으로 하고, 착수금 1,000만 원과 잔금 2,000만 원으로 나누어 지급한다.", tags: ["payment"] },
        { key: "inspect", no: "제5조", title: "검수", text: "을은 최종 산출물을 납품받은 날부터 20일 이내에 검수 결과를 통지한다.", tags: ["term"] },
        { key: "pay", no: "제6조", title: "지급", text: "을은 검수를 마친 날부터 60일 이내에 잔금을 지급한다.", tags: ["payment", "term"] },
        { key: "liab", no: "제8조", title: "책임 제한", text: "갑의 손해배상 책임은 용역대금 총액을 한도로 한다.", tags: ["liability", "damages"] },
        { key: "maint", no: "제9조", title: "하자 보수", text: "갑은 검수 완료 후 6개월간 하자를 무상으로 보수한다.", tags: [] },
      ] },
    { id: "employment", ko: "근로계약", en: "Employment Contract", parties: "하(가상) · 을(가상)", v1: "기존 계약 (2025. 3. 1)", v2: "갱신 변경안 (2026. 2. 27 전달)",
      a: [
        { key: "hours", no: "제3조", title: "근로시간", text: "근로시간은 오전 9시부터 오후 6시까지(휴게 1시간)로 한다.", tags: ["term"] },
        { key: "wage", no: "제4조", title: "임금", text: "월 기본급 320만 원을 매월 25일에 지급한다.", tags: ["payment"] },
        { key: "probation", no: "제6조", title: "수습", text: "수습 기간은 3개월로 한다.", tags: ["term"] },
        { key: "end", no: "제8조", title: "계약의 종료", text: "계약 종료는 관련 법령과 취업규칙에 따른다.", tags: ["termination"] },
      ],
      b: [
        { key: "hours", no: "제3조", title: "근로시간", text: "근로시간은 오전 9시부터 오후 6시까지(휴게 1시간)로 하되, 업무상 필요하면 연장근로를 할 수 있다.", tags: ["term"] },
        { key: "wage", no: "제4조", title: "임금", text: "월 기본급 290만 원과 고정 연장근로수당 30만 원을 매월 25일에 지급한다.", tags: ["payment"] },
        { key: "end", no: "제8조", title: "계약의 종료", text: "계약 종료는 관련 법령과 취업규칙에 따른다.", tags: ["termination"] },
        { key: "noncompete", no: "제9조", title: "경업 금지", text: "을은 퇴직 후 1년간 동종 업체에 취업하지 않는다.", tags: ["termination"] },
      ] },
    { id: "b2b", ko: "기업 간 거래계약", en: "Supply Agreement", parties: "신(가상) · 임(가상)", v1: "기존 공급계약 (2025. 7. 1)", v2: "갱신안 (2026. 6. 15)",
      a: [
        { key: "price", no: "제4조", title: "단가", text: "공급 단가는 개당 1만 2,000원으로 하고, 계약 기간 동안 변경하지 않는다.", tags: ["payment"] },
        { key: "paydays", no: "제5조", title: "대금 지급", text: "매월 말일 마감하여 다음 달 10일에 지급한다.", tags: ["payment"] },
        { key: "termin", no: "제9조", title: "해지", text: "어느 당사자든 3개월 전에 서면으로 통지하고 해지할 수 있다.", tags: ["termination"] },
        { key: "dispute", no: "제12조", title: "분쟁 해결", text: "분쟁은 서울중앙지방법원을 관할법원으로 한다.", tags: ["jurisdiction"] },
      ],
      b: [
        { key: "price", no: "제4조", title: "단가", text: "공급 단가는 개당 1만 2,000원으로 하되, 원자재 가격이 10% 이상 오르면 협의하여 조정할 수 있다.", tags: ["payment"] },
        { key: "paydays", no: "제5조", title: "대금 지급", text: "매월 말일 마감하여 다음 달 10일에 지급한다.", tags: ["payment"] },
        { key: "termin", no: "제9조", title: "해지", text: "임은 1개월 전에 서면으로 통지하고 해지할 수 있다.", tags: ["termination"] },
        { key: "dispute", no: "제12조", title: "분쟁 해결", text: "분쟁은 대한상사중재원의 중재로 최종 해결한다.", tags: ["jurisdiction"] },
      ] },
    { id: "construction", ko: "부동산·건설계약", en: "Construction Contract", parties: "가상 조합 · 가상 시공사", v1: "공사도급계약 (2025. 11. 10)", v2: "시공사 변경 요청안 (2026. 5. 20)",
      a: [
        { key: "scope", no: "제2조", title: "공사 범위", text: "지상 12층으로 시공한다.", tags: [] },
        { key: "cost", no: "제4조", title: "공사비", text: "도급금액은 계약 시 확정한다.", tags: ["payment"] },
        { key: "progress", no: "제6조", title: "기성 지급", text: "기성은 매월 정산해 지급한다.", tags: ["payment"] },
        { key: "design", no: "제8조", title: "책임", text: "설계 변경 비용은 수급인이 부담한다.", tags: ["liability"] },
        { key: "delay", no: "제10조", title: "지체상금", text: "수급인이 준공기한을 넘기면 지체 1일마다 도급금액의 1,000분의 1을 지급한다.", tags: ["damages"] },
      ],
      b: [
        { key: "scope", no: "제2조", title: "공사 범위", text: "지상 15층으로 시공한다(설계 변경).", tags: [] },
        { key: "cost", no: "제4조", title: "공사비", text: "물가 변동 시 도급금액을 조정할 수 있다.", tags: ["payment"] },
        { key: "progress", no: "제6조", title: "기성 지급", text: "기성은 매월 정산해 지급한다.", tags: ["payment"] },
        { key: "design", no: "제8조", title: "책임", text: "설계 변경 비용은 도급인이 부담한다.", tags: ["liability"] },
        { key: "delay", no: "제10조", title: "지체상금", text: "수급인이 준공기한을 넘기면 지체 1일마다 도급금액의 1,000분의 0.5를 지급하고, 그 총액은 도급금액의 10%를 넘지 않는다.", tags: ["damages", "liability"] },
      ] },
  ];

  /* 법령 · 자료 — verbatim 이 true 인 원문도 '작성 시점 텍스트'이며 원문 대조가 필요하다 */
  var NOTE = "작성 시점(2026. 11)에 옮긴 텍스트 — 국가법령정보센터 API 에 연결돼 있지 않아 현행 여부는 원문에서 확인해야 합니다.";
  var sources = [
    { id: "민법-390", type: "law", law: "민법", article: "제390조", title: "채무불이행과 손해배상", verbatim: true,
      text: ["채무자가 채무의 내용에 좇은 이행을 하지 아니한 때에는 채권자는 손해배상을 청구할 수 있다. 그러나 채무자의 고의나 과실없이 이행할 수 없게 된 때에는 그러하지 아니하다."],
      summary: "채무를 내용대로 이행하지 않으면 손해배상을 청구할 수 있고, 채무자에게 고의 · 과실이 없으면 예외가 된다는 일반 규정입니다.", tags: ["손해배상", "채무불이행", "이행", "계약"] },
    { id: "민법-664", type: "law", law: "민법", article: "제664조", title: "도급의 의의", verbatim: true,
      text: ["도급은 당사자 일방이 어느 일을 완성할 것을 약정하고 상대방이 그 일의 결과에 대하여 보수를 지급할 것을 약정함으로써 그 효력이 생긴다."],
      summary: "도급은 일의 완성과 그 결과에 대한 보수 지급을 약속하는 계약입니다. 용역 · 공사계약의 성격을 검토할 때 출발점이 됩니다.", tags: ["도급", "용역", "공사", "보수", "완성"] },
    { id: "민법-665", type: "law", law: "민법", article: "제665조", title: "보수의 지급시기", verbatim: true,
      text: ["① 보수는 그 완성된 목적물의 인도와 동시에 지급하여야 한다. 그러나 목적물의 인도를 요하지 아니하는 경우에는 그 일을 완성한 후 지체없이 지급하여야 한다.", "② 전항의 보수에 관하여는 기간으로 정한 보수 또는 관습에 의하여 정한 보수의 지급시기에 관한 규정을 준용한다."],
      summary: "약정이 없으면 보수는 완성된 목적물의 인도와 동시에 지급합니다. 계약에 검수 · 지급 기한이 따로 있으면 그 약정을 먼저 봅니다.", tags: ["보수", "지급시기", "대금", "인도", "용역"] },
    { id: "민법-157", type: "law", law: "민법", article: "제157조", title: "기간의 기산점", verbatim: true,
      text: ["기간을 일, 주, 월 또는 연으로 정한 때에는 기간의 초일은 산입하지 아니한다. 그러나 그 기간이 오전 영시로부터 시작하는 때에는 그러하지 아니하다."],
      summary: "일 · 주 · 월 · 연 단위 기간은 첫날을 빼고 셉니다(초일 불산입). 이 시연의 기한 계산이 따르는 규칙입니다.", tags: ["기간", "기산점", "초일", "기한"] },
    { id: "민법-161", type: "law", law: "민법", article: "제161조", title: "공휴일 등과 기간의 만료점", verbatim: true,
      text: ["기간의 말일이 토요일 또는 공휴일에 해당한 때에는 기간은 그 익일로 만료한다."],
      summary: "말일이 토요일 · 공휴일이면 다음 날 끝납니다. 이 시연은 토 · 일요일만 반영하고 공휴일 달력은 넣지 않았습니다.", tags: ["기간", "공휴일", "만료", "기한"] },
    { id: "민법-839의2", type: "law", law: "민법", article: "제839조의2", title: "재산분할청구권", verbatim: true,
      text: ["① 협의상 이혼한 자의 일방은 다른 일방에 대하여 재산분할을 청구할 수 있다.", "③ 제1항의 재산분할청구권은 이혼한 날부터 2년을 경과한 때에는 소멸한다."],
      summary: "이혼한 일방은 재산분할을 청구할 수 있고, 이혼한 날부터 2년이 지나면 소멸합니다(제2항 생략).", tags: ["재산분할", "이혼", "가사", "2년"] },
    { id: "행정심판법-27", type: "law", law: "행정심판법", article: "제27조", title: "심판청구의 기간", verbatim: true,
      text: ["① 행정심판은 처분이 있음을 알게 된 날부터 90일 이내에 청구하여야 한다.", "③ 행정심판은 처분이 있었던 날부터 180일이 지나면 청구하지 못한다. 다만, 정당한 사유가 있는 경우에는 그러하지 아니하다."],
      summary: "처분이 있음을 안 날부터 90일, 처분이 있었던 날부터 180일 안에 청구해야 합니다(제2항 · 제4항 이하 생략).", tags: ["행정심판", "청구기간", "90일", "처분", "기한"] },
    { id: "행정소송법-20", type: "law", law: "행정소송법", article: "제20조", title: "제소기간", verbatim: true,
      text: ["① 취소소송은 처분등이 있음을 안 날부터 90일 이내에 제기하여야 한다. 다만, 제18조제1항 단서에 규정한 경우와 그 밖에 행정심판청구를 할 수 있는 경우 또는 행정청이 행정심판청구를 할 수 있다고 잘못 알린 경우에 행정심판청구가 있은 때의 기간은 재결서의 정본을 송달받은 날부터 기산한다.",
        "② 취소소송은 처분등이 있은 날부터 1년(제1항 단서의 경우는 재결이 있은 날부터 1년)을 경과하면 이를 제기하지 못한다. 다만, 정당한 사유가 있는 때에는 그러하지 아니하다."],
      summary: "취소소송은 안 날부터 90일, 있은 날부터 1년 안에 제기해야 하고, 행정심판을 거치면 재결서 송달일부터 셉니다.", tags: ["취소소송", "제소기간", "90일", "처분", "기한"] },
    { id: "근로기준법-17", type: "law", law: "근로기준법", article: "제17조", title: "근로조건의 명시", verbatim: false, text: [],
      summary: "사용자가 근로계약을 맺거나 변경할 때 임금 · 근로시간 등 근로조건을 명시하고, 일부 사항은 서면으로 교부하도록 한 규정입니다. 이 시연에는 원문을 싣지 않았습니다.", tags: ["근로계약", "근로조건", "서면", "임금", "근로시간"] },
    { id: "도시정비법-45", type: "law", law: "도시 및 주거환경정비법", lawLink: "도시및주거환경정비법", article: "제45조", title: "총회의 의결", verbatim: false, text: [],
      summary: "정비사업 조합의 총회 의결 사항을 정한 조문입니다. 시공자와의 계약 및 그 변경이 의결 사항에 해당하는지는 정관과 함께 원문에서 확인해야 합니다. 이 시연에는 원문을 싣지 않았습니다.", tags: ["총회", "조합", "정비사업", "의결", "계약 변경"] },
    { id: "형법-366", type: "law", law: "형법", article: "제366조", title: "재물손괴등", verbatim: false, text: [],
      summary: "타인의 재물 등을 손괴하는 행위를 처벌하는 조문입니다. 구성요건 해당 여부는 사실관계 확인 뒤 변호사가 판단합니다. 이 시연에는 원문을 싣지 않았습니다.", tags: ["손괴", "형사", "재물"] },
    { id: "판례-안내", type: "precedent", law: "판례", article: "", title: "판례는 이 시연에 싣지 않았습니다", verbatim: false, text: [],
      summary: "존재하지 않는 판례 번호나 판시사항을 만들지 않기 위해 판례 원문을 넣지 않았습니다. 대법원 종합법률정보 · 국가법령정보센터에서 직접 검색하세요.", tags: ["판례", "대법원", "판결"], url: "https://glaw.scourt.go.kr/" },
  ];
  sources.forEach(function (s) {
    s.org = s.type === "precedent" ? "대법원 종합법률정보" : "국가법령정보센터(법제처)";
    if (!s.url) s.url = LAW(s.lawLink || s.law, s.article || "");
    s.asOf = s.verbatim ? NOTE : "원문 미수록 — 출처 확인 필요";
  });

  var STAGES = ["상담 접수", "수임 검토", "담당자 배정", "자료 수집", "업무 진행", "변호사 검토", "종결"];

  var market = {
    service: "법조시장 한눈에", url: "https://legal-pulse-pearl.vercel.app",
    cadence: "서비스 설명 기준 하루 단위 갱신(열린국회정보 · 국가법령정보센터 · 대한변협 공개 자료). 이 화면에는 그 데이터를 옮기지 않았습니다.",
    flow: ["외부 환경의 변화", "업무상 영향 후보", "추가 조사", "전문가 판단"],
    areas: [
      ["civil", "법률안 · 시행 예정 법령 — 계약 · 채권 관련 개정"], ["labor", "노동 분야 발의 법률안"], ["realestate", "재개발 · 재건축 법률안과 판례(정비사업 화면)"],
      ["corporate", "기업 · 상사 분야 법령 변화"], ["family", "가사 · 상속 분야"], ["admin", "행정 규제 변화"], ["criminal", "형사 분야"],
    ],
  };

  var DATA = { version: "2026.11.07", fields: fields, cases: cases, contracts: contracts, sources: sources, stages: STAGES, market: market,
    notice: "개인 구현 공개 시연 · 모든 사건과 문서는 가상 자료입니다. 실제 의뢰인 정보 및 사내 비공개 자료를 포함하지 않습니다." };
  if (typeof module === "object" && module.exports) module.exports = DATA;
  else root.LAX_DATA = DATA;
})(typeof window !== "undefined" ? window : this);
