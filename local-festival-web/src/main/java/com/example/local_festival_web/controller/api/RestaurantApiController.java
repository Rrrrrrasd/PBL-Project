package com.example.local_festival_web.controller.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.local_festival_web.dto.restaurant.RestaurantResponseDTO;
import com.example.local_festival_web.service.RestaurantService;

@RestController
@RequestMapping("/api/festivals")
public class RestaurantApiController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping("/restaurants/more")
    public RestaurantResponseDTO fetchMoreRestaurants(
            @RequestParam("mapx") String mapx,
            @RequestParam("mapy") String mapy,
            @RequestParam("pageNo") int pageNo,
            @RequestParam("numOfRows") int numOfRows) throws Exception {
        return restaurantService.getRestaurantsByLocation(mapx, mapy, pageNo, numOfRows);
    }
}
