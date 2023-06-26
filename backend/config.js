const dotenv = require('dotenv');

dotenv.config();

export default {
  port: process.env.PORT,
  hostname: process.env.HOSTNAME,
  mongo: {
    databaseName: process.env.MONGO_DATABASE_NAME,
    url: process.env.MONGO_URL,
  }
}