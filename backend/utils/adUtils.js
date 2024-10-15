const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');

const loginUrl = 'https://admin.seminuevos.com/login';
const redirectUrl = 'https://admin.seminuevos.com/redirect';
const homeUrl = 'https://www.seminuevos.com/';
const newAdUrl = 'https://www.seminuevos.com/wizard';

const configurePage = async (page, options) => {
  const { userAgent, viewport, javaScriptEnabled } = options;
  if (userAgent) await page.setUserAgent(userAgent);
  if (viewport) await page.setViewport(viewport);
  if (javaScriptEnabled !== undefined) await page.setJavaScriptEnabled(javaScriptEnabled);
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
};

const logInfo = (logger, message) => {
  if (logger && typeof logger.info === 'function') {
    logger.info(message);
  } else {
    // eslint-disable-next-line no-console
    console.log(`INFO: ${message}`);
  }
};

const takeScreenshot = async (
  sessionId,
  page,
  stepName,
  interactionNumber,
  logger,
  screenshotsArray,
) => {
  const screenshotsDir = path.join(__dirname, '../resources/screenshots');
  try {
    await fs.access(screenshotsDir);
  } catch (error) {
    logInfo(logger, `Directory does not exist. Creating directory: ${screenshotsDir}`);
    await fs.mkdir(screenshotsDir, { recursive: true });
  }
  const screenshotPath = `${screenshotsDir}/${sessionId}_${String(interactionNumber).padStart(3, '0')}_${stepName.replace(/\s+/g, '_').toLowerCase()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const imageBase64 = await page.screenshot({ encoding: 'base64', fullPage: true });
  screenshotsArray.push({
    screenshotIndex: interactionNumber,
    interactionNumber,
    stepName,
    image: imageBase64,
  });
  logInfo(logger, `Screenshot taken for step: ${stepName}`);
};

const logError = async (sessionId, page, logger, message, error, screenshotsArray) => {
  if (logger && typeof logger.error === 'function') {
    logger.error(message, error);
  } else {
    // eslint-disable-next-line no-console
    console.error(`ERROR: ${message}`, error);
  }
  if (page) {
    await takeScreenshot(sessionId, page, `error_${message.replace(/\s+/g, '_').toLowerCase()}`, screenshotsArray.length + 1, logger, screenshotsArray);
  }
};

const login = async (sessionId, page, email, password, logger, screenshotsArray) => {
  try {
    logInfo(logger, 'Iniciando sesión...');
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });
    await takeScreenshot(sessionId, page, 'goto_login_page', screenshotsArray.length + 1, logger, screenshotsArray);

    await page.type('#email', email);
    logInfo(logger, 'Correo ingresado');
    await page.type('#password', password);
    logInfo(logger, 'Contraseña ingresada');

    await page.click('button[type="submit"]');
    logInfo(logger, 'Botón de login clickeado');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(sessionId, page, 'login_successful', screenshotsArray.length + 1, logger, screenshotsArray);
    logInfo(logger, 'Inicio de sesión exitoso');

    if (page.url() === redirectUrl) {
      logInfo(logger, 'Redireccionando desde redirectUrl');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await takeScreenshot(sessionId, page, 'redirect_home', screenshotsArray.length + 1, logger, screenshotsArray);
      logInfo(logger, 'Redirección manejada correctamente');
    }

    if (page.url() !== homeUrl) {
      logInfo(logger, 'Navegando a la página de inicio');
      await page.goto(homeUrl, { waitUntil: 'networkidle2' });
      await takeScreenshot(sessionId, page, 'goto_home', screenshotsArray.length + 1, logger, screenshotsArray);
      logInfo(logger, 'Navegado a la página de inicio');
    }
  } catch (error) {
    await logError(sessionId, page, logger, 'Error durante el inicio de sesión', error, screenshotsArray);
    throw error;
  }
};

const fillAdForm = async (sessionId, page, adData, logger, screenshotsArray) => {
  try {
    logInfo(logger, 'Navegando a la página de creación de anuncio...');
    await page.goto(newAdUrl, { waitUntil: 'networkidle2' });
    await page.setViewport({ width: 1504, height: 794 });
    await takeScreenshot(sessionId, page, 'goto_new_ad_page', screenshotsArray.length + 1, logger, screenshotsArray);
    logInfo(logger, 'En página de nuevo anuncio');

    logInfo(logger, 'Seleccionando tipo de vehículo...');
    await page.waitForSelector('.m-b-lg:nth-child(2) > [href="#"]:nth-child(2)', { visible: true });
    await page.click('.m-b-lg:nth-child(2) > [href="#"]:nth-child(2)');
    logInfo(logger, 'Tipo de vehículo desplegado');
    await page.waitForSelector('.active > .over-item-bg li:nth-child(1) > [href="#"]', { visible: true });
    await page.click('.active > .over-item-bg li:nth-child(1) > [href="#"]');
    logInfo(logger, 'Tipo de vehículo seleccionado');

    logInfo(logger, 'Seleccionando marca...');
    await page.waitForSelector('.l3:nth-child(2) [href="#"]:nth-child(2)', { visible: true });
    await page.click('.l3:nth-child(2) [href="#"]:nth-child(2)');
    logInfo(logger, 'Marca desplegada');
    await page.waitForSelector('.active > .over-item-bg li:nth-child(1) > [href="#"]', { visible: true });
    await page.click('.active > .over-item-bg li:nth-child(1) > [href="#"]');
    logInfo(logger, 'Marca seleccionada');

    logInfo(logger, 'Seleccionando modelo...');
    await page.waitForSelector('.col:nth-child(3) > .invalid > [href="#"]:nth-child(2)', { visible: true });
    await page.click('.col:nth-child(3) > .invalid > [href="#"]:nth-child(2)');
    logInfo(logger, 'Modelo desplegado');
    await page.waitForSelector('.active > .over-item-bg li:nth-child(2) > [href="#"]', { visible: true });
    await page.click('.active > .over-item-bg li:nth-child(2) > [href="#"]');
    logInfo(logger, 'Modelo seleccionado');

    logInfo(logger, 'Seleccionando subtipo...');
    await page.waitForSelector('.col:nth-child(4) [href="#"]:nth-child(2)', { visible: true });
    await page.click('.col:nth-child(4) [href="#"]:nth-child(2)');
    logInfo(logger, 'Subtipo desplegado');
    await page.waitForSelector('.active li:nth-child(4) > [href="#"]', { visible: true });
    await page.click('.active li:nth-child(4) > [href="#"]');
    logInfo(logger, 'Subtipo seleccionado');

    logInfo(logger, 'Seleccionando año...');
    await page.waitForSelector('.col:nth-child(5) [href="#"]:nth-child(2)', { visible: true });
    await page.click('.col:nth-child(5) [href="#"]:nth-child(2)');
    logInfo(logger, 'Año desplegado');
    await page.waitForSelector('.active li:nth-child(7) > [href="#"]', { visible: true });
    await page.click('.active li:nth-child(7) > [href="#"]');
    logInfo(logger, 'Año seleccionado');

    logInfo(logger, 'Seleccionando provincia...');
    await page.waitForSelector('.col:nth-child(6) [href="#"]:nth-child(2)', { visible: true });
    await page.click('.col:nth-child(6) [href="#"]:nth-child(2)');
    logInfo(logger, 'Provincia desplegada');
    await page.waitForSelector('.active li:nth-child(19) > [href="#"]', { visible: true });
    await page.click('.active li:nth-child(19) > [href="#"]');
    logInfo(logger, 'Provincia seleccionada');

    logInfo(logger, 'Seleccionando ciudad...');
    await page.waitForSelector('.invalid > [href="#"]:nth-child(2)', { visible: true });
    await page.click('.invalid > [href="#"]:nth-child(2)');
    logInfo(logger, 'Ciudad desplegada');
    await page.waitForSelector('.active li:nth-child(52) > [href="#"]', { visible: true });
    await page.click('.active li:nth-child(52) > [href="#"]');
    logInfo(logger, 'Ciudad seleccionada');

    logInfo(logger, 'Ingresando kilometraje...');
    await page.waitForSelector('#input_recorrido', { visible: true });
    await page.click('#input_recorrido');
    await page.type('#input_recorrido', adData.mileage);
    logInfo(logger, 'Kilometraje ingresado');

    logInfo(logger, `Ingresando precio ${adData.price}...`);
    await page.waitForSelector('#input_precio', { visible: true });
    await page.click('#input_precio');
    await page.type('#input_precio', String(adData.price));
    logInfo(logger, 'Precio ingresado');

    logInfo(logger, 'Haciendo clic en el botón "Siguiente"...');
    await page.waitForSelector('.next-button', { visible: true });
    await Promise.all([
      page.click('.next-button'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);
    await takeScreenshot(sessionId, page, 'clicked_next_after_negotiable', screenshotsArray.length + 1, logger, screenshotsArray);
    logInfo(logger, 'Navegando a la siguiente página');

    logInfo(logger, `Ingresando descripción: ${adData.description} ...`);
    await page.waitForSelector('#input_text_area_review:not([disabled])', { visible: true });
    await page.type('#input_text_area_review', adData.description);
    logInfo(logger, 'Descripción ingresada');

    logInfo(logger, 'Subiendo fotos...');
    const inputUploadHandle = await page.$('input[type=file]');
    await inputUploadHandle.uploadFile(...adData.photoPaths);
    logInfo(logger, 'Fotos seleccionadas para subir');

    logInfo(logger, 'Esperando a que las fotos se carguen...');
    await page.waitForFunction(
      (numPhotos) => {
        const uploadedPhotos = document.querySelectorAll('.uploaded-list li');
        return uploadedPhotos.length >= numPhotos;
      },
      { timeout: 60000 },
      adData.photoPaths.length,
    );
    await takeScreenshot(sessionId, page, 'photos_uploaded', screenshotsArray.length + 1, logger, screenshotsArray);
    logInfo(logger, 'Fotos subidas correctamente');

    logInfo(logger, 'Haciendo clic en el botón "Siguiente" después de subir fotos...');
    await page.waitForSelector('.next-button:nth-child(2)', { visible: true });
    await Promise.all([
      page.click('.next-button:nth-child(2)'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);
    await takeScreenshot(sessionId, page, 'clicked_next_after_uploads', screenshotsArray.length + 1, logger, screenshotsArray);
    logInfo(logger, 'Navegando a la página final');
  } catch (error) {
    await logError(sessionId, page, logger, 'Error llenando el formulario del anuncio', error, screenshotsArray);
    throw error;
  }
};

const publishAd = async (email, password, adData, logger, puppeteerOptions) => {
  const { browser: browserOptions, page: pageOptions } = puppeteerOptions;
  const browser = await puppeteer.launch(browserOptions);
  const page = await browser.newPage();
  const sessionId = `${Date.now()}`;
  const screenshotsArray = [];
  try {
    await configurePage(page, pageOptions);
    logInfo(logger, `${sessionId} - Inicio de sesión`);
    await login(sessionId, page, email, password, logger, screenshotsArray);
    await fillAdForm(sessionId, page, adData, logger, screenshotsArray);
    logInfo(logger, 'Publicando anuncio...');
    await page.evaluate(() => {
      const div = document.querySelector('.full-edit.edit-modal.transition-opacity');
      if (div) {
        div.classList.add('hide');
      }
    });
    await takeScreenshot(sessionId, page, 'clicked_publish', screenshotsArray.length + 1, logger, screenshotsArray);
    await takeScreenshot(sessionId, page, 'post_publish_navigation', screenshotsArray.length + 1, logger, screenshotsArray);
    logInfo(logger, 'Navegando a la página de resultados post-publicación');
    const currentUrl = page.url().replace('/plans', '');
    logInfo(logger, `URL actual después de publicar: ${currentUrl}`);
    const urlMatch = currentUrl.match(/\/myvehicle\/(\d+)/);
    const publicationId = urlMatch ? urlMatch[1] : null;
    if (!publicationId) {
      throw new Error('No se pudo extraer el ID de la publicación de la URL');
    }
    const status = 'published';
    logInfo(logger, 'Publicación exitosa');
    await takeScreenshot(sessionId, page, 'final_page', screenshotsArray.length + 1, logger, screenshotsArray);
    return {
      status,
      publicationId,
      publicationUrl: currentUrl,
      screenshots: screenshotsArray,
      requestId: sessionId,
    };
  } catch (error) {
    await logError(sessionId, page, logger, 'Error publicando el anuncio', error, screenshotsArray);
    return {
      status: 'error',
      screenshots: screenshotsArray,
      requestId: sessionId,
    };
  } finally {
    await browser.close();
  }
};

module.exports = { publishAd };
