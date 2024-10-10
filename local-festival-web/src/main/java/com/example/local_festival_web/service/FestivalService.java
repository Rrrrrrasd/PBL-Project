package com.example.local_festival_web.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.example.local_festival_web.dto.FestivalItemDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;


@Service
public class FestivalService {
    
	@Autowired
    private WebClient.Builder webClientBuilder; // WebClient 사용
	
	@Value("${api.service.key}")
	private String userKey;
	
	private final ObjectMapper objectMapper = new ObjectMapper(); // ObjectMapper를 재사용
	
	//현재 날짜를 가져오는메서드
	private String getCurrentDateFormatted() {
        LocalDate currentDate = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        return currentDate.format(formatter);
    }
	
	 // JSON 응답을 DTO 리스트로 변환하는 메서드
    private List<FestivalItemDTO> parseFestivalResponse(String response) throws JsonProcessingException {
        Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
        Map<String, Object> responseBody = (Map<String, Object>) responseMap.get("response");
        Map<String, Object> body = (Map<String, Object>) responseBody.get("body");
        Map<String, Object> items = (Map<String, Object>) body.get("items");
        List<Map<String, Object>> festivalList = (List<Map<String, Object>>) items.get("item");

        // DTO로 변환
        return festivalList.stream()
                .map(festival -> objectMapper.convertValue(festival, FestivalItemDTO.class))
                .collect(Collectors.toList());
    }
	
	
	

    public List<FestivalItemDTO> getAllFestivalInfo(){
    	
    	String eventStartDate = getCurrentDateFormatted();
    	int numOfRows = 100; // 한 번에 가져올 데이터 수
        int currentPage = 1;  // 첫 번째 페이지
        int totalCount = 0;
    	
        List<FestivalItemDTO> allFestivals = new ArrayList<>(); // 모든 데이터를 저장할 리스트
        
    	try {
    		// WebClient를 통해 API 호출
            WebClient webClient = webClientBuilder.build();
            do {
            	//외부 url
            	String apiUrl = "https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=" +
            	userKey + "&numOfRows=" +
            	numOfRows + "&pageNo=" + currentPage +
            	"&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A&eventStartDate="+ eventStartDate;
            	
            	String response = webClient.get()
            			.uri(apiUrl)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();//동기로 대기
            	
            	//첫 번째 페이지에서 전체 데이터의 개수를 가져옴
            	if (totalCount == 0) {
                    Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
                    Map<String, Object> responseBody = (Map<String, Object>) responseMap.get("response");
                    Map<String, Object> body = (Map<String, Object>) responseBody.get("body");
                    totalCount = (int) body.get("totalCount"); // 전체 데이터 개수
                }
            	
            	List<FestivalItemDTO> festivals = parseFestivalResponse(response);
            	allFestivals.addAll(festivals);
            	
            	currentPage++;//다음페이지로    	
            }while(allFestivals.size() < totalCount);//모든데이터를 가져올 때까지 반복
            
    	} catch (JsonProcessingException  e) {
    		System.err.println("Error message: " + e.getMessage());
    		throw new RuntimeException("JSON 파싱 오류");
    	} catch(WebClientResponseException e) {
    		//HTTP 오류 처리
    		System.err.println("API 호출 중 HTTP 오류 발생: " + e.getStatusCode());
            throw new RuntimeException("API 호출 실패: " + e.getMessage());
    	}
    	return allFestivals; // 모든 데이터 반환
    }
}