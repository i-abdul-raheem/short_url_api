const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const { Keys } = require('./keys.model');
require('dotenv').config();
const { db } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.status(200).send('API is up'));

app.get('/:key', async (req, res) => {
  const key = req.params.key;
  if (!key) {
    return res.status(400).send('Invalid URL');
  }
  const data = await Keys.findOne({ key });
  if (!data) {
    return res.status(404).send('URL IS NOT VALID!');
  }
  return res.redirect(data.url);
});

app.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    if (!pattern.test(url)) {
      return res.status(400).json({ message: 'URL is invalid' });
    }
    const key = shortid.generate();
    const newUrl = new Keys({ url, key });
    const resp = await newUrl.save();
    if (!resp?._id) {
      return res
        .status(500)
        .json({ message: 'Internal Server Error', status: 500 });
    }
    return res.status(201).json({ data: key, status: 201 });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: 'Internal Server Error', status: 500 });
  }
});

app.all('*', (req, res) => {
  res.status(405).send('Method Not Allowed');
});

if (process.env.NODE_ENV === 'local') {
  try {
    app.listen(process.env.PORT || 5000, () => {
      console.log('\x1b[33m%s\x1b[0m', '[!] Connection to database...');
      // Database connection error
      db.on('error', (err) => {
        console.error(err);
      });
      // Database connection open
      db.on('open', () => {
        console.log('\x1b[32m', '[+] Database Connected');
        console.log(
          '\x1b[32m',
          `[+] Server Started: http://localhost:${process.env.PORT || 5000}`
        );
      });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: 'Internal Server Error', status: 500 });
  }
}

module.exports = app;
