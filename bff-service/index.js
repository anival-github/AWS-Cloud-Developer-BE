const express = require('express');
const cors = require('cors');
const { checkIsCacheUsed, getFromCache, setToCache } = require('./cache');
require('dotenv').config();
const axios = require('axios').default;

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors())
app.use(express.json());

app.all('/*', (req, res) => {
  console.log('originalURL: ', req.originalUrl); // products/main?res=all
  console.log('method: ', req.method); // GET, POST
  console.log('body: ', req.body); // { name: 'product-1', count: '1' }

  const recepientService = req.originalUrl.split('/')[1];

  console.log('recepientService: ', recepientService);

  const recepientServiceUrl = process.env[recepientService];
  console.log('recepientServiceUrl: ', recepientServiceUrl);

  if (!recepientServiceUrl) {
    res.status(502).json({ error: 'Cannot process request' });
    return;
  }

  const redirectUrl = `${recepientServiceUrl}${req.originalUrl}`;

  const isCacheUsed = checkIsCacheUsed(req.originalUrl, req.method);
  const cache = isCacheUsed ? getFromCache() : null;

  if (cache) {
    console.log('response from cache: ', cache);

    res.json(cache);
    return;
  }

  const axiosConfig = {
    method: req.method,
    url: redirectUrl,
    ...(Object.keys(req.body || {}).length > 0 && { data: req.body }),
  };

  console.log('axiosConfig: ', axiosConfig);

  axios(axiosConfig)
    .then((response) => {
      console.log('response from recepient: ', response.data);

      if (isCacheUsed) {
        setToCache(response.data);
      }

      res.json(response.data);
    })
    .catch((error) => {
      console.log('some error: ', JSON.stringify(error));

      if (error.response) {
        const { status, data } = error.response;
        res.status(status).json(data);
      } else {
        res.status(500).json({ error: error.message });
      }
    });
});

app.listen(PORT, () => {
  console.log('App is working on port: ', PORT);
})