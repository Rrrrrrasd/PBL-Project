package com.example.local_festival_web.controller.view;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class FestivalController {
	
	@GetMapping("/festival")
	public String getFestivalInfo(Model model) {
		// 인증 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // 인증 정보를 모델에 추가
        model.addAttribute("authentication", authentication);
		return "view/testMainPage2";
	}
	
}
