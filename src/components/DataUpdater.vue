<template>
    <!-- Componente vazio, não precisa de template -->
  </template>
  
  <script>
  import { onMounted, ref } from 'vue';
  
  export default {
    setup() {
      const updateInterval = 1000; // Intervalo de atualização em milissegundos
  
      // Definindo variável de estado para controlar a atualização dos dados
      const shouldUpdate = ref(true);
  
      // Função para interromper a atualização após o componente ser desmontado
      onMounted(() => {
        const timer = setInterval(() => {
          // Verifica se o componente ainda está montado antes de atualizar os dados
          if (shouldUpdate.value) {
            // Emitir evento para indicar que é hora de atualizar os dados
            // Este evento será ouvido pelos componentes que precisam ser atualizados
            // Cada componente decidirá o que fazer com este evento
            emit('update-data');
          }
        }, updateInterval);
  
        // Função para limpar o intervalo quando o componente for desmontado
        return () => clearInterval(timer);
      });
  
      // Retorna a variável de estado e a função para controlar a atualização dos dados
      return {
        shouldUpdate,
      };
    },
  };
  </script>
  