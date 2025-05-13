const db = require('../Database');
const { Favourite, DonationItem, inNeed, User } = db;

module.exports = {
    // Create a new favourite
    createFavourite: async (req, res) => {
        try {
            const { userId, donationItemId, inNeedId } = req.body;
            const favourite = await Favourite.create({
                userId,
                donationItemId,
                inNeedId
            });
            res.status(201).json(favourite);
        } catch (error) {
            console.error('Error creating favourite:', error);
            res.status(500).json({ 
                message: 'Error creating favourite',
                error: error.message 
            });
        }
    },

    // Get all favourites for a user
    getAllFavourites: async (req, res) => {
        try {
            const { userId } = req.params;
            const favourites = await Favourite.findAll({
                where: { userId },
                include: [
                    {
                        model: DonationItem,
                        attributes: ['id', 'title', 'image', 'location']
                    },
                    {
                        model: inNeed,
                        attributes: ['id', 'title', 'images', 'location']
                    }
                ]
            });
            res.status(200).json(favourites);
        } catch (error) {
            console.error('Error getting favourites:', error);
            res.status(500).json({ 
                message: 'Error getting favourites',
                error: error.message 
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

    // Delete a favourite
    deleteFavourite: async (req, res) => {
        try {
            const { id } = req.params;
            await Favourite.destroy({ where: { id } });
            res.status(200).json({ message: 'Favourite deleted successfully' });
        } catch (error) {
            console.error('Error deleting favourite:', error);
            res.status(500).json({ 
                message: 'Error deleting favourite',
                error: error.message 
            });
        }
    }
};
