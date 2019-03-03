//맵 전역변수
var oMap;
//새로운 위치 전역변수
var crr_position=null;
var defaultLevel = 11;
var presentLocationMarker = null;
var markerList = new Array();
var infowindow_onlyList = new Array();

var oSize = new nhn.api.map.Size(28, 37);
var oOffset = new nhn.api.map.Size(14, 37);
var oIcon = new nhn.api.map.Icon('http://static.naver.com/maps2/icons/pin_spot2.png', oSize, oOffset);

nhn.api.map.setDefaultPoint('LatLng');  // - 지도에서 기본적으로 사용하는 좌표계를 설정합니다.

function mapInit(lat, lng) {

	var position = new nhn.api.map.LatLng(lat, lng);
	//맵 생성
	oMap = new nhn.api.map.Map(document.getElementById('mapContainer'), {
		point : position,
		zoom: defaultLevel,
		mapMode : 0
	});
	
	//getPositionBoundsSetValue(oMap);
	geoLocationMarker(lat, lng);
	
	oMap.attach("move", function(oEvent){
    	getPositionBoundsSetValue(oMap);
    }); // - 이벤트 추가. 지도에서의 이벤트 추가는 attach를 통해 이루어진다.
    
	oMap.attach("zoom", function(oEvent){
    	getPositionBoundsSetValue(oMap);
    }); // - 이벤트 추가. 지도에서의 이벤트 추가는 attach를 통해 이루어진다.
    
}

//현재 자신의 위치를 알려준다.
function geoLocationMarker(latitude, longitude) {
	createPosition(latitude, longitude);
	
	if (presentLocationMarker != null) {
		oMap.removeOverlay(presentLocationMarker);
	}
	
	var size = new nhn.api.map.Size(28, 28);
	var offset = new nhn.api.map.Size(28, 28);
	var icon = new nhn.api.map.Icon('custom_map_present.png', size, offset);
	var position = new nhn.api.map.LatLng(latitude, longitude);
	
	presentLocationMarker =  new nhn.api.map.Marker(icon, {
		point : position // 마커의 좌표
	});
	oMap.addOverlay(presentLocationMarker);
	oMap.setCenter(position);
	getPositionBoundsSetValue(oMap);
}

//현재 보고 있는 영역의 남서쪽 좌표와 북동쪽 좌표값을 폼에 입력한다.
function getPositionBoundsSetValue(map) {
	document.getElementById('southWestLatitude').value = map.getBound()[1].y;
	document.getElementById('southWestLongitude').value = map.getBound()[0].x;
	document.getElementById('northEastLatitude').value = map.getBound()[0].y;
	document.getElementById('northEastLongitude').value = map.getBound()[1].x;
	
	getPositionList();
}

//현재 위치의 콘텐트 정보에 대한 마커를 화면에 표시
function setPositionInfoMarkerView(position_info) {

	//이전의 마커 및 인포윈도우 삭제
	for (var i = 0; i < markerList.length; i++) {
		oMap.removeOverlay(markerList[i]);	
	}
	for (var i = 0; i < infowindow_onlyList.length; i++) {
		oMap.removeOverlay(infowindow_onlyList[i]);	
	} 
	
	markerList = new Array();
	infowindow_onlyList = new Array();
	if ( position_info != null ) {
		for (var i = 0; i < position_info.length; i++) {
			var obj = position_info[i];
			var markerPosition = new nhn.api.map.LatLng(obj.latitude, obj.longitude);
			
			var oMarker =  new nhn.api.map.Marker(oIcon, {
			        point : markerPosition // 마커의 좌표
			});
			markerList.push(oMarker);
			
			if (obj.advertising != null || obj.advertising != '') {
				var infowindow_only = new nhn.api.map.InfoWindow();
				infowindow_only.setContent('<DIV style="border-top:1px solid; border-bottom:2px groove black; border-left:1px solid; border-right:2px groove black;margin-bottom:1px;color:black;background-color:white; width:auto; height:auto;">'+
                        '<span style="color: #000000 !important;display: inline-block;font-size: 12px !important;font-weight: bold !important;letter-spacing: -1px !important;white-space: nowrap !important; padding: 2px 2px 2px 2px !important">' + 
                        obj.advertising +'</span></div>');
				infowindow_only.setPoint(markerPosition);
				infowindow_only.setVisible(true);
				infowindow_only.setPosition({right : -15, top : 30});
				infowindow_only.autoPosition();
				infowindow_onlyList.push(infowindow_only);
			}
		}
	}
	
	//마커 및 인포윈도우 생성
	for (var i = 0; i < markerList.length; i++) {
		oMap.addOverlay(markerList[i]);	
	}
	for (var i = 0; i < infowindow_onlyList.length; i++) {
		oMap.addOverlay(infowindow_onlyList[i]);	
	}
}

//현재 보고 있는 화면에 폴리건을 그린다.
function setPoligunView() {
	var currentMapCenter = oMap.getCenter();
	console.log(oMap.getCenter());
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
	oMap.addOverlay(oPolygon);
}

//현재 보고 있는 화면에 원을 그린다.
function setCircleView() {
	var circle = new nhn.api.map.Circle({
        strokeColor : "red",
        strokeOpacity : 1,
        strokeWidth : 1,
        fillColor : "blue",
        fillOpacity : 0.5
	});
	var radius = 200; // - radius의 단위는 meter
	circle.setCenterPoint(oMap.getCenter()); // - circle 의 중심점을 지정한다.
	circle.setRadius(radius); // - circle 의 반지름을 지정하며 단위는 meter이다.
	circle.setStyle("strokeColor", "blue"); // - 선의 색깔을 지정함.
	circle.setStyle("strokeWidth", 5); // - 선의 두께를 지정함.
	circle.setStyle("strokeOpacity", 1); // - 선의 투명도를 지정함.
	circle.setStyle("fillColor", "none"); // - 채우기 색상. none 이면 투명하게 된다.
	oMap.addOverlay(circle);
}

//현재 보고 있는 화면에 라인을 그린다.
function setPolylineView() {
	var currentMapCenter = oMap.getCenter();
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
	oMap.addOverlay(oPolyline);
}