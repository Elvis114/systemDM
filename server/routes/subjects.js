const express  = require('express');
const r        = express.Router();
const Subject  = require('../models/Subject');
const { protect } = require('../middleware/auth');
const { adminOnly, teacherOrAdmin } = require('../middleware/roleCheck');

r.get('/', protect, async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = classId ? { classId } : {};
    const subjects = await Subject.find(filter)
      .populate('classId',   'name section')
      .populate('teacherId', 'name');
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

r.post('/', protect, adminOnly, async (req, res) => {
  try { res.status(201).json(await Subject.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

r.put('/:id', protect, teacherOrAdmin, async (req, res) => {
  try {
    const s = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!s) return res.status(404).json({ message: 'Subject not found' });
    res.json(s);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

r.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Subject.findByIdAndDelete(req.params.id); res.json({ message: 'Subject deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = r;
