// festivalTerm.js

// 축제가 선택한 달에 진행 중인지 확인하는 함수
function festivalTerm(startMonth, endMonth, selectedMonth) {
    // 디버깅 로그 추가
    console.log(`Checking festival term: StartMonth=${startMonth}, EndMonth=${endMonth}, SelectedMonth=${selectedMonth}`);
    
    if (isNaN(startMonth) || isNaN(endMonth) || isNaN(selectedMonth)) {
        console.log('Invalid month values.');
        return false;
    }

    if (startMonth <= endMonth) {
        // 동일 연도 내에서 진행되는 축제
        return (startMonth <= selectedMonth) && (selectedMonth <= endMonth);
    } else {
        // 연말을 넘겨 진행되는 축제 (예: 11월 ~ 2월)
        return (selectedMonth >= startMonth) || (selectedMonth <= endMonth);
    }
}

// '적용' 버튼 클릭 시 호출되는 함수
function applyChoice() {
    if (typeof removeRestaurantMarkers === 'function') {
        removeRestaurantMarkers();
    }
    else {
        console.warn('removeRestaurantMarkers 함수가 정의되지 않았습니다')
    }

    if (typeof clearRestaurantPanel === 'function') {
        clearRestaurantPanel();
    } else {
        console.warn('clearRestaurantPanel 함수가 정의되지 않았습니다');
    }

    const selectedMonth = parseInt(document.getElementById("month").value, 10);
    console.log('Selected Month:', selectedMonth);

    if (isNaN(selectedMonth)) {
        alert("유효한 달을 선택해주세요.");
        return;
    }

    let visibleMarkers = 0;

    window.map.markers.forEach(marker => {
        const festival = marker.festivalData;
        const startDate = festival.eventstartdate;
        const endDate = festival.eventenddate;

        if (!startDate || !endDate) {
            console.log(`Festival ${festival.title} has invalid dates.`);
            marker.setVisible(false);
            return;
        }

        const startMonth = parseInt(startDate.slice(4, 6), 10);
        const endMonth = parseInt(endDate.slice(4, 6), 10);

        console.log(`Festival: ${festival.title}, StartMonth: ${startMonth}, EndMonth: ${endMonth}`);

        if (festivalTerm(startMonth, endMonth, selectedMonth)) {
            marker.setVisible(true);
            // 마커의 위치가 유효한지 확인
            const position = marker.getPosition();
            if (!isNaN(position.getLat()) && !isNaN(position.getLng())) {
                visibleMarkers++;
                console.log(`Marker for ${festival.title} is visible.`);
            } else {
                console.log(`Marker for ${festival.title} has invalid position.`);
                marker.setVisible(false);
            }
        }
        else {
            marker.setVisible(false);
            console.log(`Marker for ${festival.title} is hidden.`);
        }
    });

    console.log('Visible Markers Count:', visibleMarkers);

    if (visibleMarkers === 0) {
        alert("선택한 달에 진행 중인 축제가 없습니다.");
    } else {
        // 지도 중심과 확대 수준을 고정된 값으로 설정
        try {
            const fixedCenter = new kakao.maps.LatLng(36.5, 127.5);
            window.map.map.setCenter(fixedCenter);
            window.map.map.setLevel(12);
            console.log('Map center and level set to fixed values.');
        } catch (error) {
            console.error('Error setting map center and level:', error);
        }
    }
}

// '초기화' 버튼 클릭 시 호출되는 함수 //11-27(통합) 수정
function resetChoice() {
    console.log('resetChoice함수 호출됨');

    if (typeof removeRestaurantMarkers === 'function') {
        removeRestaurantMarkers();
    }
    else {
        console.warn('removeRestaurantMarkers 함수가 정의되지 않았습니다.');
    }

    if (typeof clearRestaurantPanel === 'function') {
        clearRestaurantPanel();
    }
    else {
        console.warn('clearRestaurantPanel 함수가 정의되지 않았습니다.');
    }

    if (typeof removeHotelMarkers === 'function') {
        removeHotelMarkers();
    }
    else {
        console.warn('removeHotelMarkers 함수가 정의되지 않았습니다.');
    }

    if (typeof clearHotelPanel === 'function') {
        clearHotelPanel();
    }
    else {
        console.warn('clearHotelPanel 함수가 정의되지 않았습니다.');
    }

    // 선택된 월 가져오기
    const monthSelect = document.getElementById("month");
    const selectedMonth = parseInt(monthSelect.value, 10);
    console.log('Selected Month:', selectedMonth);

    if (isNaN(selectedMonth)) {
        alert("유효한 달을 선택해주세요.");
        return;
    }

    let visibleMarkers = 0;

    window.map.markers.forEach(marker => {
        const festival = marker.festivalData;
        const startDate = festival.eventstartdate;
        const endDate = festival.eventenddate;

        if (!startDate || !endDate) {
            console.log(`Festival ${festival.title} has invalid dates.`);
            marker.setVisible(false);
            return;
        }

        const startMonth = parseInt(startDate.slice(4, 6), 10);
        const endMonth = parseInt(endDate.slice(4, 6), 10);

        console.log(`Festival: ${festival.title}, StartMonth: ${startMonth}, EndMonth: ${endMonth}`);

        if (festivalTerm(startMonth, endMonth, selectedMonth)) {
            marker.setVisible(true);

            const isOngoing = (window.todayStr >= startDate) && (window.todayStr <= endDate);
            marker.setImage(isOngoing ? null : window.grayMarkerImage);

            const position = marker.getPosition();
            if (!isNaN(position.getLat()) && !isNaN(position.getLng())) {
                visibleMarkers++;
                console.log(`Marker for ${festival.title} is visible.`);
            } else {
                console.log(`Marker for ${festival.title} has invalid position.`);
                marker.setVisible(false);
            }
        } else {
            marker.setVisible(false);
            console.log(`Marker for ${festival.title} is hidden.`);
        }
    });

    console.log('Visible Markers Count:', visibleMarkers);

    if (visibleMarkers === 0) {
        alert("선택한 달에 진행 중인 축제가 없습니다.");
    }
    else {
        try {
            const fixedCenter = new kakao.maps.LatLng(36.5, 127.5);
            window.map.map.setCenter(fixedCenter);
            window.map.map.setLevel(12);
            console.log('Map center and level set to fixed values.');
        }
        catch (error) {
            console.error('Error setting map center and level:', error);
        }
    }
}

window.applyChoice = applyChoice;
window.resetChoice = resetChoice;