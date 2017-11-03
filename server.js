const express = require('express');

// This package automatically parses JSON requests.
const bodyParser = require('body-parser');

// This package will handle GraphQL server requests and responses
// for you, based on your schema.
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');

//
const connectMongo = require('./mongo-connector');

//
const {authenticate} = require('./authentication');

//
const schema = require('./schema');

const start = async () => {

  const mongo = await connectMongo();

  var app = express();

  //This function manage authentication inside GraphQL requests
  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {mongo, user}, // This context object is passed to all resolvers.
      schema,
    };
  };

  //Endpoint for GraphQL API
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

  //With this Endpoint API supports Graphiql Debugger that works on /graphql Endpoint
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    //
    passHeader: "'Authorization': 'bearer token-Hello'",
  }));

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
};

start();
