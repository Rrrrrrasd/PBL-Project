package com.example.local_festival_web.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.local_festival_web.dto.hotel.HotelDTO;
import com.example.local_festival_web.dto.hotel.HotelResponseDTO;
import com.example.local_festival_web.utils.WebClientUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class HotelService {

    @Autowired
    private WebClient.Builder webClientBuilder;
    
    @Autowired
    private WebClientUtil webClientUtil;
    
    @Value("${api.service.key}")
    private String userKey;

    public HotelResponseDTO  getHotelsByLocation(String mapx, String mapy, int pageNo, int numOfRows) throws JsonMappingException, JsonProcessingException {
        String apiUrl = "https://apis.data.go.kr/B551011/KorService1/locationBasedList1?"
        		+ "serviceKey=" + userKey
        		+ "&numOfRows=" + numOfRows 
        		+ "&pageNo=" + pageNo 
        		+ "&MobileOS=ETC&MobileApp=AppTest&_type=json"
        		+ "&listYN=Y&arrange=S"
        		+ "&mapX=" + mapx
        		+ "&mapY=" + mapy
        		+ "&radius=10000"
        		+ "&contentTypeId=32";

        WebClient webClient = webClientUtil.configureWebClient(webClientBuilder).build();
        
        String response = webClient.get()
                .uri(apiUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // JSON 응답을 HotelDTO 목록으로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode bodyNode = objectMapper.readTree(response).path("response").path("body");
        JsonNode itemsNode = bodyNode.path("items").path("item");

        List<HotelDTO> hotels = new ArrayList<>();
        if (itemsNode.isArray()) {
            for (JsonNode item : itemsNode) {
                HotelDTO hotel = new HotelDTO();
                hotel.setAddr1(item.path("addr1").asText());
                hotel.setAddr2(item.path("addr2").asText());
                hotel.setCat3(item.path("cat3").asText());
                hotel.setContentid(item.path("contentid").asText());
                hotel.setMapx(item.path("mapx").asText());
                hotel.setMapy(item.path("mapy").asText());
                hotel.setTel(item.path("tel").asText());
                hotel.setTitle(item.path("title").asText());
                hotel.setFirstimage(item.path("firstimage").asText());
                hotel.setFirstimage2(item.path("firstimage2").asText());
                hotel.setDist(item.path("dist").asText());
                
                hotels.add(hotel);
            }
        }
        
        // 총 데이터 개수를 추출
        int totalCount = bodyNode.path("totalCount").asInt();

        // 응답 DTO에 데이터 설정
        HotelResponseDTO responseDTO = new HotelResponseDTO();
        responseDTO.setHotels(hotels);
        responseDTO.setTotalCount(totalCount);

        return responseDTO;
    }
}
