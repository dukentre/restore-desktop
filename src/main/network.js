//network.js - отвечает за взаимодействие с сетью. Кода немного, ибо большая часть работы выполняется на сервере.

//будьте осторожней, если неправильно настроить реконнект, то можно положить роутер, удачи <3 
import io from 'socket.io-client';
const functions = require("./functions");
const restoreDesktop = require("./restoreDesktop");

function GetConnection(socket){
    socket.on("connected",function(data){
        constructor.connected = true;
        constructor.room = data.roomName;
        
        socket.on("restore-desktop",function(){
            
            console.log(constructor.restore);
            if(!constructor.restore){
                constructor.restore = true;
                let settings = functions.getSettings();
                (async function(){
                    
                    await new Promise((resolve,reject)=>{
                        restoreDesktop(settings.defaultDesktop,function(){
                            resolve();
                        });
                    })
                    await new Promise((resolve,reject)=>{
                        console.log("after restore");
                        constructor.restore = false;
                        /*setTimeout(()=>{
                            constructor.startConnection();
                        },1500);*/
                        console.log("network restore complete!");
                        resolve();
                    })
                })()
            }   
            
        });
        socket.on('disconnect', (reason) => {
            console.log("Disconnect: ",reason);
            setTimeout(()=>{
                socket.disconnect();
                constructor.startConnection();
            },1500);
        });
        /*socket.on('error', (error) => {
            console.log("Error: ",error);
            setTimeout(()=>{
                constructor.startConnection();
            },1500);
        });*/
    })
}

function constructor(){
    constructor.socket = null;
    constructor.connected = false;
    constructor.room = null;
    constructor.restore = false;
    constructor.changeConnection = function(server,room){
        constructor.socket = io(server,{path:'/restore-desktop-api'});
        GetConnection(constructor.socket);
        constructor.socket.emit('connect-to-room',{roomName:room});
        
    }
    constructor.startConnection = function(){
        let settings = functions.getSettings();
        if(settings.server && settings.room){
            constructor.socket = io(settings.server,{path:'/restore-desktop-api'});
            GetConnection(constructor.socket);
            constructor.socket.emit('connect-to-room',{roomName:settings.room});
            
        }
        
    }
    constructor.disconnect = function(){
        constructor.socket.disconnect();
        constructor.connected = false;
        constructor.room = null;
    }
    
}

module.exports = constructor;