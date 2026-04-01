const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  employeeId:    { type: String, unique: true },
  subjects:      [{ type: String }],
  email:         { type: String, required: true, lowercase: true },
  phone:         { type: String },
  qualification: { type: String },
  experience:    { type: Number, default: 0 },
  salary:        { type: Number },
  joinDate:      { type: Date, default: Date.now },
  department:    { type: String },
  profilePhoto:  { type: String, default: '' },
  status:        { type: String, enum: ['Active','Inactive'], default: 'Active' },
  classId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

teacherSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Teacher').countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Teacher', teacherSchema);
