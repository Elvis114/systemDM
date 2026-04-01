// ── Teachers.jsx ──────────────────────────────────────────────
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Modal, Badge, Spinner, EmptyState, ConfirmDialog, Field, inputStyle, btnPrimary, btnSecondary } from '../components/UI';

const EMPTY_T = { name:'', subjects:[], email:'', phone:'', qualification:'', experience:'', salary:'', department:'', classId:'', status:'Active' };

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_T);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([api.get('/teachers'), api.get('/classes')]);
      setTeachers(t.data); setClasses(c.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_T); setModal(true); };
  const openEdit = (t) => { setEditing(t._id); setForm({ ...EMPTY_T, ...t, classId: t.classId?._id||'', subjects: t.subjects?.join(', ')||'' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, subjects: typeof form.subjects === 'string' ? form.subjects.split(',').map(s=>s.trim()).filter(Boolean) : form.subjects };
    if (!data.classId || data.classId === '') delete data.classId;
    try {
      editing ? await api.put(`/teachers/${editing}`, data) : await api.post('/teachers', data);
      toast.success(editing ? 'Teacher updated!' : 'Teacher added!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/teachers/${id}`); toast.success('Deleted'); setConfirm(null); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), style: inputStyle });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#1e293b' }}>Teachers</h1>
        <button onClick={openAdd} style={btnPrimary}>+ Add Teacher</button>
      </div>

      <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        {loading ? <Spinner /> : teachers.length === 0 ? <EmptyState icon="👩‍🏫" title="No teachers found" /> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['','Name','Employee ID','Subjects','Email','Department','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => (
                <tr key={t._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>{t.name?.charAt(0)}</div>
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:'#1e293b' }}>{t.name}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#10b981', fontWeight:600 }}>{t.employeeId}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{t.subjects?.join(', ')}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{t.email}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{t.department || '—'}</td>
                  <td style={{ padding:'10px 14px' }}><Badge label={t.status} /></td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEdit(t)} style={{ background:'#f1f5f9', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Edit</button>
                      <button onClick={() => setConfirm(t._id)} style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Teacher' : 'Add Teacher'} onClose={() => setModal(false)} width={600}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="Full Name" required><input required {...f('name')} /></Field>
              <Field label="Email" required><input required type="email" {...f('email')} /></Field>
              <Field label="Phone"><input {...f('phone')} /></Field>
              <Field label="Department"><input {...f('department')} /></Field>
              <Field label="Qualification"><input {...f('qualification')} /></Field>
              <Field label="Experience (years)"><input type="number" {...f('experience')} /></Field>
              <Field label="Salary (GH₵)"><input type="number" {...f('salary')} /></Field>
              <Field label="Assign Class">
                <select {...f('classId')} style={inputStyle}>
                  <option value="">No class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Subjects (comma-separated)" required>
                <input required {...f('subjects')} placeholder="e.g. Math, Science" />
              </Field>
              <Field label="Status">
                <select {...f('status')} style={inputStyle}><option>Active</option><option>Inactive</option></select>
              </Field>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button type="button" onClick={() => setModal(false)} style={btnSecondary}>Cancel</button>
              <button type="submit" style={{ ...btnPrimary, background:'#10b981' }}>{editing ? 'Update' : 'Add Teacher'}</button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog message="Delete this teacher permanently?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
