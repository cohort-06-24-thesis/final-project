const express = require("express");
const Router = express.Router();
const {createUser, deleteUser,updateUser,getAllUsers,getUser,getUserByEmail,getUserById,getUserByName}= require("../controllers/user.controller");

Router.post('/add',createUser);
Router.delete('/delete/:id',deleteUser);
Router.put('/update/:id',updateUser);
Router.get('/all',getAllUsers);
Router.get('/get/:id',getUser);
Router.get('/getByEmail/:email',getUserByEmail);
Router.get('/getByName/:name',getUserByName);
Router.get('/getById/:id',getUserById);



module.exports = Router;