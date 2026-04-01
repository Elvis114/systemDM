import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Badge, Spinner, EmptyState } from '../components/UI';

const STATUS_LIST = ['Present','Absent','Late','Excused'];
const STATUS_COLOR = { Present:'#10b981', Absent:'#ef4444', Late:'#f59e0b', Excused:'#8b5cf6' };

export default function Attendance() {
  const { isAdmin } = useAuth();
  const [records,       setRecords]       = useState([]);
  const [classes,       setClasses]       = useState([]);
  const [students,      setStudents]      = useState([]);
  const [markData,      setMarkData]      = useState({});
  const [markMode,      setMarkMode]      = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [teacherClassId,setTeacherClassId]= useState(null);
  const [filter,        setFilter]        = useState({ classId:'', date: new Date().toISOString().split('T')[0] });

  // If teacher, load their class and lock the filter to it
  useEffect(() => {
    if (!isAdmin) {
      api.get('/teachers/me').then(r => {
        const cid = r.data.classId?._id || r.data.classId || null;
        setTeacherClassId(cid);
        if (cid) setFilter(f => ({ ...f, classId: cid }));
      }).catch(() => {});
    }
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filter).filter(([,v])=>v));
      const [r, c] = await Promise.all([api.get('/attendance',{params}), api.get('/classes')]);
      setRecords(r.data); setClasses(c.data);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isAdmin || teacherClassId !== null || filter.classId) fetchAll();
  }, [filter, teacherClassId, isAdmin]);

  const loadClassForMarking = async () => {
    const classId = filter.classId || teacherClassId;
    if (!classId) return toast.error('Select a class first');
    try {
      const { data } = await api.get(`/classes/${classId}`);
      const stds = data.students || [];
      setStudents(stds);
      const init = {};
      stds.forEach(s => init[s._id] = 'Present');
      setMarkData(init);
      setMarkMode(true);
    } catch { toast.error('Failed to load class students'); }
  };

  const submitAttendance = async () => {
    const classId = filter.classId || teacherClassId;
    setSaving(true);
    try {
      const entries = Object.entries(markData).map(([studentId, status]) => ({
        studentId, classId, date: filter.date, status,
      }));
      await api.post('/attendance/bulk', entries);
      toast.success(`✅ Attendance marked for ${entries.length} students!`);
      setMarkMode(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const total   = records.length;
  const present = records.filter(r=>r.status==='Present').length;
  const absent  = records.filter(r=>r.status==='Absent').length;
  const late    = records.filter(r=>r.status==='Late').length;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ margin:'0 0 2px', fontSize:22, fontWeight:800, color:'#1e293b' }}>Attendance</h1>
          {!isAdmin && teacherClassId && (
            <p style={{ margin:0, fontSize:12, color:'#64748b' }}>
              Showing attendance for your class only
            </p>
          )}
        </div>
        {!markMode && (
          <button onClick={loadClassForMarking} style={{ background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Mark Attendance
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, background:'#fff', padding:14, borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {/* Admin can change class; teacher sees their class locked */}
        {isAdmin ? (
          <select value={filter.classId} onChange={e=>setFilter({...filter,classId:e.target.value})}
            style={{ padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:7, fontSize:13, minWidth:160 }}>
            <option value="">All Classes</option>
            {classes.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        ) : (
          <div style={{ padding:'9px 14px', background:'#eff6ff', borderRadius:7, fontSize:13, color:'#1d4ed8', fontWeight:600, border:'1px solid #bfdbfe' }}>
            🏫 {classes.find(c => c._id === teacherClassId)?.name || 'Your Class'}
          </div>
        )}
        <input type="date" value={filter.date} onChange={e=>setFilter({...filter,date:e.target.value})}
          style={{ padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:7, fontSize:13 }} />
      </div>

      {/* Summary */}
      {total > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
          {[{l:'Total',v:total,c:'#3b82f6'},{l:'Present',v:present,c:'#10b981'},{l:'Absent',v:absent,c:'#ef4444'},{l:'Late',v:late,c:'#f59e0b'}].map(s=>(
            <div key={s.l} style={{ background:'#fff', borderRadius:8, padding:'14px 16px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`3px solid ${s.c}` }}>
              <div style={{ fontSize:22, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:11, color:'#64748b' }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Mark Attendance Panel */}
      {markMode && (
        <div style={{ background:'#fff', borderRadius:10, padding:20, marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <h3 style={{ margin:'0 0 2px', fontSize:15, fontWeight:700 }}>Mark Attendance</h3>
              <div style={{ fontSize:12, color:'#64748b' }}>Date: {filter.date} · {students.length} students</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setMarkMode(false)} style={{ padding:'8px 16px', background:'#f1f5f9', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}>Cancel</button>
              <button onClick={submitAttendance} disabled={saving} style={{ padding:'8px 16px', background: saving?'#6ee7b7':'#10b981', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                {saving?'Saving...':'Submit All'}
              </button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:10 }}>
            {students.map(s=>(
              <div key={s._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>{s.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{s.studentId}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:4 }}>
                  {STATUS_LIST.map(status=>(
                    <button key={status} onClick={()=>setMarkData({...markData,[s._id]:status})}
                      style={{ padding:'4px 8px', fontSize:10, fontWeight:600, border:'none', borderRadius:4, cursor:'pointer', background: markData[s._id]===status ? STATUS_COLOR[status] : '#f1f5f9', color: markData[s._id]===status ? '#fff' : '#64748b' }}>
                      {status.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records Table */}
      <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        {loading ? <Spinner /> : records.length===0 ? <EmptyState icon="📅" title="No attendance records" sub="Select a date and mark attendance" /> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#f8fafc' }}>
              {['Student','Class','Date','Status','Remarks'].map(h=>(
                <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{records.map((r,i)=>(
              <tr key={r._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'10px 14px', fontSize:13, fontWeight:500 }}>{r.studentId?.name}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{r.classId?.name}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{new Date(r.date).toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short'})}</td>
                <td style={{ padding:'10px 14px' }}><Badge label={r.status} /></td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{r.remarks||'—'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

