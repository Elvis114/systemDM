import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Modal, Spinner, EmptyState, ConfirmDialog, Field, inputStyle, btnPrimary, btnSecondary } from '../components/UI';

const EMPTY = { name:'', section:'', classTeacherId:'', academicYear:'2024/2025', capacity:40, room:'' };

export default function Classes() {
  const [classes,  setClasses]  = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const navigate = useNavigate();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([api.get('/classes'), api.get('/teachers')]);
      setClasses(c.data); setTeachers(t.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c, e) => { e.stopPropagation(); setEditing(c._id); setForm({ ...EMPTY, ...c, classTeacherId: c.classTeacherId?._id||'' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editing ? await api.put(`/classes/${editing}`, form) : await api.post('/classes', form);
      toast.success(editing ? 'Class updated!' : 'Class created!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/classes/${id}`); toast.success('Deleted'); setConfirm(null); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), style: inputStyle });
  const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#1e293b' }}>Classes</h1>
        <button onClick={openAdd} style={{ ...btnPrimary, background:'#f59e0b' }}>+ Add Class</button>
      </div>

      {loading ? <Spinner /> : classes.length === 0 ? <EmptyState icon="🏫" title="No classes yet" /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
          {classes.map((c, i) => (
            <div key={c._id} onClick={() => navigate(`/classes/${c._id}`)} style={{ background:'#fff', borderRadius:14, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', cursor:'pointer', borderTop:`4px solid ${COLORS[i%COLORS.length]}`, transition:'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <h3 style={{ margin:'0 0 2px', fontSize:18, fontWeight:800, color:'#1e293b' }}>{c.name}</h3>
                  <div style={{ fontSize:12, color:'#64748b' }}>Section {c.section} · {c.academicYear}</div>
                </div>
                <div style={{ fontSize:28, fontWeight:800, color: COLORS[i%COLORS.length] }}>{c.students?.length || 0}</div>
              </div>
              <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>👩‍🏫 {c.classTeacherId?.name || 'No teacher assigned'}</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginBottom:4 }}>📍 {c.room || 'No room set'}</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginBottom:16 }}>📚 {c.subjects?.length || 0} subjects</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={e => openEdit(c,e)} style={{ flex:1, padding:'7px', background:'#f1f5f9', border:'none', borderRadius:6, cursor:'pointer', fontSize:12 }}>Edit</button>
                <button onClick={e => { e.stopPropagation(); setConfirm(c._id); }} style={{ flex:1, padding:'7px', background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:6, cursor:'pointer', fontSize:12 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Class' : 'Add Class'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="Class Name" required><input required {...f('name')} placeholder="e.g. Grade 1A" /></Field>
              <Field label="Section"><input {...f('section')} placeholder="e.g. A" /></Field>
              <Field label="Academic Year"><input {...f('academicYear')} /></Field>
              <Field label="Room"><input {...f('room')} placeholder="e.g. Room 101" /></Field>
              <Field label="Capacity"><input type="number" {...f('capacity')} /></Field>
              <Field label="Class Teacher">
                <select {...f('classTeacherId')} style={inputStyle}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button type="button" onClick={() => setModal(false)} style={btnSecondary}>Cancel</button>
              <button type="submit" style={{ ...btnPrimary, background:'#f59e0b' }}>{editing ? 'Update' : 'Create Class'}</button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog message="Delete this class permanently?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
