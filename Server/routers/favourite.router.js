const express = require("express");
const {createFavourite,getAllFavourites,getFavouriteById, updateFavourite, deleteFavourite}= require("../controllers/favourite.controller");
const Router = express.Router();

Router.get('/createFavourite',createFavourite);
Router.get('/findAllFavourites',getAllFavourites);
Router.get('/findOneFavourite/:id',getFavouriteById);
Router.put('/updateFavourite/:id',updateFavourite);
Router.delete('/deleteFavourite/:id',deleteFavourite);

module.exports = Router;