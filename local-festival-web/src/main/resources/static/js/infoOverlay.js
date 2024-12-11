function displayReviews(contentId, reviewList, title) {
		console.log("패치수행완료");
	    fetch(`/api/reviews/${contentId}`)
	        .then(response => response.json())
	        .then(reviews => {
				
				
	            reviewList.innerHTML = '';
				
				const filteredReviews = reviews.filter(review => review.title === title || review.contentId === contentId);
				console.log(`filteredReviews:${filteredReviews}`);
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
                displayReviews(contentId, reviewList, title); // 리뷰 목록 새로고침
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
                        <h3>${overlayData.title}</h3>
                        <img src="${overlayData.firstimage}" alt="${overlayData.title}" class="info-image">
                        <p><strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                            <path
                                d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                        </svg> 주소 </strong> ${overlayData.addr1 || '주소 정보 없음'}</p>
                        <p><strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16">
  							<path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
							</svg> 전화번호 </strong> ${overlayData.tel || '전화번호 정보 없음'}</p>
                        <p><strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-fill" viewBox="0 0 16 16">
  							<path fill-rule="evenodd" d="M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.3 1.3 0 0 0-.37.265.3.3 0 0 0-.057.09V14l.002.008.016.033a.6.6 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.6.6 0 0 0 .146-.15l.015-.033L12 14v-.004a.3.3 0 0 0-.057-.09 1.3 1.3 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465s-2.462-.172-3.34-.465c-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411"/>
							</svg> 축제로부터 거리 </strong> ${formatDistance(overlayData.dist)}</p>
						<hr/>
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
	                        <h3>${overlayData.title}</h3>
	                        <img src="${overlayData.firstimage}" alt="${overlayData.title}" class="info-image">
	                        <p><strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                                <path
                                    d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                            </svg> 주소 </strong> ${overlayData.addr1 || '주소 정보 없음'}</p>
	                        <p><strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16">
							  <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
							</svg> 전화번호 </strong> ${overlayData.tel || '전화번호 정보 없음'}</p>
	                        <p><strong><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-fill" viewBox="0 0 16 16">
							  <path fill-rule="evenodd" d="M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.3 1.3 0 0 0-.37.265.3.3 0 0 0-.057.09V14l.002.008.016.033a.6.6 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.6.6 0 0 0 .146-.15l.015-.033L12 14v-.004a.3.3 0 0 0-.057-.09 1.3 1.3 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465s-2.462-.172-3.34-.465c-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411"/>
							</svg> 축제로부터 거리 </strong> ${formatDistance(overlayData.dist)}</p>
							<hr/>
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