LbsApi = {};
LbsApi.Google = function() {
	this.oMap;
	this.crr_position=null;
	this.defaultLevel = 18;
	this.presentLocationMarker = null;
	this.markerList = new Array();
	this.infowindow_onlyList = new Array();
};

LbsApi.Google.prototype.mapInit = function(lat, lng) {
	var position = new google.maps.LatLng(lat, lng);
	//맵 생성
	this.oMap = new google.maps.Map(document.getElementById('mapContainer'), {
		center: position,
		zoom: this.defaultLevel,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	
	//이벤트 추가 - 드래그가 끝날 때 발생한다.
	google.maps.event.addListener(this.oMap,"dragend",function(){
		getPositionBoundsSet("GOOGLE");
	});	
	
	//이벤트 추가 - 확대 수준이 변경되면 발생한다.
	google.maps.event.addListener(this.oMap,"zoom_changed",function(){
		getPositionBoundsSet("GOOGLE");
	});
	
	this.geoLocationMarker(lat, lng);
};

//현재 자신의 위치를 알려준다.
LbsApi.Google.prototype.geoLocationMarker = function(latitude, longitude) {
	createPosition(latitude, longitude);
	
	if (this.presentLocationMarker != null) {
		this.presentLocationMarker.setMap(null);
	}
	var position = new google.maps.LatLng(latitude, longitude);
	this.presentLocationMarker = new google.maps.Marker({
		  position: position
		, icon : 'custom_map_present.png'
		});
	this.presentLocationMarker.setMap(this.oMap);
	this.oMap.setCenter(position);
	this.getPositionBoundsSetValue();
};

//현재 보고 있는 영역의 남서쪽 좌표와 북동쪽 좌표값을 폼에 입력한다.
LbsApi.Google.prototype.getPositionBoundsSetValue = function() {
	if(null != this.oMap.getBounds()){
		document.getElementById('southWestLatitude').value = this.oMap.getBounds().getSouthWest().lat();
		document.getElementById('southWestLongitude').value = this.oMap.getBounds().getSouthWest().lng();
		document.getElementById('northEastLatitude').value = this.oMap.getBounds().getNorthEast().lat();
		document.getElementById('northEastLongitude').value = this.oMap.getBounds().getNorthEast().lng();
	}
	getPositionList("GOOGLE");
};

//현재 위치의 콘텐트 정보에 대한 마커를 화면에 표시
LbsApi.Google.prototype.setPositionInfoMarkerView = function(position_info) {
		
	//이전의 마커 및 인포윈도우 삭제
	for (var i = 0; i < this.markerList.length; i++) {
		this.markerList[i].setMap(null);	
	}
	
	this.markerList = new Array();
	if ( position_info != null ) {
		for (var i = 0; i < position_info.length; i++) {
			var obj = position_info[i];
			var markerPosition = new google.maps.LatLng(obj.latitude, obj.longitude);
			
			//마커생성
			var oMarker = new google.maps.Marker({
				position: markerPosition
			});
			
			if (obj.advertising != null || obj.advertising != '') {
				var infowindow_only = new google.maps.InfoWindow({
	 			    position: markerPosition,
	 			    content: obj.advertising
	 			});
				this.infowindow_onlyList.push(infowindow_only);
	 			infowindow_only.open(this.oMap, oMarker);
			}
			
			this.markerList.push(oMarker);
			
		}
		
		for (var i = 0; i < this.markerList.length; i++) {
			this.markerList[i].setMap(this.oMap);
		}
	}
};

//현재 보고 있는 화면에 폴리건을 그린다.
LbsApi.Google.prototype.setPoligunView = function() {
	var currentMapCenter = this.oMap.getCenter();
	//폴리곤 그리기
	var arr = [];
	arr.push(new google.maps.LatLng(currentMapCenter.lat(), currentMapCenter.lng()));
 	arr.push(new google.maps.LatLng(currentMapCenter.lat()+0.001, currentMapCenter.lng()+0.001));
 	arr.push(new google.maps.LatLng(currentMapCenter.lat()-0.001, currentMapCenter.lng()+0.002));
 	arr.push(new google.maps.LatLng(currentMapCenter.lat(), currentMapCenter.lng()-0.0012));
	
	var polygon = new google.maps.Polygon({
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
LbsApi.Google.prototype.setCircleView = function() {
		var currentMapCenter = this.oMap.getCenter();
		//원 그리기
		var circle = new google.maps.Circle({
			center : new google.maps.LatLng(currentMapCenter.lat(), currentMapCenter.lng()),
			radius : 200,
			strokeWeight : 2,
			strokeColor : "#00ff00"
		});
		circle.setMap(this.oMap);
	};

//현재 보고 있는 화면에 라인을 그린다.
LbsApi.Google.prototype.setPolylineView = function() {
	var currentMapCenter = this.oMap.getCenter();
	var arr = [];
	arr.push(new google.maps.LatLng(currentMapCenter.lat(), currentMapCenter.lng()));
 	arr.push(new google.maps.LatLng(currentMapCenter.lat()+0.002, currentMapCenter.lng()+0.001));
	//라인 그리기
	var line = new google.maps.Polyline();
	line.setPath(arr);
	line.setMap(this.oMap);
};

var lbsGoogleApi = new LbsApi.Google();
