const fs = require("fs");
const readline = require("readline");
const { exec } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const filtros = {
  producto: "",
  marca: "",
  tamaño: "",
  precioMin: "",
  precioMax: "",
};

const askFiltro = (pregunta) => {
  return new Promise((resolve) => {
    rl.question(pregunta, (answer) => {
      resolve(answer);
    });
  });
};

const askForFiltros = async () => {
  filtros.producto = await askFiltro("Introduce el producto a buscar: ");
  filtros.marca = await askFiltro("Introduce la marca: ");
  filtros.tamaño = await askFiltro("Introduce el tamaño: ");
  filtros.precioMin = await askFiltro("Introduce el precio mínimo: ");
  filtros.precioMax = await askFiltro("Introduce el precio máximo: ");

  fs.writeFileSync("filtros.json", JSON.stringify(filtros, null, 2), "utf8");
  console.log("Filtros guardados en filtros.json");

  // Ejecutar el test de Playwright
  exec("npx playwright test test-2.spec.ts --headed", (err, stdout, stderr) => {
    if (err) {
      console.error(`Error al ejecutar el test: ${err.message}`);
      return;
    }

    if (stderr) {
      console.error(`Error de salida: ${stderr}`);
      return;
    }

    console.log(`Salida del test:\n${stdout}`);

    // Mostrar el informe de Playwright
    exec("npx playwright show-report", (err, stdout, stderr) => {
      if (err) {
        console.error(`Error al mostrar el informe: ${err.message}`);
        return;
      }

      if (stderr) {
        console.error(`Error de salida del informe: ${stderr}`);
        return;
      }

      console.log(`Informe de Playwright:\n${stdout}`);
    });
  });
};

askForFiltros();
