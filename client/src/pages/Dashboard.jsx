import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { StatCard, Spinner, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState({ students:0, teachers:0, classes:0, fees:0 });
  const [anns,    setAnns]    = useState([]);
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  const attendanceData = [
    { day:'Mon', present:26, absent:4 },
    { day:'Tue', present:28, absent:2 },
    { day:'Wed', present:25, absent:5 },
    { day:'Thu', present:27, absent:3 },
    { day:'Fri', present:29, absent:1 },
  ];
  const feeData = [
    { month:'Jan', collected:12500 },{ month:'Feb', collected:15000 },
    { month:'Mar', collected:11200 },{ month:'Apr', collected:18500 },
    { month:'May', collected:14000 },
  ];
  const gradeData = [
    { name:'A (90-100)', value:12 },{ name:'B (80-89)', value:18 },
    { name:'C (70-79)', value:9 }, { name:'D (60-69)', value:5 },{ name:'F (<60)', value:2 },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, c, f, a, ev] = await Promise.all([
          api.get('/students'),
          api.get('/teachers'),
          api.get('/classes'),
          api.get('/payments/summary'),
          api.get('/announcements'),
          api.get('/events'),
        ]);
        setStats({ students: s.data.total || s.data.students?.length || 0, teachers: t.data.length, classes: c.data.length, fees: f.data.totalCollected });
        setAnns(a.data.slice(0,3));
        setEvents(ev.data.slice(0,4));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const PRIORITY_COLOR = { Low:'#64748b', Medium:'#3b82f6', High:'#f59e0b', Urgent:'#ef4444' };
  const EVENT_COLOR    = { Academic:'#3b82f6', Sports:'#10b981', Cultural:'#f59e0b', Holiday:'#ef4444', Meeting:'#8b5cf6', Other:'#64748b' };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:24, fontWeight:800, color:'#1e293b' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ margin:0, fontSize:13, color:'#64748b' }}>Here's what's happening in your school today.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:28 }}>
        <StatCard title="Total Students" value={stats.students} icon="🎓" color="#3b82f6" sub="Enrolled this year" />
        <StatCard title="Total Teachers"  value={stats.teachers} icon="👩‍🏫" color="#10b981" sub="Active staff"       />
        <StatCard title="Total Classes"   value={stats.classes}  icon="🏫" color="#f59e0b" sub="Academic 2024/2025" />
        <StatCard title="Fees Collected"  value={`GH₵ ${stats.fees?.toLocaleString?.() || 0}`} icon="💰" color="#8b5cf6" sub="This term" />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:28 }}>
        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#1e293b' }}>Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#3b82f6" radius={[3,3,0,0]} name="Present" />
              <Bar dataKey="absent"  fill="#ef4444" radius={[3,3,0,0]} name="Absent"  />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#1e293b' }}>Fee Collection (GH₵)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} dot={{ r:3, fill:'#10b981' }} name="Collected" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#1e293b' }}>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={gradeData} dataKey="value" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Announcements */}
        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#1e293b' }}>📢 Recent Announcements</h3>
          {anns.length === 0 ? <p style={{ color:'#94a3b8', fontSize:13 }}>No announcements</p> :
            anns.map(a => (
              <div key={a._id} style={{ padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{a.title}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background: PRIORITY_COLOR[a.priority]+'20', color: PRIORITY_COLOR[a.priority] }}>{a.priority}</span>
                </div>
                <p style={{ margin:0, fontSize:12, color:'#64748b', lineHeight:1.5 }}>{a.content?.slice(0,80)}...</p>
              </div>
            ))
          }
        </div>

        {/* Events */}
        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#1e293b' }}>📆 Upcoming Events</h3>
          {events.length === 0 ? <p style={{ color:'#94a3b8', fontSize:13 }}>No events</p> :
            events.map(e => (
              <div key={e._id} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #f1f5f9', alignItems:'flex-start' }}>
                <div style={{ width:38, height:38, borderRadius:8, background: EVENT_COLOR[e.type]+'18', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ fontSize:10, fontWeight:700, color: EVENT_COLOR[e.type], lineHeight:1 }}>{new Date(e.date).toLocaleDateString('en-GB',{day:'2-digit'})}</div>
                  <div style={{ fontSize:9, color: EVENT_COLOR[e.type] }}>{new Date(e.date).toLocaleDateString('en-GB',{month:'short'})}</div>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{e.title}</div>
                  <div style={{ fontSize:11, color:'#64748b' }}>📍 {e.location}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
