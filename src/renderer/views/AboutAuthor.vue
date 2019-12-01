<template>
    <div class="about">
        <div class="title">
            <img @click='$router.push("/")' src="@/assets/left-arrow.svg">
            <span>Об авторе</span>
        </div>
        <div class="text">
            <p>Привет, я Дукентр, создатель этой программы. На момент её создания (01.12.19) мне 17 лет.</p>
            <p>Если я тебе зачем-то нужен, то можешь связаться со мной в <span class="link" @click="open('https://vk.com/dukentreg')">вк</span>.
            Также у меня есть свой сайт <span class="link" @click="open('https://dukentre.ru')">dukentre.ru</span>
             и почта dukentre@dukentre.ru, которую я проверяю крайне редко, лучше пиши в вк.
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: "about-author",
    data(){
        return{
        }
    },
    methods:{
        open (link) {
            this.$electron.shell.openExternal(link)
        },
    }
}
</script>

<style scoped>
.about{
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
.link{
    text-decoration: underline;
    cursor: pointer;
}
</style>