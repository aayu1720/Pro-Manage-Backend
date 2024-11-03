const express = require("express");
const router = express.Router();
const auth = require("../controller/userAuth");

router.post("/register", auth.registerUser);
router.post("/login", auth.loginUser);
router.put("/update/name", auth.updateUserName);
router.put("/update/userDetails", auth.updateUserDetails);

module.exports = router;