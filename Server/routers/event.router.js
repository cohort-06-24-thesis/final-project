// routes/event.router.js

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

// Create a new event
router.post('/addEvent', eventController.createEvent);

// Get all events
router.get('/getAllEvents', eventController.getAllEvents);

// Get a single event by ID
router.get('/:id', eventController.getEventById);

// Update an event by ID
router.put('/:id', eventController.updateEvent);

// Delete an event by ID
router.delete('/:id', eventController.deleteEvent);

module.exports = router; 