const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  code:         { type: String, required: true, unique: true },
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  description:  { type: String, default: '' },
  totalMarks:   { type: Number, default: 100 },
  passingMarks: { type: Number, default: 50 },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
