const winston = require('winston');
const { publishAd } = require('./utils/adUtils');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'resources/logs/app.log' }),
  ],
});

const email = 'jorgeligg@gmail.com';
const password = 'RHq*pxbmj3mq*AF';

const adData = {
  type: 'Autos',
  brand: 'Acura',
  model: 'ilx',
  subtype: 'sedán',
  year: '2018',
  province: 'nuevo león',
  city: 'monterrey',
  mileage: '20000',
  price: '350000',
  description: 'Vendo mi Acura ILX 2018, un sedán de lujo que combina elegancia y rendimiento. Esta en perfecto estado estético y mecánico.',
  photoPaths: [
    'resources/img/accura_mdx_2018_back_1.jpg',
    'resources/img/accura_mdx_2018_back_2.jpg',
    'resources/img/accura_mdx_2018_back_3.jpg',
    'resources/img/accura_mdx_2018_front_1.jpg',
    'resources/img/accura_mdx_2018_front_2.jpg',
    'resources/img/accura_mdx_2018_front_3.jpg',
    'resources/img/accura_mdx_2018_interior_1.jpg',
  ],
};

const puppeteerOptions = {
  browser: { headless: false, slowMo: 20, args: ['--disable-notifications'] },
  page: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    viewport: { width: 1800, height: 900 },
    javaScriptEnabled: true,
  },
};

(async () => {
  const result = await publishAd(email, password, adData, logger, puppeteerOptions);
  logger.info('Resultado de la publicación:', result);
})();
