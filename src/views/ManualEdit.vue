<template>
  <div class="manual-edit">
    <div class="column filters">
      <div class="filter-section">
        <h2 class="section-title">Selecionar Dados</h2>
        <div class="form-group">
          <label for="redzone" class="form-label">Redzone:</label>
          <select v-model="selectedRedzone" class="form-control">
            <option value="">Selecione...</option>
            <option value="Redzone 1">Redzone 1</option>
            <option value="Redzone 2">Redzone 2</option>
            <option value="Redzone 3">Redzone 3</option>
          </select>
        </div>
        <div class="form-group">
          <label for="data" class="form-label">Data:</label>
          <input type="date" v-model="data" class="form-control" />
        </div>
        <div class="form-group">
          <label for="hora" class="form-label">Hora:</label>
          <input type="time" v-model="hora" class="form-control" />
        </div>
        <div class="form-group">
          <label for="quantidade" class="form-label">Quantidade:</label>
          <input type="number" v-model="quantidade" min="1" class="form-control" />
        </div>
        <div class="form-group">
          <label for="observacao" class="form-label">Observação:</label>
          <input type="text" v-model="observacao" class="form-control" />
        </div>
        <div class="button-group">
          <button @click="confirmAction(registerEntrance, 'Confirmar registro de Entrada?')" class="btn" :disabled="!isFormValid || isSelected(selectedRecord)">Entrada</button>
          <button @click="confirmAction(registerExit, 'Confirmar registro de Saída?')" class="btn" :disabled="!isFormValid || isSelected(selectedRecord)">Saída</button>
          <button @click="confirmAction(saveChanges, 'Confirmar salvamento das alterações?')" class="btn" :disabled="!isFormValid">Salvar</button>
          <button @click="resetForm" class="btn" :disabled="!isFormStarted">Reset</button>
        </div>
      </div>
    </div>
    <div class="column preview">
      <h2 class="section-title">Registros</h2>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Quantidade</th>
              <th>Observação</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="registro in registros"
              :key="registro.id"
              :class="{ selected: isSelected(registro) }"
              @click="registro && selectRecord(registro)"
            >
              <td>{{ formatarData(registro.data) }}</td>
              <td>{{ registro.hora }}</td>
              <td>{{ registro.quantidade }}</td>
              <td>{{ registro.obs }}</td>
              <td :class="{'entrada': registro.status === 'Entrada', 'saida': registro.status === 'Saída'}">{{ registro.status }}</td>
              <td>
                <button @click.stop="confirmAction(() => confirmRemoval(registro.id), 'Confirmar remoção do registro?')" class="btn-remove" title="Remover">X</button>
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
    ConfirmationPopup,
  },
  setup() {
    const selectedRedzone = ref('');
    const data = ref('');
    const hora = ref('');
    const quantidade = ref(1);
    const observacao = ref('');
    const selectedRecord = ref<Registro | null>(null);
    const registros = ref<Registro[]>([]);
    const isFormValid = ref(false);
    const isFormStarted = ref(false);
    const isResetClicked = ref(false);
    const showPopup = ref(false);
    const popupMessage = ref('');
    const currentAction = ref<() => void>(() => {});

    const validateForm = () => {
      isFormValid.value = !!(selectedRedzone.value && data.value && hora.value && quantidade.value > 0);
      isFormStarted.value = !!(selectedRedzone.value || data.value || hora.value || quantidade.value > 0 || observacao.value);
    };

    const loadData = async () => {
      const entradaResponse = await axios.get('http://localhost:8080/registro/entrada');
      const saidaResponse = await axios.get('http://localhost:8080/registro/saida');
      registros.value = [
        ...entradaResponse.data.map((entry: any) => ({
          id: entry.id,
          data: entry.dataEntrada,
          hora: entry.horaEntrada,
          obs: entry.obsEntrada,
          quantidade: entry.quantEntrada,
          status: 'Entrada'
        })),
        ...saidaResponse.data.map((entry: any) => ({
          id: entry.id,
          data: entry.dataSaida,
          hora: entry.horaSaida,
          obs: entry.obsSaida,
          quantidade: entry.quantSaida,
          status: 'Saída'
        })),
      ];
    };

    const registerEntrance = async () => {
      const entradas = Array.from({ length: quantidade.value }, () => ({
        dataEntrada: data.value,
        horaEntrada: hora.value,
        quantEntrada: 1,
        status: selectedRedzone.value,
        obsEntrada: observacao.value,
      }));
      await Promise.all(entradas.map((entrada) => axios.post('http://localhost:8080/entrada', entrada)));
      await loadData();
      resetForm();
    };

    const registerExit = async () => {
      const saidas = Array.from({ length: quantidade.value }, () => ({
        dataSaida: data.value,
        horaSaida: hora.value,
        quantSaida: 1,
        status: selectedRedzone.value,
        obsSaida: observacao.value,
      }));
      await Promise.all(saidas.map((saida) => axios.post('http://localhost:8080/saida', saida)));
      await loadData();
      resetForm();
    };

    const saveChanges = async () => {
      if (selectedRecord.value) {
        const updatedRecord = {
          dataEntrada: selectedRecord.value.status === 'Entrada' ? data.value : undefined,
          horaEntrada: selectedRecord.value.status === 'Entrada' ? hora.value : undefined,
          quantEntrada: selectedRecord.value.status === 'Entrada' ? quantidade.value : undefined,
          obsEntrada: selectedRecord.value.status === 'Entrada' ? observacao.value : undefined,
          dataSaida: selectedRecord.value.status === 'Saída' ? data.value : undefined,
          horaSaida: selectedRecord.value.status === 'Saída' ? hora.value : undefined,
          quantSaida: selectedRecord.value.status === 'Saída' ? quantidade.value : undefined,
          obsSaida: selectedRecord.value.status === 'Saída' ? observacao.value : undefined,
        };

        const endpoint = selectedRecord.value.status === 'Entrada' ? 'entrada' : 'saida';
        await axios.put(`http://localhost:8080/${endpoint}/${selectedRecord.value.id}`, updatedRecord);
        await loadData();
        resetForm();
      }
    };

    const resetForm = () => {
      selectedRedzone.value = '';
      data.value = '';
      hora.value = '';
      quantidade.value = 1;
      observacao.value = '';
      selectedRecord.value = null;
      isResetClicked.value = true;
      
      setTimeout(() => {
        isResetClicked.value = false;
      }, 0);
    };

    const selectRecord = (registro: Registro) => {
      selectedRecord.value = registro;
      selectedRedzone.value = registro.status;
      data.value = registro.data;
      hora.value = registro.hora;
      quantidade.value = registro.quantidade;
      observacao.value = registro.obs;
    };

    const confirmRemoval = async (id: number) => {
      const endpoint = registros.value.find((registro) => registro.id === id)?.status === 'Entrada' ? 'entrada' : 'saida';
      await axios.delete(`http://localhost:8080/${endpoint}/${id}`);
      await loadData();
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

    const formatarData = (dataString: string) => {
      const [ano, mes, dia] = dataString.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    const registrosOrdenados = computed(() =>
      registros.value.slice().sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.hora}`);
        const dataB = new Date(`${b.data}T${b.hora}`);
        return dataB.getTime() - dataA.getTime();
      })
    );

    watch([selectedRedzone, data, hora, quantidade, observacao], validateForm);

    onMounted(() => {
      loadData();
    });

    const isSelected = (registro: Registro | null) => {
      return registro !== null && selectedRecord.value !== null &&
        registro.id === selectedRecord.value.id &&
        registro.status === selectedRecord.value.status;
    };

    const isResetDisabled = computed(() => {
      return !isFormStarted.value || isResetClicked.value;
    });

    watch(isResetClicked, (value) => {
      if (value) {
        isFormStarted.value = false;
      }
    });

    return {
      selectedRedzone,
      data,
      hora,
      quantidade,
      observacao,
      selectedRecord,
      registros: registrosOrdenados,
      isFormValid,
      isFormStarted,
      showPopup,
      popupMessage,
      registerEntrance,
      registerExit,
      saveChanges,
      resetForm,
      selectRecord,
      confirmRemoval,
      executeAction,
      cancelAction,
      formatarData,
      isSelected,
      isResetDisabled,
      confirmAction,
    };
  },
};
</script>

<style scoped>
.manual-edit {
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

.filters {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 5px;
}

.preview {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #ddd;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.filter-section {
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
  max-height: calc(100vh - 200px); /* Defina a altura máxima da tabela */
  width: 100%;
  overflow-y: auto; /* Adicione a propriedade de rolagem vertical */
  height: 70vh;
}

.data-table {
  width: calc(100% - 17px); /* Adicione margem da barra de rolagem para evitar que a tabela seja cortada */
  border-collapse: collapse;
  font-size: 12px;
  table-layout: auto /* Define a largura da coluna igualmente */
}

.data-table th,
.data-table td {
  padding: 5px 10px;
  border: 1px solid #ddd;
  text-align: center; /* Centraliza os dados */
  white-space: nowrap; /* Impede que o texto seja quebrado em várias linhas */
  overflow: hidden; /* Oculta qualquer conteúdo extra além da largura da célula */
  text-overflow: ellipsis; /* Adiciona reticências (...) para indicar conteúdo oculto */
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

.data-table .entrada {
  background: linear-gradient(to right, #d4edda, #c3e6cb);
}

.data-table .saida {
  background: linear-gradient(to right, #f8d7da, #f5c6cb);
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
