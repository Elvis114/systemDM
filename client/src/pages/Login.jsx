import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form,    setForm]    = useState({ email: 'admin@school.com', password: 'admin123' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const inp = { padding:'11px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, width:'100%', outline:'none', boxSizing:'border-box' };

  const demos = [
    { role:'Admin',   email:'admin@school.com',   pass:'admin123'   },
    { role:'Teacher', email:'teacher1@school.com', pass:'teacher123' },
    { role:'Student', email:'student1@school.com', pass:'student123' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a 0%,#1e40af 50%,#0f172a 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 36px', width:'100%', maxWidth:420, boxShadow:'0 32px 80px rgba(0,0,0,0.3)' }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:44, marginBottom:8 }}>🏫</div>
          <h1 style={{ margin:'0 0 4px', fontSize:24, fontWeight:800, color:'#1e293b', letterSpacing:'-0.5px' }}>SchoolMS</h1>
          <p style={{ margin:0, fontSize:13, color:'#64748b' }}>School Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:6 }}>Email Address</label>
            <input type="email" style={inp} value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email" required />
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:6 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={show ? 'text' : 'password'} style={{ ...inp, paddingRight:44 }}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password" required />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#64748b' }}>
                {show ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width:'100%', padding:'12px', background: loading ? '#93c5fd' : '#3b82f6', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop:24, background:'#f8fafc', borderRadius:10, padding:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#64748b', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>Demo Credentials</div>
          {demos.map(d => (
            <div key={d.role} onClick={() => setForm({ email: d.email, password: d.pass })}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 10px', borderRadius:6, cursor:'pointer', marginBottom:4, background:'#fff', border:'1px solid #e2e8f0', transition:'all 0.15s' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'#1e293b' }}>{d.role}</span>
              <span style={{ fontSize:11, color:'#64748b', fontFamily:'monospace' }}>{d.email}</span>
            </div>
          ))}
          <div style={{ fontSize:10, color:'#94a3b8', marginTop:8, textAlign:'center' }}>Click any row to auto-fill</div>
        </div>
      </div>
    </div>
  );
}
