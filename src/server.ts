import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { routes } from './routes';
import { logger } from './utils/logger';

const app = express();
const port = process.env.PORT || 7000;

// Middleware - Parse Body Request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS - access handler
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

routes(app);

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
