const DataLoader = require('dataloader');

// This loader will be used for user data,
// and the keys are going to be user ids.
// So the batch function just needs to make
// a single call to MongoDB with all the given ids.
async function batchUsers (Users, keys) {
  return await Users.find({_id: {$in: keys}}).toArray();
}

//Create the user data loader, passing it the batch function
module.exports = ({Users}) =>({
  userLoader: new DataLoader(
    keys => batchUsers(Users, keys),
    {cacheKeyFn: key => key.toString()},
  ),
});
