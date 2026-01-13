package com.example.local_festival_web.service;

import com.example.local_festival_web.model.Review;
import com.example.local_festival_web.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getReviewsByContentId(String contentId) {
        return reviewRepository.findByContentId(contentId);
    }

    public Review addReview(Review review) {
        return reviewRepository.save(review);
    }
}
