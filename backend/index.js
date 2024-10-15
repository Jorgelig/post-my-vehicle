const winston = require('winston');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');

const { publishAd } = require('./utils/adUtils');

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));

const PORT = process.env.PORT || 3000;
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

app.use(express.json());

app.post('/api/publish-ad', async (req, res) => {
  const {
    price, description,
  } = req.body;
  if (!price || !description) {
    return res.status(400).json({ message: 'Price and description are required.' });
  }

  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  const adData = {
    type: 'Autos',
    brand: 'Acura',
    model: 'ilx',
    subtype: 'sedán',
    year: '2018',
    province: 'nuevo león',
    city: 'monterrey',
    mileage: '20000',
    price,
    description,
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
    browser: { headless: true, slowMo: 30, args: ['--disable-notifications', '--no-sandbox', '--disable-setuid-sandbox'] },
    page: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      viewport: { width: 1800, height: 900 },
      javaScriptEnabled: true,
    },
  };

  try {
    const result = await publishAd(email, password, adData, logger, puppeteerOptions);
    const lastScreenshot = result.screenshots[result.screenshots.length - 1].image;

    if (result.status === 'error') {
      return res.status(200).send({
        status: result.status,
        message: 'Failed to publish ad',
        publicationId: result.publicationId,
        publicationUrl: result.publicationUrl,
        screenshot: lastScreenshot,
        requestId: result.requestId,
      });
    }

    return res.status(200).send({
      status: result.status,
      publicationId: result.publicationId,
      publicationUrl: result.publicationUrl,
      message: 'Ad published successfully',
      screenshot: lastScreenshot,
      requestId: result.requestId,
    });
  } catch (error) {
    return res.status(500).send({ message: 'Failed to publish ad', error: error.message });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
