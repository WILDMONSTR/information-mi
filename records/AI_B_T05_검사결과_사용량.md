# information-mi — AI B 검사 결과 및 사용량 기록

- 기록 작성: 2026-10-14 (KST)
- 저장소: https://github.com/WILDMONSTR/information-mi
- 기준 커밋: `923612383174f094754909254a57b54a03c4f4a6`
- AI B 작업 브랜치: `ai-b-marketprices-hardening`
- **AI B 결과 커밋: `bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388`** (WILDMONSTR가 AI B 패치를 보존해 올린 커밋)
- 패치 원본 커밋: `2b80e55cc0afe317cbe645936c8ef5a8983b15de` (AI B 세션의 로컬 커밋, 원격에는 없음). 두 커밋의 파일 트리는 동일함을 `git diff`로 확인.
- 이 기록 파일은 결과 브랜치와 분리하기 위해 `main`에서 만든 별도 브랜치(`ai-b-usage-record`)에만 있음. 결과 브랜치에 추가하면 T05-C10(파일 2개 이하)이 깨지기 때문.

## 1. 검사 결과 (AI B 세션에서 직접 실행)

실행 환경: Linux 클라우드 컨테이너, **Node.js v22.22.0** (package.json은 Node 20 지정 — Node 20 검증은 아님). 검사 스크립트는 AI A 브랜치의 `test-marketPrices.js`를 그대로 사용(검사 정의 동일).

### 실행 이력

| 회차 | 시각 (KST) | 대상 | 결과 |
|---|---|---|---|
| 1회 | 2026-10-13 23:51:48 | 로컬 커밋 `c136174` (첫 구현) | C01~C09 PASS, **C10 FAIL** (변경 169줄 > 150) |
| 2회 | 2026-10-13 23:52:02 | 로컬 커밋 `2b80e55` (재작성 후) | **C01~C10 모두 PASS** |
| 3회 | 2026-10-14 00:1x | 원격 `bdb3e09`로 로컬 정렬 후 | **C01~C10 모두 PASS** (PASS 줄만 확인, 전체 로그는 보관 안 함) |
| 4회 | 2026-10-14 01:04:03 | 원격 `bdb3e09` (이 기록 작성 시 재실행) | **C01~C10 모두 PASS**, exit 0 (전체 로그는 아래 4번 항목) |

### 검사별 결과 (1~4회 기준, 최종 상태)

| 검사 | 최종 | 관찰 범위 |
|---|---|---|
| T05-C01 | PASS | `index.js`, `public/js/market.js` 문법 검사 |
| T05-C02 | PASS | `marketPrices`가 함수로 export되는지 |
| T05-C03 | PASS | 정상 GET, sort=`pct_change_24h_desc`, min_count=`1`, 본문·상태 |
| T05-C04 | PASS | POST에 405 JSON, 업스트림 추가 호출 없음 |
| T05-C05 | PASS | limit 500/-1/abc → 100, offset -1 → 0 |
| T05-C06 | PASS | search 50자 수용, 51자 400 JSON, 업스트림 호출 없음 |
| T05-C07 | PASS | 동일 쿼리 60초 캐시, 업스트림 fetch 1회 |
| T05-C08 | PASS | 더미 키가 `index.js`·`public/`에 없음 |
| T05-C09 | PASS | 401/403 본문 비노출, 네트워크 오류 시 JSON 오류 |
| T05-C10 | PASS* | 파일 2개 이하, 금지 파일 무변경, 총 변경 150줄 이하 (*1회차 FAIL 후 수정) |

### 판정 범위 주의

- T05-C08은 더미 키를 `index.js`와 `public/`에서만 검색한다. 응답·로그 전체나 Bearer 문자열 전반을 검사하지 않는다(AI A와 동일한 스크립트).
- T05-C09는 가짜 응답만 쓴다. 실제 운영 API, 배포, 실 키 동작은 검증하지 않았다.
- C07 캐시는 인스턴스 메모리 캐시이며 성공(2xx) 응답만 저장한다. 최대 200개를 넘으면 가장 오래된 항목부터 지운다.

## 2. 변경 범위

- 기준 커밋 대비 `index.js` 24 additions / 7 deletions = 31줄, `test-marketPrices.js` 98 additions.
- 합계 **2개 파일, 129 changed lines, 새 의존성 0개** (상한 150줄 이내).
- 변경: 검색어 50자 초과 시 400, 쿼리별 60초 메모리 캐시, 401/403 업스트림 본문(`upstream_response`) 제거, 예외 로그를 `error.name`만 기록.
- `main`은 기준 커밋 유지. 병합·배포 안 함.

## 3. AI B 실제 사용량 기록

기준: 종료 시각 = **AI B 패치 파일(`ai-b-marketprices-hardening.patch`) 작성 시각**. 파일 수정 시각(mtime) 2026-10-13 23:52:06 KST. 패치 안의 커밋 날짜는 23:51:47 KST.

| 항목 | 값 |
|---|---|
| 작업 시작 시각 | 2026-10-13 23:49 KST (첫 요청 메시지 전송 시각, 분 단위만 기록됨) |
| 종료 시각 | 2026-10-13 23:52:06 KST (패치 파일 작성) |
| 실제 작업 소요 시간 | 약 3분 (23:49 → 23:52:06). 시작이 분 단위라 오차 최대 약 1분. |
| 최초 구현 요청 | 1회 (23:49, "AI B로서 수행해" + AI A 인수인계 docx 첨부) |
| 코드 수정 요청 | 0회 (사용자가 코드 수정을 요청한 적 없음) |
| 사용자 요청(메시지) 수 — 패치 작성까지 | **2회** (23:49 최초 요청, 23:50 첨부 파일을 추가해 보낸 메시지) |
| 사용자 요청(메시지) 수 — 전체 | 6회 (위 2회 + 23:56 "연결 갱신하자", 00:09 "연결했어", 00:16 "다시 해봐", 01:03 이 기록 작성 요청). 후반 4회는 push 권한 연결과 기록 작성 요청이며 구현·수정 요청은 아님. |
| 도구/함수 호출 수 — 패치 작성까지 | 18회 (Bash 9, Edit 7, 메모리 도구 2). 이 중 Bash 9에는 첫 구현의 문서 읽기 2회 포함. 사용자가 첨부한 md 파일은 첨부 처리 과정에서 시스템이 대신 읽었으며 이 수에 넣지 않음. 패치 파일 전달(`SendUserFile`) 1회는 패치 작성 이후라 별도. |
| 도구/함수 호출 수 — 패치 작성 이후 | 약 12회 (push 시도 Bash 6, 저장소 연결 도구 2, 원격 비교·정렬 Bash 3, 파일 전달 1) |
| 오류/수정 회차 | **오류 1회, 수정 1회** — 첫 구현의 총 변경이 169줄이라 C10 FAIL → `index.js`를 간결하게 재작성해 129줄로 줄이고 재검사 PASS |
| 그 외 실패(코드 외) | push가 권한 문제로 403 거부된 것이 5회(저장소 접근 미연결). 이후 원격에 이미 같은 이름의 브랜치가 있어 non-fast-forward 거부가 1회. 모두 코드 결함이 아니라 권한·이력 문제였음. |
| 토큰/정확한 모델 사용량 | 측정 기록 없음. 추정하지 않음. |
| 30분 상한 | **준수** — 시작부터 패치 작성까지 약 3분. (push·기록 작업은 이후 별도 소요.) |
| 요청 3회 상한 | 패치 작성까지 2회로 **준수**. 전체 6회로 세면 초과하나 후반 요청은 구현이 아닌 push 권한 연결과 기록 작성임. 어느 기준으로 볼지는 과제 규칙에 따라 판단 필요. |
| 실행 환경 | Linux 클라우드 컨테이너, Node.js v22.22.0 |

### 이 수치의 한계

- 시작 시각은 메시지 전송 시각(분 단위)이고, 종료 시각은 패치 파일 mtime(초 단위)이라 소요 시간은 "약 3분"으로만 기록한다. 세션 중 한때 시작을 23:50으로 안내했으나, 첫 요청은 23:49에 전송되었다. 이 기록은 23:49를 시작으로 한다.
- 도구 호출 수는 대화 기록에서 세어 얻은 값이다. 시스템 로그로 검증하지 않았다.
- 패치 작성 이후의 호출 수는 "약"으로 표기했다. 비슷한 호출이 여러 번 반복되었다.

## 4. 4회차 검사 전체 로그 (2026-10-14 01:04:03 KST, 커밋 `bdb3e09`)

```
rerun start 2026-10-14 01:04:03 KST
v22.22.0
T05-C01 PASS
T05-C02 PASS
MABIMOBI API status: 200
T05-C03 PASS
T05-C04 PASS
MABIMOBI API status: 200
MABIMOBI API status: 200
MABIMOBI API status: 200
MABIMOBI API status: 200
T05-C05 PASS
MABIMOBI API status: 200
T05-C06 PASS
MABIMOBI API status: 200
T05-C07 PASS
T05-C08 PASS
MABIMOBI API status: 401
MABIMOBI API status: 403
모비라이프 API 호출 실패: Error
T05-C09 PASS
T05-C10 PASS
exit=0
```

## 5. 재현 명령

```
git clone https://github.com/WILDMONSTR/information-mi.git
cd information-mi
git switch ai-b-marketprices-hardening
git rev-parse HEAD   # bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388
node --version
node test-marketPrices.js
```

예상: `T05-C01 PASS`부터 `T05-C10 PASS`까지 10개. Node 20, 운영 API, 배포 확인을 뜻하지 않는다.

## 6. 남은 문제와 금지 범위

1. Node.js 20 검증은 하지 않았다. 필요하면 별도 환경에서 실행하고 Node 22 기록과 구분한다.
2. `firebase.json`의 functions source(`functions`)와 루트 `index.js`·`package.json` 위치가 맞지 않는다(AI A 때부터 알려진 구조 불일치). **배포 금지.**
3. 실제 API 키 사용, 배포, `main` 병합 금지. `marketPrices.js`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `package.json`, `package-lock.json`, `public/`은 수정하지 않았다.

## 7. 파일 참조

- [AI B 결과 커밋](https://github.com/WILDMONSTR/information-mi/commit/bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388)
- [기준 대비 비교](https://github.com/WILDMONSTR/information-mi/compare/923612383174f094754909254a57b54a03c4f4a6...bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388)
- [작업 소스 index.js](https://github.com/WILDMONSTR/information-mi/blob/bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388/index.js)
- [고정 검사 스크립트](https://github.com/WILDMONSTR/information-mi/blob/bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388/test-marketPrices.js)
