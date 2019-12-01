//Функция восстановления рабочего стола
const { app } = require('electron');
const fs = require('fs');
const os = require('os');
const osName = require('os-name');
const ncp = require('ncp').ncp;
ncp.limit = 16;
const ps = require('ps-node');
const exec = require('child_process').execFile;
const edge = require('electron-edge-js');
const md5File = require('md5-file');
const functions = require("./functions");
const wallpaper = require('wallpaper');
//let child;
const rimraf = require("rimraf");

let  uploadDesktopRegistry = edge.func(`
using Microsoft.Win32;
using System;
using System.IO;
using System.Text;

async (path) => { 
    RegistryKey currentUserKey = Registry.CurrentUser;
    RegistryKey helloKey = currentUserKey.OpenSubKey(@"Software\\Microsoft\\Windows\\Shell\\Bags\\1\\Desktop", true);
    
    Console.WriteLine(""+path);
    string[] fileEntries = Directory.GetFiles(""+path);
    foreach (string fileName in fileEntries)
    {
        Console.WriteLine(""+fileName);
        string[] fileNameMassive = fileName.Split('/');
        Console.WriteLine("ИМЯ: "+fileNameMassive[1].Replace("#;#", ":"));
        FileStream fstream = File.OpenRead(fileName);
        byte[] array = new byte[fstream.Length];
        fstream.Read(array, 0, array.Length);
        try
        {
            int textFromFile = int.Parse(Encoding.Default.GetString(array));
            helloKey.SetValue(fileNameMassive[1].Replace("#;#", ":"), textFromFile);
        }
        catch
        {
            if(fileNameMassive[1].Replace("#;#", ":") == "GroupByKey:FMTID")
            {
                string textFromFile = Encoding.Default.GetString(array);
                helloKey.SetValue(fileNameMassive[1].Replace("#;#", ":"), textFromFile);
            }
            else
            {
                helloKey.SetValue(fileNameMassive[1].Replace("#;#", ":"), array);
            }
            
        }
        
        
        Console.WriteLine(fileNameMassive[1].Replace("#;#", ":"));
        fstream.Close();
    }
    helloKey.Close();
    return "success";
}
`);






module.exports = (desktopId,callback)=>{
    let desktops = functions.getDesktops();
    if(desktops.saves.hasOwnProperty(desktopId)){
        
            
        console.log(app.getPath("desktop")+"/");
        let settings = functions.getSettings();
        let desktopPath = app.getPath("desktop")+"/";
        let filesPath = app.getPath("userData")+"/savedDesktops/"+desktopId+"/files/";
        //C:\Users\Public\Desktop
        console.log("Перед цепочкой",desktopPath);
        (async function FUCK_PROMISE(){
            console.log("FUCK_PROMISE");
            try{
                let zero = await new Promise((resolve,reject) =>{
                    console.log("Удаляем общий рабочий стол");
                    fs.readdir("C:\\Users\\Public\\Desktop", function(err, items) {//общий рабочий стол(ярлыки)
                        if(err){
                            reject(err);
                        }
                        console.log(items);
                        
                        for (var i=0; i<items.length; i++) {
                            try{
                                console.log(items[i]);
                                try{//file
                                    fs.unlinkSync("C:\\Users\\Public\\Desktop\\"+items[i]);
                                    
                                    
                                    //const hash = md5File.sync(desktopPath+items[i]);
                                }catch(e){//folder
                                    console.log(e);
                                    rimraf.sync("C:\\Users\\Public\\Desktop\\"+items[i]);
                                    
                                }
                            }catch(e){
                                console.log(e);
                                continue;
                            }
                        }
                        resolve("fuck2");
                    });
                });
                let one = await new Promise((resolve,reject) =>{ 
                    console.log("Удаляем рабочий стол пользователя");
                    fs.readdir(app.getPath("desktop"), function(err, items) {//рабочий стол пользователя
                        if(err){
                            console.log(err);
                            reject(err);
                        }
                        console.log(items);
                        
                        for (var i=0; i<items.length; i++) {
                            try{//если всё пошло по одному месту, например, файл открыт
                                console.log(items[i]);
                                console.log(desktops.saves[desktopId].files.hasOwnProperty(items[i]));
                                if(!desktops.saves[desktopId].files.hasOwnProperty(items[i])){//если файла нет в сохранении
                                    try{//folder
                                        rimraf.sync(desktopPath+items[i]);   
                                        //const hash = md5File.sync(desktopPath+items[i]);
                                    }catch(e){//file
                                        fs.unlinkSync(desktopPath+items[i]);    
                                    }
                                }else if(settings.checkMD5){//файл есть в сохранении и нужно проверить содержимое
                                    if(fs.existsSync(filesPath+items[i])){//если файл сохранён
                                        console.log("saved file exists");
                                        if(desktops.saves[desktopId].files[items[i]] !== 'folder'){//если это не папка
                                        
                                            console.log("check desktop file hash")
                                            let fileHash = md5File.sync(app.getPath("desktop")+"/"+items[i]);
                                            if(fileHash !== desktops.saves[desktopId].files[items[i]]){
                                                console.log("File was edited");
                                                let savedFileHash = md5File.sync(desktopPath+items[i]);
                                                if(savedFileHash == desktops.saves[desktopId].files[items[i]]){//если сохранённый файл не был изменён
                                                    ncp(filesPath+items[i], app.getPath("desktop"), function (err) {
                                                        if (err) {
                                                        console.log("copy error:",err)
                                                        }
                                                        console.log("copy success")
                                                    });
                                                }else{ console.log("saved file was edited"); }
                                            }
                                        }
                                    }
                                }
                                if(settings.restoreFolders ){
                                    //&& desktops.saves[desktopId].files[items[i]] == 'folder'
                                    console.log(desktops.saves[desktopId].files[items[i]]);
                                    if(desktops.saves[desktopId].files[items[i]] == 'folder'){
                                        console.error("folder restore");
                                        if(fs.existsSync(filesPath+items[i])){//вообще это не безопасно, ибо в сохранённую папку могут накидать чего угодно
                                            console.log("folder exists");
                                            rimraf.sync(desktopPath+items[i]);//удаляем папку
                                            fs.mkdirSync(desktopPath+items[i]);//создаём пустую папку с тем же названием
                                            ncp(filesPath+items[i], desktopPath+items[i], function (err) {//закидываем в неё файлы
                                                if (err) {
                                                console.log("copy error:",err)
                                                }
                                                console.log("copy success")
                                            });
                                            
                                        }
                                    }
                                }
                            }catch(e){
                                console.log(e);
                                continue
                            }
                        }
                        resolve("fuck1");
                    });
                });
                let oneDotFive = await new Promise((resolve,reject) =>{
                    console.log("Восстанавливаем из хранилища");
                    fs.readdir(filesPath, function(err, items) {//общий рабочий стол(ярлыки)
                        if(err){
                            reject(err);
                        }
                        console.log(items);
                        
                        for (var i=0; i<items.length; i++) {
                            try{
                                //console.log(items[i]);
                                if(!fs.existsSync(desktopPath+items[i]) && !fs.existsSync("C:\\Users\\Public\\Desktop\\"+items[i])){//если файла нет на рабочем столе
                                    if(desktops.saves[desktopId].files[items[i]] !== 'folder'){//если это не папка
                                        if(settings.checkMD5){//если есть проверка md5
                                            try{
                                                let savedFileHash = md5File.sync(desktopPath+items[i]);
                                                if(savedFileHash == desktops.saves[desktopId].files[items[i]]){//если сохранённый файл не был изменён
                                                    fs.copyFileSync(filesPath+items[i],desktopPath+items[i]);
                                                    /*ncp(filesPath+items[i], desktopPath, function (err) {
                                                        if (err) {
                                                        console.log("copy error:",err)
                                                        }
                                                        console.log("copy success")
                                                    });*/
                                                }else{ console.log("saved file was edited"); }
                                            }catch(e){
                                                console.log("link");
                                                fs.copyFileSync(filesPath+items[i],desktopPath+items[i]);
                                            }
                                        }else{//если проверки нет
                                            fs.copyFileSync(filesPath+items[i],desktopPath+items[i]);
                                        }
                                    }else{//папка
                                        console.log("folder exists");
                                        fs.mkdirSync(desktopPath+items[i]);//создаём папку с тем же названием
                                        ncp(filesPath+items[i], desktopPath+items[i], function (err) {//закидываем в неё файлы
                                            if (err) {
                                            console.log("copy error:",err)
                                            }
                                            console.log("copy success")
                                        });
                                    }
                                }
                            }catch(e){
                                console.log(e);
                                continue;
                            }
                        }
                        resolve("fuck1.5");
                    });
                });
                
                /*let three = await new Promise((resolve,reject) =>{
                    console.log("Копируем файлы");
                    ncp(filesPath, app.getPath("desktop"), function (err) {
                        if (err) {
                        reject(err);
                        }
                        console.log("Файлы скопированы")
                        resolve();
                    });
                });*/
                if(settings.clearRecycle){
                    let seven = await new Promise((resolve,reject)=>{//очищаем корзину
                        try{
                            fs.readdir("C:\\$RECYCLE.BIN", function(err, items) {//общий рабочий стол(ярлыки)
                                if(err){
                                    console.log(err);
                                }
                                console.log(items);
                                for(let item of items){
                                    try{
                                    rimraf.sync("C:\\$RECYCLE.BIN\\"+item);//удаляем папку
                                    }catch(e){
                                        continue;
                                    }
                                }
                            });
                        }catch(e){}
                        try{
                            fs.readdir("D:\\$RECYCLE.BIN", function(err, items) {//общий рабочий стол(ярлыки)
                                if(err){
                                    console.log(err);
                                }
                                console.log(items);
                                for(let item of items){
                                    try{
                                    rimraf.sync("C:\\$RECYCLE.BIN\\"+item);//удаляем папку
                                    }catch(e){
                                        continue;
                                    }
                                }
                            });
                        }catch(e){}
                        resolve();
                    })
                }
                if(settings.restoreWallpaper || settings.restoreLinksPosition){
                    let four = await new Promise((resolve,reject) =>{
                        console.log("Пытаемся убить проводник!");
                        ps.lookup({
                            command: 'explorer',
                            }, 
                            function(err, resultList ) {
                                if (err) {
                                    console.log(err);
                                    //throw new Error( err );
                                }
                                console.log(resultList.length);
                                if(resultList.length !== 0){//если проводник запущен
                                    for(let finded_process of resultList){
                                        //console.log(process.pid);
                                        console.log(finded_process.pid);
                                        try{
                                            ps.kill( finded_process.pid,"SIGKILL", function( err ) {//убиваем проводник нахуй
                                                if (err) {
                                                    console.log(err);
                                                    //throw new Error( err );
                                                }
                                                else {
                                                    console.log( 'Process %s has been killed without a clean-up!',finded_process.pid );
                                                    
                                                }
                                            });
                                        }catch(e){
                                            console.log(e);//несколько проводников
                                        }
                                    }
                                    resolve();
                                } else{
                                    resolve();//он уже закрыт
                                }        
                                
                        });
                    });
                    if(settings.restoreWallpaper){
                        let fourDotFive = await new Promise((resolve,reject) =>{
                            console.log("Восстанавливаем рабочий стол на",osName(os.platform(), os.release()));
                            if(osName(os.platform(), os.release()) == "Windows 7"){//модуль wallpaper не работает ниже 10 винды
                                fs.copyFileSync(
                                    app.getPath("userData")+"/savedDesktops/"+desktopId+'/wallpaper'+desktops.saves[desktopId].wallpaperExtansion,
                                    app.getPath("userData")+"/../Microsoft\\Windows\\Themes\\TranscodedWallpaper.jpg"
                                );
                            }else{
                                wallpaper.set(app.getPath("userData")+"/savedDesktops/"+desktopId+'/wallpaper'+desktops.saves[desktopId].wallpaperExtansion);
                            }
                            resolve();
                        });
                    }
                    if(settings.restoreLinksPosition){
                        let five = await new Promise((resolve,reject) =>{
                            console.log("Начали загружать данные в регистр");
                            
                            //let goNEXT = resolve();
                            //console.log(app.getPath("userData")+"\\savedDesktops\\"+desktopId+"\\reg\\desktop/");//последний слэш очень важен!
                            uploadDesktopRegistry(app.getPath("userData")+"\\savedDesktops\\"+desktopId+"\\reg\\desktop/", (error, result) => {
                                if (error) console.log(error);
                                console.log("desktop registry uploaded!");
                                resolve();
                            });
                        });
                    }
                    let six = await new Promise((resolve,reject) =>{
                        console.log("Запускаем проводник");
                        exec('explorer.exe', function(err, data) { //запускаем проводник 
                                           
                        });
                        resolve();   
                    });
                     
                }
                console.log("Проводник запущен!",typeof(callback));
                if(typeof(callback) == 'function'){
                    console.log("CALLBACK!!!!!!!!!!!");
                    callback();
                }  
                
            }catch(e){
                console.log(e);
            }
        })();
    
    }else{
        console.log("not have default desktop");
    }
}


