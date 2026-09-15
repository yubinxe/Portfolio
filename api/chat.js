/* ============================================================================
 * api/chat.js — 유빈 AI 스트리밍 백엔드 (Vercel Serverless · Node 18+)
 * ----------------------------------------------------------------------------
 * POST /api/chat { messages:[{role,content}], stream:true } → text/plain 스트림
 * · 지식은 kb.js(단일 진실 원천)에서 직렬화. 카드에 없는 사실은 답하지 않도록 프롬프트 고정.
 * · 환경변수: OPENAI_API_KEY (필수) · CHAT_MODEL (기본 gpt-4o-mini) · CORS_ORIGIN
 * ========================================================================== */
"use strict";
var KB = require("../kb.js");

function systemPrompt() {
  return [
    "당신은 '유빈 AI'입니다 — 김유빈(Yubin Kim)의 포트폴리오를 방문객(주로 채용·협업 담당자)에게 안내하는 격조 있는 컨시어지입니다. 김유빈 님을 3인칭으로 소개합니다.",
    "[규칙] 1) 아래 <지식> 안의 사실만 근거로 답하고 없는 사실·수치·URL은 지어내지 않습니다. 2) 지식에 없으면 '그 내용은 포트폴리오에 담겨 있지 않습니다. " + KB.email + " 로 문의하시면 김유빈 님이 직접 답변드립니다.' 라고 안내합니다. 3) 링크는 <지식>의 URL만 사용, 법률·세무 판단은 '전문가 상담이 필요합니다'로 안내, 공개 이메일 외 개인정보는 제공하지 않습니다. 4) 무관한 잡담은 정중히 포트폴리오 주제로 유도합니다. 5) 절제되고 품격 있게, 과장 없이. 기본 한국어(영어로 물으면 영어), 3~6문장, 필요시 짧은 불릿, 프로젝트는 [이름](URL) 링크로, 이모지 금지. 6) 사이트 내부 위치를 안내할 때는 [라벨](페이지.html#앵커) 형식의 링크를 사용합니다. 7) 상담·채용·협업 의사가 보이면 챗봇의 '무료 상담 신청' 버튼을 안내합니다.",
    "<지식>", KB.toKnowledge(), "</지식>",
  ].join("\n");
}

function sanitize(messages) {
  return (Array.isArray(messages) ? messages : []).slice(-12)
    .filter(function (m) { return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"; })
    .map(function (m) { return { role: m.role, content: m.content.slice(0, 4000) }; });
}

function readJson(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise(function (resolve) {
    var data = "";
    req.on("data", function (c) { data += c; });
    req.on("end", function () { try { resolve(JSON.parse(data || "{}")); } catch (e) { resolve({}); } });
  });
}

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "POST") { res.statusCode = 405; return res.end("method"); }
  if (!process.env.OPENAI_API_KEY) { res.statusCode = 503; return res.end("chat_not_configured"); }

  return readJson(req).then(function (body) {
    var msgs = [{ role: "system", content: systemPrompt() }].concat(sanitize(body.messages));
    var controller = new AbortController();
    var killed = setTimeout(function () { controller.abort(); }, 40000);
    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: process.env.CHAT_MODEL || "gpt-4o-mini", messages: msgs, temperature: 0.4, max_tokens: 700, stream: true }),
    }).then(function (up) {
      if (!up.ok || !up.body) { clearTimeout(killed); res.statusCode = 502; return res.end("upstream_" + up.status); }
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      var reader = up.body.getReader();
      var decoder = new TextDecoder();
      var buf = "";
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { clearTimeout(killed); return res.end(); }
          buf += decoder.decode(r.value, { stream: true });
          var lines = buf.split("\n"); buf = lines.pop() || "";
          for (var i = 0; i < lines.length; i++) {
            var ln = lines[i].trim();
            if (ln.indexOf("data:") !== 0) continue;
            var data = ln.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              var j = JSON.parse(data);
              var d = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
              if (d) res.write(d);
            } catch (e) { /* partial */ }
          }
          return pump();
        });
      }
      return pump().catch(function () { clearTimeout(killed); try { res.end(); } catch (e) {} });
    });
  }).catch(function (e) {
    res.statusCode = 500;
    res.end("error: " + String(e && e.message || e));
  });
};
module.exports.systemPrompt = systemPrompt;
module.exports.sanitize = sanitize;
