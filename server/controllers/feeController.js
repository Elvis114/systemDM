const Fee = require('../models/Fee');

exports.getFees = async (req, res) => {
  try {
    const { status, term, academicYear, studentId } = req.query;
    const filter = {};
    if (status)       filter.status       = status;
    if (term)         filter.term         = term;
    if (academicYear) filter.academicYear = academicYear;
    if (studentId)    filter.studentId    = studentId;
    const fees = await Fee.find(filter)
      .populate('studentId', 'name studentId classId')
      .sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentFees = async (req, res) => {
  try {
    const fees    = await Fee.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    const billed  = fees.reduce((s, f) => s + f.amount, 0);
    const paid    = fees.reduce((s, f) => s + f.amountPaid, 0);
    const balance = fees.reduce((s, f) => s + f.balance, 0);
    res.json({ fees, summary: { billed, paid, balance } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFeeSummary = async (req, res) => {
  try {
    const { term, academicYear } = req.query;
    const filter = {};
    if (term)         filter.term         = term;
    if (academicYear) filter.academicYear = academicYear;
    const fees        = await Fee.find(filter);
    const total       = fees.reduce((s, f) => s + f.amount, 0);
    const collected   = fees.reduce((s, f) => s + f.amountPaid, 0);
    const pending     = fees.filter(f => f.status === 'Pending').reduce((s, f) => s + f.balance, 0);
    const overdue     = fees.filter(f => f.status === 'Overdue').reduce((s, f) => s + f.balance, 0);
    const byStatus    = { Paid: 0, Partial: 0, Pending: 0, Overdue: 0 };
    fees.forEach(f => { if (byStatus[f.status] !== undefined) byStatus[f.status]++; });
    res.json({ total, collected, pending, overdue, byStatus, count: fees.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFee = async (req, res) => {
  try {
    const fee = new Fee(req.body);
    await fee.save();
    res.status(201).json(fee);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    Object.assign(fee, req.body);
    await fee.save();
    res.json(fee);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
