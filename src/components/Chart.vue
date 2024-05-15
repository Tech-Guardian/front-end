<template>
  <div class="chart-container">
    <h3 class="titulo">Últimos 7 dias</h3>
    <canvas id="line-chart"></canvas>
    <DataUpdater @update-data="fetchDataAndUpdate" /> <!-- Componente DataUpdater -->
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import Chart from 'chart.js/auto';
import { defineComponent } from 'vue';

interface DadosEntrada {
  id: number;
  dataEntrada: string;
  horaEntrada: string;
  quantEntrada: number;
  obsEntrada: string;
}

export default defineComponent({
  data() {
    return {
      chart: null as Chart | null
    };
  },
  mounted() {
    this.carregarDados();
  },
  methods: {
    carregarDados() {
      axios
        .get<DadosEntrada[]>('http://localhost:8080/registro/entrada')
        .then((responseEntrada) => {
          const data = this.processData(responseEntrada.data);
          console.log('Dados do gráfico:', data); // Console.log para exibir os dados do gráfico
          this.renderChart(data);
        })
        .catch((error) => {
          console.error('Erro ao buscar dados de entrada:', error);
        });
    },
    fetchDataAndUpdate() {
      this.carregarDados();
    },
    processData(entradas: DadosEntrada[]) {
      const dataAtual = new Date();
      const diasDaSemana = [];

      for (let i = 6; i >= 0; i--) {
        const data = new Date(dataAtual);
        data.setDate(data.getDate() - i);
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' });
        const diaMes = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        diasDaSemana.push(`${diaSemana} ${diaMes}`);
      }

      const data = {
        labels: diasDaSemana,
        datasets: [
          {
            label: 'Pessoas no dia',
            data: [] as number[],
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            fill: true
          }
        ]
      };

      const contagens: Record<string, number> = {};

      for (const entrada of entradas) {
        const data = new Date(entrada.dataEntrada);
        const diaDaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' }) + ' ' + data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (!contagens[diaDaSemana]) {
          contagens[diaDaSemana] = 0;
        }
        contagens[diaDaSemana] += entrada.quantEntrada;
      }

      for (const diaDaSemana of diasDaSemana) {
        data.datasets[0].data.push(contagens[diaDaSemana] || 0);
      }

      return data;
    },
    renderChart(data: any) {
      const ctx = document.getElementById('line-chart') as HTMLCanvasElement;
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'line',
          data,
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  }
});
</script>

<style scoped>
.chart-container {
  margin-right: 10px;
  margin-left: 0;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  background-color: white;
  color: #000;
  border-radius: 10px;
  border: 1px solid gray;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

#line-chart {
  width: 100%;
  margin-bottom: 57px;
}

.titulo {
  font-size: 18px;
  color: #ffffff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #444;
  padding: 5px 0;
  text-align: center;
  margin-top: 0;
  margin-bottom: 55px;
  width: 100%;
}
</style>
