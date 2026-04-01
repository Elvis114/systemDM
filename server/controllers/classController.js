const Class   = require('../models/Class');
const Student = require('../models/Student');

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacherId', 'name employeeId subject')
      .populate('students', 'name studentId gender')
      .populate('subjects', 'name code')
      .sort({ name: 1 });
    res.json(classes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('classTeacherId', 'name employeeId subjects phone email')
      .populate('students', 'name studentId gender age status profilePhoto')
      .populate('subjects', 'name code totalMarks passingMarks');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createClass = async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json(cls);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getClassStudents = async (req, res) => {
  try {
    const students = await Student.find({ classId: req.params.id });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
