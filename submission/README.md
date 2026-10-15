# T05 인수인계 재현성 비교 — 최신 작업 문서

이 브랜치는 INFORMATION-MI의 MobiLife 시세 조회 프록시 요청·오류 처리 개선을 대상으로, AI A와 AI B가 **같은 저장소 커밋·Node.js 버전·검사 명령**을 독립된 새 작업 폴더에서 재현하는지 확인하기 위한 문서만 관리한다.

기존 제출 자료는 `t05-evaluation-submission` 브랜치에 보존한다. 이 비교 브랜치에서 이전 실행의 결과·점수표를 새 재검사의 결과로 오인하지 않도록, 이전 Node.js 환경에서 작성된 비교 기록은 정리했다. 기능 코드, 테스트 코드, `main`, AI A/B 원본 브랜치는 변경하지 않았다.

## 현재 사용할 문서

1. [인수인계 재현성 비교 프로토콜](./T05_AI_AB_%EC%9D%B8%EC%88%98%EC%9D%B8%EA%B3%84_%EC%9E%AC%ED%98%84%EC%84%B1_%EB%B9%84%EA%B5%90_%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C_20261015.md) — 공통 실행 기준과 10점 판정 규칙
2. [비교 결과 양식](./T05_AI_AB_%EC%9D%B8%EC%88%98%EC%9D%B8%EA%B3%84_%EC%9E%AC%ED%98%84%EC%84%B1_%EB%B9%84%EA%B5%90_%EA%B2%B0%EA%B3%BC_%EC%96%91%EC%8B%9D_20261015.md) — 두 후보의 실행 증거 기록
3. [AI A 재검사 기록](./T05_AI_A_%EC%9E%AC%EA%B2%80%EC%82%AC_%EC%8B%A4%ED%96%89%EA%B8%B0%EB%A1%9D_Node22_20261015.md) — 현재 실행기의 GitHub DNS 문제로 복제·테스트가 미실행된 기록
4. [AI B 재검사 요청서](./T05_AI_B_%EC%9E%AC%EA%B2%80%EC%82%AC_%EC%9A%94%EC%B2%AD_20261015.md) — AI B에게 전달할 독립 실행 지시

## 이번 재검사의 고정 기준

- 저장소: https://github.com/WILDMONSTR/information-mi
- 대상 코드 커밋: `bdb3e0954bc32dc4f8e6681ab6d82f4ce5cd7388`
- 요구 Node.js 버전: `v22.16.0`
- 검사: `node --check index.js`, `node --check public/js/market.js`, `node test-marketPrices.js`
- 테스트는 합성 업스트림 응답을 사용한다. 실제 시세 API 통신과 Firebase 배포를 증명하지 않는다.

## 현재 판정

AI A 실행기는 Node.js `v22.16.0`, npm `10.9.2`, Git `2.47.3`을 확인했지만 GitHub 주소 조회에 실패해 저장소를 복제하지 못했다. 따라서 이번 회차의 소스 검사와 T05-C01~C10은 **미실행**이며 PASS나 점수로 기록하지 않는다. AI B의 이번 회차 결과가 도착하더라도, AI A와 AI B가 같은 조건에서 모두 실행하지 않는 한 비교 우위를 판정하지 않는다.
