// 전역 변수로 mapx와 mapy 선언하여 초기화
let currentPage = 1;
const numOfRows = 10;  // 한번에 가져올 숙소 데이터 수
let currentMapX = null;  // 현재 사용 중인 mapx
let currentMapY = null;  // 현재 사용 중인 mapy
let totalHotels = 0;
let totalRestaurants = 0; // 전체 음식점 수
let lastMapX = null;
let lastMapY = null;
let currentSelectedFestival = null;

// 캐시 객체: { "<mapx>,<mapy>": [숙소 데이터 배열], ... }
const cache = {};

// 수정
window.restaurantMarkers = [];

//11/24
function displayReviews(contentId) {
    fetch(`/api/reviews/${contentId}`)
        .then(response => response.json())
        .then(reviews => {
			console.log(reviews);
            const reviewList = document.getElementById('review-list');
            reviewList.innerHTML = '';
			
			const filteredReviews = reviews.filter(review => review.contentId === contentId);
			
			
			if (filteredReviews.length === 0) {
	                reviewList.innerHTML = '<p>리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>';
	            } else {
	                filteredReviews.forEach(review => {
	                    const reviewDiv = document.createElement('div');
	                    reviewDiv.className = 'review-item';
	                    reviewDiv.innerHTML = `
	                        <p><strong>${review.userId}</strong>: ${review.reviewText}</p>
	                    `;
	                    reviewList.appendChild(reviewDiv);
	                });
	            }
	        })
	        .catch(error => console.error('Error fetching reviews:', error));
}



// 마커 클릭시 호출
function InfoMapToPanel(festival) {
	
	
	
    if(currentSelectedFestival && currentSelectedFestival !== festival) {
        clearFestivalInfo();
        removeRestaurantMarkers();
    }

    currentSelectedFestival = festival.contentId;
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

    // 추가
    const festivalTimeElement = document.getElementById('festival-time'); // 축제 시간
    const festivalPriceElement = document.getElementById('festival-price'); // 축제 입장료
    const festivalOverviewElement = document.getElementById('festival-overview'); // 개요

    // 각각의 요소에 축제 정보를 업데이트
    imageElement.src = festival.firstimage2 || '/image/festivalSample.jpg';
    imageElement.alt = festival.title || '축제 이미지';
    titleElement.textContent = festival.title || '제목 없음';
    addressElement.textContent = festival.addr1 || '주소 정보 없음';
    datesElement.textContent = `${festival.eventstartdate.slice(4, 6)}/${festival.eventstartdate.slice(6, 8) || ' 시작일 정보 없음'} ~ 
        ${festival.eventenddate.slice(4, 6)}/${festival.eventenddate.slice(6, 8) || ' 종료일 정보 없음'}`;
    telElement.textContent = festival.sponsor1tel + "  (" + festival.sponsor1 + ")" || '전화번호 정보 없음';
    festivalTimeElement.textContent = `운영시간: ${festival.playtime || "시간 정보 없음"}`;
    festivalPriceElement.innerHTML = festival.usetimefestival ? `입장료: ${festival.usetimefestival}` : "입장료 정보 없음";
    festivalOverviewElement.innerHTML = festival.overview ? `<br/>${festival.overview}</p>` : "";

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

    let directionButton = document.querySelector('#Directions');

    // 기존 'Directions' 버튼 이벤트 리스너 제거
    if (window.currentDirectionListener && directionButton) {
        directionButton.removeEventListener('click', window.currentDirectionListener);
        console.log('Previous Directions listener removed.');
    }
    
    // 수정
    if (directionButton) {
        window.currentDirectionListener = handleDirectionClick;
        directionButton.addEventListener('click', window.currentDirectionListener);
        console.log('New Directions listener added.');
    }

    function handleDirectionClick() {
        const destination = festival.title || '목적지';
        const latitude = festival.mapy;  // 위도
        const longitude = festival.mapx; // 경도

        const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destination)},${latitude},${longitude}`;
        window.open(kakaoMapUrl, 'kakaoMapTab');
    }

    if (!cache[cacheKey]) {
        cache[cacheKey] = { hotels: [], restaurants: [] };
    }
	
	
	//추가 내용 11/24
	displayReviews(currentSelectedFestival); // 리뷰 표시
	
	// 리뷰 작성 이벤트 리스너 11/24
	document.getElementById('submit-review-button').addEventListener('click', () => {
		console.log(currentSelectedFestival);
	    const contentId = currentSelectedFestival; // 현재 선택된 축제/숙소/음식점의 contentId
	    const reviewText = document.getElementById('review-input').value.trim();
	    if (!reviewText) {
	        alert('리뷰를 입력해주세요.');
	        return;
	    }
	    fetch(`/api/reviews/${contentId}`, {
	        method: 'POST',
	        headers: {
	            'Content-Type': 'application/json'
	        },
	        body: JSON.stringify(reviewText)
	    })
	        .then(response => response.json())
	        .then(() => {
	            alert('리뷰가 작성되었습니다.');
	            displayReviews(contentId); // 리뷰 새로고침
	        })
	        .catch(error => console.error('Error posting review:', error));
	});
	
	
	
}


function clearFestivalInfo() {
    const festivalContainer = document.getElementById('festival');
    
    festivalContainer.innerHTML = `
        <div class="recommendation-item">
            <div class="recommendationInform">
                <a href="#" class="more-info">
                    <img id="festival-image" src="" alt="축제 이미지" class="imageExpand">
                </a>
                <div class="">
                    <div class="w-100 d-flex justify-content-between align-items-center mb-3 px-12">
                        <button id="festival-title" class="recommendationName"></button>
                        <button class="btn btn-primary text-white" id="Directions">길찾기</button>
                    </div>
                    <p id="festival-address" class="evaluation">주소 정보</p>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            fill="currentColor" class="bi bi-calendar-event" viewBox="0 0 16 16">
                            <path
                                d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
                            <path
                                d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                        </svg>
                        <span id="festival-dates" class="evaluation">날짜 정보</span>
                    </div>
                    <div>
                        <span id="festival-time" class="evaluation">운영시간</span>
                    </div>
                    <div>
                        <span id="festival-price" class="evaluation">입장금액</span>
                    </div>
                    <div class="flex-column">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16">
                            <path
                                d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                        </svg>
                        <span id="festival-tel" class="evaluation">전화번호 정보</span>
                    </div>
                    <div>
                        <span id="festival-overview" class="evaluation">개요</span>
                    </div>

                    <hr> <!--리뷰, 평점 구분선-->
                </div>
            </div>
        `;
}

// 기존 숙소 정보를 지우는 함수
function clearHotelPanel() {
    const hotelInfo = document.getElementById('hotel-list');
    hotelInfo.innerHTML = '';  // 숙소 정보를 표시하는 영역을 초기화
    totalHotels = 0;           // 총 숙소 개수도 초기화
}

// "더보기" 버튼에 이벤트 리스너 추가(숙소)
document.getElementById('loadMoreHotelsButton').addEventListener('click', function() {
    if (totalHotels > currentPage * numOfRows) {
        currentPage += 1;
        loadMoreHotels(currentPage);
    }
});

// 더 많은 숙소 데이터를 가져오는 함수
// 수정
function loadMoreHotels(pageNo) {
    fetch(`/api/festivals/hotels/more?mapx=${currentMapX}&mapy=${currentMapY}&pageNo=${pageNo}&numOfRows=${numOfRows}`)
        .then(response => response.json())
        .then(data => {
            const hotels = data.hotels;
            totalHotels = data.totalCount;

            displayHotels(hotels);

            const key = `${currentMapX}, ${currentMapY}`;
            cache[key].hotels = (cache[key].hotels || []).concat(hotels);

            if (totalHotels <= currentPage * numOfRows) {
                const loadMoreButton = document.getElementById('loadMoreHotelsButton');
                loadMoreButton.textContent = "여기까지입니다";
                loadMoreButton.disabled = true;
            }
            else {
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
    hotels.forEach(function(hotel) {
        addHotelToPanel(hotel);
    });
    console.log('Hotels displayed:', hotels.length);
}

// 숙소 정보를 추가하는 함수
function addHotelToPanel(hotel) {
    const hotelInfo = document.getElementById('hotel-list');
    const div = document.createElement('div');
    div.classList.add('recommendation-item');
    div.innerHTML = `
        <button class="recommendationName">${hotel.title}</button>
        <p class="evaluation">${hotel.addr1 || '주소 정보 없음'}</p>
        <p class="evaluation">${hotel.tel || '전화번호 정보 없음'}</p>
		<!--추가-->
		<span class="evaluation">
		  ${restaurant.dist ? parseInt(hotel.dist, 10) + 'm' : '거리 정보 없음'}
		</span>
        <button class="show-Restrant-marker-btn">마커 표시</button>
        <button>정보 표시</button>
    `;
    hotelInfo.appendChild(div);
    console.log('Hotel added to panel:', hotel.title);
}

// 음식점 데이터 초기화
function clearRestaurantPanel() {
    const restaurantInfo = document.getElementById('restaurant-list');
    if (restaurantInfo) {
        restaurantInfo.innerHTML = '';  // 요소가 null이 아닐 때만 초기화
        totalRestaurants = 0; // 총 음식점 개수 초기화
        console.log('Restaurant panel cleared.');
    }
    else {
        console.warn("restaurant-list element not found");
    }
}

// "더보기" 버튼에 이벤트 리스너 추가 (음식점)
document.getElementById('loadMoreRestaurantsButton').addEventListener('click', function() {
    if (totalRestaurants > currentPage * numOfRows) {
        currentPage += 1;
        loadMoreRestaurants(currentPage);
        console.log('Load more restaurants clicked. Loading page:', currentPage);
    }
});

// 더 많은 음식점 데이터를 가져오는 함수
function loadMoreRestaurants(pageNo) {
    fetch(`/api/festivals/restaurants/more?mapx=${currentMapX}&mapy=${currentMapY}&pageNo=${pageNo}&numOfRows=${numOfRows}`)
        .then(response => response.json())
        .then(data => {
            let restaurants = data.restaurants;
            totalRestaurants = data.totalCount;

            restaurants.sort((a, b) => parseFloat(a.distanceFromFestival) - parseFloat(b.distanceFromFestival));

            displayRestaurants(restaurants);
            updateLoadMoreButtonStatus(totalRestaurants, 'loadMoreRestaurantsButton');

            const key = `${currentMapX},${currentMapY}`;

            if (!cache[key]) {
                cache[key] = { hotels: [], restaurants: [] };
            }
            cache[key].restaurants = (cache[key].restaurants || []).concat(restaurants);
            console.log('Restaurants loaded:', restaurants.length);
        })
        .catch(error => console.error('Error fetching more restaurants:', error));
}

// 음식점 데이터를 화면에 표시하는 함수
function displayRestaurants(restaurants) {
    const restaurantList = document.getElementById('restaurant-list');
    restaurants.forEach(function(restaurant) {
        addRestaurantToPanel(restaurant, restaurantList);
    });
    console.log('Restaurants displayed:', restaurants.length);
}

// 음식점 패널에 추가
function addRestaurantToPanel(restaurant, container) {
    const restaurantId = restaurant.id || `${restaurant.mapx}-${restaurant.mapy}-${Math.random()}`;

    const div = document.createElement('div');
    div.classList.add('recommendation-item');

    div.innerHTML = `
        <button class="recommendationName">${restaurant.title}</button>
        <p class="evaluation">${restaurant.addr1 || '주소 정보 없음'}</p>
        <p class="evaluation">${restaurant.tel || '전화번호 정보 없음'}</p>
		<span class="evaluation">
		  ${restaurant.dist ? parseInt(restaurant.dist, 10) + 'm' : '거리 정보 없음'}
		</span>
        <button class="show-marker-btn">마커 표시</button>
        <button>정보 표시</button>
    `;
    container.appendChild(div);

    const showMarkerButton = div.querySelector('.show-marker-btn');
    showMarkerButton.addEventListener('click', () => {
        addRestaurantMarker({ ...restaurant, id: restaurantId });
        console.log('Restaurant marker added:', restaurant.title);
    });
}

// 더보기 버튼 상태를 업데이트하는 함수 (중복 제거)
function updateLoadMoreButtonStatus(totalCount, buttonId) {
    const loadMoreButton = document.getElementById(buttonId);
    if (totalCount <= currentPage * numOfRows) {
        loadMoreButton.textContent = "여기까지입니다";
        loadMoreButton.disabled = true;
        console.log('No more restaurants to load.');
    } else {
        loadMoreButton.textContent = "더보기";
        loadMoreButton.disabled = false;
        console.log('More restaurants available to load.');
    }
}

// 음식점 마커 추가
function addRestaurantMarker(restaurant) {
    const existingMarker = window.restaurantMarkers.find(marker => marker.restaurantId === restaurant.id);
    if (existingMarker) {
        window.map.map.setCenter(existingMarker.getPosition());
        if (!existingMarker.infowindow.getMap()) {
            existingMarker.infowindow.open(window.map.map, existingMarker);
        }
        console.log('Existing restaurant marker focused:', restaurant.title);
        return;
    }

    const latitude = parseFloat(restaurant.mapy);
    const longitude = parseFloat(restaurant.mapx);

    if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid restaurant coordinates:', restaurant);
        return;
    }

    const position = new kakao.maps.LatLng(latitude, longitude);

    const markerImageSrc = '/image/restaurant_marker.png';
    const markerImage = new kakao.maps.MarkerImage(markerImageSrc, new kakao.maps.Size(40, 45), {
        offset: new kakao.maps.Point(16, 32)
    });

    const marker = new kakao.maps.Marker({
        position: position,
        image: markerImage,
        map: window.map.map
    });

    const infowindow = new kakao.maps.InfoWindow({
        content: `
            <div style="padding:5px; max-width: 250px;">
                <div><strong>${restaurant.title}</strong></div>
                <img src="${restaurant.firstimage2 || '/image/restaurantSample.jpg'}" alt="${restaurant.title}" class="restaurant-image" style="width:100%; height:auto;" />
                <div>${restaurant.addr1}</div>
            </div>
        `
    });

    kakao.maps.event.addListener(marker, 'mouseover', function () {
        infowindow.open(window.map.map, marker);
    });

    kakao.maps.event.addListener(marker, 'mouseout', function () {
        infowindow.close();
    });

    marker.restaurantId = restaurant.id;

    marker.infowindow = infowindow;

    window.restaurantMarkers.push(marker);

    window.map.map.setCenter(position);
    console.log('New restaurant marker added:', restaurant.title);
}

// 음식점 마커 제거
// 수정
function removeRestaurantMarkers() {
    if (window.restaurantMarkers && window.restaurantMarkers.length > 0) {
        window.restaurantMarkers.forEach(marker => {
            marker.setMap(null);
        });
        window.restaurantMarkers = [];
        console.log('All restaurant markers removed.');
    } else {
        console.log('No restaurant markers to remove.');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    const infoButton = document.getElementById('infoCategory');
    const hotelButton = document.getElementById('hotelCategory');
    const restaurantButton = document.getElementById('restaurantCategory');

    if (infoButton) {
        infoButton.addEventListener('click', function() {
            removeRestaurantMarkers();
            console.log('Info category button clicked. Removed restaurant markers.');
        });
    }

    if (hotelButton) {
        hotelButton.addEventListener('click', function() {
            removeRestaurantMarkers();
            console.log('Hotel category button clicked. Removed restaurant markers.');
        });
    }

    if (restaurantButton) {
        restaurantButton.addEventListener('click', function() {
            loadMoreRestaurants(currentPage);
            console.log('Restaurant category button clicked. Loading more restaurants.');
        });
    }
});

window.removeRestaurantMarkers = removeRestaurantMarkers;
window.addRestaurantMarker = addRestaurantMarker;
window.clearRestaurantPanel = clearRestaurantPanel;