<template>
  <div class="dashboard">
    <div class="content">
      <div class="grid-container">
        <div class="grid-item">
          <RealTime />
        </div>
        <div class="grid-item">
          <DataTable />
        </div>
        <div class="grid-item">
          <WebcamFeed />
        </div>
        <div class="grid-item">
          <Chart />
        </div>
      </div>
      <DataUpdater @update-data="updateComponents" />
    </div>
  </div>
</template>

<script>
import Chart from '@/components/Chart.vue';
import DataTable from '@/components/DataTable.vue';
import DataUpdater from '@/components/DataUpdater.vue';
import RealTime from '@/components/RealTime.vue';
import WebcamFeed from '@/components/WebcamFeed.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    RealTime,
    DataTable,
    WebcamFeed,
    Chart,
    DataUpdater,
  },
  methods: {
    updateComponents() {
      this.$refs.realTime.carregarDados();
      this.$refs.dataTable.fetchRecords();
      this.$refs.chart.fetchDataAndUpdate();
    }
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.content {
  flex: 1;
  display: flex;
  position: relative;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  padding: 0;
  width: 100%;
  bottom: 0;
  right: 0;
  grid-auto-rows: min-content;
  position: absolute;
}

.grid-item {
  border-radius: 5px;
  padding: 0;
  min-width: 0;
}

.grid-item:nth-child(1),
.grid-item:nth-child(3) {
  grid-column: 1;
}

.grid-item:nth-child(2),
.grid-item:nth-child(4) {
  grid-column: 2;
}
</style>
