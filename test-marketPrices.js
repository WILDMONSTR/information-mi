const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { spawnSync } = require("node:child_process");

const root = __dirname;
const source = path.join(root, "index.js");
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "firebase-functions/v2/https") {
    return { onRequest: (_options, handler) => handler };
  }
  if (request === "firebase-functions/params") {
    return { defineSecret: () => ({ value: () => "TEST_SECRET_DO_NOT_USE" }) };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const { marketPrices } = require(source);
Module._load = originalLoad;

let calls = 0;
let upstream = async () => ({
  status: 200, ok: true,
  headers: { get: () => "application/json" },
  text: async () => '{"data":[{"name":"test"}]}'
});
global.fetch = async (...args) => { calls++; return upstream(...args); };

function response() {
  return {
    code: 200, headers: {}, body: "",
    status(code) { this.code = code; return this; },
    json(body) { this.body = JSON.stringify(body); return this; },
    set(key, value) { this.headers[key] = value; return this; },
    send(body) { this.body = body; return this; }
  };
}
async function invoke(query = {}, method = "GET") {
  const res = response();
  await marketPrices({ method, query }, res);
  return res;
}
async function run(id, fn) {
  try { await fn(); console.log(id + " PASS"); }
  catch (error) { console.error(id + " FAIL:", error.message); process.exitCode = 1; }
}

(async () => {
  await run("T05-C01", () => {
    for (const file of ["index.js", "public/js/market.js"]) {
      const r = spawnSync(process.execPath, ["--check", path.join(root, file)]);
      assert.equal(r.status, 0, String(r.stderr));
    }
  });
  await run("T05-C02", () => assert.equal(typeof marketPrices, "function"));
  await run("T05-C03", async () => {
    calls = 0;
    const res = await invoke({ search: "normal-c03", limit: "10", offset: "0" });
    assert.equal(res.code, 200);
    assert.equal(res.body, '{"data":[{"name":"test"}]}');
    assert.equal(calls, 1);
  });
  await run("T05-C04", async () => {
    const before = calls, res = await invoke({}, "POST");
    assert.equal(res.code, 405); assert.equal(calls, before);
    assert.ok(JSON.parse(res.body).error);
  });
  await run("T05-C05", async () => {
    for (const [query, expected] of [
      [{ limit: "500", search: "c05a" }, "100"],
      [{ limit: "-1", search: "c05b" }, "100"],
      [{ limit: "abc", search: "c05c" }, "100"],
      [{ offset: "-1", search: "c05d" }, "0"]
    ]) {
      let url;
      upstream = async input => {
        url = String(input);
        return { status: 200, ok: true, headers: { get: () => "application/json" }, text: async () => "{}" };
      };
      await invoke(query);
      assert.equal(new URL(url).searchParams.get(
        query.offset ? "offset" : "limit"), expected);
    }
  });
  await run("T05-C06", async () => {
    calls = 0;
    const accepted = await invoke({ search: "가".repeat(50) });
    assert.notEqual(accepted.code, 400);
    const before = calls;
    const rejected = await invoke({ search: "가".repeat(51) });
    assert.equal(rejected.code, 400); assert.equal(calls, before);
    assert.ok(JSON.parse(rejected.body).error);
  });
  await run("T05-C07", async () => {
    calls = 0; upstream = async () => ({
      status: 200, ok: true, headers: { get: () => "application/json" },
      text: async () => '{"cached":true}'
    });
    const q = { search: "cache-c07-unique" };
    const a = await invoke(q), b = await invoke(q);
    assert.equal(a.body, b.body); assert.equal(calls, 1);
  });
  await run("T05-C08", () => {
    const key = "TEST_SECRET_DO_NOT_USE";
    const files = [];
    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p); else files.push(p);
      }
    }
    walk(path.join(root, "public"));
    assert.ok(!fs.readFileSync(source, "utf8").includes(key));
    for (const file of files) assert.ok(!fs.readFileSync(file, "utf8").includes(key));
  });
  await run("T05-C09", async () => {
    for (const code of [401, 403]) {
      upstream = async () => ({ status: code, ok: false,
        headers: { get: () => "application/json" },
        text: async () => "UPSTREAM_PRIVATE_BODY" });
      const res = await invoke({ search: "err-" + code });
      assert.equal(res.code, 502);
      assert.ok(!res.body.includes("UPSTREAM_PRIVATE_BODY"));
      assert.equal(JSON.parse(res.body).upstream_status, code);
    }
    upstream = async () => { throw new Error("synthetic network failure"); };
    const failed = await invoke({ search: "network-c09" });
    assert.equal(failed.code, 500); assert.ok(JSON.parse(failed.body).error);
  });
  await run("T05-C10", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    assert.ok(pkg.dependencies);
    const status = spawnSync("git", ["diff", "--numstat", "9236123...HEAD"], { cwd: root, encoding: "utf8" });
    if (status.status === 0) {
      const rows = status.stdout.trim().split("\n").filter(Boolean);
      assert.ok(rows.length <= 2, "more than two changed files");
      const total = rows.reduce((n, row) => n + row.split("\t").slice(0, 2).reduce((a, x) => a + Number(x), 0), 0);
      assert.ok(total <= 150, "more than 150 changed lines");
    }
  });
})();
