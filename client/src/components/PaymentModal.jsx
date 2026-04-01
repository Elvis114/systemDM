import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const EMPTY = {
  studentId: '', feeType: 'Tuition', totalAmount: '',
  amountPaid: '', paymentMethod: 'School Fees',
  term: 'Term 1', academicYear: '2024/2025',
  dueDate: '', paymentDate: '', notes: '',
  momoNumber: '', momoTransactionId: '',
  bankName: '', bankTransactionId: '', accountNumber: '',
};

export default function PaymentModal({ editing, students, onClose, onSave }) {
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (editing) {
      setForm({
        ...EMPTY, ...editing,
        studentId:  editing.studentId?._id || editing.studentId || '',
        paymentDate: editing.paymentDate ? editing.paymentDate.split('T')[0] : '',
        dueDate:     editing.dueDate     ? editing.dueDate.split('T')[0]     : '',
      });
    }
  }, [editing]);

  useEffect(() => {
    const bal = (parseFloat(form.totalAmount) || 0) - (parseFloat(form.amountPaid) || 0);
    setBalance(bal >= 0 ? bal : 0);
  }, [form.totalAmount, form.amountPaid]);

  const set = (field) => ({
    value: form[field] || '',
    onChange: e => setForm({ ...form, [field]: e.target.value }),
  });

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
    borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#374151', marginBottom: 5,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/payments/${editing._id}`, form);
        toast.success('Payment updated!');
      } else {
        await api.post('/payments', form);
        toast.success('Payment recorded!');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving payment');
    } finally {
      setSaving(false);
    }
  };

  const getStatus = () => {
    const total = parseFloat(form.totalAmount) || 0;
    const paid  = parseFloat(form.amountPaid)  || 0;
    const due   = form.dueDate ? new Date(form.dueDate) : null;
    if (paid >= total && total > 0) return { label: 'Paid', color: '#10b981' };
    if (paid > 0)                   return { label: 'Partial', color: '#3b82f6' };
    if (due && new Date() > due)    return { label: 'Overdue', color: '#ef4444' };
    return                                 { label: 'Pending', color: '#f59e0b' };
  };

  const status = getStatus();

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:620, maxHeight:'92vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
        
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', borderRadius:'14px 14px 0 0' }}>
          <div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#1e293b' }}>
              {editing ? '✏️ Edit Payment' : '💳 Record Payment'}
            </h2>
            <p style={{ margin:'3px 0 0', fontSize:12, color:'#64748b' }}>
              {editing ? `Receipt: ${editing.receiptNumber}` : 'Fill in payment details below'}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#64748b' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:24 }}>

          {/* Student + Fee Type */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={labelStyle}>Student *</label>
              <select required {...set('studentId')} style={inputStyle}>
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fee Type *</label>
              <select required {...set('feeType')} style={inputStyle}>
                {['Tuition','Books','Uniform','Transport','Exam','Feeding','Other'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amounts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={labelStyle}>Total Amount (GH₵) *</label>
              <input required type="number" min="0" placeholder="0.00" {...set('totalAmount')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Amount Paid (GH₵) *</label>
              <input required type="number" min="0" placeholder="0.00" {...set('amountPaid')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Balance</label>
              <div style={{ padding:'9px 12px', background: balance > 0 ? '#fee2e2' : '#d1fae5', borderRadius:7, fontSize:14, fontWeight:700, color: balance > 0 ? '#991b1b' : '#065f46' }}>
                GH₵ {balance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div style={{ marginBottom:16, padding:'10px 14px', background:'#f8fafc', borderRadius:8, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:12, color:'#64748b' }}>Auto-calculated status:</span>
            <span style={{ background: status.color + '20', color: status.color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>{status.label}</span>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom:14 }}>
            <label style={labelStyle}>Payment Method *</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[
                { value:'School Fees',      icon:'🏫', label:'School Fees'      },
                { value:'MTN Mobile Money', icon:'📱', label:'MTN MoMo'         },
                { value:'Bank Transfer',    icon:'🏦', label:'Bank Transfer'    },
              ].map(m => (
                <button key={m.value} type="button"
                  onClick={() => setForm({ ...form, paymentMethod: m.value })}
                  style={{
                    padding:'12px 8px', border:`2px solid ${form.paymentMethod === m.value ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius:8, cursor:'pointer', background: form.paymentMethod === m.value ? '#eff6ff' : '#fff',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  }}>
                  <span style={{ fontSize:22 }}>{m.icon}</span>
                  <span style={{ fontSize:11, fontWeight:600, color: form.paymentMethod === m.value ? '#3b82f6' : '#64748b' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MTN Mobile Money fields */}
          {form.paymentMethod === 'MTN Mobile Money' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14, padding:14, background:'#fffbeb', borderRadius:8, border:'1px solid #fcd34d' }}>
              <div style={{ gridColumn:'1/-1', fontSize:12, fontWeight:600, color:'#92400e', marginBottom:2 }}>📱 MTN Mobile Money Details</div>
              <div>
                <label style={labelStyle}>MoMo Number *</label>
                <input placeholder="024XXXXXXX" {...set('momoNumber')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Transaction ID</label>
                <input placeholder="e.g. MTN123456789" {...set('momoTransactionId')} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Bank Transfer fields */}
          {form.paymentMethod === 'Bank Transfer' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14, padding:14, background:'#f0f9ff', borderRadius:8, border:'1px solid #7dd3fc' }}>
              <div style={{ gridColumn:'1/-1', fontSize:12, fontWeight:600, color:'#075985', marginBottom:2 }}>🏦 Bank Transfer Details</div>
              <div>
                <label style={labelStyle}>Bank Name *</label>
                <select {...set('bankName')} style={inputStyle}>
                  <option value="">Select Bank</option>
                  {['GCB Bank','Ecobank','Fidelity Bank','Absa Bank','Stanbic Bank','Access Bank','Zenith Bank','UBA Ghana','CalBank','Republic Bank'].map(b => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Account Number</label>
                <input placeholder="e.g. 1234567890" {...set('accountNumber')} style={inputStyle} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Bank Transaction ID</label>
                <input placeholder="e.g. TXN20240512XXXXX" {...set('bankTransactionId')} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Term, Year, Dates */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={labelStyle}>Term *</label>
              <select required {...set('term')} style={inputStyle}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Academic Year</label>
              <input {...set('academicYear')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Due Date *</label>
              <input required type="date" {...set('dueDate')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Payment Date</label>
              <input type="date" {...set('paymentDate')} style={inputStyle} />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom:20 }}>
            <label style={labelStyle}>Notes</label>
            <textarea rows={2} placeholder="Additional notes..." {...set('notes')}
              style={{ ...inputStyle, resize:'vertical' }} />
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding:'10px 22px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500 }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding:'10px 22px', background: saving ? '#93c5fd' : '#3b82f6', color:'#fff', border:'none', borderRadius:8, cursor: saving ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600 }}>
              {saving ? 'Saving...' : editing ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
