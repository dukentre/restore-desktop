<template>
    <div class="settings">
        <div class="title">
            <img @click='$router.push("/")' src="@/assets/left-arrow.svg">
            <span>Основные настройки</span>
            <div v-if="getAuthNeed && !getAuth">  |Вы не авторизованы</div>
        </div>
        <div v-if="(getAuthNeed && getAuth) || getAuthNeed == false" class="parameters">
            <label><input v-model="restoreWallpaper" type="checkbox" name="save-wallpaper" id="">Восстанавливать изображение рабочего стола</label>
            <label><input v-model="restoreLinksPosition" type="checkbox" name="save-links-position" id="">Восстанавливать позиции ярлыков</label>
            <label title="Проверяет MD5 хэш файла. Если настройка выключена, то проверяет только название(быстрее)"><input v-model="checkMD5" type="checkbox" name="checkMD5" id="">Проверять содержимое файлов</label>
            <label title="Удаляет папку и восстанавливает её из хранилища" ><input v-model="restoreFolders" type="checkbox" name="save-folders" id="">Восстанавливать содержимое папок</label>
            <label><input v-model="clearDownloads" type="checkbox" name="clear-downloads" id="">Очищать загрузки при запуске Windows</label>
            <label title="Восстанавливает рабочий стол при запуске windows, проверяя файлы на соответствие основному рабочему столу"><input type="checkbox" v-model="startRestore" name="start-restore" id="">Восстанавливать рабочий стол при включении windows</label>
            <label><input v-model="clearRecycle" type="checkbox" name="clear-recycle" id="">Очищать корзину при восстановлении</label>
        </div>
        <transition name="slide-fade">    
        <div v-if="saving" class="saving">Сохранение...</div>
        </transition>
        <div v-if="(getAuthNeed && getAuth) || getAuthNeed == false" class="buttons">
        <button @click="save" class="save-btn">Сохранить</button>
        <button @click="autoloadChange" class="save-btn">{{ autoload? "Убрать из автозапуска windows":"Добавить в автозапуск windows"}}</button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: 'settings-main',
    data(){
        return{
            restoreWallpaper: false,
            restoreLinksPosition:false,
            restoreFolders:false,
            clearDownloads:false,
            checkMD5: false,
            startRestore:false,
            saving:false,
            autoload: false,
            clearRecycle: false,
        }
    },
    computed:{
        ...mapGetters([
            'getAuth',
            'getAuthNeed',
        ]),
    },
    created(){
        this.$electron.ipcRenderer.on("save-settings-answer", (event,args) =>{
            setTimeout(()=>{
                this.saving = false;
            },400);
        });
        this.$electron.ipcRenderer.once("get-settings-answer", (event,args) =>{
            console.log("пришло!")
            console.log(args);
            this.restoreWallpaper = args.restoreWallpaper;
            this.restoreLinksPosition = args.restoreLinksPosition;
            this.restoreFolders = args.restoreFolders;
            this.clearDownloads = args.clearDownloads;
            this.checkMD5 = args.checkMD5;
            this.startRestore = args.startRestore;
            this.clearRecycle = args.clearRecycle;
        })
        this.$electron.ipcRenderer.send('get-settings');

        this.$electron.ipcRenderer.send('get-autoload');
        this.$electron.ipcRenderer.on("get-autoload-answer", (event,args) =>{
            console.log("пришло!")
            console.log(args);
            this.autoload = args;
        })
    },
    beforeDestroy(){//отписываемся от событий
        console.log("destroy");
        this.$electron.ipcRenderer.removeAllListeners('save-settings-answer');
        this.$electron.ipcRenderer.removeAllListeners('get-settings-answer');
    },
    methods:{
        save(){
            this.saving = true;
            this.$electron.ipcRenderer.send('save-settings',{
                restoreWallpaper:this.restoreWallpaper,
                restoreLinksPosition:this.restoreLinksPosition,
                restoreFolders:this.restoreFolders,
                clearDownloads:this.clearDownloads,
                checkMD5: this.checkMD5,
                startRestore: this.startRestore,
                clearRecycle: this.clearRecycle,
            }); 
        },
        autoloadChange(){
            console.log("autoloadChange!");
            if(this.autoload){
                this.$electron.ipcRenderer.send('remove-autoload');
            }else{
                this.$electron.ipcRenderer.send('set-autoload');
            }
        },
    }
    
}
</script>

<style scoped>
.settings{
    padding: 8px;
    color: #666;
}

.settings .title{
    display: flex;
    align-items: center;
    font-size: 20px;
}
.settings .title img{
    align-self: flex-end;
    margin-right: 6px;
    cursor: pointer;
}
.parameters{
    display: flex;
    flex-direction: column;
    margin-left: 28px;
    margin-top: 24px;
    font-size: 18px;
}

label{cursor: pointer;}
.parameters input{
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