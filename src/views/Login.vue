<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="userEmail">Email:</label>
          <input type="text" v-model="userEmail" id="userEmail" required autocomplete="email">
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" v-model="password" id="password" required autocomplete="current-password">
        </div>
        <button type="submit">Login</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'; // Certifique-se de que está configurado corretamente
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Login',
  setup() {
    const userEmail = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const router = useRouter();

    const login = async () => {
      errorMessage.value = ''; // Resetando a mensagem de erro antes de tentar o login

      if (!userEmail.value || !password.value) {
        errorMessage.value = 'Por favor, preencha todos os campos.';
        return;
      }

      try {
        const response = await axios.post('http://localhost:8080/login', {
          // Convertendo o email para minúsculas antes de enviar
          userEmail: userEmail.value.trim().toLowerCase(),
          password: password.value.trim()
        });
        
        // Verifica se o token foi retornado
        const token = response.data.token;
        if (token) {
          localStorage.setItem('token', response.data.token);
          router.push('/dashboard');
        } else {
          errorMessage.value = 'Ocorreu um erro ao fazer login. Tente novamente.';
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          errorMessage.value = 'Credenciais inválidas. Por favor, verifique seu email e senha.';
        } else {
          errorMessage.value = 'Ocorreu um erro ao fazer login. Por favor, tente novamente mais tarde.';
        }
        console.error('Erro ao fazer login:', error);
      }
    };

    return { userEmail, password, errorMessage, login };
  }
};
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #011F37, #0067A2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.login-box {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  width: 60%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 10px;
}

label {
  display: block;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 12px;
}
</style>
