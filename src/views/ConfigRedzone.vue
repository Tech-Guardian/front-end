<template>
  <div class="main-container">
    <div class="top-container">
      <!-- Formulário para adicionar Redzone -->
      <div class="redzone-container">
        <h2 class="section-title">Gerenciar Redzone</h2>
        <div class="redzone-form">
          <!-- Primeira coluna: Nome, Área, Botões -->
          <div class="column">
            <div class="form-group">
              <label for="redzone-name" class="form-label">Nome:</label>
              <input type="text" id="redzone-name" v-model="redzoneName" class="form-control" />
              <div v-if="selectedRedzone && !redzoneName" class="error-message">Preencher Informação</div>
            </div>
            <div class="form-group">
              <div class="form-area-cam">
                <label for="area" class="form-label">Área:</label>
                <div class="remove-button">
                  <button class="btn-remove" @click="confirmRemoveSelectedAreas">Remover</button>
                </div>
              </div>
              <select v-model="selectedArea" class="form-control" @change="handleAreaSelection">
                <option value="" disabled>Selecione...</option>
                <option v-for="area in areas" :key="area.id" :value="area.name">{{ area.name }}</option>
              </select>
              <div class="new-area-group">
                <button @click="confirmAddNewArea" class="form-control btn-add">+</button>
                <input type="text" v-model="newArea" class="form-control" placeholder="Nova Área" />
              </div>
              <div v-if="selectedRedzone && !selectedArea" class="error-message">Preencher Informação</div>
            </div>
            <div class="button-group">
              <button @click="confirmAction('add')" class="btn" :disabled="!isAddButtonEnabled || selectedRedzone">Adicionar</button>
              <button @click="confirmAction('update')" class="btn" :disabled="!isUpdateButtonEnabled">Atualizar</button>
              <button @click="resetForm" class="btn" :disabled="isResetDisabled">Reset</button>
            </div>
          </div>
          <!-- Segunda coluna: Câmeras -->
          <div class="column">
            <div class="form-group">
              <div class="form-area-cam">
                <label for="cameras" class="form-label">Câmeras:</label>
                <div class="remove-button">
                  <button class="btn-remove" @click="removeSelectedCameras">Remover</button>
                </div>
              </div>
              <select v-model="selectedCameras" multiple class="form-control" @change="handleCameraSelection">
                <option v-for="camera in cameras" :key="camera.id" :value="camera.ip">{{ camera.ip }}</option>
              </select>
              <div class="new-camera-group">
                <button @click="addNewCameraToList" class="form-control btn-add" :disabled="selectedCameras.length >= 4">+</button>
                <label for="new-camera" class="form-label">Novo IP de CAM (Números):</label>
                <input type="text" id="new-camera" v-model="newCamera" @input="formatCameraNumber" maxlength="15" class="form-control" placeholder="___.___.___.___" :disabled="selectedCameras.length >= 4" @blur="clearCameraExistsError" />
              </div>
              <div v-if="cameraExistsError" class="error-message">Esse IP de câmera já existe.</div>
              <div v-if="selectedRedzone && selectedCameras.length === 0" class="error-message">Preencher Informação</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Janela "Restringir Redzone" -->
      <div class="restrict-redzone-container">
        <h3 class="section-subtitle">Restringir Redzone</h3>
        <div class="restrict-form">
          <div class="form-group">
            <label for="start-date" class="form-label">Início:</label>
            <input type="date" id="start-date" v-model="startDate" class="form-control" />
          </div>
          <div class="form-group">
            <label for="end-date" class="form-label">Fim:</label>
            <input type="date" id="end-date" v-model="endDate" class="form-control" :disabled="!startDate" />
          </div>
          <div class="form-group">
            <label for="start-time" class="form-label">Horário inicial:</label>
            <input type="time" id="start-time" v-model="startTime" class="form-control" :disabled="!endDate" />
          </div>
          <div class="form-group">
            <label for="end-time" class="form-label">Horário final:</label>
            <input type="time" id="end-time" v-model="endTime" class="form-control" :disabled="!startTime" />
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-container">
      <!-- Lista de Redzones cadastradas -->
      <div class="registered-redzones-container">
        <h2 class="registered-title">Redzones Cadastradas</h2>
        <div class="table-container">
          <table class="redzone-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th class="center-content">Área</th>
                <th class="center-content">Câmeras</th>
                <th>Restrições</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="redzone in redzones" :key="redzone.id">
                <td>{{ redzone.name }}</td>
                <td class="center-content">
                  <div class="area-labels">
                    <span v-if="redzone.areas && redzone.areas.length > 0" v-for="area in redzone.areas" :key="area.id">{{ area.name }}</span>
                    <span v-else>-</span>
                  </div>
                </td>
                <td class="center-content">
                  <div class="camera-labels">
                    <span v-if="redzone.cameras && redzone.cameras.length > 0" v-for="camera in redzone.cameras" :key="camera.id">{{ camera.ip }}</span>
                    <span v-else>-</span>
                  </div>
                </td>
                <td>{{ formatRestrictions(redzone) }}</td>
                <td class="center-content">
                  <button @click.stop="confirmAction('remove', redzone.id)" class="btn-remove" title="Remover">X</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Componentes de Popup -->
    <confirmation-popup
      v-if="showConfirmationPopup"
      :message="confirmationMessage"
      @confirm="confirmActionHandler"
      @cancel="cancelAction"
    />

    <confirmation-popup
      v-if="showAreaAddConfirmationPopup"
      message="Deseja realmente adicionar esta nova área?"
      @confirm="addNewArea"
      @cancel="cancelAddNewArea"
    />

    <alert-popup
      v-if="showAlertPopup"
      :message="alertMessage"
      @close="showAlertPopup = false"
    />
  </div>
</template>

<script>
import axios from '@/axios';
import AlertPopup from '@/components/AlertPopup.vue';
import ConfirmationPopup from '@/components/ConfirmationPopup.vue';

export default {
  components: {
    ConfirmationPopup,
    AlertPopup,
  },

  data() {
    return {
      redzoneName: '',
      selectedArea: [],
      areas: [],
      newArea: '',
      addNewArea: false,
      selectedCameras: [],
      cameras: [],
      newCamera: '',
      addNewCamera: false,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      redzones: [],
      selectedRedzone: null,
      showConfirmationPopup: false,
      confirmationMessage: '',
      actionType: '',
      showAreaRemovePopup: false,
      areaRemoveMessage: '',
      showAlertPopup: false,
      alertMessage: '',
      showConfirmationPopupCameraRemoval: false,
      showAreaAddConfirmationPopup: false,
      cameraExistsError: false,
      areaToRemove: null,
    };
  },

  computed: {
    isAddButtonEnabled() {
      return this.redzoneName && this.selectedArea.length > 0 && this.selectedCameras.length > 0 && !this.selectedRedzone;
    },
    isUpdateButtonEnabled() {
      return this.selectedRedzone && this.redzoneName && this.selectedArea.length > 0 && this.selectedCameras.length > 0;
    },
    isResetDisabled() {
      return !(this.redzoneName
      || this.selectedArea.length > 0
      || this.selectedCameras.length > 0
      || this.startDate
      || this.endDate
      || this.startTime
      || this.endTime);
    },
    isEndDateEnabled() {
      return !!this.startDate;
    },
    isStartTimeEnabled() {
      return !!this.endDate;
    },
    isEndTimeEnabled() {
      return !!this.startTime;
    },
  },

  async mounted() {
    await this.fetchAreas();
    await this.refreshRedzones();
  },

  methods: {
    async fetchAreas() {
      try {
        const response = await axios.get('/area');
        this.areas = response.data;
      } catch (error) {
        console.error('Erro ao buscar áreas:', error);
        this.showAlert('Erro ao buscar áreas');
      }
    },

    confirmAction(actionType, redzoneId) {
      this.showConfirmationPopup = true;
      this.actionType = actionType;
      if (actionType === 'add') {
        this.confirmationMessage = `Deseja realmente adicionar a redzone "${this.redzoneName}"?`;
      } else if (actionType === 'update') {
        const redzoneUpd = this.redzones.find(redzone => redzone.id === redzoneId);
        this.confirmationMessage = `Confirmar salvamento das alterações em "${redzoneUpd.name}"?`;
      } else if (actionType === 'remove') {
        const redzoneDel = this.redzones.find(redzone => redzone.id === redzoneId);
        if (redzoneDel) {
          this.confirmationMessage = `Deseja realmente remover a redzone "${redzoneDel.name}"?`;
        } else {
          this.confirmationMessage = 'Deseja realmente remover a redzone?';
        }
      }
    },

    async confirmActionHandler() {
      if (this.actionType === 'add') {
        await this.addRedzone();
      } else if (this.actionType === 'update') {
        await this.saveChanges();
      } else if (this.actionType === 'remove') {
        await this.confirmRemoveRedzone();
      }
    },

    async confirmRemoveSelectedAreas() {
      if (!this.selectedAreaId) {
        this.showAlert('Nenhuma área selecionada.');
        return;
      }

      const areasWithRedzones = this.redzones.some(redzone => redzone.areas.some(area => area.id === this.selectedAreaId));

      if (areasWithRedzones) {
        this.showAlert('Não é possível remover área que está associada a redzones.');
        return;
      }

      const confirmRemoval = window.confirm('Deseja realmente remover a área selecionada?');
      if (confirmRemoval) {
        await this.removeSelectedArea();
      }
    },

    async addRedzone() {
      try {
        const response = await axios.post('/redzone', {
          name: this.redzoneName,
          areas: this.selectedArea,
          cameras: this.selectedCameras,
          startDate: this.startDate,
          endDate: this.endDate,
          startTime: this.startTime,
          endTime: this.endTime,
        });
        await this.refreshRedzones();
        this.resetForm();
        this.showConfirmationPopup = false;
        this.showAlert('Redzone adicionada com sucesso!');
      } catch (error) {
        console.error('Erro ao adicionar redzone:', error);
        this.showAlert('Erro ao adicionar redzone');
      }
    },

    async saveChanges() {
      try {
        await axios.put(`/redzone/${this.selectedRedzone.id}`, {
          name: this.redzoneName,
          areas: this.selectedArea,
          cameras: this.selectedCameras,
          startDate: this.startDate,
          endDate: this.endDate,
          startTime: this.startTime,
          endTime: this.endTime,
        });
        await this.refreshRedzones();
        this.resetForm();
        this.showConfirmationPopup = false;
      } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        this.showAlert('Erro ao salvar alterações');
      }
    },

    async refreshRedzones() {
      try {
        const response = await axios.get('/redzone');
        console.log('Dados das redzones:', response.data); // Adicione esta linha para depuração
        this.redzones = response.data;
      } catch (error) {
        console.error('Erro ao buscar as redzones:', error);
        this.showAlert('Erro ao buscar as redzones');
      }
    },

    cancelAction() {
      this.showConfirmationPopup = false;
      this.showAreaAddConfirmationPopup = false;
    },

    resetForm() {
      this.redzoneName = '';
      this.selectedArea = [];
      this.newArea = '';
      this.addNewArea = false;
      this.selectedCameras = [];
      this.newCamera = '';
      this.addNewCamera = false;
      this.startDate = '';
      this.endDate = '';
      this.startTime = '';
      this.endTime = '';
    },

    formatRestrictions(redzone) {
      let restrictions = '';

      if (redzone.startDate && redzone.endDate) {
        restrictions += `De ${redzone.startDate} à ${redzone.endDate}`;
        if (redzone.startTime && redzone.endTime) {
          restrictions += ` | entre ${redzone.startTime} e ${redzone.endTime}`;
        }
      } else if (redzone.startDate) {
        restrictions += `De ${redzone.startDate}`;
        if (redzone.startTime) {
          restrictions += ` | ${redzone.startTime}`;
        }
      }

      return restrictions || '-';
    },

    onRedzoneRowClick(redzone) {
      this.selectedRedzone = redzone;
      this.redzoneName = redzone.name;
      this.selectedArea = redzone.areas.map(area => area.name);
      this.selectedCameras = redzone.cameras.map(camera => camera.ip);
      this.startDate = redzone.startDate;
      this.endDate = redzone.endDate;
      this.startTime = redzone.startTime;
      this.endTime = redzone.endTime;
    },

    async removeRedzone(redzoneId) {
      this.selectedRedzone = this.redzones.find(redzone => redzone.id === redzoneId);
      this.confirmAction('remove');
    },

    async confirmRemoveRedzone() {
      try {
        await axios.delete(`/redzone/${this.selectedRedzone.id}`);
        await this.refreshRedzones();
        this.selectedRedzone = null;
        this.showConfirmationPopup = false;
      } catch (error) {
        console.error('Erro ao remover a redzone:', error);
        this.showAlert('Erro ao remover a redzone');
      }
    },

    async removeSelectedArea() {
      try {
        await axios.delete(`/area/${this.selectedAreaId}`);
        this.areas = this.areas.filter(area => area.id !== this.selectedAreaId);
        this.selectedAreaId = null;
        this.showAlert('Área removida com sucesso.');
      } catch (error) {
        console.error('Erro ao remover área:', error);
        this.showAlert('Erro ao remover área.');
      }
    },

    async removeArea() {
      try {
        await axios.delete(`/area/${this.selectedArea.id}`);
        this.areas = this.areas.filter(area => area.id !== this.selectedArea.id);
        this.selectedArea = [];
        this.showAreaRemovePopup = false;
        this.showAlert('Area removed successfully!');
      } catch (error) {
        console.error('Error deleting area:', error);
        this.showAlert('Error deleting area');
      }
    },

    cancelAreaRemove() {
      this.showAreaRemovePopup = false;
    },

    removeSelectedCameras() {
      if (this.selectedCameras.length > 0) {
        // Limpa os IPs selecionados na lista de câmeras
        this.cameras = this.cameras.filter(camera => !this.selectedCameras.includes(camera.ip));
        this.selectedCameras = []; // Limpa a seleção
      }
    },

    showAlert(message) {
      this.alertMessage = message;
      this.showAlertPopup = true;
    },

    handleAreaSelection(event) {
      if (event.target.selectedOptions.length > 1) {
        this.selectedArea = [event.target.selectedOptions[0].value];
      }
    },

    handleCameraSelection(event) {
      if (event.target.selectedOptions.length > 4) {
        this.selectedCameras = Array.from(event.target.selectedOptions)
          .slice(0, 4)
          .map(option => option.value);
      } else {
        this.selectedCameras = Array.from(event.target.selectedOptions).map(option => option.value);
      }
    },

    formatCameraNumber() {
      const cleaned = ('' + this.newCamera).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{1,3})(\d{0,3})?(\d{0,3})?(\d{0,3})?$/);
      if (match) {
        this.newCamera = [match[1], match[2], match[3], match[4]].filter(Boolean).join('.');
      }
    },

    showConfirmationPopupCameraRemoval() {
      this.showConfirmationPopupCameraRemoval = true;
    },

    cancelCameraRemoval() {
      this.showConfirmationPopupCameraRemoval = false;
    },

    confirmAddNewArea() {
      this.showAreaAddConfirmationPopup = true;
    },

    clearCameraExistsError() {
      this.cameraExistsError = false;
    },

    addNewCameraToList() {
      if (!this.newCamera) {
        this.showAlert('IP da nova câmera não preenchido.');
        return;
      }

      if (this.selectedCameras.length >= 4) {
        this.showAlert('Limite máximo de 4 IPs alcançado.');
        return;
      }

      if (this.cameras.some(camera => camera.ip === this.newCamera)) {
        this.cameraExistsError = true; // Ativar o estado de erro
        return; // Retornar sem adicionar a câmera
      } else {
        this.cameraExistsError = false; // Desativar o estado de erro, caso existisse

        // Adicionar a nova câmera à lista de câmeras
        this.cameras.push({ ip: this.newCamera });
        // Adicionar a nova câmera à lista de câmeras selecionadas
        this.selectedCameras.push(this.newCamera);

        // Limpar o campo de entrada
        this.newCamera = '';
      }
    },
    
    confirmAddNewArea() {
      if (!this.newArea) {
        this.showAlert('Nome da nova área não preenchido.');
        return;
      }
      
      if (this.areas.some(area => area.name === this.newArea)) {
        this.showAlert('Área já existente.');
        return;
      }
      
      this.areas.push({ name: this.newArea });
      this.selectedArea.push(this.newArea);
      this.newArea = '';
      this.addNewArea = false;
    },
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.top-container {
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
  flex: 0 1 auto; 
}

.redzone-container {
  flex: 1 1 70%; 
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 10px;
}

.restrict-redzone-container {
  flex: 1 1 30%; 
  background-color: #ffcfcf; 
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1; 
  padding: 8px 12px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 10px;
}

.btn-add {
  padding: 0;
  width: 20px;
  height: 20px;
  border: none;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  border-radius: 50%;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-add:hover {
  background-color: #218838;
}

.bold-text {
  font-weight: bold;
}

.remove-option {
  border: none;
  background-color: transparent;
  color: red;
  cursor: pointer;
}

.bottom-container {
  border-radius: 7px;
  padding-top: 0px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.8);
}

.registered-redzones-container {
  border-radius: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.redzone-form {
  display: flex;
  gap: 20px;
}

.area-group,
.camera-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.redzone-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 7px;
}

.redzone-table th,
.redzone-table td {
  padding: 5px;
  border: 1px solid #ccc;
  font-size: 12px;
}

.redzone-table th {
  background-color: #f0f0f0;
}

.redzone-table tr:hover {
  background-color: #f9f9f9;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 5px;
  margin-bottom: 20px;
}

.registered-title {
  font-size: 18px;
  color: #ffffff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #444;
  padding: 5px 0;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0;
}

.section-subtitle {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 5px;
}

.table-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn {
  padding: 8px 12px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 10px;
}

.btn:hover {
  background-color: #0056b3;
}

.form-area-cam {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
}

.btn-remove {
  background-color: #c70014;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
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

.center-content {
  text-align: center;
}

.btn-reset {
  padding: 5px 10px;
  border: none;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.btn-reset:hover {
  background-color: #218838;
}

.form-group {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 2px;
}

.form-group label {
  margin-bottom: 5px;
}

.form-control {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-checkbox {
  margin-right: 0;
  width: 15px;
  height: 15px;
}

.form-label-checkbox {
  display: inline;
}

.button-group .btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.new-area-group,
.new-camera-group {
  margin-top: 2px;
  display: flex;
  align-items: center; 
  justify-content: flex-start;
  gap: 10px;
  font-size: 12px;
  font-weight: bold;
}

.new-area-group input,
.new-camera-group input {
  margin-right: 0;
}

.new-area-group .form-label-checkbox,
.new-camera-group .form-label-checkbox {
  margin-left: 0;
}

.new-camera-group .form-label {
  margin-top: 5px; 
}

.confirmation-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirmation-popup-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
}

.error-message {
  color: red;
  font-size: 12px;
}
</style>
