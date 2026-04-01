require('dotenv').config();
const mongoose     = require('mongoose');
const User         = require('./models/User');
const Student      = require('./models/Student');
const Teacher      = require('./models/Teacher');
const Class        = require('./models/Class');
const Subject      = require('./models/Subject');
const Grade        = require('./models/Grade');
const Attendance   = require('./models/Attendance');
const Fee          = require('./models/Fee');
const Event        = require('./models/Event');
const Announcement = require('./models/Announcement');

const ghanaianNames = [
  'Kwesi Mensah','Akua Boateng','Kofi Asante','Ama Darko','Yaw Owusu',
  'Abena Frimpong','Kojo Appiah','Efua Tetteh','Nana Agyei','Serwa Antwi',
  'Fiifi Quaye','Adwoa Sarpong','Kwabena Ampong','Akosua Nyarko','Kweku Opoku',
  'Maame Asare','Bright Amoah','Gifty Larbi','Prince Danso','Grace Ofori',
  'Osei Bonsu','Ama Kyei','Kwame Badu','Adwoa Poku','Yaw Anane',
  'Akosua Amoah','Kojo Mensah','Efua Boateng','Nana Darko','Serwa Owusu',
];

const addresses = ['Accra','Kumasi','Takoradi','Tamale','Cape Coast','Sunyani','Koforidua','Ho'];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany(), Student.deleteMany(), Teacher.deleteMany(),
    Class.deleteMany(), Subject.deleteMany(), Grade.deleteMany(),
    Attendance.deleteMany(), Fee.deleteMany(), Event.deleteMany(),
    Announcement.deleteMany(),
  ]);
  console.log('🧹 Cleared all collections');

  // ── Users ──────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'Admin User', email: 'admin@school.com',
    password: 'admin123', role: 'admin',
  });

  const teacherUsers = await User.insertMany([
    { name: 'Mr. Kofi Mensah',  email: 'teacher1@school.com', password: 'teacher123', role: 'teacher' },
    { name: 'Mrs. Ama Adjei',   email: 'teacher2@school.com', password: 'teacher123', role: 'teacher' },
    { name: 'Mr. Kwame Asante', email: 'teacher3@school.com', password: 'teacher123', role: 'teacher' },
    { name: 'Mrs. Abena Osei',  email: 'teacher4@school.com', password: 'teacher123', role: 'teacher' },
    { name: 'Mr. Yaw Boateng',  email: 'teacher5@school.com', password: 'teacher123', role: 'teacher' },
  ]);

  // ── Teachers ───────────────────────────────────────────────
  const teacherData = [
    { name:'Mr. Kofi Mensah',  employeeId:'EMP-001', subjects:['Mathematics','Statistics'],  email:'teacher1@school.com', phone:'0244001001', qualification:'BSc Mathematics',    experience:8,  salary:4500, department:'Sciences',     userId: teacherUsers[0]._id },
    { name:'Mrs. Ama Adjei',   employeeId:'EMP-002', subjects:['English Language','French'], email:'teacher2@school.com', phone:'0244001002', qualification:'BA English',          experience:6,  salary:4200, department:'Languages',    userId: teacherUsers[1]._id },
    { name:'Mr. Kwame Asante', employeeId:'EMP-003', subjects:['Science','Biology'],         email:'teacher3@school.com', phone:'0244001003', qualification:'BSc Science',         experience:10, salary:4800, department:'Sciences',     userId: teacherUsers[2]._id },
    { name:'Mrs. Abena Osei',  employeeId:'EMP-004', subjects:['Social Studies','History'],  email:'teacher4@school.com', phone:'0244001004', qualification:'BA Social Studies',   experience:5,  salary:4000, department:'Humanities',   userId: teacherUsers[3]._id },
    { name:'Mr. Yaw Boateng',  employeeId:'EMP-005', subjects:['ICT','Computing'],           email:'teacher5@school.com', phone:'0244001005', qualification:'BSc Computer Science',experience:7,  salary:4600, department:'Technology',   userId: teacherUsers[4]._id },
  ];
  // Use create() one by one so pre-save hooks fire (auto-generate IDs)
  const teachers = [];
  for (const t of teacherData) { teachers.push(await Teacher.create(t)); }

  // ── Classes ────────────────────────────────────────────────
  const classData = [
    { name:'Grade 1A', section:'A', classTeacherId: teachers[0]._id, academicYear:'2024/2025', capacity:40, room:'Room 101' },
    { name:'Grade 2B', section:'B', classTeacherId: teachers[1]._id, academicYear:'2024/2025', capacity:40, room:'Room 202' },
    { name:'Grade 3C', section:'C', classTeacherId: teachers[2]._id, academicYear:'2024/2025', capacity:40, room:'Room 303' },
    { name:'Grade 4D', section:'D', classTeacherId: teachers[3]._id, academicYear:'2024/2025', capacity:40, room:'Room 404' },
  ];
  const classes = await Class.insertMany(classData);

  // ── Subjects ───────────────────────────────────────────────
  const subjectNames = ['Mathematics','English Language','Science','Social Studies','ICT','French'];
  const subjectDocs  = [];
  for (const cls of classes) {
    for (let i = 0; i < subjectNames.length; i++) {
      subjectDocs.push({
        name: subjectNames[i],
        code: `${cls.name.replace(/\s/g,'')}-${subjectNames[i].replace(/\s/g,'').toUpperCase().slice(0,4)}-${Math.floor(Math.random()*900+100)}`,
        classId:   cls._id,
        teacherId: teachers[i % teachers.length]._id,
        totalMarks: 100, passingMarks: 50,
      });
    }
  }
  const subjects = await Subject.insertMany(subjectDocs);

  // Update classes with their subjects
  for (const cls of classes) {
    const clsSubjects = subjects.filter(s => s.classId.toString() === cls._id.toString());
    await Class.findByIdAndUpdate(cls._id, { subjects: clsSubjects.map(s => s._id) });
  }

  // ── Students (30 Ghanaian students) ───────────────────────
  const genders    = ['Male','Female'];
  const relations  = ['Father','Mother','Uncle','Aunt','Guardian'];
  const studentDocs = ghanaianNames.map((name, i) => ({
    name,
    classId:          classes[i % 4]._id,
    age:              6 + (i % 4),
    dateOfBirth:      new Date(2016 - (i % 4), i % 12, 1 + (i % 28)),
    gender:           genders[i % 2],
    email:            `student${i+1}@school.com`,
    phone:            `020${String(4000001 + i)}`,
    address:          addresses[i % addresses.length],
    nationality:      'Ghanaian',
    guardianName:     `Mr/Mrs ${name.split(' ')[1]}`,
    guardianPhone:    `024${String(4000001 + i)}`,
    guardianEmail:    `guardian${i+1}@email.com`,
    guardianRelation: relations[i % relations.length],
    status:           'Active',
  }));
  // Use create() one by one so pre-save hooks fire (auto-generate studentId)
  const students = [];
  for (const s of studentDocs) { students.push(await Student.create(s)); }

  // Update classes with student lists
  for (const cls of classes) {
    const clsStudents = students.filter(s => s.classId.toString() === cls._id.toString());
    await Class.findByIdAndUpdate(cls._id, { students: clsStudents.map(s => s._id) });
  }

  // ── Grades ─────────────────────────────────────────────────
  const terms    = ['Term 1','Term 2'];
  const gradeDocs = [];
  for (const student of students) {
    const clsSubjects = subjects.filter(s => s.classId.toString() === student.classId.toString());
    for (const term of terms) {
      for (const subject of clsSubjects) {
        const score = Math.floor(Math.random() * 41) + 60;
        gradeDocs.push({
          studentId:    student._id,
          subjectId:    subject._id,
          classId:      student.classId,
          score,
          totalMarks:   100,
          term,
          academicYear: '2024/2025',
          teacherId:    subject.teacherId,
          remarks:      score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : 'Satisfactory',
        });
      }
    }
  }
  // Save grades one by one to trigger pre-save hooks
  for (const gd of gradeDocs) { const g = new Grade(gd); await g.save(); }
  console.log(`📊 ${gradeDocs.length} grade records created`);

  // ── Attendance (last 30 days) ──────────────────────────────
  const attendanceDocs = [];
  const today = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
    for (const student of students) {
      const rand = Math.random();
      attendanceDocs.push({
        studentId: student._id,
        classId:   student.classId,
        date,
        status:    rand > 0.88 ? 'Absent' : rand > 0.80 ? 'Late' : rand > 0.75 ? 'Excused' : 'Present',
        markedBy:  adminUser._id,
      });
    }
  }
  await Attendance.insertMany(attendanceDocs);
  console.log(`📅 ${attendanceDocs.length} attendance records created`);

  // ── Fees ───────────────────────────────────────────────────
  const feeTypes   = ['Tuition','Books','Uniform','Exam','Feeding'];
  const feeDocs    = [];
  for (const student of students) {
    for (const term of terms) {
      for (const feeType of feeTypes) {
        const amount = feeType === 'Tuition' ? 800 : feeType === 'Feeding' ? 400 : 150;
        const rand   = Math.random();
        const paid   = rand > 0.3 ? amount : rand > 0.15 ? Math.floor(amount / 2) : 0;
        feeDocs.push({
          studentId:     student._id,
          feeType,
          amount,
          amountPaid:    paid,
          dueDate:       new Date(2025, term === 'Term 1' ? 1 : 4, 28),
          paymentDate:   paid > 0 ? new Date() : null,
          paymentMethod: ['Cash','Mobile Money','Bank Transfer'][Math.floor(Math.random()*3)],
          term,
          academicYear:  '2024/2025',
        });
      }
    }
  }
  for (const fd of feeDocs) { const f = new Fee(fd); await f.save(); }
  console.log(`💰 ${feeDocs.length} fee records created`);

  // ── Events ─────────────────────────────────────────────────
  await Event.insertMany([
    { title:'End of Term Exams',      description:'Final examinations for all classes',        date: new Date(2025,4,5),  endDate: new Date(2025,4,16), location:'All Classrooms',    type:'Academic', createdBy: adminUser._id },
    { title:'Inter-School Sports Day',description:'Annual inter-school athletics competition', date: new Date(2025,4,24), location:'School Sports Field', type:'Sports',   createdBy: adminUser._id },
    { title:'Cultural Festival',      description:'Celebrate Ghanaian culture and heritage',   date: new Date(2025,5,6),  location:'School Auditorium',  type:'Cultural', createdBy: adminUser._id },
    { title:'PTA Meeting',            description:'Parents and Teachers Association meeting',   date: new Date(2025,4,17), location:'School Hall',        type:'Meeting',  createdBy: adminUser._id },
    { title:'Speech & Prize Giving',  description:'Annual speech and prize giving ceremony',   date: new Date(2025,6,12), location:'Main Hall',          type:'Academic', createdBy: adminUser._id },
  ]);

  // ── Announcements ──────────────────────────────────────────
  await Announcement.insertMany([
    { title:'Term 2 Begins',       content:'Term 2 resumes on Monday 14th April 2025. All students should report by 7:30am.',                              priority:'High',   targetRole:'all',     createdBy: adminUser._id, isActive: true, expiryDate: new Date(2025,3,14) },
    { title:'Staff Meeting',       content:'There will be a mandatory staff meeting on Friday at 3pm in the conference room.',                              priority:'Urgent', targetRole:'teacher', createdBy: adminUser._id, isActive: true, expiryDate: new Date(2025,4,30) },
    { title:'Fee Payment Reminder',content:'All outstanding fees for Term 1 must be cleared by end of April. Contact the bursar for payment plans.',       priority:'High',   targetRole:'student', createdBy: adminUser._id, isActive: true, expiryDate: new Date(2025,3,30) },
  ]);

  console.log('\n🌱 ═══════════════════════════════════');
  console.log('   Seed completed successfully!');
  console.log('═══════════════════════════════════');
  console.log('👤  Admin    → admin@school.com    / admin123');
  console.log('👩‍🏫  Teachers → teacher1@school.com / teacher123');
  console.log('🎓  Students → student1@school.com / student123');
  console.log('📊  Classes:',  classes.length);
  console.log('👥  Students:', students.length);
  console.log('═══════════════════════════════════\n');
  mongoose.connection.close();
};

seed().catch(err => { console.error('❌ Seed error:', err); mongoose.connection.close(); });
