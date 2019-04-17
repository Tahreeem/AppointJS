const db = require("../models");


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

// Defining methods for the userController
module.exports = {
  /**
   * Returns user object ID by token ID
   * @param {*} req
   * @param {*} res
   */
  findByTokenId: function (req, res) {
    db.Session.findOne({ tokenId: String(req.params.id) })
      .then(dbModel => res.json(dbModel))
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
    return db.Session.deleteMany({}, result => {return result});
  },

  /**
   * Retrieves all users in user collection
   * @param {*} req
   * @param {*} res
   */
  retrieveAll: function (req, res) {
    db.User.find({})
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
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
            expiryDate: new Date(),
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
  }
};
