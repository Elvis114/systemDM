const Payment = require('../models/Payment');

// ── GET all payments (with filters) ──────────────────────────
exports.getPayments = async (req, res) => {
  try {
    const { status, term, academicYear, paymentMethod, studentId, search } = req.query;
    const filter = {};
    if (status)        filter.status        = status;
    if (term)          filter.term          = term;
    if (academicYear)  filter.academicYear  = academicYear;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (studentId)     filter.studentId     = studentId;

    let payments = await Payment.find(filter)
      .populate('studentId', 'name studentId classId')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });

    // Search by student name
    if (search) {
      payments = payments.filter(p =>
        p.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.receiptNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET single payment ────────────────────────────────────────
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'name studentId classId guardianName guardianPhone')
      .populate('recordedBy', 'name');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET payments by student ───────────────────────────────────
exports.getPaymentsByStudent = async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId })
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });

    const totalBilled  = payments.reduce((s, p) => s + p.totalAmount, 0);
    const totalPaid    = payments.reduce((s, p) => s + p.amountPaid, 0);
    const totalBalance = payments.reduce((s, p) => s + p.balance, 0);
    const overdue      = payments.filter(p => p.status === 'Overdue').length;

    res.json({
      payments,
      summary: { totalBilled, totalPaid, totalBalance, overdue },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET payment summary (dashboard stats) ────────────────────
exports.getPaymentSummary = async (req, res) => {
  try {
    const { term, academicYear } = req.query;
    const filter = {};
    if (term)         filter.term         = term;
    if (academicYear) filter.academicYear = academicYear;

    const payments = await Payment.find(filter);

    const totalBilled    = payments.reduce((s, p) => s + p.totalAmount, 0);
    const totalCollected = payments.reduce((s, p) => s + p.amountPaid, 0);
    const totalPending   = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.balance, 0);
    const totalOverdue   = payments.filter(p => p.status === 'Overdue').reduce((s, p) => s + p.balance, 0);
    const totalPartial   = payments.filter(p => p.status === 'Partial').reduce((s, p) => s + p.balance, 0);

    const byMethod = {
      'School Fees':      payments.filter(p => p.paymentMethod === 'School Fees').reduce((s, p) => s + p.amountPaid, 0),
      'MTN Mobile Money': payments.filter(p => p.paymentMethod === 'MTN Mobile Money').reduce((s, p) => s + p.amountPaid, 0),
      'Bank Transfer':    payments.filter(p => p.paymentMethod === 'Bank Transfer').reduce((s, p) => s + p.amountPaid, 0),
    };

    const byStatus = {
      Paid:    payments.filter(p => p.status === 'Paid').length,
      Partial: payments.filter(p => p.status === 'Partial').length,
      Pending: payments.filter(p => p.status === 'Pending').length,
      Overdue: payments.filter(p => p.status === 'Overdue').length,
    };

    res.json({
      totalBilled, totalCollected, totalPending,
      totalOverdue, totalPartial, byMethod, byStatus,
      count: payments.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CREATE payment ────────────────────────────────────────────
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      recordedBy: req.user._id,
    });
    const populated = await payment.populate('studentId', 'name studentId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── UPDATE payment ────────────────────────────────────────────
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    Object.assign(payment, req.body);
    await payment.save(); // triggers pre-save hook to recalculate balance/status
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE payment ────────────────────────────────────────────
exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
