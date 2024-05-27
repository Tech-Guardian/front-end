<template>
    <div class="user-control">
      <div class="column user-form">
        <div class="form-section">
          <h2 class="section-title">Controle de Usuários</h2>
          <div class="form-group">
            <label for="nome" class="form-label">Nome:</label>
            <input type="text" v-model="nome" class="form-control" />
          </div>
          <div class="form-group">
            <label for="email" class="form-label">Email:</label>
            <input type="email" v-model="email" class="form-control" />
          </div>
          <div class="form-group">
            <label for="senha" class="form-label">Senha:</label>
            <input type="password" v-model="senha" class="form-control" />
          </div>
          <div class="form-group">
            <label for="autorizacoes" class="form-label">Autorizações:</label>
            <select v-model="autorizacoes" class="form-control" multiple>
              <option value="ROLE_USER">ROLE_USER</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN</option>
            </select>
          </div>
          <div class="button-group">
            <button @click="confirmAction(registerUser, 'Confirmar registro do Usuário?')" class="btn" :disabled="!isFormValid">Cadastrar</button>
            <button @click="confirmAction(updateUser, 'Confirmar atualização do Usuário?')" class="btn" :disabled="!isFormValid || !selectedUser">Atualizar</button>
            <button @click="resetForm" class="btn" :disabled="!isFormStarted">Reset</button>
          </div>
        </div>
      </div>
      <div class="column user-list">
        <h2 class="section-title">Usuários</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Autorizações</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="usuario in usuarios"
                :key="usuario.id"
                :class="{ selected: isSelected(usuario) }"
                @click="usuario && selectUser(usuario)"
              >
                <td>{{ usuario.nome }}</td>
                <td>{{ usuario.email }}</td>
                <td>{{ usuario.autorizacoes.map(auth => auth.nome).join(', ') }}</td>
                <td>
                  <button @click.stop="confirmAction(() => removeUser(usuario.id), 'Confirmar remoção do usuário?')" class="btn-remove" title="Remover">X</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <confirmation-popup v-if="showPopup" @confirm="executeAction" @cancel="cancelAction" :message="popupMessage" />
    </div>
  </template>
  
  <script lang="ts">
  import ConfirmationPopup from '@/components/ConfirmationPopup.vue';
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
  
  interface Autorizacao {
    id: number;
    nome: string;
  }
  
  interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    autorizacoes: Autorizacao[];
  }
  
  export default {
    components: {
      ConfirmationPopup,
    },
    setup() {
      const nome = ref('');
      const email = ref('');
      const senha = ref('');
      const autorizacoes = ref<string[]>([]);
      const selectedUser = ref<Usuario | null>(null);
      const usuarios = ref<Usuario[]>([]);
      const isFormValid = ref(false);
      const isFormStarted = ref(false);
      const isResetClicked = ref(false);
      const showPopup = ref(false);
      const popupMessage = ref('');
      const currentAction = ref<() => void>(() => {});
  
      const validateForm = () => {
        isFormValid.value = !!(nome.value && email.value && senha.value && autorizacoes.value.length > 0);
        isFormStarted.value = !!(nome.value || email.value || senha.value || autorizacoes.value.length > 0);
      };
  
      const loadData = async () => {
        const response = await axios.get('http://localhost:8080/cadastro');
        usuarios.value = response.data;
      };
  
      const registerUser = async () => {
        const novoUsuario = {
          nome: nome.value,
          email: email.value,
          senha: senha.value,
          autorizacoes: autorizacoes.value.map((auth: string) => ({ nome: auth })),
        };
        await axios.post('http://localhost:8080/usuarios', novoUsuario);
        await loadData();
        resetForm();
      };
  
      const updateUser = async () => {
        if (selectedUser.value) {
          const updatedUser = {
            nome: nome.value,
            email: email.value,
            senha: senha.value,
            autorizacoes: autorizacoes.value.map((auth: string) => ({ nome: auth })),
          };
          await axios.put(`http://localhost:8080/usuario/${selectedUser.value.id}`, updatedUser);
          await loadData();
          resetForm();
        }
      };
  
      const removeUser = async (id: number) => {
        await axios.delete(`http://localhost:8080/usuario/${id}`);
        await loadData();
      };
  
      const resetForm = () => {
        nome.value = '';
        email.value = '';
        senha.value = '';
        autorizacoes.value = [];
        selectedUser.value = null;
        isResetClicked.value = true;
        
        setTimeout(() => {
          isResetClicked.value = false;
        }, 0);
      };
  
      const selectUser = (usuario: Usuario) => {
        selectedUser.value = usuario;
        nome.value = usuario.nome;
        email.value = usuario.email;
        senha.value = usuario.senha;
        autorizacoes.value = usuario.autorizacoes.map(auth => auth.nome);
      };
  
      const confirmAction = (action: () => void, message: string) => {
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
  
      const isSelected = (usuario: Usuario | null) => {
        return usuario !== null && selectedUser.value !== null && usuario.id === selectedUser.value.id;
      };
  
      const isResetDisabled = computed(() => {
        return !isFormStarted.value || isResetClicked.value;
      });
  
      watch([nome, email, senha, autorizacoes], validateForm);
  
      onMounted(() => {
        loadData();
      });
  
      watch(isResetClicked, (value) => {
        if (value) {
          isFormStarted.value = false;
        }
      });
  
      return {
        nome,
        email,
        senha,
        autorizacoes,
        selectedUser,
        usuarios,
        isFormValid,
        isFormStarted,
        showPopup,
        popupMessage,
        registerUser,
        updateUser,
        removeUser,
        resetForm,
        selectUser,
        confirmAction,
        executeAction,
        cancelAction,
        isSelected,
        isResetDisabled,
      };
    },
  };
  </script>
  
  <style scoped>
  .user-control {
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    padding: 10px;
    width: 80%;
    height: max-content;
  }
  
  .column {
    display: flex;
    flex-direction: column;
  }
  
  .user-form {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 5px;
  }
  
  .user-list {
    background: #fff;
    padding: 20px;
    border-radius: 5px;
    border: 1px solid #ddd;
    overflow: hidden;
    display: flex;
    flex-direction: column;
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
    flex: 1;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
  }
  
  .button-group .btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .button-group .btn:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  .table-container {
    max-height: calc(100vh - 200px);
    width: 100%;
    overflow-y: auto;
    height: 70vh;
  }
  
  .data-table {
    width: calc(100% - 17px);
    border-collapse: collapse;
    font-size: 12px;
    table-layout: auto;
  }
  
  .data-table th,
  .data-table td {
    padding: 5px 10px;
    border: 1px solid #ddd;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .data-table th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  .data-table tr:hover {
    background-color: #f1f1f1;
  }
  
  .data-table tr.selected {
    border: 2px solid #000000;
  }
  
  .btn-remove {
    background-color: #c70014;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    transition: background-color 0.3s;
    justify-content: center;
    align-items: center;
    margin: 0;
  }
  
  .btn-remove:hover {
    background-color: #c82333;
  }
  
  .btn-remove::after {
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
  