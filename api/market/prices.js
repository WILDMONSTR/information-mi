"use strict";

const API_URL = "https://open.mabimobi.life/v1/market/prices";
const CACHE_TTL_MS = 60_000;
const MAX_CACHE_ENTRIES = 200;
const cache = new Map();

function asString(value) {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return value == null ? "" : String(value);
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function remember(key, value) {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, { ...value, expiresAt: Date.now() + CACHE_TTL_MS });
  while (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
}

module.exports = async function marketPrices(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "GET 요청만 허용됩니다." });
  }

  const search = asString(req.query?.search).trim();
  if (Array.from(search).length > 50) {
    return json(res, 400, { error: "검색어는 50자 이하여야 합니다." });
  }

  let limit = Number(asString(req.query?.limit) || 100);
  let offset = Number(asString(req.query?.offset) || 0);
  if (!Number.isFinite(limit) || limit < 1) limit = 100;
  if (limit > 100) limit = 100;
  if (!Number.isFinite(offset) || offset < 0) offset = 0;

  const params = new URLSearchParams({
    parent_category: asString(req.query?.parent_category),
    search,
    sort: "pct_change_24h_desc",
    min_count: "1",
    limit: String(limit),
    offset: String(offset)
  });
  const cacheKey = params.toString();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    cache.delete(cacheKey);
    cache.set(cacheKey, cached);
    res.statusCode = cached.status;
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "no-store");
    return res.end(cached.body);
  }
  if (cached) cache.delete(cacheKey);

  const apiKey = process.env.MABIMOBI_API_KEY;
  if (!apiKey) {
    return json(res, 500, { error: "Vercel 환경 변수 MABIMOBI_API_KEY가 설정되지 않았습니다." });
  }

  try {
    const response = await fetch(API_URL + "?" + params.toString(), {
      method: "GET",
      headers: { Authorization: "Bearer " + apiKey, Accept: "application/json" }
    });
    const body = await response.text();
    if (response.status === 401 || response.status === 403) {
      console.warn("MABIMOBI upstream authorization status:", response.status);
      return json(res, 502, {
        error: response.status === 401
          ? "모비라이프 API 인증에 실패했습니다."
          : "모비라이프 API가 요청을 거부했습니다.",
        upstream_status: response.status
      });
    }

    const contentType = response.headers.get("content-type") || "application/json; charset=utf-8";
    res.statusCode = response.status;
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store");
    if (response.ok) remember(cacheKey, { status: response.status, contentType, body });
    return res.end(body);
  } catch (error) {
    console.error("MABIMOBI upstream request failed:", error?.name || "Error");
    return json(res, 500, { error: "모비라이프 거래소 API 호출 중 오류가 발생했습니다." });
  }
};