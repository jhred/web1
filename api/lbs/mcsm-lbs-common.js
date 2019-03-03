window.onload = function() {
	category1List();
	//mapInit('37.485250314987134', '127.02912050465471');
};

var api = new McsmLbsApi("app-ae7cea100ce94ba28418e4490290af70");

function createPosition(latitude, longitude) {
	document.getElementById("currentLatitude").value = latitude;
	document.getElementById("currentLongitude").value = longitude;
	api.createPosition("form1", positionCallback);
}

function positionCallback(){}

function getPositionList() {
	document.getElementById("pCategoryId").value = document.getElementById("category1").value;
	document.getElementById("categoryId").value = document.getElementById("category2").value;
	api.getPositionList("form1", getPinCallback);
}

function getPinCallback(ref) {
	var data = JSON.parse(ref);

	if (data.header.code != 1) {
		alert("Error Code : " + data.header.code + "\nError Message : "
				+ data.header.message);
		return;
	}
	
	setPositionInfoMarkerView(data.body.position_info);
}

function category1List() {
	api.getCategoryList("form2", getPinCallback2);
}

function category1Change() {
	var category1 = document.getElementById("category1");
	var category2 = document.getElementById("category2");
	category2.length = 0;	//초기화
	
	// 전체값 옵션 추가
	var op = new Option();
    op.value = ''; 				
    op.text = ':::전체:::';
    category2.add(op);
	
    //상위카테고리가 선택되었을 경우, 하위카테고리를 조회
	if(category1.value != '') {
		document.getElementById("parentCategoryId").value = category1.value;
		document.getElementById("depth").value = "2";
		api.getCategoryList("form2", getPinCallback2);	
	} else {
		document.getElementById("result2").innerHTML = "";
	}
    
	getPositionList();
}

function getPinCallback2(ref) {
	var data = JSON.parse(ref);

	if (data.header.code != 1) {
		alert("Error Code : " + data.header.code + "\nError Message : "
				+ data.header.message);
		return;
	}
	
	for (var i = 0; i < data.body.category_info.length; i++) {
		var obj = data.body.category_info[i];
		
		var option = document.createElement("option");
		option.text = obj.categoryName;
		option.value = obj.categoryId;
		
		if(obj.depth == '1') {
			document.getElementById("category1").add(option);
		} else {
			document.getElementById("category2").add(option);
		}
	}
	
	document.getElementById("result2").innerHTML = ref;
}
