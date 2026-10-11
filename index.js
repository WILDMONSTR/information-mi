const {
  onRequest
} = require("firebase-functions/v2/https");

const {
  defineSecret
} = require("firebase-functions/params");


/*
 * Firebase Secret Manager에 저장된
 * 모비라이프 API 키
 */
const MABIMOBI_API_KEY =
  defineSecret("MABIMOBI_API_KEY");


/*
 * 모비라이프 거래소 최신 시세 API
 */
const MABIMOBI_API_URL =
  "https://open.mabimobi.life/v1/market/prices";


/*
 * 거래소 API 프록시 함수
 */
exports.marketPrices = onRequest(
  {
    region: "asia-northeast3",

    /*
     * 브라우저에서 공개적으로 호출 가능
     */
    invoker: "public",

    /*
     * 웹 페이지에서 호출 허용
     */
    cors: true,

    /*
     * Secret Manager의 API 키 사용
     */
    secrets: [
      MABIMOBI_API_KEY
    ]
  },

  async (req, res) => {

    /*
     * GET만 허용
     */
    if (req.method !== "GET") {

      res.status(405).json({
        error:
          "GET 요청만 허용됩니다."
      });

      return;
    }


    try {

      /*
       * 검색 조건
       */

      const parentCategory =
        String(
          req.query.parent_category || ""
        );


      const search =
        String(
          req.query.search || ""
        );


      /*
       * 페이지네이션
       */

      let limit =
        Number(
          req.query.limit || 100
        );


      let offset =
        Number(
          req.query.offset || 0
        );


      if (
        !Number.isFinite(limit) ||
        limit < 1
      ) {
        limit = 100;
      }


      if (limit > 100) {
        limit = 100;
      }


      if (
        !Number.isFinite(offset) ||
        offset < 0
      ) {
        offset = 0;
      }


      /*
       * 모비라이프 요청 생성
       */

      const params =
        new URLSearchParams({
          parent_category:
            parentCategory,

          search:
            search,

          sort:
            "pct_change_24h_desc",

          min_count:
            "1",

          limit:
            String(limit),

          offset:
            String(offset)
        });


      const apiUrl =
        `${MABIMOBI_API_URL}?${params.toString()}`;


      /*
       * Firebase Secret에서 키 읽기
       */
      const apiKey =
        MABIMOBI_API_KEY.value();


      if (!apiKey) {

        console.error(
          "MABIMOBI_API_KEY가 없습니다."
        );


        res.status(500).json({
          error:
            "모비라이프 API 키가 서버에 설정되지 않았습니다."
        });


        return;
      }


      /*
       * 모비라이프 API 호출
       */

      const response =
        await fetch(
          apiUrl,
          {
            method: "GET",

            headers: {
              "Authorization":
                `Bearer ${apiKey}`,

              "Accept":
                "application/json"
            }
          }
        );


      const body =
        await response.text();


      /*
       * 함수 로그에는 상태 코드만 기록
       * 실제 API 키는 기록하지 않음
       */

      console.log(
        "MABIMOBI API status:",
        response.status
      );


      /*
       * 모비라이프 API가 401/403을 반환하는 경우
       * 브라우저에서 원인을 구분하기 쉽게 처리
       */

      if (
        response.status === 401
      ) {

        res.status(502).json({
          error:
            "모비라이프 API 인증에 실패했습니다.",
          upstream_status:
            401,
          upstream_response:
            body
        });

        return;
      }


      if (
        response.status === 403
      ) {

        res.status(502).json({
          error:
            "모비라이프 API가 요청을 거부했습니다.",
          upstream_status:
            403,
          upstream_response:
            body
        });

        return;
      }


      /*
       * 모비라이프 응답을 브라우저로 전달
       */

      res.status(
        response.status
      );


      res.set(
        "Content-Type",
        response.headers.get(
          "content-type"
        ) ||
        "application/json; charset=utf-8"
      );


      res.set(
        "Cache-Control",
        "no-store"
      );


      res.send(body);


    } catch (error) {

      console.error(
        "모비라이프 API 호출 실패:",
        error
      );


      res.status(500).json({
        error:
          "모비라이프 거래소 API 호출 중 오류가 발생했습니다."
      });

    }

  }
);