const express = require("express");
const {
  getUser,
  getUserByEmail,
  getUserByPhone,
  addAddress,
  addPhonenumber,
  getOrderId,
  captureCod,
  capturePayment,
} = require("../controller/userController");
const router = express.Router();

router.get("/findById/:id", getUser);
router.post("/addAddress", addAddress);
router.post("/addPhonenumber", addPhonenumber);
router.get("/orderId", getOrderId);
router.post("/capture/:paymentId", capturePayment);
router.post("/captureCod", captureCod);
router.post("/getUserByEmail", getUserByEmail);
router.post("/getUserByPhone", getUserByPhone);

module.exports = router;
