# AI B 인수인계 — INFORMATION-MI Vercel 비교 실험실

작성/갱신: 2026-10-15

## 1. 목표
기존 `information-mi` 저장소에 AI A/B 인수인계 재현성 비교 페이지와 Vercel 시세 API를 추가한다. 실험은 AI A 작업 → 인수인계 → AI B 작업 순서이며, 두 AI를 웹사이트가 자동 호출하는 방식은 사용하지 않는다. 기존 데이터를 보존한다.

## 2. 현재 상태
- 저장소: https://github.com/WILDMONSTR/information-mi
- 작업 브랜치: `vercel-ai-handoff-comparison`
- 보고서 페이지: `public/ai-comparison.html` (AI A 결과 기록 완료, AI B 미실행, 비교 점수 미산정)
- Vercel 배포 상태: **보류**. 연결된 Vercel 권한에서 403 Forbidden이 발생해 Preview 배포를 만들지 못했다.
- 비교 테스트의 기준 Node.js: `v22.22.0`
- 기준 실행 환경: GitHub Actions의 `ubuntu-latest` runner
- CI는 `.github/workflows/ai-comparison-tests.yml`에서 `actions/setup-node`로 `22.22.0`을 지정하고, 별도 단계에서 실제 `node --version`이 `v22.22.0`인지 검사한다.
- 페이지의 필수 버전 표시: `public/js/ai-comparison.js`의 `REQUIRED_NODE = "v22.22.0"`
- 버전 회귀 검사: `test-ai-comparison.js`가 해당 값을 확인한다.
- 비교 페이지: `public/ai-comparison.html`
- 기본 결과 데이터: `public/data/ai-comparison-results.json`
- Vercel API: `api/market/prices.js`
- Vercel 설정: `vercel.json`
- 별도 테스트: `test-ai-comparison.js`, `test-vercel-market-api.js`
- 공통 시작 커밋: `923612383174f094754909254a57b54a03c4f4a6`
- AI A 검사 대상 커밋: `cbe1410bcc1ac41a5c5573f9572b3fe3736034df` (T05-C01~C10 10/10 PASS, 기록은 10절)
- 원본 AI B 작업 커밋(비교 대상): `bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388`
- 기존 `main`, AI A/AI B 원본 브랜치 및 Firebase/Firestore 데이터는 이 작업에서 변경하지 않는다.

## 3. 실행 방법과 Node.js 환경 원칙

### 공식 판정 — GitHub Actions
AI 도구의 작업 환경은 억지로 통일하지 않고 실제 환경을 따로 기록한다. 여기서 Node.js `v22.22.0`은 AI 도구의 작성 환경을 뜻하지 않고, 제출 코드를 같은 조건으로 확인하기 위한 GitHub Actions 검사 runner의 버전이다. 두 후보는 각자의 검사 대상 커밋에서 동일한 T05-C01~C10 스크립트로 검사한다.

Actions 결과: https://github.com/WILDMONSTR/information-mi/actions

최신 커밋에 해당하는 실행이 완료되면 run URL, 커밋 SHA, 상태와 테스트 결과를 기록한다. CI가 실제로 실행되고 통과하기 전에는 최신 변경의 통과를 주장하지 않는다.

### 로컬 실행 — 선택 사항
로컬에서 재현하고 싶다면 다음을 실행한다.

```bash
git clone https://github.com/WILDMONSTR/information-mi.git
cd information-mi
git checkout vercel-ai-handoff-comparison
node --version
git --version
node --check public/js/ai-comparison.js
node --check api/market/prices.js
node test-ai-comparison.js
node test-vercel-market-api.js
git status --short
```

- 로컬 `node --version`이 정확히 `v22.22.0`이 아니면, 로컬 결과는 참고 기록일 뿐 기준 환경 통과로 세지 않는다.
- 이 때문에 사용자의 PC에 Node.js를 설치해야만 하는 것은 아니다. PC 설치는 로컬 재현을 원하는 경우에만 필요하며 AI 도구의 환경을 바꾸지 않는다.
- Windows PowerShell에서 npm 스크립트를 실행해야 할 경우 `npm.cmd`를 사용한다. 위 검사에는 npm 설치가 필요하지 않다.
- 기준 버전 다운로드가 필요한 경우 공식 Node.js 배포본을 사용한다: https://nodejs.org/dist/v22.22.0/

## 4. 검사 항목 및 확인된 기준선
- `test-ai-comparison.js`: AI-C01~AI-C10 (10개)
- `test-vercel-market-api.js`: VERCEL-API-01~08 (8개)
- 구문 검사: `public/js/ai-comparison.js`, `api/market/prices.js`
- 앞선 독립 실행 기록에서는 Node.js `v22.22.0`에서 두 테스트와 두 구문 검사가 모두 종료 코드 0으로 끝났다. 테스트 출력의 업스트림 401/403 및 네트워크 오류는 mock으로 만든 응답이며 실제 MABIMOBI 서버에 요청한 결과가 아니다.
- 최신 버전 고정 변경 커밋의 CI 판정은 해당 run을 확인해야 한다: https://github.com/WILDMONSTR/information-mi/actions
- 공개 결과 JSON은 AI A의 T05-C01~C10 실제 실행 결과 10/10 PASS로 갱신했다. AI B는 이번 회차 검사 증거가 아직 없어 미실행 상태로 둔다.
- AI A의 실제 검사 로그가 확보되었다. AI B의 검사 증거가 추가되기 전까지 비교 점수와 우위는 미산정이다.

## 5. 남은 문제
1. Vercel Preview 배포 및 Preview URL에서 `/ai-comparison.html`, `/page/market.html`, `/api/market/prices`를 실제 확인해야 한다. GitHub Actions 성공은 Vercel 배포 성공을 뜻하지 않는다.
2. 이번 배포 시도에서도 Vercel connector가 선택된 scope에 대해 `403 Forbidden / Not authorized`를 반환했다. 배포 URL은 생성되지 않았다. Vercel 연결을 해당 scope에 재인증하거나 올바른 접근 권한을 제공한 다음 Preview 배포를 재시도한다.
3. `MABIMOBI_API_KEY`는 Vercel Project Settings → Environment Variables에 사용자가 설정해야 한다. 소스, 공개 JSON, 커밋에 키를 넣지 않는다.
4. AI A 검사는 완료되어 기록됐다. AI B 후보 커밋에서 같은 고정 테스트를 실행하고 로그·커밋·환경을 기록한다. AI 작업 환경이 동일했다고 추정하지 말고 실제 작업 환경과 검사 runner를 구분한다.

## 6. 다음 행동
1. 먼저 Vercel 연결 권한을 복구한다. 액세스 토큰을 채팅에 붙여넣지 말고, Vercel 커넥터를 대상 scope에 재인증하거나 Vercel 계정 소유자가 권한을 부여한다.
2. 권한 확인 후 비교 브랜치 `vercel-ai-handoff-comparison`을 **Preview**로 배포하고 `/ai-comparison.html`, `/page/market.html`, `/api/market/prices`를 확인한다. Production 배포는 별도 승인 없이 하지 않는다.
3. [AI A T05 검사 run](https://github.com/WILDMONSTR/information-mi/actions/runs/38706730878)을 참고해 AI B 후보 커밋에서도 `node test-marketPrices.js`를 실행한다.
2. AI B 실행의 검사 대상 커밋, 실제 검사 runner OS/Node/npm/Git 버전, run URL 및 C01~C10 결과를 기록한다. AI 도구 자체의 작업 환경은 별도로 기록하며 같았다고 추정하지 않는다.
3. AI B의 증거가 확보된 뒤에만 비교 점수를 산정한다.
4. 이후 Vercel 프로젝트/팀 연결 권한을 확인한 뒤 Preview만 배포하고 페이지/API를 점검한다. Production 전환은 하지 않는다.

## 7. 건드리지 말 것
- `main`, `ai-a-marketprices-hardening`, `ai-b-marketprices-hardening` 원본 브랜치
- Firebase/Firestore 원본 데이터, rules, indexes, secret
- 실제 API 키, `.env` 및 비밀값
- 실제 실행하지 않은 검사 결과를 PASS로 표시하는 것
- 사용자의 확인 없이 Production 배포, 도메인 연결, 운영 환경 변수 변경
- 자동으로 여러 LLM API를 호출하는 기능 추가

## 8. 버전 통일 변경 기록
- UI/검사 기준: `public/js/ai-comparison.js`의 필수 Node 버전과 `test-ai-comparison.js`의 기대값을 모두 `v22.22.0`으로 맞췄다.
- CI 기준: `.github/workflows/ai-comparison-tests.yml`은 `22.22.0`을 지정하며, 실제 런타임이 `v22.22.0`인지 확인한 다음 테스트를 실행한다.
- 공식 배포 기록에서 Node.js `v22.22.0` 및 Windows x64 설치 파일을 확인할 수 있다: https://nodejs.org/dist/v22.22.0/
- 워크플로 파일을 바꾼 새 커밋의 Actions 결과는 별도 확인해야 한다. 설정을 고쳤다는 사실만으로 통과했다고 기록하지 않는다.

## 9. AI B 후속 검증 기록 — 커밋 `52255c1` (2026-10-15)

1~8절은 수정하지 않았다. 이 절은 6절 다음 행동 1번과 4절 기준선을 새 커밋에서 다시 확인한 기록이며, 코드·데이터는 수정하지 않았다.

### 9.1 로컬 재실행 (새 폴더 clone, 참고 기록)
- 커밋 `52255c1fc196ee0d61fc6cb843b04b9ba3662c51`, Linux 6.18.44, git 2.43.0, **Node.js `v22.22.0` (기준과 일치)**, `MABIMOBI_API_KEY` 미설정
- `node --check public/js/ai-comparison.js`: 종료 코드 0
- `node --check api/market/prices.js`: 종료 코드 0
- `node test-ai-comparison.js`: 종료 코드 0, AI-C01~C10 10/10 PASS
- `node test-vercel-market-api.js`: 종료 코드 0, VERCEL-API-01~08 PASS (401/403/네트워크 오류 줄은 mock 응답이며 실제 MABIMOBI 요청이 아님)
- 실행 후 `git status --short`: 비어 있음
- 원본 로그 `verify-52255c1-20261015T081242Z.log` (실행 작업 공간, 저장소에는 포함하지 않음) SHA-256: `774bd42a08830192fd85a8f773e53a68a20edf2ea9b3fc77ba8198e609fac76b`
- 참고: 이전 커밋 `4d9c411`에서 같은 명령을 v22.22.0으로 실행한 로그(SHA-256 `b58a7613957b94d3b0ce14a5a46b116d532a58ac0ee37c641a0d3235795b7f4b`)도 모두 종료 코드 0이었다.

### 9.2 GitHub Actions (공식 판정)
- 최신 run `38689648417` (커밋 `52255c1`): 성공. `Verify fixed Node.js version`, 두 테스트, `node --check api/market/prices.js` 단계가 모두 성공. 버전 검사 단계는 `v22.22.0`과 다르면 실패하도록 작성돼 있어 성공은 정확한 일치를 뜻하지만, 로그 원문은 권한 오류(Forbidden)로 읽지 못해 출력값은 직접 보지 못했다.
- run `38689615111` (커밋 `7782ce1`): 성공.
- 버전 통일 첫 커밋 `31772fa`의 run `38687269860`은 실패였고, 이후 `dc891ec`·`fbd9e6b`·`36af201`·`7782ce1`·`52255c1`의 run은 모두 성공이다. 실패 사유는 로그를 읽지 못해 확인하지 못했다.

### 9.3 발견: 필수 Node 버전 표기 불일치 (미수정)
`REQUIRED_NODE`와 CI는 `v22.22.0`으로 바뀌었지만, 아래 위치(커밋 `52255c1` 기준)에 `v22.16.0`이 남아 있다.
- `public/ai-comparison.html` 64행(조건 카드 C의 Node.js 표시), 97행(`run-node` 입력 기본값)
- `public/js/ai-comparison.js` 197행(완료 저장 거부 안내 문구)
- `public/data/ai-comparison-results.json` 7행(`requiredNode`), 10행(`requiredEnvironment.node`), 70·80행(`node` 필드)

로컬 정적 서버와 헤드리스 Chromium으로 재현한 결과:
- 페이지는 필수 Node.js를 `v22.16.0`으로 표시하고 `run-node` 기본값도 `v22.16.0`이다.
- AI B 기록을 상태 "완료", 검사 10개 PASS로 채우고 Node 칸을 기본값(`v22.16.0`)으로 두고 저장하면 거부되며, 안내는 "Node.js v22.16.0 … 필요합니다"이다.
- 안내대로 `v22.16.0`을 직접 입력해도 같은 이유로 거부된다. `v22.22.0`을 입력해야만 저장된다.
- 따라서 페이지의 표시와 안내를 따르면 완료 기록을 저장할 수 없다. 사용자가 표시와 다른 `v22.22.0`을 직접 입력하지 않으면 두 후보의 비교가 계속 "판정 보류"로 남을 수 있다.
- `test-ai-comparison.js`와 CI는 `REQUIRED_NODE` 상수만 검사하므로 이 불일치를 잡지 못하며 통과한다.

권장(미적용): 위 3개 파일의 `v22.16.0`을 `v22.22.0`으로 통일하고, `AI-C10`에 "저장소의 공개 파일에 `v22.16.0`이 남아 있지 않다"는 검사를 추가한다. 8절의 "모두 맞췄다"는 서술은 현재 사실과 다르다.

### 9.4 Vercel
- GitHub에 이 브랜치의 Vercel 배포 기록(deployments)과 커밋 상태가 없고, 이 세션에는 Vercel 토큰·CLI·커넥터가 없다. Preview 배포와 `/ai-comparison.html`, `/page/market.html`, `/api/market/prices`의 Preview 확인은 여전히 미수행이다.
- `MABIMOBI_API_KEY`는 사용자가 Vercel 환경 변수에 설정해야 한다. Production 전환·환경 변수 변경은 하지 않았다.

### 9.5 하지 않은 것
- 5절 4번, 6절 2번(AI A/B 후보 코드를 같은 runner에서 각각 실행)은 수행하지 않았다. 비교 점수와 기본 공개 JSON은 그대로 "미산정"이다.
- 이전 확인에서 이미 통과한 페이지 동작(10개 행 표시, JSON 내보내기·가져오기, 임시 저장, 시세 페이지의 Firebase 요청 0건)은 다시 검사하지 않았다. 이번에 바뀐 파일 중 해당 동작을 건드리는 변경은 없었다.

### 9.6 조치 — 커밋 `7ae36a9` (9.3 불일치 수정)
- `public/ai-comparison.html`(2곳), `public/js/ai-comparison.js`(1곳), `public/data/ai-comparison-results.json`(4곳)의 `v22.16.0`을 모두 `v22.22.0`으로 바꿨다. JSON의 후보 A/B `node` 값은 측정 기록이 아니라 기본 자리표시값이다(A는 clone 실패로 테스트 미실행, B는 대기). 다른 필드와 기본 결과 상태(A 차단, B 대기, C01~C10 미실행, 점수 미산정)는 바꾸지 않았다.
- `test-ai-comparison.js`의 `AI-C10`에 검사를 추가했다. 세 파일에 `22.16.0`이 남아 있으면 실패하고, `requiredNode`, `requiredEnvironment.node`, `run-node` 기본값이 `REQUIRED_NODE`와 다르면 실패한다. 검사 개수는 그대로 10개다.
- 새 검사가 불일치를 잡는지 수정 전에 확인했다: 수정 전 트리에서 `AI-C10 FAIL: ai-comparison.html에 이전 Node.js 버전 v22.16.0이 남아 있음`, 수정 후 PASS.
- 수정 후 로컬(Node `v22.22.0`): `node --check` 2개 종료 코드 0, `test-ai-comparison.js` 10/10 PASS(종료 코드 0), `test-vercel-market-api.js` 종료 코드 0, 공개 JSON 유효.
- 페이지 재현(로컬 정적 서버): 조건 카드와 `run-node` 기본값이 `v22.22.0`이고, 기본값 그대로 "완료" 기록이 저장된다. `v22.16.0`을 입력하면 거부되며 안내는 `v22.22.0`이다.
- GitHub Actions run `38704996229` (커밋 `7ae36a9`): 성공. `Verify fixed Node.js version`, 두 테스트, `node --check api/market/prices.js` 단계가 모두 성공이다(로그 원문은 읽지 못했다).
- 9.3의 "미수정" 표기는 이 조치 이전의 상태 기록이며, 8절의 "모두 맞췄다"는 서술은 이 커밋 이후 사실이다.

### 9.7 남은 불일치 후보 (미수정)
- 기본 JSON의 `requiredEnvironment.npm`은 `10.9.2`이지만, 이 검증 환경의 Node `v22.22.0`이 포함한 npm은 `10.9.4`였다. `requiredEnvironment.git`(`git version 2.47.3`)도 이 환경(`2.43.0`)과 다르다. 두 값은 페이지의 필수 조건 판정에 쓰이지 않는 것으로 보이나, 표시 목적이라면 확인이 필요하다.


## 10. AI A 고정 검사 완료 — 2026-10-15

### 실행 근거
- GitHub Actions run: https://github.com/WILDMONSTR/information-mi/actions/runs/38706730878
- 검사 전용 브랜치: `t05-ai-a-run-20261015` (검사 워크플로만 추가했으며, AI A 원본 브랜치는 변경하지 않음)
- 실제 체크아웃한 AI A 후보 커밋: `cbe1410bcc1ac41a5c5573f9572b3fe3736034df`
- 공통 시작 커밋: `923612383174f094754909254a57b54a03c4f4a6`
- runner 환경: Ubuntu 24.04.5 x86_64; Node.js `v22.22.0`; npm `10.9.4`; Git `2.55.0`
- 실행 명령: `node test-marketPrices.js`; 종료 코드 0
- 결과: `T05-C01 PASS`, `T05-C02 PASS`, `T05-C03 PASS`, `T05-C04 PASS`, `T05-C05 PASS`, `T05-C06 PASS`, `T05-C07 PASS`, `T05-C08 PASS`, `T05-C09 PASS`, `T05-C10 PASS`.
- C10 변경 범위: `index.js` 38 additions/14 deletions, `test-marketPrices.js` 98 additions/0 deletions. 2 files, 150 total changed lines; 검사 제한 통과.
- T05 테스트는 합성 `fetch` 응답을 사용했다. 로그에 200/401/403과 네트워크 오류가 표시되지만 실제 MABIMOBI API에 요청하거나 API 키를 사용한 것은 아니다.
- 결과 JSON 커밋: `41950c1de627b6cadfa1ba8dfd3323c6ce249a53` — A를 완료/10 PASS, B는 미실행, 비교 점수는 미산정으로 기록.
- 기록/비교 로직 수정 이후 GitHub Actions run: https://github.com/WILDMONSTR/information-mi/actions/runs/38707285906 — 성공. AI-C01~C10 10/10 PASS, VERCEL-API-01~08 PASS, Node.js `v22.22.0` 확인, `node --check api/market/prices.js` 통과. Vercel Preview/실제 MABIMOBI 호출은 검증하지 않음.
- 비교 페이지는 공통 시작 커밋과 후보별 검사 대상 커밋을 분리한다. A/B 결과 커밋은 서로 달라도 되며, 실제 검사 증거와 런타임 기록이 완성되기 전에는 비교 점수를 공개하지 않는다.

### Vercel 배포 시도 — 보류
- 요청: 비교 보고서를 Vercel에 배포
- 요청한 대상: `vercel-ai-handoff-comparison` 브랜치의 Preview 배포 (운영 Production은 변경하지 않음)
- 결과: 실패. Vercel API 응답은 `403 Forbidden: Not authorized to access the intended scope`였으며, 프로젝트 목록/프로젝트 조회도 같은 접근 거부를 반환했다.
- 배포 URL: 생성되지 않음. 프로젝트 또는 팀을 임의로 바꾸거나 `main`/Production에 배포하지 않았다.
- 재개 조건: Vercel connector를 올바른 scope에 재인증한 후 Preview 배포 및 URL 확인을 수행한다.

### 다음 작업
AI B는 인수인계 문서만을 바탕으로 작업을 재개하고, 자신의 검사 대상 커밋에서 같은 T05-C01~C10 스크립트를 실행한다. AI A의 PASS 결과를 AI B 결과로 복사하지 않는다. AI 작업 환경을 강제로 통일하지 않으며, AI B의 실제 작업 환경과 검사 runner 환경을 구분해서 기록한다.
