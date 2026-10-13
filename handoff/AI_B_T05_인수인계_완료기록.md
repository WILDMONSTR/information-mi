# information-mi | T05 AI B 단계 인수인계·검사·사용량 기록

작성일: 2026-10-13 (KST 기록 기준)  
저장소: https://github.com/WILDMONSTR/information-mi  
AI B 결과 브랜치: `ai-b-marketprices-hardening`  
AI B 코드 보존 커밋: `bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388`  
기준 커밋: `923612383174f094754909254a57b54a03c4f4a6`

## 1. 현재 결론

AI B로 제출된 패치의 소스와 테스트 파일은 `ai-b-marketprices-hardening` 브랜치에 보존했다. `main`과 AI A 브랜치는 변경·병합하지 않았다. 브랜치 비교상 변경 파일은 `index.js`, `test-marketPrices.js` 2개이고, `index.js`는 +24/-7, 테스트 파일은 +98/-0이다. 총 변경량은 삽입·삭제 합계 129줄로 150줄 상한 이내이며 새 의존성 추가는 없다.

기능 코드에는 검색어 50 유니코드 코드 포인트 초과 시 HTTP 400 JSON 반환, 성공 응답의 60초 인스턴스 메모리 캐시(최대 200개), 업스트림 401/403 본문 제거, 오류 로그에서 예외 전체 객체 대신 이름만 기록하는 변경이 들어 있다.

**중요한 검증 한계:** `node test-marketPrices.js`는 재구성한 로컬 검증 하네스(Node.js v22.16.0)에서 실행되어 10개 ID가 모두 `PASS`로 출력됐다. 다만 해당 임시 하네스는 원격 저장소를 직접 복제할 수 없어 `public/js/market.js` 대신 문법상 유효한 임시 파일을 두었다. 따라서 T05-C01의 브라우저 스크립트 검사는 AI B 실행으로 완전하게 입증되지 않았으며, T05-C17을 전체 PASS로 선언하지 않는다. 실제 저장소의 `public/js/market.js` blob SHA는 기준 커밋과 같고, AI A의 기존 기록에는 해당 검사가 PASS라고 적혀 있으나 이는 AI B 실행 증거를 대체하지 않는다.

## 2. 브랜치·코드 보존

- 저장소: https://github.com/WILDMONSTR/information-mi
- AI A 결과 브랜치: https://github.com/WILDMONSTR/information-mi/tree/ai-a-marketprices-hardening
- AI A 결과 커밋: `cbe1410bcc1ac41a5c5573f9572b3fe3736034df`
- AI B 결과 브랜치: https://github.com/WILDMONSTR/information-mi/tree/ai-b-marketprices-hardening
- AI B 코드 보존 커밋: https://github.com/WILDMONSTR/information-mi/commit/bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388
- AI B 소스: https://github.com/WILDMONSTR/information-mi/blob/ai-b-marketprices-hardening/index.js
- AI B 테스트 스크립트: https://github.com/WILDMONSTR/information-mi/blob/ai-b-marketprices-hardening/test-marketPrices.js
- 비교 결과: 기준 커밋에서 AI B 코드 커밋까지 1개 커밋, `index.js` +24/-7, `test-marketPrices.js` +98/-0.
- 배포하지 않았고 `main`에 병합하지 않았다.

## 3. 입력 자료 및 인수인계 무결성

### 보존된 AI A 원본 인수인계 파일

파일명: `information-mi_AI-A_종료_인수인계.docx`  
라이브러리 원본 SHA-256: `298813b9522d3fafd31c3a58b1923857530b3f5a986872875f91f7ad7992de7d`

기준 문서는 보존했고 덮어쓰지 않았다. AI B에게 제공한 것으로 요구된 자료는 기준 저장소의 URL/기준 커밋과 이 인수인계 문서뿐이라는 조건이다. 하지만 Claude 세션의 실제 첨부 파일 목록, 프롬프트 전문, AI B가 받은 문서 해시 또는 세션 내 확인 응답은 제출 패치에 포함돼 있지 않다. 따라서 **T05-C13과 T05-C14는 현재 자료만으로 독립 검증할 수 없다.** 사용자의 작업 조건과 패치 메타데이터는 기록했지만, 이것을 세션 입력의 독립 증거로 간주하지 않는다.

### 테스트 출처 주의점

AI B 제출 패치가 추가한 `test-marketPrices.js`의 Git blob SHA는 `3d764e8f626648644952ba1edc6d72dbfc67f339`다. 이 값은 AI A의 사후 결과 브랜치에 있는 동일 파일 blob SHA와 정확히 같다. 테스트 10개의 기대값 변경·삭제·완화가 없다는 점을 확인하는 데는 도움이 되지만, 바이트 단위로 동일하다는 사실만으로 AI B가 AI A의 사후 코드에 접근하지 않았다고 입증할 수는 없다. 독립 작업 여부를 완전히 확정하려면 Claude 세션의 입력/첨부 기록이 필요하다. 이것은 의도적 공유라고 단정하는 것이 아니라, 출처 기록에 남겨야 할 검증 공백이다.

## 4. 수정 전후 문서 누락 기록 (T05-C15)

| 항목 | AI A 인수인계 문서의 기존 상태 | 보완 기록 |
|---|---|---|
| AI A 완료·인계 시각 | 정확한 코드 종료/인계 시각 미기록 | 미기록 사실을 유지하고 임의 추정하지 않음 |
| AI B 시작 시각 | 항목 없음 | Claude 세션의 시작 타임스탬프 미제공으로 표시 |
| AI B에 제공된 자료의 증명 | 수신 자료 해시/첨부 목록 없음 | 원본 문서 해시 보존, AI B 측 수신 자료는 미검증으로 표시 |
| AI B 실제 호출·요청 수 | 항목 없음 | 세션 로그/호출 수가 없어 미검증으로 표시 |
| AI A 실제 요청·호출 수 | 구현 지시 1회, 수정 지시 0회라고 기재; 후속 지원 대화의 집계 여부 불명 | 코딩 지시 수와 모든 대화·도구 호출 수를 구분하며 상한 준수는 입증 불가로 명시 |
| AI B 검사 실행 증거 | 항목 없음 | 실행 로그와 로컬 하네스의 한계 추가 |
| 테스트 출처 경고 | 항목 없음 | AI B 테스트 파일 blob이 AI A 파일과 동일함을 추가 기록 |

이 표와 본 문서가 기존 인수인계의 보완 부록이다. AI B 입력으로 사용했다는 원본은 변경하지 않아 후속 비교 대상의 기준을 보존한다.

## 5. 시간·요청 수 연대표

| 순서 | 시각(KST) | 기록된 사실 | 증거 수준 |
|---|---|---|---|
| A 시작 | 2026-10-12 23:06 | AI A 인수인계 문서의 시작 기록 | 문서 기록 |
| A 작업 종료/인계 | 정확한 시각 없음 | 문서에 AI A 코드 작성 종료/인계 시각이 정확히 기록되지 않았다고 적혀 있음 | 미입증 |
| A 로컬 검사·정리 | 2026-10-13 17:42 | 기존 인수인계 문서가 기록한 로컬 검사·정리 완료 시각 | 문서 기록이며 AI A 코드 작업 종료 시각은 아님 |
| AI A 문서 라이브러리 기록 | 2026-10-13 17:49:52 | 보존된 문서의 라이브러리 생성 시각(KST 환산) | 라이브러리 메타데이터 |
| B 패치 생성 시각 | 2026-10-13 23:51:47 | 첨부 패치의 커밋 헤더 시각; Claude Code 세션 URL도 포함 | 패치 메타데이터. 세션 시작·완료 시각은 아님 |
| B 시작 | 미기록 | 별도의 시작 타이머/대화 시작 기록 없음 | 미입증 |
| B 완료 | 미기록 | 패치 헤더 시각 외 별도 완료 시각 없음 | 미입증 |

공통 작업 상한은 30분, 요청 상한은 최초 요청 1회+수정 요청 최대 2회로 기존 문서에 기록돼 있다. 그러나 AI A 완료 시각이 없어 T05-C50을 입증할 수 없다. AI B 시작 시각과 Claude 대화/호출 로그가 없어 T05-C51과 T05-C53을 입증할 수 없다. AI A는 코딩 지시 1회 및 코드 수정 지시 0회라고 기록했지만, 전체 지원 대화까지 요청으로 세는 방식이 정해져 있지 않아 T05-C52의 전체 요청/호출 상한 준수도 입증할 수 없다. 토큰/비용 사용량은 양쪽 모두 증거가 제공되지 않았다.

## 6. T05-C13~C20, C39, C50~C53 판정표

| 기준 | 판정 | 근거/남은 증거 |
|---|---|---|
| T05-C13 AI B 입력은 저장소+인수인계 문서만 | 미입증 | 요구 조건은 기록했으나 Claude 세션 입력/첨부 로그 없음 |
| T05-C14 A 인수인계와 B 수신 내용 동일 | 미입증 | 원본 문서 SHA-256 보존, B 수신본 해시/세션 확인 자료 없음 |
| T05-C15 누락 문서화 및 수정 전후 기록 | 완료 | 위 4절에 기존 누락과 보완을 표로 기록 |
| T05-C16 기능 한 개 완성 | 조건부 통과 | 패치에 검색 길이 제한, 60초 캐시, 인증 오류 본문 숨김이 구현됨; T05-C01 하네스 한계와 운영 미검증은 남음 |
| T05-C17 B가 같은 검사 10개 실행 | 부분 검증 | 10개가 출력상 PASS이나 실제 `public/js/market.js` 대신 임시 파일을 사용했으므로 완전 통과로 인정하지 않음 |
| T05-C18 검사 삭제 0건 | 코드 내용상 통과 | 제출 테스트 스크립트에 T05-C01~C10 10개가 모두 존재 |
| T05-C19 검사 완화 0건 | 코드 내용상 통과 | AI B 테스트 blob SHA가 AI A 테스트 blob SHA와 동일 |
| T05-C20 기대값 변경 0건 | 코드 내용상 통과 | 동일 파일 SHA로 테스트 기대값 변경 없음; 단, 출처/독립성 주의점은 3절 참조 |
| T05-C39 A와 다른 서비스/모델 사용 | 조건부 통과 | 패치 헤더는 “AI B (Claude)” 및 “Claude Sonnet 5.5”와 세션 URL을 표시. 실제 세션은 독립 접근/검증하지 못함 |
| T05-C50 A 작업시간 상한 준수 | 미입증 | AI A 완료 시각 불명 |
| T05-C51 B 작업시간 상한 준수 | 미입증 | AI B 시작 시각/타이머/종료 시각 로그 없음 |
| T05-C52 A 요청·호출 상한 준수 | 미입증 | 구현 요청 1, 코드 수정 0 기록은 있으나 모든 지원 대화/도구 호출 집계 불명 |
| T05-C53 B 요청·호출 상한 준수 | 미입증 | Claude 세션 요청/도구 호출 수 미제공 |

## 7. AI B 검사 실행 기록

로컬 명령: `node test-marketPrices.js`  
실행 환경: Node.js v22.16.0, 임시 재구성 하네스. 업스트림 호출은 `global.fetch` 가짜 응답으로 대체했고 실제 API 키를 사용하지 않았다.

출력은 T05-C01~T05-C10 모두 `PASS`였다. 그러나 하네스에 있는 `public/js/market.js`는 실제 저장소 원본이 아닌 문법 검사만 가능한 임시 파일이었다. 따라서 실행 로그를 원본 전체 저장소에서의 10/10 정식 PASS 증거로 제시하지 않는다. 기준 커밋의 실제 브라우저 파일 blob SHA는 `f8a92c5136fbbef94d567bc7059a45dd7e96bd3e`로 확인했고, 해당 파일은 AI B 브랜치에서도 수정되지 않았다. 정식 완료를 위해서는 실제 저장소 브랜치 체크아웃 상태에서 동일 스크립트를 다시 실행하고 원본 `public/js/market.js` 검사를 확인한 원시 로그를 추가해야 한다.

변경량은 GitHub 기준 커밋 비교로 독립 확인했다: `index.js` 24 insertions/7 deletions, `test-marketPrices.js` 98 insertions/0 deletions, 총 129 changed lines. 금지 파일 및 의존성 변경은 비교 결과에서 발견되지 않았다.

## 8. 다음 담당자 실행 명령

```bash
git clone https://github.com/WILDMONSTR/information-mi.git
cd information-mi
git fetch origin ai-b-marketprices-hardening
git checkout --detach bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388
node --version
node --check index.js
node --check public/js/market.js
node test-marketPrices.js
git diff --numstat 923612383174f094754909254a57b54a03c4f4a6...HEAD
git status --short
```

`node test-marketPrices.js`는 합성 `fetch`를 사용하며 운영 API/배포를 검증하지 않는다. `package.json`은 Node.js 20을 선언한다. 위 명령에서 사용할 수 있는 Node 버전과 실행 결과를 원시 로그로 보존한다. 배포나 `main` 병합은 별도 승인 전까지 하지 않는다.

## 9. 증거 파일 및 체크섬

- AI B 원본 제출 패치 SHA-256: `bc8d9bdfbf1e5f0ee2c1d5bc60e05f0094ac6fcf812c0e6d32fd7ddb2660fbbc`
- AI A 원본 인수인계 DOCX SHA-256: `298813b9522d3fafd31c3a58b1923857530b3f5a986872875f91f7ad7992de7d`
- AI B `test-marketPrices.js` Git blob SHA-1: `3d764e8f626648644952ba1edc6d72dbfc67f339` (AI A의 동일 파일과 동일)
- AI B `index.js` Git blob SHA-1: `02396e704fba59a258419332e9bd7a06f9fe8e93`
- 보존 브랜치: `ai-b-marketprices-hardening`
- 코드 보존 커밋: `bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388`

이 보완 기록은 증거가 없는 시간을 추정하지 않고 “미입증”으로 표시한다. 제출 패치의 메타데이터는 AI B 출처의 주장으로 기록했으며, 세션 기록을 대체하는 독립적인 실행 로그로 취급하지 않는다.
