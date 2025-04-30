// controllers/eventController.js

const { Event } = require('../Database/index');

module.exports = {
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.findAll({
        order: [['date', 'ASC']]
      });
      res.status(200).json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching events',
        error: error.message
      });
    }
  },

  getEventById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching event',
        error: error.message
      });
    }
  },

  createEvent: async (req, res) => {
    try {
      const { title, description, date, location, images, participators } = req.body;

      if (!title || !description || !date || !location || !participators) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: title, description, date, location, and participators are required'
        });
      }

      const newEvent = await Event.create({
        title,
        description,
        date,
        location,
        images: Array.isArray(images) ? images : [images], // Handle single image string
        participators, // Fixed spelling here
        status: 'upcoming'
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: newEvent
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating event',
        error: error.message
      });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      await event.update(updateData);
      
      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating event',
        error: error.message
      });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      await event.destroy();
      
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting event',
        error: error.message
      });
    }
  }
};