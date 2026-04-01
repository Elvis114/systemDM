import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Badge, Spinner } from '../components/UI';
import toast from 'react-hot-toast';

const TABS = ['Profile','Grades','Attendance','Fees'];
const GRADE_COLOR = { A:'#10b981', B:'#3b82f6', C:'#f59e0b', D:'#f97316', F:'#ef4444' };

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student,    setStudent]    = useState(null);
  const [grades,     setGrades]     = useState([]);
  const [attendance, setAttendance] = useState({ records:[], summary:{} });
  const [fees,       setFees]       = useState({ fees:[], summary:{} });
  const [tab,        setTab]        = useState('Profile');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, g, a, f] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/students/${id}/grades`),
          api.get(`/students/${id}/attendance`),
          api.get(`/students/${id}/fees`),
        ]);
        setStudent(s.data);
        setGrades(g.data.grades || []);
        setAttendance(a.data);
        setFees(f.data);
      } catch { toast.error('Failed to load student'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <Spinner />;
  if (!student) return <div style={{ padding:40, textAlign:'center', color:'#64748b' }}>Student not found</div>;

  const avg = grades.length ? (grades.reduce((s,g) => s+g.score, 0)/grades.length).toFixed(1) : 0;

  const row = (label, value) => (
    <div key={label} style={{ display:'flex', padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
      <span style={{ width:160, fontSize:12, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13, color:'#1e293b' }}>{value || '—'}</span>
    </div>
  );

  return (
    <div>
      <button onClick={() => navigate('/students')} style={{ background:'none', border:'none', color:'#3b82f6', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>
        ← Back to Students
      </button>

      {/* Profile header card */}
      <div style={{ background:'linear-gradient(135deg,#1e293b,#3b82f6)', borderRadius:14, padding:'28px 32px', marginBottom:20, color:'#fff', display:'flex', alignItems:'center', gap:24 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:800, flexShrink:0 }}>
          {student.name?.charAt(0)}
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800 }}>{student.name}</h2>
          <div style={{ fontSize:13, opacity:0.8, marginBottom:8 }}>{student.studentId} · {student.classId?.name || 'No class assigned'}</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Badge label={student.status} />
            <Badge label={student.gender} />
            {student.nationality && <span style={{ fontSize:11, background:'rgba(255,255,255,0.2)', padding:'3px 10px', borderRadius:20 }}>🇬🇭 {student.nationality}</span>}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:28, fontWeight:800 }}>{avg}</div>
          <div style={{ fontSize:11, opacity:0.7 }}>Avg Score</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'#fff', padding:6, borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'8px 20px', border:'none', borderRadius:7, cursor:'pointer', fontSize:13, fontWeight: t===tab ? 700 : 400, background: t===tab ? '#3b82f6' : 'transparent', color: t===tab ? '#fff' : '#64748b' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ background:'#fff', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>

        {/* Profile Tab */}
        {tab === 'Profile' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>
            <div>
              <h3 style={{ margin:'0 0 12px', fontSize:14, fontWeight:700, color:'#1e293b' }}>Personal Information</h3>
              {row('Full Name',   student.name)}
              {row('Student ID',  student.studentId)}
              {row('Date of Birth', student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '')}
              {row('Age',         student.age)}
              {row('Gender',      student.gender)}
              {row('Nationality', student.nationality)}
              {row('Email',       student.email)}
              {row('Phone',       student.phone)}
              {row('Address',     student.address)}
            </div>
            <div>
              <h3 style={{ margin:'0 0 12px', fontSize:14, fontWeight:700, color:'#1e293b' }}>Guardian Information</h3>
              {row('Guardian Name',     student.guardianName)}
              {row('Relationship',      student.guardianRelation)}
              {row('Guardian Phone',    student.guardianPhone)}
              {row('Guardian Email',    student.guardianEmail)}
              <h3 style={{ margin:'20px 0 12px', fontSize:14, fontWeight:700, color:'#1e293b' }}>Academic Information</h3>
              {row('Class',            student.classId?.name)}
              {row('Enrollment Date',  student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '')}
              {row('Status',           student.status)}
            </div>
          </div>
        )}

        {/* Grades Tab */}
        {tab === 'Grades' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1e293b' }}>Academic Results</h3>
              <div style={{ background:'#3b82f6', color:'#fff', padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:700 }}>Average: {avg}%</div>
            </div>
            {grades.length === 0 ? <p style={{ color:'#94a3b8', textAlign:'center', padding:40 }}>No grades recorded yet</p> : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Subject','Score','Grade','Term','Year','Teacher','Remarks'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g,i) => (
                    <tr key={g._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:500 }}>{g.subjectId?.name || '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:14, fontWeight:700, color: GRADE_COLOR[g.grade] }}>{g.score}%</td>
                      <td style={{ padding:'10px 14px' }}><Badge label={g.grade} /></td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{g.term}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{g.academicYear}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{g.teacherId?.name || '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{g.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {tab === 'Attendance' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Total Days',   value: attendance.summary?.total || 0,   color:'#3b82f6' },
                { label:'Present',      value: attendance.summary?.present || 0, color:'#10b981' },
                { label:'Absent',       value: attendance.summary?.absent || 0,  color:'#ef4444' },
                { label:'Attendance %', value: `${attendance.summary?.percentage || 0}%`, color:'#8b5cf6' },
              ].map(s => (
                <div key={s.label} style={{ background:'#f8fafc', borderRadius:8, padding:'14px 16px', textAlign:'center', borderLeft:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {attendance.records?.length === 0 ? <p style={{ color:'#94a3b8', textAlign:'center', padding:40 }}>No attendance records</p> : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Date','Status','Class','Remarks'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendance.records?.map((r,i) => (
                    <tr key={r._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'10px 14px', fontSize:13 }}>{new Date(r.date).toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}</td>
                      <td style={{ padding:'10px 14px' }}><Badge label={r.status} /></td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{r.classId?.name || '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{r.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Fees Tab */}
        {tab === 'Fees' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Total Billed',  value:`GH₵ ${fees.summary?.billed?.toLocaleString()||0}`,  color:'#3b82f6' },
                { label:'Total Paid',    value:`GH₵ ${fees.summary?.paid?.toLocaleString()||0}`,    color:'#10b981' },
                { label:'Outstanding',   value:`GH₵ ${fees.summary?.balance?.toLocaleString()||0}`, color:'#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ background:'#f8fafc', borderRadius:8, padding:'14px 16px', textAlign:'center', borderLeft:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {fees.fees?.length === 0 ? <p style={{ color:'#94a3b8', textAlign:'center', padding:40 }}>No fee records</p> : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Fee Type','Amount','Paid','Balance','Term','Status','Receipt'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fees.fees?.map((f,i) => (
                    <tr key={f._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'10px 14px', fontSize:13 }}>{f.feeType}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600 }}>GH₵ {f.amount?.toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:'#10b981', fontWeight:600 }}>GH₵ {f.amountPaid?.toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, color: f.balance>0?'#ef4444':'#10b981', fontWeight:600 }}>GH₵ {f.balance?.toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:'#64748b' }}>{f.term}</td>
                      <td style={{ padding:'10px 14px' }}><Badge label={f.status} /></td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:'#3b82f6', fontWeight:600 }}>{f.receiptNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
