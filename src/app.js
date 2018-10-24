require('dotenv').config();
const bodyParser = require('body-parser');
/** @summary Dependencies */
const express = require('express');

/** @summary Express initialization */
const app = express();

/** @summary Routes */
const routes = require('./routes/routes');

// BodyParser
app.use(bodyParser.json());

// all routes
app.use('/', routes);

app.all('*', (req, res) => {
  res.status(404).send({
    success: false,
    code: '404'
  });
});

/** @summary Startup message */
app.listen(process.env.PORT, () => {
  /** @summary Configure Log */
  // LoggerConfig.init();
  // Logger.info(`Server started on port ${process.env.PORT}`);
});

module.exports = app;