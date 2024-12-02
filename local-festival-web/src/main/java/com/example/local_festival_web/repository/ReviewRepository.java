package com.example.local_festival_web.repository;

import com.example.local_festival_web.model.Review;
import com.example.local_festival_web.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByContentId(String contentId); // contentId로 리뷰 검색
    List<Review> findByUserId(String userId);
}
