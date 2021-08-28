const express = require("express");
const {
  getUser,
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

module.exports = router;
