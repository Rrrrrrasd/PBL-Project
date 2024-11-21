package com.example.local_festival_web.service;

import java.util.List;
import java.util.Comparator; // 수정
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.local_festival_web.utils.DistanceCalculator; // 수정
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

    public RestaurantResponseDTO getRestaurantsByLocation(String mapx, String mapy, int pageNo, int numOfRows)
            throws Exception {
        String apiUrl = "https://apis.data.go.kr/B551011/KorService1/locationBasedList1"
                + "?serviceKey=" + userKey
                + "&numOfRows=" + numOfRows
                + "&pageNo=" + pageNo
                + "&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A"
                + "&mapX=" + mapx
                + "&mapY=" + mapy
                + "&radius=5000"
                + "&contentTypeId=39";

        WebClient webClient = webClientUtil.configureWebClient(webClientBuilder).build();
        String response = webClient.get().uri(apiUrl).retrieve().bodyToMono(String.class).block();

        // Parse JSON response
        JsonNode bodyNode = objectMapper.readTree(response).path("response").path("body");
        JsonNode itemsNode = bodyNode.path("items").path("item");

        // 수정
        List<RestaurantDTO> restaurants = new ArrayList<>();
        if (itemsNode.isArray()) {
            for (JsonNode item : itemsNode) {
                RestaurantDTO restaurant = new RestaurantDTO();
                restaurant.setAddr1(item.path("addr1").asText());
                restaurant.setAddr2(item.path("addr2").asText());
                restaurant.setTel(item.path("tel").asText());
                restaurant.setTitle(item.path("title").asText());
                restaurant.setFirstimage(item.path("firstimage").asText());
                restaurant.setFirstimage2(item.path("firstimage2").asText());
                restaurant.setDist(item.path("dist").asText());
                restaurant.setMapx(item.path("mapx").asText());
                restaurant.setMapy(item.path("mapy").asText());
                // restaurants.add(restaurant);

                // 수정
                double festivalLon = Double.parseDouble(mapx);
                double festivalLat = Double.parseDouble(mapy);
                double restaurantLon = Double.parseDouble(restaurant.getMapx());
                double restaurantLat = Double.parseDouble(restaurant.getMapy());

                double distance = DistanceCalculator.calculateDistance(festivalLon, festivalLat, restaurantLon,
                        restaurantLat);
                restaurant.setDistanceFromFestival(distance);

                if (distance <= 5.0) {
                    restaurants.add(restaurant);
                }
            }
        }

        // 수정
        restaurants.sort(Comparator.comparingDouble(RestaurantDTO::getDistanceFromFestival));

        int totalCount = bodyNode.path("totalCount").asInt();
        RestaurantResponseDTO responseDTO = new RestaurantResponseDTO();
        responseDTO.setRestaurants(restaurants);
        responseDTO.setTotalCount(restaurants.size()); // 수정

        return responseDTO;
    }
}
