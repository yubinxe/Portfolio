/* Build AES-256-GCM encrypted Admin Vault (`vault-data.enc.json`) for Galerie Privée (vault.html).
 * Dual key-wrapped DEK:
 *   1) ID/PW — 값은 저장소에 두지 않음(로컬 환경 변수 · 비밀 관리)
 *   2) Quick PIN — 값은 저장소에 두지 않음
 * Strictly uses Gyunggook spelling and sanitized non-PII architectural & chronicle records.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HQ_DATA = "C:\\Users\\경국\\.gemini\\antigravity\\scratch\\Blog-PR-HQ\\data";

function readJsonSafe(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

const bench = readJsonSafe(path.join(HQ_DATA, "internal_ax_benchmarks.json"), null);
const signals = readJsonSafe(path.join(HQ_DATA, "commercial_signals.json"), null);
const ragSeed = readJsonSafe(path.join(HQ_DATA, "portfolio_rag_seed.json"), []);

if (!bench || !signals) {
  throw new Error("Missing Blog-PR-HQ data files. Run analyze_firm_ax_benchmarks.py and build_commercial_corpus.py first.");
}

const vaultPayload = {
  meta: {
    version: "2026.11-louvre-v2",
    generatedAt: new Date().toISOString(),
    owner: "김유빈 (Yubin Kim) · Gyunggook Strategy & Planning",
    classification: "GALERIE PRIVÉE · GYUNGGOOK ARCHIVE · ZERO CLIENT PII",
    securityNote: "법무법인 경국(Law Firm Gyunggook) 사내 \\\\SERVER 실물 원문·의뢰인 실명·사건번호·개인 연락처는 일절 포함하지 않고, 비식별 데이터 아키텍처·실무 시스템 명세·현장 수행 연대기만 암호화 전시합니다."
  },
  principles: [
    { no: "I", title: "기준은 사람이 정하고, 1차 작업만 맡긴다", desc: "고객 메일 분류는 분류 기준을 사람이 고정하고 첫 분류·우선순위화만 자동화했습니다." },
    { no: "II", title: "확인 못 한 것은 단정하지 않는다", desc: "집캐치는 확인되지 않은 자격을 불충족으로 처리하지 않고, 근거 없는 당첨 확률을 계산하지 않습니다." },
    { no: "III", title: "시연과 실적을 섞지 않는다", desc: "가상 벤치마크 시연과 Gyunggook 사내 도입 시스템을 엄격히 구분해 사실 그대로 기록합니다." },
    { no: "IV", title: "실패하면 실패한 이유를 보여준다", desc: "수집이 실패하거나 합계가 맞지 않는 자료는 조용히 덮지 않고 검증 게이트에서 즉시 차단합니다." },
    { no: "V", title: "최종 판단은 책임지는 사람에게 남긴다", desc: "법률 AX는 검토 대상·조항 차이·정족수를 구조화하는 데까지 하고, 최종 법률 판단은 변호사가 내립니다." }
  ],
  kpis: {
    totalFiles: bench.shares.reduce((s, x) => s + x.total_files, 0),
    totalGb: Number(bench.shares.reduce((s, x) => s + x.total_gb, 0).toFixed(2)),
    extractedFiles: bench.shares.reduce((s, x) => s + x.extracted_files, 0),
    totalChunks: bench.shares.reduce((s, x) => s + x.total_chunks, 0),
    corpusDocs: signals.total_docs,
    corpusChunks: signals.total_chunks,
    corpusChars: signals.total_chars
  },
  monoliths: [
    { fig: "222,486", unit: "INDEXED FILES", sub: "1,183.57 GB · Zero-Copy NAS", label: "Gyunggook 전사 지식 엔진" },
    { fig: "674,953", unit: "FTS5 CHUNKS", sub: "Trigram 색인 · 외부 유출 0건", label: "온디바이스 검색 파이프라인" },
    { fig: "77", unit: "SLIDES", sub: "광명시흥 3기 신도시 보상 구조화", label: "공익사업 수용·재결 분석" },
    { fig: "2.0", unit: "SEC · MOBILE LCP", sub: "5.2s → 2.0s · 느린 4G · CPU 4배 감속", label: "집캐치 첫 화면 개선" }
  ],
  shares: bench.shares.map((s) => ({
    domain:
      s.share === "소송" ? "송무·사건 기록 아카이브" :
      s.share === "미래전략" ? "미래전략·대외협력·PR" :
      s.share === "1 법무법인경국" ? "법인 운영·표준 양식·정비실적" :
      "가사·상속 법률 콘텐츠",
    code: s.share,
    totalFiles: s.total_files,
    totalGb: s.total_gb,
    extractedFiles: s.extracted_files,
    pendingFiles: s.pending_or_ocr_files,
    chunks: s.total_chunks
  })),
  formatBottlenecks: [
    {
      ext: ".pdf",
      label: "PDF 문서 (스캔·전자 혼재)",
      total: 148739,
      extracted: 84453,
      gap: 64286,
      coveragePct: 56.8,
      gb: 339.83,
      insight: "전체 PDF의 43.2%(64,286건)가 스캔 이미지·비텍스트 PDF. 범용 클라우드 LLM 업로드는 보안·타임아웃 한계 → 로컬 PyMuPDF 판별 + 야간 OCR 배치 파이프라인이 핵심 병목 해법."
    },
    {
      ext: ".hwp / .hwpx",
      label: "한글 문서 (OLE2 레거시)",
      total: 28577,
      extracted: 14653,
      gap: 13924,
      coveragePct: 51.3,
      gb: 13.92,
      insight: "한국 법원·조합·관공서 실무의 표준 포맷. HWP 5.0 Binary(zlib PrvText/BodyText) 전용 파서를 직접 구현해 NAS 원문을 로컬 복제 없이 실시간 스트리밍 색인."
    },
    {
      ext: ".jpg / .png / .mp4",
      label: "현장 증빙 · 영상 · 녹취",
      total: 26541,
      extracted: 0,
      gap: 26541,
      coveragePct: 0,
      gb: 405.33,
      insight: "현장 사진·녹취(.wav 530건)·영상(.mp4 399건)이 405GB 이상 분포. 파일명·상위 사건폴더 trigram 메타 인덱싱으로 즉시 소환 가능."
    },
    {
      ext: ".xlsx / .xls",
      label: "보상·정산·수발신 엑셀 원장",
      total: 6781,
      extracted: 6492,
      gap: 289,
      coveragePct: 95.7,
      gb: 3.4,
      insight: "시트 단위 정형 텍스트 추출률 95.7%. 정비사업 용역비 단가 비교 기준선 및 급여명세서·수발신대장 자동화 원천으로 직결."
    },
    {
      ext: ".dwg",
      label: "정비사업 CAD 건축 도면",
      total: 5581,
      extracted: 0,
      gap: 5581,
      coveragePct: 0,
      gb: 24.51,
      insight: "재개발·수용 보상 현장의 핵심 기술 도면 5,581건. 일반 로펌 툴로는 관리 불가 → 도면 리비전·구역명 매핑 메타데이터 인덱스 구축."
    }
  ],
  workflowSignals: bench.workflow_title_signals
    .slice()
    .sort((a, b) => b.indexed_file_title_hits - a.indexed_file_title_hits)
    .map((w) => ({
      key: w.key,
      label: w.label,
      hits: w.indexed_file_title_hits,
      terms: w.terms,
      engineeringNote:
        w.key === "provisional_injunction" ? "가장 긴급도가 높은 가처분·집행정지·가압류 소명 자료군(34,119건 매칭). 제출 기한·증거 누락 방지를 위한 1차 스캔 및 쟁점 매핑 최우선 타깃." :
        w.key === "urban_renewal_union" ? "법무법인 경국(Gyunggook)의 핵심 주력 분야(재개발·재건축·관리처분). 총회 정족수 검증·입찰단가 기준선·보상 77장 구조화 노하우가 집중된 도메인." :
        w.key === "redevelopment_compensation" ? "공익사업 수용·재결·청산금 분쟁군. 광명시흥 3기 신도시 보상 절차 77장 구조화 및 감정평가법 정제 경험이 직결되는 영역." :
        w.key === "family_inheritance" ? "이혼·유류분·상속재산분할 실무 및 가사 콘텐츠(926건 추출) 아카이브. 판례 패턴화 및 비식별 상담 인입 분류 자동화 타깃." :
        w.key === "contract_delegation" ? "위임계약·약정서·내용증명 표준 양식 및 변경 대조(Contract Diff) 수요군. 표준 양식 즉시 검색·오탈자 검증 적용." :
        "신탁사 책임준공·공사비 증액 갈등 분쟁군. 도급계약 특약 및 입주예정일 자동연장 설명의무 조항 리스크 검증 파이프라인 직결."
    })),
  internalSystems: [
    {
      id: "ax-server-brain",
      code: "OEUVRE 00",
      subtitle: "On-Device Enterprise Knowledge Engine",
      title: "사내 NAS Zero-Copy 온디바이스 지식 엔진",
      en: "Gyunggook Server Brain · SQLite FTS5 · 4 Domain Agents",
      status: "사내 온디바이스 운용 중",
      narrative: "클라우드에 사건 자료 단 1바이트도 올릴 수 없는 법무법인 환경에서, Synology NAS(\\\\SERVER) 1.18TB 데이터를 로컬 PC 복제 없이 스트리밍으로 색인해 한국어 부분 문자열(trigram) 즉시 검색과 4대 도메인 에이전트(경영·양식 / 미래전략 / 송무 / 통합)를 구현했습니다.",
      pipeline: [
        "I. Zero-Copy SMB 스트리밍 스캔 (mtime·파일 크기 기반 증분 변경분만 감지)",
        "II. 멀티포맷 파서 엔진 (HWP 5.0 OLE2 zlib BodyText · HWPX · PyMuPDF · DOCX · XLSX)",
        "III. SQLite WAL + FTS5 trigram 청킹 (222,486 파일 → 674,953 청크, 외부 전송 0건)",
        "IV. 4대 도메인 라우터 (질의 의도 기반 경영/양식·미래전략·송무·통합 에이전트 분기)",
        "V. 보안 격리 게이트 (권한 제한 8개 공유폴더 접근 차단 + 근거 파일 ID·상대경로 반환)"
      ],
      metrics: ["222,486 파일 인덱싱", "1,183.57 GB 연결", "674,953 FTS5 청크", "클라우드 유출 0건"]
    },
    {
      id: "ax-reg",
      code: "OEUVRE 01",
      subtitle: "Regulatory Diff & Impact Queue",
      title: "법령·규제 변화 관제 시스템",
      en: "RE:INTELLIGENCE · Regulatory Monitoring",
      status: "Gyunggook 사내 구축 · 공식 도입",
      narrative: "정비사업은 법령·조례·지자체 고시 하나가 바뀌어도 조합 총회와 인허가 일정이 흔들립니다. 변경된 조문을 먼저 찾아 사업지별 현재 단계(추진위·조합·사업시행·관리처분)와 엮어 변호사 검토 큐로 넘기는 체계를 만들었습니다.",
      pipeline: [
        "I. 도시정비법·공익사업법·서울시 고시 변경 이력 수집 및 스냅샷 저장",
        "II. 조문 단위 Diff 탐지 (정족수 비율·동의 기간·공개공지 산정식 등 수치 변화 식별)",
        "III. 진행 중 사업지 단계와 영향 조문 교차 매핑",
        "IV. 검토 우선순위 큐 생성 → 담당 변호사 최종 확인·확정 (HITL)"
      ],
      metrics: ["정비사업 24,621건 맥락 연계", "조문 Diff 자동 추출", "변호사 최종 검수 게이트"]
    },
    {
      id: "ax-build",
      code: "OEUVRE 02",
      subtitle: "Quorum & Validity Ruleset",
      title: "정비사업 총회결의 위험 검토 시스템",
      en: "Assembly Risk Engine",
      status: "Gyunggook 사내 구축 · 공식 도입",
      narrative: "총회 성원 보고 직전까지 쏟아지는 직접참석·서면결의서·철회서·공동소유 위임장 대조는 사람이 밤새 수작업으로 해도 실수가 발생하기 쉬운 영역이었습니다. 정족수 요건과 중복·철회 규칙을 코드화해 경계선 하자 리스크를 사전에 드러냈습니다.",
      pipeline: [
        "I. 조합원 명부 + 서면결의서 + 철회서 + 대리인 위임장 정규화 입력",
        "II. 중복 제출·철회 도달 시점·공동소유 대표선임·배우자/직계 대리 요건 규칙 검증",
        "III. 안건별 가중 의결정족수(일반 1/2 vs 특별 2/3·3/4) 실시간 시뮬레이션",
        "IV. ±3표 경계선 경고 및 보완 대상 명부 리스트 출력"
      ],
      metrics: ["공동소유·철회 중복 검출", "경계선 정족수 시뮬레이션", "총회 무효 소송 예방"]
    },
    {
      id: "ax-comp",
      code: "OEUVRE 03",
      subtitle: "Clause Tree Comparison",
      title: "공사도급계약 변경 위험 분석 시스템",
      en: "Contract Risk Intelligence",
      status: "Gyunggook 사내 구축 · 공식 도입",
      narrative: "송무·자문 현장에서 수백 페이지 도급계약서와 변경합의서의 조항 사이사이에 슬쩍 끼워 넣어진 단서 조항과 면책 문구를 놓치지 않도록, 조항 트리 단위 비교와 신탁·공사비 분쟁 체크리스트 대조를 구현했습니다.",
      pipeline: [
        "I. 초안·수정본·시공사 제안서(HWP/PDF/DOCX) 조항 트리(제n조 제m항) 파싱",
        "II. 금액·기성 조건·물가변동(ESC)·지체상금·면책 단서 신설/삭제 자동 하이라이트",
        "III. 신탁 책임준공 및 입주지연 설명의무 주요 분쟁 체크포인트 대조",
        "IV. 수정 근거 초안 정리 → 담당 변호사 협상안 확정"
      ],
      metrics: ["은닉 단서 조항 Diff 탐지", "신탁·공사비 2,379건 맥락", "협상 코멘트 추적"]
    },
    {
      id: "ax-ops",
      code: "OEUVRE 04",
      subtitle: "Change Management & Internal Ops",
      title: "송무팀과 역할 분담 · 급여명세서 · 메일 분류 자동화",
      en: "Operations Automation & Organizational Adoption",
      status: "사내 실무 적용 · 인계 완료",
      narrative: "시스템이 쓰이려면 현업 담당자의 리스크 감각과 역할 변화 우려를 먼저 존중해야 했습니다. 소장 편집과 법원 외근을 함께 하며 확인 업무의 부담을 듣고, 반복 대조는 프로그램 · 소송 대응과 최종 판단은 담당자로 역할을 함께 나눈 뒤 상급자 검수를 거쳐 공식 도입했습니다(전 구성원 사용).",
      pipeline: [
        "I. 현업 인터뷰: '확인 작업에 하루 몇 시간을 쓰시나요?'부터 질문해 업무 부담과 우려 파악",
        "II. NAVER WORKS 연동 급여명세서 PDF 생성 · 발송 전 파일 · 수신자 대조와 불일치 예외 분리 · 자동 발송 구축 및 실무 인계",
        "III. 고객 인입 메일 우선순위 분류 기준(사람 정의) + 자동 분류 화면 사내 배포",
        "IV. 변호사 요청 기반 맞춤형 데이터·업무 스크립트 지속 제작"
      ],
      metrics: ["공식 도입 · 전 구성원 사용", "급여 자동화 실무 인계", "송무팀과 역할 분담 합의"]
    }
  ],
  chronicles: [
    {
      period: "2026. 06 · 01–04주차",
      act: "ACT I · 바닥부터 발로 뛴 송무·법무의 기본기",
      headline: "법무 SW(LawTop)·NAS 동기화부터 대구김천지청 출장 · 법원 외근 · 등기부 분석까지",
      story: "전략기획실 첫 달은 책상 앞 코딩이 아니라 법무법인의 혈관이 어떻게 뛰는지 온몸으로 익힌 시간이었습니다. Claude Pro 도입 품의부터 감정평가법 핵심 이론서 PDF→HWP 변환, 대구지검 김천지청 출장 외근, 서울법원청사 우체국·등기국·주민센터를 오간 빠른등기·법인인감·주소보정 외근, 채권압류 및 유류분 서면 검토, 그리고 경국 네이버 블로그·동사모 카페 법률 콘텐츠 제작 로직 수립까지 하루를 쪼개 현장을 배웠습니다.",
      artifacts: ["감정평가법 PDF→HWP 정제", "대구지검·서울중앙지법 외근 및 수발신대장 관리", "가사·상속 판례 콘텐츠 파이프라인", "양재 aT 법률산업박람회 참관"]
    },
    {
      period: "2026. 07 – 08 · 05–13주차",
      act: "ACT II · 흩어진 실무 데이터를 구조와 자동화로 빚다",
      headline: "광명시흥 보상 77장 · 용역비 단가 기준선 · 급여명세서 자동화 사내 인계",
      story: "현장의 반복 고통이 눈에 들어오면서 기획과 기술이 붙기 시작했습니다. 공익사업 수용재결·협의·감정평가 절차를 뼈대로 광명시흥 3기 신도시 보상자료 77장을 구조화했고, 정비사업 공공입찰·용역비 데이터를 정기 수집해 단가 비교 기준선을 세웠습니다. 동부지검 보존과 증거 지정·신한은행 집행비용 납부 외근과 병행하며 NAVER WORKS 기반 급여명세서 자동 발송을 완성해 실무 과장님께 정식 인계했습니다.",
      artifacts: ["광명시흥 3기 신도시 보상 분석 77장", "정비사업 입찰·용역비 단가 기준선", "NAVER WORKS 급여명세서 자동화 구축·인계", "서울고법·고양지원 집행 외근 & 배당이의 쟁점 검토"]
    },
    {
      period: "2026. 09 · 박람회 전 16일",
      act: "ACT III · 집캐치(ZipCatch) — 박람회 시연을 위한 방향 전환과 성능 개선",
      headline: "박람회 시연 16일 전, 사업자 CRM을 과감히 버리고 소비자 서비스로 9.17 하루 54커밋",
      story: "9월 30일 코엑스 집코노미 박람회를 16일 앞두고, 첫 사흘 만에 B2B CRM 구조를 접고 관람객이 바로 써 보는 소비자 서비스로 방향을 바꿔 사업 설명 덱과 시연 시나리오를 먼저 정했습니다. 구현은 AI 코딩 도구(Claude Code)에 맡기고, 공고 데이터 해석 · 화면 설계 · 검수와 배포 판단은 직접 했습니다. 박람회 뒤 모바일 첫 화면(LCP)을 5.2초에서 2.0초로 줄였고(390×844 · CPU 4배 감속 · 느린 4G · 3회 측정), 11월 부동산산업의 날 한국경제 · 중앙일보에 소개되었습니다.",
      artifacts: ["B2B CRM → 소비자 서비스로 방향 전환", "모바일 LCP 5.2초 → 2.0초(느린 4G · CPU 4배 감속)", "집코노미·부동산산업의 날 KREMA 부스 시연", "한국경제·중앙일보·서울파이낸스 보도"]
    },
    {
      period: "2026. 10 – 11 · AX 공식 도입 & 검증",
      act: "ACT IV · 송무팀과 역할 분담, 22만 건 서버 브레인, 그리고 AI 시대의 검증 철학",
      headline: "송무팀과 역할 분담 공동 설계 · Gyunggook Server Brain 1.18TB · Trial Brief 가상 사건 15/15 검증",
      story: "정비사업 AX 3종에서 기술보다 중요했던 것은 현업 담당자의 역할 변화 우려와 리스크 감각이었습니다. 송무팀의 확인 시간을 묻고 '반복 대조는 프로그램, 소송 대응과 최종 판단은 담당자'로 역할을 함께 나눈 뒤 상급자 검수를 거쳐 공식 도입했습니다(전 구성원 사용). 이어 사내 NAS 222,486개 파일(1,183.57GB)을 클라우드 유출 없이 색인하는 온디바이스 지식 엔진과 가상 민사사건 3건에 넣은 불일치 · 누락 15개 항목을 오탐 0건으로 찾아낸 Trial Brief(가상 사건 테스트), 국민 대토론회 자산분과 1위, 파리 15구 교류까지 실무와 정책·기술을 하나로 엮었습니다.",
      artifacts: ["정비사업 AX 3종 공식 도입", "Gyunggook Server Brain (222,486파일·674,953청크)", "Trial Brief 가상 사건 15/15 검출 · 오탐 0건", "국민 대토론회 자산분과 1위 & 4시간 블로그·RAG 자동화"]
    }
  ],
  actualDeliverables: [
    {
      title: "광명시흥 3기 신도시 보상자료 분석 (발표자료 77장)",
      domain: "공익사업·토지보상 실무",
      outcome: "수용재결·대토보상·이주대책·영업보상 등 방대한 보상 공고와 질의 문서를 절차(사업인정→조서→감정평가→협의→재결→소송)×쟁점별 77장 구조화 발표자료로 재편해 내부 브리핑 및 의뢰인 설명 기준선 확립."
    },
    {
      title: "정비사업 공공입찰·용역비 단가 비교 기준선",
      domain: "정비사업 데이터 정형화",
      outcome: "정비사업 공공입찰 공고와 용역 계약 단가 데이터를 정기 수집·정규화해 조합·자문 단가 타당성 검토 기준선 수립."
    },
    {
      title: "법률 AX 공식 도입 변화관리 & 급여·메일 자동화",
      domain: "법무법인 운영 혁신",
      outcome: "송무 담당자들과 ‘반복 대조=프로그램 / 소송 대응 · 최종 판단=담당자’ 역할 분담을 함께 정하고 상급자 검수를 거쳐 공식 도입(전 구성원 사용). NAVER WORKS 급여명세서 자동 발송 사내 인계 및 고객 메일 우선순위 분류 화면 구축."
    }
  ],
  commercialTracks: signals.commercial_tracks.map((t) => ({
    ...t,
    core_asset: String(t.core_asset || "").replace(/kyungguk/gi, "Gyunggook")
  })),
  ragSeed: ragSeed
};

/* 열쇠는 저장소에 두지 않는다 — 로컬에서 YK_VAULT_ID · YK_VAULT_PW · YK_VAULT_PIN 환경 변수로 넣고 빌드 */
const VAULT_ID = process.env.YK_VAULT_ID, VAULT_PW = process.env.YK_VAULT_PW, VAULT_PIN = process.env.YK_VAULT_PIN;
if (!VAULT_ID || !VAULT_PW || !VAULT_PIN) throw new Error("YK_VAULT_ID · YK_VAULT_PW · YK_VAULT_PIN 환경 변수가 필요합니다.");
const jsonBuf = Buffer.from(JSON.stringify(vaultPayload), "utf8");
const dek = crypto.randomBytes(32);

function wrapKey(passphrase) {
  const salt = crypto.randomBytes(16);
  const kek = crypto.pbkdf2Sync(passphrase, salt, 150000, 32, "sha256");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", kek, iv);
  const enc = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    wrapped: Buffer.concat([enc, tag]).toString("base64"),
    iterations: 150000
  };
}

const dataIv = crypto.randomBytes(12);
const dataCipher = crypto.createCipheriv("aes-256-gcm", dek, dataIv);
const encData = Buffer.concat([dataCipher.update(jsonBuf), dataCipher.final()]);
const dataTag = dataCipher.getAuthTag();

const vaultFile = {
  v: 2,
  alg: "AES-256-GCM",
  kdf: "PBKDF2-SHA256",
  pwWrap: wrapKey(VAULT_ID + "::" + VAULT_PW),
  pinWrap: wrapKey("PIN::" + VAULT_PIN),
  iv: dataIv.toString("base64"),
  ciphertext: Buffer.concat([encData, dataTag]).toString("base64")
};

const outPath = path.join(ROOT, "vault-data.enc.json");
fs.writeFileSync(outPath, JSON.stringify(vaultFile), "utf8");
console.log(`Built encrypted Gyunggook Louvre vault: ${outPath} (${(Buffer.byteLength(JSON.stringify(vaultFile)) / 1024).toFixed(1)} KB, plain=${(jsonBuf.length / 1024).toFixed(1)} KB)`);
