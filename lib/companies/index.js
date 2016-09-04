'use strict'

const stocksApi = require('./stocks-api')
const newsApi = require('./news-api')

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
  constructor (db, sentimentAnalyser) {
    this._db = require('./database')(db)
    this._sentimentAnalyser = sentimentAnalyser
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

        return stocksApi.getStockData(company.tickerCode, (err, stockData) => {
          if (err) {
            return callback(new Error('Stocks API error'))
          }

          company.stockPrice = stockData.price

          return newsApi.getStories(stockData.newsFeedUrl, (err, news) => {
            if (err) {
              return callback(new Error('News API error'))
            }

            company.news = news.map(story =>
              Object.assign({}, story, {sentiment: this._sentimentAnalyser(story.body)}))

            callback(null, company)
          })
        })
      })
  }
}

module.exports = Companies
