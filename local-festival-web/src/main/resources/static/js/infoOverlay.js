// 수정 (변경)
document.addEventListener('DOMContentLoaded', () => {
    const infoOverlay = document.getElementById("info-overlay");
    const closeOverlayButton = document.getElementById("close-button");
    const leftPanel = document.querySelector(".left-panel"); // left-panel 요소

    let isOverlayOpen = false; // 오버레이 창 상태 저장

    // Event Delegation 방식으로 모든 '정보' 버튼 이벤트 리스너 추가
    // 수정 (추가, 삭제, 변경)
    document.body.addEventListener("click", (event) => {
        if (event.target && event.target.classList.contains("AdditionalInformation")) {
            const overlayCategory = event.target.dataset.category;
            const overlayId = event.target.dataset.id;
            let overlayData;
            const key = `${window.currentMapX},${window.currentMapY}`;

            console.log(`Info Button Clicked: Category=${overlayCategory}, ID=${overlayId}, Key=${key}`);

            if(window.cache[key]) {
                if(overlayCategory === 'hotel') {
                    overlayData = window.cache[key].hotels.find(h => h.uniqueId === overlayId);
                }
                else if (overlayCategory === 'restaurant') {
                    overlayData = window.cache[key].restaurants.find(r => r.uniqueId === overlayId);
                }
            }

            if(overlayData) {
                const overlayContent = infoOverlay.querySelector('.info-content > div');
                overlayContent.innerHTML = '';

                if (overlayCategory === 'hotel') {
                    overlayContent.innerHTML = `
                        <h3>${overlayData.title}</h3>
                        <p><strong>주소:</strong> ${overlayData.addr1 || '주소 정보 없음'}</p>
                        <p><strong>전화번호:</strong> ${overlayData.tel || '전화번호 정보 없음'}</p>
                        <p><strong>거리:</strong> ${overlayData.dist || '거리 정보 없음'}m</p>
                    `;
                } else if (overlayCategory === 'restaurant') {
                    overlayContent.innerHTML = `
                        <h3>${overlayData.title}</h3>
                        <p><strong>주소:</strong> ${overlayData.addr1 || '주소 정보 없음'}</p>
                        <p><strong>전화번호:</strong> ${overlayData.tel || '전화번호 정보 없음'}</p>
                        <p><strong>거리:</strong> ${overlayData.dist || '거리 정보 없음'}m</p>
                    `;
                }

                isOverlayOpen = true;
                const leftPanelWidth = leftPanel.offsetWidth + "px";
                infoOverlay.style.width = leftPanelWidth;
                infoOverlay.classList.add("active");
            }
            else {
                console.warn('해당 데이터를 찾을 수 없습니다.', overlayCategory, overlayId);
            }
        }
    });

    // 수정 (추가)
    // 닫기 버튼 클릭 이벤트 (버튼에 infoPanel 닫기 버튼 기능 넣고 싶으면 class에 close-button 추가)
    const closeButtons = document.querySelectorAll(".close-button");

    // 수정 (추가)
    const closeOverlay = (event) => {
        event.preventDefault();
        isOverlayOpen = false;
        infoOverlay.style.width = "0";
        infoOverlay.classList.remove("active");
    }

    // 수정 (추가)
    closeButtons.forEach(button => {
        button.addEventListener("click", closeOverlay);
    });

    // 수정 (삭제)
    
    // 닫기 버튼 클릭 이벤트
    // closeOverlayButton.addEventListener("click", () => {
    //     isOverlayOpen = false; // 상태 업데이트
    //     infoOverlay.style.width = "0"; // 너비 초기화
    //     infoOverlay.classList.remove("active"); // 활성화 클래스 제거
    // });

    // 윈도우 리사이즈 시 left-panel 크기 업데이트에 따라 오버레이 크기 변경
    window.addEventListener("resize", () => {
        if (isOverlayOpen) {
            const leftPanelWidth = leftPanel.offsetWidth + "px";
            infoOverlay.style.width = leftPanelWidth; // 동적으로 크기 업데이트
        }
    });
});
