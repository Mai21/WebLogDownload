$(document).ready(async function(){ 
    loadData();
    //When the save button clicked
    $('#saveJson').on('click', function(){
        //chrome.storage.local.remove(['honeyIndex'], function() {});
        //chrome.storage.local.remove(['honeyLog'], function() {});
        //chrome.storage.local.remove(['logArray'], function() {});
        $('#message').text("Download Json is successful");
        $('#saveJson').addClass('disabled');
        return true;
    });
    $('#saveMarkdown').on('click', function(){
        //chrome.storage.local.remove(['honeyIndex'], function() {});
        //chrome.storage.local.remove(['honeyLog'], function() {});
        //chrome.storage.local.remove(['logArray'], function() {});
        $('#message').text("Download MarkDown is successful");
        $('#saveMarkdown').addClass('disabled');
        return true;
    });
});

const getDate = () =>{
    // get date
    let roadTime = new Date();
    let strDatetime= 'YYYY-MM-DD_hh:mm:ss';
    strDatetime = strDatetime.replace(/YYYY/g, roadTime.getFullYear());
    strDatetime = strDatetime.replace(/MM/g, (roadTime.getMonth() < 9) ? ("0" + (roadTime.getMonth() + 1)) : (roadTime.getMonth() + 1));
    strDatetime = strDatetime.replace(/DD/g, (roadTime.getDate() <  10) ? ("0" + roadTime.getDate()) : roadTime.getDate());
    strDatetime = strDatetime.replace(/hh/g, (roadTime.getHours() <  10) ? ("0" + roadTime.getHours()) : roadTime.getHours());
    strDatetime = strDatetime.replace(/mm/g, (roadTime.getMinutes() <  10) ? ("0" + roadTime.getMinutes()) : roadTime.getMinutes());
    strDatetime = strDatetime.replace(/ss/g, (roadTime.getSeconds() <  10) ? ("0" + roadTime.getSeconds()) : roadTime.getSeconds()); 

    return strDatetime;
}

//Load download files
const loadData =() =>{
    chrome.storage.local.get(['honeyLog'], function(obj){
        let storageLog = obj.honeyLog;
    
        if(!storageLog){
            $('#message').text("No log is availale to download!");
        }else{
            $('#message').text("Log is availale to download!");


            let objLogJson = getJsonParentChild(storageLog);
            let strLogJosn = JSON.stringify(objLogJson)
            let blobJson = new Blob([strLogJosn], {type : 'application/json'});
            //let blobJson = new Blob([storageLog], {type : 'application/json'});
            $('#saveJson').attr({
                'href' : window.URL.createObjectURL(blobJson),
                'download' : "log-" + getDate() +".json"
            });
            $('#saveJson').removeClass('disabled');

            let logMd = getMarkdown(strLogJosn);
            let blobMD = new Blob([logMd], {type : 'text/plain'});
            $('#saveMarkdown').attr({
                'href' : window.URL.createObjectURL(blobMD),
                'download' : "log-" + getDate() +".md"
            });
            $('#saveMarkdown').removeClass('disabled');
        }
    });
}

// 入れ子構造を作る
const getJsonParentChild = (storageLog) => {
    let arrayLog = JSON.parse(storageLog);
    let arrayResult = [];

    console.log(arrayLog);
    
    // loop per date
    arrayLog.forEach(function (value, index, data) {
        let strDate = value.date;
        let arrayLogs = value.log;
        arrayResult.push({"date" : strDate, "log" : getChildJson(arrayLogs)});
    });

    return arrayResult;
}

const getChildJson = (totalArray, childLogsArray, step) =>{ // wholeArray, childArray step
    let arrayLogs = [];
    let newChildArray = [];
    let resultChildArray = [];
    if(typeof childLogsArray === 'undefined'){ // if no childArray, loop for wholeArray
        arrayLogs = totalArray;
    }else{
        arrayLogs = childLogsArray;
    }

    arrayLogs.forEach(function (log, index, data){
        
        let objLog = {
            title : log.title,
            url : log.url,
            id : log.id
        }
        
        if (log.parentPageId === null && log.parentPageId !== log.id){ // sometimes there is a record having parentpageid = id
            objLog.step = 2;
        }else{
            if(typeof childLogsArray !== 'undefined'){
                objLog.step = step;
            }
        }

        if (typeof objLog.step !== 'undefined'){
            newChildArray = seachChild(totalArray, log.id);
            if (newChildArray !== null){
                const result = getChildJson(totalArray,newChildArray, objLog.step + 1);
                if (result.length > 0) {
                    objLog.child = result;
                }
            }
            resultChildArray.push(objLog);
        }
        
    });
    return resultChildArray;
}

// search child with own id
const seachChild = (objLog, intId) => {
    const result = objLog.filter( ({ parentPageId }) => parentPageId === intId );
    return result;
}



const getMarkdown = (storageLog) =>{
    let objLog = JSON.parse(storageLog);
    // count dates

    let strOutput = "";
    // loop by date
    objLog.forEach(function (value, index, data) {
        let strDate = value.date;
        let arrayLogs = value.log;
        strOutput = strOutput + getMDformat(strDate, 1);
        arrayLogs.forEach(function (log, index, data){
            console.log("log.title" + log.title);
            console.log("log.step" + log.step);
            strOutput = strOutput + getMDformat(log.title, log.step, log);
        });
   });
   console.log("aaaaaaaaa");
   console.log(strOutput);
    return strOutput;
}
const getMDformat = (strTitle, intStep, objLog) =>{ // title, step, object
    const strSharp = "#";
    let strPrefix = "";
    let strOutput = "";
    console.log("intStep" + intStep);
    for (var i = 0; i < intStep; i++){
        strPrefix = strPrefix + strSharp;
    }
    console.log("strPrefix" + strPrefix);
    if(typeof objLog === 'undefined'){
        strOutput = strPrefix + " " + strTitle + "\n";
    }else{
        strOutput = strPrefix + " [" + strTitle + "](" + objLog.url + ")\n";
        if (typeof objLog.child !== 'undefined'){
            const arrayChildLog = objLog.child;
            arrayChildLog.forEach(function (log, index, data){
                strOutput = strOutput + getMDformat(log.title, log.step, log);
            });
            
        }
    }
    return strOutput;
}