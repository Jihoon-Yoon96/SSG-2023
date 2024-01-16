// url
const SERVER_URL = '/fo-api';
const GET_SERVER_DATE = '/cmm/date/v1/today';
const GET_STORE_WEATHER_PREFIX = '/sto/store/v1/stores/';
const GET_STORE_WEATHER_SUFFIX = '/weather';

// action type
const SEARCH_ACTION_TYPE = 'search';
const SHOPPING_ACTION_TYPE = 'shopping';
const CMS_NAVIGATE_ACTION_TYPE = 'cms-navigate';
const STORE_POPUP_ACTION_TYPE = 'store-popup';
const CLIP_ACTION_TYPE = 'clip';
const BRAND_FOLLOW_ACTION_TYPE = 'brand-follow';
const SHARE_ACTION_TYPE = 'share';
const BRAND_PROFILE_ACTION_TYPE = 'brand-profile';

function sendMessageToParent(message) {
  window.parent.postMessage(JSON.stringify(message), '*');
}

////////////////////
//
// 점포정보
//
//

/**
 * @description 서버의 오늘 주소를 가져온다
 * @param {(data: {today: string}) => void} callback api 응답값의 callback 함수
 */
function getServerDate(callback) {
  fetch(`${SERVER_URL}${GET_SERVER_DATE}`)
    .then((response) => response.json())
    .then((json) => {
      if (json && json.successOrNot === 'Y' && json.data && json.data.today) {
        // response example
        // {"successOrNot":"Y","statusCode":"SUCCESS","errorMessage":"","data":{"today":"2023-09-14"}}

        callback(json.data);
      }
    })
    .catch(() => {});
}

/**
 * @description 점포별 날씨 조회
 * @param {string} storeCode 점포코드
 * @param {(data: {icon: string, temperature: number}) => void} callback api 응답값의 callback 함수
 */
function getStoreWeather(storeCode, callback) {
  fetch(`${SERVER_URL}${GET_STORE_WEATHER_PREFIX}${storeCode}${GET_STORE_WEATHER_SUFFIX}`)
    .then((response) => response.json())
    .then((json) => {
      if (json && json.successOrNot === 'Y' && json.data && json.data.icon && json.data.temperature) {
        // response example
        // {"successOrNot":"Y","statusCode":"SUCCESS","errorMessage":"","data":{"icon":"3","temperature":27.2}}
        callback({
          icon: json.data.icon,
          temperature: json.data.temperature
        });
      }
    })
    .catch(() => {});
}

/**
 * @description 점포정보 페이지 진입 시 실행해야 하는 함수
 */
function onloadStoreInformationPage() {
  const action = {
    type: CMS_NAVIGATE_ACTION_TYPE,
    data: {
      type: 'store'
    }
  }

  sendMessageToParent(action);
}

/**
 * @description 오시는길 페이지 진입 시 실행해야 하는 함수
 */
function onloadMapPage() {
  const action = {
    type: CMS_NAVIGATE_ACTION_TYPE,
    data: {
      type: 'map'
    }
  }

  sendMessageToParent(action);
}

/**
 * @description 층별안내 페이지 진입 시 실행해야 하는 함수
 */
function onloadFloorPage() {
  const action = {
    type: CMS_NAVIGATE_ACTION_TYPE,
    data: {
      type: 'floor'
    }
  }

  sendMessageToParent(action);
}

/**
 * @description 점포 선택 팝업 열기
 */
function openStoreInfo() {
  const action = {
    type: STORE_POPUP_ACTION_TYPE
  }

  sendMessageToParent(action);
}

/**
 * @description ssgd 통합검색 화면으로 이동
 */
function openSearch() {
  const action = {
    type: SEARCH_ACTION_TYPE
  };

  sendMessageToParent(action);
}

/**
 * @description ssgd 쇼핑상세 화면으로 이동
 */
function openShopping() {
  const action = {
    type: SHOPPING_ACTION_TYPE
  };

  sendMessageToParent(action);
}

/**
 * @description ssgd 브랜드 계정 화면으로 이동
 */
function openBrandProfile(brandCode) {
  const action = {
    type: BRAND_PROFILE_ACTION_TYPE,
    data: {
      brandCode: brandCode
    }
  }

  sendMessageToParent(action);
}

//
//
// 점포정보
//
////////////////////

////////////////////
//
// 쇼핑정보 상세
//
//

/**
 * @description 쇼핑정보 클립/클립해제 toggle
 */
function toggleClip() {
  const action = {
    type: CLIP_ACTION_TYPE
  }

  sendMessageToParent(action);
}

/**
 * @description 브랜드 팔로우/언팔로우 toggle
 */
function toggleFollowBrand() {
  const action = {
    type: BRAND_FOLLOW_ACTION_TYPE
  }

  sendMessageToParent(action);
}

/**
 * @description 쇼핑정보 상시 onload시 호출해야 하는 함수
 */
function onloadShoppingDetailPage() {
  const fitFollowYButton = document.getElementById('fit_follow_y');
  const fitFollowNButton = document.getElementById('fit_follow_n');
  const clipButton = document.getElementById('clip');

  if (fitFollowYButton) {
    fitFollowYButton.classList.add('active');
    fitFollowYButton.addEventListener('click', toggleFollowBrand);
  }
  if (fitFollowNButton) {
    fitFollowNButton.addEventListener('click', toggleFollowBrand);
  }
  if (clipButton) {
    clipButton.addEventListener('click', toggleClip);
  }

  window.addEventListener('message', function (e) {
    let parsedData = {};

    try {
      parsedData = JSON.parse(e.data);
    } catch (e) {
      // do nothing
    }

    switch (parsedData.type) {
      case 'ynData': {
        const hideBrandFollowButton = parsedData.data.hideBrandFollowButton;
        const followYn = parsedData.data.followYn;
        const clipYn = parsedData.data.clipYn;

        const fitFollowYButton = document.getElementById('fit_follow_y');
        const fitFollowNButton = document.getElementById('fit_follow_n');
        const clipButton = document.getElementById('clip');

        // 브랜드 팔로우 버튼 Y/N 여부는 하기 코드에서 컨트롤함.
        if (fitFollowYButton && fitFollowNButton) {
          if (hideBrandFollowButton) {
            fitFollowYButton.style.display = 'none';
            fitFollowNButton.style.display = 'none';
          } else if (followYn === 'Y') {
            fitFollowYButton.style.display = 'block';
            fitFollowNButton.style.display = 'none';
          } else if (followYn === 'N') {
            fitFollowYButton.style.display = 'none';
            fitFollowNButton.style.display = 'block';
          }
        }

        // 클립 버튼 Y/N 여부는 하기 코드에서 컨트롤함.
        if (clipButton) {
          if (clipYn === 'Y') {
            clipButton.classList.add('on');
          } else if (clipYn === 'N') {
            if (clipButton.classList.contains('on')) {
              clipButton.classList.remove('on');
            }
          }
        }

        return;
      }
      default:
        return;
    }
  });
}

/**
 * @description 공유하기
 */
function openShare() {
  const action = {
    type: SHARE_ACTION_TYPE
  }

  sendMessageToParent(action);
}

//
// 쇼핑정보 상세
//
//
////////////////////
