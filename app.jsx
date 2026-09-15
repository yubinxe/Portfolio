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
        <Marquee />
        <Composite />
        <Trajectory />
        <Artifacts />
        <Lectures />
        <Ledger />
        <About />
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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
