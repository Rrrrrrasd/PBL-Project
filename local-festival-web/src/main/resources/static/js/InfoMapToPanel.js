function InfoMapToPanel(festival) {
    console.log('InfoMapToPanel function called');  // 함수 호출 여부 확인

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
    imageElement.src = festival.firstimage2 || 'festivalSample.jpg';  // 이미지가 없을 경우 기본값 설정
    imageElement.alt = festival.title || '축제 이미지';
    titleElement.textContent = festival.title || '제목 없음';
    addressElement.textContent = festival.addr1 || '주소 정보 없음';
    datesElement.textContent = ` ${festival.eventstartdate.slice(4,6) + "/" + festival.eventstartdate.slice(6,8) || ' 시작일 정보 없음'} ~ 
								 ${festival.eventenddate.slice(4,6)+ "/" +festival.eventenddate.slice(6,8) || ' 종료일 정보 없음'}`;
    telElement.textContent = festival.sponsor1tel + "  (" + festival.sponsor1 + ")"  || '전화번호 정보 없음';
	festivalTimeElement.textContent =`${"운영시간: " + festival.playtime || "시간 정보 없음"}`;
	festivalPriceElement.innerHTML = festival.usetimefestival ? `입장료: ${festival.usetimefestival}` : "입장료 정보 없음";
	festivalOverviewElement.innerHTML =	festival.overview ? `<br/>${festival.overview}</p>` 
	    : "";
	
    // 'festival' 섹션을 표시
    festivalInfo.classList.remove('hidden');

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
