document.addEventListener('DOMContentLoaded', function () {
    // 검색 기능 구현 함수 호출
    implementSearchFunctionality();
});

// 검색어 저장
window.lastSearchTerm = '';    // 수정 (추가)

// 검색 기능 구현 함수
// 수정
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
// 수정 (추가)
function performSearch(query) {
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
            marker.setVisible(true);
            marker.setImage(isOngoing ? null : window.grayMarkerImage); // 기본 파란색 마커 또는 회색 마커 이미지 설정
        });

        // 모든 축제 정보를 패널에 다시 표시
        displayFestivals(window.festivals);

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
// 수정 (추가)
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
        item.classList.add('recommendation-item');
        activateFestivalCategory()//1204 임경우 축제 활성화 표시 함수 추가
        item.innerHTML = `
            <div class="recommendationInform">
                <a href="#" class="more-info">
                    <img src="${festival.firstimage2 || '/image/festivalSample.jpg'}" alt="${festival.title}" class="imageExpand">
                </a>
                <div>
                    <div class="w-100 d-flex justify-content-between align-items-center mb-3 px-12">
                        <button class="recommendationName" onclick="focusOnMarker('${festival.title}')">${festival.title}</button>
                        <button class="btn btn-primary text-white" onclick="getDirections(${festival.mapy}, ${festival.mapx})">길찾기</button>
                    </div>
                    <p class="evaluation">${festival.addr1 || '주소 정보 없음'}</p>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            fill="currentColor" class="bi bi-calendar-event" viewBox="0 0 16 16">
                            <path
                                d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
                            <path
                                d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                        </svg>
                        <span class="evaluation">${festival.eventstartdate.slice(4, 6)}/${festival.eventstartdate.slice(6, 8)} ~ ${festival.eventenddate.slice(4, 6)}/${festival.eventenddate.slice(6, 8)}</span>
                    </div>
                    <div>
                        <span class="evaluation">${festival.operatingHours || '운영시간 정보 없음'}</span>
                    </div>
                    <div>
                        <span class="evaluation">${festival.entryFee || '입장료 정보 없음'}</span>
                    </div>
                    <div class="flex-column">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16">
                            <path
                                d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                        </svg>
                        <span class="evaluation">${festival.telephone || '전화번호 정보 없음'}</span>
                    </div>
                    <div>
                        <span class="evaluation">${festival.overview || '개요 정보 없음'}</span>
                    </div>

                    <hr> <!--리뷰, 평점 구분선-->
                </div>
            </div>
        `;

        festivalContainer.appendChild(item);
    });
}

// 수정 (추가)
window.displayFestivals = displayFestivals;
window.setMapView = setMapView;
window.performSearch = performSearch;