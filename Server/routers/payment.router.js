const express = require("express");
const {Add, verify}= require("../controllers/payment.controller");
const Router = express.Router();


Router.post("/payment",Add);
Router.post("/payment/:id",verify)




module.exports = Router;
 