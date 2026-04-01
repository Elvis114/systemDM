const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res) => {
  try {
    const { classId, date, startDate, endDate, studentId } = req.query;
    const filter = {};
    if (classId)   filter.classId   = classId;
    if (studentId) filter.studentId = studentId;
    if (date)      filter.date      = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate()+1)) };
    if (startDate && endDate) filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    const records = await Attendance.find(filter)
      .populate('studentId', 'name studentId profilePhoto')
      .populate('classId',   'name section')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId })
      .populate('classId', 'name').sort({ date: -1 });
    const total   = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent  = records.filter(r => r.status === 'Absent').length;
    const late    = records.filter(r => r.status === 'Late').length;
    const pct     = total ? ((present / total) * 100).toFixed(1) : 0;
    res.json({ records, summary: { total, present, absent, late, percentage: pct } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getClassAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { classId: req.params.classId };
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate()+1)) };
    const records = await Attendance.find(filter)
      .populate('studentId', 'name studentId').sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markAttendance = async (req, res) => {
  try {
    const record = await Attendance.create({ ...req.body, markedBy: req.user._id });
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.bulkMarkAttendance = async (req, res) => {
  try {
    const records = await Attendance.insertMany(
      req.body.map(r => ({ ...r, markedBy: req.user._id }))
    );
    res.status(201).json(records);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
