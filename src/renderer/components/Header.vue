<template>
<div class="header-obertka">
    <pass-window :enterPass='true' :deletePass='false' :editPass='false' :passStatus='getAuthNeed' :show='enterPassShow' @success='authSuccess' @close='closeEnterPass'/>
    <div class="header" style="-webkit-app-region: drag">
        <div class="left">
            <div class="logo" @click='open("https://dukentre.ru")'>
                <span class="main-text">Desktop Restore</span>
                <span class="creator-text">Created by Dukentre</span>
            </div>
            <div class="break-line"></div>
            <div class="buttons">
                <a v-if="(getAuthNeed && getAuth) || getAuthNeed == false" @mouseenter="showSettingsMenuAction()" @mouseleave="checkSettingsMenu()">Настройки</a>
                <transition name="slide-fade">
                <div v-if="showSettingsMenu" @mouseenter="showSettingsMenuEntered=true" @mouseleave='showSettingsMenu=false; showSettingsMenuEntered=false;' class="settings-more">
                    <router-link to="/settings/main">Основные</router-link>
                    <router-link to="/settings/security">Безопасность</router-link>
                    <router-link to="/settings/network">Сеть</router-link>
                </div>
                </transition>
                <a @mouseenter="showAboutMenuAction()" @mouseleave="checkAboutMenu()">О программе</a>
                <transition name="slide-fade">
                <div v-if="showAboutMenu" @mouseenter="showAboutMenuEntered=true" @mouseleave='showAboutMenu=false; showAboutMenuEntered=false;' class="about-more">
                    <router-link to="/about/program">О программе</router-link>
                    <router-link to="/about/author">Об авторе</router-link>
                    <router-link to="/about/history">История</router-link>
                </div>
                </transition>
                <a v-if='getAuthNeed && !getAuth' @click="openEnterPass">Войти</a>
                <a v-else-if='getAuthNeed' @click="authExit">Выйти</a>
            </div>
        </div>
        <div class="right">
            <div class="window-buttons">
                <div @click="minimizeWindow" class="minimize-maximize-window">
                    <img class="svg" src="@/assets/hide-window.svg">
                </div>
                <div @click="fullScreenWindow" class="full-screen-window">
                    <img class="" v-if="!maximize" src="@/assets/maximize-window.svg">
                    <img class="" v-else src="@/assets/unmaximize-window.svg">
                </div>
                <div @click="closeWindow" class="close-window">
                    <img class="svg" src="@/assets/close-window.svg">
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import fs from "fs";
import jQuery from "jquery";
import { mapGetters,mapMutations } from 'vuex';
import PassWindow from "./../components/PassWindow";
export default {
    name: 'header',
    components:{
        PassWindow
    },
    data(){
        return{
            maximize: false,
            showSettingsMenu: false,
            showSettingsMenuEntered: false,
            showAboutMenu: false,
            showAboutMenuEntered: false,
            enterPassShow:false,
            waitSettingsMenuTimeOut: null,
            waitAboutMenuTimeOut: null,
        }
    },
    computed:{
        ...mapGetters([
            'getAuth',
            'getAuthNeed',
        ]),
        
    },
    created(){
        this.$electron.ipcRenderer.send('get-pass-status');
        this.$electron.ipcRenderer.on("get-pass-status-answer", (event,answer) =>{
            console.log("пришло!")
            console.log(answer);
            this.AuthNeedChange(answer);

        })
    },
    methods: {
        ...mapMutations([
            'AuthNeedChange', // `this.AuthNeedChange()` 
            'AuthChange',
        ]),
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      closeWindow(){
          this.$electron.ipcRenderer.sendSync('electron-close-win');
      },
      fullScreenWindow(){
          this.$electron.ipcRenderer.sendSync('electron-full-screen-win',{fullScreen:this.maximize});
          this.maximize = !this.maximize;
      },
      minimizeWindow(){
          this.$electron.ipcRenderer.sendSync('electron-minimize-win');
      },
      checkSettingsMenu(){
        this.waitSettingsMenuTimeOut = setTimeout(()=>{
              if(!this.showSettingsMenuEntered){
                  this.showSettingsMenu=false;
              }
          },200);
      },
      showSettingsMenuAction(){
          this.showSettingsMenu = true;
          clearTimeout(this.waitSettingsMenuTimeOut);
      },
      checkAboutMenu(){
        this.waitAboutMenuTimeOut = setTimeout(()=>{
              if(!this.showAboutMenuEntered){
                  this.showAboutMenu=false;
              }
          },200);
      },
      showAboutMenuAction(){
          this.showAboutMenu = true;
          clearTimeout(this.waitAboutMenuTimeOut);
      },
      closeEnterPass(){
          this.enterPassShow = false;
      },
      openEnterPass(){
          console.log("openEnterPass");
          this.enterPassShow = true;
      },
      authSuccess(){
          this.enterPassShow = false;
          this.AuthChange(true);
      },
      authExit(){
          this.AuthChange(false);
      }
    },
    mounted(){
        console.log(this.$electron);
        jQuery('img.svg').each(function(){
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

            jQuery.get(imgURL, function(data) {
                // Get the SVG tag, ignore the rest
                var $svg = jQuery(data).find('svg');

                // Add replaced image's ID to the new SVG
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }
                $svg = $svg.removeAttr("stroke");
                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');

                // Replace image with new SVG
                $img.replaceWith($svg);

            }, 'xml');

        });
    }
}
</script>

<style>
.header{
    height: 32px;
    max-width: 100%;
    background-color: #707070;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding-left: 4px;
    position: relative;
}
.header .left,.header .right{
    display: flex;
    align-items: center;
    height: 100%
}
.header .logo{
    -webkit-app-region: no-drag;
    color: #BBBBBB;
    position: relative;
    display: flex;
    flex-direction: column;
    align-self: center;
    border-right: solid 2px #BBBBBB;
    width: 125px;
    height: 85%;
    cursor: pointer;
}
.header .logo .main-text{
    position: absolute;
    top: -4px;
    font-size: 16px;
    cursor: pointer;
}
.header .logo .creator-text{
    position: absolute;
    top: 14px;
    left: 18px;
    font-size: 11px;
}

.header .break-line{
    height: 32px;
}
.header a{
    -webkit-app-region: no-drag;
    font-size: 18px;
    text-decoration: none;
    color: #BBBBBB;
    margin-left: 12px;
}
.header a:hover,.header .logo:hover{
    color: white;
    transition: 0.3s;
}
.header .window-buttons{
    display: flex;
    height: 100%;
}
.header .window-buttons > div{
    -webkit-app-region: no-drag;
    cursor: pointer;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}
.header .window-buttons .close-window:hover{
    background-color: red;
    transition: 0.3s;
}
.header .window-buttons .close-window:hover .svg g path{
    stroke: white;
}

.header .window-buttons .full-screen-window:hover, .window-buttons .minimize-maximize-window:hover{
    background-color: #bbb;
    transition: 0.3s;
}
.header .window-buttons .full-screen-window:hover path, .window-buttons .minimize-maximize-window:hover path{
    stroke: #f9f9f9;
}

.settings-more{
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 32px;
    left: 132px;
    background-color: #535353;
    padding: 6px;
}
.settings-more a{
    margin: 0;
}

.about-more{
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 32px;
    left: 242px;
    background-color: #535353;
    padding: 6px;
}
.about-more a{
    margin: 0;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active до версии 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>