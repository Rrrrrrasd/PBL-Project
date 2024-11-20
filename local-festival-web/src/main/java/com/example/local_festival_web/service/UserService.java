package com.example.local_festival_web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.local_festival_web.model.User;
import com.example.local_festival_web.repository.UserRepository;

@Service
public class UserService {
	@Autowired
    private  UserRepository userRepository;
	
	
	@Autowired
	private PasswordEncoder passwordEncoder;
    

    public User saveUser(User user) {
        // 이메일과 사용자 ID 중복 확인
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("이메일이 이미 사용 중입니다.");
        }
        if (userRepository.existsByUserId(user.getUserId())) {
            throw new IllegalArgumentException("아이디가 이미 사용 중입니다.");
        }

        // 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }
}