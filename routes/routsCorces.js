const express = require("express")
const {validationShcema} = require("../middlewares/validationShcema")
const verifyToken = require("../middlewares/verifyToken")
const allowedto = require("../middlewares/allowedto")
const userRole = require("../utils/userRole")
const router = express.Router()

const { allCorces, oneCors, addCors, patchCors, deleteCors } = require("../controls/controlCorses");

// router.get("/", allCorces);
// router.post("/", body("name").isString().isLength({ min: 3 }), addCors);

// router.get("/:corsID", oneCors);
// router.patch("/:corsID", patchCors);
// router.delete("/:corsID", deleteCors);

router.route("/").get(allCorces).post(validationShcema(),addCors); //* نفس السطرين 8 & 9
router.route("/:corsID").get(oneCors).patch(verifyToken, allowedto(userRole.ADMIN, userRole.MANAGER) ,patchCors).delete(verifyToken, deleteCors); // * نفس السطور من 11 ل 13

module.exports = router