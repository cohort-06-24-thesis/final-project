const express = require("express");
const {createFavourite, getAllFavourites, getFavouriteById, updateFavourite, deleteFavourite} = require("../controllers/favourite.controller");
const Router = express.Router();

// Changed from GET to POST for create
Router.post('/createFavourite', createFavourite);
// Added userId as query parameter
Router.get('/findAllFavourites/:userId', getAllFavourites);
Router.get('/findOneFavourite/:id', getFavouriteById);
Router.put('/updateFavourite/:id', updateFavourite);
Router.delete('/deleteFavourite/:id', deleteFavourite);

module.exports = Router;