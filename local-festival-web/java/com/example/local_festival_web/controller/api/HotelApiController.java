package com.example.local_festival_web.controller.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.local_festival_web.dto.hotel.HotelResponseDTO;
import com.example.local_festival_web.service.HotelService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

@RestController
@RequestMapping("/api/festivals")
public class HotelApiController {

    @Autowired
    private HotelService hotelService;

 // 특정 페이지의 숙소 데이터를 가져오는 엔드포인트 (더보기 기능)
    @GetMapping("/hotels/more")
    public HotelResponseDTO fetchMoreHotels(
            @RequestParam("mapx") String mapx,
            @RequestParam("mapy") String mapy,
            @RequestParam("pageNo") int pageNo,
            @RequestParam("numOfRows") int numOfRows) throws JsonMappingException, JsonProcessingException {
        return hotelService.getHotelsByLocation(mapx, mapy, pageNo, numOfRows);
    }
}
