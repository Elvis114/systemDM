import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';

const STATUS_STYLE = {
  Paid:    { background: '#d1fae5', color: '#065f46' },
  Partial: { background: '#dbeafe', color: '#1e40af' },
  Pending: { background: '#fef9c3', color: '#854d0e' },
  Overdue: { background: '#fee2e2', color: '#991b1b' },
};

const METHOD_ICON = {
  'School Fees':      '🏫',
  'MTN Mobile Money': '📱',
  'Bank Transfer':    '🏦',
};

export default function Payments() {
  const [payments,  setPayments]  = useState([]);
  const [students,  setStudents]  = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [receipt,   setReceipt]   = useState(null);
  const [editing,   setEditing]   = useState(null);
  const [filter,    setFilter]    = useState({ status:'', term:'', paymentMethod:'', search:'' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status)        params.status        = filter.status;
      if (filter.term)          params.term          = filter.term;
      if (filter.paymentMethod) params.paymentMethod = filter.paymentMethod;
      if (filter.search)        params.search        = filter.search;

      const [p, s, sum] = await Promise.all([
        api.get('/payments', { params }),
        api.get('/students'),
        api.get('/payments/summary', { params: { term: filter.term } }),
      ]);
      setPayments(p.data);
      setStudents(s.data);
      setSummary(sum.data);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filter]);

  const openAdd  = () => { setEditing(null); setModal(true); };
  const openEdit = (p) => { setEditing(p); setModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const sel = (field) => ({
    value: filter[field],
    onChange: e => setFilter({ ...filter, [field]: e.target.value }),
    style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, background: '#fff' },
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:'#1e293b' }}>Payments</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b' }}>Manage school fee payments and transactions</p>
        </div>
        <button onClick={openAdd} style={{ background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          + Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:24 }}>
          {[
            { label:'Total Billed',    value: summary.totalBilled,     color:'#3b82f6', icon:'💰' },
            { label:'Total Collected', value: summary.totalCollected,  color:'#10b981', icon:'✅' },
            { label:'Pending',         value: summary.totalPending,    color:'#f59e0b', icon:'⏳' },
            { label:'Overdue',         value: summary.totalOverdue,    color:'#ef4444', icon:'⚠️' },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', borderRadius:10, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${s.color}` }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:20, fontWeight:700, color:s.color }}>GH₵ {s.value?.toLocaleString()}</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Method Breakdown */}
      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
          {Object.entries(summary.byMethod || {}).map(([method, amount]) => (
            <div key={method} style={{ background:'#fff', borderRadius:10, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:28 }}>{METHOD_ICON[method]}</span>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'#1e293b' }}>GH₵ {amount?.toLocaleString()}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>{method}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', background:'#fff', padding:16, borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <input
          placeholder="🔍  Search student or receipt..."
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          style={{ flex:1, minWidth:200, padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13 }}
        />
        <select {...sel('status')}>
          <option value="">All Statuses</option>
          <option>Paid</option><option>Partial</option>
          <option>Pending</option><option>Overdue</option>
        </select>
        <select {...sel('term')}>
          <option value="">All Terms</option>
          <option>Term 1</option><option>Term 2</option><option>Term 3</option>
        </select>
        <select {...sel('paymentMethod')}>
          <option value="">All Methods</option>
          <option>School Fees</option>
          <option>MTN Mobile Money</option>
          <option>Bank Transfer</option>
        </select>
        <button onClick={() => setFilter({ status:'', term:'', paymentMethod:'', search:'' })}
          style={{ padding:'8px 14px', background:'#f1f5f9', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:60, textAlign:'center', color:'#64748b' }}>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>💳</div>
            <div style={{ fontSize:16, fontWeight:600, color:'#1e293b' }}>No payments found</div>
            <div style={{ fontSize:13, color:'#64748b', marginTop:4 }}>Try adjusting your filters</div>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Receipt No','Student','Fee Type','Total','Paid','Balance','Method','Term','Due Date','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'12px 14px', fontSize:12, fontWeight:700, color:'#3b82f6', whiteSpace:'nowrap' }}>{p.receiptNumber}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{p.studentId?.name}</div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{p.studentId?.studentId}</div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#64748b' }}>{p.feeType}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600, color:'#1e293b' }}>GH₵ {p.totalAmount?.toLocaleString()}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600, color:'#10b981' }}>GH₵ {p.amountPaid?.toLocaleString()}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600, color: p.balance > 0 ? '#ef4444' : '#10b981' }}>GH₵ {p.balance?.toLocaleString()}</td>
                  <td style={{ padding:'12px 14px', fontSize:12 }}>
                    <span>{METHOD_ICON[p.paymentMethod]}</span>
                    <span style={{ marginLeft:4, color:'#64748b' }}>{p.paymentMethod}</span>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#64748b' }}>{p.term}</td>
                  <td style={{ padding:'12px 14px', fontSize:12, color:'#64748b', whiteSpace:'nowrap' }}>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ ...STATUS_STYLE[p.status], padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{p.status}</span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setReceipt(p)} style={{ background:'#f0fdf4', color:'#16a34a', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Receipt</button>
                      <button onClick={() => openEdit(p)} style={{ background:'#f1f5f9', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(p._id)} style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Total row */}
      {payments.length > 0 && (
        <div style={{ display:'flex', justifyContent:'flex-end', gap:32, marginTop:12, padding:'12px 16px', background:'#1e293b', borderRadius:8, color:'#fff', fontSize:13 }}>
          <span>Showing <strong>{payments.length}</strong> records</span>
          <span>Total Billed: <strong>GH₵ {payments.reduce((s,p)=>s+p.totalAmount,0).toLocaleString()}</strong></span>
          <span>Total Collected: <strong>GH₵ {payments.reduce((s,p)=>s+p.amountPaid,0).toLocaleString()}</strong></span>
          <span>Outstanding: <strong>GH₵ {payments.reduce((s,p)=>s+p.balance,0).toLocaleString()}</strong></span>
        </div>
      )}

      {/* Modals */}
      {modal   && <PaymentModal editing={editing} students={students} onClose={() => setModal(false)} onSave={fetchAll} />}
      {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
