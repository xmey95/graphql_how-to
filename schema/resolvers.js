const pubsub = require('../pubsub');

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

  //Query implementations
  Query: {
    allLinks: async (root, {filter, first, skip}, {mongo: {Links, Users}}) => {
      let query = filter ? {$or: buildFilters(filter)} : {};
      //Use find function for extract data from MongoDB
      const cursor = Links.find(query)
      if (first) {
        cursor.limit(first);
      }
      if (skip) {
        cursor.skip(skip);
      }
      return cursor.toArray();
    },
  },

  //Mutation implementations
  Mutation: {
    //Resolver for creating links
    createLink: async (root, data, {mongo: {Links}, user}) => {
      //assertValidLink(data);
      const newLink = Object.assign({postedById: user && user._id}, data)
      //Use insert function for add new entry into MongoDB
      const response = await Links.insert(newLink);
      newLink.id = response.insertedIds[0]
      pubsub.publish('Link', {Link: {mutation: 'CREATED', node: newLink}});
  
      return newLink;
    },

    //Resolver for creating users
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

    //Resolver for signin users
    signinUser: async (root, data, {mongo: {Users}}) => {
      const user = await Users.findOne({email: data.email.email});
      if (data.email.password === user.password) {
        return {token: `token-${user.email}`, user};
      }
    },
  },

  Subscription: {
    Link: {
      subscribe: () => pubsub.asyncIterator('Link'),
    },
  },

  //This is useful for convert _id filed of Database in id field of Schema
  Link: {
    id: root => root._id || root.id,

    //Composed Field for extrapolate user data from post
    postedBy: async ({postedById}, data, {dataloaders: {userLoader}}) => {
        return await userLoader.load(postedById);
    },
  },

  User: {
    // Convert the "_id" field from MongoDB to "id" from the schema.
    id: root => root._id || root.id,
  },
};
