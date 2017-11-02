const express = require('express');

// This package automatically parses JSON requests.
const bodyParser = require('body-parser');

// This package will handle GraphQL server requests and responses
// for you, based on your schema.
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');

const connectMongo = require('./mongo-connector');

const schema = require('./schema');

const start = async () => {

  const mongo = await connectMongo();

  var app = express();

  //Endpoint for GraphQL API
  app.use('/graphql', bodyParser.json(), graphqlExpress({
    context: {mongo},
    schema
  }));

  //With this Endpoint API supports Graphiql Debugger that works on /graphql Endpoint
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }));

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
};

start();
