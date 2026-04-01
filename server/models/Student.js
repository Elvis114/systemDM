const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  studentId:        { type: String, unique: true },
  classId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  age:              { type: Number },
  dateOfBirth:      { type: Date },
  gender:           { type: String, enum: ['Male','Female','Other'] },
  email:            { type: String, lowercase: true },
  phone:            { type: String },
  address:          { type: String },
  nationality:      { type: String, default: 'Ghanaian' },
  guardianName:     { type: String },
  guardianPhone:    { type: String },
  guardianEmail:    { type: String },
  guardianRelation: { type: String },
  enrollmentDate:   { type: Date, default: Date.now },
  profilePhoto:     { type: String, default: '' },
  status:           { type: String, enum: ['Active','Inactive','Graduated'], default: 'Active' },
}, { timestamps: true });

// Auto-generate studentId
studentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `STU-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
