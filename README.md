# stocks-exercise

An exercise carried out for a job interview

## Running the site

Install the dependencies and run the start script:

```
npm install
npm start
```

## Testing

To run linting and unit tests: `npm test`

The end to end tests use [docker-compose](https://docs.docker.com/compose/install/) to run the site, and interact with it using selenium webdriver and phantomjs. Once docker-compose is installed, run: `docker-compose run --rm e2e_test`
