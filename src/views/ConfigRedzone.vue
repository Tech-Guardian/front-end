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
                <button class="btn-remove" @click="removeSelectedAreas">Remover</button>
              </div></div>
              <select v-model="selectedArea" class="form-control" @change="handleAreaSelection">
                <option value="" disabled>Selecione...</option>
                <option v-for="area in areas" :key="area.id" :value="area.name">{{ area.name }}</option>
              </select>
              <div class="new-area-group">
                <button @click="addNewAreaToList" class="form-control btn-add">+</button>
                <input type="text" v-model="newArea" class="form-control" placeholder="Nova Área" />
              </div>
              <div v-if="selectedRedzone && !selectedArea" class="error-message">Preencher Informação</div>
            </div>
            <div class="button-group">
              <button @click="confirmAction('add')" class="btn" :disabled="!isAddButtonEnabled">Adicionar</button>
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
              </div></div>
              <select v-model="selectedCameras" multiple class="form-control" @change="handleCameraSelection">
                <option v-for="camera in cameras" :key="camera.id" :value="camera.ip">{{ camera.ip }}</option>
              </select>
              <div class="new-camera-group">
                <button @click="addNewCameraToList" class="form-control btn-add">+</button>
                <label for="new-camera" class="form-label">Novo IP de CAM (Números):</label>
                <input type="text" id="new-camera" v-model="newCamera" @input="formatCameraNumber" maxlength="15" class="form-control" placeholder="___.___.___.___" />
              </div>
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
            <input type="date" id="end-date" v-model="endDate" class="form-control" />
          </div>
          <div class="form-group">
            <label for="start-time" class="form-label">Horário inicial:</label>
            <input type="time" id="start-time" v-model="startTime" class="form-control" />
          </div>
          <div class="form-group">
            <label for="end-time" class="form-label">Horário final:</label>
            <input type="time" id="end-time" v-model="endTime" class="form-control" />
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
                <th>Área</th>
                <th>Câmeras</th>
                <th>Restrições</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="redzone in redzones" :key="redzone.id" @click="onRedzoneRowClick(redzone)">
                <td>{{ redzone.name }}</td>
                <td>
                  <div class="area-labels">
                    <span v-for="area in redzone.areas" :key="area.id" class="area-label">{{ area.name }}</span>
                  </div>
                </td>
                <td>
                  <div class="camera-labels">
                    <span v-for="camera in redzone.cameras" :key="camera.id" class="camera-label">{{ camera.ip }}</span>
                  </div>
                </td>
                <td>{{ formatRestrictions(redzone) }}</td>
                <td><button class="btn-remove" @click="removeRedzone(redzone.id)">Remover</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showConfirmationPopup" class="confirmation-popup">
      <div class="confirmation-popup-content">
        <span class="close" @click="cancelAction">&times;</span>
        <p>{{ confirmationMessage }}</p>
        <button @click="confirmActionHandler" class="btn">Confirmar</button>
        <button @click="cancelAction" class="btn">Cancelar</button>
      </div>
    </div>

    <!-- Popup de confirmação/remoção de câmera -->
    <div v-if="showConfirmationPopupCameraRemoval" class="confirmation-popup">
      <div class="confirmation-popup-content">
        <span class="close" @click="cancelCameraRemoval">&times;</span>
        <p>Confirmar remoção da câmera?</p>
        <button @click="removeCamera" class="btn">Confirmar</button>
        <button @click="cancelCameraRemoval" class="btn">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
      showConfirmationPopupCameraRemoval: false,
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
      return !(this.redzoneName || this.selectedArea.length > 0 || this.selectedCameras.length > 0);
    },
  },
  methods: {
    confirmAction(actionType) {
      this.showConfirmationPopup = true;
      this.actionType = actionType;
      if (actionType === 'add') {
        this.confirmationMessage = 'Deseja realmente adicionar a redzone?';
      } else if (actionType === 'update') {
        this.confirmationMessage = 'Confirmar salvamento das alterações?';
      } else if (actionType === 'remove') {
        this.confirmationMessage = 'Deseja realmente remover a redzone?';
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
    async addRedzone() {
      try {
        // Lógica para adicionar redzone
        await this.refreshRedzones();
        this.resetForm();
        this.showConfirmationPopup = false;
      } catch (error) {
        console.error('Erro ao adicionar a redzone:', error);
      }
    },
    async saveChanges() {
      try {
        // Lógica para salvar alterações na redzone
        await this.refreshRedzones();
        this.resetForm();
        this.showConfirmationPopup = false;
      } catch (error) {
        console.error('Erro ao salvar alterações:', error);
      }
    },
    async refreshRedzones() {
      try {
        const response = await fetch('/api/redzones');
        const data = await response.json();
        this.redzones = data.redzones;
      } catch (error) {
        console.error('Erro ao buscar as redzones:', error);
      }
    },
    cancelAction() {
      this.showConfirmationPopup = false;
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
      // Formatar restrições (data e horário)
      return `${redzone.startDate} ${redzone.startTime} - ${redzone.endDate} ${redzone.endTime}`;
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
        await fetch(`/api/redzones/${this.selectedRedzone.id}`, {
          method: 'DELETE',
        });
        await this.refreshRedzones();
        this.selectedRedzone = null;
        this.showConfirmationPopup = false;
      } catch (error) {
        console.error('Erro ao remover a redzone:', error);
      }
    },
    async resetRestrictions() {
      this.startDate = '';
      this.endDate = '';
      this.startTime = '';
      this.endTime = '';
    },
    addNewCameraToList() {
      if (this.newCamera) {
        this.cameras.push({ id: Date.now(), ip: this.newCamera });
        this.newCamera = '';
      }
    },
    formatCameraNumber() {
      let cleanedIP = this.newCamera.replace(/\D/g, '');
      cleanedIP = cleanedIP.substring(0, 12);
      let formattedIP = '';
      for (let i = 0; i < cleanedIP.length; i++) {
        formattedIP += cleanedIP[i];
        if ((i === 2 || i === 5 || i === 8) && i !== cleanedIP.length - 1) {
          formattedIP += '.';
        }
      }
      this.newCamera = formattedIP;
    },
    async removeSelectedAreas() {
      if (this.selectedArea.length > 0) {
        const linkedRedzones = this.redzones.filter(redzone =>
          redzone.areas.some(area => this.selectedArea.includes(area.name))
        );

        if (linkedRedzones.length > 0) {
          const redzoneNames = linkedRedzones.map(redzone => redzone.name).join(', ');
          const alertMessage = `Não é possível excluir a área pois está vinculada às seguintes redzones: ${redzoneNames}`;
          alert(alertMessage);
        } else {
          const confirmMessage = 'Deseja realmente excluir a área selecionada?';
          if (confirm(confirmMessage)) {
            this.areas = this.areas.filter(area => !this.selectedArea.includes(area.name));
            this.selectedArea = [];
          }
        }
      }
    },
    async removeSelectedCameras() {
      if (this.selectedCameras.length > 0) {
        const linkedRedzones = this.redzones.filter(redzone =>
          redzone.cameras.some(camera => this.selectedCameras.includes(camera.ip))
        );

        if (linkedRedzones.length > 0) {
          const redzoneNames = linkedRedzones.map(redzone => redzone.name).join(', ');
          const alertMessage = `Não é possível excluir a câmera pois está vinculada às seguintes redzones: ${redzoneNames}`;
          alert(alertMessage);
        } else {
          const confirmMessage = 'Deseja realmente excluir a câmera selecionada?';
          if (confirm(confirmMessage)) {
            this.cameras = this.cameras.filter(camera => !this.selectedCameras.includes(camera.ip));
            this.selectedCameras = [];
          }
        }
      }
    },
    addNewAreaToList() {
      if (this.newArea) {
        // Verificar se a área já existe
        if (this.areas.some(area => area.name === this.newArea)) {
          alert('Essa área já existe.');
        } else {
          this.areas.push({ id: Date.now(), name: this.newArea });
          this.newArea = '';
        }
      }
    },
    addNewCameraToList() {
      if (this.newCamera) {
        // Verificar se a câmera já existe
        if (this.cameras.some(camera => camera.ip === this.newCamera)) {
          alert('Esse IP de câmera já existe.');
        } else {
          this.cameras.push({ id: Date.now(), ip: this.newCamera });
          this.newCamera = '';
        }
      }
    },
    removeCamera(camera) {
      const cameraIndex = this.cameras.findIndex(c => c.ip === camera.ip);
      if (cameraIndex !== -1) {
        this.cameras.splice(cameraIndex, 1);
        this.cancelCameraRemoval();
      }
    },
    cancelCameraRemoval() {
      this.showConfirmationPopupCameraRemoval = false;
    },
    // Método para manipular a seleção da Área
    handleAreaSelection(event) {
      if (event.target.selectedOptions.length > 1) {
        this.selectedArea = [event.target.selectedOptions[0].value];
      }
    },
    // Método para manipular a seleção das Câmeras
    handleCameraSelection(event) {
      if (event.target.selectedOptions.length > 4) {
        this.selectedCameras = Array.from(event.target.selectedOptions)
          .slice(4, 0)
          .map(option => option.value);
      }
    },
  },
}
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
  border: none;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}


.btn-remove:hover {
  background-color: #c82333;
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
