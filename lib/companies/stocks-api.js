'use strict'

const apiBaseUrl = 'http://mm-recruitment-stock-price-api.herokuapp.com'
const http = require('http')

module.exports.getStockData = (tickerCode, callback) => {
  return http.get(`${apiBaseUrl}/company/${tickerCode}`, res => {
    if (res.statusCode !== 200) {
      return callback(new Error(`Api ${res.statusCode} response`))
    }

    let data = ''
    res.on('data', chunk => { data += chunk })
    res.on('end', () => {
      const stockData = JSON.parse(data)

      callback(null, {
        price: stockData.latestPrice,
        newsFeedUrl: stockData.storyFeedUrl
      })
    })
  })
  .on('error', err => callback(err))
}
