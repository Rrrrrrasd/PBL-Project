// 전역 변수로 mapx와 mapy 선언하여 초기화
let currentPage = 1;
const numOfRows = 10;  // 한번에 가져올 숙소 데이터 수
let currentMapX = null;  // 현재 사용 중인 mapx
let currentMapY = null;  // 현재 사용 중인 mapy
let totalHotels = 0;
let totalRestaurants = 0; // 전체 음식점 수
let lastMapX = null;
let lastMapY = null;

// 캐시 객체: { "<mapx>,<mapy>": [숙소 데이터 배열], ... }
const cache = {};

//마커 클릭시 호출
function InfoMapToPanel(festival) {
    console.log('InfoMapToPanel function called');  // 함수 호출 여부 확인

    // 현재 마커의 위치를 키로 생성
    const cacheKey = `${festival.mapx},${festival.mapy}`;

    // 캐시에 동일 마커 데이터가 있는지 확인
    if (cache[cacheKey]) {
        console.log("Using cached data for marker:", cacheKey);
        clearHotelPanel();           // 기존 숙소 데이터 초기화
        clearRestaurantPanel();


        const cachedData = cache[cacheKey];
        displayHotels(cachedData.hotels);         // 캐시된 숙소 데이터를 표시
        displayRestaurants(cachedData.restaurants);  // 캐시된 음식점 데이터를 표시
        return;  // API 요청 생략
    }

    // 축제 정보를 표시할 요소
    const imageElement = document.getElementById('festival-image');
    const titleElement = document.getElementById('festival-title');
    const addressElement = document.getElementById('festival-address');
    const datesElement = document.getElementById('festival-dates');
    const telElement = document.getElementById('festival-tel');
    const festivalInfo = document.getElementById('festival'); // 축제 정보 섹션

    //추가
    const festivalTimeElement = document.getElementById('festival-time'); //축제 시간
    const festivalPriceElement = document.getElementById('festival-price'); //축제 입장료
    const festivalOverviewElement = document.getElementById('festival-overview')//개요
    //홈페이지 추가필요

    console.log('Festival Data:', festival);  // 축제 객체 전체를 출력

    // 각각의 요소에 축제 정보를 업데이트
    imageElement.src = festival.firstimage2 || '해당 축제 이미지를 찾을 수 없습니다.';  // 이미지가 없을 경우 기본값 설정
    imageElement.alt = festival.title || '축제 이미지';
    titleElement.textContent = festival.title || '제목 없음';
    addressElement.textContent = festival.addr1 || '주소 정보 없음';
    datesElement.textContent = ` ${festival.eventstartdate.slice(4, 6) + "/" + festival.eventstartdate.slice(6, 8) || ' 시작일 정보 없음'} ~ 
								 ${festival.eventenddate.slice(4, 6) + "/" + festival.eventenddate.slice(6, 8) || ' 종료일 정보 없음'}`;
    telElement.textContent = ` ${festival.sponsor1tel + '  (' + festival.sponsor1 + ')' || '전화번호 정보 없음'}`;
    festivalTimeElement.textContent = ` ${festival.playtime || "시간 정보 없음"}`;
    festivalPriceElement.innerHTML = festival.usetimefestival ? ` ${festival.usetimefestival}` : "입장료 정보 없음";
    festivalOverviewElement.innerHTML = festival.overview ? `<div class="overviewArea"><p class="overviewTitle">간단 소개</p> <div class="overview">${festival.overview}</div></div>` : "";

    // 'festival' 섹션을 표시
    festivalInfo.classList.remove('hidden');

    currentMapX = festival.mapx;
    currentMapY = festival.mapy;
    currentPage = 1;

    // 기존 숙소 데이터를 초기화하여 이전 데이터 제거
    clearHotelPanel();

    // 새로운 위치의 숙소 데이터를 로드
    loadMoreHotels(currentPage);

    clearRestaurantPanel(); // 기존 음식점 데이터 초기화
    loadMoreRestaurants(currentPage); // 첫 페이지 음식점 데이터 로드

    // 마지막 요청된 마커 위치 갱신
    lastMapX = currentMapX;
    lastMapY = currentMapY;
    ////////////////

    const imageWidth = imageElement.src.width;
    imageElement.src.style = `width-${imageWidth}`;

    let directionButton = document.querySelector('#Directions');
    directionButton.removeEventListener('click', handleDirectionClick);
    directionButton.addEventListener('click', handleDirectionClick);

    function handleDirectionClick() {
        const destination = festival.title || '목적지';
        const latitude = festival.mapy;  // 위도
        const longitude = festival.mapx; // 경도

        // 카카오맵 길찾기 URL로 새 창에서 이동
        const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destination)},${latitude},${longitude}`;
        window.open(kakaoMapUrl, 'kakaoMapTab');
    }
}

// 기존 숙소 정보를 지우는 함수
function clearHotelPanel() {
    const hotelInfo = document.getElementById('hotel-list');
    hotelInfo.innerHTML = '';  // 숙소 정보를 표시하는 영역을 초기화
    totalHotels = 0;           // 총 숙소 개수도 초기화
}



// "더보기" 버튼에 이벤트 리스너 추가(숙소)
document.getElementById('loadMoreHotelsButton').addEventListener('click', function () {
    if (totalHotels > currentPage * numOfRows) {
        currentPage += 1;
        loadMoreHotels(currentPage);
    }
});



// 더 많은 숙소 데이터를 가져오는 함수
function loadMoreHotels(pageNo, cacheKey) {
    fetch(`/api/festivals/hotels/more?mapx=${currentMapX}&mapy=${currentMapY}&pageNo=${pageNo}&numOfRows=${numOfRows}`)
        .then(response => response.json())
        .then(data => {
            const hotels = data.hotels;
            totalHotels = data.totalCount;

            // 데이터를 화면에 표시하고 캐시에 저장
            displayHotels(hotels);
            cache[cacheKey] = hotels;  // 캐시에 저장

            // 더 이상 페이지가 없는 경우 버튼을 "여기까지입니다"로 변경
            if (totalHotels <= currentPage * numOfRows) {
                const loadMoreButton = document.getElementById('loadMoreHotelsButton');
                loadMoreButton.textContent = "여기까지입니다";
                loadMoreButton.disabled = true;
            } else {
                // 더보기 버튼 활성화 및 초기화
                const loadMoreButton = document.getElementById('loadMoreHotelsButton');
                loadMoreButton.textContent = "더보기";
                loadMoreButton.disabled = false;
            }
        })
        .catch(error => console.error('Error fetching more hotels:', error));
}

// 숙소 데이터를 화면에 표시하는 함수
function displayHotels(hotels) {
    hotels.forEach(hotel => {
        addHotelToPanel(hotel);
    });
}


//숙소 정보 패널 표시
function addHotelToPanel(hotel) {
    const hotelInfo = document.getElementById('hotel-list');
    const div = document.createElement('div');
    div.classList.add('recommendation-item');
    div.innerHTML = `
        <div class="recommendationInform">
            
            <h3 class="recommendationName">${hotel.title}</h3>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                        <path
                            d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                </svg>
                <span class="evaluation">${hotel.addr1 || '주소 정보 없음'}</span>
            </div>
                
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16">
                    <path
                        d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                </svg>
                <span class="evaluation">${hotel.tel || '전화번호 정보 없음'}</span>
            
            </div>
            <hr>
        </div>
    `;
    hotelInfo.appendChild(div);
}



/////////////

function clearRestaurantPanel() {
    const restaurantInfo = document.getElementById('restaurant-list');
    if (restaurantInfo) {
        restaurantInfo.innerHTML = '';  // 요소가 null이 아닐 때만 초기화
        totalRestaurants = 0; // 총 음식점 개수 초기화
    } else {
        console.warn("restaurant-list element not found");
    }
}


// "더보기" 버튼에 이벤트 리스너 추가 (음식점)
document.getElementById('loadMoreRestaurantsButton').addEventListener('click', function () {
    if (totalRestaurants > currentPage * numOfRows) {
        currentPage += 1;
        loadMoreRestaurants(currentPage);
    }
});

// 더 많은 음식점 데이터를 가져오는 함수
function loadMoreRestaurants(pageNo) {
    fetch(`/api/festivals/restaurants/more?mapx=${currentMapX}&mapy=${currentMapY}&pageNo=${pageNo}&numOfRows=${numOfRows}`)
        .then(response => response.json())
        .then(data => {
            const restaurants = data.restaurants;
            totalRestaurants = data.totalCount;

            // 데이터를 화면에 표시하고 더보기 버튼 상태 관리
            displayRestaurants(restaurants);
            updateLoadMoreButtonStatus(totalRestaurants, 'loadMoreRestaurantsButton');
        })
        .catch(error => console.error('Error fetching more restaurants:', error));
}

// 음식점 데이터를 화면에 표시하는 함수
function displayRestaurants(restaurants) {
    const restaurantList = document.getElementById('restaurant-list');
    restaurants.forEach(restaurant => {
        addRestaurantToPanel(restaurant, restaurantList);
    });
}

// 음식점 정보를 개별 패널에 추가하는 함수
function addRestaurantToPanel(restaurant, container) {
    const div = document.createElement('div');
    div.classList.add('recommendation-item');
    div.innerHTML = `
        <div class="recommendationInform">
            
            <h3 class="recommendationName">${restaurant.title}</h3>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                        <path
                            d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                </svg>
                <span class="evaluation">${restaurant.addr1 || '주소 정보 없음'}</span>
            </div>
                
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16">
                    <path
                        d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                </svg>
                <span class="evaluation">${restaurant.tel || '전화번호 정보 없음'}</span>
            
            </div>
            <hr>
        </div>
    `;
    container.appendChild(div);
}

// 더보기 버튼 상태를 업데이트하는 함수
function updateLoadMoreButtonStatus(totalCount, buttonId) {
    const loadMoreButton = document.getElementById(buttonId);
    if (totalCount <= currentPage * numOfRows) {
        loadMoreButton.textContent = "여기까지입니다";
        loadMoreButton.disabled = true;
    } else {
        loadMoreButton.textContent = "더보기";
        loadMoreButton.disabled = false;
    }
}





