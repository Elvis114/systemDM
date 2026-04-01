import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Modal, Badge, Spinner, EmptyState, Field, inputStyle, btnPrimary, btnSecondary } from '../components/UI';

const EMPTY = { studentId:'', feeType:'Tuition', amount:'', amountPaid:'', dueDate:'', paymentDate:'', paymentMethod:'Cash', term:'Term 1', academicYear:'2024/2025', notes:'' };

export default function Fees() {
  const [fees,     setFees]     = useState([]);
  const [students, setStudents] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [filter,   setFilter]   = useState({ status:'', term:'', paymentMethod:'' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filter).filter(([,v])=>v));
      const [f,s,sum] = await Promise.all([api.get('/fees',{params}), api.get('/students'), api.get('/fees/summary',{params:{term:filter.term}})]);
      setFees(f.data); setStudents(s.data.students||s.data); setSummary(sum.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, [filter]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (fee) => { setEditing(fee._id); setForm({ ...EMPTY, ...fee, studentId: fee.studentId?._id||'', paymentDate: fee.paymentDate?fee.paymentDate.split('T')[0]:'', dueDate: fee.dueDate?fee.dueDate.split('T')[0]:'' }); setModal(true); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { const fee = await api.put(`/fees/${editing}`, form); }
      else { await api.post('/fees', form); }
      toast.success(editing?'Updated!':'Fee recorded!'); setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
  };
  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), style: inputStyle });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#1e293b' }}>Fees Management</h1>
        <button onClick={openAdd} style={{ ...btnPrimary, background:'#10b981' }}>+ Record Payment</button>
      </div>

      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:20 }}>
          {[{l:'Total Billed',v:`GH₵ ${summary.total?.toLocaleString()||0}`,c:'#3b82f6'},{l:'Collected',v:`GH₵ ${summary.collected?.toLocaleString()||0}`,c:'#10b981'},{l:'Pending',v:`GH₵ ${summary.pending?.toLocaleString()||0}`,c:'#f59e0b'},{l:'Overdue',v:`GH₵ ${summary.overdue?.toLocaleString()||0}`,c:'#ef4444'}].map(s=>(
            <div key={s.l} style={{ background:'#fff', borderRadius:10, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${s.c}` }}>
              <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginBottom:16, background:'#fff', padding:14, borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {[{field:'status',label:'All Statuses',opts:['Paid','Partial','Pending','Overdue']},{field:'term',label:'All Terms',opts:['Term 1','Term 2','Term 3']},{field:'paymentMethod',label:'All Methods',opts:['Cash','Mobile Money','Bank Transfer','Cheque']}].map(({field,label,opts})=>(
          <select key={field} value={filter[field]} onChange={e=>setFilter({...filter,[field]:e.target.value})} style={{ padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:7, fontSize:13 }}>
            <option value="">{label}</option>
            {opts.map(o=><option key={o}>{o}</option>)}
          </select>
        ))}
        <button onClick={()=>setFilter({status:'',term:'',paymentMethod:''})} style={{...btnSecondary,fontSize:12}}>Clear</button>
      </div>

      <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        {loading ? <Spinner /> : fees.length===0 ? <EmptyState icon="💰" title="No fee records" /> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#f8fafc' }}>
              {['Student','Type','Total','Paid','Balance','Method','Term','Status','Receipt','Actions'].map(h=>(
                <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{fees.map((fee,i)=>(
              <tr key={fee._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'10px 14px', fontSize:13, fontWeight:500 }}>{fee.studentId?.name}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{fee.feeType}</td>
                <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700 }}>GH₵ {fee.amount?.toLocaleString()}</td>
                <td style={{ padding:'10px 14px', fontSize:13, color:'#10b981', fontWeight:600 }}>GH₵ {fee.amountPaid?.toLocaleString()}</td>
                <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:fee.balance>0?'#ef4444':'#10b981' }}>GH₵ {fee.balance?.toLocaleString()}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{fee.paymentMethod}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{fee.term}</td>
                <td style={{ padding:'10px 14px' }}><Badge label={fee.status} /></td>
                <td style={{ padding:'10px 14px', fontSize:11, color:'#3b82f6', fontWeight:600 }}>{fee.receiptNumber}</td>
                <td style={{ padding:'10px 14px' }}>
                  <button onClick={()=>openEdit(fee)} style={{ background:'#f1f5f9', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Edit</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={editing?'Edit Fee Record':'Record Payment'} onClose={()=>setModal(false)} width={600}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}><Field label="Student" required><select required {...f('studentId')} style={inputStyle}><option value="">Select Student</option>{(Array.isArray(students)?students:[]).map(s=><option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}</select></Field></div>
              <Field label="Fee Type"><select {...f('feeType')} style={inputStyle}>{['Tuition','Books','Uniform','Transport','Exam','Feeding','Other'].map(t=><option key={t}>{t}</option>)}</select></Field>
              <Field label="Total Amount (GH₵)" required><input required type="number" min="0" {...f('amount')} /></Field>
              <Field label="Amount Paid (GH₵)"><input type="number" min="0" {...f('amountPaid')} /></Field>
              <Field label="Payment Method"><select {...f('paymentMethod')} style={inputStyle}>{['Cash','Mobile Money','Bank Transfer','Cheque'].map(m=><option key={m}>{m}</option>)}</select></Field>
              <Field label="Term"><select {...f('term')} style={inputStyle}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select></Field>
              <Field label="Academic Year"><input {...f('academicYear')} /></Field>
              <Field label="Due Date"><input type="date" {...f('dueDate')} /></Field>
              <Field label="Payment Date"><input type="date" {...f('paymentDate')} /></Field>
              <div style={{ gridColumn:'1/-1' }}><Field label="Notes"><input {...f('notes')} /></Field></div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button type="button" onClick={()=>setModal(false)} style={btnSecondary}>Cancel</button>
              <button type="submit" style={{ ...btnPrimary, background:'#10b981' }}>{editing?'Update':'Record Payment'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
