document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const leftPanel = document.querySelector('.left-panel');

    // 폼 위치 조정
    function adjustFormPosition() {
        const leftPanelRect = leftPanel.getBoundingClientRect();
        formContainer.style.left = `${leftPanelRect.right + 10}px`; // left-panel의 오른쪽에 위치
        formContainer.style.top = `${leftPanelRect.top + 10}px`; // 상단에서 약간 아래로
    }

    // 창 크기 조정 시 위치 재조정
    window.addEventListener('resize', adjustFormPosition);

    // 초기 위치 설정
    adjustFormPosition();
});
