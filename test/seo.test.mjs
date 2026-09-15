/* SEO 회귀 방지 — 구조화 데이터 · canonical · sitemap · 색인 정책 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const SITE = "https://yubinxe.github.io/Portfolio/";
const PAGES = ["index.html", "career.html", "gallery.html", "lecture.html"];

const ldBlocks = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test("공개 페이지마다 canonical · description · 한글 이름이 담긴 title", () => {
  for (const f of PAGES) {
    const s = read(f);
    assert.match(s, /<link rel="canonical" href="https:\/\/yubinxe\.github\.io\/Portfolio\//, f + " canonical");
    const title = /<title>([^<]+)<\/title>/.exec(s)[1];
    assert.ok(title.includes("김유빈"), f + " title 에 한글 이름: " + title);
    assert.ok(title.length <= 70, f + " title 길이 " + title.length);
    const desc = /<meta name="description" content="([^"]+)"/.exec(s)[1];
    assert.ok(desc.includes("김유빈"), f + " description 에 한글 이름");
    assert.ok(desc.length >= 70 && desc.length <= 300, f + " description 길이 " + desc.length);
  }
});

test("공개 페이지마다 Open Graph 와 Twitter 카드", () => {
  for (const f of PAGES) {
    const s = read(f);
    for (const tag of ["og:title", "og:description", "og:image", "og:url", "twitter:card"]) {
      assert.ok(s.includes(tag), f + " 에 " + tag + " 누락");
    }
  }
});

test("JSON-LD 가 파싱되고 Person 엔티티가 한 번만 정의된다", () => {
  const personDefs = [];
  for (const f of PAGES) {
    for (const d of ldBlocks(read(f))) {
      assert.equal(d["@context"], "https://schema.org", f);
      for (const node of d["@graph"] || [d]) {
        assert.ok(node["@type"], f + " @type 누락");
        if (node["@type"] === "Person") personDefs.push(f);
      }
    }
  }
  assert.deepEqual(personDefs, ["index.html"], "Person 은 index.html 에서만 정의하고 다른 페이지는 @id 로 참조");
});

test("Person 구조화 데이터가 핵심 필드를 담는다", () => {
  const graph = ldBlocks(read("index.html"))[0]["@graph"];
  const person = graph.find((n) => n["@type"] === "Person");
  assert.equal(person.name, "김유빈");
  assert.ok(person.alternateName.includes("Yubin Kim"));
  assert.equal(person["@id"], SITE + "#person");
  for (const k of ["jobTitle", "worksFor", "alumniOf", "knowsAbout", "hasCredential", "sameAs", "image", "url"]) {
    assert.ok(person[k], "Person." + k + " 누락");
  }
  assert.ok(person.sameAs.every((u) => /^https:\/\//.test(u)), "sameAs 는 절대 URL");
});

test("강의 ItemList 가 8과정이고 앵커 URL 이 실제 id 와 맞는다", () => {
  const graph = ldBlocks(read("index.html"))[0]["@graph"];
  const list = graph.find((n) => n["@type"] === "ItemList");
  assert.equal(list.numberOfItems, 8);
  assert.equal(list.itemListElement.length, 8);
  const sections = read("sections.jsx");
  for (const el of list.itemListElement) {
    const id = el.item.url.split("#")[1];
    assert.ok(sections.includes(`id: "${id}"`), "sections.jsx 에 " + id + " 없음");
    assert.equal(el.item.provider["@id"], SITE + "#person");
  }
});

test("sitemap 이 실제 파일을 가리키고 robots 가 sitemap 을 알린다", () => {
  const sm = read("sitemap.xml");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length >= 3);
  for (const loc of locs) {
    assert.ok(loc.startsWith(SITE), "sitemap URL 이 사이트 밖: " + loc);
    const rel = loc.slice(SITE.length) || "index.html";
    assert.ok(existsSync(join(ROOT, rel)), "sitemap 이 없는 파일을 가리킴: " + rel);
  }
  const robots = read("robots.txt");
  assert.ok(robots.includes("Sitemap: " + SITE + "sitemap.xml"));
  assert.ok(robots.includes("Disallow: /admin.html"));
});

test("비공개·레거시 페이지는 색인에서 제외된다", () => {
  for (const f of ["admin.html", "Ethan Kim Portfolio.html", "404.html"]) {
    assert.match(read(f), /<meta name="robots" content="noindex/, f + " noindex 누락");
  }
  for (const f of PAGES) {
    assert.ok(!/content="noindex/.test(read(f)), f + " 가 noindex 로 잠겨 있음");
  }
});

test("자바스크립트 없이도 index.html 에서 핵심 정보와 내부 링크가 읽힌다", () => {
  const s = read("index.html");
  const ns = /<noscript>([\s\S]*?)<\/noscript>/.exec(s);
  assert.ok(ns, "noscript 폴백 없음");
  const body = ns[1];
  for (const kw of ["김유빈", "전략기획", "법무법인 경국", "career.html", "gallery.html"]) {
    assert.ok(body.includes(kw), "noscript 에 " + kw + " 누락");
  }
});

test("h1 에 한글 이름 맥락이 포함된다", () => {
  assert.ok(read("sections.jsx").includes('<span className="sr-only">김유빈'), "index h1");
  assert.ok(read("career.html").includes('<span class="sr-only">김유빈'), "career h1");
  assert.ok(read("gallery.html").includes('<span class="sr-only">김유빈'), "gallery h1");
  assert.ok(read("styles.css").includes(".sr-only"), "sr-only 스타일 누락");
});

/* 폰트 — Pretendard 는 가변 폰트 + 동적 서브셋만 쓴다.
 * 정적 전체 웨이트(pretendard.min.css)는 쓰는 굵기마다 780KB 급 한글 폰트를 통째로
 * 내려받게 되어 첫 화면에서 수 MB 가 나간다. 되돌아가는 것을 막기 위한 테스트. */
test("모든 페이지가 Pretendard 가변 동적 서브셋을 쓴다", () => {
  for (const f of [...PAGES, "admin.html"]) {
    const html = read(f);
    assert.ok(
      html.includes("pretendardvariable-dynamic-subset.css"),
      `${f} — 가변 동적 서브셋 링크 누락`,
    );
    assert.ok(
      !html.includes("static/pretendard.min.css"),
      `${f} — 정적 전체 웨이트 CSS 가 남아 있습니다`,
    );
  }
});

/* Vercel 배포 계약 — package.json 에 build 스크립트가 있으면 Vercel 이 그걸 실행한 뒤
 * 출력 디렉터리(public)를 찾다가 없으면 배포가 실패한다. dist/*.js 는 커밋되므로
 * 빌드 없이 루트를 그대로 서빙해야 한다. 이 두 줄이 빠지면 Vercel 만 조용히 깨진다. */
test("vercel.json 이 빌드 없이 루트를 서빙하도록 고정한다", () => {
  const v = JSON.parse(read("vercel.json"));
  assert.equal(v.buildCommand, "", "buildCommand 가 비어 있어야 Vercel 이 빌드를 건너뛴다");
  assert.equal(v.outputDirectory, ".", "outputDirectory 는 저장소 루트");
  assert.ok(v.functions["api/*.js"], "api 서버리스 함수 설정 유지");
});

/* CSS 캐시 버전 — styles.css 를 고치고 한 페이지의 ?v= 만 올리면, 나머지 페이지의
 * 재방문자는 옛 CSS 를 계속 받는다(폰트 스택·새 클래스가 적용되지 않음). */
test("모든 페이지가 같은 styles.css 캐시 버전을 요청한다", () => {
  const vs = new Map();
  for (const f of PAGES) {
    const m = /styles\.css\?v=(\d+)/.exec(read(f));
    assert.ok(m, f + " 에 styles.css 링크 없음");
    vs.set(f, m[1]);
  }
  const uniq = new Set(vs.values());
  assert.equal(uniq.size, 1, "버전이 갈렸습니다: " + JSON.stringify([...vs]));
});

/* 이미지 검색 — "김유빈" 으로 걸리려면 alt 에 이름 맥락이 있어야 한다.
 * 갤러리는 이 사이트에서 이미지가 가장 많은 페이지이고, 인물 검색의 이미지 탭은
 * 텍스트 결과와 별개의 노출 경로다. */
test("갤러리·경력의 사진 alt 에 이름 맥락이 담긴다", () => {
  for (const f of ["gallery.html", "career.html"]) {
    const alts = [...read(f).matchAll(/<img[^>]*alt="([^"]+)"/g)].map((m) => m[1])
      .filter((a) => a !== "확대 이미지" && !a.includes("CI"));
    assert.ok(alts.length >= 2, f + " 이미지가 없습니다");
    const without = alts.filter((a) => !a.includes("김유빈"));
    assert.deepEqual(without, [], f + " — 이름 맥락 없는 alt: " + without.join(" | "));
  }
});

/* 404 — 끊긴 링크로 들어온 방문자를 사이트 안에 붙잡아 둔다.
 * GitHub Pages 는 저장소 루트의 404.html 을 자동으로 사용한다. */
test("404 페이지가 주요 경로와 챗봇으로 연결된다", () => {
  const s = read("404.html");
  for (const href of ["index.html", "lecture.html", "career.html", "gallery.html"]) {
    assert.ok(s.includes(`href="${href}"`), "404 에 " + href + " 링크 누락");
  }
  assert.ok(s.includes("chatbot.js"), "404 에 챗봇 위젯 누락");
  assert.match(s, /<meta name="robots" content="noindex, follow"/, "404 는 noindex, follow");
});
