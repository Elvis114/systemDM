const axios   = require('axios');
const Payment = require('../models/Payment');
const Fee     = require('../models/Fee');
const Student = require('../models/Student');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE   = 'https://api.paystack.co';

// ── Initialize a Paystack transaction ────────────────────────
// Called when student/parent clicks "Pay Now"
exports.initializePayment = async (req, res) => {
  try {
    const {
      studentId, feeType, totalAmount, amountPaid,
      term, academicYear, dueDate,
      paymentMethod, momoNumber, email,
    } = req.body;

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ message: 'Paystack secret key not configured in .env' });
    }

    // Get student info
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const payerEmail = email || student.email || req.user?.email;
    if (!payerEmail) return res.status(400).json({ message: 'Email is required for online payment' });

    // Paystack expects amount in kobo/pesewas (multiply by 100)
    const amountInPesewas = Math.round(parseFloat(amountPaid) * 100);

    // Map payment method to Paystack channel
    const channelMap = {
      'Online - MTN Mobile Money':    ['mobile_money'],
      'Online - Telecel Cash':        ['mobile_money'],
      'Online - AirtelTigo Money':    ['mobile_money'],
      'Online - Card':                ['card'],
    };
    const channels = channelMap[paymentMethod] || ['card', 'mobile_money'];

    // MoMo provider map for Ghana
    const momoProviderMap = {
      'Online - MTN Mobile Money':  'mtn',
      'Online - Telecel Cash':      'vod',
      'Online - AirtelTigo Money':  'tgo',
    };
    const momoProvider = momoProviderMap[paymentMethod];

    // Build metadata to pass through to webhook/verification
    const metadata = {
      studentId:    studentId.toString(),
      studentName:  student.name,
      studentCode:  student.studentId,
      feeType,
      totalAmount,
      amountPaid,
      term,
      academicYear,
      dueDate,
      paymentMethod,
      momoNumber:   momoNumber || '',
      cancel_action: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay-fees`,
    };

    // Build Paystack payload
    const payload = {
      email:    payerEmail,
      amount:   amountInPesewas,
      currency: 'GHS',
      channels,
      metadata,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success`,
    };

    // Add MoMo details if applicable
    if (momoProvider && momoNumber) {
      payload.mobile_money = {
        phone:    momoNumber,
        provider: momoProvider,
      };
    }

    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      payload,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    );

    const { authorization_url, reference } = response.data.data;

    res.json({ authorizationUrl: authorization_url, reference, message: 'Payment initialized' });

  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || 'Failed to initialize payment' });
  }
};

// ── Verify a Paystack transaction after redirect ─────────────
// Called after student returns from Paystack payment page
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ message: 'Paystack secret key not configured' });
    }

    // Verify with Paystack API
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const txn = response.data.data;

    if (txn.status !== 'success') {
      return res.status(400).json({ message: `Payment not successful. Status: ${txn.status}` });
    }

    const meta = txn.metadata || {};

    // Check if payment already recorded (prevent duplicates)
    const existing = await Payment.findOne({ paystackReference: reference });
    if (existing) {
      return res.json({ message: 'Payment already recorded', payment: existing });
    }

    // Create the payment record
    const amountPaid  = parseFloat(meta.amountPaid  || txn.amount / 100);
    const totalAmount = parseFloat(meta.totalAmount || amountPaid);
    const dueDate     = meta.dueDate ? new Date(meta.dueDate) : new Date(Date.now() + 30*24*60*60*1000);

    const payment = new Payment({
      studentId:         meta.studentId,
      feeType:           meta.feeType        || 'Tuition',
      totalAmount,
      amountPaid,
      paymentMethod:     meta.paymentMethod  || 'Online - Card',
      momoNumber:        meta.momoNumber     || '',
      momoTransactionId: reference,
      term:              meta.term           || 'Term 1',
      academicYear:      meta.academicYear   || '2024/2025',
      dueDate,
      paymentDate:       new Date(),
      paystackReference: reference,
      paystackStatus:    txn.status,
      onlinePayment:     true,
      paidByEmail:       txn.customer?.email || '',
      notes:             `Online payment via Paystack. Channel: ${txn.channel}`,
      recordedBy:        req.user?._id,
    });

    await payment.save();
    await payment.populate('studentId', 'name studentId');

    res.json({ message: 'Payment verified and recorded successfully!', payment });

  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || 'Verification failed' });
  }
};

// ── Paystack Webhook ─────────────────────────────────────────
// Paystack calls this automatically when payment completes
exports.paystackWebhook = async (req, res) => {
  try {
    const crypto = require('crypto');
    const hash   = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // Verify signature
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const existing = await Payment.findOne({ paystackReference: data.reference });
      if (!existing) {
        const meta      = data.metadata || {};
        const amountPaid  = parseFloat(meta.amountPaid  || data.amount / 100);
        const totalAmount = parseFloat(meta.totalAmount || amountPaid);
        const dueDate     = meta.dueDate ? new Date(meta.dueDate) : new Date(Date.now() + 30*24*60*60*1000);

        const payment = new Payment({
          studentId:         meta.studentId,
          feeType:           meta.feeType       || 'Tuition',
          totalAmount,
          amountPaid,
          paymentMethod:     meta.paymentMethod || 'Online - Card',
          momoNumber:        meta.momoNumber    || '',
          momoTransactionId: data.reference,
          term:              meta.term          || 'Term 1',
          academicYear:      meta.academicYear  || '2024/2025',
          dueDate,
          paymentDate:       new Date(),
          paystackReference: data.reference,
          paystackStatus:    data.status,
          onlinePayment:     true,
          paidByEmail:       data.customer?.email || '',
          notes:             `Webhook: Online payment. Channel: ${data.channel}`,
        });
        await payment.save();
        console.log('✅ Webhook payment recorded:', data.reference);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.sendStatus(500);
  }
};

// ── Get pending fees for a student ───────────────────────────
exports.getStudentPendingFees = async (req, res) => {
  try {
    const fees = await Fee.find({
      studentId: req.params.studentId,
      status: { $in: ['Pending', 'Overdue', 'Partial'] },
    }).sort({ dueDate: 1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
