package com.example.local_festival_web.service;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.local_festival_web.model.User;
import com.example.local_festival_web.repository.UserRepository;


@Service
public class CustomUserDetailsService implements UserDetailsService{

	@Autowired
	private final UserRepository userRepository;
	
	public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
	
	@Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
		System.out.println("Attempting to load user by userId: " + userId);
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        return new org.springframework.security.core.userdetails.User(
                user.getUserId(),
                user.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority(user.getRole()))
        );
    }
}
