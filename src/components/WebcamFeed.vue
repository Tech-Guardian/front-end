<template>
  <div class="webcam-feed">
    <div class="titulo">Feed da Webcam</div>
    <video ref="video" autoplay></video>
  </div>
</template>

<script>
export default {
  name: 'WebcamFeed',
  data() {
    return {
      stream: null,
    };
  },
  mounted() {
    this.startWebcam();
  },
  beforeUnmount() {
    this.stopWebcam();
  },
  methods: {
    async startWebcam() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (this.$refs.video instanceof HTMLVideoElement) {
          this.$refs.video.srcObject = this.stream;
        }
      } catch (error) {
        console.error('Erro ao acessar a webcam:', error);
      }
    },
    stopWebcam() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }
};
</script>

<style scoped>
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
  font-weight: bold;
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
