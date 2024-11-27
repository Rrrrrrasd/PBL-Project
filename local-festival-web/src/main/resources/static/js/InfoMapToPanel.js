let currentSelectedFestival = null;


// 수정 11/25

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
		clearHotelPanel();    // 수정 (추가)
    }

    currentSelectedFestival = festival;
    // 현재 마커의 위치를 키로 생성
    const cacheKey = `${festival.mapx},${festival.mapy}`;
    
    // 캐시에 동일 마커 데이터가 있는지 확인
	if (window.cache[cacheKey]) {
	        console.log("Using cached data for marker:", cacheKey);
	        clearHotelPanel();           // 기존 숙소 데이터 초기화
	        clearRestaurantPanel();     // 기존 음식점 데이터 초기화

	        const cachedData = window.cache[cacheKey];
	        displayHotels(cachedData.hotels);             // 캐시된 숙소 데이터를 표시
	        displayRestaurants(cachedData.restaurants);   // 캐시된 음식점 데이터를 표시
	        return;  // API 요청 생략
	    }

    // 축제 정보를 표시할 요소
    const imageElement = document.getElementById('festival-image');
    const titleElement = document.getElementById('festival-title');
    const addressElement = document.getElementById('festival-address');
    const datesElement = document.getElementById('festival-dates');
    const telElement = document.getElementById('festival-tel');
    const festivalInfo = document.getElementById('festival'); // 축제 정보 섹션
    const festivalTimeElement = document.getElementById('festival-time'); // 축제 시간
    const festivalPriceElement = document.getElementById('festival-price'); // 축제 입장료
    const festivalOverviewElement = document.getElementById('festival-overview'); // 개요

	// 각각의 요소에 축제 정보를 업데이트
    imageElement.src = festival.firstimage2 || '해당 축제 이미지를 찾을 수 없습니다.';//'/image/festivalSample.jpg'1123해당축제를 가져올수 없습니다로 변경 
    imageElement.alt = festival.title || '축제 이미지';
    titleElement.textContent = festival.title || '제목 없음';
    addressElement.textContent = ` ${festival.addr1 || '주소 정보 없음'}`;
    datesElement.textContent = ` ${festival.eventstartdate.slice(4, 6)}/${festival.eventstartdate.slice(6, 8) || ' 시작일 정보 없음'} ~ 
        ${festival.eventenddate.slice(4, 6)}/${festival.eventenddate.slice(6, 8) || ' 종료일 정보 없음'}`;
    telElement.textContent = festival.sponsor1tel + "  (" + festival.sponsor1 + ")" || '전화번호 정보 없음';
    festivalTimeElement.textContent = ` ${festival.playtime || "시간 정보 없음"}`;
    festivalPriceElement.innerHTML = festival.usetimefestival ? ` ${festival.usetimefestival}` : "입장료 정보 없음";
    festivalOverviewElement.innerHTML = festival.overview ? `<div class="overviewArea"><p class="overviewTitle">간단 소개</p> <div class="overview">${festival.overview}</div></div>` : "";

    // 'festival' 섹션을 표시
    festivalInfo.classList.remove('hidden');

    currentMapX = festival.mapx;
    currentMapY = festival.mapy;
	window.currentPageHotels = 1;    // 수정 (추가)
	window.currentPageRestaurants = 1;    // 수정 (추가)

    // 기존 숙소 데이터를 초기화하여 이전 데이터 제거
    clearHotelPanel();

    // 새로운 위치의 숙소 데이터를 로드
    loadMoreHotels(window.currentPageHotels);

    clearRestaurantPanel(); // 기존 음식점 데이터 초기화
    loadMoreRestaurants(window.currentPageRestaurants); // 첫 페이지 음식점 데이터 로드

    // 마지막 요청된 마커 위치 갱신
	window.lastMapXHotels = window.currentMapX;
    window.lastMapYHotels = window.currentMapY;
    window.lastMapXRestaurants = window.currentMapX;
    window.lastMapYRestaurants = window.currentMapY;

    let directionButton = document.querySelector('#Directions');

    // 기존 'Directions' 버튼 이벤트 리스너 제거
    if (window.currentDirectionListener && directionButton) {
        directionButton.removeEventListener('click', window.currentDirectionListener);
    }
    
    if (directionButton) {
        window.currentDirectionListener = handleDirectionClick;
        directionButton.addEventListener('click', window.currentDirectionListener);
    }

    function handleDirectionClick() {
        const destination = festival.title || '목적지';
        const latitude = festival.mapy;  // 위도
        const longitude = festival.mapx; // 경도

        const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destination)},${latitude},${longitude}`;
        window.open(kakaoMapUrl, 'kakaoMapTab');
    }

	if (!window.cache[cacheKey]) {
	        window.cache[cacheKey] = { hotels: [], restaurants: [] };
	    }
	
	
	//추가 내용 11/24
	displayReviews(currentSelectedFestival.contentId); // 리뷰 표시
	
	// 리뷰 작성 이벤트 리스너 11/24
	document.getElementById('submit-review-button').addEventListener('click', () => {
		console.log(currentSelectedFestival.contentId);
	    const contentId = currentSelectedFestival.contentId; // 현재 선택된 축제/숙소/음식점의 contentId
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
	        .catch(error => {
				alert('로그인 후 작성가능합니다.');
				console.error('Error adding review:', error);
			});
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

















// 숙소 데이터를 화면에 표시하는 함수 11/25 변경
/*
function displayHotels(hotels) {
	const hotelInfo = document.getElementById('hotel-list');
    hotels.forEach(function(hotel) {
        addHotelToPanel(hotel, hotelInfo);
    });
}
*/

// 숙소 정보를 추가하는 함수 11/25 변경사항 존재
/*
function addHotelToPanel(hotel, container) {
	const hotelId = hotel.id || `${hotel.mapx}-${hotel.mapy}-${Math.random()}`;
    
	const div = document.createElement('div');
    div.classList.add('recommendation-item');
    div.innerHTML = `
        <button class="recommendationName">${hotel.title}</button>
        <p class="evaluation">${hotel.addr1 || '주소 정보 없음'}</p>
        <p class="evaluation">${hotel.tel || '전화번호 정보 없음'}</p>
		<!--추가-->
		<span class="evaluation">
		  ${hotel.dist ? parseInt(hotel.dist, 10) + 'm' : '거리 정보 없음'}
		</span>
        <button class="show-Restrant-marker-btn">마커 표시</button>
        <button>정보 표시</button>
    `;
    container.appendChild(div);
	//해당 부분 변경 + 위의 마커표시, 정보표시 추가
	const showMarkerButton = div.querySelector('.show-Restrant-marker-btn');
	showMarkerButton.addEventListener('click', () => {
		addHotelMarker({...hotel, id: hotelId});
		});
}
*/




// 숙소 마커 추가 11/25변경 
/*
function addHotelMarker(hotel) {
	const existingMarker = window.hotelMarkers.find(marker => marker.hotelId === hotel.id);
	if (existingMarker) {
		window.map.map.setCenter(existingMarker.getPosition());
		if (!existingMarker.infowindow.getMap()) {
			existingMarker.infowindow.open(window.map.map, existingMarker);
		}
		return;
	}
	
	const latitude = parseFloat(hotel.mapy);
	const longitude = parseFloat(hotel.mapx);
		
	if (isNaN(latitude) || isNaN(longitude)) {
		console.error('Invalid hotel coordinates:', hotel);
		return;
	}
	
	const position = new kakao.maps.LatLng(latitude, longitude);
	
	//마커 이미지 변경 필요
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
                <div><strong>${hotel.title}</strong></div>
                <img src="${hotel.firstimage2 || '/image/hotelSample.jpg'}" alt="${hotel.title}" class="hotel-image" style="width:100%; height:auto;" />
                <div>${hotel.addr1}</div>
            </div>
        `
	});
	
	kakao.maps.event.addListener(marker, 'mouseover', function () {
		infowindow.open(window.map.map, marker);
	});
	
	kakao.maps.event.addListener(marker, 'mouseout', function () {
		infowindow.close();
	});
	
	marker.hotelId = hotel.id;
	marker.infowindow = infowindow;
	window.hotelMarkers.push(marker);
	
	window.map.map.setCenter(position);
}

*/


 
//숙소 마커 제거 11/25 변경 일단 보류
/*
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
*/





















window.InfoMapToPanel = InfoMapToPanel;
window.clearFestivalInfo = clearFestivalInfo;
