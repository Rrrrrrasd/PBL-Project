package com.example.local_festival_web.dto.hotel;

public class HotelDTO {
	private String addr1;
    private String addr2;
    private String tel;
    private String title;
    private String firstimage;    
    private String firstimage2;   
    private String dist;
    
	public String getAddr1() {
		return addr1;
	}
	public String getDist() {
		return dist;
	}
	public void setDist(String dist) {
		this.dist = dist;
	}
	public void setAddr1(String addr1) {
		this.addr1 = addr1;
	}
	public String getAddr2() {
		return addr2;
	}
	public void setAddr2(String addr2) {
		this.addr2 = addr2;
	}
	public String getTel() {
		return tel;
	}
	public void setTel(String tel) {
		this.tel = tel;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getFirstimage() {
		return firstimage;
	}
	public void setFirstimage(String firstimage) {
		this.firstimage = firstimage;
	}
	public String getFirstimage2() {
		return firstimage2;
	}
	public void setFirstimage2(String firstimage2) {
		this.firstimage2 = firstimage2;
	}
    
    
}
