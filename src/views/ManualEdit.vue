<template>
  <div class="manual-edit">
    <div class="column filters">
      <div class="filter-section">
        <h2 style="font-weight: lighter;">Selecionar Dados</h2>
        <div class="form-group">
          <label for="redzone">Redzone:</label>
          <select v-model="selectedRedzone">
            <option value="">Selecione...</option>
            <option value="Redzone 1">Redzone 1</option>
            <option value="Redzone 2">Redzone 2</option>
            <option value="Redzone 3">Redzone 3</option>
          </select>
        </div>
        <div class="form-group">
          <label for="data">Data:</label>
          <input type="date" v-model="data" />
        </div>
        <div class="form-group">
          <label for="hora">Hora:</label>
          <input type="time" v-model="hora" />
        </div>
        <div class="form-group">
          <label for="quantidade">Quantidade:</label>
          <input type="number" v-model="quantidade" />
        </div>
        <div class="form-group">
          <label for="observacao">Observação:</label>
          <input type="text" v-model="observacao" />
        </div>
      </div>
      <div class="button-group">
        <button @click="registerEntrance" class="btn" :disabled="!isFormValid">Entrada</button>
        <button @click="registerExit" class="btn" :disabled="!isFormValid">Saída</button>
        <button @click="saveChanges" class="btn" :disabled="!selectedRecord">Salvar</button>
        <button @click="confirmRemoval" class="btn" :disabled="!selectedRecord">Remover</button>
      </div>
    </div>
    <div class="column preview">
      <DataTable @select-record="selectRecord" />
    </div>
  </div>
</template>

<script lang="ts">
import DataTable from '@/components/DataTable.vue';
import axios from 'axios';
import { ref, watch } from 'vue';

interface Registro {
  id: number;
  data: string;
  hora: string;
  obs: string;
  quantidade: number;
  status: string;
}

export default {
  components: {
    DataTable,
  },
  setup() {
    const selectedRedzone = ref('');
    const data = ref('');
    const hora = ref('');
    const quantidade = ref(0);
    const observacao = ref('');
    const selectedRecord = ref<Registro | null>(null);

    const isFormValid = ref(false);

    const validateForm = () => {
      isFormValid.value = !!(selectedRedzone.value && data.value && hora.value);
    };

    const registerEntrance = async () => {
      if (isFormValid.value) {
        const newEntry = {
          dataEntrada: data.value,
          horaEntrada: hora.value,
          quantEntrada: quantidade.value,
          status: selectedRedzone.value,
          obsEntrada: observacao.value,
        };
        await axios.post('http://localhost:8080/entrada', newEntry);
        refreshData();
      }
    };

    const registerExit = async () => {
      if (isFormValid.value) {
        const newExit = {
          dataSaida: data.value,
          horaSaida: hora.value,
          quantSaida: quantidade.value,
          status: selectedRedzone.value,
          obsSaida: observacao.value,
        };
        await axios.post('http://localhost:8080/saida', newExit);
        refreshData();
      }
    };

    const saveChanges = async () => {
      if (selectedRecord.value) {
        const updatedRecord = {
          ...selectedRecord.value,
          data: data.value,
          hora: hora.value,
          quantidade: quantidade.value,
          obs: observacao.value,
          status: selectedRedzone.value,
        };

        if (selectedRecord.value.status === 'Entrada') {
          await axios.put(`http://localhost:8080/entrada/${selectedRecord.value.id}`, updatedRecord);
        } else {
          await axios.put(`http://localhost:8080/saida/${selectedRecord.value.id}`, updatedRecord);
        }
        refreshData();
      }
    };

    const confirmRemoval = async () => {
      if (selectedRecord.value) {
        if (selectedRecord.value.status === 'Entrada') {
          await axios.delete(`http://localhost:8080/entrada/${selectedRecord.value.id}`);
        } else {
          await axios.delete(`http://localhost:8080/saida/${selectedRecord.value.id}`);
        }
        refreshData();
      }
    };

    const selectRecord = (registro: Registro) => {
      selectedRecord.value = registro;
      selectedRedzone.value = registro.status;
      data.value = registro.data;
      hora.value = registro.hora;
      quantidade.value = registro.quantidade;
      observacao.value = registro.obs;
      validateForm();
    };

    const refreshData = () => {
      selectedRecord.value = null;
      selectedRedzone.value = '';
      data.value = '';
      hora.value = '';
      quantidade.value = 0;
      observacao.value = '';
      validateForm();
    };

    watch([selectedRedzone, data, hora], validateForm);

    return {
      selectedRedzone,
      data,
      hora,
      quantidade,
      observacao,
      selectedRecord,
      isFormValid,
      registerEntrance,
      registerExit,
      saveChanges,
      confirmRemoval,
      selectRecord,
      refreshData,
    };
  },
};
</script>

<style scoped>
.manual-edit {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  padding: 10px;
  width: 100%;
  height: calc(100vh - 60px); /* Ajuste para altura dinâmica */
}

.column {
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.btn {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
