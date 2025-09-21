const fs = require("fs-extra");
const path = require("node:path");

const source = path.resolve(__dirname, "../packages/worker/lib/worker.js");

const destination = path.resolve(__dirname, "../packages/vulpes/public/worker.js");

const publicDir = path.resolve(__dirname, "../packages/vulpes/public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

if (fs.existsSync(source)) {
  fs.copySync(source, destination);
  console.log("Sucesso: Arquivo do Portugol Worker copiado para a pasta public do Vulpes IDE.");
} else {
  console.error("Erro: Não foi possível encontrar o arquivo do worker para copiar.");
}
