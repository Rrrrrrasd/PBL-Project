package com.example.local_festival_web.utils;

/**
 * 두 지점 간의 거리를 계산하는 유틸리티 클래스입니다.
 */
public class DistanceCalculator {
    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * 두 지점 간의 거리를 킬로미터 단위로 계산합니다.
     *
     * @param lon1 첫 번째 지점의 경도
     * @param lat1 첫 번째 지점의 위도
     * @param lon2 두 번째 지점의 경도
     * @param lat2 두 번째 지점의 위도
     * @return 두 지점 간의 거리 (킬로미터)
     */

    public static double calculateDistance(double lon1, double lat1, double lon2, double lat2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double radLat1 = Math.toRadians(lat1);
        double radLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(radLat1) * Math.cos(radLat2)
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}
