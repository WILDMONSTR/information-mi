# information-mi — AI A 인수인계 (전문 텍스트 보존본)

> 원본 파일명: information-mi_AI-A_종료_인수인계.docx  
> 원본 SHA-256: `298813b9522d3fafd31c3a58b1923857530b3f5a986872875f91f7ad7992de7d`  
> 이 파일은 저장된 DOCX에서 추출한 텍스트를 Markdown으로 보존한 참고 사본이다. 원본 DOCX와 바이너리 동일하다고 주장하지 않는다.

상태: 코드 저장 완료 / 로컬 테스트 T05-C01~T05-C10 전부 PASS (Windows PowerShell, Node.js v24.20.0). Node.js 20에서의 재검증은 미실행.

## 1. 실험 등록 및 공통 조건

- 저장소: https://github.com/WILDMONSTR/information-mi
- 기준 커밋: `923612383174f094754909254a57b54a03c4f4a6`
- AI A 시작 기록: 2026-10-12 23:06 KST (대화 시작 시점 기록)
- 공통 시간 상한: 30분, AI 응답 대기 포함
- 공통 요청 상한: 최대 3회: 최초 요청 1회 + 수정 요청 최대 2회
- 변경 범위 상한: 파일 최대 2개, 추가·삭제 합계 150줄 이하, 새 의존성 0개
- 금지: 배포 금지, 실제 API 키 사용 금지, 웹 검색 비활성 조건을 AI B에도 동일 적용
- 확정값: search 최대 50자, 캐시 60초, 오류 응답 JSON `{"error":"문구"}`

## 2. 최초 요청 공통 지시문

저장소 https://github.com/WILDMONSTR/information-mi 의 기준 커밋 9236123에서 시작한다. AI A와 AI B의 공통 상한은 30분, 사용자 요청 최대 3회다. index.js에 search 50자 초과 입력 거부(400 JSON), 동일 parent_category/search/limit/offset 조합의 60초 캐시, 업스트림 401/403 본문 비노출을 구현한다. 기존 GET 제한, 페이지네이션 보정, 정상 응답을 유지한다. index.js 외에는 테스트 파일 1개만 허용하며, 총 변경 줄 수는 150줄 이하, 새 의존성은 0개다. marketPrices.js, firebase.json, firestore.rules, firestore.indexes.json, package.json, package-lock.json, public/는 수정하지 않는다. 실제 API 키 사용 및 배포를 금지하고, 업스트림은 테스트에서 가짜 fetch로 대체한다. 고정 검사 T05-C01~T05-C10을 실행하고 상한에 도달하면 중단한다. 결과에는 커밋 SHA, diff, 검사별 결과, 실패 번호, 실제 소요 시간, 요청 횟수, 변경 줄 수, 남은 문제를 기록한다.

## 3. 고정 검사 10개

| 검사 ID | 입력 / 실행 조건 | 관찰 가능한 기대값 |
|---|---|---|
| T05-C01 | `node --check index.js` 및 `public/js/market.js` | 두 명령 종료 코드 0 |
| T05-C02 | npm install 후 require('./index.js')와 export 확인 | 모듈 로드 성공, marketPrices export 존재 |
| T05-C03 | 정상 GET, search=검, limit=10, offset=0; 가짜 업스트림 응답 | sort=pct_change_24h_desc 및 min_count=1 포함, 정상 본문·상태 전달 |
| T05-C04 | POST 요청 | HTTP 405 및 JSON 오류 |
| T05-C05 | limit=500, -1, abc 및 offset=-1 | 업스트림 전달 값 100, 100, 100, 0 |
| T05-C06 | search 길이 50자와 51자 | 50자는 거부하지 않음, 51자는 HTTP 400 JSON이며 업스트림 호출 0회 |
| T05-C07 | 동일 쿼리 60초 이내 2회 | 동일 응답, 업스트림 fetch 총 1회 |
| T05-C08 | 가짜 키 문자열을 응답·로그·public/에서 검색 | 키 값 또는 Bearer 인증 문자열 노출 없음 |
| T05-C09 | 업스트림 401, 403, 네트워크 실패 | 함수 생존, JSON 오류, 401/403 본문 비노출 |
| T05-C10 | 기준 커밋 대비 파일 목록·diff·의존성 확인 | 변경 파일 최대 2개, 총 변경 150줄 이하, 금지 파일 무변경, 의존성 추가 없음 |

## 4. AI A 작업 결과

- 작업 브랜치: `ai-a-marketprices-hardening`
- 최종 커밋 SHA: `cbe1410bcc1ac41a5c5573f9572b3fe3736034df`
- 브랜치 비교: https://github.com/WILDMONSTR/information-mi/compare/923612383174f094754909254a57b54a03c4f4a6...ai-a-marketprices-hardening
- 수정 소스: https://github.com/WILDMONSTR/information-mi/blob/ai-a-marketprices-hardening/index.js
- 검사 스크립트: https://github.com/WILDMONSTR/information-mi/blob/ai-a-marketprices-hardening/test-marketPrices.js
- 변경 통계: index.js +38/-14 (52 changes); test-marketPrices.js +98 (98 changes); 합계 150 changes (상한에 정확히 도달)
- 구현 요약: search 50자 초과는 400으로 거부. 쿼리 조합을 키로 60초 캐시. 401/403 응답에서 upstream_response 본문 제거. 네트워크 오류 로그에서 예외 객체를 출력하지 않도록 변경.
- 검사 실행 상태: 2026-10-13 로컬 Windows PowerShell에서 `node test-marketPrices.js` 실행. 출력상 T05-C01~T05-C10 전부 PASS. 테스트 출력에 401/403 및 업스트림 실패 로그가 있었고, 이어서 T05-C09 PASS가 확인됨. 실행 Node.js는 v24.20.0이며 Node.js 20 환경 재검증은 미실행. 실제 운영 API와 배포 동작은 검증하지 않음.
- 코드 변경 요청 기록: 최초 구현 지시 1회, 코드 수정 지시 0회로 기록. 이후 사용자와의 대화에는 로컬 복제·테스트 실행을 위한 터미널 안내 및 결과 확인이 포함됨; 이를 과제의 요청 상한에 포함하는지는 채점 기준에 맞게 별도 판정 필요.
- 시간 기록 한계: AI A 시작으로 기록된 시각은 2026-10-12 23:06 KST이나, AI A의 코드 작성 종료/인계 시각은 정확히 기록되지 않음. 로컬 테스트와 정리 완료 시각은 2026-10-13 17:42 KST. 이 두 시각을 하나의 연속 작업 시작·종료로 계산하면 30분 한도를 초과하므로, 30분 상한 준수 여부를 이 기록만으로 입증할 수 없음.

## 5. AI B 인수인계 및 다음 행동

1. AI B는 기준 커밋 923612383174f094754909254a57b54a03c4f4a6에서 별도 브랜치/복사본으로 시작한다. AI A의 수정 코드를 먼저 보지 않고 동일한 최초 요청과 고정 검사 10개를 사용한다.
2. AI B도 시간 30분, 사용자 요청 최대 3회, 변경 총 150줄 이하, 파일 최대 2개, 새 의존성 0개를 적용한다.
3. 로컬 검증 중 npm PowerShell 실행 정책 오류가 발생해 npm.cmd 사용을 안내했다. 사용자는 이후 node test-marketPrices.js를 실행했고 출력상 10개 검사가 모두 PASS다. 실제 실행 버전은 Node.js v24.20.0이며 Node.js 20에서의 동일 검사는 AI B 또는 후속 검증에서 별도로 실행한다.
4. 테스트 스크립트는 실제로 실행되었고 출력상 T05-C01~T05-C10이 모두 PASS다. 이는 스크립트가 구현한 테스트 조건의 통과를 뜻하며, 실제 운영 API·배포 검증을 뜻하지 않는다.
5. AI A의 현재 브랜치에 배포나 병합은 하지 않았다. 공개 저장소의 작업 브랜치에 커밋만 저장했다.

## 6. 남은 주의사항

- 현재 메모리 캐시는 인스턴스 단위이며 인스턴스 간 공유되지 않는다.
- 서로 다른 쿼리가 많을 때 캐시 크기 상한은 구현하지 않았다.
- 로컬 테스트 결과는 모두 PASS이나 Node.js 20 및 실제 운영 API/배포 환경은 검증하지 않았다.
- `npm.cmd install` 이후 package-lock.json이 수정된 것을 확인해 `git restore package-lock.json`으로 되돌렸으며, 최종 `git status --short` 출력은 비어 있었다.
