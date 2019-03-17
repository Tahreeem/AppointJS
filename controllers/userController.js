const db = require("../models");
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client("302735331685-j2de3ss9t9pcmout25hjo0e0lg0d550v.apps.googleusercontent.com");

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "302735331685-j2de3ss9t9pcmout25hjo0e0lg0d550v.apps.googleusercontent.com",  
     
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  
  console.log ("user id " + userid);
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return payload;
}

/**
 * If user ID exists, refresh the name
 * otherwise, create a new user
 * @param {*} userId 
 * @param {*} name 
 */
async function findUserByUserId (name, email) {

  // upsert on userId
  return db.User.findOneAndUpdate(
    { userId: email},
    {name: name }   ,
    {new: true, upsert: true}
  )
}


// Defining methods for the userController
module.exports = {
    
  /**
    * Finds user by id
    * @param {*} req 
    * @param {*} res 
    */
  findById: function(req, res) {
    db.User  
      .findById(req.params.id)
      .populate("appointmentBookingList")
      .populate("approverList")
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },

  

  logout: function (req, res) {
    console.log ("request received to logout");
    req.session.reset();
    res.end();
  },

  /**
   * Retrieves all users in user collection
   * @param {*} req 
   * @param {*} res 
   */
  retrieveAll: function (req, res) {
     db.User.find({})
      .then(dbModel => res.json(dbModel))
      .catch(err =>res.status(422).json(err));
  },
  
  /**
   * Registers an user in the system
   * @param {*} req 
   * @param {*} res 
   */
  register: function(req, res) {
    db.User
      .create(req.body)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },

  /**
   * Updates the approver list of a user to allow user to view another user's calendar
   * @param {*} req 
   * @param {*} res 
   */
  updateApproverList: function (req, res) {
    db.User.findOneAndUpdate(
          {_id:  req.body.userId  },
        { $push: { approverList: req.body.clientId } },
         { new: true })   
         .then (updateResult => res.json(updateResult))
         .catch(err => res.status(422).json(err));
  },

 
  /**
   * Validates id token from user
   * if the token is valid, upserts user to user collection
   * @param {*} req 
   * @param {*} res 
   */
  validateOauthID: function (req, res) {

    verify(req.body.idtoken)
    .then(result => {
      console.log ("result from firebase" + JSON.stringify(result));
      if (!(result.name && result.email && result.email_verified)){
        throw err ("token missing information");
      }
      return result;
    })
    .then(result => findUserByUserId(result.given_name, result.email))
    .then (user => {
      console.log ("user object " + user);
      // sets a cookie with the user's info
      req.session.user = user;
      res.json(user);
    })
    .catch(err => {
      console.log (err);
      res.status(422).json(err);
    }
    );
    
      // TODO
      // query API to determine if user already exist.  If yes, retrieve profile, otherwise
      // create a new one
      // result.name => 'firstname lastname'
      // result.email => 'xx@gmail.com'
      // return a session key and have the user redirect to the profile with the session key
      // create user 

  }

};
