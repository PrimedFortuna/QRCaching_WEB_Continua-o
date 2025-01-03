const express = require('express');
const router = express.Router();
const Event = require('../models/event');

// Create a new event
router.post('/', async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get the total number of events
router.get('/count', async (req, res) => {
    try {
        const eventCount = await Event.countDocuments();
        res.status(200).json({ eventCount });
    } catch (error) {
        console.error('Error fetching event count:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all confirmed events
router.get('/confirmed', async (req, res) => {
    try {
        const events = await Event.find({ events_confirmed: true });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single event
router.get('/:id', getEvent, (req, res) => {
    res.json(res.event);
});

// Update an event
router.patch('/:id', getEvent, async (req, res) => {
    try {
        if (req.body.events_name != null) {
            res.event.events_name = req.body.events_name;
        }
        if (req.body.events_latitude != null) {
            res.event.events_latitude = req.body.events_latitude;
        }
        if (req.body.events_longitude != null) {
            res.event.events_longitude = req.body.events_longitude;
        }
        if (req.body.events_idate != null) {
            res.event.events_idate = req.body.events_idate;
        }
        if (req.body.events_fdate != null) {
            res.event.events_fdate = req.body.events_fdate;
        }
        if (req.body.events_svg != null) {
            res.event.events_svg = req.body.events_svg;
        }
        const updatedEvent = await res.event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an event
router.delete('/:id', getEvent, async (req, res) => {
    try {
        await res.event.deleteOne();
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create_event
router.post('/create_event', async (req, res) => {
    try {
        const allEvents = await Event.find({}, { events_id: 1 }).sort({ events_id: 1 }); // Get all event IDs in ascending order
        let newEventId = 1; // Default value if no events exist yet

        // Check for gaps in the event IDs
        for (let i = 0; i < allEvents.length; i++) {
            if (allEvents[i].events_id !== i + 1) {
                newEventId = i + 1; // If there's a gap, use this ID
                break;
            }
        }

        // If no gaps were found, set `newEventId` to one greater than the last event ID
        if (newEventId === allEvents.length + 1) {
            newEventId = allEvents.length + 1;
        }

        const {events_name, events_photo, events_map, events_svg, events_num_qrcodes, events_idate, events_fdate} = req.body;

        const newEvent = new Event({
            events_id: newEventId,
            events_name: events_name,
            events_photo: events_photo,
            events_map: events_map,
            events_svg: events_svg,
            events_num_qrcodes: events_num_qrcodes,
            events_idate: events_idate,
            events_fdate: events_fdate
        });

        const savedEvent = await newEvent.save();

        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

async function getEvent(req, res, next) {
    let event;
    try {
        event = await Event.findById(req.params.id);
        if (event == null) {
            return res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    res.event = event;
    next();
}

module.exports = router;

