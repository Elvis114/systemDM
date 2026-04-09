// ── Modal ─────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:12, width:'100%', maxWidth:width, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #e2e8f0', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#1e293b' }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#64748b', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:'20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────
export function StatCard({ title, value, icon, color = '#3b82f6', sub }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:'20px 22px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${color}`, display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:50, height:50, borderRadius:10, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:26, fontWeight:700, color:'#1e293b', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:13, color:'#64748b', marginTop:3 }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:color, marginTop:2, fontWeight:500 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
const BADGE = {
  Active:    { bg:'#d1fae5', color:'#065f46' },
  Inactive:  { bg:'#fee2e2', color:'#991b1b' },
  Graduated: { bg:'#dbeafe', color:'#1e40af' },
  Male:      { bg:'#dbeafe', color:'#1e40af' },
  Female:    { bg:'#fce7f3', color:'#be185d' },
  Present:   { bg:'#d1fae5', color:'#065f46' },
  Absent:    { bg:'#fee2e2', color:'#991b1b' },
  Late:      { bg:'#fef9c3', color:'#854d0e' },
  Excused:   { bg:'#e0e7ff', color:'#3730a3' },
  Paid:      { bg:'#d1fae5', color:'#065f46' },
  Partial:   { bg:'#dbeafe', color:'#1e40af' },
  Pending:   { bg:'#fef9c3', color:'#854d0e' },
  Overdue:   { bg:'#fee2e2', color:'#991b1b' },
  Low:       { bg:'#f1f5f9', color:'#475569' },
  Medium:    { bg:'#dbeafe', color:'#1e40af' },
  High:      { bg:'#fef9c3', color:'#854d0e' },
  Urgent:    { bg:'#fee2e2', color:'#991b1b' },
  A:         { bg:'#d1fae5', color:'#065f46' },
  B:         { bg:'#dbeafe', color:'#1e40af' },
  C:         { bg:'#fef9c3', color:'#854d0e' },
  D:         { bg:'#fed7aa', color:'#9a3412' },
  F:         { bg:'#fee2e2', color:'#991b1b' },
};

export function Badge({ label }) {
  const s = BADGE[label] || { bg:'#f1f5f9', color:'#475569' };
  return (
    <span style={{ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{label}</span>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 40 }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:40 }}>
      <div style={{ width:size, height:size, border:'3px solid #cbd5e1', borderTop:'3px solid #2563eb', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'No data found', sub = '', action }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:48, marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:16, fontWeight:600, color:'#1e293b', marginBottom:4 }}>{title}</div>
      {sub && <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>{sub}</div>}
      {action}
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────────
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <div style={{ background:'#fff', borderRadius:12, padding:28, maxWidth:380, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize:32, textAlign:'center', marginBottom:12 }}>⚠️</div>
        <div style={{ fontSize:15, fontWeight:600, color:'#1e293b', textAlign:'center', marginBottom:8 }}>Are you sure?</div>
        <div style={{ fontSize:13, color:'#64748b', textAlign:'center', marginBottom:24 }}>{message}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'10px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'10px', background:'#ef4444', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── FormField helper ──────────────────────────────────────────
export function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>
        {label}{required && <span style={{ color:'#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width:'100%', padding:'10px 14px', border:'1px solid #cbd5e1', background:'#f8fafc',
  borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box',
  color:'#0f172a', transition:'border-color 0.15s ease',
};

export const btnPrimary = {
  padding:'10px 22px', background:'#2563eb', color:'#fff',
  border:'none', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:700,
};

export const btnSecondary = {
  padding:'10px 22px', background:'#eff6ff', color:'#1e293b',
  border:'1px solid #bfdbfe', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:600,
};

export const btnDanger = {
  padding:'9px 20px', background:'#ef4444', color:'#fff',
  border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600,
};
