"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = __dirname;
const htmlPath = path.join(root, "public", "ai-comparison.html");
const cssPath = path.join(root, "public", "css", "ai-comparison.css");
const jsPath = path.join(root, "public", "js", "ai-comparison.js");
const dataPath = path.join(root, "public", "data", "ai-comparison-results.json");
const html = fs.readFileSync(htmlPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const checks = [
  ["AI-C01", () => assert.match(html, /AI 인수인계/)],
  ["AI-C02", () => assert.match(html, /id="current-results"/)],
  ["AI-C03", () => assert.match(html, /id="candidate-form"/)],
  ["AI-C04", () => assert.match(html, /id="public-test-matrix"/)],
  ["AI-C05", () => assert.ok(fs.existsSync(cssPath))],
  ["AI-C06", () => assert.equal(spawnSync(process.execPath, ["--check", jsPath]).status, 0)],
  ["AI-C07", () => assert.equal(data.tests.length, 10)],
  ["AI-C08", () => assert.deepEqual(data.tests.map((t) => t.id), Array.from({length:10}, (_,i) => "T05-C" + String(i+1).padStart(2,"0")))],
  ["AI-C09", () => {
    assert.equal(data.candidates.A.status, "blocked");
    assert.ok(Object.values(data.candidates.A.tests).every((v) => v === "not_run"));
    assert.equal(data.comparison.valid, false);
    assert.equal(data.comparison.scoreA, null);
    assert.equal(data.comparison.scoreB, null);
  }],
  ["AI-C10", () => {
    assert.match(js, /localStorage/);
    assert.match(js, /export-json/);
    assert.match(js, /REQUIRED_NODE = "v22\.22\.0"/);
    assert.match(html, /공개 보고서/);
  }]
];
let failed = 0;
for (const [id, run] of checks) {
  try { run(); console.log(id + " PASS"); }
  catch (error) { failed++; console.error(id + " FAIL: " + error.message); }
}
if (failed) process.exitCode = 1;
else console.log("AI comparison page checks: 10/10 PASS");