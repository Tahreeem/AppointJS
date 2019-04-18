const router = require("express").Router();
const userController = require("../../controllers/userController");

// Matches with "/api/user"
router
  .route("/")
  .post(userController.register)
  .put(userController.updateUser)
  .get(userController.retrieveAll);

// Matches with "/api/user/:id"
//router.route("/:id").get(userController.findByTokenId);   //findUserByToken);
router.route("/token").post(userController.findUserByTokenPost);

// Matches with "/api/user/logout"
router.route("/logout").delete(userController.logout);

// Matches with "/api/user/initializeuser"
router.route("/initializeuser").post(userController.initializeUser);

// Matches with "/api/user/initializefirebase"
router.route("/validatefirebase").post(userController.validateFirebase);

module.exports = router;
