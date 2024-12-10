package com.example.local_festival_web.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.local_festival_web.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUserId(String userId);
    boolean existsByEmail(String email);
    
    
    Optional<User> findByUserId(String userId); // userId로 사용자 조회
}