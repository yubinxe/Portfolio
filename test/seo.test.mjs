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
  for (const f of ["admin.html", "Ethan Kim Portfolio.html"]) {
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
