// 마커를 표시할 위치와 내용을 가지고 있는 객체 배열입니다 
var positions = [
    {
        content: '<div><img src="IMAGE_URL_1" alt="카카오 이미지" style="width:50px;height:50px;"><br>카카오</div>', 
        latlng: new kakao.maps.LatLng(33.450705, 126.570677)
    },
    {
        content: '<div><img src="https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA1MTBfMjYg%2FMDAxNjgzNzE3NzE3NzA5.bk5z5h2Ig-dnnXE9-7Urwni2nKnZERzZnEz9ixhEOYIg.evZCzZSgxeXgCFJXaQ5OO9edthqUbQmwAzTIvKwjGuIg.JPEG.jetohan%2F20230510%25A3%25DF150902.jpg&type=sc960_832" alt="생태연못 이미지" style="width:200px;height:200px;"><br>생태연못</div>', 
        latlng: new kakao.maps.LatLng(33.450936, 126.569477)
    },
    {
        content: '<div><img src="IMAGE_URL_3" alt="텃밭 이미지" style="width:50px;height:50px;"><br>텃밭</div>', 
        latlng: new kakao.maps.LatLng(33.450879, 126.569940)
    },
    {
        content: '<div><img src="IMAGE_URL_4" alt="근린공원 이미지" style="width:50px;height:50px;"><br>근린공원</div>',
        latlng: new kakao.maps.LatLng(33.451393, 126.570738)
    }
];

for (var i = 0; i < positions.length; i ++) {
    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
        map: map, // 마커를 표시할 지도
        position: positions[i].latlng // 마커의 위치
    });

    // 마커에 표시할 인포윈도우를 생성합니다 
    var infowindow = new kakao.maps.InfoWindow({
        content: positions[i].content // 인포윈도우에 표시할 내용
    });

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다 
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
    kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));

    // 클릭한 마커를 중심으로 지도를 확대시킴
    kakao.maps.event.addListener(marker, 'click', function() {
        map.setCenter(marker.getPosition());
        map.setLevel(3);
    })
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeOverListener(map, marker, infowindow) {
    return function() {
        infowindow.open(map, marker);
    };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
    return function() {
        infowindow.close();
    };
}