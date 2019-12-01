<template>
    <div class="settings-sequrity">
        <pass-window :deletePass='deletePass' :editPass='true' :passStatus='passStatus' :show='passEditShow' @close='closePassEdit'/>
        <div class="title">
            <img @click='$router.push("/")' src="@/assets/left-arrow.svg">
            <span>Настройки безопасности</span>
            <div v-if="getAuthNeed && !getAuth">  |Вы не авторизованы</div>
        </div>
        <div v-if="(getAuthNeed && getAuth) || getAuthNeed == false" class="warning">
            Внимание! Пароль не спасёт от опытных пользователей, так как он хранится на компьютере.
            Для большей безопасности запретите редактировать папку без прав администратора по следующему пути:
            <br><span class="path">C:\Users\[Имя пользователя]\AppData\Roaming\restore-desktop</span>
        </div>
        
        <div v-if="(getAuthNeed && getAuth) || getAuthNeed == false" class="main-block">
            <div class="pass-status">Пароль {{passStatus ? "":"не"}} установлен</div>
            <button @click="openPassEdit">{{passStatus ? "Изменить":"Установить"}} пароль</button>
            <button v-if="passStatus" @click="deletePassAction">Удалить пароль</button>
        </div>
    </div>
</template>

<script>
import PassWindow from "./../components/PassWindow";
import { mapGetters } from 'vuex';
export default {
    name:"settings-sequrity",
    components:{
        PassWindow,
    },
    created(){
        this.$electron.ipcRenderer.send('get-pass-status');
        this.$electron.ipcRenderer.on("get-pass-status-answer", (event,answer) =>{
            console.log("пришло!")
            console.log(answer);
            this.passStatus = answer;
        })
    },
    computed:{
        ...mapGetters([
            'getAuth',
            'getAuthNeed',
        ]),
    },
    beforeDestroy(){
        this.$electron.ipcRenderer.removeAllListeners("get-pass-status-answer");
    },
    data(){
        return {
            passStatus:true,
            passEditShow: false,
            deletePass: false,
        }
    },
    methods:{
        closePassEdit(){
            this.passEditShow = false;
            this.deletePass = false;
        },
        openPassEdit(){
            this.passEditShow = true;
        },
        deletePassAction(){
            this.passEditShow = true;
            this.deletePass = true;
        }
    }
}
</script>

<style scoped>
.settings-sequrity{
    padding: 8px;
    color: #666;
}

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
.warning{
    color: rgb(160, 117, 8);
    font-size:13px;
}
.warning .path{
    font-weight: bold;
}

.main-block{
    margin-top: 20px;
}
.main-block .pass-status{
    font-size: 20px;
}

button{
    margin-top: 20px;
    border: none;
    background-color: #707070;
    font-size: 16px;
    padding: 4px;
    color: white;
    cursor: pointer;
}
button:hover{
    background-color: #535353;
    transition: 0.3s;
}

.pass-edit{
    position: absolute;
    z-index: 6;
    background-color: white;
    top: 100%;
    left: 40%;
}

.enter-exist-pass, .enter-new-pass{
    display: flex;
    flex-direction: column;
    align-items: center;
}

</style>