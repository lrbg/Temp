import { test, expect, BrowserContextOptions } from "@playwright/test";
import * as fs from "fs";

// Verifica que el archivo productos.txt exista en el mismo directorio
const filePath = "./productos.txt";
if (!fs.existsSync(filePath)) {
  throw new Error(
    `El archivo ${filePath} no existe. Asegúrate de crearlo con los productos a buscar.`
  );
}

// Leer productos desde el archivo productos.txt
const productos = fs.readFileSync(filePath, "utf8").split("\n").filter(Boolean);

// Configuración del navegador para desactivar la geolocalización
const browserOptions: BrowserContextOptions = {
  permissions: ["geolocation"],
  geolocation: { latitude: 0, longitude: 0 },
  timezoneId: "America/Mexico_City",
};

// Configurar el tiempo de espera del test
test.setTimeout(300000); // 600 segundos para todos los productos

test("Buscar productos en Liverpool", async ({ browser }) => {
  const context = await browser.newContext(browserOptions);
  const page = await context.newPage();
  await page.goto("https://www.liverpool.com.mx/tienda/home");

  for (const producto of productos) {
    console.log(`Buscando producto: ${producto}`);
    const searchInput = page.locator("#mainSearchbar").nth(0);
    await searchInput.click();
    await searchInput.fill(producto);

    // Verificar si el botón de búsqueda existe antes de hacer clic
    const searchButton = page.locator(
      'xpath=//*[@id="sayt"]/div[1]/div/div/button[2]'
    );
    const isSearchButtonVisible = await searchButton.isVisible();
    if (!isSearchButtonVisible) {
      throw new Error("El botón de búsqueda no es visible.");
    }
    await searchButton.click(); // Click en el botón de búsqueda

    // Esperar 10 segundos
    await page.waitForTimeout(10000);

    // Verificar si existen productos
    const productsLocator = page.locator(
      "div.o-listing__products ul.m-product__listingPlp"
    );

    if ((await productsLocator.count()) > 0) {
      console.log(`Producto "${producto}" encontrado.`);
    } else {
      console.log(`Producto "${producto}" no encontrado.`);
    }

    // Esperar 10 segundos
    await page.waitForTimeout(10000);

    // Verificar si el botón para limpiar la búsqueda existe antes de hacer clic
    const clearButton = page.locator('xpath=//*[@id="clear-sayt"]');
    const isClearButtonVisible = await clearButton.isVisible();
    if (!isClearButtonVisible) {
      throw new Error("El botón para limpiar la búsqueda no es visible.");
    }
    await clearButton.click(); // Click en el botón para limpiar el campo de búsqueda

    // Esperar 10 segundos
    await page.waitForTimeout(10000);
  }

  await context.close();
});
