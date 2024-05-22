import fs from 'fs';
import os from 'os';
import puppeteer from 'puppeteer';

async function findExistingBrowserInstance(url) {
  const browserList = await puppeteer.launch().then(() => puppeteer.connect({ browserURL: 'http://localhost:5173/json' }));
  for (const browser of browserList) {
    const pages = await browser.pages();
    for (const page of pages) {
      const currentUrl = page.url();
      if (currentUrl.startsWith(url)) {
        return { browser, page };
      }
    }
  }
}

async function startBrowser(url) {
  const existingInstance = await findExistingBrowserInstance(url);
  const { browser, page } = existingInstance || await puppeteer.launch({ headless: false, executablePath: getExecutablePath() });
  
  // If an existing instance is found, navigate to the desired URL
  if (!existingInstance) {
    await page.goto(url);
  }

  // Add your code for handling page events and closing the browser
  
  // Close the page and browser when interrupted
  process.on('SIGINT', async () => {
    console.log('Interrupted, closing the browser...');
    await page.close();
    await browser.close();
    process.exit(0);
  });
}

// Função para obter o caminho do executável do navegador com base no sistema operacional
function getExecutablePath() {
  // Verifica o sistema operacional
  const platform = os.platform();

  // Verifica se o diretório padrão de instalação do navegador existe
  function isValidPath(path) {
    return fs.existsSync(path);
  }

  // Define o caminho padrão de instalação dos navegadores
  let executablePath = '';
  if (platform === 'win32') {
    // Caminhos padrão para Windows
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const operaPath = 'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Opera\\launcher.exe';

    // Prioridade: Edge > Chrome > Opera
    if (isValidPath(edgePath)) {
      executablePath = edgePath;
    } else if (isValidPath(chromePath)) {
      executablePath = chromePath;
    } else if (isValidPath(operaPath)) {
      executablePath = operaPath;
    }
  } else if (platform === 'darwin') {
    // Caminhos padrão para macOS
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const firefoxPath = '/Applications/Firefox.app/Contents/MacOS/firefox';

    // Prioridade: Chrome > Firefox
    if (isValidPath(chromePath)) {
      executablePath = chromePath;
    } else if (isValidPath(firefoxPath)) {
      executablePath = firefoxPath;
    }
  } else if (platform === 'linux') {
    // Caminhos padrão para Linux
    const chromePath = '/usr/bin/google-chrome';
    const firefoxPath = '/usr/bin/firefox';

    // Prioridade: Chrome > Firefox
    if (isValidPath(chromePath)) {
      executablePath = chromePath;
    } else if (isValidPath(firefoxPath)) {
      executablePath = firefoxPath;
    }
  }

  return executablePath;
}

startBrowser('http://localhost:5173/');
