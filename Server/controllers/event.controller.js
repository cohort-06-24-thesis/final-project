// controllers/eventController.js

const { Event } = require('../Database/index');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, description, images, date, location, status, partcipators } = req.body;
        const newEvent = await Event.create({ 
            title, 
            description, 
            images, 
            date, 
            location, 
            status, 
            partcipators 
        });
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Something went wrong while creating the event.' });
    }
};

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Something went wrong while fetching events.' });
    }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Something went wrong while fetching the event.' });
    }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, images, date, location, status, partcipators } = req.body;

        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        await event.update({ 
            title, 
            description, 
            images, 
            date, 
            location, 
            status, 
            partcipators 
        });

        res.status(200).json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Something went wrong while updating the event.' });
    }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        await event.destroy();
        res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Something went wrong while deleting the event.' });
    }
}; 