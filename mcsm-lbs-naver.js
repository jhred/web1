LbsApi = {};
LbsApi.Naver = function() {
	this.oMap;
	this.crr_position=null;
	this.defaultLevel = 11;
	this.presentLocationMarker = null;
	this.markerList = new Array();
	this.infowindow_onlyList = new Array();
	
	this.oSize = new nhn.api.map.Size(28, 37);
	this.oOffset = new nhn.api.map.Size(14, 37);
	this.oIcon = new nhn.api.map.Icon('http://static.naver.com/maps2/icons/pin_spot2.png', this.oSize, this.oOffset);
	
	nhn.api.map.setDefaultPoint('LatLng');  // - 지도에서 기본적으로 사용하는 좌표계를 설정합니다.
};

LbsApi.Naver.prototype.mapInit = function(lat, lng) {
	var count = document.getElementById('mapContainer').childNodes.length
	if(count != 0){
		document.getElementById('mapContainer').innerHTML = "";
	}
	var position = new nhn.api.map.LatLng(lat, lng);
	//맵 생성
	this.oMap = new nhn.api.map.Map(document.getElementById('mapContainer'), {
		point : position,
		zoom: this.defaultLevel,
		mapMode : 0
	});
	
	this.geoLocationMarker(lat, lng);
	
	this.oMap.attach("move", function(oEvent){
		getPositionBoundsSet("NAVER");
    }); // - 이벤트 추가. 지도에서의 이벤트 추가는 attach를 통해 이루어진다.
    
	this.oMap.attach("zoom", function(oEvent){
		getPositionBoundsSet("NAVER");
    }); // - 이벤트 추가. 지도에서의 이벤트 추가는 attach를 통해 이루어진다.
};

//현재 자신의 위치를 알려준다.
LbsApi.Naver.prototype.geoLocationMarker = function(latitude, longitude) {
	createPosition(latitude, longitude);
	
	if (this.presentLocationMarker != null) {
		this.oMap.removeOverlay(this.presentLocationMarker);
	}
	
	var size = new nhn.api.map.Size(28, 28);
	var offset = new nhn.api.map.Size(28, 28);
	var icon = new nhn.api.map.Icon('custom_map_present.png', size, offset);
	var position = new nhn.api.map.LatLng(latitude, longitude);
	
	this.presentLocationMarker =  new nhn.api.map.Marker(icon, {
		point : position // 마커의 좌표
	});
	this.oMap.addOverlay(this.presentLocationMarker);
	this.oMap.setCenter(position);
	this.getPositionBoundsSetValue();
};

//현재 보고 있는 영역의 남서쪽 좌표와 북동쪽 좌표값을 폼에 입력한다.
LbsApi.Naver.prototype.getPositionBoundsSetValue = function() {
	document.getElementById('southWestLatitude').value = this.oMap.getBound()[1].y;
	document.getElementById('southWestLongitude').value = this.oMap.getBound()[0].x;
	document.getElementById('northEastLatitude').value = this.oMap.getBound()[0].y;
	document.getElementById('northEastLongitude').value = this.oMap.getBound()[1].x;
	
	getPositionList("NAVER");
};

//현재 위치의 콘텐트 정보에 대한 마커를 화면에 표시
LbsApi.Naver.prototype.setPositionInfoMarkerView = function(position_info) {
	//이전의 마커 및 인포윈도우 삭제
	for (var i = 0; i < this.markerList.length; i++) {
		this.oMap.removeOverlay(this.markerList[i]);	
	}
	for (var i = 0; i < this.infowindow_onlyList.length; i++) {
		this.oMap.removeOverlay(this.infowindow_onlyList[i]);	
	} 
	
	this.markerList = new Array();
	this.infowindow_onlyList = new Array();
	if ( position_info != null ) {
		for (var i = 0; i < position_info.length; i++) {
			var obj = position_info[i];
			var markerPosition = new nhn.api.map.LatLng(obj.latitude, obj.longitude);
			
			var oMarker =  new nhn.api.map.Marker(this.oIcon, {
			        point : markerPosition // 마커의 좌표
			});
			this.markerList.push(oMarker);
			
			if (obj.advertising != null || obj.advertising != '') {
				var infowindow_only = new nhn.api.map.InfoWindow();
				infowindow_only.setContent('<DIV style="border-top:1px solid; border-bottom:2px groove black; border-left:1px solid; border-right:2px groove black;margin-bottom:1px;color:black;background-color:white; width:auto; height:auto;">'+
                        '<span style="color: #000000 !important;display: inline-block;font-size: 12px !important;font-weight: bold !important;letter-spacing: -1px !important;white-space: nowrap !important; padding: 2px 2px 2px 2px !important">' + 
                        obj.advertising +'</span></div>');
				infowindow_only.setPoint(markerPosition);
				infowindow_only.setVisible(true);
				infowindow_only.setPosition({right : -15, top : 30});
				infowindow_only.autoPosition();
				this.infowindow_onlyList.push(infowindow_only);
			}
		}
	}
	
	//마커 및 인포윈도우 생성
	for (var i = 0; i < this.markerList.length; i++) {
		this.oMap.addOverlay(this.markerList[i]);	
	}
	for (var i = 0; i < this.infowindow_onlyList.length; i++) {
		this.oMap.addOverlay(this.infowindow_onlyList[i]);	
	}
};

//현재 보고 있는 화면에 폴리건을 그린다.
LbsApi.Naver.prototype.setPoligunView = function() {
	var currentMapCenter = this.oMap.getCenter();
	//폴리곤 그리기
	var arr = [];
	arr.push(new nhn.api.map.LatLng(currentMapCenter.y, currentMapCenter.x));
 	arr.push(new nhn.api.map.LatLng(currentMapCenter.y+0.001, currentMapCenter.x+0.001));
 	arr.push(new nhn.api.map.LatLng(currentMapCenter.y-0.001, currentMapCenter.x+0.002));
 	arr.push(new nhn.api.map.LatLng(currentMapCenter.y, currentMapCenter.x-0.0012));
 	
    var oPolygon = new nhn.api.map.Polygon(arr);
    oPolygon.setStyle({     
    	strokeColor : '#FF0000',
        strokeStyle : 'solid',
        fillOpacity : 0.5
    });
    this.oMap.addOverlay(oPolygon);
};

//현재 보고 있는 화면에 원을 그린다.
LbsApi.Naver.prototype.setCircleView = function() {
	var circle = new nhn.api.map.Circle({
        strokeColor : "red",
        strokeOpacity : 1,
        strokeWidth : 1,
        fillColor : "blue",
        fillOpacity : 0.5
	});
	var radius = 200; // - radius의 단위는 meter
	circle.setCenterPoint(this.oMap.getCenter()); // - circle 의 중심점을 지정한다.
	circle.setRadius(radius); // - circle 의 반지름을 지정하며 단위는 meter이다.
	circle.setStyle("strokeColor", "blue"); // - 선의 색깔을 지정함.
	circle.setStyle("strokeWidth", 5); // - 선의 두께를 지정함.
	circle.setStyle("strokeOpacity", 1); // - 선의 투명도를 지정함.
	circle.setStyle("fillColor", "none"); // - 채우기 색상. none 이면 투명하게 된다.
	this.oMap.addOverlay(circle);
};

//현재 보고 있는 화면에 라인을 그린다.
LbsApi.Naver.prototype.setPolylineView = function() {
	var currentMapCenter = this.oMap.getCenter();
	var arr = [];
	arr.push(new nhn.api.map.LatLng(currentMapCenter.y, currentMapCenter.x));
 	arr.push(new nhn.api.map.LatLng(currentMapCenter.y+0.002, currentMapCenter.x+0.001));
	
 	//라인 그리기
 	var oPolyline = new nhn.api.map.Polyline(arr);
    oPolyline.setStyle({
		strokeColor : '#FF0000',
        strokeWidth : 10,
        strokeOpacity : 1,
        strokeStyle : 'solid'
    });
	this.oMap.addOverlay(oPolyline);
};

var lbsNaverApi = new LbsApi.Naver();