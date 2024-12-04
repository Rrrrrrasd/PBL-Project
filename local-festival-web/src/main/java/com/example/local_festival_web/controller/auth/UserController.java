package com.example.local_festival_web.controller.auth;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.local_festival_web.model.Review;
import com.example.local_festival_web.model.User;
import com.example.local_festival_web.repository.ReviewRepository;
import com.example.local_festival_web.repository.UserRepository;
import com.example.local_festival_web.service.UserService;

import jakarta.validation.Valid;

@Controller
public class UserController {
    private final UserService userService;
    
    private final UserRepository userRepository;
    
    private ReviewRepository reviewRepository;

    
    public UserController(UserService userService, UserRepository userRepository, ReviewRepository reviewRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
    }

    @PostMapping("/signup")
    public String registerUser(@Valid @ModelAttribute User user, BindingResult bindingResult, RedirectAttributes redirectAttributes) {
        // 검증 실패 처리
        if (bindingResult.hasErrors()) {
            // 플래시 속성을 사용해 에러 메시지 전달
            redirectAttributes.addFlashAttribute("errorMessage", bindingResult.getAllErrors().get(0).getDefaultMessage());
            return "redirect:/signup";
        }

        try {
            // 사용자 저장
            userService.saveUser(user);
            redirectAttributes.addFlashAttribute("successMessage", "회원가입이 성공적으로 완료되었습니다!");
            return "redirect:/login"; // 로그인 페이지로 리다이렉트
        } catch (Exception e) {
            // 에러 메시지 추가
            redirectAttributes.addFlashAttribute("errorMessage", "회원가입 실패 :"+ e.getMessage());
            return "redirect:/signup";
        }
    }
    
    @GetMapping("/mypage")
    public String myPage(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName(); // 로그인한 사용자 아이디

        // 데이터베이스에서 사용자 정보 조회
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        List<Review> reviews = reviewRepository.findByUserId(user.getUserId());

        // 모델에 사용자 정보 추가
        model.addAttribute("user", user);
        model.addAttribute("reviews", reviews);
        return "view/myPage";
    }
    
    
    @GetMapping("/test")
    public String test(Authentication authentication, Model model) {
        if (authentication != null) {
            model.addAttribute("authName", authentication.getName());
        } else {
            model.addAttribute("authName", "anonymous");
        }
        return "view/test";
    }
    
}