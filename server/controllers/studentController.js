const Student    = require('../models/Student');
const Grade      = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Fee        = require('../models/Fee');

exports.getStudents = async (req, res) => {
  try {
    const { search, classId, gender, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (classId) filter.classId = classId;
    if (gender)  filter.gender  = gender;
    if (status)  filter.status  = status;
    if (search)  filter.$or = [
      { name:      { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];
    const total    = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .populate('classId', 'name section')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ students, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('classId', 'name section academicYear');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createStudent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.classId || data.classId === '') delete data.classId;
    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.classId || data.classId === '') data.classId = null;
    const student = await Student.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.id })
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });
    const avg = grades.length ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : 0;
    res.json({ grades, average: avg });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.id }).sort({ date: -1 });
    const total   = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const pct     = total ? ((present / total) * 100).toFixed(1) : 0;
    res.json({ records, total, present, percentage: pct });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentFees = async (req, res) => {
  try {
    const fees    = await Fee.find({ studentId: req.params.id }).sort({ createdAt: -1 });
    const billed  = fees.reduce((s, f) => s + f.amount, 0);
    const paid    = fees.reduce((s, f) => s + f.amountPaid, 0);
    const balance = fees.reduce((s, f) => s + f.balance, 0);
    res.json({ fees, summary: { billed, paid, balance } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
