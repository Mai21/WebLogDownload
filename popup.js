$(document).ready(async function(){ 
    loadData();
    //When the save button clicked
    $('#saveJson').on('click', function(){
        chrome.storage.local.remove(['honeyIndex'], function() {});
        chrome.storage.local.remove(['honeyLog'], function() {});
        chrome.storage.local.remove(['logArray'], function() {});
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
    strDatetime = strDatetime.replace(/MM/g, (roadTime.getMonth() < 10) ? ("0" + (roadTime.getMonth() + 1)) : (roadTime.getMonth() + 1));
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

            let blobJson = new Blob([storageLog], {type : 'application/json'});
            $('#saveJson').attr({
                'href' : window.URL.createObjectURL(blobJson),
                'download' : "log-" + getDate() +".json"
            });
            $('#saveJson').removeClass('disabled');

            let logMd = getMarkdown(storageLog);
            let blobMD = new Blob([logMd], {type : 'text/plain'});
            $('#saveMarkdown').attr({
                'href' : window.URL.createObjectURL(blobMD),
                'download' : "log-" + getDate() +".md"
            });
            $('#saveMarkdown').removeClass('disabled');
        }
    });
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
            strOutput = strOutput + getMDformat(log.title, 2, log.url);
            /*if(log.previousPageId !== null){

            }
            if(log.parentPageId !== null){

            }*/
            //log.roadDatetime;

        });
   });


    /*var allDate= objLog.filter(function(item, index){
        if (item.date == "City" ) return true;
    });
    for( var i = 0; i < all_cities.length; i++ ){
        console.log(all_cities[i].Name);
    }

    let objPage = objLogArray.find((v) => v.url == strPageUrl);
        if(typeof objPage !== 'undefined'){
            intPageId = Number(objPage.id); 
        }*/
    return strOutput;
}

const getMDformat = (strLine, intStep, strLink) =>{ // line, step, link
    const strSharp = "#";
    let strPrefix = "";
    let strLineOutput = "";
    for (var i = 0; i < intStep; i++){
        strPrefix = strPrefix + strSharp;
    }
    if(typeof strLink === 'undefined'){
        strLineOutput = strPrefix + " " + strLine + "\n";
    }else{
        strLineOutput = strPrefix + " [" + strLine + "](" + strLink + ")\n";
    }
    return strLineOutput;
}
