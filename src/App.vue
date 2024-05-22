<template>
  <div class="app">
    <Header />
    <SideMenu />
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import SideMenu from './components/SideMenu.vue';

let pageOpened = false;

function openBrowser() {
  if (!pageOpened) {
    console.log('Abrindo a página...');
    pageOpened = true;
  } else {
    console.log('A página já está aberta.');
  }
}

function closeBrowser() {
  if (pageOpened) {
    console.log('Fechando a página...');
    pageOpened = false;
  } else {
    console.log('A página não está aberta.');
  }
}

onMounted(() => {
  openBrowser();
});

onUnmounted(() => {
  closeBrowser();
});
</script>

<style>
.app {
  background-color: #ffffff;
  display: flex;
  min-height: 95vh;
}

.main-content {
  flex: 1;
  margin-left: 250px; /* Ajuste conforme a largura do SideMenu */
  padding-top: 65px; /* Ajuste conforme a altura do Header */
  padding-bottom: 10px;
}

body {
  color: #333333;
  font-size: 18px;
  font-family: Arial, Helvetica, sans-serif;
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
</style>

<style scoped>
/* Aplique estilos sobrepostos */
</style>
