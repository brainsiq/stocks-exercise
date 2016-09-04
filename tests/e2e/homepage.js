'use strict'

const webdriver = require('selenium-webdriver')
const expect = require('chai').expect

const siteUrl = 'http://app:8080'

describe('Homepage', () => {
  let driver

  beforeEach(() => {
    driver = new webdriver.Builder()
      .forBrowser('phantomjs')
      .build()
  })

  afterEach(() => driver.quit())

  it('displays a list of companies', done => {
    driver.get(siteUrl)
      .then(() => driver.findElements(webdriver.By.css('.container a')))
      .then(links => {
        expect(links).to.have.length(5)

        return Promise.all([
          links[0].getText().then(text => expect(text).to.equal('Microsoft Inc')),
          links[1].getText().then(text => expect(text).to.equal('Google Inc')),
          links[2].getText().then(text => expect(text).to.equal('Apple Inc')),
          links[3].getText().then(text => expect(text).to.equal('Facebook Inc')),
          links[4].getText().then(text => expect(text).to.equal('Pearson Plc'))
        ])
      })
      .then(() => done(), done)
  })

  it('navigates to a company details page', done => {
    driver.get(siteUrl)
      .then(() => driver.findElement(webdriver.By.partialLinkText('Microsoft')))
      .then(link => link.click())
      .then(() => driver.findElement(webdriver.By.id('company-name')))
      .then(element => element.getText())
      .then(companyName => expect(companyName).to.equal('Microsoft Inc'))
      .then(() => driver.findElement(webdriver.By.id('company-code')))
      .then(element => element.getText())
      .then(companyCode => expect(companyCode).to.equal('MSFT'))
      .then(() => driver.findElement(webdriver.By.id('stock-price')))
      .then(element => element.getText())
      .then(stockPrice => expect(stockPrice).to.match(/\d+p/))
      .then(() => done(), done)
  })
})
