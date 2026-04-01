import { useEffect, useState } from 'react';
import api from '../services/api';
import ReceiptModal from '../components/ReceiptModal';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  Paid:    { background:'#d1fae5', color:'#065f46' },
  Partial: { background:'#dbeafe', color:'#1e40af' },
  Pending: { background:'#fef9c3', color:'#854d0e' },
  Overdue: { background:'#fee2e2', color:'#991b1b' },
};

export default function PaymentHistory() {
  const [students,  setStudents]  = useState([]);
  const [selected,  setSelected]  = useState('');
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [receipt,   setReceipt]   = useState(null);

  useEffect(() => {
    // Students endpoint returns { students: [...], total, page }
    // so we must read r.data.students — not r.data directly
    api.get('/students', { params: { limit: 200 } })
      .then(r => setStudents(r.data.students || r.data || []))
      .catch(() => toast.error('Failed to load students'));
  }, []);

  const fetchHistory = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/payments/student/${studentId}`);
      setData(data);
    } catch { toast.error('Failed to load payment history'); }
    finally { setLoading(false); }
  };

  const handleSelect = (e) => {
    const val = e.target.value;
    setSelected(val);
    setData(null);
    fetchHistory(val);
  };

  // Find selected student from the array
  const student = students.find(s => s._id === selected);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:'#1e293b' }}>Payment History</h1>
        <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b' }}>View full payment history per student</p>
      </div>

      {/* Student selector */}
      <div style={{ background:'#fff', borderRadius:10, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:24 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>
          Select Student ({students.length} students)
        </label>
        <select value={selected} onChange={handleSelect}
          style={{ width:'100%', maxWidth:400, padding:'10px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }}>
          <option value="">Choose a student...</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign:'center', padding:40, background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize:24, marginBottom:8 }}>⏳</div>
          <div style={{ fontSize:14, color:'#64748b' }}>Loading payment history...</div>
        </div>
      )}

      {/* Student summary */}
      {!loading && data && selected && (
        <>
          {/* Student card */}
          <div style={{ background:'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)', borderRadius:12, padding:'20px 24px', marginBottom:20, color:'#fff' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:20, fontWeight:700 }}>{student?.name || 'Student'}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:2 }}>ID: {student?.studentId}</div>
              </div>
              <div style={{ fontSize:40 }}>🎓</div>
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
            {[
              { label:'Total Billed',    value: data.summary?.totalBilled,  color:'#3b82f6', icon:'💰' },
              { label:'Total Paid',      value: data.summary?.totalPaid,    color:'#10b981', icon:'✅' },
              { label:'Outstanding',     value: data.summary?.totalBalance, color:'#ef4444', icon:'⚠️' },
              { label:'Overdue Records', value: `${data.summary?.overdue || 0} records`, color:'#f59e0b', icon:'📋', isText:true },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', borderRadius:10, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${s.color}` }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize: s.isText ? 16 : 18, fontWeight:700, color:s.color }}>
                  {s.isText ? s.value : `GH₵ ${(s.value || 0).toLocaleString()}`}
                </div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Outstanding balance tracker */}
          {data.summary?.totalBalance > 0 && (
            <div style={{ background:'#fff', borderRadius:10, padding:'16px 20px', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #fca5a5' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>⚠️ Outstanding Balance Tracker</span>
                <span style={{ fontSize:16, fontWeight:700, color:'#ef4444' }}>GH₵ {data.summary.totalBalance?.toLocaleString()}</span>
              </div>
              <div style={{ background:'#f1f5f9', borderRadius:6, height:10, overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:6,
                  width: `${Math.min(((data.summary.totalPaid || 0) / (data.summary.totalBilled || 1)) * 100, 100)}%`,
                  background:'linear-gradient(to right, #10b981, #3b82f6)',
                  transition:'width 0.5s ease',
                }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:12, color:'#64748b' }}>
                <span>Paid: GH₵ {data.summary.totalPaid?.toLocaleString()}</span>
                <span>{Math.round(((data.summary.totalPaid || 0) / (data.summary.totalBilled || 1)) * 100)}% settled</span>
                <span>Total: GH₵ {data.summary.totalBilled?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Payment records table */}
          <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1e293b' }}>Payment Records</h3>
              <span style={{ fontSize:12, color:'#64748b' }}>{data.payments?.length || 0} records</span>
            </div>
            {!data.payments || data.payments.length === 0 ? (
              <div style={{ padding:60, textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>💳</div>
                <div style={{ fontSize:15, fontWeight:600, color:'#1e293b' }}>No payment records found</div>
                <div style={{ fontSize:13, color:'#64748b', marginTop:4 }}>This student has no payment history yet</div>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Receipt','Fee Type','Total','Paid','Balance','Method','Term','Date','Status',''].map(h => (
                      <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', whiteSpace:'nowrap', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p, i) => (
                    <tr key={p._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'11px 14px', fontSize:12, fontWeight:700, color:'#3b82f6' }}>{p.receiptNumber}</td>
                      <td style={{ padding:'11px 14px', fontSize:13, color:'#64748b' }}>{p.feeType}</td>
                      <td style={{ padding:'11px 14px', fontSize:13, fontWeight:600 }}>GH₵ {p.totalAmount?.toLocaleString()}</td>
                      <td style={{ padding:'11px 14px', fontSize:13, fontWeight:600, color:'#10b981' }}>GH₵ {p.amountPaid?.toLocaleString()}</td>
                      <td style={{ padding:'11px 14px', fontSize:13, fontWeight:600, color: p.balance > 0 ? '#ef4444' : '#10b981' }}>GH₵ {p.balance?.toLocaleString()}</td>
                      <td style={{ padding:'11px 14px', fontSize:12, color:'#64748b' }}>{p.paymentMethod}</td>
                      <td style={{ padding:'11px 14px', fontSize:12, color:'#64748b' }}>{p.term}</td>
                      <td style={{ padding:'11px 14px', fontSize:12, color:'#64748b', whiteSpace:'nowrap' }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</td>
                      <td style={{ padding:'11px 14px' }}>
                        <span style={{ ...STATUS_STYLE[p.status], padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:600 }}>{p.status}</span>
                      </td>
                      <td style={{ padding:'11px 14px' }}>
                        <button onClick={() => setReceipt(p)} style={{ background:'#f0fdf4', color:'#16a34a', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Empty state — no student selected */}
      {!selected && !loading && (
        <div style={{ textAlign:'center', padding:60, background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>👆</div>
          <div style={{ fontSize:16, fontWeight:600, color:'#1e293b' }}>Select a student above</div>
          <div style={{ fontSize:13, color:'#64748b', marginTop:4 }}>Their full payment history will appear here</div>
        </div>
      )}

      {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
