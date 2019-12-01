<template>
    <div v-if='show' class="edit-pass">
        <div class="bg"></div>
        <div class="window">
            <div v-if="(editPass && passStatus && waitExistPass) || deletePass" class="enter-exist-pass">
                <div class="title">Введите текущий пароль</div>
                <div v-if="warningShow" class="warning">Неверный пароль</div>
                <input v-model="existPassword" type="password">
                <div class="buttons">
                    <button @click="nextPassword">{{deletePass ? "Удалить" : "Далее"}}</button>
                    <button @click='closeWindow'>Отмена</button>
                </div>
            </div>
            <div v-if="(!passStatus || !waitExistPass) && editPass" class="enter-new-pass">
                <div class="title">Введите новый пароль</div>
                <input v-model="newPassword" type="password">
                <div class="buttons">
                    <button @click="savePassword">Сохранить</button>
                    <button @click='closeWindow'>Отмена</button>
                </div>
            </div>
            <div v-if="enterPass" class="enter-pass">
                <div class="title">Введите пароль</div>
                <div v-if="warningShow" class="warning">Неверный пароль</div>
                <input v-model="password" type="password">
                <div class="buttons">
                    <button @click="checkPassword">Далее</button>
                    <button @click='closeWindow'>Отмена</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
    name: "edit-pass",
    props: ["deletePass","editPass","passStatus",'show',"enterPass"],
    data(){
        return{
            waitExistPass:true,
            existPassword :'',
            newPassword :'',
            password :'',
            warningShow:false,
        }
    },
    methods:{
        ...mapMutations([
            'AuthNeedChange', // `this.AuthNeedChange()` 
            'AuthChange',
        ]),
        closeWindow(){
            this.waitExistPass =true;
            this.warningShow=false;
            this.existPassword='';
            this.newPassword='';
            this.password='';
            this.$emit("close");
        },
        savePassword(){
            this.$electron.ipcRenderer.send('save-pass',{password:this.newPassword});
            this.waitExistPass =true;
            this.warningShow=false;
            this.existPassword='';
            this.newPassword='';
            this.password='';
            this.AuthNeedChange(true);//теперь пароль не нужен
            this.AuthChange(true);//теперь мы авторизованы
            this.$emit("close");
        },
        nextPassword(){
            this.$electron.ipcRenderer.send('check-pass',{password:this.existPassword});
            if(!this.deletePass){
                this.$electron.ipcRenderer.once("check-pass-answer", (event,answer) =>{
                    console.log("пришло!")
                    console.log(answer);
                    if(!answer){
                        this.warningShow = true;
                    }else{ this.warningShow = false; }
                    this.waitExistPass = !answer;
                });
            }else{
                this.$electron.ipcRenderer.once("check-pass-answer", (event,answer) =>{
                    console.log("пришло!")
                    console.log(answer);
                    this.$electron.ipcRenderer.send('delete-pass');
                    this.AuthNeedChange(false);//теперь пароль не нужен
                    this.AuthChange(false);//теперь мы авторизованы
                    this.waitExistPass =true;
                    this.warningShow=false;
                    this.existPassword='';
                    this.newPassword='';
                    this.password='';
                    this.$emit("close");
                });
            }
        
        },
        checkPassword(){
            this.$electron.ipcRenderer.send('check-pass',{password:this.password});
            this.$electron.ipcRenderer.once("check-pass-answer", (event,answer) =>{
                    console.log("пришло!")
                    console.log(answer);
                    if(answer){
                        this.waitExistPass =true;
                        this.warningShow=false;
                        this.existPassword='';
                        this.newPassword='';
                        this.password='';
                        this.$emit("success");
                    }else{
                        this.warningShow = true;
                    }
                });
        }
    },
}
</script>

<style scoped>
.edit-pass,.bg{
    position: absolute;
    z-index: 20;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #575757;
}
.bg{
    background-color: rgba(0, 0, 0, 0.425);
}
.window{
    position: absolute;
    z-index: 21;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: white;
    width: 250px;
    height: 140px;
}
.enter-exist-pass,.enter-pass,.enter-new-pass{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
}
.title{
    width: 100%;
    padding: 4px 0px;
    color: white;
    text-align: center;
    font-size: 18px;
    background-color: #707070;
}
.description{
    padding: 8px;
    text-align: center;
}
.buttons{
    display: flex;
    justify-content: space-around;
    width: 100%;
}
.buttons button{
    background-color: #707070;
    color: white;
    border: none;
    width: 100%;
    padding: 4px 0;
}
.buttons button:hover{
    cursor: pointer;
    background-color: #535353;
    transition: 0.3s;
}
.warning{
    color:red;
    padding: 4;
}
</style>