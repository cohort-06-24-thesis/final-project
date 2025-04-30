// routes/event.router.js

const express = require('express');
const router = express.Router();
const { getAllEvents,getEventById,createEvent,updateEvent,deleteEvent } = require('../controllers/event.controller');

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

module.exports = router; 