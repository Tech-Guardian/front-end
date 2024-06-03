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
              <tr v-for="registro in registrosOrdenados" :key="registro.id">
                <td>{{ new Date(registro.data).toLocaleDateString('pt-BR') }}</td>
                <td>{{ registro.hora }}</td>
                <td :class="{ 'status-entrada': registro.status === 'Entrada', 'status-saida': registro.status === 'Saída' }">{{ registro.status }}</td>
                <td>{{ registro.obs }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from '@/axios';
import { defineComponent } from 'vue';

interface DadosEntrada {
  id: number;
  dataEntrada: string;
  horaEntrada: string;
  quantEntrada: number;
  obsEntrada: string;
}

interface DadosSaida {
  id: number;
  dataSaida: string;
  horaSaida: string;
  quantSaida: number;
  obsSaida: string;
}

interface Registro {
  id: number;
  data: string;
  hora: string;
  obs: string;
  status: string;
}

export default defineComponent({
  name: 'DataTable',
  data() {
    return {
      registros: [] as Registro[],
    };
  },
  mounted() {
    this.fetchRecords();
  },
  computed: {
    registrosOrdenados() {
      return this.registros.slice().sort((a, b) => {
        const dateA = new Date(`${a.data}T${a.hora}`);
        const dateB = new Date(`${b.data}T${b.hora}`);
        return dateB.getTime() - dateA.getTime(); // Alterada a ordem de comparação
      });
    }
  },
  methods: {
    fetchRecords() {
      axios.get<DadosEntrada[]>('http://localhost:8080/registro/entrada')
        .then(responseEntrada => {
          const entradas = responseEntrada.data.map(entrada => ({
            id: entrada.id,
            data: this.adjustDate(entrada.dataEntrada),
            hora: entrada.horaEntrada,
            obs: entrada.obsEntrada,
            status: 'Entrada'
          }));
          return axios.get<DadosSaida[]>('http://localhost:8080/registro/saida')
            .then(responseSaida => {
              const saidas = responseSaida.data.map(saida => ({
                id: saida.id,
                data: this.adjustDate(saida.dataSaida),
                hora: saida.horaSaida,
                obs: saida.obsSaida,
                status: 'Saída'
              }));
              this.registros = [...entradas, ...saidas];
            });
        })
        .catch(error => {
          console.error('Erro ao buscar dados:', error);
        });
    },
    adjustDate(dateString: string): string {
      const date = new Date(dateString);
      date.setDate(date.getDate() + 1); // Desloca a data em 1 dia
      return date.toISOString().split('T')[0]; // Retorna a data ajustada no formato YYYY-MM-DD
    }
  }
});
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
