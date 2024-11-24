package com.example.local_festival_web.controller.api;

import com.example.local_festival_web.model.Review;
import com.example.local_festival_web.repository.ReviewRepository;
import com.example.local_festival_web.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewApiController {

    private final ReviewService reviewService;
    
    private final ReviewRepository reviewRepository;

    public ReviewApiController(ReviewService reviewService, ReviewRepository reviewRepository) {
        this.reviewService = reviewService;
        this.reviewRepository = reviewRepository;
    }
    
    

 // 리뷰 조회를 위한 GET 매핑
    @GetMapping("/{contentId}")
    public ResponseEntity<List<Review>> getReviewsByContentId(@PathVariable String contentId) {
        List<Review> reviews = reviewRepository.findByContentId(contentId);
        return ResponseEntity.ok(reviews);
    }

    // 리뷰 작성
    @PostMapping("/{contentId}")
    public ResponseEntity<Review> addReview(
            @PathVariable String contentId,
            @RequestBody String reviewText,
            Authentication authentication) {
        String userId = authentication.getName(); // 로그인한 사용자 ID 가져오기
        Review review = new Review();
        review.setContentId(contentId);
        review.setUserId(userId);
        review.setReviewText(reviewText);
        Review savedReview = reviewService.addReview(review);
        return ResponseEntity.ok(savedReview);
    }
}
