<template>
  <div class="webcam-feed">
    <div class="header">
      <div class="titulo">Feed da Webcam</div>
      <div class="select-wrapper">
        <select v-model="mode" @change="handleModeChange">
          <option value="stream">Stream</option>
          <option value="frames">Frames</option>
        </select>
      </div>
    </div>
    <img v-if="!loadingError" :src="displayImage" alt="Webcam Feed" @error="handleImageError" />
    <div v-else>
      <img :src="waitingImage" alt="Waiting for Camera" />
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  name: 'WebcamFeed',
  data() {
    return {
      streamUrl: 'http://localhost:5000/stream', // URL do stream do servidor Flask
      mode: 'stream', // default mode
      socket: null,
      currentFrame: '',
      cameraReady: false,
      eventSource: null,
      checkInterval: null,
      waitingImage: '', // Image to show while waiting for the camera
      loadingError: false, // Flag to indicate loading error
    };
  },
  computed: {
    displayImage() {
      return this.mode === 'stream' ? this.streamUrl : this.currentFrame;
    },
  },
  mounted() {
    this.createWaitingImage();
    if (this.mode === 'frames') {
      this.setupSocket();
      this.fetchProcessedFrames();
    } else {
      this.startStreamCheck();
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.eventSource) {
      this.eventSource.close();
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
  methods: {
    handleModeChange() {
      if (this.mode === 'frames') {
        this.setupSocket();
        this.fetchProcessedFrames();
      } else {
        this.cleanupFrames();
        this.startStreamCheck();
      }
    },
    setupSocket() {
      if (this.socket) {
        this.socket.disconnect();
      }
      this.socket = io('http://localhost:5000'); // Connect to the socket.io server
      this.socket.on('processed_frame', (frame) => {
        if (this.mode === 'frames') {
          this.currentFrame = 'data:image/png;base64,' + frame;
          this.cameraReady = true;
          this.loadingError = false; // Reset loading error flag
          if (this.checkInterval) {
            clearInterval(this.checkInterval);
          }
        }
      });
      this.socket.on('connect_error', () => {
        this.cameraReady = false;
        this.loadingError = true; // Set loading error flag
      });
    },
    fetchProcessedFrames() {
      if (this.eventSource) {
        this.eventSource.close();
      }
      const url = 'http://localhost:5000/frames'; // URL dos frames do servidor Flask
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (event) => {
        this.currentFrame = 'data:image/png;base64,' + event.data;
        this.cameraReady = true;
        this.loadingError = false; // Reset loading error flag
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
        }
      };

      this.eventSource.onerror = () => {
        this.cameraReady = false;
        this.loadingError = true; // Set loading error flag
        this.eventSource.close();
      };
    },
    cleanupFrames() {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      this.currentFrame = '';
      this.cameraReady = false;
    },
    startStreamCheck() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      this.checkStreamAvailability();
      this.checkInterval = setInterval(this.checkStreamAvailability, 1000);
    },
    async checkStreamAvailability() {
      try {
        const response = await fetch(this.streamUrl, { method: 'HEAD' });
        if (response.ok) {
          this.cameraReady = true;
          this.loadingError = false; // Reset loading error flag
          if (this.checkInterval) {
            clearInterval(this.checkInterval);
          }
        } else {
          this.cameraReady = false;
          this.loadingError = true; // Set loading error flag
        }
      } catch (error) {
        console.log('Buscando câmera...');
        this.cameraReady = false;
        this.loadingError = true; // Set loading error flag
      }
    },
    createWaitingImage() {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 450;
      const context = canvas.getContext('2d');

      // Draw black background
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waiting message
      context.fillStyle = 'red';
      context.font = '30px Arial';
      context.textAlign = 'center';
      context.fillText('Aguardando câmera...', canvas.width / 2, canvas.height / 2);

      this.waitingImage = canvas.toDataURL('image/png');
    },
    handleImageError() {
      this.loadingError = true; // Set loading error flag if image fails to load
    },
  },
};
</script>

<style scoped>
.webcam-feed {
  justify-content: flex-start;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  border: 1px solid gray;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 4 / 3;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: #444;
  color: #ffffff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-sizing: border-box;
}

.titulo {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  margin-left: auto;
  margin-right: 25%;
  padding: 5px 0;
}

.select-wrapper {
  margin-right: 10px;
}

select {
  padding: 1px;
  background-color: #fff;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.webcam-feed img {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.waiting-message {
  color: red;
  font-size: 20px;
  text-align: center;
  margin-top: auto;
  margin-bottom: auto;
}
</style>
