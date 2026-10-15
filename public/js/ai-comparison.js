(() => {
  "use strict";
  const DATA_URL = "./data/ai-comparison-results.json";
  const STORAGE_KEY = "information-mi-ai-comparison-draft-v1";
  const REQUIRED_NODE = "v22.22.0";
  const TESTS = [
    ["T05-C01","구문 검사"],["T05-C02","핸들러 확인"],["T05-C03","정상 요청"],
    ["T05-C04","HTTP 메서드 제한"],["T05-C05","페이지네이션 경계"],["T05-C06","검색 길이 제한"],
    ["T05-C07","캐시"],["T05-C08","비밀값 노출 방지"],["T05-C09","업스트림 오류 처리"],["T05-C10","변경 범위 확인"]
  ];
  const $ = (id) => document.getElementById(id);
  let state = null;
  let activeCandidate = "A";

  const emptyTests = () => Object.fromEntries(TESTS.map(([id]) => [id, "not_run"]));
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const statusLabel = (status) => ({pass:"PASS",fail:"FAIL",not_run:"미실행"})[status] || "미실행";
  const statusClass = (status) => ({pass:"result-pass",fail:"result-fail",not_run:"result-pending"})[status] || "result-pending";

  async function loadState() {
    const response = await fetch(DATA_URL, {cache:"no-store"});
    if (!response.ok) throw new Error("공개 결과 JSON을 불러오지 못했습니다.");
    state = await response.json();
    if (!state.candidates || !state.candidates.A || !state.candidates.B) throw new Error("결과 JSON 구조가 올바르지 않습니다.");
    for (const key of ["A","B"]) {
      state.candidates[key].tests = {...emptyTests(), ...(state.candidates[key].tests || {})};
    }
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.schemaVersion === state.schemaVersion && parsed.fixedCommit === state.fixedCommit) {
          state = parsed;
          for (const key of ["A","B"]) state.candidates[key].tests = {...emptyTests(), ...(state.candidates[key].tests || {})};
        }
      }
    } catch (error) {
      console.warn("저장된 초안을 불러오지 못했습니다.", error);
    }
  }

  function candidateValid(candidate) {
    const values = TESTS.map(([id]) => candidate.tests && candidate.tests[id]);
    return candidate.status === "completed" &&
      candidate.node === REQUIRED_NODE &&
      Boolean(candidate.commit && candidate.commit.trim()) &&
      Boolean(candidate.os && candidate.os.trim()) &&
      values.length === TESTS.length &&
      values.every((value) => value === "pass" || value === "fail");
  }

  function comparisonValid() {
    const a = state.candidates.A;
    const b = state.candidates.B;
    // fixedCommit is the shared starting point; A and B are allowed to produce different result commits.
    return candidateValid(a) && candidateValid(b) &&
      a.node === b.node && a.os === b.os;
  }

  function score(candidate) {
    return TESTS.reduce((total, [id]) => total + (candidate.tests[id] === "pass" ? 1 : 0), 0);
  }

  function renderOverview() {
    const a = state.candidates.A;
    const b = state.candidates.B;
    const validA = candidateValid(a);
    const validB = candidateValid(b);
    const valid = comparisonValid();
    $("valid-runs").textContent = (Number(validA) + Number(validB)) + " / 2";
    $("a-summary").textContent = a.status === "completed" ? (validA ? "검사 완료" : "증거 부족") : a.status === "blocked" ? "복제 실패" : "대기 중";
    $("a-detail").textContent = a.status === "blocked" ? "실행 환경 문제 · 테스트 미실행" : (validA ? score(a) + "/" + TESTS.length + " PASS · " + a.node : (a.node || "Node 버전 미기록"));
    $("b-summary").textContent = b.status === "completed" ? (validB ? "검사 완료" : "증거 부족") : b.status === "blocked" ? "실행 중단" : "대기 중";
    $("b-detail").textContent = b.status === "pending" ? "이번 회차 증거 미제출" : (b.node || "Node 버전 미기록");
    $("comparison-status").textContent = valid ? "동일 조건 확인" : "판정 보류";
    $("comparison-status").className = "status-pill " + (valid ? "status-good" : "status-warn");
    $("score-summary").textContent = valid ? score(a) + " : " + score(b) : "미산정";
    $("public-test-matrix").replaceChildren();
    for (const test of state.tests) {
      const tr = document.createElement("tr");
      const title = document.createElement("td"); title.textContent = test.id;
      const detail = document.createElement("td"); detail.textContent = test.detail;
      tr.append(title, detail);
      for (const key of ["A","B"]) {
        const td = document.createElement("td");
        const chip = document.createElement("span");
        const result = state.candidates[key].tests[test.id] || "not_run";
        chip.className = "result-chip " + statusClass(result);
        chip.textContent = statusLabel(result);
        td.append(chip); tr.append(td);
      }
      $("public-test-matrix").append(tr);
    }
  }

  function renderTestInputs(candidate) {
    const container = $("test-input-list");
    container.replaceChildren();
    for (const [id, label] of TESTS) {
      const row = document.createElement("label");
      row.className = "test-input-row";
      const title = document.createElement("strong"); title.textContent = id;
      const description = document.createElement("span"); description.textContent = label;
      const select = document.createElement("select");
      select.name = "test-" + id;
      select.setAttribute("aria-label", id + " " + label + " 결과");
      for (const [value, text] of [["not_run","미실행"],["pass","PASS"],["fail","FAIL"]]) {
        const option = document.createElement("option"); option.value = value; option.textContent = text;
        select.append(option);
      }
      select.value = candidate.tests[id] || "not_run";
      row.append(title, description, select);
      container.append(row);
    }
  }

  function renderForm() {
    const candidate = state.candidates[activeCandidate];
    document.querySelectorAll(".candidate-tab").forEach((tab) => {
      const selected = tab.dataset.candidate === activeCandidate;
      tab.classList.toggle("selected", selected);
      tab.setAttribute("aria-selected", String(selected));
    });
    $("run-status").value = candidate.status || "pending";
    $("run-os").value = candidate.os || "Linux x86_64";
    $("run-node").value = candidate.node || REQUIRED_NODE;
    $("run-git").value = candidate.git || "";
    $("run-commit").value = candidate.commit || state.fixedCommit;
    $("run-notes").value = candidate.notes || "";
    renderTestInputs(candidate);
  }

  function collectForm() {
    const tests = {};
    for (const [id] of TESTS) {
      const input = document.querySelector('[name="test-' + id + '"]');
      tests[id] = input ? input.value : "not_run";
    }
    return {
      status: $("run-status").value,
      os: $("run-os").value.trim(),
      node: $("run-node").value.trim(),
      git: $("run-git").value.trim(),
      commit: $("run-commit").value.trim(),
      notes: $("run-notes").value.trim(),
      tests
    };
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    const a = state.candidates.A;
    const b = state.candidates.B;
    const valid = comparisonValid();
    state.comparison = {
      valid,
      scoreA: valid ? score(a) : null,
      scoreB: valid ? score(b) : null,
      reason: valid ? "같은 시작 커밋과 검사 기준에서 양쪽 검사를 완료했고 검사 런타임이 일치함." : "양쪽의 검사 증거가 갖춰지지 않았거나 검사 런타임이 일치하지 않아 점수를 산정하지 않음."
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderOverview();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2) + "\n"], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ai-comparison-results.json";
    document.body.append(anchor); anchor.click(); anchor.remove();
    URL.revokeObjectURL(url);
    $("form-feedback").textContent = "현재 기록을 JSON 파일로 내보냈습니다. 공개 반영에는 저장소 파일 업데이트가 필요합니다.";
  }

  async function importJson(file) {
    const parsed = JSON.parse(await file.text());
    if (parsed.schemaVersion !== state.schemaVersion || parsed.fixedCommit !== state.fixedCommit ||
        !parsed.candidates || !parsed.candidates.A || !parsed.candidates.B) {
      throw new Error("스키마 버전 또는 고정 커밋이 현재 실험과 일치하지 않습니다.");
    }
    state = parsed;
    for (const key of ["A","B"]) state.candidates[key].tests = {...emptyTests(), ...(state.candidates[key].tests || {})};
    saveState(); renderForm();
    $("form-feedback").textContent = "JSON 기록을 불러왔습니다. 초안은 이 브라우저에 저장했습니다.";
  }

  function bindEvents() {
    document.querySelectorAll(".candidate-tab").forEach((tab) => tab.addEventListener("click", () => {
      activeCandidate = tab.dataset.candidate;
      renderForm();
      $("form-feedback").textContent = "";
    }));
    $("candidate-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const candidate = collectForm();
      if (candidate.status === "completed" && !candidateValid(candidate)) {
        $("form-feedback").textContent = "완료로 저장하려면 Node.js v22.22.0, 검사 대상 커밋, 운영체제와 C01~C10의 실제 PASS/FAIL 결과 10개가 필요합니다.";
        return;
      }
      state.candidates[activeCandidate] = candidate;
      saveState();
      renderForm();
      $("form-feedback").textContent = "AI " + activeCandidate + " 기록을 이 브라우저에 저장했습니다.";
    });
    $("export-json").addEventListener("click", exportJson);
    $("import-json").addEventListener("change", async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try { await importJson(file); }
      catch (error) { $("form-feedback").textContent = "가져오기 실패: " + error.message; }
      finally { event.target.value = ""; }
    });
    $("reset-draft").addEventListener("click", async () => {
      if (!window.confirm("이 브라우저에 저장한 임시 초안을 지우고 공개 기본 기록을 다시 불러올까요?")) return;
      localStorage.removeItem(STORAGE_KEY);
      await loadState(); renderOverview(); renderForm();
      $("form-feedback").textContent = "임시 초안을 초기화했습니다.";
    });
  }

  async function init() {
    try {
      await loadState();
      renderOverview();
      renderForm();
      bindEvents();
    } catch (error) {
      $("comparison-status").textContent = "결과 로드 실패";
      $("form-feedback").textContent = error.message;
    }
  }
  init();
})();