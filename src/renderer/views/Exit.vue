<template>
    <div class="exit">
        <div class="title">
            <img @click='$router.push("/")' src="@/assets/left-arrow.svg">
            <span>Выход из программы</span>
            <div v-if="getAuthNeed && !getAuth">  |Вы не авторизованы</div>
        </div>
        <button @click="exit" v-if="(getAuthNeed && getAuth) || getAuthNeed == false">Выйти из программы</button>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name:'exit',
    computed:{
        ...mapGetters([
            'getAuth',
            'getAuthNeed',
        ]),
    },
    methods:{
        exit(){
            this.$electron.ipcRenderer.send('exit-app');
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

button{
    border: none;
    background-color: #707070;
    font-size: 16px;
    padding: 4px;
    color: white;
    cursor: pointer;
    margin-left: 12px;
    margin-top: 12px;
}
button:hover{
    background-color: #535353;
    transition: 0.3s;
}
</style>