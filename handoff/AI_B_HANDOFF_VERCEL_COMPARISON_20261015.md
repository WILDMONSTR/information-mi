# AI B 인수인계 — INFORMATION-MI Vercel 비교 실험실

작성/갱신: 2026-10-15

## 1. 목표
기존 `information-mi` 저장소에 AI A/B 인수인계 재현성 비교 페이지와 Vercel 시세 API를 추가한다. 실험은 AI A 작업 → 인수인계 → AI B 작업 순서이며, 두 AI를 웹사이트가 자동 호출하는 방식은 사용하지 않는다. 기존 데이터를 보존한다.

## 2. 현재 상태
- 저장소: https://github.com/WILDMONSTR/information-mi
- 작업 브랜치: `vercel-ai-handoff-comparison`
- 최신 변경 대상: Node.js 버전 고정값을 `v22.22.0`으로 통일
- CI: `.github/workflows/ai-comparison-tests.yml`의 `actions/setup-node`가 `22.22.0`을 사용한다.
- 페이지의 필수 버전 표시: `public/js/ai-comparison.js`의 `REQUIRED_NODE = "v22.22.0"`
- 버전 회귀 검사: `test-ai-comparison.js`가 해당 값을 확인한다.
- 비교 페이지: `public/ai-comparison.html`
- 기본 결과 데이터: `public/data/ai-comparison-results.json`
- Vercel API: `api/market/prices.js`
- Vercel 설정: `vercel.json`
- 별도 테스트: `test-ai-comparison.js`, `test-vercel-market-api.js`
- 원본 AI B 작업 커밋(비교 대상): `bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388`
- 기존 `main`, AI A/AI B 원본 브랜치 및 Firebase/Firestore 데이터는 이 작업에서 변경하지 않는다.

## 3. 실행 명령
새 작업 폴더에서 PowerShell 또는 bash로 실행한다.

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

- `node --version` 출력이 정확히 `v22.22.0`이어야 한다.
- Windows PowerShell에서 npm 스크립트를 실행해야 할 경우 `npm.cmd`를 사용한다. 위 검사에는 npm 설치가 필요하지 않다.
- 버전이 다르면 결과를 동일 환경의 통과로 간주하지 말고 버전과 출력을 함께 기록한다.

## 4. 검사 항목 및 확인된 기준선
- `test-ai-comparison.js`: AI-C01~AI-C10 (10개)
- `test-vercel-market-api.js`: VERCEL-API-01~08 (8개)
- 구문 검사: `public/js/ai-comparison.js`, `api/market/prices.js`
- 앞선 독립 실행 기록에서는 Node.js `v22.22.0`에서 두 테스트와 두 구문 검사가 모두 종료 코드 0으로 끝났다. 테스트 출력의 업스트림 401/403 및 네트워크 오류는 mock으로 만든 응답이며 실제 MABIMOBI 서버에 요청한 결과가 아니다.
- GitHub Actions의 최신 버전 고정 변경 후 실행 결과는 아래 Actions 페이지에서 확인하고 이 문서에 run URL, 커밋, 성공/실패를 기록한다: https://github.com/WILDMONSTR/information-mi/actions
- 기본 공개 JSON은 AI A 복제 실패, AI B 대기, T05-C01~C10 미실행 상태다. 이 상태를 임의로 PASS로 바꾸지 않는다. 실제 AI A/B의 동일 조건 검사 결과가 확보되기 전까지 비교 점수는 미산정이다.

## 5. 남은 문제
1. Vercel Preview 배포 및 Preview URL에서 `/ai-comparison.html`, `/page/market.html`, `/api/market/prices`를 실제 확인해야 한다. GitHub Actions 성공은 Vercel 배포 성공을 뜻하지 않는다.
2. 이전 Vercel 프로젝트 생성 시 권한 오류 403이 발생했다. 연결된 계정/팀 권한을 확인하기 전에는 배포 성공을 주장하지 않는다.
3. `MABIMOBI_API_KEY`는 Vercel Project Settings → Environment Variables에 사용자가 설정해야 한다. 소스, 공개 JSON, 커밋에 키를 넣지 않는다.
4. 실제 AI A와 AI B가 동일 커밋·동일 OS·Node.js `v22.22.0`에서 고정된 T05-C01~C10을 실행한 비교 기록은 아직 없다.

## 6. 다음 행동
1. 최신 커밋의 GitHub Actions가 Node.js `v22.22.0`을 설치하고 모든 테스트/구문 검사를 통과했는지 확인한다.
2. 새 폴더에서 3절 명령을 실행해 Node 버전, 각 테스트 출력, 종료 코드, `git status --short`를 기록한다.
3. Vercel 프로젝트/팀 연결 권한을 확인한 뒤 Preview만 배포하고 페이지/API를 점검한다. Production 전환은 하지 않는다.
4. AI B는 AI A 인수인계 문서와 저장소 상태만 입력으로 받아 고정 테스트를 실행하고, 실제 결과 및 사용 시간/요청량 증거를 별도 기록한다.
5. 실행 결과가 확인된 뒤에만 본 문서의 검사 기록을 갱신한다.

## 7. 건드리지 말 것
- `main`, `ai-a-marketprices-hardening`, `ai-b-marketprices-hardening` 원본 브랜치
- Firebase/Firestore 원본 데이터, rules, indexes, secret
- 실제 API 키, `.env` 및 비밀값
- 실제 실행하지 않은 검사 결과를 PASS로 표시하는 것
- 사용자의 확인 없이 Production 배포, 도메인 연결, 운영 환경 변수 변경
- 자동으로 여러 LLM API를 호출하는 기능 추가

## 8. 버전 통일 변경 기록
- UI/검사 기준: `public/js/ai-comparison.js`의 필수 Node 버전과 `test-ai-comparison.js`의 기대값을 모두 `v22.22.0`으로 맞췄다.
- CI 기준: `.github/workflows/ai-comparison-tests.yml`의 `actions/setup-node`를 `22.22.0`으로 맞췄다.
- 정확한 버전 `v22.22.0`의 Windows x64 설치 파일: https://nodejs.org/dist/v22.22.0/node-v22.22.0-x64.msi
- 이 버전 변경 자체의 CI 판정은 Actions 실행 결과를 확인한 뒤 기록한다.
