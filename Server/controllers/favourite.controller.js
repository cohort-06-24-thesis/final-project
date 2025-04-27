const db = require('../models');
const Favourite = db.Favourite;

module.exports = {
    // Create a new favourite
    createFavourite: async (req, res) => {
        try {
            const favourite = await Favourite.create(req.body);
            res.status(201).json(favourite);
        } catch (error) {
            res.status(500).json({
                message: error.message || "Some error occurred while creating the favourite."
            });
        }
    },

    // Get all favourites
    getAllFavourites: async (req, res) => {
        try {
            const favourites = await Favourite.findAll();
            res.status(200).json(favourites);
        } catch (error) {
            res.status(500).json({
                message: error.message || "Some error occurred while retrieving favourites."
            });
        }
    },

    // Get a single favourite by id
    getFavouriteById: async (req, res) => {
        const id = req.params.id;
        try {
            const favourite = await Favourite.findByPk(id);
            if (favourite) {
                res.status(200).json(favourite);
            } else {
                res.status(404).json({
                    message: `Favourite with id=${id} not found`
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || "Error retrieving favourite with id=" + id
            });
        }
    },

    // Update a favourite by id
    updateFavourite: async (req, res) => {
        const id = req.params.id;
        try {
            const num = await Favourite.update(req.body, {
                where: { id: id }
            });
            if (num[0] === 1) {
                res.status(200).json({
                    message: "Favourite was updated successfully."
                });
            } else {
                res.status(404).json({
                    message: `Cannot update Favourite with id=${id}. Maybe Favourite was not found!`
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || "Error updating Favourite with id=" + id
            });
        }
    },

    // Delete a favourite by id
    deleteFavourite: async (req, res) => {
        const id = req.params.id;
        try {
            const num = await Favourite.destroy({
                where: { id: id }
            });
            if (num === 1) {
                res.status(200).json({
                    message: "Favourite was deleted successfully!"
                });
            } else {
                res.status(404).json({
                    message: `Cannot delete Favourite with id=${id}. Maybe Favourite was not found!`
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || "Could not delete Favourite with id=" + id
            });
        }
    }
};
