var traffic = false;

function trafficInformation() {
    if(traffic == false) {
        map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
        traffic = true;
    }
    else {
        traffic = false;
        map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
    }
   
}