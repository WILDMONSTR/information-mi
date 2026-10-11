/*
 * Firebase Hosting rewrite
 *
 * /api/market/prices
 *        ↓
 * Cloud Function: marketPrices
 */

const API_URL =
  "/api/market/prices";


/*
 * 자동 갱신
 *
 * 1시간
 */

const REFRESH_INTERVAL =
  60 * 60 * 1000;


/*
 * 검색 요청 지연
 */

const SEARCH_DELAY =
  500;


/*
 * 현재 데이터
 */

let currentData = [];


/*
 * 기본 정렬
 *
 * 24시간 상승률 오름차순
 */

let currentSortKey =
  "pct_change_24h";

let currentSortDirection =
  "asc";


/*
 * 숫자 표시
 */

function formatNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }


  const number =
    Number(value);


  if (
    Number.isNaN(number)
  ) {
    return "-";
  }


  return number.toLocaleString(
    "ko-KR"
  );
}


/*
 * 퍼센트 표시
 */

function formatPercent(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }


  const number =
    Number(value);


  if (
    Number.isNaN(number)
  ) {
    return "-";
  }


  if (number > 0) {

    return `
      ▲ ${number.toFixed(2)}%
    `;

  }


  if (number < 0) {

    return `
      ▼ ${Math.abs(number).toFixed(2)}%
    `;

  }


  return "0.00%";
}


/*
 * 변화율 클래스
 */

function getChangeClass(value) {

  const number =
    Number(value);


  if (
    Number.isNaN(number)
  ) {
    return "neutral";
  }


  if (number > 0) {
    return "up";
  }


  if (number < 0) {
    return "down";
  }


  return "neutral";
}


/*
 * HTML 특수문자 처리
 */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/*
 * 정렬 값
 */

function getSortableValue(
  item,
  key
) {

  const value =
    Number(
      item[key]
    );


  if (
    Number.isNaN(value)
  ) {
    return null;
  }


  return value;
}


/*
 * 데이터 정렬
 */

function sortData(data) {

  const sorted =
    [...data];


  sorted.sort(
    (a, b) => {

      const aValue =
        getSortableValue(
          a,
          currentSortKey
        );


      const bValue =
        getSortableValue(
          b,
          currentSortKey
        );


      /*
       * 값이 없는 항목은 마지막
       */

      if (
        aValue === null &&
        bValue === null
      ) {
        return 0;
      }


      if (
        aValue === null
      ) {
        return 1;
      }


      if (
        bValue === null
      ) {
        return -1;
      }


      let result =
        aValue - bValue;


      if (
        currentSortDirection ===
        "desc"
      ) {

        result *= -1;

      }


      return result;

    }
  );


  return sorted;
}


/*
 * 정렬 버튼 표시
 */

function updateSortButtons() {

  const buttons =
    document.querySelectorAll(
      ".sort-button"
    );


  buttons.forEach(
    button => {

      const key =
        button.dataset.sortKey;


      const originalText =
        button.dataset.originalText;


      if (
        key === currentSortKey
      ) {

        button.classList.add(
          "active"
        );


        const arrow =
          currentSortDirection ===
          "desc"
            ? "▼"
            : "▲";


        button.innerHTML =
          `${escapeHtml(originalText)}
           <span class="sort-arrow">
             ${arrow}
           </span>`;

      } else {

        button.classList.remove(
          "active"
        );


        button.textContent =
          originalText;

      }

    }
  );
}


/*
 * 정렬 버튼 클릭
 */

function handleSortClick(
  sortKey
) {

  if (
    currentSortKey ===
    sortKey
  ) {

    currentSortDirection =
      currentSortDirection ===
      "desc"
        ? "asc"
        : "desc";

  } else {

    currentSortKey =
      sortKey;


    /*
     * 새로운 기준은
     * 내림차순부터 시작
     */

    currentSortDirection =
      "desc";

  }


  updateSortButtons();


  renderTable(
    currentData
  );
}


/*
 * 거래소 API 호출
 */

async function fetchMarketData() {

  const search =
    document
      .getElementById(
        "searchInput"
      )
      .value
      .trim();


  const category =
    document
      .getElementById(
        "categorySelect"
      )
      .value;


  const params =
    new URLSearchParams({

      parent_category:
        category,

      search:
        search,

      limit:
        "100",

      offset:
        "0"

    });


  const url =
    `${API_URL}?${params.toString()}`;


  const status =
    document.getElementById(
      "status"
    );


  status.textContent =
    "거래소 시세를 불러오는 중...";


  try {

    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    /*
     * JSON인지 확인하기 전에
     * 상태 코드부터 확인
     */

    if (
      !response.ok
    ) {

      let errorBody = null;


      try {

        errorBody =
          await response.json();

      } catch {

        errorBody =
          null;

      }


      if (
        errorBody &&
        errorBody.error
      ) {

        if (
          errorBody.upstream_status
        ) {

          throw new Error(
            `${errorBody.error} ` +
            `(upstream ${errorBody.upstream_status})`
          );

        }


        throw new Error(
          errorBody.error
        );

      }


      throw new Error(
        `API 오류 (${response.status})`
      );

    }


    const result =
      await response.json();


    /*
     * data 배열 확인
     */

    currentData =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];


    updateCategories(
      currentData
    );


    renderTable(
      currentData
    );


    const now =
      new Date();


    const apiUpdatedAt =
      result.last_updated_at ||
      "알 수 없음";


    status.textContent =
      `조회 완료 · ` +
      `브라우저 조회 시각 ` +
      `${formatDate(now)} · ` +
      `API 데이터 시각 ` +
      `${apiUpdatedAt} · ` +
      `자동 갱신 주기 60분`;

  } catch (error) {

    console.error(
      "거래소 API 호출 오류:",
      error
    );


    currentData =
      [];


    renderTable(
      currentData
    );


    status.textContent =
      `데이터를 불러오지 못했습니다: ${error.message}`;

  }

}


/*
 * 테이블 출력
 */

function renderTable(
  data
) {

  const table =
    document.getElementById(
      "marketTable"
    );


  const emptyMessage =
    document.getElementById(
      "emptyMessage"
    );


  table.innerHTML =
    "";


  if (
    !data.length
  ) {

    emptyMessage.style.display =
      "block";


    return;

  }


  emptyMessage.style.display =
    "none";


  const sortedData =
    sortData(data);


  sortedData.forEach(
    item => {

      const row =
        document.createElement(
          "tr"
        );


      const price =
        item.is_sold_out
          ? "-"
          : formatNumber(
              item.min_price
            );


      const quantity =
        formatNumber(
          item.total_count
        );


      const change1h =
        formatPercent(
          item.pct_change_1h
        );


      const change24h =
        formatPercent(
          item.pct_change_24h
        );


      const change7d =
        formatPercent(
          item.pct_change_7d
        );


      const icon =
        item.icon_url

          ? `
            <img
              class="item-icon"
              src="${escapeHtml(item.icon_url)}"
              alt=""
              loading="lazy"
            >
          `

          : "";


      row.innerHTML = `

        <td class="item-name">

          <div class="item-info">

            ${icon}

            <div>

              <div>
                ${escapeHtml(item.name)}
              </div>

              <span class="item-id">
                ID:
                ${escapeHtml(item.kind_id)}
              </span>

            </div>

          </div>

        </td>


        <td>

          ${
            item.is_sold_out
              ? '<span class="sold-out">품절</span>'
              : price
          }

        </td>


        <td>
          ${quantity}
        </td>


        <td
          class="${getChangeClass(
            item.pct_change_1h
          )}"
        >
          ${change1h}
        </td>


        <td
          class="${getChangeClass(
            item.pct_change_24h
          )}"
        >
          ${change24h}
        </td>


        <td
          class="${getChangeClass(
            item.pct_change_7d
          )}"
        >
          ${change7d}
        </td>


        <td>

          ${
            item.is_sold_out
              ? '<span class="sold-out">품절</span>'
              : "판매중"
          }

        </td>

      `;


      table.appendChild(
        row
      );

    }
  );
}


/*
 * 카테고리 목록
 */


/* =========================================
   카테고리 목록 관리
   ========================================= */

// 전체 카테고리 목록을 보관하는 변수
// 처음 전체 카테고리 조회 시 저장하고 이후에는 유지
let globalCategoryList = null;


/* =========================================
   카테고리 드롭박스 업데이트
   ========================================= */

function updateCategories(data) {
  const select = document.getElementById("categorySelect");

  // HTML에 드롭박스가 없으면 종료
  if (!select) return;

  // 현재 사용자가 선택한 카테고리 기억
  const previousValue = select.value;

  // 이번 응답 데이터에서 카테고리 추출
  const extractedCategories = [
    ...new Set(
      (Array.isArray(data) ? data : [])
        .map(item => item?.parent_category)
        .filter(category =>
          typeof category === "string" &&
          category.trim() !== ""
        )
        .map(category => category.trim())
    )
  ].sort((a, b) => a.localeCompare(b, "ko"));

  /*
   * 전체 카테고리 목록 저장 조건
   *
   * 1. 아직 전체 목록을 저장하지 않은 경우
   * 2. 사용자가 '전체 카테고리'를 선택한 상태인 경우
   *
   * 하위 카테고리를 조회 중일 때는
   * 저장된 전체 목록을 덮어쓰지 않는다.
   */
  if (
    globalCategoryList === null ||
    previousValue === ""
  ) {
    if (extractedCategories.length > 0) {
      globalCategoryList = extractedCategories;
    }
  }

  // 아직 저장된 목록이 없다면 이번 응답을 임시로 사용
  const categories =
    globalCategoryList ?? extractedCategories;

  // 드롭박스 초기화
  select.replaceChildren(
    new Option("전체 카테고리", "")
  );

  // 저장된 전체 카테고리 목록으로 옵션 생성
  categories.forEach(category => {
    select.add(
      new Option(category, category)
    );
  });

  // 기존에 선택한 카테고리 복원
  if (categories.includes(previousValue)) {
    select.value = previousValue;
  } else {
    select.value = "";
  }
}



/*
 * 날짜 표시
 */

function formatDate(
  date
) {

  return date.toLocaleString(
    "ko-KR",
    {
      year: "numeric",

      month: "2-digit",

      day: "2-digit",

      hour: "2-digit",

      minute: "2-digit",

      second: "2-digit"
    }
  );
}


/*
 * 초기화
 */

function initializeMarket() {

  /*
   * 검색
   */

  let searchTimer;


  document
    .getElementById(
      "searchInput"
    )
    .addEventListener(
      "input",
      () => {

        clearTimeout(
          searchTimer
        );


        searchTimer =
          setTimeout(
            fetchMarketData,
            SEARCH_DELAY
          );

      }
    );


  /*
   * 카테고리
   */

  document
    .getElementById(
      "categorySelect"
    )
    .addEventListener(
      "change",
      fetchMarketData
    );


  /*
   * 새로고침
   */

  document
    .getElementById(
      "refreshButton"
    )
    .addEventListener(
      "click",
      fetchMarketData
    );


  /*
   * 정렬 버튼
   */

  document
    .querySelectorAll(
      ".sort-button"
    )
    .forEach(
      button => {

        button.dataset.originalText =
          button.textContent.trim();


        button.addEventListener(
          "click",
          () => {

            handleSortClick(
              button.dataset.sortKey
            );

          }
        );

      }
    );


  /*
   * 기본 정렬:
   * 24시간 상승률 오름차순
   */

  updateSortButtons();


  /*
   * 최초 호출
   */

  fetchMarketData();


  /*
   * 1시간마다 갱신
   */

  setInterval(
    fetchMarketData,
    REFRESH_INTERVAL
  );

}


/*
 * 페이지 로딩
 */

document.addEventListener(
  "DOMContentLoaded",
  initializeMarket
);