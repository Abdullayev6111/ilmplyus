const { default: axios } = require('axios');

const API = axios.create({
  baseURL: 'https://easypos.uz/api',
});
