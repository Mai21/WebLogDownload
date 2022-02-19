$("a,button").click(function(){
    // set previous page when user clicks <a> 
    window.sessionStorage.setItem('parentPage', window.location.href);
});

const getPage = (objLogArray, strPageType) =>{  // strPageType =  'parentPage'
    let strPageUrl = window.sessionStorage.getItem(strPageType);
    let intPageId = null;
    if (typeof strPageUrl !== 'undefined'){ 
        // previous page
        let objPage = objLogArray.find((v) => v.url == strPageUrl);
        if(typeof objPage !== 'undefined'){
            intPageId = Number(objPage.id); 
        }
    }
    return intPageId;
}

const getDate = () =>{
    // get date
    let roadTime = new Date();
    let strDatetime= 'YYYY-MM-DD hh:mm:ss';
    strDatetime = strDatetime.replace(/YYYY/g, roadTime.getFullYear());
    strDatetime = strDatetime.replace(/MM/g, (roadTime.getMonth() < 10) ? ("0" + (roadTime.getMonth() + 1)) : (roadTime.getMonth() + 1));
    strDatetime = strDatetime.replace(/DD/g, (roadTime.getDate() <  10) ? ("0" + roadTime.getDate()) : roadTime.getDate());
    strDatetime = strDatetime.replace(/hh/g, (roadTime.getHours() <  10) ? ("0" + roadTime.getHours()) : roadTime.getHours());
    strDatetime = strDatetime.replace(/mm/g, (roadTime.getMinutes() <  10) ? ("0" + roadTime.getMinutes()) : roadTime.getMinutes());
    strDatetime = strDatetime.replace(/ss/g, (roadTime.getSeconds() <  10) ? ("0" + roadTime.getSeconds()) : roadTime.getSeconds()); 

    return strDatetime;
}

// get a current index
async function getCurrentIndex(){
    let strIndex;
    let index;
    let promise =  new Promise((resolve, reject) => {
        chrome.storage.local.get(['honeyIndex'], function(obj) {
            strIndex = obj.honeyIndex;
            if(typeof strIndex === 'undefined'){
                index = 1;
            }else{
                index = Number(strIndex) + 1;
            }
            // Pass the data retrieved from storage
            resolve(index);
        });
    });
    return await promise;
}

async function getLogArray() {
    let promise =  new Promise((resolve, reject) => {
        chrome.storage.local.get(['logArray'], function(obj) {
            resolve(obj.logArray);
        });
    });
    return await promise;
}

$(document).ready(async function(){ 
    // index
    let index;
    const constCurrentIndex = getCurrentIndex();
    try {
      index = await constCurrentIndex;
    } catch (e) {
      console.log("error: index error");
      return;
    }

    // log array {id: XX, url: XXX}
    let objLogArray;
    let intPreviousPageId = null;
    const constLogArray = getLogArray();
    try {
        let strLogArray = await constLogArray;
        if(typeof strLogArray !== 'undefined'){
            objLogArray = JSON.parse(strLogArray);
            if(objLogArray !== null){
                objLogArray.push({"id": index, "url" :  window.location.href});
                intPreviousPageId = (index == 1? null: (index -1)); //if index = 1, set null
            }else{
                objLogArray = [{"id": index, "url" :  window.location.href}];
            }
        }else{
            // "no log array!"
            objLogArray = [{"id": index, "url" :  window.location.href}];
        }
    } catch (e) {
        console.log("error: log array error");
        return;
    }
    chrome.storage.local.set({logArray: JSON.stringify(objLogArray)}, function() {});
    chrome.storage.local.set({honeyIndex: index}, function() {});

    // get parent page
    let intParentPageId = getPage(objLogArray, 'parentPage');

    // get date 
    let strCurrentDateTime = getDate();
    let jsonDate = strCurrentDateTime.substring(0,10);
    
    // logJson
    let logJson = { id: index, previousPageId : intPreviousPageId, parentPageId : intParentPageId, url :  window.location.href, title : document.title, roadDatetime : strCurrentDateTime};

    // set log
    chrome.storage.local.get(['honeyLog'], function(obj){
        let strlogStorage = obj.honeyLog;
        let objLogStorage;
        if(typeof strlogStorage !== 'undefined'){
            objLogStorage = JSON.parse(strlogStorage);
            let objTodayLogStorage = objLogStorage.find((v) => v.date == jsonDate);
            // if no data today, initialise
            if(!objTodayLogStorage){
                // new log today
                objLogStorage.push({"date": jsonDate, "log" : [logJson]});
            }else{
                // add log to today
                objTodayLogStorage.log.push(logJson);
            }
        }else{
            // add a new log
            objLogStorage = [{"date": jsonDate, "log" : [logJson]}];
        }
        chrome.storage.local.set({honeyLog:JSON.stringify(objLogStorage)}, function(){});
    });

});
