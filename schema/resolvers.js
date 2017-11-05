module.exports = {

  //Query implementations
  Query: {
    allLinks: async (root, data, {mongo: {Links}}) => {
      //Use find function for extract data from MongoDB
      return await Links.find({}).toArray();
    },
  },

  //Mutation implementations
  Mutation: {
    //Resolver for creating links
    createLink: async (root, data, {mongo: {Links}, user}) => {
      const newLink = Object.assign({postedById: user && user._id}, data)
      //Use insert function for add new entry into MongoDB
      const response = await Links.insert(newLink);
      return Object.assign({id: response.insertedIds[0]}, newLink);
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
