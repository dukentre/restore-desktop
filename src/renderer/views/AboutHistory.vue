<template>
    <div class="about">
        <div class="title">
            <img @click='$router.push("/")' src="@/assets/left-arrow.svg">
            <span>История создания</span>
        </div>
        <div class="text">
            <p>Изначально программа задумывалась для поддержания порядка на рабочем столе компьютеров в учебном заведении. Там где я учусь (2019 год), студенты часто оставляют работы и меняют обои на рабочем столе, поэтому мой преподаватель тонко мне намекнул, что неплохо было бы создать такую программу, которая могла бы восстанавливать рабочий стол после перезагрузки.</p>
            <p>Задача была поставлена, и я тем же днём принялся рисовать интерфейс программы, над которым особо не старался, как вы можете видеть.</p>
            <p>Так как я ярый сторонник языка JavaScript, поэтому именно его я использовал в качестве основного, вторым языком стал C#, который отвечает за взаимодействие с реестром windows.</p>
            <p>Набор технологических средств получился следующий: Node js(12.4.0), Electron js(6.1.5), Edge js, Vue js. Указанные версии важны для совместимости с Edge. Были ещё мелкие пакеты, о которых можно узнать, заглянув в исходный код программы, который находиться на <span @click="open('https://github.com/dukentre/restore-desktop')" class="link">GitHub</span></p>
            <p>Спустя две недели я сделал beta-версию программы, которая восстанавливала рабочий стол при запуске windows, могла быть защищена паролем, но чего-то не хватало. </p>
            <p>Не хватало возможности восстанавливать все рабочие столы по указке преподавателя. Задача поставлена - выполняем.</p>
            <p>Добавляем в программу модуль socket.io для работы (очевидно) с сокетами. Создаём на node js сервер (я уже говорил, что очень люблю JavaScript?) с панелью управления. Она также доступна на моём <span @click="open('https://dukentre.ru/restore-desktop/manage/')" class="link">сайте</span>.</p>
            <p>Интересный факт: дизайн был бессовестно украден у авторизации яндекса.</p>
            <p>Соединение между компьютерами происходит через комнаты. Комнату может создать любой, также как и присоединиться к ней.</p>
            <p>Возможность реализована, теперь остаётся добавить мелкие фишки, например, очистка корзины и загрузок; и исправить баги.</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "about-history",
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
.text{
    overflow: auto;
    max-height: calc(100vh - 75px);
}
</style>