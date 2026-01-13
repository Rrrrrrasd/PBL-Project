function displayReviews(contentId, reviewList, title) {
		console.log("패치수행완료");
	    fetch(`/api/reviews/${contentId}`)
	        .then(response => response.json())
	        .then(reviews => {
				
				console.log(`review:${reviews}`);
	            reviewList.innerHTML = '';
				
				const filteredReviews = reviews.filter(review => review.contentId === contentId || review.title === title);
				
				if (filteredReviews.length === 0) {
		                reviewList.innerHTML = '<p>리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>';
		            } else {
		                filteredReviews.forEach(review => {
		                    const reviewDiv = document.createElement('div');
		                    reviewDiv.className = 'review-item';
		                    reviewDiv.innerHTML = `
		                        <p><strong>${review.userId}</strong>: ${review.reviewText}</p>
		                    `;
		                    reviewList.appendChild(reviewDiv);
		                });
		            }
		        })
		        .catch(error => console.error('Error fetching reviews:', error));
}
	
function setupReviewSubmission(contentId, submitReviewButton, reviewInput, reviewList, title) {
    //const submitReviewButton = document.getElementById('submit-review-button');
    //const reviewInput = document.getElementById('review-input');
	const contentType = "restaurantAndHotel";
	console.log("setupReviewSubmission함수가 호출되었습니다.");
    if (!submitReviewButton) return;

    submitReviewButton.addEventListener('click', () => {
        const reviewText = reviewInput.value.trim();
        if (!reviewText) {
            alert('리뷰를 입력해주세요.');
            return;
        }
		const params = new URLSearchParams({
                contentType: contentType,
                reviewText: reviewText,
				title: title
        });

        fetch(`/api/reviews/${contentId}?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reviewText: reviewText }),
        })
            .then(response => response.json())
            .then(() => {
                alert('리뷰가 작성되었습니다.');
                displayReviews(contentId, reviewList); // 리뷰 목록 새로고침
                reviewInput.value = ''; // 입력창 초기화
            })
            .catch(error => {
                console.error('Error submitting review:', error);
                alert('로그인 후 작성가능합니다.');
				window.location.href = "/login";
            });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.infoOverlay = document.getElementById("info-overlay");
    const closeOverlayButton = document.getElementById("close-button");
    const leftPanel = document.querySelector(".left-panel"); // left-panel 요소

    let isOverlayOpen = false; // 오버레이 창 상태 저장
	
    // Event Delegation 방식으로 모든 '정보' 버튼 이벤트 리스너 추가
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
                const overlayContent = window.infoOverlay.querySelector('.info-content > div');
                overlayContent.innerHTML = '';

                const formatDistance = (dist) => {
                    if(!dist)
                        return '정보 없음';
                    
                    const distance = parseFloat(dist);
                    if(distance >= 1000) {
                        return `${(distance / 1000).toFixed(1)}km`;
                    }
                    else {
                        return `${Math.round(distance)}m`;
                    }
                };

                if (overlayCategory === 'hotel') {
                    overlayContent.innerHTML = `
					<div class="container-fluid">
				        <div class="card-header bg-transparent text-primary d-flex justify-content-between align-items-center">
				            <h4 class="card-title mb-0">${overlayData.title}</h4>
				        </div>
				        <img src="${overlayData.firstimage || 'placeholder.jpg'}" alt="${overlayData.title}" class="card-img-top">
				        <div class="card-body">
				            <ul class="list-group list-group-flush mb-3">
				                <li class="list-group-item"><strong>주소:</strong> ${overlayData.addr1 || '정보 없음'}</li>
				                <li class="list-group-item"><strong>전화번호:</strong> ${overlayData.tel || '정보 없음'}</li>
				                <li class="list-group-item"><strong>거리:</strong> ${formatDistance(overlayData.dist)}</li>
				            </ul>
				        </div>
				        <div class="reviews-section">
                            <div class="d-flex flex-column">
				            	<h5 class="section-title overviewTitle">리뷰</h5>
			            		<div id="hotel-review-list" class="review-list">
								</div>
								<textarea id="hotel-review-input" class="review-input"
                                	placeholder="리뷰를 작성해주세요"></textarea>
								<button id="submit-hotel-review-button" class="otherInfoBTN info-button ml-auto">리뷰
                                    작성</button>
				        </div>
				    </div>
                    `;
					const reviewList = document.getElementById('hotel-review-list');
					const submitHotelReviewButton = document.getElementById('submit-hotel-review-button');
				    const HotelreviewInput = document.getElementById('hotel-review-input');
					displayReviews(overlayData.contentid, reviewList, overlayData.title);
					setupReviewSubmission(overlayData.contentid,submitHotelReviewButton,HotelreviewInput,reviewList, overlayData.title);
					
                } else if (overlayCategory === 'restaurant') {
                    overlayContent.innerHTML = `
					<div class="container-fluid">
				        <div class="card-header bg-transparent text-primary d-flex justify-content-between align-items-center">
				            <h4 class="card-title mb-0">${overlayData.title}</h4>
				        </div>
				        <img src="${overlayData.firstimage || 'placeholder.jpg'}" alt="${overlayData.title}" class="card-img-top">
				        <div class="card-body">
				            <ul class="list-group list-group-flush mb-3">
				                <li class="list-group-item"><strong>주소:</strong> ${overlayData.addr1 || '정보 없음'}</li>
				                <li class="list-group-item"><strong>전화번호:</strong> ${overlayData.tel || '정보 없음'}</li>
				                <li class="list-group-item"><strong>거리:</strong> ${formatDistance(overlayData.dist)}</li>
				            </ul>
				        </div>
				        <div class="reviews-section">
                            <div class="d-flex flex-column">
				            	<h5 class="section-title overviewTitle">리뷰</h5>
			            		<div id="restaurant-review-list" class="review-list">
								</div>
								<textarea id="restaurant-review-input" class="review-input"
                                	placeholder="리뷰를 작성해주세요"></textarea>
								<button id="submit-restaurant-review-button" class="otherInfoBTN info-button ml-auto">리뷰
                                    작성</button>
				        </div>
				    </div>
                    `;
					const reviewList = document.getElementById('restaurant-review-list');
					const submitRestaurantReviewButton = document.getElementById('submit-restaurant-review-button');
				    const RestaurantreviewInput = document.getElementById('restaurant-review-input');
					displayReviews(overlayData.contentid, reviewList, overlayData.title);
					
					setupReviewSubmission(overlayData.contentid,submitRestaurantReviewButton,RestaurantreviewInput,reviewList, overlayData.title);
                }

                isOverlayOpen = true;
                const leftPanelWidth = leftPanel.offsetWidth + "px";
                window.infoOverlay.style.width = leftPanelWidth;
                window.infoOverlay.classList.add("active");
            }
            else {
                console.warn('해당 데이터를 찾을 수 없습니다.', overlayCategory, overlayId);
            }
        }
    });

    // 닫기 버튼 클릭 이벤트 (버튼에 infoPanel 닫기 버튼 기능 넣고 싶으면 class에 close-button 추가)
    const closeButtons = document.querySelectorAll(".close-button");

    const closeOverlay = (event) => {
        event.preventDefault();
        console.log('closeOverlay 함수가 호출되었습니다.'); // 디버깅 로그 추가
        isOverlayOpen = false;
        window.infoOverlay.style.width = "0";
        window.infoOverlay.classList.remove("active");
    }

    closeButtons.forEach(button => {
        button.addEventListener("click", closeOverlay);
    });

    // 윈도우 리사이즈 시 left-panel 크기 업데이트에 따라 오버레이 크기 변경
    window.addEventListener("resize", () => {
        if (isOverlayOpen) {
            const leftPanelWidth = leftPanel.offsetWidth + "px";
            window.infoOverlay.style.width = leftPanelWidth; // 동적으로 크기 업데이트
        }
    });
});