const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');

const authRoutes = require('./routes/auth.routes')
const clientsRoutes = require('./routes/clients.routes');
const projectsRoutes = require('./routes/projects.routes');
const tasksRoutes = require('./routes/tasks.routes');
const timeEntriesRoutes = require("./routes/timeEntries.routes");
const invoicesRoutes = require("./routes/invoices.routes");
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));

// Catch-all to serve index.html for any other requests (SPA behavior)


// Logger
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Routes
app.use('/auth', authRoutes);
app.use("/clients", clientsRoutes);
app.use("/projects", projectsRoutes);
app.use("/", tasksRoutes);
app.use("/", timeEntriesRoutes);
app.use("/", invoicesRoutes);

// Gestion des erreurs
app.use(errorHandler);

module.exports = app;
