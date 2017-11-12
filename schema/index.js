//Initialize resolvers and tools for schemas
const {makeExecutableSchema} = require('graphql-tools');
const resolvers = require('./resolvers');

// Define your schemas here
const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
    postedBy: User
  }

  type Query {
    allLinks(filter: LinkFilter, skip: Int, first: Int): [Link!]!
  }

  type Mutation {
    createLink(url: String!, description: String!): Link

    createUser(name: String!, authProvider: AuthProviderSignupData!): User

    signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
  }

  input LinkFilter {
    OR: [LinkFilter!]
    description_contains: String
    url_contains: String
  }

  type User {
    id: ID!
    name: String!
    email: String
  }

  type SigninPayload {
    token: String
    user: User
  }

  input AuthProviderSignupData {
    email: AUTH_PROVIDER_EMAIL
  }

  input AUTH_PROVIDER_EMAIL {
    email: String!
    password: String!
  }

  type Subscription {
    Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
  }
  
  input LinkSubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }
  
  type LinkSubscriptionPayload {
    mutation: _ModelMutationType!
    node: Link
  }
  
  enum _ModelMutationType {
    CREATED
    UPDATED
    DELETED
  }
`;

// Generate the schema object from your types definition.
module.exports = makeExecutableSchema({typeDefs, resolvers});
