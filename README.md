# 1. GraphQL.js_how-to

Results of my studies about GraphQL.js for building API Server apps with Node

## 1.1. Official Documentation

http://graphql.org/learn/

http://graphql.org/graphql-js/

## 1.2. GraphQL

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

### Queries and Mutations

#### Fields



## 1.3. GraphQL.js
