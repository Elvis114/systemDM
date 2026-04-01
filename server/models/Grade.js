const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  score:        { type: Number, required: true, min: 0, max: 100 },
  totalMarks:   { type: Number, default: 100 },
  percentage:   { type: Number },
  grade:        { type: String },
  remarks:      { type: String, default: '' },
  term:         { type: String, required: true },
  academicYear: { type: String, required: true },
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
}, { timestamps: true });

gradeSchema.pre('save', function (next) {
  this.percentage = ((this.score / this.totalMarks) * 100).toFixed(1);
  const p = parseFloat(this.percentage);
  if (p >= 90)      this.grade = 'A';
  else if (p >= 80) this.grade = 'B';
  else if (p >= 70) this.grade = 'C';
  else if (p >= 60) this.grade = 'D';
  else              this.grade = 'F';
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
