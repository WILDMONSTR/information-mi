# information-mi — AI A 검사 결과 및 사용량 기록

- 기록일: 2026-10-13 (KST)
- 저장소: https://github.com/WILDMONSTR/information-mi
- 기준 커밋: `923612383174f094754909254a57b54a03c4f4a6`
- AI A 작업 브랜치: `ai-a-marketprices-hardening`
- **AI A 결과 커밋: `cbe1410bcc1ac41a5c5573f9572b3fe3736034df`** — [커밋 확인](https://github.com/WILDMONSTR/information-mi/commit/cbe1410bcc1ac41a5c5573f9572b3fe3736034df)
- 결과 근거: 기존 `information-mi_AI-A_종료_인수인계.docx`에 기록된 로컬 실행 요약. 이 이어서 작업에서는 검사 10개를 재실행하지 않았음.

## 1. 검사 결과

기존 인수인계 기록은 `node test-marketPrices.js` 실행 출력에서 **T05-C01~T05-C10 모두 PASS**라고 보고한다. 별도 원본 콘솔 로그 파일은 기존 기록에서 확인되지 않아, 아래 표는 원본 로그의 새 캡처가 아니라 기존 인수인계에 남아 있는 결과를 검사별로 정리한 것이다.

| 검사 | 기존 기록 상태 | 실제 검사 스크립트의 관찰 범위 |
|---|---|---|
| T05-C01 | PASS (기록) | `index.js`, `public/js/market.js` 문법 검사 |
| T05-C02 | PASS (기록) | `marketPrices`가 함수로 export되는지 |
| T05-C03 | PASS (기록) | 정상 GET, sort=`pct_change_24h_desc`, min_count=`1`, 본문·상태 |
| T05-C04 | PASS (기록) | POST에 405 JSON, 업스트림 추가 호출 없음 |
| T05-C05 | PASS (기록) | limit 500/-1/abc → 100, offset -1 → 0 |
| T05-C06 | PASS (기록) | search 50자는 수용, 51자는 400 JSON 및 업스트림 호출 없음 |
| T05-C07 | PASS (기록) | 동일 쿼리 60초 캐시, 업스트림 fetch 1회 |
| T05-C08 | PASS (기록) | 더미 키 문자열이 `index.js`와 `public/` 파일에 없는지 |
| T05-C09 | PASS (기록) | 가짜 업스트림 401/403 본문 비노출, 네트워크 실패 시 JSON 오류 |
| T05-C10 | PASS (기록) | 기준 커밋 대비 파일 수 2 이하, 금지 파일 무변경, 총 변경 수 150 이하 |

### 판정 범위 주의

- T05-C08 스크립트는 더미 키 문자열을 `index.js`와 `public/`에서만 검색한다. **응답·로그의 전체 문자열이나 Bearer 문자열 전반을 검사하는 코드는 아니다.** 코드 주석과 동작은 키/예외 객체를 직접 로그하지 않도록 되어 있으나, 테스트의 직접 보장 범위와 넓은 문구를 구분한다.
- T05-C09는 가짜 응답만 쓴다. 실제 운영 API, Firebase 배포 및 실 키 동작을 검증하지 않았다.
- 기존 기록의 Node.js는 `v24.20.0`; `package.json`은 Node.js 20을 지정한다. Node.js 20에서 동일 검사를 돌렸다는 증거는 없다.

## 2. 변경 범위와 소스

- [`index.js`](https://github.com/WILDMONSTR/information-mi/blob/cbe1410bcc1ac41a5c5573f9572b3fe3736034df/index.js): 38 additions / 14 deletions = 52 changed lines.
- [`test-marketPrices.js`](https://github.com/WILDMONSTR/information-mi/blob/cbe1410bcc1ac41a5c5573f9572b3fe3736034df/test-marketPrices.js): 98 additions.
- 합계 **2개 파일, 150 changed lines, 새 의존성 0개**. 상한에 정확히 도달했다.
- 주요 변경: search 50자 초과를 400으로 거부, 쿼리 조합별 60초 인스턴스 메모리 캐시, upstream 401/403 본문 비노출, fetch 예외 객체를 로그에서 제거.
- `main`은 기준 커밋 `923612383174f094754909254a57b54a03c4f4a6`를 유지한다. AI A 브랜치는 별도이며 병합·배포하지 않았다.

## 3. 재현 명령 (필요한 다음 작업자용; 이번 이어서 작업에서는 실행하지 않음)

Windows PowerShell 또는 터미널에서 전체 Git 이력으로 복제한다. 테스트는 Node.js 내장 모듈을 이용해 Firebase 함수 모듈을 가짜로 대체하므로, 이 테스트 실행만을 위해 `npm install`할 필요는 없다.

```powershell
git clone https://github.com/WILDMONSTR/information-mi.git
cd information-mi
git fetch origin ai-a-marketprices-hardening
git switch --detach cbe1410bcc1ac41a5c5573f9572b3fe3736034df
node --version
node test-marketPrices.js
```

예상 기록: `T05-C01 PASS`부터 `T05-C10 PASS`까지 10개. 이는 해당 커밋의 테스트 스크립트가 구현한 조건에 대한 로컬 검사이며, Node 20·운영 API·배포 확인을 뜻하지 않는다. 이번 요청의 조건에 따라 현재 이어서 처리 중에는 위 검사 명령을 재실행하지 않았다.

## 4. AI A 실제 사용량 기록

- 작업 시작 기록: 2026-10-12 23:06 KST (대화 시작 시각으로 기록됨).
- 구현 요청: 최초 지시 1회, 코드 수정 지시 0회로 기존 문서에 기록됨.
- 이후 안내 대화: 로컬 복제·테스트를 위한 터미널 안내와 결과 확인이 있었음. 이를 과제의 요청 횟수 상한에 포함하는지는 기존 문서만으로 확정할 수 없음.
- 시간: AI A 코드 작성 종료/인계 시각은 정확히 기록되지 않았다. 로컬 테스트·정리 완료 시각은 2026-10-13 17:42 KST로 기록되어 있다. 따라서 **30분 상한 준수를 입증할 수 없다**. 두 시각을 하나의 연속 구간으로 계산하면 30분을 초과한다.
- 토큰/정확한 모델 사용량: 측정 기록 없음. 수치를 추정하지 않는다.
- 실행 환경: Windows PowerShell, Node.js v24.20.0.

## 5. 남은 문제와 금지 범위

1. 필요 시 별도 검증 단계에서 Node.js 20 환경 검사를 계획하되, 그 결과는 기존 Node 24 기록과 구분한다.
2. T05-C08의 구현된 검사 범위가 요구 문구보다 좁다. 기존 10개 검사를 이 결과 보존 작업에서 재실행하거나 고쳐서 과거 결과를 대체하지 않는다.
3. 저장소의 `firebase.json`은 functions source를 `functions`로 지정하는 반면 `index.js`와 `package.json`은 저장소 루트에 있다. 이 구성은 기존 인수인계에서 구조 불일치로 기록됐으며, **배포 금지**다.
4. 실제 API 키 사용, 배포, 브랜치 병합을 금지한다. `marketPrices.js`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `package.json`, `package-lock.json`, `public/`을 수정하지 않는다. 변경 파일 수·총 변경 수 상한도 넘기지 않는다.

## 6. 파일 참조

- [AI A 커밋](https://github.com/WILDMONSTR/information-mi/commit/cbe1410bcc1ac41a5c5573f9572b3fe3736034df)
- [AI A 브랜치 비교](https://github.com/WILDMONSTR/information-mi/compare/923612383174f094754909254a57b54a03c4f4a6...cbe1410bcc1ac41a5c5573f9572b3fe3736034df)
- [작업 소스 index.js](https://github.com/WILDMONSTR/information-mi/blob/cbe1410bcc1ac41a5c5573f9572b3fe3736034df/index.js)
- [고정 검사 스크립트](https://github.com/WILDMONSTR/information-mi/blob/cbe1410bcc1ac41a5c5573f9572b3fe3736034df/test-marketPrices.js)
