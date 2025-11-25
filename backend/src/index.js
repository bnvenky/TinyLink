require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const webRoutes = require('./routes/web');
const apiLinkRoutes = require('./routes/apiLinks');
const healthRoutes = require('./routes/health');

const app = express();
const port = process.env.PORT;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const frontendBaseUrl = process.env.FRONTEND_BASE_URL || null;
const startedAt = new Date();

app.locals.baseUrl = baseUrl;
app.locals.frontendBaseUrl = frontendBaseUrl;
app.locals.startedAt = startedAt;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use(healthRoutes);
app.use('/api', apiLinkRoutes);
app.use('/', webRoutes);

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  if (req.path.startsWith('/api/')) {
    res.status(status).json({ error: 'ServerError', message: 'Unexpected error' });
    return;
  }
  res.status(status).send('Unexpected error');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TinyLink backend listening on port ${port}`);
});
