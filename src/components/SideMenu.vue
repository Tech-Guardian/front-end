<template>
  <aside :class="{ 'is-expanded': isExpanded }">
    <div class="menu">
      <router-link v-for="item in menuItems" :key="item.to" :to="item.to" class="button">
        <div class="icon-wrapper">
          <img :src="item.icon" :alt="item.text + ' Icon'">
        </div>
        <span class="text">{{ item.text }}</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import myAccountIcon from '@/components/icons/account.png';
import userControlIcon from '@/components/icons/auth.png';
import configRedzoneIcon from '@/components/icons/config.png';
import dashboardIcon from '@/components/icons/dashboard.png';
import manualEditIcon from '@/components/icons/edit.png';
import reportsIcon from '@/components/icons/report.png';

const isExpanded = ref(localStorage.getItem('isExpanded') === 'true');

// Referencie os ícones importados no array menuItems
const menuItems = [
  { to: '/dashboard', icon: dashboardIcon, text: 'Dashboard' },
  { to: '/reports', icon: reportsIcon, text: 'Relatórios' },
  { to: '/manualEdit', icon: manualEditIcon, text: 'Controle Manual' },
  { to: '/userControl', icon: userControlIcon, text: 'Controle de Usuários' },
  { to: '/configRedzone', icon: configRedzoneIcon, text: 'Configurar Redzone' },
  { to: '/myAccount', icon: myAccountIcon, text: 'Minha Conta' }
];

onMounted(() => {
  adjustMenuWidth();
  window.addEventListener('resize', adjustMenuWidth);
});

const adjustMenuWidth = () => {
  const menu = document.querySelector('.menu');
  if (menu) {
    const maxWidth = Math.max(...menuItems.map(item => getTextWidth(item.text)));
    menu.style.width = `${maxWidth + 50}px`;
  }
};

const getTextWidth = (text) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '14px Manrope';
  return context.measureText(text).width;
};
</script>

<style scoped lang="scss">
aside {
  background-image: linear-gradient(145deg, #3a6cb6, #011F37);
  color: #ffffff;
  min-height: calc(100vh - 65px);
  padding: 20px;
  transition: 0.2s ease-in-out;
  position: fixed;
  top: 65px;
  left: 0;
  bottom: 0;
  z-index: 998;
  overflow-y: auto; /* Adiciona rolagem vertical quando necessário */
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.button {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  transition: 0.2s ease-in-out;
  padding: 10px;
  border-radius: 5px;
  width: fit-content;

  &:hover {
    background-color: #444;
  }
}

.icon-wrapper {
  width: 16px;
  height: 16px;
}

img {
  width: 100%;
  height: auto;
}

.text {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  white-space: nowrap;
}

.is-expanded {
  width: 250px;
}
</style>
