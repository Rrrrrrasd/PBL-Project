package com.example.local_festival_web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import com.example.local_festival_web.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
	//InMemoryUserDetailsManager를 사용하여 인메모리 사용자 추가 -> 이후 DB와 연동예정
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.builder()
            .username("test")  // 사용자 이름
            .password(passwordEncoder().encode("test1"))  // 비밀번호 암호화
            .roles("USER")  // 역할 설정
            .build();

        return new InMemoryUserDetailsManager(user);  // 인메모리에서 사용자 관리
    }
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	
	//사용자 인증 처리
	@Bean
	public DaoAuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userDetailsService());
		authProvider.setPasswordEncoder(passwordEncoder());
		return authProvider;
	}
	
	//인증처리기 등록?
	protected void configure(AuthenticationManagerBuilder auth) {
		auth.authenticationProvider(authenticationProvider());
	}
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		// CSRF 보호 비활성화 (H2 Console에 대해)
        http.csrf(csrf -> csrf.disable())
            // H2 콘솔을 위한 Frame Options 비활성화
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
            // H2 콘솔 및 특정 엔드포인트에 대해 보안 비활성화
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()  // h2-console을 모든 사용자에게 허용
                .requestMatchers("/api/festivals/fetch").permitAll()  // 테스트 엔드포인트도 허용
                .anyRequest().permitAll()
            );

        return http.build();
	}
	
	

}
