document.addEventListener('DOMContentLoaded', () => {
    // 상태 스택 초기화
    window.stateStack = window.stateStack || [];

    // 초기 상태를 'initial'로 설정
    if (window.stateStack.length === 0) {
        window.stateStack.push({ type: 'initial' });
        console.log('Initial state added to stateStack.');
    }

    // 현재 상태를 가져오는 함수
    function getCurrentState() {
        return window.stateStack[window.stateStack.length - 1];
    }

    // 상태를 스택에 추가하는 함수
    function pushState(newState) {
        window.stateStack.push(newState);
        console.log('State pushed:', newState.type);
    }

    // 상태를 스택에서 제거하는 함수
    function popState() {
        if (window.stateStack.length > 1) { // 최소 하나의 상태는 유지
            const poppedState = window.stateStack.pop();
            console.log('State popped:', poppedState.type);
            return window.stateStack[window.stateStack.length - 1];
        } else {
            console.warn('더 이상 이전 상태가 없습니다.');
            return window.stateStack[0];
        }
    }

    // performSearch 함수 래핑: shouldPushState 플래그 추가
    const originalPerformSearch = window.performSearch;
    window.performSearch = function(query, shouldPushState = true) {
        if (shouldPushState) {
            const currentState = getCurrentState();
            if (currentState.type !== 'search' || currentState.data.query !== query) {
                pushState({ type: 'search', data: { query: query } });
            }
        }
        originalPerformSearch(query);
    }

    // InfoMapToPanel 함수 래핑
    const originalInfoMapToPanel = window.InfoMapToPanel;
    window.InfoMapToPanel = function(festival) {
        const currentState = getCurrentState();
        if (currentState.type !== 'markerClicked' || currentState.data.festival.contentId !== festival.contentId) {
            pushState({ type: 'markerClicked', data: { festival: festival } });
        }
        originalInfoMapToPanel(festival);
    }

    // applyChoice 함수 래핑: selectedMonth를 상태에 저장
    const originalApplyChoice = window.applyChoice;
    window.applyChoice = function() {
        const monthSelect = document.getElementById("month");
        const selectedMonth = parseInt(monthSelect.value, 10);

        if (isNaN(selectedMonth)) {
            console.warn("No valid month selected to apply.");
            return;
        }

        const currentState = getCurrentState();
        
        if (currentState.type !== 'monthFilter' || currentState.data.selectedMonth !== selectedMonth) {
            pushState({ type: 'monthFilter', data: { selectedMonth } });
        }
        originalApplyChoice();
    }

    // applyRange 함수 래핑
    const originalApplyRange = window.applyRange;
    window.applyRange = function() {
        const currentState = getCurrentState();
        pushState({ type: 'filterHotelsRestaurants' });
        originalApplyRange();
    }

    // resetRangeChoice 함수 래핑
    const originalResetRangeChoice = window.resetRangeChoice;
    window.resetRangeChoice = function() {
        pushState({ type: 'resetFilter' });
        originalResetRangeChoice();
    }

    // clearFestivalInfo 함수 래핑
    const originalClearFestivalInfo = window.clearFestivalInfo;
    window.clearFestivalInfo = function() {
        originalClearFestivalInfo();
        pushState({ type: 'clearFestivalInfo' });
    }

    // 'festivalsLoaded' 이벤트 리스너 추가
    document.addEventListener('festivalsLoaded', function() {
        console.log('festivalsLoaded 이벤트 수신. performSearch 호출.');
        window.performSearch('', false); // 상태를 추가하지 않고 performSearch 호출
    });

    // 백 버튼 클릭 시 상태 복귀 처리
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            if (window.stateStack.length <= 1) {
                // 초기 상태인 경우 경고창 표시
                alert('더 이상 뒤로 갈 수 없습니다.');
                return;
            }

            // 현재 상태를 제거하고 이전 상태를 가져옴
            const previousState = popState();

            console.log('Returning to state:', previousState.type);

            // 상태에 따라 화면을 복원
            switch(previousState.type) {
                case 'initial':
                    // 검색창 초기화 및 현재 진행 중인 축제만 표시
                    document.getElementById('searchInput').value = '';
                    window.performSearch('', false); // 상태 추가하지 않고 performSearch 호출
                    break;
                case 'search':
                    // 이전 검색어로 검색 수행
                    document.getElementById('searchInput').value = previousState.data.query;
                    window.performSearch(previousState.data.query, false); // 상태 추가하지 않고 performSearch 호출
                    break;
                case 'markerClicked':
                    // 해당 축제 정보 표시
                    InfoMapToPanel(previousState.data.festival);
                    break;
                case 'monthFilter':
                    // 선택한 달로 UI 업데이트 후 필터 적용
                    const monthSelect = document.getElementById("month");
                    monthSelect.value = previousState.data.selectedMonth;
                    originalApplyChoice();
                    break;
                case 'filterHotelsRestaurants':
                    // 숙소/음식점 범위 검색 필터 적용
                    originalApplyRange();
                    break;
                case 'resetFilter':
                    // 범위 검색 초기화
                    originalResetRangeChoice();
                    break;
                case 'clearFestivalInfo':
                    // 축제 정보 클리어
                    originalClearFestivalInfo();
                    break;
                default:
                    console.warn('알 수 없는 상태:', previousState.type);
            }
        });
    }

    // 상태 스택 디버깅을 위해 현재 상태 스택을 콘솔에 출력하는 함수
    window.logStateStack = function() {
        console.log('Current stateStack:', window.stateStack);
    }
});
