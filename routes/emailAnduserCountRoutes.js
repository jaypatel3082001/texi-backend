const express = require("express");

const { userCount, emailSender } = require("../controller/emailAndUserCount");



const router = express.Router();


router.get("/count", userCount);
router.post("/email", emailSender);


module.exports = router;