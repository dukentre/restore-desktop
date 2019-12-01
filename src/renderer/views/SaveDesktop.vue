<template>
    <div class="save-desktop">
        <div v-if="state == 0 &&((getAuthNeed && getAuth) || getAuthNeed == false)" class="save-options">
            <div class="title">Настройки сохранения</div>
            <textarea v-model="comment" placeholder="Комментарий..." cols="30" rows="3"></textarea>
            <div class="warning">Внимание! Чтобы сделать корректный скриншот, сначала сверните все программы, а потом нажмите на кнопку "сохранить рабочий стол".</div>
            <button @click="saveDesktop" class="save-btn">Сохранить рабочий стол</button>
            <button @click="closeWindow">Отмена</button>
        </div>
        <div v-else-if='(getAuthNeed && getAuth) || getAuthNeed == false' class="save-log">
            <div class="title">Идёт сохранение</div>
            <div class="log">
                <div class="log-item" :key="item" v-for="item in logItems">{{item}}</div>
            </div>
            <button v-if="state == 2" @click="closeWindow" class="close">Закрыть</button>
        </div>
        <div v-else class="needAuthBlock"><router-link to='/'>Назад</router-link> | Авторизуйтесь, чтобы сохранить рабочий стол</div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: "save-desktop",
    data(){
        return{
            state: 0,//0-настройка, 1-в процессе, 2 - завершено
            comment: "",
            logItems:[],
        }
    },
    computed:{
        ...mapGetters([
            'getAuth',
            'getAuthNeed',
        ]),
    },
    mounted(){
        this.$electron.ipcRenderer.on('update-log',(event,arg)=>{
            console.log(arg)
            this.logItems.push(arg); 
        });
        this.$electron.ipcRenderer.on('desktop-saved',(event,arg)=>{
            this.state = 2;
        });
    },
    beforeDestroy(){//отписываемся от событий
        console.log("destroy");
        this.$electron.ipcRenderer.removeAllListeners('update-log');
        this.$electron.ipcRenderer.removeAllListeners('desktop-saved');
    },
    methods:{
        saveDesktop(){
            this.state = 1;
            this.$electron.ipcRenderer.send('save-desktop',{comment:this.comment},(err,data)=>{ });
        },
        closeWindow(){
            this.$router.push("/main");
            //this.$electron.ipcRenderer.send('close-save-desktop',{},(err,data)=>{ });
        }
    },
}
</script>

<style scoped>
.save-desktop{
    max-width: 100%;
    background-color: rgb(233, 233, 233);
    height: 100vh;
}
.title{
    -webkit-app-region: drag;
    padding: 0,8px;
    font-size: 20px;
    background-color: #535353;
    color: white;
    width: 100%;
    margin-bottom: 12px;
    text-align: center;
}
.warning{
    padding: 4px;
}
textarea{
    margin-bottom: 12px;
}
button{
    position: absolute;
    bottom: 20px;
    border: none;
    background-color: #707070;
    font-size: 16px;
    padding: 4px;
    color: white;
    cursor: pointer;
}
.save-btn{
    bottom: 55px;
}
button:hover{
    background-color: #535353;
    transition: 0.3s;
}
.save-options{
    display: flex;
    align-items: center;
    flex-direction: column;
}
.save-log{
    display: flex;
    flex-direction: column;
}
.log{
    padding-left: 4px;
}
.log-item{
    word-wrap: break-word;
}
.close{
    align-self: center;
}
</style>