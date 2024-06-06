const fs = require("fs");
const readline = require("readline");
const { exec } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const productos = [];

const askProduct = () => {
  return new Promise((resolve) => {
    rl.question(
      'Introduce un producto para buscar (escribe "salir" para terminar): ',
      (answer) => {
        if (answer.toLowerCase() === "salir") {
          rl.close();
          resolve(null);
        } else {
          productos.push(answer);
          resolve(answer);
        }
      }
    );
  });
};

const askForProducts = async () => {
  let product;
  while ((product = await askProduct())) {}

  fs.writeFileSync("productos.txt", productos.join("\n"), "utf8");
  console.log("Lista de productos guardada en productos.txt");

  // Ejecutar el test de Playwright
  exec("npx playwright test test-1.spec.ts --headed", (err, stdout, stderr) => {
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

askForProducts();
