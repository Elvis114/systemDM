const mongoose = require('mongoose');

const generateReceiptNumber = () => {
  const date  = new Date();
  const year  = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const rand  = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${year}${month}-${rand}`;
};

const paymentSchema = new mongoose.Schema({
  receiptNumber: { type: String, unique: true, default: generateReceiptNumber },

  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

  feeType: {
    type: String,
    enum: ['Tuition','Books','Uniform','Transport','Exam','Feeding','Other'],
    required: true,
  },

  totalAmount: { type: Number, required: true },
  amountPaid:  { type: Number, required: true },
  balance:     { type: Number, default: 0 },

  paymentMethod: {
    type: String,
    enum: [
      'Cash',
      'MTN Mobile Money',
      'Telecel Cash',
      'AirtelTigo Money',
      'Card',
      'Bank Transfer',
      'Online - MTN Mobile Money',
      'Online - Telecel Cash',
      'Online - AirtelTigo Money',
      'Online - Card',
    ],
    required: true,
  },

  // MoMo fields (manual or online)
  momoNumber:        { type: String, default: '' },
  momoTransactionId: { type: String, default: '' },

  // Bank transfer fields
  bankName:          { type: String, default: '' },
  bankTransactionId: { type: String, default: '' },
  accountNumber:     { type: String, default: '' },

  // Paystack online payment fields
  paystackReference: { type: String, default: '' },
  paystackStatus:    { type: String, default: '' }, // success | failed | pending
  onlinePayment:     { type: Boolean, default: false },
  paidByEmail:       { type: String, default: '' },

  status: {
    type: String,
    enum: ['Paid','Partial','Pending','Overdue'],
    default: 'Pending',
  },

  term:         { type: String, enum: ['Term 1','Term 2','Term 3'], required: true },
  academicYear: { type: String, required: true, default: '2024/2025' },
  dueDate:      { type: Date,   required: true },
  paymentDate:  { type: Date },
  notes:        { type: String, default: '' },
  recordedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

// Auto-calculate balance + status before saving
paymentSchema.pre('save', function (next) {
  this.balance = this.totalAmount - this.amountPaid;
  if (this.amountPaid >= this.totalAmount)            this.status = 'Paid';
  else if (this.amountPaid > 0)                       this.status = 'Partial';
  else if (this.dueDate && new Date() > this.dueDate) this.status = 'Overdue';
  else                                                this.status = 'Pending';
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
