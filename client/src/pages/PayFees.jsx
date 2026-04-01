import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Spinner, Field, inputStyle } from '../components/UI';

const METHOD_CONFIG = [
  {
    id: 'Online - MTN Mobile Money',
    label: 'MTN Mobile Money',
    icon: '📱',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fcd34d',
    needsPhone: true,
    placeholder: '024XXXXXXX',
  },
  {
    id: 'Online - Telecel Cash',
    label: 'Telecel Cash',
    icon: '📲',
    color: '#ef4444',
    bg: '#fff5f5',
    border: '#fca5a5',
    needsPhone: true,
    placeholder: '020XXXXXXX',
  },
  {
    id: 'Online - AirtelTigo Money',
    label: 'AirtelTigo Money',
    icon: '💬',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    needsPhone: true,
    placeholder: '026XXXXXXX or 057XXXXXXX',
  },
  {
    id: 'Online - Card',
    label: 'Card (Visa / Mastercard)',
    icon: '💳',
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    needsPhone: false,
  },
];

const FEE_TYPES = ['Tuition','Books','Uniform','Transport','Exam','Feeding','Other'];
const TERMS     = ['Term 1','Term 2','Term 3'];

export default function PayFees() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [students,  setStudents]  = useState([]);
  const [pending,   setPending]   = useState([]);
  const [step,      setStep]      = useState(1); // 1=select student+fee, 2=choose method, 3=confirm
  const [loading,   setLoading]   = useState(false);
  const [paying,    setPaying]    = useState(false);

  const [form, setForm] = useState({
    studentId:     '',
    feeType:       'Tuition',
    totalAmount:   '',
    amountPaid:    '',
    term:          'Term 1',
    academicYear:  '2024/2025',
    dueDate:       '',
    email:         user?.email || '',
    paymentMethod: '',
    momoNumber:    '',
  });

  // Load students
  useEffect(() => {
    api.get('/students', { params: { limit: 200 } })
      .then(r => setStudents(r.data.students || r.data || []))
      .catch(() => toast.error('Failed to load students'));
  }, []);

  // Load pending fees when student is selected
  useEffect(() => {
    if (form.studentId) {
      api.get(`/paystack/pending/${form.studentId}`)
        .then(r => setPending(r.data || []))
        .catch(() => setPending([]));
    } else {
      setPending([]);
    }
  }, [form.studentId]);

  const selectedMethod = METHOD_CONFIG.find(m => m.id === form.paymentMethod);
  const selectedStudent = students.find(s => s._id === form.studentId);

  const set = (field) => ({
    value: form[field] || '',
    onChange: e => setForm(f => ({ ...f, [field]: e.target.value })),
    style: inputStyle,
  });

  const fillFromPending = (fee) => {
    setForm(f => ({
      ...f,
      feeType:      fee.feeType,
      totalAmount:  fee.amount,
      amountPaid:   fee.balance,  // suggest paying outstanding balance
      term:         fee.term,
      academicYear: fee.academicYear,
      dueDate:      fee.dueDate?.split('T')[0] || '',
    }));
    toast.success(`Filled in details for ${fee.feeType}`);
  };

  const handlePay = async () => {
    if (!form.studentId)     return toast.error('Select a student');
    if (!form.feeType)       return toast.error('Select fee type');
    if (!form.totalAmount)   return toast.error('Enter total amount');
    if (!form.amountPaid)    return toast.error('Enter amount to pay');
    if (!form.dueDate)       return toast.error('Enter due date');
    if (!form.paymentMethod) return toast.error('Select payment method');
    if (!form.email)         return toast.error('Enter email for receipt');
    if (selectedMethod?.needsPhone && !form.momoNumber)
      return toast.error('Enter your MoMo phone number');

    setPaying(true);
    try {
      const { data } = await api.post('/paystack/initialize', form);
      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start payment');
      setPaying(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#1e293b' }}>💳 Pay School Fees</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          Pay online securely using MoMo or Card — powered by Paystack
        </p>
      </div>

      {/* Step 1 — Select Student & Fee */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>1</div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Student & Fee Details</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Student" required>
              <select required {...set('studentId')} style={inputStyle}>
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Pending fees shortcut */}
          {pending.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Outstanding Fees — click to auto-fill
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {pending.map(fee => (
                  <button key={fee._id} onClick={() => fillFromPending(fee)} style={{
                    padding: '7px 14px', borderRadius: 8, border: '1px solid #fca5a5',
                    background: '#fff5f5', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: '#dc2626', display: 'flex', gap: 6, alignItems: 'center',
                  }}>
                    <span>⚠️</span>
                    <span>{fee.feeType}</span>
                    <span style={{ background: '#dc2626', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 11 }}>
                      GH₵ {fee.balance?.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Field label="Fee Type" required>
            <select required {...set('feeType')} style={inputStyle}>
              {FEE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Term" required>
            <select required {...set('term')} style={inputStyle}>
              {TERMS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Total Fee Amount (GH₵)" required>
            <input required type="number" min="1" placeholder="e.g. 800" {...set('totalAmount')} />
          </Field>

          <Field label="Amount to Pay Now (GH₵)" required>
            <input required type="number" min="1" placeholder="e.g. 800" {...set('amountPaid')} />
          </Field>

          <Field label="Academic Year">
            <input {...set('academicYear')} />
          </Field>

          <Field label="Due Date" required>
            <input required type="date" {...set('dueDate')} />
          </Field>

          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Email for Receipt" required>
              <input required type="email" placeholder="parent@email.com" {...set('email')} />
            </Field>
          </div>
        </div>
      </div>

      {/* Step 2 — Choose Payment Method */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>2</div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Choose Payment Method</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {METHOD_CONFIG.map(m => (
            <button key={m.id} type="button"
              onClick={() => setForm(f => ({ ...f, paymentMethod: m.id, momoNumber: '' }))}
              style={{
                padding: '16px', border: `2px solid ${form.paymentMethod === m.id ? m.color : '#e2e8f0'}`,
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                background: form.paymentMethod === m.id ? m.bg : '#fff',
                transition: 'all 0.15s',
              }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: form.paymentMethod === m.id ? m.color : '#1e293b' }}>{m.label}</div>
              {form.paymentMethod === m.id && (
                <div style={{ fontSize: 11, color: m.color, marginTop: 2, fontWeight: 600 }}>✓ Selected</div>
              )}
            </button>
          ))}
        </div>

        {/* MoMo number field */}
        {selectedMethod?.needsPhone && (
          <div style={{ marginTop: 16, padding: 16, background: selectedMethod.bg, borderRadius: 8, border: `1px solid ${selectedMethod.border}` }}>
            <Field label={`${selectedMethod.label} Number`} required>
              <input
                required
                type="tel"
                placeholder={selectedMethod.placeholder}
                value={form.momoNumber}
                onChange={e => setForm(f => ({ ...f, momoNumber: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>
              📌 You will receive a prompt on this number to approve the payment
            </p>
          </div>
        )}

        {form.paymentMethod === 'Online - Card' && (
          <div style={{ marginTop: 16, padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#1d4ed8' }}>
              💳 You will be redirected to a secure Paystack page to enter your card details. Visa and Mastercard accepted.
            </p>
          </div>
        )}
      </div>

      {/* Step 3 — Summary & Pay */}
      {form.studentId && form.amountPaid && form.paymentMethod && (
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1d4ed8 100%)', borderRadius: 12, padding: 24, marginBottom: 20, color: '#fff' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📋 Payment Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              ['Student',       selectedStudent?.name || '—'],
              ['Fee Type',      form.feeType],
              ['Term',          form.term],
              ['Academic Year', form.academicYear],
              ['Total Fee',     `GH₵ ${parseFloat(form.totalAmount || 0).toLocaleString()}`],
              ['Paying Now',    `GH₵ ${parseFloat(form.amountPaid || 0).toLocaleString()}`],
              ['Method',        selectedMethod?.label || '—'],
              ['Receipt to',    form.email],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          <button onClick={handlePay} disabled={paying} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: paying ? 'rgba(255,255,255,0.3)' : '#fff',
            color: paying ? '#fff' : '#1d4ed8',
            fontSize: 15, fontWeight: 800, cursor: paying ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {paying ? (
              <>⏳ Redirecting to Paystack...</>
            ) : (
              <>🔒 Pay GH₵ {parseFloat(form.amountPaid || 0).toLocaleString()} Securely</>
            )}
          </button>
          <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            Secured by Paystack · 256-bit SSL encryption
          </p>
        </div>
      )}

      {/* Paystack badge */}
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          🔒 Payments processed securely by{' '}
          <a href="https://paystack.com" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: 600 }}>
            Paystack
          </a>
        </div>
      </div>
    </div>
  );
}
