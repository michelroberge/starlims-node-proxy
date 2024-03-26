const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PROXY_PORT ?? 3000;
const securityHeadersMiddleware = require('./middleware/securityHeadersMiddleware.js');
const apiRouter = require('./api');
const cacheMiddleware = require('./middleware/cacheMiddleware.js');

app.use(securityHeadersMiddleware);

// Enable CORS for requests from http://localhost:3033
app.use(cors({
    origin: process.env.STARLIMS_REACT_CORS ?? 'http://localhost:3033',
    credentials: true,
    exposedHeaders: ['authorization']
}));

app.use(bodyParser.json());
app.use(cacheMiddleware);

app.use('/', apiRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`STARLIMS Proxy Server is running on http://localhost:${PORT}`);
});
