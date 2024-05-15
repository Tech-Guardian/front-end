<template>
  <header class="header">
    <div class="logo-container">
      <img class="logo" src="@/assets/icons/logo-6.png" alt="Logo da empresa" />
    </div>
    <div class="symbol-container">
      <img class="symbol" src="@/assets/icons/logo-4.png" alt="Símbolo" />
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed; /* Fixa o Header no topo da página */
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999; /* Garante que o Header esteja sempre acima de outros elementos */
  background: linear-gradient(90deg, #011F37, #0067A2);
  height: 65px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  height: 100%;
  display: flex;
  align-items: center;
}

.logo {
  max-height: 100%;
  width: auto;
}

.symbol-container {
  position: absolute;
  bottom: -70%;
  left: 50%;
  transform: translateX(-50%);
}

.symbol {
  height: 120px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0px 0px 10px rgba(0,0,0,0.5));
}
</style>