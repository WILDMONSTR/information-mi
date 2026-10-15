# AI B 인수인계 — INFORMATION-MI Vercel 비교 실험실

작성/갱신: 2026-10-15

## 1. 목표
기존 `information-mi` 저장소에 AI A/B 인수인계 재현성 비교 페이지와 Vercel 시세 API를 추가한다. 실험은 AI A 작업 → 인수인계 → AI B 작업 순서이며, 두 AI를 웹사이트가 자동 호출하는 방식은 사용하지 않는다. 기존 데이터를 보존한다.

## 2. 현재 상태
- 저장소: https://github.com/WILDMONSTR/information-mi
- 작업 브랜치: `vercel-ai-handoff-comparison`
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
- 원본 AI B 작업 커밋(비교 대상): `bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388`
- 기존 `main`, AI A/AI B 원본 브랜치 및 Firebase/Firestore 데이터는 이 작업에서 변경하지 않는다.

## 3. 실행 방법과 Node.js 환경 원칙

### 공식 판정 — GitHub Actions
AI 도구의 기본 실행 환경에 특정 Node.js 버전이 미리 설치돼 있는지는 GitHub Actions 기준 실행과 별개다. 후보 코드의 최종 통과/실패는 두 후보 모두 같은 고정 테스트를 기준 runner에서 실행해 판정한다. 이 저장소 워크플로는 Node.js `v22.22.0`을 준비하고 버전 일치를 검사한 뒤 테스트를 실행한다.

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
- 기본 공개 JSON은 AI A 복제 실패, AI B 대기, T05-C01~C10 미실행 상태다. 이 상태를 임의로 PASS로 바꾸지 않는다.
- 두 후보를 같은 runner와 같은 검사로 평가하더라도 AI A/B의 실제 검사 로그가 각각 확보되기 전까지 비교 점수는 미산정이다.

## 5. 남은 문제
1. Vercel Preview 배포 및 Preview URL에서 `/ai-comparison.html`, `/page/market.html`, `/api/market/prices`를 실제 확인해야 한다. GitHub Actions 성공은 Vercel 배포 성공을 뜻하지 않는다.
2. 이전 Vercel 프로젝트 생성 시 권한 오류 403이 발생했다. 연결된 계정/팀 권한을 확인하기 전에는 배포 성공을 주장하지 않는다.
3. `MABIMOBI_API_KEY`는 Vercel Project Settings → Environment Variables에 사용자가 설정해야 한다. 소스, 공개 JSON, 커밋에 키를 넣지 않는다.
4. 실제 AI A/B 결과를 동일 기준 runner에서 각각 실행해 기록하는 절차가 남아 있다. AI 도구 자체의 기본 Node.js 설치 버전이 같았다고 기록해서는 안 된다.

## 6. 다음 행동
1. GitHub Actions 페이지에서 새 버전 검증 단계가 `v22.22.0`을 출력하고 성공했는지 확인한다.
2. AI A 후보 코드와 AI B 후보 코드를 같은 버전의 기준 runner와 같은 테스트 세트로 각각 실행하고, 각 실행의 커밋·run URL·결과를 기록한다.
3. 실제 실행 로그가 확인된 뒤에만 비교 결과 JSON과 본 문서를 갱신한다.
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
