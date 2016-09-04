'use strict'

const stocksApi = require('./stocks-api')

const forCompanyList = document => ({
  id: document._id.valueOf(),
  name: document.name
})

const forCompanyDetails = document =>
  Object.assign(forCompanyList(document), {
    tickerCode: document.tickerCode,
    stockPrice: 1234
  })

class Companies {
  constructor (db) {
    this._db = require('./database')(db)
  }

  list (callback) {
    return this._db.getCompanies((err, documents) => {
      if (err) {
        return callback(new Error('Database error'))
      }

      callback(null, documents.map(forCompanyList))
    })
  }

  details (id, callback) {
    return this._db
      .getCompany(id, (err, document) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        if (!document) {
          return callback(null, null)
        }

        const company = forCompanyDetails(document)

        return stocksApi.getStockPrice(company.tickerCode, (err, price) => {
          if (err) {
            return callback(new Error('API error'))
          }

          company.stockPrice = price
          callback(null, company)
        })
      })
  }
}

module.exports = Companies
