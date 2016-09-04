'use strict'

const ObjectId = require('mongodb').ObjectId
const expect = require('chai').expect
const nock = require('nock')
const Companies = require('../../lib/companies')

const testCompaniesData = [
  {_id: new ObjectId(), name: 'one', tickerCode: 'A'},
  {_id: new ObjectId(), name: 'two', tickerCode: 'B'},
  {_id: new ObjectId(), name: 'three', tickerCode: 'C'}
]

const fakeSentimentAnalyser = text => text === 'bar'
  ? 'positive'
  : 'negative'

const stubMongoDatabase = require('./stub-mongo-db').bind(null, testCompaniesData)

describe('Companies', () => {
  describe('list', () => {
    it('retrieves all companies from the database', done => {
      const companies = new Companies(stubMongoDatabase(), fakeSentimentAnalyser)

      companies.list((err, companies) => {
        expect(err).to.be.null
        expect(companies).to.deep.equal([
          {id: testCompaniesData[0]._id.valueOf(), name: 'one'},
          {id: testCompaniesData[1]._id.valueOf(), name: 'two'},
          {id: testCompaniesData[2]._id.valueOf(), name: 'three'}
        ])
        done()
      })
    })
  })

  it('handles mongoDb errors', done => {
    const companies = new Companies(
      stubMongoDatabase(new Error('a test error')), fakeSentimentAnalyser)

    companies.list((err, companies) => {
      expect(err).to.be.an.instanceof(Error)
      expect(err.message).to.equal('Database error')
      expect(companies).to.be.undefined
      done()
    })
  })

  describe('details', () => {
    const testCompanyId = testCompaniesData[1]._id.valueOf()
    const testCompanyStockCode = testCompaniesData[1].tickerCode
    const fakeStockPrice = Math.random()

    // prevent outgoing http calls to ensure stubs are being used
    nock.disableNetConnect()

    describe('when successful', () => {
      let returnedCompany

      before(done => {
        nock('http://mm-recruitment-stock-price-api.herokuapp.com')
          .get(`/company/${testCompanyStockCode}`)
          .reply(200, {
            tickerCode: testCompanyStockCode,
            latestPrice: fakeStockPrice,
            storyFeedUrl: 'http://example.com/xyz'
          })

        nock('http://example.com')
          .get('/xyz')
          .reply(200, [
            {id: 1, headline: 'foo', body: 'bar'},
            {id: 2, headline: 'bar', body: 'foo'}
          ])

        const companies = new Companies(stubMongoDatabase(), fakeSentimentAnalyser)

        companies.details(testCompanyId, (err, company) => {
          if (err) {
            return done(err)
          }

          returnedCompany = company
          done()
        })
      })

      after(() => nock.cleanAll())

      it('returns the company details', () => {
        expect(returnedCompany).to.have.property('id', testCompanyId)
        expect(returnedCompany).to.have.property('name', 'two')
        expect(returnedCompany).to.have.property('tickerCode', 'B')
      })

      it('returns the stock price', () => {
        expect(returnedCompany).to.have.property('stockPrice', fakeStockPrice)
      })

      it('returns the two most recent news stories with sentiment analysis', () => {
        expect(returnedCompany).to.have.property('news')
        expect(returnedCompany.news).to.be.an('array')
        expect(returnedCompany.news).to.have.length(2)
        expect(returnedCompany.news[0]).to.deep.equal({
          headline: 'foo',
          body: 'bar',
          sentiment: 'positive'
        })
        expect(returnedCompany.news[1]).to.deep.equal({
          headline: 'bar',
          body: 'foo',
          sentiment: 'negative'
        })
      })
    })

    it('returns nothing for a company that does not exist', done => {
      const companies = new Companies(stubMongoDatabase(), fakeSentimentAnalyser)

      companies.details(new ObjectId().valueOf(), (err, company) => {
        expect(err).to.be.null
        expect(company).to.be.null
        done()
      })
    })

    it('handles mongoDb errors', done => {
      const companies = new Companies(
        stubMongoDatabase(new Error('a test error')), fakeSentimentAnalyser)

      companies.details(new ObjectId().valueOf(), (err, companies) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('Database error')
        expect(companies).to.be.undefined
        done()
      })
    })

    it('handles stock price api http errors', done => {
      nock('http://mm-recruitment-stock-price-api.herokuapp.com')
        .get(`/company/${testCompanyStockCode}`)
        .replyWithError(new Error('an error'))

      const companies = new Companies(stubMongoDatabase(), fakeSentimentAnalyser)

      companies.details(testCompanyId, (err, company) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('Stocks API error')
        expect(company).to.be.undefined
        done()
      })
    })

    it('handles stock price bad http responses', done => {
      nock('http://mm-recruitment-stock-price-api.herokuapp.com')
        .get(`/company/${testCompanyStockCode}`)
        .reply(500, 'internal server error')

      const companies = new Companies(stubMongoDatabase(), fakeSentimentAnalyser)

      companies.details(testCompanyId, (err, company) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('Stocks API error')
        expect(company).to.be.undefined
        done()
      })
    })

    it('handles news feed api errors', done => {
      nock('http://mm-recruitment-stock-price-api.herokuapp.com')
        .get(`/company/${testCompanyStockCode}`)
        .reply(200, {
          tickerCode: 'abc',
          latestPrice: 1,
          storyFeedUrl: 'http://example.com/xyz'
        })

      nock('http://example.com')
        .get('/xyz')
        .replyWithError(new Error('an error'))

      const companies = new Companies(stubMongoDatabase(), fakeSentimentAnalyser)

      companies.details(testCompanyId, (err, company) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('News API error')
        expect(company).to.be.undefined
        done()
      })
    })

    it('handles news feed bad api responses', done => {
      nock('http://mm-recruitment-stock-price-api.herokuapp.com')
        .get(`/company/${testCompanyStockCode}`)
        .reply(200, {
          tickerCode: 'abc',
          latestPrice: 1,
          storyFeedUrl: 'http://example.com/xyz'
        })

      nock('http://example.com')
        .get('/xyz')
        .reply(500, 'internal server error')

      const companies = new Companies(stubMongoDatabase(), fakeSentimentAnalyser)

      companies.details(testCompanyId, (err, company) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('News API error')
        expect(company).to.be.undefined
        done()
      })
    })
  })
})
