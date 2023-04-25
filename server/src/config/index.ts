export default {
  dev: process.env.DEV === '1' ?? 0,
  port: Number(process.env.PORT) ?? 8000,
  https: {
    key: process.env.HTTPS_KEY,
    cert: process.env.HTTPS_CERT,
    ca: process.env.HTTPS_CA,
  },
  mongoUrl: process.env.MONGODB_URL ?? 'mongodb://127.0.0.1/no_url',
  brouterUrl: process.env.BROUTER_URL ?? 'http://localhost:17777/brouter',
  sessionSecret: process.env.SESSION_SECRET ?? 'no_secret',
  bingMapsApiKey: process.env.BING_MAPS_API_KEY,
  sentryDsn: process.env.SENTRY_DSN,
  contactEmail: {
    host: process.env.CONTACT_EMAIL_HOST,
    port: Number(process.env.CONTACT_EMAIL_PORT),
    address: process.env.CONTACT_EMAIL_ADDRESS,
    password: process.env.CONTACT_EMAIL_PASSWORD,
  },
};
