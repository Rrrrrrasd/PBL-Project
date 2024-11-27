document.addEventListener('DOMContentLoaded', () => {
    const infoOverlay = document.getElementById("info-overlay");
    const closeOverlayButton = document.getElementById("close-overlay");
    const leftPanel = document.querySelector(".left-panel"); // left-panel 요소

    let isOverlayOpen = false; // 오버레이 창 상태 저장

    // Event Delegation 방식으로 모든 '정보' 버튼 이벤트 리스너 추가
    document.body.addEventListener("click", (event) => {
        if (event.target && event.target.classList.contains("AdditionalInformation")) {
            isOverlayOpen = !isOverlayOpen; // 상태 토글
            if (isOverlayOpen) {
                // left-panel의 크기를 가져와 info-overlay에 적용
                const leftPanelWidth = leftPanel.offsetWidth + "px";
                infoOverlay.style.width = leftPanelWidth; // 너비 설정
                infoOverlay.classList.add("active"); // 활성화 클래스 추가
            } else {
                infoOverlay.style.width = "0"; // 너비 초기화
                infoOverlay.classList.remove("active"); // 활성화 클래스 제거
            }
        }
    });

    // 닫기 버튼 클릭 이벤트
    closeOverlayButton.addEventListener("click", () => {
        isOverlayOpen = false; // 상태 업데이트
        infoOverlay.style.width = "0"; // 너비 초기화
        infoOverlay.classList.remove("active"); // 활성화 클래스 제거
    });

    // 윈도우 리사이즈 시 left-panel 크기 업데이트에 따라 오버레이 크기 변경
    window.addEventListener("resize", () => {
        if (isOverlayOpen) {
            const leftPanelWidth = leftPanel.offsetWidth + "px";
            infoOverlay.style.width = leftPanelWidth; // 동적으로 크기 업데이트
        }
    });
});
