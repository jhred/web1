LbsApi = {};
LbsApi.Daum = function() {
	this.oMap;
	this.crr_position=null;
	this.defaultLevel = 3;
	this.presentLocationMarker = null;
	this.markerList = new Array();
	this.infowindow_onlyList = new Array();
};

LbsApi.Daum.prototype.mapInit = function(lat, lng) {
	var position = new daum.maps.LatLng(lat, lng);
	//맵 생성
	this.oMap = new daum.maps.Map(document.getElementById('mapContainer'), {
		center: position,
		level: this.defaultLevel
	});
	
	this.geoLocationMarker(lat, lng);
	
	//이벤트 추가 - 드래그가 끝날 때 발생한다.
	daum.maps.event.addListener(this.oMap,"dragend",function(){
		getPositionBoundsSet("DAUM");
	});	
	
	//이벤트 추가 - 확대 수준이 변경되면 발생한다.
	daum.maps.event.addListener(this.oMap,"zoom_changed",function(){
		getPositionBoundsSet("DAUM");
	});
};

//현재 자신의 위치를 알려준다.
LbsApi.Daum.prototype.geoLocationMarker = function(latitude, longitude) {
	createPosition(latitude, longitude);
	
	var icon = new daum.maps.MarkerImage(
			'custom_map_present.png',
			new daum.maps.Size(31, 34),
			new daum.maps.Point(16,34),
			"poly",
			"1,20,1,9,5,2,10,0,21,0,27,3,30,9,30,20,17,33,14,33"
		);
	
	if (this.presentLocationMarker != null) {
		this.presentLocationMarker.setMap(null);
	}
	var position = new daum.maps.LatLng(latitude, longitude);
	this.presentLocationMarker = new daum.maps.Marker({
		  position: position
		, image : icon
	});
	this.presentLocationMarker.setMap(this.oMap);
	this.oMap.setCenter(position);
	this.getPositionBoundsSetValue();
	
};

//현재 보고 있는 영역의 남서쪽 좌표와 북동쪽 좌표값을 폼에 입력한다.
LbsApi.Daum.prototype.getPositionBoundsSetValue = function() {
	document.getElementById('southWestLatitude').value = this.oMap.getBounds().getSouthWest().getLat();
	document.getElementById('southWestLongitude').value = this.oMap.getBounds().getSouthWest().getLng();
	document.getElementById('northEastLatitude').value = this.oMap.getBounds().getNorthEast().getLat();
	document.getElementById('northEastLongitude').value = this.oMap.getBounds().getNorthEast().getLng();
	
	getPositionList("DAUM");
};

//현재 위치의 콘텐트 정보에 대한 마커를 화면에 표시
LbsApi.Daum.prototype.setPositionInfoMarkerView = function(position_info) {
	
	//이전의 마커 및 인포윈도우 삭제
	for (var i = 0; i < this.markerList.length; i++) {
		this.markerList[i].setMap(null);	
	}
	for (var i = 0; i < this.infowindow_onlyList.length; i++) {
		this.infowindow_onlyList[i].close(this.oMap);	
	}
	
	this.markerList = new Array();
	this.infowindow_onlyList = new Array();
	
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
				this.infowindow_onlyList.push(infowindow_only);
	 			infowindow_only.open(this.oMap, oMarker);
			}
			
			this.markerList.push(oMarker);
		}
	}
	
	//마커 생성
	for (var i = 0; i < this.markerList.length; i++) {
		this.markerList[i].setMap(this.oMap);
	}
};


	
//현재 보고 있는 화면에 폴리건을 그린다.
LbsApi.Daum.prototype.setPoligunView = function() {
	var currentMapCenter = this.oMap.getCenter();
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
	polygon.setMap(this.oMap);
};
	
	
//현재 보고 있는 화면에 원을 그린다.
LbsApi.Daum.prototype.setCircleView = function() {
	var currentMapCenter = this.oMap.getCenter();
	//원 그리기
	var circle = new daum.maps.Circle({
		center : new daum.maps.LatLng(currentMapCenter.getLat(), currentMapCenter.getLng()),
		radius : 200,
		strokeWeight : 2,
		strokeColor : "#00ff00"
	});
	circle.setMap(this.oMap);
};
	
//현재 보고 있는 화면에 라인을 그린다.
LbsApi.Daum.prototype.setPolylineView = function() {
	var currentMapCenter = this.oMap.getCenter();
	var arr = [];
	arr.push(new daum.maps.LatLng(currentMapCenter.getLat(), currentMapCenter.getLng()));
	arr.push(new daum.maps.LatLng(currentMapCenter.getLat()+0.002, currentMapCenter.getLng()+0.001));
	//라인 그리기
	var line = new daum.maps.Polyline();
	line.setPath(arr);
	line.setMap(this.oMap);
};

var lbsDaumApi = new LbsApi.Daum();