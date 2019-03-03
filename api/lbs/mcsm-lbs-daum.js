//맵 전역변수
var oMap = null;
//새로운 위치 전역변수
var crr_position=null;
var defaultLevel = 3;
var presentLocationMarker=null;
var markerList = new Array();
var infowindow_onlyList = new Array();

function mapInit(lat, lng) {
	
	var position = new daum.maps.LatLng(lat, lng);
	//맵 생성
	oMap = new daum.maps.Map(document.getElementById('mapContainer'), {
		center: position,
		level: defaultLevel
	});
	
	//getPositionBoundsSetValue(oMap);
	geoLocationMarker(lat, lng);
	
	//이벤트 추가 - 드래그가 끝날 때 발생한다.
	daum.maps.event.addListener(oMap,"dragend",function(){
		getPositionBoundsSetValue(oMap);
	});	
	
	//이벤트 추가 - 확대 수준이 변경되면 발생한다.
	daum.maps.event.addListener(oMap,"zoom_changed",function(){
		getPositionBoundsSetValue(oMap);
	});	
}

// 현재 자신의 위치를 알려준다.
function geoLocationMarker(latitude, longitude) {
	createPosition(latitude, longitude);
	
	var icon = new daum.maps.MarkerImage(
			'custom_map_present.png',
			new daum.maps.Size(31, 34),
			new daum.maps.Point(16,34),
			"poly",
			"1,20,1,9,5,2,10,0,21,0,27,3,30,9,30,20,17,33,14,33"
		);
	
	if (presentLocationMarker != null) {
		presentLocationMarker.setMap(null);
	}
	var position = new daum.maps.LatLng(latitude, longitude);
	presentLocationMarker = new daum.maps.Marker({
		  position: position
		, image : icon
	});
	presentLocationMarker.setMap(oMap);
	oMap.setCenter(position);
	getPositionBoundsSetValue(oMap);
}

//현재 보고 있는 영역의 남서쪽 좌표와 북동쪽 좌표값을 폼에 입력한다.
function getPositionBoundsSetValue(map) {
	document.getElementById('southWestLatitude').value = map.getBounds().getSouthWest().getLat();
	document.getElementById('southWestLongitude').value = map.getBounds().getSouthWest().getLng();
	document.getElementById('northEastLatitude').value = map.getBounds().getNorthEast().getLat();
	document.getElementById('northEastLongitude').value = map.getBounds().getNorthEast().getLng();
	
	getPositionList();
}

//현재 위치의 콘텐트 정보에 대한 마커를 화면에 표시
function setPositionInfoMarkerView(position_info) {
	
	//이전의 마커 및 인포윈도우 삭제
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].setMap(null);	
	}
	for (var i = 0; i < infowindow_onlyList.length; i++) {
		infowindow_onlyList[i].close(oMap);	
	}
	
	markerList = new Array();
	infowindow_onlyList = new Array();
	
	if ( position_info != null ) {
		for (var i = 0; i < position_info.length; i++) {
			var obj = position_info[i];
			var markerPosition = new daum.maps.LatLng(obj.latitude, obj.longitude);
			
			//마커생성
			var oMarker = new daum.maps.Marker({
				position: markerPosition
			});
			
			if (obj.advertising != null || obj.advertising != '') {
				var infowindow_only = new daum.maps.InfoWindow({
	 			    position: markerPosition,
	 			    content: obj.advertising
	 			});
				infowindow_onlyList.push(infowindow_only);
	 			infowindow_only.open(oMap, oMarker);
			}
			
			markerList.push(oMarker);
		}
	}
	
	//마커 생성
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].setMap(oMap);
	}
}

//현재 보고 있는 화면에 폴리건을 그린다.
function setPoligunView() {
	var currentMapCenter = oMap.getCenter();
	//폴리곤 그리기
	var arr = [];
	arr.push(new daum.maps.LatLng(currentMapCenter.getLat(), currentMapCenter.getLng()));
 	arr.push(new daum.maps.LatLng(currentMapCenter.getLat()+0.001, currentMapCenter.getLng()+0.001));
 	arr.push(new daum.maps.LatLng(currentMapCenter.getLat()-0.001, currentMapCenter.getLng()+0.002));
 	arr.push(new daum.maps.LatLng(currentMapCenter.getLat(), currentMapCenter.getLng()-0.0012));
	
	var polygon = new daum.maps.Polygon({
		strokeWeight : 3,
		strokeColor : "#1833e5",
		strokeOpacity : 0.6,
		fillColor : "#1833e5",
		fillOpacity : 0.2
	});
	polygon.setPath(arr);
	polygon.setMap(oMap);
}


//현재 보고 있는 화면에 원을 그린다.
function setCircleView() {
	var currentMapCenter = oMap.getCenter();
	//원 그리기
	var circle = new daum.maps.Circle({
		center : new daum.maps.LatLng(currentMapCenter.getLat(), currentMapCenter.getLng()),
		radius : 200,
		strokeWeight : 2,
		strokeColor : "#00ff00"
	});
	circle.setMap(oMap);
}

//현재 보고 있는 화면에 라인을 그린다.
function setPolylineView() {
	var currentMapCenter = oMap.getCenter();
	var arr = [];
	arr.push(new daum.maps.LatLng(currentMapCenter.getLat(), currentMapCenter.getLng()));
 	arr.push(new daum.maps.LatLng(currentMapCenter.getLat()+0.002, currentMapCenter.getLng()+0.001));
	//라인 그리기
	var line = new daum.maps.Polyline();
	line.setPath(arr);
	line.setMap(oMap);
}