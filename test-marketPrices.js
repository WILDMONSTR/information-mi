const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { spawnSync } = require("node:child_process"); const root = __dirname, src = path.join(root, "index.js");
const load = Module._load;
Module._load = function (id, p, m) {
  if (id === "firebase-functions/v2/https") return { onRequest: (_, fn) => fn };
  if (id === "firebase-functions/params") return { defineSecret: () => ({ value: () => "TEST_SECRET_DO_NOT_USE" }) };
  return load.call(this, id, p, m);
};
const { marketPrices } = require(src); Module._load = load;
let calls = 0, upstream = async () => ({
  status: 200, ok: true, headers: { get: () => "application/json" },
  text: async () => '{"data":[{"name":"test"}]}'
});
global.fetch = async (...args) => { calls++; return upstream(...args); };
const resObj = () => ({
  code: 200, headers: {}, body: "",
  status(c) { this.code = c; return this; },
  json(b) { this.body = JSON.stringify(b); return this; },
  set(k, v) { this.headers[k] = v; return this; },
  send(b) { this.body = b; return this; }
});
async function call(q = {}, method = "GET") {
  const r = resObj(); await marketPrices({ method, query: q }, r); return r;
}
async function test(id, fn) {
  try { await fn(); console.log(id + " PASS"); }
  catch (e) { console.error(id + " FAIL:", e.message); process.exitCode = 1; }
}
(async () => {
  await test("T05-C01", () => {
    for (const f of ["index.js", "public/js/market.js"])
      assert.equal(spawnSync(process.execPath, ["--check", path.join(root, f)]).status, 0);
  });
  await test("T05-C02", () => assert.equal(typeof marketPrices, "function"));
  await test("T05-C03", async () => {
    calls = 0; let url; upstream = async u => { url = String(u); return { status: 200, ok: true, headers: { get: () => "application/json" }, text: async () => '{"data":[{"name":"test"}]}' }; };
    const r = await call({ search: "normal-c03", limit: "10" });
    assert.equal(r.code, 200); assert.equal(r.body, '{"data":[{"name":"test"}]}'); assert.equal(calls, 1);
    const params = new URL(url).searchParams; assert.equal(params.get("sort"), "pct_change_24h_desc"); assert.equal(params.get("min_count"), "1");
  });
  await test("T05-C04", async () => {
    const n = calls, r = await call({}, "POST"); assert.equal(r.code, 405); assert.equal(calls, n); assert.ok(JSON.parse(r.body).error);
  });
  await test("T05-C05", async () => {
    for (const [q, k, v] of [
      [{ limit: "500", search: "c05a" }, "limit", "100"],
      [{ limit: "-1", search: "c05b" }, "limit", "100"],
      [{ limit: "abc", search: "c05c" }, "limit", "100"],
      [{ offset: "-1", search: "c05d" }, "offset", "0"]
    ]) {
      let url; upstream = async u => { url = String(u); return { status: 200, ok: true,
        headers: { get: () => "application/json" }, text: async () => "{}" }; };
      await call(q); assert.equal(new URL(url).searchParams.get(k), v);
    }
  });
  await test("T05-C06", async () => {
    calls = 0; assert.notEqual((await call({ search: "가".repeat(50) })).code, 400); const n = calls, r = await call({ search: "가".repeat(51) });
    assert.equal(r.code, 400); assert.equal(calls, n); assert.ok(JSON.parse(r.body).error);
  });
  await test("T05-C07", async () => {
    calls = 0; upstream = async () => ({ status: 200, ok: true,
      headers: { get: () => "application/json" }, text: async () => '{"cached":true}' });
    const q = { search: "cache-c07-unique" }, a = await call(q), b = await call(q);
    assert.equal(a.body, b.body); assert.equal(calls, 1);
  });
  await test("T05-C08", () => {
    const key = "TEST_SECRET_DO_NOT_USE";
    assert.ok(!fs.readFileSync(src, "utf8").includes(key));
    const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
      const p = path.join(d, e.name); return e.isDirectory() ? walk(p) : [p];
    });
    for (const f of walk(path.join(root, "public")))
      assert.ok(!fs.readFileSync(f, "utf8").includes(key));
  });
  await test("T05-C09", async () => {
    for (const c of [401, 403]) {
      upstream = async () => ({ status: c, ok: false, headers: { get: () => "application/json" },
        text: async () => "UPSTREAM_PRIVATE_BODY" });
      const r = await call({ search: "err-" + c });
      assert.equal(r.code, 502); assert.ok(!r.body.includes("UPSTREAM_PRIVATE_BODY"));
      assert.equal(JSON.parse(r.body).upstream_status, c);
    }
    upstream = async () => { throw Error("synthetic network failure"); };
    const r = await call({ search: "network-c09" });
    assert.equal(r.code, 500); assert.ok(JSON.parse(r.body).error);
  });
  await test("T05-C10", () => {
    const d = spawnSync("git", ["diff", "--numstat", "9236123...HEAD"], { cwd: root, encoding: "utf8" });
    assert.equal(d.status, 0);
    const rows = d.stdout.trim().split("\n").filter(Boolean);
    assert.ok(rows.length <= 2);
    assert.ok(rows.every(x => !/^\d+\t\d+\t(public\/|package(-lock)?\.json|firebase\.json|firestore\.(rules|indexes\.json)|marketPrices\.js)/.test(x)));
    assert.ok(rows.reduce((n, x) => n + x.split("\t").slice(0, 2).reduce((a, v) => a + Number(v), 0), 0) <= 150);
  });
})();
