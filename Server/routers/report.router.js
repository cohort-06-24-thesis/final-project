const express = require("express");
const {createReport, findAllReport,findOneReport,updateReport,deleteReport}= require("../controllers/report.controller");
const Router = express.Router();

Router.post('/createReport',createReport);
Router.get('/findAllReport',findAllReport);
Router.get('/findOneReport/:id',findOneReport);
Router.put('/updateReport/:id',updateReport);
Router.delete('/deleteReport/:id',deleteReport);


module.exports = Router;



