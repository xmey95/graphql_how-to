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
    createLink: async (root, data, {mongo: {Links}}) => {
      //Use insert function for add new entry into MongoDB
      const response = await Links.insert(data);
      return Object.assign({id: response.insertedIds[0]}, data);
    },
  },

  //This is useful for convert _id filed of Database in id field of Schema
  Link: {
    id: root => root._id || root.id,
  },
};
