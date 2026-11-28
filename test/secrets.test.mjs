/* 비밀 값 금지 — 금고 열쇠(ID/PW · PIN)는 저장소에 두지 않고 로컬 환경 변수로만 넣는다(scripts/build-vault.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("build-vault.mjs 에 금고 열쇠 문자열이 없다 — wrapKey 는 환경 변수로만", () => {
  const s = readFileSync(new URL("../scripts/build-vault.mjs", import.meta.url), "utf8");
  assert.ok(!/wrapKey\(\s*["'`][^"'`]*["'`]\s*\)/.test(s), "wrapKey 에 문자열 상수만");
  assert.ok(!/ID\/PW:\s*\S+::\S+/.test(s), "주석에 ID/PW");
  assert.ok(!/PIN::\d/.test(s), "PIN 숫자");
  for (const v of ["YK_VAULT_ID", "YK_VAULT_PW", "YK_VAULT_PIN"]) assert.ok(s.includes(v), v);
});
