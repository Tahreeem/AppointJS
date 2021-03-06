const db = require("../models");
require("moment/locale/en-ca.js");
var moment = require("moment");
const admin = require('firebase-admin');

//const serviceAccount = require("../ServiceAccountKey.json");
var serviceAccount;

var mongoose = require("mongoose");
dbConnection = mongoose.connection;
dbConnection.once('open', function () {
  //console.log("MongoDB is connected");
  dbConnection.db.collection('secret', function (err, collection) {
    collection.find({ "type": "service_account" }).toArray((error, jsonArray) => {
      serviceAccount = jsonArray[0];

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://project3-8b62e.firebaseio.com'
      });
    });
  });
});

//______________________________________________________________________________________________

/**
 * If user ID exists, refresh the name
 * otherwise, create a new user
 * @param {*} userId
 * @param {*} name
 */
async function findUserByUserId(name, email) {
  // upsert on userId
  return db.User.findOneAndUpdate(
    { userId: email },
    { name: name },
    { new: true, upsert: true }
  );
}

function verifyTokenFirebase(token) {
  return admin.auth().verifyIdToken(token)
    .then(function (decodedToken) {
      return true;
    }).catch(function (error) {
      console.log("error! :", error);
    });
}

//______________________________________________________________________________________________

// Defining methods for the userController
module.exports = {
  /**
   * Returns user object ID by token ID
   * @param {*} req
   * @param {*} res
   */
  findByTokenId: function (req, res) {
    console.log(req);
    db.Session.findOne({ tokenId: String(req.params.id) })
      .then(dbModel => {
        console.log(dbModel);
        res.json(dbModel);
      })
      .catch(err => res.status(422).json(err));
  },

  findUserByToken: function (req, res) {
    // upsert on userId
    const current = new Date();
    var expiryDate = new Date();
    expiryDate.setMinutes = current.getMinutes + 3;
    return db.Session.findOneAndUpdate(
      { tokenId: req.params.token, expiryDate: { $gte: current } },
      { expiryDate: expiryDate },
      { new: true, upsert: false }
    );
  },

  initializeUser: async function (req, res) {
    return db.User.findOneAndUpdate(
      { userId: req.body.userId },
      {
        name: req.body.name
      },
      { returnNewDocument: true, upsert: true }
    )
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));;
  },

  logout: async function (req, res) {
    return db.Session.deleteMany({}, result => { return result });
  },

  /**
   * Retrieves all users in user collection
   * @param {*} req
   * @param {*} res
   */
  retrieveAllUsersPost: function (req, res) {
    return verifyTokenFirebase(String(req.body.tokenEntire)).then(verifiedStatus => {
      if (verifiedStatus == true) {
        return db.User.find({})
          .then(dbModel => res.json(dbModel))
          .catch(err => res.status(422).json(err));
      }
      else res.json("Invalid Token!");
    });
  },

  /**
   * Registers an user in the system
   * @param {*} req
   * @param {*} res
   */
  register: function (req, res) {
    db.User.create(req.body)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },

  /**
   * Updates the user user to allow user; used to update approver list.
   * @param {*} req
   * @param {*} res
   */
  updateUser: function (req, res) {
    console.log(req.body);
    db.User.findOneAndUpdate({ _id: req.body.userId }, req.body.user, {
      new: true
    })
      .then(updateResult => res.json(updateResult))
      .catch(err => {
        console.log(err);
        res.status(422).json(err);
      });
  },
  validateFirebase: async function (req, res) {
    var token = req.body.token;
    return findUserByUserId(req.body.name, req.body.email)
      .then(user => {
        return db.Session.findOneAndUpdate(
          {
            tokenId: token
          },
          {
            user: user._id,
            expiryDate: new Date(),                          //UPDATE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            name: user.given_name
          },
          { returnNewDocument: true, upsert: true }
        );
      })
      .then(() => {
        res.status(200).json({
          token: token
        });
      })
      .catch(err => {
        console.log(err);
        res.status(422).json(err);
      });
  },
  findUserByTokenPost: function (req, res) {
    return verifyTokenFirebase(String(req.body.tokenEntire)).then(verifiedStatus => {
      //verifiedStatus = true;
      if (verifiedStatus == true) {
        // upsert on userId
        const current = new Date();
        var expiryDate = new Date();
        expiryDate.setMinutes = current.getMinutes + 20;
        return db.Session.findOneAndUpdate(
          //{ tokenId: req.body.token, expiryDate: { $gte: current } },  //this didn't work because currently the time set at initialization is current time so that's less than
          { tokenId: req.body.token },
          { expiryDate: expiryDate },
          { new: true, upsert: false }
        ).then(dbModel => res.json(dbModel))
          .catch(err => res.status(422).json(err));
      }
      else res.json("Invalid Token!");
    });
  }

};