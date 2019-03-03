/**
 *
 * User: ariman
 * Date: 13. 11. 19.
 * Time: 오후 5:49
 * History
 *      0.1.0
 *       - API를 생성
 */

function McsmLbsApi(appId) {

    var common = new McsmCommonApi(appId);

    var URL_POSITION_LIST			= "/rest/lbs/position/list.json";
    var URL_CATEGORY_LIST			= "/rest/lbs/category/list.json";
    var URL_POSITION_CREATE			= "/rest/lbs/position/insert.json";
    
    this.getPositionList = function(formId, callback) {
        common.request(formId, "GET", callback, common.getCommonUrl(URL_POSITION_LIST));
    };
    
    this.getCategoryList = function(formId, callback) {
        common.request(formId, "GET", callback, common.getCommonUrl(URL_CATEGORY_LIST));
    };
    
    this.createPosition = function(formId, callback) {
        common.request(formId, "POST", callback, common.getCommonUrl(URL_POSITION_CREATE));
    };
}
