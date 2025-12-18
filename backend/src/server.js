const app = require("./app");
const config = require("./config/config");
console.log("ACCESS secret exists:", !!config.jwt.accessSecret);
console.log("REFRESH secret exists:", !!config.jwt.refreshSecret);
const db = require("./db"); // mysql2/promise pool export

async function start() {
  try {
    // ✅ Verify DB connection before starting server
    await db.execute("SELECT 1");

    app.listen(config.port, () => {
      console.log(
        `Environnement: [${config.env || "dev"}] - API en écoute sur le port ${config.port}`
      );
    });
  } catch (err) {
    console.error("Erreur de démarrage :", err.message);
    process.exit(1);
  }
}

start();
