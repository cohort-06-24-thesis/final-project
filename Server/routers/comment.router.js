const express = require("express");
const {create,remove,findAll,findOne,update}= require("../controllers/comment.controller");
const Router = express.Router();

Router.post('/createComment',create);
Router.get('/findAllComments',findAll);
Router.get('/findOneComment/:id',findOne);
Router.put('/updateComment/:id',update);
Router.delete('/deleteComment/:id',remove);

module.exports = Router;