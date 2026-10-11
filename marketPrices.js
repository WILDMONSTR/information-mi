const { onRequest } =
  require("firebase-functions/v2/https");

const { defineSecret } =
  require("firebase-functions/params");


const MABIMOBI_API_KEY =
  defineSecret("MABIMOBI_API_KEY");


const MABIMOBI_API_URL =
  "https://open.mabimobi.life/v1/market/prices";


exports.marketPrices = onRequest(
  {
    region: "asia-northeast3",

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
        error: "GET 요청만 허용됩니다."
      });

      return;
    }


    try {

      /*
       * 브라우저에서 전달받은 검색 조건
       */

      const parentCategory =
        String(
          req.query.parent_category || ""
        );


      const search =
        String(
          req.query.search || ""
        );


      let limit =
        Number(
          req.query.limit || 100
        );


      let offset =
        Number(
          req.query.offset || 0
        );


      /*
       * 잘못된 값 방지
       */

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
       * 모비라이프 API 파라미터
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
       * Secret으로 저장된 API 키를 사용
       */

      const apiKey =
        MABIMOBI_API_KEY.value();


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
       * 모비라이프가 반환한 상태 코드와
       * 본문을 그대로 전달
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
          "모비라이프 거래소 API 호출에 실패했습니다."
      });

    }

  }
);