const Grade = require('../models/Grade');

exports.getGrades = async (req, res) => {
  try {
    const { term, academicYear, classId, subjectId, studentId } = req.query;
    const filter = {};
    if (term)         filter.term         = term;
    if (academicYear) filter.academicYear = academicYear;
    if (classId)      filter.classId      = classId;
    if (subjectId)    filter.subjectId    = subjectId;
    if (studentId)    filter.studentId    = studentId;
    const grades = await Grade.find(filter)
      .populate('studentId', 'name studentId')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });
    res.json(grades);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId })
      .populate('subjectId', 'name code totalMarks')
      .populate('teacherId', 'name')
      .sort({ term: 1 });
    const avg = grades.length
      ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : 0;
    res.json({ grades, average: avg });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getReportCard = async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId })
      .populate('subjectId', 'name code totalMarks passingMarks')
      .populate('studentId', 'name studentId classId')
      .sort({ term: 1, 'subjectId.name': 1 });

    const byTerm = {};
    grades.forEach(g => {
      if (!byTerm[g.term]) byTerm[g.term] = [];
      byTerm[g.term].push(g);
    });
    const avg = grades.length
      ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : 0;
    res.json({ reportCard: byTerm, overall: avg, total: grades.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createGrade = async (req, res) => {
  try {
    const grade = new Grade(req.body);
    await grade.save();
    res.status(201).json(grade);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.bulkCreateGrades = async (req, res) => {
  try {
    const grades = await Promise.all(req.body.map(g => new Grade(g).save()));
    res.status(201).json(grades);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    Object.assign(grade, req.body);
    await grade.save();
    res.json(grade);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteGrade = async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grade deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
