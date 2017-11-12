const express = require('express');

// This package automatically parses JSON requests.
const bodyParser = require('body-parser');

// This package will handle GraphQL server requests and responses
// for you, based on your schema.
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');

//Link Mongo Setup to main source
const connectMongo = require('./mongo-connector');

//Link Authentication setup to main source
const {authenticate} = require('./authentication');

//Link dataloaders to main source
const buildDataloaders = require('./dataloaders');

//Link schemas
const schema = require('./schema');

const {execute, subscribe} = require('graphql');

//This package will handle you to create a server
const {createServer} = require('http');

const {SubscriptionServer} = require('subscriptions-transport-ws');

//Set PORT of server
const PORT = 3000;

const start = async () => {

  //Connect to MongoDB
  const mongo = await connectMongo();

  var app = express();

  //This function manage authentication inside GraphQL requests
  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {
        dataloaders: buildDataloaders(mongo),
        mongo,
        user
      }, // This context object is passed to all resolvers.
      schema,
    };
  };

  //Endpoint for GraphQL API
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

  //With this Endpoint API supports Graphiql Debugger that works on /graphql Endpoint
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    //Used for Test
    passHeader: "'Authorization': 'bearer token-Hello'",
    //Declare subscriptions end-point to graphiql
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
  }));

  //Create and start server with all setups like arguments
  const server = createServer(app);
  server.listen(PORT, () => {
    SubscriptionServer.create(
      {execute, subscribe, schema},
      {server, path: '/subscriptions'},
    );
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
};

start();
