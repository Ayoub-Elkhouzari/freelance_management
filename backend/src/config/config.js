require("dotenv").config({ override: true });

module.exports = {
  port: process.env.PORT || 3000,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
};
