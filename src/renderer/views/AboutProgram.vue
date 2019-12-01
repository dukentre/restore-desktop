<template>
    <div class="about">
        <div class="title">
            <img @click='$router.push("/")' src="@/assets/left-arrow.svg">
            <span>О программе</span>
        </div>
        <div class="text">
            <p>Restore Desktop 1.0.1</p>
            <p>Данная программа, как и сервер для неё, распространяется под MIT лицензией. Вы можете её изменять и использовать как хотите, хоть продавайте, но версия программы на моём <span @click="open('https://dukentre.ru')" class="link">сайте</span> и <span @click="open('https://github.com/dukentre/restore-desktop')" class="link">github</span> всегда будет бесплатной.</p>
            <p>Также при изменении программы не забудьте меня, Dukentre, указать как одного из её авторов.</p>
            <p>Ах да, программа предоставляется по принципу "как есть", т.е. я не несу никакой ответственности за её неработоспособность.</p>
            <br><br>
            <p>MIT License</p>
            <br>
            <p>Copyright (c) 2019 dukentre</p>
            <br>
            <p>Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:</p>
<br>
            <p>The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.</p>
<br>
            <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "about-program",
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