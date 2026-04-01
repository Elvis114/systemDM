const express = require('express');
const r = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { adminOnly, teacherOrAdmin } = require('../middleware/roleCheck');

r.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy','name').sort({ date: 1 });
    res.json(events);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

r.post('/', protect, teacherOrAdmin, async (req, res) => {
  try { res.status(201).json(await Event.create({ ...req.body, createdBy: req.user._id })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

r.put('/:id', protect, teacherOrAdmin, async (req, res) => {
  try {
    const e = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!e) return res.status(404).json({ message: 'Event not found' });
    res.json(e);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

r.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Event.findByIdAndDelete(req.params.id); res.json({ message: 'Event deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = r;
