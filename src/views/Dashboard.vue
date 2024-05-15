<template>
  <div class="dashboard">
    <div class="content">
      <SideMenu class="side-menu" />
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
    </div>
  </div>
</template>

<script>
import Chart from '@/components/Chart.vue';
import DataTable from '@/components/DataTable.vue';
import RealTime from '@/components/RealTime.vue';
import SideMenu from '@/components/SideMenu.vue';
import WebcamFeed from '@/components/WebcamFeed.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    RealTime,
    DataTable,
    WebcamFeed,
    Chart,
    SideMenu
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 97vh;
  overflow: hidden;
}

.content {
  flex: 1;
  display: flex;
  position: relative; 
}

.grid-container {
  position: absolute;
  top: 65px; /* Altura do Header */
  bottom: 0;
  left: 180px; /* Largura do SideMenu */
  right: 0;
  display: grid;
  grid-template-columns: 0% 48% 50% 2%;
  grid-auto-rows: min-content; 
  grid-gap: 20px;
  padding: 20px;
}

.grid-item {
  border-radius: 5px;
  padding: 0;
  min-width: 0;
}

.grid-item:nth-child(1) {
  grid-row: 1;
  grid-column: 2;
}

.grid-item:nth-child(2) {
  grid-row: 1;
  grid-column: 3;
}

.grid-item:nth-child(3) {
  grid-row: 2;
  grid-column: 2;
}

.grid-item:nth-child(4) {
  grid-row: 2;
  grid-column: 3;
}
</style>
