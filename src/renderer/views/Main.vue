<template>
    <div class="main">
        <alert-window :show='alertShow' :title="alertTitle" :description="alertDescription" @yes="alertAnswer('yes')"  @no="alertAnswer('no')"/>
        <button v-if="(getAuthNeed && getAuth) || getAuthNeed == false" @click="saveDesktop" class="save-desktop">
            <img src="@/assets/camera-image.svg">
            <span>Сделать слепок рабочего стола</span>
        </button>
        <div class="table-block">
            <table>
                <tbody>
                    <tr class="title">
                        <td>Снимок экрана</td>
                        <td>Дата создания</td>
                        <td>Комментарий</td>
                        <td>Действия</td>
                    </tr>
                    <tr :key="save.id" v-for="save in saves">
                        <td><img class="screenshot" :src='pathToScreen+save.id+"/screen.jpg"'></td>
                        <td>{{save.date}}</td>
                        <td>{{save.comment}}</td>
                        <td>
                            <img title="Восстановить рабочий стол" @click="openSubmit('restore',save.id)"  src="@/assets/restore.svg">
                            <img class="defaultDesktop" title="Этот рабочий стол установлен как основной" v-if='defaultDesktop == save.id && ((getAuthNeed && getAuth) || getAuthNeed == false)' src="@/assets/set-default-active.svg">
                            <img title='Установить этот рабочий стол в качестве основного' v-else-if='(getAuthNeed && getAuth) || getAuthNeed == false' @click="setDefaultDesktop(save.id)" src="@/assets/set-default.svg">
                            <img v-if="(getAuthNeed && getAuth) || getAuthNeed == false" title="Удалить сохранение рабочего стола" @click="openSubmit('remove',save.id)" src="@/assets/delete.svg">
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
const { app } = require('electron');
import AlertWindow from "./../components/AlertWindow";
import { mapGetters } from 'vuex';
export default {
    name: 'main',
    components:{
        AlertWindow,
    },
    data(){
        return{
            saves:{},
            pathToScreen: "",
            removeId: null,
            restoreId: null,
            alertTitle: "Внимание",
            alertDescription:"тут был дукентр",
            alertShow: false,
            defaultDesktop: null,
        }
    },
    computed:{
        ...mapGetters([
            'getAuth',
            'getAuthNeed',
        ]),
    },
    mounted(){
        console.log("монтируем!");
        this.$electron.ipcRenderer.send('get-desktops',function(err,data){
            console.log(err,data);
        });
        this.$electron.ipcRenderer.send('get-default-desktop',function(err,data){
            console.log(err,data);
        });
        this.$electron.ipcRenderer.on('get-default-desktop-answer',(err,data)=>{
                console.log(err,data);
                this.defaultDesktop = data.desktopId;
        });
        this.$electron.ipcRenderer.on('get-desktops-answer',(err,data)=>{
                console.log(err,data);
                this.saves = data.saves;
                this.pathToScreen = data.pathToScreen;
        });
        
    },
    beforeDestroy(){
        console.log("destroy");
        this.$electron.ipcRenderer.removeAllListeners('get-default-desktop-answer');
        this.$electron.ipcRenderer.removeAllListeners('get-desktops-answer');
    },
    methods:{
        saveDesktop(){
            this.$router.push("/save-desktop");
            /*this.$electron.ipcRenderer.send('open-save-desktop',function(err,data){
                console.log(err,data);
            });*/
        },
        alertAnswer(answer){
            if(answer === 'yes'){
                if(this.removeId !== null){
                    this.$electron.ipcRenderer.send('remove-desktop',{desktopId:this.removeId},function(err,data){
                        console.log(err,data);
                    });
                    this.removeId = null;
                }else if(this.restoreId !== null){
                    this.$electron.ipcRenderer.send('restore-desktop',{desktopId:this.restoreId},function(err,data){
                        console.log(err,data);
                    });
                    this.restoreId = null;
                }
                this.alertShow = false;
            }else{
                this.alertShow = false;
                this.restoreId = null;
                this.removeId = null;
            }
        },
        openSubmit(purpose,desktopId){
            if(purpose === 'remove'){
                this.removeId = desktopId;
                this.alertTitle= "Удаление сохранения";
                this.alertDescription="Вы уверены, что хотите удалить сохранение рабочего стола?";
                this.alertShow= true;
            }else if(purpose === 'restore'){
                this.restoreId = desktopId;
                this.alertTitle= "Восстановление";
                this.alertDescription="Вы уверены, что хотите восстановить рабочий стол? Это приведёт к удалению всех несохранённых файлов!";
                this.alertShow= true;
            }

        },
        setDefaultDesktop(desktopId){
            this.$electron.ipcRenderer.send('set-default-desktop',{desktopId:desktopId},function(err,data){
                console.log(err,data);
            });
        }
    }
}
</script>

<style scoped>
.main{
    padding: 8px;
}
.save-desktop{
    padding: 4px;
    border: none;
    display:flex;
    align-items: center;
    background-color: #E0DDDD;
    color: #575757;
    font-size: 15px;
}
.save-desktop img{
    margin-right: 4px; 
}
.save-desktop:hover{
    cursor: pointer;
    background-color: rgb(204, 203, 203);
    transition: 0.3s;
}
.table-block{
    overflow: auto;
    max-height: calc(100vh - 75px);
}
table{
    width: 100%;
    
}
table img{
    cursor: pointer;
}

.screenshot{
    width: 200px;
}
.defaultDesktop{
    cursor: default;
}
</style>