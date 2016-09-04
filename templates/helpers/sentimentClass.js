module.exports = (sentiment, context) => {
  switch (sentiment) {
    case 'positive':
      return 'sentiment glyphicon-thumbs-up'
    case 'negative':
      return 'sentiment glyphicon-thumbs-down'
    default:
      return 'sentiment glyphicon-alert'
  }
}
