const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access only' });
};

const teacherOrAdmin = (req, res, next) => {
  if (['admin','teacher'].includes(req.user?.role)) return next();
  res.status(403).json({ message: 'Teacher or Admin access only' });
};

module.exports = { adminOnly, teacherOrAdmin };
