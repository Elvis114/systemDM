const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const { targetRole } = req.query;
    const filter = { isActive: true };
    if (targetRole && targetRole !== 'all')
      filter.$or = [{ targetRole }, { targetRole: 'all' }];
    const items = await Announcement.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(ann);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });
    res.json(ann);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
