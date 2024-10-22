package com.example.local_festival_web.service;

import com.example.local_festival_web.dto.FestivalDTO;
import com.example.local_festival_web.model.Festival;
import com.example.local_festival_web.repository.FestivalRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class FestivalService {

    @Autowired
    private FestivalRepository festivalRepository;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private ObjectMapper objectMapper;  // JSON 파싱을 위한 ObjectMapper
    
    @Value("${api.service.key}")
    private String userKey;

    // 첫 번째 요청 데이터를 가져오고 저장
    public void fetchAndStoreFestivalData(int numOfRows, int pageNo) throws Exception {
    	String apiUrl = "https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=" +
                userKey + "&numOfRows=" + numOfRows + "&pageNo=" + pageNo + "&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A&eventStartDate=1";
    	
    	System.out.println(apiUrl);
    	
    	// 버퍼 크기를 10MB로 설정하여 WebClient 생성
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024))  // 10MB 버퍼 크기
                .build();
    	
        WebClient webClient = webClientBuilder.exchangeStrategies(strategies).build();
        
        // 첫 번째 API 요청: contentid 포함된 기본 정보 가져오기
        String firstApiResponse = webClient.get()
                .uri(apiUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        
        

        // JSON 데이터를 파싱
        JsonNode items = objectMapper.readTree(firstApiResponse)
                .path("response").path("body").path("items").path("item");

        for (JsonNode item : items) {
            String contentid = item.path("contentid").asText();

            // FestivalDTO 객체에 첫 번째 요청 데이터를 매핑
            FestivalDTO festivalDTO = new FestivalDTO();
            festivalDTO.setContentid(contentid);
            festivalDTO.setTitle(item.path("title").asText());
            festivalDTO.setEventstartdate(item.path("eventstartdate").asText());
            festivalDTO.setEventenddate(item.path("eventenddate").asText());
            festivalDTO.setAddr1(item.path("addr1").asText());
            festivalDTO.setAddr2(item.path("addr2").asText());
            festivalDTO.setCat1(item.path("cat1").asText());
            festivalDTO.setCat2(item.path("cat2").asText());
            festivalDTO.setCat3(item.path("cat3").asText());
            festivalDTO.setContenttypeid(item.path("contenttypeid").asText());
            festivalDTO.setMapx(item.path("mapx").asText());
            festivalDTO.setMapy(item.path("mapy").asText());
            festivalDTO.setMlevel(item.path("mlevel").asText());
            festivalDTO.setFirstimage2(item.path("firstimage2").asText());

            // 데이터가 이미 존재하는지 확인
            Festival festival = festivalRepository.findByContentId(contentid);

            if (festival == null) {
                // 데이터가 없으면 새로 생성
                festival = new Festival();
            }
            
            // Festival 객체에 데이터를 저장
            festival.setContentId(contentid);
            festival.setTitle(festivalDTO.getTitle());
            festival.setEventstartdate(festivalDTO.getEventstartdate());
            festival.setEventenddate(festivalDTO.getEventenddate());
            festival.setAddr1(festivalDTO.getAddr1());
            festival.setAddr2(festivalDTO.getAddr2());
            festival.setCat1(festivalDTO.getCat1());
            festival.setCat2(festivalDTO.getCat2());
            festival.setCat3(festivalDTO.getCat3());
            festival.setContenttypeid(festivalDTO.getContenttypeid());
            festival.setMapx(festivalDTO.getMapx());
            festival.setMapy(festivalDTO.getMapy());
            festival.setMlevel(festivalDTO.getMlevel());
            festival.setFirstimage2(festivalDTO.getFirstimage2());

            // 기본 정보 저장
            festivalRepository.save(festival);

            // 두 번째 및 세 번째 요청 수행하여 추가 정보 저장
            fetchAndUpdateAdditionalData(contentid, festival);
        }
    }

    // 두 번째 및 세 번째 데이터를 contentid를 기준으로 가져와 저장하는 메서드
    private void fetchAndUpdateAdditionalData(String contentid, Festival festival) throws Exception {
    	String secondApiUrl = "https://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=" +
                userKey + "&MobileOS=ETC&MobileApp=AppTest&_type=json&contentId=" + festival.getContentId() + "&contentTypeId=15&defaultYN=Y&firstImageYN=N&areacodeYN=N&catcodeYN=N&addrinfoYN=N&mapinfoYN=N&overviewYN=Y&numOfRows=100&pageNo=1";
        
    	String thirdApiUrl = "https://apis.data.go.kr/B551011/KorService1/detailIntro1?serviceKey=" +
                userKey + "&MobileOS=ETC&MobileApp=AppTest&_type=json&contentId=" + festival.getContentId() + "&contentTypeId=15&numOfRows=100&pageNo=1";
    	
    	// 버퍼 크기를 10MB로 설정하여 WebClient 생성
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024))  // 10MB 버퍼 크기
                .build();
    	
        WebClient webClient = webClientBuilder.exchangeStrategies(strategies).build();
    	
     // 두 번째 API 요청
        String secondApiResponse = webClient.get()
                .uri(secondApiUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        System.out.println("Second API Response: " + secondApiResponse);

     // 두 번째 API 응답 처리
        JsonNode secondItems = objectMapper.readTree(secondApiResponse)
        	    .path("response").path("body").path("items").path("item");

        // 배열 형태이므로 첫 번째 요소를 처리
        if (secondItems.isArray() && secondItems.size() > 0) {
            JsonNode secondItemNode = secondItems.get(0);

            // HTML 태그 제거 (Jsoup 사용)
            String homepage = secondItemNode.path("homepage").asText(null);
            if (homepage != null) {
                homepage = Jsoup.parse(homepage).text();  // HTML 태그 제거
            }

            // 두 번째 API 데이터 업데이트
            festival.setSponsor1(secondItemNode.path("telname").asText(null));  // sponsor1은 telname
            festival.setSponsor1tel(secondItemNode.path("tel").asText(null));   // sponsor1tel은 tel
            festival.setHomepage(homepage);
            festival.setOverview(secondItemNode.path("overview").asText(null));

            System.out.println("Updating Festival after second API: " + festival);
            festivalRepository.save(festival);
        }


        // 세 번째 API 요청
        String thirdApiResponse = webClient.get()
                .uri(thirdApiUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        System.out.println("Third API Response: " + thirdApiResponse);

        JsonNode thirdItems = objectMapper.readTree(thirdApiResponse)
        	    .path("response").path("body").path("items").path("item");

        	// 배열 형태의 첫 번째 요소 처리
        	if (thirdItems.isArray() && thirdItems.size() > 0) {
        	    JsonNode thirdItemNode = thirdItems.get(0);

        	    festival.setUsetimefestival(thirdItemNode.path("usetimefestival").asText(null));
        	    festival.setPlaytime(thirdItemNode.path("playtime").asText(null));

        	    System.out.println("Updating Festival after third API: " + festival);
        	    festivalRepository.save(festival);
        	}

    }

    
    //데이터 가져오는 메서드
    public List<Festival> getAllFestivals() {
        return festivalRepository.findAll();
    }
}
