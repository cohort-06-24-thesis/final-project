// controllers/inNeedController.js

const { InNeed } = require('../Database/index'); // Adjust the import based on your file structure

// Create a new InNeed
exports.createInNeed = async (req, res) => {
    try {
        const { title, description, images, location } = req.body;
        const newInNeed = await InNeed.create({ title, description, images, location });
        res.status(201).json(newInNeed);
    } catch (error) {
        console.error('Error creating InNeed:', error);
        res.status(500).json({ error: 'Something went wrong while creating the record.' });
    }
};

// Get all InNeed entries
exports.getAllInNeeds = async (req, res) => {
    try {
        const inNeeds = await InNeed.findAll();
        res.status(200).json(inNeeds);
    } catch (error) {
        console.error('Error fetching InNeeds:', error);
        res.status(500).json({ error: 'Something went wrong while fetching records.' });
    }
};

// Get a single InNeed by ID
exports.getInNeedById = async (req, res) => {
    try {
        const { id } = req.params;
        const inNeed = await InNeed.findByPk(id);

        if (!inNeed) {
            return res.status(404).json({ error: 'InNeed not found' });
        }

        res.status(200).json(inNeed);
    } catch (error) {
        console.error('Error fetching InNeed:', error);
        res.status(500).json({ error: 'Something went wrong while fetching the record.' });
    }
};

// Update an InNeed by ID
exports.updateInNeed = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, images, location } = req.body;

        const inNeed = await InNeed.findByPk(id);

        if (!inNeed) {
            return res.status(404).json({ error: 'InNeed not found' });
        }

        await inNeed.update({ title, description, images, location });

        res.status(200).json(inNeed);
    } catch (error) {
        console.error('Error updating InNeed:', error);
        res.status(500).json({ error: 'Something went wrong while updating the record.' });
    }
};

// Delete an InNeed by ID
exports.deleteInNeed = async (req, res) => {
    try {
        const { id } = req.params;
        const inNeed = await InNeed.findByPk(id);

        if (!inNeed) {
            return res.status(404).json({ error: 'InNeed not found' });
        }

        await inNeed.destroy();
        res.status(200).json({ message: 'InNeed deleted successfully.' });
    } catch (error) {
        console.error('Error deleting InNeed:', error);
        res.status(500).json({ error: 'Something went wrong while deleting the record.' });
    }
};
