package com.example.local_festival_web.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class FestivalController {
	
	@GetMapping("/festival")
	public String getFestivalInfo() {
		return "view/testMainPage2";
	}
}
