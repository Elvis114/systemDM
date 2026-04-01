import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Modal, Badge, Spinner, EmptyState, ConfirmDialog, Field, inputStyle, btnPrimary, btnSecondary } from '../components/UI';

// ── SUBJECTS ──────────────────────────────────────────────────
export function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const EMPTY = { name:'', code:'', classId:'', teacherId:'', totalMarks:100, passingMarks:50, description:'' };
  const [form, setForm] = useState(EMPTY);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s,c,t] = await Promise.all([api.get('/subjects'),api.get('/classes'),api.get('/teachers')]);
      setSubjects(s.data); setClasses(c.data); setTeachers(t.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (s) => { setEditing(s._id); setForm({ ...EMPTY, ...s, classId: s.classId?._id||'', teacherId: s.teacherId?._id||'' }); setModal(true); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editing ? await api.put(`/subjects/${editing}`, form) : await api.post('/subjects', form);
      toast.success(editing ? 'Updated!' : 'Subject added!'); setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleDelete = async (id) => {
    try { await api.delete(`/subjects/${id}`); toast.success('Deleted'); setConfirm(null); fetchAll(); }
    catch { toast.error('Failed'); }
  };
  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), style: inputStyle });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#1e293b' }}>Subjects</h1>
        <button onClick={openAdd} style={{ ...btnPrimary, background:'#8b5cf6' }}>+ Add Subject</button>
      </div>
      <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        {loading ? <Spinner /> : subjects.length === 0 ? <EmptyState icon="📚" title="No subjects found" /> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#f8fafc' }}>
              {['Name','Code','Class','Teacher','Total Marks','Pass Marks','Actions'].map(h=>(
                <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{subjects.map((s,i) => (
              <tr key={s._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'11px 14px', fontSize:13, fontWeight:600 }}>{s.name}</td>
                <td style={{ padding:'11px 14px', fontSize:12, color:'#8b5cf6', fontWeight:700 }}>{s.code}</td>
                <td style={{ padding:'11px 14px', fontSize:12, color:'#64748b' }}>{s.classId?.name||'—'}</td>
                <td style={{ padding:'11px 14px', fontSize:12, color:'#64748b' }}>{s.teacherId?.name||'—'}</td>
                <td style={{ padding:'11px 14px', fontSize:12 }}>{s.totalMarks}</td>
                <td style={{ padding:'11px 14px', fontSize:12 }}>{s.passingMarks}</td>
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>openEdit(s)} style={{ background:'#f1f5f9', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Edit</button>
                    <button onClick={()=>setConfirm(s._id)} style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Del</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {modal && (
        <Modal title={editing?'Edit Subject':'Add Subject'} onClose={()=>setModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="Subject Name" required><input required {...f('name')} /></Field>
              <Field label="Subject Code" required><input required {...f('code')} placeholder="e.g. MATH-101" /></Field>
              <Field label="Class"><select {...f('classId')} style={inputStyle}><option value="">Select</option>{classes.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></Field>
              <Field label="Teacher"><select {...f('teacherId')} style={inputStyle}><option value="">Select</option>{teachers.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></Field>
              <Field label="Total Marks"><input type="number" {...f('totalMarks')} /></Field>
              <Field label="Passing Marks"><input type="number" {...f('passingMarks')} /></Field>
              <div style={{ gridColumn:'1/-1' }}><Field label="Description"><input {...f('description')} /></Field></div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button type="button" onClick={()=>setModal(false)} style={btnSecondary}>Cancel</button>
              <button type="submit" style={{ ...btnPrimary, background:'#8b5cf6' }}>{editing?'Update':'Add Subject'}</button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog message="Delete this subject?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)} />}
    </div>
  );
}
export default Subjects;
