/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/* 세 앱을 한 번에 빌드한다. 결과는 저장소 루트의 ax/ — GitHub Pages · Vercel(buildCommand "") 이 그대로 서빙.
 * base "./" 라서 /Portfolio/ax/… (Pages) 와 /ax/… (Vercel) 어디서든 같은 파일로 동작한다 */
const web = resolve(__dirname, "web");
export default defineConfig({
  root: web,
  base: "./",
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "../ax"),
    emptyOutDir: true,
    target: "es2019",
    rollupOptions: {
      input: {
        hub: resolve(web, "index.html"),
        reconcile: resolve(web, "reconcile-gate/index.html"),
        triage: resolve(web, "ops-triage/index.html"),
        verifier: resolve(web, "claim-verifier/index.html"),
      },
    },
  },
  test: { root: __dirname, include: ["src/**/*.test.ts"], environment: "node" },
});
