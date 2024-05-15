<template>
  <div class="app">
    <Header />
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
</script>

<style>
.app {
  background-color: #ffffff; /* Define o background para todo o aplicativo */
  position: relative; /* Permite que os elementos filhos tenham posicionamento relativo ao App */
}

.btn {
  color: #ffffff;
  border: none;
  font-weight: bold;
  font-size: 12px;
  border-radius: 2px;
  background: #5d5dff;
  box-shadow: 0px 10px 15px -3px rgba(21, 23, 25, 0.16);
  height: 40px;
  width: 80px;
}
.select-option {
  border-radius: 8px;
  width: auto;
  height: 32px;
}

body {
  color: #333333;
  font-size: 18px;
  font-family: Arial, Helvetica, sans-serif;
}
</style>

<style scoped>

/* Aplique estilos sobrepostos */

</style>
