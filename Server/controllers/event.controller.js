// controllers/eventController.js

const { Event, EventParticipant, User } = require('../Database/index');

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
      const { title, description, date, location, images, participators, UserId } = req.body;

      if (!title || !description || !date || !location || !participators || !UserId) {
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
        status: 'upcoming',
        isApproved: false,
        UserId
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
  },

  getEventParticipants: async (req, res) => {
    try {
        const { eventId } = req.params;
        const participants = await EventParticipant.findAll({
            where: { eventId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'profilePic']
            }]
        });
        res.status(200).json(participants);
    } catch (error) {
        console.error('Error getting participants:', error);
        res.status(500).json({ message: error.message });
    }
  },

  joinEvent: async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.body;

        console.log('Join event request:', { eventId, userId }); // Debug log

        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if EventParticipant is defined
        if (!EventParticipant) {
            console.error('EventParticipant model is undefined');
            return res.status(500).json({ message: 'Internal server error' });
        }

        const existingParticipant = await EventParticipant.findOne({
            where: { eventId, userId }
        });

        if (existingParticipant) {
            return res.status(400).json({ message: 'Already joined this event' });
        }

        const participant = await EventParticipant.create({ 
            eventId: parseInt(eventId), 
            userId 
        });

        // Update event participators count
        event.participators = (event.participators || 0) + 1;
        await event.save();

        // Return participant with user info
        const participantWithUser = await EventParticipant.findOne({
            where: { id: participant.id },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'profilePic']
            }]
        });

        res.status(201).json(participantWithUser);
    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ 
            message: error.message,
            stack: error.stack // Include stack trace for debugging
        });
    }
  },

  leaveEvent: async (req, res) => {
    try {
        const { eventId, userId } = req.params;
        
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const result = await EventParticipant.destroy({
            where: { eventId, userId }
        });

        if (result > 0) {
            event.participators = Math.max(0, (event.participators || 1) - 1);
            await event.save();
        }

        res.status(200).json({ message: 'Successfully left event' });
    } catch (error) {
        console.error('Error leaving event:', error);
        res.status(500).json({ message: error.message });
    }
  }
};