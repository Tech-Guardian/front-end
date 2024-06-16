<template>
  <div v-if="show" class="alert-popup">
    <div class="popup-content">
      <p>{{ message }}</p>
      <button @click="closeAlert" class="btn-close">Fechar</button>
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
    show: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    closeAlert() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.alert-popup {
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

.btn-close {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
