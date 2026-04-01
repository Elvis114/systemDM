require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

// Paystack webhook needs raw body — must be before express.json()
app.use('/api/paystack/webhook', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());

// ── Database ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/students',      require('./routes/students'));
app.use('/api/teachers',      require('./routes/teachers'));
app.use('/api/classes',       require('./routes/classes'));
app.use('/api/subjects',      require('./routes/subjects'));
app.use('/api/grades',        require('./routes/grades'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/fees',          require('./routes/fees'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/paystack',      require('./routes/paystack'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/announcements', require('./routes/announcements'));

// ── Global error handler ──────────────────────────────────────
app.use(require('./middleware/errorHandler'));

app.get('/', (req, res) => res.json({ message: '🏫 SchoolMS API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
