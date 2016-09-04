'use strict'

const apiBaseUrl = 'http://mm-recruitment-stock-price-api.herokuapp.com'
const ObjectId = require('mongodb').ObjectId
const http = require('http')

const forCompanyList = document => ({
  id: document._id.valueOf(),
  name: document.name
})

const forCompanyDetails = document =>
  Object.assign(forCompanyList(document), {
    tickerCode: document.tickerCode,
    stockPrice: 1234
  })

const getStockPrice = (tickerCode, callback) => {
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

class Companies {
  constructor (db) {
    this._db = db
  }

  list (callback) {
    return this._db
      .collection('company')
      .find({})
      .toArray((err, documents) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        callback(null, documents.map(forCompanyList))
      })
  }

  details (id, callback) {
    return this._db
      .collection('company')
      .find(ObjectId(id))
      .toArray((err, documents) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        if (documents.length) {
          const company = forCompanyDetails(documents[0])

          return getStockPrice(company.tickerCode, (err, price) => {
            if (err) {
              return callback(new Error('API error'))
            }

            company.stockPrice = price
            callback(null, company)
          })
        }

        return callback(null, null)
      })
  }
}

module.exports = Companies
