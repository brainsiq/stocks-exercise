'use strict'

const apiBaseUrl = 'http://mm-recruitment-stock-price-api.herokuapp.com'
const http = require('http')

module.exports.getStockPrice = (tickerCode, callback) => {
  return http.get(`${apiBaseUrl}/company/${tickerCode}`, res => {
    if (res.statusCode !== 200) {
      return callback(new Error(`Api ${res.statusCode} response`))
    }

    let data = ''
    res.on('data', chunk => { data += chunk })
    res.on('end', () => callback(null, JSON.parse(data).latestPrice))
  })
  .on('error', err => callback(err))
}
