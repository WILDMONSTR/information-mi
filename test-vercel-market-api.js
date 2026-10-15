"use strict";
const assert = require("node:assert/strict");
const handler = require("./api/market/prices.js");
let fetchCalls = 0;
let fetchStub = async () => ({ status: 200, ok: true, headers: { get: () => "application/json" }, text: async () => '{"data":[{"name":"fixture"}]}' });
global.fetch = async (...args) => { fetchCalls++; return fetchStub(...args); };
function response() { return { statusCode: 200, headers: {}, body: "", setHeader(key, value) { this.headers[key] = value; }, end(body) { this.body = body || ""; return this; } }; }
async function call(query = {}, method = "GET") { const res = response(); await handler({ method, query }, res); return res; }
async function test(id, fn) { try { await fn(); console.log(id + " PASS"); } catch (error) { console.error(id + " FAIL: " + error.message); process.exitCode = 1; } }
(async () => {
  await test("VERCEL-API-01", async () => { const before = fetchCalls, res = await call({}, "POST"); assert.equal(res.statusCode, 405); assert.equal(res.headers.Allow, "GET"); assert.equal(fetchCalls, before); });
  await test("VERCEL-API-02", async () => { const before = fetchCalls, res = await call({ search: "가".repeat(51) }); assert.equal(res.statusCode, 400); assert.equal(fetchCalls, before); });
  await test("VERCEL-API-03", async () => { const old = process.env.MABIMOBI_API_KEY; delete process.env.MABIMOBI_API_KEY; const res = await call({ search: "missing-key-unique" }); assert.equal(res.statusCode, 500); assert.match(JSON.parse(res.body).error, /환경 변수/); if (old !== undefined) process.env.MABIMOBI_API_KEY = old; });
  await test("VERCEL-API-04", async () => { process.env.MABIMOBI_API_KEY = "TEST_KEY"; let requestUrl = "", authorization = ""; fetchStub = async (url, options) => { requestUrl = String(url); authorization = options.headers.Authorization; return { status: 200, ok: true, headers: { get: () => "application/json" }, text: async () => '{"data":[{"name":"fixture"}]}' }; }; const res = await call({ search: "normal-route-unique", limit: "500", offset: "-1" }); const params = new URL(requestUrl).searchParams; assert.equal(res.statusCode, 200); assert.equal(params.get("limit"), "100"); assert.equal(params.get("offset"), "0"); assert.equal(params.get("sort"), "pct_change_24h_desc"); assert.equal(authorization, "Bearer TEST_KEY"); });
  await test("VERCEL-API-05", async () => { fetchCalls = 0; fetchStub = async () => ({ status: 200, ok: true, headers: { get: () => "application/json" }, text: async () => '{"cache":"ok"}' }); const q = { search: "cache-route-unique" }; const first = await call(q), second = await call(q); assert.equal(first.body, second.body); assert.equal(fetchCalls, 1); });
  await test("VERCEL-API-06", async () => { for (const status of [401, 403]) { fetchStub = async () => ({ status, ok: false, headers: { get: () => "application/json" }, text: async () => "UPSTREAM_PRIVATE_BODY" }); const res = await call({ search: "upstream-" + status + "-unique" }); assert.equal(res.statusCode, 502); assert.ok(!res.body.includes("UPSTREAM_PRIVATE_BODY")); assert.equal(JSON.parse(res.body).upstream_status, status); } });
  await test("VERCEL-API-07", async () => { fetchStub = async () => { throw new Error("synthetic network error"); }; const res = await call({ search: "network-route-unique" }); assert.equal(res.statusCode, 500); assert.ok(JSON.parse(res.body).error); });
  await test("VERCEL-API-08", async () => { assert.equal(require("node:fs").existsSync(require("node:path").join(__dirname, "vercel.json")), true); });
})();