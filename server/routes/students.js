const express = require('express');
const r = express.Router();
const c = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

r.get('/',                      protect, c.getStudents);
r.get('/:id',                   protect, c.getStudentById);
r.post('/',                     protect, adminOnly, c.createStudent);
r.put('/:id',                   protect, adminOnly, c.updateStudent);
r.delete('/:id',                protect, adminOnly, c.deleteStudent);
r.get('/:id/grades',            protect, c.getStudentGrades);
r.get('/:id/attendance',        protect, c.getStudentAttendance);
r.get('/:id/fees',              protect, c.getStudentFees);

module.exports = r;
