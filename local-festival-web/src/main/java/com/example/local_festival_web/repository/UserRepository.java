package com.example.local_festival_web.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.local_festival_web.model.User;

public interface UserRepository extends JpaRepository<User, Long>{
	User findByUsername(String username);
}
