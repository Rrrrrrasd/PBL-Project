package com.example.local_festival_web.controller;

import java.util.*;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.local_festival_web.dto.FestivalItemDTO;
import com.example.local_festival_web.service.FestivalService;

@Controller
public class FestivalController {
	@Autowired
	private FestivalService festivalService;
	
	@GetMapping("/festival")
	public String getFestivalInfo(Model model) {
		//데이터를 가져옴
		List<FestivalItemDTO> filteredFestivals = festivalService.getAllFestivalInfo();
		
		model.addAttribute("festivals", filteredFestivals);
		
		return "view/testMainPage2";
	}
}
