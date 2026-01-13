// 모든 카테고리 버튼 선택
document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.kategorie');

    // 클릭 이벤트 추가
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 모든 카테고리 버튼에서 active-category 제거
            categoryButtons.forEach(btn => btn.classList.remove('active-category'));

            // 클릭된 버튼에 active-category 추가
            button.classList.add('active-category');
        });
    });
});


function activateFestivalCategory() {
    const categoryButtons = document.querySelectorAll('.kategorie');
    const infoCategory = document.getElementById('infoCategory');
    // 클릭 이벤트 추가
    categoryButtons.forEach(button => {
        // 모든 카테고리 버튼에서 active-category 제거
        categoryButtons.forEach(btn => btn.classList.remove('active-category'));
        // 클릭된 버튼에 active-category 추가
        infoCategory.classList.add('active-category');
    });//1204여기까지
};