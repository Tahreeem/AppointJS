const db = require("../models");
require("moment/locale/en-ca.js");
var moment = require("moment");
const admin = require('firebase-admin');
//const serviceAccount = require("../ServiceAccountKey.json");

//process.env["REACT_APP_KEY"] = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDhZumtA3naksp8\nAhBMVbaispptKba39qhws7rhMKA3m8gy8XIssHjY/2sBA38wuFQixMTlaaUR4RsG\nnj+fbRJXU7AEs9Cf/oRzNToNFQdLhVLD9RuGOhkgW9yUAH7bnVvXLFgAdUwf4vqj\nz1UqmPryKNTMJH1HpYIX0i0ZEeyRJ71zfFIF2YjFmCu3c8R0xK2JxOX5ZHxfYsr8\ndqTjj5Rj1kyznb+nwFv5IfYVjl3qO1Kr1j5sobAfGiqHwG88Kxu6SU/stX0jBJwx\nLAgIm74jr0o5IgW6TapiC0wyG7hRnuVqknQylkVpRZNVR+gUcRGsDvJoznkhhXaG\nzOVPXODlAgMBAAECggEACH5NwNi4Lz3Hxnt3bMDwFFphikp/mZgASdrj6FdiOiYz\nGYRSlo+Bxj99ozikAsx3UyYR+0kLUMyoLYwp/pJoFgVPxSWXb2fySrsPOG356+UW\ntM6YHmszBi6f9a29Gf5odwezOzUwTKVLZ3/JCEVic1yJhDW9yMTaTZZ8X4z22pNQ\nK+MmlvDHPQiZ84ZOPW+drBG/AoDy6Re3zwJJYomU8MtskehNrOa6XxsDncAiQaeC\nn3Gnw5+quOnmmatjUSiLPOtxI8D4W5CUIxd7RMJ9Up33fyRVB2B8k61JBtM6GkRf\n8uwJivCFoLTDalMiJHEirexSijxyqYaiCb2YAYnd8QKBgQDzWXsQuDZs3pqaJnm5\n/2RnFWfxdoIPPgNaIHm64qZT71gj+MHgHjIblZZ0TQp+komxsoD++3zB/9jhTiq/\nFe210OmiIH630XGY6bkmp8ZdPdmicSjeXs4WQeKZheB0tC3hk3mQ9/ugRZG2s+uw\nYkl4xTPkOFcOEJIuQTs/riDuzQKBgQDtHpWnTMUKZwh0ea1nu1AXoXc51kl6V+Ma\n8xhlb0QDM7dlZCgO5BCiKXPmd1HafgWsEiHBuDasPBzl9W0oFar7gOmzyjuhp4TX\ndo1UUUHNoYqXIbZ6ySyMSDAWv+bI7a4noCgGvIqEqzQiYzVLfPIlQfoOFF/lmcHT\n3pB7KlgKeQKBgQDVf9oCzzugxKRrPfpp/vF9p0AsjsaIzOVv+zIRjqxS05hG5wZh\ntNxNay43Fyhv5+y6ZFvcWZQZOHh1I3lJcNm/PGzd+xhx+WVqvRPeIDBeudbpN9Kd\nVhwFVwSRoO1ONo5SbGqpj4fKE39GBhBwDatcM9fVEMD/6/X0cvKiagkmuQKBgQCw\nqxH7lYJVrtCo36OoXvJcuOv5BsS2R9co1CjAIrd830JsY8RI2/ncqJ/2/b3Z2f1l\n6BiImjT5/MvXNhX/QK2lN7ZoQ2xMlGCwnF7OjMBHcm2tDuxD7bGoT3ys5owP9q7E\nTVqlMkLOeDSezmX9+Xj883xYkyukCPxWXEQv0CvKmQKBgAH7cGZ3kFSXaHuFk+Au\nrttdiytoSpK4EedhsSkOrlxMg2Ev5zeO3/9DVehJI3v50k5nsIhYL7zR8UD9thYA\nqL7seAIdj5IP7niSp/szFMVsCqUKxHN6W1ZuCMGGUeQxvqrByTxqO4lq41EuYxkF\nqCzAWpzYU+NtHwM4SiAoWygB\n-----END PRIVATE KEY-----\n";


var serviceAccount = {
  "type": process.env.REACT_APP_TYPE,
  "project_id": String(process.env.REACT_APP_PROJECTID),
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDhZumtA3naksp8\nAhBMVbaispptKba39qhws7rhMKA3m8gy8XIssHjY/2sBA38wuFQixMTlaaUR4RsG\nnj+fbRJXU7AEs9Cf/oRzNToNFQdLhVLD9RuGOhkgW9yUAH7bnVvXLFgAdUwf4vqj\nz1UqmPryKNTMJH1HpYIX0i0ZEeyRJ71zfFIF2YjFmCu3c8R0xK2JxOX5ZHxfYsr8\ndqTjj5Rj1kyznb+nwFv5IfYVjl3qO1Kr1j5sobAfGiqHwG88Kxu6SU/stX0jBJwx\nLAgIm74jr0o5IgW6TapiC0wyG7hRnuVqknQylkVpRZNVR+gUcRGsDvJoznkhhXaG\nzOVPXODlAgMBAAECggEACH5NwNi4Lz3Hxnt3bMDwFFphikp/mZgASdrj6FdiOiYz\nGYRSlo+Bxj99ozikAsx3UyYR+0kLUMyoLYwp/pJoFgVPxSWXb2fySrsPOG356+UW\ntM6YHmszBi6f9a29Gf5odwezOzUwTKVLZ3/JCEVic1yJhDW9yMTaTZZ8X4z22pNQ\nK+MmlvDHPQiZ84ZOPW+drBG/AoDy6Re3zwJJYomU8MtskehNrOa6XxsDncAiQaeC\nn3Gnw5+quOnmmatjUSiLPOtxI8D4W5CUIxd7RMJ9Up33fyRVB2B8k61JBtM6GkRf\n8uwJivCFoLTDalMiJHEirexSijxyqYaiCb2YAYnd8QKBgQDzWXsQuDZs3pqaJnm5\n/2RnFWfxdoIPPgNaIHm64qZT71gj+MHgHjIblZZ0TQp+komxsoD++3zB/9jhTiq/\nFe210OmiIH630XGY6bkmp8ZdPdmicSjeXs4WQeKZheB0tC3hk3mQ9/ugRZG2s+uw\nYkl4xTPkOFcOEJIuQTs/riDuzQKBgQDtHpWnTMUKZwh0ea1nu1AXoXc51kl6V+Ma\n8xhlb0QDM7dlZCgO5BCiKXPmd1HafgWsEiHBuDasPBzl9W0oFar7gOmzyjuhp4TX\ndo1UUUHNoYqXIbZ6ySyMSDAWv+bI7a4noCgGvIqEqzQiYzVLfPIlQfoOFF/lmcHT\n3pB7KlgKeQKBgQDVf9oCzzugxKRrPfpp/vF9p0AsjsaIzOVv+zIRjqxS05hG5wZh\ntNxNay43Fyhv5+y6ZFvcWZQZOHh1I3lJcNm/PGzd+xhx+WVqvRPeIDBeudbpN9Kd\nVhwFVwSRoO1ONo5SbGqpj4fKE39GBhBwDatcM9fVEMD/6/X0cvKiagkmuQKBgQCw\nqxH7lYJVrtCo36OoXvJcuOv5BsS2R9co1CjAIrd830JsY8RI2/ncqJ/2/b3Z2f1l\n6BiImjT5/MvXNhX/QK2lN7ZoQ2xMlGCwnF7OjMBHcm2tDuxD7bGoT3ys5owP9q7E\nTVqlMkLOeDSezmX9+Xj883xYkyukCPxWXEQv0CvKmQKBgAH7cGZ3kFSXaHuFk+Au\nrttdiytoSpK4EedhsSkOrlxMg2Ev5zeO3/9DVehJI3v50k5nsIhYL7zR8UD9thYA\nqL7seAIdj5IP7niSp/szFMVsCqUKxHN6W1ZuCMGGUeQxvqrByTxqO4lq41EuYxkF\nqCzAWpzYU+NtHwM4SiAoWygB\n-----END PRIVATE KEY-----\n",
  "client_email": String(process.env.REACT_APP_CLIENT_EMAIL),
  "client_id": process.env.REACT_APP_CLIENT_ID,
  "auth_uri": process.env.REACT_APP_AUTH_URI,
  "token_uri": process.env.REACT_APP_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.REACT_APP_AUTH_PROVIDER,
  "client_x509_cert_url": process.env.REACT_APP_CERT_URL
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://project3-8b62e.firebaseio.com'
});

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
  retrieveAll: function (req, res) {
    var verifiedStatus = verifyTokenFirebase(String(req.body.tokenEntire));
    if (verifiedStatus) {
      db.User.find({})
        .then(dbModel => res.json(dbModel))
        .catch(err => res.status(422).json(err));
    }
    else res.json("Invalid Token!");
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
    var verifiedStatus = verifyTokenFirebase(String(req.body.tokenEntire));
    if (verifiedStatus) {
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
  }


};


function verifyTokenFirebase(token) {
  return admin.auth().verifyIdToken(token)
    .then(function (decodedToken) {
      return true;
    }).catch(function (error) {
      //console.log("error:",error);
      return false;
    });
}