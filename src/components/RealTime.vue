<template>
  <div class="real-time">
    <div class="box4">
      <h3 class="titulo">Tempo Real</h3>
      <div class="content">
        <div class="coluna">
          <span class="titulo-coluna">Pessoas na Redzone</span>
          <span class="num">{{ calcularPessoasNaRedzone() }}</span>
        </div>
        <div class="linha-vertical"></div>
        <div class="coluna">
          <span class="titulo-coluna">Total de pessoas hoje</span>
          <span class="num">{{ calcularSomaQuantEntradaHoje() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from '@/axios';
import type { AxiosResponse } from 'axios';
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

export default defineComponent({
  name: 'RealTime',
  data() {
    return {
      dadosEntrada: [] as DadosEntrada[],
      dadosSaida: [] as DadosSaida[],
    };
  },
  mounted() {
    this.carregarDados();
  },
  methods: {
    carregarDados() {
      axios.get<DadosEntrada[]>('http://localhost:8080/registro/entrada')
        .then((responseEntrada: AxiosResponse<DadosEntrada[]>) => {
          this.dadosEntrada = responseEntrada.data;
          return axios.get<DadosSaida[]>('http://localhost:8080/registro/saida');
        })
        .then((responseSaida: AxiosResponse<DadosSaida[]>) => {
          this.dadosSaida = responseSaida.data;
        })
        .catch((error) => {
          console.error('Erro ao buscar dados:', error);
        });
    },
    calcularPessoasNaRedzone() {
      // Calcular a data da última semana
      const dataUltimaSemana = new Date();
      dataUltimaSemana.setDate(dataUltimaSemana.getDate() - 7);

      // Filtrar entradas e saídas da última semana
      const entradasUltimaSemana = this.dadosEntrada.filter(entrada =>
        new Date(entrada.dataEntrada) >= dataUltimaSemana
      );
      const saidasUltimaSemana = this.dadosSaida.filter(saida =>
        new Date(saida.dataSaida) >= dataUltimaSemana
      );

      // Calcular a quantidade total de entradas e saídas na última semana
      const quantEntradaUltimaSemana = entradasUltimaSemana.reduce((total, entrada) =>
        total + entrada.quantEntrada, 0
      );
      const quantSaidaUltimaSemana = saidasUltimaSemana.reduce((total, saida) =>
        total + saida.quantSaida, 0
      );

      // Calcular o número de pessoas na Redzone
      const pessoasNaRedzone = quantEntradaUltimaSemana - quantSaidaUltimaSemana;
      return pessoasNaRedzone;
    },
    calcularSomaQuantEntradaHoje() {
      const hoje = new Date();
      const diaAtual = hoje.getDate();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      const somaQuantEntradaHoje = this.dadosEntrada
        .filter(entrada => {
          const dataEntrada = new Date(entrada.dataEntrada);
          return dataEntrada.getDate() === diaAtual &&
                 dataEntrada.getMonth() === mesAtual &&
                 dataEntrada.getFullYear() === anoAtual;
        })
        .reduce((acc, entrada) => acc + entrada.quantEntrada, 0);

      return somaQuantEntradaHoje;
    },
  },
});
</script>

<style scoped>
.real-time {
  display: flex;
}

.box4 {
  margin-top: 0;
  align-items: start;
  justify-content: start;
  color: #000;
  border-radius: 10px;
  border: 1px solid gray;
  width: calc(100% - 2px); /* Ajuste para evitar que ultrapasse a borda */
  max-width: 600px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

.titulo {
  font-size: 18px;
  color: #ffffff; /* Fonte branca */
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
  background-color: #444; /* Fundo grafite */
  padding: 5px 0;
  text-align: center;
  margin-top: 0; /* Adicionando margem superior 0 */
}

.content {
  display: flex;
  justify-content: space-between;
}

.coluna {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.titulo-coluna {
  font-size: 20px;
  padding: 10px 0;
  margin: auto; /* Alinhar o título horizontalmente */
  align-self: flex-start; /* Alinhar o título à parte superior */
}

.num {
  font-size: 40px;
  color: #444;
  font-family: Arial Black;
  margin: auto; /* Alinhar o título horizontalmente */
  align-self: flex-end; /* Alinhar o número à parte inferior */
  margin-bottom: 4px;
}

.linha-vertical {
  border-left: 1px solid #ccc;
  height: auto; /* Ajuste para a linha vertical estender até o fim da caixa */
  margin: 0 20px; /* Espaçamento entre os valores */
}
</style>
