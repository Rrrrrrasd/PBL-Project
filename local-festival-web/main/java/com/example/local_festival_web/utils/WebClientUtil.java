package com.example.local_festival_web.utils;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class WebClientUtil {
	 public WebClient.Builder configureWebClient(WebClient.Builder builder) {
	        return builder.exchangeStrategies(ExchangeStrategies.builder()
	                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
	                .build());
	 }
}
