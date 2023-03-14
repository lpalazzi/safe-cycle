import dotenv from 'dotenv';

dotenv.config();

export default {
  test: process.env.TEST === '1' ?? 0,
  port: Number(process.env.PORT) ?? 8000,
  mongoUrl: process.env.MONGODB_URL ?? 'mongodb://127.0.0.1/no_url',
  brouterUrl: process.env.BROUTER_URL ?? 'http://localhost:17777/brouter',
  sessionSecret: process.env.SESSION_SECRET ?? 'no_secret',
  bingMapsApiKey: process.env.BING_MAPS_API_KEY,
  contactEmail: {
    host: process.env.CONTACT_EMAIL_HOST,
    port: Number(process.env.CONTACT_EMAIL_PORT),
    address: process.env.CONTACT_EMAIL_ADDRESS,
    password: process.env.CONTACT_EMAIL_PASSWORD,
  },
};
