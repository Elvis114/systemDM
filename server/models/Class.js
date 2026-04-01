const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  section:         { type: String },
  classTeacherId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  students:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  academicYear:    { type: String, required: true },
  capacity:        { type: Number, default: 40 },
  room:            { type: String },
  subjects:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
