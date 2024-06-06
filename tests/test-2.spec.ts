import { test, expect, BrowserContextOptions } from "@playwright/test";
import * as fs from "fs";

// Leer filtros desde el archivo filtros.json
const filePath = "./filtros.json";
if (!fs.existsSync(filePath)) {
  throw new Error(
    `El archivo ${filePath} no existe. Asegúrate de crearlo con los filtros a aplicar.`
  );
}
const filtros = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Configuración del navegador para desactivar la geolocalización
const browserOptions: BrowserContextOptions = {
  permissions: ["geolocation"],
  geolocation: { latitude: 0, longitude: 0 },
  timezoneId: "America/Mexico_City",
};

// Configurar el tiempo de espera del test
test.setTimeout(600000); // 600 segundos para todos los productos

test("Buscar y filtrar productos en Liverpool", async ({ browser }) => {
  const context = await browser.newContext(browserOptions);
  const page = await context.newPage();
  await page.goto("https://www.liverpool.com.mx/tienda/home");

  // Buscar el producto
  const searchInput = page.locator("#mainSearchbar").nth(0);
  await searchInput.click();
  await searchInput.fill(filtros.producto);
  const searchButton = page.locator(
    'xpath=//*[@id="sayt"]/div[1]/div/div/button[2]'
  );
  await searchButton.click();

  // Esperar 10 segundos para que se carguen los resultados de búsqueda
  await page.waitForTimeout(10000);

  // Aplicar filtros
  if (filtros.marca) {
    await page.click('button.a-title__filter:has-text("Marcas")');
    await page.fill("#searchBrand", filtros.marca);
    await page.click(`input[id="brand-${filtros.marca.toUpperCase()}"]`);
  }

  // Esperar 10 segundos para que se apliquen los filtros
  await page.waitForTimeout(10000);

  // Verificar si existen productos filtrados
  const productsLocator = page.locator(
    "div.o-listing__products ul.m-product__listingPlp"
  );

  if ((await productsLocator.count()) > 0) {
    console.log(`Productos encontrados para los filtros aplicados.`);

    // Hacer clic en el primer producto de la lista
    await productsLocator.locator("li.m-product__card").first().click();

    // Esperar 5 segundos para que la página del producto se cargue
    await page.waitForTimeout(5000);

    // Hacer clic en el botón "Comprar ahora"
    const buyNowButton = page.locator(
      "button#a-btn.a-btn--primary#opc_pdp_buyNowButton"
    );
    await buyNowButton.click();

    console.log("Se hizo clic en el botón 'Comprar ahora'.");
  } else {
    console.log(`No se encontraron productos para los filtros aplicados.`);
  }

  await context.close();
});
