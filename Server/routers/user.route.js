const express = require("express");
const Router = express.Router();
const {createUser}= require("../controllers/user.controller");

Router.post('/add',createUser);

module.exports = Router;