'use strict'

const expect = require('chai').expect
const common = require('./common')

const assertEachNewsElement = newsElements => {
  const assertions = []

  newsElements.forEach(element => {
    assertions.push(
      element.findElement({css: '.sentiment'})
        .then(sentiment => expect(sentiment).to.exist),
      element.findElement({css: 'h4'}).getText()
        .then(newsHeading => expect(newsHeading).to.have.length.above(0)),
      element.findElement({css: 'p'}).getText()
      .then(newsBody => expect(newsBody).to.have.length.above(0)))
  })

  return assertions
}

describe('Company details', function () {
  this.timeout(10000)

  let driver

  beforeEach(() => {
    driver = common.initialiseWebDriver()
  })

  afterEach(() => driver.quit())

  it('displays company details', done => {
    driver.findElement({partialLinkText: 'Microsoft'})
      .then(link => link.click())
      .then(() => driver.findElement({id: 'company-name'}))
      .then(element => element.getText())
      .then(companyName => expect(companyName).to.equal('Microsoft Inc'))
      .then(() => driver.findElement({id: 'company-code'}))
      .then(element => element.getText())
      .then(companyCode => expect(companyCode).to.equal('MSFT'))
      .then(() => driver.findElement({id: 'stock-price'}))
      .then(element => element.getText())
      .then(stockPrice => expect(stockPrice).to.match(/\d+p/))
      .then(() => driver.findElements({css: '.news li'}))
      .then(newsElements => {
        expect(newsElements).to.have.length(2)
        return Promise.all(assertEachNewsElement(newsElements))
      })
      .then(() => done(), done)
  })
})
