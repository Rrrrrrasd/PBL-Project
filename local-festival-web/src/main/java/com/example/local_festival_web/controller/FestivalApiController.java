package com.example.local_festival_web.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.local_festival_web.dto.FestivalItemDTO;
import com.example.local_festival_web.service.FestivalService;

@RestController
@RequestMapping("/api")
public class FestivalApiController {
	@Autowired
	private FestivalService festivalService;
	
	@GetMapping("festivals")
	public List<FestivalItemDTO> getAllFestivals(){
		return festivalService.getAllFestivalInfo();
	}
}
