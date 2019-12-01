//ipc.js - отвечает за взаимодействие с представлением(окном программы)

//Если ты это читаешь, то незавидую тебе, ибо мне было лень организовывать нормальную структуру проекта.
//Я его делал на энтузиазме, а у меня ещё дофига проектов.
//Если нужно что-то спросить, то пиши мне в вк https://vk.com/dukentreg (личка открыта)
const { ipcMain,app,BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const osName = require('os-name');
const screenshot = require('screenshot-desktop');
const ncp = require('ncp').ncp;
ncp.limit = 16;
const ps = require('ps-node');
const exec = require('child_process').execFile;
const edge = require('electron-edge-js');
const md5File = require('md5-file');
const functions = require("./functions");
const wallpaper = require('wallpaper');
const crypto = require('crypto');

const pathModule = require('path');
const rimraf = require("rimraf");
const restoreDesktop = require("./restoreDesktop");

module.exports = (win, app,network)=>{
    console.log("ipcMain Init!");
    ipcMain.on('electron-close-win', (event, arg) => {
        console.log("win close try!");
        BrowserWindow.getFocusedWindow().close();
        event.returnValue = 'pong'
    });
    ipcMain.on('electron-full-screen-win', (event, arg) => {
        console.log(arg);
        if(arg.fullScreen){
            BrowserWindow.getFocusedWindow().unmaximize()
        }else{
            BrowserWindow.getFocusedWindow().maximize();
        }

        event.returnValue = 'pong'
    });
    ipcMain.on('electron-minimize-win', (event, arg) => {
        console.log(arg);
        BrowserWindow.getFocusedWindow().minimize();
        event.returnValue = 'pong'
    });
    //app.getPath("userData") - AppData\Roaming\Electron\ in dev, AppData\Roaming\restore-desktop\ after build
    ipcMain.on('get-settings', (event, arg) => {  
        functions.restoreSettings();
        event.sender.send('get-settings-answer',functions.getSettings());
    });

    ipcMain.on('get-pass-status', (event, arg) => {  
        functions.restoreSettings();
        let settings = functions.getSettings();
        let answer = settings.password ? true:false;
        event.sender.send('get-pass-status-answer',answer);
    });

    ipcMain.on('exit-app', (event, arg) => {  
        app.quit();
    });

    ipcMain.on('save-pass', (event, arg) => {  
        functions.restoreSettings();
        let settings = functions.getSettings();
        const secret = 'DukentreGod';//чсв, сори
        const hash = crypto.createHmac('sha256', secret)
                        .update(arg.password)
                        .digest('hex');
        console.log(hash);
        settings.password = hash;
        fs.writeFileSync(app.getPath("userData")+"/settings/settings.json",JSON.stringify(settings));
        let answer = settings.password ? true:false;
        event.sender.send('get-pass-status-answer',answer);
    });

    ipcMain.on('delete-pass', (event, arg) => {  
        functions.restoreSettings();
        let settings = functions.getSettings();
        delete settings['password'];
        fs.writeFileSync(app.getPath("userData")+"/settings/settings.json",JSON.stringify(settings));
        let answer = settings.password ? true:false;
        event.sender.send('get-pass-status-answer',answer);
    });

    ipcMain.on('check-pass', (event, arg) => {  
        functions.restoreSettings();
        let settings = functions.getSettings();
        const secret = 'DukentreGod';//Cмысла от этого не много, просто придётся новую базу генерировать мамкиному хакеру(или удалить файл настроек... facepalm)
        const hash = crypto.createHmac('sha256', secret)
                        .update(arg.password)
                        .digest('hex');
        console.log(hash);
        let answer = settings.password == hash;
        event.sender.send('check-pass-answer',answer);
    });

    ipcMain.on('change-room', (event, arg) => {  
        functions.restoreSettings();
        console.log(arg);
        let settings = functions.getSettings();
        if(arg.serverName.match(/^(http)/gm) < 1){//обязательно указывать протокол 
            arg.serverName = "http://"+arg.serverName;
        }
        settings.server = arg.serverName;
        settings.room = arg.roomName;
        network.changeConnection(arg.serverName,arg.roomName);
        
        fs.writeFileSync(app.getPath("userData")+"/settings/settings.json",JSON.stringify(settings));
    });

    ipcMain.on('leave-room', (event, arg) => {  
        functions.restoreSettings();
        console.log(arg);
        let settings = functions.getSettings();
        delete settings.server;
        delete settings.room;
        network.disconnect();

        event.sender.send('disconnected');
        fs.writeFileSync(app.getPath("userData")+"/settings/settings.json",JSON.stringify(settings));
    });

    ipcMain.on('network-get', (event, arg) => {
        let settings = functions.getSettings();
        let answer = {
            connected: network.connected,
            room: network.room,
            server: (settings.server ? settings.server :null)
        }  
        event.sender.send('network-get-answer',answer);
    });

    ipcMain.on('save-settings', (event, args) => {
        console.log("saving!");
        let settings = functions.getSettings();
        settings.restoreWallpaper = args.restoreWallpaper;
        settings.restoreLinksPosition = args.restoreLinksPosition;
        settings.restoreFolders = args.restoreFolders;
        settings.clearDownloads = args.clearDownloads;
        settings.clearRecycle = args.clearRecycle;
        settings.checkMD5 = args.checkMD5;
        settings.startRestore = args.startRestore;
        fs.writeFileSync(app.getPath("userData")+"/settings/settings.json",JSON.stringify(settings));
        event.sender.send('save-settings-answer');
    });
    
    ipcMain.on('set-autoload', (event, arg) => {
        console.log("set-autoload!");
        let setAutoload = edge.func(`
            using Microsoft.Win32;
            using System;
            using System.IO;
            using System.Text;
            using System.Linq;
            
            async (path) => {
                RegistryKey currentUserKey = Registry.CurrentUser;
                RegistryKey helloKey = currentUserKey.OpenSubKey(@"Software\\Microsoft\\Windows\\CurrentVersion\\Run", true);
                helloKey.SetValue("RestoreDesktop", "" + path.ToString() + " -start");
                helloKey.Close();
                return "success";
            }
            `);
        console.log("exe path:",app.getPath("exe"));
        setAutoload(app.getPath("exe"),function (error, exist) {
            if (error){ event.sender.send('update-log',"Произошла ошибка!",error);};
            console.log(exist);
            event.sender.send('get-autoload-answer',true);
        });
    });

    ipcMain.on('remove-autoload', (event, arg) => {
        console.log("remove-autoload!");
        let removeAutoload = edge.func(`
            using Microsoft.Win32;
            using System;
            using System.IO;
            using System.Text;
            using System.Linq;
            async(needToCompile) =>{
                RegistryKey currentUserKey = Registry.CurrentUser;
                RegistryKey helloKey = currentUserKey.OpenSubKey(@"Software\\Microsoft\\Windows\\CurrentVersion\\Run", true);
                helloKey.DeleteValue("RestoreDesktop");
                helloKey.Close();
                return "success";
            }
            `);
    
        removeAutoload('needToCompile',function (error, exist) {
            if (error){ event.sender.send('update-log',"Произошла ошибка!",error);};
            console.log(exist);
            event.sender.send('get-autoload-answer',false);
        });
    });

    ipcMain.on('get-autoload', (event, arg) => {
        console.log("get-autoload!");
        let getAutoload = edge.func(`
            using Microsoft.Win32;
            using System;
            using System.IO;
            using System.Text;
            using System.Linq;
            async(needToCompile) =>{
                RegistryKey currentUserKey = Registry.CurrentUser;
                RegistryKey helloKey = currentUserKey.OpenSubKey(@"Software\\Microsoft\\Windows\\CurrentVersion\\Run", true);
                string[] keyValues = helloKey.GetValueNames();
                helloKey.Close();
                return keyValues.Contains("RestoreDesktop");
            }
            `);
    
        getAutoload('needToCompile',function (error, exist) {
            if (error){ event.sender.send('update-log',"Произошла ошибка!",error);};
            console.log(exist);
            event.sender.send('get-autoload-answer',exist);
        });
        
        
    });

    ipcMain.on('get-desktops', (event, arg) => {
        console.log("get-desktops!");
        functions.restoreSettings();
        event.sender.send('get-desktops-answer',functions.getDesktops());
    });

    ipcMain.on('remove-desktop', (event, arg) => {
        console.log(`remove-desktop ${arg.desktopId}!`);
        let desktops = functions.getDesktops();
        let settings = functions.getSettings();
        if(settings.defaultDesktop == arg.desktopId){
            delete desktops.saves[arg.desktopId];
            var keys = Object.keys(desktops.saves); //получаем ключи объекта в виде массива
            try{
                settings.defaultDesktop = desktops.saves[keys[keys.length - 1]].id;//последний элемент
            }catch(e){/*последних элементов нет*/}
            fs.writeFileSync(app.getPath("userData")+"/settings/settings.json",JSON.stringify(settings));
            event.sender.send('get-default-desktop-answer',{desktopId:settings.defaultDesktop});
        }else{
            delete desktops.saves[arg.desktopId];
        }
        fs.writeFileSync(app.getPath("userData")+"/settings/desktops.json",JSON.stringify(desktops));
        rimraf(app.getPath("userData")+"/savedDesktops/"+arg.desktopId, (error)=>{console.log(error);});
        //fs.rmdirSync(app.getPath("userData")+"/savedDesktops/"+arg.desktopId);
        event.sender.send('get-desktops-answer',desktops);
    });

    ipcMain.on('restore-desktop', (event, arg) => {
        console.log(`restore-desktop ${arg.desktopId}!`);
        restoreDesktop(arg.desktopId);
    });

    ipcMain.on('get-default-desktop', (event, arg) => {
        let desktopId = functions.getSettings().defaultDesktop;
        event.sender.send('get-default-desktop-answer',{desktopId:desktopId});
    });
    ipcMain.on('set-default-desktop', (event, arg) => {
        let settings = functions.getSettings();
        settings.defaultDesktop = arg.desktopId;
        fs.writeFileSync(app.getPath("userData")+"/settings/settings.json",JSON.stringify(settings));
        event.sender.send('get-default-desktop-answer',{desktopId:settings.defaultDesktop});
    });

    ipcMain.on('save-desktop', (event, arg) => {
        console.log("saving desktop!");
        let savedDesktops = app.getPath("userData")+"/savedDesktops/";
        functions.restoreSettings();
        event.sender.send('update-log',"Начали сохранать рабочий стол!");
        

        fs.readFile(app.getPath("userData")+"/settings/desktops.json",(error,data) =>{
            let desktops = JSON.parse(data);
            let lastId = ++desktops.lastId;

            let now = new Date();
            let dateNow = `${now.getDate()}.${now.getMonth()+1}.${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
            desktops.saves[lastId] = {
                id: lastId,//зачем оно нужно? х3 я так хочу
                files:{

                },
                comment: arg.comment,
                date: dateNow,
            };
            
            event.sender.send('update-log',"Папки сохранения созданы!");
            (async function (){
                let zero = await new Promise((resolve,reject)=>{
                    if(fs.existsSync(savedDesktops+lastId)){//если папка существует, то что-то пошло не по плану
                        rimraf(savedDesktops+lastId, (error)=>{
                            if(error){
                                console.log(error);
                                reject();
                            }
                            fs.mkdirSync(savedDesktops+lastId);
                            fs.mkdirSync(savedDesktops+lastId+"/files");
                            fs.mkdirSync(savedDesktops+lastId+"/reg");
                            fs.mkdirSync(savedDesktops+lastId+"/reg/desktop");
                            console.log("folders created!");
                            resolve();
                        });//удаляем её
                        //fs.rmdirSync(savedDesktops+lastId);
                    }else{
                        fs.mkdirSync(savedDesktops+lastId);
                        fs.mkdirSync(savedDesktops+lastId+"/files");
                        fs.mkdirSync(savedDesktops+lastId+"/reg");
                        fs.mkdirSync(savedDesktops+lastId+"/reg/desktop");
                        console.log("folders created!");
                        resolve();
                    }
                    
                }); 
                let one = await new Promise((resolve,reject)=>{
                    win.minimize();
                    screenshot({ filename: savedDesktops+lastId+"/screen.jpg" }).then((imgPath) => {
                        console.log("screenshot saved!",imgPath);
                        event.sender.send('update-log',"Скриншот сохранён!");
                        win.show();
                        resolve();
                    });
                });
                let two = await new Promise((resolve,reject)=>{
                    console.log("start copy user files!");
                        event.sender.send('update-log',"Начали копировать файлы пользователя!");
                        ncp(app.getPath("desktop"), savedDesktops+lastId+"/files", function (err) {
                            if (err) {
                              console.error(err);
                              reject();
                            }

                            fs.readdir(app.getPath("desktop"), function(err, items) {
                                console.log(items);
                             
                                for (var i=0; i<items.length; i++) {
                                    console.log(items[i]);
                                    try{//file
                                        let hash = md5File.sync(app.getPath("desktop")+"/"+items[i]);
                                        desktops.saves[lastId].files[items[i]] = hash;
                                    }catch(e){//folder
                                        desktops.saves[lastId].files[items[i]] = 'folder';
                                    }
                                }
                            });

                            console.log("user files saved!");
                            event.sender.send('update-log',"Файлы пользователя скопированы!");
                            resolve();
                        });
                });
                let three = await new Promise((resolve,reject)=>{
                    try{
                        console.log("start copy public files!");
                        event.sender.send('update-log',"Начали копировать общие файлы!");
                        
                            
                        fs.readdir("C:\\Users\\Public\\Desktop", function(err, items) {
                            console.log(items);
                            
                            for (var i=0; i<items.length; i++) {
                                try{
                                    console.log(items[i]);
                                    let postfix = fs.existsSync(savedDesktops+lastId+"/files/"+items[i]) ? "-Public" : '';//проверка на конфликт имён
                                    //items[i].replace(/\.\w+$/gm,`${postfix}$&`) - заменяет расширение файла на постфикс+расширение
                                    try{
                                        fs.copyFileSync("C:\\Users\\Public\\Desktop/"+items[i],savedDesktops+lastId+"/files/"+items[i].replace(/\.\w+$/gm,`${postfix}$&`));
                                    }
                                    catch(e){
                                        console.log(e);
                                        try{
                                            fs.mkdirSync(savedDesktops+lastId+"/files/"+items[i]+postfix);//создаём пустую папку с тем же названием
                                            ncp("C:\\Users\\Public\\Desktop/"+items[i], savedDesktops+lastId+"/files/"+items[i]+postfix, function (err) {//закидываем в неё файлы
                                                if (err) {
                                                console.log("copy error:",err)
                                                }
                                                console.log("copy success")
                                            });
                                        }catch(e){console.log(e);}
                                    }
                                    try{//file
                                        let hash = md5File.sync("C:\\Users\\Public\\Desktop"+"/"+items[i]);
                                        desktops.saves[lastId].files[items[i].replace(/\.\w+$/gm,`${postfix}$&`)] = hash;
                                    }catch(e){//folder
                                        desktops.saves[lastId].files[items[i]+postfix] = 'folder';
                                    }
                                }catch(e){
                                    console.log(e);
                                    continue;
                                }
                            }
                        });

                        console.log("public files saved!");
                        event.sender.send('update-log',"Общие файлы скопированы!");
                        resolve();
                        //});
                    }catch(e){
                        console.log(e);
                        event.sender.send('update-log',"Общие файлы скопировать не удалось!");
                        resolve();
                    }
                });
                let four = await new Promise((resolve,reject)=>{
                    console.log("start copy desktop registry!");
                        event.sender.send('update-log',"Начали сохранять параметры рабочего стола!");
                        let  writeDesktopRegistry = edge.func(`
using Microsoft.Win32;
using System;
using System.IO;
using System.Text;

async (path) => { 
    RegistryKey currentUserKey = Registry.CurrentUser;
    RegistryKey helloKey = currentUserKey.OpenSubKey(@"Software\\Microsoft\\Windows\\Shell\\Bags\\1\\Desktop", true);
    

    foreach (string lol in helloKey.GetValueNames())
    {
        try
        {
            StreamWriter sw = File.CreateText(path + lol.Replace(":","#;#"));
            
            if (helloKey.GetValue(lol).GetType() == typeof(Byte[]))
            {
                sw.Close();
                
                Byte[] dukentre = (byte[])helloKey.GetValue(lol);
                File.WriteAllBytes(path+ lol.Replace(":", "#;#"), dukentre);
            }
            else
            {
                var dukentre = helloKey.GetValue(lol);
                sw.Write(dukentre);
            }
            
            
            sw.Close();
        }
        catch
        {
            
        }
    }   
        
        
        
    
    helloKey.Close();
    return "success";
}
                            `);
                        //let goNEXT = resolve();
                         writeDesktopRegistry(savedDesktops+lastId+"/reg/desktop/", (error, result) => {
                            if (error){ 
                                console.log(error)
                                event.sender.send('update-log',"Параметры не сохранены!",error);
                            };
                            console.log("desktop registry saved!");
                            event.sender.send('update-log',"Параметры сохранены!");
                            resolve();
                            //console.log(goNEXT);
                            //goNEXT();
                        });
                });
                let five = await new Promise((resolve,reject)=>{
                    console.log("start get wallpaper!");
                    event.sender.send('update-log',"Начали копировать обои рабочего стола!");
                    let getPathToWallpaper = edge.func(`
                    using Microsoft.Win32;
                    using System;
                    using System.IO;
                    using System.Text;
                    async(needToCompile) =>{
                        RegistryKey currentUserKey = Registry.CurrentUser;
                        RegistryKey helloKey = currentUserKey.OpenSubKey(@"Control Panel\\Desktop", true);
                        string path = helloKey.GetValue("Wallpaper").ToString();
                        helloKey.Close();
                        return path;
                    }
                    `);
            
                    getPathToWallpaper('needToCompile',function (error, path) {
                        if (error){ event.sender.send('update-log',"Произошла ошибка!",error);};
                        console.log(path);
                        
                        fs.copyFile(path,savedDesktops+lastId+"/wallpaper"+pathModule.extname(path), err => {
                            console.log("start copy wallpaper!");
                            event.sender.send('update-log',"Сохраняем настройки!");
                            desktops.saves[lastId].wallpaperExtansion = pathModule.extname(path);
                            fs.writeFileSync(app.getPath("userData")+"/settings/desktops.json",JSON.stringify(desktops));
                            event.sender.send('update-log',"Настройки сохранены!");
                            let settings = functions.getSettings();
                            if(settings.defaultDesktop == null) {
                                settings.defaultDesktop = lastId;
                                fs.writeFileSync(app.getPath("userData")+"/settings/settings.json",JSON.stringify(settings));
                            }
                            if(err){ 
                                console.error("Operation end! Wallpaper Error!",err);
                                event.sender.send('update-log',`Ошибка сохранения обоев рабочего стола: возможно, недостаточно прав для копирования изображения или изображение отсутствует (${path})!`);
                                event.sender.send('desktop-saved');
                                resolve();
                            }
                            else {
                                console.log("Operation end! All success!");
                                event.sender.send('update-log',"Обои сохранены!");
                                event.sender.send('update-log',"Сохранение завершено!");
                                event.sender.send('desktop-saved');
                                resolve();
                            }
                        });
                        
                    });
                });
            })(); 
        });
    });
    
}