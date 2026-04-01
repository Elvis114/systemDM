// teachers.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
r.get('/me',  protect, c.getMyTeacherProfile);
r.get('/',    protect, c.getTeachers);
r.get('/:id', protect, c.getTeacherById);
r.post('/',   protect, adminOnly, c.createTeacher);
r.put('/:id', protect, adminOnly, c.updateTeacher);
r.delete('/:id', protect, adminOnly, c.deleteTeacher);
module.exports = r;
