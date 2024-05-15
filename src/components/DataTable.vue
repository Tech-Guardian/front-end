<template>
  <div class="container">
    <div class="data-table">
      <div class="box4">
        <h3 class="titulo">Registros</h3>
        <div class="data-table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Apontamento</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entrada in dadosEntrada.slice().reverse()" :key="entrada.id">
                <td>{{ new Date(entrada.dataEntrada).toLocaleDateString('pt-BR') }}</td>
                <td>{{ entrada.horaEntrada }}</td>
                <td :class="{ 'status-entrada': entrada.status === 'Entrada', 'status-saida': entrada.status === 'Saída' }">{{ entrada.status }}</td>
                <td>{{ entrada.obsEntrada }}</td>
              </tr>
              <tr v-for="saida in dadosSaida.slice().reverse()" :key="saida.id">
                <td>{{ new Date(saida.dataSaida).toLocaleDateString('pt-BR') }}</td>
                <td>{{ saida.horaSaida }}</td>
                <td :class="{ 'status-entrada': saida.status === 'Entrada', 'status-saida': saida.status === 'Saída' }">{{ saida.status }}</td>
                <td>{{ saida.obsSaida }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';

interface DadosEntrada {
  id: number;
  dataEntrada: string;
  horaEntrada: string;
  quantEntrada: number;
  obsEntrada: string;
  status: string;
}

interface DadosSaida {
  id: number;
  dataSaida: string;
  horaSaida: string;
  quantSaida: number;
  obsSaida: string;
  status: string;
}

export default {
  data() {
    return {
      dadosEntrada: [] as DadosEntrada[],
      dadosSaida: [] as DadosSaida[],
    };
  },
  mounted() {
    this.fetchRecords();
    setInterval(this.fetchRecords, 1000);
  },
  methods: {
    fetchRecords() {
      axios.get<DadosEntrada[]>('http://localhost:8080/registro/entrada')
        .then(responseEntrada => {
          this.dadosEntrada = responseEntrada.data.map(entrada => ({...entrada, status: 'Entrada'})); // Define o status como "Entrada"
          return axios.get<DadosSaida[]>('http://localhost:8080/registro/saida');
        })
        .then(responseSaida => {
          this.dadosSaida = responseSaida.data.map(saida => ({...saida, status: 'Saída'})); // Define o status como "Saída"
          this.$emit('update-data'); // Emitir evento com os dados atualizados
        })
        .catch(error => {
          console.error('Erro ao buscar dados:', error);
        });
    },
  }
}
</script>

<style scoped>
.container {
  width: 98%;
  box-sizing: border-box;
}

.data-table {
  width: 100%;
}

.box4 {
  background-color: white;
  border-radius: 10px;
  border: 1px solid gray;
  color: #000;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  width: 100%;
  margin-left: 0;
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
  margin-bottom: 0;
}

.data-table-container {
  width: 100%;
  max-height: calc(50vh - 250px);
  overflow-y: auto;
  position: relative;
  margin-top: 0px;
}

.data-table-container table {
  width: 100%;
  table-layout: auto;
}

.data-table-container th,
.data-table-container td {
  padding: 4px;
  text-align: center;
  border-bottom: 1px solid #ddd;
  font-size: 11px;
  height: 14px;
  width: auto;
}

.status-entrada {
  background-color: #28a745;
  color: #ffffff;
}

.status-saida {
  background-color: #dc3545;
  color: #ffffff;
}

.data-table-container thead {
  position: sticky;
  padding: 5px 0;
  top: 0;
  z-index: 1;
  background-color: white;
}
</style>
