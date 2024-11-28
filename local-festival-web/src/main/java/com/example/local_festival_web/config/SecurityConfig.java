package com.example.local_festival_web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.example.local_festival_web.service.CustomUserDetailsService;

@Configuration
public class SecurityConfig {

//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//            .csrf().disable() // H2 콘솔 접근을 위해 CSRF 비활성화
//            .headers().frameOptions().disable() // H2 콘솔의 iframe 사용을 허용
//            .and()
//            .authorizeHttpRequests()
//            .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll() // H2 콘솔 요청 허용
//            .anyRequest().permitAll(); // 나머지 모든 요청 허용
//
//        return http.build();
//    }
	
	private final CustomUserDetailsService customUserDetailsService;
	
	public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }
    
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(customUserDetailsService)
                .passwordEncoder(passwordEncoder())
                .and()
                .build();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // CSRF 방지 기능 비활성화
            .headers().frameOptions().disable() // H2 콘솔 접근을 위해 iframe 사용 허용
            .and()
            .authorizeHttpRequests()
                // 인증 없이 접근을 허용할 특정 경로들
                .requestMatchers(
                	"/image/**",
                	"/api/reviews/**",    // 리뷰 관련 API 경로"
                    "/api/festivals/**", // 축제 관련 API 경로
                    "/festival",         // 축제 정보 페이지
                    "/login",            // 로그인 페이지
                    "/signup",           // 회원가입 페이지
                    "/css/**",           // CSS 파일 경로
                    "/js/**",            // JavaScript 파일 경로
                    "/h2-console/**",    // H2 데이터베이스 콘솔
                    "/"                  // 루트 경로
                ).permitAll() // 위 경로들에 대한 접근은 인증 없이 허용
                // 인증된 사용자만 접근 가능한 경로 설정
                .requestMatchers("/mypage").authenticated() // 마이페이지는 인증된 사용자만 접근 가능
                // 그 외의 모든 요청은 인증 필요
                .anyRequest().authenticated()
            .and()
            .anonymous()
            .and()
            .formLogin()
                .loginPage("/login") // 사용자 정의 로그인 페이지
                .defaultSuccessUrl("/festival", true) // 로그인 성공 후 리다이렉트될 경로
                .failureUrl("/login?error=true") // 로그인 실패 시 리다이렉트될 경로
                .usernameParameter("userId") // 로그인 폼에서 사용되는 사용자 아이디의 파라미터 이름
                .passwordParameter("password") // 로그인 폼에서 사용되는 비밀번호의 파라미터 이름
            .and()
            .logout()
                .logoutUrl("/logout") // 로그아웃 요청을 처리할 URL
                .logoutSuccessUrl("/festival") // 로그아웃 성공 후 리다이렉트될 경로
                .invalidateHttpSession(true) // 세션 무효화
                .deleteCookies("JSESSIONID") // JSESSIONID 쿠키 삭제
                .permitAll(); // 로그아웃은 인증 없이도 요청 가능

        return http.build();
    }
}
