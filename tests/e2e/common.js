'use strict'

const webdriver = require('selenium-webdriver')

const baseUrl = 'http://app:8080'

module.exports.initialiseWebDriver = () => {
  const driver = new webdriver.Builder()
    .forBrowser('phantomjs')
    .build()

  driver.get(baseUrl)

  return driver
}
