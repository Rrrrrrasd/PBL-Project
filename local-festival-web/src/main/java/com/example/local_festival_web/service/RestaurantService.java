package com.example.local_festival_web.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.local_festival_web.dto.restaurant.RestaurantDTO;
import com.example.local_festival_web.dto.restaurant.RestaurantResponseDTO;
import com.example.local_festival_web.utils.WebClientUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;

@Service
public class RestaurantService {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private WebClientUtil webClientUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${api.service.key}")
    private String userKey;

    public RestaurantResponseDTO getRestaurantsByLocation(String mapx, String mapy, int pageNo, int numOfRows) throws Exception {
        String apiUrl = "https://apis.data.go.kr/B551011/KorService1/locationBasedList1"
        		+ "?serviceKey=" + userKey
        		+ "&numOfRows=" + numOfRows
        		+ "&pageNo=" + pageNo
        		+ "&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=S"
        		+ "&mapX=" + mapx
        		+ "&mapY=" + mapy
        		+ "&radius=10000"
        		+ "&contentTypeId=39";

        WebClient webClient = webClientUtil.configureWebClient(webClientBuilder).build();
        String response = webClient.get().uri(apiUrl).retrieve().bodyToMono(String.class).block();

        // Parse JSON response
        JsonNode bodyNode = objectMapper.readTree(response).path("response").path("body");
        JsonNode itemsNode = bodyNode.path("items").path("item");

        List<RestaurantDTO> restaurants = new ArrayList<>();
        if (itemsNode.isArray()) {
            for (JsonNode item : itemsNode) {
                RestaurantDTO restaurant = new RestaurantDTO();
                restaurant.setAddr1(item.path("addr1").asText());
                restaurant.setAddr2(item.path("addr2").asText());
                restaurant.setAddr2(item.path("cat3").asText());
                restaurant.setAddr2(item.path("contentid").asText());
                restaurant.setAddr2(item.path("mlevel").asText());
                restaurant.setTel(item.path("tel").asText());
                restaurant.setTitle(item.path("title").asText());
                restaurant.setFirstimage(item.path("firstimage").asText());
                restaurant.setFirstimage2(item.path("firstimage2").asText());
                restaurant.setDist(item.path("dist").asText());
                restaurant.setMapx(item.path("mapx").asText());
                restaurant.setMapy(item.path("mapy").asText());
                restaurants.add(restaurant);
            }
        }

        int totalCount = bodyNode.path("totalCount").asInt();

        //int totalCount = bodyNode.path("totalCount").asInt();
        RestaurantResponseDTO responseDTO = new RestaurantResponseDTO();
        responseDTO.setRestaurants(restaurants);
        responseDTO.setTotalCount(totalCount); 

        return responseDTO;
    }
}
