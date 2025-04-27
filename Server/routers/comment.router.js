const express = require("express");
const {AddComment,findAllComment,findOneComment,updateComment,deleteComment}= require("../controllers/comment.controller");
const Router = express.Router();

Router.post('/createComment',AddComment);
Router.get('/findAllComments',findAllComment);
Router.get('/findOneComment/:id',findOneComment);
Router.put('/updateComment/:id',updateComment);
Router.delete('/deleteComment/:id',deleteComment);

module.exports = Router;