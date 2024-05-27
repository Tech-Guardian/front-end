<template>
  <div class="confirmation-popup">
    <div class="popup-content">
      <p>{{ message }}</p>
      <div class="button-group">
        <button @click="$emit('confirm')" class="btn-confirm">Confirmar</button>
        <button @click="$emit('cancel')" class="btn-cancel">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.confirmation-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.button-group .btn-confirm {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button-group .btn-cancel {
  background-color: #6c757d;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
