package com.example.local_festival_web.dto.hotel;

import java.util.List;

public class HotelResponseDTO {
	private List<HotelDTO> hotels;
    private int totalCount;

    public List<HotelDTO> getHotels() {
        return hotels;
    }

    public void setHotels(List<HotelDTO> hotels) {
        this.hotels = hotels;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
}
