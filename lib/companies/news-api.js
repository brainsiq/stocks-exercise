'use strict'

const http = require('http')

module.exports.getStories = (newsFeedUrl, callback) => {
  return http.get(newsFeedUrl, res => {
    if (res.statusCode !== 200) {
      return callback(new Error(`News Api ${res.statusCode} response`))
    }

    let data = ''
    res.on('data', chunk => { data += chunk })
    res.on('end', () => {
      const news = JSON.parse(data)

      callback(null, news.map(story => ({
        headline: story.headline,
        body: story.body
      })))
    })
  })
  .on('error', err => callback(err))
}
