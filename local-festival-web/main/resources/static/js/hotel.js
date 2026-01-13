window.cache = window.cache || {};

window.currentPageHotels = 1;
window.numOfRows = 10;
window.currentMapX = null;
window.currentMapY = null;
window.totalHotels = 0;
window.lastMapXHotels = null;
window.lastMapYHotels = null;

window.hotelMarkers = [];

let hotelUniqueIdCounter = 0;


// 숙소 패널을 초기화하는 함수
function clearHotelPanel() {
    const hotelInfo = document.getElementById('hotel-list');
    if (hotelInfo) {
        hotelInfo.innerHTML = '';
        console.log('Hotel panel cleared.');
    } else {
        console.warn("hotel-list element not found");
    }
}

// 숙소 데이터를 화면에 표시하는 함수
function displayHotels(hotels) {
    const hotelList = document.getElementById('hotel-list');
    if (!hotelList) {
        console.warn("hotel-list element not found");
        return;
    }

    hotels.forEach(function (hotel, index) {
        hotel.uniqueId = `hotel-${hotelUniqueIdCounter++}`;
        console.log(`Assigned uniqueId ${hotel.uniqueId} to hotel: ${hotel.title || '제목 없음'}`);
        addHotelToPanel(hotel);
    });
    console.log('Hotels displayed:', hotels.length);
}

function addHotelToPanel(hotel) {
    const hotelInfo = document.getElementById('hotel-list');
    if (!hotelInfo) {
        console.warn("hotel-list element not found");
        return;
    }

    const distanceMeters = hotel.dist ? parseInt(hotel.dist, 10) : 0;
    console.log(`Parsed distanceMeters: ${distanceMeters} for hotel: ${hotel.title || '제목 없음'}`);

    let distanceText;

    if(hotel.dist) {
        if(distanceMeters < 1000) {
            distanceText = `${distanceMeters}m`;
        }
        else {
            const distanceKm = (distanceMeters / 1000).toFixed(1);
            distanceText = `${distanceKm}km`;
        }
    }
    else {
        distanceText = '거리 정보 없음';
    }

    console.log(`Formatted distanceText: ${distanceText} for hotel: ${hotel.title || '제목 없음'}`);

    const div = document.createElement('div');
    div.classList.add('recommendation-item');
    div.setAttribute('data-dist', distanceMeters);

    //섹션 추가, hr삭제 , distance클래스 추가 제목크기 h5로 수정
    div.innerHTML = `
	        <div class="recommendationInform section">
	            
	            <h5 class="recommendationName">${hotel.title}</h5>
                <hr>
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
				<div class="">
                    <span class="evaluation distance">${distanceText}</span>
                    <button class="otherInfoBTN hotel-marker-btn show-marker-btn marker-button" id="Directions"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
</svg> 표시</button>
                    <button class="otherInfoBTN AdditionalInformation info-button" data-category="hotel" data-id="${hotel.uniqueId}">정보</button>
                </div>
	        </div>
	    `;

    hotelInfo.appendChild(div);
    console.log('Hotel added to panel:', hotel.title || '제목 없음');

    const hotelMarkerButton = div.querySelector('.hotel-marker-btn');
    hotelMarkerButton.addEventListener('click', () => {
        addHotelMarker(hotel);
        console.log('Hotel marker added:', hotel.title || '제목 없음');
    });
}

// "더보기" 버튼에 이벤트 리스너 추가 (숙소)
document.getElementById('loadMoreHotelsButton').addEventListener('click', function () {
    if (window.totalHotels > window.currentPageHotels * window.numOfRows) {
        window.currentPageHotels += 1;
        console.log(`Loading more hotels : Page ${window.currentPageHotels}`);

        loadMoreHotels(window.currentPageHotels);
    }
    else {
        console.log('No more hotels to load');
    }
});

// 더 많은 숙소 데이터를 가져오는 함수
function loadMoreHotels(pageNo) {
    if (window.currentMapX === null || window.currentMapY === null) {
        console.warn('Current map coordinates are not set.');
        return;
    }

    fetch(`/api/festivals/hotels/more?mapx=${window.currentMapX}&mapy=${window.currentMapY}&pageNo=${pageNo}&numOfRows=${window.numOfRows}`)
        .then(response => response.json())
        .then(data => {
            const hotels = data.hotels;
            window.totalHotels = data.totalCount;

            hotels.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
            displayHotels(hotels);
            updateLoadMoreHotelStatus(window.totalHotels, 'loadMoreHotelsButton');

            const key = `${window.currentMapX},${window.currentMapY}`;

            window.cache[key] = window.cache[key] || { hotels: [], restaurants: [] };
            window.cache[key].hotels = (window.cache[key].hotels || []).concat(hotels);
            console.log('Hotels loaded: ', hotels.length);
        })
        .catch(error => console.error('Error fetching more hotels:', error));
}

// 더보기 버튼 상태를 업데이트하는 함수
function updateLoadMoreHotelStatus(totalCount, buttonId) {
    const loadMoreButton = document.getElementById(buttonId);
    if (!loadMoreButton) {
        console.warn(`${buttonId} element not found`);
        return;
    }

    if (totalCount <= window.currentPageHotels * window.numOfRows) {
        loadMoreButton.textContent = "여기까지입니다";
        loadMoreButton.disabled = true;
        console.log('No more hotels to load.');
    } else {
        loadMoreButton.textContent = "더보기";
        loadMoreButton.disabled = false;
        console.log('More hotels available to load.');
    }
}

// 숙소 마커 함수
function addHotelMarker(hotel) {
    console.log('Adding marker for hotel id: ', hotel.uniqueId);

    const existingMarker = window.hotelMarkers.find(marker => marker.hotelId === hotel.uniqueId);

    if (existingMarker) {
        window.map.map.setCenter(existingMarker.getPosition());
        if (!existingMarker.infowindow.getMap()) {
            existingMarker.infowindow.open(window.map.map, existingMarker);
        }
        console.log('Existing hotel marker focused:', hotel.title || '제목 없음');
        return;
    }

    const latitude = parseFloat(hotel.mapy);
    const longitude = parseFloat(hotel.mapx);

    if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid hotel coordinates:', hotel);
        return;
    }

    const position = new kakao.maps.LatLng(latitude, longitude);

    const markerImageSrc = '/image/hotel_marker.png';
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
                <div><strong>${hotel.title || '제목 없음'}</strong></div>
                <img src="${hotel.firstimage2 || '/image/hotelSample.jpg'}" alt="${hotel.title || '이미지'}" class="hotel-image" style="width:100%; height:auto;" />
                <div>${hotel.addr1 || '주소 정보 없음'}</div>
            </div>
        `
    });

    kakao.maps.event.addListener(marker, 'mouseover', function () {
        infowindow.open(window.map.map, marker);
    });

    kakao.maps.event.addListener(marker, 'mouseout', function () {
        infowindow.close();
    });

    marker.hotelId = hotel.uniqueId;
    marker.infowindow = infowindow;
    marker.hotelData = hotel;

    window.hotelMarkers.push(marker);

    window.map.map.setCenter(position);
    console.log('New hotel marker added:', hotel.title || '제목 없음');
}

// 숙소 마커 제거
function removeHotelMarkers() {
    if (window.hotelMarkers && window.hotelMarkers.length > 0) {
        window.hotelMarkers.forEach(marker => {
            marker.setMap(null);
        });
        window.hotelMarkers = [];
        console.log('All hotel markers removed.');
    } else {
        console.log('No hotel markers to remove.');
    }
}

// DOMContentLoaded 이벤트에서 초기화 호출
document.addEventListener('DOMContentLoaded', function () {
    const hotelButton = document.getElementById('hotelCategory');

    if (hotelButton) {
        hotelButton.addEventListener('click', function () {
            clearHotelPanel();
            console.log('Hotel category button clicked. Cleared hotel panel.');

            const key = `${window.currentMapX},${window.currentMapY}`;

            if (window.cache[key] && window.cache[key].hotels.length > 0) {
                displayHotels(window.cache[key].hotels);
                
                console.log('Hotels loaded from cache.');
                console.log(`Hotels cache : ${JSON.stringify(window.cache[key].hotels)}`)
            } else {
                loadMoreHotels(window.currentPageHotels);
                console.log('Hotels loaded from API.');
            }
        });
    }
});

window.clearHotelPanel = clearHotelPanel;
window.loadMoreHotels = loadMoreHotels;
window.displayHotels = displayHotels;
window.addHotelToPanel = addHotelToPanel;
window.updateLoadMoreHotelStatus = updateLoadMoreHotelStatus;
window.addHotelMarker = addHotelMarker;
window.removeHotelMarkers = removeHotelMarkers;