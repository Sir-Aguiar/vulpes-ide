const fs = require("fs-extra");
const path = require("node:path");

// Caminho para o worker.js compilado dentro do pacote @portugol-webstudio/worker
const source = path.resolve(__dirname, "../packages/worker/lib/worker.js");

// Caminho para a pasta public do seu app Next.js (vulpes)
const destination = path.resolve(__dirname, "../packages/vulpes/public/worker.js");

// Verifica se a pasta /public existe antes de copiar
const publicDir = path.resolve(__dirname, "../packages/vulpes/public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Copia o arquivo
if (fs.existsSync(source)) {
  fs.copySync(source, destination);
  console.log("Sucesso: Arquivo do Portugol Worker copiado para a pasta public do Vulpes IDE.");
} else {
  console.error("Erro: Não foi possível encontrar o arquivo do worker para copiar.");
}
