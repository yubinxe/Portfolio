/* 고의 왜곡 10건 — 깨끗한 초안(Stage 1 결과)의 한 문장을 바꿔 넣고, 검증기가 그 문장 · 그 토큰을 잡는지 본다 */
import type { Memo } from "./pipeline";

export interface Distortion {
  id: string; ko: string; kind: string; sentence: string; from: string; to: string;
  expect: { verdict: "MISMATCH" | "UNVERIFIED"; issue: string; draft?: string; source?: string };
}

export const DISTORTIONS: Distortion[] = [
  { id: "V01", ko: "성장률 한 자리 부풀리기", kind: "수치 변조", sentence: "C5", from: "14.2%", to: "14.8%", expect: { verdict: "MISMATCH", issue: "value", draft: "14.8%", source: "14.2%" } },
  { id: "V02", ko: "당기 · 전년 매출 맞바꾸기", kind: "기간 혼동", sentence: "C1", from: "412.6억원으로 전년 동기(368.0억원)", to: "368.0억원으로 전년 동기(412.6억원)", expect: { verdict: "MISMATCH", issue: "period", draft: "368.0억원", source: "368.0억원" } },
  { id: "V03", ko: "원문에 없는 인과관계 끼워 넣기", kind: "인과 날조", sentence: "C3", from: "3분기 신규 계약은 128건으로 전년 동기(104건) 대비 23.1% 늘었다. [S1:4]", to: "누리솔루션의 가격 인상으로 3분기 신규 계약이 128건으로 늘었다. [S1:4][S4:3]", expect: { verdict: "UNVERIFIED", issue: "causal" } },
  { id: "V04", ko: "억원을 백만원으로 단위 바꾸기", kind: "단위 변형", sentence: "C1", from: "412.6억원", to: "412.6백만원", expect: { verdict: "MISMATCH", issue: "unit", draft: "412.6백만원", source: "412.6억원" } },
  { id: "V05", ko: "%p 를 % 로 바꾸기", kind: "단위 변형", sentence: "C4", from: "0.7%p", to: "0.7%", expect: { verdict: "MISMATCH", issue: "unit", draft: "0.7%", source: "-0.7%p" } },
  { id: "V06", ko: "시행일 1년 앞당기기", kind: "날짜 변조", sentence: "C6", from: "2027. 1. 1", to: "2026. 1. 1", expect: { verdict: "MISMATCH", issue: "value", draft: "2026. 1. 1", source: "2027. 1. 1" } },
  { id: "V07", ko: "다른 원천의 숫자를 엉뚱한 출처로 인용", kind: "출처 혼동", sentence: "C7", from: "[S4:2]", to: "[S2:2]", expect: { verdict: "UNVERIFIED", issue: "elsewhere", draft: "12곳" } },
  { id: "V08", ko: "경쟁사 이름 바꾸기", kind: "고유명사 변조", sentence: "C8", from: "누리솔루션", to: "한빛솔루션", expect: { verdict: "MISMATCH", issue: "entity", draft: "한빛솔루션", source: "누리솔루션" } },
  { id: "V09", ko: "원문에 없는 지표 덧붙이기", kind: "근거 없는 수치", sentence: "C9", from: "들었다.", to: "들었고, 고객 만족도는 92점이다.", expect: { verdict: "UNVERIFIED", issue: "nosource", draft: "92점" } },
  { id: "V10", ko: "신규 계약 건수 자리 바꾸기", kind: "수치 변조", sentence: "C3", from: "128건", to: "182건", expect: { verdict: "MISMATCH", issue: "value", draft: "182건", source: "128건" } },
];

export function applyDistortion(m: Memo, d: Distortion): Memo {
  return { ...m, sentences: m.sentences.map((s) => {
    if (s.id !== d.sentence) return s;
    if (!s.text.includes(d.from)) throw new Error(`${d.id}: ${d.sentence} 에 '${d.from}' 이 없습니다`);
    return { ...s, text: s.text.replace(d.from, d.to) };
  }) };
}
