<template>
    <div v-if='show' class="alert-window">
        <div class="bg"></div>
        <div class="window">
            <div class="title">{{this.title}}</div>
            <div class="description">{{this.description}}</div>
            <div class="buttons">
                <button @click='$emit("yes")' class="ok-btn">Да</button>
                <button @click='$emit("no")' class="no-btn">Нет</button>
            </div>
        </div>
        
    </div>
</template>

<script>
export default {
    name: "alert-window",
    props: ['title','description','show'],
}
</script>

<style scoped>
.alert-window,.bg{
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
    height: 260px;
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
</style>