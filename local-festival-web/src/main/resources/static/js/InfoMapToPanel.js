function InfoMapToPanel(festival) {
    console.log('InfoMapToPanel function called');  // 함수 호출 여부 확인

    // 축제 정보를 표시할 요소
    const imageElement = document.getElementById('festival-image');
    const titleElement = document.getElementById('festival-title');
    const addressElement = document.getElementById('festival-address');
    const datesElement = document.getElementById('festival-dates');
    const telElement = document.getElementById('festival-tel');
    const festivalInfo = document.getElementById('festival'); // 축제 정보 섹션

    console.log('Festival Data:', festival);  // 축제 객체 전체를 출력

    // 각각의 요소에 축제 정보를 업데이트
    imageElement.src = festival.firstimage || 'festivalSample.jpg';  // 이미지가 없을 경우 기본값 설정
    imageElement.alt = festival.title || '축제 이미지';
    titleElement.textContent = festival.title || '제목 없음';
    addressElement.textContent = festival.addr1 || '주소 정보 없음';
    datesElement.textContent = ` ${festival.eventstartdate || ' 시작일 정보 없음'} ~ ${festival.eventenddate || ' 종료일 정보 없음'}`;
    telElement.textContent = festival.tel || '전화번호 정보 없음';

    // 'festival' 섹션을 표시
    festivalInfo.classList.remove('hidden');

    const imageWidth = imageElement.src.width;
    imageElement.src.style = `width-${imageWidth}`
}
