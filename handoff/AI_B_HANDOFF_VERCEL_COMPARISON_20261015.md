# AI B 인수인계 — INFORMATION-MI Vercel AI 비교 실험실

## 1. 목표
기존 INFORMATION-MI 사이트에 AI A/B 인수인계 재현성 비교 페이지를 추가하고 Vercel Preview로 검증한다. 방식 A만 사용한다. 브라우저에서 여러 LLM API를 호출하거나 AI 작업을 자동 실행하지 않는다.

## 2. 현재 상태
- 저장소: https://github.com/WILDMONSTR/information-mi
- 작업 브랜치: vercel-ai-handoff-comparison
- 기존 main 및 Firebase/Firestore 설정은 변경하지 않았다. 새 Vercel 설정은 vercel.json에 추가했다.
- 비교 페이지: public/ai-comparison.html
- 공개 기본 데이터: public/data/ai-comparison-results.json
- 페이지 로직/스타일: public/js/ai-comparison.js, public/css/ai-comparison.css
- Vercel API 경로: api/market/prices.js
- 테스트: node test-ai-comparison.js, node test-vercel-market-api.js
- GitHub Actions: .github/workflows/ai-comparison-tests.yml
- 고정 Node.js 버전: v22.16.0
- 비교 대상 기존 커밋: bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388

## 3. 실행 명령
새 폴더에서:

    git clone https://github.com/WILDMONSTR/information-mi.git
    cd information-mi
    git checkout vercel-ai-handoff-comparison
    node --version
    git --version
    node --check public/js/ai-comparison.js
    node --check api/market/prices.js
    node test-ai-comparison.js
    node test-vercel-market-api.js

Node.js 출력은 정확히 v22.16.0이어야 한다. 버전이 다르면 점수를 확정하지 말고 환경 불일치를 기록한다.

## 4. 통과 검사
- AI 비교 페이지에서 10개 T05 검사 행이 표시된다.
- 기본 데이터에서 AI A는 복제 실패, AI B는 대기, C01~C10은 미실행이다. 과거 결과를 현재 결과로 옮겨 쓰지 않는다.
- 비교 점수는 두 후보가 동일 OS·Node 버전·커밋에서 C01~C10을 전부 PASS/FAIL로 기록했을 때만 산정된다.
- JSON 가져오기/내보내기와 브라우저 임시 저장이 작동한다.
- Vercel API 경로는 GET만 허용하고, 50자 초과 검색은 400, 업스트림 401/403은 본문을 숨기며 502, 네트워크 오류는 500으로 처리한다.
- MABIMOBI_API_KEY는 Vercel 환경 변수로 설정해야 시세 API가 실제 동작한다. 키를 소스나 공개 JSON에 넣지 않는다.

## 5. 남은 문제
- 현재 ChatGPT 실행기에서 GitHub 저장소 복제는 DNS 오류로 실패한 적이 있다. AI B는 실제 복제/테스트 결과를 새 로그로 제출해야 한다.
- Vercel 연결 권한이 확인되지 않았다. 배포 전 프로젝트/팀 스코프를 확인하고 Preview 배포부터 시도한다.
- 기존 Firebase Secret은 자동으로 Vercel로 이전되지 않는다. 운영 API 키를 노출하거나 추측하지 말고 사용자가 Vercel Project Settings → Environment Variables에서 MABIMOBI_API_KEY를 설정해야 한다.
- 정적 보고서 입력은 브라우저 로컬 저장이다. 모든 방문자에게 결과를 공개하려면 내보낸 JSON을 public/data/ai-comparison-results.json에 반영하고 다시 배포해야 한다.

## 6. 다음 행동
1. 동일 Node.js v22.16.0에서 위 테스트 두 개와 구문 검사를 실행한다.
2. GitHub Actions 검사 결과를 확인하고 실제 출력/종료 코드를 기록한다.
3. Vercel Preview를 만들고 /ai-comparison.html 및 /page/market.html을 확인한다.
4. Vercel 환경 변수가 없는 경우 시세 API는 안전하게 오류를 반환한다고 기록한다. API 키를 코드에 하드코딩하지 않는다.
5. Preview 검증이 끝나면 배포 URL, 커밋, 검사 로그와 남은 문제를 이 인수인계 문서에 추가한다.

## 7. 건드리지 말 것
- main, ai-a-marketprices-hardening, ai-b-marketprices-hardening 원본 브랜치
- Firebase/Firestore 원본 데이터, rules, indexes, secret
- 실제 API 키 및 .env 값
- 비교 결과에서 실제 미실행 검사를 PASS로 표기하는 것
- Production 배포/도메인 연결/환경 변수 변경 전 확인

## 8. AI B 후속 검증 기록 — 2026-10-15 (부분 완료)

이 절은 위 1~7절을 수정하지 않고 덧붙인 기록이다. 문서의 "다음 행동" 1·2·4번은 수행했고, 3번(Vercel Preview)은 수행하지 못했다.

### 8.1 환경과 판정 보류
- 검증 커밋: `4d9c411893a6782a82b8a92ec520c45240d9140a` (브랜치 `vercel-ai-handoff-comparison`, 새 폴더에 clone 후 실행)
- 실행 환경: Linux 6.18.44, bash 5.2.21, git 2.43.0, **Node.js v22.22.0**
- 요구 Node.js는 v22.16.0이다. 이 환경에는 v22.16.0이 설치돼 있지 않고(설치본: 20.20.0, 21.7.3, 22.22.0) npm 레지스트리에도 접근할 수 없어 맞출 수 없었다. 3절 규칙에 따라 **환경 불일치로 기록하며 비교 점수는 확정하지 않는다.**
- `MABIMOBI_API_KEY`는 이 환경에 설정돼 있지 않았다. 실제 API 호출·배포는 하지 않았다.

### 8.2 실행 명령과 종료 코드 (v22.22.0)
| 명령 | 종료 코드 | 결과 |
|---|---:|---|
| `node --check public/js/ai-comparison.js` | 0 | 오류 없음 |
| `node --check api/market/prices.js` | 0 | 오류 없음 |
| `node test-ai-comparison.js` | 0 | AI-C01~C10 모두 PASS (10/10) |
| `node test-vercel-market-api.js` | 0 | VERCEL-API-01~08 모두 PASS |
| 실행 후 `git status --short` | - | 비어 있음 |

- 로그의 `MABIMOBI upstream authorization status: 401/403`, `upstream request failed: Error` 줄은 테스트가 가짜 `fetch`로 합성한 응답의 출력이며 실제 API 통신이 아니다.
- 원본 로그 `vercel-handoff-verify-20261015T052427Z.log` (실행 작업 공간, 저장소에는 포함하지 않음) SHA-256: `b58a7613957b94d3b0ce14a5a46b116d532a58ac0ee37c641a0d3235795b7f4b`

### 8.3 GitHub Actions
- 워크플로는 `actions/setup-node`로 Node.js `22.16.0`을 고정한다.
- 이 브랜치의 푸시 실행 7건(최신 run `38685734289`, 커밋 `4d9c411`, 2026-10-15T05:14:40Z)이 모두 `success`이고, 최신 run의 모든 단계(setup-node, 두 테스트, `node --check api/market/prices.js`)가 `success`였다.
- 단계 결과는 API로 확인했다. 로그 원문은 권한 오류(Forbidden)로 읽지 못했으므로 Actions의 실제 출력·종료 코드는 확인하지 못했다.

### 8.4 로컬 페이지 확인 (Vercel Preview가 아님)
로컬 정적 서버(`public/`)와 헤드리스 Chromium으로 확인했다.
- `/ai-comparison.html`: T05-C01~C10 10개 행이 표시되고 모두 "미실행". AI A "복제 실패", AI B "대기 중", 판정 "판정 보류", 유효 실행 0/2, 점수 "미산정". 과거 결과를 옮겨 쓰지 않았다.
- JSON 내보내기: `ai-comparison-results.json`이 유효한 JSON으로 내려받아졌다. 가져오기: 성공 메시지가 표시됐다.
- 브라우저 임시 저장: AI B 기록을 제출하고 새로고침해도 입력이 유지됐다. 확인은 일회용 브라우저 프로필에서 했으므로 저장된 값이 남지 않으며 공개 JSON은 수정하지 않았다. 초기화 버튼의 동작은 검증하지 않았다.
- `/page/market.html`: 비교 페이지 링크가 1개 있고 Firebase/gstatic/googleapis 요청은 0건이었다. `/api/market/prices` 요청은 정적 서버에 함수가 없어 404였다. 이는 로컬 서버의 한계이며 Vercel에서의 동작은 확인하지 못했다.
- 첫 실행에서 404 콘솔 오류 1건이 있었으나 재실행에서 재현되지 않았고 원인은 특정하지 못했다.

### 8.5 API 키가 없을 때
- `VERCEL-API-03` 테스트에서 키가 없으면 업스트림 호출 없이 500과 환경 변수 안내 메시지를 반환함을 확인했다. 테스트 수준의 확인이며 실제 Vercel 환경에서 확인한 것은 아니다.

### 8.6 남은 문제
1. **Vercel Preview 미수행.** 이 세션에는 Vercel 토큰·CLI가 없고 Vercel 커넥터도 연결돼 있지 않다. Preview 배포, 배포 URL, `/ai-comparison.html`·`/page/market.html`의 Preview 확인은 비어 있다. 프로젝트/팀 스코프도 확인하지 못했다.
2. Node.js v22.16.0 환경의 직접 실행 결과가 없다(8.1). Actions가 v22.16.0에서 성공했다는 단계 결과만 있다.
3. `MABIMOBI_API_KEY`는 사용자가 Vercel Project Settings → Environment Variables에 직접 설정해야 한다. Production 배포·도메인 연결·환경 변수는 건드리지 않았다.
4. 두 후보(AI A/B)의 동일 조건 C01~C10 기록은 아직 없어 비교 점수는 산정되지 않는다.
