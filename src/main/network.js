//network.js - отвечает за взаимодействие с сетью

import io from 'socket.io-client';
const functions = require("./functions");
const restoreDesktop = require("./restoreDesktop");

function GetConnection(socket){
    socket.on("connected",function(data){
        constructor.connected = true;
        constructor.room = data.roomName;
        socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
              // the disconnection was initiated by the server, you need to reconnect manually
              socket.connect();
            }
            // else the socket will automatically try to reconnect
        });
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
                    constructor.restore = false;
                    socket.connect();
                })()
            }   
            
        });
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