<template>
    <div class="network">
        <div class="title">
            <img @click='$router.push("/")' src="@/assets/left-arrow.svg">
            <span>Настройки сети</span>
            <div v-if="getAuthNeed && !getAuth">  |Вы не авторизованы</div>
        </div>
        <div v-if="(getAuthNeed && getAuth) || getAuthNeed == false" class="content">
            <div v-if="!connected" class="connect">
                <input v-model="serverEdit" type="text" title="адрес сервера, например dukentre.ru" placeholder="адрес сервера, например dukentre.ru">
                <input v-model="roomEdit" type="text" placeholder='название комнаты'>
                <button @click="connectToRoom" class="next">Далее</button>
            </div>
            <div v-else class="server-info">
                Мы подключены к серверу {{server}}<br>
                Мы подключены к комнате {{room}}
                <div  class="buttons">
                    <button @click="leaveFromRoom" class="disconnect-btn">Отключиться</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: 'settings-network',
    data(){
        return{
            server: '',
            room: '',
            roomEdit:'',
            serverEdit:'',
            connected: false,
            checkConnectionTime: '',
        }
    },
    computed:{
        ...mapGetters([
            'getAuth',
            'getAuthNeed',
        ]),
    },
    created(){
        this.$electron.ipcRenderer.on('network-get-answer',(event,data)=>{
            console.log("network-get-answer",data);
            this.connected = data.connected;
            this.room = data.room;
            this.server = data.server;
        });
        this.$electron.ipcRenderer.on('disconnected',(event)=>{
            console.log("disconnected");
            this.connected = false;
            this.room = '';
            this.server = '';
        });
        this.$electron.ipcRenderer.send('network-get');
    },
    beforeDestroy(){//отписываемся от событий
        console.log("destroy");
        this.$electron.ipcRenderer.removeAllListeners('network-get-answer');
        this.$electron.ipcRenderer.removeAllListeners('disconnected');
    },
    methods:{
        connectToRoom(){
            this.$electron.ipcRenderer.send('change-room',{serverName:this.serverEdit,roomName:this.roomEdit});
            this.checkConnectionTime = setTimeout(()=>{
                this.$electron.ipcRenderer.send('network-get');
            },3500)
        },
        leaveFromRoom(){
            this.$electron.ipcRenderer.send('leave-room');
        }
    }
}
</script>

<style scoped>
.title{
    display: flex;
    align-items: center;
    font-size: 20px;
}
.title img{
    align-self: flex-end;
    margin-right: 6px;
    cursor: pointer;
}

.buttons{
    position: absolute;
    bottom: 20px;
    left: 28px;
    display: flex;
}
button{
    border: none;
    background-color: #707070;
    font-size: 16px;
    padding: 4px;
    color: white;
    cursor: pointer;
    margin-right: 12px;
}
.saving{
    position: absolute;
    bottom: 60px;
    left: 28px;
}
button:hover{
    background-color: #535353;
    transition: 0.3s;
}

.connect,.server-info{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 28px;
    margin-top: 16px;
}
.connect input{
    margin-bottom: 8px;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active до версии 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>