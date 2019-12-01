//быстрый доступ к часто используемым функциям

const fs = require('fs');
const { app } = require('electron');

const AppdataPath = app.getPath("userData");
module.exports ={
    restoreSettings,   
    getSettings,
    getDesktops,
    clearDownloads
}

function restoreSettings(){//восстановление всех настроек, если что-то отсутствует
    if(!fs.existsSync(AppdataPath+"/settings/")){
        fs.mkdirSync(AppdataPath+"/settings");//если папки нет
    }
    if(!fs.existsSync(AppdataPath+"/savedDesktops/")){
        fs.mkdirSync(AppdataPath+"/savedDesktops/");
    }
    if(!fs.existsSync(AppdataPath+"/settings/settings.json")){
        fs.writeFileSync(AppdataPath+"/settings/settings.json",JSON.stringify({
            defaultDesktop: null,
            restoreWallpaper: true,
            restoreLinksPosition:true,
            restoreFolders:false,
            clearDownloads:false,
            hardRestore:false,
            checkMD5:false,
            startRestore:false,
            clearRecycle: false,
        }));
    }
    if(!fs.existsSync(AppdataPath+"/settings/desktops.json")){
        fs.writeFileSync(AppdataPath+"/settings/desktops.json",JSON.stringify({
            lastId: 0,
            saves: {},
            pathToScreen: AppdataPath+"/savedDesktops/"
        }));
    }
}

function getSettings(){
    return JSON.parse(fs.readFileSync(AppdataPath+"/settings/settings.json"));
}
function getDesktops(){
    console.log("получаем настройки рабочих столов")
    let desktops = JSON.parse(fs.readFileSync(AppdataPath+"/settings/desktops.json"));
    console.log("Возвращаем настройки")
    return desktops
}

function clearDownloads(){
    
    console.log("Clear downloads start!");
    fs.readdir(app.getPath("downloads"), function(err, items) {//рабочий стол пользователя
        if(err){
            console.log(err);
        }
        console.log(items);
        for (var i=0; i<items.length; i++) {
            try{//если всё пошло по одному месту, например, файл открыт
                console.log(items[i]);
                    try{//folder
                        rimraf.sync(app.getPath("downloads")+"/"+items[i]);   
                        //const hash = md5File.sync(desktopPath+items[i]);
                    }catch(e){//file
                        fs.unlinkSync(app.getPath("downloads")+"/"+items[i]);    
                    }
            }catch(e){
                console.log(e);
                continue;
            }
        }
    });
}
