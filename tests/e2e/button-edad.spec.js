const { test, expect } = require('@playwright/test');

async function ingresarCantidad(page, cantidad) {
  await page.getByLabel('Ingrese la cantidad de integrantes').fill(String(cantidad));
  await page.getByRole('button', { name: /Siguiente/i }).click();
}

async function calcularEdades(page, edades) {
  await ingresarCantidad(page, edades.length);

  for (let i = 0; i < edades.length; i += 1) {
    await page.getByLabel(`Ingrese la edad del integrante ${i + 1}`).fill(String(edades[i]));
  }

  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
}

test.describe('Calculadora de edades', () => {
  test('calcula promedio, mayor y menor para dos integrantes', async ({ page }) => {
    await page.goto('./');
    await calcularEdades(page, [20, 10]);

    await expect(page.locator('#datosCalculados')).toBeVisible();
    await expect(page.locator('#promedio-edad')).toHaveText('15.00');
    await expect(page.locator('#mayor-edad')).toHaveText('20');
    await expect(page.locator('#menor-edad')).toHaveText('10');
  });

  test('muestra un error visible y no calcula NaN si una edad está vacía', async ({ page }) => {
    await page.goto('./');
    await ingresarCantidad(page, 2);
    await page.getByLabel('Ingrese la edad del integrante 1').fill('20');

    await page.getByRole('button', { name: 'Calcular', exact: true }).click();

    await expect(page.locator('#errorEdad')).toBeVisible();
    await expect(page.locator('#errorEdad')).toContainText('número mayor que 0');
    await expect(page.locator('#datosCalculados')).toBeHidden();
    await expect(page.locator('body')).not.toContainText('NaN');
    await expect(page.getByLabel('Ingrese la edad del integrante 2')).toHaveAttribute('aria-invalid', 'true');
  });

  for (const cantidad of ['', '0', '-1', '51']) {
    test(`rechaza la cantidad de integrantes "${cantidad}"`, async ({ page }) => {
      await page.goto('./');
      await page.getByLabel('Ingrese la cantidad de integrantes').fill(cantidad);
      await page.getByRole('button', { name: /Siguiente/i }).click();

      await expect(page.locator('#errorCantidad')).toBeVisible();
      await expect(page.locator('#calcular')).toBeHidden();
      await expect(page.locator('#integrantes')).toBeEmpty();
    });
  }

  test('reiniciar limpia el formulario y oculta los resultados', async ({ page }) => {
    await page.goto('./');
    await calcularEdades(page, [20, 10]);
    await expect(page.locator('#datosCalculados')).toBeVisible();

    await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();

    await expect(page.getByLabel('Ingrese la cantidad de integrantes')).toHaveValue('');
    await expect(page.locator('#integrantes')).toBeEmpty();
    await expect(page.locator('#calcular')).toBeHidden();
    await expect(page.locator('#datosCalculados')).toBeHidden();
    await expect(page.locator('#promedio-edad')).toHaveText('');
  });

  test('tiene un solo h1 y todos los controles tienen label asociado', async ({ page }) => {
    await page.goto('./');

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByLabel('Ingrese la cantidad de integrantes')).toBeVisible();
    await expect(page.locator('#datosCalculados')).toHaveAttribute('aria-live', 'polite');

    await ingresarCantidad(page, 2);

    await expect(page.getByLabel('Ingrese la edad del integrante 1')).toBeVisible();
    await expect(page.getByLabel('Ingrese la edad del integrante 2')).toBeVisible();

    const controlesSinLabel = await page.locator('input').evaluateAll((inputs) => inputs
      .filter((input) => input.labels.length === 0)
      .map((input) => input.id));

    expect(controlesSinLabel).toEqual([]);
  });
});

for (const width of [390, 320]) {
  test.describe(`Vista móvil de ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });

    test('no tiene overflow horizontal ni errores de consola', async ({ page }) => {
      const erroresDeConsola = [];

      page.on('console', (message) => {
        if (message.type() === 'error') {
          erroresDeConsola.push(message.text());
        }
      });
      page.on('pageerror', (error) => {
        erroresDeConsola.push(error.message);
      });

      await page.goto('./');
      await page.waitForLoadState('networkidle');
      await calcularEdades(page, [20, 10]);
      await expect(page.locator('#datosCalculados')).toBeVisible();

      const medidas = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }));

      expect(medidas.documentWidth).toBeLessThanOrEqual(medidas.viewportWidth);
      expect(medidas.bodyWidth).toBeLessThanOrEqual(medidas.viewportWidth);
      expect(erroresDeConsola).toEqual([]);
    });
  });
}
