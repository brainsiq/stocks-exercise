'use strict'

const webdriver = require('selenium-webdriver')
const expect = require('chai').expect

describe('Homepage', () => {
  let driver

  beforeEach(() => {
    driver = new webdriver.Builder()
      .forBrowser('phantomjs')
      .build()
  })

  afterEach(() => driver.quit())

  it('displays a list of companies', done => {
    driver.get('http://app:8080')
      .then(() => driver.findElements(webdriver.By.css('.container a')))
      .then(links => {
        expect(links).to.have.length(5)
        done()
      })
  })
})
