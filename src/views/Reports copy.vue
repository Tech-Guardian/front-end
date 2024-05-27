<template>
  <div class="reports">
    <div class="column filters">
      <div class="filter-section">
        <h2 style="font-weight: lighter;">Selecionar Dados</h2>
        <div class="form-group">
          <label for="redzone">Redzone:</label>
          <select v-model="selectedRedzone">
            <option value="">Selecione...</option>
            <option value="redzone1">Redzone 1</option>
            <option value="redzone2">Redzone 2</option>
            <option value="redzone3">Redzone 3</option>
          </select>
        </div>
        <div class="form-group">
          <label for="startDate">Data Inicial:</label>
          <input type="date" v-model="startDate">
        </div>
        <div class="form-group">
          <label for="endDate">Data Final:</label>
          <input type="date" v-model="endDate">
        </div>
        <div class="form-group">
          <label for="startTime">Horário Inicial:</label>
          <input type="time" v-model="startTime" :disabled="!selectedRedzone || !startDate || !endDate">
        </div>
        <div class="form-group">
          <label for="endTime">Horário Final:</label>
          <input type="time" v-model="endTime" :disabled="!selectedRedzone || !startDate || !endDate">
        </div>
        <button @click="generateReport" class="btn" :disabled="!selectedRedzone || !startDate || !endDate">Gerar Relatório</button>
      </div>
    </div>
    <div class="column preview">
      <h2 style="font-weight: lighter;">Visualização Prévia</h2>
      <div class="report-preview">
        <iframe :src="reportUrl" frameborder="0"></iframe>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ref } from 'vue';

interface EntradaSaida {
  id: number;
  dataEntrada?: string;
  horaEntrada?: string;
  obsEntrada?: string;
  dataSaida?: string;
  horaSaida?: string;
  obsSaida?: string;
  quantEntrada?: number;
}

interface Registro {
  id: number;
  data: string;
  hora: string;
  obs: string;
  status: 'Entrada' | 'Saída';
  quantEntrada?: number;
}

const selectedRedzone = ref('');
const startDate = ref('');
const endDate = ref('');
const startTime = ref('');
const endTime = ref('');
const reportUrl = ref<string>('');
const registros = ref<Registro[]>([]);

const fetchRecords = async () => {
  try {
    const responseEntrada = await axios.get('http://localhost:8080/registro/entrada');
    const entradas = responseEntrada.data.map((entrada: EntradaSaida) => ({
      id: entrada.id,
      data: entrada.dataEntrada as string,
      hora: entrada.horaEntrada as string,
      obs: entrada.obsEntrada as string,
      status: 'Entrada' as const,
      quantEntrada: entrada.quantEntrada,
    }));

    const responseSaida = await axios.get('http://localhost:8080/registro/saida');
    const saidas = responseSaida.data.map((saida: EntradaSaida) => ({
      id: saida.id,
      data: saida.dataSaida as string,
      hora: saida.horaSaida as string,
      obs: saida.obsSaida as string,
      status: 'Saída' as const,
    }));

    registros.value = [...entradas, ...saidas];
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
};

const generateReport = async () => {
  const doc = new jsPDF();

  const startDateAdjusted = new Date(startDate.value);
  startDateAdjusted.setDate(startDateAdjusted.getDate() + 1); // Desloca a data inicial em 1 dia | No título
  const startDateFormatted = startDateAdjusted.toLocaleDateString('pt-BR');

  const endDateAdjusted = new Date(endDate.value);
  endDateAdjusted.setDate(endDateAdjusted.getDate() + 1); // Desloca a data final em 1 dia | No título
  const endDateFormatted = endDateAdjusted.toLocaleDateString('pt-BR');

  const horarioInicio = startTime.value || '00:00';
  const horarioFim = endTime.value || '23:59';
  const periodo = `Período: Das ${horarioInicio} às ${horarioFim}`;

  doc.setFontSize(12);
  doc.text(`Relatório de Entrada e Saída na ${selectedRedzone.value} entre ${startDateFormatted} e ${endDateFormatted}`, 20, 20);
  doc.setFontSize(10);
  doc.text(periodo, 20, 30);

  const registrosFiltradosPorData = registros.value.filter(registro => {
    const registroDate = new Date(registro.data);
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    return registroDate >= start && registroDate <= end;
  });

  const registrosFiltrados = registrosFiltradosPorData.filter(registro => {
    const registroDateTime = new Date(`${registro.data}T${registro.hora}`);
    const start = new Date(`${registro.data}T${horarioInicio}:00`);
    const end = new Date(`${registro.data}T${horarioFim}:59`);
    return registroDateTime >= start && registroDateTime <= end;
  });

  const chartData = await fetchChartData(registrosFiltrados);
  const chartCanvas = document.createElement('canvas');
  chartCanvas.width = 800;
  chartCanvas.height = 400;
  const ctx = chartCanvas.getContext('2d');

  if (ctx) {
    const chart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: false,
        scales: {
          x: { title: { display: true, text: 'Data' } },
          y: { title: { display: true, text: 'Quantidade' }, beginAtZero: true },
        },
      },
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const dataUrl = chartCanvas.toDataURL('image/png', 1.0);
    doc.addImage(dataUrl, 'PNG', 20, 40, 160, 80);

    registrosFiltrados.sort((a, b) => {
      const dateA = new Date(`${a.data}T${a.hora}`).getTime();
      const dateB = new Date(`${b.data}T${b.hora}`).getTime();
      return dateB - dateA;
    });

    const tableData = registrosFiltrados.map(registro => [
      new Date(new Date(`${registro.data}T${registro.hora}`).getTime()).toLocaleDateString('pt-BR'), // Descola 1 dia em milissegundos (86400000) | Na tabela
      registro.hora,
      registro.status,
      registro.obs
    ]);

    autoTable(doc, {
      head: [['Data', 'Horário', 'Apontamento', 'Observação']],
      body: tableData,
      startY: 120,
    });

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    reportUrl.value = pdfUrl;
  }
};

const fetchChartData = async (filteredRecords: Registro[]) => {
  const chartData: { [key: string]: number } = {};

  filteredRecords.forEach((registro) => {
    if (registro.status === 'Entrada') {
      const entradaDate = new Date(`${registro.data}T${registro.hora}`);
      entradaDate.setDate(entradaDate.getDate());  // Ajuste para deslocar 1 dia | No gráfico
      const formattedDate = entradaDate.toLocaleDateString('pt-BR');
      if (chartData[formattedDate]) {
        chartData[formattedDate] += registro.quantEntrada || 0;
      } else {
        chartData[formattedDate] = registro.quantEntrada || 0;
      }
    }
  });

  return {
    labels: Object.keys(chartData).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('/')).getTime();
      const dateB = new Date(b.split('/').reverse().join('/')).getTime();
      return dateA - dateB;
    }),
    datasets: [
      {
        label: 'Quantidade',
        data: Object.values(chartData),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.1,
      },
    ],
  };
};

fetchRecords();
</script>

<style scoped>
.reports {
  position: absolute;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  padding: 10px;
  overflow: hidden;
  width: 80%;
  height: max-content;
}

.column {
  display: flex;
  flex-direction: column;
}

.filters {
  grid-column: 1 / span 1;
}

.preview {
  grid-column: 2 / span 1;
}

.filter-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.btn {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.report-preview {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #ddd;
  overflow: hidden;
  height: 70vh;
}

iframe {
  width: 100%;
  height: 100%;
}
</style>
