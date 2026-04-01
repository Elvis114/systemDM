const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType:       { type: String, enum: ['Tuition','Books','Uniform','Transport','Exam','Feeding','Other'], required: true },
  amount:        { type: Number, required: true },
  amountPaid:    { type: Number, default: 0 },
  balance:       { type: Number, default: 0 },
  dueDate:       { type: Date },
  paymentDate:   { type: Date },
  paymentMethod: { type: String, enum: ['Cash','Mobile Money','Bank Transfer','Cheque'] },
  status:        { type: String, enum: ['Paid','Partial','Pending','Overdue'], default: 'Pending' },
  receiptNumber: { type: String, unique: true },
  term:          { type: String, required: true },
  academicYear:  { type: String, required: true },
  notes:         { type: String, default: '' },
}, { timestamps: true });

feeSchema.pre('save', async function (next) {
  this.balance = this.amount - this.amountPaid;
  if (this.amountPaid >= this.amount)           this.status = 'Paid';
  else if (this.amountPaid > 0)                 this.status = 'Partial';
  else if (this.dueDate && new Date() > this.dueDate) this.status = 'Overdue';
  else                                          this.status = 'Pending';

  if (!this.receiptNumber) {
    const count = await mongoose.model('Fee').countDocuments();
    const d = new Date();
    this.receiptNumber = `RCP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(4,'0')}`;
  }
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
