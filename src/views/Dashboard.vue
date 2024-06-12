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
      if (this.$refs.realTime) {
        this.$refs.realTime.carregarDados();
      }
      if (this.$refs.dataTable) {
        this.$refs.dataTable.fetchRecords();
      }
      if (this.$refs.chart) {
        this.$refs.chart.fetchDataAndUpdate();
      }
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
  padding-top: 20px;
  margin-right: 10px;
}

.content {
  flex: 1;
  display: flex;
  position: relative;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 3fr;
  grid-gap: 10px;
  padding: 0;
  width: 100%;
  height: 100%;
  bottom: 0;
  right: 0;
}

.grid-item {
  border-radius: 5px;
  padding: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.grid-item.real-time,
.grid-item.data-table {
  grid-row: 1 / 2;
}

.grid-item.webcam-feed,
.grid-item.chart {
  grid-row: 2 / 3;
}
</style>
