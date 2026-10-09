/* 루트 컴포넌트 — 섹션 조립과 테마 패널 연결.
 * TWEAK_DEFAULTS · PALETTES 는 index.html 인라인 스크립트에 있습니다(편집 패널이 그 블록을 덮어씀). */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--accent", t.accent);
    const p = t.pastels || PALETTES["Original pastels"];
    ["--butter", "--apple", "--sky", "--lilac", "--pink"].forEach((v, i) => r.style.setProperty(v, p[i]));
    document.body.classList.toggle("motion-calm", t.motion === "calm");
  }, [t.accent, t.pastels, t.motion]);

  const palName = Object.keys(PALETTES).find(k => JSON.stringify(PALETTES[k]) === JSON.stringify(t.pastels)) || "Original pastels";

  return (
    <div id="top">
      <Nav />
      <main>
        <Hero />
        <Ledger />
        <About />
        <Composite />
        <Artifacts />
        <Trajectory />
        <Lectures />
        <Contact />
      </main>

      <TweaksPanel>
        <TweakSection label="Palette" />
        <TweakSelect label="Pastel set" value={palName}
          options={Object.keys(PALETTES)}
          onChange={(v) => setTweak("pastels", PALETTES[v])} />
        <TweakColor label="Accent" value={t.accent}
          options={["#1F2D6B", "#111111", "#3A3631", "#7A5230", "#6A4E8C"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Motion" />
        <TweakRadio label="Interaction" value={t.motion}
          options={["bouncy", "calm"]}
          onChange={(v) => setTweak("motion", v)} />
      </TweaksPanel>
    </div>
  );
}

/* #root 에는 빌드 시점에 같은 컴포넌트로 미리 렌더한 HTML 이 들어 있다(scripts/prerender.mjs).
 * 검색 수집기는 JS 없이 본문을 읽고, 브라우저는 그 DOM 을 그대로 이어받는다(hydrate). */
const rootEl = document.getElementById("root");
const markMounted = () => document.documentElement.setAttribute("data-app", "ready");
function Mounted() {
  React.useEffect(markMounted, []);
  return <App />;
}
if (rootEl.firstElementChild) ReactDOM.hydrateRoot(rootEl, <Mounted />);
else ReactDOM.createRoot(rootEl).render(<Mounted />);
