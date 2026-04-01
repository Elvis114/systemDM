const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  priority:   { type: String, enum: ['Low','Medium','High','Urgent'], default: 'Medium' },
  targetRole: { type: String, enum: ['all','teacher','student'], default: 'all' },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:   { type: Boolean, default: true },
  expiryDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
