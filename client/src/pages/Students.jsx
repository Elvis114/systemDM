import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Modal, Badge, Spinner, EmptyState, ConfirmDialog, Field, inputStyle, btnPrimary, btnSecondary, btnDanger } from '../components/UI';

const EMPTY = { name:'',age:'',gender:'Male',email:'',phone:'',address:'',nationality:'Ghanaian',guardianName:'',guardianPhone:'',guardianEmail:'',guardianRelation:'Father',classId:'',status:'Active' };

export default function Students() {
  const { user, isAdmin } = useAuth();
  const [students,       setStudents]       = useState([]);
  const [classes,        setClasses]        = useState([]);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [modal,          setModal]          = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [confirm,        setConfirm]        = useState(null);
  const [form,           setForm]           = useState(EMPTY);
  const [filter,         setFilter]         = useState({ search:'', classId:'', gender:'', status:'' });
  const [teacherClassId, setTeacherClassId] = useState(null);
  const navigate = useNavigate();

  // If teacher, load their assigned class first
  useEffect(() => {
    if (!isAdmin) {
      api.get('/teachers/me')
        .then(r => {
          const cid = r.data.classId?._id || r.data.classId || null;
          setTeacherClassId(cid);
          if (cid) setFilter(f => ({ ...f, classId: cid }));
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = { page, limit:15, ...Object.fromEntries(Object.entries(filter).filter(([,v])=>v)) };
      const [s, c] = await Promise.all([api.get('/students', { params }), api.get('/classes')]);
      setStudents(s.data.students); setTotal(s.data.total); setClasses(c.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filter, page]);

  const openAdd  = () => {
    const defaultClass = !isAdmin && teacherClassId ? teacherClassId : '';
    setEditing(null); setForm({ ...EMPTY, classId: defaultClass }); setModal(true);
  };
  const openEdit = (s) => { setEditing(s._id); setForm({ ...EMPTY, ...s, classId: s.classId?._id || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.classId || payload.classId === '') delete payload.classId;
    try {
      editing ? await api.put(`/students/${editing}`, payload) : await api.post('/students', payload);
      toast.success(editing ? 'Student updated!' : 'Student added!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/students/${id}`); toast.success('Deleted'); setConfirm(null); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const exportCSV = () => {
    const rows = [['Name','ID','Class','Gender','Age','Guardian','Phone','Status']];
    students.forEach(s => rows.push([s.name, s.studentId, s.classId?.name||'', s.gender, s.age, s.guardianName, s.guardianPhone, s.status]));
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download='students.csv'; a.click();
  };

  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), style: inputStyle });

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ margin:'0 0 2px', fontSize:22, fontWeight:800, color:'#1e293b' }}>
            {!isAdmin && teacherClassId ? 'My Class Students' : 'Students'}
          </h1>
          <p style={{ margin:0, fontSize:12, color:'#64748b' }}>{total} students {!isAdmin && teacherClassId ? 'in your class' : 'enrolled'}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={exportCSV} style={{ ...btnSecondary, fontSize:12 }}>📥 Export CSV</button>
          {isAdmin && <button onClick={openAdd} style={btnPrimary}>+ Add Student</button>}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, background:'#fff', padding:14, borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', flexWrap:'wrap' }}>
        <input placeholder="🔍 Search name, ID, email..."
          value={filter.search} onChange={e => setFilter({...filter,search:e.target.value})}
          style={{ ...inputStyle, flex:1, minWidth:180 }} />
        {/* Only admin can switch class filter */}
        {isAdmin && (
          <select value={filter.classId} onChange={e => setFilter({...filter,classId:e.target.value})}
            style={{ ...inputStyle, width:'auto', minWidth:130 }}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
        {[
          { field:'gender',  label:'All Genders', opts: [{v:'Male',l:'Male'},{v:'Female',l:'Female'}] },
          { field:'status',  label:'All Statuses',opts: [{v:'Active',l:'Active'},{v:'Inactive',l:'Inactive'},{v:'Graduated',l:'Graduated'}] },
        ].map(({ field, label, opts }) => (
          <select key={field} value={filter[field]} onChange={e => setFilter({...filter,[field]:e.target.value})}
            style={{ ...inputStyle, width:'auto', minWidth:130 }}>
            <option value="">{label}</option>
            {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        ))}
        <button onClick={() => {
          const baseFilter = { search:'', classId: (!isAdmin && teacherClassId) ? teacherClassId : '', gender:'', status:'' };
          setFilter(baseFilter); setPage(1);
        }} style={{ ...btnSecondary, fontSize:12 }}>Clear</button>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        {loading ? <Spinner /> : students.length === 0 ?
          <EmptyState icon="🎓" title="No students found" sub={!isAdmin && teacherClassId ? "No students in your class yet" : "Try adjusting your filters"} /> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['','Name','Student ID','Class','Gender','Age','Guardian','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s._id} onClick={() => navigate(`/students/${s._id}`)}
                  style={{ background: i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='#eff6ff'}
                  onMouseLeave={e => e.currentTarget.style.background=i%2===0?'#fff':'#fafafa'}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>{s.name?.charAt(0)}</div>
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:'#1e293b' }}>{s.name}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#3b82f6', fontWeight:600 }}>{s.studentId}</td>
                  <td style={{ padding:'10px 14px', fontSize:13, color:'#64748b' }}>{s.classId?.name || '—'}</td>
                  <td style={{ padding:'10px 14px' }}><Badge label={s.gender} /></td>
                  <td style={{ padding:'10px 14px', fontSize:13, color:'#64748b' }}>{s.age}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{s.guardianName}</td>
                  <td style={{ padding:'10px 14px' }}><Badge label={s.status} /></td>
                  <td style={{ padding:'10px 14px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display:'flex', gap:6 }}>
                      {isAdmin && <>
                        <button onClick={() => openEdit(s)} style={{ background:'#f1f5f9', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Edit</button>
                        <button onClick={() => setConfirm(s._id)} style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Del</button>
                      </>}
                      {!isAdmin && <button onClick={() => navigate(`/students/${s._id}`)} style={{ background:'#eff6ff', color:'#3b82f6', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>View</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:16 }}>
          {Array.from({ length: Math.ceil(total/15) }, (_, i) => i+1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ width:32, height:32, border:'1px solid', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight: p===page ? 700 : 400, background: p===page ? '#3b82f6' : '#fff', color: p===page ? '#fff' : '#64748b', borderColor: p===page ? '#3b82f6' : '#e2e8f0' }}>{p}</button>
          ))}
        </div>
      )}

      {/* Add/Edit Modal — admin only */}
      {modal && isAdmin && (
        <Modal title={editing ? 'Edit Student' : 'Add New Student'} onClose={() => setModal(false)} width={640}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="Full Name" required><input required {...f('name')} /></Field>
              <Field label="Class">
                <select {...f('classId')} style={inputStyle}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Age"><input type="number" min="3" max="25" {...f('age')} /></Field>
              <Field label="Gender"><select {...f('gender')} style={inputStyle}><option>Male</option><option>Female</option><option>Other</option></select></Field>
              <Field label="Email"><input type="email" {...f('email')} /></Field>
              <Field label="Phone"><input {...f('phone')} /></Field>
              <Field label="Address"><input {...f('address')} /></Field>
              <Field label="Nationality"><input {...f('nationality')} /></Field>
              <Field label="Guardian Name"><input {...f('guardianName')} /></Field>
              <Field label="Guardian Phone"><input {...f('guardianPhone')} /></Field>
              <Field label="Guardian Email"><input type="email" {...f('guardianEmail')} /></Field>
              <Field label="Guardian Relation"><select {...f('guardianRelation')} style={inputStyle}>{['Father','Mother','Uncle','Aunt','Guardian','Other'].map(r => <option key={r}>{r}</option>)}</select></Field>
              <Field label="Status"><select {...f('status')} style={inputStyle}><option>Active</option><option>Inactive</option><option>Graduated</option></select></Field>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button type="button" onClick={() => setModal(false)} style={btnSecondary}>Cancel</button>
              <button type="submit" style={btnPrimary}>{editing ? 'Update Student' : 'Add Student'}</button>
            </div>
          </form>
        </Modal>
      )}

      {confirm && isAdmin && <ConfirmDialog message="This will permanently delete this student." onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
