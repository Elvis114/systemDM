import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Modal, Badge, Spinner, EmptyState, ConfirmDialog, Field, inputStyle, btnPrimary, btnSecondary } from '../components/UI';

const EMPTY = { studentId:'', subjectId:'', classId:'', score:'', term:'Term 1', academicYear:'2024/2025', teacherId:'', remarks:'' };

export default function Grades() {
  const { isAdmin, user } = useAuth();
  const [grades,        setGrades]        = useState([]);
  const [students,      setStudents]      = useState([]);
  const [subjects,      setSubjects]      = useState([]);
  const [teachers,      setTeachers]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [confirm,       setConfirm]       = useState(null);
  const [form,          setForm]          = useState(EMPTY);
  const [filter,        setFilter]        = useState({ term:'', academicYear:'', studentId:'' });
  const [teacherProfile,setTeacherProfile]= useState(null);

  // Load teacher profile to get their classId
  useEffect(() => {
    if (!isAdmin) {
      api.get('/teachers/me')
        .then(r => setTeacherProfile(r.data))
        .catch(() => {});
    }
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = { ...Object.fromEntries(Object.entries(filter).filter(([,v])=>v)) };
      // Teacher: only fetch grades for their class
      if (!isAdmin && teacherProfile?.classId) {
        params.classId = teacherProfile.classId._id || teacherProfile.classId;
      }
      const [g, s, sub, t] = await Promise.all([
        api.get('/grades', { params }),
        // Teacher: fetch only students in their class
        !isAdmin && teacherProfile?.classId
          ? api.get('/students', { params: { classId: teacherProfile.classId._id || teacherProfile.classId, limit:200 } })
          : api.get('/students', { params: { limit:200 } }),
        api.get('/subjects'),
        api.get('/teachers'),
      ]);
      setGrades(g.data);
      setStudents(s.data.students || s.data || []);
      setSubjects(sub.data);
      setTeachers(t.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isAdmin || teacherProfile !== null) fetchAll();
  }, [filter, teacherProfile, isAdmin]);

  const openAdd = () => {
    const defaults = { ...EMPTY };
    if (!isAdmin && teacherProfile) {
      defaults.classId   = teacherProfile.classId?._id || teacherProfile.classId || '';
      defaults.teacherId = teacherProfile._id || '';
    }
    setEditing(null); setForm(defaults); setModal(true);
  };
  const openEdit = (g) => { setEditing(g._id); setForm({ ...EMPTY, ...g, studentId:g.studentId?._id||'', subjectId:g.subjectId?._id||'', teacherId:g.teacherId?._id||'' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editing ? await api.put(`/grades/${editing}`, form) : await api.post('/grades', form);
      toast.success(editing?'Updated!':'Grade recorded!'); setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/grades/${id}`); toast.success('Deleted'); setConfirm(null); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), style: inputStyle });
  const GRADE_C = { A:'#10b981',B:'#3b82f6',C:'#f59e0b',D:'#f97316',F:'#ef4444' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ margin:'0 0 2px', fontSize:22, fontWeight:800, color:'#1e293b' }}>Grades</h1>
          {!isAdmin && teacherProfile && (
            <p style={{ margin:0, fontSize:12, color:'#64748b' }}>
              Showing grades for {teacherProfile.classId?.name || 'your class'}
            </p>
          )}
        </div>
        <button onClick={openAdd} style={{ ...btnPrimary, background:'#8b5cf6' }}>+ Record Grade</button>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, background:'#fff', padding:14, borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {[
          { field:'term', label:'All Terms', opts:[{v:'Term 1',l:'Term 1'},{v:'Term 2',l:'Term 2'},{v:'Term 3',l:'Term 3'}] },
          { field:'academicYear', label:'All Years', opts:[{v:'2024/2025',l:'2024/2025'},{v:'2023/2024',l:'2023/2024'}] },
        ].map(({field,label,opts})=>(
          <select key={field} value={filter[field]} onChange={e=>setFilter({...filter,[field]:e.target.value})} style={{...inputStyle,width:'auto',minWidth:130}}>
            <option value="">{label}</option>
            {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        ))}
        <button onClick={()=>setFilter({term:'',academicYear:'',studentId:''})} style={{...btnSecondary,fontSize:12}}>Clear</button>
      </div>

      <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        {loading ? <Spinner /> : grades.length===0 ? <EmptyState icon="📊" title="No grades recorded" /> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#f8fafc' }}>
              {['Student','Subject','Score','Grade','Term','Year','Teacher','Actions'].map(h=>(
                <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{grades.map((g,i)=>(
              <tr key={g._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'10px 14px', fontSize:13, fontWeight:500 }}>{g.studentId?.name}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{g.subjectId?.name||'—'}</td>
                <td style={{ padding:'10px 14px', fontSize:14, fontWeight:700, color:GRADE_C[g.grade] }}>{g.score}%</td>
                <td style={{ padding:'10px 14px' }}><Badge label={g.grade} /></td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{g.term}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{g.academicYear}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{g.teacherId?.name||'—'}</td>
                <td style={{ padding:'10px 14px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>openEdit(g)} style={{ background:'#f1f5f9', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Edit</button>
                    <button onClick={()=>setConfirm(g._id)} style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Del</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={editing?'Edit Grade':'Record Grade'} onClose={()=>setModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Student" required>
                  <select required {...f('studentId')} style={inputStyle}>
                    <option value="">Select Student</option>
                    {(Array.isArray(students)?students:[]).map(s=><option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Subject"><select {...f('subjectId')} style={inputStyle}><option value="">Select</option>{subjects.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></Field>
              <Field label="Score (0–100)" required><input required type="number" min="0" max="100" {...f('score')} /></Field>
              <Field label="Term" required><select required {...f('term')} style={inputStyle}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select></Field>
              <Field label="Academic Year"><input {...f('academicYear')} /></Field>
              <Field label="Teacher"><select {...f('teacherId')} style={inputStyle}><option value="">Select</option>{teachers.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></Field>
              <div style={{ gridColumn:'1/-1' }}><Field label="Remarks"><input {...f('remarks')} placeholder="e.g. Excellent, Needs improvement" /></Field></div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button type="button" onClick={()=>setModal(false)} style={btnSecondary}>Cancel</button>
              <button type="submit" style={{ ...btnPrimary, background:'#8b5cf6' }}>{editing?'Update':'Save Grade'}</button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog message="Delete this grade record?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)} />}
    </div>
  );
}

