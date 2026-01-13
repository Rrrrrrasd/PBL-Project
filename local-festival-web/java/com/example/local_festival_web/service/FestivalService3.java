package com.example.local_festival_web.service;

import com.example.local_festival_web.model.Festival;
import com.example.local_festival_web.repository.FestivalRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Service
public class FestivalService3 {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private FestivalRepository festivalRepository;

    @Value("${api.service.key}")
    private String userKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Logger logger = LoggerFactory.getLogger(FestivalService3.class);

    // 첫 번째 API 요청: 축제 데이터를 가져와 DB에 저장
    public void fetchAndStoreFestivalData(int pageNo, int numOfRows) {
        String apiUrl = "https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=" +
                userKey + "&numOfRows=" + numOfRows + "&pageNo=" + pageNo + "&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A&eventStartDate=1";

        logger.info("Calling first API: " + apiUrl);

        // 버퍼 크기를 10MB로 설정하여 WebClient 생성
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024))  // 10MB 버퍼 크기
                .build();

        WebClient webClient = webClientBuilder.exchangeStrategies(strategies).build();
        String response = webClient.get()
                .uri(apiUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (response != null && !response.isEmpty()) {
            try {
                JsonNode items = objectMapper.readTree(response)
                        .path("response").path("body").path("items").path("item");

                if (items.isArray()) {
                    for (JsonNode item : items) {
                        Festival festival = parseFestivalItem(item);
                        
                        // 존재 여부와 상관없이 저장 (삽입 또는 덮어쓰기)
                        festivalRepository.save(festival);
                        logger.info("Saved/Updated festival with contentId: " + festival.getContentId());

                        // 두 번째 및 세 번째 API 요청을 통해 추가 정보 가져오기
                        fetchAndStoreAdditionalInfo(festival);
                    }
                } else {
                    logger.warn("No items found in the response");
                }
            } catch (IOException e) {
                logger.error("Error parsing JSON response", e);
            }
        } else {
            logger.warn("Received empty response from API");
        }
    }

    // 두 번째 및 세 번째 API 요청: 추가 정보 가져와 기존 데이터 업데이트
    public void fetchAndStoreAdditionalInfo(Festival festival) {
        String secondApiUrl = "https://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=" +
                userKey + "&MobileOS=ETC&MobileApp=AppTest&_type=json&contentId=" + festival.getContentId() + "&contentTypeId=15&defaultYN=Y&firstImageYN=N&areacodeYN=N&catcodeYN=N&addrinfoYN=N&mapinfoYN=N&overviewYN=Y&numOfRows=100&pageNo=1";

        String thirdApiUrl = "https://apis.data.go.kr/B551011/KorService1/detailIntro1?serviceKey=" +
                userKey + "&MobileOS=ETC&MobileApp=AppTest&_type=json&contentId=" + festival.getContentId() + "&contentTypeId=15&numOfRows=100&pageNo=1";

        logger.info("Calling second API: " + secondApiUrl);
        logger.info("Calling third API: " + thirdApiUrl);
        WebClient webClient = webClientBuilder.build();

        // 두 번째 API 요청
        String secondResponse = webClient.get()
                .uri(secondApiUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // 세 번째 API 요청
        String thirdResponse = webClient.get()
                .uri(thirdApiUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        try {
            if (secondResponse != null && !secondResponse.isEmpty()) {
                JsonNode secondItems = objectMapper.readTree(secondResponse)
                        .path("response").path("body").path("items").path("item");

                if (secondItems.isArray()) {
                    for (JsonNode item : secondItems) {
                        if (item.has("homepage")) festival.setHomepage(item.get("homepage").asText());
                        if (item.has("overview")) festival.setOverview(item.get("overview").asText());
                    }
                } else {
                    logger.warn("No items found in second API response");
                }
            }

            if (thirdResponse != null && !thirdResponse.isEmpty()) {
                JsonNode thirdItems = objectMapper.readTree(thirdResponse)
                        .path("response").path("body").path("items").path("item");

                if (thirdItems.isArray()) {
                    for (JsonNode item : thirdItems) {
                        if (item.has("usetimefestival")) festival.setUsetimefestival(item.get("usetimefestival").asText());
                        if (item.has("playtime")) festival.setPlaytime(item.get("playtime").asText());
                        if (item.has("sponsor1")) festival.setSponsor1(item.get("sponsor1").asText());
                        if (item.has("sponsor1tel")) festival.setSponsor1tel(item.get("sponsor1tel").asText());
                    }
                } else {
                    logger.warn("No items found in third API response");
                }
            }

            // 업데이트된 festival 엔티티를 다시 저장
            festivalRepository.save(festival);
            logger.info("Updated festival data with contentId: " + festival.getContentId());

        } catch (IOException e) {
            logger.error("Error parsing JSON response for additional info", e);
        }
    }

    // 개별 축제 데이터를 파싱하여 Festival 객체로 변환
    private Festival parseFestivalItem(JsonNode item) {
        Festival festival = new Festival();

        // 필드가 응답에 포함되어 있는지 확인하고 값을 설정
        if (item.has("contentid")) festival.setContentId(item.get("contentid").asText());
        if (item.has("title")) festival.setTitle(item.get("title").asText());
        if (item.has("eventstartdate")) festival.setEventstartdate(item.get("eventstartdate").asText());
        if (item.has("eventenddate")) festival.setEventenddate(item.get("eventenddate").asText());
        if (item.has("addr1")) festival.setAddr1(item.get("addr1").asText());
        if (item.has("addr2")) festival.setAddr2(item.get("addr2").asText());
        if (item.has("cat1")) festival.setCat1(item.get("cat1").asText());
        if (item.has("cat2")) festival.setCat2(item.get("cat2").asText());
        if (item.has("cat3")) festival.setCat3(item.get("cat3").asText());
        if (item.has("contenttypeid")) festival.setContenttypeid(item.get("contenttypeid").asText());
        if (item.has("mapx")) festival.setMapx(item.get("mapx").asText());
        if (item.has("mapy")) festival.setMapy(item.get("mapy").asText());
        if (item.has("mlevel")) festival.setMlevel(item.get("mlevel").asText());
        if (item.has("firstimage2")) festival.setFirstimage2(item.get("firstimage2").asText());

        logger.info("Parsed festival: " + festival.getContentId() + ", title: " + festival.getTitle());

        return festival;
    }
}
