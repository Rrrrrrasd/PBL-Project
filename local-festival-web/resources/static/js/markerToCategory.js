document.addEventListener('DOMContentLoaded', () => {
    const festivalCategoryButton = document.getElementById('infoCategory'); // 축제 카테고리 버튼
    const categoryButtons = document.querySelectorAll('.kategorie'); // 모든 카테고리 버튼

    // Helper function to clear active state from all category buttons
    function clearActiveState() {
        categoryButtons.forEach(button => button.classList.remove('active-category'));
    }

    // Function to handle marker click
    function handleMarkerClick(marker) {
        clearActiveState(); // Clear existing active state
        if (festivalCategoryButton) {
            festivalCategoryButton.classList.add('active-category'); // Highlight the festival category
        }
        if (marker.festivalData) {
            InfoMapToPanel(marker.festivalData); // Update festival info in the panel
        }
    }

    // Attach click event to all map markers
    if (window.map && window.map.markers) {
        window.map.markers.forEach(marker => {
            kakao.maps.event.addListener(marker, 'click', () => {
                console.log('Marker clicked, activating festival category.');
                handleMarkerClick(marker);
            });
        });
    }
});

