# 1. GraphQL.js_how-to

Results of my studies about GraphQL.js for building API Server apps with Node.js and Express. 

<!-- TOC -->

- [1. GraphQL.js_how-to](#1-graphqljshow-to)
    - [1.1. GraphQL](#11-graphql)
        - [1.1.1. Fields](#111-fields)
        - [1.1.2. Arguments](#112-arguments)
        - [1.1.3. Mutations](#113-mutations)
        - [1.1.4. Schemas and Types](#114-schemas-and-types)
    - [1.2. GraphQL.js](#12-graphqljs)
        - [1.2.1. First Setup](#121-first-setup)
        - [1.2.2. Queries](#122-queries)
        - [1.2.3. Mutations](#123-mutations)
        - [1.2.4. Connectors](#124-connectors)
        - [1.2.5. Authentication](#125-authentication)
        - [1.2.6. Dataloaders](#126-dataloaders)
        - [1.2.7. Filtering](#127-filtering)

<!-- /TOC -->

## 1.1. GraphQL

GraphQL is a query language for your API, and a server-side runtime for executing queries by using a type system you define for your data. GraphQL isn't tied to any specific database or storage engine and is instead backed by your existing code and data.

A GraphQL service is created by defining types and fields on those types, then providing functions for each field on each type. For example, a GraphQL service that tells us who the logged in user is (me) as well as that user's name might look something like this:

```
type Query {
  me: User
}

type User {
  id: ID
  name: String
}
```

Once a GraphQL service is running (typically at a URL on a web service), it can be sent GraphQL queries to validate and execute. A received query is first checked to ensure it only refers to the types and fields defined, then runs the provided functions to produce a result.

For example the query:

```
{
  me {
    name
  }
}

```

Could produce the JSON result:

```
{
  "me": {
    "name": "Luke Skywalker"
  }
}

```

### 1.1.1. Fields

the query has exactly the same shape as the result. This is essential to GraphQL, because you always get back what you expect, and the server knows exactly what fields the client is asking for.

The field name returns a String type, in this case the name of the main hero of Star Wars.

GraphQL queries can traverse related objects and their fields, letting clients fetch lots of related data in one request, instead of making several roundtrips as one would need in a classic REST architecture.

### 1.1.2. Arguments

If the only thing we could do was traverse objects and their fields, GraphQL would already be a very useful language for data fetching. But when you add the ability to pass arguments to fields, things get much more interesting.

```
{
  human(id: "1000") {
    name
    height
  }
}


{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 1.72
    }
  }
}

```

In GraphQL, every field and nested object can get its own set of arguments, making GraphQL a complete replacement for making multiple API fetches. You can even pass arguments into scalar fields, to implement data transformations once on the server, instead of on every client separately.


### 1.1.3. Mutations

It's useful to establish a convention that any operations that cause writes should be sent explicitly via a mutation.

Just like in queries, if the mutation field returns an object type, you can ask for nested fields. This can be useful for fetching the new state of an object after an update. Let's look at a simple example mutation:

```
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}

{
  "data": {
    "createReview": {
      "stars": 5,
      "commentary": "This is a great movie!"
    }
  }
}
```

### 1.1.4. Schemas and Types

The most basic components of a GraphQL schema are object types, which just represent a kind of object you can fetch from your service, and what fields it has. In the GraphQL schema language, we might represent it like this:

```
type Character {
  name: String!
  appearsIn: [Episode]!
}
```

**Read Full documentation in http://graphql.org/learn/**

## 1.2. GraphQL.js

For building API web apps with Graphql I decided to use Node.js Framework but there are many others frameworks with awesome plugins for building the same app that I built with Node + Express. Others tutorials are availables in GraphQL website.

This tutorial regards only back-end side of GraphQL Development, for this reason I recommend to watch Vue.js + Apollo Tutorial that handle you to write Front-end App that receive data from GraphQL server.

### 1.2.1. First Setup

You’ll start by defining the schema:

```
type Link {
  id: ID!
  url: String!
}
```

It’s time to start creating your project:

```
npm install --save express body-parser apollo-server-express graphql-tools graphql
```

Start by creating a file at src/schema/index.js for your schema definition, like this:

```
const {makeExecutableSchema} = require('graphql-tools');

// Define your types here.
const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
  }
`;

// Generate the schema object from your types definition.
module.exports = makeExecutableSchema({typeDefs});
```

Now create the main server file at src/server.js, with the following content:

```
const express = require('express');

// This package automatically parses JSON requests.
const bodyParser = require('body-parser');

// This package will handle GraphQL server requests and responses
// for you, based on your schema.
const {graphqlExpress} = require('apollo-server-express');

const schema = require('./schema');

var app = express();
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Hackernews GraphQL server running on port ${PORT}.`)
});
```

You can try running the server now with:

```
node ./src/index.js
```

### 1.2.2. Queries

First, add the query definition for allLinks to the schema inside src/schema/index.js:

```
type Query {
    allLinks: [Link!]!
  }
```

Start by creating a simple resolver that returns the fixed contents of a local array. Put the resolvers in a separate file, src/schema/resolvers.js, since they will grow as more fields are added:

```
const links = [
  {
    id: 1,
    url: 'http://graphql.org/',
    description: 'The Best Query Language'
  },
  {
    id: 2,
    url: 'http://dev.apollodata.com',
    description: 'Awesome GraphQL Client'
  },
];

module.exports = {
  Query: {
    allLinks: () => links,
  },
};
```

Now you just have to pass these resolvers when building the schema object with makeExecutableSchema:

```
const {makeExecutableSchema} = require('graphql-tools');
const resolvers = require('./resolvers');

// ...

module.exports = makeExecutableSchema({typeDefs, resolvers});
```

Just add these lines to src/server.js:

```
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');

// ...

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));
```

That’s it! Now restart the server again with node ./src/index.js and open your browser at localhost:3000/graphiql. You’ll see a nice IDE that looks like this:

<img src="https://i.imgur.com/0s8NcWR.png">

Try it out! On the left-most text box, type a simple query for listing all links and hit the Play button. This is what you’ll see:

<img src="https://i.imgur.com/LuALGY6.png">

### 1.2.3. Mutations

First, add the createLink mutation to that typeDefs variable in src/schema/index.js:

```
type Mutation {
  createLink(url: String!, description: String!): Link
}
```

Now add a resolver for createLink inside src/schema/resolvers.js:

```
Mutation: {
    createLink: (_, data) => {
      const newLink = Object.assign({id: links.length + 1}, data);
      links.push(newLink);
      return newLink;
    }
  },
```

To test, just restart the server again and use the new mutation with GraphiQL:

<img src="https://i.imgur.com/4pKJ9ji.png">

### 1.2.4. Connectors

Now you can actually connect to MongoDB in the code and start using it.

Create a file at src/mongo-connector.js like this:

```
const {MongoClient} = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/hackernews';

module.exports = async () => {
  const db = await MongoClient.connect(MONGO_URL);
  return {Links: db.collection('links')};
}
```

Go back to the main src/server.js file and change it to be like this:

```
const connectMongo = require('./mongo-connector');

const start = async () => {
  const mongo = await connectMongo();
  var app = express();
  app.use('/graphql', bodyParser.json(), graphqlExpress({
    context: {mongo}, // 4
    schema
  }));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }));

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
};

start();
```

All that’s left now is to replace that array logic in the resolvers with calls to MongoDB:

```
module.exports = {
  Query: {
    allLinks: async (root, data, {mongo: {Links}}) => { // 1
      return await Links.find({}).toArray(); // 2
    },
  },

  Mutation: {
    createLink: async (root, data, {mongo: {Links}}) => {
      const response = await Links.insert(data); // 3
      return Object.assign({id: response.insertedIds[0]}, data); // 4
    },
  },

  Link: {
    id: root => root._id || root.id, // 5
  },
};
```

### 1.2.5. Authentication

As always, first update the schema to define the new type and mutation:

```
type Mutation {
    createLink(url: String!, description: String!): Link

    # Note that this mutation could receive the email and password directly
    # as arguments, with no problem. You're just using this "authProvider"
    # instead to mimic the signature generated by Graphcool, which will
    # make it easier to integrate this server implementation later with the 
    # code from the frontend tutorials.
    createUser(name: String!, authProvider: AuthProviderSignupData!): User
}

type User {
    id: ID!
    name: String!
    email: String
}

input AuthProviderSignupData {
    email: AUTH_PROVIDER_EMAIL
}

input AUTH_PROVIDER_EMAIL {
    email: String!
    password: String!
}
```

Create a new MongoDB collection to store user entities:

```
  ...
  Users: db.collection('users'),
  ...
```

Add a resolver for the mutation, using MongoDB to store the data:

```
createUser: async (root, data, {mongo: {Users}}) => {
    // You need to convert the given arguments into the format for the
    // `User` type, grabbing email and password from the "authProvider".
    const newUser = {
        name: data.name,
        email: data.authProvider.email.email,
        password: data.authProvider.email.password,
    };
    const response = await Users.insert(newUser);
    return Object.assign({id: response.insertedIds[0]}, newUser);
    },
```

Restart the server and create a test user with your new mutation. You should see something like this:

<img src="https://i.imgur.com/5sjrV28.png">

Update the schema with the new mutation’s definition:

```
type Mutation {
    signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
}

type SigninPayload {
    token: String
    user: User
}
```

Add a resolver that fetches the user by the given email, validates the password and returns a token. Also, remember to handle the _id field from MongoDB, like you did for Link:

```
Mutation: {
  // ...

  signinUser: async (root, data, {mongo: {Users}}) => {
      const user = await Users.findOne({email: data.email.email});
      if (data.email.password === user.password) {
        return {token: `token-${user.email}`, user};
      }
    },
  },
},
User: {
  // Convert the "_id" field from MongoDB to "id" from the schema.
  id: root => root._id || root.id,
},
```

Restart the server and try the new signinUser mutation with one of your previously registered users:

<img src="https://i.imgur.com/VknQkQ5.png">

You’ll just have to change that call to graphqlExpress to receive a function instead of a fixed object:

```
const {authenticate} = require('./authentication');

const start = async () => {
  // ...

  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {mongo, user}, // This context object is passed to all resolvers.
      schema,
    };
  };
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

  // ...
}
```

Create a new file at src/authentication.js for it with the following content:

```
const HEADER_REGEX = /bearer token-(.*)$/;

/**
 * This is an extremely simple token. In real applications make
 * sure to use a better one, such as JWT (https://jwt.io/).
 */
module.exports.authenticate = async ({headers: {authorization}}, Users) => {
  const email = authorization && HEADER_REGEX.exec(authorization)[1];
  return email && await Users.findOne({email});
}
```

Update the schema for Link to include the user that posted it:

```
type Link {
    id: ID!
    url: String!
    description: String!
    postedBy: User
}
```

Change the resolver for createLink to store the user id together with new links:

```
Mutation: {
    createLink: async (root, data, {mongo: {Links}, user}) => {
        const newLink = Object.assign({postedById: user && user._id}, data)
        const response = await Links.insert(newLink);
        return Object.assign({id: response.insertedIds[0]}, newLink);
    },
},
```

Add a resolver for the postedBy field inside Linkto fetch and return the right user information given the postedById retrieved from MongoDB. You could instead do this fetching directly inside the allLinks query, looping through the array of items to handle each one, but this approach is a bit cleaner, besides automatically working for any other future queries you may have that also need to fetch link data. Another advantage of having a separate resolver is that it won’t even get triggered unless the GraphQL request actually asked for the postedBy field, without you having to do any extra checks to avoid fetching useless data. This is what it should look like:

```
Link: {
    id: root => root._id || root.id,

    postedBy: async ({postedById}, data, {mongo: {Users}}) => {
        return await Users.findOne({_id: postedById});
    },
},
```

### 1.2.6. Dataloaders

The first thing you need to do is to install it in your project, via:

```
npm install --save dataloader
```

Then, create a new file at src/dataloaders.js with this content:

```
const DataLoader = require('dataloader');

// 1
async function batchUsers (Users, keys) {
  return await Users.find({_id: {$in: keys}}).toArray();
}

// 2
module.exports = ({Users}) =>({
  // 3
  userLoader: new DataLoader(
    keys => batchUsers(Users, keys),
    {cacheKeyFn: key => key.toString()},
  ),
});
```

You need the resolvers to use this new data loader instead of MongoDB when fetching users, so add it to the context object now:

```
const buildDataloaders = require('./dataloaders');

const start = async () => {
  // ...
  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {
        dataloaders: buildDataloaders(mongo),
        mongo,
        user
      },
      schema,
    };
  };
  // ...
};
// ...
```

Lastly, update the resolvers to use the data loader:

```
Link: {
  // ...
  postedBy: async ({postedById}, data, {dataloaders: {userLoader}}) => {
    return await userLoader.load(postedById);
  },
},
Vote: {
  // ...
  user: async ({userId}, data, {dataloaders: {userLoader}}) => {
    return await userLoader.load(userId);
  },
},
```

### 1.2.7. Filtering

So start by adding a new argument in the schema definition for this query:

```
type Query {
  allLinks(filter: LinkFilter): [Link!]!
}

input LinkFilter {
  OR: [LinkFilter!]
  description_contains: String
  url_contains: String
}
```

Go back to the resolver for allLinks now and have it use MongoDB queries to support this filtering feature, like this:

```
// ...

function buildFilters({OR = [], description_contains, url_contains}) {
  const filter = (description_contains || url_contains) ? {} : null;
  if (description_contains) {
    filter.description = {$regex: `.*${description_contains}.*`};
  }
  if (url_contains) {
    filter.url = {$regex: `.*${url_contains}.*`};
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildFilters(OR[i]));
  }
  return filters;
}

module.exports = {
  Query: {
    allLinks: async (root, {filter}, {mongo: {Links, Users}}) => {
      let query = filter ? {$or: buildFilters(filter)} : {};
      return await Links.find(query).toArray();
    },
  },

  //...
};
```

Restart the server and try your new filter out now:

<img src="https://i.imgur.com/lrsChh9.png">

**Read Full documentation in http://graphql.org/graphql-js/**