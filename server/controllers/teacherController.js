const Teacher = require('../models/Teacher');

// Get teacher profile linked to the logged-in user
exports.getMyTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.user.email })
      .populate('classId', 'name section students');
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
    res.json(teacher);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getTeachers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name:       { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { email:      { $regex: search, $options: 'i' } },
    ];
    const teachers = await Teacher.find(filter)
      .populate('classId', 'name section')
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('classId', 'name section');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTeacher = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.classId || data.classId === '') delete data.classId;
    const teacher = await Teacher.create(data);
    res.status(201).json(teacher);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateTeacher = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.classId || data.classId === '') data.classId = null;
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteTeacher = async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
