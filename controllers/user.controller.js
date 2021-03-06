/**
 * User Controller -> 1 to 1 relationship with User Model
 * Cuz were bored like that
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '/../.env') });
const CustomError = require('../helpers/CustomError');
const User = require('../models/user.model');

const businessController = require('./business.controller');

/**
 * Creates a single user
 * @param {Object} user Aura user
 * @param {Object} options Additional parameters (optional)
 * @returns Response
 */
const createOne = async (user, options) => {
  const returnAwait = await User.create(user);
  return returnAwait;
};

/**
 * Creates many users with a batch request
 * @param {Object} users Aura users
 * @param {Object} options Additional parameters (optional)
 * @returns Response
 */
const createMany = async (users, options) => {
  const returnAwait = await User.insertMany(users, { ordered: false });
  return returnAwait;
};

/**
 * Reads a single user
 * @param {Object} options defines what to find, parameters. Mostly used
 * @returns Response
 */
const readOne = async (options) => {
  const returnAwait = await User.findOne(options);
  return returnAwait;
};

/**
 * @param {Object} options defines objects to find
 * @returns Response
 */
const readMany = async options => {
  const returnAwait = await User.find(options);
  return returnAwait;
};

/**
 * 
 * @param {Object} options contains id, and optional parameters
 * returns populated businesses from most recently pushed in array 
 */
const readFavorites = async (options) => {
  const returnAwait = await User
    .findOne(options._id)
    .populate('favorites.objectReference');
  /**
   * At this point, returnAwait now has its favorites array populated
   * by the actual business ojects. Now, return the favorites array. 
   * But not everything in there is going to be used by the client.
   */ 
  let returnToRouter = [];
  for(let i = returnAwait.favorites.length - 1; i > -1; --i) {
    returnToRouter.push({
      _id: returnAwait.favorites[i].objectReference._id,
      auras: returnAwait.favorites[i].objectReference.auras,
      attributes: returnAwait.favorites[i].objectReference.attributes,
      likes: returnAwait.favorites[i].objectReference.likes,
      feedback: returnAwait.favorites[i].objectReference.feedback,
      categories: returnAwait.favorites[i].objectReference.categories,
      displayAddress: returnAwait.favorites[i].objectReference.displayAddress,
      yelpId: returnAwait.favorites[i].objectReference.yelpId,
      name: returnAwait.favorites[i].objectReference.name,
      alias: returnAwait.favorites[i].objectReference.alias,
      address: returnAwait.favorites[i].objectReference.address,
      citySearch: returnAwait.favorites[i].objectReference.citySearch,
      state: returnAwait.favorites[i].objectReference.state,
      postalCode: returnAwait.favorites[i].objectReference.postalCode,
      latitude: returnAwait.favorites[i].objectReference.latitude,
      longitude: returnAwait.favorites[i].objectReference.longitude,
      url: returnAwait.favorites[i].objectReference.url,
      stars: returnAwait.favorites[i].objectReference.stars,
      businessImage: returnAwait.favorites[i].objectReference.businessImage,
      categorySearch: returnAwait.favorites[i].objectReference.categorySearch,
    });
  }
  return returnToRouter;
}

/**
 * Updates a single user
 * @param {Object} user Aura user ID
 * @param {Object} options Additional parameters
 * @returns Response
 */
const updateOne = async (user, options) => {
  const doc = await User.findByIdAndUpdate(
    user,
    { $set: options },
    { new: true }
  );
  return doc;
};

/**
 * Updates many users with a batch request
 * @param {Object} options Additional parameters, whatever needs to be
 * updated based of the route or caller of this controller.
 * updates all users
 */
const updateMany = async (options) => {
  const docs = await User.updateMany({}, { $set: options }, { new: true });
  return docs;
};

/**
 * Updates favorites
 * @param {*} options
 */
const updateLike = async (userId, options) => {
  // find user based off ID
  const user = await User.find({ _id: userId });
  // search user's favorites if the businessId already exists
  const favoriteBusiness = user[0].favorites.filter(
    favorite => options.businessId.toString() === favorite.businessId.toString()
  );
  if (favoriteBusiness.length === 0) {
    // if the businessId does not exist, add the business Id: UPVOTE
    // update user favorites
    user[0].favorites.push({ 
      businessId: options.businessId,
      objectReference: options.businessId,
     });
    // notify business controller of update
    await businessController.updateLike(options.businessId, {
      userId,
      // operation: 1 to add
      operation: 1,
    });
  } else {
    // else the business Id exists, take off the business Id: DOWNOTE
    for(let i = 0; i < user[0].favorites.length; ++i) {
      if(user[0].favorites[i].businessId.toString() === options.businessId.toString()) {
        user[0].favorites.splice(i, 1);
        break;
      }
    }
    // notify the business controller of update
    await businessController.updateLike(options.businessId, {
      userId,
      // operation: 0 to subtract
      operation: 0,
    });
  }

  const updateUser = await updateOne(userId, {
    favorites: user[0].favorites
  });
  return updateUser;
};

/**
 * Deletes a single user
 * @param {Object} options defines what to delete
 * @returns Response
 */
const deleteOne = async options => {
  const returnAwait = await User.deleteOne(options);
  return returnAwait;
};

/**
 * Deletes many users with a batch request
 * @param {Object} options defines objects to delete
 * @returns Response
 */
const deleteMany = async options => {
  const returnAwait = await User.deleteMany(options);
  return returnAwait;
};

/**
 * Deletes many users then addes many useres with a batch request
 * @param {Object} users Aura users
 * @param {Object} options Additional parameters (optional)
 * @returns Response
 */
const seed = async (users, options) => {
  const del = await User.deleteMany({});
  const ins = await User.insertMany(users, { ordered: false });
  return `${del} ... ${ins}`;
};

/**
 * Finds users by query
 * @param {Object} query Search object parameters
 * @param {Object} options Additional parameters
 * @returns Response
 */
const find = (query, options) => {
  // TODO
};

const userController = {
  createOne,
  createMany,
  readOne,
  readMany,
  readFavorites,
  updateOne,
  updateMany,
  updateLike,
  deleteOne,
  deleteMany,
  seed,
  find
};

module.exports = userController;
