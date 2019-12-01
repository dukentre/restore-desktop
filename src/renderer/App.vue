<template>
  <div id="app">
    <window-header v-if="location !== 'save-desktop'"/>
    <router-view></router-view>
  </div>
</template>

<script>
import WindowHeader from "@/components/Header";
  export default {
    name: 'restore-desktop',
    components:{
      WindowHeader,
    },
    mounted(){
      console.log(this.$route);
      this.$electron.ipcRenderer.on('fast-travel',(err,data)=>{//быстрый переход на нужную страницу
                console.log(err,data);
                if(data == "settings"){
                  this.$router.push("/settings/main");
                }else if(data == "save"){
                  this.$router.push("/save-desktop");
                }else if(data == "exit"){
                  this.$router.push("/exit");
                }
        });
    },
    computed:{
      location(){
        return this.$route.name;
      }
    }
  }
</script>

<style>
body{
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}
*{
  padding: 0;
  margin: 0;
}
  /* CSS */
</style>
