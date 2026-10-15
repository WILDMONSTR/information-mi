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
