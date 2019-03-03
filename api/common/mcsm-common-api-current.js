/**
 *
 * User: ariman
 * Date: 13. 11. 19.
 * Time: 오후 5:49
 * History
 *      0.1.0
 *       - API를 생성
 *
 *      1.0.1
 *       - 공통화 Api로 변경
 *       - 모든 서브의 Api는 반드시 Common Api와 같이 사용되어야 함.
 *       - 위치정보로그 전송 Api 추가
 *       - 서버와의 통신 부분 공통화 처리
 *
 *      1.0.2
 *       - 앱실행 시작 Api 추가
 *       - 앱실행 종료 Api 추가
 *
 *      1.0.3
 *       - 앱실행 시작 Api에 앱버전 추가
 *
 *      1.0.4
 *       - 안드로이드에서 WebView로 사용시 Device ID가 재발급되는 현상 수정
 *
 */


function McsmCommonApi(appId) {

    var commonApi = this;
    var _appId = appId;

    //var URL                         = "http://common.adic.or.kr:8081";
    //var URL                         = "http://okpass2.adic.or.kr:8080";
    //var URL                         = "http://211.109.233.95:8080";
    //var URL                         = "http://api.smartguru.co.kr:8080";
    //var URL                         = "http://common.adic.or.kr";
    var URL                         = "http://localhost:8080";
    var URL_DEVICE_CREATE           = "/rest/device/create.json";
    var URL_EVENT                   = "/rest/log/event.json";
    var URL_POSITION                = "/rest/log/position.json";
    var URL_RUN_START               = "/rest/log/runstart.json";
    var URL_RUN_END                 = "/rest/log/runend.json";

    this.getCommonUrl = function(url) {
        return url + "?appId=" + _appId + "&apiType=1";
    };

    this.sendEvent = function(eventId, callback) {
        var url = this.getCommonUrl(URL_EVENT) + "&eventId=" + eventId;
        sendServer("", "GET", callback, url);
    };

    this.request = function(formId, method, callback, url) {
        sendServer(formId, method, callback, url);
    };

    this.runStart = function(version, callback) {
        var startTime = getCurrentTime();
        var url = this.getCommonUrl(URL_RUN_START) + "&startTime=" + startTime + "&version=" + version;
        sendServer("", "GET", callback, url);
    };

    this.runEnd = function(formId, callback) {
        var endTime = getCurrentTime();
        var url = this.getCommonUrl(URL_RUN_END) + "&endTime=" + endTime;
        sendServer(formId, "GET", callback, url);
    };

    var getCurrentTime = function(date) {
        if(date == undefined || date == "") {
            date = new Date();
        }
        var txt = date.getFullYear() + "";
        var month = date.getMonth() + 1;
        if(month < 10) { txt += "0"; }
        txt += month;
        var day = date.getDate();
        if(day < 10) { txt += "0"; }
        txt += day;
        var hour = date.getHours();
        if(hour < 10) { txt += "0"; }
        txt += hour;
        var min = date.getMinutes();
        if(min < 10) { txt += "0"; }
        txt += min;
        var sec = date.getSeconds();
        if(sec < 10) { txt += "0"; }
        txt += sec;
        return txt;
    };

    function createXHR() {
        var xhr;
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch(e) {
                alert(e.message);
                xhr = null;
            }
        } else {
            xhr = new XMLHttpRequest();
        }
        return xhr;
    }

    var sendServer = function(formId, method, callback, url) {

        var app = window.localStorage.getItem('mscm_app');

        var devId = null;

        var isCreate = true;
        try {
            var installed = JSON.parse(app);
            for(var i = 0; i < installed.length; i++) {
                if(installed[i].appId == _appId && installed[i].deviceId != "") {
                    devId = installed[i].deviceId;
                    isCreate = false;
                    break;
                }
            }
        } catch(e) {
        }

        if(isCreate) {
            var xhr = createXHR();
            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4) {
                    if(xhr.status == 200) {
                        var data = JSON.parse(xhr.responseText);
                        var deviceId = data.body.deviceId;

                        var obj = new Object();
                        obj.appId = _appId;
                        obj.deviceId = deviceId;

                        var storage = window.localStorage.getItem('mscm_app');
                        var list;
                        if(storage == undefined || storage == "") {
                            list = new Array();
                        } else {
                            list = JSON.parse(storage);
                        }
                        list.push(obj);

                        var str = JSON.stringify(list);
                        window.localStorage.setItem('mscm_app',str);
                        sendRequest(formId, method, callback, url, deviceId);
                    }
                }
            };

            var uri = URL + URL_DEVICE_CREATE + "?appId=" + _appId +"&apiType=1";
            xhr.open("POST" , uri, true);
            xhr.send();

        } else {
            sendRequest(formId, method, callback, url, devId);
        }
    };

    var sendRequest = function(formId, method, callback, url, deviceId) {
        if(method == "GET") {
            sendGetRequest(formId, callback, url, deviceId);
        } else {
            sendPostRequest(formId, callback, url, deviceId);
        }
    };

    var sendPostRequest = function(formId, callback, url, deviceId) {

        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    callback(xhr.responseText);
                }
            }
        };

        var uri = URL + url + "&deviceId=" + deviceId;

        var form = document.getElementById(formId);
        if(form != undefined && form != "") {
            var formData = new FormData(form);
            xhr.open("POST", uri, true);
            //xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(formData);
        }
    };

    var sendGetRequest = function(formId, callback, url, deviceId) {
        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    if(typeof callback == 'function') {
                        callback(xhr.responseText);
                    } else if(callback == "RUN_START") {
                        alert(xhr.responseText);
                    }
                }
            }
        };

        if(formId != undefined && formId != "") {
            var form = document.getElementById(formId).elements;
            var txt = "";
            if(form != undefined && form != "" && form.length != undefined && form.length > 0) {
                for(var i = 0; i < form.length; i++) {
                    txt += "&" + form[i].name + "=" + encodeURI(form[i].value);
                }
            }
            url = url + txt;
        }

        var uri = URL + url + "&deviceId=" + deviceId;

        xhr.open("GET", uri, true);
        xhr.send();

    };

    this.getPositionLog = function() {
        if (navigator.geolocation) {
            getLoc();
        } else {
            alert("Your browser doesn't support geolocation service.");
        }
    };

    var geoNum;
    var getLoc = function() {
        geoNum = navigator.geolocation.watchPosition(updateLocation, handleLocationError, {maximumAge:2000});
    };


    var updateLocation = function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;


        var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude  + "," + longitude + "&output=xml&oe=utf8&sensor=false";

        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
//                    alert(xhr.responseText);

                    if(xhr.responseText != undefined && xhr.responseText != "") {
                        try {
                            var data = JSON.parse(xhr.responseText);

                            if(data.results[0].formatted_address != undefined && data.results[0].formatted_address != "") {
                                navigator.geolocation.clearWatch(geoNum);
                                var address = data.results[0].formatted_address;

                                var url = commonApi.getCommonUrl(URL_POSITION) + "&latitude=" + latitude + "&longitude=" + longitude + "&address=" + address;
                                console.log("Position Log Send Success Url : " + url);
                                sendServer("", "GET", "", url);
                            }
                        } catch(e) {
//                            alert(e);
                        }
                    }
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    };

    var handleLocationError = function(error) {
        switch(error.code) {
            case error.UNKNOWN_ERROR:
                alert("unknown error");
                break;

            case error.PERMISSION_DENIED:
                alert("Permission to use Geolocation was denied");
                break;

            case error.POSITION_UNAVAILABLE:
                alert("unavailable");
                break;

            case error.TIMEOUT:
                alert("timeout error");
                break;
        }
    };
}

function McsmBridgeConnection(appId, deviceId) {
    var storage = window.localStorage.getItem('mscm_app');
    console.log("storage : " + storage);

    var obj = new Object();
    obj.appId = appId;
    obj.deviceId = deviceId;

    var list;
    if(storage == undefined || storage == "") {
        list = new Array();
    } else {
        list = JSON.parse(storage);
    }
    list.push(obj);

    var str = JSON.stringify(list);
    window.localStorage.setItem('mscm_app',str);

}
