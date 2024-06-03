<template>
  <div></div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'DataUpdater',
  emits: ['update-data'],
  setup(props, { emit }) {
    const fetchData = () => {
      emit('update-data');
    };

    onMounted(() => {
      setInterval(fetchData, 2000);
    });
  },
});
</script>
