const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const { createHttpTerminator } = require("http-terminator");
const apiRouter = require("./routes/index");

const { log, error, info } = console;

const app = express();

// CONFIG AND ENVIRONMENT LOADING FROM .env FILE
let config = require("./.env");
const environment = process.env.NODE_ENV;
config = config[environment];
if (!config) {
  return error(`❌ Invalid ${environment} environment`);
}

const API_ROOT = "/api";

// MIDDLEWARES
app
  .use(cors()) // Using cors middleware
  .use(morgan("combined")) // Using morgan middleware
  .use(express.json()) // Using JSON Body parser middleware
  .use(API_ROOT, apiRouter) // ROUTING middleware
  .use((req, res, next) => {
    // Creating your custom middleware
    log("🍺My Custom middleware");
    next();
  });

// NONGOOSE
mongoose.connect(config.mongoURL + config.mongoDBName);

// Init server
const server = app.listen(config.port, (err) => {
  info(`\n\n${">".repeat(60)}`);
  info(`💻  Reboot Server Live`);
  info(`⚙️   Environment: ${environment}`);
  info(`💽  Database: ${config.mongoURL}${config.mongoDBName}`);
  info(`📡  API server: http://localhost:${config.port}${API_ROOT}`);
  info(`${">".repeat(60)}\n\n`);
});

httpTerminator = createHttpTerminator({ server });

const shutDownHandler = async (signal) => {
  log(`\n > > ${signal} signal received: closing HTTP server`);

  await httpTerminator.terminate();
  log("HTTP Server closed.");

  await mongoose.disconnect();
  log("DB Server closed.");

  process.exit();
};

process
  .on("SIGHUP", shutDownHandler.bind(undefined, "SIGHUP"))
  .on("SIGTERM", shutDownHandler.bind(undefined, "SIGTERM"))
  .on("SIGINT", shutDownHandler.bind(undefined, "SIGINT"));
