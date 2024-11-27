window.cache = window.cache || {};

// 전역 변수로 음식점 관련 변수 선언
window.currentPageRestaurants = 1;
window.totalRestaurants = 0;
window.lastMapXRestaurants = null;
window.lastMapYRestaurants = null;
window.currentSelectedFestival = null;

// 음식점 마커를 저장하는 배열
window.restaurantMarkers = [];

// 음식점 패널을 초기화하는 함수
function clearRestaurantPanel() {
    const restaurantInfo = document.getElementById('restaurant-list');
    if (restaurantInfo) {
        restaurantInfo.innerHTML = '';
        window.totalRestaurants = 0;
        console.log('Restaurant panel cleared.');
    }
    else {
        console.warn("restaurant-list element not found");
    }
}

// 음식점 데이터를 화면에 표시하는 함수
function displayRestaurants(restaurants) {
    const restaurantList = document.getElementById('restaurant-list');
    if (!restaurantList) {
        console.warn("restaurant-list element not found");
        return;
    }

    restaurants.forEach(function(restaurant) {
        addRestaurantToPanel(restaurant, restaurantList);
    });
    console.log('Restaurants displayed:', restaurants.length);
}

function addRestaurantToPanel(restaurant, container) {
    const restaurantId = restaurant.id || `${restaurant.mapx}-${restaurant.mapy}-${Math.random()}`;

    const distanceMeters = restaurant.dist ? parseInt(restaurant.dist, 10) : 0; // 거리 정보 파싱
    const distanceText = restaurant.dist ? `${distanceMeters}m` : '거리 정보 없음';

    const div = document.createElement('div');
    div.classList.add('recommendation-item');
    div.setAttribute('data-dist', distanceMeters); // 데이터 속성 추가
    div.innerHTML = 	`
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

	            <div class="">
	                <span class="evaluation">
	                ${restaurant.dist ? parseInt(restaurant.dist, 10) + 'm' : '거리 정보 없음'}
	                </span>
	                <button class="otherInfoBTN show-marker-btn" id="Directions">마커 표시</button>
	                <button class="otherInfoBTN AdditionalInformation" id="Directions">정보</button>
	            </div>
	            
	            <hr>
	        </div>
	    `;

    container.appendChild(div);
    console.log('Restaurant added to panel:', restaurant.title || '제목 없음');

    const showMarkerButton = div.querySelector('.show-marker-btn');
    showMarkerButton.addEventListener('click', () => {
        addRestaurantMarker({ ...restaurant, id: restaurantId });
        console.log('Restaurant marker added:', restaurant.title || '제목 없음');
    });
}

// "더보기" 버튼에 이벤트 리스너 추가 (음식점)
document.getElementById('loadMoreRestaurantsButton').addEventListener('click', function() {
    if (window.totalRestaurants > window.currentPageRestaurants * numOfRows) {
        window.currentPageRestaurants += 1;
        loadMoreRestaurants(window.currentPageRestaurants);
        console.log('Load more restaurants clicked. Loading page:', window.currentPageRestaurants);
    }
});

// 더 많은 음식점 데이터를 가져오는 함수
function loadMoreRestaurants(pageNo) {
    if (window.currentMapX === null || window.currentMapY === null) {
        console.warn('Current map coordinates are not set.');
        return;
    }

    fetch(`/api/festivals/restaurants/more?mapx=${window.currentMapX}&mapy=${window.currentMapY}&pageNo=${pageNo}&numOfRows=${numOfRows}`)
        .then(response => response.json())
        .then(data => {
            let restaurants = data.restaurants;
            window.totalRestaurants = data.totalCount;

            // 거리 순으로 정렬 (오름차순)
            restaurants.sort((a, b) => parseFloat(a.distanceFromFestival) - parseFloat(b.distanceFromFestival));

            displayRestaurants(restaurants);
            updateLoadMoreButtonStatus(window.totalRestaurants, 'loadMoreRestaurantsButton');

            const key = `${window.currentMapX},${window.currentMapY}`;

            window.cache[key] = window.cache[key] || { hotels: [], restaurants: [] };
            window.cache[key].restaurants = (window.cache[key].restaurants || []).concat(restaurants);
            console.log('Restaurants loaded:', restaurants.length);
        })
        .catch(error => console.error('Error fetching more restaurants:', error));
}

// 더보기 버튼 상태를 업데이트하는 함수
function updateLoadMoreButtonStatus(totalCount, buttonId) {
    const loadMoreButton = document.getElementById(buttonId);
    if (!loadMoreButton) {
        console.warn(`${buttonId} element not found`);
        return;
    }

    if (totalCount <= window.currentPageRestaurants * numOfRows) {
        loadMoreButton.textContent = "여기까지입니다";
        loadMoreButton.disabled = true;
        console.log('No more restaurants to load.');
    } else {
        loadMoreButton.textContent = "더보기";
        loadMoreButton.disabled = false;
        console.log('More restaurants available to load.');
    }
}

// 음식점 마커 추가 함수
function addRestaurantMarker(restaurant) {
    const existingMarker = window.restaurantMarkers.find(marker => marker.restaurantId === restaurant.id);
    if (existingMarker) {
        window.map.map.setCenter(existingMarker.getPosition());
        if (!existingMarker.infowindow.getMap()) {
            existingMarker.infowindow.open(window.map.map, existingMarker);
        }
        console.log('Existing restaurant marker focused:', restaurant.title || '제목 없음');
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
                <div><strong>${restaurant.title || '제목 없음'}</strong></div>
                <img src="${restaurant.firstimage2 || '/image/restaurantSample.jpg'}" alt="${restaurant.title || '이미지'}" class="restaurant-image" style="width:100%; height:auto;" />
                <div>${restaurant.addr1 || '주소 정보 없음'}</div>
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
    marker.restaurantData = restaurant;

    window.restaurantMarkers.push(marker);

    window.map.map.setCenter(position);
    console.log('New restaurant marker added:', restaurant.title || '제목 없음');
}

// 음식점 마커 제거 함수
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

// DOMContentLoaded 이벤트에서 초기화 호출
document.addEventListener('DOMContentLoaded', function() {
    const restaurantButton = document.getElementById('restaurantCategory');
    
    if (restaurantButton) {
    
    }
    
});

// Expose functions to window if needed
window.clearRestaurantPanel = clearRestaurantPanel;
window.loadMoreRestaurants = loadMoreRestaurants;
window.displayRestaurants = displayRestaurants;
window.addRestaurantToPanel = addRestaurantToPanel;
window.updateLoadMoreButtonStatus = updateLoadMoreButtonStatus;
window.addRestaurantMarker = addRestaurantMarker;
window.removeRestaurantMarkers = removeRestaurantMarkers;