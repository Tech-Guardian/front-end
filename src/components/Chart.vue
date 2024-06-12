<template>
  <div class="chart-container">
    <h3 class="titulo">
      Últimos 
      <button @click="updateDays(7)">7 dias</button> | 
      <button @click="updateDays(15)">15 dias</button> | 
      <button @click="updateDays(30)">30 dias</button>
    </h3>
    <canvas id="line-chart"></canvas>
  </div>
</template>

<script lang="ts">
import axios from '@/axios';
import Chart from 'chart.js/auto';
import { defineComponent } from 'vue';

interface EntradaData {
  dataEntrada: string;
  quantEntrada: number;
}

export default defineComponent({
  name: 'ChartComponent',
  data() {
    return {
      chart: null as Chart | null,
      entradaData: [] as EntradaData[],
      days: 7 // Inicialmente exibe os últimos 7 dias
    };
  },
  mounted() {
    this.fetchDataAndUpdate();
  },
  methods: {
    fetchDataAndUpdate() {
      axios.get<EntradaData[]>('http://localhost:8080/registro/entrada')
        .then((response) => {
          this.entradaData = response.data;
          this.updateChart();
        })
        .catch((error) => {
          console.error('Erro ao buscar dados de entrada:', error);
        });
    },
    updateDays(days: number) {
      this.days = days;
      this.updateChart();
    },
    processData(entradas: EntradaData[]) {
      const dataAtual = new Date();
      const dias: string[] = [];
      const labels: string[] = [];
      const data = {
        labels: labels,
        datasets: [{
          label: 'Pessoas no dia',
          data: [] as number[],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.1
        }]
      };

      for (let i = this.days - 1; i >= 0; i--) {
        const data = new Date(dataAtual);
        data.setDate(data.getDate() - i);
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' });
        const diaMes = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const diaCompleto = data.toISOString().split('T')[0]; // Formato ISO
        dias.push(diaCompleto);
        labels.push(`${diaSemana} ${diaMes}`);
      }

      const contagens: Record<string, number> = {};

      for (const entrada of entradas) {
        const dataEntradaOriginal = new Date(entrada.dataEntrada);
        dataEntradaOriginal.setDate(dataEntradaOriginal.getDate()); // Desloca a data em 1 dia | Gráfico
        const dataEntrada = dataEntradaOriginal.toISOString().split('T')[0]; // Formato ISO
        if (!contagens[dataEntrada]) {
          contagens[dataEntrada] = 0;
        }
        contagens[dataEntrada] += entrada.quantEntrada;
      }

      for (const dia of dias) {
        data.datasets[0].data.push(contagens[dia] || 0);
      }

      return data;
    },
    updateChart() {
      const processedData = this.processData(this.entradaData);

      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = (document.getElementById('line-chart') as HTMLCanvasElement).getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: processedData,
          options: {
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Data'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Quantidade'
                },
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  },
});
</script>

<style scoped>
.chart-container {
  justify-content: flex-start; /* Alinha o conteúdo ao topo */
  box-sizing: border-box; /* Inclui padding e borda no cálculo da largura e altura */
  overflow: hidden;
  position: relative;
  width: auto; /* Ajuste o tamanho conforme necessário */
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  color: #000;
  border-radius: 10px;
  border: 1px solid gray;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 4 / 3;
}

#line-chart {
  align-self: center;
  margin-top: auto;
  margin-bottom: auto;
  width: 100%;
  height: auto;
  min-height: 300px;
}

.titulo {
  font-size: 18px;
  color: #ffffff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #444;
  padding: 5px 0;
  text-align: center;
  width: 100%;
  margin: 0;
}
</style>
