import type { ReactNode } from "react";

export const APPS = [
  { id: "reconcile-gate", code: "C-1", ko: "데이터 교차검증 게이트", en: "ReconcileGate" },
  { id: "ops-triage", code: "C-2", ko: "리스크 차단형 인바운드 트리아지", en: "Ops Triage & Circuit Breaker" },
  { id: "claim-verifier", code: "C-3", ko: "의사결정 메모 팩트체커", en: "Claim-to-Source Verifier" },
] as const;
export type AppId = (typeof APPS)[number]["id"];

/* 정직성 라벨 — 세 앱 공통. 바꾸면 포트폴리오 테스트(test/ax-c.test.mjs)가 잡는다 */
export const HONESTY = "개인 구현 · 공개 시연 (가상 벤치마크 검증)";

export function Shell({ app, title, question, children, right }: { app: AppId; title: string; question: string; children: ReactNode; right?: ReactNode }) {
  const me = APPS.find((a) => a.id === app)!;
  return (
    <div className="ax">
      <header className="ax-top">
        <a className="ax-back" href="../../index.html#ax-c">← 김유빈 포트폴리오</a>
        <p className="ax-brand"><b>{me.code} {me.en}</b><span>{me.ko}</span></p>
        <nav className="ax-apps" aria-label="범용 AX 3종">
          {APPS.map((a) => <a key={a.id} href={"../" + a.id + "/"} aria-current={a.id === app ? "page" : undefined}>{a.code} {a.ko}</a>)}
        </nav>
      </header>
      <p className="ax-label" role="note"><b>{HONESTY}</b> — 모든 데이터는 가상이며 실제 기업 · 고객 자료가 없습니다. 외부 AI 호출 없이 결정론적 코드로 동작합니다.</p>
      <div className="ax-hero">
        <div>
          <p className="ax-k">{me.code} · 범용 기업 AX</p>
          <h1>{title}</h1>
          <p className="ax-q">{question}</p>
        </div>
        {right}
      </div>
      {children}
      <footer className="ax-foot">
        <b>공개 시연 · 결정론적 검증 엔진 · 가상 벤치마크 데이터.</b> 화면의 수치는 이 페이지가 내장한 가상 데이터로 지금 계산한 값이며, 실무 도입 · 시간 단축 효과는 측정하지 않았습니다.
        김유빈 개인 구현 — 법무법인 경국(Gyunggook) 도입 시스템이 아닙니다. 소스 · 테스트: 포트폴리오 저장소 <span className="kbd">ax-lab/</span>
      </footer>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: [T, string][]; value: T; onChange: (t: T) => void; label: string }) {
  return (
    <div className="ax-tabs" role="tablist" aria-label={label}>
      {tabs.map(([k, t]) => (
        <button key={k} type="button" role="tab" aria-selected={k === value} onClick={() => onChange(k)}>{t}</button>
      ))}
    </div>
  );
}

export function download(name: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type: type + ";charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
