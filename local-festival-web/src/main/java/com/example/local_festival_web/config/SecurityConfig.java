package com.example.local_festival_web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // H2 콘솔 접근을 위해 CSRF 비활성화
            .headers().frameOptions().disable() // H2 콘솔의 iframe 사용을 허용
            .and()
            .authorizeHttpRequests()
            .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll() // H2 콘솔 요청 허용
            .anyRequest().permitAll(); // 나머지 모든 요청 허용

        return http.build();
    }
}
