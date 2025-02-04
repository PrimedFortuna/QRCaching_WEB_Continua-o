const express = require('express');
const router = express.Router();
const Lqrcode = require('../models/lqrcode');

// Create a new lqrcode
router.post('/', async (req, res) => {
    try {
        const newLqrcode = new Lqrcode(req.body);
        const savedLqrcode = await newLqrcode.save();
        res.status(201).json(savedLqrcode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all lqrcodes
router.get('/', async (req, res) => {
    try {
        const lqrcodes = await Lqrcode.find();
        res.json(lqrcodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get the total number of QR codes
router.get('/count', async (req, res) => {
    try {
        const qrCodeCount = await Lqrcode.countDocuments();
        res.status(200).json({ qrCodeCount });
    } catch (error) {
        console.error('Error fetching QR code count:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get the total number of QR codes not associated with an event
router.get('/count_not_event', async (req, res) => {
    try {
        const qrCodeCount = await Lqrcode.countDocuments({ lqrcode_is_event: false });
        res.status(200).json({ qrCodeCount });
    } catch (error) {
        console.error('Error fetching QR code count:', error);
        res.status(500).json({ message: error.message });
    }
});

//Delete all lqrcodes
router.delete('/delete_all', async (req, res) => {
    try {
        await Lqrcode.deleteMany();
        res.json({ message: 'All lqrcodes deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single lqrcode by lqrcode_id
router.get('/find_by_id/:lqrcode_id', async (req, res) => {
    try {
        const lqrcode = await Lqrcode.findOne({ lqrcode_id: req.params.lqrcode_id });
        if (!lqrcode) {
            return res.status(404).json({ message: 'Lqrcode not found' });
        }
        res.json(lqrcode);
    } catch (error) {
        console.error('Error fetching Lqrcode by lqrcode_id:', error);
        res.status(500).json({ message: error.message });
    }
});

//Find by (`/lqrcodes/find_by_longitude_latitude/${qrCode.longitude}/${qrCode.latitude}`)
router.get('/find_by_longitude_latitude/:longitude/:latitude', async (req, res) => {
    try {
        const lqrcode = await Lqrcode.findOne({ lqrcode_longitude: req.params.longitude, lqrcode_latitude: req.params.latitude });
        if (!lqrcode) {
            return res.status(404).json({ message: 'Lqrcode not found' });
        }
        res.json(lqrcode);
    } catch (error) {
        console.error('Error fetching Lqrcode by longitude and latitude:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a single lqrcode
router.get('/:id', getLqrcode, (req, res) => {
    res.json(res.lqrcode);
});

// Update a lqrcode
router.patch('/:id', getLqrcode, async (req, res) => {
    try {
        const { lqrcode_id, lqrcode_latitude, lqrcode_longitude, lqrcode_altitude, lqrcode_is_event, lqrcode_is_quest, lqrcode_times_scanned } = req.body;
        
        if (lqrcode_id !== undefined) res.lqrcode.lqrcode_id = lqrcode_id;
        if (lqrcode_latitude !== undefined) res.lqrcode.lqrcode_latitude = lqrcode_latitude;
        if (lqrcode_longitude !== undefined) res.lqrcode.lqrcode_longitude = lqrcode_longitude;
        if (lqrcode_altitude !== undefined) res.lqrcode.lqrcode_altitude = lqrcode_altitude;
        if (lqrcode_is_event !== undefined) res.lqrcode.lqrcode_is_event = lqrcode_is_event;
        if (lqrcode_is_quest !== undefined) res.lqrcode.lqrcode_is_quest = lqrcode_is_quest;
        if (lqrcode_times_scanned !== undefined) res.lqrcode.lqrcode_times_scanned = lqrcode_times_scanned;

        const updatedLqrcode = await res.lqrcode.save();
        res.json(updatedLqrcode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a lqrcode
router.delete('/:id', getLqrcode, async (req, res) => {
    try {
        await res.lqrcode.deleteOne();
        res.json({ message: 'Lqrcode deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

async function getLqrcode(req, res, next) {
    let lqrcode;
    try {
        lqrcode = await Lqrcode.findById(req.params.id);
        if (lqrcode == null) {
            return res.status(404).json({ message: 'Lqrcode not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    res.lqrcode = lqrcode;
    next();
}

module.exports = router;
