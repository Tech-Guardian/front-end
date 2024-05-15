<template>
  <div class="webcam-feed">
    <div class="titulo">Feed da Webcam</div>
    <video ref="video" autoplay></video>
  </div>
</template>

<script>
export default {
  name: 'WebcamFeed',
  mounted() {
    this.startWebcam();
  },
  methods: {
    async startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.video.srcObject = stream;
      } catch (error) {
        console.error('Erro ao acessar a webcam:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Remove a margem padrão do body */
body {
  margin: 0;
}

.webcam-feed {
  position: relative;
  width: 600px;
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border: 1px solid gray;
  margin-top: 0;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

.webcam-feed .titulo {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold; /* Adiciona negrito */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  font-size: 18px;
  color: #ffffff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #444;
  padding: 5px 0;
  text-align: center;
}

.webcam-feed video {
  width: 100%;
  height: auto;
  color: #000;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
</style>
