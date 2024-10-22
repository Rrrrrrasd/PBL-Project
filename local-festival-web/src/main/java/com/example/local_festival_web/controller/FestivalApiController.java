package com.example.local_festival_web.controller;

import com.example.local_festival_web.dto.FestivalDTO;
import com.example.local_festival_web.model.Festival;
import com.example.local_festival_web.service.FestivalService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/festivals")
public class FestivalApiController {

    @Autowired
    private FestivalService festivalService;

    // 전체 축제 데이터를 API에서 가져와서 DB에 저장하는 엔드포인트
    @PostMapping("/fetch")
    public String fetchAndStoreFestivals() {
        try {
            // 서비스 계층에서 축제 데이터를 가져오고 저장하는 메서드 호출
            festivalService.fetchAndStoreFestivalData(200, 7);
            return "Festival data has been successfully fetched and stored!";
        } catch (Exception e) {
            // 에러 발생 시 메시지 반환
            return "Failed to fetch and store festival data: " + e.getMessage();
        }
    }
    
    @GetMapping("/all")
    public List<Festival> getAllFestivals() {
        // 모든 축제 데이터를 가져와서 JSON으로 반환
        return festivalService.getAllFestivals();
    }
    

}
