const db = require("../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  /**
   * Retrieve appointment by appointment id
   * @param {*} req
   * @param {*} res
   */
  retrieveById: function(req, res) {
    return db.Appointment.findOne({
      _id: new ObjectId(req.params.id)
    })
      .populate("clientId")
      .then(dbModel => res.json(dbModel))
      .catch(err => {
        console.log("error",err);
        res.status(422).json(err);
      });
  },

  /**
   * Retrieves appointment by client id
   * @param {*} req
   * @param {*} res
   */
  retrieveAppt: function(req, res) {
    // add logic to make sure sessions is not expired
    return db.Appointment.find({
      startDate: { $gte: new Date() },
      $or: [{ clientId: req.params.id }, { calenderOwnerUserId: req.params.id }]       //<<<<<<<<<<<<<<<<< CHANGE LATER <<<<<<<<<<<<<<<<
    })
      .populate("clientId")
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },

  /**
   * Retrieves appointment by client id
   * @param {*} req
   * @param {*} res
   */
  retrieveAllAppt: function(req, res) {
    var ids = JSON.stringify(req.body.userIds);
    ids = JSON.parse(ids);
    var obj_ids = ids.map(function(id) {
      return ObjectId(id);
    });
    return db.Appointment.find({
      startDate: { $gte: new Date() },
      $or: [{ clientId: { $in: obj_ids } }, { calenderOwnerUserId: { $in: obj_ids } }]   //<<<<<<<<<<<<<<<<< CHANGE LATER <<<<<<<<<<<<<<<<
    })
      .populate("clientId")
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },

  /**
   * Removes an appointment from the appointment collection
   * @param {*} req
   * @param {*} res
   */
  removeAppt: function(req, res) {
    db.Appointment.findOneAndDelete({ _id: req.body.apptId }, {})
      .then(result => res.json(result))
      .catch(err => res.status(422).json(err));
  },

  /**
   * Creates an appointment and updates the appointmentBookingList for both user and client
   * @param {*} req
   * @param {*} res
   */
  create: function(req, res) {
    // TODO: this needs to be wrapped in a transaction for atomicity
    db.Appointment.create(req.body)
      .then(dbModel => {
        db.User.updateMany(
          { _id: { $in: [req.body.ownerUserId, req.body.clientId] } },
          { $push: { appointmentBookingList: dbModel._id } },
          { new: true }
        )
        return dbModel;
      })
      .then(updateResult => res.json(updateResult))
      .catch(err => res.status(422).json(err));
  },
  update: function(req, res) {
    db.Appointment.findOneAndUpdate({ _id: req.params.id }, req.body, {
      returnNewDocument: true
    })
      .then(updateResult => res.json(updateResult))
      .catch(err => res.status(422).json(err));
  }
};
