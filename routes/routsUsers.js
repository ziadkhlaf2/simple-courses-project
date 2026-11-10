const express = require("express")
const router = express.Router()
const usersController = require("../controls/usersController");
const verifyToken = require("../middlewares/verifyToken");
const malter = require("multer");
const fileFilter = require("../utils/fileFilter");
const diskStorage = malter.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const uploads = malter({ storage: diskStorage , fileFilter: fileFilter});



router.route("/")
            .get(verifyToken, usersController.getAllUsers);



router.route("/register")
            .post(uploads.single("avatar"), usersController.registerUser);

router.route("/login")
            .post(usersController.loginUser);

router.route("/editUser/:id")
            .patch(verifyToken, usersController.patchUser)
            .delete(verifyToken, usersController.deleteUser)



module.exports = router