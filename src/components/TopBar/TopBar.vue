<template>
    <div class = "container">
      <div class="text"> Project Game </div>
      <div class = "right-side">
        <div class="text" v-if="groupN !== null && groupN !== 0">Group {{ groupN }}</div>
        <button class="logout-button"
          @click="logout()" >Logout</button>
    </div>
    </div>
</template>

<script setup lang="ts">
var groupN = 5; //TODO: get group number from login

function logout(){
    //TODO: logout
}

</script>
  
<style scoped lang="postcss">

.right-side{
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
}

.container{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    width: 100%;
    border: 1px solid #000000;
}
.text{
    font-size: 20px;
    font-weight: bold;
    color: #000000;
    text-align: center;
    margin: 10px;
    padding: 10px;
    border-radius: 10px;
    width: 200px;
    height: 50px;
    background-color: #FFFFFF;
}

.logout-button{
    font-size: 20px;
    font-weight: bold;
    color: #000000;
    text-align: center;
    margin: 10px;
    padding: 10px;
    border: 2px solid #000000;
    border-radius: 10px;
    width: 200px;
    height: 50px;
    background-color: #FFFFFF;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
</style>
  