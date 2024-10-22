package com.example.local_festival_web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class FestivalController {
	
	@GetMapping("/festival")
	public String getFestivalInfo(Model model) {
		return "view/testMainPage2";
	}
}
