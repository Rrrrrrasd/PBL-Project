document.addEventListener('DOMContentLoaded', function () {
    // 검색 기능 구현 함수 호출
    implementSearchFunctionality();
});

// 검색어 저장
window.lastSearchTerm = '';

// 검색 기능 구현 함수
function implementSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const festivalContainer = document.getElementById('festival'); // 축제 정보가 표시되는 컨테이너

    searchButton.addEventListener('click', function () {
        const query = searchInput.value.trim();
        window.lastSearchTerm = query; // 검색어 저장

        performSearch(query);
    });

    // 검색어 입력 후 엔터 키로도 검색 가능하도록 설정
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // 폼 제출 방지
            searchButton.click();
        }
    });
}

// 검색 수행 함수
function performSearch(query, shouldPushState = true) {
    if(shouldPushState && typeof pushState === 'function') {
        const currentState = getCurrentState();
        if (currentState.type !== 'search' || currentState.data.query !== query) {
            pushState({ type: 'search', data: { query: query } });
        }
    }
    
    if(!window.festivals) {
        console.warn('festivals 데이터가 아직 로드되지 않았습니다.');
        return;
    }

    const festivalContainer = document.getElementById('festival'); // 축제 정보가 표시되는 컨테이너

    // 마커 및 패널 초기화
    if (typeof window.removeRestaurantMarkers === 'function') {
        window.removeRestaurantMarkers();
    }
    else {
        console.warn('removeRestaurantMarkers 함수가 정의되지 않았습니다.');
    }

    if (typeof window.removeHotelMarkers === 'function') {
        window.removeHotelMarkers();
    }
    else {
        console.warn('removeHotelMarkers 함수가 정의되지 않았습니다.');
    }

    if (query === '') {
        // 검색어가 없으면 모든 마커를 표시하고, 현재 진행 중인 축제는 파란색, 그렇지 않은 축제은 회색
        window.map.markers.forEach(function (marker) {
            const festival = marker.festivalData;
            var isOngoing = (window.todayStr >= festival.eventstartdate) && (window.todayStr <= festival.eventenddate);
            marker.setVisible(isOngoing);
            marker.setImage(isOngoing ? null : window.grayMarkerImage); // 기본 파란색 마커 또는 회색 마커 이미지 설정
        });

        // 현재 진행 중인 축제 정보만 패널에 다시 표시
        const ongoingFestivals = window.festivals.filter(function(festival) {
            return (window.todayStr >= festival.eventstartdate) && (window.todayStr <= festival.eventenddate);
        });

        // 모든 축제 정보를 패널에 다시 표시
        displayFestivals(ongoingFestivals);

        // 지도 중심과 확대 수준 설정
        setMapView();

        return;
    }

    // 검색어가 영어인지 한글인지 확인
    const isEnglish = /[a-zA-Z]/.test(query);
    const processedQuery = isEnglish ? query.toLowerCase() : query;

    // 모든 마커을 다시 보이도록 설정
    window.map.markers.forEach(function (marker) {
        const festival = marker.festivalData;
        const title = festival.title;
        const addr = festival.addr1;

        // 영어 검색 시 소문자 변환
        const regionMatch = isEnglish
            ? (title.toLowerCase().includes(processedQuery) || addr.toLowerCase().includes(processedQuery))
            : (title.includes(processedQuery) || addr.includes(processedQuery));

        if (regionMatch) {
            // 축제 이름이나 주소에 검색어가 포함되면 마커 표시
            marker.setVisible(true);

            // 축제가 현재 진행 중인지 확인하여 아이콘 설정
            var isOngoing = (window.todayStr >= festival.eventstartdate) && (window.todayStr <= festival.eventenddate);
            marker.setImage(isOngoing ? null : window.grayMarkerImage); // 기본 파란색 마커 또는 회색 마커 이미지 설정
        } else {
            marker.setVisible(false);
        }
    });

    // 왼쪽 패널의 축제 정보 섹션 초기화
    festivalContainer.innerHTML = '';
    festivalContainer.classList.remove('hidden');

    // 필터링된 축제 데이터 가져오기
    const filteredFestivals = window.festivals.filter(function (festival) {
        const title = festival.title;
        const addr = festival.addr1;

        return isEnglish
            ? (title.toLowerCase().includes(processedQuery) || addr.toLowerCase().includes(processedQuery))
            : (title.includes(processedQuery) || addr.includes(processedQuery));
    });

    if (filteredFestivals.length === 0) {
        festivalContainer.innerHTML = '<p>검색 결과가 없습니다.</p>';

        // 지도 중심과 확대 수준 설정
        setMapView();

        return;
    }

    // 필터링된 축제를 왼쪽 패널에 표시
    displayFestivals(filteredFestivals);

    // 지도 중심과 확대 수준 설정
    setMapView();
}

// 지도 초기 설정
function setMapView() {
    if (window.map && window.map.map) {
        window.map.map.setCenter(new kakao.maps.LatLng(36.5, 127.5));
        window.map.map.setLevel(12);
    }
}

// 축제를 패널과 지도에 표시하는 함수 (이미 정의되어 있음)
function displayFestivals(festivals) {
    const festivalContainer = document.getElementById('festival');
    festivalContainer.innerHTML = '';

    festivals.forEach(function (festival) {
        // 축제 정보를 담을 아이템 생성
        const item = document.createElement('div');
        item.classList.add('recommendationInform'); //1211 이전에recommendation-item 였음

        activateFestivalCategory()        // (1204 임경우) 축제 활성화 표시 함수 추가
        //1211 임경우 수정
        item.innerHTML = `
        <div class="section">
        
                <div class="more-info">
                <img id="festival-image" src="${festival.firstimage2 || '/image/festivalSample.jpg'}" alt="${festival.title}" class="imageExpand">
            </div>
            <div class="">
                <div class="w-100 d-flex justify-content-between align-items-center mb-3 px-12">
                    <a id="festival-title" class="recommendationName">${festival.title}</a>
                    <button class="btn btn-primary text-white" id="Directions" onclick="getDirections(${festival.mapy}, ${festival.mapx})">길찾기</button>
                </div>
                <div id="festa-data">
                    <div class="festa-magin" id="festa-location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                        </svg>
                        <span id="festival-address" class="evaluation">${festival.addr1 || '주소 정보 없음'}</span>
                    </div>
                    <div class="festa-magin" id="festa-period">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-event" viewBox="0 0 16 16">
                            <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                        </svg>
                        <span id="festival-dates" class="evaluation">${festival.eventstartdate.slice(4, 6)}/${festival.eventstartdate.slice(6, 8)} ~ ${festival.eventenddate.slice(4, 6)}/${festival.eventenddate.slice(6, 8)}</span>
                    </div>
                    <div class="festa-magin" id="festa-time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                        </svg>
                        <span id="festival-time" class="evaluation">${festival.operatingHours || '운영시간 정보 없음'}</span>
                    </div>
                    <div class="festa-magin" id="festa-price">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd"
                                                d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0" />
                                            <path
                                                d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z" />
                                            <path
                                                d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z" />
                                            <path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567" />
                                        </svg>
                        <span id="festival-price" class="evaluation">${festival.entryFee || '입장료 정보 없음'}</span>
                    </div>
                    <div class="festa-magin" id="festival-tel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16">
                            <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58z"/>
                        </svg>
                        <span id="festival-tel" class="evaluation">${festival.telephone || '전화번호 정보 없음'}</span>
                    </div>
                </div>
                <div>
                    <hr>
                    <p class="overviewTitle">간단 소개</p>
                    <span id="festival-overview" class="evaluation">${festival.overview || '개요 정보 없음'}</span>
                </div>
            </div>
        </div>
        `;
        // 아이템을 컨테이너에 추가
        festivalContainer.appendChild(item);
    });

    window.displayFestivals = displayFestivals;
    window.setMapView = setMapView;
    window.performSearch = performSearch;
}