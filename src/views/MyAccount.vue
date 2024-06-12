<template>
    <div class="my-account" v-if="isDataLoaded">
      <form class="form-section" @submit.prevent="atualizarDados">
        <h2 class="section-title">Minha Conta</h2>
        <div class="form-group">
          <label for="nome" class="form-label">Nome:</label>
          <input type="text" v-model="editedUsuario.nome" class="form-control" autocomplete="name" />
        </div>
        <div class="form-group">
          <label for="email" class="form-label">Email:</label>
          <input type="email" v-model="editedUsuario.email" class="form-control" autocomplete="username" />
        </div>
        <div class="form-group">
          <label for="senhaAtual" class="form-label">Senha Atual:</label>
          <input type="password" v-model="senhaAtual" class="form-control" autocomplete="current-password" />
        </div>
        <div class="form-group">
          <label for="novaSenha" class="form-label">Nova Senha:</label>
          <input type="password" v-model="novaSenha" class="form-control" autocomplete="new-password" />
        </div>
        <div class="button-group">
          <button type="submit" class="btn" :disabled="!isFormValid">Atualizar</button>
        </div>
      </form>
      <confirmation-popup v-if="showPopup" @confirm="executeAction" @cancel="cancelAction" :message="popupMessage" />
    </div>
</template>

<script>
import axios from '@/axios';
import ConfirmationPopup from '@/components/ConfirmationPopup.vue';
import { computed, onMounted, ref } from 'vue';

export default {
    components: {
        ConfirmationPopup,
    },
    setup() {
        const senhaAtual = ref('');
        const novaSenha = ref('');
        const showPopup = ref(false);
        const popupMessage = ref('');
        const isDataLoaded = ref(false);
        const currentAction = ref(() => {});
        const errorMessage = ref('');

        const editedUsuario = ref({
            nome: '',
            email: '',
        });

        const isFormValid = computed(() => {
            return !!editedUsuario.value.nome && !!editedUsuario.value.email;
        });

        const fetchUserData = async () => {
            try {
                const response = await axios.get('/usuario/me');
                editedUsuario.value = response.data;
                isDataLoaded.value = true;
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    errorMessage.value = 'Você não está autenticado. Faça login novamente.';
                } else {
                    errorMessage.value = 'Ocorreu um erro ao recuperar os dados do usuário. Tente novamente mais tarde.';
                }
                console.error('Erro ao buscar dados do usuário:', error);
            }
        };

        const atualizarDados = async () => {
            try {
                const data = {
                    nome: editedUsuario.value.nome,
                    email: editedUsuario.value.email,
                    senhaAtual: senhaAtual.value,
                    novaSenha: novaSenha.value,
                };
                await axios.put('/usuario/me', data);
                await fetchUserData();
                senhaAtual.value = '';
                novaSenha.value = '';
                showPopup.value = false;
                popupMessage.value = 'Dados atualizados com sucesso!';
            } catch (error) {
                showPopup.value = true;
                popupMessage.value = 'Erro ao atualizar os dados!';
            }
        };

        const confirmAction = (action, message) => {
            popupMessage.value = message;
            currentAction.value = action;
            showPopup.value = true;
        };

        const executeAction = () => {
            currentAction.value();
            showPopup.value = false;
        };

        const cancelAction = () => {
            showPopup.value = false;
        };

        onMounted(() => {
            fetchUserData();
        });

        return {
            senhaAtual,
            novaSenha,
            showPopup,
            popupMessage,
            editedUsuario,
            isFormValid,
            atualizarDados,
            confirmAction,
            executeAction,
            cancelAction,
            isDataLoaded,
            errorMessage
        };
    },
};
</script>

<style scoped>
.my-account {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 5px;
}

.form-section {
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: lighter;
}

.form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.button-group {
    display: flex;
    gap: 10px;
}

.button-group .btn {
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100px;
}

.button-group .btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.button-group .btn:hover:not(:disabled) {
    background-color: #0056b3;
}
</style>
