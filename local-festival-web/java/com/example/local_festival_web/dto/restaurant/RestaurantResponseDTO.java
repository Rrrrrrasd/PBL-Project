package com.example.local_festival_web.dto.restaurant;

import java.util.List;

public class RestaurantResponseDTO {
	private List<RestaurantDTO> restaurants;
	private int totalCount;
	
	public List<RestaurantDTO> getRestaurants() {
		return restaurants;
	}
	public void setRestaurants(List<RestaurantDTO> restaurants) {
		this.restaurants = restaurants;
	}
	public int getTotalCount() {
		return totalCount;
	}
	public void setTotalCount(int totalCount) {
		this.totalCount = totalCount;
	}
	
}
