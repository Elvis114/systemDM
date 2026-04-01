import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Modal, Spinner, EmptyState, ConfirmDialog, Field, inputStyle, btnPrimary, btnSecondary } from '../components/UI';
import { useAuth } from '../context/AuthContext';

// ── EVENTS ────────────────────────────────────────────────────
export function Events() {
  const { isAdmin, isTeacher } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const EMPTY = { title:'', description:'', date:'', endDate:'', location:'', type:'Academic', isPublic:true };
  const [form, setForm] = useState(EMPTY);

  const fetchAll = async () => {
    setLoading(true);
    try { const { data } = await api.get('/events'); setEvents(data); }
    catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (e) => { setEditing(e._id); setForm({ ...EMPTY, ...e, date: e.date?.split('T')[0]||'', endDate: e.endDate?.split('T')[0]||'' }); setModal(true); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editing ? await api.put(`/events/${editing}`, form) : await api.post('/events', form);
      toast.success(editing?'Event updated!':'Event created!'); setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
  };
  const handleDelete = async (id) => {
    try { await api.delete(`/events/${id}`); toast.success('Deleted'); setConfirm(null); fetchAll(); }
    catch { toast.error('Failed'); }
  };
  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), style: inputStyle });

  const TYPE_COLOR = { Academic:'#3b82f6', Sports:'#10b981', Cultural:'#f59e0b', Holiday:'#ef4444', Meeting:'#8b5cf6', Other:'#64748b' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#1e293b' }}>Events</h1>
        {(isAdmin||isTeacher) && <button onClick={openAdd} style={{ ...btnPrimary, background:'#10b981' }}>+ Add Event</button>}
      </div>
      {loading ? <Spinner /> : events.length===0 ? <EmptyState icon="📆" title="No events scheduled" /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {events.map(e => (
            <div key={e._id} style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${TYPE_COLOR[e.type]||'#64748b'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1e293b' }}>{e.title}</h3>
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:(TYPE_COLOR[e.type]||'#64748b')+'20', color:TYPE_COLOR[e.type]||'#64748b', whiteSpace:'nowrap' }}>{e.type}</span>
              </div>
              <p style={{ margin:'0 0 10px', fontSize:12, color:'#64748b', lineHeight:1.5 }}>{e.description}</p>
              <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>📅 {new Date(e.date).toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</div>
              {e.endDate && <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>🔚 {new Date(e.endDate).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}</div>}
              <div style={{ fontSize:12, color:'#64748b', marginBottom:14 }}>📍 {e.location||'TBD'}</div>
              {(isAdmin||isTeacher) && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>openEdit(e)} style={{ flex:1, padding:'7px', background:'#f1f5f9', border:'none', borderRadius:6, cursor:'pointer', fontSize:12 }}>Edit</button>
                  {isAdmin && <button onClick={()=>setConfirm(e._id)} style={{ flex:1, padding:'7px', background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:6, cursor:'pointer', fontSize:12 }}>Delete</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title={editing?'Edit Event':'Add Event'} onClose={()=>setModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Field label="Event Title" required><input required {...f('title')} /></Field>
              <Field label="Description"><textarea rows={2} {...f('description')} style={{ ...inputStyle, resize:'vertical' }} /></Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Field label="Start Date" required><input required type="date" {...f('date')} /></Field>
                <Field label="End Date"><input type="date" {...f('endDate')} /></Field>
                <Field label="Location"><input {...f('location')} /></Field>
                <Field label="Type"><select {...f('type')} style={inputStyle}>{['Academic','Sports','Cultural','Holiday','Meeting','Other'].map(t=><option key={t}>{t}</option>)}</select></Field>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button type="button" onClick={()=>setModal(false)} style={btnSecondary}>Cancel</button>
              <button type="submit" style={{ ...btnPrimary, background:'#10b981' }}>{editing?'Update':'Create Event'}</button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog message="Delete this event permanently?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)} />}
    </div>
  );
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────
export function Announcements() {
  const { isAdmin, isTeacher, user } = useAuth();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const EMPTY = { title:'', content:'', priority:'Medium', targetRole:'all', expiryDate:'' };
  const [form, setForm] = useState(EMPTY);

  const fetchAll = async () => {
    setLoading(true);
    try { const { data } = await api.get('/announcements'); setItems(data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (a) => { setEditing(a._id); setForm({ ...EMPTY, ...a, expiryDate: a.expiryDate?.split('T')[0]||'' }); setModal(true); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editing ? await api.put(`/announcements/${editing}`, form) : await api.post('/announcements', form);
      toast.success(editing?'Updated!':'Announcement posted!'); setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
  };
  const handleDelete = async (id) => {
    try { await api.delete(`/announcements/${id}`); toast.success('Deleted'); setConfirm(null); fetchAll(); }
    catch { toast.error('Failed'); }
  };
  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), style: inputStyle });
  const P_COLOR = { Low:'#64748b', Medium:'#3b82f6', High:'#f59e0b', Urgent:'#ef4444' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#1e293b' }}>Announcements</h1>
        {(isAdmin||isTeacher) && <button onClick={openAdd} style={btnPrimary}>+ Post Announcement</button>}
      </div>
      {loading ? <Spinner /> : items.length===0 ? <EmptyState icon="📢" title="No announcements" /> : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {items.map(a => (
            <div key={a._id} style={{ background:'#fff', borderRadius:10, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${P_COLOR[a.priority]||'#64748b'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1e293b' }}>{a.title}</h3>
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:(P_COLOR[a.priority]||'#64748b')+'20', color:P_COLOR[a.priority]||'#64748b' }}>{a.priority}</span>
                  <span style={{ fontSize:10, padding:'3px 8px', borderRadius:20, background:'#f1f5f9', color:'#64748b' }}>For: {a.targetRole}</span>
                </div>
                {(isAdmin||isTeacher) && (
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>openEdit(a)} style={{ background:'#f1f5f9', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Edit</button>
                    <button onClick={()=>setConfirm(a._id)} style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:5, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Del</button>
                  </div>
                )}
              </div>
              <p style={{ margin:'0 0 8px', fontSize:13, color:'#374151', lineHeight:1.6 }}>{a.content}</p>
              <div style={{ fontSize:11, color:'#94a3b8' }}>
                Posted by {a.createdBy?.name} · {new Date(a.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
                {a.expiryDate && ` · Expires: ${new Date(a.expiryDate).toLocaleDateString()}`}
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title={editing?'Edit Announcement':'Post Announcement'} onClose={()=>setModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Field label="Title" required><input required {...f('title')} /></Field>
              <Field label="Content" required><textarea required rows={4} {...f('content')} style={{ ...inputStyle, resize:'vertical' }} /></Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Field label="Priority"><select {...f('priority')} style={inputStyle}>{['Low','Medium','High','Urgent'].map(p=><option key={p}>{p}</option>)}</select></Field>
                <Field label="Target Audience"><select {...f('targetRole')} style={inputStyle}><option value="all">Everyone</option><option value="teacher">Teachers only</option><option value="student">Students only</option></select></Field>
                <Field label="Expiry Date"><input type="date" {...f('expiryDate')} /></Field>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button type="button" onClick={()=>setModal(false)} style={btnSecondary}>Cancel</button>
              <button type="submit" style={btnPrimary}>{editing?'Update':'Post Announcement'}</button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog message="Delete this announcement?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)} />}
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────
export function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  const f = (field) => ({ value: form[field]||'', onChange: e => setForm({...form,[field]:e.target.value}), type:'password', style: inputStyle });

  return (
    <div>
      <h1 style={{ margin:'0 0 24px', fontSize:22, fontWeight:800, color:'#1e293b' }}>Settings</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Account info */}
        <div style={{ background:'#fff', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700 }}>Account Information</h3>
          {[['Name', user?.name],['Email', user?.email],['Role', user?.role?.toUpperCase()],['Last Login', user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A']].map(([l,v])=>(
            <div key={l} style={{ display:'flex', padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ width:120, fontSize:12, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</span>
              <span style={{ fontSize:13, color:'#1e293b', fontWeight: l==='Role'?700:400 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Change password */}
        <div style={{ background:'#fff', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700 }}>Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Field label="Current Password" required><input required {...f('currentPassword')} /></Field>
              <Field label="New Password" required><input required {...f('newPassword')} /></Field>
              <Field label="Confirm New Password" required><input required {...f('confirmPassword')} /></Field>
            </div>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, marginTop:16, width:'100%', opacity: saving?0.7:1 }}>
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── NOT FOUND ─────────────────────────────────────────────────
export function NotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:72, marginBottom:16 }}>🏫</div>
        <h1 style={{ margin:'0 0 8px', fontSize:48, fontWeight:900, color:'#1e293b' }}>404</h1>
        <p style={{ fontSize:16, color:'#64748b', marginBottom:24 }}>Page not found</p>
        <a href="/" style={{ background:'#3b82f6', color:'#fff', padding:'12px 28px', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:600 }}>Go Home</a>
      </div>
    </div>
  );
}

export default Events;
