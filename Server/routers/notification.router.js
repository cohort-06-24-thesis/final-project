const express = require("express");
const {
  createNotif,
  deleteNotif,
  findAllNotif,
  findOneNotif,
  updateNotif,
  getUnseenCount,
} = require("../controllers/notification.controller");
const Router = express.Router();

Router.post("/Addnotification", createNotif);
Router.get("/GetAllnotification", findAllNotif);
Router.get("/GetOnenotification/:id", findOneNotif);
Router.put("/Updatenotification/:id", updateNotif);
Router.delete("/Deletenotification/:id", deleteNotif);
Router.get("/unseenCount", getUnseenCount);

module.exports = Router;
