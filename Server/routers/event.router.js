// routes/event.router.js

const express = require('express');
const router = express.Router();
const { getAllEvents,getEventById,createEvent,updateEvent,deleteEvent } = require('../controllers/event.controller');
const eventController = require('../controllers/event.controller');

// Create a new event
router.post('/addEvent',createEvent );

// Get all events
router.get('/getAllEvents',getAllEvents );

// Get a single event by ID
router.get('/:id',getEventById );

// Update an event by ID
router.put('/:id', updateEvent);

// Delete an event by ID
router.delete('/:id',deleteEvent );

// Get participants of an event
router.get('/:eventId/participants', eventController.getEventParticipants);

// Join an event
router.post('/:eventId/participants', eventController.joinEvent);

// Leave an event
router.delete('/:eventId/participants/:userId', eventController.leaveEvent);

module.exports = router;