<template>
  <div>
    <div v-if="showNotifications || showLogoutMenu || showNotificationPopup" class="overlay" @click="closeMenus"></div>
    <header class="header" @click="handleHeaderClick">
      <div class="logo-container">
        <img class="logo" src="@/assets/icons/logo-6.png" alt="Logo da empresa" />
      </div>
      <div class="symbol-container">
        <img class="symbol" src="@/assets/icons/logo-4.png" alt="Símbolo" />
      </div>
      <div class="icons-container">
        <!-- Ícone de Notificação -->
        <div class="notification-icon" @click.stop="toggleNotifications">
          <img class="legend-icon" src="@/assets/icons/cart.png" alt="Notificações" title="Notificações" />
          <div v-if="showNotifications" class="notifications-dropdown" @click.stop>
            <div v-for="notification in notifications" :key="notification.id" class="notification" @click="openNotification(notification)">
              {{ notification.title }}
            </div>
          </div>
        </div>
        <!-- Ícone de Logout / Minha Conta -->
        <div class="logout-icon" @click.stop="toggleLogoutMenu">
          <img class="legend-icon" src="@/assets/icons/exit2.png" alt="Minha conta" title="Sair" />
          <div v-if="showLogoutMenu" class="logout-dropdown" @click.stop>
            <div @click="goToMyAccount">Minha Conta</div>
            <div @click="logout">Sair</div>
          </div>
        </div>
      </div>
    </header>
    <div v-if="showNotificationPopup" class="notification-popup" @click.stop>
      <button class="close-btn" @click="closeNotificationPopup">X</button>
      <div class="popup-content">
        <h3>{{ selectedNotification?.title }}</h3>
        <p>{{ selectedNotification?.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface Notification {
  id: number;
  title: string;
  content: string;
}

const showNotifications = ref(false);
const showLogoutMenu = ref(false);
const showNotificationPopup = ref(false);
const selectedNotification = ref<Notification | null>(null);
const notifications = ref<Notification[]>([
  { id: 1, title: 'Notificação 1', content: 'Conteúdo da notificação 1' },
  { id: 2, title: 'Notificação 2', content: 'Conteúdo da notificação 2' },
]);

const router = useRouter();

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showLogoutMenu.value = false; // Fecha o menu de logout se estiver aberto
};

const toggleLogoutMenu = () => {
  showLogoutMenu.value = !showLogoutMenu.value;
  showNotifications.value = false; // Fecha as notificações se estiverem abertas
};

const openNotification = (notification: Notification) => {
  selectedNotification.value = notification;
  showNotificationPopup.value = true;
};

const closeMenus = () => {
  showNotifications.value = false;
  showLogoutMenu.value = false;
  showNotificationPopup.value = false;
};

onMounted(() => {
  // Adiciona um ouvinte de evento de clique ao elemento body
  document.body.addEventListener('click', closeMenus);
});

onUnmounted(() => {
  // Remove o ouvinte de evento de clique ao desmontar o componente
  document.body.removeEventListener('click', closeMenus);
});

const handleHeaderClick = (event: MouseEvent) => {
  closeMenus(); // Fecha os menus e o popup
  event.stopPropagation(); // Para a propagação do evento para evitar que chegue ao body
};

const closeNotificationPopup = () => {
  showNotificationPopup.value = false;
};

const goToMyAccount = () => {
  router.push('/myAccount');
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('password');
  router.push('/login');
};
</script>

<style scoped lang="scss">
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  background: linear-gradient(90deg, #011F37, #0067A2);
  height: 65px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  height: 100%;
  display: flex;
  align-items: center;
}

.logo {
  max-height: 100%;
  width: auto;
}

.symbol-container {
  position: absolute;
  bottom: -70%;
  left: 50%;
  transform: translateX(-50%);
}

.symbol {
  height: 120px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.5));
}

.icons-container {
  display: flex;
  align-items: center;
  gap: 20px; /* Ajusta a distância entre os ícones */
  margin-right: 50px;
}

.notification-icon,
.logout-icon {
  position: relative;
  cursor: pointer;
}

.notifications-dropdown,
.logout-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: linear-gradient(145deg, #3a6cb6, #011F37);
  color: #ffffff;
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
  font-family: 'Manrope', sans-serif;
}

.notifications-dropdown {
  width: 250px;
}

.notification {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.3s ease;
}

.notification:hover {
  background-color: #4a90e2; /* Cor de destaque ao passar o mouse */
}

.logout-dropdown {
  width: 150px;
}

.logout-dropdown div {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.3s ease;
}

.logout-dropdown div:hover {
  background-color: #4a90e2; /* Cor de destaque ao passar o mouse */
}

.logout-icon img {
  height: 40px;
  width: 40px;
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.5)); /* Adiciona um efeito de sombra */
}

.notification-icon img {
  height: 35px;
  width: 35px;
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.5)); /* Adiciona um efeito de sombra */
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.notification-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 20px;
  z-index: 1001;
  max-width: 90%;
  max-height: 80%;
  overflow-y: auto;
}

.popup-content {
  font-family: 'Manrope', sans-serif;
}

.popup-content h3 {
  margin-top: 0;
  font-size: 24px;
  color: #011F37;
}

.popup-content p {
  font-size: 16px;
  color: #333333;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #011F37;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ff0000;
}

.legend-icon::after {
  content: attr(title);
  position: absolute;
  top: -20px;
  background-color: #333;
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s;
}
</style>
