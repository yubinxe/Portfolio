/* Build AES-256-GCM encrypted Admin Vault (`vault-data.enc.json`).
 * Dual key-wrapped DEK:
 *   1) ID/PW: yubin120866::yubin040518!
 *   2) Quick PIN: PIN::1208
 * Plaintext source is assembled from verified non-PII benchmarks & public corpus assets;
 * raw client names, case numbers, and NAS paths are never included.
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
    version: "2026.11-vault-v1",
    generatedAt: new Date().toISOString(),
    owner: "김유빈 (Yubin Kim) · 법무법인 경국 전략기획실",
    classification: "ADMIN AUTHENTICATED · ZERO CLIENT PII",
    securityNote: "사내 \\\\SERVER 실물 원문·의뢰인 성명·사건번호는 제외하고, 아키텍처·비식별 워크플로 통계·상업화 코퍼스만 암호화 탑재했습니다."
  },
  kpis: {
    totalFiles: bench.shares.reduce((s, x) => s + x.total_files, 0),
    totalGb: Number(bench.shares.reduce((s, x) => s + x.total_gb, 0).toFixed(2)),
    extractedFiles: bench.shares.reduce((s, x) => s + x.extracted_files, 0),
    totalChunks: bench.shares.reduce((s, x) => s + x.total_chunks, 0),
    corpusDocs: signals.total_docs,
    corpusChunks: signals.total_chunks,
    corpusChars: signals.total_chars
  },
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
      label: "PDF 문서 (스캔·전자혼재)",
      total: 148739,
      extracted: 84453,
      gap: 64286,
      coveragePct: 56.8,
      gb: 339.83,
      insight: "전체 PDF의 43.2%(64,286건)가 스캔 이미지·비텍스트 PDF. 범용 LLM 업로드 방식은 타임아웃·누락 발생 → 로컬 OCR 야간 배치 파이프라인이 필수 병목 해결책."
    },
    {
      ext: ".hwp / .hwpx",
      label: "한글 문서 (OLE2 레거시)",
      total: 28577,
      extracted: 14653,
      gap: 13924,
      coveragePct: 51.3,
      gb: 13.92,
      insight: "한국 법원·조합·관공서 문서의 표준 포맷. HWP 5.0 Binary(zlib PrvText/BodyText) 전용 파서를 직접 구현해 Zero-Copy 스트리밍 색인 달성."
    },
    {
      ext: ".jpg / .png / .mp4",
      label: "현장 증빙 · 영상 · 도면 이미지",
      total: 26541,
      extracted: 0,
      gap: 26541,
      coveragePct: 0,
      gb: 405.33,
      insight: "현장 사진·녹취(.wav 530건)·영상(.mp4 399건)이 400GB 초과. 파일명·폴더 계층 trigram 색인으로 즉시 탐색하고 멀티모달 메타 인덱싱으로 확장."
    },
    {
      ext: ".xlsx / .xls",
      label: "보상·정산·수발신 엑셀 원장",
      total: 6781,
      extracted: 6492,
      gap: 289,
      coveragePct: 95.7,
      gb: 3.4,
      insight: "시트 단위 텍스트화 적중률 95.7%. 정비사업 용역비 단가 비교 기준선 및 급여명세서·수발신대장 자동화 원천으로 직결."
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
      w.key === "provisional_injunction" ? "가장 긴급도가 높은 가처분·집행정지 소명 자료. 제출 기한·증거 누락 방지를 위한 1차 스캔·쟁점 매핑 우선 타깃." :
      w.key === "urban_renewal_union" ? "법무법인 경국의 핵심 주력 분야(재개발·재건축·관리처분). 총회 정족수·입찰비교·보상 77장 분석 등 고부가 AX 집약 영역." :
      w.key === "redevelopment_compensation" ? "공익사업 수용·재결·청산금 분쟁. 광명시흥 3기 신도시 보상 절차 77장 구조화 노하우가 직결되는 데이터군." :
      w.key === "family_inheritance" ? "이혼·상속·유류분 가사 실무 및 홍보 콘텐츠 데이터(가사블로그 926건 추출). 비식별 사례 패턴화 및 인입 분류에 활용." :
      w.key === "contract_delegation" ? "위임계약·약정서·내용증명 표준 양식 및 변경 대조(Contract Diff) 수요군. 표준 양식 즉시 검색 응답 구현." :
      "신탁사 책임준공·공사비 증액 갈등 분쟁군. 도급계약 특약 및 입주지연 조항 리스크 검증 파이프라인 직결."
  })),
  internalSystems: [
    {
      id: "ax-server-brain",
      code: "00",
      title: "사내 NAS Zero-Copy 온디바이스 지식 엔진",
      en: "kyungguk-server-brain (SQLite FTS5 · 4 Domain Agents)",
      status: "사내 로컬 운용 중",
      summary: "사내 NAS 1.18TB 데이터를 로컬 PC에 복제하지 않고 SMB 스트리밍으로 222,486개 파일과 674,953 청크를 온디바이스 FTS5(trigram) DB로 색인. 외부 클라우드 API 전송 0건.",
      pipeline: [
        "1. Zero-Copy SMB 스캐너 (mtime·크기 기반 증분 감지)",
        "2. 멀티포맷 파서 (HWP 5.0 OLE2 · HWPX · PyMuPDF · DOCX · XLSX)",
        "3. SQLite WAL + FTS5 trigram 청킹 (한국어 부분 문자열 즉시 매칭)",
        "4. 의도 기반 4대 도메인 라우터 (경영·양식 / 미래전략 / 송무 / 통합)",
        "5. 온디바이스 근거 파일 ID + 원본 경로 반출 (보안 격리 8개 공유폴더 접근 차단)"
      ],
      metrics: ["222,486 파일 메타 인덱싱", "674,953 텍스트 청크", "외부 클라우드 유출 0건", "실시간 live-extract Fallback"]
    },
    {
      id: "ax-reg",
      code: "01",
      title: "법령·규제 변화 관제 시스템",
      en: "RE:INTELLIGENCE · Regulatory Monitoring",
      status: "경국 사내 구축 · 상세 아키텍처",
      summary: "도시정비법·공익사업법·서울시 고시 개정 사항을 사업지 진행 단계(추진위→조합설립→사업시행→관리처분)와 자동 매칭해 변호사 검토 큐로 적재.",
      pipeline: [
        "1. 법제처·국토부·서울시 입법예고/고시 변경점 수집",
        "2. 조문 단위 Diff 추출 및 영향 사업 단계 태깅",
        "3. 진행 중 사건의 사업 단계(관리처분·수용재결 등)와 교차 매핑",
        "4. 위험 등급 산정 후 담당 변호사 주간 브리핑 큐 생성 (최종 판단은 변호사)"
      ],
      metrics: ["정비사업 24,621건 지식 문맥 연계", "조문 Diff 자동 추적", "HITL 변호사 최종 확정"]
    },
    {
      id: "ax-build",
      code: "02",
      title: "정비사업 총회결의 위험 검토 시스템",
      en: "Assembly Risk Engine",
      status: "경국 사내 구축 · 상세 아키텍처",
      summary: "정비사업 총회 성원 보고 전, 직접참석·서면결의서·철회서·대리인 위임장 명부를 규칙 엔진으로 교차 검증해 정족수 하자(총회무효 리스크)를 사전 차단.",
      pipeline: [
        "1. 조합원 명부 + 서면결의서 + 현장 참석 스캔본 정합성 입력",
        "2. 중복 제출·철회 시점·공동소유 대표선임·배우자 대리 요건 규칙 검증",
        "3. 안건별 가중 의결정족수(일반 1/2 vs 특별 2/3) 실시간 시뮬레이션",
        "4. 경계선 위험(±3표 이내 변동) 및 보완 필요 명부 PDF 리포트 반출"
      ],
      metrics: ["공동소유·철회 중복 자동 검출", "의결정족수 시뮬레이션", "하자 소송 사전 예방"]
    },
    {
      id: "ax-comp",
      code: "03",
      title: "공사도급계약 변경 위험 분석 시스템",
      en: "Contract Risk Intelligence",
      status: "경국 사내 구축 · 상세 아키텍처",
      summary: "초안·수정본·시공사 제안서 간의 조항 단위 변경(물가연동·공사비 증액·책임준공 면책·지체상금)을 구조적으로 비교해 불리한 은닉 수정을 탐지.",
      pipeline: [
        "1. HWP/PDF/DOCX 계약서 버전별 조항 트리(제n조 제m항) 파싱",
        "2. 단서 조항 신설·금액·기한·면책 사유 변조 자동 하이라이트",
        "3. 신탁·공사비 분쟁 판례 체크리스트(입주예정일 연장 설명의무 등) 대조",
        "4. 협상 코멘트 초안 생성 → 담당 변호사 수정·승인 게이트"
      ],
      metrics: ["은닉 단서·면책 조항 Diff 탐지", "신탁·공사비 2,379건 문맥 반영", "조항별 검토 이력 추적"]
    }
  ],
  actualDeliverables: [
    {
      title: "광명시흥 3기 신도시 보상자료 분석 (발표자료 77장)",
      domain: "공익사업·토지보상 실무",
      outcome: "수용재결·대토보상·이주대책·영업보상 등 방대한 보상 공고와 질의 문서를 절차·쟁점별 77장 구조화 발표자료로 재편해 내부 브리핑 및 의뢰인 설명 기준선 확립."
    },
    {
      title: "정비사업 공공입찰·용역비 단가 비교 기준선",
      domain: "정비사업 데이터 정형화",
      outcome: "나라장터 및 정비사업 정보몽땅에 흩어진 용역 입찰·선정 단가 데이터를 정기 수집·정규화해 조합·자문 단가 타당성 검토 기준선 수립."
    },
    {
      title: "송무팀 AX 온보딩 & 급여명세서·고객메일 자동화",
      domain: "법무법인 운영 혁신",
      outcome: "초기 AI 도입에 반발하던 송무 실무진에 ‘단순 대조=시스템 / 최종 판단·협상=사람’ 역할 분담을 제시해 상급자 검수 하에 전사 온보딩 완료. 급여명세서 자동 발송 및 인입 메일 분류 파이프라인 사내 운영."
    }
  ],
  commercialTracks: signals.commercial_tracks,
  ragSeed: ragSeed
};

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
  v: 1,
  alg: "AES-256-GCM",
  kdf: "PBKDF2-SHA256",
  pwWrap: wrapKey("yubin120866::yubin040518!"),
  pinWrap: wrapKey("PIN::1208"),
  iv: dataIv.toString("base64"),
  ciphertext: Buffer.concat([encData, dataTag]).toString("base64")
};

const outPath = path.join(ROOT, "vault-data.enc.json");
fs.writeFileSync(outPath, JSON.stringify(vaultFile), "utf8");
console.log(`Built encrypted vault: ${outPath} (${(Buffer.byteLength(JSON.stringify(vaultFile)) / 1024).toFixed(1)} KB, plain=${(jsonBuf.length / 1024).toFixed(1)} KB)`);
