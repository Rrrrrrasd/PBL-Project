package com.example.local_festival_web.controller.login;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {
    
	@GetMapping("/login")
    public String login() {
        return "view/login/login"; 
    }
	
	@GetMapping("/findById")
    public String findIdPage() {
        return "view/login/findById"; 
    }
	
	@GetMapping("/findByPw")
    public String findPasswordPage() {
        return "view/login/findByPw"; 
    }
	
	@GetMapping("/signup")
	public String signupPage() {
		return "view/login/signup";
	}
}
