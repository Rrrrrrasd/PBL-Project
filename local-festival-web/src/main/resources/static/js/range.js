document.addEventListener('DOMContentLoaded', () => {
    const rangeForm = document.getElementById('rangeForm');
    const hotelButton = document.getElementById('hotelCategory');
    const restaurantButton = document.getElementById('restaurantCategory');
    const searchButton = document.getElementById('searchRangeButton')
    const resetButton = document.getElementById('rangeResetButton');

    // 숙소 탭 클릭 시
    if (hotelButton) {
        hotelButton.addEventListener('click', () => {
            rangeForm.classList.remove('hidden');
        });
    }

    // 주변 맛집 탭 클릭 시
    if (restaurantButton) {
        restaurantButton.addEventListener('click', () => {
            rangeForm.classList.remove('hidden');
        });
    }

    // 검색 버튼 클릭 시
    if (searchButton) {
        searchButton.addEventListener('click', applyRange);
    }

    // 초기화 버튼 클릭 시
    if (resetButton) {
        resetButton.addEventListener('click', resetRangeChoice);
    }
});

function applyRange() {
    console.log('applyRange 함수 호출됨'); 
    const rangeInput = document.getElementById('range');
    const rangeKm = parseFloat(rangeInput.value);

    if (isNaN(rangeKm) || rangeKm < 0) {
        alert('유효한 범위를 입력해주세요.');
        return;
    }

    const rangeMeters = rangeKm * 1000;
    console.log(`검색 범위: ${rangeKm}km (${rangeMeters}m)`);

    // 숙소 패널 필터링
    const hotelList = document.getElementById('hotel-list');
    if (hotelList) {
        const hotelItems = hotelList.getElementsByClassName('recommendation-item');
        Array.from(hotelItems).forEach(item => {
            const distanceMeters = parseInt(item.dataset.dist, 10);
            if (!isNaN(distanceMeters)) {
                if (distanceMeters <= rangeMeters) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            } else {
                console.warn('거리 정보가 유효하지 않은 숙소 항목이 있습니다:', item);
                item.classList.add('hidden');
            }
        });
    }

    // 맛집 패널 필터링
    const restaurantList = document.getElementById('restaurant-list');
    if (restaurantList) {
        const restaurantItems = restaurantList.getElementsByClassName('recommendation-item');
        Array.from(restaurantItems).forEach(item => {
            const distanceMeters = parseInt(item.dataset.dist, 10);
            if (!isNaN(distanceMeters)) {
                if (distanceMeters <= rangeMeters) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            } else {
                console.warn('거리 정보가 유효하지 않은 음식점 항목이 있습니다:', item);
                item.classList.add('hidden');
            }
        });
    }

    // 숙소 마커 필터링
    if (window.hotelMarkers && window.hotelMarkers.length > 0) {
        window.hotelMarkers.forEach(marker => {
            const distance = parseInt(marker.hotelData.dist.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(distance)) {
                marker.setVisible(distance <= rangeMeters);
            } else {
                console.warn(`숙소 "${marker.hotelData.title}"의 거리 정보가 유효하지 않습니다.`);
                marker.setVisible(false);
            }
        });
    }

    // 음식점 마커 필터링
    if (window.restaurantMarkers && window.restaurantMarkers.length > 0) {
        window.restaurantMarkers.forEach(marker => {
            const distance = parseInt(marker.restaurantData.dist.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(distance)) {
                marker.setVisible(distance <= rangeMeters);
            } else {
                console.warn(`음식점 "${marker.restaurantData.title}"의 거리 정보가 유효하지 않습니다.`);
                marker.setVisible(false);
            }
        });
    }

    console.log('범위 필터가 적용되었습니다.');
}

function resetRangeChoice() {
    console.log('resetRangeChoice 함수 호출됨');
    const rangeForm = document.getElementById('rangeForm');
    if (rangeForm) {
        rangeForm.classList.add('hidden');
    }

    const rangeInput = document.getElementById('range');
    if (rangeInput) {
        rangeInput.value = '';
    }

    // 모든 숙소 항목 표시
    const hotelList = document.getElementById('hotel-list');
    if (hotelList) {
        const hotelItems = hotelList.getElementsByClassName('recommendation-item');
        Array.from(hotelItems).forEach(item => {
            item.classList.remove('hidden');
        });
    }

    // 모든 음식점 항목 표시
    const restaurantList = document.getElementById('restaurant-list');
    if (restaurantList) {
        const restaurantItems = restaurantList.getElementsByClassName('recommendation-item');
        Array.from(restaurantItems).forEach(item => {
            item.classList.remove('hidden');
        });
    }

    // 모든 숙소 마커 표시
    if (window.hotelMarkers && window.hotelMarkers.length > 0) {
        window.hotelMarkers.forEach(marker => {
            marker.setVisible(true);
        });
    }

    // 모든 음식점 마커 표시
    if (window.restaurantMarkers && window.restaurantMarkers.length > 0) {
        window.restaurantMarkers.forEach(marker => {
            marker.setVisible(true);
        });
    }
    console.log('범위 필터가 초기화되었습니다.');
}

// window 객체에 함수 노출
window.applyRange = applyRange;
window.resetRangeChoice = resetRangeChoice;